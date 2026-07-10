/**
 * 修复：为缺少 #site-footer 占位符的内容页补上占位 div，
 * 使 include.js 能注入共享页脚。仅处理“含 include.js 且含 site-header 但缺 site-footer”的页面。
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; walk(p, out); }
    else out.push(p);
  }
  return out;
}
const htmlFiles = walk(ROOT).filter(f => f.endsWith('.html'));
const STANDALONE = ['partials/header.html', 'partials/footer.html', '404.html', 'coming-soon.html', 'nation.html', 'validate.html'];
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
let fixed = 0, skipped = 0;
for (const f of htmlFiles) {
  if (STANDALONE.includes(rel(f))) continue;
  let html = fs.readFileSync(f, 'utf8');
  const hasHeader = html.includes('id="site-header"');
  const hasInclude = /include\.js/.test(html);
  const hasFooter = html.includes('id="site-footer"');
  if (hasHeader && hasInclude && !hasFooter) {
    fs.writeFileSync(f + '.bak', html);
    const out = html.replace(/(^[ \t]*<script\b)/m, (m) => `    <div id="site-footer"></div>\n` + m);
    if (out === html) { console.log('⚠ 未找到 <script>，跳过', rel(f)); fs.unlinkSync(f + '.bak'); skipped++; continue; }
    fs.writeFileSync(f, out);
    fixed++;
  }
}
console.log(`已修复 ${fixed} 个页面（补 #site-footer），跳过 ${skipped} 个。备份为 .bak。`);
