const userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
const chatBox = document.querySelector(".col-1")
const msgArea = document.querySelector(".msgArea")
let usID
let open = false
let loadMsg = false
document.addEventListener("DOMContentLoaded", function (e) {
    // userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
    console.log("JS attempt to connect to user list");
    userListSocket.onopen = () => console.log("user list connected");
    userListSocket.onclose = () => console.log("Bye user list");
    userListSocket.onerror = (err) => console.log("user list ws Error!");
    userListSocket.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        console.log({ resp });
        if (resp.label === "update") {
            console.log(resp.online_users);
            const uList = document.querySelector(".user-list");
            // remove list item
            uList.textContent = "";
            // add new list item
            for (const { nickname, status, userID, msgcheck, curuser } of resp.online_users) {
                if (curuser == false) {
                    const nicknameItem = document.createElement("li");
                    const chatBoxButton = document.createElement("button")
                    chatBoxButton.classList = "nameButtons"
                    const chatBoxForm = document.createElement("form")
                    chatBoxForm.addEventListener("submit", showChatHandler)
                    chatBoxButton.setAttribute("type", "submit")
                    chatBoxButton.value = userID
                    // chatBoxButton.type= "hidden"

                    chatBoxButton.addEventListener("click", function (e) {
                        if (open == false) {
                            open = true
                            usID = chatBoxButton.value
                            chatBox.style.display = "block"
                            window.onclick = function (event) {
                                console.log(event.target.className)
                                open = false
                                if (event.target.className == "closeChat") {
                                    chatBox.style.display = "none"
                                    loadMsg = false
                                    while (msgArea.firstChild) {
                                        msgArea.removeChild(msgArea.firstChild)
                                    }
                                }
                            }
                        }
                        if (open == true) {
                            usID = chatBoxButton.value
                            loadMsg= false
                            while (msgArea.firstChild) {
                                msgArea.removeChild(msgArea.firstChild)
                            }
                        }

                    })
                    chatBoxForm.append(chatBoxButton)
                    chatBoxButton.textContent = `${nickname}`;
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
            }

            const closeChatBox = document.createElement("button")
            closeChatBox.textContent = "End Chat"
            closeChatBox.classList = "closeChat"
            chatBox.append(closeChatBox)

        }
        if (resp.label == "chatBox") {
            if (msgArea.firstChild == null) {
                const loadBut = document.createElement("button")
                loadBut.classList = "loadMsg"
                loadBut.addEventListener("click",  showChatHandler)
                loadBut.textContent = "Load 10 more msg"
                msgArea.append(loadBut)
                loadMsg= true
            }
            let js = JSON.parse(resp.content)
            if (js != null) {
                console.log("check content:", js)
                for (let i = 0; i < js.length; i++) {
                    let singleMsg = document.createElement("div")
                    let msgContent = document.createElement("p")
                    msgContent.classList = "msg-text"
                    msgContent.textContent = js[i].msgInfo.content
                    if (js[i].msgInfo.right_side == true) {
                        singleMsg.classList = "msg-row2"
                    } else {
                        singleMsg.classList = "msg-row"
                    }
                    singleMsg.append(msgContent)
                    msgArea.append(singleMsg)


                }
            }
        }
    }
})

const showChatHandler = function (e) {
    e.preventDefault();
    let payloadObj = {}
    console.log("usID =", usID)
    console.log("loadmsg", loadMsg)
    payloadObj["label"] = "createChat";
    payloadObj["userID"] = 1 /* after login change to loggedUserID */
    payloadObj["contactID"] = parseInt(usID)
    payloadObj["loadMsg"] = loadMsg
    userListSocket.send(JSON.stringify(payloadObj));
};
// const chatBox = document.createElement("form");
// chatBox.id = "chat-form"
export default userListSocket;