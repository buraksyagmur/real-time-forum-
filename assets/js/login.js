let loginSocket = null;
let json
const navbar = document.querySelector(".navbar")
const logout = document.querySelector("#logout")
document.addEventListener("DOMContentLoaded", function () {
    loginSocket = new WebSocket("ws://localhost:8080/loginWs/");
    console.log("JS attempt to connect");
    loginSocket.onopen = () => console.log("connected-login");
    loginSocket.onclose = () => console.log("Bye-login");
    loginSocket.onerror = (err) => console.log("Error!-login", err);
    loginSocket.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        console.log({ resp });
        if (resp.label === "Greet") {
            console.log(navbar.children[0])
            navbar.children[0].style.display = "block"
            navbar.children[1].style.display = "block"
            navbar.children[2].style.display = "none"
            console.log(resp.content);
        } else if (resp.label === "login") {
            json = resp.content
            console.log(resp.content);
            if (resp.pass) {
                navbar.childNodes[0].style.display = "none"
                navbar.childNodes[1].style.display = "none"
                navbar.childNodes[2].style.display = "block"
            }
        }
    }
});
const logouthandler = function (e) {
    e.preventDefault();
    const payloadObj = Object.prototype
    payloadObj["label"] = "logout";
    payloadObk["name"] = json.name
    loginSocket.send(JSON.stringify(payloadObj));
};
logout.addEventListener("click", logouthandler)
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
const nameInput = document.createElement('input');
nameInput.setAttribute("type", "text");
nameInput.setAttribute("name", "name");
nameInput.setAttribute("id", "name");
nameInput.setAttribute("placeholder", "eg: Nick or abc@def.com")
nameInputDiv.append(nameInput);

// pw label
const pwLabelDiv = document.createElement('div');
const pwLabel = document.createElement('label');
pwLabel.textContent = "Please Enter Your Password:";
pwLabel.setAttribute("for", "pw");
pwLabelDiv.append(pwLabel);
// password input
const pwInputDiv = document.createElement('div');
const pwInput = document.createElement('input');
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