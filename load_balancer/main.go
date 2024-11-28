package main

import (
	"fmt"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/hasher"
	"github.com/sriramr98/load_balancer/routers"
)

func GetValidStrategy(strategy string, serverRegistry *core.ServerRegistry) routers.BalancingStrategy {
	if strategy == "round-robin" {
		return routers.NewRoundRobinStrategy(serverRegistry)
	}

	if strategy == "ip-hash" {
		return routers.NewIpHashStrategy(serverRegistry, hasher.FnvHasher{})
	}

	panic(fmt.Sprintf("Invalid strategy: %s", strategy))
}

func main() {
	config := core.GetConfig()
	serverRegistry := &core.ServerRegistry{}
	serverRegistry.SeedHealthyServers(3)

	healthChecker := core.NewHealthChecker(serverRegistry, config.HealthCheckConfig)
	go healthChecker.Start()

	strategy := GetValidStrategy(config.BalanceStrategy, serverRegistry)
	lb := NewLoadBalancer(config, strategy)
	lb.Start()
}
