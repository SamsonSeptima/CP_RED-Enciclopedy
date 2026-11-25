/* ============================================================
   Equipment, netrunning, library, my materials
   ============================================================ */
(function () {
  'use strict';
  const UI = window.CPR_UI;
  if (!UI) return;
  const { esc, attr, fmt, money, icon, dataTable, pageHead, sectionHead, openModal, modalShell, toast, saveState, state, data, $, $$ } = UI;
  const E = data.equipment || {};

  function ptag(n, label) {
    let l = label || '';
    if (n != null) l = money(n);
    else if (l.length > 22) l = l.slice(0, 20) + '…';
    if (n == null) return `<span class="tag">${esc(l || '—')}</span>`;
    const cls = n >= 5000 ? 'tag--red' : n >= 1000 ? 'tag--orange' : n >= 500 ? 'tag--yellow' : 'tag--green';
    return `<span class="tag ${cls}">${esc(l)}</span>`;
  }
  function rowSearch(v) { return attr(String(v || '').toLowerCase()); }

  /* ============================================================
     EQUIPMENT
     ============================================================ */
  const TABS = [
    ['armor', 'Броня', 'shield'],
    ['gear', 'Снаряжение', 'box'],
    ['drugs', 'Наркотики', 'heart'],
    ['vehicles', 'Транспорт', 'map'],
    ['services', 'Услуги', 'clock'],
    ['housing', 'Жильё', 'home'],
    ['clothes', 'Одежда', 'users'],
    ['apps', 'Приложения', 'terminal'],
  ];

  function renderEquipment(r) {
    const tab = r.query.tab || 'armor';
    return `<div class="page">
      ${pageHead('НОВАЯ УЛИЧНАЯ ЭКОНОМИКА', 'Снаряжение', 'Броня, вещи, наркотики, транспорт, услуги и жильё. Всё в eb и готово к игре.', `
        <button class="btn" data-action="print">${icon('print')} Печать</button>
      `)}
      <div class="gen-tabs">${TABS.map(([id, label, ic]) => `<a class="gen-tab ${tab === id ? 'is-active' : ''}" href="#/equipment?tab=${id}" data-route="#/equipment?tab=${id}">${icon(ic)} ${label}</a>`).join('')}</div>
      ${renderEquipTab(tab)}
    </div>`;
  }

  function renderEquipTab(tab) {
    if (tab === 'gear') return equipTable('Снаряжение', 'g-search', E.gear || [], (g) => ({
      search: [g.name, g.desc, g.source].join(' '),
      cells: [`<b>${esc(g.name)}</b>`, `<span class="small">${esc((g.desc || '').slice(0, 170))}${(g.desc || '').length > 170 ? '…' : ''}</span>`, ptag(g.price, g.priceLabel)],
    }), ['Название', 'Описание', 'Цена']);
    if (tab === 'drugs') return equipTable('Наркотики и лекарства', 'd-search', E.drugs || [], (d) => ({
      search: [d.name, d.effect, d.effect2, d.duration, d.desc].join(' '),
      cells: [`<b>${esc(d.name)}</b>`, `<span class="small dim">${esc(d.duration || '')}</span>`, `<span class="small">${esc(d.effect || '')}</span>`, `<span class="small">${esc(d.effect2 || '')}</span>`, ptag(d.price, d.priceLabel)],
    }), ['Название', 'Длительность', 'Основной эффект', 'Вторичный эффект', 'Цена'], 'table-wrap--tall');
    if (tab === 'vehicles') return equipTable('Транспорт', 'v-search', E.vehicles || [], (v) => ({
      search: [v.name, v.desc, v.type, v.rank].join(' '),
      cells: [`<b>${esc(v.name)}</b>`, `<span class="small dim">${esc(v.type || '—')}</span>`, `<span class="mono">${esc(v.hp || '—')}</span>`, `<span class="mono">${esc(v.seats || '—')}</span>`, `<span class="small">${esc(v.speed || '')} ${esc(v.speedNarr || '')}</span>`, ptag(v.price, v.priceLabel)],
    }), ['Транспорт', 'Тип', 'ПЗТ', 'Мест', 'Скорость', 'Цена'], 'table-wrap--tall');
    if (tab === 'services') return equipTable('Услуги и развлечения', 's-search', E.services || [], (s) => ({
      search: [s.name].join(' '),
      cells: [`<b>${esc(s.name)}</b>`, ptag(s.price, s.priceLabel)],
    }), ['Услуга', 'Цена']);
    if (tab === 'housing') return equipTable('Жильё', 'h-search', E.housing || [], (h) => ({
      search: [h.name, h.rent, h.buy].join(' '),
      cells: [`<b>${esc(h.name)}</b>`, `<span class="mono">${esc(h.rent || '—')}</span>`, `<span class="mono">${esc(h.buy || '—')}</span>`],
    }), ['Тип', 'Аренда / мес.', 'Покупка']);
    if (tab === 'clothes') return equipTable('Одежда и стиль', 'cl-search', E.clothes || [], (c) => ({
      search: [c.name, c.pants, c.top, c.jacket, c.shoes, c.jewelry].join(' '),
      cells: [`<b>${esc(c.name)}</b>`, `<span class="small">${esc(c.pants || '—')}</span>`, `<span class="small">${esc(c.top || '—')}</span>`, `<span class="small">${esc(c.jacket || '—')}</span>`, `<span class="small">${esc(c.shoes || '—')}</span>`],
    }), ['Стиль', 'Штаны', 'Верх', 'Куртка', 'Обувь'], 'table-wrap--tall');
    if (tab === 'apps') return equipTable('Приложения агента', 'a-search', E.apps || [], (a) => ({
      search: [a.name, a.desc, a.brand].join(' '),
      cells: [`<b>${esc(a.name)}</b>`, `<span class="small dim">${esc(a.brand || '')}</span>`, `<span class="small">${esc((a.desc || '').slice(0, 160))}${(a.desc || '').length > 160 ? '…' : ''}</span>`, ptag(a.price, a.priceLabel)],
    }), ['Приложение', 'Брэнд', 'Описание', 'Цена'], 'table-wrap--tall');
    // armor
    return equipTable('Броня', 'ar-search', E.armor || [], (a) => ({
      search: [a.name, a.desc, a.subtype, a.parts, a.penalty, a.style].join(' '),
      cells: [`<b>${esc(a.name)}</b>`, `<span class="tag tag--cyan">${esc(a.sp)}</span>`, `<span class="small dim">${esc(a.subtype || '')}</span>`, `<span class="small">${esc(a.parts || '')}</span>`, `<span class="small">${esc(a.penalty || '')}</span>`, ptag(a.price, a.priceLabel)],
    }), ['Броня', 'ОС', 'Тип', 'Части', 'Штрафы', 'Цена']);
  }

  function equipTable(title, searchId, list, mapper, headers, wrapClass) {
    const rows = list.map(x => {
      const m = mapper(x);
      return `<tr data-eq-row data-search="${rowSearch(m.search)}">${m.cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="${searchId}" placeholder="Поиск: ${esc(title.toLowerCase())}…" autocomplete="off"></div>
      <span class="dim small" id="${searchId}-count">${list.length} позиций</span>
    </div>
    <div class="table-wrap ${wrapClass || ''}" id="${searchId}-table">
      <table class="data"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="empty">Нет данных</td></tr>`}</tbody></table>
      <div class="table-foot"><span>Показано: ${list.length}</span><span>${esc(title)}</span></div>
    </div>`;
  }

  UI.pages.equipment = {
    title: 'Снаряжение',
    render(r) { return renderEquipment(r); },
    setup(r) {
      const tab = r.query.tab || 'armor';
      const map = { armor: 'ar-search', gear: 'g-search', drugs: 'd-search', vehicles: 'v-search', services: 's-search', housing: 'h-search', clothes: 'cl-search', apps: 'a-search' };
      const id = map[tab] || 'ar-search';
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', () => {
        const q = UI.fmt.norm(input.value); let n = 0;
        $$('[data-eq-row]').forEach(tr => { const ok = !q || tr.dataset.search.includes(q); tr.style.display = ok ? '' : 'none'; if (ok) n++; });
        const c = document.getElementById(id + '-count'); if (c) c.textContent = n + ' позиций';
        const table = document.getElementById(id + '-table');
        if (table) { const f = table.querySelector('.table-foot span'); if (f) f.textContent = 'Показано: ' + n; }
      });
    },
  };

  /* ============================================================
     NETRUNNING
     ============================================================ */
  UI.pages.net = {
    title: 'Нетраннинг',
    render() {
      return `<div class="page">
        ${pageHead('ДЕЛАЕМ ВСЯКИЕ ШТУКИ В СЕТИ', 'Нетраннинг', 'Быстрые действия, архитектура и ссылки на полные правила. Для тех, кто взламывает мир, а не черепа.', `
          <a class="btn btn--yellow" href="#/generators?tab=net" data-route="#/generators?tab=net">${icon('dice')} Сгенерировать архитектуру</a>
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
        `)}
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Действия в СЕТИ</h3><span class="tiny dim">NET</span></div>
            <div class="panel-body" style="padding:10px">
              ${dataTable(['Действие', 'Что делает'], data.core.netrunning.actions.map(a => [`<b>${esc(a.name)}</b>`, `<span class="small">${esc(a.desc)}</span>`]), { wrapClass: 'quick-table' })}
              <div class="callout small" style="margin-top:10px">${esc(data.core.netrunning.note)}</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Чеклист нетраннера</h3></div>
            <div class="panel-body small">
              <ol style="padding-left:18px;line-height:1.8">
                <li>Подключиться к архитектуре через кибердеку и нейролинк.</li>
                <li>Просканировать этаж: узлы, файлы, лёд.</li>
                <li>Взломать защиту или обойти её.</li>
                <li>Забрать данные / управлять системой.</li>
                <li>Не забыть про обратную связь: Чёрный лёд бьёт по мозгам.</li>
                <li>Выйти до того, как сработает тревога.</li>
              </ol>
              <div class="callout callout--red small" style="margin-top:8px">Провал взлома не всегда означает «ничего не произошло». Система могла заметить вас.</div>
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Программы и железо</h2><span class="dim">ССЫЛКИ В БИБЛИОТЕКУ</span></div>
        <div class="grid grid--3">
          <a class="card card--link" href="#/lib/net__netrun" data-route="#/lib/net__netrun">
            <div class="card__icon">${icon('chip')}</div>
            <div class="card__title">Кибердеки и программы</div>
            <div class="card__sub">Слоты, классы программ, усилители, чёрный лёд.</div>
          </a>
          <a class="card card--link" href="#/lib/net__quick_hacks" data-route="#/lib/net__quick_hacks">
            <div class="card__icon">${icon('terminal')}</div>
            <div class="card__title">Быстрый взлом</div>
            <div class="card__sub">Правила из Edgerunners Mission Kit.</div>
          </a>
          <a class="card card--link" href="#/lib/net__weather" data-route="#/lib/net__weather">
            <div class="card__icon">${icon('map')}</div>
            <div class="card__title">Погода</div>
            <div class="card__sub">Красное время, погодные явления и штрафы.</div>
          </a>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Архитектура</h2><span class="dim">БЫСТРАЯ СБОРКА</span></div>
        <div class="panel">
          <div class="panel-body">
            <p class="small">Генератор архитектуры выдаёт этажи, лёд, данные, контроль, ловушки и награды. Можно бросить всё сразу или по одному пункту, а затем добавить свои варианты.</p>
            <div class="badge-row" style="margin-top:12px">
              <a class="btn btn--yellow" href="#/generators?tab=net" data-route="#/generators?tab=net">${icon('dice')} Открыть генератор</a>
              <a class="btn" href="#/lib/net__netrun" data-route="#/lib/net__netrun">${icon('book')} Полные правила</a>
            </div>
          </div>
        </div>
      </div>`;
    },
  };

  /* ============================================================
     LIBRARY
     ============================================================ */
  const GROUPS = ['Снаряжение', 'Здоровье', 'Город', 'Мастерская', 'Хром', 'Жильё', 'Контакты', 'Сеть', 'Работа', 'Мастеру', 'Прочее'];

  function renderLibrary(r) {
    if (r.param) return renderArticle(r.param);
    return `<div class="page">
      ${pageHead('БАЗА ЗНАНИЙ', 'Библиотека', 'Статьи по снаряжению, здоровью, городу, ролям и правилам. Всё, что не влезло в быстрые таблицы.', `
        <button class="btn" data-action="open-search">${icon('search')} Поиск</button>
      `)}
      <div class="toolbar">
        <div class="input-group">${icon('search')}<input class="input" id="lib-search" placeholder="Поиск по названию и тексту…" autocomplete="off"></div>
        <select class="select" id="lib-group"><option value="">Все разделы</option>${GROUPS.map(g => `<option>${g}</option>`).join('')}</select>
        <span class="dim small" id="lib-count">${data.library.length} статей</span>
      </div>
      <div class="lib-grid" id="lib-grid">
        ${data.library.map(p => {
          const chars = p.blocks.reduce((s, b) => s + (b.text || '').length + (b.html || '').length + (b.items || []).join(' ').length, 0);
          const search = [p.title, p.group, ...p.blocks.map(b => b.text || b.html || (b.items || []).join(' '))].join(' ').toLowerCase();
          return `<a class="lib-card" href="#/lib/${p.slug}" data-route="#/lib/${p.slug}" data-lib-card data-group="${attr(p.group)}" data-search="${attr(search)}">
            <span class="lib-card__group">${esc(p.group)}</span>
            <span class="lib-card__title">${esc(p.title)}</span>
            <span class="lib-card__meta">${Math.round(chars / 1000)} тыс. знаков · ${p.blocks.filter(b => b.t === 'table').length} табл.</span>
          </a>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderArticle(slug) {
    const p = data.library.find(x => x.slug === slug);
    if (!p) return `<div class="page">${pageHead('404 / LIBRARY', 'Статья не найдена', 'Возможно, ссылка устарела.')}<a class="btn" href="#/lib" data-route="#/lib">${icon('left')} В библиотеку</a></div>`;
    const idx = data.library.indexOf(p);
    const prev = data.library[idx - 1];
    const next = data.library[idx + 1];
    const body = p.blocks.map(b => {
      if (b.t === 'h') {
        const lvl = Math.min(4, Math.max(2, b.level || 2));
        return `<h${lvl} id="${b.id || ''}">${esc(b.text)}</h${lvl}>`;
      }
      if (b.t === 'p') return `<p>${b.html || ''}</p>`;
      if (b.t === 'list') return `<${b.ordered ? 'ol' : 'ul'}>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
      if (b.t === 'quote') return `<blockquote>${b.html || ''}</blockquote>`;
      if (b.t === 'table') {
        let html = b.html || '';
        if (!/class=/.test(html.slice(0, 30))) html = html.replace('<table', '<table class="data"');
        return `<div class="table-wrap">${html}</div>`;
      }
      if (b.t === 'hr') return '<hr>';
      return '';
    }).join('');
    const chars = p.blocks.reduce((s, b) => s + (b.text || '').length + (b.html || '').length + (b.items || []).join(' ').length, 0);
    return `<div class="page">
      <div class="article">
        <div class="article__head">
          <div class="eyebrow">${esc(p.group)} / БИБЛИОТЕКА</div>
          <h1>${esc(p.title)}</h1>
          <div class="badge-row" style="margin-top:10px">
            <span class="tag">${Math.max(1, Math.round(chars / 1800))} мин чтения</span>
            <a class="tag tag--cyan" href="${attr(p.source)}" target="_blank" rel="noopener">${icon('external')} источник</a>
          </div>
        </div>
        <div class="article__body">${body}</div>
        <div class="article__foot">
          <a class="btn" href="#/lib" data-route="#/lib">${icon('left')} Все статьи</a>
          <div class="badge-row">
            ${prev ? `<a class="btn btn--sm" href="#/lib/${prev.slug}" data-route="#/lib/${prev.slug}">← ${esc(prev.title)}</a>` : ''}
            ${next ? `<a class="btn btn--sm" href="#/lib/${next.slug}" data-route="#/lib/${next.slug}">${esc(next.title)} →</a>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }

  UI.pages.lib = {
    title: 'Библиотека',
    render(r) { return renderLibrary(r); },
    setup(r) {
      if (r.param) { UI.pushRecent({ title: (data.library.find(x => x.slug === r.param) || {}).title, route: '#/lib/' + r.param }); return; }
      const search = document.getElementById('lib-search');
      const group = document.getElementById('lib-group');
      const apply = () => {
        const q = UI.fmt.norm(search && search.value);
        const g = group && group.value;
        let n = 0;
        $$('[data-lib-card]').forEach(card => {
          const ok = (!q || card.dataset.search.includes(q)) && (!g || card.dataset.group === g);
          card.style.display = ok ? '' : 'none';
          if (ok) n++;
        });
        const c = document.getElementById('lib-count'); if (c) c.textContent = n + ' статей';
      };
      if (search) search.addEventListener('input', apply);
      if (group) group.addEventListener('input', apply);
    },
  };

  /* ============================================================
     MY MATERIALS
     ============================================================ */
  function customEntries() {
    const out = [];
    const gens = state.gen || {};
    Object.keys(gens).forEach(genId => {
      Object.keys(gens[genId]).forEach(catId => {
        const b = gens[genId][catId];
        (b.custom || []).forEach(e => out.push({ genId, catId, entry: e }));
      });
    });
    return out;
  }
  function genTitle(genId) {
    if (data.adventure[genId]) return data.adventure[genId].title;
    if (genId === 'encounters') return 'Встречи в городе';
    if (genId === 'gigs') return 'Халтурки';
    return genId;
  }
  function catTitle(genId, catId) {
    const g = data.adventure[genId];
    if (g) { const c = g.categories.find(x => x.id === catId); if (c) return c.title; }
    return catId;
  }

  UI.pages.my = {
    title: 'Мои материалы',
    render() {
      const custom = customEntries();
      const cart = (state.cart || []).map(id => (data.cyberware || []).find(c => c.id === id)).filter(Boolean);
      const totalHL = cart.reduce((s, c) => s + (c.humanity || 0), 0);
      return `<div class="page">
        ${pageHead('ЛИЧНЫЕ ДАННЫЕ', 'Мои материалы', 'Свои варианты для генераторов, корзина рипердока и экспорт. Всё хранится локально в браузере.', `
          <button class="btn" data-action="export-data">${icon('download')} Экспорт</button>
          <button class="btn" data-action="import-data">${icon('upload')} Импорт</button>
        `)}
        <div class="grid grid--4" style="margin-bottom:20px">
          <div class="stat"><span class="stat__num">${custom.length}</span><span class="stat__label">своих вариантов</span></div>
          <div class="stat"><span class="stat__num">${cart.length}</span><span class="stat__label">имплантов в корзине</span></div>
          <div class="stat"><span class="stat__num">${totalHL}</span><span class="stat__label">ПЧ в корзине</span></div>
          <div class="stat"><span class="stat__num">${(state.recent || []).length}</span><span class="stat__label">недавних</span></div>
        </div>

        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Свои варианты</h3><span class="tiny dim">${custom.length}</span></div>
            <div class="panel-body">
              ${custom.length ? `<div style="display:grid;gap:6px">${custom.map(x => `<div class="cart-item"><div><div class="cart-item__name">${esc(x.entry.text || x.entry.name || '—')}</div><div class="cart-item__meta">${esc(genTitle(x.genId))} · ${esc(catTitle(x.genId, x.catId))}</div></div><button data-action="delete-custom" data-gen="${x.genId}" data-cat="${x.catId}" data-id="${x.entry.id}" aria-label="Удалить">✕</button></div>`).join('')}</div>` : `<div class="dim small">Пока пусто. Добавляйте свои варианты в генераторах — они появятся здесь.</div>`}
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Корзина рипердока</h3><a class="tiny dim" href="#/ripperdoc" data-route="#/ripperdoc">Открыть →</a></div>
            <div class="panel-body">
              ${cart.length ? `<div style="display:grid;gap:6px">${cart.map(c => `<div class="cart-item"><div><div class="cart-item__name">${esc(c.name)}</div><div class="cart-item__meta">${esc(c.category)} · ПЧ ${c.humanity}</div></div></div>`).join('')}</div>` : `<div class="dim small">Корзина пуста.</div>`}
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Данные</h2><span class="dim">ЭКСПОРТ / ИМПОРТ</span></div>
        <div class="panel">
          <div class="panel-body">
            <p class="small">Экспорт сохраняет свои варианты, корзину, настройки и историю. Импорт заменяет текущие данные — сохраните резервную копию, если сомневаетесь.</p>
            <div class="gen-actions">
              <button class="btn" data-action="export-data">${icon('download')} Скачать JSON</button>
              <label class="btn" style="cursor:pointer">${icon('upload')} Загрузить JSON<input type="file" id="import-file" accept="application/json" hidden></label>
              <button class="btn btn--red" data-action="reset-data">${icon('trash')} Сбросить всё</button>
            </div>
            <div id="import-status" class="small dim" style="margin-top:8px"></div>
          </div>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Недавнее</h2></div>
        <div class="grid grid--3">
          ${(state.recent || []).length ? (state.recent || []).map(x => `<a class="lib-card" href="${attr(x.route)}" data-route="${attr(x.route)}"><span class="lib-card__group">НЕДАВНО</span><span class="lib-card__title">${esc(x.title || x.route)}</span><span class="lib-card__meta">${esc(x.route)}</span></a>`).join('') : `<div class="dim small">Пока ничего не открывали.</div>`}
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Источники</h2></div>
        <div class="panel"><div class="panel-body small dim">
          <p>Правила и часть текстов: <b>Cyberpunk RED</b> © R. Talsorian Games. Русскоязычные материалы: <a href="https://alec-leon.github.io/data-pool/" target="_blank" rel="noopener">Data Pool</a>.</p>
          <p>Это неофициальный фан-материал для личного использования. Не для продажи.</p>
        </div></div>
      </div>`;
    },
    setup() {
      const file = document.getElementById('import-file');
      if (file) file.addEventListener('change', () => {
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            const next = parsed.state || parsed;
            if (!next || typeof next !== 'object') throw new Error('Неверный формат');
            UI.state = Object.assign(UI.state, next);
            saveState();
            toast('Данные загружены');
            UI.render();
          } catch (e) {
            const st = document.getElementById('import-status');
            if (st) st.innerHTML = `<span class="red">Ошибка импорта: ${esc(e.message)}</span>`;
          }
        };
        reader.readAsText(f);
      });
    },
  };

  function downloadFile(name, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  UI.actions['export-data'] = () => {
    downloadFile('data-pool-red-export-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ app: 'DATA POOL // RED', version: state.version, exportedAt: new Date().toISOString(), state: UI.state }, null, 2));
    toast('Экспорт скачан');
  };
  UI.actions['import-data'] = () => {
    const f = document.getElementById('import-file');
    if (f) f.click();
    else {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'application/json';
      input.onchange = () => { /* handled by page setup */ };
      input.click();
    }
  };
  UI.actions['reset-data'] = () => {
    if (!confirm('Сбросить все свои варианты, корзину и настройки? Это действие нельзя отменить.')) return;
    try { localStorage.removeItem('cpr-datapool-v1'); } catch (e) {}
    location.reload();
  };
  UI.actions['delete-custom'] = (el) => {
    const { gen, cat, id } = el.dataset;
    const b = state.gen[gen] && state.gen[gen][cat];
    if (!b) return;
    b.custom = (b.custom || []).filter(x => x.id !== id);
    saveState();
    UI.render();
    toast('Удалено');
  };

  UI.pages.notfound = UI.pages.notfound || { render: () => '' };
})();
