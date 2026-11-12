# IELTS Learning Platform - Full-stack Dev Runner
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  IELTS LEARNING PLATFORM - KHỞI ĐỘNG HỆ THỐNG (FULL-STACK DEV)" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  - Backend  : Spring Boot (Maven) -> http://localhost:8080" -ForegroundColor Yellow
Write-Host "  - Frontend : React + Vite        -> http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  [Log Prefix]:" -ForegroundColor Gray
Write-Host "    [BACKEND]  (Xanh dương)" -ForegroundColor Blue
Write-Host "    [FRONTEND] (Xanh lá)" -ForegroundColor Green
Write-Host ""
Write-Host "  Nhấn Ctrl+C để dừng đồng thời cả 2 dịch vụ." -ForegroundColor DarkYellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot
npm start
