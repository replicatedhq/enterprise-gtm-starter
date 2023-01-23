package server

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
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

	licenseBytes, err := h.handleSubmit(request)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.JSON(200, map[string]string{
		"license": string(licenseBytes),
	})
}

func (h *Handlers) handleSubmit(request SubmitRequest) ([]byte, error) {

	customerName := fmt.Sprintf("%s at %s (%s)", request.Name, request.Org, request.Email)

	// this will create a dev license until
	// 1. https://github.com/replicatedhq/replicated/pull/224 is merged
	// 2. the library here is updated
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
		return nil, errors.Wrap(err, "create customer")
	}

	licenseBytes, err := h.Client.DownloadLicense(h.App.ID, customer.ID)
	if err != nil {
		return nil, errors.Wrap(err, "download license")
	}

	return licenseBytes, nil
}
