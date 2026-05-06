// Stores a reference to the canvas overlay element
let canvas = null;
// Stores a reference to the preview image element
let img = null;

// Stores the getter and setter functions for the current bounding boxes
let boxesRef = null;
// Store a callback function that runs when boxes change
let onBoxesChanged = null;

// Tracks which bounding box is currently selected
let selectedBoxIndex = -1;

// Track whether the user is currently resizing a box
let isResizing = false;
// Track which resize handle is being used
let resizeMode = null; 
// Defines the size of the resize handle squares
const HANDLE_SIZE = 10;

// Exported function that initialises the editor
export function initEditor(opts) {
  // Get the canvas overlay from the HTML page
  canvas = document.getElementById("overlay");
  // Get the preview image from the HTML page
  img = document.getElementById("preview");

  // Throw an error if the canvas element is missing
  if (!canvas) throw new Error("Missing #overlay canvas in index.html");
  // Throw an error if the preview image element is missing
  if (!img) throw new Error("Missing #preview img in index.html");

  // Check that required callback functions have been provided
  if (typeof opts?.getBoxes !== "function" || typeof opts?.setBoxes !== "function") {
    throw new Error("initEditor requires getBoxes and setBoxes functions");
  }

  // Store the get and set box functions so this module can read/update boxes
  boxesRef = { get: opts.getBoxes, set: opts.setBoxes };
  // Store the optional change callback if it was provided
  onBoxesChanged = typeof opts.onChange === "function" ? opts.onChange : null;

  // Listen for pointer down events to select boxes or start resizing
  canvas.addEventListener("pointerdown", handleDown);
  // Listen for pointer movement while resizing a selected box
  canvas.addEventListener("pointermove", handleMove);
  // Listen globally for pointer release to stop resizing
  window.addEventListener("pointerup", handleUp);
  // Listen globally for keyboard input such as Delete or Backspace
  window.addEventListener("keydown", handleKeyDown);
}

// Exported function used to remove editor behaviour and reset state
export function destroyEditor() {
  // If the editor has not been initialised, do nothing
  if (!canvas) return;

  // Remove pointer down listener from the canvas
  canvas.removeEventListener("pointerdown", handleDown);
  // Remove pointer move listener from the canvas
  canvas.removeEventListener("pointermove", handleMove);
  // Remove pointer up listener from the window
  window.removeEventListener("pointerup", handleUp);
  // Remove keyboard listener from the window
  window.removeEventListener("keydown", handleKeyDown);

  // Clear the canvas reference
  canvas = null;
  // Clear the image reference
  img = null;
  // Clear the box reference callbacks
  boxesRef = null;
  // Clear the change callback
  onBoxesChanged = null;
  // Reset selected box state
  selectedBoxIndex = -1;
  // Reset resizing state
  isResizing = false;
}

// Function that runs when the user clicks/presses on the canvas
function handleDown(e) {
  // Ignore the event if there is no canvas or if it was not a left-click
  if (!canvas || e.button !== 0) return;

  // Convert the pointer position into canvas coordinates
  const { x, y } = getCanvasPoint(e);
  // Get the current list of bounding boxes
  const boxes = boxesRef.get();

  // If a box is already selected, check whether the user clicked a resize handle
  if (selectedBoxIndex !== -1) {
     // Get the currently selected box
    const selectedBox = boxes[selectedBoxIndex];

    // Check whether the pointer is inside the selected box's top-left resize handle
    if (selectedBox && isPointInTopLeftHandle(selectedBox, x, y)) {
      // Mark that resizing has started
      isResizing = true;
      // Store which handle is being used
      resizeMode = "topLeft";
      // Capture pointer movement for smoother resizing if supported
      canvas.setPointerCapture?.(e.pointerId);
      // Stop further selection logic
      return;
    }

    // Check whether the pointer is inside the selected box's bottom-right resize handle
    if (selectedBox && isPointInBottomRightHandle(selectedBox, x, y)) {
      // Mark that resizing has started
      isResizing = true;
      // Store which handle is being used
      resizeMode = "bottomRight";
      // Capture pointer movement for smoother resizing if supported
      canvas.setPointerCapture?.(e.pointerId);
      // Stop further selection logic
      return;
    }
  }

  // If no resize handle was clicked, select the box under the pointer
  selectedBoxIndex = findBoxAtPoint(boxes, x, y);

  // If a change callback exists, redraw/update the UI with the selected box
  if (onBoxesChanged) {
    onBoxesChanged(boxes, selectedBoxIndex);
  }
}

