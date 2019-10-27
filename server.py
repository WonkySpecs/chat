import asyncio
import websockets
import uuid
import json

from data import Room, Message, MessageType

HOST = '0.0.0.0'
PORT = 5050

rooms = {}
connections = {}

async def handle_message(message, user_id):
    try:
        message = Message(**json.loads(message))
    except ValueError:
        return "Invalid message format"

    if message.type == MessageType.CREATE_ROOM:
        print(f"Creating room")
        new_room = Room(creator=user_id)
        rooms[new_room.id] = new_room
        print(f"Room {new_room.id} created")
    elif message.type == MessageType.JOIN_ROOM:
        print(f"Joining room {message.data}")
        if message.data not in rooms:
            return f"Room {message.data} does not exist" 
        rooms[message.data].join(user_id)
    elif message.type == MessageType.MESSAGE:
        if message.room_id not in rooms:
            return f"Room {message.room_id} does not exist"
        for user_id in rooms[message.room_id].members:
            await connections[user_id].send(message.data)
                        

async def connect(websocket, path):
    user_id = uuid.uuid4()
    connections[user_id] = websocket
    print(f"User {user_id} connected")
    async for message in websocket:
        print(f"Message from user {user_id}")
        response = handle_message(message, user_id)

        if response:
            await websocket.send(f"{response}")
    print(f"User {user_id} disconnected")

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(connect, HOST, PORT))
    asyncio.get_event_loop().run_forever()
