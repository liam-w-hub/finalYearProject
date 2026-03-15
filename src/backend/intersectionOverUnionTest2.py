import numpy as np
from ultralytics import YOLO
import cv2
from os import listdir
from os.path import isfile, join

faceModels = ['faceBestA.pt', 'faceBestB.pt', 'faceBestC.pt', 'faceBestB.pt']
path = "testImages/images/"
images = [join(path, f) for f in listdir(path) if isfile(join(path, f))]

def yoloToPixel(image):
	yoloCoordinates = []
	imageTxt = image.replace(".jpg", ".txt")
	imageTxt = imageTxt.replace("images", "labels")

	with open(imageTxt, "r") as file:
			for line in file:
				#a = []
				line = line.strip()
				yoloCoordinates.append(line)

	pixelCoordinates = []
	image = cv2.imread(image)
	img_height, img_width = image.shape[:2]
	for cord in yoloCoordinates:
		list = cord.split()
		x1 = (float(list[1]) - (float(list[3]) / 2)) * img_width
		y1 = (float(list[2]) - (float(list[4]) / 2)) * img_height
		x2 = (float(list[1]) + (float(list[3]) / 2)) * img_width
		y2 = (float(list[2]) + (float(list[4]) / 2)) * img_height
		a = [x1, y1, x2, y2]
		pixelCoordinates.append(a)

	return pixelCoordinates

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

    facesCount = max(facesDetected)


    
    boxes = []

    for result in resultsArray:
        bbox0 = 0
        bbox1 = 0
        bbox2 = 0
        bbox3 = 0
        boxesFound = result[0].boxes.xyxy.numpy().astype(np.int32)
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
    #finalResult = finalBox(resultsArray, facesCount)
    #finalResult ,t
    return list, facesDetected

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

def IOU(actual, pred):
	x1 = max(actual[0], pred[0])
	y1 = max(actual[1], pred[1])
	x2 = min(actual[2], pred[2])
	y2 = min(actual[3], pred[3])
	interArea = max(0, x2 - x1 + 1) * max(0, y2 - y1 + 1)
	actualArea = (actual[2] - actual[0] + 1) * (actual[3] - actual[1] + 1)
	predArea = (pred[2] - pred[0] + 1) * (pred[3] - pred[1] + 1)
	iou = interArea / float(actualArea + predArea - interArea)
	return iou

ious = []
for image in images:
    print(image)
    convert = yoloToPixel(image)
    print("actual coordinates")
    print(convert)
    list, faceCount = facePredict(image)
    #pred, faceCount = facePredict(image)
    print("faces found")
    print(faceCount)
    print("grouped boxes")
    print(list)
    final = finalBox(list)
    print("predicted coordinates")
    print(final)

    for i in range(len(convert)):
        if i < len(final):
            intersect = IOU(convert[i], final[i])
        else:
            intersect = 0
        print("intersect")
        print(intersect)
        ious.append(intersect)

miou = sum(ious) / len(ious)
print("mean intersection over union")
print(miou)