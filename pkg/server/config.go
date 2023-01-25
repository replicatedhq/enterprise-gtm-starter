package server

import (
	"github.com/codingconcepts/env"
	"github.com/pkg/errors"
	"net/url"
	"time"
)

// ServerConfig is the environment configuration for the backend process
// it includes the client config which is served to the frontend on page load
type ServerConfig struct {
	GinAddress string `env:"GIN_ADDRESS"`
	GitVersion string `env:"GIT_VERSION"`

	// StaticDir defines where frontend assets should be served from
	// This is designed for production builds where the Gin server serves both the
	// frontend routes from /* and the api routes from /api/*
	StaticDir string `env:"STATIC_DIR"`

	// ProxyFrontend specifies a local URL to use for frontend assets
	// this should only be used when developing locally
	ProxyFrontend    string `env:"PROXY_FRONTEND"`
	ProxyFrontendURL *url.URL

	// frontend / UI settings
	Title           string `json:"title" env:"FORM_TITLE"`
	IntroMarkdown   string `json:"introMarkdown" env:"FORM_INTRO_MARKDOWN"`
	InstallMarkdown string `json:"installMarkdown" env:"FORM_INSTALL_MARKDOWN"`

	// License creation options
	ReplicatedAPIOrigin string `env:"REPLICATED_API_ORIGIN"`
	ReplicatedAPIKey    string `env:"REPLICATED_API_TOKEN"`
	ReplicatedApp       string `env:"REPLICATED_APP"`

	LicenseDuration           string `env:"LICENSE_EXPIRE_DURATION"`
	LicenseExpirationDuration time.Duration

	ReplicatedChannel string `env:"LICENSE_CHANNEL"`
	EnableGitops      bool   `env:"LICENSE_ENABLE_GITOPS"`
	EnableAirgap      bool   `env:"LICENSE_ENABLE_AIRGAP"`
	EnableSnapshots   bool   `env:"LICENSE_ENABLE_SNAPSHOTS"`
	LicenseType       bool   `env:"LICENSE_TYPE"`
}

const OneMonth = "720h"

func DefaultConfig() ServerConfig {
	return ServerConfig{
		GinAddress:    ":8800",
		ProxyFrontend: "http://localhost:3000",

		LicenseDuration:     OneMonth,
		ReplicatedChannel:   "Stable",
		ReplicatedAPIOrigin: "https://api.replicated.com/vendor",

		Title:         "Wordpress Enterprise",
		IntroMarkdown: "Fill out your info to try out WPE!",
		InstallMarkdown: `
Now run

` + "```" + `
curl https://kots.io/install | bash
kubectl kots install wordpress-enterprise
` + "```" + `

To install WPE.

`,
	}

}

func LoadConfig() (*ServerConfig, error) {

	config := DefaultConfig()

	if err := env.Set(&config); err != nil {
		return nil, errors.Wrap(err, "load env config")
	}

	if err := config.parseConfig(); err != nil {
		return nil, errors.Wrap(err, "parse config")
	}

	return &config, nil
}

func (config ServerConfig) parseConfig() error {
	if config.ProxyFrontend != "" {
		parsed, err := url.Parse(config.ProxyFrontend)
		if err != nil {
			return errors.Wrap(err, "parse ProxyFrontend URL")
		}
		config.ProxyFrontendURL = parsed
	}

	if config.LicenseDuration != "" {
		duration, err := time.ParseDuration(config.LicenseDuration)
		if err != nil {
			return errors.Wrap(err, "parse configured license expiration duration")
		}
		config.LicenseExpirationDuration = duration
	}

	return nil
}
