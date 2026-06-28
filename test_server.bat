@echo off
cd /d "D:\网站开发\亚太国际人民事业发展共同体官方网站初稿(1)"
echo Starting HTTP server on port 8080...
echo Open http://localhost:8080 in your browser
start http://localhost:8080
C:\Python314\python.exe -m http.server 8080
