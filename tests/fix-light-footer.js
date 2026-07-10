/**
 * 批量修复：自包含模板页的"多余自定义浅色页脚"问题
 * ----------------------------------------------------------------
 * 问题：约 27 个自包含页面各自内联了一个低对比自定义页脚
 *       (.footer / .global-footer, 文字色 #7a95b0 落在白底上"看不清")，
 *       同时又保留了注入标准 .site-footer 的 #site-footer 占位，
 *       导致"双页脚 + 自带页脚看不清"。
 * 修复：删除这些页面里多余的自定义页脚（HTML 块 + 对应内联样式），
 *       只保留注入的标准 .site-footer（深色背景 + 白字，全站统一）。
 * 注意：绝不删除 .footer-note（正文内容提示框，非页脚）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['partials', 'tests', 'vendor', 'node_modules', '.git']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, out); }
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// 内联样式规则：.footer { ... } 与 .global-footer { ... }（不含 .footer-note）
const styleRe = [
  /\n[ \t]*\.footer\s*\{[\s\S]*?\n[ \t]*\}\n?/g,
  /\n[ \t]*\.global-footer\s*\{[\s\S]*?\n[ \t]*\}\n?/g,
];
// HTML 页脚块：精确匹配 class="footer" / class="global-footer"（不含 footer-note）
const htmlRe = [
  /<div class="footer">[\s\S]*?<\/div>\n?/g,
  /<div class="global-footer">[\s\S]*?<\/div>\n?/g,
];

let changed = 0, skipped = 0, styleRemoved = 0, htmlRemoved = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  let sCount = 0, hCount = 0;

  for (const re of styleRe) { html = html.replace(re, (m) => { sCount++; return ''; }); }
  for (const re of htmlRe) { html = html.replace(re, (m) => { hCount++; return ''; }); }

  if (html !== before) {
    fs.writeFileSync(file + '.bak', before, 'utf8'); // 备份
    fs.writeFileSync(file, html, 'utf8');
    changed++;
    styleRemoved += sCount;
    htmlRemoved += hCount;
    console.log(`✓ ${path.relative(ROOT, file)}  (删样式块 ${sCount}, 删HTML块 ${hCount})`);
  } else {
    skipped++;
  }
}
console.log(`\n完成：修改 ${changed} 个文件，跳过 ${skipped} 个；共删除内联样式块 ${styleRemoved}、HTML页脚块 ${htmlRemoved}。`);
console.log('备份文件为各自的 .bak（确认无误后可删除）。');
