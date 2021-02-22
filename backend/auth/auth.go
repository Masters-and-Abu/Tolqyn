package auth

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"github.com/Masters-and-Abu/Tolqyn/backend/database"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/net/context"
	"log"
	"net/http"
)


type User struct {
	Login string  `json:"login"`
	Pass string  `json:"pass"`
}

type Token struct {
	Token string  `json:"token"`
}


func hashAndSalt(pwd []byte) string {

	// Use GenerateFromPassword to hash & salt pwd.
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash := md5.Sum(pwd)

	return string(hash[:])
}

func Register(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Body)
		obj := User{}
		err := decoder.Decode(&obj)
		if err != nil {
			log.Println(err)
		}
		obj.Pass = hashAndSalt([]byte(obj.Pass))
		users := database.DB.Client.Database("tolqyn").Collection("users")

		insertResult, err := users.InsertOne(context.TODO(), obj)
		if err != nil {
			log.Println(err)
		}

		fmt.Println("Inserted a single document: ", insertResult.InsertedID)

		w.WriteHeader(http.StatusOK)
	}
}


func Auth(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Body)
		obj := User{}
		err := decoder.Decode(&obj)
		if err != nil {
			log.Println(err)
		}
		obj.Pass = hashAndSalt([]byte(obj.Pass))


		users := database.DB.Client.Database("tolqyn").Collection("users")
		res := User{}
		filter := bson.D{{"login", obj.Login}}
		err = users.FindOne(context.TODO(), filter).Decode(&res)
		if err!=nil{
			log.Println(err)
		}

		if(res.Pass==obj.Pass){
			tkn := Token{Token: res.Pass}
			w.WriteHeader(http.StatusOK)
			resp, err := json.Marshal(tkn)
			if err!=nil{
				log.Println(err)
			}
			w.Write(resp)
		}else{
			w.WriteHeader(http.StatusUnauthorized)
		}



	}
}
