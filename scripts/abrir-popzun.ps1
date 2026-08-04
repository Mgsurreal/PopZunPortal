$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:5510/"

function Find-Node {
  $candidates = @(
    (Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),
    (Join-Path $env:ProgramFiles "nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\nodejs\node.exe"),
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
  )
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
  }
  throw "Node.js nao foi encontrado neste computador."
}

function Test-PopZun {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
    return $response.StatusCode -eq 200
  } catch { return $false }
}

try {
  if (-not (Test-PopZun)) {
    $node = Find-Node
    $server = Join-Path $PSScriptRoot "servidor-popzun.mjs"
    Start-Process -FilePath $node -ArgumentList @($server, $project, "5510") -WorkingDirectory $project -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 40 -and -not (Test-PopZun); $attempt++) {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not (Test-PopZun)) { throw "O servidor local nao respondeu na porta 5510." }
  Start-Process $url
} catch {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($_.Exception.Message, "PopZunPortal") | Out-Null
}
