# 亚太国际人民事业发展共同体官方网站

<div align="center">

![Website](https://img.shields.io/badge/website-enterprise-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.0-purple)

**构建人类命运共同体的产业实践平台 · 超大型社会生态系统**

[在线演示](#) | [文档](#文档) | [贡献指南](#贡献指南)

</div>

---

## 📋 目录

- [项目概述](#-项目概述)
- [功能特性](#-功能特性)
- [技术架构](#-技术架构)
- [页面结构](#-页面结构)
- [快速开始](#-快速开始)
- [部署指南](#-部署指南)
- [设计规范](#-设计规范)
- [开发计划](#-开发计划)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 项目概述

### 项目背景

为"亚太国际人民事业发展共同体"构建现代化、响应式的官方网站，展示其组织理念、发展体系与全球愿景。

### 目标用户

- ✅ 共同体成员
- ✅ 潜在加入者（消费者/奋斗者/企业/城市）
- ✅ 合作伙伴
- ✅ 公众及媒体

### 核心价值

解决以下关键问题：
1. **收入焦虑** - 生活成本上升，收入增长缓慢
2. **产业无依** - 缺乏可持续发展路径
3. **食品安全** - 健康隐患日益突出
4. **各业内卷** - 恶性竞争消耗资源

提供解决方案：
- 🎯 **消费即投资** - 消费行为转化为价值贡献
- 📊 **数据有资产** - 个人数据成为生产要素
- 💪 **劳动获尊严** - 按贡献分配获得尊重
- 🤝 **共建享保障** - 共同参与共享发展成果

---

## ✨ 功能特性

### 核心功能

#### 1. 首页 (`index.html`)
- 🎬 **视频背景 Hero 区**: 循环播放全球人民笑脸、智能化生产场景、自然生态、科技互联
- 🎯 **价值主张三栏**: 问题 - 答案 - 不同点对比展示
- 📰 **动态信息流**: 实时滚动新闻 ticker
- 🌍 **全球足迹地图**: SVG+CSS 动态世界地图，带交互式标记点
- 🎥 **介绍视频模态框**: 3 分钟组织介绍视频播放

#### 2. 关于我们 (`about.html`)
- 共同体总览
- 领导核心介绍
- 发展历程时间轴
- 组织架构展示
- 九大体系详解

#### 3. 人民事业发展共同体 (`community.html`)
- 宪章精神
- 核心价值观
- 理论白皮书
- 价值重构对比
- 常见问答库

#### 4. 战略工程 (`projects.html`)
- 康卫士·生物工程
- 未来城·生物科技微谷
- 绿色未来·农业科技绿谷
- 中国服务体系
- 示范工程巡礼

#### 5. 业务体系 (`business.html`)
- 民间外交
- 全球贸易体系
- 产业赋能
- 科研生态体系
- 案例库

#### 6. 亚太人民教育学院 (`education.html`)
- 全面发展教育体系
- 三大业务（媒体、教育、配套）
- 学习体系
- 线上教育入口

#### 7. 制度与保障 (`system.html`)
- 《基本法》精要
- 人民价值贡献值（七色积分）体系
- 分配体系总览
- 民生保障规划
- 组织架构规范

#### 8. 加入我们 (`join.html`)
- 四类成员通道（消费者/奋斗者/企业/城市）
- 贡献值计算器（模拟）
- 线上注册流程

#### 9. 新闻与全球视野 (`news.html`)
- 最新动态
- 历史里程碑
- 权威解读转载
- 全球实践案例

#### 10. 资源中心 (`resources.html`)
- 文件库下载（白皮书、宪章、基本法等）
- 媒体素材
- 合作咨询入口

### 交互特性

- 🎨 **响应式设计**: 适配 PC、平板、手机全设备
- 🎭 **平滑滚动**: 锚点导航与自动高亮
- 💫 **交互动画**: 淡入、交错、脉冲、滚动计数
- 🌐 **多语言支持**: 中文为主，预留国际化接口
- 📱 **移动优先**: 移动端菜单优化体验
- 🔍 **SEO 友好**: 语义化 HTML 标签

---

## 🏗️ 技术架构

### 技术栈

```
┌─────────────────────────────────────┐
│         前端展示层                    │
│  HTML5 + CSS3 + JavaScript (ES6)    │
├─────────────────────────────────────┤
│         UI 框架层                     │
│      Bootstrap 5.3.0                 │
│   Font Awesome 6.4.0                 │
├─────────────────────────────────────┤
│         开发工具层                    │
│      live-server (Node.js)           │
│      npm package manager             │
└─────────────────────────────────────┘
```

### 目录结构

```
亚太国际人民事业发展共同体官方网站初稿/
├── 📁 css/
│   └── style.css              # 自定义样式（1479 行）
│                              # - 主题色变量系统
│                              # - 响应式布局
│                              # - 动画效果
│                              # - 组件样式
├── 📁 js/
│   └── main.js                # 交互逻辑（358 行）
│                              # - 导航控制
│                              # - 滚动效果
│                              # - 动画触发
│                              # - 地图交互
├── 📄 index.html              # 首页
├── 📄 about.html              # 关于我们
├── 📄 community.html          # 人民事业发展共同体
├── 📄 business.html           # 业务体系
├── 📄 education.html          # 教育学院
├── 📄 news.html               # 新闻中心
├── 📄 projects.html           # 战略工程
├── 📄 resources.html          # 资源中心
├── 📄 system.html             # 制度保障
├── 📄 join.html               # 加入我们
├── 📄 validate.html           # 验证页面
└── 📄 package.json            # 项目配置
```

### 设计模式

- **组件化**: 页面模块复用（导航、页脚、卡片等）
- **模块化 CSS**: 使用自定义 `style.css` 覆盖和扩展 Bootstrap
- **事件委托**: JavaScript 中处理动态元素交互
- **CSS 变量**: 主题色统一管理，便于换肤

---

## 🚀 快速开始

### 环境要求

- Node.js >= v14.x
- npm >= 6.x
- 现代浏览器（Chrome/Firefox/Safari/Edge）

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd 亚太国际人民事业发展共同体官方网站初稿
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 启动开发服务器

**带浏览器自动打开:**
```bash
npm run dev
```

**不带浏览器:**
```bash
npm run serve
```

访问地址：`http://localhost:8080`

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器并自动打开浏览器 |
| `npm run serve` | 启动开发服务器（不自动打开） |
| `npm run build` | 构建打包（静态文件无需编译） |

---

## 📦 部署指南

### 方案一：Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/website;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### 方案二：GitHub Pages

1. 创建 GitHub 仓库
2. 推送代码到 `main` 分支
3. 进入 Settings → Pages
4. 选择 `main` 分支保存
5. 访问 `https://username.github.io/repo-name`

### 方案三：Vercel / Netlify

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
- 拖拽 `dist` 文件夹到 Netlify Drop
- 或连接 Git 仓库自动部署

### 方案四：CDN 部署

上传所有静态文件到 CDN 服务（如阿里云 OSS、腾讯云 COS），开启 CDN 加速。

---

## 🎨 设计规范

### 色彩系统

#### 主题色

```css
:root {
    --primary-color: #1a3a6e;      /* 深蓝色 - 权威、稳重、国际化 */
    --secondary-color: #c9a95e;    /* 金色 - 价值、品质、光明 */
    --accent-color: #b8860b;       /* 暗金色 - 强调色 */
    --success-color: #198754;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #0dcaf0;
}
```

#### 使用场景

| 颜色 | 用途 | 示例 |
|------|------|------|
| 深蓝色 (#1a3a6e) | 主标题、导航栏、重要按钮 | 品牌标识 |
| 金色 (#c9a95e) | 强调文字、图标、边框 | 荣誉徽章 |
| 暗金色 (#b8860b) | 悬停状态、次要强调 | 链接 hover |
| 成功绿 (#198754) | 正面信息、确认操作 | 成功提示 |
| 危险红 (#dc3545) | 警告、删除操作 | 错误提示 |

### 字体规范

```css
font-family: -apple-system, BlinkMacSystemFont, 
"Segoe UI", Roboto, "Helvetica Neue", 
Arial, "Microsoft YaHei", sans-serif;
```

#### 字号层级

- **超大标题**: `display-3` (Bootstrap 类)
- **大标题**: `h1`, `h2` 
- **中标题**: `h3`, `h4`
- **正文**: `1rem` (16px)
- **辅助文字**: `0.875rem` (14px)
- **小字**: `0.75rem` (12px)

### 间距系统

基于 Bootstrap 5 的 spacing 工具类：

- `m-0` ~ `m-5`: 外边距
- `p-0` ~ `p-5`: 内边距
- `gap-0` ~ `gap-5`: 间隙

### 组件规范

#### 按钮

```html
<!-- 主按钮 -->
<button class="btn btn-primary">主要操作</button>

<!-- 次级按钮 -->
<button class="btn btn-outline-primary">次要操作</button>

<!-- 带图标按钮 -->
<button class="btn btn-primary">
    <i class="fas fa-download"></i> 下载
</button>
```

#### 卡片

```html
<div class="card shadow-sm border-0">
    <div class="card-body">
        <h5 class="card-title">标题</h5>
        <p class="card-text">内容</p>
    </div>
</div>
```

### 图片规范

- **格式**: WebP > PNG > JPG
- **尺寸**: 根据使用场景提供多种规格
- **压缩**: 使用工具优化（推荐 TinyPNG）
- **懒加载**: 长页面图片使用 `loading="lazy"`

---

## 📋 开发计划

### 已完成 ✅

- [x] 首页框架搭建
- [x] 响应式导航系统
- [x] Hero 展示区（含视频背景占位）
- [x] 价值主张三栏
- [x] 动态信息流
- [x] 全球足迹地图（SVG+CSS）
- [x] 页面平滑滚动
- [x] 交互动画系统
- [x] 基础页面路由

### 进行中 🚧

- [ ] 视频素材制作与集成
- [ ] 各分页面详细内容填充
- [ ] 贡献值计算器实现
- [ ] 表单验证与提交
- [ ] 性能优化（图片压缩、代码分割）

### 规划中 📅

- [ ] 多语言切换（英文版本）
- [ ] 会员中心（登录/注册）
- [ ] 新闻动态后台管理
- [ ] 数据统计面板
- [ ] 在线客服系统
- [ ] 移动端 App 封装

---

## ❓ 常见问题

### Q1: 如何替换 Hero 区域的视频？

**A:** 在 `index.html` 中找到以下代码，取消注释并替换视频路径：

```html
<video autoplay muted loop id="hero-video">
    <source src="videos/hero-background.mp4" type="video/mp4">
</video>
```

将 `videos/hero-background.mp4` 替换为你的视频文件路径。

### Q2: 如何添加新的国家足迹标记？

**A:** 在 `index.html` 的全球足迹区域添加新的标记点：

```html
<div class="footprint-marker normal" 
     style="top: XX%; left: XX%;" 
     data-country="国家名" 
     data-members="成员数" 
     data-desc="描述信息">
    <div class="marker-pulse"></div>
    <div class="marker-dot"></div>
    <div class="marker-label">显示名称</div>
</div>
```

调整 `top` 和 `left` 百分比来定位。

### Q3: 如何修改导航菜单项？

**A:** 在 `index.html` 中找到 `<nav>` 标签内的菜单结构，按需添加/修改/删除 `<li>` 元素。

### Q4: 网站加载速度慢怎么办？

**A:** 
1. 压缩图片资源（使用 TinyPNG 等工具）
2. 开启 CDN 加速
3. 启用 Gzip 压缩
4. 优化 CSS/JS（移除未使用代码）
5. 图片使用 WebP 格式

### Q5: 移动端菜单无法打开？

**A:** 检查 Bootstrap JS 是否正确加载，确保以下代码在 `</body>` 前：

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 2 个空格缩进
- CSS 类名使用短横线命名法（kebab-case）
- JavaScript 使用驼峰命名法（camelCase）
- HTML 标签全部小写
- 代码需添加必要注释

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**: feat | fix | docs | style | refactor | test | chore

**示例**:
```
feat(home): 添加全球足迹地图交互功能

- 新增 SVG 世界地图组件
- 实现标记点悬停效果
- 优化移动端点击体验

Closes #123
```

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 👥 团队

- **开发者**: 亚太国际人民事业发展共同体技术团队
- **设计**: 品牌视觉设计组
- **产品**: 产品策划委员会

---

## 📞 联系方式

- **官网**: https://www.example.org
- **邮箱**: tech@example.org
- **电话**: +86-10-12345678
- **地址**: 北京市朝阳区某某路 123 号

---

## 🙏 致谢

感谢以下开源项目：

- [Bootstrap](https://getbootstrap.com/) - UI 框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [live-server](https://github.com/tapio/live-server) - 开发服务器

---

<div align="center">

**🌍 构建人类命运共同体的产业实践平台**

Made with ❤️ by 亚太国际人民事业发展共同体技术团队

</div>
