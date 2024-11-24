package strategies

import (
	"testing"

	"github.com/sriramr98/load_balancer/core"
)

func TestRoundRobinStrategyErrorScenarios(t *testing.T) {
	tests := []struct {
		name    string
		message string
		seed    bool
	}{
		{"Next returns error when no servers available", "No available servers should throw an error", false},
		{"Next returns error when no healthy servers available", "No healthy servers should throw an error", true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			serverRegistry := &core.ServerRegistry{}
			if test.seed {
				serverRegistry.SeedUnHealthyServers(1)
			}

			strategy := NewRoundRobinStrategy(serverRegistry)

			_, err := strategy.Next()
			if err == nil {
				t.Error(test.message)
			}
		})
	}
}

func TestRoundRobinStrategySuccessScenarios(t *testing.T) {
	t.Run("Test that healthy servers are correctly getting picked", func(t *testing.T) {
		serverRegistry := &core.ServerRegistry{}
		serverRegistry.SeedHealthyServers(3)
		strategy := NewRoundRobinStrategy(serverRegistry)
		for i := 0; i < 6; i++ {
			server, err := strategy.Next()
			if err != nil {
				t.Error("Unexpected error")
			}
			if server == nil {
				t.Error("Server should not be nil")
			}

			if server.GetID() != serverRegistry.GetHealthyServers()[i%3].GetID() {
				t.Error("Invalid Server")
			}
		}
	})

	t.Run("Test that only healthy servers get picked from a mix of healthy and non healthy servers", func(t *testing.T) {
		serverRegistry := &core.ServerRegistry{}
		serverRegistry.SeedHealthyServers(3)
		serverRegistry.SeedUnHealthyServers(3)
		strategy := NewRoundRobinStrategy(serverRegistry)

		healthyServers := serverRegistry.GetHealthyServers()
		healthyServerMap := make(map[string]bool)
		for _, server := range healthyServers {
			healthyServerMap[server.GetID()] = true
		}

		for i := 0; i < 12; i++ {
			server, err := strategy.Next()
			if err != nil {
				t.Error("Should be getting a valid server, not error")
			}
			if server.IsUnHealthy() {
				t.Error("Should only be getting healthy servers")
			}

			if _, ok := healthyServerMap[server.GetID()]; !ok {
				t.Error("Expected received server to be a healthy server")
			}
		}
	})
}
