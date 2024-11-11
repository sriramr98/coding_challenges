package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

type LoadBalancer struct {
	servers []Server
	config  Config
}

func NewLoadBalancer(config Config) LoadBalancer {
	return LoadBalancer{config: config, servers: []Server{NewServer("localhost", 8080, time.Duration(config.HealthCheckConfig.Timeout))}}
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

	fmt.Printf("Listening on port %d\n", lb.config.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", lb.config.Port), nil); err != nil {
		log.Fatal(err)
	}
}

func (lb LoadBalancer) StartHealthChecks() {
	for {
		time.Sleep(time.Duration(lb.config.HealthCheckConfig.Timeout) * time.Second)

		fmt.Println("Performing Health Checks")
		for _, server := range lb.servers {
			res, err := server.PerformHTTPRequest(HttpReq{
				Path:   lb.config.HealthCheckConfig.Path,
				Method: http.MethodGet,
				Headers: []Header{
					{Key: "User-Agent", Values: []string{"xlb-health-checker"}},
				},
			})
			if err != nil {
				fmt.Printf("Error: %s\n", err)
				// unable to reach service or some config is wrong
				server.MarkIsUnHealthy()
				continue
			}

			if res.StatusCode >= 400 {
				// Sever might be unhealthy
				server.MarkIsUnHealthy()
			} else {
				server.MarkIsHealthy()
			}
		}
	}
}
