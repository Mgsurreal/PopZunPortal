@echo off
setlocal
title PopZun Studio - Robos locais
set "POPZUN_ROOT=%~dp0"
set "BUNDLED_NODE=C:\Users\Marcos\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%BUNDLED_NODE%" (
  set "NODE_EXE=%BUNDLED_NODE%"
) else (
  set "NODE_EXE=node"
)
start "" "http://127.0.0.1:8787/"
"%NODE_EXE%" "%POPZUN_ROOT%scripts\popzun-local-server.js"
endlocal
