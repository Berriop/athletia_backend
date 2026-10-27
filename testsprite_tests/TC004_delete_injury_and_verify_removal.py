import requests
import uuid
import sys
import time

BASE_URL = "http://localhost:4010/api/v1"
TIMEOUT = 30

def test_delete_injury_and_verify_removal():
    # Prepare unique user credentials
    unique_suffix = uuid.uuid4().hex
    email = f"testuser_{unique_suffix}@example.com"
    password = "Athletia#2026x"  # meets complexity requirements
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    injuries_url = f"{BASE_URL}/injuries"

    token = None
    injury_id = None

    try:
        # Register user
        reg_payload = {
            "email": email,
            "password": password,
            "confirmPassword": password,
            "name": f"Test User {unique_suffix[:8]}"
        }
        reg_resp = requests.post(register_url, json=reg_payload, timeout=TIMEOUT)
        try:
            assert reg_resp.status_code == 201, f"Expected 201 for register, got {reg_resp.status_code}, body: {reg_resp.text}"
        except AssertionError:
            # If registration failed due to already existing user or validation, raise to fail test
            raise

        # Login user
        login_payload = {"email": email, "password": password}
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200 for login, got {login_resp.status_code}, body: {login_resp.text}"
        login_json = login_resp.json()
        # Extract token from response (expected at data.token)
        token = None
        if isinstance(login_json, dict):
            data = login_json.get("data")
            if isinstance(data, dict):
                token = data.get("token")
        assert token, f"JWT token not found in login response: {login_resp.text}"

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # Create an injury (resource to delete)
        create_payload = {
            "bodyArea": "Knee",
            "injuryName": "ACL strain",
            "severity": 5,
            "isActive": True,
            "notes": "Test injury for deletion"
        }
        create_resp = requests.post(injuries_url, json=create_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected 201 for create injury, got {create_resp.status_code}, body: {create_resp.text}"
        create_json = create_resp.json()
        data = create_json.get("data") if isinstance(create_json, dict) else None
        # Expect created injury to include an id
        if isinstance(data, dict):
            injury_id = data.get("id") or data.get("_id") or data.get("injuryId")
        assert injury_id, f"Created injury id not found in response: {create_resp.text}"

        # Delete the injury
        delete_url = f"{injuries_url}/{injury_id}"
        del_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert del_resp.status_code == 204, f"Expected 204 for delete, got {del_resp.status_code}, body: {del_resp.text}"

        # Attempt to retrieve the deleted injury -> expect 404
        get_resp = requests.get(delete_url, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 404, f"Expected 404 when retrieving deleted injury, got {get_resp.status_code}, body: {get_resp.text}"

    except requests.RequestException as e:
        raise AssertionError(f"Network/request error occurred: {e}") from e
    finally:
        # Cleanup: ensure resource is removed. If token and injury_id exist, attempt delete (ignore 404).
        if token and injury_id:
            try:
                headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                cleanup_resp = requests.delete(f"{injuries_url}/{injury_id}", headers=headers, timeout=TIMEOUT)
                # Accept 204 (deleted) or 404 (already deleted/not found)
                if cleanup_resp.status_code not in (204, 404):
                    # Not raising to avoid masking original test result, but surface as exception if nothing else failed.
                    raise AssertionError(f"Cleanup delete returned unexpected status {cleanup_resp.status_code}: {cleanup_resp.text}")
            except requests.RequestException as e:
                # If cleanup network error occurs, raise to make test failure explicit
                raise AssertionError(f"Network error during cleanup: {e}") from e

if __name__ == "__main__":
    test_delete_injury_and_verify_removal()
    print("TC004: delete_injury_and_verify_removal passed.")