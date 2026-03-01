$path = "C:\L\License Plate Recognition.v11i.yolov8\valid\harderLabels\"
$labelDestination = "C:\L\License Plate Recognition.v11i.yolov8\valid\evenHarderLabels"
$imageDestination = "C:\L\License Plate Recognition.v11i.yolov8\valid\evenHarderImages"

$files = Get-ChildItem $path -File -Filter *.txt

$area = 0.05
$count = 0
foreach ($file in $files) {
    $text = Get-Content $file.FullName -Raw
    $values = $text.Trim() -split '\s+'

    $width  = [double]$values[3]
    $height = [double]$values[4]
    $boxArea = $width * $height
    if ($boxArea -lt $area) {
        $imagePath = "C:\L\License Plate Recognition.v11i.yolov8\valid\harderImages\" + $file.BaseName + ".jpg"
        Write-host $boxArea
        $count++
        Move-Item -Path $file.FullName -Destination $labelDestination -Force
        Move-Item -Path $imagePath -Destination $imageDestination -Force
    }
}

write-host $count