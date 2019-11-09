import asyncio
import websockets
import json
from uuid import UUID, uuid4
from typing import Optional

from data import Room, Message, MessageType, ErrorMessage, ResponseCode

HOST = '0.0.0.0'
PORT = 5050

rooms = {}
connections = {}

async def handle_message(message: str, user_id: UUID) -> Optional[Message]:
    try:
        message = Message(**json.loads(message))
    except ValueError:
        return ErrorMessage(response_code=ResponseCode.BAD_REQUEST, data="Invalid message format")

    if message.type == MessageType.CREATE_ROOM.value:
        print(f"Creating room")
        new_room = Room(creator=user_id)
        rooms[new_room.id] = new_room
        print(f"Room {new_room.id} created")
        return Message(message_type=MessageType.CREATED, room_id=new_room.id)

    elif message.type == MessageType.JOIN_ROOM.value:
        print(f"Joining room {message.room_id}")
        if message.room_id not in rooms:
            return ErrorMessage(response_code=ResponseCode.NOT_FOUND, message=f"Room {message.room_id} does not exist")
        rooms[message.room_id].join(user_id)
        return Message(message_type=MessageType.JOINED, room_id=message.room_id)

    elif message.type == MessageType.MESSAGE.value:
        if message.room_id not in rooms:
            return ErrorMessage(response_code=ResponseCode.NOT_FOUND, message=f"Room {message.room_id} does not exist")
        print(f"Message sent to room {message.room_id}")
        response_message = json.dumps(Message(message_type=MessageType.MESSAGE, room_id=message.room_id, data=message.data).__dict__)
        for user_id in rooms[message.room_id].members:
            print(f"To: {user_id}")
            await connections[user_id].send(response_message)
        return None
    return ErrorMessage(response_code=ResponseCode.BAD_REQUEST, message=f"Unkown message_type {message.type}")

async def connect(websocket, path):
    user_id = uuid4()
    connections[user_id] = websocket
    print(f"User {user_id} connected")
    async for message in websocket:
        print(f"Message from user {user_id}: {message}")
        response = await handle_message(message, user_id)

        if response:
            res_str: str = json.dumps(response.__dict__)
            print(f"Response to {user_id}: {res_str}")
            await websocket.send(res_str)
    print(f"User {user_id} disconnected")

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(connect, HOST, PORT))
    asyncio.get_event_loop().run_forever()
