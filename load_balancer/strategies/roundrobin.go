package strategies

import (
	"github.com/sriramr98/load_balancer/core"
)

type RoundRobinStrategy struct {
	serverRegistry *core.ServerRegistry
	currIdx        int
}

func NewRoundRobinStrategy(serverRegistry *core.ServerRegistry) *RoundRobinStrategy {
	return &RoundRobinStrategy{serverRegistry: serverRegistry}
}

func (r *RoundRobinStrategy) Next(_ ...interface{}) (*core.Server, error) {
	servers := r.serverRegistry.GetHealthyServers()
	if len(servers) == 0 {
		return &core.Server{}, ErrNoServersAvailable
	}

	server := servers[r.currIdx]
	r.currIdx = (r.currIdx + 1) % len(servers)

	return server, nil
}
