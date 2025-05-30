#!/usr/bin/env pwsh -c

# Set the target directory
$targetDir = "."

# Get all .code-snippets files recursively
$snippetFiles = Get-ChildItem -Path $targetDir -Filter "*.code-snippets" -Recurse -File

# Process each found snippet file
foreach ($file in $snippetFiles) {
    # Generate destination path
    $destPath = Join-Path -Path $targetDir -ChildPath $file.Name
    
    # Handle naming conflicts by appending timestamp
    if (Test-Path $destPath) {
        $timestamp = Get-Date -Format "HH-mm-ss"
        $newName = $file.BaseName + "_" + $timestamp + $file.Extension
        $destPath = Join-Path -Path $targetDir -ChildPath $newName
    }
    
    # Copy the file to target directory
    Copy-Item -Path $file.FullName -Destination $destPath -Force
}

# Remove all subdirectories recursively
Get-ChildItem -Path $targetDir -Directory | Remove-Item -Recurse -Force

# Remove all non-snippet files in target directory
# Get-ChildItem -Path $targetDir -Exclude "*.code-snippets" -File | Remove-Item -Force

Get-ChildItem -Path $targetDir -File -Recurse | ForEach-Object {
    if ($_.Extension -ne ".code-snippets") {
        Remove-Item "$($_.FullName)" -Force
    }
}

Remove-Item "$($targetDir)/.gitignore" -Force
