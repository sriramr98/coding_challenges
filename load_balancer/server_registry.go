package main

import (
	"time"
)

type ServerRegistry struct {
	servers []*Server
}

func (s *ServerRegistry) GetAllServers() []*Server {
	return s.servers
}

func (s *ServerRegistry) GetHealthyServers() []*Server {
	return nil
}

func (s *ServerRegistry) Seed() {
	newServer := NewServer("localhost", 8080, time.Duration(30)*time.Second)
	s.servers = append(s.servers, newServer)
}
