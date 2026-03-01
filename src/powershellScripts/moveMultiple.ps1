$path = "C:\L\License Plate Recognition.v11i.yolov8\test\labels\"
$labelDestination = "C:\L\License Plate Recognition.v11i.yolov8\test\multipleLabels"
$imageDestination = "C:\L\License Plate Recognition.v11i.yolov8\test\multipleImages"

$files = Get-ChildItem $path -File -Filter *.txt

foreach ($file in $files) {
    $text = Get-Content $file.FullName

    $imagePath = "C:\L\License Plate Recognition.v11i.yolov8\test\images\" + $file.BaseName + ".jpg"

    if ($text.Count -gt 1) {
        Write-host $text
        Move-Item -Path $file.FullName -Destination $labelDestination -Force
        Move-Item -Path $imagePath -Destination $imageDestination -Force
    }
}