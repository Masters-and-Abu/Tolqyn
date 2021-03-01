package main

import (
	"fmt"
	"github.com/Masters-and-Abu/Tolqyn/backend/auth"
	"github.com/Masters-and-Abu/Tolqyn/backend/database"
	"github.com/Masters-and-Abu/Tolqyn/backend/broadcast"
	"github.com/Masters-and-Abu/Tolqyn/backend/tools"
	"github.com/gorilla/mux"
	"github.com/prometheus/common/log"
	"golang.org/x/net/context"
	"net/http"
	"time"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func main() {
	database.DB = database.ConnectClient(tools.GoDotEnvVariable("MONGO_URI"))
	port := tools.GoDotEnvVariable("PORT")
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
