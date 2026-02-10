import { detectImage } from "./services/api.js";
import { initUpload } from "./ui/upload.js";

let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {

    const detectBtn = document.getElementById("detectBtn");
    const output = document.getElementById("output");

    console.log("detectBtn:", detectBtn);

    initUpload({
        onFileSelected: (file) => {
            selectedFile = file;
            detectBtn.disabled = false;
            console.log("Selected file:", file).name;
        },
    });

    detectBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

    output.textContent = "Detecting...";
        try {
            const result = await detectImage(selectedFile);
            output.textContent = JSON.stringify(result, null, 2);
        } catch (err) {
            output.textContent = "Detection failed";
            console.error(err);
        }
     });
});