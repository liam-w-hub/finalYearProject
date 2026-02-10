export function initUpload({ onFileSelected }) {
  const input = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");

  if (!input) throw new Error("Missing #imageInput in index.html");

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    status.textContent = `Status: Selected ${file.name}`;

    // show preview
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";

    if (typeof onFileSelected === "function") {
      onFileSelected(file);
    }
  });
}