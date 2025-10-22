# School of Computing &mdash; Year 4 Project Proposal Form

## SECTION A

|                     |                   |
|---------------------|-------------------|
|Project Title:       | Smart Blur        |
|Student 1 Name:      | Liam Wrafter      |
|Student 1 ID:        | 22411932          |
|Student 2 Name:      | Tom Clarke        |
|Student 2 ID:        | 22388923          |
|Project Supervisor:  | Sunder Ali Khowaja|

## SECTION B

### Introduction

As concerns over personal privacy and data protection continue to grow, particularly in visual content that is shared online, the need for an automated image privacy tool has also grown. Images often contain sensitive and more importantly identifiable information such as faces or license plates, which can unintentionally expose personal details. 
This project aims to solve this issue by developing an automated image privacy tool to detect faces and license plates and let users blur them before sharing images.
This project will utilise computer vision, focusing on object detection and privacy protection. The final result of the project is a web-based application that uses object detection models to make privacy easy and accessible. 

### Outline

Our proposed project involves building a privacy-focused image processing tool that uses two deep learning-based object detection models that are both integrated with a simple web-based application. The project development will follow a number of key stages:

**Dataset Collection and preparation**

We will begin our development by collecting and preparing high quality datasets containing annotated images of faces and license plates. These datasets will be clean, labeled and have proper Yolo format for training both object detection models. The data will then be split into training and validation sets.

**Model Training**

We plan to train two separate YOLOv8 models. One will be trained to detect human faces and the other will be trained  to detect license plates. Each model will be trained using the respective custom preprocessed datasets. Both models will be fine-tuned through multiple training cycles to maximize accuracy while minimizing false positives. 

**Integration with flask**

Once both models are trained they will be integrated into a Flask-based backend. Flask will be used to handle user requests, it will run models on user uploaded images, and manage the flow between image processing and user interactions.

**Frontend development**

A simple web-based application will be developed where users can upload their desired images. This frontend will communicate with the Flask backend to send images for processing as well as displaying the results for user modifications.

**User interaction**

After both YOLOv8 models run inference on an image to detect faces and license plates. The detected objects will be highlighted using bounding boxes, which are then displayed to the user for review. The web-interface will allow users to manually adjust the bounding boxes, confirm or remove them.

**Blurring sensitive regions**

Once a user has confirmed the regions in which they want the area to be blurred, OpenCV will be used to apply a blur effect to the area within the bounding boxes.


### Background

The idea for this project came from the increasing need to protect personal data. With the increasing enforcement of privacy regulations, for example GDPR, companies and people must ensure that personal data including visual data is properly anonymized before images are shared or processed. Our goal is to develop an accessible and easy to use automated image privacy tool for everyday users and small businesses.

### Achievements

The final application will allow the user to:

* upload an image via the web application.
*automatically detect peoples faces and license plates in images.
* display the detected objects with bounding boxes.
* allow the user to manually modify/remove any bounding box before blurring is applied.
* apply blur to the confirmed areas.
* download the final blurred image.

Who will the users be?

* Journalists  redacting faces/plates in news photos.
* Lawyers/judges redacting faces/plates in evidence.
* Doctors: hiding identities in medical images.


### Justification

**Why this project will be useful:**

Faces and license plates are two of the most commonly identifiable visual elements. Their presence in publicly shared images can lead to privacy violations, surveillance overreach and even legal consequences under GDPR.

This system is also useful in error prevention. Fully automatic redaction tools can blur everything the model detects even if it's incorrect for it to do so. By letting users review and modify the bounding boxes before blurring the areas avoids hiding important wanted information or incorrect details.

Users can control exactly what is blurred giving more flexibility across various different use cases.

**When it will be useful:**

The system will be useful in many scenarios where images are being prepared for public release or sharing. This includes before publishing images on websites, social media or in news articles. It will also be beneficial in legal proceedings or data handling processes where personal information must be anonymized before distribution. 

**Where it will be useful:**

This application can be used across multiple professional environments such as newsrooms, law offices, research institutions and also by individuals who share images online. It can be accessed through a web browser making it widely accessible regardless of location. 

**How it will be useful:**

The system combines automated object detection and manual verification to ensure accuracy. After the system detects faces and/or license plates users can manually confirm or adjust which areas to blur. This workflow saves time compared to fully manual editing while still maintaining high precision.

### Programming language(s)

Python, html, css, javascript.

### Programming tools / Tech stack

Object detection: Yolov8 - Yolov8 is an object detection model developed by Ultralytics and will be used to train our models.

Image processing: OpenCV - OpenCV will be used to apply blur to selected regions of the image based on given bounding box coordinates.

Backend: Flask (Python based web-framework).

Frontend: html,css,javascript.

### Learning Challenges

Developing this project will involve several learning challenges:

* A key challenge will be getting the computer vision models to work smoothly with the web application. YOLO normally runs in a python environment, so learning how to send images from the webpage to the backend, process them, and then send the results back will take some time to figure out.

### Breakdown of work

#### Student 1

Liam - model and backend.

I will be responsible for training both the face and the license plate object detection models using YOLOv8. I will fine tune these models using clean datasets that have been prepared by both students. We decided to split the task of collecting and preparing training set data and testing data. 

I will also be responsible for integrating the computer vision models with the flask backend. This will involve the task of connecting the models to the flask server so that the user uploaded images can be processed. I will develop endpoints that handle the image uploads, run detection models and return the final result. This integration will require optimizing performance so that the detection process remains fast and reliable for users. 

#### Student 2

Tom - frontend and image processing.

I will be responsible for image processing and developing the frontend of the application. The image processing part will take the areas found by the object detection models and apply a blur to hide face and license plates. It will use Python and OpenCV to blur or pixelate the selected regions.

The frontend will be a simple web page where users can upload an image and see the detected boxes around faces and plates. They can move, resize, or remove boxes to make sure the blur is correct. After they confirm, the image is processed and shown with the blurred areas.

### Risk Register

| Description                  | Likelihood | Severity | Mitigation |
|------------------------------|-------------|-----------|-------------|
| Incomplete or poor-quality training dataset | High | High | Collect more diverse and representative data; clean and preprocess existing datasets. |
| Poor model performance (underfitting/overfitting) | Medium | High | Optimize hyperparameters; use cross-validation; experiment with different model architectures. |
| Slow or blurry processing results (inefficient inference) | Medium | Medium | Optimize code and model for performance; use GPU acceleration or model quantization. |