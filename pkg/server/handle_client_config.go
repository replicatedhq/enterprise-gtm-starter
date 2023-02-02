package server

import (
	"github.com/gin-gonic/gin"
)

type ClientConfig struct {
	Title           string `json:"title"`
	IntroMarkdown   string `json:"introMarkdown"`
	InstallMarkdown string `json:"installMarkdown"`
}

func (h *Handlers) ClientConfig(c *gin.Context) {
	c.JSON(200, ClientConfig{
		Title:           h.ServerConfig.Title,
		IntroMarkdown:   h.ServerConfig.IntroMarkdown,
		InstallMarkdown: h.ServerConfig.InstallMarkdown,
	})
}
