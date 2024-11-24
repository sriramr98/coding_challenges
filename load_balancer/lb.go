package main

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/strategies"
)

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

		server, err := lb.strategy.Next()
		if err != nil {
			log.Printf("Error: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("No valid server found"))
			return
		}

		res, err := server.PerformHTTPRequest(httpReq)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Unable to reach server"))
			return
		}

		for _, header := range res.Headers {
			fmt.Printf("Header: %+v\n", header)
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
