import numpy as np
from ultralytics import YOLO
import cv2
from os import listdir
from os.path import isfile, join
from ensemble_boxes import weighted_boxes_fusion
from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval
import json
import os

plateModels = ['plateBestA.pt','plateBestB.pt','plateBestC.pt', 'plateBestD.pt']

path = "plateEvaluation/images/"
images = [join(path, f) for f in listdir(path) if isfile(join(path, f))]

# Converts normalised bounding box coordinates to pixel coordinates
def yoloToPixel(image):
    yoloCoordinates = []

    base = os.path.splitext(os.path.basename(image))[0]
    imageTxt = os.path.join("plateEvaluation", "labels", base + ".txt")

    if not os.path.exists(imageTxt):
        return []

    with open(imageTxt, "r") as file:
        for line in file:
            yoloCoordinates.append(line.strip())

    pixelCoordinates = []
    img = cv2.imread(image)
    h, w = img.shape[:2]

    for cord in yoloCoordinates:
        parts = cord.split()

        xc, yc, bw, bh = map(float, parts[1:5])

        x1 = (xc - bw / 2) * w
        y1 = (yc - bh / 2) * h
        x2 = (xc + bw / 2) * w
        y2 = (yc + bh / 2) * h

        pixelCoordinates.append([x1, y1, x2, y2])

    return pixelCoordinates

# Run inference on images using each model
# normalises bounding boxes to 0-1 range
# Passes everything into weighted boxes fusion which takes them and merges
# overlapping boxes across models into single set of predictions
# converts back to pixel
def platePredict(image):
    img = cv2.imread(image)
    h, w = img.shape[:2]

    boxes_list = []
    scores_list = []
    labels_list = []

    for modelPath in plateModels:
        model = YOLO(modelPath)
        results = model.predict(image, conf=0.1, verbose=False)

        if len(results[0].boxes) == 0:
            continue

        boxes = results[0].boxes.xyxy.cpu().numpy()
        scores = results[0].boxes.conf.cpu().numpy()

        # normalize
        boxes[:, [0, 2]] /= w
        boxes[:, [1, 3]] /= h

        boxes_list.append(boxes.tolist())
        scores_list.append(scores.tolist())
        labels_list.append([0] * len(boxes))

    if not boxes_list:
        return [], []

    boxes, scores, labels = weighted_boxes_fusion(
        boxes_list,
        scores_list,
        labels_list,
        iou_thr=0.5,
        skip_box_thr=0.02
    )

    # back to pixels
    boxes[:, [0, 2]] *= w
    boxes[:, [1, 3]] *= h

    return boxes.tolist(), scores.tolist()


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
    predictedBoxes, predictionScores = platePredict(image)

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
    for box, score in zip(predictedBoxes, predictionScores):
        x1, y1, x2, y2 = map(float, box)

        predictions.append({
            "image_id": imageID,
            "category_id": 0,
            "bbox": [x1, y1, x2 - x1, y2 - y1],
            "score": float(score)
        })

# create coco files
os.makedirs("coco_eval", exist_ok=True)

with open("coco_eval/truth.json", "w") as f:
    json.dump({
        "images": imagelist,
        "annotations": groundTruthJSON,
        "categories": [{"id": 0, "name": "plate"}]
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