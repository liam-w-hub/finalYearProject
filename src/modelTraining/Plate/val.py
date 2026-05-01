from ultralytics import YOLO

models = {
    'Baseline': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/runs/detect/baseline/weights/best.pt',
    'Model A': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/runs/detect/train3/weights/plateBestA.pt',
    'Model B': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/runs/detect/DatasetBRun/weights/plateBestB.pt',
    'Model C': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/runs/detect/DatasetCRun/weights/plateBestC.pt',
    'Model D': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/runs/detect/DatasetDRun/weights/plateBestD.pt',
}

if __name__ == "__main__":
    for name, path in models.items():
        print(f"\n===== {name} =====")
        model = YOLO(path)
        print(f"Loaded: {path}")
        results = model.val(data='C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Plate/DatasetD/data.yaml')
        print(f"Precision:  {results.box.p.mean():.4f}")
        print(f"Recall:     {results.box.r.mean():.4f}")
        print(f"mAP@50:     {results.box.map50:.4f}")
        print(f"mAP@50-95:  {results.box.map:.4f}")