const http = require('http');
const fs   = require('fs');
const path = require('path');
const root = process.argv[2] || '.';
const port = parseInt(process.argv[3] || '5500');

const mime = { html:'text/html;charset=utf-8', css:'text/css', js:'application/javascript', png:'image/png', jpg:'image/jpeg', svg:'image/svg+xml', ico:'image/x-icon', woff2:'font/woff2' };

http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';
    let decoded;
    try { decoded = decodeURIComponent(url); } catch (e) { decoded = url; }
    const file = path.join(root, decoded);
    try {
        const data = fs.readFileSync(file);
        const ext  = path.extname(file).slice(1);
        res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end(data);
    } catch (e) {
        res.writeHead(404); res.end('404 Not Found');
    }
}).listen(port, () => console.log('Server running at http://localhost:' + port));
