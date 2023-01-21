package server

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handlers) Healthz(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusOK)
	c.Writer.Write([]byte("ok"))
}
