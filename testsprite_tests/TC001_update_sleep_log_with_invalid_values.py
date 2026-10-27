import requests
import uuid
import datetime
import sys

BASE = "http://localhost:4010/api/v1"
TIMEOUT = 30

def test_update_sleep_log_with_invalid_values_TC001():
    # Unique user registration
    email = f"test_{uuid.uuid4().hex}@example.com"
    password = "Athletia#2026x"
    register_url = f"{BASE}/auth/register"
    login_url = f"{BASE}/auth/login"
    sleeps_url = f"{BASE}/sleeps"

    headers = {"Content-Type": "application/json"}
    user_id = None
    sleep_id = None
    token = None

    try:
        # Register
        resp = requests.post(register_url, json={
            "email": email,
            "password": password,
            "confirmPassword": password,
            "name": "Test User"
        }, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Register failed: {resp.status_code} {resp.text}"

        # Login
        resp = requests.post(login_url, json={
            "email": email,
            "password": password
        }, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text}"
        body = resp.json()
        token = None
        # token may be nested under data.token
        if isinstance(body, dict):
            token = body.get("data", {}).get("token") or body.get("token")
        assert token, f"Token not found in login response: {body}"

        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Create a valid sleep log to update later
        today = datetime.date.today().isoformat()
        create_payload = {
            "hoursSlept": 7.5,
            "sleepQuality": 7,
            "stressLevel": 4,
            "hadNightmares": False,
            "notes": "Initial valid sleep log",
            "date": today
        }
        resp = requests.post(sleeps_url, json=create_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Create sleep log failed: {resp.status_code} {resp.text}"
        created = resp.json()
        sleep_id = None
        if isinstance(created, dict):
            sleep_id = created.get("data", {}).get("id") or created.get("data", {}).get("sleepId") or created.get("data", {}).get("_id") or created.get("data", {}).get("id")
        assert sleep_id, f"Created sleep log id not found in response: {created}"

        put_url = f"{sleeps_url}/{sleep_id}"

        # First invalid update: sleepQuality > 10
        invalid_payload_1 = {
            "sleepQuality": 11
        }
        resp = requests.put(put_url, json=invalid_payload_1, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for sleepQuality>10, got {resp.status_code}: {resp.text}"

        # Second invalid update: hoursSlept > 24
        invalid_payload_2 = {
            "hoursSlept": 25
        }
        resp = requests.put(put_url, json=invalid_payload_2, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for hoursSlept>24, got {resp.status_code}: {resp.text}"

    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}") from e
    finally:
        # Cleanup: delete the created sleep log if exists
        if token and sleep_id:
            try:
                del_resp = requests.delete(f"{sleeps_url}/{sleep_id}", headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
                # Accept 204 or 404 (if already removed)
                assert del_resp.status_code in (204, 404), f"Unexpected delete status: {del_resp.status_code} {del_resp.text}"
            except requests.RequestException:
                pass

if __name__ == "__main__":
    try:
        test_update_sleep_log_with_invalid_values_TC001()
        print("TC001 passed")
    except AssertionError as e:
        print(f"TC001 failed: {e}")
        sys.exit(1)