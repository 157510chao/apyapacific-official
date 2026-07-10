/**
 * 静态站点自动化审计
 * 运行： node tests/static-audit.js
 * 覆盖：链接有效性 / 页面结构一致性 / 静态资源存在性 /
 *       站内搜索索引与 sitemap / JS 语法 / 孤儿(多余)页面 /
 *       表单静态校验 / viewport 响应式声明 / 跨浏览器风险扫描
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const results = { pass: [], warn: [], fail: [] };
function rec(level, cat, msg, detail) { results[level].push({ cat, msg, detail: detail || '' }); }

// ---------- 工具 ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; walk(p, out); }
    else out.push(p);
  }
  return out;
}
const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');

// 提取单个文件内全部链接（href/src + meta refresh + location.replace/href）
function extractLinks(file) {
  const html = fs.readFileSync(file, 'utf8');
  const links = [];
  const re = /\b(?:href|src)\s*=\s*["']([^"']*)["']/gi;
  let m; while ((m = re.exec(html))) links.push(m[1]);
  // meta refresh
  const mr = /<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']([^"']*)["']/i.exec(html);
  if (mr) {
    const u = /url=([^"'\s]+)/i.exec(mr[1]);
    if (u) links.push(u[1]);
  }
  // location.replace(...) / location.href = ...
  const lr = /location\.(?:replace|href)\s*(?:\(|\s*=\s*)\s*["']([^"']+)["']/g;
  while ((m = lr.exec(html))) links.push(m[1]);
  return links;
}
function resolveUrl(file, url) {
  if (url.startsWith('/')) return path.join(ROOT, url.replace(/^\/+/, ''));
  return path.resolve(path.dirname(file), url);
}
const SKIP = /^(#|javascript:|mailto:|tel:|data:|https?:)/i;
function clean(url) { return url.split('?')[0].split('#')[0]; }

// ---------- 1. 链接有效性 ----------
let broken = 0, checked = 0, external = 0;
for (const f of htmlFiles) {
  for (const raw of extractLinks(f)) {
    const u = raw.trim();
    if (!u) continue;
    if (SKIP.test(u)) { if (/^https?:/i.test(u)) external++; continue; }
    const c = clean(u);
    if (!c) continue; // 纯锚点
    checked++;
    const target = resolveUrl(f, c);
    if (!fs.existsSync(target)) {
      broken++;
      rec('fail', '链接有效性', `${rel(f)} → 失效链接 ${u}`, '解析路径: ' + rel(target));
    }
  }
}
if (broken === 0) rec('pass', '链接有效性', `共校验 ${checked} 个站内链接，0 个失效（外链 ${external} 个未校验）`);
else rec('fail', '链接有效性', `发现 ${broken} 个失效站内链接`, '详见上方 fail 项');

// ---------- 2. 页面结构一致性 ----------
const STANDALONE = ['partials/header.html', 'partials/footer.html', '404.html', 'coming-soon.html'];
let structMiss = 0;
for (const f of htmlFiles) {
  const r = rel(f);
  if (STANDALONE.includes(r)) continue;
  const html = fs.readFileSync(f, 'utf8');
  const hasHeader = html.includes('id="site-header"');
  const hasFooter = html.includes('id="site-footer"');
  const hasInclude = /include\.js/.test(html);
  if (!hasHeader || !hasFooter || !hasInclude) {
    structMiss++;
    rec('fail', '结构一致性', `${r} 缺少共享导航挂载点/注入脚本`,
      `site-header:${hasHeader} site-footer:${hasFooter} include.js:${hasInclude}`);
  }
}
if (structMiss === 0) rec('pass', '结构一致性', '全部内容页均含 #site-header / #site-footer / include.js 注入');

// ---------- 3. 静态资源存在性 ----------
const assetRefs = new Set();
for (const f of htmlFiles) for (const raw of extractLinks(f)) {
  const u = raw.trim();
  if (SKIP.test(u)) continue;
  const c = clean(u);
  if (!c) continue;
  if (/\.(css|js|svg|json|png|jpg|jpeg|gif|webp|woff2?|ico)$/i.test(c)) assetRefs.add(resolveUrl(f, c));
}
let missingAssets = 0;
for (const a of assetRefs) {
  if (!fs.existsSync(a)) { missingAssets++; rec('fail', '静态资源', `缺失资源: ${rel(a)}`); }
}
if (missingAssets === 0) rec('pass', '静态资源', `校验 ${assetRefs.size} 个 css/js/svg/json 等资源引用，全部存在`);

// ---------- 4. 站内搜索索引 ----------
const siPath = path.join(ROOT, 'js/search-index.js');
let siBad = 0, siTotal = 0;
if (fs.existsSync(siPath)) {
  const txt = fs.readFileSync(siPath, 'utf8');
  const urls = [...txt.matchAll(/url:\s*"([^"]*)"/g)].map(x => x[1]);
  siTotal = urls.length;
  for (const u of urls) {
    if (/^https?:/i.test(u)) continue; // 外部绝对地址由生产域名解析，本地不校验
    const t = path.join(ROOT, clean(u).replace(/^\/+/, ''));
    if (!fs.existsSync(t)) { siBad++; rec('fail', '搜索索引', `search-index.js 指向不存在页面: ${u}`); }
  }
}
if (siBad === 0 && siTotal) rec('pass', '搜索索引', `search-index.js 共 ${siTotal} 条，全部指向有效页面`);

// ---------- 5. sitemap ----------
const smPath = path.join(ROOT, 'sitemap.xml');
let smBad = 0, smTotal = 0;
if (fs.existsSync(smPath)) {
  const txt = fs.readFileSync(smPath, 'utf8');
  const locs = [...txt.matchAll(/<loc>([^<]*)<\/loc>/g)].map(x => x[1]);
  smTotal = locs.length;
  for (const u of locs) {
    if (/^https?:/i.test(u)) continue; // 外部绝对地址由生产域名解析，本地不校验
    const t = path.join(ROOT, clean(u).replace(/^\/+/, ''));
    if (!fs.existsSync(t)) { smBad++; rec('fail', 'sitemap', `sitemap.xml 指向不存在页面: ${u}`); }
  }
}
if (smBad === 0 && smTotal) rec('pass', 'sitemap', `sitemap.xml 共 ${smTotal} 个 <loc>，全部有效`);

// ---------- 6. JS 语法检查 ----------
const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.includes(path.join('node_modules')));
let jsErr = 0;
for (const f of jsFiles) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { jsErr++; rec('fail', 'JS语法', `语法错误: ${rel(f)}`, String(e.stderr || e.message).split('\n')[0]); }
}
if (jsErr === 0) rec('pass', 'JS语法', `全部 ${jsFiles.length} 个 JS 文件通过 node --check`);

// ---------- 7. 孤儿(多余)页面 ----------
const key = f => rel(f);
const adj = {};
for (const f of htmlFiles) {
  const set = new Set();
  for (const raw of extractLinks(f)) {
    const u = raw.trim();
    if (SKIP.test(u)) continue;
    const c = clean(u);
    if (!c) continue;
    const t = resolveUrl(f, c);
    if (fs.existsSync(t) && t.endsWith('.html')) set.add(key(t));
  }
  adj[key(f)] = set;
}
// 种子：首页 + 注入到所有页面的共享导航/页脚
const seeds = ['index.html', 'partials/header.html', 'partials/footer.html'].filter(s => adj[s]);
const seen = new Set(seeds);
const q = [...seeds];
while (q.length) {
  const cur = q.shift();
  for (const nxt of (adj[cur] || [])) if (!seen.has(nxt)) { seen.add(nxt); q.push(nxt); }
}
const orphans = htmlFiles.map(key).filter(k => !seen.has(k) && !STANDALONE.includes(k));
if (orphans.length === 0) rec('pass', '可达性', '所有内容页均可从首页/共享导航经内部链接到达');
else orphans.forEach(o => rec('warn', '多余/孤儿页面', `${o} 无法从首页或共享导航经内部链接到达`, '可能为冗余或需补充入口'));

// ---------- 8. 表单静态校验 ----------
const formFiles = htmlFiles.filter(f => fs.readFileSync(f, 'utf8').includes('<form'));
for (const f of formFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const forms = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)];
  forms.forEach((fm, i) => {
    const body = fm[1];
    const req = (body.match(/\brequired\b/g) || []).length;
    const patterns = [...body.matchAll(/pattern="([^"]*)"/g)].map(x => x[1]);
    const deadAnchors = (body.match(/href="#"/g) || []).length;
    const hasSubmit = /type="submit"/.test(body);
    const note = `页面 ${rel(f)} 表单#${i + 1}: required字段=${req}, 正则校验=${patterns.length}, 提交按钮=${hasSubmit}, 死锚点(href="#")="${deadAnchors}"`;
    if (deadAnchors > 0) rec('warn', '表单UX', note, '存在 href="#" 占位链接（如用户协议/隐私政策）');
    else rec('pass', '表单校验', note);
  });
}
// join 表单是否真提交后端
const joinHtml = fs.readFileSync(path.join(ROOT, 'join.html'), 'utf8');
if (/e\.preventDefault\(\)/.test(joinHtml) && !/fetch\(|XMLHttpRequest|\.ajax\(|axios/.test(joinHtml))
  rec('warn', '表单逻辑', 'join.html 注册表单为纯前端模拟（preventDefault + setTimeout 伪成功），无真实 API 提交',
    '建议：接入后端或明确标注“演示”以免用户误以为已注册');

// ---------- 9. viewport 响应式声明 ----------
let noViewport = 0;
for (const f of htmlFiles) {
  if (rel(f).startsWith('partials/')) continue; // 注入片段，非独立页面
  const html = fs.readFileSync(f, 'utf8');
  if (!/<meta[^>]+name=["']viewport["']/.test(html)) { noViewport++; rec('warn', '响应式', `${rel(f)} 缺少 viewport meta，移动端无法正确缩放`); }
}
if (noViewport === 0) rec('pass', '响应式', '全部页面均声明 viewport（移动端缩放就绪）');

// ---------- 10. 跨浏览器风险扫描 ----------
const testsDir = path.join(ROOT, 'tests');
const riskFiles = allFiles.filter(f => (f.endsWith('.js') || f.endsWith('.html')) && !f.startsWith(testsDir));
let riskCount = 0;
for (const f of riskFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  const optChain = (txt.match(/\?\./g) || []).length;
  const nullish = (txt.match(/\?\?/g) || []).length;
  if (optChain || nullish) {
    riskCount++;
    rec('warn', '跨浏览器', `${rel(f)} 使用可选链(?.)×${optChain} / 空值合并(??)×${nullish}`,
      '现代 Chrome/Firefox/Edge/Safari(≥14) 均支持；若需兼容老旧 Safari(<14) 需转译');
  }
}
if (riskCount === 0) rec('pass', '跨浏览器', '未发现可选链/空值合并等需转译的新语法');

// ---------- 输出 ----------
const counts = { PASS: results.pass.length, WARN: results.warn.length, FAIL: results.fail.length };
console.log('\n================ 静态审计结果 ================');
console.log(`PASS ${counts.PASS}  |  WARN ${counts.WARN}  |  FAIL ${counts.FAIL}\n`);
const order = { fail: 0, warn: 1, pass: 2 };
for (const lvl of ['fail', 'warn', 'pass']) {
  for (const r of results[lvl]) {
    const tag = lvl === 'fail' ? '❌' : lvl === 'warn' ? '⚠️' : '✅';
    console.log(`${tag} [${r.cat}] ${r.msg}`);
    if (r.detail) console.log(`     ↳ ${r.detail}`);
  }
}
console.log('\n===============================================');
fs.writeFileSync(path.join(ROOT, 'tests', 'static-audit-report.json'),
  JSON.stringify({ counts, results }, null, 2));
console.log('报告已写入 tests/static-audit-report.json');
process.exit(counts.FAIL > 0 ? 1 : 0);
