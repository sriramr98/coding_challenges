package main

func main() {
	config := GetConfig()
	serverRegistry := &ServerRegistry{}
	serverRegistry.Seed()

	healthChecker := NewHealthChecker(serverRegistry, config.HealthCheckConfig)
	go healthChecker.Start()

	lb := NewLoadBalancer(config, serverRegistry)
	lb.Start()
}
