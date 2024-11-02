package main

func main() {
	config := GetConfig()
	lb := NewLoadBalancer(config)

	lb.Start()
}
