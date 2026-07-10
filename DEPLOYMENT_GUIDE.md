# 亚太国际人民事业发展共同体官方网站 · Cloudflare Pages 部署完整教程

> **教程版本**：v1.0  
> **适用项目**：`亚太国际人民事业发展共同体官方网站初稿`（11 个 HTML 页面 + Bootstrap 5 静态站）  
> **最终部署地址**：https://apyapacific-official.pages.dev  
> **代码仓库**：https://github.com/157610chao/apyapacific-official  
> **部署方式**：Cloudflare Pages + GitHub 集成  
> **教程来源**：本教程基于项目实际部署过程逐字整理，所有"踩坑"均为真实遇到的问题

---

## 📑 目录

- [0. 部署前准备清单](#0-部署前准备清单)
- [1. 本地环境搭建与代码准备](#1-本地环境搭建与代码准备)
  - [1.1 安装必要工具](#11-安装必要工具)
  - [1.2 本地项目目录结构确认](#12-本地项目目录结构确认)
  - [1.3 本地预览（可选但强烈建议）](#13-本地预览可选但强烈建议)
- [2. GitHub 仓库创建与代码推送](#2-github-仓库创建与代码推送)
  - [2.1 创建 GitHub 仓库](#21-创建-github-仓库)
  - [2.2 本地 Git 初始化与提交](#22-本地-git-初始化与提交)
  - [2.3 推送到 GitHub](#23-推送到-github)
  - [2.4 验证推送成功](#24-验证推送成功)
- [3. Cloudflare 账号注册](#3-cloudflare-账号注册)
- [4. 创建 Cloudflare Pages 项目](#4-创建-cloudflare-pages-项目)
  - [4.1 进入 Pages 创建入口](#41-进入-pages-创建入口)
  - [4.2 ⚠️ 难点 A：找不到 Pages 在哪里](#42-️-难点-a找不到-pages-在哪里)
  - [4.3 ⚠️ 难点 B：误进 Workers 的解决方案](#43-️-难点-b误进-workers-的解决方案)
  - [4.4 连接 GitHub 仓库](#44-连接-github-仓库)
  - [4.5 配置构建设置](#45-配置构建设置)
- [5. 首次部署与状态检查](#5-首次部署与状态检查)
  - [5.1 触发部署](#51-触发部署)
  - [5.2 查看部署日志](#52-查看部署日志)
  - [5.3 验证部署成功](#53-验证部署成功)
- [6. 访问与排错](#6-访问与排错)
  - [6.1 正式访问地址](#61-正式访问地址)
  - [6.2 ⚠️ 难点 C：ERR_CONNECTION_CLOSED](#62-️-难点-cerr_connection_closed)
  - [6.3 多页面验证](#63-多页面验证)
- [7. 自定义域名绑定（可选）](#7-自定义域名绑定可选)
  - [7.1 进入自定义域设置](#71-进入自定义域设置)
  - [7.2 添加域名](#72-添加域名)
  - [7.3 配置 DNS 记录](#73-配置-dns-记录)
  - [7.4 ⚠️ 难点 D：AAAA 记录 "read only" 错误](#74-️-难点-daaaa-记录-read-only-错误)
  - [7.5 暂不绑域名的代价评估](#75-暂不绑域名的代价评估)
- [8. 内容维护流程](#8-内容维护流程)
  - [8.1 日常维护命令速查](#81-日常维护命令速查)
  - [8.2 上传视频/文档的两种方式](#82-上传视频文档的两种方式)
  - [8.3 Cloudflare 后台定位指南](#83-cloudflare-后台定位指南)
- [9. 完整踩坑清单与速查表](#9-完整踩坑清单与速查表)
- [10. 复现检查清单](#10-复现检查清单)

---

## 0. 部署前准备清单

在开始之前，请确认你已经准备好以下内容：

| 序号 | 资源 | 状态 | 说明 |
|---|---|---|---|
| 1 | 本地项目源码 | ✅ 已有 | `亚太国际人民事业发展共同体官方网站初稿` 文件夹 |
| 2 | GitHub 账号 | ⬜ 待注册 | 访问 https://github.com 注册 |
| 3 | Cloudflare 账号 | ⬜ 待注册 | 访问 https://dash.cloudflare.com/sign-up 注册 |
| 4 | Git 已安装 | ⬜ 待确认 | Windows 通常未自带 |
| 5 | Node.js 已安装 | ⬜ 待确认 | 用于本地预览，可选 |
| 6 | 邮箱 | ⬜ 准备 | 用于 GitHub 和 Cloudflare 注册验证 |

> 📸 **截图位置**：建议截图保存你的本地项目文件夹目录、GitHub 账号注册完成页、Cloudflare 账号注册完成页。

---

## 1. 本地环境搭建与代码准备

### 1.1 安装必要工具

#### 1.1.1 安装 Git

1. 访问 https://git-scm.com/download/win
2. 下载 Windows 安装包（64-bit）
3. 双击安装，**所有选项保持默认**，一路 Next
4. 验证安装：打开 PowerShell，输入 `git --version`，看到版本号即成功

```powershell
# 验证命令
git --version
# 期望输出：git version 2.x.x
```

#### 1.1.2 安装 Node.js（可选，用于本地预览）

1. 访问 https://nodejs.org/zh-cn/
2. 下载 LTS 版本（长期支持版）
3. 双击安装，保持默认选项
4. 验证安装：

```powershell
node --version
npm --version
# 期望输出：v20.x.x 和 10.x.x 左右
```

> 📸 **截图位置**：PowerShell 窗口显示 `git --version` 和 `node --version` 的成功输出。

#### 1.1.3 配置 Git 用户信息（重要！）

打开 PowerShell，执行：

```powershell
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub注册邮箱"
```

> ⚠️ **必踩坑提示**：如果不配置这两项，`git commit` 时会报错 `Please tell me who you are`。

### 1.2 本地项目目录结构确认

打开 PowerShell，进入项目目录并列出文件：

```powershell
cd "d:\网站开发\亚太国际人民事业发展共同体官方网站初稿(1)\亚太国际人民事业发展共同体官方网站初稿"
dir
```

**期望看到的内容**：

```
index.html
projects.html
health.html
industry.html
research.html
science.html
talent.html
welfare.html
join.html
news.html
validate.html
nation.html
README.md
css/         (目录)
js/          (目录)
assets/      (目录)
partials/    (目录)
关于亚太/        (目录)
人民事业共同体/    (目录)
人民产业与科研/    (目录)
人民组织与制度/    (目录)
人民荣誉/        (目录)
人民福利/        (目录)
vendor/      (目录)
```

> 📸 **截图位置**：PowerShell `dir` 命令的输出结果。

### 1.3 本地预览（可选但强烈建议）

部署前先在本地确认网站能正常运行：

```powershell
# 方式一：用项目自带的 serve.js（无需安装）
node ..\serve.js .
# 然后浏览器打开 http://localhost:5500

# 方式二：用 npm 启动 live-server（需要先 npm install）
npm install
npm run dev
# 浏览器自动打开 http://localhost:8080
```

> 📸 **截图位置**：浏览器中 `http://localhost:5500` 或 `http://localhost:8080` 成功显示首页。

---

## 2. GitHub 仓库创建与代码推送

### 2.1 创建 GitHub 仓库

1. 登录 GitHub（https://github.com）
2. 右上角点击 **"+"** → **"New repository"**
3. 填写仓库信息：

| 字段 | 填写值 | 说明 |
|---|---|---|
| Repository name | `apyapacific-official` | 仓库名（与项目相关即可） |
| Description | 亚太国际人民事业发展共同体官方网站 | 可选 |
| Visibility | **Public** | 必须 Public，否则 Cloudflare 免费版无法访问 |
| Initialize | **全部不勾选** | 我们本地已有代码，不需要 README/.gitignore/license |

4. 点击 **"Create repository"**
5. 创建成功后，**保留这个页面**，后面会用到仓库地址

> 📸 **截图位置**：GitHub 仓库创建成功的页面（带仓库地址）。

> ⚠️ **必踩坑提示**：仓库名一旦创建后修改路径很麻烦，建议一次想好。Visibility 必须是 Public。

### 2.2 本地 Git 初始化与提交

在 PowerShell 中执行：

```powershell
# 进入项目目录
cd "d:\网站开发\亚太国际人民事业发展共同体官方网站初稿(1)\亚太国际人民事业发展共同体官方网站初稿"

# 初始化 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 第一次提交
git commit -m "初始部署：完整网站源码"
```

**期望输出**：

```
[main (root-commit) xxxxxxx] 初始部署：完整网站源码
 13 files changed, xxxx insertions(+)
```

> 📸 **截图位置**：`git init`、`git add .`、`git commit` 三个命令的成功输出。

> ⚠️ **必踩坑提示**：
> - 必须先 `cd` 到项目根目录（包含 11 个 HTML 文件的那一层）
> - 路径中有中文没问题，但路径中有空格或括号要用引号包起来
> - 如果 `git init` 后出现 `(master)` 而不是 `(main)`，执行 `git branch -M main` 改名

### 2.3 推送到 GitHub

把本地仓库和 GitHub 关联并推送：

```powershell
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/157610chao/apyapacific-official.git

# 推送到 GitHub
git push -u origin main
```

**首次推送会弹出登录窗口**：

- 方式 A：用户名 + 密码（推荐用 Personal Access Token，2024 年后 GitHub 已不支持密码登录）
- 方式 B：浏览器授权登录（推荐新手用这个）

> ⚠️ **必踩坑提示**：
> - **2024 年后 GitHub 已不支持密码推送**，必须用 Personal Access Token 或浏览器登录
> - 如果推送失败提示 `Authentication failed`，参考 https://docs.github.com/zh/authentication

**期望输出**：

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XXX KiB | XXX MiB/s, done.
Total XX (delta 0), reused 0 (delta 0)
To https://github.com/157610chao/apyapacific-official.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 2.4 验证推送成功

方法 1：刷新 GitHub 仓库页面，应该能看到所有 11 个 HTML 文件

方法 2：PowerShell 中执行：

```powershell
# 查看本地状态（应该显示 nothing to commit）
git status

# 查看远程仓库信息
git ls-remote origin
```

> 📸 **截图位置**：
> - GitHub 仓库页面（显示所有文件）
> - `git status` 的 clean 状态输出
> - `git ls-remote origin` 输出（应显示 main 分支的引用）

---

## 3. Cloudflare 账号注册

1. 访问 https://dash.cloudflare.com/sign-up
2. 填写邮箱 + 密码
3. 验证邮箱
4. 登录后看到 Cloudflare 仪表盘

> 📸 **截图位置**：Cloudflare 仪表盘首页（左侧应有 "Workers & Pages" 菜单）。

---

## 4. 创建 Cloudflare Pages 项目

### 4.1 进入 Pages 创建入口

1. 登录 Cloudflare 仪表盘
2. 左侧菜单找到 **"Workers & Pages"**（或在 "Compute" 分类下）
3. 点击进入

> 📸 **截图位置**：Cloudflare 左侧菜单显示 "Workers & Pages" 的位置。

### 4.2 ⚠️ 难点 A：找不到 Pages 在哪里

**问题描述**：Cloudflare 改版多次，新版界面下 "Pages" 不一定叫这个名字。

**解决方案**：

| 你看到的 | 实际情况 | 解决 |
|---|---|---|
| 左侧有 "Workers & Pages" 菜单 | ✅ 正确位置 | 直接点 |
| 只有 "Workers" 没有 "Pages" | 你进了 Workers 区域 | 顶部标签切到 "Pages" |
| 左侧只有 "Compute" 没有 "Workers & Pages" | 旧版界面 | 点 "Compute" → 找 "Pages" 子菜单 |
| 找不到任何相关菜单 | 可能登录错了账号 | 右上角头像 → 切换账号 |

### 4.3 ⚠️ 难点 B：误进 Workers 的解决方案

**问题描述**：很多新手会误用 `wrangler deploy` 命令，把网站部署成了 Worker 而非 Pages。

**症状**：
- 项目列表里项目图标是 ⚡闪电（Worker）而不是 📄文件（Pages）
- 部署日志显示 "Uploaded" 而不是 "Building"
- 访问 URL 是 `*.workers.dev` 而不是 `*.pages.dev`

**解决方案**：

```
不要用 wrangler deploy 命令部署 Pages 项目！
正确做法是：在 Cloudflare 后台 → Pages → Connect to Git
```

如果已经误建了 Worker 项目：
1. 进入该 Worker 项目
2. 顶部找 "Looking to deploy Pages? Get started" 链接
3. 点击会跳转到 Pages 部署流程

> 📸 **截图位置**：
> - Worker 界面（带闪电图标的截图）
> - 顶部 "Get started" 链接的位置
> - Pages 创建入口的实际界面

### 4.4 连接 GitHub 仓库

1. 在 Pages 页面，点击 **"Create application"** 或 **"Create a project"**
2. 选择 **"Pages"** 标签
3. 点击 **"Connect to Git"**
4. 选择 **"GitHub"**
5. 在弹出的授权窗口中授权 Cloudflare 访问你的 GitHub
6. 选择仓库 `apyapacific-official`
7. 点击 **"Begin setup"**

> 📸 **截图位置**：
> - "Create application" 按钮位置
> - GitHub 授权页面
> - 选择仓库的下拉框

> ⚠️ **必踩坑提示**：
> - 如果 GitHub 账号下拉框里没看到你的仓库，点 "Configure GitHub app" 调整权限
> - 需要给 Cloudflare 授权访问 **All repositories** 或单独选择这个仓库

### 4.5 配置构建设置

进入构建设置页面，**严格按以下配置**：

| 配置项 | 填写值 | 说明 |
|---|---|---|
| **Project name** | `apyapacific-official` | 必须是全小写、连字符 |
| **Production branch** | `main` | 默认就是 main |
| **Framework preset** | **None** | ⚠️ 必须选 None，因为我们没有 build 步骤 |
| **Build command** | （留空） | 不需要 |
| **Build output directory** | `/` | ⚠️ 必须是 `/`，不是 `dist` |
| **Root directory** | （留空） | 默认就是项目根 |
| **Environment variables** | （不需要） | 纯静态站无环境变量 |

> 📸 **截图位置**：构建设置页面的完整截图（重点是 Framework preset = None，Build output = /）。

> ⚠️ **必踩坑提示**：
> - **Framework preset 千万不要选错**！如果选 "Next" / "Vue" 等，Cloudflare 会尝试执行 build 命令，导致构建失败
> - **Build output directory 必须是 `/`**，因为我们的 HTML 文件直接在根目录
> - 如果选 `dist` 或 `public`，会部署一个空网站

配置完成后点击 **"Save and Deploy"**。

---

## 5. 首次部署与状态检查

### 5.1 触发部署

点击 "Save and Deploy" 后，Cloudflare 会自动：

1. 拉取 GitHub 仓库代码
2. 执行构建（本项目无构建步骤，直接跳过）
3. 部署到 Cloudflare 边缘网络
4. 全程约 1-2 分钟

> 📸 **截图位置**：
> - 部署进行中的页面（带进度条或旋转图标）
> - 部署成功的页面（绿色对勾）

### 5.2 查看部署日志

1. 部署完成后，进入项目页面
2. 顶部标签 **"Deployments"**（部署）
3. 点击最新一次部署（标着 Active）
4. 查看构建日志，应该看到：

```
Cloning repository...
Installing dependencies...
Build command skipped
Deploying to Cloudflare Pages...
Success! Your project is deployed to Region: Earth
```

> 📸 **截图位置**：部署日志完整截图。

### 5.3 验证部署成功

部署成功后，页面会显示类似信息：

```
✓ Active
Initial deployment
main · xxxxxxx
Deployed in 30s
```

点击 **"Visit"** 按钮，会跳转到你的临时域名：

```
https://apyapacific-official.pages.dev
```

> 📸 **截图位置**：
> - 部署列表（Active 状态）
> - 临时域名显示

---

## 6. 访问与排错

### 6.1 正式访问地址

部署成功后，你有两个地址可访问：

| 地址类型 | URL | 说明 |
|---|---|---|
| **临时域名** | `https://apyapacific-official.pages.dev` | Cloudflare 免费赠送，全球通用 |
| **带子页面** | `https://apyapacific-official.pages.dev/about.html` | 任意 HTML 文件名替换即可 |
| **首页（带 /）** | `https://apyapacific-official.pages.dev/` | 末尾加 / 也行 |

### 6.2 ⚠️ 难点 C：ERR_CONNECTION_CLOSED

**问题描述**：访问临时域名时浏览器报 `ERR_CONNECTION_CLOSED`（连接被关闭）。

**根本原因**：
- Cloudflare 临时域名（`*.pages.dev`）走的是 Cloudflare 全球边缘网络
- 国内访问 Cloudflare 部分节点（特别是亚洲节点）会偶发不通
- **不是你的网站问题**，是网络路由问题

**解决方案（按推荐顺序）**：

1. **等待 5-10 分钟**：Cloudflare 会在 DNS 缓存更新后自动恢复
2. **换浏览器测试**：Edge 报错就试 Chrome / Firefox
3. **换网络环境**：手机 4G/5G 测试、换 WiFi 测试
4. **国内 CDN 加速**（高级）：用腾讯云/阿里云 CDN 反代
5. **绑定自定义域名**（终极方案）：用国内注册的域名 + Cloudflare 接入

**用户实测**：等待几分钟后国内访问自动恢复，无需额外操作。

> 📸 **截图位置**：
> - 浏览器报 `ERR_CONNECTION_CLOSED` 的错误页
> - 恢复后正常显示首页的截图（前后对比）

### 6.3 多页面验证

访问以下 URL 确认所有页面正常：

```
✅ https://apyapacific-official.pages.dev/
✅ https://apyapacific-official.pages.dev/projects.html
✅ https://apyapacific-official.pages.dev/health.html
✅ https://apyapacific-official.pages.dev/industry.html
✅ https://apyapacific-official.pages.dev/research.html
✅ https://apyapacific-official.pages.dev/science.html
✅ https://apyapacific-official.pages.dev/talent.html
✅ https://apyapacific-official.pages.dev/welfare.html
✅ https://apyapacific-official.pages.dev/join.html
✅ https://apyapacific-official.pages.dev/news.html
✅ https://apyapacific-official.pages.dev/validate.html
✅ https://apyapacific-official.pages.dev/关于亚太/总体介绍.html
✅ https://apyapacific-official.pages.dev/人民事业共同体/国家宣言.html
✅ https://apyapacific-official.pages.dev/人民产业与科研/未来产业规划/生物科技微谷.html
✅ https://apyapacific-official.pages.dev/人民组织与制度/人力资源基本法.html
✅ https://apyapacific-official.pages.dev/人民福利/人民教育.html
```

**验证清单**：
- [ ] 首页加载（轮播图、动画、字体都正常）
- [ ] 导航栏点击跳转正确
- [ ] CSS 样式正常（深蓝主题色 #1a3a6e）
- [ ] JS 交互正常（移动端菜单、滚动效果）
- [ ] 图片资源能加载（无 404）
- [ ] 字体能加载（Font Awesome 图标正常）

> 📸 **截图位置**：3-5 个不同页面的全屏截图。

---

## 7. 自定义域名绑定（可选）

> ⚠️ 本节是**进阶内容**，如果只是临时使用可以跳过。当前用户最终选择"先不绑域名"。

### 7.1 进入自定义域设置

1. 进入 Cloudflare Pages 项目页面
2. 顶部标签 **"Custom domains"**（自定义域）
3. 点击 **"Set up a custom domain"**

> 📸 **截图位置**：Custom domains 标签页的位置。

### 7.2 添加域名

1. 在输入框中输入你的域名，例如：`apyapacific.com`
2. 点击 **"Continue"**

### 7.3 配置 DNS 记录

如果你的域名**已经在 Cloudflare 托管**：

- Cloudflare 会自动识别并提示你添加 CNAME 记录
- 需要添加两条记录：

| 类型 | 名称 | 目标 |
|---|---|---|
| CNAME | `@`（根域） | `apyapacific-official.pages.dev` |
| CNAME | `www` | `apyapacific-official.pages.dev` |

如果你的域名**不在 Cloudflare**：

- 需要去域名注册商修改 NS 服务器
- 指向 Cloudflare 提供的两个 NS 地址
- 等待 NS 生效（最长 48 小时）

> 📸 **截图位置**：DNS 记录配置页面。

### 7.4 ⚠️ 难点 D：AAAA 记录 "read only" 错误

**问题描述**：点击 "Activate domain" 按钮时，弹出错误：

```
Unable to edit this record as this has been configured as read only
```

**根本原因**：
- 域名 `apyapacific.com` 现有 AAAA 记录（IPv6）`@ → 100::` 被 Cloudflare 锁定
- Cloudflare 自动给所有 NS 接入的域名添加这条 AAAA 记录
- 锁定意味着你的域名 NS 服务器还没完全切换到 Cloudflare
- Cloudflare 不允许在 NS 未完全生效时手动修改这条记录

**解决方案（三选一）**：

**方案 1：等待 NS 完全生效（最推荐）**
- 等待 24-48 小时
- NS 完全切换后，AAAA 记录会自动解锁
- 重新点 "Activate domain"

**方案 2：使用 CNAME 接入（高级）**
- Cloudflare 控制台 → DNS → Records
- 找到锁定的 AAAA 记录
- 删除它（如果有权限）或联系 Cloudflare 支持
- 然后用 CNAME 方式接入

**方案 3：暂不绑域名（用户最终选择）**
- 网站用 `*.pages.dev` 临时域名继续访问
- 适合"先上线，后期再优化"的场景
- 没有任何功能损失，只是地址不漂亮

**用户实测**：
- 由于当前项目 NS 状态为 "Partial Setup"（部分生效）
- AAAA 记录持续被锁定
- **最终选择：方案 3，暂不绑域名**

### 7.5 暂不绑域名的代价评估

| 影响项 | 评估 | 说明 |
|---|---|---|
| 网站功能 | ✅ 无影响 | 所有功能 100% 正常 |
| 国内访问 | ✅ 无影响 | `*.pages.dev` 同样走 Cloudflare CDN |
| 访问速度 | ✅ 无影响 | SSL、缓存、CDN 全部正常 |
| 成本 | ✅ 无影响 | 仍然完全免费 |
| 唯一问题 | ⚠️ 域名不漂亮 | 网址是 `apyapacific-official.pages.dev` |
| 后续可改 | ✅ 任何时候可绑 | 后期 NS 完全生效后可随时绑定 |

**结论**：暂不绑域名**没有任何隐患**，只是一个 URL 美观度问题。

> 📸 **截图位置**：
> - 报 "read only" 错误的弹窗
> - Cloudflare DNS Records 页面（显示被锁定的 AAAA 记录）

---

## 8. 内容维护流程

### 8.1 日常维护命令速查

**修改文件后，重新部署**：

```powershell
# 进入项目目录
cd "d:\网站开发\亚太国际人民事业发展共同体官方网站初稿(1)\亚太国际人民事业发展共同体官方网站初稿"

# 查看改动了哪些文件
git status

# 暂存所有改动
git add .

# 提交（写一句说明）
git commit -m "修改了什么内容"

# 推送到 GitHub（Cloudflare 自动重新部署）
git push
```

**等待 1-2 分钟**，刷新 `https://apyapacific-official.pages.dev/` 即可看到新内容。

### 8.2 上传视频/文档的两种方式

**方式 A：嵌入外链（推荐）**

把视频上传到 B 站、腾讯视频、YouTube，然后在 HTML 中嵌入 iframe：

```html
<iframe 
  src="https://player.bilibili.com/player.html?bvid=xxx"
  width="800" 
  height="450" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

**方式 B：直接放静态文件**

把文件拖到 `assets/` 文件夹，HTML 中引用：

```html
<!-- 引用视频 -->
<video controls width="800">
  <source src="assets/intro.mp4" type="video/mp4">
</video>

<!-- 引用 PDF -->
<a href="assets/章程.pdf" download>下载章程</a>
```

> ⚠️ **必踩坑提示**：Cloudflare Pages 单个文件限制 **25 MB**，超过的视频建议用外链方式。

### 8.3 Cloudflare 后台定位指南

**正确路径**：

```
登录 Cloudflare → 左侧 "Workers & Pages"
   → 顶部 "Pages" 标签
   → 点击项目名 "apyapacific-official"
   → 顶部标签："概览" | "部署" | "设置" | "自定义域" | "使用情况"
```

**各标签作用**：

| 标签 | 用途 | 编辑能力 |
|---|---|---|
| 概览 | 看项目状态、URL | 只读 |
| **部署** | 看历史部署记录 | 只读（GitHub 集成） |
| 设置 | 改构建配置、环境变量 | 可改 |
| 自定义域 | 绑定域名 | 可改 |
| 使用情况 | 看流量 | 只读 |

> ⚠️ **必踩坑提示**：**GitHub 集成方式部署的项目没有"在线编辑器"**！只能在本地改完 `git push`。如果想用 Cloudflare 后台直接改，需要改用 "Direct Upload" 方式部署（但这会丢失 Git 版本控制能力）。

> 📸 **截图位置**：Cloudflare Pages 项目后台的 5 个标签页分别截图。

---

## 9. 完整踩坑清单与速查表

### 9.1 部署阶段踩坑

| # | 错误现象 | 根本原因 | 解决方案 |
|---|---|---|---|
| 1 | `git push` 提示 `Authentication failed` | 2024 年后 GitHub 不支持密码登录 | 用 Personal Access Token 或浏览器授权 |
| 2 | `git commit` 提示 `Please tell me who you are` | 没配 user.name / user.email | 跑 `git config --global user.name/email` |
| 3 | Cloudflare 找不到 Pages 菜单 | 新版界面改了位置 | 找 "Workers & Pages" 整体入口 |
| 4 | 误进 Workers 部署 | 用了 `wrangler deploy` 命令 | 改用 Cloudflare 后台 + GitHub 集成 |
| 5 | Framework preset 选错导致构建失败 | 选了 Next/Vue 等框架 | 必须改回 **None** |
| 6 | Build output 选错导致部署空白 | 选了 `dist` 或 `public` | 改成 **`/`**（项目根目录） |
| 7 | GitHub 仓库选不到 | Cloudflare 没授权该仓库 | 重新配置 GitHub App 权限 |

### 9.2 访问阶段踩坑

| # | 错误现象 | 根本原因 | 解决方案 |
|---|---|---|---|
| 1 | `ERR_CONNECTION_CLOSED` | 国内访问 Cloudflare 节点不通 | 等待 DNS 同步（实测 5-10 分钟恢复） |
| 2 | 访问的是 `*.workers.dev` | 误部署到 Worker 了 | 重新创建 Pages 项目 |
| 3 | 子页面 404 | URL 拼写错误 | 用 `xxx.html` 后缀访问 |
| 4 | CSS 样式丢失 | 文件路径错误 | 检查 `<link>` 标签的 src |

### 9.3 域名绑定阶段踩坑

| # | 错误现象 | 根本原因 | 解决方案 |
|---|---|---|---|
| 1 | `Unable to edit this record as this has been configured as read only` | AAAA 记录被 NS 未生效锁定 | 等待 24-48h 或暂不绑域名 |
| 2 | 域名激活后无效果 | DNS 未生效 | 等待 TTL 过期（最长 48h） |
| 3 | HTTPS 不生效 | Cloudflare 证书未签发 | 等待几分钟，或检查 SSL/TLS 设置 |

### 9.4 维护阶段踩坑

| # | 错误现象 | 根本原因 | 解决方案 |
|---|---|---|---|
| 1 | 改了文件但网站没更新 | 忘 `git push` 或推送失败 | 跑 `git status` 检查本地状态 |
| 2 | 网站偶尔 404 | 部署过程中访问 | 等部署完成（1-2 分钟） |
| 3 | 上传的文件超过 25 MB | Cloudflare 限制 | 用外链方式（B 站/YouTube/腾讯视频） |

---

## 10. 复现检查清单

> 按照此清单逐项打勾，确保部署完整无误。

### 10.1 部署前

- [ ] 本地项目 11 个 HTML 文件齐全
- [ ] Git 已安装并配置 user.name/email
- [ ] GitHub 账号已注册
- [ ] Cloudflare 账号已注册

### 10.2 代码推送

- [ ] GitHub 仓库已创建（Public）
- [ ] 本地 `git init` 成功
- [ ] `git add .` 暂存所有文件
- [ ] `git commit` 第一次提交成功
- [ ] `git remote add origin` 关联远程
- [ ] `git push -u origin main` 推送成功
- [ ] GitHub 仓库页面能看到所有文件
- [ ] `git status` 显示 `nothing to commit, working tree clean`

### 10.3 Cloudflare 部署

- [ ] 登录 Cloudflare 仪表盘
- [ ] 进入 "Workers & Pages"
- [ ] 顶部切到 "Pages" 标签
- [ ] 点击 "Create application"
- [ ] 选择 "Connect to Git"
- [ ] 授权 GitHub 访问
- [ ] 选择 `apyapacific-official` 仓库
- [ ] Project name: `apyapacific-official`
- [ ] Framework preset: **None**
- [ ] Build output directory: **`/`**
- [ ] 点击 "Save and Deploy"

### 10.4 部署验证

- [ ] 部署状态为 "Active"
- [ ] 部署日志显示 "Success! Your project is deployed to Region: Earth"
- [ ] 访问 `https://apyapacific-official.pages.dev/` 正常显示首页
- [ ] 11 个子页面全部能访问
- [ ] 国内网络测试可正常访问

### 10.5 维护流程

- [ ] 知道本地修改后用 `git push` 重新部署
- [ ] 知道上传视频用 B 站/腾讯视频外链方式
- [ ] 知道 PDF/小视频放 `assets/` 目录
- [ ] 知道修改后等 1-2 分钟自动部署

### 10.6 可选：域名绑定

- [ ] 域名 `apyapacific.com` 在 Cloudflare 已托管
- [ ] 等待 NS 完全生效（24-48h）
- [ ] 重新尝试激活自定义域
- [ ] 或选择暂不绑域名（无任何功能损失）

---

## 📞 附录：常用链接

| 资源 | 链接 |
|---|---|
| GitHub 仓库 | https://github.com/157610chao/apyapacific-official |
| Cloudflare 仪表盘 | https://dash.cloudflare.com/ |
| Cloudflare Pages 文档 | https://developers.cloudflare.com/pages |
| 网站临时地址 | https://apyapacific-official.pages.dev |
| Git 下载 | https://git-scm.com/download/win |
| Node.js 下载 | https://nodejs.org/zh-cn/ |
| GitHub Token 生成 | https://github.com/settings/tokens |

---

## 📝 版本历史

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-06-13 | 初版，基于实际部署过程整理 |

---

> 💡 **使用提示**：本教程基于真实部署过程整理，所有错误和解决方案均为实际遇到的问题。复现时建议先通读一遍再动手，遇到问题对照"踩坑清单"查找。
