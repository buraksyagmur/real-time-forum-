package forum

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type WsChatResponse struct {
	Label     string `json:"label"`
	Content   string `json:"content"`
	UserID    int    `json:"userID"`
	ContactID int    `json:"contactID"`
}

type MessageArray struct {
	Index int           `json:"index"`
	Msg   WsChatPayload `json:"msgInfo"`
}

type WsChatPayload struct {
	Label       string `json:"label"`
	Content     string `json:"content"`
	SenderId    int    `json:"sender_id"`
	ReceiverId  int    `json:"receiver_id"`
	Online      bool   `json:"online"` // whether the receiver is online
	MessageTime string `json:"message_time"`
	Noti        bool   `json:"noti"`
	Right       bool   `json:"right_side"`
	// CookieValue string `json:"cookie_value"`
}

var (
	chatPayloadChan = make(chan WsChatPayload)
	chatWsMap       = make(map[int]*websocket.Conn)
)

func chatWsEndpoint(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	var recievedPayload WsChatPayload
	for {
		conn.ReadJSON(&recievedPayload)
		chatWsMap[recievedPayload.SenderId] = conn
		chatPayloadChan <- recievedPayload
	}
}

func ProcessPayloadChan() {
	for {
		receivedPayload := <-chatPayloadChan
		processMsg(receivedPayload)
	}
}

func processMsg(msg WsChatPayload) {
	rows, err := db.Prepare("INSERT INTO messages(senderID,receiverID,messageTime,content,seen) VALUES(?,?,?,?,?);")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	rows.Exec(msg.SenderId, msg.ReceiverId, time.Now(), msg.Content, false)
	fmt.Println("msg saved successfully")
}
