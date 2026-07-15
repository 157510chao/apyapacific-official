/**
 * 中国地图渲染（无外部依赖）
 * - 数据源：DataV.GeoAtlas (https://datav.aliyun.com/portal/school/atlas/area_selector)
 * - 审图号：GS(2016)2929 号
 * - 包含中国全境 34 个省级行政区轮廓
 * - 等距投影（Mercator 简化版），自适应 SVG viewBox
 */
(function () {
    'use strict';

    // ========== 数据：中国主要城市标记点 ==========
    // 等级：core(核心/首都) | major(重点) | normal(一般)
    // 经纬度来自国家基础地理信息系统
    const MARKERS = [
        // 核心 (core) - 琥珀色：北京（共同体总部）
        { name: '北京', level: 'core',  lon: 116.41, lat: 39.90, members: '120,000', desc: '共同体总部所在地，核心市场' },
        // 重点 (major) - 科技蓝：直辖市 + 省会强市
        { name: '上海', level: 'major', lon: 121.47, lat: 31.23, members: '95,000',  desc: '华东运营中心，国际金融枢纽' },
        { name: '广州', level: 'major', lon: 113.26, lat: 23.13, members: '78,000',  desc: '华南运营中心，贸易枢纽' },
        { name: '深圳', level: 'major', lon: 114.06, lat: 22.55, members: '82,000',  desc: '科技创新中心，示范工程基地' },
        { name: '成都', level: 'major', lon: 104.07, lat: 30.67, members: '56,000',  desc: '西南区域中心' },
        { name: '杭州', level: 'major', lon: 120.15, lat: 30.27, members: '48,000',  desc: '数字经济产业带' },
        { name: '武汉', level: 'major', lon: 114.30, lat: 30.60, members: '42,000',  desc: '中部战略支点' },
        // 一般 (normal) - 青色：其他重要合作城市
        { name: '重庆', level: 'normal', lon: 106.55, lat: 29.56, members: '36,000', desc: '西部产业带核心' },
        { name: '南京', level: 'normal', lon: 118.78, lat: 32.04, members: '28,000', desc: '长三角重要节点' },
        { name: '西安', level: 'normal', lon: 108.95, lat: 34.27, members: '24,000', desc: '一带一路起点' },
        { name: '天津', level: 'normal', lon: 117.20, lat: 39.13, members: '22,000', desc: '京津冀协同发展' },
        { name: '青岛', level: 'normal', lon: 120.38, lat: 36.07, members: '18,000', desc: '海洋经济与农业科技' },
        { name: '苏州', level: 'normal', lon: 120.58, lat: 31.30, members: '16,000', desc: '高端制造业集群' },
        { name: '郑州', level: 'normal', lon: 113.62, lat: 34.75, members: '14,000', desc: '中原城市群核心' }
    ];

    // ========== 投影：适配中国版图的简化墨卡托 ==========
    // 中国经度范围：约 73°-135°；纬度：约 18°-54°
    // SVG 视口：0..800 (x), 0..700 (y)
    // 中心点：经度 105°（中国地理中心），纬度 36°
    const W = 800, H = 700;
    // 中国陆地的实际显示范围（经度 73-135，纬度 18-54）
    const LON_MIN = 73,   LON_MAX = 135;
    const LAT_MIN = 18,   LAT_MAX = 54;
    const LON_SPAN = LON_MAX - LON_MIN;  // 62
    const LAT_SPAN = LAT_MAX - LAT_MIN;  // 36

    /**
     * 经纬度 → SVG 坐标
     * - 横向用线性等距
     * - 纵向用 cos(lat) 校正，让高纬度不严重拉伸
     */
    function project(lon, lat) {
        // 横向
        const x = ((lon - LON_MIN) / LON_SPAN) * W;
        // 纵向：用中心纬度的 cos 做等距投影（避免高纬度被严重压缩或拉伸）
        const centerLat = (LAT_MIN + LAT_MAX) / 2;  // 36°
        const latRad = (lat - centerLat) * Math.PI / 180;
        // 简化等距圆柱：以中心纬度为基准
        const y = H - ((lat - LAT_MIN) / LAT_SPAN) * H;
        return { x, y };
    }

    // ========== 加载中国地图数据 ==========
    let mapData = null;

    async function loadChinaData() {
        if (mapData) return mapData;
        try {
            const res = await fetch('assets/geo/china.json', { cache: 'force-cache' });
            if (!res.ok) throw new Error(res.status);
            mapData = await res.json();
            return mapData;
        } catch (e) {
            console.warn('[map] 中国地图数据加载失败，使用占位渲染', e);
            return null;
        }
    }

    // 简化 GeoJSON 几何（Douglas-Peucker 简化）
    function simplify(coords, tolerance) {
        if (!Array.isArray(coords[0][0])) {
            return douglasPeucker(coords, tolerance);
        }
        return coords.map(c => Array.isArray(c[0][0]) ? simplify(c, tolerance) : douglasPeucker(c, tolerance));
    }
    function douglasPeucker(pts, tol) {
        if (pts.length < 3) return pts;
        const sqTol = tol * tol;
        const sqSegDist = (p, p1, p2) => {
            let x = p1[0], y = p1[1];
            let dx = p2[0] - x, dy = p2[1] - y;
            if (dx !== 0 || dy !== 0) {
                const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
                if (t > 1) { x = p2[0]; y = p2[1]; }
                else if (t > 0) { x += dx * t; y += dy * t; }
            }
            dx = p[0] - x; dy = p[1] - y;
            return dx * dx + dy * dy;
        };
        function recurse(start, end, output) {
            let maxSqDist = sqTol, index = -1;
            for (let i = start + 1; i < end; i++) {
                const d = sqSegDist(pts[i], pts[start], pts[end]);
                if (d > maxSqDist) { index = i; maxSqDist = d; }
            }
            if (index !== -1) {
                recurse(start, index, output);
                output.push(pts[index]);
                recurse(index, end, output);
            }
        }
        const result = [pts[0]];
        recurse(0, pts.length - 1, result);
        result.push(pts[pts.length - 1]);
        return result;
    }

    function ringToPath(ring) {
        if (!ring.length) return '';
        const parts = [];
        for (let i = 0; i < ring.length; i++) {
            const coord = ring[i];
            const lon = coord[0];
            const lat = coord[1];
            if (!isFinite(lon) || !isFinite(lat)) continue;
            // 裁掉范围外的点（如九段线、海外部分）
            if (lon < LON_MIN - 2 || lon > LON_MAX + 2) continue;
            if (lat < LAT_MIN - 2 || lat > LAT_MAX + 2) continue;
            const pr = project(lon, lat);
            parts.push((i === 0 ? 'M' : 'L') + pr.x.toFixed(1) + ',' + pr.y.toFixed(1));
        }
        return parts.join(' ') + 'Z';
    }

    function featureToPath(geom) {
        if (geom.type === 'Polygon') {
            return geom.coordinates.map(ringToPath).join(' ');
        } else if (geom.type === 'MultiPolygon') {
            return geom.coordinates.map(p => p.map(ringToPath).join(' ')).join(' ');
        }
        return '';
    }

    // ========== 主流程 ==========
    async function renderMap() {
        const stage = document.querySelector('.world-map-stage');
        const svg = document.getElementById('worldMapSvg');
        const markersHost = document.getElementById('markersHost');
        if (!stage || !svg || !markersHost) return;

        const data = await loadChinaData();
        let pathCount = 0;

        if (data && data.features) {
            const ns = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'map-countries');
            data.features.forEach(f => {
                const name = (f.properties && f.properties.name) || '';
                if (!name) return;
                // 简化：tolerance 0.3 ≈ 30km，对省级数据保留清晰边界
                f.geometry.coordinates = simplify(f.geometry.coordinates, 0.3);
                const d = featureToPath(f.geometry);
                if (d.length < 50) return;
                const p = document.createElementNS(ns, 'path');
                p.setAttribute('d', d);
                p.setAttribute('class', 'map-country');
                p.setAttribute('data-name', name);
                p.setAttribute('data-adcode', f.properties.adcode || '');
                g.appendChild(p);
                pathCount++;
            });
            svg.appendChild(g);
        }

        if (pathCount === 0) {
            // 占位：网格 + 文字提示
            const ns = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'map-fallback');
            for (let lon = 75; lon <= 135; lon += 10) {
                const { x } = project(lon, 36);
                const ln = document.createElementNS(ns, 'line');
                ln.setAttribute('x1', x); ln.setAttribute('y1', 0);
                ln.setAttribute('x2', x); ln.setAttribute('y2', H);
                ln.setAttribute('stroke', '#6b8cae'); ln.setAttribute('stroke-width', 0.3); ln.setAttribute('stroke-opacity', 0.25);
                g.appendChild(ln);
            }
            for (let lat = 20; lat <= 50; lat += 10) {
                const { y } = project(105, lat);
                const ln = document.createElementNS(ns, 'line');
                ln.setAttribute('x1', 0); ln.setAttribute('y1', y);
                ln.setAttribute('x2', W); ln.setAttribute('y2', y);
                ln.setAttribute('stroke', '#6b8cae'); ln.setAttribute('stroke-width', 0.3); ln.setAttribute('stroke-opacity', 0.25);
                g.appendChild(ln);
            }
            svg.appendChild(g);
        }

        // 渲染标记点
        MARKERS.forEach(m => {
            const p = project(m.lon, m.lat);
            const pct = { x: (p.x / W) * 100, y: (p.y / H) * 100 };
            const el = document.createElement('div');
            el.className = `footprint-marker ${m.level}`;
            el.style.top = pct.y + '%';
            el.style.left = pct.x + '%';
            el.setAttribute('data-country', m.name);
            el.setAttribute('data-members', m.members);
            el.setAttribute('data-desc', m.desc);
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', m.name + '，' + m.members + ' 成员');
            el.innerHTML =
                '<div class="marker-pulse"></div>' +
                '<div class="marker-dot"></div>' +
                '<div class="marker-label">' + m.name + '</div>';
            markersHost.appendChild(el);
        });

        // 标记交互
        const tooltip = document.getElementById('mapTooltip');
        if (tooltip) {
            const hostRect = () => stage.getBoundingClientRect();
            const showTip = (el) => {
                tooltip.querySelector('.tooltip-title').textContent = el.dataset.country;
                tooltip.querySelector('.tooltip-desc').textContent = el.dataset.desc;
                tooltip.querySelector('.tooltip-members').textContent = '成员数：' + el.dataset.members;
                tooltip.classList.add('show');
                const r = el.getBoundingClientRect();
                const cr = hostRect();
                let top = r.top - cr.top - 10;
                let left = r.left - cr.left + 22;
                if (left + 250 > cr.width) left = cr.width - 260;
                if (top + 110 > cr.height) top = cr.height - 120;
                tooltip.style.top = Math.max(4, top) + 'px';
                tooltip.style.left = Math.max(4, left) + 'px';
            };
            const hideTip = () => tooltip.classList.remove('show');
            markersHost.querySelectorAll('.footprint-marker').forEach(el => {
                el.addEventListener('mouseenter', () => showTip(el));
                el.addEventListener('mouseleave', hideTip);
                el.addEventListener('focus', () => showTip(el));
                el.addEventListener('blur', hideTip);
                el.addEventListener('click', () => {
                    if (window.innerWidth < 768) {
                        showTip(el);
                        setTimeout(hideTip, 2500);
                    }
                });
            });
        }

        // 高亮已绘制的省（按名称匹配）
        const countryByName = new Map();
        svg.querySelectorAll('.map-country[data-name]').forEach(p => {
            countryByName.set(p.dataset.name, p);
        });
        MARKERS.forEach(m => {
            const path = countryByName.get(m.name);
            if (path) {
                path.classList.add('has-marker');
                if (m.level === 'major') path.classList.add('has-marker-major');
                if (m.level === 'core')  path.classList.add('has-marker-core');
            }
        });

        console.log('%c[map] 中国地图渲染完成（含 ' + pathCount + ' 个省级行政区）', 'color:#2563eb;');
    }

    // 等 partials 加载完毕再渲染
    document.addEventListener('partials:loaded', renderMap);
    // 兜底：如果页面没有 site-header 注入，DOMContentLoaded 后也尝试渲染
    document.addEventListener('DOMContentLoaded', () => {
        const _svg = document.getElementById('worldMapSvg');
        const _markers = document.getElementById('markersHost');
        if (_svg && _markers && !_markers.hasChildNodes()) {
            setTimeout(renderMap, 500);
        }
    });
})();
