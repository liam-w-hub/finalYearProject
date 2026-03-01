<# Script to change '1' in .txt files to '0' #>
$path = "C:\L\Occluded face detection.v5i.yolov8\valid\labels\"


$files = Get-ChildItem $path -File -Filter *.txt

foreach ($file in $files) {
    $text = Get-Content $file.FullName -Raw
    if ($text -eq $Null) {
        Write-host "no content in this file"
        Write-host $file
    } else {
        Write-Host $text[0]
        if ($text[0] -eq '1') {
            $text = '0' + $text.Substring(1)
            Set-Content $file.FullName $text
        }
    }

}

$files = Get-ChildItem $path -File -Filter *.txt

foreach ($file in $files) {
    $text = Get-Content $file.FullName -Raw
    if ($text -eq $Null) {
        Write-host "no content in this file"
        Write-host $file
    } else {
        Write-Host $text[0]
    }
}