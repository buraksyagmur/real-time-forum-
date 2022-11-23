import userListSocket from "./userList.js";
console.log(userListSocket);
let regSocket = null; 
const userList = document.querySelector(".user-list");
const navbar = document.querySelector(".nav-bar")
const splitScreen = document.querySelector(".container")
document.addEventListener("DOMContentLoaded", function() {
    regSocket = new WebSocket("ws://localhost:8080/regWs/");
    console.log("JS attempt to connect to reg");
    regSocket.onopen = () => console.log("connected-reg");
    regSocket.onclose = () => console.log("Bye-reg");
    regSocket.onerror = (err) => console.log("Error!-reg",err);
    regSocket.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        console.log({resp});
        if (resp.label === "Greet") {
            console.log(resp.content);
        } else if (resp.label === "reg") {
            console.log("uid: ",resp.cookie.uid, "sid: ", resp.cookie.sid, "age: ", resp.cookie.max_age);
            document.cookie = `session=${resp.cookie.sid}; max-age=${resp.cookie.max_age}`;
            navbar.children[0].style.display = "none"
            navbar.children[1].style.display = "none"
            navbar.children[2].style.display = "block"
            const signPage = document.querySelector("#userPopUpPOne")
            signPage.style.display= "none"
            splitScreen.style.display= "flex"
            console.log("msg: ", resp.content);

            // update user list after a user reg
            if (resp.pass) {
                let uListPayload = {};
                uListPayload["label"] = "update";
                uListPayload["cookie_value"] = resp.cookie.sid;
                console.log("reg UL sending: ", uListPayload);
                userListSocket.send(JSON.stringify(uListPayload));
            }
        }
    }
});

const regHandler = function(e) {
    e.preventDefault();
    const formFields = new FormData(e.target);
    const payloadObj = Object.fromEntries(formFields.entries());
    payloadObj["label"] = "reg";
    console.log({payloadObj});
    regSocket.send(JSON.stringify(payloadObj));
};

// reg form//
const RegisterForm = document.createElement("form");
RegisterForm.className = "formPage"
RegisterForm.addEventListener("submit", regHandler);


// name label
const RnameLabelDiv = document.createElement('div');
const RnameLabel = document.createElement('label');
RnameLabel.textContent = "Please Enter Your First Name :";
RnameLabel.setAttribute("for", "name");
RnameLabelDiv.append(RnameLabel);
// name input
const RnameInputDiv = document.createElement('div');
const RnameInput = document.createElement('input');
RnameInput.setAttribute("type", "text");
RnameInput.setAttribute("name", "name");
RnameInput.setAttribute("id", "name");
RnameInput.setAttribute("placeholder", "eg: Nick");
RnameInputDiv.append(RnameInput);
//last name label
const RLastnameLabelDiv = document.createElement('div');
const RLastnameLabel = document.createElement('label');
RLastnameLabel.textContent = "Please Enter Your Last Name :";
RLastnameLabel.setAttribute("for", "lastname");
RLastnameLabelDiv.append(RLastnameLabel);
// last name input
const RLastnameInputDiv = document.createElement('div');
const RLastnameInput = document.createElement('input');
RLastnameInput.setAttribute("type", "text");
RLastnameInput.setAttribute("name", "lastname");
RLastnameInput.setAttribute("id", "lastname");
RLastnameInput.setAttribute("placeholder", "eg: Smith");
RLastnameInputDiv.append(RLastnameInput);
// Nickname label
const RNicknameLabelDiv = document.createElement('div');
const RNicknameLabel = document.createElement('label');
RNicknameLabel.textContent = "Please Enter Your Nickname :";
RNicknameLabel.setAttribute("for", "nickname");
RNicknameLabelDiv.append(RNicknameLabel);
// nickname input
const RNicknameInputDiv = document.createElement('div');
const RNicknameInput = document.createElement('input');
RNicknameInput.setAttribute("type", "text");
RNicknameInput.setAttribute("name", "nickname");
RNicknameInput.setAttribute("id", "nickname");
RNicknameInput.setAttribute("placeholder", "eg:deathstar123 ");
RNicknameInputDiv.append(RNicknameInput);
//  Age label
const RAgeLabelDiv = document.createElement('div');
const RAgeLabel = document.createElement('label');
RAgeLabel.textContent = "Please Enter Your Date of Birth :";
RAgeLabel.setAttribute("for", "age");
RAgeLabelDiv.append(RAgeLabel);
// age input
const RAgeInputDiv = document.createElement('div');
const RAgeInput = document.createElement('input');
RAgeInput.setAttribute("type", "date");
RAgeInput.setAttribute("name", "age");
RAgeInput.setAttribute("id", "age");
RAgeInputDiv.append(RAgeInput);
//  Gender label

