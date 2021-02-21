package main

import (
	"fmt"
	"github.com/Masters-and-Abu/Tolqyn/backend/auth"
	"github.com/Masters-and-Abu/Tolqyn/backend/database"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/common/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/context"
	"net/http"
	"os"
	"time"
)

func goDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		fmt.Println("Error loading .env file")
	}

	return os.Getenv(key)
}



func main() {
	database.DB = database.ConnectClient(goDotEnvVariable("MONGO_URI"))
	port := goDotEnvVariable("PORT")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	err := database.DB.Client.Connect(ctx)
	if err!=nil{
		log.Fatal(err)
	}
	defer database.DB.Client.Disconnect(ctx)

	r := mux.NewRouter()
	r.HandleFunc("/register", auth.Register)
	r.HandleFunc("/auth", auth.Auth)

	fmt.Println("Listening on port "+port)
	http.ListenAndServe(":"+port, r)
}




func getList(writer http.ResponseWriter, request *http.Request) {

	users := database.DB.Client.Database("tolqyn").Collection("users")

	findOptions := options.Find()
	cur, err := users.Find(context.TODO(), bson.D{{}}, findOptions)

	if err!=nil{
		log.Fatal(err)
	}
	for cur.Next(context.TODO()) {
		if(cur==nil){
			break
		}
		usr := auth.User{}
		err := cur.Decode(&usr)
		if err != nil {
			fmt.Println("problem in decode")
		}


		writer.Write([]byte(usr.Login+"\n"))
	}
}