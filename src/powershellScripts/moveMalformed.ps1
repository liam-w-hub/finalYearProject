$labelPath = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\labels"
$malformedLabels = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\bad_labels"
$malformedImages = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\bad_images"
$imagePath = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\images"

# Make sure folders exist
New-Item -ItemType Directory -Force -Path $malformedLabels | Out-Null
New-Item -ItemType Directory -Force -Path $malformedImages | Out-Null

$files = Get-ChildItem $labelPath -Filter *.txt

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $malformed = $false

    foreach ($line in $lines) {
        $parts = $line.Trim() -split '\s+'
        if ($parts.Count -ne 5) {
            $malformed = $true
            break
        }
    }

    if ($malformed) {
        $image = Join-Path $imagePath ($file.BaseName + ".jpg")
        Move-Item $file.FullName $malformedLabels -Force
        if (Test-Path $image) {
            Move-Item $image $malformedImages -Force
        }
    }
}