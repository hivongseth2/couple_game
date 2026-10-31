@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Dang cai dat lan dau...
  call npm install
)
start "" http://localhost:3000
node server.js
pause
