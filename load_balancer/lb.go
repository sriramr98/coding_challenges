package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

type LoadBalancer struct {
	config Config
}

func NewLoadBalancer(config Config) LoadBalancer {
	return LoadBalancer{config: config}
}

func (lb LoadBalancer) Start() {
	go lb.StartHealthChecks()
	lb.StartHTTPServer()
}

func (lb LoadBalancer) StartHTTPServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Path: %s\n", r.URL.Path)
		w.Write([]byte("Hello, World!"))
	})
	if err := http.ListenAndServe(fmt.Sprintf(":%d", lb.config.Port), nil); err != nil {
		log.Fatal(err)
	}
}

func (lb LoadBalancer) StartHealthChecks() {
	for {
		fmt.Println("Starting health checks...")

		time.Sleep(time.Duration(lb.config.HealthCheckConfig.Timeout) * time.Second)
	}
}
