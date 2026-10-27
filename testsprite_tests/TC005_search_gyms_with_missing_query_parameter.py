import requests
import uuid
import time
import sys

BASE_URL = "http://localhost:4010/api/v1"
TIMEOUT = 30

def test_search_gyms_with_missing_query_parameter():
    # Prepare unique user credentials
    unique_suffix = str(uuid.uuid4())
    email = f"test.user.{unique_suffix}@example.com"
    password = "Athletia#2026x"
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    gyms_search_url = f"{BASE_URL}/gyms/search"

    headers = {"Content-Type": "application/json"}

    # Register user
    try:
        reg_payload = {
            "email": email,
            "password": password,
            "confirmPassword": password,
            "name": "Test User"
        }
        reg_resp = requests.post(register_url, json=reg_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Registration request failed: {e}")

    assert reg_resp is not None, "No response from register endpoint"
    assert reg_resp.status_code == 201, f"Expected 201 Created from register, got {reg_resp.status_code}, body: {reg_resp.text}"
    try:
        reg_json = reg_resp.json()
    except ValueError:
        raise AssertionError(f"Register response is not valid JSON: {reg_resp.text}")

    # Login user to obtain token
    try:
        login_payload = {"email": email, "password": password}
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")

    assert login_resp is not None, "No response from login endpoint"
    assert login_resp.status_code == 200, f"Expected 200 OK from login, got {login_resp.status_code}, body: {login_resp.text}"
    try:
        login_json = login_resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON: {login_resp.text}")

    # Extract token
    token = None
    if isinstance(login_json, dict):
        data = login_json.get("data") or {}
        token = data.get("token") or login_json.get("token")
    if not token:
        raise AssertionError(f"JWT token not found in login response: {login_json}")

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    # Perform the gyms search without 'q' parameter to trigger 400
    try:
        resp = requests.get(gyms_search_url, headers=auth_headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Gyms search request failed: {e}")

    # Validate response is a 400 validation error
    assert resp is not None, "No response from gyms search endpoint"
    if resp.status_code != 400:
        # If it's 502 or 401 etc, fail with details
        raise AssertionError(f"Expected 400 Bad Request for missing 'q' parameter, got {resp.status_code}. Response body: {resp.text}")

    # Ensure response is JSON and conveys an error
    content_type = resp.headers.get("Content-Type", "")
    assert "application/json" in content_type.lower(), f"Expected JSON response for error, got Content-Type: {content_type}"

    try:
        err_json = resp.json()
    except ValueError:
        raise AssertionError(f"Expected JSON error body, got: {resp.text}")

    # Basic checks on error payload: should be a dict and contain at least one common error key
    assert isinstance(err_json, dict), f"Expected JSON object in error body, got: {type(err_json)}"
    if not any(k in err_json for k in ("success", "message", "error", "errors")):
        # Not strictly required to have a specific shape, but usually an error message exists
        raise AssertionError(f"Error response JSON does not contain expected keys: {err_json}")

if __name__ == "__main__":
    try:
        test_search_gyms_with_missing_query_parameter()
        print("TC005 passed")
    except AssertionError as e:
        print(f"TC005 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC005 encountered an unexpected exception: {e}")
        sys.exit(2)