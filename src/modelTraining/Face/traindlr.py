from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/DatasetCRunLr/weights/best.pt")
    model.train(
        data= "C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/DatasetD/data.yaml",
        epochs=15,
        imgsz=640,
        batch=8,
        device=0,
        name = "DatasetDRunLr"
    )