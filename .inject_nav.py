"""
从代谢紊乱领域.html 提取完整的导航+footer+backToTop 代码块，
注入到肺部健康领域.html（替换原占位或缺失处）。
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_NAV = os.path.join(ROOT, '代谢紊乱领域.html')
DST = os.path.join(ROOT, '肺部健康领域.html')

with open(SRC_NAV, 'r', encoding='utf-8') as f:
    nav_src = f.read()

# 1) 提取导航块：<div id="site-header"> ... </nav> + 移动端 offcanvas
# 找到 "site-header" 的开始 和 "id="mobileMenu" 的 offcanvas 结束
m_start = nav_src.find('<div id="site-header">')
# 找匹配的 </div> 在 site-header 之后，移动端 offcanvas 结束
# 简单方法：找到 "id="mobileMenu"" 出现的位置，对应 </div> 的位置
# 实际上 site-header 包含两个区块：navbar + offcanvas
# offcanvas 结束在 "id="mobileMenu" ... </div>\n</div> 之后
# 用正则提取
m = re.search(r'<div id="site-header">.*?</nav>.*?aria-labelledby="mobileMenuLabel">.*?</div>\s*</div>', nav_src, re.DOTALL)
if m:
    nav_block = m.group(0)
    print(f'导航块提取成功: {len(nav_block)} 字符')
else:
    # 退而求其次：从 site-header 到第 481 行（offcanvas 结束处）
    nav_start = nav_src.find('<div id="site-header">')
    # 找下一个 "id="site-footer" 之前
    nav_end = nav_src.find('<div id="site-footer">')
    nav_block = nav_src[nav_start:nav_end]
    print(f'导航块（截取方式）: {len(nav_block)} 字符')

# 2) 提取 footer 块：<div id="site-footer"> ... </div> (在 body 结束前)
m2 = re.search(r'<div id="site-footer">.*?</div>\s*</body>', nav_src, re.DOTALL)
if m2:
    footer_block_with_body = m2.group(0)
    # 去掉 </body>，我们只插入到 body 内
    footer_block = footer_block_with_body.replace('</body>', '').rstrip()
    print(f'footer 块提取成功: {len(footer_block)} 字符')
else:
    footer_start = nav_src.find('<div id="site-footer">')
    footer_end = nav_src.rfind('</body>')
    footer_block = nav_src[footer_start:footer_end]
    print(f'footer 块（截取方式）: {len(footer_block)} 字符')

# 3) 提取 scripts 块（vendor + include + main）
scripts_match = re.search(r'<script src="vendor/bootstrap\.bundle\.min\.js"></script>.*?<script src="js/main\.js"></script>', nav_src, re.DOTALL)
if scripts_match:
    scripts_block = scripts_match.group(0)
    print(f'scripts 块: {len(scripts_block)} 字符')
else:
    scripts_block = ''

# 4) 读取肺部健康领域
with open(DST, 'r', encoding='utf-8') as f:
    dst = f.read()
print(f'肺部健康领域原文件: {len(dst)} 字符')

# 5) 在 <body> 后插入导航块（替换任何现有的 site-header）
if '<div id="site-header">' in dst:
    # 替换现有
    dst = re.sub(r'<div id="site-header">.*?(?=<div id="site-footer">|<main|<section)', nav_block, dst, count=1, flags=re.DOTALL)
    print('替换了现有的 site-header')
else:
    # 在 <body> 之后插入
    dst = dst.replace('<body>', '<body>\n' + nav_block, 1)
    print('在 <body> 后插入导航')

# 6) 替换或插入 site-footer
if '<div id="site-footer">' in dst:
    # 找到 site-footer 位置
    sf_start = dst.find('<div id="site-footer">')
    # 找到 </body> 位置
    body_end = dst.find('</body>')
    # 替换 site-footer 区域
    dst = dst[:sf_start] + footer_block + dst[body_end:]
    print('替换了现有的 site-footer')
else:
    # 在 </main> 之后插入
    dst = dst.replace('</main>', '</main>\n\n' + footer_block + '\n', 1)
    print('在 </main> 后插入 footer')

# 7) 确保 scripts 块存在（如果上面替换没覆盖到）
if 'vendor/bootstrap.bundle.min.js' not in dst:
    # 找到 </body> 前插入
    dst = dst.replace('</body>', scripts_block + '\n</body>')
    print('插入了 scripts 块')

# 8) 写文件
with open(DST, 'w', encoding='utf-8') as f:
    f.write(dst)
print(f'已写入: {DST} ({len(dst)} 字符)')

# 清理临时文件
for f in ['.git_anti_original.html', '.check_a.py', '.check_b.py', '.check_c.py', '.rebuild.py']:
    p = os.path.join(ROOT, f)
    if os.path.exists(p):
        os.remove(p)
        print(f'删除临时文件: {f}')
