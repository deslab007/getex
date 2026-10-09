/* Getex — header site search
 *
 * Searches js/search-index.js (built by tools/build-search-index.py) entirely
 * in the browser: no server needed. Rebuild the index after changing content.
 *
 * Markup expected in the nav: <button class="nav-search-btn" ...> — the panel
 * itself is created here so pages only carry the button and two script tags.
 */
(function () {
  'use strict';

  var btn = document.querySelector('.nav-search-btn');
  var INDEX = window.GETEX_SEARCH_INDEX || [];
  if (!btn) return;

  // Site root, derived from this script's own URL (works from any page depth).
  var me = document.currentScript || document.querySelector('script[src*="js/search.js"]');
  var ROOT = me ? me.src.replace(/js\/search\.js.*$/, '') : '/';
  var MAX = 8;

  var panel = document.createElement('div');
  panel.className = 'search-panel';
  panel.id = 'site-search';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Search the site');
  panel.innerHTML =
    '<div class="search-inner">' +
      '<form class="search-form" role="search" action="#">' +
        '<svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<label class="sr-only" for="site-search-input">Search the site</label>' +
        '<input id="site-search-input" type="search" placeholder="Search services, sectors, projects…" autocomplete="off" spellcheck="false" ' +
          'role="combobox" aria-expanded="false" aria-controls="site-search-results" aria-autocomplete="list">' +
        '<button type="button" class="search-close" aria-label="Close search">Esc</button>' +
      '</form>' +
      '<ul class="search-results" id="site-search-results" role="listbox"></ul>' +
      '<p class="search-hint">Try <button type="button" data-q="asbestos">asbestos</button> <button type="button" data-q="silica">silica</button> <button type="button" data-q="VENM">VENM</button> <button type="button" data-q="noise">noise</button></p>' +
    '</div>';
  var nav = btn.closest('nav');
  nav.parentNode.insertBefore(panel, nav.nextSibling);

  var input = panel.querySelector('input');
  var list = panel.querySelector('.search-results');
  var hint = panel.querySelector('.search-hint');
  var active = -1;

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function terms(q) { return norm(q).split(/[^a-z0-9]+/).filter(function (t) { return t.length > 1 || /\d/.test(t); }); }

  function highlight(text, ts) {
    var out = esc(text);
    ts.forEach(function (t) {
      out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return out;
  }

  function snippet(text, ts) {
    var lower = norm(text), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = lower.indexOf(ts[i]);
    if (at < 0) return text.slice(0, 140) + (text.length > 140 ? '…' : '');
    var start = Math.max(0, at - 60), end = Math.min(text.length, at + 100);
    return (start ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  }

  function search(q) {
    var ts = terms(q);
    if (!ts.length) return { ts: ts, hits: [] };
    var hits = [];
    INDEX.forEach(function (e) {
      var h = norm(e.heading), p = norm(e.page), t = norm(e.text), score = 0;
      for (var i = 0; i < ts.length; i++) {
        var w = ts[i], s = 0;
        if (h.indexOf(w) > -1) s += 6;
        if (p.indexOf(w) > -1) s += 3;
        if (t.indexOf(w) > -1) s += 1 + Math.min(3, t.split(w).length - 2);
        if (!s) return;                       // every term must match somewhere
        score += s;
      }
      hits.push({ e: e, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    // one result per destination URL, best first
    var seen = {}, out = [];
    hits.forEach(function (x) {
      var key = x.e.url + '|' + x.e.heading;
      if (!seen[key] && out.length < MAX) { seen[key] = 1; out.push(x.e); }
    });
    return { ts: ts, hits: out };
  }

  function render() {
    var q = input.value.trim();
    var r = search(q);
    active = -1;
    hint.hidden = !!q;
    if (!q) { list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
    if (!r.hits.length) {
      list.innerHTML = '<li class="search-empty">No results for “' + esc(q) + '”. Try another word, or <a href="' + ROOT + 'contact/">contact us</a>.</li>';
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    list.innerHTML = r.hits.map(function (e, i) {
      return '<li role="option" id="ssr-' + i + '"><a href="' + ROOT + (e.url === './' ? '' : e.url) + '">' +
        '<span class="sr-page">' + esc(e.page) + '</span>' +
        '<span class="sr-title">' + highlight(e.heading, r.ts) + '</span>' +
        '<span class="sr-text">' + highlight(snippet(e.text, r.ts), r.ts) + '</span>' +
      '</a></li>';
    }).join('');
    input.setAttribute('aria-expanded', 'true');
  }

  function setActive(i) {
    var items = list.querySelectorAll('li[role="option"]');
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach(function (li, n) { li.classList.toggle('is-active', n === active); });
    input.setAttribute('aria-activedescendant', 'ssr-' + active);
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    // sit directly under the header, wherever it is (sticky on desktop, static on mobile)
    panel.style.top = Math.max(0, nav.getBoundingClientRect().bottom) + 'px';
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('search-open');
    setTimeout(function () { input.focus(); input.select(); }, 0);
  }
  function close(returnFocus) {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('search-open');
    if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () { panel.hidden ? open() : close(true); });
  panel.querySelector('.search-close').addEventListener('click', function () { close(true); });
  input.addEventListener('input', render);
  hint.addEventListener('click', function (ev) {
    var q = ev.target.getAttribute('data-q');
    if (q) { input.value = q; render(); input.focus(); }
  });
  panel.querySelector('form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var items = list.querySelectorAll('li[role="option"] a');
    var target = items[active > -1 ? active : 0];
    if (target) window.location.href = target.href;
  });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive(active + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(active - 1); }
  });
  // Close the panel after following a result to a section on the same page.
  list.addEventListener('click', function (ev) { if (ev.target.closest('a')) close(false); });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !panel.hidden) { close(true); return; }
    // "/" opens search, unless the visitor is typing in a field
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (ev.key === '/' && panel.hidden && !/INPUT|TEXTAREA|SELECT/.test(tag)) { ev.preventDefault(); open(); }
  });
  document.addEventListener('click', function (ev) {
    if (!panel.hidden && !panel.contains(ev.target) && !btn.contains(ev.target)) close(false);
  });
})();
