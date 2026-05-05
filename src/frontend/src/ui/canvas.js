// Stores the canvas element
let canvasEl = null;
// Stores the 2D drawing context of the canvas
let ctx = null;
// Stores the image element
let imgEl = null;


//Initialise the canvas overlay on top of the preview image.
export function initCanvas() {
  // Gets the image element from the DOM
  imgEl = document.getElementById("preview");
  // Gets the cnavas element from the DOM
  canvasEl = document.getElementById("overlay");

  // Throws an error if the image element is missing
  if (!imgEl) throw new Error("Missing #preview <img> in index.html");
  // Throws an error if the canvas element is missing
  if (!canvasEl) throw new Error("Missing #overlay <canvas> in index.html");

  // Gets the 2D drawing context used for rendering on the canvas
  ctx = canvasEl.getContext("2d");

  // Function to resize the canvas so it matches the displayed image size
  const resizeToMatchImage = () => {
    // Get the displayed size and position of the image
    const rect = imgEl.getBoundingClientRect();
    // Set canvas width to match image width (minimum 1 to avoid errors)
    canvasEl.width = Math.max(1, Math.round(rect.width));
    // Set canvas height to match image height
    canvasEl.height = Math.max(1, Math.round(rect.height));
    // This clears the canvas after resizing
    clearCanvas();
  };

  // When the image loads, resize the canvas to match it
  imgEl.addEventListener("load", resizeToMatchImage);

  // When the window is resized, update the canvas size
  window.addEventListener("resize", resizeToMatchImage);

  // If the image is already loaded, resizes immediately
  if (imgEl.complete && imgEl.naturalWidth > 0) {
    resizeToMatchImage();
  }
}

// Function to clear everytihng on the canvas
export function clearCanvas() {
  // If the canvas or context is not available, then do nothing
  if (!ctx || !canvasEl) return;
  // Clears the canvas area
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
}

export function drawBoxes(boxes = [], selectedBoxIndex = -1) {
  // If required elements are missing, stop excecution
  if (!ctx || !canvasEl || !imgEl) return;

  // Get the displayed size of the image
  const rect = imgEl.getBoundingClientRect();
   // Update canvas width to match image width
  canvasEl.width = Math.max(1, Math.round(rect.width));
  // Update canvas height to match image height
  canvasEl.height = Math.max(1, Math.round(rect.height));

  // Clear any previously drawn boxes
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // Loop through each bounding box
  boxes.forEach((b, index) => {
    const isSelected = index === selectedBoxIndex;

    // Set line thickness for box borders
    ctx.lineWidth = 3;
    // Sets colour to green, yellow if selected
    ctx.strokeStyle = isSelected ? "yellow" : "lime";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    if (b.label) {
      ctx.fillStyle = isSelected ? "yellow" : "lime";
      ctx.font = "14px Arial";
      // Draws label sligtly above the box
      ctx.fillText(b.label, b.x, Math.max(12, b.y - 4));
    }

    // draw resize handles on selected box
    if (isSelected) {
      const handleSize = 10;
      ctx.fillStyle = "yellow";

      // top-left handle
      ctx.fillRect(
        b.x,
        b.y,
        handleSize,
        handleSize
      );

      // bottom-right handle
      ctx.fillRect(
        b.x + b.w - handleSize,
        b.y + b.h - handleSize,
        handleSize,
        handleSize
      );
    }
  });
}

// Function to scale bounding boxes from original image size to displayed size
export function toDisplayBoxes(originalBoxes, originalW, originalH) {
  // If elements are missing, return original boxes unchanged
  if (!imgEl || !canvasEl) return originalBoxes;

  // Gets the current canvas width
  const displayW = canvasEl.width;
  // Gets the current canvas height
  const displayH = canvasEl.height;

  // Calculates the horiontal scaling factor
  const scaleX = displayW / originalW;
  // Calculates the vertical scaling factor
  const scaleY = displayH / originalH;

  // Convert each bounding box to display coordinates
  return originalBoxes.map((b) => ({
    ...b,
    // Scales x coordinate
    x: b.x * scaleX,
    // Scales y coordinate
    y: b.y * scaleY,
    // Scales width
    w: b.w * scaleX,
    // Scales height
    h: b.h * scaleY,
  }));
}