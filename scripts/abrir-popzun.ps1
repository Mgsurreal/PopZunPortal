$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$url = "http://localhost:5510/"

function Find-Node {
  $command = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $common = @(
    "C:\Program Files\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
  )
  foreach ($candidate in $common) {
    if (Test-Path -LiteralPath $candidate) { return $candidate }
  }

  $runtimeRoot = Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node"
  if (Test-Path -LiteralPath $runtimeRoot) {
    $runtime = Get-ChildItem -LiteralPath $runtimeRoot -Filter node.exe -Recurse -ErrorAction SilentlyContinue |
      Select-Object -First 1 -ExpandProperty FullName
    if ($runtime) { return $runtime }
  }

  throw "Node.js nao foi encontrado neste computador."
}

$alreadyRunning = Get-NetTCPConnection -LocalPort 5510 -State Listen -ErrorAction SilentlyContinue
if (-not $alreadyRunning) {
  $node = Find-Node
  $server = Join-Path $PSScriptRoot "servidor-popzun.mjs"
  Start-Process -FilePath $node -ArgumentList @($server, $project, "5510") -WorkingDirectory $project -WindowStyle Hidden

  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 250
    if (Get-NetTCPConnection -LocalPort 5510 -State Listen -ErrorAction SilentlyContinue) { break }
  }
}

$ready = Get-NetTCPConnection -LocalPort 5510 -State Listen -ErrorAction SilentlyContinue
if ($ready) {
  Start-Process $url
} else {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(
    "O PopZunPortal nao conseguiu iniciar.",
    "PopZunPortal"
  ) | Out-Null
}
