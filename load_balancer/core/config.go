package core

import (
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

type Config struct {
	HttpVersion       string            `yaml:"http_version"`
	Protocol          string            `yaml:"protocol"`
	BalanceStrategy   string            `yaml:"balance_strategy"`
	HealthCheckConfig HealthCheckConfig `yaml:"health_check"`
	Port              int               `yaml:"port"`
}

func GetConfig() Config {
	if len(os.Args) < 2 {
		log.Fatal("Config file is required")
	}

	filePath := os.Args[1]
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
