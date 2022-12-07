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
	fmt.Println("Chat Connected")

	readChatPayloadFromWs(conn)
}

func readChatPayloadFromWs(conn *websocket.Conn) {
	defer func() {
		fmt.Println("Chat Ws Conn Closed")
	}()

	var chatPayload WsChatPayload
	for {
		err := conn.ReadJSON(&chatPayload)

		if err == nil && chatPayload.Label == "chat" {
			processMsg(chatPayload)
			chatPayloadChan <- chatPayload
		} else if err == nil && chatPayload.Label == "updateChat" {
			// saving websocket to map
			chatWsMap[chatPayload.SenderId] = conn
		}
	}
}

func ProcessAndReplyChat() {
	for {
		receivedChatPayload := <-chatPayloadChan

		var responseChatPayload WsChatResponse

		responseChatPayload.Label = "msgIncoming"
		responseChatPayload.UserID = receivedChatPayload.ReceiverId
		responseChatPayload.ContactID = receivedChatPayload.SenderId
		responseChatPayload.Content = receivedChatPayload.Content

		receiverConn := chatWsMap[receivedChatPayload.ReceiverId]
		err := receiverConn.WriteJSON(responseChatPayload)
		if err != nil {
			fmt.Println("failed to send message")
		}
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
