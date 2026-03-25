from flask import Flask, request, jsonify, send_file
from ultralytics import YOLO
import numpy as np
import cv2
import json
import io

app = Flask(__name__)
#face_model = YOLO("faceBestA.pt")
#plate_model = YOLO("plateBestA.pt")
faceModels = ['faceBestA.pt', 'faceBestB.pt', 'faceBestC.pt', 'faceBestB.pt']
plateModels = ['plateBestA.pt', 'plateBestB.pt', 'plateBestC.pt', 'plateBestD.pt']

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

    #face_results = face_model.predict(img, conf=0.5, verbose=False)
    #plate_results = plate_model.predict(img, conf=0.5, verbose=False)

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

        blurred_roi = cv2.GaussianBlur(roi, (51, 51), 0)
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
    resultsArray = []
    facesDetected = []
    for model in faceModels:
        model = YOLO(model)
        #testImage = "C:/Users/liamw/2026-csc1097-wraftel-3-clarkt-26/src/backend/faceTestThree.jpg"
        results = model.predict(image, conf=0.55)
        num = len(results[0].boxes)
        facesDetected.append(num)
        if (num != 0):
            resultsArray.append(results)

    facesCount = max(facesDetected)
    finalResult = finalBox(resultsArray, facesCount)
    finalImage = plot_bboxes(finalResult)
    cv2.imwrite(f"faceCombined.jpg", finalImage)

    return facesDetected, finalResult

def platePredict(image):
    resultsArray = []
    platesDetected = []
    for model in plateModels:
        model = YOLO(model)
        results = model.predict(image, conf=0.5)
        num = len(results[0].boxes)
        platesDetected.append(num)
        if num != 0:
            resultsArray.append(results)

    if not resultsArray:
        return platesDetected, []

    platesCount = max(platesDetected)
    finalResult = finalBox(resultsArray, platesCount)

    return platesDetected, finalResult

def plot_bboxes(results):

    image = cv2.imread("faceTestThree.jpg")
    for bbox in results:
        image = cv2.rectangle(image, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), color=(0, 0, 255), thickness=1)

    return image

def finalBox(resultsArray, facesCount):
    num = len(resultsArray)
    coordinates = []

    for i in range(facesCount):
        bbox0 = 0
        bbox1 = 0
        bbox2 = 0
        bbox3 = 0
        for results in resultsArray:
            boxesFound = results[0].boxes.xyxy.numpy().astype(np.int32)
            boxesFound = sorted(boxesFound, key=lambda x: x[0])
            bbox0 += boxesFound[i][0]
            bbox1 += boxesFound[i][1]
            bbox2 += boxesFound[i][2]
            bbox3 += boxesFound[i][3]

        bbox0 = bbox0 / num
        bbox1 = bbox1 / num
        bbox2 = bbox2 / num
        bbox3 = bbox3 / num

        box = [bbox0, bbox1, bbox2, bbox3]
        coordinates.append(box)

    return coordinates

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

#if __name__ == '__main__':
    #app.run()