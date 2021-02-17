package main

import (
	"context"
	"fmt"
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


var db Client

func goDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	return os.Getenv(key)
}

func main() {

	db = ConnectClient(goDotEnvVariable("MONGO_URI"))

	r := mux.NewRouter()

	r.HandleFunc("/getList", getList)


	fmt.Println("Listening on port " + goDotEnvVariable("PORT"))
	http.ListenAndServe(":"+goDotEnvVariable("PORT"), r)

}

type User struct {
	Name string  `json:"name"`
}

func getList(writer http.ResponseWriter, request *http.Request) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	err := db.Client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Client.Disconnect(ctx)

	users := db.Client.Database("tolqyn").Collection("users")

	findOptions := options.Find()
	cur, err := users.Find(context.TODO(), bson.D{{}}, findOptions)

	for cur.Next(context.TODO()) {
		usr := User{}
		err := cur.Decode(&usr)
		if err != nil {
			log.Fatal(err)
		}


		writer.Write([]byte(usr.Name+"\n"))
	}

}




