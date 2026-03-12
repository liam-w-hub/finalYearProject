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

    try {
      const result = await detectImage(selectedFile);

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
      output.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
      console.error(err);
      output.textContent = "Detection failed";
    }
  });
});