package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

type Path struct {
	message string
	status  int
}

func main() {
	serverId := os.Getenv("SERVER_ID")
	paths := map[string]Path{
		"/success": {
			status:  http.StatusOK,
			message: "success",
		},
		"/notfound": {
			status:  http.StatusNotFound,
			message: "not found",
		},
		"/internalerror": {
			status:  http.StatusInternalServerError,
			message: "internal server error",
		},
		"/health": {
			status:  http.StatusFound,
			message: "Status: OK",
		},
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("========================")
		fmt.Printf("Path Hit: %s", r.URL.Path)
		for k, v := range r.Header {
			fmt.Printf("Key: %s, Value: %s\n", k, v)
		}

		w.Header().Set("server_id", serverId)
		pathConfig, ok := paths[r.URL.Path]
		if !ok {
			w.Header().Set("hit", "invalid_path")
			w.WriteHeader(http.StatusNotImplemented)
			w.Write([]byte("invald path"))
			return
		}

		w.Header().Set("hit", r.URL.Path)
		w.WriteHeader(pathConfig.status)
		w.Write([]byte(pathConfig.message))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("Server closed")
	}
}
