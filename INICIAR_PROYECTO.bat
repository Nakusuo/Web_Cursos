@echo off
echo ================================================
echo   Academia Pesquera - Inicio de Servidores
echo ================================================
echo.

echo [1/3] Iniciando servidor backend (Puerto 3000)...
start cmd /k "cd /d %~dp0backend && echo Backend corriendo en http://localhost:3000 && node server.js"

timeout /t 2 /nobreak >nul

echo [2/3] Iniciando servidor frontend (Puerto 8080)...
start cmd /k "cd /d %~dp0frontend && echo Frontend corriendo en http://localhost:8080 && python -m http.server 8080"

timeout /t 2 /nobreak >nul

echo [3/3] Abriendo navegador...
start http://localhost:8080/index.html

echo.
echo ================================================
echo   SERVIDORES INICIADOS EXITOSAMENTE
echo ================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
echo (Los servidores seguiran corriendo en las otras ventanas)
pause >nul
