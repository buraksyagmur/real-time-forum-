// import throttle from '/assets/js/node_modules/lodash-es/throttle.js';
import { chatSocket } from "./chat.js";
const userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
const chatBox = document.querySelector(".col-1")
const msgArea = document.querySelector(".msgArea")
let usID
let open = false
let loadMsg = false

function throttle(fn, wait) {
    let time = Date.now();
    return function () {
        if (time + wait < Date.now()) {
            fn();
            time = Date.now();
        }
    }
}

document.addEventListener("DOMContentLoaded", function (e) {
    // userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
    console.log("JS attempt to connect to user list");
    userListSocket.onopen = () => console.log("user list connected");
    userListSocket.onclose = () => console.log("Bye user list");
    userListSocket.onerror = (err) => console.log("user list ws Error!");
    userListSocket.onmessage = (msg) => {
        let arrayOfUsers = []
        let arr
        const resp = JSON.parse(msg.data);
        if (resp.label === "update") {
            console.log(resp.online_users);
            const uList = document.querySelector(".user-list");
            // remove list item
            uList.textContent = "";
            // add new list item
            for (const { nickname, status, userID, msgcheck, noti } of resp.online_users) {

                arrayOfUsers.push(userID)
                const nicknameItem = document.createElement("li");
                nicknameItem.id = "li"+userID
                const chatBoxButton = document.createElement("button")
                chatBoxButton.classList = "nameButtons"
                const chatBoxForm = document.createElement("form")
                chatBoxForm.addEventListener("submit", showChatHandler)
                chatBoxButton.setAttribute("type", "submit")
                chatBoxButton.value = userID
                chatBoxButton.id = `ContactID-${userID}`
                chatBoxButton.addEventListener("click", function (e) {
                    if (open == false) {
                        open = true
                        usID = chatBoxButton.value
                        chatBox.id = `chatbox-${usID}`
                        chatBox.style.display = "block"
                        window.onclick = function (event) {
                            open = false
                            if (event.target.className == "closeChat") {
                                chatBox.style.display = "none"
                                chatBox.id= "chatbox"
                                loadMsg = false
                                while (msgArea.firstChild) {
                                    msgArea.removeChild(msgArea.firstChild)
                                }
                            }
                        }
                    }
                    if (open == true) {
                        usID = chatBoxButton.value
                        chatBox.id = `chatbox-${usID}`
                        loadMsg = false
                        while (msgArea.firstChild) {
                            msgArea.removeChild(msgArea.firstChild)
                        }
                    }

                })
                chatBoxForm.append(chatBoxButton)
                let userNick = document.querySelector(".Profilenickname") // reg userNick is null
                chatBoxButton.textContent = `${nickname}`;
                if (chatBoxButton.textContent == userNick.textContent) {
                    arr = noti.split(",")
                    nicknameItem.style.display = "none"
                }
                if (status == false) {
                    nicknameItem.classList = "offline"
                } else {
                    nicknameItem.classList = "online"
                }
                if (msgcheck == false) {
                    nicknameItem.classList.add("alphab")
                }
                nicknameItem.append(chatBoxForm)
                uList.append(nicknameItem);


            }
            let not = checkArr(arr, arrayOfUsers)
            console.log("NOT ARRAY", not, "arr:", arr, "arrayOfUsers", arrayOfUsers)
            if (not.length > 0) {
                notiDisplay(not)

            }
            // if button already exists do not create another

            if (document.querySelector(".closeChat")) {

            } else {
                const closeChatBox = document.createElement("button")
                closeChatBox.textContent = "End Chat"
                closeChatBox.classList = "closeChat"
                chatBox.append(closeChatBox)
            }


        }
        if (resp.label == "chatBox") {
            if (msgArea.firstElementChild == null) {
                msgArea.addEventListener("scroll", throttle(loadMsgCallback(), 250));
            }
            let js = JSON.parse(resp.content)
            if (js != null) {
                for (let i = 0; i < js.length; i++) {
                    let singleMsg = document.createElement("div")
                    let msgContent = document.createElement("p")
                    let timeOfMsg = document.createElement("p")
                    msgContent.classList = "msg-text"
                    timeOfMsg.classList = "timeofmsg"
                    timeOfMsg.textContent = js[i].msgInfo.message_time
                    timeOfMsg.style.fontSize = "9px"
                    msgContent.textContent = js[i].msgInfo.content
                    if (js[i].msgInfo.right_side == true) {
                        singleMsg.classList = "msg-row2"
                    } else {
                        singleMsg.classList = "msg-row"
                    }
                    singleMsg.append(msgContent)
                    singleMsg.append(timeOfMsg)
                    msgArea.insertBefore(singleMsg, msgArea.firstChild)
                    // msgArea.append(singleMsg)
                }
            }
            if (document.querySelector(".chatInput") == null) {
                console.log("creating chat input")
                const chatInput = document.createElement("input")
                chatInput.setAttribute("type", "text")
                const chatForm = document.createElement("form")
                const submitChat = document.createElement("button")
                chatForm.addEventListener("submit", SubChatHandler)
                submitChat.setAttribute("type", "submit")
                submitChat.classList = "submitMsg"
                submitChat.textContent = "submit msg"
                chatInput.classList = "chatInput"
                chatForm.append(chatInput, submitChat)
                chatBox.append(chatForm)
            } else {
                console.log("chatinput already exist")
            }
        }
    }
})
let prevScrollTop = 0;
const loadMsgCallback = function () {
    return function () {
        // msgArea.addEventListener("scroll", function(e) {
        // console.log("scrolling");
        // console.log(`msgArea.scrollTop = ${msgArea.scrollTop} load msg when value === 0 `);
        if (prevScrollTop < msgArea.scrollTop) {
            console.log("scrolling down");
        } else if (prevScrollTop > msgArea.scrollTop) {
            console.log("scrolling up");
            if (msgArea.scrollTop <= 2) {
                // console.log(`Loading msg ... msgArea.scrollTop = ${msgArea.scrollTop} load msg when value <= 20 `);
                loadMsg = true
                loadPrevMsgsHandler();
            }
        }
        prevScrollTop = msgArea.scrollTop;
    }
}

