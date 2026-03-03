from flask import Flask, request, jsonify
from ultralytics import YOLO
import numpy as np
import cv2

app = Flask(__name__)
face_model = YOLO("faceBestA.pt")
plate_model = YOLO("plateBestA.pt")
#faceModels = ['faceBestA.pt', 'faceBestB.pt', 'faceBestC.pt', 'faceBestB.pt']
#plateModels = ['plateBestA.pt', 'plateBestB.pt', 'plateBestC.pt', 'plateBestD.pt']

@app.after_request
def add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "http://localhost:8000"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp
#@app.route('/')
#def main():
    #message = facePredict()
    #message = platePredict()
    #return message

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "missing image field"}), 400

    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "invalid image"}), 400

    face_results = face_model.predict(img, conf=0.5, verbose=False)
    plate_results = plate_model.predict(img, conf=0.5, verbose=False)

    boxes = []
    # faces
    for (x1, y1, x2, y2) in face_results[0].boxes.xyxy.cpu().numpy().astype(int):
        boxes.append({
            "x": int(x1), "y": int(y1),
            "w": int(x2 - x1), "h": int(y2 - y1),
            "label": "face"
        })

    # plates
    for (x1, y1, x2, y2) in plate_results[0].boxes.xyxy.cpu().numpy().astype(int):
        boxes.append({
            "x": int(x1), "y": int(y1),
            "w": int(x2 - x1), "h": int(y2 - y1),
            "label": "plate"
        })

    h, w = img.shape[:2]
    return jsonify({
        "width": int(w),
        "height": int(h),
        "boxes": boxes
    })


def facePredict():
    count = 1
    for model in faceModels:
        model = YOLO(model)
        testImage = "C:/Users/liamw/2026-csc1097-wraftel-3-clarkt-26/src/backend/faceTest.jpg"
        results = model.predict(testImage, conf=0.5)
        finalImage = plot_bboxes(results)
        cv2.imwrite(f"faceOutput{count}.jpg", finalImage)
        count += 1

    return "face test"

def platePredict():
    count = 1
    for model in plateModels:
        model = YOLO(model)
        testImage = "C:/Users/liamw/2026-csc1097-wraftel-3-clarkt-26/src/backend/licensePlateTest.jpg"
        results = model.predict(testImage, conf=0.5)
        finalImage = plot_bboxes(results)
        cv2.imwrite(f"plateOutput{count}.jpg", finalImage)
        count += 1

    return "plate test"

def plot_bboxes(results):

    image = results[0].orig_img
    boxesFound = results[0].boxes.xyxy.numpy().astype(np.int32)
    for bbox in boxesFound:
        image = cv2.rectangle(image, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color=(0, 0, 255), thickness=1)

    return image

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

#if __name__ == '__main__':
    #app.run()