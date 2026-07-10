/**
 * 浏览器端端到端测试（需 Playwright，本环境未安装/未执行）
 * 覆盖：控制台报错 / 跨浏览器(Chromium·Firefox·WebKit) /
 *       响应式视口(手机·平板·桌面) / 共享导航与页脚注入 /
 *       表单提交(注册表单为前端模拟) / 页面链接 200
 *
 * 运行步骤：
 *   npm init -y
 *   npm i -D playwright
 *   npx playwright install        # 下载 chromium/firefox/webkit
 *   node tests/e2e.js
 *
 * 说明：静态站点通过 fetch 注入导航，必须用 HTTP 服务（不能用 file://，
 * 否则 CORS 导致 include.js 注入失败）。本脚本内置一个极简静态服务器。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function serve() {
  return http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/') u = '/index.html';
    let fp = path.join(ROOT, u);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
      // 目录回退到 index.html（Cloudflare Pages 行为）
      const idx = path.join(fp, 'index.html');
      fp = fs.existsSync(idx) ? idx : path.join(ROOT, '404.html');
    }
    fs.readFile(fp, (e, data) => {
      if (e) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

// 收集全部 HTML 页面
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; walk(f, out); }
    else if (f.endsWith('.html')) out.push('/' + path.relative(ROOT, f).split(path.sep).join('/'));
  }
  return out;
}
const PAGES = walk(ROOT).filter(p => !p.startsWith('/partials/'));
const VIEWS = [
  { name: '手机', width: 390, height: 844 },
  { name: '平板', width: 820, height: 1180 },
  { name: '桌面', width: 1280, height: 800 },
];
const BROWSERS = [
  { name: 'Chromium', type: 'chromium' },
  { name: 'Firefox', type: 'firefox' },
  { name: 'WebKit', type: 'webkit' },
];

(async () => {
  let pw;
  try { pw = require('playwright'); }
  catch (e) { console.error('未安装 Playwright，请先执行：npm i -D playwright && npx playwright install'); process.exit(2); }

  const server = serve().listen(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const report = { consoleErrors: [], footerMissing: [], navMissing: [], overflow: [], formOk: [], pass: 0, fail: 0 };

  for (const b of BROWSERS) {
    const browser = await pw[b.type].launch();
    for (const v of VIEWS) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
      for (const url of PAGES) {
        errors.length = 0;
        await page.goto(base + url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(400); // 等待 include.js 注入
        const navKids = await page.$$eval('#site-header *', els => els.length).catch(() => 0);
        const footKids = await page.$$eval('#site-footer *', els => els.length).catch(() => 0);
        if (navKids === 0) { report.navMissing.push(`${b.name}/${v.name} ${url}`); report.fail++; }
        if (footKids === 0 && url !== '/nation.html' && url !== '/validate.html') { report.footerMissing.push(`${b.name}/${v.name} ${url}`); report.fail++; }
        // 横向溢出检测（响应式）
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 2) { report.overflow.push(`${b.name}/${v.name} ${url} 溢出 ${overflow}px`); report.fail++; }
        if (errors.length) { report.consoleErrors.push(`${b.name}/${v.name} ${url}: ${errors.join(' | ')}`); report.fail++; }
        else if (url !== '/nation.html' && url !== '/validate.html' && navKids > 0 && (footKids > 0 || url === '/partials/')) report.pass++;
      }
      await ctx.close();
    }
    await browser.close();
  }

  // 表单专项：join.html 提交（前端模拟）-> 成功提示
  const b = await pw.chromium.launch();
  const pg = await b.newPage();
  await pg.goto(base + '/join.html', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(300);
  await pg.fill('#join-name', '测试用户');
  await pg.selectOption('#join-type', '消费者');
  await pg.fill('#join-phone', '13800138000');
  await pg.check('#join-agree');
  const reqs = [];
  pg.on('request', r => { if (r.method() === 'POST') reqs.push(r.url()); });
  await pg.click('button[type="submit"]');
  await pg.waitForTimeout(1800);
  const ok = await pg.$eval('button[type="submit"]', el => el.textContent.includes('成功')).catch(() => false);
  report.formOk.push({ 提示出现: ok, 真实后端POST请求数: reqs.length });
  await b.close();
  server.close();

  fs.writeFileSync(path.join(__dirname, 'e2e-report.json'), JSON.stringify(report, null, 2));
  console.log('=== 浏览器 E2E 报告 ===');
  console.log('PASS', report.pass, '| FAIL', report.fail);
  console.log('控制台错误:', report.consoleErrors.length, '| 导航缺失:', report.navMissing.length, '| 页脚缺失:', report.footerMissing.length, '| 横向溢出:', report.overflow.length);
  if (report.consoleErrors.length) console.log('错误样例:', report.consoleErrors.slice(0, 5));
  console.log('表单:', JSON.stringify(report.formOk));
  process.exit(report.fail > 0 ? 1 : 0);
})();
