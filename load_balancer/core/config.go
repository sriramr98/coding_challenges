package core

import (
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

type HealthCheckConfig struct {
	Path              string `yaml:"path"`
	SuccesCodes       []int  `yaml:"success_codes"`
	HealhyTreshold    int    `yaml:"healthy_treshold"`
	UnHealthyTreshold int    `yaml:"unhealthy_treshold"`
	Timeout           int    `yaml:"timeout"`
}

type TLSConfig struct {
	Certificate string `yaml:"cert"`
	Key         string `yaml:"key"`
}

func (t TLSConfig) IsValidTLS() bool {
	return len(t.Certificate) > 0 && len(t.Key) > 0
}

type Config struct {
	HttpVersion       string            `yaml:"http_version"`
	Protocol          string            `yaml:"protocol"`
	BalanceStrategy   string            `yaml:"balance_strategy"`
	Tls               TLSConfig         `yaml:"tls"`
	HealthCheckConfig HealthCheckConfig `yaml:"health_check"`
	Port              int               `yaml:"port"`
}

func GetConfig() Config {
	filePath := os.Getenv("CONFIG_PATH")
	fmt.Printf("Evn file path: %s\n", filePath)

	if filePath == "" {
		if len(os.Args) < 2 {
			log.Fatal("Config file is required")
		}

		filePath = os.Args[1]
	}

	if filePath == "" {
		log.Fatal("Config file is required")
	}

	fmt.Printf("File Path: %s\n", filePath)
	configContent, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal(err)
	}

	config := Config{}
	if err := yaml.Unmarshal(configContent, &config); err != nil {
		log.Fatal(err)
	}

	return config
}
