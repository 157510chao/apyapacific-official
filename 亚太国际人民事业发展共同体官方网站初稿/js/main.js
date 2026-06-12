/**
 * 亚太国际人民事业发展共同体 - 主交互脚本 v3.0
 * - 统一在 partials 加载完成后（partials:loaded）才初始化交互
 * - 增加 prefers-reduced-motion 兼容
 */
document.addEventListener('partials:loaded', function () {

    /* ============================================================
       1. 导航栏：滚动变色 + 桌面端悬停展开下拉
    ============================================================ */
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // 桌面端 hover 打开下拉（>=1200px 即 xl）
        const isDesktop = () => window.innerWidth >= 1200;
        navbar.querySelectorAll('.dropdown').forEach(dd => {
            const toggle = dd.querySelector('.dropdown-toggle');
            const menu = dd.querySelector('.dropdown-menu');
            if (!toggle || !menu) return;

            const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle, { autoClose: false });

            // 禁用 click 切换（避免与 hover 冲突）
            toggle.addEventListener('click', function (e) {
                if (isDesktop()) {
                    e.preventDefault();
                    // 点击导航到父页面（如 about.html）
                    window.location.href = toggle.getAttribute('href') || '#';
                }
                // 移动端由 Bootstrap 原生处理
            });

            let timer;
            dd.addEventListener('mouseenter', () => {
                if (!isDesktop()) return;
                clearTimeout(timer);
                bsDropdown.show();
            });
            dd.addEventListener('mouseleave', () => {
                if (!isDesktop()) return;
                timer = setTimeout(() => bsDropdown.hide(), 180);
            });
        });
    }

    /* ============================================================
       2. 锚点平滑滚动（补偿导航栏高度）
    ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = (document.getElementById('mainNavbar')?.offsetHeight || 72) + 12;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            // 关闭移动端 offcanvas
            const off = document.getElementById('mobileMenu');
            if (off && off.classList.contains('show')) {
                bootstrap.Offcanvas.getInstance(off)?.hide();
            }
        });
    });

    /* ============================================================
       3. 回到顶部按钮
    ============================================================ */
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
        backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ============================================================
       4. 联系表单验证
    ============================================================ */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            this.classList.add('was-validated');
            if (!this.checkValidity()) return;

            const btn = this.querySelector('button[type="submit"]');
            const origHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>提交中…';

            // 模拟提交（未来可替换为 fetch 到后端）
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-circle-check me-2"></i>提交成功！';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
                form.reset();
                form.classList.remove('was-validated');

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = origHTML;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-primary');
                }, 3000);
            }, 1400);
        });
    }

    /* ============================================================
       5. 数字滚动动画（IntersectionObserver）
    ============================================================ */
    const numEls = document.querySelectorAll('.stat-number[data-target]');
    if (numEls.length) {
        const numObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                const duration = 1800;
                const startTime = performance.now();

                const step = (now) => {
                    const prog = Math.min((now - startTime) / duration, 1);
                    // 缓动函数 (ease-out)
                    const eased = 1 - Math.pow(1 - prog, 3);
                    const val = Math.floor(eased * target);
                    if (target >= 10000) {
                        el.textContent = prefix + (val / 10000).toFixed(val >= target ? 0 : 1).replace(/\.0$/, '') + '万' + suffix;
                    } else {
                        el.textContent = prefix + val.toLocaleString('zh-CN') + suffix;
                    }
                    if (prog < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                numObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        numEls.forEach(el => numObs.observe(el));
    }

    /* ============================================================
       6. 通用卡片入场动画
    ============================================================ */
    const animEls = document.querySelectorAll('.vp-card, .project-card, .news-card, .stat-item, .org-box, .feature-item');
    if (animEls.length) {
        const animObs = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('anim-in'), Math.min(i, 8) * 70);
                animObs.unobserve(entry.target);
            });
        }, { threshold: 0.08 });
        animEls.forEach(el => {
            el.classList.add('anim-ready');
            animObs.observe(el);
        });
    }

    /* ============================================================
       7. 滚动进度条（顶部细线）
    ============================================================ */
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
        const updateProgress = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const w = h > 0 ? (window.scrollY / h) * 100 : 0;
            progress.style.width = w + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    console.log('%c✅ APCC 官网 v3.0 加载完成 ', 'background:#2563eb;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold;');
});

/**
 * 兜底：万一 partials 没注入成功，仍尝试绑定基础交互
 */
document.addEventListener('DOMContentLoaded', function () {
    // 4 秒后如果还没收到 partials:loaded，至少保证回到顶部按钮可点
    setTimeout(() => {
        const backBtn = document.getElementById('backToTop');
        if (backBtn && !backBtn.onclick) {
            window.addEventListener('scroll', () => {
                backBtn.classList.toggle('visible', window.scrollY > 400);
            }, { passive: true });
            backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }
    }, 4000);
});
