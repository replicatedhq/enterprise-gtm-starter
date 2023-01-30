package server

import (
	"github.com/stretchr/testify/require"
	"os"
	"testing"
)

func TestConfig(t *testing.T) {
	tests := []struct {
		name    string
		env     map[string]string
		expect  func(s *ServerConfig)
		wantErr error
	}{
		{
			name:   "defaults",
			env:    nil,
			expect: func(s *ServerConfig) {},
		},
		{
			name: "override gin address",
			env: map[string]string{
				"GIN_ADDRESS": ":8081",
			},
			expect: func(s *ServerConfig) {
				s.GinAddress = ":8081"
			},
		},
		{
			name: "override channel",
			env: map[string]string{
				"LICENSE_CHANNEL": "Unstable",
			},
			expect: func(s *ServerConfig) {
				s.ReplicatedChannel = "Unstable"
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := require.New(t)
			for key, value := range test.env {
				oldValue := os.Getenv(key)
				os.Setenv(key, value)
				if oldValue != "" {
					defer os.Setenv(key, oldValue)
				} else {
					defer os.Unsetenv(key)
				}
			}

			config, err := LoadConfig()

			if test.wantErr != nil {
				req.Error(err)
			} else {
				req.NoError(err)
			}

			expectConfig := DefaultConfig()
			req.NoError(expectConfig.parseConfig())

			test.expect(&expectConfig)

			req.Equal(expectConfig, *config)
		})
	}
}
