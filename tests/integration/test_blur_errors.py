def test_blur_missing_image(client):
    data = {
        "boxes": "[]"
    }

    response = client.post(
        "/blur",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 400
    assert b"missing image" in response.data

def test_blur_missing_boxes(client):
    import io
    import numpy as np
    import cv2

    img = np.zeros((50, 50, 3), dtype=np.uint8)
    success, buffer = cv2.imencode(".jpg", img)

    data = {
        "image": (io.BytesIO(buffer.tobytes()), "test.jpg")
    }

    response = client.post(
        "/blur",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 400
    assert b"missing boxes" in response.data

def test_blur_invalid_boxes_json(client):
    import io
    import numpy as np
    import cv2

    img = np.zeros((50, 50, 3), dtype=np.uint8)
    success, buffer = cv2.imencode(".jpg", img)

    data = {
        "image": (io.BytesIO(buffer.tobytes()), "test.jpg"),
        "boxes": "not-valid-json"
    }

    response = client.post(
        "/blur",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 400
    assert b"invalid boxes json" in response.data

# This test file verifies the error-handling behaviour of the /blur endpoint by simulating invalid client requests. 
# It ensures that the backend correctly returns appropriate error responses (HTTP 400) 
# when required inputs such as the image or bounding box data are missing or malformed.