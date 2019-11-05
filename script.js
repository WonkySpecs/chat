window.onload = function() {
    console.log("Starting");
    var ws = new WebSocket("ws://127.0.0.1:5050/");
    ws.onopen = () => ws.send(create());
    ws.onmessage = function (msg) {
        if(msg.data === undefined) {
            // Error handling
            return
        }

        let message = msg.data
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
create = () => JSON.stringify({"message_type": "create"});
join = room_id => JSON.stringify({"message_type": "join", "room_id": room_id});
message = (room_id, msg) => JSON.stringify({"message_type": "message", "room_id": room_id, "data": msg});
