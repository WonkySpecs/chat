import asyncio
import websockets

HOST = '0.0.0.0'
PORT = 5050

async def echo(websocket, path):
    async for message in websocket:
        print(f"Received: {message}")
        await websocket.send(message)

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(echo, HOST, PORT))
    asyncio.get_event_loop().run_forever()
