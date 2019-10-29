import random
import string
from enum import Enum, auto
from typing import Optional


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


class Response:
    def __init__(self, response_code: ResponseCode=ResponseCode.OK, message: Optional[str]=None, data: Optional[str] = None):
        self.response_code_value = response_code.value
        self.message = message if message else response_code.default_message()
        self.data = data


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
