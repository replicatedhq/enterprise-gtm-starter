package server

import (
	"fmt"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"github.com/replicatedhq/replicated/pkg/kotsclient"
	"github.com/replicatedhq/replicated/pkg/platformclient"
	"github.com/replicatedhq/replicated/pkg/types"
)

type Handlers struct {
	ServerConfig
	Client  *kotsclient.VendorV3Client
	App     *types.App
	Channel *types.Channel
}

func NewHandlers(config ServerConfig) (*Handlers, error) {
	client := &kotsclient.VendorV3Client{
		HTTPClient: *platformclient.NewHTTPClient(
			config.ReplicatedAPIOrigin,
			config.ReplicatedAPIKey,
		),
	}

	app, err := client.GetApp(config.ReplicatedApp)
	if err != nil {
		return nil, errors.Wrap(err, "get app")
	}

	channels, err := client.ListChannels(app.ID, app.Slug, "")
	if err != nil {
		return nil, errors.Wrap(err, "get channel")
	}

	foundChannel := []types.Channel{}
	for _, channel := range channels {
		if channel.ID == config.ReplicatedChannel || channel.Name == config.ReplicatedChannel {
			foundChannel = append(foundChannel, channel)
		}
	}

	if len(foundChannel) == 0 {
		return nil, errors.Errorf("no channels found matching %q", config.ReplicatedChannel)
	}
	if len(foundChannel) > 1 {
		return nil, errors.Errorf("channels name %q is ambiguous, try with channel ID", config.ReplicatedChannel)
	}

	handlers := &Handlers{
		ServerConfig: config,
		Client:       client,
		App:          app,
		Channel:      &channels[0],
	}

	return handlers, nil
}

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
