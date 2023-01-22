package server

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

type SubmitRequest struct {
	Name  string `json:"name"`
	Org   string `json:"org"`
	Email string `json:"email"`
}

func (h *Handlers) Submit(c *gin.Context) {
	request := SubmitRequest{}
	err := c.BindJSON(&request)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	customerName := fmt.Sprintf("%s at %s (%s)", request.Name, request.Org, request.Email)

	customer, err := h.Client.CreateCustomer(
		customerName,
		h.App.ID,
		h.Channel.ID,
		h.LicenseExpirationDuration,
		h.EnableAirgap,
		h.EnableGitops,
		h.EnableSnapshots,
	)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	resp, err := json.Marshal(customer)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.Writer.WriteHeader(http.StatusOK)
	c.Writer.Write(resp)
}
