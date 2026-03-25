import { detectImage, blurImage } from "./services/api.js";
import { initUpload } from "./ui/upload.js";
import { initCanvas, drawBoxes } from "./ui/canvas.js";
import { initEditor } from "./ui/editor.js";

let selectedFile = null;
let boxes = [];
let imageWidth = null;
let imageHeight = null;

document.addEventListener("DOMContentLoaded", () => {
  const detectBtn = document.getElementById("detectBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const output = document.getElementById("output");
  const preview = document.getElementById("preview");

  console.log("Frontend initialised");

  initCanvas();

  initUpload({
    onFileSelected: (file) => {
      selectedFile = file;
      detectBtn.disabled = false;
      confirmBtn.disabled = true;

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
      output.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
      console.error(err);
      output.textContent = "Detection failed";
    }
  });

  confirmBtn.addEventListener("click", async () => {
    if (!selectedFile || boxes.length === 0) return;

    output.textContent = "Applying blur...";
    confirmBtn.disabled = true;

    try {
      const blurredBlob = await blurImage(selectedFile, boxes);
      const blurredUrl = URL.createObjectURL(blurredBlob);

      preview.src = blurredUrl;
      boxes = [];
      drawBoxes([]);
      output.textContent = "Blur complete";
    } catch (err) {
      console.error(err);
      output.textContent = "Blur failed";
      confirmBtn.disabled = false;
    }
  });
});