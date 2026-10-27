import requests
import uuid
import sys

BASE_URL = "http://localhost:4010/api/v1"
TIMEOUT = 30

def test_nearby_gyms_with_invalid_radius():
    # Create a unique user
    unique_email = f"test+{uuid.uuid4().hex}@example.com"
    password = "Athletia#2026x"
    register_payload = {
        "email": unique_email,
        "password": password,
        "confirmPassword": password,
        "name": "Test User"
    }

    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=register_payload, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"Failed to call register endpoint: {e}")

    assert resp.status_code == 201, f"Expected 201 on register, got {resp.status_code}: {resp.text}"

    # Login to obtain token
    login_payload = {"email": unique_email, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"Failed to call login endpoint: {e}")

    assert resp.status_code == 200, f"Expected 200 on login, got {resp.status_code}: {resp.text}"

    try:
        body = resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON: {resp.text}")

    token = None
    if isinstance(body, dict):
        # Expected shape: { success: true, data: { user, token } }
        data = body.get("data") if body.get("data") is not None else body
        if isinstance(data, dict):
            token = data.get("token")
    if not token:
        raise AssertionError(f"Token not found in login response: {body}")

    headers = {"Authorization": f"Bearer {token}"}

    # Call nearby gyms with invalid radius (>50000)
    params = {"lat": "40.4168", "lng": "-3.7038", "radius": "60000"}
    try:
        resp = requests.get(f"{BASE_URL}/gyms/nearby", headers=headers, params=params, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"Failed to call gyms/nearby endpoint: {e}")

    # Expect a 400 validation error
    assert resp.status_code == 400, f"Expected 400 for invalid radius, got {resp.status_code}: {resp.text}"

    # Attempt to validate response body indicates validation error
    try:
        error_body = resp.json()
    except ValueError:
        # If not JSON, still acceptable as long as status code is 400, but fail the test to encourage JSON errors
        raise AssertionError(f"Expected JSON error body for 400 response, got: {resp.text}")

    # Validate presence of common error indicators
    has_message = isinstance(error_body.get("message"), str) and error_body.get("message").strip() != ""
    has_errors = isinstance(error_body.get("errors"), (list, dict)) and len(error_body.get("errors")) > 0
    is_success_false = error_body.get("success") is False
    has_error_field = isinstance(error_body.get("error"), (str, dict))

    assert any([has_message, has_errors, is_success_false, has_error_field]), (
        f"400 response did not include expected error details: {error_body}"
    )

if __name__ == "__main__":
    try:
        test_nearby_gyms_with_invalid_radius()
        print("TC006 passed")
    except AssertionError as e:
        print(f"TC006 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC006 encountered an unexpected error: {e}")
        sys.exit(2)