package ratelimit

type RateLimiter interface {
	ShouldProcess() bool
}
