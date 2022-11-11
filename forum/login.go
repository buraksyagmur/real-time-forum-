package forum

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"golang.org/x/crypto/bcrypt"
)

type SessionCookie struct {
	Uid    int    `json:"uid"`
	Sid    string `json:"sid"`
	MaxAge int    `json:"max_age"`
}

type WsLoginResponse struct {
	Label   string        `json:"label"`
	Content string        `json:"content"`
	Pass    bool          `json:"pass"`
	Cookie  SessionCookie `json:"cookie"`
}

type WsLoginPayload struct {
	Label         string `json:"label"`
	NicknameEmail string `json:"name"`
	Password      string `json:"pw"`
	// Conn          *websocket.Conn `json:"-"`
}

var (
	userIDDB   int
	nicknameDB string
	emailDB    string
	hashDB     []byte
)

func LoginWsEndpoint(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Println("Login Connected")
	var firstResponse WsLoginResponse
	firstResponse.Label = "greet"
	firstResponse.Content = "Please login to the Forum"
	conn.WriteJSON(firstResponse)
	// insert conn into db with empty userID, fill in the userID when registered or logged in
	// stmt, err := db.Prepare(`INSERT INTO websockets (userID, websocketAdd) VALUES (?, ?);`)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// defer stmt.Close()
	// stmt.Exec("", conn)
<<<<<<< HEAD
	listenToLoginWs(conn)
	createSession(w, userIDDB)
=======
	loginSuccess := false

	// keep running until login success
	for !loginSuccess {
		loginSuccess = listenToLoginWs(conn)
	}
	conn.Close()

	// if loginSuccess {
	// 	userIsOnline()
	// }
>>>>>>> d
}

func listenToLoginWs(conn *websocket.Conn) bool {
	defer func() {
		fmt.Println("Login Ws Conn Closed")
	}()

	var loginPayload WsLoginPayload

	for {
		err := conn.ReadJSON(&loginPayload)
		if err == nil {
			// loginPayload.Conn = conn
<<<<<<< HEAD
			fmt.Printf("payload received: %v\n", loginPayload)
			ProcessAndReplyLogin(conn, loginPayload)
=======
			fmt.Printf("login payload received: %v\n", loginPayload)
			// testLogin() // just for testing, can be removed in production
			loginSuccess := ProcessAndReplyLogin(conn, loginPayload)
			return loginSuccess
>>>>>>> d
		}
	}
}

