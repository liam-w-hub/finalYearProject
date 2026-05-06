// Export a function that converts bounding boxes from original image size to display size
export function toDisplayBox(box, originalSize, displaySize) {
  // Calculate the horizontal scale factor between display width and original width
  const scaleX = displaySize.w / originalSize.w;
  // Calculate the vertical scale factor between display height and original height
  const scaleY = displaySize.h / originalSize.h;

  // Return a new box object with scaled coordinates and dimensions
  return {
    // Copy all existing properties from the original box
    ...box,
    // Scale the x coordinate to match the displayed image
    x: box.x * scaleX,
    // Scale the y coordinate to match the displayed image
    y: box.y * scaleY,
    // Scale the box width to match the displayed image
    w: box.w * scaleX,
    // Scale the box height to match the displayed image
    h: box.h * scaleY,
  };
}

// Export a function that converts bounding boxes from display size back to original image size
export function toOriginalBox(box, originalSize, displaySize) {
  // Calculate the horizontal scale factor between original width and display width
  const scaleX = originalSize.w / displaySize.w;
  // Calculate the vertical scale factor between original height and display height
  const scaleY = originalSize.h / displaySize.h;

  // Return a new box object with coordinates scaled back to the original image
  return {
    // Copy all existing properties from the display-space box
    ...box,
    // Convert the x coordinate back to original image pixels
    x: box.x * scaleX,
    // Convert the y coordinate back to original image pixels
    y: box.y * scaleY,
    // Convert the width back to original image pixels
    w: box.w * scaleX,
    // Convert the height back to original image pixels
    h: box.h * scaleY,
  };
}

// Export a function that keeps a bounding box within image/canvas boundaries
export function clampBox(box, bounds) {
  // Ensure the x coordinate is not less than 0
  let x = Math.max(0, box.x);
  // Ensure the y coordinate is not less than 0
  let y = Math.max(0, box.y);
  // Ensure the width is not negative
  let w = Math.max(0, box.w);
  // Ensure the height is not negative
  let h = Math.max(0, box.h);

  // If box extends beyond the edge, shrink its width
  if (x + w > bounds.w) w = Math.max(0, bounds.w - x);
  // If the box extends beyond the bottom edge, shrink its height
  if (y + h > bounds.h) h = Math.max(0, bounds.h - y);

  // Return the corrected box while preserving any other properties
  return { ...box, x, y, w, h };
}