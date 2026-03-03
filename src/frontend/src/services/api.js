// frontend/src/services/api.js

//const API_BASE = "http://localhost:5000";
const API_BASE = "http://127.0.0.1:5000";

/**
 * Sends an image to the backend for object detection.
 * Expected to return bounding boxes in original image pixel coordinates.
 */

export async function detectImage(file) {
  const form = new FormData();
  form.append("image", file);
  //form.append("type", type);

  const res = await fetch(`${API_BASE}/detect`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Detect failed: ${res.status}`);
  }

  return await res.json();
}

/**
 * Sends user-confirmed bounding boxes for blurring.
 * Expected to return a blurred image.
 */
export async function blurImage(imageId, boxes) {
  // Backend not implemented yet
}