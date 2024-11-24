package strategies

import (
	"errors"

	"github.com/sriramr98/load_balancer/core"
)

var ErrNoServersAvailable = errors.New("no servers available")

type BalancingStrategy interface {
	Next(args ...interface{}) (*core.Server, error)
}
