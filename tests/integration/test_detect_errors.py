# tests/integration/test_detect_errors.py

import io


def test_detect_missing_image(client):
    response = client.post(
        "/detect",
        data={},
        content_type="multipart/form-data"
    )

    assert response.status_code == 400
    assert b"missing image field" in response.data


def test_detect_invalid_image(client):
    fake_file = io.BytesIO(b"this-is-not-a-real-image")

    data = {
        "image": (fake_file, "fake.jpg")
    }

    response = client.post(
        "/detect",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 400
    assert b"invalid image" in response.data

# This test file verifies the validation and error-handling behaviour of the /detect endpoint. 
# It ensures that the backend returns the correct 400 responses when the uploaded image is missing or invalid.