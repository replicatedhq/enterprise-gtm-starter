package server

import (
	"github.com/codingconcepts/env"
	"github.com/pkg/errors"
	"net/url"
	"time"
)

type ClientConfig struct {
	Title           string `json:"title"`
	IntroMarkdown   string `json:"introMarkdown"`
	InstallMarkdown string `json:"installMarkdown"`
}

// ServerConfig is the environment configuration for the backend process
// it includes the client config which is served to the frontend on page load
type ServerConfig struct {
	ClientConfig
	GinAddress string `env:"GIN_ADDRESS"`

	StaticDir        string `env:"STATIC_DIR"`
	ProxyFrontend    string `env:"PROXY_FRONTEND"`
	ProxyFrontendURL *url.URL

	ReplicatedAPIOrigin string `env:"REPLICATED_API_ORIGIN"`
	ReplicatedAPIKey    string `env:"REPLICATED_API_TOKEN"`
	ReplicatedApp       string `env:"REPLICATED_APP"`
	ReplicatedChannel   string `env:"REPLICATED_CHANNEL"`

	LicenseDuration           string `env:"LICENSE_DURATION"`
	LicenseExpirationDuration time.Duration

	EnableGitops    bool
	EnableAirgap    bool
	EnableSnapshots bool
}

const OneMonth = "720h"

func LoadConfig() (*ServerConfig, error) {

	config := ServerConfig{
		GinAddress:          ":8800",
		ProxyFrontend:       "http://localhost:3000",
		LicenseDuration:     OneMonth,
		ReplicatedAPIOrigin: "https://api.replicated.com/vendor",
		ReplicatedChannel:   "Stable",

		ClientConfig: ClientConfig{
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
		},
	}
	if err := env.Set(&config); err != nil {
		return nil, errors.Wrap(err, "load env config")
	}

	if config.ProxyFrontend != "" {
		parsed, err := url.Parse(config.ProxyFrontend)
		if err != nil {
			return nil, errors.Wrap(err, "parse ProxyFrontend URL")
		}
		config.ProxyFrontendURL = parsed
	}

	if config.LicenseDuration != "" {
		duration, err := time.ParseDuration(config.LicenseDuration)
		if err != nil {
			return nil, errors.Wrap(err, "parse configured license expiration duration")
		}
		config.LicenseExpirationDuration = duration
	}

	return &config, nil
}
