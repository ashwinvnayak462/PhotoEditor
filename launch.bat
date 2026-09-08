@echo off
setlocal
cd /d "%~dp0"
if exist node_modules\electron\dist\electron.exe (
  call npm start
) else (
  echo Electron dependencies are not installed yet.
  echo Run npm install, then use npm start or npm run dist.
  start "" "%~dp0index.html"
)
