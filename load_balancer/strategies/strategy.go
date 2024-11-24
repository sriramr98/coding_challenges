package strategies

import "github.com/sriramr98/load_balancer/core"

type BalancingStrategy interface {
	Next() (*core.Server, error)
}
