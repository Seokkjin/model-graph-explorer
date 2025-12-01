# Start Prophet Forecasting Application

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  Prophet Sales Forecasting - Startup Script" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Start API
Write-Host "[1/2] Starting Prophet API..." -ForegroundColor Yellow
$apiPath = "C:\Users\bpros\OneDrive\Documents\GitHub\model-graph-explorer\api"
$pythonExe = "$apiPath\venv\Scripts\python.exe"
$apiScript = "$apiPath\prophet_api.py"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$pythonExe' '$apiScript'"
Write-Host "✓ API starting on http://localhost:5000" -ForegroundColor Green

Start-Sleep -Seconds 2

# Start Frontend
Write-Host ""
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  Application URLs:" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  - API:      http://localhost:5000" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "Go to Analytics > Prophet Forecast tab" -ForegroundColor Yellow
Write-Host "Close the API terminal to stop the backend" -ForegroundColor Yellow
Write-Host ""

npm run dev
