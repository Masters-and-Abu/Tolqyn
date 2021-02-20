package database

import (
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

func ConnectClient(uri string) Client {
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))

	if err != nil {
		log.Fatal(err)
	}


	return Client{Client: client}
}

// Database : mongoConnector type
type Client struct {
	Client *mongo.Client
}

var DB Client