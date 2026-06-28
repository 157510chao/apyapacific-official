# -*- coding: utf-8 -*-
import os
root = os.path.dirname(os.path.abspath(__file__))
files = [
    '抗肿瘤与肿瘤微环境.html',  # 参考模板
    '代谢紊乱领域.html',
    '炎症与自身免疫疾病领域.html',
    '免疫增强与提升.html',
    '神经保护与精神疾病.html',
    '肺部健康领域.html',
    '清华大学基础研究.html',
    '糖尿病领域.html',
]
print(f'{"File":<30} {"Bytes":>8}  {"Has cordycepin-report":<22}  {"Title preview"}')
print('-' * 100)
for f in files:
    p = os.path.join(root, f)
    if not os.path.exists(p):
        print(f'{f:<30} {"MISSING":>8}')
        continue
    with open(p, 'rb') as fp:
        b = fp.read()
    try:
        text = b.decode('utf-8', errors='replace')
    except Exception:
        text = ''
    has_cp = 'cordycepin-report' in text
    has_cp_class = 'class="cp-' in text
    # 取 <title>
    import re
    m = re.search(r'<title>(.*?)</title>', text)
    title = m.group(1)[:50] if m else '(no title)'
    print(f'{f:<30} {len(b):>8}  has-cp:{has_cp:<6} cp-class:{has_cp_class:<6}  {title}')
