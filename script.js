window.onload = function() {
    console.log("Starting");
    ui = loadUI();
    rooms = {}
    activeRoom = null
    ui.sendBtn.onclick = ev => ws.send(buildMessage.message(activeRoom.id, ui.messageInput.value));
    ws = new WebSocket("ws://127.0.0.1:5050/");
    ws.onopen = () => ws.send(buildMessage.create());
    ws.onmessage = function (msg) {
        console.log(msg);
        if(msg.data === undefined) {
	    console.log("Message without data received", msg);
            return
        }

        let message = JSON.parse(msg.data);
        switch(message.type) {
            case "message":
                messageReceived(message, ui, rooms, activeRoom);
                break;
            case "joined":
                room = joinedRoom(message, ui);
                rooms[room.id] = room;
                break;
            case "created":
                room = createdRoom(message, ui);
                rooms[room.id] = room;
                activeRoom = room;
                break;
            default:
                console.log("Unkown message type: " + message.type);
        }
    };
}

function messageReceived(msg, ui, rooms, activeRoom) {
    // Get message window from container
    // Format text
    // Add message to window
    // Notification on tab
    console.log("Message received", msg);
    if(!rooms[msg.room_id]) {
        throw "Messsage received for a room client is not in, fix this";
    }
    rooms[msg.room_id].pushMessage(msg.data);
    console.log(rooms);
    console.log(activeRoom);
    if(msg.room_id === activeRoom.id) {
        setMessageWindowContents(ui.messageWindow, rooms[msg.room_id].messages);
    }
}

function joinedRoom(msg, ui) {
    console.log("Joining room", msg);
    let newTab = document.createElement("button");
    newTab.textContent = msg.room_id;
    ui.tabContainer.appendChild(newTab);
    return new Room(msg.room_id, newTab, bindMessageTabWrapper(ui.messageWindow));
}

function createdRoom(msg, ui) {
    console.log("Created room", msg);
    return joinedRoom(msg, ui);
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
    console.log("Setting message window contents");
    messageWindow.innerHTML = "";
    messages.forEach(function(msg) {
        msgElement = document.createElement("p");
        msgElement.textContent = msg;
        messageWindow.appendChild(msgElement);
    });
}
