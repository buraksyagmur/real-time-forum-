package forum

import (
	"fmt"
	"log"
	"net/http"
	"time"
	"github.com/gorilla/websocket"
)

type WsPostResponse struct {
	Label   string `json:"label"`
	Content string `json:"content"`
	Pass    bool   `json:"pass"`
}

type WsPostPayload struct {
	Label    string `json:"label"`
	Title    string `json:"title"`
	Category string `json:"category_option"`
	Content  string `json:"Content"`
}

func PostWsEndpoint(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Println("Connected")
	var firstResponse WsPostResponse
	firstResponse.Label = "Greet"
	firstResponse.Content = "Please post to the Forum"
	conn.WriteJSON(firstResponse)
	listenToPostWs(conn)
}

func listenToPostWs(conn *websocket.Conn) {
	defer func() {
		fmt.Println("Ws Conn Closed")
	}()

	var postPayload WsPostPayload

	for {
		err := conn.ReadJSON(&postPayload)
		if err == nil {
			fmt.Printf("payload received: %v\n", postPayload)
			ProcessAndReplyPost(conn, postPayload)
		}
	}
}

func ProcessAndReplyPost(conn *websocket.Conn, postPayload WsPostPayload) {
	if postPayload.Label == "reg" {
		fmt.Printf("post - title:%s, cat:%s, Content:%s", postPayload.Title, postPayload.Category, postPayload.Content)

		rows, err := db.Prepare("INSERT INTO users(title,content,category,postTime) VALUES(?,?,?,?);")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		rows.Exec(postPayload.Title, postPayload.Content, postPayload.Category, time.Now())
		fmt.Println("Posted successfully")
		var successResponse WsPostResponse
		successResponse.Label = "reg"
		successResponse.Content = fmt.Sprintf("%s Posted successfully", postPayload.Title)

		successResponse.Pass = true
		conn.WriteJSON(successResponse)

	}
}
