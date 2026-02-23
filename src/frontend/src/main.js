import { detectImage } from "./services/api.js";
import { initUpload } from "./ui/upload.js";
import { initCanvas, drawBoxes } from "./ui/canvas.js";

let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {

    const detectBtn = document.getElementById("detectBtn");
    const output = document.getElementById("output");

    console.log("Frontend initialised");

    initCanvas();

    initUpload({
        onFileSelected: (file) => {
        selectedFile = file;

        // enable detect
        detectBtn.disabled = false;

        // safe logging
        console.log("Selected file:", file);

        // clear output and overlay (optional)
        output.textContent = "";
        // drawBoxes([]);  // only if you already imported it
        },
    });

    detectBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

    output.textContent = "Detecting...";
        try {
            const result = await detectImage(selectedFile);
            output.textContent = JSON.stringify(result, null, 2);
            drawBoxes(result.boxes || []);
        } catch (err) {
            console.error(err);
            output.textContent = "Detection failed";
        }
    });
});