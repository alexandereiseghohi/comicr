# PowerShell script to install all recommended VS Code extensions for ComicWise
# Usage: Run in project root

$extensions = @(
  "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "ms-playwright.playwright",
    "orta.vscode-jest",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "unifiedjs.vscode-mdx",
    "ms-dotnettools.csharp",
    "ms-python.python",
    "ms-vscode.makefile-tools",
    "eamodio.gitlens",
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "ms-playwright.playwright",
    "ms-vscode-remote.remote-containers",
    "ms-vscode.remote-explorer",
    "mhutchie.git-graph",
    "ms-vscode.vscode-js-profile-flame"
)

foreach ($ext in $extensions) {
  Write-Host "Installing $ext..."
  code-insiders --install-extension $ext --force
}
Write-Host "✅ All recommended extensions processed."
