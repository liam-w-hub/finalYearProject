from flask import Flask, request, jsonify, send_file
from ultralytics import YOLO
import numpy as np
import cv2
import json
import io

app = Flask(__name__)

faceModels = ['faceBestDLr.pt']
plateModels = ['plateBestD.pt']

@app.after_request
def add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "http://localhost:8000"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "missing image field"}), 400

    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "invalid image"}), 400

    face_detected, final_result = facePredict(img)
    plate_detected, plate_result = platePredict(img)

    boxes = []

    # face boxes
    for bbox in final_result:
        x1, y1, x2, y2 = bbox
        boxes.append({
            "x": int(x1),
            "y": int(y1),
            "w": int(x2 - x1),
            "h": int(y2 - y1),
            "label": "face"
        })

    # plate boxes
    for bbox in plate_result:
        x1, y1, x2, y2 = bbox
        boxes.append({
            "x": int(x1),
            "y": int(y1),
            "w": int(x2 - x1),
            "h": int(y2 - y1),
            "label": "plate"
        })

    h, w = img.shape[:2]

    return jsonify({
        "width": int(w),
        "height": int(h),
        "boxes": boxes,
        "face_detected": face_detected,
        "plate_detected": plate_detected
    })

@app.route("/blur", methods=["POST"])
def blur():
    print("BLUR ENDPOINT HIT")
    if "image" not in request.files:
        return jsonify({"error": "missing image field"}), 400

    if "boxes" not in request.form:
        return jsonify({"error": "missing boxes field"}), 400

    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "invalid image"}), 400

    try:
        boxes = json.loads(request.form["boxes"])
    except Exception:
        return jsonify({"error": "invalid boxes json"}), 400

    img_h, img_w = img.shape[:2]
    strength = request.form.get("strength")
    print(f"strength = '{strength}'")
    for box in boxes:
        x = max(0, int(box["x"]))
        y = max(0, int(box["y"]))
        w = max(1, int(box["w"]))
        h = max(1, int(box["h"]))

        x2 = min(img_w, x + w)
        y2 = min(img_h, y + h)

        if x >= x2 or y >= y2:
            continue

        roi = img[y:y2, x:x2]
        if roi.size == 0:
            continue

        if strength == "lightStrength":
            blurred_roi = cv2.GaussianBlur(roi, (21, 21), 0)
            img[y:y2, x:x2] = blurred_roi

        if strength == "mediumStrength":
            blurred_roi = cv2.GaussianBlur(roi, (51, 51), 0)
            img[y:y2, x:x2] = blurred_roi

        if strength == "strongStrength":
            blurred_roi = cv2.GaussianBlur(roi, (101, 101), 0)
            img[y:y2, x:x2] = blurred_roi

    success, buffer = cv2.imencode(".jpg", img)
    if not success:
        return jsonify({"error": "failed to encode image"}), 500

    return send_file(
        io.BytesIO(buffer.tobytes()),
        mimetype="image/jpeg",
        as_attachment=False,
        download_name="blurred.jpg"
    )

def facePredict(image):
    # Load the face model and run inference on uploaded image
    model = YOLO(faceModels[0])
    # Make prediction keeping those with a confidence score or 0.5 or greater
    results = model.predict(image, conf=0.5)
    boxes = results[0].boxes.xyxy.cpu().numpy().astype(np.int32)
    faceDetected = len(boxes) > 0

    # return the face(s) detected and their corresponding bounding boxes
    return faceDetected, boxes

def platePredict(image):
    # Load the plate model and run inference on uploaded image
    model = YOLO(plateModels[0])
    # Make prediction keeping those with a confidence score or 0.5 or greater
    results = model.predict(image, conf=0.5)
    boxes = results[0].boxes.xyxy.cpu().numpy().astype(np.int32)
    plateDetected = len(boxes) > 0

    # return the plate(s) detected and their corresponding bounding boxes
    return plateDetected, boxes


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