//  E-mail label
const REmailLabelDiv = document.createElement('div');
const REmailLabel = document.createElement('label');
REmailLabel.textContent = "Please Enter Your e-mail :";
REmailLabel.setAttribute("for", "email");
REmailLabelDiv.append(REmailLabel);
// email input
const REmailInputDiv = document.createElement('div');
const REmailInput = document.createElement('input');
REmailInput.setAttribute("type", "email");
REmailInput.setAttribute("name", "email");
REmailInput.setAttribute("id", "email");
REmailInput.setAttribute("placeholder", "eg: deathstar@123.com");
REmailInputDiv.append(REmailInput);
// pw label
const RpwLabelDiv = document.createElement('div');
const RpwLabel = document.createElement('label');
RpwLabel.textContent = "Please Enter Your Password:";
RpwLabel.setAttribute("for", "pw");
RpwLabelDiv.append(RpwLabel);
// password input
const RpwInputDiv = document.createElement('div');
const RpwInput = document.createElement('input');
RpwInput.setAttribute("type", "password");
RpwInput.setAttribute("name", "pw");
RpwInput.setAttribute("id", "pw");
RpwInputDiv.append(RpwInput);

//gender
const RgenderDiv = document.createElement('select');
RgenderDiv.setAttribute("name", "gender_option")
const GenderOpt1 = document.createElement("option");
const GenderOpt2 = document.createElement("option");
const GenderOpt3 = document.createElement("option");
const GenderOpt4 = document.createElement("option");
GenderOpt1.setAttribute("name", "gender_option");
GenderOpt2.setAttribute("name", "gender_option");
GenderOpt3.setAttribute("name", "gender_option");
GenderOpt4.setAttribute("name", "gender_option");
GenderOpt1.setAttribute("value", "Prefer not");
GenderOpt2.setAttribute("value", "Female");
GenderOpt3.setAttribute("value", "Male");
GenderOpt4.setAttribute("value", "Other");
GenderOpt1.textContent = "Prefer not";
GenderOpt2.textContent = "Female";
GenderOpt3.textContent = "Male";
GenderOpt4.textContent = "Other";
RgenderDiv.setAttribute("id", "genderOption");
RgenderDiv.append(GenderOpt1,GenderOpt2,GenderOpt3,GenderOpt4)

const regSubmitDiv = document.createElement('div');
const regSubmit = document.createElement("button");
regSubmit.textContent = "Register";
regSubmit.setAttribute("type", "submit");
regSubmitDiv.append(regSubmit);
//append
RegisterForm.append(RnameLabelDiv,
    RnameInputDiv,
    RLastnameLabelDiv,
    RLastnameInputDiv,
    RNicknameLabelDiv,
    RNicknameInputDiv,
    RAgeLabelDiv,
    RAgeInputDiv,
    REmailLabelDiv,
    REmailInputDiv,
    RpwLabelDiv,
    RpwInputDiv,
    RgenderDiv,
    regSubmitDiv);
export default RegisterForm;