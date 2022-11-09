import RegisterForm from "./reg.js";
import loginForm from "./login.js";
import PostForm from "./post.js";

// const formDiv = document.querySelector(".form-div");
// const loginBut = document.querySelector(".login-section");
// const regBut = document.querySelector(".reg-section");// to review for popup
const loginArea = document.querySelector("#userPopUpPOne")
const loginInputs = loginArea.firstElementChild 
const regArea = document.querySelector("#userPopUpPTwo")
const reginInputs = regArea.firstElementChild 
const body = document.querySelector("body")

loginInputs.append(loginForm)
reginInputs.append(RegisterForm)
loginArea.append(loginInputs)
regArea.append(reginInputs)

body.append(PostForm)

