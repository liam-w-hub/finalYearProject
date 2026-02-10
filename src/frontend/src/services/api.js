// frontend/src/services/api.js

const API_BASE = "http://localhost:5000";

/**
 * Sends an image to the backend for object detection.
 * Expected to return bounding boxes in original image pixel coordinates.
 */
export async function detectImage(file) {
  // Backend not implemented yet
  // This function defines the client–server contract
  return {
    boxes: [
      { x: 100, y: 80, w: 60, h: 60, label: "face", conf: 0.9 }
    ]
  };
}

/**
 * Sends user-confirmed bounding boxes for blurring.
 * Expected to return a blurred image.
 */
export async function blurImage(imageId, boxes) {
  // Backend not implemented yet
}