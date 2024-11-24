package main

import (
	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/strategies"
)

func main() {
	config := core.GetConfig()
	serverRegistry := &core.ServerRegistry{}
	serverRegistry.SeedHealthyServers(3)

	healthChecker := core.NewHealthChecker(serverRegistry, config.HealthCheckConfig)
	go healthChecker.Start()

	strategy := strategies.NewRoundRobinStrategy(serverRegistry)
	lb := NewLoadBalancer(config, strategy)
	lb.Start()
}
