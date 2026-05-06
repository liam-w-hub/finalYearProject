// Store the base URL of the Flask backend server
const API_BASE = "http://127.0.0.1:5000";

/**
 * Sends an image to the backend for object detection.
 * Expected to return bounding boxes in original image pixel coordinates.
 */

// Export an asynchronous function used to send an image for object detection
export async function detectImage(file) {
  // Create a new FormData object for sending multipart form data
  const form = new FormData();
  // Append the uploaded image file to the form data
  form.append("image", file);

  // Send a POST request to the backend /detect endpoint
  const res = await fetch(`${API_BASE}/detect`, {
    // Specify that this request uses the POST method
    method: "POST",
    // Attach the FormData containing the image
    body: form,
  });

  // Check whether the request failed
  if (!res.ok) {
    // Throw an error containing the HTTP status code
    throw new Error(`Detect failed: ${res.status}`);
  }

  // Convert the JSON response into a JavaScript object and return it
  return await res.json();
}

// Export an asynchronous function used to send boxes for blurring
export async function blurImage(file, boxes, blurStrength) {
  // Create a new FormData object for the blur request
  const form = new FormData();
  // Append the original uploaded image to the request
  form.append("image", file);
  // Convert the bounding box array into JSON and append it
  form.append("boxes", JSON.stringify(boxes));
  // Append the selected blur strength value
  form.append("strength", blurStrength);
  // Log the blur strength value for debugging purposes
  console.log("FINAL strength sent:", blurStrength);
  // Send a POST request to the backend /blur endpoint
  const res = await fetch(`${API_BASE}/blur`, {
    // Specify that this request uses the POST method
    method: "POST",
    // Attach the FormData containing the image and boxes
    body: form,
  });

  // Check whether the request failed
  if (!res.ok) {
    // Throw an error containing the HTTP status code
    throw new Error(`Blur failed: ${res.status}`);
  }

  // Return the response as a binary Blob object representing the blurred image
  return await res.blob();
}