package strategies

import (
	"errors"

	"github.com/sriramr98/load_balancer/core"
	"github.com/sriramr98/load_balancer/hasher"
)

var (
	ErrNoIPFound   = errors.New("no ip found for strategy")
	ErrIPNotString = errors.New("first argument must be a string IP address")
)

type IpHashStrategy struct {
	serverRegistry *core.ServerRegistry
	hashStrategy   hasher.HasherStrategy
}

func NewIpHashStrategy(registry *core.ServerRegistry, hashStrategy hasher.HasherStrategy) *IpHashStrategy {
	return &IpHashStrategy{
		serverRegistry: registry,
		hashStrategy:   hashStrategy,
	}
}

func (ip *IpHashStrategy) Next(args ...interface{}) (*core.Server, error) {
	healthyServers := ip.serverRegistry.GetHealthyServers()
	if len(healthyServers) == 0 {
		return nil, ErrNoServersAvailable
	}

	if len(args) == 0 || args[0] == nil {
		return nil, ErrNoIPFound
	}

	clientIP, ok := args[0].(string)
	if !ok {
		return nil, ErrIPNotString
	}

	hash := ip.hashStrategy.Hash(clientIP)

	idx := hash % uint32(len(healthyServers))

	return healthyServers[idx], nil
}
