package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


var db mongo.Client

func goDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	return os.Getenv(key)
}

func main() {


	client, err := mongo.NewClient(options.Client().ApplyURI(goDotEnvVariable("MONGO_URI")))

	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	db = *client

	err = db.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Disconnect(ctx)


	database := db.Database("tolqyn")
	usersCollection := database.Collection("users")

	usersCollection.InsertOne(ctx, bson.D{
		{Key: "name", Value: "Abu"},
	})

	r := mux.NewRouter()

	r.HandleFunc("/register", regi)

	http.ListenAndServe(":8000", r)

}


func check(writer http.ResponseWriter, request *http.Request) {
	writer.Write([]byte("sosatb"))
}




