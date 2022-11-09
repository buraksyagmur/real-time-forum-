package forum

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
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
	Gender    string `json:"gender_option"`
}

type User struct {
	UserId    int
	Nickname  string
	Age       int
	Gender    string
	FirstName string
	LastName  string
	Email     string
	LoggedIn  bool
}

var (
	userID  int
	curUser User
)

func findCurUser(userid int) {
	rows3, err := db.Query(`SELECT nickname, age, gender, firstname, lastname,email, loggedIn FROM users WHERE userID = ?`, userid)
	if err != nil {
		log.Fatal(err)
	}
	defer rows3.Close()
	rows3.Scan(&curUser.Nickname, curUser.Age, curUser.Gender, curUser.FirstName, curUser.LastName, curUser.Email, curUser.LoggedIn)
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
	listenToRegWs(conn, w)
}

func listenToRegWs(conn *websocket.Conn, w http.ResponseWriter) {
	defer func() {
		fmt.Println("Ws Conn Closed")
	}()

	var regPayload WsRegisterPayload

	for {
		err := conn.ReadJSON(&regPayload)
		if err == nil {
			fmt.Printf("payload received: %v\n", regPayload)
			ProcessAndReplyReg(conn, regPayload, w)
		}
	}
}

func ProcessAndReplyReg(conn *websocket.Conn, regPayload WsRegisterPayload, w http.ResponseWriter) {
	var emailCheck string
	dob, err := time.Parse("2006-01-02", regPayload.Age)
	if err != nil {
		log.Fatal(err)
	}
	year := time.Time.Year(dob)
	age := time.Now().Year() - year
	ageStr := strconv.Itoa(age)
	password := []byte(regPayload.Password)
	cryptPw, err := bcrypt.GenerateFromPassword(password, 10)
	if err != nil {
		log.Fatal(err)
	}
	if regPayload.Label == "reg" {
		fmt.Printf("reg- FirstN: %s, LastN: %s, NickN : %s, age: %s, email %s, pw: %s, gender: %s\n",
			regPayload.FirstName, regPayload.LastName, regPayload.NickName,
			ageStr, regPayload.Email, cryptPw, regPayload.Gender)
		// checking duplicate
		rows2, err := db.Query(`SELECT email FROM users WHERE email = ?`, regPayload.Email)
		if err != nil {
			log.Fatal(err)
			return
		}
		defer rows2.Close()
		rows2.Scan(&emailCheck)
		if emailCheck != "" {
			fmt.Println("already registered")
			return
		}
		// insert newuser  into database
		fmt.Printf("%s creating user\n", regPayload.NickName)
		rows, err := db.Prepare("INSERT INTO users(nickname,age,gender,firstname,lastname,email,password, loggedIn) VALUES(?,?,?,?,?,?,?,?);")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		rows.Exec(regPayload.NickName, ageStr, regPayload.Gender, regPayload.FirstName, regPayload.LastName, regPayload.Email, cryptPw, true)

		fmt.Println("Register successfully")
		createSession(w, userID)
		var successResponse WsRegisterResponse
		successResponse.Label = "reg"
		successResponse.Content = fmt.Sprintf("%s Login successfully", regPayload.NickName)
		successResponse.Pass = true
		conn.WriteJSON(successResponse)
		// finding userID of newUser
		rows3, err := db.Query(`SELECT userID FROM users WHERE email = ?`, regPayload.Email)
		if err != nil {
			log.Fatal(err)
		}
		defer rows3.Close()
		for rows3.Next() {
			rows3.Scan(&userID)
		}
	}
}

func createSession(w http.ResponseWriter, userID int) {
	sid := uuid.NewV4()
	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  sid.String(),
		MaxAge: 1800,
	})
	fmt.Printf("reg sid: %s\n", sid)
	stmt, err := db.Prepare("INSERT INTO sessions (sessionID, userID) VALUES (?,?);")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	stmt.Exec(sid.String(), userID)
}
