import userListSocket from "./userList.js";
import { chatSocket } from "./chat.js";
const logoutUrl = location.origin + "/logout/";
console.log(logoutUrl);
const logoutHandler = function (e) {
    e.preventDefault();
    fetch(logoutUrl)
        .then(() => {
            // get cookie val
            const sessionCookie = document.cookie.split(";").find((el) => el.startsWith("session="));
            if (sessionCookie) {
                console.log("session cookie: ", sessionCookie);
                const cookieVal = sessionCookie.split("=")[1];
                console.log("cookie val: ", cookieVal);
                const profile = document.querySelector(".profile")
                while (profile.firstChild) {
                    profile.removeChild(profile.firstChild)
                }
                // remove cookie
                document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                // update user list after a user logout
                let chatPayload = {};
                chatPayload["label"] = "user-offline";
                chatPayload["cookie_value"] = cookieVal;
                console.log("logout chat sending: ", chatPayload);
                chatSocket.send(JSON.stringify(chatPayload));

                // update user list after a user logout
                let uListPayload = {};
                uListPayload["label"] = "logout-update";
                uListPayload["cookie_value"] = cookieVal;
                console.log("logout UL sending: ", uListPayload);
                userListSocket.send(JSON.stringify(uListPayload));

                // empty user list
                const uList = document.querySelector(".user-list");
                uList.textContent = "";

                // display login and reg
                const navbar = document.querySelector(".navbar")
                const screen = document.querySelector(".blankScreen")
                screen.style.height = "100%"
                let h1 = document.createElement("h1")
                h1.textContent = "Welcome to Live Forum"
                let h2 = document.createElement("h2")
                h2.textContent = "Please SignIn Or Register By Clicking Any Of The Above Option"
                screen.append(h1, h2)
                navbar.children[0].style.display = "block"
                navbar.children[1].style.display = "block"
                navbar.children[2].style.display = "none"
            }
        })
}


const logoutBtn = document.createElement("button");
logoutBtn.textContent = "Logout";
const logoutDiv = document.querySelector("#logout");
logoutBtn.addEventListener("click", logoutHandler);
// window.addEventListener("beforeunload", alert("Please logout before closing"));
window.addEventListener('beforeunload', (e) => {
    const profileid = document.querySelector(".Profileid")
    if (profileid) {
        // logoutHandler;
    // alert(`You have been logged out. Please login again to continue`);
    e.returnValue = `Please logout before you leave`;
    }
  });
export default logoutBtn;