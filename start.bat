@echo off
echo Starting SpecialWeek Application...

echo.
echo ==============================================
echo Checking Backend (FastAPI)...
echo ==============================================
cd backend
IF NOT EXIST "venv\Scripts\python.exe" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    echo Installing requirements...
    venv\Scripts\python -m pip install -r requirements.txt
)
start "VeriIA Backend" cmd /k "venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"
cd ..

echo.
echo ==============================================
echo Checking Frontend (Vite)...
echo ==============================================
cd application
IF NOT EXIST "node_modules\" (
    echo Node modules not found. Installing dependencies...
    cmd /c "npm install"
)
start "VeriIA Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting in new windows!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
