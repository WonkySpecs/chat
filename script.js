window.onload = function() {
    console.log("Starting");

    clientState = {
        rooms: {},
        activeRoom: null,
    };

    ui = loadUI();
    ui.sendBtn.onclick = ev => {
        if(clientState.activeRoom) {
            ws.send(
                buildMessage.message(
                    clientState.activeRoom.id, ui.messageInput.value));
        } else {
            ui.messageWindow.textContent = "Join room before sending a message";
        }};
    ui.createBtn.onclick = ev => ws.send(buildMessage.create());
    ui.joinBtn.onclick = ev => ws.send(buildMessage.join(ui.joinIdInput.value));

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
                messageReceived(message, ui, clientState);
                break;
            case "joined":
                joinedRoom(message, ui, clientState);
                break;
            case "created":
                createdRoom(message, ui, clientState);
                break;
            default:
                console.log("Unkown message type: " + message.type);
        }
    };
}

function messageReceived(msg, ui, clientState) {
    console.log("Message received", msg);
    if(!clientState.rooms[msg.room_id]) {
        console.log(clientState);
        throw "Messsage received for a room client is not in, fix this";
    }
    room = clientState.rooms[msg.room_id];
    room.pushMessage(msg.data);
    if(msg.room_id === clientState.activeRoom.id) {
        setMessageWindowContents(ui.messageWindow, room.messages);
    }
}

function joinedRoom(msg, ui, clientState) {
    console.log("Joining room", msg);
    let newTab = document.createElement("button");
    newTab.textContent = msg.room_id;
    ui.tabContainer.appendChild(newTab);
    newRoom = new Room(
        msg.room_id,
        newTab,
        bindMessageTabWrapper(ui.messageWindow),
        clientState);
    clientState.rooms[newRoom.id] = newRoom;
    clientState.activeRoom = newRoom;
    setMessageWindowContents(ui.messageWindow, []);
}

function createdRoom(msg, ui, clientState) {
    console.log("Creating room", msg);
    return joinedRoom(msg, ui, clientState);
}

function loadUI() {
    sendBtn = document.querySelector("#messageInputContainer button");
    messageInput = document.querySelector("#messageInputContainer input");
    messageInput.addEventListener("keyup", ev => {
        if(ev.key != "Enter") {
            return;
        }
        sendBtn.click();
    });

    joinIdInput.addEventListener("keyup", ev => {
        if(ev.key != "Enter") {
            return;
        }
        joinBtn.click();
    });

    return {
        sendBtn: sendBtn,
        messageInput: messageInput,
        tabContainer: document.getElementById("chatTabContainer"),
        members: document.getElementById("chatMembers"),
        messageWindow: document.getElementById("messageWindowContainer"),
        createBtn: document.getElementById("createBtn"),
        joinBtn: document.getElementById("joinBtn"),
        joinIdInput: document.getElementById("joinIdInput"),
    }
}

buildMessage = {
    create: () => JSON.stringify({"message_type": "create"}),
    join: room_id => JSON.stringify({"message_type": "join", "room_id": room_id}),
    message: (room_id, msg) => JSON.stringify({"message_type": "message", "room_id": room_id, "data": msg}),
}

class Room {
    constructor(id, tab, bindMessageTab, clientState) {
        this.id = id;
        this.tab = tab;
        this.messages = [];
        this.tab.onclick = ev => {
            bindMessageTab(this.messages);
            clientState.activeRoom = this;
        }
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
