package forum

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type WsRegisterResponse struct {
	Label   string `json:"label"`
	Content string `json:"content"`
	Pass    bool   `json:"pass"`
}
type WsRegisterPayload struct {
	Label     string `json:"label"`
	FirstName string `json:"name"`
	LastName  string `json:"lastname"`
	NickName  string `json:"nickname"`
	Age       string `json:"age"`
	Email     string `json:"email"`
	Password  string `json:"pw"`
	Gender    string `json:"gender"`

	// Conn          *websocket.Conn `json:"-"`
}

func RegWsEndpoint(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Println("Connected")
	var firstResponse WsLoginResponse
	firstResponse.Label = "Greet"
	firstResponse.Content = "Please register to the Forum"
	conn.WriteJSON(firstResponse)
	// insert conn into db with empty userID, fill in the userID when registered or logged in
	// stmt, err := db.Prepare(`INSERT INTO websockets (userID, websocketAdd) VALUES (?, ?);`)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// defer stmt.Close()
	// stmt.Exec("", conn)
	listenToRegWs(conn)
}

func listenToRegWs(conn *websocket.Conn) {
	defer func() {
		fmt.Println("Ws Conn Closed")
	}()

	var regPayload WsRegisterPayload

	for {
		err := conn.ReadJSON(&regPayload)
		if err == nil {
			// loginPayload.Conn = conn
			fmt.Printf("payload received: %v\n", regPayload)
			ProcessAndReplyReg(conn, regPayload)
		}
	}
}

func ProcessAndReplyReg(conn *websocket.Conn, regPayload WsRegisterPayload) {
	if regPayload.Label == "reg" {
		fmt.Printf("reg- FirstN: %s, LastN: %s, NickN : %s, age: %s, email %s, pw: %s, gender: %s\n",
			regPayload.FirstName, regPayload.LastName, regPayload.NickName,
			regPayload.Age, regPayload.Email, regPayload.Password, regPayload.Gender)

		fmt.Printf("%s creating user\n", regPayload.NickName)
		rows, err := db.Prepare("INSERT INTO users(nickname,age,gender,firstname,lastname,email,password, loggedIn) VALUES(?,?,?,?,?,?,?);")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		rows.Exec(regPayload.NickName, regPayload.Age, regPayload.Gender, regPayload.FirstName, regPayload.LastName, regPayload.Email, regPayload.Password, false)

		fmt.Println("Register successfully")

		var successResponse WsRegisterResponse
		successResponse.Label = "reg"
		successResponse.Content = fmt.Sprintf("%s Login successfully", regPayload.NickName)
		successResponse.Pass = true
		conn.WriteJSON(successResponse)

	}
}

// func testReg() {
// 	stmt, err := db.Prepare("INSERT INTO users (userID, nickname, age, gender, firstname, lastname, email, password, loggedIn) VALUES (?,?,?,?,?,?,?,?,?);")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	testpw := "supersecret"
// 	testpwHash, err := bcrypt.GenerateFromPassword([]byte(testpw), 10)
// 	stmt.Exec(0o07, "doubleOhSeven", 42, 1, "James", "Bond", "secretagent@mi5.com", testpwHash, false)
// }
