// import chatForm from "./chat.js";
import RegisterForm from "./reg.js";
import loginForm from "./login.js";
import PostForm from "./post.js";
<<<<<<< HEAD
import logoutBtn from "./logout.js";
import chatForm from "./chat.js";
const chatBox = document.querySelector(".col-1")
=======
import LogoutButton from "./logout.js";
>>>>>>> login-reg-bugs
const loginArea = document.querySelector("#userPopUpPOne")
const loginInputs = loginArea.firstElementChild
const regArea = document.querySelector("#userPopUpPTwo")
const reginInputs = regArea.firstElementChild
const body = document.querySelector("body")
<<<<<<< HEAD
const logoutLi = document.querySelector("#logoutBtn")
const postPage = document.querySelector(".postPage")
logoutLi.appendChild(logoutBtn)
=======
>>>>>>> login-reg-bugs
loginInputs.append(loginForm)
reginInputs.append(RegisterForm)
loginArea.append(loginInputs)
regArea.append(reginInputs)
<<<<<<< HEAD
postPage.append(PostForm)
chatBox.append(chatForm)
// const chatBox = document.createElement("div")
// chatBox.append(chatForm);
// body.append(chatBox);
=======
body.append(PostForm)
body.append(LogoutButton)
const chatBox = document.createElement("div")
chatBox.append(chatForm);
body.append(chatBox);
>>>>>>> login-reg-bugs
