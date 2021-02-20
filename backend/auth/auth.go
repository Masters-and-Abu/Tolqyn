package auth

import (
	"encoding/json"
	"fmt"
	"github.com/Masters-and-Abu/Tolqyn/backend/database"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/net/context"
	"log"
	"net/http"
)


type User struct {
	Login string  `json:"login"`
	Pass string  `json:"pass"`
}

func hashAndSalt(pwd []byte) string {

	// Use GenerateFromPassword to hash & salt pwd.
	// MinCost is just an integer constant provided by the bcrypt
	// package along with DefaultCost & MaxCost.
	// The cost can be any value you want provided it isn't lower
	// than the MinCost (4)
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
	if err != nil {
		log.Println(err)
	}    // GenerateFromPassword returns a byte slice so we need to
	// convert the bytes to a string and return it
	return string(hash)
}

func Register(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Body)
		obj := User{}
		err := decoder.Decode(&obj)
		obj.Pass = hashAndSalt([]byte(obj.Pass+obj.Login))
		users := database.DB.Client.Database("tolqyn").Collection("users")

		insertResult, err := users.InsertOne(context.TODO(), User{obj.Login,obj.Pass})
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("Inserted a single document: ", insertResult.InsertedID)

		w.WriteHeader(http.StatusOK)
	}
}