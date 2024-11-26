package main

import (
	"fmt"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/hasher"
	"github.com/sriramr98/load_balancer/strategies"
)

func GetValidStrategy(strategy string, serverRegistry *core.ServerRegistry) strategies.BalancingStrategy {
	if strategy == "round-robin" {
		return strategies.NewRoundRobinStrategy(serverRegistry)
	}

	if strategy == "ip-hash" {
		return strategies.NewIpHashStrategy(serverRegistry, hasher.FnvHasher{})
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
