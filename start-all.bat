@echo off
REM Cortex AI - One-click launcher
REM Usage:
REM   start-all.bat            -> start everything (Redis + backend + frontend)
REM   start-all.bat -install   -> install all dependencies first
REM   start-all.bat -noredis   -> skip starting Redis

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0start-all.ps1" %*
