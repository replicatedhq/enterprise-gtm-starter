package server

import (
	"github.com/gin-gonic/gin"
)

func (h *Handlers) Healthz(c *gin.Context) {
	c.JSON(200, map[string]string{
		"status":  "ready",
		"version": h.ServerConfig.GitVersion,
		"app":     h.ServerConfig.ReplicatedApp,
	})
}
