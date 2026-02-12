# PowerShell script to verify MCP servers from .vscode/mcp.json
# Usage: Run in project root to check MCP server executables

$mcpJsonPath = "./.vscode/mcp.json"
if (!(Test-Path $mcpJsonPath)) {
  Write-Host "❌ Could not find .vscode/mcp.json"
  exit 1
}

$mcpData = Get-Content $mcpJsonPath | ConvertFrom-Json
$servers = $mcpData.servers.GetEnumerator() | ForEach-Object {
  $name = $_.Key
  $cmd = $_.Value.command
  $args = $_.Value.args -join ' '
  @{ Name = $name; Command = $cmd; Args = $args }
}

foreach ($server in $servers) {
  Write-Host "Testing $($server.Name)..."
  try {
    & $server.Command $server.Args
    Write-Host "✅ $($server.Name) is available."
  } catch {
    Write-Host "❌ $($server.Name) not found or failed to run."
  }
}

# Optionally, verify VS Code Insiders is available
$codeCmd = "code-insiders"
Write-Host "\nChecking if VS Code Insiders is available..."
try {
  & $codeCmd --version
  Write-Host "✅ VS Code Insiders is available."
} catch {
  Write-Host "❌ VS Code Insiders not found."
}
