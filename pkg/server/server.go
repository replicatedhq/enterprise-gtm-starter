package server

import (
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type Handlers struct {
	ServerConfig
}

func Main() error {

	config, err := LoadConfig()
	if err != nil {
		return errors.Wrap(err, "load config")
	}

	handlers := &Handlers{*config}

	router := gin.Default()
	//router.GET("/api/healthz", handlers.Healthz)

	apiRoutes := router.Group("/api")
	apiRoutes.GET("/healthz", handlers.Healthz)
	apiRoutes.GET("/config", handlers.ClientConfig)
	//apiRoutes.POST("/trial", handlers.Signup)

	if config.StaticDir != "" {
		router.Use(static.Serve("/", static.LocalFile(config.StaticDir, true)))
	} else {
		router.Any("/*proxyPath", proxy)

	}

	err = router.Run(config.GinAddress)

	return errors.Wrap(err, "run gin http server")
}

func proxy(c *gin.Context) {
	remote, err := url.Parse("http://myremotedomain.com")
	if err != nil {
		panic(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)
	//Define the director func
	//This is a good place to log, for example
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.URL.Path = c.Param("proxyPath")
	}

	proxy.ServeHTTP(c.Writer, c.Request)
}
