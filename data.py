import random
import string
from enum import Enum, auto
from typing import Optional, Union


class MessageType(Enum):
    JOIN_ROOM = "join"
    CREATE_ROOM = "create"
    MESSAGE = "message"
    JOINED = "joined"
    CREATED = "created"
    ERROR = "error"

    @staticmethod
    def from_str(s: str):
        for mt in MessageType:
            if mt.value == s:
                return mt
        raise ValueError(f"Unkown message type '{s}'")


class Message:
    def __init__(self, message_type=Union[MessageType, str], data=None, room_id=None):
        if isinstance(message_type, str):
            self.type = message_type
        else:
            self.type = message_type.value
        self.data = data
        self.room_id = room_id

class ResponseCode(Enum):
    """
    Using HTTP response codes until a better alternative presents itself
    """
    OK = 200
    BAD_REQUEST = 400
    FORBIDDEN = 403
    NOT_FOUND = 404

    def default_message(self):
        if self == ResponseCode.OK:
            return "Success"
        elif self == ResponseCode.BAD_REQUEST:
            return "Bad request"
        elif self == ResponseCode.FORBIDDEN:
            return "Forbidden"
        elif self == ResponseCode.NOT_FOUND:
            return "Resource not found"

class ErrorMessage(Message):
    def __init__(self, data=None, room_id=None, response_code=None):
        super().__init__(message_type=MessageType.ERROR, data=data, room_id=room_id)
        self.response_code = response_code

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
