package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/replicatedhq/replicated/pkg/types"
	"io"
	"log"
	"net/http"
	"time"
)

type SubmitRequest struct {
	Name  string `json:"name"`
	Org   string `json:"org"`
	Email string `json:"email"`
}

type WebhookNotificationPayload struct {
	SubmitRequest `json:"inline"`
	CustomerID    string    `json:"customerId"`
	Created       time.Time `json:"created"`
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

	if h.ServerConfig.NotificationWebhookURL != "" {
		err = h.deliverWebhooks(request, customer)
		if err != nil {
			return nil, errors.Wrap(err, "deliver notification webhook")
		}
	}

	return licenseBytes, nil
}

func (h *Handlers) deliverWebhooks(request SubmitRequest, customer *types.Customer) error {
	body, err := json.Marshal(WebhookNotificationPayload{
		SubmitRequest: request,
		CustomerID:    customer.ID,
		Created:       time.Now(),
	})
	if err != nil {
		return errors.Wrap(err, "marshall webhook body")
	}

	resp, err := http.Post(
		h.ServerConfig.NotificationWebhookURL,
		"application/json",
		bytes.NewReader(body),
	)
	if err != nil {
		return errors.Wrap(err, "deliver notification")
	}

	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("webhook failed, %d: %s\n", resp.StatusCode, bodyBytes)
		return errors.Errorf("deliver notification: response code %d while sending webhook", resp.StatusCode)
	}

	log.Printf("webhook success, %v", resp.Body)
	return nil
}
