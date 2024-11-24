package hasher

type HasherStrategy interface {
	Hash(input string) uint32
}
