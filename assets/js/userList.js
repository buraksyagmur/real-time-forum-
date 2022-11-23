const userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
const chatBox = document.querySelector(".col-1")
const msgArea = document.querySelector(".msgArea")
let usID
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
            for (const { nickname, status, userID } of resp.online_users) {
               
                const nicknameItem = document.createElement("li");
                const chatBoxButton = document.createElement("button")
                const chatBoxForm = document.createElement("form")
                chatBoxForm.addEventListener("submit", showChatHandler)
                chatBoxButton.setAttribute("type", "submit")
                chatBoxButton.value = userID
                // chatBoxButton.type= "hidden"
                chatBoxButton.addEventListener("click", function (e) {
                    usID = chatBoxButton.value
                    chatBox.style.display = "block"
                })
                chatBoxForm.append(chatBoxButton)
                chatBoxButton.textContent = `${nickname}`;
                if (status == false){
                    nicknameItem.classList= "offline"
                }else {
                    nicknameItem.classList = "online"
                }
                nicknameItem.append(chatBoxForm)
                uList.append(nicknameItem);
            }
        }else if (resp.label== "chatBox"){
            let js = JSON.parse(resp.content)
            console.log("check content:",js)
            for (let  i= 0 ; i < js.length; i++ ){
                let singleMsg= document.createElement("div")
                let msgContent = document.createElement("p")
                msgContent.classList= "msg-text"
                msgContent.textContent = js[i].msgInfo.content
                if (js[i].msgInfo.right_side == true){
                    singleMsg.classList= "msg-row2"
                }else {
                    singleMsg.classList= "msg-row"
                }
                singleMsg.append(msgContent)
                msgArea.append(singleMsg)
                
               
            }  
        }
    }
})

const showChatHandler = function (e) {
    e.preventDefault();
    let payloadObj = {}
    payloadObj["label"] = "createChat";
    payloadObj["userID"] = 1 /* after login change to loggedUserID */
    payloadObj["contactID"] = 2
    userListSocket.send(JSON.stringify(payloadObj));
};

// const chatBox = document.createElement("form");
// chatBox.id = "chat-form"

export default userListSocket;