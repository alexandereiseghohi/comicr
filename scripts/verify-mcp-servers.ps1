# PowerShell script to verify MCP language servers
# Usage: Run in project root to check MCP server executables

$servers = @(
  @{ Name = 'typescript-language-server'; Command = 'typescript-language-server'; Args = '--version' },
  @{ Name = 'python-language-server'; Command = 'pylsp'; Args = '--version' },
  @{ Name = 'sql-language-server'; Command = 'sql-language-server'; Args = '--version' },
  @{ Name = 'yaml-language-server'; Command = 'yaml-language-server'; Args = '--version' },
  @{ Name = 'json-language-server'; Command = 'vscode-json-languageserver'; Args = '--version' }
)

foreach ($server in $servers) {
  Write-Host "Testing $($server.Name)..."
  try {
    & $server.Command $server.Args
    Write-Host "✅ $($server.Name) is available."
  } catch {
    Write-Host "❌ $($server.Name) not found or failed to run."
  }
}
