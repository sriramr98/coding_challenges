package main

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/strategies"
)

var ErrNoIPFound = errors.New("no IP Found in request")

type LoadBalancer struct {
	strategy strategies.BalancingStrategy
	config   core.Config
}

func NewLoadBalancer(config core.Config, strategy strategies.BalancingStrategy) LoadBalancer {
	return LoadBalancer{
		config:   config,
		strategy: strategy,
	}
}

func (lb LoadBalancer) Start() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
	})

	log.Printf("Listening on port %d\n", lb.config.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", lb.config.Port), nil); err != nil {
		log.Fatal(err)
	}
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
