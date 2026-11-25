/* ============================================================
   Interactive Night City 2077 map
   ============================================================ */
(function () {
  'use strict';
  const UI = window.CPR_UI;
  if (!UI) return;
  const { esc, attr, icon, saveState, state } = UI;
  const M = UI.data.map || { districts: [], subdistricts: [], gangs: [], corps: [], services: [], places: [] };
  const L = UI.data.lore || { districts: [], gangs: [], corps: [], services: [] };

  const DEFAULT_LAYERS = { districts: true, subdistricts: false, gangs: true, corps: true, services: false, places: true };
  const TYPE_LABEL = { district: 'Район', gang: 'Банда', corp: 'Корпорация', service: 'Служба', place: 'Место', subdistrict: 'Подрайон' };
  const PLACE_LABEL = { bar: 'Бар', club: 'Клуб', restaurant: 'Ресторан', clinic: 'Клиника', shop: 'Магазин', landmark: 'Место', hotel: 'Отель', motel: 'Мотель', org: 'Организация', fixer: 'Фиксер' };
  const GANG_COLORS = {
    maelstrom: '#ff2a4d', 'tyger-claws': '#00e5ff', valentinos: '#ffd166', 'sixth-street': '#7dd3fc',
    'voodoo-boys': '#b388ff', animals: '#ff8a00', moxes: '#ff2e88', scavengers: '#8a93a8',
  };
  const PLACE_COLORS = {
    bar: '#ff2e88', club: '#ff2e88', restaurant: '#ff8a00', clinic: '#35ff8a', shop: '#ff8a00',
    landmark: '#fcee0a', hotel: '#b388ff', motel: '#b388ff', org: '#00e5ff', fixer: '#ffd166',
  };
  const mapView = { scale: 1, x: 0, y: 0 };

  function layerState() {
    state.mapLayers = Object.assign({}, DEFAULT_LAYERS, state.mapLayers || {});
    return state.mapLayers;
  }
  function layerVisible(key) {
    const v = layerState();
    if (key === 'districtLabels') return !!v.districts;
    return !!v[key];
  }
  function applyLayers() {
    const v = layerState();
    UI.$$('[data-layer]').forEach(g => {
      const key = g.dataset.layer;
      const on = key === 'districtLabels' ? v.districts : v[key];
      g.style.display = on ? '' : 'none';
    });
    UI.$$('[data-map-layer]').forEach(btn => {
      const k = btn.dataset.mapLayer;
      btn.classList.toggle('is-active', !!v[k]);
    });
  }
  function ensureLayer(type) {
    const key = type === 'district' ? 'districts' : type === 'subdistrict' ? 'subdistricts' : type === 'gang' ? 'gangs' : type === 'corp' ? 'corps' : type === 'service' ? 'services' : 'places';
    const v = layerState();
    if (!v[key]) {
      v[key] = true;
      if (key === 'districts') v.districts = true;
      saveState();
      applyLayers();
    }
  }

  /* ---------------- svg ---------------- */
  function districtSvg() {
    return `<g data-layer="districts">${M.districts.map(d => `<polygon class="map-district" data-map-item data-type="district" data-id="${d.id}" data-name="${attr(d.name)}" points="${d.polygon.map(p => p.join(',')).join(' ')}" fill="${d.color}" stroke="${d.color}"></polygon>`).join('')}</g>
      <g data-layer="districtLabels" class="map-district-labels">${M.districts.map(d => {
        const w = d.labelWidth || Math.max(86, Math.round(d.name.length * 7.5 + 24));
        const x = d.label[0], y = d.label[1];
        return `<g class="map-district-label" data-map-item data-type="district" data-id="${d.id}" data-name="${attr(d.name)}">
          <rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="2" fill="#07080c" stroke="${d.color}" stroke-width="1"></rect>
          <text x="${x}" y="${y + 3}" text-anchor="middle" fill="${d.color}">${esc(d.name.toUpperCase())}</text>
        </g>`;
      }).join('')}</g>`;
  }
  function subdistrictSvg() {
    return `<g data-layer="subdistricts" class="map-subdistricts">${M.subdistricts.map(s => `<g class="map-subdistrict map-marker" data-map-item data-type="subdistrict" data-id="${s.id}" data-name="${attr(s.name)}">
      <circle cx="${s.x}" cy="${s.y}" r="3" fill="#c3c9d8" stroke="#07080c" stroke-width="1.5"></circle>
      <text x="${s.x + 7}" y="${s.y + 3}" class="map-subdistrict__label">${esc(s.name)}</text>
    </g>`).join('')}</g>`;
  }
  function gangSvg() {
    return `<g data-layer="gangs" class="map-gangs">${M.gangs.map(g => {
      const c = GANG_COLORS[g.gangId] || '#ff2a4d';
      return `<g class="map-gang map-marker" data-map-item data-type="gang" data-id="${g.id}" data-name="${attr(g.label)}" data-gang="${g.gangId}">
        <circle class="map-gang__zone" cx="${g.x}" cy="${g.y}" r="${g.r}" fill="${c}" stroke="${c}"></circle>
        <circle cx="${g.x}" cy="${g.y}" r="4" fill="${c}" stroke="#07080c" stroke-width="1.5"></circle>
        <text x="${g.x}" y="${g.y + g.r + 13}" text-anchor="middle" class="map-gang__label">${esc(g.label)}</text>
      </g>`;
    }).join('')}</g>`;
  }
  function corpSvg() {
    return `<g data-layer="corps" class="map-corps">${M.corps.map(c => `<g class="map-corp map-marker" data-map-item data-type="corp" data-id="${c.id}" data-name="${attr(c.label)}">
      <rect x="${c.x - 6}" y="${c.y - 6}" width="12" height="12" transform="rotate(45 ${c.x} ${c.y})" fill="#00e5ff" stroke="#07080c" stroke-width="1.5"></rect>
      <text x="${c.x + 9}" y="${c.y + 3}" class="map-marker-label">${esc(c.short)}</text>
    </g>`).join('')}</g>`;
  }
  function serviceSvg() {
    return `<g data-layer="services" class="map-services">${M.services.map(s => `<g class="map-service map-marker" data-map-item data-type="service" data-id="${s.id}" data-name="${attr(s.label)}">
      <rect x="${s.x - 5}" y="${s.y - 5}" width="10" height="10" fill="#35ff8a" stroke="#07080c" stroke-width="1.5"></rect>
      <text x="${s.x + 8}" y="${s.y + 3}" class="map-marker-label">${esc(s.label)}</text>
    </g>`).join('')}</g>`;
  }
  function placeSvg() {
    return `<g data-layer="places" class="map-places">${M.places.map(p => {
      const c = PLACE_COLORS[p.type] || '#ff8a00';
      return `<g class="map-place map-marker" data-map-item data-type="place" data-id="${p.id}" data-name="${attr(p.name)}">
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${c}" stroke="#07080c" stroke-width="1.5"></circle>
        <text x="${p.x + 7}" y="${p.y + 3}" class="map-marker-label">${esc(p.name)}</text>
      </g>`;
    }).join('')}</g>`;
  }

  /* ---------------- toolbar / side ---------------- */
  function jumpOptions() {
    const opt = (type, items, label) => `<optgroup label="${esc(label)}">${items.map(x => `<option value="${type}|${x.id}">${esc(x.name || x.label || x.id)}</option>`).join('')}</optgroup>`;
    return `<option value="">Перейти к объекту…</option>
      ${opt('district', M.districts, 'Районы')}
      ${opt('gang', M.gangs, 'Банды')}
      ${opt('corp', M.corps, 'Корпорации')}
      ${opt('service', M.services, 'Службы')}
      ${opt('place', M.places, 'Места')}`;
  }
  function layerChips() {
    const v = layerState();
    const items = [
      ['districts', 'Районы', v.districts],
      ['subdistricts', 'Подрайоны', v.subdistricts],
      ['gangs', 'Банды', v.gangs],
      ['corps', 'Корпорации', v.corps],
      ['services', 'Службы', v.services],
      ['places', 'Места', v.places],
    ];
    return items.map(([k, label, on]) => `<button class="chip ${on ? 'is-active' : ''}" data-action="map-layer" data-map-layer="${k}">${label}</button>`).join('');
  }
  function defaultSide() {
    return `<div class="map-side__head"><div class="eyebrow">ИНТЕРАКТИВНАЯ КАРТА</div><h3>Найт-Сити, 2077</h3></div>
      <p class="small">Нажимайте на районы и маркеры, включайте слои и находите места через «Перейти к объекту».</p>
      <div class="map-side__stats">
        <div><b>${M.districts.length}</b><span>районов</span></div>
        <div><b>${M.gangs.length}</b><span>банд</span></div>
        <div><b>${M.corps.length}</b><span>корпораций</span></div>
        <div><b>${M.places.length}</b><span>мест</span></div>
      </div>
      <div class="map-legend">
        <span><i class="map-dot map-dot--district"></i> район</span>
        <span><i class="map-dot map-dot--gang"></i> банда</span>
        <span><i class="map-dot map-dot--corp"></i> корпорация</span>
        <span><i class="map-dot map-dot--service"></i> служба</span>
        <span><i class="map-dot map-dot--place"></i> место</span>
      </div>
      <div class="callout small" style="margin-top:12px">Карта схематичная: границы и метки показывают, кто и что где контролирует, а не точные кварталы. Подложка — карта районов из официального справочника 2077.</div>`;
  }

  function findDistrict(id) { return M.districts.find(d => d.id === id); }
  function resolve(type, id) {
    if (type === 'district') {
      const d = findDistrict(id); const lore = L.districts.find(x => x.id === id);
      return d ? { type, id, name: d.name, point: d.label, data: d, lore, color: d.color } : null;
    }
    if (type === 'subdistrict') {
      const s = M.subdistricts.find(x => x.id === id); if (!s) return null;
      const d = findDistrict(s.district); const lore = L.districts.find(x => x.id === s.district);
      return { type, id, name: s.name, point: [s.x, s.y], data: s, district: d, lore };
    }
    if (type === 'gang') {
      const g = M.gangs.find(x => x.id === id); const lore = g && L.gangs.find(x => x.id === g.gangId);
      return g ? { type, id, name: g.label, point: [g.x, g.y], data: g, lore, color: GANG_COLORS[g.gangId] } : null;
    }
    if (type === 'corp') {
      const c = M.corps.find(x => x.id === id); const lore = c && L.corps.find(x => x.id === c.corpId);
      return c ? { type, id, name: c.label, point: [c.x, c.y], data: c, lore } : null;
    }
    if (type === 'service') {
      const s = M.services.find(x => x.id === id); const lore = s && L.services.find(x => x.id === s.serviceId);
      return s ? { type, id, name: s.label, point: [s.x, s.y], data: s, lore } : null;
    }
    if (type === 'place') {
      const p = M.places.find(x => x.id === id); if (!p) return null;
      const d = findDistrict(p.district);
      return { type, id, name: p.name, point: [p.x, p.y], data: p, district: d };
    }
    return null;
  }

  function sideHTML(info) {
    if (!info) return defaultSide();
    const t = TYPE_LABEL[info.type] || 'Объект';
    let body = '';
    if (info.type === 'district' && info.lore) {
      body = `<p class="small">${esc(info.lore.desc)}</p>
        <div class="map-side__meta"><span>Опасность: <b>${esc(info.lore.threat)}</b></span><span>Контроль: <b>${esc(info.lore.control)}</b></span></div>
        <div class="badge-row">${(info.lore.places || []).map(p => `<span class="tag">${esc(p)}</span>`).join('')}</div>
        <h4>Зацепки</h4><ul class="map-side__hooks">${(info.lore.hooks || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="gen-actions"><button class="btn btn--yellow btn--sm" data-action="map-dossier" data-type="district" data-id="${info.id}">${icon('book')} Досье района</button><a class="btn btn--sm" href="#/generators?tab=encounters" data-route="#/generators?tab=encounters">${icon('map')} Встречи</a></div>`;
    } else if (info.type === 'gang' && info.lore) {
      body = `<p class="small">${esc(info.lore.desc)}</p>
        <div class="map-side__meta"><span>${esc(info.lore.era)} · ${esc(info.lore.tag)}</span><span>Территория: <b>${esc(info.lore.territory)}</b></span></div>
        <div class="badge-row"><span class="tag tag--yellow">Хочет: ${esc(info.lore.want)}</span><span class="tag tag--red">Ненавидит: ${esc(info.lore.hate)}</span></div>
        <div class="gen-actions"><button class="btn btn--yellow btn--sm" data-action="map-dossier" data-type="gang" data-id="${info.id}">${icon('book')} Досье банды</button><a class="btn btn--sm" href="#/generators?tab=job" data-route="#/generators?tab=job">${icon('spark')} Работа</a></div>`;
    } else if (info.type === 'corp' && info.lore) {
      body = `<p class="small">${esc(info.lore.desc)}</p>
        <div class="map-side__meta"><span>Штаб: <b>${esc(info.lore.hq)}</b></span><span>Сотрудники: <b>${esc(info.lore.employees)}</b></span></div>
        <div class="badge-row"><span class="tag tag--yellow">Хочет: ${esc(info.lore.want)}</span></div>
        <div class="gen-actions"><button class="btn btn--yellow btn--sm" data-action="map-dossier" data-type="corp" data-id="${info.id}">${icon('book')} Досье корпорации</button><a class="btn btn--sm" href="#/generators?tab=job" data-route="#/generators?tab=job">${icon('spark')} Работа</a></div>`;
    } else if (info.type === 'service' && info.lore) {
      body = `<p class="small">${esc(info.lore.desc)}</p>
        <div class="map-side__meta"><span>Реакция: <b>${esc(info.lore.response)}</b></span><span>Стоимость: <b>${esc(info.lore.cost)}</b></span></div>
        <div class="gen-actions"><button class="btn btn--yellow btn--sm" data-action="map-dossier" data-type="service" data-id="${info.id}">${icon('book')} Досье службы</button></div>`;
    } else if (info.type === 'place') {
      const p = info.data;
      body = `<p class="small">${esc(p.desc)}</p>
        <div class="map-side__meta"><span>Тип: <b>${esc(PLACE_LABEL[p.type] || p.type)}</b></span><span>Район: <b>${esc(info.district ? info.district.name : '—')}</b></span></div>
        <div class="gen-actions">${info.district ? `<button class="btn btn--sm" data-action="map-select" data-type="district" data-id="${info.district.id}">${icon('map')} Район</button>` : ''}<a class="btn btn--yellow btn--sm" href="#/generators?tab=encounters" data-route="#/generators?tab=encounters">${icon('dice')} Встречи</a></div>`;
    } else if (info.type === 'subdistrict') {
      body = `<p class="small">Подрайон в составе района <b>${esc(info.district ? info.district.name : '—')}</b>.</p>
        <div class="gen-actions">${info.district ? `<button class="btn btn--yellow btn--sm" data-action="map-select" data-type="district" data-id="${info.district.id}">${icon('book')} Досье района</button>` : ''}</div>`;
    } else {
      body = `<p class="small dim">Для этого объекта пока нет расширенного описания.</p>`;
    }
    return `<div class="map-side__head"><div class="eyebrow">${t}</div><h3>${esc(info.name)}</h3></div>${body}`;
  }

  function select(type, id, focus) {
    const info = resolve(type, id);
    if (!info) return;
    ensureLayer(type);
    UI.$$('#map-stage [data-map-item]').forEach(el => {
      el.classList.toggle('is-selected', el.dataset.type === type && el.dataset.id === id);
    });
    const side = document.getElementById('map-side');
    if (side) side.innerHTML = sideHTML(info);
    if (focus) focusItem(info);
    hideTooltip();
  }

  function focusItem(info) {
    if (!info.point) return;
    const stage = document.getElementById('map-stage');
    if (!stage) return;
    const scale = Math.max(1.35, mapView.scale);
    const w = stage.clientWidth, h = stage.clientHeight;
    const px = info.point[0] / M.width * w;
    const py = info.point[1] / M.height * h;
    mapView.scale = scale;
    mapView.x = w / 2 - px * scale;
    mapView.y = h / 2 - py * scale;
    clampView(stage);
    applyView();
  }
  function applyView() {
    const canvas = document.getElementById('map-canvas');
    if (canvas) canvas.style.transform = `translate(${mapView.x}px, ${mapView.y}px) scale(${mapView.scale})`;
  }
  function clampView(stage) {
    const w = stage.clientWidth, h = stage.clientHeight;
    const minX = w - w * mapView.scale;
    const minY = h - h * mapView.scale;
    mapView.x = Math.min(0, Math.max(minX, mapView.x));
    mapView.y = Math.min(0, Math.max(minY, mapView.y));
  }
  function zoomBy(factor) {
    const stage = document.getElementById('map-stage');
    if (!stage) return;
    const old = mapView.scale;
    const next = Math.max(1, Math.min(3, old * factor));
    if (next === old) return;
    const cx = stage.clientWidth / 2, cy = stage.clientHeight / 2;
    mapView.x = cx - (cx - mapView.x) * (next / old);
    mapView.y = cy - (cy - mapView.y) * (next / old);
    mapView.scale = next;
    clampView(stage);
    applyView();
  }

  /* ---------------- tooltip ---------------- */
  function typeLabel(type) { return TYPE_LABEL[type] || 'Объект'; }
  function hideTooltip() {
    const t = document.getElementById('map-tooltip');
    if (t) t.classList.remove('is-visible');
  }
  function showTooltip(el, event) {
    const stage = document.getElementById('map-stage');
    const tip = document.getElementById('map-tooltip');
    if (!stage || !tip) return;
    const rect = stage.getBoundingClientRect();
    const name = el.dataset.name || '';
    const type = el.dataset.type || '';
    tip.innerHTML = `<b>${esc(name)}</b><span>${esc(typeLabel(type))}</span>`;
    tip.style.left = Math.min(rect.width - 170, Math.max(8, event.clientX - rect.left + 14)) + 'px';
    tip.style.top = Math.min(rect.height - 60, Math.max(8, event.clientY - rect.top + 14)) + 'px';
    tip.classList.add('is-visible');
  }

  /* ---------------- render ---------------- */
  function render() {
    if (!M.districts.length) return `<div class="empty"><b>Карта не загружена</b><div class="small">Проверьте data/map.js и assets/img/nc2077-map.jpg.</div></div>`;
    const v = layerState();
    return `<div class="map-toolbar">
      <div class="map-toolbar__layers"><span class="map-toolbar__label">Слои:</span><div class="chips">${layerChips()}</div></div>
      <select class="select map-jump" id="map-jump" aria-label="Перейти к объекту">${jumpOptions()}</select>
      <div class="map-zoom">
        <button class="btn btn--icon btn--sm" data-action="map-zoom-out" aria-label="Уменьшить">−</button>
        <button class="btn btn--icon btn--sm" data-action="map-zoom-in" aria-label="Увеличить">+</button>
        <button class="btn btn--sm" data-action="map-reset" title="Сбросить">${icon('refresh')}</button>
      </div>
    </div>
    <div class="map-layout">
      <div class="map-main">
        <div class="map-stage" id="map-stage">
          <div class="map-canvas" id="map-canvas">
            <img class="map-img" src="${attr(M.image)}" alt="Карта районов Найт-Сити, 2077" draggable="false">
            <svg class="map-svg" viewBox="0 0 ${M.width} ${M.height}" preserveAspectRatio="none" aria-label="Интерактивная карта Найт-Сити">
              ${districtSvg()}
              ${subdistrictSvg()}
              ${gangSvg()}
              ${corpSvg()}
              ${serviceSvg()}
              ${placeSvg()}
            </svg>
          </div>
          <div class="map-tooltip" id="map-tooltip"></div>
          <div class="map-hint">Клик — досье · колесо/кнопки — масштаб</div>
        </div>
        <div class="map-foot"><span>${esc(M.source || '')}</span><span>Схема: границы и метки условны</span></div>
      </div>
      <aside class="map-side" id="map-side">${defaultSide()}</aside>
    </div>`;
  }

  function setup() {
    const stage = document.getElementById('map-stage');
    const canvas = document.getElementById('map-canvas');
    if (!stage) return;
    mapView.scale = 1; mapView.x = 0; mapView.y = 0;
    applyView();
    applyLayers();

    let dragMoved = false;
    stage.addEventListener('click', (e) => {
      if (dragMoved) { dragMoved = false; return; }
      const el = e.target.closest('[data-map-item]');
      if (!el) return;
      select(el.dataset.type, el.dataset.id, false);
    });
    stage.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-map-item]');
      if (el) showTooltip(el, e);
    });
    stage.addEventListener('pointermove', (e) => {
      const el = e.target.closest('[data-map-item]');
      if (el) showTooltip(el, e); else hideTooltip();
    });
    stage.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-map-item]');
      if (el && !el.contains(e.relatedTarget)) hideTooltip();
    });

    let drag = null;
    const startDrag = (e) => {
      if (e.button != null && e.button !== 0) return;
      drag = { px: e.clientX, py: e.clientY, x: mapView.x, y: mapView.y };
      dragMoved = false;
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-dragging');
    };
    stage.addEventListener('pointerdown', startDrag);
    stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
      mapView.x = drag.x + dx;
      mapView.y = drag.y + dy;
      clampView(stage);
      applyView();
    });
    stage.addEventListener('pointerup', () => { drag = null; stage.classList.remove('is-dragging'); });
    stage.addEventListener('pointercancel', () => { drag = null; stage.classList.remove('is-dragging'); });

    const jump = document.getElementById('map-jump');
    if (jump) jump.addEventListener('change', () => {
      const [type, id] = jump.value.split('|');
      if (type && id) select(type, id, true);
      jump.value = '';
    });
    const side = document.getElementById('map-side');
    if (side && state.mapSelected) {
      // keep no auto-selection; a fresh map starts with the legend
    }
  }

  UI.mapPage = { render, setup, select };
  UI.actions['map-layer'] = (el) => {
    const key = el.dataset.mapLayer;
    const v = layerState();
    v[key] = !v[key];
    if (key === 'districts') v.districts = v.districts;
    saveState();
    applyLayers();
  };
  UI.actions['map-zoom-in'] = () => zoomBy(1.25);
  UI.actions['map-zoom-out'] = () => zoomBy(0.8);
  UI.actions['map-reset'] = () => {
    mapView.scale = 1; mapView.x = 0; mapView.y = 0;
    applyView();
    UI.$$('#map-stage [data-map-item]').forEach(el => el.classList.remove('is-selected'));
    const side = document.getElementById('map-side'); if (side) side.innerHTML = defaultSide();
  };
  UI.actions['map-select'] = (el) => select(el.dataset.type, el.dataset.id, true);
  UI.actions['map-dossier'] = (el) => {
    const type = el.dataset.type, id = el.dataset.id;
    if (type === 'district') UI.actions['open-district']({ dataset: { id } });
    else if (type === 'gang') UI.actions['open-gang']({ dataset: { id } });
    else if (type === 'corp') UI.actions['open-corp']({ dataset: { id } });
    else if (type === 'service') UI.actions['open-service']({ dataset: { id } });
  };
})();
