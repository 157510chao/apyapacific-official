/**
 * 站内搜索引擎 — 客户端实时搜索
 * 基于 search-index.js 中的 SITE_SEARCH_INDEX 进行模糊匹配
 */
(function () {
  'use strict';

  const MAX_RESULTS = 20;

  function scoreItem(item, queryLower, tokens) {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.desc.toLowerCase();
    const keywordsLower = (item.keywords || '').toLowerCase();

    // 标题精确匹配加权
    if (titleLower === queryLower) score += 100;
    else if (titleLower.includes(queryLower)) score += 50;
    else {
      for (const t of tokens) {
        if (titleLower.includes(t)) score += 20;
      }
    }

    // 描述匹配
    for (const t of tokens) {
      if (descLower.includes(t)) score += 8;
    }

    // 关键词匹配
    for (const t of tokens) {
      if (keywordsLower.includes(t)) score += 12;
    }

    return score;
  }

  function search(query) {
    if (!query || query.trim().length < 1) return [];
    const queryLower = query.trim().toLowerCase();
    const tokens = queryLower.split(/\s+/).filter(t => t.length > 0);

    const results = SITE_SEARCH_INDEX
      .map(item => ({ item, score: scoreItem(item, queryLower, tokens) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    return results;
  }

  function renderResults(results, query, container) {
    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-empty">
          <i class="fas fa-search"></i>
          <p>未找到与"<strong>${escapeHtml(query)}</strong>"相关的结果</p>
          <p class="search-empty-hint">试试其他关键词，如"共同体"、"健康"、"虫草素"</p>
        </div>`;
      return;
    }

    let html = `<p class="search-count">找到 <strong>${results.length}</strong> 条结果</p><ul class="search-result-list">`;
    for (const r of results) {
      const item = r.item;
      html += `
        <li class="search-result-item">
          <a href="${item.url}" class="search-result-link">
            <h3>${highlightMatch(item.title, query)}</h3>
          </a>
          <p class="search-result-desc">${highlightMatch(truncate(item.desc, 150), query)}</p>
        </li>`;
    }
    html += '</ul>';
    container.innerHTML = html;
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const tokens = query.trim().split(/\s+/).filter(t => t.length > 0);
    let result = escapeHtml(text);
    for (const t of tokens) {
      const escaped = escapeRegex(t);
      result = result.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
    }
    return result;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function truncate(text, maxLen) {
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }

  // 暴露到全局
  window.SiteSearch = {
    search,
    renderResults,
    highlightMatch,
    escapeHtml
  };

  // 自动绑定搜索页面
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const resultContainer = document.getElementById('search-results');

    if (form && input && resultContainer) {
      // URL 参数回填
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
        const results = search(q);
        renderResults(results, q, resultContainer);
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const query = input.value.trim();
        const results = search(query);
        renderResults(results, query, resultContainer);

        // 更新 URL（不刷新页面）
        if (window.history && window.history.replaceState) {
          const url = new URL(window.location);
          url.searchParams.set('q', query);
          window.history.replaceState({}, '', url);
        }
      });
    }

    // 全局导航搜索绑定
    const navForm = document.getElementById('nav-search-form');
    const navInput = document.getElementById('nav-search-input');
    if (navForm && navInput) {
      navForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const query = navInput.value.trim();
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      });
    }
  });
})();
