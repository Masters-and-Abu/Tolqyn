package main

import (
	"fmt"
	"github.com/Masters-and-Abu/Tolqyn/backend/auth"
	"github.com/Masters-and-Abu/Tolqyn/backend/database"
	"github.com/Masters-and-Abu/Tolqyn/backend/broadcast"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/common/log"
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

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func main() {
	database.DB = database.ConnectClient(goDotEnvVariable("MONGO_URI"))
	port := goDotEnvVariable("PORT")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	err := database.DB.Client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Client.Disconnect(ctx)

	r := mux.NewRouter()
	r.HandleFunc("/register", auth.Register)
	r.HandleFunc("/auth", auth.Auth)
	r.HandleFunc("/sdp", broadcast.SDP)
	r.HandleFunc("/connect", broadcast.SDPConnect)
	r.HandleFunc("/close", broadcast.SDPClose)
	r.HandleFunc("/connected", broadcast.SDPConnected)
	r.HandleFunc("/number", broadcast.SDPCurrent)
	r.Use(mux.CORSMethodMiddleware(r))

	fmt.Println("Listening on port " + port)
	http.ListenAndServe(":"+port, r)
}
