package server

import (
	"github.com/gin-gonic/gin"
)

func (h *Handlers) ClientConfig(c *gin.Context) {
	c.JSON(200, h.ServerConfig.ClientConfig)
}
