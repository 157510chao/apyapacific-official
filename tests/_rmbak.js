const fs = require('fs');
const p = require('path');
function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = p.join(d, e.name);
    if (e.isDirectory()) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; w(f); }
    else if (e.name.endsWith('.bak')) fs.unlinkSync(f);
  }
}
w(process.cwd());
console.log('已删除 footer 修复产生的 .bak 备份');
