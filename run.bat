@echo off
chcp 65001 >nul
title IELTS Learning Platform - Dev Server Runner

echo ===============================================================================
echo   IELTS LEARNING PLATFORM - KHỞI ĐỘNG HỆ THỐNG (FULL-STACK DEV)
echo ===============================================================================
echo   - Backend  : Spring Boot (Maven) -> http://localhost:8080
echo   - Frontend : React + Vite        -> http://localhost:5173
echo.
echo   [Log Prefix]
echo     [BACKEND]  : Màu xanh dương (Blue)
echo     [FRONTEND] : Màu xanh lá (Green)
echo.
echo   Nhấn Ctrl+C để dừng đồng thời cả 2 dịch vụ.
echo ===============================================================================
echo.

cd /d "%~dp0"
call npm start