func ProcessAndReplyLogin(conn *websocket.Conn, loginPayload WsLoginPayload) bool {

	fmt.Printf("login u: %s: , login pw: %s\n", loginPayload.NicknameEmail, loginPayload.Password)

<<<<<<< HEAD
		// // get user data from db
=======
	// // get user data from db
	var userIDDB int
	var nicknameDB string
	var emailDB string
	var hashDB []byte
>>>>>>> d

	// auth user
	fmt.Printf("%s trying to Login\n", loginPayload.NicknameEmail)
	rows, err := db.Query(`SELECT userID, nickname, email, password 
							FROM users
							WHERE nickname = ?
							OR email = ?`, loginPayload.NicknameEmail, loginPayload.NicknameEmail)
<<<<<<< HEAD
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		for rows.Next() {
			rows.Scan(&userIDDB, &nicknameDB, &emailDB, &hashDB)
		}
		rows3, err := db.Query(`SELECT userID FROM sessions WHERE userID = ?`, userIDDB)
		if err == nil {
			log.Fatal(err)
			return
		}
		defer rows3.Close()

		// // test hash
		// hash, err := bcrypt.GenerateFromPassword([]byte(pw), 10)
		// fmt.Printf("nicknameEmailDB: %s , hashDB: %s\n", nicknameEmailDB, hashDB)

		// // compare pw
		err = bcrypt.CompareHashAndPassword(hashDB, []byte(loginPayload.Password))
		// fmt.Printf("DB pw: %s, entered: %s\n", hashDB, loginPayload.password)
		// fmt.Printf("DB pw: %s, entered: %s\n", hashDB, hash)

		// Login failed
		if err != nil {
			// login failed
			fmt.Println("Failed")
			var failedResponse WsLoginResponse
			failedResponse.Label = "login"
			failedResponse.Content = "record cannot be found"
			failedResponse.Pass = false
			conn.WriteJSON(failedResponse)
			return
		}
		// Login successfully
		fmt.Printf("%s (name from DB) Login successfully\n", loginPayload.NicknameEmail)

		var successResponse WsLoginResponse
		successResponse.Label = "login"
		successResponse.Content = fmt.Sprintf("%s Login successfully", nicknameDB)
		successResponse.Pass = true
		conn.WriteJSON(successResponse)

		// // allow each user to have only one opened session
		// var loggedInUname string
		// rows, err = db.Query("SELECT username FROM sessions WHERE username = ?;", nicknameEmailDB)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		// defer rows.Close()
		// for rows.Next() {
		// 	rows.Scan(&loggedInUname)
		// }
		// // if the uname can be found in session table, remove that row (should only have 1 row)
		// if loggedInUname != "" {
		// 	stmt, err := db.Prepare("DELETE FROM sessions WHERE username = ?;")
		// 	if err != nil {
		// 		log.Fatal(err)
		// 	}
		// 	defer stmt.Close()
		// 	stmt.Exec(loggedInUname)
		// }

		// assign a cookie
		// sid := uuid.NewV4()
		// fmt.Printf("login sid: %s\n", sid)
		// http.SetCookie(w, &http.Cookie{
		// 	Name:   "session",
		// 	Value:  sid.String(),
		// 	MaxAge: 900, // 15mins
		// })

		// // forumUser.Username = nicknameEmailDB
		// // forumUser.LoggedIn = true
		// // fmt.Printf("%s forum User Login\n", forumUser.Username)

		// // update the user's login status
		stmt, err := db.Prepare("UPDATE users SET loggedIn = ? WHERE userID = ?;")
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()
		stmt.Exec(true, userIDDB)
		// // insert a record into session table
		// stmt, err = db.Prepare("INSERT INTO sessions (sessionID, userID) VALUES (?, ?);")
		// if err != nil {
		// 	log.Fatal(err)
		// }
		// defer stmt.Close()
		// stmt.Exec(sid.String(), nicknameEmailDB)

		// test
		// var whichUser string
		// var logInOrNot bool
		// rows, err = db.Query("SELECT username, loggedIn FROM users WHERE username = ?;", nicknameEmailDB)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		// defer rows.Close()
		// for rows.Next() {
		// 	rows.Scan(&whichUser, &logInOrNot)
		// }
		// fmt.Printf("login user: %s, login status: %v\n", whichUser, logInOrNot)

	} else if loginPayload.Label == "logout" {
		rows, err := db.Query("SELECT userID FROM user WHERE userna = ?;", loginPayload.NicknameEmail)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		for rows.Next() {
			rows.Scan(&userID)
		}
		stmt, err := db.Prepare("DELETE FROM sessions WHERE userID = ?;")
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()
		stmt.Exec(userID)
		var firstResponse WsLoginResponse
		firstResponse.Label = "Greet"
		firstResponse.Content = "Please login to the Forum"
		conn.WriteJSON(firstResponse)

	}
}

=======
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		rows.Scan(&userIDDB, &nicknameDB, &emailDB, &hashDB)
	}

	// // test hash
	// hash, err := bcrypt.GenerateFromPassword([]byte(pw), 10)
	// fmt.Printf("nicknameEmailDB: %s , hashDB: %s\n", nicknameEmailDB, hashDB)

	// // compare pw
	err = bcrypt.CompareHashAndPassword(hashDB, []byte(loginPayload.Password))
	// fmt.Printf("DB pw: %s, entered: %s\n", hashDB, loginPayload.password)
	// fmt.Printf("DB pw: %s, entered: %s\n", hashDB, hash)

	// Login failed
	if err != nil {
		// login failed
		fmt.Println("Failed")
		var failedResponse WsLoginResponse
		failedResponse.Label = "login"
		failedResponse.Content = "Please check your credentials"
		failedResponse.Pass = false
		conn.WriteJSON(failedResponse)
		return false
	}
	// Login successfully
	fmt.Printf("%s (name from DB) Login successfully\n", loginPayload.NicknameEmail)

	// update login status in users

	var successResponse WsLoginResponse
	successResponse.Label = "login"
	successResponse.Content = fmt.Sprintf("%s Login successfully", nicknameDB)
	successResponse.Pass = true
	successResponse.Cookie = genCookie(conn, userIDDB)
	conn.WriteJSON(successResponse)

	return true
}

// func testLogin() {
// 	stmt, err := db.Prepare("INSERT INTO users (userID, nickname, age, gender, firstname, lastname, email, password, loggedIn) VALUES (?,?,?,?,?,?,?,?,?);")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	testpw := "supersecret"
// 	testpwHash, err := bcrypt.GenerateFromPassword([]byte(testpw), 10)
// 	stmt.Exec(7, "doubleOh7", 42, 1, "James", "Bond", "secretagent@mi5.com", testpwHash, false)
// }
>>>>>>> d
