/**
 * Main Frontend Controller
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

// Stores the image selected by the user
let selectedFile = null;
// Stores the bounidng boxes
let boxes = [];
// Stores image dimensions returned by the backend
let imageWidth = null;
let imageHeight = null;
// Stores the temp browser URL for the blurred output image so it can be previewed and downloaded
let blurredImageUrl = null;

// Initialise application once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Finds main UI elements from the html
  const detectBtn = document.getElementById("detectBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const output = document.getElementById("output");
  const preview = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");

  console.log("Frontend initialised");

  // Initialises the canvas overlay
  initCanvas();

  // Initialise file upload handling and reset state on new file
  initUpload({
    onFileSelected: (file) => {
      // Stores the uploaded image
      selectedFile = file;
      // Enables detection, disables blur/download until they are ready, 
      // and clears any previous blurred image
      detectBtn.disabled = false;
      confirmBtn.disabled = true;
      downloadBtn.disabled = true;
      blurredImageUrl = null;

      // Clears any previous detection data
      boxes = [];
      imageWidth = null;
      imageHeight = null;

      // Clears the canvas and any previous status message
      drawBoxes(boxes);
      output.textContent = "";
    },
  });

  // Initialises the bounding box editor
  initEditor({
    // Allows the editor to read the current boxes
    getBoxes: () => boxes,
    // Allows the editor to update the boxes after editing
    setBoxes: (newBoxes) => {
      boxes = newBoxes;
    },
    // Redraws the canvas whenever the boxes change or a new box is selected
    onChange: (currentBoxes, selectedBoxIndex) => {
      drawBoxes(currentBoxes, selectedBoxIndex);
    }
  });

  // Handles object detection request to backend
  // This runs when the user clicks Detect
  detectBtn.addEventListener("click", async () => {
    // Stops if no image has been uploaded
    if (!selectedFile) return;

    // Displays loading message and disable blur while the detection is running
    output.textContent = "Detecting...";
    confirmBtn.disabled = true;

    try {
      // Sends the image to the backend /detect endpoint and waits for the result
      const result = await detectImage(selectedFile);

      // Stores image dimnestions if returned by the backend
      imageWidth = result.width ?? null;
      imageHeight = result.height ?? null;

      // Uses the backends normal boxes response format if its available
      if (result.boxes) {
        boxes = result.boxes;
      } 
      // Handles an older/ alternative backend reponse format 
      else if (result.final_result) {
        // Converts bouding boxes from (x1, y1, x2, y2) format
        boxes = result.final_result.map((bbox) => {
          const [x1, y1, x2, y2] = bbox;
          // Then converts them into (x, y, w, h) format for canvas drawing
          return {
            x: x1,
            y: y1,
            w: x2 - x1,
            h: y2 - y1,
            label: "face"
          };
        });
      } 
      // If no boxes are returned, this clears the list
      else {
        boxes = [];
      }

      // draws the detected boxes over the image
      drawBoxes(boxes);
      // Enalbes confirm and blur only if at least one box was detected
      confirmBtn.disabled = boxes.length === 0;
      // Displays a message explaining the reuslt and how to edit the boxes
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
  // This runs when the user clicks confirm and blur
  confirmBtn.addEventListener("click", async () => {
    // stops if there is no uploaded image or boxes to blur
    if (!selectedFile || boxes.length === 0) return;

    // This reads the blur strength chosen by the user
    const blurStrength = document.getElementById("blurStrength").value;

    output.textContent = "Applying blur...";
    // prevents blur requests during the loading message
    confirmBtn.disabled = true;

    try {
      // Sends the image, boxes and blur strength to the backend /blur endpoint
      const blurredBlob = await blurImage(selectedFile, boxes, blurStrength);
      // Creates a temp URL from the returned blurred image blob
      blurredImageUrl = URL.createObjectURL(blurredBlob);

      // Displays the blurred image in the preview area
      preview.src = blurredImageUrl;
      // This enables the downlaod button
      downloadBtn.disabled = false;
      // Clears bouding boxes after blurring 
      boxes = [];
      drawBoxes([]);
      output.textContent = "Blur complete";
    } catch (err) {
      console.error(err);
      output.textContent = "Blur failed";
      // re-enables the confirm button if the blurring fails
      confirmBtn.disabled = false;
    }
  });
  
  // This rusn when user clicks downlaod
  downloadBtn.addEventListener("click", () => {
    // Stops if no blurred image available
    if (!blurredImageUrl) return;

    // Creates a temp download link
    const link = document.createElement("a");
    // Then points the link at the blurred image
    link.href = blurredImageUrl;
    // This sets the downloaded filename
    link.download = "smart-blur-output.jpg";
    // Triggers the download automatically
    link.click();
  });
});