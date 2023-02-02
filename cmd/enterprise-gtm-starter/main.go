package main

import (
	"github.com/replicatedhq/enterprise-gtm-starter/pkg/server"
	"log"
)

func main() {
	if err := server.Main(); err != nil {
		log.Fatal(err)
	}
}
