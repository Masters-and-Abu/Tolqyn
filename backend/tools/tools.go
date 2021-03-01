package tools

import (
	"github.com/joho/godotenv"
	"fmt"
	"os"
)

func GoDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {

		fmt.Println("Error loading .env file")
	}

	return os.Getenv(key)
}