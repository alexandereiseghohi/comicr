# PowerShell script to verify VS Code (Insiders) config and extensions
# Ensures all recommended extensions are installed and all unwanted ones are uninstalled
# Usage: Run in project root

$codeCmd = "code-insiders"
$extensionsJson = "./.vscode/extensions.json"

if (!(Test-Path $extensionsJson)) {
  Write-Host "❌ Could not find .vscode/extensions.json"
  exit 1
}

$extData = Get-Content $extensionsJson | ConvertFrom-Json
# Deduplicate and clean up extension lists
$recommendations = $extData.recommendations | Sort-Object -Unique | Where-Object { $_ -and $_ -ne "" }
$unwanted = $extData.unwantedRecommendations | Sort-Object -Unique | Where-Object { $_ -and $_ -ne "" }

Write-Host "\n--- Installing recommended extensions ---"
foreach ($ext in $recommendations) {
  Write-Host "Installing $ext ..."
  & $codeCmd --install-extension $ext --force
}

Write-Host "\n--- Uninstalling unwanted extensions ---"
foreach ($ext in $unwanted) {
  Write-Host "Uninstalling $ext ..."
  & $codeCmd --uninstall-extension $ext --force
}

Write-Host "\n--- Listing installed extensions ---"
& $codeCmd --list-extensions

Write-Host "\n✅ VS Code Insiders extension verification complete."
