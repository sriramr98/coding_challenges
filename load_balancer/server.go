package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

type Header struct {
	Key    string
	Values []string
}

type HttpReq struct {
	Path    string
	Method  string
	Headers []Header
}

type HttpRes struct {
	Body          io.ReadCloser
	Headers       []Header
	StatusCode    int
	ContentLength int64
}

type Server struct {
	client    http.Client
	host      string
	port      int
	isHealthy bool
}

func NewServer(host string, port int, timeout time.Duration) Server {
	return Server{
		client: http.Client{
			// Timeout: timeout,
		},
		host: host,
		port: port,
	}
}

func (s Server) PerformHTTPRequest(req HttpReq) (HttpRes, error) {
	reqUrl := fmt.Sprintf("http://%s:%d%s", s.host, s.port, req.Path)
	fmt.Printf("Requesting: %s\n", reqUrl)
	request, err := http.NewRequest(req.Method, reqUrl, nil)
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

	fmt.Printf("Response status: %d\n", res.StatusCode)

	resHeaders := []Header{}
	for key, values := range res.Header {
		resHeaders = append(resHeaders, Header{Key: key, Values: values})
	}

	return HttpRes{
		Headers:       resHeaders,
		Body:          res.Body,
		StatusCode:    res.StatusCode,
		ContentLength: res.ContentLength,
	}, nil
}

func (s *Server) MarkIsUnHealthy() {
	fmt.Println("Server is unhealthy")
	s.isHealthy = false
}

func (s *Server) MarkIsHealthy() {
	fmt.Println("Server is healthy")
	s.isHealthy = true
}

func (s *Server) IsHealthy() bool {
	return s.isHealthy
}
