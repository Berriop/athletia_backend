import requests
import uuid
import sys
from requests.exceptions import RequestException

BASE_URL = "http://localhost:4010/api/v1"
TIMEOUT = 30

def test_update_injury_with_invalid_severity():
    # Generate unique user
    unique_email = f"testuser+{uuid.uuid4().hex}@example.com"
    password = "Athletia#2026x"
    headers = {"Content-Type": "application/json"}

    # Register
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": unique_email,
                "password": password,
                "confirmPassword": password,
                "name": "Test User"
            },
            headers=headers,
            timeout=TIMEOUT
        )
    except RequestException as e:
        raise AssertionError(f"Registration request failed: {e}")
    assert resp.status_code == 201, f"Expected 201 on register, got {resp.status_code}, body: {resp.text}"

    # Login
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": unique_email, "password": password},
            headers=headers,
            timeout=TIMEOUT
        )
    except RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    assert resp.status_code == 200, f"Expected 200 on login, got {resp.status_code}, body: {resp.text}"
    body = resp.json()
    token = body.get("data", {}).get("token")
    assert token, f"No token returned in login response: {body}"

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    injury_id = None
    try:
        # Create a valid injury to update later
        try:
            resp = requests.post(
                f"{BASE_URL}/injuries",
                json={
                    "bodyArea": "Right Knee",
                    "injuryName": "Minor Sprain",
                    "severity": 5,
                    "isActive": True,
                    "notes": "Created for test"
                },
                headers=auth_headers,
                timeout=TIMEOUT
            )
        except RequestException as e:
            raise AssertionError(f"Create injury request failed: {e}")
        assert resp.status_code == 201, f"Expected 201 on create injury, got {resp.status_code}, body: {resp.text}"
        created = resp.json().get("data", {})
        injury_id = created.get("id")
        assert injury_id, f"Created injury id not found in response: {resp.text}"

        # Attempt to update with invalid severity (outside 1-10), e.g., 11
        try:
            resp = requests.put(
                f"{BASE_URL}/injuries/{injury_id}",
                json={"severity": 11},
                headers=auth_headers,
                timeout=TIMEOUT
            )
        except RequestException as e:
            raise AssertionError(f"Update injury request failed: {e}")

        # Expect validation error 400
        assert resp.status_code == 400, f"Expected 400 when updating with invalid severity, got {resp.status_code}, body: {resp.text}"

    finally:
        # Cleanup: attempt to delete the created injury if it exists
        if injury_id:
            try:
                resp = requests.delete(
                    f"{BASE_URL}/injuries/{injury_id}",
                    headers=auth_headers,
                    timeout=TIMEOUT
                )
            except RequestException as e:
                print(f"Cleanup delete request failed: {e}", file=sys.stderr)
            else:
                if resp.status_code not in (204, 404):
                    print(f"Unexpected status during cleanup delete: {resp.status_code}, body: {resp.text}", file=sys.stderr)

if __name__ == "__main__":
    test_update_injury_with_invalid_severity()
    print("Test completed: update_injury_with_invalid_severity")