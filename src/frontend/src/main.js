import { detectImage } from "./services/api.js";
import { initUpload } from "./ui/upload.js";
import { initCanvas, drawBoxes } from "./ui/canvas.js";
import { initEditor } from "./ui/editor.js";

let selectedFile = null;
let boxes = [];

document.addEventListener("DOMContentLoaded", () => {
  const detectBtn = document.getElementById("detectBtn");
  const output = document.getElementById("output");

  console.log("Frontend initialised");

  initCanvas();

  initUpload({
    onFileSelected: (file) => {
      selectedFile = file;
      detectBtn.disabled = false;

      boxes = [];                 // reset boxes when new image selected
      drawBoxes(boxes);

      output.textContent = "";
    },
  });

  // Initialize editor
  initEditor({
    getBoxes: () => boxes,
    setBoxes: (newBoxes) => {
      boxes = newBoxes;
    },
    onChange: (currentBoxes, tempBox) => {
      drawBoxes(currentBoxes);

      // If dragging, draw temporary preview box
      if (tempBox) {
        drawBoxes([...currentBoxes, tempBox]);
      }
    }
  });

  detectBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    output.textContent = "Detecting...";

    try {
      const result = await detectImage(selectedFile);

      boxes = result.boxes || [];
      drawBoxes(boxes);

      output.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
      console.error(err);
      output.textContent = "Detection failed";
    }
  });
});