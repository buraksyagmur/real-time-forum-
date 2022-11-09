import RegisterForm from "./reg.js";
import loginForm from "./login.js";
import PostForm from "./post.js";
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

