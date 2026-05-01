/**
 * Main Frontend Controller
 * ------------------------
 * Coordinates interaction between UI components and backend services.
 *
 * Responsibilities:
 * - Handles image upload and state management
 * - Triggers detection and blur API calls
 * - Updates UI elements (buttons, canvas, messages)
 * - Maintains current bounding box state
 */

import { detectImage, blurImage } from "./services/api.js";
import { initUpload } from "./ui/upload.js";
import { initCanvas, drawBoxes } from "./ui/canvas.js";
import { initEditor } from "./ui/editor.js";

let selectedFile = null;
let boxes = [];
let imageWidth = null;
let imageHeight = null;
let blurredImageUrl = null;

// Initialise application once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const detectBtn = document.getElementById("detectBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const output = document.getElementById("output");
  const preview = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");
  //const blurStrength = document.getElementById("blurStrength").value;

  console.log("Frontend initialised");

  initCanvas();

  // Initialise file upload handling and reset state on new file
  initUpload({
    onFileSelected: (file) => {
      selectedFile = file;
      detectBtn.disabled = false;
      confirmBtn.disabled = true;
      downloadBtn.disabled = true;
      blurredImageUrl = null;

      boxes = [];
      imageWidth = null;
      imageHeight = null;

      drawBoxes(boxes);
      output.textContent = "";
    },
  });

  initEditor({
    getBoxes: () => boxes,
    setBoxes: (newBoxes) => {
      boxes = newBoxes;
    },
    onChange: (currentBoxes, selectedBoxIndex) => {
      drawBoxes(currentBoxes, selectedBoxIndex);
    }
  });

  // Handles object detection request to backend
  detectBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    output.textContent = "Detecting...";
    confirmBtn.disabled = true;

    try {
      const result = await detectImage(selectedFile);

      imageWidth = result.width ?? null;
      imageHeight = result.height ?? null;

      if (result.boxes) {
        boxes = result.boxes;
      } else if (result.final_result) {
        boxes = result.final_result.map((bbox) => {
          const [x1, y1, x2, y2] = bbox;
          return {
            x: x1,
            y: y1,
            w: x2 - x1,
            h: y2 - y1,
            label: "face"
          };
        });
      } else {
        boxes = [];
      }

      drawBoxes(boxes);
      confirmBtn.disabled = boxes.length === 0;
      if (boxes.length > 0) {
        output.textContent = `Detected ${boxes.length} object(s), Click a box to select it, then press Delete on your keyboard to remove it`;
      } else {
        output.textContent = "No objects detected";
      }
    } catch (err) {
      console.error(err);
      output.textContent = "Detection failed";
    }
  });

  // Handles blur request and updates preview image
  confirmBtn.addEventListener("click", async () => {
    if (!selectedFile || boxes.length === 0) return;

    const blurStrength = document.getElementById("blurStrength").value;

    output.textContent = "Applying blur...";
    confirmBtn.disabled = true;

    try {
      const blurredBlob = await blurImage(selectedFile, boxes, blurStrength);
      blurredImageUrl = URL.createObjectURL(blurredBlob);

      preview.src = blurredImageUrl;
      downloadBtn.disabled = false;
      boxes = [];
      drawBoxes([]);
      output.textContent = "Blur complete";
    } catch (err) {
      console.error(err);
      output.textContent = "Blur failed";
      confirmBtn.disabled = false;
    }
  });
  
  downloadBtn.addEventListener("click", () => {
    if (!blurredImageUrl) return;

    const link = document.createElement("a");
    link.href = blurredImageUrl;
    link.download = "smart-blur-output.jpg";
    link.click();
  });
});