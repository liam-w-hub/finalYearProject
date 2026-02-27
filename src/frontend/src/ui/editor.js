// frontend/src/ui/editor.js

let canvas = null;
let img = null;

let boxesRef = null;          // reference to array in main.js
let onBoxesChanged = null;    // callback to redraw

let isDrawing = false;
let startX = 0;
let startY = 0;
let tempBox = null;

/**
 * Enable "draw box with mouse" behaviour on the overlay canvas.
 *
 * Requirements in HTML:
 *  - <img id="preview" ...>
 *  - <canvas id="overlay"></canvas>
 *
 * @param {{
 *   getBoxes: () => Array,
 *   setBoxes: (boxes:Array) => void,
 *   onChange?: (boxes:Array, tempBox?:object|null) => void
 * }} opts
 */
export function initEditor(opts) {
  canvas = document.getElementById("overlay");
  img = document.getElementById("preview");

  if (!canvas) throw new Error("Missing #overlay canvas in index.html");
  if (!img) throw new Error("Missing #preview img in index.html");

  if (typeof opts?.getBoxes !== "function" || typeof opts?.setBoxes !== "function") {
    throw new Error("initEditor requires getBoxes and setBoxes functions");
  }

  boxesRef = { get: opts.getBoxes, set: opts.setBoxes };
  onBoxesChanged = typeof opts.onChange === "function" ? opts.onChange : null;

  // Use pointer events so it works with mouse and trackpad consistently
  canvas.addEventListener("pointerdown", handleDown);
  canvas.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleUp);
}

/** Optional: disable editing later */
export function destroyEditor() {
  if (!canvas) return;
  canvas.removeEventListener("pointerdown", handleDown);
  canvas.removeEventListener("pointermove", handleMove);
  window.removeEventListener("pointerup", handleUp);
  canvas = null;
  img = null;
  boxesRef = null;
  onBoxesChanged = null;
}

function handleDown(e) {
  if (!canvas) return;

  // Only draw if left-click / primary pointer
  if (e.button !== 0) return;

  const { x, y } = getCanvasPoint(e);
  isDrawing = true;
  startX = x;
  startY = y;
  tempBox = { x, y, w: 0, h: 0 };

  canvas.setPointerCapture?.(e.pointerId);

  if (onBoxesChanged) onBoxesChanged(boxesRef.get(), tempBox);
}

function handleMove(e) {
  if (!isDrawing || !canvas) return;

  const { x, y } = getCanvasPoint(e);

  const left = Math.min(startX, x);
  const top = Math.min(startY, y);
  const w = Math.abs(x - startX);
  const h = Math.abs(y - startY);

  tempBox = { x: left, y: top, w, h };

  if (onBoxesChanged) onBoxesChanged(boxesRef.get(), tempBox);
}

function handleUp(e) {
  if (!isDrawing) return;

  isDrawing = false;

  // Finalise: only add if it’s not tiny
  if (tempBox && tempBox.w >= 5 && tempBox.h >= 5) {
    const current = boxesRef.get();
    boxesRef.set([...current, { ...tempBox, label: "manual" }]);
  }

  tempBox = null;

  if (onBoxesChanged) onBoxesChanged(boxesRef.get(), null);
}

function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();

  // Map client coords into canvas coords
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}