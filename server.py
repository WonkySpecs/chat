import asyncio
import websockets
import json
from uuid import UUID, uuid4
from typing import Optional

from data import Room, Message, MessageType, Response, ResponseCode

HOST = '0.0.0.0'
PORT = 5050

rooms = {}
connections = {}

async def handle_message(message: str, user_id: UUID) -> Optional[Response]:
    try:
        message = Message(**json.loads(message))
    except ValueError:
        return "Invalid message format"

    if message.type == MessageType.CREATE_ROOM:
        print(f"Creating room")
        new_room = Room(creator=user_id)
        rooms[new_room.id] = new_room
        print(f"Room {new_room.id} created")
        return Response(data=new_room.id)
    elif message.type == MessageType.JOIN_ROOM:
        print(f"Joining room {message.room_id}")
        if message.room_id not in rooms:
            return Response(response_code=ResponseCode.NOT_FOUND, message=f"Room {message.room_id} does not exist")
        rooms[message.room_id].join(user_id)
        return Response();
    elif message.type == MessageType.MESSAGE:
        if message.room_id not in rooms:
            return Response(response_code=ResponseCode.NOT_FOUND, message=f"Room {message.room_id} does not exist")
        print(f"Message sent to room {message.room_id}")
        for user_id in rooms[message.room_id].members:
            print(f"To: {user_id}")
            await connections[user_id].send(message.data)
    return None
                        

async def connect(websocket, path):
    user_id = uuid4()
    connections[user_id] = websocket
    print(f"User {user_id} connected")
    async for message in websocket:
        print(f"Message from user {user_id}")
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
