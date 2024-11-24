package core

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Header struct {
	Key    string
	Values []string
}

type HttpReq struct {
	Body    io.Reader
	Path    string
	Method  string
	Headers []Header
}

type HttpRes struct {
	Body       io.ReadCloser
	Headers    []Header
	StatusCode int
}

type Server struct {
	client    http.Client
	id        string
	host      string
	port      int
	isHealthy bool
}

func NewServer(host string, port int, timeout time.Duration) *Server {
	return &Server{
		client: http.Client{
			// Timeout: timeout,
		},
		host: host,
		port: port,
		id:   uuid.NewString(),
	}
}

func (s Server) PerformHTTPRequest(req HttpReq) (HttpRes, error) {
	reqUrl := fmt.Sprintf("http://%s:%d%s", s.host, s.port, req.Path)
	log.Printf("Requesting: %s\n", reqUrl)
	request, err := http.NewRequest(req.Method, reqUrl, req.Body)
	if err != nil {
		return HttpRes{}, err
	}

	for _, header := range req.Headers {
		for _, value := range header.Values {
			request.Header.Add(header.Key, value)
		}
	}

	res, err := s.client.Do(request)
	if err != nil {
		return HttpRes{}, err
	}

	resHeaders := []Header{}
	for key, values := range res.Header {
		resHeaders = append(resHeaders, Header{Key: key, Values: values})
	}

	return HttpRes{
		Headers:    resHeaders,
		Body:       res.Body,
		StatusCode: res.StatusCode,
	}, nil
}

func (s *Server) MarkIsUnHealthy() {
	log.Printf("Server %s is unhealthy", s.id)
	s.isHealthy = false
}

func (s *Server) MarkIsHealthy() {
	log.Printf("Server %s is healthy", s.id)
	s.isHealthy = true
}

func (s *Server) IsHealthy() bool {
	return s.isHealthy
}

func (s *Server) IsUnHealthy() bool {
	return !s.isHealthy
}

func (s Server) GetID() string {
	return s.id
}
