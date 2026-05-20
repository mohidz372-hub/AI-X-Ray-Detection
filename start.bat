@echo off
echo Starting PneumoScan AI...
echo.

echo [1/2] Starting Backend...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3

echo [2/2] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
