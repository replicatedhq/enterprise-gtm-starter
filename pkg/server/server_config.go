package server

import (
	"github.com/pkg/errors"
	"net/url"
)

func LoadConfig() (*ServerConfig, error) {

	config := &ServerConfig{
		GinAddress:       ":8800",
		ProxyFrontend:    "http://localhost:3000",
		ProxyFrontendURL: nil,

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

	if config.ProxyFrontend != "" {
		parsed, err := url.Parse(config.ProxyFrontend)
		if err != nil {
			return nil, errors.Wrap(err, "parse ProxyFrontend URL")
		}
		config.ProxyFrontendURL = parsed
	}

	return config, nil
}

type ServerConfig struct {
	ClientConfig
	GinAddress string

	StaticDir        string
	ProxyFrontend    string
	ProxyFrontendURL *url.URL
}
