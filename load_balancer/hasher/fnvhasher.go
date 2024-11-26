package hasher

import "hash/fnv"

type FnvHasher struct{}

func (h FnvHasher) Hash(input string) uint32 {
	// Generate hash from IP address
	hasher := fnv.New32a()
	hasher.Write([]byte(input))
	return hasher.Sum32()
}
