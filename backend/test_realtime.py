import asyncio
import json
import urllib.request
import urllib.parse
import websockets

BASE_URL = "http://127.0.0.1:8000/api"

def http_post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def http_get(endpoint, token):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        headers={'Authorization': f'Bearer {token}'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

async def test_full_flow():
    print("[1] Logging in as Madhan...")
    madhan_auth = http_post("/auth/login/", {"username": "madhan", "password": "password123"})
    madhan_token = madhan_auth['access']
    print(f"    Madhan logged in! Token received: {madhan_token[:20]}...")

    print("[2] Logging in as Santhosh...")
    santhosh_auth = http_post("/auth/login/", {"username": "santhosh", "password": "password123"})
    santhosh_token = santhosh_auth['access']
    print(f"    Santhosh logged in! Token received: {santhosh_token[:20]}...")

    print("[3] Testing User Search for 'santhosh'...")
    search_res = http_get("/users/search/?q=santhosh", madhan_token)
    print(f"    Madhan found {len(search_res)} users matching 'santhosh'.")
    assert len(search_res) >= 1

    print("[4] Testing Conversations list...")
    conversations = http_get("/chat/conversations/", madhan_token)
    print(f"    Madhan has {len(conversations)} conversations.")
    assert len(conversations) >= 1
    
    santhosh_conv = next(c for c in conversations if c['other_user']['username'] == 'santhosh')
    conv_id = santhosh_conv['id']
    print(f"    Found conversation with Santhosh: ID #{conv_id}")

    print(f"[5] Testing Real-Time WebSocket for Conversation #{conv_id}...")
    madhan_ws_url = f"ws://127.0.0.1:8000/ws/chat/{conv_id}/?token={madhan_token}"
    santhosh_ws_url = f"ws://127.0.0.1:8000/ws/chat/{conv_id}/?token={santhosh_token}"

    async with websockets.connect(madhan_ws_url) as madhan_ws, websockets.connect(santhosh_ws_url) as santhosh_ws:
        print("    Both Madhan and Santhosh connected via WebSockets!")

        test_msg_text = "Hi Madhan! Real-time message from Santhosh."
        print(f"    Santhosh is sending message: '{test_msg_text}'")
        await santhosh_ws.send(json.dumps({
            'action': 'chat_message',
            'conversation_id': conv_id,
            'message': test_msg_text
        }))

        received_by_madhan = None
        for _ in range(5):
            msg_raw = await asyncio.wait_for(madhan_ws.recv(), timeout=5.0)
            msg_obj = json.loads(msg_raw)
            if msg_obj.get('type') == 'new_message':
                received_by_madhan = msg_obj
                break

        print(f"    Madhan received over WebSocket: {received_by_madhan}")
        assert received_by_madhan is not None
        assert received_by_madhan['message']['content'] == test_msg_text

        print("    Testing typing indicator...")
        await madhan_ws.send(json.dumps({
            'action': 'typing',
            'conversation_id': conv_id,
            'is_typing': True
        }))

        typing_event = None
        for _ in range(5):
            evt_raw = await asyncio.wait_for(santhosh_ws.recv(), timeout=5.0)
            evt_obj = json.loads(evt_raw)
            if evt_obj.get('type') == 'user_typing':
                typing_event = evt_obj
                break

        print(f"    Santhosh received typing event: {typing_event}")
        assert typing_event is not None
        assert typing_event['is_typing'] is True

    print("\n[ALL REAL-TIME WEBSOCKET & REST TESTS PASSED SUCCESSFULLY!]")

if __name__ == '__main__':
    asyncio.run(test_full_flow())
