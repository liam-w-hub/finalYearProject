from ultralytics import YOLO

model = YOLO("C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/train/weights/last.pt")

if __name__ == "__main__":
    model.train(
        data= "C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/DatasetD/data.yaml",
        epochs=5,
        imgsz=640,
        batch=8,
        device=0
    )