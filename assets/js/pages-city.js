/* ============================================================
   Night City lore: districts, gangs, corporations, services, GM tables
   ============================================================ */
(function () {
  'use strict';
  const UI = window.CPR_UI;
  if (!UI) return;
  const { esc, attr, icon, dataTable, pageHead, sectionHead, openModal, modalShell, toast, saveState, state, data, $, $$ } = UI;
  const L = data.lore || { districts: [], gangs: [], corps: [], services: [], people: [], relations: [], events: [], rumors: [], hooks: [], zones: [] };

  const TABS = [
    ['overview', 'Обзор', 'screen'],
    ['map', 'Карта', 'map'],
    ['districts', 'Районы', 'home'],
    ['gangs', 'Банды', 'users'],
    ['corps', 'Корпорации', 'box'],
    ['services', 'Службы', 'shield'],
    ['gm', 'Мастеру', 'dice'],
  ];

  const MINOR_CORPS = [
    ['Kiroshi Optics', 'оптика и киберглаза'],
    ['Kendachi Arms', 'моно-клинки и экзотическое оружие'],
    ['GunMart', 'дешёвое оружие и «оружейные супермаркеты»'],
    ['Constantine Arms', 'экзотическое оружие'],
    ['Tsunami Defense Systems', 'оружие и системы обороны'],
    ['Malorian Arms', 'элитное экзотическое оружие'],
    ['Budget Arms', 'дешёвое оружие для улиц'],
    ['Constitutional Arms', 'массовое огнестрельное оружие'],
    ['Midnite Arms', 'оружие для профессионалов'],
    ['Merrill, Asukaga & Finch', 'инвестиции и финансовые схемы'],
  ];

  function eraTag(era) {
    return era === '2077' ? '<span class="tag tag--violet">2077</span>' : '<span class="tag tag--yellow">2045</span>';
  }
  function factionTags(list) {
    return (list || []).map(x => `<span class="tag">${esc(x)}</span>`).join(' ');
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------------- page ---------------- */
  UI.pages.city = {
    title: 'Город',
    render(r) {
      const tab = r.query.tab || 'overview';
      return `<div class="page">
        ${pageHead('НАЙТ-СИТИ / КРАСНОЕ ВРЕМЯ', 'Город', 'Районы, банды, корпорации и службы. Лор, который можно дать игрокам как слух, заказ или проблему.', `
          <a class="btn btn--yellow" href="#/city?tab=map" data-route="#/city?tab=map">${icon('map')} Карта 2077</a>
          <a class="btn" href="#/generators?tab=job" data-route="#/generators?tab=job">${icon('spark')} Работа</a>
          <button class="btn" data-action="open-dice">${icon('dice')} Броски</button>
        `)}
        <div class="gen-tabs">${TABS.map(([id, label, ic]) => `<a class="gen-tab ${tab === id ? 'is-active' : ''}" href="#/city?tab=${id}" data-route="#/city?tab=${id}">${icon(ic)} ${label}</a>`).join('')}</div>
        ${tab === 'map' ? renderMapTab() : tab === 'districts' ? renderDistricts() : tab === 'gangs' ? renderGangs() : tab === 'corps' ? renderCorps() : tab === 'services' ? renderServices() : tab === 'gm' ? renderGM() : renderOverview()}
      </div>`;
    },
    setup(r) {
      const tab = r.query.tab || 'overview';
      if (tab === 'map') {
        if (UI.mapPage) UI.mapPage.setup();
        if (r.query.id) setTimeout(() => { if (UI.mapPage) UI.mapPage.select(r.query.type || 'place', r.query.id, true); }, 60);
      }
      else if (tab === 'districts') setupDistricts();
      else if (tab === 'gangs') setupGangs();
      else if (tab === 'corps') setupCorps();
      else if (tab === 'services') setupServices();
      else if (tab === 'gm') setupGM();
      if (r.query.id) {
        const map = { districts: 'open-district', gangs: 'open-gang', corps: 'open-corp', services: 'open-service' };
        const action = map[tab];
        if (action) UI.actions[action]({ dataset: { id: r.query.id } });
      }
    },
  };

  function renderMapTab() {
    return UI.mapPage ? UI.mapPage.render() : `<div class="empty">Карта не загружена.</div>`;
  }

  /* ---------------- overview ---------------- */
  function renderOverview() {
    const rumor = L.rumors.length ? pick(L.rumors) : null;
    const event = L.events.length ? pick(L.events) : null;
    return `<div class="lore-intro">
      <div class="lore-intro__mark">NC</div>
      <div>
        <p class="lead" style="margin:0">Найт-Сити — город, который пережил ядерный взрыв, корпоративную войну и собственное правительство. Здесь всё ещё есть власть, деньги и закон — но у каждого своя цена.</p>
        <p class="small dim" style="margin:10px 0 0">${esc(L.disclaimer || '')}</p>
      </div>
    </div>

    <div class="grid grid--4" style="margin-bottom:18px">
      <div class="stat"><span class="stat__num">${L.districts.length}</span><span class="stat__label">районов</span></div>
      <div class="stat"><span class="stat__num">${L.gangs.length}</span><span class="stat__label">банд</span></div>
      <div class="stat"><span class="stat__num">${L.corps.length}</span><span class="stat__label">корпораций</span></div>
      <div class="stat"><span class="stat__num">${L.services.length}</span><span class="stat__label">служб и сил</span></div>
    </div>

    <div class="grid grid--4">
      <a class="card card--link" href="#/city?tab=gangs" data-route="#/city?tab=gangs">
        <div class="card__icon">${icon('users')}</div>
        <div class="card__title">Банды</div>
        <div class="card__sub">Кто контролирует улицы, чем живёт и что ненавидит. От 6-й улицы до Maelstrom.</div>
      </a>
      <a class="card card--link" href="#/city?tab=corps" data-route="#/city?tab=corps">
        <div class="card__icon">${icon('box')}</div>
        <div class="card__title">Корпорации</div>
        <div class="card__sub">Arasaka, Militech, Biotechnica, Petrochem и те, кто делает город удобным и опасным.</div>
      </a>
      <a class="card card--link" href="#/city?tab=services" data-route="#/city?tab=services">
        <div class="card__icon">${icon('shield')}</div>
        <div class="card__title">Службы</div>
        <div class="card__sub">NCPD, Trauma Team, MaxTac, пожарные, транспорт, рипердоки и фиксеры.</div>
      </a>
      <a class="card card--link" href="#/city?tab=map" data-route="#/city?tab=map">
        <div class="card__icon">${icon('map')}</div>
        <div class="card__title">Карта 2077</div>
        <div class="card__sub">Районы, банды, корпорации и примечательные места на одной схеме.</div>
      </a>
    </div>

    <div class="section-head" style="margin-top:28px"><h2>Зоны города</h2><span class="dim">7 ЗОН</span></div>
    ${dataTable(['Зона', 'Метка', 'Что это', 'Опасность'], L.zones.map(z => [`<b>${esc(z.name)}</b>`, `<span class="tag">${esc(z.tag)}</span>`, `<span class="small">${esc(z.desc)}</span>`, `<span class="tag tag--red">${esc(z.danger)}</span>`]))}

    <div class="grid grid--2" style="margin-top:18px">
      <div class="panel" id="lore-rumor-panel">
        <div class="panel-head"><h3>Слух дня</h3><button class="btn btn--sm" data-action="lore-rumor">${icon('refresh')} Ещё</button></div>
        <div class="panel-body" id="lore-rumor">${rumorBox(rumor)}</div>
      </div>
      <div class="panel" id="lore-event-panel">
        <div class="panel-head"><h3>Событие дня</h3><button class="btn btn--sm" data-action="lore-event">${icon('refresh')} Ещё</button></div>
        <div class="panel-body" id="lore-event">${eventBox(event)}</div>
      </div>
    </div>

    <div class="section-head" style="margin-top:28px"><h2>Кто здесь главный</h2><span class="dim">КРАТКО</span></div>
    <div class="grid grid--3">
      <div class="panel"><div class="panel-body"><div class="card__title">Корпорации</div><p class="small dim" style="margin:8px 0 0">Деньги, оружие, данные и рабочие места. Они не управляют городом напрямую — им это не нужно.</p></div></div>
      <div class="panel"><div class="panel-body"><div class="card__title">Банды</div><p class="small dim" style="margin:8px 0 0">Реальная власть на улицах. У каждой — своя территория, кодекс и цена.</p></div></div>
      <div class="panel"><div class="panel-body"><div class="card__title">Службы</div><p class="small dim" style="margin:8px 0 0">Полиция, медицина, транспорт и данные. Они приезжают — если вы им нужны.</p></div></div>
    </div>
  `;
  }
  function rumorBox(r) {
    if (!r) return '<div class="dim small">Слухов пока нет.</div>';
    return `<div class="lore-rumor">
      <div class="lore-rumor__roll mono">d20 = ${r.roll}</div>
      <p>${esc(r.text)}</p>
      <div class="badge-row">${r.faction ? `<span class="tag tag--red">${esc(r.faction)}</span>` : ''}<span class="tag">${esc(r.district)}</span></div>
      <div class="callout small" style="margin-top:10px"><b>Правда для Рефери:</b> ${esc(r.truth)}</div>
    </div>`;
  }
  function eventBox(e) {
    if (!e) return '<div class="dim small">Событий пока нет.</div>';
    return `<div class="lore-rumor">
      <div class="lore-rumor__roll mono">d20 = ${e.roll}</div>
      <p>${esc(e.text)}</p>
      <div class="badge-row">${(e.factions || []).map(f => `<span class="tag tag--red">${esc(f)}</span>`).join('')}<span class="tag">${esc(e.district)}</span></div>
    </div>`;
  }
  UI.actions['lore-rumor'] = () => {
    const el = document.getElementById('lore-rumor');
    if (el) el.innerHTML = rumorBox(pick(L.rumors));
  };
  UI.actions['lore-event'] = () => {
    const el = document.getElementById('lore-event');
    if (el) el.innerHTML = eventBox(pick(L.events));
  };

  /* ---------------- districts ---------------- */
  function renderDistricts() {
    return `<div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="district-search" placeholder="Район, место, банда…" autocomplete="off"></div>
      <select class="select" id="district-threat"><option value="">Любая опасность</option><option>Низкая, но контроль</option><option>Средняя</option><option>Средне-высокая</option><option>Высокая</option><option>Экстремальная</option></select>
      <span class="dim small" id="district-count">${L.districts.length} районов</span>
    </div>
    <div class="lore-grid lore-grid--3" id="district-grid">
      ${L.districts.map(d => {
        const search = [d.name, d.tag, d.vibe, d.control, d.desc, ...(d.places || []), ...(d.hooks || [])].join(' ').toLowerCase();
        return `<div class="lore-card" data-district-card data-threat="${attr(d.threat)}" data-search="${attr(search)}" data-action="open-district" data-id="${d.id}" role="button" tabindex="0">
          <div class="lore-card__head"><div><div class="lore-card__title">${esc(d.name)}</div><div class="lore-card__tag">${esc(d.tag)}</div></div><span class="tag tag--red">${esc(d.threat)}</span></div>
          <p class="lore-card__desc">${esc(d.vibe)}</p>
          <div class="lore-card__meta"><b>Контроль:</b> ${esc(d.control)}</div>
          <div class="lore-card__tags">${(d.places || []).slice(0, 3).map(p => `<span class="tag">${esc(p)}</span>`).join('')}</div>
          <div class="lore-card__foot">${icon('right')} подробнее</div>
        </div>`;
      }).join('')}
    </div>`;
  }
  function setupDistricts() {
    const apply = () => {
      const q = UI.fmt.norm($('#district-search').value);
      const t = $('#district-threat').value;
      let n = 0;
      $$('[data-district-card]').forEach(card => {
        const ok = (!q || card.dataset.search.includes(q)) && (!t || card.dataset.threat === t);
        card.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      const c = $('#district-count'); if (c) c.textContent = n + ' районов';
    };
    ['district-search', 'district-threat'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', apply); });
  }
  UI.actions['open-district'] = (el) => {
    const d = L.districts.find(x => x.id === el.dataset.id);
    if (!d) return;
    openModal(modalShell({
      title: d.name,
      sub: `${d.tag} · ${d.threat}`,
      wide: true,
      body: `<div class="article__body">
        <p>${esc(d.desc)}</p>
        <div class="grid grid--2">
          <div class="panel"><div class="panel-head"><h3>Кто контролирует</h3></div><div class="panel-body small">${esc(d.control)}</div></div>
          <div class="panel"><div class="panel-head"><h3>Атмосфера</h3></div><div class="panel-body small">${esc(d.vibe)}</div></div>
        </div>
        <h3>Места</h3><div class="badge-row">${(d.places || []).map(p => `<span class="tag tag--cyan">${esc(p)}</span>`).join('')}</div>
        <h3>Зацепки</h3><ul>${(d.hooks || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><a class="btn btn--yellow" href="#/generators?tab=encounters" data-route="#/generators?tab=encounters">${icon('dice')} Встречи в районе</a>`,
    }));
    UI.pushRecent({ title: 'Район: ' + d.name, route: '#/city?tab=districts&id=' + d.id });
  };

  /* ---------------- gangs ---------------- */
  function renderGangs() {
    return `<div class="callout callout--yellow" style="margin-bottom:14px"><b>Как использовать:</b> банда — это не только враг. Это работодатель, сосед, источник слухов и причина, по которой PCs не могут просто пройти по улице. У каждой есть «хочу» и «ненавижу» — этого достаточно, чтобы сыграть сцену без статблока.</div>
    <div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="gang-search" placeholder="Банда, территория, тема…" autocomplete="off"></div>
      <div class="chips" id="gang-era"><button class="chip is-active" data-era="">Все</button><button class="chip" data-era="2045">2045</button><button class="chip" data-era="2077">2077</button></div>
      <span class="dim small" id="gang-count">${L.gangs.length} банд</span>
    </div>
    <div class="lore-grid lore-grid--2" id="gang-grid">
      ${L.gangs.map(g => {
        const search = [g.name, g.tag, g.territory, g.business, g.desc, g.want, g.hate, ...(g.hooks || [])].join(' ').toLowerCase();
        return `<div class="lore-card lore-card--gang" data-gang-card data-era="${g.era}" data-search="${attr(search)}" data-action="open-gang" data-id="${g.id}" role="button" tabindex="0">
          <div class="lore-card__head"><div><div class="lore-card__title">${esc(g.name)}</div><div class="lore-card__tag">${esc(g.tag)}</div></div>${eraTag(g.era)}</div>
          <p class="lore-card__desc">${esc(g.desc)}</p>
          <div class="lore-card__meta"><b>Территория:</b> ${esc(g.territory)}</div>
          <div class="lore-card__meta"><b>Промысел:</b> ${esc(g.business)}</div>
          <div class="lore-card__tags"><span class="tag tag--yellow">Хочет: ${esc(g.want)}</span><span class="tag tag--red">Ненавидит: ${esc(g.hate)}</span></div>
          <div class="lore-card__foot">${icon('right')} досье</div>
        </div>`;
      }).join('')}
    </div>`;
  }
  function setupGangs() {
    let era = '';
    const apply = () => {
      const q = UI.fmt.norm($('#gang-search').value);
      let n = 0;
      $$('[data-gang-card]').forEach(card => {
        const ok = (!q || card.dataset.search.includes(q)) && (!era || card.dataset.era === era);
        card.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      const c = $('#gang-count'); if (c) c.textContent = n + ' банд';
    };
    const input = $('#gang-search'); if (input) input.addEventListener('input', apply);
    $$('#gang-era .chip').forEach(chip => chip.addEventListener('click', () => {
      era = chip.dataset.era || '';
      $$('#gang-era .chip').forEach(c => c.classList.toggle('is-active', c === chip));
      apply();
    }));
  }
  UI.actions['open-gang'] = (el) => {
    const g = L.gangs.find(x => x.id === el.dataset.id);
    if (!g) return;
    openModal(modalShell({
      title: g.name,
      sub: `${g.tag} · ${g.era}`,
      wide: true,
      body: `<div class="article__body">
        <p>${esc(g.desc)}</p>
        <div class="grid grid--2">
          <div class="panel"><div class="panel-head"><h3>Досье</h3></div><div class="panel-body">
            <dl class="weapon-detail" style="grid-template-columns:1fr">
              <div><dt>Территория</dt><dd>${esc(g.territory)}</dd></div>
              <div><dt>Цвета</dt><dd>${esc(g.colors)}</dd></div>
              <div><dt>Промысел</dt><dd>${esc(g.business)}</dd></div>
              <div><dt>Лидерство</dt><dd>${esc(g.leadership)}</dd></div>
              <div><dt>Сила</dt><dd>${esc(g.strength)}</dd></div>
            </dl>
          </div></div>
          <div class="panel"><div class="panel-head"><h3>Отношения</h3></div><div class="panel-body small">
            <p><b class="green">Союзники:</b> ${esc(g.allies)}</p>
            <p><b class="red">Враги:</b> ${esc(g.enemies)}</p>
            <p><b class="yellow">Хотят:</b> ${esc(g.want)}</p>
            <p><b class="red">Ненавидят:</b> ${esc(g.hate)}</p>
          </div></div>
        </div>
        <h3>Работа и встреча</h3>
        <p><b>Типичный заказ:</b> ${esc(g.job)}</p>
        <p><b>Случайная встреча:</b> ${esc(g.encounter)}</p>
        <h3>Зацепки</h3><ul>${(g.hooks || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><a class="btn" href="#/generators?tab=encounters" data-route="#/generators?tab=encounters">${icon('map')} Встречи</a><a class="btn btn--yellow" href="#/generators?tab=job" data-route="#/generators?tab=job">${icon('spark')} Работа</a>`,
    }));
    UI.pushRecent({ title: 'Банда: ' + g.name, route: '#/city?tab=gangs&id=' + g.id });
  };

  /* ---------------- corporations ---------------- */
  function renderCorps() {
    return `<div class="callout callout--yellow" style="margin-bottom:14px"><b>Как использовать:</b> корпорация — это не только злодей. Это заказчик, который платит вовремя, но никогда не говорит всей правды. Её «хочу» определяет работу, её «методы» — осложнения, её «враги» — третью сторону.</div>
    <div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="corp-search" placeholder="Корпорация, сфера, офис…" autocomplete="off"></div>
      <span class="dim small" id="corp-count">${L.corps.length} корпораций</span>
    </div>
    <div class="lore-grid lore-grid--2" id="corp-grid">
      ${L.corps.map(c => {
        const search = [c.name, c.field, c.hq, c.desc, c.want, c.methods, ...(c.hooks || [])].join(' ').toLowerCase();
        return `<div class="lore-card lore-card--corp" data-corp-card data-search="${attr(search)}" data-action="open-corp" data-id="${c.id}" role="button" tabindex="0">
          <div class="lore-card__head"><div><div class="lore-card__title">${esc(c.name)}</div><div class="lore-card__tag">${esc(c.field)}</div></div><span class="tag tag--cyan">${esc(c.era)}</span></div>
          <p class="lore-card__desc">${esc(c.desc)}</p>
          <div class="lore-card__meta"><b>Штаб:</b> ${esc(c.hq)} · <b>Сотрудники:</b> ${esc(c.employees)}</div>
          <div class="lore-card__tags"><span class="tag tag--yellow">Хочет: ${esc(c.want)}</span></div>
          <div class="lore-card__foot">${icon('right')} досье</div>
        </div>`;
      }).join('')}
    </div>
    <div class="section-head" style="margin-top:24px"><h2>Другие имена</h2><span class="dim">ЛОКАЛЬНЫЕ И НИШЕВЫЕ</span></div>
    <div class="panel"><div class="panel-body"><div class="lore-minor-grid">${MINOR_CORPS.map(([n, d]) => `<div class="lore-minor"><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}</div></div></div>`;
  }
  function setupCorps() {
    const input = $('#corp-search'); if (!input) return;
    input.addEventListener('input', () => {
      const q = UI.fmt.norm(input.value); let n = 0;
      $$('[data-corp-card]').forEach(card => { const ok = !q || card.dataset.search.includes(q); card.style.display = ok ? '' : 'none'; if (ok) n++; });
      const c = $('#corp-count'); if (c) c.textContent = n + ' корпораций';
    });
  }
  UI.actions['open-corp'] = (el) => {
    const c = L.corps.find(x => x.id === el.dataset.id);
    if (!c) return;
    openModal(modalShell({
      title: c.name,
      sub: `${c.field} · ${c.era}`,
      wide: true,
      body: `<div class="article__body">
        <p>${esc(c.desc)}</p>
        <div class="grid grid--2">
          <div class="panel"><div class="panel-head"><h3>Досье</h3></div><div class="panel-body">
            <dl class="weapon-detail" style="grid-template-columns:1fr">
              <div><dt>Штаб-квартира</dt><dd>${esc(c.hq)}</dd></div>
              <div><dt>Присутствие</dt><dd>${esc(c.presence)}</dd></div>
              <div><dt>Сотрудники</dt><dd>${esc(c.employees)}</dd></div>
              <div><dt>Хочет</dt><dd>${esc(c.want)}</dd></div>
              <div><dt>Методы</dt><dd>${esc(c.methods)}</dd></div>
            </dl>
          </div></div>
          <div class="panel"><div class="panel-head"><h3>Ресурсы и враги</h3></div><div class="panel-body small">
            <p><b class="yellow">Активы:</b> ${esc(c.assets)}</p>
            <p><b class="cyan">Типичные работы:</b> ${esc(c.jobs)}</p>
            <p><b class="red">Враги:</b> ${esc(c.enemies)}</p>
          </div></div>
        </div>
        <h3>Зацепки</h3><ul>${(c.hooks || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button><a class="btn btn--yellow" href="#/generators?tab=job" data-route="#/generators?tab=job">${icon('spark')} Работа на корпорацию</a>`,
    }));
    UI.pushRecent({ title: 'Корпорация: ' + c.name, route: '#/city?tab=corps&id=' + c.id });
  };

  /* ---------------- services ---------------- */
  function renderServices() {
    return `<div class="callout callout--yellow" style="margin-bottom:14px"><b>Как использовать:</b> службы задают темп. Полиция приезжает через 1d6 раундов — или не приезжает. Trauma Team забирает только подписчика. MaxTac не ведёт переговоров. Это не «фон», а таймер и последствия.</div>
    <div class="toolbar">
      <div class="input-group">${icon('search')}<input class="input" id="service-search" placeholder="Служба, реакция, стоимость…" autocomplete="off"></div>
      <span class="dim small" id="service-count">${L.services.length} служб</span>
    </div>
    <div class="lore-grid lore-grid--2" id="service-grid">
      ${L.services.map(s => {
        const search = [s.name, s.tag, s.response, s.cost, s.desc, s.how].join(' ').toLowerCase();
        return `<div class="lore-card lore-card--service" data-service-card data-search="${attr(search)}" data-action="open-service" data-id="${s.id}" role="button" tabindex="0">
          <div class="lore-card__head"><div><div class="lore-card__title">${esc(s.name)}</div><div class="lore-card__tag">${esc(s.tag)}</div></div><span class="tag tag--cyan">${esc(s.response)}</span></div>
          <p class="lore-card__desc">${esc(s.desc)}</p>
          <div class="lore-card__meta"><b>Стоимость:</b> ${esc(s.cost)}</div>
          <div class="lore-card__meta"><b>Юрисдикция:</b> ${esc(s.jurisdiction)}</div>
          <div class="lore-card__foot">${icon('right')} подробнее</div>
        </div>`;
      }).join('')}
    </div>`;
  }
  function setupServices() {
    const input = $('#service-search'); if (!input) return;
    input.addEventListener('input', () => {
      const q = UI.fmt.norm(input.value); let n = 0;
      $$('[data-service-card]').forEach(card => { const ok = !q || card.dataset.search.includes(q); card.style.display = ok ? '' : 'none'; if (ok) n++; });
      const c = $('#service-count'); if (c) c.textContent = n + ' служб';
    });
  }
  UI.actions['open-service'] = (el) => {
    const s = L.services.find(x => x.id === el.dataset.id);
    if (!s) return;
    openModal(modalShell({
      title: s.name,
      sub: `${s.tag} · ${s.response}`,
      body: `<div class="article__body">
        <p>${esc(s.desc)}</p>
        <dl class="weapon-detail" style="grid-template-columns:1fr">
          <div><dt>Реакция</dt><dd>${esc(s.response)}</dd></div>
          <div><dt>Стоимость</dt><dd>${esc(s.cost)}</dd></div>
          <div><dt>Юрисдикция</dt><dd>${esc(s.jurisdiction)}</dd></div>
          <div><dt>Чего хотят</dt><dd>${esc(s.want)}</dd></div>
          <div><dt>Как работают</dt><dd>${esc(s.how)}</dd></div>
        </dl>
        <h3>Зацепки</h3><ul>${(s.hooks || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>`,
      foot: `<button class="btn" data-action="close-modal">Закрыть</button>${s.id === 'ncpd' ? `<a class="btn" href="#/lib/city__ncpd" data-route="#/lib/city__ncpd">${icon('book')} NCPD подробно</a>` : ''}${s.id === 'trauma' ? `<a class="btn" href="#/lib/city__trauma_team" data-route="#/lib/city__trauma_team">${icon('book')} Trauma Team подробно</a>` : ''}${s.id === 'ripperdocs' ? `<a class="btn btn--yellow" href="#/ripperdoc" data-route="#/ripperdoc">${icon('chip')} К рипердоку</a>` : ''}`,
    }));
    UI.pushRecent({ title: 'Служба: ' + s.name, route: '#/city?tab=services&id=' + s.id });
  };

  /* ---------------- GM ---------------- */
  function renderGM() {
    return `<div class="grid grid--2" style="margin-bottom:16px">
      <div class="panel"><div class="panel-head"><h3>Heat / внимание фракции</h3><span class="tiny dim">ОПЦИОНАЛЬНО</span></div><div class="panel-body small">
        <p>Ведите счёт <b>0–5</b> для каждой фракции, с которой PCs пересеклись.</p>
        <ul>
          <li><b>0</b> — не знают.</li>
          <li><b>1</b> — слышали имя.</li>
          <li><b>2</b> — наблюдают.</li>
          <li><b>3</b> — отправляют разведку / требуют долг.</li>
          <li><b>4</b> — присылают команду.</li>
          <li><b>5</b> — нанимают именного охотника.</li>
        </ul>
        <p class="dim">Снижение: заплатить, оказать услугу, лечь на дно, подставить другого. Это домашнее правило — не из корбука.</p>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Реакция на помощь</h3></div><div class="panel-body small">
        <p><b>Помогли банде:</b> +1 Heat у их врагов, +1 репутация в районе, возможен контакт.</p>
        <p><b>Помогли корпорации:</b> деньги, доступ, но вас запомнили; +1 Heat у её конкурентов.</p>
        <p><b>Вызвали NCPD:</b> они приедут, но зададут вопросы и запросят отчёт.</p>
        <p><b>Вызвали Trauma Team:</b> только для подписчика; остальных они не увозят.</p>
        <p><b>Убили всех:</b> тишина на время, потом — вопрос «кто это сделал».</p>
      </div></div>
    </div>

    <div class="section-head"><h2>Шпаргалка по фракциям</h2><span class="dim">ХОЧЕТ · ДАЁТ · НЕНАВИДИТ</span></div>
    ${dataTable(['Фракция', 'Хочет', 'Может дать', 'Ненавидит', 'Типичная работа'], L.gangs.map(g => [
      `<b>${esc(g.name)}</b><div class="tiny dim">${esc(g.era)}</div>`,
      `<span class="small">${esc(g.want)}</span>`,
      `<span class="small">${esc(g.business)}</span>`,
      `<span class="small">${esc(g.hate)}</span>`,
      `<span class="small">${esc(g.job)}</span>`,
    ]), { wrapClass: 'table-wrap--tall' })}

    <div class="section-head" style="margin-top:24px"><h2>Отношения</h2><span class="dim">КТО С КЕМ</span></div>
    ${dataTable(['A', '', 'B', 'Статус', 'Почему'], L.relations.map(rel => [
      `<b>${esc(rel.a)}</b>`, `<span class="dim">↔</span>`, `<b>${esc(rel.b)}</b>`,
      `<span class="tag ${rel.type.includes('война') ? 'tag--red' : rel.type.includes('союз') ? 'tag--green' : 'tag--yellow'}">${esc(rel.type)}</span>`,
      `<span class="small">${esc(rel.note)}</span>`,
    ]), { wrapClass: 'table-wrap--tall' })}

    <div class="section-head" style="margin-top:24px"><h2>d20 слухов</h2><span class="dim">ЧТО ГОВОРЯТ НА УЛИЦАХ</span></div>
    ${dataTable(['d20', 'Слух', 'Правда для Рефери', 'Источник'], L.rumors.map(r => [
      `<span class="mono yellow">${r.roll}</span>`, `<span class="small">${esc(r.text)}</span>`,
      `<span class="small dim">${esc(r.truth)}</span>`,
      `<span class="tag">${esc(r.faction || r.district)}</span>`,
    ]), { wrapClass: 'table-wrap--tall' })}

    <div class="section-head" style="margin-top:24px"><h2>d20 событий</h2><span class="dim">ЧТО ПРОИСХОДИТ В ГОРОДЕ</span></div>
    ${dataTable(['d20', 'Событие', 'Фракции', 'Район'], L.events.map(e => [
      `<span class="mono yellow">${e.roll}</span>`, `<span class="small">${esc(e.text)}</span>`,
      `<span class="small">${(e.factions || []).join(', ') || '—'}</span>`, `<span class="tag">${esc(e.district)}</span>`,
    ]), { wrapClass: 'table-wrap--tall' })}

    <div class="section-head" style="margin-top:24px"><h2>d20 зацепок</h2><span class="dim">СРАЗУ В ДЕЛО</span></div>
    ${dataTable(['d20', 'Зацепка', 'Фракции', 'Район'], L.hooks.map(h => [
      `<span class="mono yellow">${h.roll}</span>`, `<span class="small">${esc(h.text)}</span>`,
      `<span class="small">${(h.factions || []).join(', ') || '—'}</span>`, `<span class="tag">${esc(h.district)}</span>`,
    ]), { wrapClass: 'table-wrap--tall' })}

    <div class="section-head" style="margin-top:24px"><h2>Лица города</h2><span class="dim">КТО МОЖЕТ СТАТЬ НАНИМАТЕЛЕМ</span></div>
    <div class="lore-grid lore-grid--2">
      ${L.people.map(p => `<div class="lore-card"><div class="lore-card__head"><div><div class="lore-card__title">${esc(p.name)}</div><div class="lore-card__tag">${esc(p.role)}</div></div><span class="tag">${esc(p.faction)}</span></div><p class="lore-card__desc">${esc(p.desc)}</p><div class="lore-card__foot">${esc(p.hook)}</div></div>`).join('')}
    </div>`;
  }
  function setupGM() {}
})();
