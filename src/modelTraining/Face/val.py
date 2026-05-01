from ultralytics import YOLO

models = {
    'Baseline': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/baseline2/weights/best.pt',
    'Model A': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/DatasetARun/weights/faceBestA.pt',
    'Model B': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/DatasetBRun/weights/faceBestB.pt',
    'Model C': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/DatasetCRun/weights/faceBestCLr.pt',
    'Model D': 'C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/runs/detect/DatasetDRun/weights/faceBestDLr.pt',
}

if __name__ == "__main__":
    for name, path in models.items():
        print(f"\n===== {name} =====")
        model = YOLO(path)
        print(f"Loaded: {path}")
        results = model.val(data='C:/Users/liamw/new4thProject/2026-csc1097-wraftel-3-clarkt-26/src/modelTraining/Face/DatasetD/data.yaml')
        print(f"Precision:  {results.box.p.mean():.4f}")
        print(f"Recall:     {results.box.r.mean():.4f}")
        print(f"mAP@50:     {results.box.map50:.4f}")
        print(f"mAP@50-95:  {results.box.map:.4f}")