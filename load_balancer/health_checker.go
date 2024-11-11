package main

import (
	"log"
	"net/http"
	"sync"
	"time"
)

type HealthChecker struct {
	serverRegistry *ServerRegistry
	config         HealthCheckConfig
}

func NewHealthChecker(serverRegistry *ServerRegistry, config HealthCheckConfig) HealthChecker {
	return HealthChecker{
		serverRegistry: serverRegistry,
		config:         config,
	}
}

func (h HealthChecker) Start() {
	for {
		time.Sleep(time.Duration(h.config.Timeout) * time.Second)
		h.performHealthChecks()
	}
}

func (h HealthChecker) performHealthChecks() {
	servers := h.serverRegistry.GetAllServers()

	wg := &sync.WaitGroup{}
	wg.Add(len(servers))

	log.Printf("Performing health checks on %d servers\n", len(servers))
	for _, server := range servers {
		go h.performHealthCheckForServer(server, wg)
	}

	wg.Wait()
}

func (h HealthChecker) performHealthCheckForServer(server *Server, wg *sync.WaitGroup) {
	defer wg.Done()
	res, err := server.PerformHTTPRequest(HttpReq{
		Path:   h.config.Path,
		Method: http.MethodGet,
		Headers: []Header{
			{Key: "User-Agent", Values: []string{"xlb-health-checker"}},
		},
	})
	if err != nil {
		log.Printf("Error: %s\n", err)
		// unable to reach service or some config is wrong
		server.MarkIsUnHealthy()
		return
	}

	if res.StatusCode >= 400 {
		// Sever might be unhealthy
		server.MarkIsUnHealthy()
	} else {
		server.MarkIsHealthy()
	}
}
