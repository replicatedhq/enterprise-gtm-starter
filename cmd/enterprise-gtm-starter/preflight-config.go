package main

import (
	"github.com/replicatedhq/enterprise-gtm-starter/pkg/server"
	"log"
)

func main() {
	config, err := server.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	_, err = server.NewHandlers(*config)
	if err != nil {
		log.Fatal(err)
	}
}
