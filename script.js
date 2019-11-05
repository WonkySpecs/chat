window.onload = function() {
    console.log("Starting");
    ui = loadUI();
    console.log(ui);
    ui.sendBtn.onclick = ev => console.log(ui.messageInput.value);
    var ws = new WebSocket("ws://127.0.0.1:5050/");
    ws.onopen = () => ws.send(create());
    ws.onmessage = function (msg) {
        console.log(msg);
        if(msg.data === undefined) {
            // Error handling
            return
        }

        let message = JSON.parse(msg.data);
        switch(message.type) {
            case "message":
                messageReceived(message);
                break;
            case "joined":
                joinedRoom(message);
                break;
            case "created":
                createdRoom(message);
                break;
            default:
                console.log("Unkown message type: " + message.type);
        }
    };
}

function messageReceived(msg) {
    // Get message window from container
    // Format text
    // Add message to window
    // Notification on tab
    console.log("Message received", msg);
}

function joinedRoom(msg) {
    // Create new tab for room
    // Switch to it + repopulate members?
    console.log("Joining room", msg);
}

function createdRoom(msg) {
    // Same as joined
    console.log("Created room", msg);
}

function loadUI() {
    sendBtn = document.querySelector("#messageInputContainer button");
    messageInput = document.querySelector("#messageInputContainer input");
    return {
        "sendBtn": sendBtn,
        "messageInput": messageInput,
        "tabContainer": document.getElementById("chatTabContainer"),
        "members": document.getElementById("chatMembers"),
        "messageWindows": document.getElementById("messageWindowContainer")
    }
}
create = () => JSON.stringify({"message_type": "create"});
join = room_id => JSON.stringify({"message_type": "join", "room_id": room_id});
message = (room_id, msg) => JSON.stringify({"message_type": "message", "room_id": room_id, "data": msg});
