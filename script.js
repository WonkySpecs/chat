window.onload = function() {
    console.log("Starting");
    ui = loadUI();
    console.log(ui);
    ui.sendBtn.onclick = ev => console.log(ui.messageInput.value);
    var ws = new WebSocket("ws://127.0.0.1:5050/");
    ws.onopen = () => ws.send(buildMessage.join("4WSUSO"));
    ws.onmessage = function (msg) {
        console.log(msg);
        if(msg.data === undefined) {
	    console.log("Message without data received", msg);
            return
        }

        let message = JSON.parse(msg.data);
        switch(message.type) {
            case "message":
                messageReceived(message, ui);
                break;
            case "joined":
                room = joinedRoom(message, ui);
                break;
            case "created":
                createdRoom(message, ui);
                break;
            default:
                console.log("Unkown message type: " + message.type);
        }
    };
}

function messageReceived(msg, ui) {
    // Get message window from container
    // Format text
    // Add message to window
    // Notification on tab
    console.log("Message received", msg);
}

function joinedRoom(msg, ui) {
    console.log("Joining room", msg);
    newTab = 123;
    return new Room(msg.room_id, newTab, bindMessageTabWrapper(ui.messageWindow));
}

function createdRoom(msg, ui) {
    // Same as joined
    console.log("Created room", msg);
}

function loadUI() {
    sendBtn = document.querySelector("#messageInputContainer button");
    messageInput = document.querySelector("#messageInputContainer input");
    return {
        sendBtn: sendBtn,
        messageInput: messageInput,
        tabContainer: document.getElementById("chatTabContainer"),
        members: document.getElementById("chatMembers"),
        messageWindow: document.getElementById("messageWindowContainer")
    }
}

buildMessage = {
    create: () => JSON.stringify({"message_type": "create"}),
    join: room_id => JSON.stringify({"message_type": "join", "room_id": room_id}),
    message: (room_id, msg) => JSON.stringify({"message_type": "message", "room_id": room_id, "data": msg}),
}

class Room {
    constructor(id, tab, bindMessageTab) {
        this.id = id;
        this.tab = tab;
        this.messages = [];
        this.tab.onclick = bindMessageTab(this.messages)
    }

    pushMessage(msg) {
        this.messages.push(msg);
    }
}

function bindMessageTabWrapper(messageWindow) {
    return function(messages) {
        setMessageWindowContents(messageWindow, messages);
    }
}

function setMessageWindowContents(messageWindow, messages) {
    messageWindow.innerHTML = "";
    messages.forEach(function(msg) {
        msgElement = document.createNode("span");
        msgElement.textContent = msg;
        messageWindow.appendChild(msgElement);
    });
}
