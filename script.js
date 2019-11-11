window.onload = function() {
    console.log("Starting");

    clientState = {
        rooms: {},
        activeRoom: null,
    };

    ui = loadUIElements();
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

    stateSync = buildStateSync(ui, clientState);

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
                stateSync.receiveMessage(message.room_id, message.data);
                break;
            case "joined":
                stateSync.joinRoom(message.room_id);
                break;
            case "created":
                stateSync.joinRoom(message.room_id);
                break;
            default:
                console.log("Unkown message type: " + message.type);
        }
    };
}

function buildStateSync(ui, clientState) {
    return {
        _ui: ui,
        _state: clientState,
        joinRoom: function(room_id) {
            console.log("Joining room " + room_id);
            let newTab = document.createElement("button");
            newTab.textContent = room_id;
            newTab.onclick = ev => this.changeActiveRoom(room_id);
            this._ui.tabContainer.appendChild(newTab);
            newRoom = new Room(room_id);
            this._state.rooms[newRoom.id] = newRoom;
            this.changeActiveRoom(room_id);
        },
        changeActiveRoom: function(room_id) {
            if(this._state.rooms[room_id] === undefined) {
                throw "Tried to switch to room " + room_id + " which is not a room";
            }
            newActiveRoom = this._state.rooms[room_id];
            this._state.activeRoom = newActiveRoom;
            this._setMessageWindowContents(newActiveRoom);
        },
        _setMessageWindowContents: function(room) {
            this._ui.messageWindow.innerHTML = "";
            room.messages.forEach(msg => this._displayNewMessage(this._ui.messageWindow, msg));
        },
        _displayNewMessage: function(messageWindow, message) {
            msgElement = document.createElement("p");
            msgElement.textContent = message;
            messageWindow.appendChild(msgElement);
        },
        receiveMessage: function(room_id, message) {
            if(this._state.rooms[room_id] === undefined) {
                throw "Received message for room " + room_id + " which is not a room";
            }
            room = this._state.rooms[room_id];
            room.pushMessage(message);
            if(room_id === this._state.activeRoom.id) {
                this._displayNewMessage(this._ui.messageWindow, message);
            }
        }
    }
}

function loadUIElements() {
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
        this.messages = [];
    }

    pushMessage(msg) {
        this.messages.push(msg);
    }
}
