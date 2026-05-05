// Exports a function that sets up the upload functionality and accepts a callback
export function initUpload({ onFileSelected }) {
  // Gets the file input element from the HTML
  const input = document.getElementById("imageInput");
  // Get the image preview element where the uploaded image will be displayed
  const preview = document.getElementById("preview");
  // Get the status text element used to display messages to the user
  const status = document.getElementById("status");

  // Throw an error if the file input element is missing
  if (!input) throw new Error("Missing #imageInput in index.html");
  // Throw an error if the preview image element is missing
  if (!preview) throw new Error("Missing #preview in index.html");
  // Throw an error if the status text element is missing
  if (!status) throw new Error("Missing #status in index.html");

  // Add an event listener that runs when the user selects a file
  input.addEventListener("change", () => {
    // Get the first selected file from the input (if any)
    const file = input.files?.[0];
    // If no file was selected, stop execution
    if (!file) return;

    // Update the status text to show the selected file name
    status.textContent = `Status: Selected ${file.name || "(unnamed file)"}`;

    // Create a temporary URL for the selected file so it can be displayed
    const url = URL.createObjectURL(file);
    // Set the preview image source to the generated URL
    preview.src = url;
    // Ensure the preview image is visible
    preview.style.display = "block";

    // If a callback function was provided, call it and pass the selected file
    if (typeof onFileSelected === "function") {
      onFileSelected(file);
    }
  });
}