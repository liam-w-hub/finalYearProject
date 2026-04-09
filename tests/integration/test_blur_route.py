import io
import json
import numpy as np
import cv2


def test_blur_route_returns_image(client):
    img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    success, buffer = cv2.imencode(".jpg", img)
    assert success

    data = {
        "image": (io.BytesIO(buffer.tobytes()), "test.jpg"),
        "boxes": json.dumps([
            {"x": 20, "y": 20, "w": 30, "h": 30}
        ])
    }

    response = client.post(
        "/blur",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 200
    assert response.mimetype == "image/jpeg"

def test_blur_multiple_boxes(client):
    import io, json, numpy as np, cv2

    img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    success, buffer = cv2.imencode(".jpg", img)

    data = {
        "image": (io.BytesIO(buffer.tobytes()), "test.jpg"),
        "boxes": json.dumps([
            {"x": 10, "y": 10, "w": 20, "h": 20},
            {"x": 50, "y": 50, "w": 20, "h": 20}
        ])
    }

    response = client.post("/blur", data=data, content_type="multipart/form-data")

    assert response.status_code == 200

def test_blur_out_of_bounds_boxes(client):
    import io
    import json
    import numpy as np
    import cv2

    img = np.zeros((50, 50, 3), dtype=np.uint8)
    success, buffer = cv2.imencode(".jpg", img)

    data = {
        "image": (io.BytesIO(buffer.tobytes()), "test.jpg"),
        "boxes": json.dumps([
            {"x": -10, "y": -10, "w": 100, "h": 100}
        ])
    }

    response = client.post(
        "/blur",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 200

# This integration test verifies that the /blur endpoint accepts 
# an uploaded image and bounding box data, then processes the request successfully. 
# It confirms that the backend returns a JPEG image response, 
# showing that the blur route works correctly end to end.