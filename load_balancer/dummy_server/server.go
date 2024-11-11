package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		for k, v := range r.Header {
			fmt.Printf("Key: %s, Value: %s\n", k, v)
		}
		w.Write([]byte("Hello"))
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Health check route hit....")
		w.Write([]byte("OK"))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("Server closed")
	}
}
