@echo off
setlocal
title PopZun Studio - Robos locais
set "POPZUN_ROOT=%~dp0"
set "NODE_EXE=node"
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
start "" "http://127.0.0.1:8787/"
"%NODE_EXE%" "%POPZUN_ROOT%scripts\popzun-local-server.js"
if errorlevel 1 pause
endlocal
