// import chatForm from "./chat.js";
import RegisterForm from "./reg.js";
import loginForm from "./login.js";
import PostForm from "./post.js";
import logoutBtn from "./logout.js";
const loginArea = document.querySelector("#userPopUpPOne")
const loginInputs = loginArea.firstElementChild
const regArea = document.querySelector("#userPopUpPTwo")
const reginInputs = regArea.firstElementChild
const body = document.querySelector("body")
const logoutLi = document.querySelector("#logoutBtn")
const postPage = document.querySelector(".postPage")
logoutLi.appendChild(logoutBtn)
loginInputs.append(loginForm)
reginInputs.append(RegisterForm)
loginArea.append(loginInputs)
regArea.append(reginInputs)
postPage.append(PostForm)
// const chatBox = document.createElement("div")
// chatBox.append(chatForm);
// body.append(chatBox);