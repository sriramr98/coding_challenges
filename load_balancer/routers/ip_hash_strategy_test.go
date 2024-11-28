package routers

import (
	"errors"
	"testing"

	"github.com/sriramr98/load_balancer/core"
)

type testHasher struct{}

func (h testHasher) Hash(input string) uint32 {
	if input == "test1" {
		return 1
	}
	if input == "test2" {
		return 2
	}
	return 3
}

func TestIpHashStrategyFailureScenarios(t *testing.T) {
	t.Run("Returns error when no healthy servers are present", func(t *testing.T) {
		registry := &core.ServerRegistry{}
		registry.SeedUnHealthyServers(2)

		ipHashStrategy := NewIpHashStrategy(registry, testHasher{})

		server, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "testip"})
		if err == nil {
			t.Error("Expected error found nil")
		}

		if !errors.Is(err, ErrNoServersAvailable) {
			t.Errorf("Expected ErrNoServersAvailable got %s", err.Error())
		}

		if server != nil {
			t.Errorf("Server server to be nil, got a server: %+v", server)
		}
	})

	t.Run("Returns error when no IP is sent to the Next function", func(t *testing.T) {
		registry := &core.ServerRegistry{}
		registry.SeedHealthyServers(2)

		ipHashStrategy := NewIpHashStrategy(registry, testHasher{})

		server, err := ipHashStrategy.Next(LBStrategyParams{})
		if err == nil {
			t.Error("Expected error found nil")
		}

		if !errors.Is(err, ErrNoIPFound) {
			t.Errorf("Expected ErrNoIPFound got %s", err.Error())
		}

		if server != nil {
			t.Errorf("Server server to be nil, got a server: %+v", server)
		}
	})
}

func TestIpHashStrategySuccessScenarios(t *testing.T) {
	t.Run("Strategy returns the same server every time for the same request", func(t *testing.T) {
		registry := &core.ServerRegistry{}
		registry.SeedHealthyServers(2)

		ipHashStrategy := NewIpHashStrategy(registry, testHasher{})

		prevServer, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "testip"})
		if err != nil {
			t.Errorf("Expected error to be nil, found %v", err.Error())
		}

		for i := 0; i < 5; i++ {
			server, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "testip"})
			if err != nil {
				t.Errorf("Expected error to be nil found %v", err.Error())
			}

			if server == nil {
				t.Error("Expected server, found nil", server)
			}

			if server.GetID() != prevServer.GetID() {
				t.Errorf("Expected ServerID %s got %s", prevServer.GetID(), server.GetID())
			}
		}
	})

	t.Run("Strategy returns different servers for differnt IP addresses", func(t *testing.T) {
		registry := &core.ServerRegistry{}
		registry.SeedHealthyServers(3)

		ipHashStrategy := NewIpHashStrategy(registry, testHasher{})

		server1, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "test1"})
		if err != nil {
			t.Errorf("Expected error to be nil, found %v", err.Error())
		}
		if server1 == nil {
			t.Error("Expected server, got nil")
		}

		server2, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "test2"})
		if err != nil {
			t.Errorf("Expected error to be nil, found %v", err.Error())
		}
		if server1.GetID() == server2.GetID() {
			t.Error("Expected different server ids for test1 and test2, but got same server")
		}

		server3, err := ipHashStrategy.Next(LBStrategyParams{IpAddress: "test3"})
		if err != nil {
			t.Errorf("Expected error to be nil, found %v", err.Error())
		}
		if server3.GetID() == server2.GetID() || server3.GetID() == server1.GetID() {
			t.Error("Expected different server ids for test1 and test2, but got same server")
		}
	})
}
