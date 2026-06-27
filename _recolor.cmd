@echo off
chcp 65001 >nul
setlocal

set "FILE=%~dp0cordycepin-research-overview.html"
echo 目标文件: %FILE%

:: 备份
if not exist "%FILE%.bak" copy /Y "%FILE%" "%FILE%.bak" >nul

:: 用 PowerShell 替换（用 .NET API，UTF8 BOM 安全）
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$f = '%FILE%';" ^
  "$utf8Bom = New-Object System.Text.UTF8Encoding $true;" ^
  "$c = [System.IO.File]::ReadAllText($f, $utf8Bom);" ^
  "$map = @{" ^
  "  '#f0f6fe'='#ffffff';'#0a1e2f'='#0a2540';'#0b2a4a'='#7c3aed';'#1a4b73'='#5b21b6';" ^
  "  '#9cc3e8'='#ddd6fe';'#c5ddf5'='#ede9fe';'#1a6fb5'='#7c3aed';'#2d4d6e'='#4b5563';" ^
  "  '#3d5f7a'='#6b7280';'#4d6f8a'='#6b7280';'#1e3a52'='#374151';'#1a5a8c'='#7c3aed';" ^
  "  '#b12a1e'='#be185d';'#e3edfb'='#ede9fe';'#ecf0f5'='#f3f4f6';'#e6edf6'='#f3e8ff';" ^
  "  '#f5f9ff'='#faf5ff';'#f2f7fd'='#f9fafb';" ^
  "  'rgba(10, 40, 80, 0.25)'='rgba(124, 58, 237, 0.25)'" ^
  "};" ^
  "foreach($k in $map.Keys){$c = $c.Replace($k, $map[$k])};" ^
  "$c = $c.Replace(\"'Inter', -apple-system\",\"-apple-system\");" ^
  "[System.IO.File]::WriteAllText($f, $c, $utf8Bom);" ^
  "Write-Host 'DONE - replacements applied';"

if %errorlevel%==0 (
    echo.
    echo ✅ 配色已统一为紫色系
    echo 💾 备份在: %FILE%.bak
) else (
    echo.
    echo ❌ 替换失败
)

endlocal
