import numpy as np
from types import SimpleNamespace

from backend.app import finalBox


class DummyArray:
    def __init__(self, arr):
        self.arr = np.array(arr)

    def numpy(self):
        return self.arr


class DummyBoxes:
    def __init__(self, arr):
        self.xyxy = DummyArray(arr)


def test_final_box_averages_coordinates():
    result1 = [SimpleNamespace(boxes=DummyBoxes([[10, 20, 30, 40]]))]
    result2 = [SimpleNamespace(boxes=DummyBoxes([[20, 30, 40, 50]]))]

    results_array = [result1, result2]

    output = finalBox(results_array, 1)

    assert output == [[15.0, 25.0, 35.0, 45.0]]

def test_final_box_single_model():
    result = [SimpleNamespace(boxes=DummyBoxes([[10, 20, 30, 40]]))]
    results_array = [result]

    output = finalBox(results_array, 1)

    assert output == [[10.0, 20.0, 30.0, 40.0]]

def test_final_box_multiple_boxes():
    result1 = [SimpleNamespace(boxes=DummyBoxes([
        [10, 20, 30, 40],
        [50, 60, 70, 80]
    ]))]

    result2 = [SimpleNamespace(boxes=DummyBoxes([
        [20, 30, 40, 50],
        [60, 70, 80, 90]
    ]))]

    results_array = [result1, result2]

    output = finalBox(results_array, 2)

    assert output == [
        [15.0, 25.0, 35.0, 45.0],
        [55.0, 65.0, 75.0, 85.0]
    ]

    # This test verifies that the finalBox function correctly 
    # averages bounding box coordinates produced by multiple detection models.
    # It uses mock detection results to ensure the function returns the expected 
    # combined bounding box values in a controlled and predictable scenario.