// Function that runs when the pointer moves over the canvas
function handleMove(e) {
  // Stop if resizing is not active, no box is selected, or box state is unavailable
  if (!isResizing || selectedBoxIndex === -1 || !boxesRef) return;

  // Convert the pointer position into canvas coordinates
  const { x, y } = getCanvasPoint(e);
  // Get the current bounding boxes
  const boxes = boxesRef.get();
  // Get the selected box
  const box = boxes[selectedBoxIndex];
  // Stop if the selected box no longer exists
  if (!box) return;

  // Create a copy of the selected box to modify safely
  let updatedBox = { ...box };

  // If resizing from the bottom-right handle
  if (resizeMode === "bottomRight") {
    // Update width while enforcing a minimum width of 5 pixels
    updatedBox.w = Math.max(5, x - box.x);
    // Update height while enforcing a minimum height of 5 pixels
    updatedBox.h = Math.max(5, y - box.y);
  }

  // If resizing from the top-left handle
  if (resizeMode === "topLeft") {
    // Calculate the fixed right edge of the original box
    const right = box.x + box.w;
    // Calculate the fixed bottom edge of the original box
    const bottom = box.y + box.h;

    // Calculate new x position while keeping at least 5 pixels width
    const newX = Math.min(x, right - 5);
    // Calculate new y position while keeping at least 5 pixels height
    const newY = Math.min(y, bottom - 5);

    // Update the box x coordinate
    updatedBox.x = newX;
    // Update the box y coordinate
    updatedBox.y = newY;
    // Recalculate width based on the fixed right edge
    updatedBox.w = right - newX;
    // Recalculate height based on the fixed bottom edge
    updatedBox.h = bottom - newY;
  }

  // Replace only the selected box with the updated version
  const newBoxes = boxes.map((b, index) =>
    index === selectedBoxIndex ? updatedBox : b
  );

  // Save the updated boxes back to the main controller
  boxesRef.set(newBoxes);

  // Notify the main controller so the canvas can be redrawn
  if (onBoxesChanged) {
    onBoxesChanged(newBoxes, selectedBoxIndex);
  }
}

// Stops resizing when pointer is released
function handleUp() {
  // Mark resizing as inactive
  isResizing = false;
  // Clear the active resize mode
  resizeMode = null;
}

// Function that handles keyboard events
function handleKeyDown(e) {
  // Stop if no box is selected or box state is unavailable
  if (selectedBoxIndex === -1 || !boxesRef) return;

  // Check if the pressed key is Delete or Backspace
  if (e.key === "Delete" || e.key === "Backspace") {
    // Prevent the browser's default delete/backspace behaviour
    e.preventDefault();

    // Get the current boxes
    const boxes = boxesRef.get();
    // Create a new list excluding the selected box
    const newBoxes = boxes.filter((_, index) => index !== selectedBoxIndex);

    // Save the updated box list
    boxesRef.set(newBoxes);
    // Clear the current selection
    selectedBoxIndex = -1;

    // Notify the main controller so the canvas can be redrawn
    if (onBoxesChanged) {
      onBoxesChanged(newBoxes, selectedBoxIndex);
    }
  }
}

// Function used to determine which box, if any, was clicked
function findBoxAtPoint(boxes, x, y) {
  // Loop backwards so the most recently drawn/top-most box is checked first
  for (let i = boxes.length - 1; i >= 0; i--) {
    // Get the current box
    const box = boxes[i];
    // Check whether the point is inside this box
    if (
      x >= box.x &&
      x <= box.x + box.w &&
      y >= box.y &&
      y <= box.y + box.h
    ) {
      // Return the index of the box that contains the point
      return i;
    }
  }
  // Return -1 if the point is not inside any box
  return -1;
}

// Function that checks whether a point is inside the top-left resize handle
function isPointInTopLeftHandle(box, x, y) {
  // Return true if the point falls inside the top-left handle area
  return (
    x >= box.x &&
    x <= box.x + HANDLE_SIZE &&
    y >= box.y &&
    y <= box.y + HANDLE_SIZE
  );
}

// Function that checks whether a point is inside the bottom-right resize handle
function isPointInBottomRightHandle(box, x, y) {
  // Calculate the left edge of the bottom-right handle
  const handleLeft = box.x + box.w - HANDLE_SIZE;
  // Calculate the top edge of the bottom-right handle
  const handleTop = box.y + box.h - HANDLE_SIZE;

  // Return true if the point falls inside the bottom-right handle area
  return (
    x >= handleLeft &&
    x <= box.x + box.w &&
    y >= handleTop &&
    y <= box.y + box.h
  );
}

// Function that converts browser pointer coordinates into canvas coordinates
function getCanvasPoint(e) {
  // Get the canvas position and dimensions on the page
  const rect = canvas.getBoundingClientRect();

  // Return coordinates relative to the canvas top-left corner
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}