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
    resultsArray = []
    facesDetected = []
    for model in faceModels:
        model = YOLO(model)
        testImage = "C:/Users/liamw/2026-csc1097-wraftel-3-clarkt-26/src/backend/faceTest.jpg"
        results = model.predict(testImage, conf=0.55)
        num = len(results[0].boxes)
        facesDetected.append(num)
        if (num != 0):
            resultsArray.append(results)

    facesCount = max(facesDetected)
    finalResult = finalBox(resultsArray, facesCount)
    finalImage = plot_bboxes(finalResult)
    cv2.imwrite(f"faceCombined.jpg", finalImage)

    return facesDetected

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

    image = cv2.imread("faceTest.jpg")
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