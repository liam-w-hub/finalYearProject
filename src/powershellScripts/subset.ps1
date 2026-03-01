$path = "C:\L\License Plate Recognition.v11i.yolov8\train\multipleLabels\"
$labelDestination = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\labels"
$imageDestination = "C:\Users\liamw\2026-csc1097-wraftel-3-clarkt-26\src\plateModels2\datasets\DatasetC\test\images"

$num = 120

$files = Get-ChildItem $path -File -Filter *.txt
$count = 0
foreach ($file in $files) {
    if ($count -lt $num) {
        $count++
        $imagePath = "C:\L\License Plate Recognition.v11i.yolov8\train\multipleImages\" + $file.BaseName + ".jpg"
        Move-Item -Path $file.FullName -Destination $labelDestination -Force
        Move-Item -Path $imagePath -Destination $imageDestination -Force
    } else {
        break
    }
}

Write-host $count