/* ============================================================
   Weapons, modifications, ripperdoc
   ============================================================ */
(function () {
  'use strict';
  const UI = window.CPR_UI;
  if (!UI) return;
  const { esc, attr, fmt, money, icon, dataTable, pageHead, sectionHead, openModal, modalShell, toast, saveState, state, data, $, $$ } = UI;

  /* ============================================================
     WEAPONS
     ============================================================ */
  const W = data.arsenal.weapons || [];
  const MODS = data.arsenal.mods || [];
  const AMMO = data.arsenal.ammo || [];

  UI.weaponConfig = UI.weaponConfig || { weaponId: null, mods: [] };

  function weaponById(id) { return W.find(w => w.id === id); }
  function modById(id) { return MODS.find(m => m.id === id); }

  function weaponRow(w, i) {
    const search = [w.name, w.category, w.skill, w.damage, w.special, w.desc, w.source].join(' ').toLowerCase();
    return `<tr class="is-clickable" data-weapon-row data-id="${w.id}" data-cat="${attr(w.category)}" data-quality="${attr(w.quality || '')}" data-search="${attr(search)}" data-action="open-weapon" data-weapon="${w.id}">
      <td><div class="weapon-name"><strong>${esc(w.name)}</strong><span>${esc(w.source || '')} · <span class="tag ${UI.fmt.catClass(w.category)}">${esc(w.category)}</span></span></div></td>
      <td class="num yellow">${esc(UI.fmt.damageFmt(w.damage))}</td>
      <td class="num">${esc(w.rof || '—')}</td>
      <td class="num">${esc(w.mag || '—')}</td>
      <td class="num">${esc(w.hands || '—')}</td>
      <td>${UI.fmt.concealFmt(w.conceal)}</td>
      <td class="num">${w.slots == null ? '—' : w.slots}</td>
      <td class="num price-cell">${priceTag(w.price, w.priceLabel)}</td>
    </tr>`;
  }

  function renderWeapons(r) {
    const tab = (r.query.tab || 'weapons');
    const tabs = [
      ['weapons', 'Арсенал', 'gun'],
      ['mods', 'Модификации', 'filter'],
      ['ammo', 'Боеприпасы', 'box'],
      ['config', 'Конструктор', 'terminal'],
      ['tables', 'Таблицы', 'screen'],
    ];
    const tabsHTML = `<div class="gen-tabs">${tabs.map(([id, label, ic]) => `<a class="gen-tab ${tab === id ? 'is-active' : ''}" href="#/weapons?tab=${id}" data-route="#/weapons?tab=${id}">${icon(ic)} ${label}</a>`).join('')}</div>`;
    let body = '';
    if (tab === 'mods') body = renderMods();
    else if (tab === 'ammo') body = renderAmmo();
    else if (tab === 'config') body = renderConfig();
    else if (tab === 'tables') body = renderWeaponTables();
    else body = renderWeaponList();
    return `<div class="page">
      ${pageHead('ОРУЖЕЙНЫЙ МАГАЗИН', 'Арсенал', 'Оружие, модификации и боеприпасы. Фильтры, поиск и конструктор под ваш стиль.', `
        <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
        <button class="btn" data-action="print">${icon('print')} Печать</button>
      `)}
      ${tabsHTML}
      ${body}
    </div>`;
  }

  function renderWeaponList() {
    const cats = Array.from(new Set(W.map(w => w.category))).sort((a, b) => a.localeCompare(b, 'ru'));
    return `<div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="w-search" placeholder="Название, навык, эффект…" autocomplete="off"></div>
      <select class="select" id="w-cat"><option value="">Все категории</option>${cats.map(c => `<option>${esc(c)}</option>`).join('')}</select>
      <select class="select" id="w-quality"><option value="">Любое качество</option><option>Отличного качества</option><option>Высокого качества</option><option>Плохого качества</option></select>
      <span class="dim small" id="w-count">${W.length} позиций</span>
    </div>
    <div id="weapons-table">
      ${dataTable(['Название', 'Урон', 'ROF', 'Маг.', 'Руки', 'Скрыть', 'Слоты', 'Цена'], W.map(weaponRow), { wrapClass: 'table-wrap--tall', foot: `<span>Показано: ${W.length}</span><span>Клик по строке — подробности</span>` })}
    </div>`;
  }

  function renderMods() {
    return `<div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="mod-search" placeholder="Название, эффект, совместимость…" autocomplete="off"></div>
      <span class="dim small" id="mod-count">${MODS.length} модификаций</span>
    </div>
    <div id="mods-table">
      ${dataTable(['Модификация', 'Слоты', 'Совместимость', 'Эффект', 'Цена'], MODS.map(m => {
        const search = [m.name, m.desc, m.compatible, m.source].join(' ').toLowerCase();
        return `<tr class="is-clickable" data-mod-row data-search="${attr(search)}" data-action="open-mod" data-mod="${m.id}">
          <td><div class="weapon-name"><strong>${esc(m.name)}</strong><span>${esc(m.source || '')}</span></div></td>
          <td class="num">${m.slots}</td>
          <td><span class="small dim">${esc(m.compatible || '—')}</span></td>
          <td><span class="small">${esc((m.desc || '').slice(0, 160))}${(m.desc || '').length > 160 ? '…' : ''}</span></td>
          <td class="num">${priceTag(m.price, m.priceLabel)}</td>
        </tr>`;
      }), { wrapClass: 'table-wrap--tall', foot: `<span>Показано: ${MODS.length}</span><span>Клик — полное описание</span>` })}
    </div>`;
  }

  function renderAmmo() {
    return `<div class="toolbar"><div class="input-group">${icon('search')}<input class="input" id="ammo-search" placeholder="Боеприпас, эффект…" autocomplete="off"></div><span class="dim small" id="ammo-count">${AMMO.length} позиций</span></div>
    <div id="ammo-table">
      ${dataTable(['Боеприпас', 'Тип', 'Урон', 'Эффект', 'Цена'], AMMO.map(a => {
        const search = [a.name, a.type, a.effect, a.damage].join(' ').toLowerCase();
        return `<tr data-ammo-row data-search="${attr(search)}">
          <td><b>${esc(a.name)}</b></td>
          <td><span class="small dim">${esc(a.type || '—')}</span></td>
          <td class="num">${esc(a.damage || '—')}</td>
          <td><span class="small">${esc(a.effect || '')}</span></td>
          <td class="num">${priceTag(a.price, a.priceLabel)}</td>
        </tr>`;
      }), { wrapClass: 'table-wrap--tall', foot: `<span>Показано: ${AMMO.length}</span><span>Бронебойные ломают ОС на 2</span>` })}
    </div>`;
  }

  function renderWeaponTables() {
    const mags = data.arsenal.magazines || [];
    const barrels = data.arsenal.barrels || [];
    return `<div class="grid grid--2">
      <div class="panel">
        <div class="panel-head"><h3>Магазины</h3><span class="tiny dim">ЁМКОСТЬ</span></div>
        <div class="panel-body" style="padding:10px">
          ${dataTable(['Оружие', 'Стандарт', 'Увеличенный', 'Барабанный'], mags.map(m => [`<b>${esc(m.weapon)}</b>`, m.standard, m.extended, m.drum]), { wrapClass: 'quick-table' })}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Стволы и таблицы дальности</h3><span class="tiny dim">ЗАМЕНА ТАБЛИЦЫ</span></div>
        <div class="panel-body" style="padding:10px">
          ${dataTable(['Оружие', 'Модификация', 'Новая таблица'], barrels.map(b => [`<span class="small">${esc(b.weaponType)}</span>`, `<span class="small">${esc(b.mod)}</span>`, `<span class="tag tag--cyan">${esc(b.rangeTable)}</span>`]), { wrapClass: 'quick-table' })}
        </div>
      </div>
    </div>
    <div class="section-head" style="margin-top:26px"><h2>Дальность</h2><span class="dim">СЛ ОДИНОЧНОГО ВЫСТРЕЛА</span></div>
    ${UI.dataTable(UI.data.core.ranged.headers, UI.data.core.ranged.rows.map(row => [esc(row.name), ...row.values.map(v => UI.fmt.dvBadge(v))]))}`;
  }

  /* ---------- config ---------- */
  function weaponSlots(w) {
    if (w.slots != null) return w.slots;
    if (w.kind === 'melee') return 0;
    return 2;
  }
  function isExotic(w) { return /экзот/i.test(w.category || ''); }
  function modCompatible(m, w) {
    const text = (m.compatible || '').toLowerCase();
    const cat = (w.category || '').toLowerCase();
    const name = (w.name || '').toLowerCase();
    if (text.includes('экзотическ') && isExotic(w) && !/может устанавливаться на экзотическое|любое экзотическое/.test(text)) return false;
    if (/луки|арбалет/.test(text) && !/лук|арбалет/.test(cat + name)) return false;
    if (/снайперск/.test(text) && !/снайпер|снайп/.test(cat + name)) return false;
    if (/дробовик/.test(text) && !/дробов|дробь/.test(cat + name)) return false;
    if (/пистолет/.test(text) && !/пистолет/.test(cat + name)) return false;
    if (/штурмов/.test(text) && !/штурм|винтовк/.test(cat + name)) return false;
    if (/пп/.test(text) && !/пп|пистолет-пулемет|пистолет-пулемёт/.test(cat + name)) return false;
    if (/гранатомёт|гранатомет/.test(text) && !/гранатом/.test(cat + name)) return false;
    return true;
  }
  function configPanel() {
    const cfg = UI.weaponConfig;
    const w = weaponById(cfg.weaponId) || W.find(x => x.kind !== 'melee') || W[0];
    if (!w) return UI.emptyState('Нет оружия', 'Данные арсенала не загружены.');
    cfg.weaponId = w.id;
    const slots = weaponSlots(w);
    const selected = cfg.mods.map(modById).filter(Boolean);
    const used = selected.reduce((s, m) => s + (m.slots || 0), 0);
    const free = slots - used;
    const total = selected.reduce((s, m) => s + (m.price || 0), 0);
    const available = MODS.filter(m => modCompatible(m, w));
    return `<div class="configurator">
      <div class="config-weapon">
        <div class="cyber-card__cat">Выбранный ствол</div>
        <h4>${esc(w.name)}</h4>
        <div class="small dim">${esc(w.category)} · ${esc(w.skill || '')}</div>
        <div class="rule"></div>
        <dl class="weapon-detail" style="grid-template-columns:1fr">
          <div><dt>Урон</dt><dd>${esc(UI.fmt.damageFmt(w.damage))}</dd></div>
          <div><dt>ROF</dt><dd>${esc(w.rof || '—')}</dd></div>
          <div><dt>Магазин</dt><dd>${esc(w.mag || '—')}</dd></div>
          <div><dt>Слоты</dt><dd>${slots}${w.slots == null ? ' (стандарт)' : ''}</dd></div>
        </dl>
        <div class="config-slots">${Array.from({ length: Math.max(slots, used) }).map((_, i) => `<span class="slot ${i < used ? 'is-filled' : ''}"></span>`).join('')}</div>
        <div class="small dim">Занято ${used} из ${slots} · свободно ${free}</div>
        <div class="rule"></div>
        <label class="field"><span>Сменить оружие</span>
          <select class="select" id="config-weapon-select">
            ${W.map(x => `<option value="${x.id}" ${x.id === w.id ? 'selected' : ''}>${esc(x.name)} · ${esc(x.category)}</option>`).join('')}
          </select>
        </label>
        <div class="small faint" style="margin-top:8px">Если у оружия в источнике не указано число слотов, используется стандарт 2 (для дальней атаки).</div>
      </div>
      <div>
        <div class="toolbar" style="margin-bottom:8px"><span class="dim small">Доступные модификации: ${available.length}</span><span class="dim small" style="margin-left:auto">Совместимость проверяется по типу оружия</span></div>
        <div class="mod-list" id="mod-list">
          ${available.map(m => {
            const on = cfg.mods.includes(m.id);
            const wouldUse = used + (on ? 0 : (m.slots || 0));
            const disabled = !on && wouldUse > slots;
            return `<label class="mod-option ${on ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}" data-mod-option data-id="${m.id}">
              <input type="checkbox" ${on ? 'checked' : ''} ${disabled ? 'disabled' : ''} data-config-mod="${m.id}">
              <span><span class="mod-option__name">${esc(m.name)}</span><span class="mod-option__meta">${UI.slotWord(m.slots)} · ${esc(m.compatible || '')}</span></span>
              <span class="mono small">${m.price == null ? '—' : fmt(m.price) + ' eb'}</span>
            </label>`;
          }).join('') || '<div class="dim small">Нет совместимых модификаций.</div>'}
        </div>
        <div class="config-summary">
          <span class="small dim">Итого:</span> <b>${fmt(total)} eb</b>
          <span class="small dim">Слоты:</span> <b>${used}/${slots}</b>
          <span class="small dim">Модификаций:</span> <b>${selected.length}</b>
          ${free < 0 ? '<span class="config-warn">Превышен лимит слотов!</span>' : ''}
        </div>
        ${selected.length ? `<div class="badge-row" style="margin-top:10px">${selected.map(m => `<span class="tag tag--yellow">${esc(m.name)}</span>`).join('')}</div>` : ''}
        <div class="gen-actions">
          <button class="btn btn--sm" data-action="config-reset">${icon('refresh')} Сбросить</button>
          <button class="btn btn--sm" data-action="config-copy">${icon('note')} Скопировать сборку</button>
        </div>
        <div class="gen-note">Модификации вроде «Смарт Улучшение», «Силовое» и «ЭМИ» требуют переработки оружия и проверки Оружейной техники СЛ 17. Учитывайте это в игре.</div>
      </div>
    </div>`;
  }
  function renderConfig() {
    UI.weaponConfig.weaponId = UI.weaponConfig.weaponId || (W.find(x => x.kind !== 'melee') || W[0] || {}).id;
    return `<div id="config-panel">${configPanel()}</div>`;
  }

  UI.pages.weapons = {
    title: 'Оружие',
    render(r) { return renderWeapons(r); },
    setup(r) {
      const tab = r.query.tab || 'weapons';
      if (tab === 'weapons') setupWeaponFilters();
      else if (tab === 'mods') setupModFilters();
      else if (tab === 'ammo') setupAmmoFilters();
      else if (tab === 'config') setupConfig();
      if (r.query.weapon) {
        UI.weaponConfig.weaponId = r.query.weapon;
        UI.weaponConfig.mods = [];
        if (tab !== 'config') UI.navigate('#/weapons?tab=config&weapon=' + r.query.weapon);
        else { const p = document.getElementById('config-panel'); if (p) { p.innerHTML = configPanel(); setupConfig(); } }
      } else if (r.param) {
        const w = weaponById(r.param);
        if (w) UI.actions['open-weapon']({ dataset: { weapon: w.id } });
      }
    },
  };

  function setupWeaponFilters() {
    const apply = () => {
      const q = UI.fmt.norm($('#w-search').value);
      const cat = $('#w-cat').value;
      const qual = $('#w-quality').value;
      let n = 0;
      $$('[data-weapon-row]').forEach(tr => {
        const ok = (!q || tr.dataset.search.includes(q)) && (!cat || tr.dataset.cat === cat) && (!qual || (tr.dataset.quality || '').includes(qual));
        tr.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      const count = $('#w-count'); if (count) count.textContent = n + ' позиций';
      const foot = $('#weapons-table .table-foot'); if (foot) foot.firstElementChild.textContent = 'Показано: ' + n;
    };
    ['w-search', 'w-cat', 'w-quality'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', apply); });
  }
  function setupModFilters() {
    const el = $('#mod-search'); if (!el) return;
    el.addEventListener('input', () => {
      const q = UI.fmt.norm(el.value); let n = 0;
      $$('[data-mod-row]').forEach(tr => { const ok = !q || tr.dataset.search.includes(q); tr.style.display = ok ? '' : 'none'; if (ok) n++; });
      const c = $('#mod-count'); if (c) c.textContent = n + ' модификаций';
    });
  }
  function setupAmmoFilters() {
    const el = $('#ammo-search'); if (!el) return;
    el.addEventListener('input', () => {
      const q = UI.fmt.norm(el.value); let n = 0;
      $$('[data-ammo-row]').forEach(tr => { const ok = !q || tr.dataset.search.includes(q); tr.style.display = ok ? '' : 'none'; if (ok) n++; });
      const c = $('#ammo-count'); if (c) c.textContent = n + ' позиций';
    });
  }
  function setupConfig() {
    const sel = $('#config-weapon-select');
    if (sel) sel.addEventListener('change', () => {
      UI.weaponConfig.weaponId = sel.value;
      UI.weaponConfig.mods = [];
      const p = $('#config-panel'); if (p) { p.innerHTML = configPanel(); setupConfig(); }
    });
    $$('[data-config-mod]').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.configMod;
        UI.weaponConfig.mods = cb.checked
          ? UI.weaponConfig.mods.concat([id]).filter((v, i, a) => a.indexOf(v) === i)
          : UI.weaponConfig.mods.filter(x => x !== id);
        const p = $('#config-panel'); if (p) { p.innerHTML = configPanel(); setupConfig(); }
      });
    });
  }
  UI.actions['config-reset'] = () => { UI.weaponConfig.mods = []; const p = $('#config-panel'); if (p) { p.innerHTML = configPanel(); setupConfig(); toast('Конфигурация сброшена'); } };
  UI.actions['config-copy'] = () => {
    const w = weaponById(UI.weaponConfig.weaponId);
    if (!w) return;
    const mods = UI.weaponConfig.mods.map(modById).filter(Boolean);
    const text = `${w.name} (${w.category})\nУрон: ${w.damage || '—'} · ROF: ${w.rof || '—'} · Маг: ${w.mag || '—'}\nМодификации: ${mods.map(m => m.name).join(', ') || 'нет'}\nСтоимость модификаций: ${fmt(mods.reduce((s, m) => s + (m.price || 0), 0))} eb`;
    copyText(text).then(() => toast('Сборка скопирована')).catch(() => toast('Не удалось скопировать'));
  };
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise((res, rej) => { try { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); res(); } catch (e) { rej(e); } });
  }
  UI.copyText = copyText;

  function priceTag(n, label) {
    let l = label || '';
    if (n != null) l = money(n);
    else if (l.length > 22) l = l.slice(0, 20) + '…';
    if (n == null) return `<span class="tag">${esc(l || '—')}</span>`;
    return `<span class="tag ${n >= 5000 ? 'tag--red' : n >= 1000 ? 'tag--orange' : n >= 500 ? 'tag--yellow' : 'tag--green'}">${esc(l)}</span>`;
  }

  /* ---------- detail modals ---------- */
  UI.actions['open-weapon'] = (el) => {
    const w = weaponById(el.dataset.weapon || el.dataset.id);
    if (!w) return;
    openModal(modalShell({
      title: w.name,
      sub: `${w.category} · ${w.source || ''}`,
      wide: true,
      body: `<div class="article__body">
        <div class="grid grid--2">
          <dl class="weapon-detail">
            <div><dt>Навык</dt><dd>${esc(w.skill || '—')}</dd></div>
            <div><dt>Урон</dt><dd>${esc(UI.fmt.damageFmt(w.damage))}</dd></div>
            <div><dt>ROF</dt><dd>${esc(w.rof || '—')}</dd></div>
            <div><dt>Магазин</dt><dd>${esc(w.mag || '—')}</dd></div>
          </dl>
          <dl class="weapon-detail">
            <div><dt>Руки</dt><dd>${esc(w.hands || '—')}</dd></div>
            <div><dt>Скрыть</dt><dd>${esc(w.conceal || '—')}</dd></div>
            <div><dt>Слоты</dt><dd>${w.slots == null ? '—' : w.slots}</dd></div>
            <div><dt>Цена</dt><dd>${priceTag(w.price, w.priceLabel)}</dd></div>
          </dl>
        </div>
        ${w.quality ? `<p><span class="tag tag--yellow">${esc(w.quality)}</span></p>` : ''}
        ${w.special ? `<h3>Особенности</h3><p>${esc(w.special)}</p>` : ''}
        <h3>Описание</h3><p>${esc(w.desc || '—')}</p>
        ${w.source ? `<p class="dim small">Источник: ${esc(w.source)}</p>` : ''}
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><button class="btn btn--yellow" data-action="config-weapon" data-id="${w.id}">${icon('terminal')} В конструктор</button>`,
    }));
  };
  UI.actions['config-weapon'] = (el) => {
    UI.weaponConfig.weaponId = el.dataset.id;
    UI.weaponConfig.mods = [];
    UI.closeModal();
    UI.navigate('#/weapons?tab=config&weapon=' + el.dataset.id);
  };
  UI.actions['open-mod'] = (el) => {
    const m = modById(el.dataset.mod);
    if (!m) return;
    openModal(modalShell({
      title: m.name,
      sub: `${m.slots} слот(а) · ${m.source || ''}`,
      body: `<div class="article__body">
        <p><b>Совместимость:</b> ${esc(m.compatible || '—')}</p>
        <p>${esc(m.desc || '—')}</p>
        ${m.requiresTech ? `<div class="callout callout--yellow">Установка требует проверки Оружейной техники СЛ 17. После установки некоторые модификации нельзя снять.</div>` : ''}
        <p class="dim small">Цена: ${esc(m.priceLabel || '—')}</p>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button>`,
    }));
  };

  /* ============================================================
     RIPPERDOC
     ============================================================ */
  const CYBER = data.cyberware || [];
  const CLINICS = {
    mall: { label: 'Молл', dv: 13, cost: 100 },
    clinic: { label: 'Клиника', dv: 15, cost: 500 },
    hospital: { label: 'Госпиталь', dv: 17, cost: 1000 },
  };
  function cyberById(id) { return CYBER.find(c => c.id === id); }
  function clinic() { return CLINICS[state.clinic] || CLINICS.clinic; }
  function cartItems() { return (state.cart || []).map(cyberById).filter(Boolean); }
  function itemDV(c) { return c.place === '—' ? 0 : Math.max(clinic().dv, c.surgeryDV || 0); }
  function itemInstall(c) { return c.place === '—' ? 0 : Math.max(clinic().cost, c.installCost || 0); }

  function reqTags(c) {
    const tags = [];
    (c.requires || []).forEach(r => tags.push(`<span class="tag tag--cyan">${esc(r)}</span>`));
    if (c.body) tags.push(`<span class="tag tag--orange">ТЕЛ ${c.body}+</span>`);
    if (c.slots) tags.push(`<span class="tag">${c.slots} слот</span>`);
    if (c.capacity) tags.push(`<span class="tag">${c.capacity} слотов</span>`);
    return tags.join(' ');
  }

  function renderRipperdoc(r) {
    const cats = Array.from(new Set(CYBER.map(c => c.category))).sort((a, b) => a.localeCompare(b, 'ru'));
    return `<div class="page">
      ${pageHead('ПОХОД К РИПЕРДОКУ', 'Рипердок', 'Импланты, требования, потеря человечности и хирургия. Соберите корзину — калькулятор посчитает цену, ПЧ и СЛ.', `
        <button class="btn" data-action="print">${icon('print')} Печать</button>
      `)}
      <div class="grid grid--2" style="margin-bottom:16px">
        <div class="panel">
          <div class="panel-head"><h3>Где ставим</h3><span class="tiny dim">СЛ ХИРУРГИИ</span></div>
          <div class="panel-body">
            <div class="clinic-switch">
              ${Object.entries(CLINICS).map(([id, c]) => `<button class="${state.clinic === id ? 'is-active' : ''}" data-action="set-clinic" data-clinic="${id}">${esc(c.label)} · СЛ ${c.dv} · ${fmt(c.cost)} eb</button>`).join('')}
            </div>
            <div class="small dim" style="margin-top:8px">СЛ и стоимость установки — из таблицы «Установка имплантов». Для щепок и данных установка не требуется.</div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Человечность</h3><span class="tiny dim">ПЧ</span></div>
          <div class="panel-body">
            <div class="humanity-input">
              <span class="small dim">Текущая ЭМП/человечность:</span>
              <input class="input" type="number" id="humanity-base" min="0" max="100" value="${state.humanity}">
            </div>
            <div class="humanity-bar"><span id="humanity-bar-fill" style="width:${Math.min(100, state.humanity)}%"></span></div>
            <div class="small dim" style="margin-top:6px">Каждый имплант снижает максимум человечности. Терапия возвращает 2d6 (стандарт) или 4d6 (экстрим) за неделю.</div>
          </div>
        </div>
      </div>
      <div class="ripper-layout">
        <div>
          <div class="toolbar">
            <div class="input-group">${icon('search')}<input class="input" id="c-search" placeholder="Имплант, эффект, требование…" autocomplete="off"></div>
            <select class="select" id="c-cat"><option value="">Все категории</option>${cats.map(c => `<option>${esc(c)}</option>`).join('')}</select>
            <select class="select" id="c-place"><option value="">Любое место</option><option>Молл</option><option>Клиника</option><option>Госпиталь</option><option>—</option></select>
            <select class="select" id="c-tag"><option value="">Любой тег</option><option>Бой</option><option>Защита</option><option>Скрытность</option><option>Восприятие</option><option>Социалка</option><option>Нетраннинг</option><option>Мобильность</option></select>
            <span class="dim small" id="c-count">${CYBER.length} имплантов</span>
          </div>
          <div id="cyber-table">
            ${dataTable(['Имплант', 'ПЧ', 'Цена', 'Требования', ''], CYBER.map(c => {
              const search = [c.name, c.category, c.desc, c.requires.join(' '), c.tags.join(' '), c.source].join(' ').toLowerCase();
              const inCart = (state.cart || []).includes(c.id);
              return `<tr class="${inCart ? 'is-selected' : ''}" data-cyber-row data-id="${c.id}" data-cat="${attr(c.category)}" data-place="${attr(c.place)}" data-tags="${attr(c.tags.join(' '))}" data-search="${attr(search)}">
                <td><div class="weapon-name"><strong>${esc(c.name)}</strong><span>${esc(c.source || '')} · ${esc(c.category)} · ${esc(c.place)}</span></div></td>
                <td class="num ${c.humanity > 7 ? 'red' : c.humanity > 0 ? 'yellow' : 'dim'}">${c.humanity}</td>
                <td class="num price-cell">${priceTag(c.price, c.priceLabel)}</td>
                <td><div class="req-list">${reqTags(c) || '<span class="tag">—</span>'}</div></td>
                <td class="num"><button class="btn btn--sm ${inCart ? 'btn--yellow' : ''}" data-action="toggle-cart" data-id="${c.id}">${inCart ? '✓' : '+'}</button></td>
              </tr>`;
            }), { wrapClass: 'table-wrap--tall', foot: `<span>Показано: ${CYBER.length}</span><span>Клик по названию — описание</span>` })}
          </div>
        </div>
        <div class="cart" id="cart-panel">${cartHTML()}</div>
      </div>
      <div class="section-head" style="margin-top:26px"><h2>Требования и установка</h2><span class="dim">МЕДТЕХ / ХИРУРГИЯ</span></div>
      <div class="grid grid--2">
        <div class="panel">
          <div class="panel-head"><h3>СЛ хирургии по месту</h3></div>
          <div class="panel-body" style="padding:10px">
            ${dataTable(['Место', 'СЛ', 'Стоимость'], Object.values(CLINICS).map(c => [`<b>${esc(c.label)}</b>`, c.dv, fmt(c.cost) + ' eb']), { wrapClass: 'quick-table' })}
            <div class="small dim" style="margin-top:8px">Установку выполняет Медтех с навыком «Хирургия». Провал может привести к осложнениям — на усмотрение Рефери.</div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Что проверить перед установкой</h3></div>
          <div class="panel-body small">
            <p><b>Родительский имплант:</b> нейролинк, киберглаз, киберрука, комплект аудио и т.д.</p>
            <p><b>Слоты:</b> модули занимают слоты родительского импланта. Суммируйте их.</p>
            <p><b>ТЕЛ:</b> некоторые импланты требуют минимальное телосложение.</p>
            <p><b>ПЧ:</b> потеря человечности не возвращается полностью; максимум снижается на 2 за каждый имплант (4 за боргирование).</p>
            <p><b>Терапия:</b> 2d6 за 500 eb (стандарт) или 4d6 за 1 000 eb (экстрим) за неделю.</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  function cartHTML() {
    const items = cartItems();
    const price = items.reduce((s, c) => s + (c.price || 0), 0);
    const install = items.reduce((s, c) => s + itemInstall(c), 0);
    const hl = items.reduce((s, c) => s + (c.humanity || 0), 0);
    const maxDV = items.reduce((s, c) => Math.max(s, itemDV(c)), 0);
    const humanity = Number(state.humanity) || 0;
    const remain = humanity - hl;
    const sessions = Math.ceil(hl / 7);
    const allReq = [];
    items.forEach(c => (c.requires || []).forEach(r => { if (!allReq.some(x => x.name === r)) allReq.push({ name: r, from: c.name }); }));
    const missing = allReq.filter(r => !items.some(c => c.name === r.name));
    const bodyReq = items.reduce((m, c) => Math.max(m, c.body || 0), 0);
    return `<div class="cart__head"><h3>${icon('chip')} Установка</h3><span class="mono small">${items.length} шт.</span></div>
      <div class="cart__body">
        <div class="cart__items">
          ${items.length ? items.map(c => `<div class="cart-item"><div><div class="cart-item__name">${esc(c.name)}</div><div class="cart-item__meta">${esc(c.category)} · ПЧ ${c.humanity} · ${esc(c.place)}</div></div><button data-action="toggle-cart" data-id="${c.id}" aria-label="Убрать">✕</button></div>`).join('') : '<div class="dim small">Корзина пуста. Добавьте импланты из каталога.</div>'}
        </div>
        <div class="cart__totals">
          <div><span>Импланты</span><b>${fmt(price)} eb</b></div>
          <div><span>Установка · за имплант</span><b>${fmt(install)} eb</b></div>
          ${items.length > 1 ? `<div><span>Если Медтех берёт за визит</span><b>${fmt(Math.max(...items.map(itemInstall)))} eb</b></div>` : ''}
          <div><span>Итого</span><b>${fmt(price + install)} eb</b></div>
          <div><span>Потеря человечности</span><b class="${hl > 7 ? 'red' : ''}">${hl}</b></div>
          <div><span>СЛ хирургии</span><b>${maxDV || '—'}</b></div>
          <div><span>Остаток человечности</span><b class="${remain < 0 ? 'red' : remain < 10 ? 'yellow' : 'green'}">${remain}</b></div>
        </div>
        ${bodyReq ? `<div class="cart__warn">Требуется ТЕЛ ${bodyReq}+. Проверьте лист персонажа.</div>` : ''}
        ${missing.length ? `<div class="cart__warn">Не хватает родительских имплантов: ${missing.map(m => esc(m.name)).join(', ')}. Добавьте их в корзину или отметьте как уже установленные.</div>` : ''}
        ${remain < 0 ? `<div class="cart__warn cart__warn--red">ПЧ превышает человечность. Это прямой путь к киберпсихозу — Рефери должен вмешаться.</div>` : remain < 10 ? `<div class="cart__warn">Человечность ниже 10. Персонаж на грани.</div>` : ''}
        ${items.length > 1 ? `<div class="small dim" style="margin-top:8px">Установка в книге указана за каждый имплант. Если ваш Медтех берёт за визит — используйте строку «Если за визит».</div>` : ''}${hl > 0 ? `<div class="small dim" style="margin-top:8px">Терапия: примерно ${sessions} недел(я/и) стандартной (2d6) или ${Math.max(1, Math.ceil(hl / 14))} экстремальной (4d6).</div>` : ''}
        <div class="gen-actions">
          <button class="btn btn--sm" data-action="clear-cart">${icon('trash')} Очистить</button>
          <button class="btn btn--sm" data-action="print">${icon('print')} Печать</button>
        </div>
      </div>`;
  }

  function updateCart() {
    const panel = document.getElementById('cart-panel');
    if (panel) panel.innerHTML = cartHTML();
    $$('[data-cyber-row]').forEach(tr => {
      const id = tr.dataset.id;
      const inCart = (state.cart || []).includes(id);
      tr.classList.toggle('is-selected', inCart);
      const btn = tr.querySelector('[data-action="toggle-cart"]');
      if (btn) { btn.textContent = inCart ? '✓' : '+'; btn.classList.toggle('btn--yellow', inCart); }
    });
    const base = document.getElementById('humanity-base');
    const bar = document.getElementById('humanity-bar-fill');
    if (base && bar) bar.style.width = Math.min(100, Number(base.value) || 0) + '%';
  }

  UI.actions['toggle-cart'] = (el) => {
    const id = el.dataset.id;
    if (!id) return;
    const arr = state.cart || [];
    state.cart = arr.includes(id) ? arr.filter(x => x !== id) : arr.concat([id]);
    saveState();
    updateCart();
    const c = cyberById(id);
    if (c) toast((state.cart.includes(id) ? 'Добавлено: ' : 'Убрано: ') + c.name);
  };
  UI.actions['clear-cart'] = () => { state.cart = []; saveState(); updateCart(); toast('Корзина очищена'); };
  UI.actions['set-clinic'] = (el) => {
    state.clinic = el.dataset.clinic;
    saveState();
    UI.render();
  };

  UI.actions['open-cyber'] = (el) => {
    const c = cyberById(el.dataset.cyber || el.dataset.id);
    if (!c) return;
    const inCart = (state.cart || []).includes(c.id);
    openModal(modalShell({
      title: c.name,
      sub: `${c.category} · ${c.source || ''}`,
      wide: true,
      body: `<div class="article__body">
        <div class="grid grid--2">
          <dl class="weapon-detail">
            <div><dt>Место установки</dt><dd>${esc(c.place)}</dd></div>
            <div><dt>СЛ хирургии</dt><dd>${itemDV(c) || '—'}</dd></div>
            <div><dt>Стоимость установки</dt><dd>${fmt(itemInstall(c))} eb</dd></div>
            <div><dt>Потеря человечности</dt><dd>${esc(c.humanityLabel || c.humanity)}</dd></div>
          </dl>
          <dl class="weapon-detail">
            <div><dt>Цена</dt><dd>${esc(c.priceLabel || money(c.price))}</dd></div>
            <div><dt>Слоты</dt><dd>${c.slots || 0}</dd></div>
            <div><dt>Ёмкость</dt><dd>${c.capacity || '—'}</dd></div>
            <div><dt>Требования</dt><dd>${esc((c.requires || []).join(', ') || '—')}</dd></div>
          </dl>
        </div>
        ${c.body ? `<p><span class="tag tag--orange">Требуется ТЕЛ ${c.body}+</span></p>` : ''}
        <h3>Описание</h3>
        <p>${esc(c.desc || '—')}</p>
        <div class="badge-row">${(c.tags || []).map(t => `<span class="tag tag--cyan">${esc(t)}</span>`).join('')}</div>
        <p class="dim small" style="margin-top:10px">Источник: ${esc(c.source || 'КорБук')}</p>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><button class="btn ${inCart ? '' : 'btn--yellow'}" data-action="toggle-cart" data-id="${c.id}">${inCart ? 'Убрать из корзины' : 'Добавить в корзину'}</button>`,
    }));
  };

  UI.pages.ripperdoc = {
    title: 'Рипердок',
    render(r) { return renderRipperdoc(r); },
    setup(r) {
      const apply = () => {
        const q = UI.fmt.norm($('#c-search').value);
        const cat = $('#c-cat').value;
        const place = $('#c-place').value;
        const tag = $('#c-tag').value;
        let n = 0;
        $$('[data-cyber-row]').forEach(tr => {
          const tags = (tr.dataset.tags || '').toLowerCase();
          const ok = (!q || tr.dataset.search.includes(q)) && (!cat || tr.dataset.cat === cat) && (!place || tr.dataset.place === place) && (!tag || tags.includes(tag.toLowerCase()));
          tr.style.display = ok ? '' : 'none';
          if (ok) n++;
        });
        const c = $('#c-count'); if (c) c.textContent = n + ' имплантов';
        const foot = $('#cyber-table .table-foot'); if (foot) foot.firstElementChild.textContent = 'Показано: ' + n;
      };
      ['c-search', 'c-cat', 'c-place', 'c-tag'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', apply); });
      const base = document.getElementById('humanity-base');
      if (base) base.addEventListener('input', () => { state.humanity = Number(base.value) || 0; saveState(); updateCart(); });
      $$('[data-cyber-row]').forEach(tr => {
        tr.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          const c = cyberById(tr.dataset.id);
          if (c) UI.actions['open-cyber']({ dataset: { cyber: c.id } });
        });
      });
      if (r.param) {
        const c = cyberById(r.param);
        if (c) UI.actions['open-cyber']({ dataset: { cyber: c.id } });
      }
    },
  };
})();
