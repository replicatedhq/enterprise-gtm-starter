package server

import (
	"fmt"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

func Main() error {

	config, err := LoadConfig()
	if err != nil {
		return errors.Wrap(err, "load config")
	}

	handlers, err := NewHandlers(*config)
	if err != nil {
		return errors.Wrap(err, "initialize handlers")
	}

	router := gin.Default()
	//router.GET("/api/healthz", handlers.Healthz)

	apiRoutes := router.Group("/api")
	apiRoutes.GET("/healthz", handlers.Healthz)
	apiRoutes.GET("/config", handlers.ClientConfig)
	apiRoutes.POST("/submit", handlers.Submit)

	if config.StaticDir != "" {
		fmt.Println("adding static handler")
		router.Use(static.Serve("/", static.LocalFile(config.StaticDir, true)))
	} else {
		setUpDevProxy(handlers, router)
	}

	err = router.Run(config.GinAddress)

	return errors.Wrap(err, "run gin http server")
}
