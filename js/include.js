/**
 * 公共组件动态注入器
 * - 将 partials/header.html 注入到 <div id="site-header"></div>
 * - 页脚（footer）已在各页面 HTML 内联，不再通过 JS 注入，
 *   以免 IDE 预览 / 浏览器对 fetch 的旧 partial 缓存导致页脚不更新。
 * - 注入完成后触发 'partials:loaded' 事件，供 main.js 监听并启用交互
 * - 高亮当前页面对应的导航项
 */
(function () {
    'use strict';

    // 版本号：更新 partials/header.html 后自增，用于绕过缓存。
    const PARTIALS_VERSION = '2';
    const HEADER_URL = '/partials/header.html?v=' + PARTIALS_VERSION;

    /**
     * fetch HTML 片段并注入到指定选择器
     * @param {string} url
     * @param {string} targetSelector
     * @returns {Promise<void>}
     */
    async function inject(url, targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) return;
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
            const html = await res.text();
            target.innerHTML = html;
        } catch (e) {
            console.error('[include] 注入失败：' + url, e);
            target.innerHTML = '<div class="alert alert-warning m-3" role="alert">导航组件加载失败，请刷新或检查网络。</div>';
        }
    }

    /**
     * 高亮当前页面对应的导航项
     */
    function highlightCurrent() {
        const path = window.location.pathname;
        const page = (path.split('/').pop() || 'index.html').toLowerCase();

        // 主导航 + 移动菜单
        document.querySelectorAll('#site-header a[data-nav]').forEach(a => {
            if ((a.dataset.nav || '').toLowerCase() === page) {
                a.classList.add('active');
            }
        });

        // 下拉菜单项 - 不再自动高亮当前页（避免下拉里所有相关项都染色）
        // 只高亮对应的一级菜单 toggle
        document.querySelectorAll('#site-header .dropdown-toggle').forEach(toggle => {
            const href = (toggle.getAttribute('href') || '').toLowerCase();
            if (href === page || href.split('#')[0] === page) {
                toggle.classList.add('active');
            }
        });
    }

    /**
     * 全部加载完成后派发事件
     */
    function fireReady() {
        document.dispatchEvent(new CustomEvent('partials:loaded'));
        highlightCurrent();
    }

    // DOM 就绪即可开始注入（无需等资源加载完）
    document.addEventListener('DOMContentLoaded', function () {
        Promise.all([
            inject(HEADER_URL, '#site-header')
        ]).then(fireReady);
    });
})();
