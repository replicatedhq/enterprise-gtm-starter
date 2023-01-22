package server

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httputil"
)

// todo this sucks
func setUpDevProxy(handlers *Handlers, router *gin.Engine) {
	fmt.Println("adding proxy handler")
	handlers.doProxyStatic(router, "/")
	handlers.doProxyStatic(router, "/manifest.json")
	handlers.doProxyStatic(router, "/logo192.png")
	handlers.doProxyStatic(router, "/favicon.ico")
	router.Any("/static/*proxyPath", handlers.proxy(func(c *gin.Context) string {
		return "/static" + c.Param("proxyPath")
	}))
}

type ProxyPathFunc func(c *gin.Context) string

func proxyStatic(staticVal string) ProxyPathFunc {
	return func(c *gin.Context) string {
		return staticVal
	}
}

func (h *Handlers) doProxyStatic(r *gin.Engine, path string) {
	r.Any(path, h.proxy(proxyStatic(path)))
}

func (h *Handlers) proxy(pathFunc ProxyPathFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		remote := h.ProxyFrontendURL

		proxy := httputil.NewSingleHostReverseProxy(remote)
		//Define the director func
		//This is a good place to log, for example
		proxy.Director = func(req *http.Request) {
			req.Header = c.Request.Header
			req.Host = remote.Host
			req.URL.Scheme = remote.Scheme
			req.URL.Host = remote.Host
			req.URL.Path = pathFunc(c)
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
