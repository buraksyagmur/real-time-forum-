package forum

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Clients struct {
	conn   *websocket.Conn
	userID int
}

type WsChatResponse struct {
	Label     string `json:"label"`
	Content   string `json:"content"`
	UserID    string `json:"userID"`
	ContactID string `json:"contactID"`
}

type MessageArray struct {
	Index int           `json:"index"`
	Msg   WsChatPayload `json:"msgInfo"`
}

type WsChatPayload struct {
	Label       string `json:"label"`
	Content     string `json:"content"`
	ReceiverId  int    `json:"receiver_id"` // for chat
	SenderId    int    `json:"sender_id"`
	MessageTime string `json:"message_time"`
	Noti        bool   `json:"noti"`
	Right       bool   `json:"right_side"`
}

var chatPayloadChan = make(chan WsChatPayload)

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
		if err == nil {
			fmt.Printf("Sending chatPayload thru chan: %v\n", chatPayload)
			listeningChat(conn, chatPayload)
			chatPayloadChan <- chatPayload

		}
	}
}

func listeningChat(conn *websocket.Conn, msg WsChatPayload) {
	var chatResponse WsChatResponse
	defer func() {
		fmt.Println("chat Ws Conn Closed")
	}()
	for {
		if msg.Label == "message" {
			var pureMsg WsChatPayload
			json.Unmarshal([]byte(msg.Content), &pureMsg)
			processMsg(pureMsg)
			fmt.Printf("payload received: %v\n", msg)
		} else if msg.Label == "openChatBox" {
			chatResponse.Label = "openChatBox"
			chatResponse.Content = displayChatInfo(msg.SenderId, msg.ReceiverId)
			// chatResponse.UserID, chatResponse.ContactID = msg.SenderId, msg.ReceiverId
			fmt.Printf("payload received: %v\n", msg)
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

func displayChatInfo(sendID, recID int) string {
	var allMsg MessageArray
	var arrMsgArray []MessageArray
	counter := 0
	rows, err := db.Query(`SELECT senderID,receiverID,messageTime, content, seen FROM messages 
	WHERE (senderID = ? AND receiverID = ?) or (senderID = ? AND receiverID = ?)`, sendID, recID, recID, sendID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var oneMsg WsChatPayload
		var msgTime time.Time
		rows.Scan(&(oneMsg.SenderId), &(oneMsg.ReceiverId), &msgTime, &(oneMsg.Content), &(oneMsg.Noti))
		oneMsg.MessageTime = msgTime.String()
		if oneMsg.SenderId == sendID {
			oneMsg.Right = true
		}
		allMsg.Index = counter
		allMsg.Msg = oneMsg
		counter++
		arrMsgArray = append(arrMsgArray, allMsg)
	}
	jsonF, err := json.Marshal(arrMsgArray)
	if err != nil {
		log.Fatal(err)
	}
	return string(jsonF)
}
