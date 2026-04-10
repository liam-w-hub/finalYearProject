/**
 * Upload Module
 * -------------
 * Handles image file selection from the user.
 *
 * Responsibilities:
 * - Reads selected file from input
 * - Updates preview image
 * - Updates status text
 * - Notifies main controller via callback
 */


/**
 * Initialises the image upload input.
 *
 * Adds a change event listener to the file input element,
 * updates the preview image, and triggers a callback when
 * a file is selected.
 *
 * @param {Object} options
 * @param {Function} options.onFileSelected - Callback triggered when a file is selected
 */
export function initUpload({ onFileSelected }) {
  const input = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");

  if (!input) throw new Error("Missing #imageInput in index.html");
  if (!preview) throw new Error("Missing #preview in index.html");
  if (!status) throw new Error("Missing #status in index.html");

  // Handle file selection and update UI
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    status.textContent = `Status: Selected ${file.name || "(unnamed file)"}`;

    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";

    if (typeof onFileSelected === "function") {
      onFileSelected(file);
    }
  });
}