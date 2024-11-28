package routers

import (
	"errors"

	"github.com/sriramr98/load_balancer/core"
)

var ErrNoServersAvailable = errors.New("no servers available")

type LBStrategyParams struct {
	IpAddress string
}

type BalancingStrategy interface {
	Next(params LBStrategyParams) (*core.Server, error)
}
