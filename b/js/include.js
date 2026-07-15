/**
 * 公共组件事件派发器
 * - 页头（导航栏）已内联进各页面 HTML，无需再 fetch 注入，
 *   这样直接以 file:// 方式打开本地文件时导航栏也能正常显示。
 * - DOM 就绪后高亮当前页面对应的导航项，并派发 'partials:loaded'
 *   事件，供 main.js 监听并启用交互（下拉菜单等）。
 */
(function () {
    'use strict';

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

    // DOM 就绪即可开始（无需等待资源加载）
    document.addEventListener('DOMContentLoaded', function () {
        fireReady();
    });
})();
