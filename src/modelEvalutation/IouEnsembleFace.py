import numpy as np
from ultralytics import YOLO
import cv2
from os import listdir
from os.path import isfile, join
import os
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval
import json

# Paths to each trained face detection model for ensemble prediction, models added/removed based on tests
faceModels = ['faceBestA.pt', 'faceBestB.pt', 'faceBestCLr.pt', 'faceBestDLr.pt']

# Evaluation image set
path = "faceEvaluation/images/"
images = [join(path, f) for f in listdir(path) if isfile(join(path, f))]

# Function to read yolo label file for corresponding image
# and converts the normalised coordinates to pixel coordinates
def yoloToPixel(image):
    yoloCoordinates = []
    base = os.path.splitext(os.path.basename(image))[0]
    imageTxt = os.path.join("faceEvaluation", "labels", base + ".txt")
    if not os.path.exists(imageTxt):
        return []

    with open(imageTxt, "r") as file:
            for line in file:
                line = line.strip()
                yoloCoordinates.append(line)

    pixelCoordinates = []
    image = cv2.imread(image)
    height, width = image.shape[:2]
    for cord in yoloCoordinates:
        list = cord.split()
        x1 = (float(list[1]) - (float(list[3]) / 2)) * width
        y1 = (float(list[2]) - (float(list[4]) / 2)) * height
        x2 = (float(list[1]) + (float(list[3]) / 2)) * width
        y2 = (float(list[2]) + (float(list[4]) / 2)) * height
        a = [x1, y1, x2, y2]
        pixelCoordinates.append(a)

    return pixelCoordinates

# Run all models in faceModels array and collect boxes from each inference
# Find the most common detection count across all model results
# Group boxes from predictions
def facePredict(image):
    resultsArray = []
    facesDetected = []
    for model in faceModels:
        model = YOLO(model)
        results = model.predict(image, conf=0.55, verbose=False)
        num = len(results[0].boxes)
        facesDetected.append(num)
        if (num != 0):
            resultsArray.append(results)

    facesCount = max(set(facesDetected), key=facesDetected.count)



    boxes = []

    for result in resultsArray:
        bbox0 = 0
        bbox1 = 0
        bbox2 = 0
        bbox3 = 0
        boxesFound = result[0].boxes.xyxy.cpu().numpy().astype(np.int32)
        num = len(boxesFound)
        i = 0
        while i < num:
            bbox0 = boxesFound[i][0]
            bbox1 = boxesFound[i][1]
            bbox2 = boxesFound[i][2]
            bbox3 = boxesFound[i][3]
            box = [bbox0, bbox1, bbox2, bbox3]
            boxes.append(box)
            i += 1

    print("All results found")
    print(boxes)
    list = groupBoxes(boxes, facesCount)

    return list, facesDetected

# Use first boxes as anchors and add remaining ones to group based on the Intersection Over Union value overlap
def groupBoxes(boxes, faceCount):
    lists = []
    for i in range(faceCount):
        lists.append([boxes[i]])

    for box in boxes[faceCount:]:
        for group in lists:
            iou = IOU(box, group[0])
            if iou > 0.3:
                group.append(box)
                break
    return lists

# Average bounding boxes
def finalBox(lists):
    coordinates = []
    for list in lists:
        num = len(list)
        bbox0 = 0
        bbox1 = 0
        bbox2 = 0
        bbox3 = 0
        for result in list:
            bbox0 += result[0]
            bbox1 += result[1]
            bbox2 += result[2]
            bbox3 += result[3]

        bbox0 = bbox0 / num
        bbox1 = bbox1 / num
        bbox2 = bbox2 / num
        bbox3 = bbox3 / num

        box = [bbox0, bbox1, bbox2, bbox3]
        coordinates.append(box)

    return coordinates

# Calculate the intersection area of each box individually and return Intersection Over Union score
def IOU(actual, pred):
	x1 = max(actual[0], pred[0])
	y1 = max(actual[1], pred[1])
	x2 = min(actual[2], pred[2])
	y2 = min(actual[3], pred[3])
	interArea = max(0, x2 - x1 + 1) * max(0, y2 - y1 + 1)
	actualArea = (actual[2] - actual[0] + 1) * (actual[3] - actual[1] + 1)
	predictionArea = (pred[2] - pred[0] + 1) * (pred[3] - pred[1] + 1)
	iou = interArea / float(actualArea + predictionArea - interArea)
	return iou

predictions = []
groundTruthJSON = []
imagelist = []

imageID = 0
annotationID = 0

# reads images dimensions and calls functions to get ground truth boxes and models predictions
# Formats into COCO'c expected format
for image in images:
    imageID += 1

    img = cv2.imread(image)
    h, w = img.shape[:2]

    imagelist.append({"id": imageID, "file_name": os.path.basename(image), "width": w, "height": h})

    groundTruths = yoloToPixel(image)
    grouped, _ = facePredict(image)
    predictedBoxes = finalBox(grouped)

    # GT
    for truth in groundTruths:
        annotationID += 1
        x1, y1, x2, y2 = map(float, truth)

        groundTruthJSON.append({
            "id": annotationID,
            "image_id": imageID,
            "category_id": 0,
            "bbox": [x1, y1, x2 - x1, y2 - y1],
            "area": float((x2 - x1) * (y2 - y1)),
            "iscrowd": 0
        })

    # Predictions
    for box in predictedBoxes:
        x1, y1, x2, y2 = map(float, box)
        predictions.append({
            "image_id": imageID,
            "category_id": 0,
            "bbox": [x1, y1, x2 - x1, y2 - y1],
            "score": 1.0
        })

# create coco files
os.makedirs("coco_eval", exist_ok=True)

with open("coco_eval/truth.json", "w") as f:
    json.dump({
        "images": imagelist,
        "annotations": groundTruthJSON,
        "categories": [{"id": 0, "name": "face"}]
    }, f)

with open("coco_eval/preds.json", "w") as f:
    json.dump(predictions, f)

# evaluate weighted box fusion
cocoTruth = COCO("coco_eval/truth.json")
cocoDetections = cocoTruth.loadRes("coco_eval/preds.json")

evaluate = COCOeval(cocoTruth, cocoDetections, "bbox")
evaluate.evaluate()
evaluate.accumulate()
evaluate.summarize()

evaluate.stats[1]

# Output metrics
print(f"mAP@50:    {evaluate.stats[1]:.4f}")

precision = evaluate.eval['precision']
precisionScore = precision[0, :, 0, 0, 2]
precisionScore = precisionScore[precisionScore > -1]
print(f"Precision:  {np.mean(precisionScore):.4f}")

recall = evaluate.eval['recall']
recallScore = recall[0, 0, 0, 2]
print(f"Recall:     {float(recallScore):.4f}")