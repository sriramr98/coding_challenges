package core

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
	var healtySerers []*Server
	for _, server := range s.servers {
		if server.IsHealthy() {
			healtySerers = append(healtySerers, server)
		}
	}

	return healtySerers
}

func (s *ServerRegistry) SeedUnHealthyServers(count int) {
	for i := 0; i < count; i++ {
		newServer := NewServer("localhost", 8000+i+1, time.Duration(30)*time.Second)
		newServer.MarkIsUnHealthy()
		s.servers = append(s.servers, newServer)
	}
}

func (s *ServerRegistry) SeedHealthyServers(count int) {
	for i := 0; i < count; i++ {
		newServer := NewServer("localhost", 8000+i+1, time.Duration(30)*time.Second)
		newServer.MarkIsHealthy()
		s.servers = append(s.servers, newServer)
	}
}
