package main

import (
	"fmt"
	"log"
	"net/http"
)

type LoadBalancer struct {
	serverRegistry *ServerRegistry
	config         Config
}

func NewLoadBalancer(config Config, serverRegistry *ServerRegistry) LoadBalancer {
	return LoadBalancer{
		config:         config,
		serverRegistry: serverRegistry,
	}
}

func (lb LoadBalancer) Start() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Path: %s\n", r.URL.Path)
		w.Write([]byte("Hello, World!"))
	})

	log.Printf("Listening on port %d\n", lb.config.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", lb.config.Port), nil); err != nil {
		log.Fatal(err)
	}
}
