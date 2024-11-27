package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/strategies"
)

var ErrNoIPFound = errors.New("no IP Found in request")

type LoadBalancer struct {
	requestsWg            *sync.WaitGroup
	strategy              strategies.BalancingStrategy
	config                core.Config
	shouldProcessRequests int32 // 0 if should process, 1 if should not process. Used for graceful shutdown
}

func NewLoadBalancer(config core.Config, strategy strategies.BalancingStrategy) LoadBalancer {
	return LoadBalancer{
		config:                config,
		strategy:              strategy,
		requestsWg:            &sync.WaitGroup{},
		shouldProcessRequests: 0,
	}
}

func (lb *LoadBalancer) Start() {
	server := &http.Server{
		Handler: lb,
	}

	if lb.config.Tls.IsValidTLS() {
		log.Println("Started HTTPS server on port 443")
		go func() {
			// http.HandleFunc("/", lb.HandleRequest)
			ln, err := net.Listen("tcp", ":443")
			if err != nil {
				log.Fatal(err)
			}

			if err := server.ServeTLS(ln, lb.config.Tls.Certificate, lb.config.Tls.Key); err != nil {
				log.Fatal(err)
			}
			fmt.Println("HTTPS serve completed..")
		}()
	}

	go func() {
		log.Println("Start HTTP server on port 80")
		ln, err := net.Listen("tcp", ":80")
		if err != nil {
			log.Fatal(err)
		}

		if err = server.Serve(ln); err != nil {
			log.Fatal(err)
		}
		fmt.Println("HTTP serve completed")
	}()

	lb.listenAndInitiateGracefulShutdown(server)
}

func (lb LoadBalancer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	lb.requestsWg.Add(1)
	defer lb.requestsWg.Done()

	if atomic.LoadInt32(&lb.shouldProcessRequests) == 1 {
		log.Printf("Request for path %s rejected since LB is in shutdown mode", r.URL.Path)
		http.Error(w, "Unable to process request", http.StatusInternalServerError)
		return
	}

	fmt.Printf("shouldProcessRequests %d\n", atomic.LoadInt32(&lb.shouldProcessRequests))

	log.Printf("Path: %s\n", r.URL.Path)
	headers := []core.Header{}

	for key, values := range r.Header {
		headers = append(headers, core.Header{
			Key:    key,
			Values: values,
		})
	}

	httpReq := core.HttpReq{
		Path:    r.URL.Path,
		Method:  r.Method,
		Body:    r.Body,
		Headers: headers,
	}

	ip, err := extractIP(r)
	if err != nil {
		// We don't reject the request here because the RoutingStrategy will reject if Ip is required, else let it go through
		log.Println(err.Error())
	}

	server, err := lb.strategy.Next(strategies.LBStrategyParams{
		IpAddress: ip,
	})
	log.Printf("Reaching Server %s", server.GetID())
	if err != nil {
		log.Printf("Error: %s\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("No valid server found"))
		return
	}

	res, err := server.PerformHTTPRequest(httpReq)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Unable to reach server"))
		return
	}

	for _, header := range res.Headers {
		for _, value := range header.Values {
			w.Header().Set(header.Key, value)
		}
	}
	w.WriteHeader(res.StatusCode)
	io.Copy(w, res.Body)
}

func (lb *LoadBalancer) listenAndInitiateGracefulShutdown(server *http.Server) {
	// Shutdown when we receive Ctrl+c (interrupt)
	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	// SIGKILL, SIGQUIT or SIGTERM (Ctrl+/) will not be caught.
	signal.Notify(c, os.Interrupt)

	// Block until we receive our signal.
	<-c
	fmt.Println("Got os.Interrupt signal")

	// Mark shouldProcessRequests as 1 so that any requests that come in while we wait for existing to finish are rejected by handlers
	atomic.StoreInt32(&lb.shouldProcessRequests, 1)

	// Waits for all processing requests to complete before shutting down the server
	lb.requestsWg.Wait()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Println("Shutdown error")
		log.Fatal(err)
	}

	fmt.Println("All servers shut down successfully..")
}

func extractIP(r *http.Request) (string, error) {
	ips := r.Header.Get("X-Forwarded-For")
	splitIps := strings.Split(ips, ",")

	if len(splitIps) > 0 {
		// get last IP in list since ELB prepends other user defined IPs, meaning the last one is the actual client IP.
		netIP := net.ParseIP(splitIps[len(splitIps)-1])
		if netIP != nil {
			return netIP.String(), nil
		}
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return "", err
	}

	netIP := net.ParseIP(ip)
	if netIP != nil {
		ip := netIP.String()
		if ip == "::1" {
			return "127.0.0.1", nil
		}
		return ip, nil
	}

	return "", ErrNoIPFound
}
