/* Converting bounding box coordinates between different coordinate spaces. */

/**
 * Convert a box from ORIGINAL image pixels to DISPLAY pixels.
 * @param {{x:number,y:number,w:number,h:number}} box
 * @param {{w:number,h:number}} originalSize
 * @param {{w:number,h:number}} displaySize
*/
export function toDisplayBox(box, originalSize, displaySize) {
  const scaleX = displaySize.w / originalSize.w;
  const scaleY = displaySize.h / originalSize.h;

  return {
    ...box,
    x: box.x * scaleX,
    y: box.y * scaleY,
    w: box.w * scaleX,
    h: box.h * scaleY,
  };
}

/**
 * Convert a box from DISPLAY pixels to ORIGINAL image pixels.
 * @param {{x:number,y:number,w:number,h:number}} box
 * @param {{w:number,h:number}} originalSize
 * @param {{w:number,h:number}} displaySize
 */
export function toOriginalBox(box, originalSize, displaySize) {
  const scaleX = originalSize.w / displaySize.w;
  const scaleY = originalSize.h / displaySize.h;

  return {
    ...box,
    x: box.x * scaleX,
    y: box.y * scaleY,
    w: box.w * scaleX,
    h: box.h * scaleY,
  };
}

/**
 * Clamp box so it stays inside bounds (0..W/H).
 * Useful before drawing or before sending to backend.
 * @param {{x:number,y:number,w:number,h:number}} box
 * @param {{w:number,h:number}} bounds
 */
export function clampBox(box, bounds) {
  let x = Math.max(0, box.x);
  let y = Math.max(0, box.y);
  let w = Math.max(0, box.w);
  let h = Math.max(0, box.h);

  // If box extends beyond the edge, shrink it
  if (x + w > bounds.w) w = Math.max(0, bounds.w - x);
  if (y + h > bounds.h) h = Math.max(0, bounds.h - y);

  return { ...box, x, y, w, h };
}