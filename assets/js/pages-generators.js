/* ============================================================
   Generators: jobs, investigations, encounters, gigs, net, loot, mooks, beats
   ============================================================ */
(function () {
  'use strict';
  const UI = window.CPR_UI;
  if (!UI) return;
  const { esc, attr, fmt, money, icon, dataTable, pageHead, sectionHead, openModal, modalShell, toast, saveState, state, data, $, $$ } = UI;

  const AD = data.adventure || {};
  const GEN = data.generators || {};
  const ENCOUNTERS = GEN.encounters || [];
  const GIGS = GEN.gigs || [];

  const TABS = [
    ['job', 'Работа', 'spark'],
    ['investigation', 'Расследование', 'eye'],
    ['encounters', 'Встречи', 'map'],
    ['gigs', 'Халтурки', 'users'],
    ['net', 'Сеть', 'net'],
    ['loot', 'Добыча', 'box'],
    ['mook', 'Шестёрка', 'shield'],
    ['beats', 'Ритм', 'clock'],
  ];

  const STANDARD = ['job', 'investigation', 'net', 'loot', 'mook', 'beats'];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function entryId(cat, e, i) { return e.id || (e.custom ? e.id : 'b-' + cat.id + '-' + i); }
  function isDisabled(genId, cat, id) {
    const b = UI.genBucket(genId, cat.id);
    return b.disabled.includes(id);
  }
  function entriesFor(genId, cat) {
    const b = UI.genBucket(genId, cat.id);
    const base = (cat.entries || []).map((e, i) => Object.assign({}, e, { _id: 'b-' + cat.id + '-' + i, _base: true }));
    const custom = (b.custom || []).map(e => Object.assign({}, e, { _id: e.id, _custom: true }));
    const all = base.concat(custom);
    return all.filter(e => !b.disabled.includes(e._id));
  }
  function allEntries(genId, cat) {
    const b = UI.genBucket(genId, cat.id);
    return (cat.entries || []).map((e, i) => Object.assign({}, e, { _id: 'b-' + cat.id + '-' + i, _base: true }))
      .concat((b.custom || []).map(e => Object.assign({}, e, { _id: e.id, _custom: true })));
  }

  /* ============================================================
     PAGE
     ============================================================ */
  UI.pages.generators = {
    title: 'Генераторы',
    render(r) {
      const tab = r.query.tab || 'job';
      return `<div class="page">
        ${pageHead('ГЕНЕРАТОРЫ', 'Брось и играй', 'Работы, расследования, городские встречи, халтурки, архитектура СЕТИ, добыча и NPC. Таблицы можно раскрыть, отключить лишнее и дополнить своими вариантами.', `
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
          <button class="btn" data-action="print">${icon('print')} Печать</button>
        `)}
        <div class="gen-tabs">${TABS.map(([id, label, ic]) => `<a class="gen-tab ${tab === id ? 'is-active' : ''}" href="#/generators?tab=${id}" data-route="#/generators?tab=${id}">${icon(ic)} ${label}</a>`).join('')}</div>
        ${tab === 'encounters' ? renderEncounters() : tab === 'gigs' ? renderGigs() : renderStandard(tab)}
      </div>`;
    },
    setup(r) {
      const tab = r.query.tab || 'job';
      if (tab === 'encounters') setupEncounters();
      else if (tab === 'gigs') setupGigs();
      else setupStandard(tab);
    },
  };

  /* ============================================================
     STANDARD GENERATORS
     ============================================================ */
  function rollAll(genId) {
    const gen = AD[genId];
    if (!gen) return {};
    const out = {};
    gen.categories.forEach(cat => {
      const list = entriesFor(genId, cat);
      if (list.length) out[cat.id] = pick(list);
    });
    return out;
  }
  function ensureLast(genId) {
    state.last = state.last || {};
    if (!state.last[genId]) state.last[genId] = rollAll(genId);
    return state.last[genId];
  }
  function resultHTML(entry) {
    if (!entry) return `<span class="is-empty">—</span>`;
    return `<span>${esc(entry.text)}</span>${entry.pay != null ? `<div class="mono yellow" style="margin-top:3px">${money(entry.pay)}</div>` : ''}`;
  }
  function summaryHTML(genId) {
    const gen = AD[genId];
    const last = state.last[genId] || {};
    return gen.categories.map(cat => {
      const e = last[cat.id];
      if (!e) return '';
      const wide = ['hook', 'twist', 'complication', 'clue', 'motive', 'culprit'].includes(cat.id) ? 'gen-output__block--wide' : '';
      return `<div class="gen-output__block ${wide}"><dt>${esc(cat.title)}</dt><dd>${esc(e.text)}${e.pay != null ? `<br><span class="yellow mono">${money(e.pay)}</span>` : ''}</dd></div>`;
    }).join('');
  }
  function tableRows(genId, cat) {
    const all = allEntries(genId, cat);
    if (!all.length) return `<div class="dim small" style="padding:8px">Нет вариантов.</div>`;
    return all.map((e, i) => {
      const id = e._id;
      const on = !isDisabled(genId, cat, id);
      return `<label class="gen-row">
        <input type="checkbox" ${on ? 'checked' : ''} data-gen-toggle data-gen="${genId}" data-cat="${cat.id}" data-id="${attr(id)}">
        <span class="gen-row__text">${esc(e.text)}<span class="gen-row__src">${esc(e.source || (e._custom ? 'Мои' : 'КорБук'))}</span></span>
        ${e._custom ? `<button class="gen-row__del" data-action="gen-del" data-gen="${genId}" data-cat="${cat.id}" data-id="${attr(e.id)}" aria-label="Удалить">✕</button>` : '<span></span>'}
      </label>`;
    }).join('');
  }
  function renderStandard(genId) {
    const gen = AD[genId];
    if (!gen) return `<div class="empty">Генератор не найден.</div>`;
    const last = ensureLast(genId);
    return `<div class="gen-layout">
      <div class="gen-controls">
        ${gen.categories.map(cat => `
          <div class="gen-control" data-gen-control data-cat="${cat.id}">
            <div class="gen-control__head"><h4>${esc(cat.title)}</h4><span class="die">${esc(cat.die || 'd12')}</span></div>
            <div class="gen-control__body">
              <div class="gen-result" id="gen-result-${genId}-${cat.id}">${resultHTML(last[cat.id])}</div>
              <div class="gen-roll"><button class="btn btn--sm" data-action="gen-roll" data-gen="${genId}" data-cat="${cat.id}">${icon('dice')} Бросить</button></div>
              <details class="gen-table">
                <summary>Показать таблицу · ${allEntries(genId, cat).length}</summary>
                <div class="gen-table__body">${tableRows(genId, cat)}</div>
                <form class="gen-add" data-gen-add data-gen="${genId}" data-cat="${cat.id}">
                  <input class="input" name="text" placeholder="Свой вариант…" autocomplete="off">
                  ${cat.type === 'pay' ? `<input class="input" name="pay" type="number" placeholder="eb" style="max-width:90px">` : ''}
                  <button class="btn btn--sm" type="button" data-action="gen-add">${icon('plus')}</button>
                </form>
              </details>
            </div>
          </div>`).join('')}
      </div>
      <div>
        <div class="gen-output" id="gen-output-${genId}">
          <div class="gen-output__head">
            <h3>${esc(gen.title)}</h3>
            <div class="badge-row">
              <button class="btn btn--sm" data-action="gen-roll-all" data-gen="${genId}">${icon('refresh')} Всё</button>
              <button class="btn btn--sm" data-action="gen-reset" data-gen="${genId}">${icon('trash')} Сброс</button>
            </div>
          </div>
          <p class="small dim">${esc(gen.subtitle || '')}</p>
          <div class="gen-output__grid" id="gen-summary-${genId}">${summaryHTML(genId)}</div>
          <div class="gen-actions">
            <button class="btn btn--yellow btn--sm" data-action="gen-roll-all" data-gen="${genId}">${icon('spark')} Сгенерировать всё</button>
            <button class="btn btn--sm" data-action="print">${icon('print')} Печать</button>
          </div>
          <div class="gen-note">Чекбоксы в раскрытых таблицах отключают варианты. Свои варианты сохраняются в браузере и попадают в генерацию.</div>
        </div>
      </div>
    </div>`;
  }
  function updateStandard(genId) {
    const gen = AD[genId];
    if (!gen) return;
    gen.categories.forEach(cat => {
      const el = document.getElementById('gen-result-' + genId + '-' + cat.id);
      if (el) el.innerHTML = resultHTML((state.last[genId] || {})[cat.id]);
    });
    const sum = document.getElementById('gen-summary-' + genId);
    if (sum) sum.innerHTML = summaryHTML(genId);
  }
  UI.actions['gen-roll'] = (el) => {
    const genId = el.dataset.gen, catId = el.dataset.cat;
    const gen = AD[genId];
    if (!gen) return;
    const cat = gen.categories.find(c => c.id === catId);
    if (!cat) return;
    const list = entriesFor(genId, cat);
    state.last[genId] = state.last[genId] || {};
    if (list.length) state.last[genId][catId] = pick(list);
    saveState();
    updateStandard(genId);
  };
  UI.actions['gen-roll-all'] = (el) => {
    const genId = el.dataset.gen;
    state.last[genId] = rollAll(genId);
    saveState();
    updateStandard(genId);
    toast('Переброшено');
  };
  UI.actions['gen-reset'] = (el) => {
    const genId = el.dataset.gen;
    if (!confirm('Сбросить свои варианты и отключённые пункты для этого генератора?')) return;
    state.gen[genId] = {};
    state.last[genId] = rollAll(genId);
    saveState();
    UI.render();
    toast('Сброшено');
  };
  UI.actions['gen-del'] = (el) => {
    const { gen, cat, id } = el.dataset;
    const b = UI.genBucket(gen, cat);
    b.custom = (b.custom || []).filter(x => x.id !== id);
    b.disabled = (b.disabled || []).filter(x => x !== id);
    saveState();
    UI.render();
  };
  UI.actions['gen-add'] = (el) => {
    const form = el.closest('form');
    if (!form) return;
    const genId = form.dataset.gen, catId = form.dataset.cat;
    const text = form.querySelector('[name="text"]').value.trim();
    if (!text) { toast('Введите текст'); return; }
    const b = UI.genBucket(genId, catId);
    const entry = { id: 'c-' + UI.uid(), text, source: 'Мои' };
    const payEl = form.querySelector('[name="pay"]');
    if (payEl && payEl.value) entry.pay = Number(payEl.value) || 0;
    b.custom.push(entry);
    saveState();
    UI.render();
    toast('Вариант добавлен');
  };
  function setupStandard(genId) {
    document.querySelectorAll('[data-gen-toggle]').forEach(cb => {
      cb.addEventListener('change', () => {
        const { gen, cat, id } = cb.dataset;
        const b = UI.genBucket(gen, cat);
        if (cb.checked) b.disabled = b.disabled.filter(x => x !== id);
        else if (!b.disabled.includes(id)) b.disabled.push(id);
        saveState();
      });
    });
  }

  /* ============================================================
     ENCOUNTERS
     ============================================================ */
  const ZONES = [
    ['moderate', 'Умеренный', '1–100', 'Обычные улицы, смешанные районы'],
    ['corporate', 'Корпоративный', '1–50', 'Охрана, корпораты, патрули'],
    ['admin', 'Административный', '1–50', 'Только корпоративные и элитные'],
    ['combat', 'Боевая зона', '51–100', 'Банды, нищета, насилие'],
  ];
  function encounterKey(e, i) { return e.id || ('e-' + i + '-' + (e.min || 0) + '-' + (e.max || 0)); }
  function encounterEntries() {
    const time = state.encTime || 'День';
    const table = ENCOUNTERS.find(x => x.label === time) || ENCOUNTERS[0];
    if (!table) return [];
    const b = UI.genBucket('encounters', time);
    const base = (table.entries || []).map((e, i) => Object.assign({}, e, { _id: encounterKey(e, i), _base: true }));
    const custom = (b.custom || []).map(e => Object.assign({}, e, { _id: e.id, _custom: true }));
    return base.concat(custom);
  }
  function pickEncounter() {
    const zone = state.encZone || 'moderate';
    const time = state.encTime || 'День';
    const b = UI.genBucket('encounters', time);
    let list = encounterEntries();
    if (!list.length) return null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const roll = zone === 'moderate' ? (1 + Math.floor(Math.random() * 100))
        : zone === 'combat' ? (51 + Math.floor(Math.random() * 50))
          : (1 + Math.floor(Math.random() * 50));
      let hit = list.find(e => e.min != null && e.max != null && roll >= e.min && roll <= e.max);
      if (!hit) hit = list[Math.floor(Math.random() * list.length)];
      const id = hit._id;
      if (!b.disabled.includes(id)) return Object.assign({ roll }, hit);
    }
    return Object.assign({ roll: null }, list[0]);
  }
  function encounterCard(e) {
    if (!e) return `<div class="dim small">Нет данных.</div>`;
    return `<div class="encounter-card">
      <h4>${esc(e.name || 'Встреча')} <span>${e.roll != null ? 'd100 = ' + e.roll : ''}</span></h4>
      <p>${esc(e.desc || '')}</p>
      ${e.units ? `<div class="units"><b>Юниты:</b> ${esc(e.units)}</div>` : ''}
      ${e.behavior ? `<div class="units"><b>Поведение:</b> ${esc(e.behavior)}</div>` : ''}
    </div>`;
  }
  function renderEncounters() {
    const time = state.encTime || 'День';
    const zone = state.encZone || 'moderate';
    const last = state.last.encounters || [];
    const list = encounterEntries();
    const b = UI.genBucket('encounters', time);
    return `<div class="grid grid--sidebar">
      <div>
        <div class="panel" style="margin-bottom:14px">
          <div class="panel-head"><h3>Встречи в Красное время</h3><span class="tiny dim">d100</span></div>
          <div class="panel-body">
            <div class="gig-role-tabs">
              ${ENCOUNTERS.map(x => `<button class="gig-role ${time === x.label ? 'is-active' : ''}" data-action="enc-time" data-time="${attr(x.label)}">${esc(x.label)}</button>`).join('')}
            </div>
            <div class="toolbar" style="margin:10px 0 0">
              <select class="select" id="enc-zone">
                ${ZONES.map(([id, label, range, desc]) => `<option value="${id}" ${zone === id ? 'selected' : ''}>${esc(label)} (${range})</option>`).join('')}
              </select>
              <button class="btn btn--yellow" data-action="enc-roll">${icon('dice')} Бросить встречу</button>
              <button class="btn" data-action="enc-roll3">${icon('dice')} 3 встречи</button>
              <button class="btn" data-action="enc-add-open">${icon('plus')} Своя</button>
            </div>
            <div class="small dim" style="margin-top:8px">${esc((ZONES.find(z => z[0] === zone) || ZONES[0])[3])}. В корпоративных и административных зонах высокие результаты — это проблемы; в боевых — наоборот.</div>
          </div>
        </div>
        <div class="gen-output" style="position:static">
          <div class="gen-output__head"><h3>Результат</h3><button class="btn btn--sm" data-action="print">${icon('print')} Печать</button></div>
          <div id="enc-output" class="encounter-output">
            ${last.length ? last.map(encounterCard).join('') : `<div class="gen-output__empty">Бросьте встречу, чтобы увидеть, кого занесло на ваш путь.</div>`}
          </div>
        </div>
        <div class="section-head" style="margin-top:22px"><h2>Таблица · ${esc(time)}</h2><span class="dim">${list.length} вариантов</span></div>
        <div class="table-wrap table-wrap--tall">
          <table class="data">
            <thead><tr><th>d100</th><th>Вкл.</th><th>Кто</th><th>Описание</th><th>Юниты</th><th></th></tr></thead>
            <tbody>
              ${list.map((e, i) => {
                const id = e._id;
                const on = !b.disabled.includes(id);
                return `<tr>
                  <td class="num">${e.min != null ? e.min + '–' + e.max : '—'}</td>
                  <td><input type="checkbox" ${on ? 'checked' : ''} data-enc-toggle data-id="${attr(id)}"></td>
                  <td><b>${esc(e.name || '—')}</b>${e._custom ? '<div class="tag tag--yellow" style="margin-top:2px">Мои</div>' : ''}</td>
                  <td><span class="small">${esc((e.desc || '').slice(0, 150))}${(e.desc || '').length > 150 ? '…' : ''}</span></td>
                  <td><span class="small dim">${esc((e.units || '').slice(0, 90))}</span></td>
                  <td>${e._custom ? `<button class="gen-row__del" data-action="enc-del" data-id="${attr(e.id)}" aria-label="Удалить">✕</button>` : ''}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="grid" style="gap:12px">
        <div class="panel">
          <div class="panel-head"><h3>Как это работает</h3></div>
          <div class="panel-body small">
            <p>Бросьте d100 и найдите результат в таблице выбранного времени суток. Диапазоны и описания адаптированы из главы «Встречи в Красное время».</p>
            <p>Для корпоративных и административных зон используется верхняя половина (1–50), для боевых — нижняя (51–100). Это отражает состав улиц.</p>
            <p>Отключайте варианты чекбоксами, если они не подходят тону игры. Свои встречи добавляются с диапазоном.</p>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Быстрые заметки</h3></div>
          <div class="panel-body">
            <div class="callout callout--yellow small">Встреча — это не всегда бой. Используйте её как повод для ролевой сцены, слуха или осложнения.</div>
            <div class="gen-actions">
              <button class="btn btn--sm" data-action="enc-add-open">${icon('plus')} Добавить встречу</button>
              <button class="btn btn--sm" data-action="enc-reset">${icon('trash')} Сброс</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function renderEncounterOutput() {
    const el = document.getElementById('enc-output');
    if (!el) return;
    const last = state.last.encounters || [];
    el.innerHTML = last.length ? last.map(encounterCard).join('') : `<div class="gen-output__empty">Бросьте встречу.</div>`;
  }
  UI.actions['enc-time'] = (el) => {
    state.encTime = el.dataset.time;
    state.last.encounters = [];
    saveState();
    UI.render();
  };
  UI.actions['enc-roll'] = () => {
    const e = pickEncounter();
    state.last.encounters = e ? [e] : [];
    saveState();
    renderEncounterOutput();
  };
  UI.actions['enc-roll3'] = () => {
    const arr = [];
    for (let i = 0; i < 3; i++) { const e = pickEncounter(); if (e) arr.push(e); }
    state.last.encounters = arr;
    saveState();
    renderEncounterOutput();
  };
  UI.actions['enc-reset'] = () => {
    if (!confirm('Сбросить свои встречи и отключённые варианты?')) return;
    state.gen.encounters = {};
    state.last.encounters = [];
    saveState();
    UI.render();
  };
  UI.actions['enc-del'] = (el) => {
    const time = state.encTime || 'День';
    const b = UI.genBucket('encounters', time);
    b.custom = (b.custom || []).filter(x => x.id !== el.dataset.id);
    b.disabled = (b.disabled || []).filter(x => x !== el.dataset.id);
    saveState();
    UI.render();
  };
  UI.actions['enc-add-open'] = () => {
    const time = state.encTime || 'День';
    openModal(modalShell({
      title: 'Своя встреча',
      sub: time,
      body: `<form class="grid" id="enc-add-form" style="gap:10px">
        <div class="field"><label>Название</label><input class="input" name="name" required placeholder="Например: уличный проповедник"></div>
        <div class="grid grid--2" style="gap:8px">
          <div class="field"><label>Диапазон от</label><input class="input" name="min" type="number" min="1" max="100" value="1"></div>
          <div class="field"><label>Диапазон до</label><input class="input" name="max" type="number" min="1" max="100" value="100"></div>
        </div>
        <div class="field"><label>Описание</label><textarea class="textarea" name="desc" rows="3" placeholder="Что происходит"></textarea></div>
        <div class="field"><label>Юниты / статблок</label><textarea class="textarea" name="units" rows="2" placeholder="Кто и с чем"></textarea></div>
        <div class="field"><label>Поведение</label><textarea class="textarea" name="behavior" rows="2" placeholder="Что делает"></textarea></div>
      </form>`,
      foot: `<button class="btn" data-action="close-modal">Отмена</button><button class="btn btn--yellow" data-action="enc-add-save">Добавить</button>`,
    }));
  };
  UI.actions['enc-add-save'] = () => {
    const form = document.getElementById('enc-add-form');
    if (!form) return;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    if (!name) { toast('Введите название'); return; }
    const min = Math.max(1, Math.min(100, parseInt(fd.get('min'), 10) || 1));
    const max = Math.max(min, Math.min(100, parseInt(fd.get('max'), 10) || 100));
    const time = state.encTime || 'День';
    const b = UI.genBucket('encounters', time);
    b.custom.push({ id: 'ce-' + UI.uid(), name, min, max, desc: fd.get('desc'), units: fd.get('units'), behavior: fd.get('behavior'), source: 'Мои' });
    saveState();
    UI.closeModal();
    UI.render();
    toast('Встреча добавлена');
  };
  function setupEncounters() {
    $$('[data-enc-toggle]').forEach(cb => {
      cb.addEventListener('change', () => {
        const time = state.encTime || 'День';
        const b = UI.genBucket('encounters', time);
        const id = cb.dataset.id;
        if (cb.checked) b.disabled = b.disabled.filter(x => x !== id);
        else if (!b.disabled.includes(id)) b.disabled.push(id);
        saveState();
      });
    });
    const zone = document.getElementById('enc-zone');
    if (zone) zone.addEventListener('change', () => { state.encZone = zone.value; saveState(); });
  }

  /* ============================================================
     GIGS
     ============================================================ */
  const RANKS = ['1–4', '5–7', '8–10'];
  function gigRole() {
    return GIGS.find(g => g.key === state.gigRole) || GIGS[0];
  }
  function gigEntries(role) {
    const b = UI.genBucket('gigs', role.key);
    const base = (role.entries || []).map((e, i) => Object.assign({}, e, { _id: 'g-' + role.key + '-' + i, _base: true }));
    const custom = (b.custom || []).map(e => Object.assign({}, e, { _id: e.id, _custom: true }));
    return base.concat(custom).filter(e => !b.disabled.includes(e._id));
  }
  function allGigEntries(role) {
    const b = UI.genBucket('gigs', role.key);
    return (role.entries || []).map((e, i) => Object.assign({}, e, { _id: 'g-' + role.key + '-' + i, _base: true }))
      .concat((b.custom || []).map(e => Object.assign({}, e, { _id: e.id, _custom: true })));
  }
  function gigPay(entry, rank) {
    if (!entry) return 0;
    if (entry.pay && entry.pay[rank] != null) return entry.pay[rank];
    return 0;
  }
  function renderGigs() {
    const role = gigRole();
    const rank = Number(state.gigRank) || 0;
    const last = state.last.gig;
    const list = allGigEntries(role);
    const b = UI.genBucket('gigs', role.key);
    return `<div class="grid grid--sidebar">
      <div>
        <div class="panel" style="margin-bottom:14px">
          <div class="panel-head"><h3>Халтурки по ролям</h3><span class="tiny dim">d6</span></div>
          <div class="panel-body">
            <div class="gig-role-tabs">
              ${GIGS.map(g => `<button class="gig-role ${role.key === g.key ? 'is-active' : ''}" data-action="gig-role" data-role="${g.key}">${esc(g.icon)} ${esc(g.role)}</button>`).join('')}
            </div>
            <div class="toolbar" style="margin:10px 0 0">
              <select class="select" id="gig-rank">
                ${RANKS.map((r, i) => `<option value="${i}" ${rank === i ? 'selected' : ''}>Ранг ${r}</option>`).join('')}
              </select>
              <button class="btn btn--yellow" data-action="gig-roll">${icon('dice')} Бросить</button>
              <button class="btn" data-action="gig-roll-all">${icon('users')} Всей команде</button>
              <button class="btn" data-action="gig-add-open">${icon('plus')} Своя</button>
            </div>
          </div>
        </div>
        <div class="gen-output" style="position:static">
          <div class="gen-output__head"><h3>Результат · ${esc(role.role)}</h3><button class="btn btn--sm" data-action="print">${icon('print')} Печать</button></div>
          <div id="gig-output">${last ? `<div class="gen-output__block gen-output__block--wide"><dt>${esc(last.role || role.role)} · ранг ${esc(RANKS[last.rank] || '')}</dt><dd>${esc(last.entry.text)}<br><span class="yellow mono">${money(last.pay)}</span></dd></div>` : `<div class="gen-output__empty">Бросьте халтурку: чем персонаж зарабатывал на этой неделе.</div>`}</div>
        </div>
        <div class="section-head" style="margin-top:22px"><h2>Таблица · ${esc(role.role)}</h2><span class="dim">${list.length} вариантов</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>d6</th><th>Вкл.</th><th>Чем занимались</th><th>1–4</th><th>5–7</th><th>8–10</th><th></th></tr></thead>
            <tbody>
              ${list.map(e => {
                const on = !b.disabled.includes(e._id);
                return `<tr>
                  <td class="num">${e.roll != null ? e.roll : '—'}</td>
                  <td><input type="checkbox" ${on ? 'checked' : ''} data-gig-toggle data-role="${role.key}" data-id="${attr(e._id)}"></td>
                  <td><b>${esc(e.text)}</b>${e._custom ? '<div class="tag tag--yellow" style="margin-top:2px">Мои</div>' : ''}</td>
                  <td class="num">${e.pay && e.pay[0] != null ? money(e.pay[0]) : '—'}</td>
                  <td class="num">${e.pay && e.pay[1] != null ? money(e.pay[1]) : '—'}</td>
                  <td class="num">${e.pay && e.pay[2] != null ? money(e.pay[2]) : '—'}</td>
                  <td>${e._custom ? `<button class="gen-row__del" data-action="gig-del" data-role="${role.key}" data-id="${attr(e.id)}">✕</button>` : ''}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="grid" style="gap:12px">
        <div class="panel">
          <div class="panel-head"><h3>Оплата по рангу</h3></div>
          <div class="panel-body">
            <table class="pay-table">
              <tr><th>Ранг</th><th>Неделя</th></tr>
              ${RANKS.map((r, i) => `<tr><td>${r}</td><td>${last ? (last.entry && last.entry.pay ? money(last.entry.pay[i]) : '—') : '—'}</td></tr>`).join('')}
            </table>
            <div class="small dim" style="margin-top:8px">Оплата — за неделю downtime. Рефери может добавить бонусы, расходы и долги.</div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Идея</h3></div>
          <div class="panel-body small">
            <p>Халтурка — это не только деньги. Спросите: <b>с кем</b> персонаж работал, <b>что пошло не так</b> и <b>кто теперь ему должен</b>.</p>
            <div class="gen-actions"><button class="btn btn--sm" data-action="gig-add-open">${icon('plus')} Свой вариант</button><button class="btn btn--sm" data-action="gig-reset">${icon('trash')} Сброс</button></div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function renderGigResult() {
    const el = document.getElementById('gig-output');
    if (!el) return;
    const last = state.last.gig;
    el.innerHTML = last ? `<div class="gen-output__block gen-output__block--wide"><dt>${esc(last.role)} · ранг ${esc(RANKS[last.rank] || '')}</dt><dd>${esc(last.entry.text)}<br><span class="yellow mono">${money(last.pay)}</span></dd></div>` : `<div class="gen-output__empty">Бросьте халтурку.</div>`;
  }
  UI.actions['gig-role'] = (el) => { state.gigRole = el.dataset.role; state.last.gig = null; saveState(); UI.render(); };
  UI.actions['gig-roll'] = () => {
    const role = gigRole();
    const rank = Number(state.gigRank) || 0;
    const list = gigEntries(role);
    if (!list.length) { toast('Нет доступных вариантов'); return; }
    const entry = pick(list);
    state.last.gig = { role: role.role, roleKey: role.key, entry, rank, pay: gigPay(entry, rank) };
    saveState();
    renderGigResult();
  };
  UI.actions['gig-roll-all'] = () => {
    const rank = Number(state.gigRank) || 0;
    const rows = GIGS.map(role => {
      const list = gigEntries(role);
      const entry = list.length ? pick(list) : null;
      return { role: role.role, entry, pay: entry ? gigPay(entry, rank) : 0 };
    }).filter(x => x.entry);
    state.last.gigAll = { rank, rows };
    saveState();
    const el = document.getElementById('gig-output');
    if (el) el.innerHTML = `<div style="display:grid;gap:6px">${rows.map(r => `<div class="gen-output__block"><dt>${esc(r.role)}</dt><dd>${esc(r.entry.text)}<br><span class="yellow mono">${money(r.pay)}</span></dd></div>`).join('')}</div>`;
  };
  UI.actions['gig-del'] = (el) => {
    const b = UI.genBucket('gigs', el.dataset.role);
    b.custom = (b.custom || []).filter(x => x.id !== el.dataset.id);
    b.disabled = (b.disabled || []).filter(x => x !== el.dataset.id);
    saveState();
    UI.render();
  };
  UI.actions['gig-reset'] = () => {
    if (!confirm('Сбросить свои халтурки и отключённые варианты?')) return;
    state.gen.gigs = {};
    state.last.gig = null;
    saveState();
    UI.render();
  };
  UI.actions['gig-add-open'] = () => {
    const role = gigRole();
    openModal(modalShell({
      title: 'Своя халтурка',
      sub: role.role,
      body: `<form class="grid" id="gig-add-form" style="gap:10px">
        <div class="field"><label>Чем занимались</label><textarea class="textarea" name="text" rows="3" required placeholder="Например: охраняли подпольный концерт"></textarea></div>
        <div class="grid grid--3" style="gap:8px">
          <div class="field"><label>Ранг 1–4, eb</label><input class="input" name="p1" type="number" value="100"></div>
          <div class="field"><label>Ранг 5–7, eb</label><input class="input" name="p2" type="number" value="200"></div>
          <div class="field"><label>Ранг 8–10, eb</label><input class="input" name="p3" type="number" value="500"></div>
        </div>
      </form>`,
      foot: `<button class="btn" data-action="close-modal">Отмена</button><button class="btn btn--yellow" data-action="gig-add-save">Добавить</button>`,
    }));
  };
  UI.actions['gig-add-save'] = () => {
    const form = document.getElementById('gig-add-form');
    if (!form) return;
    const fd = new FormData(form);
    const text = String(fd.get('text') || '').trim();
    if (!text) { toast('Введите текст'); return; }
    const role = gigRole();
    const b = UI.genBucket('gigs', role.key);
    b.custom.push({ id: 'cg-' + UI.uid(), text, pay: [Number(fd.get('p1')) || 0, Number(fd.get('p2')) || 0, Number(fd.get('p3')) || 0], source: 'Мои' });
    saveState();
    UI.closeModal();
    UI.render();
    toast('Халтурка добавлена');
  };
  function setupGigs() {
    const rank = document.getElementById('gig-rank');
    if (rank) rank.addEventListener('change', () => { state.gigRank = Number(rank.value) || 0; saveState(); });
    $$('[data-gig-toggle]').forEach(cb => {
      cb.addEventListener('change', () => {
        const b = UI.genBucket('gigs', cb.dataset.role);
        const id = cb.dataset.id;
        if (cb.checked) b.disabled = b.disabled.filter(x => x !== id);
        else if (!b.disabled.includes(id)) b.disabled.push(id);
        saveState();
      });
    });
  }

  /* defaults */
  if (!state.encTime) state.encTime = 'День';
  if (!state.encZone) state.encZone = 'moderate';
  if (!state.gigRole) state.gigRole = 'solo';
  if (state.gigRank == null) state.gigRank = 0;
})();
