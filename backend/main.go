package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/check", check)

	http.ListenAndServe(":8000", r)

}


func check(writer http.ResponseWriter, request *http.Request) {
	writer.Write([]byte("sosatb"))
}




