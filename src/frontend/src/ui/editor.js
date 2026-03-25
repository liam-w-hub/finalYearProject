let canvas = null;
let img = null;

let boxesRef = null;
let onBoxesChanged = null;

let selectedBoxIndex = -1;

let isResizing = false;
let resizeMode = null; // "topLeft" or "bottomRight"
const HANDLE_SIZE = 10;

/**
 * Enable editing of existing boxes only.
 * Current features:
 * - click box to select
 * - Delete / Backspace removes selected box
 * - drag bottom-right handle to resize selected box
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

  canvas.addEventListener("pointerdown", handleDown);
  canvas.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleUp);
  window.addEventListener("keydown", handleKeyDown);
}

export function destroyEditor() {
  if (!canvas) return;

  canvas.removeEventListener("pointerdown", handleDown);
  canvas.removeEventListener("pointermove", handleMove);
  window.removeEventListener("pointerup", handleUp);
  window.removeEventListener("keydown", handleKeyDown);

  canvas = null;
  img = null;
  boxesRef = null;
  onBoxesChanged = null;
  selectedBoxIndex = -1;
  isResizing = false;
}

function handleDown(e) {
  if (!canvas || e.button !== 0) return;

  const { x, y } = getCanvasPoint(e);
  const boxes = boxesRef.get();

  // if selected box exists and user clicked one of its resize handles, begin resizing
  if (selectedBoxIndex !== -1) {
    const selectedBox = boxes[selectedBoxIndex];

    if (selectedBox && isPointInTopLeftHandle(selectedBox, x, y)) {
      isResizing = true;
      resizeMode = "topLeft";
      canvas.setPointerCapture?.(e.pointerId);
      return;
    }

    if (selectedBox && isPointInBottomRightHandle(selectedBox, x, y)) {
      isResizing = true;
      resizeMode = "bottomRight";
      canvas.setPointerCapture?.(e.pointerId);
      return;
    }
  }

  // otherwise just select a box
  selectedBoxIndex = findBoxAtPoint(boxes, x, y);

  if (onBoxesChanged) {
    onBoxesChanged(boxes, selectedBoxIndex);
  }
}

function handleMove(e) {
  if (!isResizing || selectedBoxIndex === -1 || !boxesRef) return;

  const { x, y } = getCanvasPoint(e);
  const boxes = boxesRef.get();
  const box = boxes[selectedBoxIndex];
  if (!box) return;

  let updatedBox = { ...box };

  if (resizeMode === "bottomRight") {
    updatedBox.w = Math.max(5, x - box.x);
    updatedBox.h = Math.max(5, y - box.y);
  }

  if (resizeMode === "topLeft") {
    const right = box.x + box.w;
    const bottom = box.y + box.h;

    const newX = Math.min(x, right - 5);
    const newY = Math.min(y, bottom - 5);

    updatedBox.x = newX;
    updatedBox.y = newY;
    updatedBox.w = right - newX;
    updatedBox.h = bottom - newY;
  }

  const newBoxes = boxes.map((b, index) =>
    index === selectedBoxIndex ? updatedBox : b
  );

  boxesRef.set(newBoxes);

  if (onBoxesChanged) {
    onBoxesChanged(newBoxes, selectedBoxIndex);
  }
}

function handleUp() {
  isResizing = false;
  resizeMode = null;
}

function handleKeyDown(e) {
  if (selectedBoxIndex === -1 || !boxesRef) return;

  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();

    const boxes = boxesRef.get();
    const newBoxes = boxes.filter((_, index) => index !== selectedBoxIndex);

    boxesRef.set(newBoxes);
    selectedBoxIndex = -1;

    if (onBoxesChanged) {
      onBoxesChanged(newBoxes, selectedBoxIndex);
    }
  }
}

function findBoxAtPoint(boxes, x, y) {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const box = boxes[i];
    if (
      x >= box.x &&
      x <= box.x + box.w &&
      y >= box.y &&
      y <= box.y + box.h
    ) {
      return i;
    }
  }
  return -1;
}

function isPointInTopLeftHandle(box, x, y) {
  return (
    x >= box.x &&
    x <= box.x + HANDLE_SIZE &&
    y >= box.y &&
    y <= box.y + HANDLE_SIZE
  );
}

function isPointInBottomRightHandle(box, x, y) {
  const handleLeft = box.x + box.w - HANDLE_SIZE;
  const handleTop = box.y + box.h - HANDLE_SIZE;

  return (
    x >= handleLeft &&
    x <= box.x + box.w &&
    y >= handleTop &&
    y <= box.y + box.h
  );
}

function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}