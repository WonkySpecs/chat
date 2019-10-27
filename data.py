import random
import string
from enum import Enum, auto


class MessageType(Enum):
    JOIN_ROOM = "join"
    CREATE_ROOM = "create"
    MESSAGE = "message"

    @staticmethod
    def from_str(s: str):
        for mt in MessageType:
            if mt.value == s:
                return mt
        raise ValueError(f"Unkown message type '{s}'")


class Message:
    def __init__(self, message_type=None, data=None, room_id=None):
        self.type = MessageType.from_str(message_type)
        self.data = data
        self.room_id = room_id


class Room:
    def __init__(self, creator=None):
        self.id = Room.generate_id()
        self.members = [creator]

    def join(self, new_user):
        self.members.append(new_user)

    @staticmethod
    def generate_id():
        chars = string.ascii_uppercase + string.digits
        return "".join([random.choice(chars) for l in range(6)])
