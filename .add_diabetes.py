# -*- coding: utf-8 -*-
import os, re

root = os.path.dirname(os.path.abspath(__file__))
files = [
    'partials/header.html',
    '清华大学基础研究.html',
    '抗肿瘤与肿瘤微环境.html',
    '代谢紊乱领域.html',
    '炎症与自身免疫疾病领域.html',
    '免疫增强与提升.html',
    '神经保护与精神疾病.html',
    'cordycepin-research-overview.html',
    'cordycepin-17fields.html',
]

# 桌面端 (fa-lungs)
desktop_pat = '<li><a class="dropdown-item" href="肺部健康领域.html" data-todo="1"><i class="fas fa-lungs fa-xs me-2"></i>肺部健康领域</a></li>'
desktop_new = desktop_pat + '\n                        <li><a class="dropdown-item" href="糖尿病领域.html" data-todo="1"><i class="fas fa-tint fa-xs me-2"></i>糖尿病领域</a></li>'

# 移动端
mobile_pat = '<a class="mobile-sub-link" href="肺部健康领域.html" data-todo="1">肺部健康领域</a>'
mobile_new = mobile_pat + '\n                        <a class="mobile-sub-link" href="糖尿病领域.html" data-todo="1">糖尿病领域</a>'

for f in files:
    p = os.path.join(root, f)
    with open(p, 'r', encoding='utf-8') as fp:
        c = fp.read()
    orig = c
    c = c.replace(desktop_pat, desktop_new)
    c = c.replace(mobile_pat, mobile_new)
    if c != orig:
        with open(p, 'w', encoding='utf-8') as fp:
            fp.write(c)
        print(f'Updated: {f}')
    else:
        print(f'No change: {f}')
