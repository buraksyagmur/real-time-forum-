import userListSocket from "./userList.js";
let loginSocket = null;
let nameInput = null;
let pwInput = null;
const navbar = document.querySelector(".nav-bar")
console.log(userListSocket);
document.addEventListener("DOMContentLoaded", function() {
    loginSocket = new WebSocket("ws://localhost:8080/loginWs/");
    console.log("JS attempt to connect to login");
    loginSocket.onopen = () => console.log("login connected");
    loginSocket.onclose = () => console.log("Bye login");
    loginSocket.onerror = (err) => console.log("login ws Error!");
    loginSocket.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        if (resp.label === "greet") {
            console.log(resp.content);
            navbar.children[0].style.display = "block"
            navbar.children[1].style.display = "block"
            navbar.children[2].style.display = "none"
        } else if (resp.label === "login") {
            console.log("uid: ",resp.cookie.uid, "sid: ", resp.cookie.sid, "age: ", resp.cookie.max_age);
            document.cookie = `session=${resp.cookie.sid}; max-age=${resp.cookie.max_age}`;
            if (resp.pass== true){
            const splitScreen = document.querySelector(".container")
            const signPage = document.querySelector("#userPopUpPOne")
            navbar.children[0].style.display = "none"
            navbar.children[1].style.display = "none"
            navbar.children[2].style.display = "block"
            signPage.style.display= "none"
            splitScreen.style.display= "flex"
            nameInput.value = "";
            pwInput.value = "";
            }
            // update user list after a user login
            if (resp.pass) {
                let uListPayload = {};
                uListPayload["label"] = "update";
                uListPayload["cookie_value"] = resp.cookie.sid;
                console.log("login UL sending: ", uListPayload);
                userListSocket.send(JSON.stringify(uListPayload));
            }
            
        }
    }
});

// logout.addEventListener("click", logouthandler)
const loginHandler = function (e) {
    e.preventDefault();
    const formFields = new FormData(e.target);
    const payloadObj = Object.fromEntries(formFields.entries());
    payloadObj["label"] = "login";
    console.log({ payloadObj });
    loginSocket.send(JSON.stringify(payloadObj));
};


const loginForm = document.createElement("form");
loginForm.className = "formPage"
loginForm.addEventListener("submit", loginHandler);

// login form
// name label
const nameLabelDiv = document.createElement('div');
const nameLabel = document.createElement('label');
nameLabel.textContent = "Please Enter Your Nickname or Email:";
nameLabel.setAttribute("for", "name");
nameLabelDiv.append(nameLabel);
// name input
const nameInputDiv = document.createElement('div');
nameInput = document.createElement('input');
nameInput.setAttribute("type", "text");
nameInput.setAttribute("name", "name");
nameInput.setAttribute("id", "name");
nameInput.setAttribute("placeholder", "eg: deathstar123 or abc@def.com")
nameInputDiv.append(nameInput);

// pw label
const pwLabelDiv = document.createElement('div');
const pwLabel = document.createElement('label');
pwLabel.textContent = "Please Enter Your Password:";
pwLabel.setAttribute("for", "pw");
pwLabelDiv.append(pwLabel);
// password input
const pwInputDiv = document.createElement('div');
pwInput = document.createElement('input');
pwInput.setAttribute("type", "password");
pwInput.setAttribute("name", "pw");
pwInput.setAttribute("id", "pw");
pwInputDiv.append(pwInput);

const loginSubmitDiv = document.createElement('div');
const loginSubmit = document.createElement("button");
loginSubmit.textContent = "Login";
loginSubmit.setAttribute("type", "submit");
loginSubmitDiv.append(loginSubmit);

loginForm.append(nameLabelDiv, nameInputDiv, pwLabelDiv, pwInputDiv, loginSubmitDiv);
export default loginForm;