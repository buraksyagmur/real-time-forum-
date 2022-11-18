const userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
const chatBox = document.querySelector(".col-1")
document.addEventListener("DOMContentLoaded", function(e) {
    // userListSocket = new WebSocket("ws://localhost:8080/userListWs/")
    console.log("JS attempt to connect to user list");
    userListSocket.onopen = () => console.log("user list connected");
    userListSocket.onclose = () => console.log("Bye user list");
    userListSocket.onerror = (err) => console.log("user list ws Error!");
    userListSocket.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        console.log({resp});
        if (resp.label === "update") {
            console.log(resp.online_users);
            const uList = document.querySelector(".user-list");
            // remove list item
            uList.textContent = "";
            // add new list item
            for (const {nickname, status, userID} of resp.online_users) {
                const nicknameItem = document.createElement("li");
                const chatBoxButton = document.createElement("button")
                chatBoxButton.value =  userID
                // chatBoxButton.type= "hidden"
                chatBoxButton.addEventListener("click", function (e) {
                    chatBox.style.display = "block"
                   showChatHandler
                   console.log("try to send to backend")
                } )
                chatBoxButton.textContent = `${nickname} ${status}`;
                nicknameItem.append(chatBoxButton)
                uList.append(nicknameItem);
            }
        }
    }
})

const showChatHandler = function (e) {
    e.preventDefault();
    let payloadObj = {}
    payloadObj["label"] = "createChat";
    payloadObj["userID"] = 4
    payloadObj["contactID"] = chatBoxButton.value
    userListSocket.send(JSON.stringify(payloadObj));
};

// const chatBox = document.createElement("form");
// chatBox.id = "chat-form"

export default userListSocket;