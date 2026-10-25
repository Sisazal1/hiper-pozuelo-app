@echo off
REM Lanzador de OpenCode para este repo: carga la clave de DeepSeek desde el .env de Hermes
REM y arranca opencode en el directorio actual. Uso:  ai            (TUI)
REM                                                    ai run "..."  (one-shot)
setlocal
set "ENVFILE=%LOCALAPPDATA%\hermes\.env"
for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b "DEEPSEEK_API_KEY=" "%ENVFILE%"`) do set "%%A=%%B"
set "OC=%LOCALAPPDATA%\hermes\tools\node-26.7.0-win32-x64\opencode.cmd"
"%OC%" %*
endlocal
