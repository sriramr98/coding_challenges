package strategies

import (
	"fmt"

	"github.com/sriramr98/load_balancer/core"
)

type RoundRobinStrategy struct {
	serverRegistry *core.ServerRegistry
	currIdx        int
}

func NewRoundRobinStrategy(serverRegistry *core.ServerRegistry) *RoundRobinStrategy {
	return &RoundRobinStrategy{serverRegistry: serverRegistry}
}

func (r *RoundRobinStrategy) Next() (*core.Server, error) {
	servers := r.serverRegistry.GetHealthyServers()
	if len(servers) == 0 {
		return &core.Server{}, fmt.Errorf("no healthy servers")
	}

	server := servers[r.currIdx]
	fmt.Printf("Selected Server: %s\n", server.GetID())
	r.currIdx = (r.currIdx + 1) % len(servers)

	return server, nil
}
