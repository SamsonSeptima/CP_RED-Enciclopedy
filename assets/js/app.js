/* ============================================================
   DATA POOL // RED — core UI, router, shared components
   ============================================================ */
(function () {
  'use strict';

  const CPR = window.CPR || {};
  const D = {
    core: CPR.core,
    roles: CPR.roles || [],
    skills: CPR.skills || [],
    mooks: CPR.mooks || [],
    adventure: CPR.adventure || {},
    arsenal: CPR.arsenal || { weapons: [], mods: [], ammo: [], magazines: [], barrels: [] },
    cyberware: CPR.cyberware || [],
    equipment: CPR.equipment || {},
    generators: CPR.generators || { encounters: [], gigs: [], extras: [] },
    library: CPR.library || [],
    lore: CPR.lore || { districts: [], gangs: [], corps: [], services: [], people: [], relations: [], events: [], rumors: [], hooks: [], zones: [] },
    map: CPR.map || { districts: [], subdistricts: [], gangs: [], corps: [], services: [], places: [] },
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const attr = (v) => esc(v).replace(/\n/g, ' ');
  const fmt = (n) => (n == null || isNaN(n)) ? '—' : new Intl.NumberFormat('ru-RU').format(n);
  const money = (n) => (n == null || isNaN(n)) ? '—' : fmt(n) + ' eb';
  const pct = (n) => Math.max(0, Math.min(100, n)) + '%';
  const uid = () => (crypto && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    screen: '<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M8 21h8M12 18v3"/><path d="M7 8h4M7 12h2M14 8h3M14 12h3"/>',
    combat: '<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.5"/>',
    gun: '<path d="M3 9h13l3 3h2v4h-5l-2-2H9v4H5v-4H3z"/><path d="M9 9V6h6v3"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    net: '<circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/><path d="M16 4.5a3 3 0 0 1 0 7M17 15a6 6 0 0 1 4 6"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
    book: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-3a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h4z"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h6l2 2h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M4 3h16"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/>',
    spark: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    heart: '<path d="M20 8.5a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 6 8 11 8 11s8-5 8-11Z"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    note: '<path d="M5 3h14v18l-7-4-7 4z"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    external: '<path d="M14 3h7v7M21 3l-9 9"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>',
  };
  const icon = (name, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;

  /* ---------------- state ---------------- */
  const LS_KEY = 'cpr-datapool-v1';
  const DEFAULT_STATE = {
    version: 1,
    cart: [],
    clinic: 'clinic',
    humanity: 40,
    gen: {},
    last: {},
    recent: [],
    favorites: [],
    density: 'compact',
    diceLog: [],
  };
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return clone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return Object.assign(clone(DEFAULT_STATE), parsed || {});
    } catch (e) {
      return clone(DEFAULT_STATE);
    }
  }
  let saveTimer = null;
  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(UI.state)); } catch (e) { /* memory only */ }
    }, 120);
  }
  function genBucket(genId, catId) {
    const s = UI.state;
    s.gen[genId] = s.gen[genId] || {};
    s.gen[genId][catId] = s.gen[genId][catId] || { custom: [], disabled: [] };
    const b = s.gen[genId][catId];
    b.custom = b.custom || [];
    b.disabled = b.disabled || [];
    return b;
  }
  function pushRecent(item) {
    if (!item || !item.route) return;
    const s = UI.state;
    s.recent = [item].concat((s.recent || []).filter(x => x.route !== item.route)).slice(0, 12);
    saveState();
  }

  /* ---------------- UI object ---------------- */
  const UI = {
    state: loadState(),
    pages: {},
    actions: {},
    detail: {},
    data: D,
    esc, attr, fmt, money, uid, icon, $, $$, saveState, genBucket, pushRecent, clone,
  };
  window.CPR_UI = UI;

  /* ---------------- formatting helpers ---------------- */
  function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е'); }
  function priceClass(price) {
    if (price == null) return '';
    if (price >= 5000) return 'tag--red';
    if (price >= 1000) return 'tag--orange';
    if (price >= 500) return 'tag--yellow';
    return 'tag--green';
  }
  function priceTag(n, label) {
    if (n == null) return `<span class="tag">${esc(label || '—')}</span>`;
    return `<span class="tag ${priceClass(n)}">${esc(label || money(n))}</span>`;
  }
  function dvBadge(v) {
    if (v == null || v === '—' || v === 'Нет') return `<span class="dv-badge dv-badge--none">—</span>`;
    const n = parseInt(v, 10);
    let cls = 'dv-badge--mid';
    if (n <= 13) cls = 'dv-badge--low';
    else if (n >= 25) cls = 'dv-badge--dead';
    else if (n >= 20) cls = 'dv-badge--high';
    return `<span class="dv-badge ${cls}">${esc(v)}</span>`;
  }
  function damageFmt(s) {
    if (!s) return '—';
    let v = String(s).trim();
    v = v.replace(/(\d+d\d+)(\d+d\d+)/g, '$1 / $2');
    v = v.replace(/(\d+d\d+)\s+(\d+d\d+)/g, '$1 / $2');
    v = v.replace(/(\d+d\d+)(Н\/а)/g, '$1 / $2');
    return v;
  }
  function concealFmt(v) {
    const s = String(v || '').toLowerCase();
    if (s.includes('да') && !s.includes('нет')) return '<span class="tag tag--green">Да</span>';
    if (s.includes('нет')) return '<span class="tag tag--red">Нет</span>';
    return `<span class="tag" style="display:inline-block;white-space:normal;line-height:1.2;max-width:100%">${esc(v || '—')}</span>`;
  }
  function catClass(cat) {
    const c = norm(cat);
    if (c.includes('пистолет') || c.includes('пп')) return 'tag--cyan';
    if (c.includes('тактичес')) return 'tag--orange';
    if (c.includes('тяжел') || c.includes('крупн')) return 'tag--red';
    if (c.includes('лук') || c.includes('арбалет')) return 'tag--green';
    if (c.includes('ближн')) return 'tag--violet';
    if (c.includes('экзот')) return 'tag--yellow';
    return '';
  }
  const slotWord = (n) => n === 1 ? '1 слот' : (n >= 2 && n <= 4) ? n + ' слота' : n + ' слотов';
  UI.slotWord = slotWord;
  UI.fmt = fmt;
  Object.assign(UI.fmt, { norm, priceTag, dvBadge, damageFmt, concealFmt, catClass });

  /* ---------------- shared render helpers ---------------- */
  function pageHead(eyebrow, title, lead, actions) {
    return `
      <div class="page-head">
        <div>
          <div class="eyebrow">${esc(eyebrow)}</div>
          <h1>${title}</h1>
          ${lead ? `<p class="lead">${lead}</p>` : ''}
        </div>
        ${actions ? `<div class="page-head__actions">${actions}</div>` : ''}
      </div>`;
  }
  function sectionHead(title, right) {
    return `<div class="section-head"><h2>${esc(title)}</h2>${right ? `<span class="dim">${right}</span>` : ''}</div>`;
  }
  function dataTable(headers, rows, opts) {
    opts = opts || {};
    const head = headers.map(h => {
      if (typeof h === 'string') return `<th>${esc(h)}</th>`;
      return `<th class="${h.cls || ''}">${h.label || ''}</th>`;
    }).join('');
    const body = rows.map(r => {
      if (typeof r === 'string') return r;
      if (Array.isArray(r)) {
        return `<tr>${r.map((c, i) => {
          if (c && typeof c === 'object') return `<td class="${c.cls || ''}" ${c.attrs || ''}>${c.html != null ? c.html : esc(c)}</td>`;
          return `<td>${c == null ? '' : c}</td>`;
        }).join('')}</tr>`;
      }
      return `<tr ${r.attrs || ''}>${(r.cells || []).map(c => {
        if (c && typeof c === 'object') return `<td class="${c.cls || ''}" ${c.attrs || ''}>${c.html != null ? c.html : esc(c)}</td>`;
        return `<td>${c == null ? '' : c}</td>`;
      }).join('')}</tr>`;
    }).join('');
    return `<div class="table-wrap ${opts.wrapClass || ''}">
      <table class="data" ${opts.tableAttrs || ''}>
        <thead><tr>${head}</tr></thead>
        <tbody>${body || `<tr><td colspan="${headers.length}" class="empty">Нет данных</td></tr>`}</tbody>
      </table>
      ${opts.foot ? `<div class="table-foot">${opts.foot}</div>` : ''}
    </div>`;
  }
  function emptyState(title, text, action) {
    return `<div class="empty"><b>${esc(title)}</b><div class="small" style="margin-top:6px">${text || ''}</div>${action ? `<div style="margin-top:12px">${action}</div>` : ''}</div>`;
  }
  function modalShell(opts) {
    return `<div class="modal ${opts.wide ? 'modal--wide' : ''} ${opts.narrow ? 'modal--narrow' : ''}" role="dialog" aria-modal="true" aria-label="${attr(opts.title || 'Окно')}">
      <div class="modal__head">
        <div>
          <div class="modal__title">${opts.title || ''}</div>
          ${opts.sub ? `<div class="modal__sub">${opts.sub}</div>` : ''}
        </div>
        <button class="icon-btn" data-action="close-modal" aria-label="Закрыть">${icon('close')}</button>
      </div>
      <div class="modal__body">${opts.body || ''}</div>
      ${opts.foot ? `<div class="modal__foot">${opts.foot}</div>` : ''}
    </div>`;
  }
  function openModal(html, opts) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>${html}`;
    root.classList.add('is-open');
    document.body.classList.add('is-locked');
    const focus = root.querySelector('[autofocus]') || root.querySelector('button, input, select, textarea');
    if (focus) setTimeout(() => focus.focus(), 30);
  }
  function closeModal() {
    const root = $('#modal-root');
    root.classList.remove('is-open');
    root.innerHTML = '';
    document.body.classList.remove('is-locked');
  }
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }
  UI.pageHead = pageHead;
  UI.sectionHead = sectionHead;
  UI.dataTable = dataTable;
  UI.emptyState = emptyState;
  UI.modalShell = modalShell;
  UI.openModal = openModal;
  UI.closeModal = closeModal;
  UI.toast = toast;

  /* ---------------- dice ---------------- */
  function roll(n) { return Math.floor(Math.random() * n) + 1; }
  function rollDice(expr) {
    const m = String(expr || '').replace(/\s+/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!m) return null;
    const count = m[1] ? parseInt(m[1], 10) : 1;
    const sides = parseInt(m[2], 10);
    const mod = m[3] ? parseInt(m[3], 10) : 0;
    if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null;
    const rolls = [];
    for (let i = 0; i < count; i++) rolls.push(roll(sides));
    return { rolls, total: rolls.reduce((a, b) => a + b, 0) + mod, mod, expr };
  }
  UI.roll = roll;
  UI.rollDice = rollDice;

  function openDice() {
    const log = UI.state.diceLog || [];
    openModal(modalShell({
      title: 'Броски',
      sub: 'Быстрые кубики и проверки',
      narrow: true,
      body: `
        <div class="dice-grid">
          ${[['d6', 6], ['d10', 10], ['d100', 100], ['2d6', '2d6'], ['1d10+', '1d10+'], ['2d10', '2d10']].map(([label, expr]) => `
            <button class="dice-btn" data-action="dice-roll" data-expr="${expr}">
              <b>${label}</b><span>бросить</span>
            </button>`).join('')}
        </div>
        <div class="dice-log" id="dice-log">
          ${log.length ? log.map(x => `<div class="dice-log__row"><span>${esc(x.label)}</span><b>${esc(x.result)}</b></div>`).join('') : `<div class="dim small">История бросков пуста.</div>`}
        </div>
        <div class="rule"></div>
        <h4 style="margin-bottom:10px">Проверка</h4>
        <form class="check-form" data-form="check">
          <div class="field"><label>СТАТ</label><input class="input" name="stat" type="number" min="1" max="20" value="6"></div>
          <div class="field"><label>Навык</label><input class="input" name="skill" type="number" min="0" max="20" value="4"></div>
          <div class="field"><label>Модификатор</label><input class="input" name="mod" type="number" value="0"></div>
          <div class="field"><label>СЛ</label><input class="input" name="dv" type="number" min="1" max="60" value="15"></div>
          <div class="field"><label>Сложность</label>
            <select class="select" name="quickdv">
              <option value="">— вручную —</option>
              ${(D.core.dv || []).map(d => `<option value="${d.dv}">${esc(d.name)} · ${d.dv}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn--yellow" type="submit" style="align-self:end">Бросок</button>
        </form>
        <div id="check-result"></div>`,
    }));
    $$('[data-expr]', $('#modal-root')).forEach(btn => {
      btn.addEventListener('click', () => {
        const expr = btn.dataset.expr;
        let res;
        if (expr === '1d10+') res = rollDice('1d10');
        else res = rollDice(expr);
        if (!res) return;
        const label = expr === '1d10+' ? '1d10 + ещё' : expr;
        UI.state.diceLog = [{ label, result: res.total + (res.rolls.length > 1 ? ` (${res.rolls.join('+')})` : '') }].concat(UI.state.diceLog || []).slice(0, 12);
        saveState();
        const logEl = $('#dice-log');
        if (logEl) logEl.innerHTML = UI.state.diceLog.map(x => `<div class="dice-log__row"><span>${esc(x.label)}</span><b>${esc(x.result)}</b></div>`).join('');
      });
    });
    const form = $('[data-form="check"]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        let stat = parseInt(fd.get('stat'), 10) || 0;
        const skill = parseInt(fd.get('skill'), 10) || 0;
        const mod = parseInt(fd.get('mod'), 10) || 0;
        const quick = fd.get('quickdv');
        const dv = parseInt(quick || fd.get('dv'), 10) || 0;
        const r = roll(10);
        let total = stat + skill + mod + r;
        let extra = 0;
        let text = '';
        if (r === 10) {
          extra = roll(10);
          total += extra;
          text = `<div class="green">Критический успех! +1d10 = ${extra}</div>`;
        } else if (r === 1) {
          extra = roll(10);
          total -= extra;
          text = `<div class="red">Критический провал! −1d10 = ${extra}</div>`;
        }
        const success = total >= dv;
        $('#check-result').innerHTML = `<div class="check-result">
          <div class="dim small">${stat} + ${skill} + ${mod} + d10(${r}) =</div>
          <b style="color:${success ? 'var(--green)' : 'var(--red)'}">${total}</b>
          <span class="dim"> против СЛ ${dv} — ${success ? '<b class="green">успех</b>' : '<b class="red">провал</b>'}</span>
          ${text}
        </div>`;
      });
    }
  }
  UI.openDice = openDice;

  /* ---------------- navigation ---------------- */
  const NAV = [
    { group: 'ИГРА', items: [
      { id: 'home', title: 'Главная', sub: 'Сводка и быстрый старт', icon: 'home' },
      { id: 'screen', title: 'Быстрый стол', sub: 'Всё, что нужно под рукой', icon: 'screen' },
      { id: 'combat', title: 'Бой', sub: 'Действия, ранения, криты', icon: 'combat' },
      { id: 'rules', title: 'Правила', sub: 'Проверки, удача, downtime', icon: 'book' },
    ]},
    { group: 'СНАРЯЖЕНИЕ', items: [
      { id: 'weapons', title: 'Оружие', sub: 'Арсенал и модификации', icon: 'gun', badge: () => D.arsenal.weapons.length },
      { id: 'ripperdoc', title: 'Рипердок', sub: 'Импланты и требования', icon: 'chip', badge: () => D.cyberware.length },
      { id: 'equipment', title: 'Снаряжение', sub: 'Броня, вещи, транспорт', icon: 'box' },
    ]},
    { group: 'МИР', items: [
      { id: 'city', title: 'Город', sub: 'Районы, банды, корпорации', icon: 'map' },
      { id: 'net', title: 'Нетраннинг', sub: 'СЕТЬ, лёд, архитектура', icon: 'net' },
      { id: 'roles', title: 'Роли и навыки', sub: '10 ролей, способности', icon: 'users' },
      { id: 'mooks', title: 'Шестёрки', sub: 'NPC на скорую руку', icon: 'users' },
    ]},
    { group: 'ИНСТРУМЕНТЫ', items: [
      { id: 'generators', title: 'Генераторы', sub: 'Работы, встречи, халтурки', icon: 'dice' },
      { id: 'lib', title: 'Библиотека', sub: 'Статьи и правила', icon: 'book' },
      { id: 'my', title: 'Мои материалы', sub: 'Свои варианты и экспорт', icon: 'folder' },
    ]},
  ];
  function renderNav() {
    const active = parseHash().route;
    $('#nav').innerHTML = NAV.map(group => `
      <div class="nav__label">${group.group}</div>
      ${group.items.map(item => {
        const badge = item.badge ? item.badge() : null;
        return `<a class="nav__item ${active === item.id ? 'is-active' : ''}" href="#/${item.id}" data-route="#/${item.id}">
          ${icon(item.icon)}
          <span><b>${esc(item.title)}</b><small>${esc(item.sub)}</small></span>
          ${badge != null ? `<span class="nav__badge">${badge}</span>` : ''}
        </a>`;
      }).join('')}
    `).join('');
  }

  function parseHash() {
    let raw = (location.hash || '').replace(/^#\/?/, '');
    if (!raw) raw = 'home';
    const qIndex = raw.indexOf('?');
    const path = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    const qs = qIndex >= 0 ? raw.slice(qIndex + 1) : '';
    const parts = path.split('/').filter(Boolean);
    const route = parts[0] || 'home';
    const param = parts[1] || null;
    let query = {};
    try { query = Object.fromEntries(new URLSearchParams(qs)); } catch (e) { query = {}; }
    return { route, param, query, raw };
  }
  function navigate(hash) {
    if (!hash) return;
    if (location.hash === hash) { render(); return; }
    location.hash = hash;
  }
  UI.navigate = navigate;
  UI.parseHash = parseHash;

  function closeSidebar() {
    $('#sidebar').classList.remove('is-open');
    const btn = $('.menu-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function toggleSidebar() {
    const sb = $('#sidebar');
    const open = sb.classList.toggle('is-open');
    const btn = $('.menu-btn');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  /* ---------------- router ---------------- */
  let currentRoute = null;
  function render() {
    const r = parseHash();
    currentRoute = r;
    renderNav();
    closeSidebar();
    const page = UI.pages[r.route] || UI.pages.notfound;
    const main = $('#main');
    try {
      main.innerHTML = page.render(r);
    } catch (e) {
      console.error(e);
      main.innerHTML = `<div class="page">${pageHead('ОШИБКА', 'Что-то сломалось', esc(e.message))}</div>`;
    }
    document.title = (page.title ? page.title + ' · ' : '') + 'DATA POOL // RED';
    if (page.setup) {
      try { page.setup(r); } catch (e) { console.error(e); }
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  UI.render = render;
  window.addEventListener('hashchange', render);

  /* ---------------- global events ---------------- */
  document.addEventListener('click', (e) => {
    const routeEl = e.target.closest('[data-route]');
    if (routeEl) {
      e.preventDefault();
      if (routeEl.closest('.search-modal')) closeModal();
      navigate(routeEl.dataset.route);
      return;
    }
    const actEl = e.target.closest('[data-action]');
    if (actEl) {
      const action = actEl.dataset.action;
      if (action === 'close-modal') { closeModal(); return; }
      if (UI.actions[action]) {
        e.preventDefault();
        UI.actions[action](actEl, e);
        return;
      }
      if (action === 'toggle-sidebar') { toggleSidebar(); return; }
      if (action === 'open-search') { openSearch(); return; }
      if (action === 'open-dice') { openDice(); return; }
      if (action === 'print') { window.print(); return; }
      if (action === 'quick-job') { quickJob(); return; }
      if (action === 'open-about') { openAbout(); return; }
    }
    if (e.target.matches('.modal-backdrop')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-action]')) {
      e.preventDefault();
      e.target.click();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      if ($('#modal-root').classList.contains('is-open')) closeModal();
      closeSidebar();
    } else if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ---------------- about ---------------- */
  function openAbout() {
    openModal(modalShell({
      title: 'О сборке',
      sub: 'DATA POOL // RED · v1.4.2',
      body: `
        <div class="article__body">
          <p><b>DATA POOL // RED</b> — неофициальная русскоязычная энциклопедия и набор генераторов для <b>Cyberpunk RED</b>. Собрана для быстрой работы на игре: таблицы, фильтры, конструктор оружия и рипердок-калькулятор.</p>
          <p>Контент основан на книгах <i>Cyberpunk RED</i> (R. Talsorian Games) и материалах русскоязычного сообщества <a href="https://alec-leon.github.io/data-pool/" target="_blank" rel="noopener">Data Pool</a>. Все права на исходные тексты и правила принадлежат правообладателям. Это фан-материал, не для продажи.</p>
          <h3>Что внутри</h3>
          <ul>
            <li>Быстрый стол: СЛ, дальность, автоогонь, критические травмы, спасброски.</li>
            <li>Арсенал: оружие, модификации, боеприпасы, конструктор.</li>
            <li>Рипердок: импланты, требования, стоимость, ПЧ, хирургия.</li>
            <li>Генераторы: работы, расследования, встречи, халтурки, сеть, добыча, шестёрки.</li>
            <li>Библиотека: статьи по снаряжению, здоровью, городу, ролям и правилам.</li>
          </ul>
          <h3>Данные</h3>
          <p>Свои варианты, корзина и настройки хранятся локально в браузере. Экспорт/импорт — в разделе <a href="#/my">«Мои материалы»</a>.</p>
          <p class="dim small">Сборка: офлайн, без внешних зависимостей. Шрифты: Russo One, Inter, JetBrains Mono.</p>
        </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button>`,
    }));
  }
  UI.openAbout = openAbout;

  /* ---------------- quick job ---------------- */
  function quickJob() {
    const result = generateJob();
    UI.state.last.job = result;
    saveState();
    openModal(modalShell({
      title: 'Работа на сегодня',
      sub: 'Сгенерировано из таблиц «Работа»',
      wide: true,
      body: renderJobSummary(result, false),
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><a class="btn btn--yellow" href="#/generators?tab=job" data-route="#/generators?tab=job">Открыть генератор</a>`,
    }));
  }
  UI.quickJob = quickJob;

  /* ---------------- home ---------------- */
  function getEntries(genId, cat) {
    const bucket = genBucket(genId, cat.id);
    const custom = (bucket.custom || []).map(x => Object.assign({ custom: true }, x));
    const all = (cat.entries || []).map((x, i) => Object.assign({ _i: i }, x)).concat(custom);
    const enabled = all.filter((e, i) => !bucket.disabled.includes(e.id || ('base-' + (e._i != null ? e._i : i))));
    return enabled.length ? enabled : all;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function genEntryId(cat, e, i) {
    return e.id || (e.custom ? 'c-' + e.id : 'b-' + cat.id + '-' + i);
  }
  function baseEntryId(cat, i) { return 'b-' + cat.id + '-' + i; }
  function entryDisabled(genId, cat, e, i) {
    const b = genBucket(genId, cat.id);
    return b.disabled.includes(e.id || baseEntryId(cat, i));
  }
  UI.getEntries = getEntries;
  UI.baseEntryId = baseEntryId;
  UI.entryDisabled = entryDisabled;

  function generateJob() {
    const out = {};
    (D.adventure.job ? D.adventure.job.categories : []).forEach(cat => {
      const list = getEntries('job', cat);
      if (list.length) out[cat.id] = pick(list);
    });
    return out;
  }
  UI.generateJob = generateJob;

  function renderJobSummary(result, compact) {
    const cats = D.adventure.job ? D.adventure.job.categories : [];
    return `<div class="gen-output__grid">
      ${cats.map(cat => {
        const e = result[cat.id];
        if (!e) return '';
        const wide = ['hook', 'twist', 'complication'].includes(cat.id) ? 'gen-output__block--wide' : '';
        return `<div class="gen-output__block ${wide}">
          <dt>${esc(cat.title)}</dt>
          <dd>${esc(e.text)}${e.pay != null ? `<br><span class="yellow mono">${money(e.pay)}</span>` : ''}</dd>
        </div>`;
      }).join('')}
    </div>`;
  }
  UI.renderJobSummary = renderJobSummary;

  UI.pages.home = {
    title: 'Главная',
    render() {
      if (!UI.state.last.job) {
        UI.state.last.job = generateJob();
        saveState();
      }
      const counts = {
        weapons: D.arsenal.weapons.length,
        cyber: D.cyberware.length,
        lib: D.library.length,
        mooks: D.mooks.length,
      };
      const rumors = [
        'Корпорация «Арасака» отрицает, что её новый имплант вызывает сны о Тихо.',
        'В Боевой зоне замечен киберпсихопат в костюме Санты. Дети в восторге, родители — нет.',
        'Trauma Team повышает тарифы. Уличные клиники снова в моде.',
        'НКПД объявила рейд на Ночной рынок. Все уже знали.',
        '«Красный хром» снова в топе. Врачи советуют не экономить на психиатре.',
        'Говорят, в старом метро видели поезд без машиниста. Он не останавливается.',
        'Новый брейнданс «Ты — Найт-Сити» стал хитом. Пользователи жалуются на головную боль.',
        'Скэвверы обчистили клинику в Сан-Доминго. Вынесли всё, кроме очереди.',
      ];
      const rumor = pick(rumors);
      const mooks = D.mooks.slice(0, 4);
      return `<div class="page">
        <section class="hero">
          <div class="eyebrow">Найт-Сити · Красное время · 2045</div>
          <h1>Город не ждёт.<br><span class="glitch">Играй быстро.</span></h1>
          <p class="lead">Русская энциклопедия <b>Cyberpunk RED</b>: быстрые таблицы, арсенал с модификациями, рипердок с требованиями и генераторы, которые работают за секунды.</p>
          <div class="hero__actions">
            <button class="btn btn--yellow btn--lg" data-action="quick-job">${icon('spark')} Сгенерировать работу</button>
            <a class="btn btn--lg" href="#/screen" data-route="#/screen">${icon('screen')} Быстрый стол</a>
            <a class="btn btn--ghost btn--lg" href="#/ripperdoc" data-route="#/ripperdoc">${icon('chip')} Рипердок</a>
          </div>
          <div class="hero__meta">
            <span><b>${counts.weapons}</b> стволов</span>
            <span><b>${counts.cyber}</b> имплантов</span>
            <span><b>${counts.lib}</b> статей</span>
            <span><b>${counts.mooks}</b> NPC</span>
          </div>
        </section>

        <div class="ticker">
          <span class="ticker__label">СЛУХ</span>
          <span class="ticker__text">${esc(rumor)}</span>
        </div>

        <div class="section-head"><h2>Быстрый доступ</h2><span class="dim">01 / 06</span></div>
        <div class="quick-grid">
          <a class="quick-card" href="#/screen" data-route="#/screen">
            ${icon('screen', 'quick-card__icon')}
            <span class="quick-card__title">Быстрый стол</span>
            <span class="quick-card__desc">СЛ, дальность, криты, спасброски, действия — на одном экране.</span>
            <span class="quick-card__num">01</span>
          </a>
          <a class="quick-card" href="#/weapons" data-route="#/weapons">
            ${icon('gun', 'quick-card__icon')}
            <span class="quick-card__title">Арсенал</span>
            <span class="quick-card__desc">Оружие, модификации и конструктор ствола под себя.</span>
            <span class="quick-card__num">02</span>
          </a>
          <a class="quick-card" href="#/ripperdoc" data-route="#/ripperdoc">
            ${icon('chip', 'quick-card__icon')}
            <span class="quick-card__title">Рипердок</span>
            <span class="quick-card__desc">Импланты, ПЧ, хирургия, требования и корзина установки.</span>
            <span class="quick-card__num">03</span>
          </a>
          <a class="quick-card" href="#/generators?tab=job" data-route="#/generators?tab=job">
            ${icon('dice', 'quick-card__icon')}
            <span class="quick-card__title">Генераторы</span>
            <span class="quick-card__desc">Работы, расследования, встречи, халтурки, сети, добыча.</span>
            <span class="quick-card__num">04</span>
          </a>
          <a class="quick-card" href="#/lib" data-route="#/lib">
            ${icon('book', 'quick-card__icon')}
            <span class="quick-card__title">Библиотека</span>
            <span class="quick-card__desc">Статьи по снаряжению, здоровью, городу и правилам.</span>
            <span class="quick-card__num">05</span>
          </a>
          <a class="quick-card" href="#/my" data-route="#/my">
            ${icon('folder', 'quick-card__icon')}
            <span class="quick-card__title">Мои материалы</span>
            <span class="quick-card__desc">Свои варианты, корзина, экспорт и импорт.</span>
            <span class="quick-card__num">06</span>
          </a>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Найт-Сити</h2><span class="dim">ЛОР / 2045</span></div>
        <div class="grid grid--4">
          <a class="card card--link" href="#/city?tab=gangs" data-route="#/city?tab=gangs">
            <div class="card__top"><div class="card__icon">${icon('users')}</div><span class="mono faint">${D.lore.gangs.length}</span></div>
            <div class="card__title">Банды</div>
            <div class="card__sub">6-я улица, Maelstrom, Tyger Claws, Valentinos и те, кто делит улицы.</div>
          </a>
          <a class="card card--link" href="#/city?tab=corps" data-route="#/city?tab=corps">
            <div class="card__top"><div class="card__icon">${icon('box')}</div><span class="mono faint">${D.lore.corps.length}</span></div>
            <div class="card__title">Корпорации</div>
            <div class="card__sub">Arasaka, Militech, Biotechnica, Petrochem и те, кто делает город удобным.</div>
          </a>
          <a class="card card--link" href="#/city?tab=services" data-route="#/city?tab=services">
            <div class="card__top"><div class="card__icon">${icon('shield')}</div><span class="mono faint">${D.lore.services.length}</span></div>
            <div class="card__title">Службы</div>
            <div class="card__sub">NCPD, Trauma Team, MaxTac, пожарные, транспорт и рипердоки.</div>
          </a>
          <a class="card card--link" href="#/city?tab=map" data-route="#/city?tab=map">
            <div class="card__top"><div class="card__icon">${icon('map')}</div><span class="mono faint">2077</span></div>
            <div class="card__title">Карта</div>
            <div class="card__sub">Интерактивная схема города: районы, банды, корпорации и места.</div>
          </a>
        </div>

        <div class="section-head" style="margin-top:28px"><h2>Работа на сегодня</h2><span class="dim">ГЕНЕРАТОР / JOB</span></div>
        <div class="grid grid--sidebar">
          <div class="panel">
            <div class="panel-head">
              <h3>Контракт</h3>
              <button class="btn btn--sm" data-action="home-reroll">${icon('refresh')} Перебросить</button>
            </div>
            <div class="panel-body">
              <div id="home-job">${renderJobSummary(UI.state.last.job, false)}</div>
            </div>
          </div>
          <div class="grid" style="gap:10px">
            <div class="panel">
              <div class="panel-head"><h3>Шестёрки</h3><a class="tiny dim" href="#/mooks" data-route="#/mooks">Все →</a></div>
              <div class="panel-body" style="display:grid;gap:6px">
                ${mooks.map(m => `<a class="search-item" href="#/mooks" data-route="#/mooks" style="padding:6px 4px">
                  <span class="search-item__icon">${icon('shield')}</span>
                  <span class="search-item__body"><span class="search-item__title">${esc(m.name)}</span><span class="search-item__meta">${esc(m.tier)} · ${m.hp} ПЗ · ОС ${m.armor}</span></span>
                </a>`).join('')}
              </div>
            </div>
            <div class="panel">
              <div class="panel-head"><h3>Настройка</h3></div>
              <div class="panel-body" style="display:grid;gap:8px">
                <button class="btn" data-action="open-dice">${icon('dice')} Броски и проверки</button>
                <a class="btn" href="#/generators?tab=gigs" data-route="#/generators?tab=gigs">${icon('users')} Халтурки по ролям</a>
                <a class="btn" href="#/generators?tab=encounters" data-route="#/generators?tab=encounters">${icon('map')} Встречи в городе</a>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    },
    setup() {
      UI.actions['home-reroll'] = () => {
        UI.state.last.job = generateJob();
        saveState();
        const el = $('#home-job');
        if (el) el.innerHTML = renderJobSummary(UI.state.last.job, false);
        toast('Контракт переброшен');
      };
    },
  };

  /* ---------------- screen ---------------- */
  function dvStrip() {
    return `<div class="screen-top">${D.core.dv.map(d => `<div class="dv-cell"><b>${d.dv}</b><span>${esc(d.name)}</span></div>`).join('')}</div>`;
  }
  function rangeTable(compact) {
    const r = D.core.ranged;
    const rows = r.rows.map(row => [row.name, ...row.values.map(v => dvBadge(v))]);
    return dataTable(r.headers, rows, { wrapClass: compact ? 'quick-table' : '' });
  }
  function autofireTable(compact) {
    const r = D.core.autofire;
    const rows = r.rows.map(row => [row.name, ...row.values.map(v => dvBadge(v))]);
    return dataTable(r.headers, rows, { wrapClass: compact ? 'quick-table' : '' });
  }
  function woundList() {
    return `<div class="wound-list">${D.core.woundStates.map(w => `<div class="wound-row wound-row--${w.color}">
      <strong>${esc(w.name)}</strong>
      <span>${esc(w.threshold)}${w.effect ? ' · ' + esc(w.effect) : ''}</span>
      <span class="dv">${w.stabilize ? 'СЛ ' + w.stabilize : '—'}</span>
    </div>`).join('')}</div>`;
  }
  function actionsTable(limit) {
    const list = limit ? D.core.actions.slice(0, limit) : D.core.actions;
    return dataTable(['Действие', 'Стоимость', 'Что делает'], list.map(a => [`<b>${esc(a.name)}</b>`, `<span class="tag">${esc(a.cost)}</span>`, `<span class="small">${esc(a.desc)}</span>`]), { wrapClass: 'quick-table' });
  }
  function modifiersTable() {
    return dataTable(['Обстоятельство', 'Мод.'], D.core.modifiers.map(m => [esc(m.name), `<span class="mono ${String(m.value).startsWith('-') ? 'red' : 'green'}">${esc(m.value)}</span>`]), { wrapClass: 'quick-table' });
  }
  function criticalTable(kind) {
    const list = D.core.critical[kind] || [];
    return dataTable(['2d6', 'Травма', 'Эффект', 'Первая помощь', 'Лечение'], list.map(c => [
      `<span class="mono yellow">${c.roll}</span>`,
      `<b>${esc(c.name)}</b>`,
      `<span class="small">${esc(c.effect)}</span>`,
      `<span class="small">${esc(c.firstAid)}</span>`,
      `<span class="small">${esc(c.treatment)}</span>`,
    ]), { wrapClass: 'quick-table' });
  }
  function critRoller(kind, target) {
    return `<div class="crit-roller">
      <button class="btn btn--sm" data-action="crit-roll" data-kind="${kind}" data-target="${target}">${icon('dice')} Бросить ${kind === 'supercritical' ? '2d6' : '2d6'}</button>
      <button class="btn btn--sm" data-action="crit-roll" data-kind="${kind}" data-target="${target}" data-fixed="6">Показать 6</button>
    </div><div id="${target}" class="crit-output"><div class="dim small">Бросьте кубики, чтобы увидеть травму.</div></div>`;
  }
  UI.critRoller = critRoller;
  UI.actions['crit-roll'] = (el) => {
    const kind = el.dataset.kind;
    const target = el.dataset.target;
    const fixed = el.dataset.fixed;
    let total = fixed ? parseInt(fixed, 10) : (roll(6) + roll(6));
    const list = D.core.critical[kind] || [];
    let hit = list.find(c => c.roll === total);
    if (!hit) {
      const sorted = list.slice().sort((a, b) => Math.abs(a.roll - total) - Math.abs(b.roll - total));
      hit = sorted[0];
    }
    const out = document.getElementById(target);
    if (!out) return;
    out.innerHTML = `<div class="crit-card">
      <div class="crit-card__roll">${total}</div>
      <div class="crit-card__name">${esc(hit.name)}</div>
      <div class="small">${esc(hit.effect)}</div>
      ${hit.firstAid ? `<div class="small dim" style="margin-top:6px">Первая помощь: ${esc(hit.firstAid)} · Лечение: ${esc(hit.treatment)}</div>` : ''}
    </div>`;
  };

  UI.pages.screen = {
    title: 'Быстрый стол',
    render() {
      return `<div class="page">
        ${pageHead('GM SCREEN / FAST TABLES', 'Быстрый стол', 'Самые частые таблицы Cyberpunk RED. Один экран — и игра не встаёт.', `
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
          <button class="btn" data-action="print">${icon('print')} Печать</button>
        `)}
        ${dvStrip()}
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Дальность · одиночный выстрел</h3><span class="tiny dim">СЛ</span></div>
            <div class="panel-body" style="padding:10px">${rangeTable(true)}</div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Ранения и стабилизация</h3><span class="tiny dim">СЛ</span></div>
            <div class="panel-body">${woundList()}</div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Критические травмы</h3><span class="tiny dim">2d6</span></div>
            <div class="panel-body">
              ${critRoller('body', 'crit-screen-body')}
              <details style="margin-top:10px"><summary class="small dim" style="cursor:pointer">Таблица тела</summary><div style="margin-top:8px">${criticalTable('body')}</div></details>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Автоогонь</h3><span class="tiny dim">СЛ</span></div>
            <div class="panel-body" style="padding:10px">
              ${autofireTable(true)}
              <div class="callout small" style="margin-top:10px">${esc(D.core.autofire.note)}</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Спасбросок от смерти</h3><span class="tiny dim">1d10 ≤ ТЕЛ</span></div>
            <div class="panel-body">
              <div class="kv">
                <dt>Формула</dt><dd>${esc(D.core.deathSave.formula)}</dd>
                <dt>Автопровал</dt><dd>${esc(D.core.deathSave.autoFail)}</dd>
                <dt>Накопление</dt><dd>${esc(D.core.deathSave.penalty)}</dd>
                <dt>Сброс</dt><dd>${esc(D.core.deathSave.reset)}</dd>
              </div>
              <div class="callout callout--red small" style="margin-top:10px">${esc(D.core.deathSave.stabilize)}</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Модификаторы</h3><span class="tiny dim">−1…−4</span></div>
            <div class="panel-body" style="padding:10px">${modifiersTable()}</div>
          </div>
        </div>
        <div class="section-head" style="margin-top:26px"><h2>Действия в бою</h2><span class="dim">1 ход = движение + действие</span></div>
        ${actionsTable()}
        <div class="grid grid--2" style="margin-top:16px">
          <div class="panel">
            <div class="panel-head"><h3>Броня</h3></div>
            <div class="panel-body small">
              <p><b>Абляция:</b> ${esc(D.core.armor.ablation)}</p>
              <p><b>Стопка:</b> ${esc(D.core.armor.stack)}</p>
              <p><b>Щиты:</b> ${esc(D.core.armor.shields)}</p>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Лечение</h3></div>
            <div class="panel-body" style="padding:10px">
              ${dataTable(['Способ', 'Время', 'Эффект'], D.core.healing.map(h => [`<b>${esc(h.method)}</b>`, esc(h.time), `<span class="small">${esc(h.effect)}</span>`]), { wrapClass: 'quick-table' })}
            </div>
          </div>
        </div>
      </div>`;
    },
  };

  /* ---------------- combat ---------------- */
  UI.pages.combat = {
    title: 'Бой',
    render() {
      return `<div class="page">
        ${pageHead('ПЕРЕСТРЕЛКА В ПЯТНИЦУ ВЕЧЕРОМ', 'Бой', 'Инициатива, действия, дальность, броня, критические травмы и смерть. Всё, что происходит за 3 секунды раунда.', `
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
          <button class="btn" data-action="print">${icon('print')} Печать</button>
        `)}
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Инициатива</h3></div>
            <div class="panel-body">
              <div class="callout callout--yellow"><b>Инициатива = РЕА + 1d10.</b> Ход = 1 движение + 1 действие. Раунд ≈ 3 секунды.</div>
              <div class="rule"></div>
              <div class="kv">
                <dt>Движение</dt><dd>СКО × 2 м</dd>
                <dt>Действие</dt><dd>1 за ход</dd>
                <dt>Реакция</dt><dd>Уклонение, если РЕА 8+</dd>
                <dt>Прицельный выстрел</dt><dd>−8</dd>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Формулы атаки</h3></div>
            <div class="panel-body small">
              <p><b>Дальний бой:</b> РЕА + Навык оружия + 1d10 против СЛ дальности (или ЛВК + Уклонение + 1d10, если цель уклоняется).</p>
              <p><b>Ближний бой:</b> ЛВК + Ближний бой/Рукопашный бой + 1d10 против ЛВК + Уклонение + 1d10.</p>
              <p><b>Уклонение от пуль:</b> только если РЕА 8+; иначе используется СЛ дальности.</p>
              <p class="dim">Побеждает тот, у кого результат выше; при ничьей побеждает защитник.</p>
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Дальность</h2><span class="dim">ОДИНОЧНЫЙ ВЫСТРЕЛ</span></div>
        ${rangeTable()}
        <div class="section-head" style="margin-top:26px"><h2>Автоогонь</h2><span class="dim">10 ПАТРОНОВ · 1 ДЕЙСТВИЕ</span></div>
        ${autofireTable()}
        <div class="callout" style="margin-top:10px">${esc(D.core.autofire.note)}</div>

        <div class="section-head" style="margin-top:26px"><h2>Критические травмы</h2><span class="dim">2d6 · +5 УРОНА В ПЗ</span></div>
        <div class="panel" style="margin-bottom:12px">
          <div class="panel-body">
            <div class="badge-row" style="margin-bottom:10px">
              <button class="chip is-active" data-crit-tab="body">Тело</button>
              <button class="chip" data-crit-tab="head">Голова</button>
              <button class="chip" data-crit-tab="supercritical">Суперкритический удар</button>
            </div>
            <div id="crit-table">${criticalTable('body')}</div>
            <div class="rule"></div>
            <div class="small dim">Каждый раз, когда на двух и более кубиках урона выпадает 6, вы наносите критическое повреждение. Бонусный урон +5 идёт сразу в ПЗ, минуя броню. Прицельный выстрел в голову — по таблице головы.</div>
          </div>
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Ранения, смерть и лечение</h2><span class="dim">СПАСБРОСОК ОТ СМЕРТИ</span></div>
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Состояния</h3></div>
            <div class="panel-body">${woundList()}</div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Смерть и стабилизация</h3></div>
            <div class="panel-body">
              <div class="kv">
                <dt>Спасбросок</dt><dd>${esc(D.core.deathSave.formula)}</dd>
                <dt>Автопровал</dt><dd>${esc(D.core.deathSave.autoFail)}</dd>
                <dt>Штраф</dt><dd>${esc(D.core.deathSave.penalty)}</dd>
                <dt>Сброс</dt><dd>${esc(D.core.deathSave.reset)}</dd>
              </div>
              <div class="callout small" style="margin-top:10px">${esc(D.core.deathSave.after)}</div>
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Действия</h2><span class="dim">ПОЛНЫЙ СПИСОК</span></div>
        ${actionsTable()}

        <div class="section-head" style="margin-top:26px"><h2>Броня и укрытия</h2><span class="dim">ОС · АБЛЯЦИЯ</span></div>
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Правила брони</h3></div>
            <div class="panel-body small">
              <p><b>Абляция:</b> ${esc(D.core.armor.ablation)}</p>
              <p><b>Стопка:</b> ${esc(D.core.armor.stack)}</p>
              <p><b>Щиты:</b> ${esc(D.core.armor.shields)}</p>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Укрытия</h3></div>
            <div class="panel-body" style="padding:10px">
              ${dataTable(['Тип', 'ПЗ', 'ОС', 'Примечание'], D.core.cover.map(c => [`<b>${esc(c.type)}</b>`, c.hp, c.sp, `<span class="small">${esc(c.note)}</span>`]), { wrapClass: 'quick-table' })}
            </div>
          </div>
        </div>
        <div class="section-head" style="margin-top:26px"><h2>Лечение</h2></div>
        ${dataTable(['Способ', 'Время', 'Эффект', 'СЛ'], D.core.healing.map(h => [`<b>${esc(h.method)}</b>`, esc(h.time), `<span class="small">${esc(h.effect)}</span>`, esc(h.dv)]))}
      </div>`;
    },
    setup() {
      $$('[data-crit-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          $$('[data-crit-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
          const k = btn.dataset.critTab;
          const el = $('#crit-table');
          if (el) el.innerHTML = criticalTable(k);
        });
      });
    },
  };

  /* ---------------- rules ---------------- */
  UI.pages.rules = {
    title: 'Правила',
    render() {
      const rep = [
        ['0–1', 'Никто. Вас не знают даже в собственном квартале.'],
        ['2–3', 'Местный. Слышали в районе, могут вспомнить в баре.'],
        ['4–5', 'Городской. О вас знают фиксеры и некоторые корпораты.'],
        ['6–7', 'Национальный. Ваше имя звучит в новостях и на рынках.'],
        ['8–9', 'Международный. О вас говорят за пределами Найт-Сити.'],
        ['10+', 'Легенда. Вас узнают по походке. И боятся.'],
      ];
      return `<div class="page">
        ${pageHead('ДОВОДИМ ДО КОНЦА', 'Правила', 'Как делается проверка, как работает удача, как создать персонажа и что делать между играми.', `
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
          <button class="btn" data-action="print">${icon('print')} Печать</button>
        `)}
        <div class="grid grid--2">
          <div class="panel">
            <div class="panel-head"><h3>Проверка</h3></div>
            <div class="panel-body">
              <div class="callout callout--yellow"><b>СТАТ + Навык + 1d10 против СЛ.</b> Если результат равен СЛ или выше — успех.</div>
              <div class="rule"></div>
              <p class="small"><b>Критический успех:</b> натуральная 10 — бросьте ещё 1d10 и добавьте. Если снова 10, повторяйте.</p>
              <p class="small"><b>Критический провал:</b> натуральная 1 — бросьте 1d10 и вычтите из результата.</p>
              <p class="small"><b>Смежный навык:</b> +1 к проверке, если Рефери разрешает использовать другой навык как поддержку. Бонус не складывается.</p>
              <p class="small"><b>Без навыка:</b> только СТАТ + 1d10.</p>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Удача</h3></div>
            <div class="panel-body">
              <p class="small">Удача = значение СТАТ «Удача». Пул восстанавливается в начале каждой игровой сессии.</p>
              <p class="small">Перед броском можно потратить любое количество очков Удачи: каждое даёт <b>+1</b> к проверке. Нельзя добавлять Удачу к урону, и нельзя тратить больше, чем есть.</p>
              <div class="callout small">Удача — это не «переброс». Это шанс выжать максимум из одного броска.</div>
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Сложность</h2><span class="dim">СЛ</span></div>
        ${dataTable(['Сложность', 'СЛ', 'Когда использовать'], D.core.dv.map(d => [`<b>${esc(d.name)}</b>`, `<span class="mono yellow">${d.dv}</span>`, `<span class="small">${esc(d.note)}</span>`]))}

        <div class="section-head" style="margin-top:26px"><h2>Создание персонажа</h2><span class="dim">7 ШАГОВ</span></div>
        <div class="grid grid--3">
          ${[
            ['1. Роль', 'Выберите роль: Соло, Нетраннер, Техник, Медтех, Медиа, Законник, Рокербой, Фиксер, Кочевник или Корпорат.'],
            ['2. Характеристики', 'Распределите 62 очка между 10 СТАТ (или используйте шаблон «Уличная крыса»).'],
            ['3. Навыки', 'Выберите навыки роли и специализации. Помните: сложные навыки стоят ×2.'],
            ['4. Жизненный путь', 'Определите происхождение, друзей, врагов, любовь и трагедию.'],
            ['5. Снаряжение', 'Купите оружие, броню, импланты и вещи. Не забудьте про нейролинк.'],
            ['6. Производные', 'ПЗ = 10 + 5 × ТЕЛ. Спасбросок от смерти = ТЕЛ. Человечность = ЭМП × 10.'],
            ['7. Репутация', 'Начните с репутации 0–2 и решите, что о вас говорят на улице.'],
          ].map(([t, d]) => `<div class="panel"><div class="panel-body"><div class="card__title">${esc(t)}</div><p class="small dim" style="margin:8px 0 0">${esc(d)}</p></div></div>`).join('')}
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Прокачка</h2><span class="dim">ОЧКИ УЛУЧШЕНИЙ</span></div>
        <div class="grid grid--3">
          <div class="panel"><div class="panel-head"><h3>Обычные</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.skills.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
          <div class="panel"><div class="panel-head"><h3>Сложные ×2</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.difficult.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
          <div class="panel"><div class="panel-head"><h3>Навык роли</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.role.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
        </div>

        <div class="grid grid--2" style="margin-top:26px">
          <div class="panel">
            <div class="panel-head"><h3>Репутация</h3></div>
            <div class="panel-body" style="padding:10px">
              ${dataTable(['Уровень', 'Что это значит'], rep.map(r => [`<span class="mono yellow">${r[0]}</span>`, `<span class="small">${esc(r[1])}</span>`]), { wrapClass: 'quick-table' })}
              <div class="small dim" style="margin-top:8px">При первой встрече бросьте 1d10. Если результат меньше репутации — человек о вас слышал.</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Downtime</h3></div>
            <div class="panel-body small">
              <p><b>Халтурка:</b> заработать на неделю по таблице роли.</p>
              <p><b>Терапия:</b> восстановить человечность (2d6 за 500 eb / 4d6 за 1 000 eb).</p>
              <p><b>Ремонт:</b> починить броню, оружие, транспорт.</p>
              <p><b>Покупки:</b> найти товар через фиксера, сходить на ночной рынок.</p>
              <p><b>Контакт:</b> встретиться с информатором или союзником.</p>
              <p><b>Подготовка:</b> изучить место, собрать информацию, сделать ловушку.</p>
            </div>
          </div>
        </div>
      </div>`;
    },
  };

  /* ---------------- roles ---------------- */
  UI.pages.roles = {
    title: 'Роли и навыки',
    render(r) {
      const roles = D.roles.map(role => `
        <div class="role-card" style="--role-color:${role.color}" data-action="open-role" data-id="${role.id}" tabindex="0" role="button">
          <div class="role-card__head">
            <div>
              <div class="role-card__name">${esc(role.name)}</div>
              <div class="role-card__ability">${esc(role.ability)}</div>
            </div>
            <div class="mono faint">${esc(role.icon)}</div>
          </div>
          <div class="role-card__desc">${esc(role.summary)}</div>
          <div class="role-card__skills">${role.skills.slice(0, 5).map(s => `<span class="tag">${esc(s)}</span>`).join('')}${role.skills.length > 5 ? `<span class="tag">+${role.skills.length - 5}</span>` : ''}</div>
        </div>`).join('');
      return `<div class="page">
        ${pageHead('ДУША И НОВАЯ МАШИНА', 'Роли и навыки', 'Десять ролей, их способности и полный список навыков с базовой характеристикой.', `
          <a class="btn" href="#/lib/job" data-route="#/lib/job">${icon('book')} Подробно о ролях</a>
        `)}
        <div class="role-grid">${roles}</div>

        <div class="section-head" style="margin-top:30px"><h2>Навыки</h2><span class="dim">${D.skills.length} НАВЫКОВ</span></div>
        <div class="toolbar">
          <div class="input-group">${icon('search')}<input class="input" id="skill-search" placeholder="Поиск навыка…" autocomplete="off"></div>
          <select class="select" id="skill-stat">
            <option value="">Все характеристики</option>
            ${['ИНТ', 'РЕА', 'ЛВК', 'ТЕХ', 'ХАР', 'ВОЛЯ', 'СКО', 'ТЕЛ', 'ЭМП'].map(s => `<option>${s}</option>`).join('')}
          </select>
          <label class="chip"><input type="checkbox" id="skill-x2"> только ×2</label>
        </div>
        <div id="skills-table">
          ${dataTable(['Навык', 'Характеристика', '×2', 'Группа'], D.skills.map(s => [`<b>${esc(s.name)}</b>`, `<span class="skill-stat">${esc(s.stat)}</span>`, s.x2 ? '<span class="x2">×2</span>' : '—', `<span class="dim small">${esc(s.group)}</span>`]), { wrapClass: 'table-wrap--tall' })}
        </div>

        <div class="section-head" style="margin-top:30px"><h2>Прокачка</h2><span class="dim">ОЧКИ УЛУЧШЕНИЙ</span></div>
        <div class="grid grid--3">
          <div class="panel"><div class="panel-head"><h3>Обычные</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.skills.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
          <div class="panel"><div class="panel-head"><h3>Сложные ×2</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.difficult.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
          <div class="panel"><div class="panel-head"><h3>Навык роли</h3></div><div class="panel-body" style="padding:10px">${dataTable(['Ур.', 'Цена'], D.core.improvement.role.map((v, i) => [i + 1, v]), { wrapClass: 'quick-table' })}</div></div>
        </div>
      </div>`;
    },
    setup(r) {
      const apply = () => {
        const q = norm($('#skill-search').value);
        const stat = $('#skill-stat').value;
        const x2 = $('#skill-x2').checked;
        const rows = $$('#skills-table tbody tr');
        let count = 0;
        D.skills.forEach((s, i) => {
          const tr = rows[i];
          if (!tr) return;
          const ok = (!q || norm(s.name).includes(q) || norm(s.group).includes(q)) && (!stat || s.stat === stat) && (!x2 || s.x2);
          tr.style.display = ok ? '' : 'none';
          if (ok) count++;
        });
        const foot = $('#skills-table .table-foot');
        if (foot) foot.textContent = `Показано: ${count} из ${D.skills.length}`;
      };
      ['skill-search', 'skill-stat', 'skill-x2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', apply);
      });
      if (r.query.role) {
        const role = D.roles.find(x => x.id === r.query.role);
        if (role) UI.actions['open-role']({ dataset: { id: role.id } });
      }
    },
  };
  UI.actions['open-role'] = (el) => {
    const role = D.roles.find(x => x.id === el.dataset.id);
    if (!role) return;
    openModal(modalShell({
      title: role.name,
      sub: role.ability,
      wide: true,
      body: `<div class="article__body">
        <p>${esc(role.summary)}</p>
        <h3>Опции способности</h3>
        ${dataTable(['Опция', 'Стоимость', 'Эффект'], role.options.map(o => [`<b>${esc(o.name)}</b>`, `<span class="mono yellow">${esc(o.cost)}</span>`, `<span class="small">${esc(o.effect)}</span>`]))}
        <h3>Ключевые навыки</h3>
        <div class="badge-row">${role.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
        <div style="margin-top:18px"><a class="btn btn--yellow" href="#/lib/${role.library}" data-route="#/lib/${role.library}">${icon('book')} Полная статья</a></div>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button>`,
    }));
  };

  /* ---------------- mooks ---------------- */
  UI.pages.mooks = {
    title: 'Шестёрки',
    render(r) {
      return `<div class="page">
        ${pageHead('ШЕСТЁРКИ И ЗАСРАНЦЫ', 'NPC на скорую руку', 'Базовые противники из корбука: ПЗ, броня, оружие и ключевые навыки. Клик — подробности.', `
          <a class="btn" href="#/generators?tab=mook" data-route="#/generators?tab=mook">${icon('dice')} Сгенерировать</a>
        `)}
        <div class="grid grid--2">
          ${D.mooks.map(m => `<div class="panel card--hover" data-action="open-mook" data-name="${attr(m.name)}" role="button" tabindex="0">
            <div class="card__top">
              <div>
                <div class="card__title">${esc(m.name)}</div>
                <div class="card__sub">${esc(m.tier)} · ${esc(m.weapon)}</div>
              </div>
              <div class="mono yellow">${m.hp} ПЗ</div>
            </div>
            <div class="card__sub">${esc(m.stats)}</div>
            <div class="badge-row" style="margin-top:8px"><span class="tag tag--cyan">ОС ${m.armor}</span><span class="tag">${esc(m.cyber)}</span></div>
          </div>`).join('')}
        </div>
      </div>`;
    },
    setup(r) {
      if (r.query.mook) {
        const name = decodeURIComponent(r.query.mook);
        const m = D.mooks.find(x => x.name === name);
        if (m) UI.actions['open-mook']({ dataset: { name: m.name } });
      }
    },
  };
  UI.actions['open-mook'] = (el) => {
    const m = D.mooks.find(x => x.name === el.dataset.name);
    if (!m) return;
    openModal(modalShell({
      title: m.name,
      sub: m.tier,
      body: `<div class="article__body">
        <div class="grid grid--2">
          <div class="panel"><div class="panel-head"><h3>Характеристики</h3></div><div class="panel-body"><div class="kv"><dt>ПЗ</dt><dd>${m.hp}</dd><dt>ОС</dt><dd>${m.armor}</dd><dt>Оружие</dt><dd>${esc(m.weapon)}</dd></div><p class="small dim" style="margin-top:10px">${esc(m.stats)}</p></div></div>
          <div class="panel"><div class="panel-head"><h3>Навыки</h3></div><div class="panel-body small">${esc(m.skills)}</div></div>
        </div>
        <h3>Хром и снаряжение</h3><p>${esc(m.cyber)}</p>
        <h3>Заметки</h3><p>${esc(m.notes)}</p>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button>`,
    }));
  };

  /* ---------------- search ---------------- */
  let SEARCH_INDEX = null;
  function buildSearchIndex() {
    if (SEARCH_INDEX) return SEARCH_INDEX;
    const idx = [];
    D.arsenal.weapons.forEach(w => idx.push({ type: 'Оружие', title: w.name, meta: `${w.category} · ${w.damage || ''} · ${w.priceLabel || ''}`, route: '#/weapons/' + w.id, text: [w.name, w.category, w.skill, w.damage, w.special, w.desc, w.source].join(' ') }));
    D.arsenal.mods.forEach(m => idx.push({ type: 'Модификация', title: m.name, meta: `${m.slots} слот(а) · ${m.priceLabel || ''}`, route: '#/weapons?tab=mods', text: [m.name, m.desc, m.compatible].join(' ') }));
    D.cyberware.forEach(c => idx.push({ type: 'Имплант', title: c.name, meta: `${c.category} · ПЧ ${c.humanity} · ${c.place}`, route: '#/ripperdoc/' + c.id, text: [c.name, c.category, c.desc, c.requires.join(' '), c.source].join(' ') }));
    (D.equipment.armor || []).forEach(a => idx.push({ type: 'Броня', title: a.name, meta: `ОС ${a.sp} · ${a.parts}`, route: '#/equipment?tab=armor', text: [a.name, a.desc, a.subtype, a.penalty].join(' ') }));
    (D.equipment.gear || []).forEach(g => idx.push({ type: 'Снаряжение', title: g.name, meta: g.priceLabel || '', route: '#/equipment?tab=gear', text: [g.name, g.desc].join(' ') }));
    (D.equipment.drugs || []).forEach(g => idx.push({ type: 'Наркотик', title: g.name, meta: g.duration || '', route: '#/equipment?tab=drugs', text: [g.name, g.effect, g.effect2, g.desc].join(' ') }));
    (D.equipment.vehicles || []).forEach(v => idx.push({ type: 'Транспорт', title: v.name, meta: `${v.hp} ПЗТ · ${v.priceLabel || ''}`, route: '#/equipment?tab=vehicles', text: [v.name, v.desc, v.type].join(' ') }));
    (D.equipment.apps || []).forEach(a => idx.push({ type: 'Приложение', title: a.name, meta: a.brand || '', route: '#/equipment?tab=apps', text: [a.name, a.desc, a.brand].join(' ') }));
    D.roles.forEach(role => idx.push({ type: 'Роль', title: role.name, meta: role.ability, route: '#/roles?role=' + role.id, text: [role.name, role.summary, role.ability, role.skills.join(' ')].join(' ') }));
    D.mooks.forEach(m => idx.push({ type: 'NPC', title: m.name, meta: m.tier, route: '#/mooks?mook=' + encodeURIComponent(m.name), text: [m.name, m.weapon, m.stats, m.skills, m.cyber, m.notes].join(' ') }));
    (D.map.places || []).forEach(p => idx.push({ type: 'Место', title: p.name, meta: (p.type || '') + ' · ' + (p.district || ''), route: '#/city?tab=map&type=place&id=' + p.id, text: [p.name, p.type, p.desc, p.district].join(' ') }));
    D.library.forEach(p => idx.push({ type: 'Библиотека', title: p.title, meta: p.group, route: '#/lib/' + p.slug, text: [p.title, p.group, ...p.blocks.map(b => b.text || b.html || (b.items || []).join(' '))].join(' ') }));
    (D.lore.districts || []).forEach(x => idx.push({ type: 'Район', title: x.name, meta: x.tag + ' · ' + x.threat, route: '#/city?tab=districts&id=' + x.id, text: [x.name, x.tag, x.vibe, x.control, x.desc, ...(x.places || []), ...(x.hooks || [])].join(' ') }));
    (D.lore.gangs || []).forEach(x => idx.push({ type: 'Банда', title: x.name, meta: x.tag + ' · ' + x.era, route: '#/city?tab=gangs&id=' + x.id, text: [x.name, x.tag, x.territory, x.business, x.desc, x.want, x.hate, ...(x.hooks || [])].join(' ') }));
    (D.lore.corps || []).forEach(x => idx.push({ type: 'Корпорация', title: x.name, meta: x.field, route: '#/city?tab=corps&id=' + x.id, text: [x.name, x.field, x.hq, x.desc, x.want, x.methods, ...(x.hooks || [])].join(' ') }));
    (D.lore.services || []).forEach(x => idx.push({ type: 'Служба', title: x.name, meta: x.tag + ' · ' + x.response, route: '#/city?tab=services&id=' + x.id, text: [x.name, x.tag, x.response, x.cost, x.desc, x.how].join(' ') }));
    (D.adventure.job ? D.adventure.job.categories : []).forEach(cat => cat.entries.forEach(e => idx.push({ type: 'Генератор', title: cat.title, meta: e.text, route: '#/generators?tab=job', text: [cat.title, e.text].join(' ') })));
    SEARCH_INDEX = idx;
    return idx;
  }
  function search(query) {
    const idx = buildSearchIndex();
    const q = norm(query).trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return idx
      .map(item => {
        const title = norm(item.title);
        const text = norm(item.text);
        let score = 0;
        if (title === q) score += 200;
        else if (title.startsWith(q)) score += 120;
        else if (title.includes(q)) score += 80;
        let all = true;
        tokens.forEach(t => {
          if (title.includes(t)) score += 24;
          else if (text.includes(t)) score += 8;
          else all = false;
        });
        return all ? { item, score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map(x => x.item);
  }
  UI.search = search;

  let searchActive = 0;
  function openSearch(initial) {
    if (!$('#modal-root').classList.contains('is-open')) {
      openModal(`<div class="search-modal" role="dialog" aria-modal="true" aria-label="Поиск">
        <div class="search-input-wrap">
          ${icon('search')}
          <input class="search-input" id="search-input" placeholder="Оружие, имплант, правило, роль…" autocomplete="off" spellcheck="false" autofocus value="${attr(initial || '')}">
          <span class="search-hint">ESC</span>
          <button class="icon-btn" data-action="close-modal" aria-label="Закрыть">${icon('close')}</button>
        </div>
        <div class="search-results" id="search-results"></div>
        <div class="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> выбор</span><span><kbd>Enter</kbd> открыть</span><span><kbd>Ctrl K</kbd> закрыть</span></div>
      </div>`);
    }
    const input = $('#search-input');
    if (!input) return;
    const run = () => {
      const items = search(input.value);
      searchActive = 0;
      renderSearchResults(items);
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
      const items = $$('.search-item', $('#search-results'));
      if (e.key === 'ArrowDown') { e.preventDefault(); searchActive = Math.min(items.length - 1, searchActive + 1); updateSearchActive(items); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); searchActive = Math.max(0, searchActive - 1); updateSearchActive(items); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const active = $('.search-item.is-active', $('#search-results')) || items[0];
        if (active) { closeModal(); navigate(active.getAttribute('href')); }
      }
    });
    if (input.value) run(); else renderSearchResults([]);
    setTimeout(() => input.focus(), 20);
  }
  function updateSearchActive(items) {
    items.forEach((el, i) => el.classList.toggle('is-active', i === searchActive));
    const active = items[searchActive];
    if (active) active.scrollIntoView({ block: 'nearest' });
  }
  function renderSearchResults(items) {
    const box = $('#search-results');
    if (!box) return;
    if (!items.length) {
      box.innerHTML = `<div class="search-empty">${$('#search-input').value ? 'Ничего не найдено. Попробуйте другое слово.' : 'Начните вводить: «пистолет», «нейролинк», «критическое», «Соло»…'}</div>`;
      return;
    }
    let html = '';
    let currentType = null;
    items.slice(0, 28).forEach((item, i) => {
      if (item.type !== currentType) {
        currentType = item.type;
        html += `<div class="search-group">${esc(currentType)}</div>`;
      }
      html += `<a class="search-item ${i === 0 ? 'is-active' : ''}" href="${attr(item.route)}" data-route="${attr(item.route)}">
        <span class="search-item__icon">${icon(item.type === 'Оружие' ? 'gun' : item.type === 'Имплант' ? 'chip' : item.type === 'Броня' ? 'shield' : item.type === 'Роль' ? 'users' : item.type === 'NPC' ? 'shield' : item.type === 'Библиотека' ? 'book' : item.type === 'Район' ? 'home' : item.type === 'Банда' ? 'users' : item.type === 'Корпорация' ? 'box' : item.type === 'Служба' ? 'shield' : item.type === 'Место' ? 'map' : 'box')}</span>
        <span class="search-item__body"><span class="search-item__title">${esc(item.title)}</span><span class="search-item__meta">${esc(item.meta || '')}</span></span>
      </a>`;
    });
    box.innerHTML = html;
  }
  UI.openSearch = openSearch;

  UI.pages.search = {
    title: 'Поиск',
    render(r) {
      const q = r.query.q || '';
      const items = q ? search(q) : [];
      return `<div class="page">${pageHead('ПОИСК', 'Результаты', q ? `По запросу «${esc(q)}» найдено: ${items.length}` : 'Введите запрос в строке поиска.')}
        <div class="search-results">${items.map(item => `<a class="search-item" href="${attr(item.route)}" data-route="${attr(item.route)}"><span class="search-item__icon">${icon('search')}</span><span class="search-item__body"><span class="search-item__title">${esc(item.title)}</span><span class="search-item__meta">${esc(item.type)} · ${esc(item.meta || '')}</span></span></a>`).join('')}</div>
      </div>`;
    },
  };

  /* ---------------- not found ---------------- */
  UI.pages.notfound = {
    title: '404',
    render() {
      return `<div class="page">${pageHead('404 / SIGNAL LOST', 'Маршрут не найден', 'Похоже, этот узел сети выгорел. Вернитесь на главную или воспользуйтесь поиском.')}
        <div class="badge-row"><a class="btn btn--yellow" href="#/home" data-route="#/home">${icon('home')} На главную</a><button class="btn" data-action="open-search">${icon('search')} Поиск</button></div>
      </div>`;
    },
  };

  /* ---------------- init ---------------- */
  function init() {
    renderNav();
    render();
    // sidebar click outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && $('#sidebar').classList.contains('is-open') && !e.target.closest('#sidebar') && !e.target.closest('.menu-btn')) closeSidebar();
    });
    // back-to-top
    const back = document.createElement('button');
    back.className = 'back-top';
    back.innerHTML = icon('chevron');
    back.setAttribute('aria-label', 'Наверх');
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(back);
    window.addEventListener('scroll', () => back.classList.toggle('is-visible', window.scrollY > 700), { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
