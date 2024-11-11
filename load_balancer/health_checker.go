package main

import (
	"log"
	"net/http"
	"sync"
	"time"
)

type HealthChecker struct {
	serverRegistry     *ServerRegistry
	serverFailureCount map[string]int // the current number of failed requests to the health check endpoint per server id
	serverSuccessCount map[string]int // the current number of successful requests to the health check endpoint per server id
	config             HealthCheckConfig
}

func NewHealthChecker(serverRegistry *ServerRegistry, config HealthCheckConfig) HealthChecker {
	return HealthChecker{
		serverRegistry:     serverRegistry,
		config:             config,
		serverFailureCount: make(map[string]int),
		serverSuccessCount: make(map[string]int),
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
		h.processFailedHealthCheck(server)
		return
	}

	if res.StatusCode >= 400 {
		h.processFailedHealthCheck(server)
	} else {
		h.processSuccessfulHealthCheck(server)
	}
}

func (h HealthChecker) processFailedHealthCheck(server *Server) {
	if _, ok := h.serverFailureCount[server.id]; !ok {
		h.serverFailureCount[server.id] = 0
	}

	h.serverFailureCount[server.id]++

	if server.IsUnHealthy() {
		return
	}

	failCount := h.serverFailureCount[server.id]
	if failCount >= h.config.UnHealthyTreshold {
		server.MarkIsUnHealthy()
		// reset success count for the server
		h.serverSuccessCount[server.id] = 0
	}
}

func (h HealthChecker) processSuccessfulHealthCheck(server *Server) {
	if _, ok := h.serverSuccessCount[server.id]; !ok {
		h.serverSuccessCount[server.id] = 0
	}

	h.serverSuccessCount[server.id]++
	if server.IsHealthy() {
		return
	}

	successCount := h.serverSuccessCount[server.id]
	if successCount >= h.config.HealhyTreshold {
		server.MarkIsHealthy()
		// reset failure count for the server
		h.serverFailureCount[server.id] = 0
	}
}
