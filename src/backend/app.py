from flask import Flask
from ultralytics import YOLO
import numpy as np
import cv2

app = Flask(__name__)
faceModels = ['faceBestA.pt', 'faceBestB.pt', 'faceBestC.pt', 'faceBestB.pt']
plateModels = ['plateBestA.pt', 'plateBestB.pt', 'plateBestC.pt', 'plateBestD.pt']

@app.route('/')
def main():
    message = facePredict()
    #message = platePredict()
    return message

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

if __name__ == '__main__':
    app.run()