const loadPrevMsgsHandler = function () {
    let payloadObj = {};
    let profileid = document.querySelector(".Profileid")
    payloadObj["label"] = "createChat";
    payloadObj["userID"] = parseInt(profileid.textContent) /* after login change to loggedUserID */
    payloadObj["contactID"] = parseInt(usID)
    payloadObj["loadMsg"] = loadMsg
    userListSocket.send(JSON.stringify(payloadObj));
};

const showChatHandler = function (e) {
    e.preventDefault();
    let payloadObj = {}
    let profileid = document.querySelector(".Profileid")
    payloadObj["label"] = "createChat";
    payloadObj["userID"] = parseInt(profileid.textContent) /* after login change to loggedUserID */
    payloadObj["contactID"] = parseInt(usID)
    payloadObj["loadMsg"] = loadMsg
    // payloadObj["loadMsg"] = true
    userListSocket.send(JSON.stringify(payloadObj));
    let chatPayloadObj = {};
    chatPayloadObj["label"] = "createChat";
    chatPayloadObj["sender_id"] = parseInt(profileid.textContent)/* after login change to loggedUserID */
    chatPayloadObj["receiver_id"] = parseInt(usID)
    chatSocket.send(JSON.stringify(chatPayloadObj));
};
const SubChatHandler = function (e) {
    e.preventDefault();
    let chatPayloadObj = {};
    let profileid = document.querySelector(".Profileid")
    let chatInput = document.querySelector(".chatInput")
    let msgrow = document.createElement("div")
    let msgtext = document.createElement("p")
    msgrow.className = "msg-row2"
    msgtext.className = "msg-text"
    msgtext.textContent = chatInput.value
    let userlist = document.querySelector(".user-list")
    let targetUser = document.querySelector(`#li${usID}`)
    userlist.insertBefore(targetUser, userlist.firstChild)
    msgrow.append(msgtext)
    msgArea.append(msgrow)
    // ***********************NEED TO UPDATE USERLIST *********************
    // let userlist = document.querySelector(".user-list")
    // while (userlist.firstChild) {
    //     console.log("userlist,", userlist.length)
    //     userlist.removeChild(userlist.firstChild)
    // }
    chatPayloadObj["label"] = "chat";
    chatPayloadObj["sender_id"] = parseInt(profileid.textContent)/* after login change to loggedUserID */
    chatPayloadObj["receiver_id"] = parseInt(usID)
    chatPayloadObj["content"] = chatInput.value
    chatInput.value = ""
    chatSocket.send(JSON.stringify(chatPayloadObj));

}
function checkArr(arr, userArr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(arr[i])
    }
    const intersection = arr.filter(element => userArr.includes(element));
    return intersection
}
function notiDisplay(arr) {

    for (let i = 0; i < arr.length; i++) {
        let x = document.querySelector("#ContactID-" + arr[i])
        if (x != null) {
            let k = document.querySelector(`#chatbox-${arr[i]}`)
            if (k == null) {
                x.classList.add("notif")
            }
        }
    }
}

export default userListSocket;