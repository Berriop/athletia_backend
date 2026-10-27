import requests
import uuid
import datetime
import sys

BASE = "http://localhost:4010/api/v1"
TIMEOUT = 30.0

def register_user(email: str, password: str):
    url = f"{BASE}/auth/register"
    payload = {
        "email": email,
        "password": password,
        "confirmPassword": password,
        "name": "Test User"
    }
    try:
        r = requests.post(url, json=payload, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Register request failed: {e}")
    assert r.status_code == 201, f"Expected 201 on register, got {r.status_code}, body: {r.text}"
    return r.json()

def login_user(email: str, password: str):
    url = f"{BASE}/auth/login"
    payload = {"email": email, "password": password}
    try:
        r = requests.post(url, json=payload, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    assert r.status_code == 200, f"Expected 200 on login, got {r.status_code}, body: {r.text}"
    body = r.json()
    assert "data" in body and "token" in body["data"], f"Login response missing token: {body}"
    return body["data"]["token"]

def create_sleep(token: str, sleep_payload: dict):
    url = f"{BASE}/sleeps"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    try:
        r = requests.post(url, json=sleep_payload, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Create sleep request failed: {e}")
    assert r.status_code == 201, f"Expected 201 on create sleep, got {r.status_code}, body: {r.text}"
    body = r.json()
    assert "data" in body and isinstance(body["data"], dict), f"Create sleep response malformed: {body}"
    # Expect an id field in created resource
    sleep_id = body["data"].get("id") or body["data"].get("uuid") or body["data"].get("_id")
    assert sleep_id is not None, f"Created sleep log missing id field: {body}"
    return sleep_id

def delete_sleep(token: str, sleep_id: str):
    url = f"{BASE}/sleeps/{sleep_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.delete(url, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Delete sleep request failed: {e}")
    return r

def get_sleep(token: str, sleep_id: str):
    url = f"{BASE}/sleeps/{sleep_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"Get sleep request failed: {e}")
    return r

def test_delete_sleep_log_and_verify_removal():
    password = "Athletia#2026x"
    user_a_email = f"test_a_{uuid.uuid4().hex}@example.com"
    user_b_email = f"test_b_{uuid.uuid4().hex}@example.com"

    token_a = None
    token_b = None
    sleep_id = None
    deleted_by_a = False

    # Register and login user A
    register_user(user_a_email, password)
    token_a = login_user(user_a_email, password)

    # Create a sleep log for user A
    today = datetime.date.today().isoformat()
    sleep_payload = {
        "hoursSlept": 7.5,
        "sleepQuality": 8,
        "stressLevel": 3,
        "hadNightmares": False,
        "notes": "Created by automated test",
        "date": today
    }

    sleep_id = create_sleep(token_a, sleep_payload)

    # Register and login user B (to test ownership enforcement)
    register_user(user_b_email, password)
    token_b = login_user(user_b_email, password)

    # Attempt to delete sleep with user B's token -> expect 404 (not owned)
    resp = delete_sleep(token_b, sleep_id)
    assert resp.status_code == 404, f"Expected 404 when deleting not-owned sleep, got {resp.status_code}, body: {resp.text}"

    # Now delete the sleep with owner (user A) -> expect 204
    resp = delete_sleep(token_a, sleep_id)
    assert resp.status_code == 204, f"Expected 204 on successful delete by owner, got {resp.status_code}, body: {resp.text}"
    deleted_by_a = True

    # Attempt to retrieve the deleted sleep with owner token -> expect 404
    resp = get_sleep(token_a, sleep_id)
    assert resp.status_code == 404, f"Expected 404 when getting deleted sleep, got {resp.status_code}, body: {resp.text}"

    # Also verify other user cannot get it (still 404)
    resp = get_sleep(token_b, sleep_id)
    assert resp.status_code == 404, f"Expected 404 for other user getting deleted sleep, got {resp.status_code}, body: {resp.text}"

    print("TC002 passed: delete_sleep_log_and_verify_removal")

if __name__ == "__main__":
    try:
        test_delete_sleep_log_and_verify_removal()
    except AssertionError as e:
        print(f"Test failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)