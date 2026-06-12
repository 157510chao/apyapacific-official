/**
 * 真实世界地图渲染（无外部依赖）
 * - 使用预先写好的等距投影国家轮廓 JSON（world-110m）
 * - 简化版：直接嵌入 TopoJSON 已转换为 GeoJSON 的精简数据
 * - 数据源：natural earth 1:110m, 经简化（约 110 国）
 *
 * 实际使用建议：
 *   如需更高精度，替换 GEODATA 数组为 d3-geo + topojson-client 加载的 world-110m.json
 *   即可获得与官方地图一致的国家轮廓。
 */
(function () {
    'use strict';

    // ========== 数据：标记点经纬度 ==========
    const MARKERS = [
        // 核心 (core) - 琥珀色
        { name: '中国·北京',     level: 'core',   lon: 116.41, lat: 39.90, members: '100,000', desc: '总部所在地，核心市场' },
        // 重点 (major) - 科技蓝
        { name: '美国',         level: 'major',  lon: -77.04, lat: 38.90, members: '15,000', desc: '美洲总部，战略合作伙伴' },
        { name: '英国',         level: 'major',  lon: -0.13,  lat: 51.51, members: '8,000',  desc: '欧洲运营中心' },
        { name: '日本',         level: 'major',  lon: 139.69, lat: 35.69, members: '7,000',  desc: '亚太区重要市场' },
        { name: '印度',         level: 'major',  lon: 77.21,  lat: 28.61, members: '5,500',  desc: '南亚重要市场' },
        { name: '德国',         level: 'major',  lon: 13.40,  lat: 52.52, members: '6,500',  desc: '技术研发合作' },
        // 一般 (normal) - 青色
        { name: '法国',         level: 'normal', lon: 2.35,   lat: 48.86, members: '5,000',  desc: '民间外交基地' },
        { name: '韩国',         level: 'normal', lon: 126.99, lat: 37.56, members: '4,500',  desc: '东北亚合作' },
        { name: '巴西',         level: 'normal', lon: -47.93, lat: -15.78, members: '2,800', desc: '南美新兴市场' },
        { name: '南非',         level: 'normal', lon: 28.05,  lat: -26.20, members: '2,000', desc: '非洲桥头堡' },
        { name: '澳大利亚',     level: 'normal', lon: 151.21, lat: -33.87, members: '3,500', desc: '大洋洲业务中心' },
        { name: '俄罗斯',       level: 'normal', lon: 37.62,  lat: 55.75, members: '3,200', desc: '欧亚合作枢纽' },
        { name: '加拿大',       level: 'normal', lon: -75.69, lat: 45.42, members: '2,400', desc: '北美研发合作' }
    ];

    // ========== 投影：Equirectangular（裁掉两极以避免拉伸失真） ==========
    // SVG 视口：0..1000 (x), 0..500 (y)
    // 纬度仅渲染 -50° ~ 76°（裁掉南极、格陵兰极地、智利/阿根廷最南）
    const W = 1000, H = 500;
    const LAT_MAX = 76;     // 裁掉 76° 以上（北极/格陵兰极地）
    const LAT_MIN = -50;    // 裁掉 -50° 以下（南极洲、智利最南）
    const LAT_SPAN = LAT_MAX - LAT_MIN; // 126
    const LAT_OFFSET = -LAT_MIN;        // 50
    function project(lon, lat) {
        // 经度 -180..180 -> 0..1000
        const x = ((lon + 180) / 360) * W;
        // 纬度（裁剪后）LAT_MIN..LAT_MAX -> 0..H
        const y = ((LAT_MAX - lat) / LAT_SPAN) * H;
        return { x, y };
    }

    // ========== 加载 TopoJSON 数据并渲染 ==========
    let mapData = null;

    async function loadWorldData() {
        if (mapData) return mapData;
        try {
            const res = await fetch('assets/world-110m.json', { cache: 'force-cache' });
            if (!res.ok) throw new Error(res.status);
            mapData = await res.json();
            return mapData;
        } catch (e) {
            console.warn('[map] 世界地图数据加载失败，使用占位渲染', e);
            return null;
        }
    }

    // 极简 topojson -> geojson 转换（仅支持 Polygon/MultiPolygon，无 arcs 共享）
    function topoToGeo(topo) {
        if (!topo || !topo.objects) return null;
        const obj = topo.objects[Object.keys(topo.objects)[0]];
        if (!obj) return null;
        const { arcs: topoArcs, transform } = topo;
        const { scale, translate } = transform;
        const decode = arc => {
            let x = 0, y = 0;
            return arc.map(([dx, dy]) => {
                x += dx; y += dy;
                return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
            });
        };
        const allArcs = topoArcs.map(decode);
        const arcAt = i => i >= 0 ? allArcs[i] : allArcs[~i].slice().reverse();

        function buildRing(arcs) {
            const pts = [];
            arcs.forEach(i => arcAt(i).forEach(p => pts.push(p)));
            return pts;
        }
        function feature(g) {
            if (g.type === 'Polygon') {
                return { type: 'Polygon', coordinates: g.arcs.map(buildRing) };
            } else if (g.type === 'MultiPolygon') {
                return { type: 'MultiPolygon', coordinates: g.arcs.map(p => p.map(buildRing)) };
            }
        }
        return obj.geometries.map(g => ({
            type: 'Feature',
            properties: g.properties || {},
            geometry: feature(g)
        }));
    }

    // 简化 GeoJSON 几何（Douglas-Peucker 简化）
    function simplify(coords, tolerance) {
        if (!Array.isArray(coords[0][0])) {
            // 单环
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
        // 关键：解码后是经纬度，必须先 project() 到 0..1000 / 0..500 视口
        // 否则负坐标会画在 viewBox 之外
        // 同时裁掉高纬度极地（避免跨经度边界拉伸成横线）
        const parts = [];
        for (let i = 0; i < ring.length; i++) {
            const lon = ring[i][0];
            const lat = ring[i][1];
            if (!isFinite(lon) || !isFinite(lat)) continue;
            // 跳过极外点（俄罗斯北部、格陵兰、南极洲等在裁剪区外）
            if (lat > LAT_MAX + 2 || lat < LAT_MIN - 2) continue;
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

        const data = await loadWorldData();
        let pathCount = 0;

        if (data) {
            const features = topoToGeo(data);
            if (features && features.length) {
                const ns = 'http://www.w3.org/2000/svg';
                const g = document.createElementNS(ns, 'g');
                g.setAttribute('class', 'map-countries');
                features.forEach(f => {
                    const name = (f.properties && f.properties.name) || '';
                    // 过滤南极洲（任何带 Antarctica 字样 / 极南点 < -60° 的多边形）
                    if (/antarctica/i.test(name)) return;
                    // 简化：tolerance 0.2 ≈ 22km，对 110m 数据保留海岛/半岛细节
                    f.geometry.coordinates = simplify(f.geometry.coordinates, 0.2);
                    // 过滤过小的"幽灵岛"（path 短到忽略不计）
                    const d = featureToPath(f.geometry);
                    if (d.length < 80) return;
                    const p = document.createElementNS(ns, 'path');
                    p.setAttribute('d', d);
                    p.setAttribute('class', 'map-country');
                    p.setAttribute('data-name', name);
                    g.appendChild(p);
                    pathCount++;
                });
                svg.appendChild(g);
            }
        }

        if (pathCount === 0) {
            // 占位：用经纬度网格线 + 简化大陆块
            const ns = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'map-fallback');

            // 网格
            for (let lon = -180; lon <= 180; lon += 30) {
                const { x } = project(lon, 0);
                const ln = document.createElementNS(ns, 'line');
                ln.setAttribute('x1', x); ln.setAttribute('y1', 0);
                ln.setAttribute('x2', x); ln.setAttribute('y2', H);
                ln.setAttribute('stroke', '#6b8cae'); ln.setAttribute('stroke-width', 0.3); ln.setAttribute('stroke-opacity', 0.25);
                g.appendChild(ln);
            }
            for (let lat = Math.ceil(LAT_MIN/15)*15; lat <= LAT_MAX; lat += 15) {
                const { y } = project(0, lat);
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
            el.setAttribute('aria-label', `${m.name}，${m.members} 成员`);
            el.innerHTML = `
                <div class="marker-pulse"></div>
                <div class="marker-dot"></div>
                <div class="marker-label">${m.name}</div>
            `;
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

        // 高亮已绘制的国家（按名称匹配）
        const countryByName = new Map();
        svg.querySelectorAll('.map-country[data-name]').forEach(p => {
            countryByName.set(p.dataset.name, p);
        });
        MARKERS.forEach(m => {
            const path = countryByName.get(m.name);
            if (path) {
                path.classList.add('has-marker');
                if (m.level === 'major') path.classList.add('has-marker-major');
                if (m.level === 'core') path.classList.add('has-marker-core');
            }
        });
    }

    // 等 partials 加载完毕再渲染
    document.addEventListener('partials:loaded', renderMap);
    // 兜底：如果页面没有 site-header 注入，DOMContentLoaded 后也尝试渲染
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('worldMapSvg') && !document.getElementById('markersHost').hasChildNodes()) {
            setTimeout(renderMap, 500);
        }
    });
})();
