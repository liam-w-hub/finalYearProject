from ultralytics import YOLO

model = YOLO("yolov8n.pt")

if __name__ == "__main__":
    model.train(
        data= "C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/DatasetD/data.yaml",
        epochs=15,
        imgsz=640,
        batch=8,
        device=0,
        name="baseline"
    )