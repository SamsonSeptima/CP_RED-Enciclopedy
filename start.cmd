@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Сайт полностью статический: открываем напрямую.
rem localStorage в современных браузерах работает и для file://.
start "" "index.html"
