# -*- coding: utf-8 -*-
"""
生成网站双版本：
  a/  = 完整版（A）
  b/  = 精简版（B，去掉"亚太1号·虫草素"与"虫草素全球科研集合"两个子菜单）

规则：
  1. 整站复制为 a/ 和 b/（排除 .git/.codebuddy/tests/部署配置/根入口页 index.html）
  2. 副本内所有绝对路径（/css/、/js/、各目录、各根级 html 等）加版本前缀
     /css/style.css  ->  /a/css/style.css  （b 同理 -> /b/...）
  3. 仅 b/ 删除指定的两个导航子菜单项（桌面端 <li> 与移动端 <a>）
  4. a/ 与 b/ 的首页始终由 git 中的"原始主站首页"重新生成，
     与根目录入口页（index.html）完全解耦，可重复运行、幂等。
"""
import os
import re
import shutil
import subprocess

ROOT = r"d:\网站开发\亚太国际人民事业发展共同体官方网站初稿(1)"
VERSIONS = [("a", "a"), ("b", "b")]

EXCLUDE = {".git", ".codebuddy", "tests", "node_modules", "__pycache__",
           "a", "b", "build_versions.py", "index.html", "src_home.html"}
CONFIG_FILES = {"_headers", "_redirects", "DEPLOYMENT_GUIDE.md",
                "sitemap.xml", "robots.txt"}

TEXT_EXT = {".html", ".htm", ".css", ".js", ".svg", ".json",
            ".md", ".txt", ".xml", ".yml", ".yaml", ".toml"}

# ---- 收集根目录下需要加前缀的顶级条目（目录 + 文件） ----
entries = []
for name in os.listdir(ROOT):
    if name in EXCLUDE or name.startswith("."):
        continue
    if name in CONFIG_FILES:
        continue
    entries.append(name)
alt = "|".join(re.escape(e) for e in entries)

# b 版本要删除的菜单项（原始绝对路径，删除在加前缀之前执行）
B_MARKERS = [
    '<li><a class="dropdown-item" href="/人民产业与科研/健康中国人民健康/亚太1号·虫草素.html">',
    '<li><a class="dropdown-item" href="/人民产业与科研/健康中国人民健康/虫草素全球科研/首页.html">',
    '<a class="mobile-sub-link" href="/人民产业与科研/健康中国人民健康/亚太1号·虫草素.html">',
    '<a class="mobile-sub-link" href="/人民产业与科研/健康中国人民健康/虫草素全球科研/首页.html">',
]

pat = re.compile(r'(["\'\(= \t]|^)/(?:' + alt + r')(?=/|["\')#?\s]|$)')


def add_prefix(text, ver):
    def repl(mm):
        pre = mm.group(1)             # 前置字符（" ' ( = 空格 或 行首空串）
        rest = mm.group(0)[len(pre):]  # 含前导 '/'
        token = rest[1:]               # 去掉前导 '/'
        return pre + "/" + ver + "/" + token
    return pat.sub(repl, text)


def remove_menus(text):
    for m in B_MARKERS:
        text = re.sub(re.escape(m) + r".*?\n", "", text)
    return re.sub(r"\n[ \t]*\n[ \t]*\n+", "\n\n", text)


def ignore(src, names):
    return {n for n in names
            if n in EXCLUDE or n.startswith(".")
            or n in CONFIG_FILES}


# ---- 从 git 读取"原始主站首页"作为源（与根入口页解耦） ----
def load_source_home():
    # 优先使用独立缓存源文件 src_home.html（不受根入口页提交影响）
    cache = os.path.join(ROOT, "src_home.html")
    if os.path.exists(cache):
        return open(cache, "r", encoding="utf-8-sig").read()
    # 首次：从 git 原始主站首页生成缓存（utf-8 正确写入）
    try:
        raw = subprocess.check_output(
            ["git", "--no-pager", "show", "HEAD:index.html"],
            cwd=ROOT)
        txt = raw.decode("utf-8")
        open(cache, "w", encoding="utf-8-sig").write(txt)
        print("[src] 已从 git 生成 src_home.html 缓存")
        return txt
    except Exception as e:
        print(f"[src] WARNING: 无法读取原始首页 -> {e}")
        return None


SRC_HOME = load_source_home()

for verdir, ver in VERSIONS:
    dest = os.path.join(ROOT, verdir)
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(ROOT, dest, ignore=ignore)
    print(f"[copy] -> {verdir}/")

    # ---- b 版本：删除两个子菜单（仅 html，且此时 b/ 无首页） ----
    if ver == "b":
        for root, _, files in os.walk(dest):
            for f in files:
                if not f.endswith(".html"):
                    continue
                p = os.path.join(root, f)
                try:
                    t = open(p, "r", encoding="utf-8-sig").read()
                except Exception:
                    continue
                orig = t
                t = remove_menus(t)
                if t != orig:
                    open(p, "w", encoding="utf-8-sig").write(t)
        print(f"[trim] removed 2 menu items in {verdir}/")

    # ---- 加版本前缀 ----
    cnt = 0
    for root, _, files in os.walk(dest):
        for f in files:
            if os.path.splitext(f)[1].lower() not in TEXT_EXT:
                continue
            p = os.path.join(root, f)
            try:
                t = open(p, "r", encoding="utf-8-sig").read()
            except Exception:
                continue
            newt = add_prefix(t, ver)
            if newt != t:
                open(p, "w", encoding="utf-8-sig").write(newt)
                cnt += 1
    print(f"[prefix] added /{ver}/ prefix in {cnt} files")

# ---- 重建 a/ 与 b/ 首页（来自 git 原始主站首页，避免覆盖根入口页） ----
if SRC_HOME is not None:
    open(os.path.join(ROOT, "a", "index.html"), "w", encoding="utf-8-sig").write(
        add_prefix(SRC_HOME, "a"))
    open(os.path.join(ROOT, "b", "index.html"), "w", encoding="utf-8-sig").write(
        add_prefix(remove_menus(SRC_HOME), "b"))
    print("[home] regenerated a/index.html & b/index.html from git source")

print("DONE")
