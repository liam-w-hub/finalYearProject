let canvasEl = null;
let ctx = null;
let imgEl = null;

/**
 * Initialise the canvas overlay on top of the preview image.
 * Expects:
 *  - <img id="preview" ... />
 *  - <canvas id="overlay"></canvas>
 */
export function initCanvas() {
  imgEl = document.getElementById("preview");
  canvasEl = document.getElementById("overlay");

  if (!imgEl) throw new Error("Missing #preview <img> in index.html");
  if (!canvasEl) throw new Error("Missing #overlay <canvas> in index.html");

  ctx = canvasEl.getContext("2d");

  // Keep canvas sized to match the displayed image size
  const resizeToMatchImage = () => {
    // Natural size isn't helpful for screen overlay; we want displayed size
    const rect = imgEl.getBoundingClientRect();
    canvasEl.width = Math.max(1, Math.round(rect.width));
    canvasEl.height = Math.max(1, Math.round(rect.height));
    clearCanvas();
  };

  // When the image loads/changes, resize overlay
  imgEl.addEventListener("load", resizeToMatchImage);

  // If the user resizes window, overlay may need resizing too
  window.addEventListener("resize", resizeToMatchImage);

  // In case image is already loaded (cached)
  if (imgEl.complete && imgEl.naturalWidth > 0) {
    resizeToMatchImage();
  }
}

export function clearCanvas() {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
}

/**
 * Draw boxes on the overlay.
 * Assumes boxes are already in DISPLAY coordinates.
 * (For now, this is fine for your stub. Later you'll transform from original pixels.)
 */
export function drawBoxes(boxes = []) {
  if (!ctx || !canvasEl || !imgEl) return;

  // ✅ Ensure canvas matches displayed image size every time we draw
  const rect = imgEl.getBoundingClientRect();
  canvasEl.width = Math.max(1, Math.round(rect.width));
  canvasEl.height = Math.max(1, Math.round(rect.height));

  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "lime";

  for (const b of boxes) {
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  }
}

/**
 * Helper: Convert original-image pixel boxes to display-space boxes.
 * Use this when backend returns boxes in ORIGINAL pixels.
 */
export function toDisplayBoxes(originalBoxes, originalW, originalH) {
  if (!imgEl || !canvasEl) return originalBoxes;

  const displayW = canvasEl.width;
  const displayH = canvasEl.height;

  const scaleX = displayW / originalW;
  const scaleY = displayH / originalH;

  return originalBoxes.map((b) => ({
    ...b,
    x: b.x * scaleX,
    y: b.y * scaleY,
    w: b.w * scaleX,
    h: b.h * scaleY,
  }));
}