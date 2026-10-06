(() => {
  'use strict';
  const LEVELS = {
    operational: { rank: 0, label: '正常' },
    maintenance: { rank: 1, label: 'メンテナンス中' },
    degraded: { rank: 2, label: '一部に影響' },
    down: { rank: 3, label: '停止中' },
  };
  const SUMMARY = {
    operational: 'すべてのシステムは正常に稼働しています',
    maintenance: 'メンテナンスを実施しています',
    degraded: '一部のシステムに影響が出ています',
    down: 'システムの一部が停止しています',
  };
  const DAYS = 90;
  const DAY_MS = 864e5;
  const REFRESH_MS = 60e3;

  const $ = id => document.getElementById(id);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // Times in status-data.js are written in Japan time.
  const parse = value => {
    if (!value) return null;
    const date = new Date(String(value).trim().replace(' ', 'T') + ':00+09:00');
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const dayKey = date => new Date(date.getTime() + 9 * 36e5).toISOString().slice(0, 10);
  const dayStart = key => new Date(`${key}T00:00:00+09:00`);
  const jst = options => new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', ...options });
  const formatDateTime = jst({ year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatDay = jst({ month: 'long', day: 'numeric' });
  const formatClock = jst({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const duration = ms => {
    const minutes = Math.max(1, Math.round(ms / 6e4));
    const hours = Math.floor(minutes / 60);
    if (hours >= 24) return `${Math.floor(hours / 24)}日${hours % 24 ? `${hours % 24}時間` : ''}`;
    return hours ? `${hours}時間${minutes % 60 ? `${minutes % 60}分` : ''}` : `${minutes}分`;
  };
  const worse = (a, b) => (LEVELS[b].rank > LEVELS[a].rank ? b : a);

  function normalize(data, now) {
    const products = Array.isArray(data?.products) ? data.products : [];
    const incidents = (Array.isArray(data?.incidents) ? data.incidents : []).flatMap(item => {
      const start = parse(item?.start);
      const level = LEVELS[item?.level] && item.level !== 'operational' ? item.level : null;
      if (!start || !level || !products.includes(item.product)) {
        console.warn('status-data.js: 読み取れない行を無視しました', item);
        return [];
      }
      const end = parse(item.end);
      return [{ ...item, level, start, end, active: !end || end > now }];
    });
    incidents.sort((a, b) => b.start - a.start);
    return { products, incidents };
  }

  function render(data) {
    const now = new Date();
    const { products, incidents } = normalize(data, now);
    const active = incidents.filter(item => item.active && item.start <= now);

    let overall = 'operational';
    active.forEach(item => { overall = worse(overall, item.level); });
    $('summary').dataset.level = overall;
    $('summaryText').textContent = SUMMARY[overall];
    $('updated').textContent = `最終確認 ${formatClock.format(now)}`;

    const activeBox = $('active');
    activeBox.replaceChildren(...active.map(item => {
      const card = el('article', 'incident-card');
      card.dataset.level = item.level;
      const head = el('p', 'incident-head');
      head.append(el('span', 'incident-badge', LEVELS[item.level].label), el('span', null, item.product));
      card.append(head, el('h3', null, item.title || '詳細を確認しています'),
        el('p', 'incident-time', `${formatDateTime.format(item.start)} から対応中`));
      return card;
    }));

    const today = dayKey(now);
    const keys = Array.from({ length: DAYS }, (_, i) => dayKey(new Date(dayStart(today).getTime() - (DAYS - 1 - i) * DAY_MS)));
    $('products').replaceChildren(...products.map(name => {
      const mine = incidents.filter(item => item.product === name);
      let current = 'operational';
      mine.filter(item => item.active && item.start <= now).forEach(item => { current = worse(current, item.level); });

      const row = el('li', 'product-row');
      row.dataset.level = current;
      const head = el('div', 'product-head');
      head.append(el('h3', null, name), el('span', 'product-state', LEVELS[current].label));

      const bars = el('div', 'uptime');
      bars.setAttribute('role', 'img');
      let affectedDays = 0;
      keys.forEach(key => {
        const from = dayStart(key);
        const to = new Date(from.getTime() + DAY_MS);
        let level = 'operational';
        mine.forEach(item => {
          if (item.start < to && (item.end || now) > from) level = worse(level, item.level);
        });
        if (level !== 'operational') affectedDays += 1;
        const bar = el('span');
        bar.dataset.level = level;
        bar.title = `${formatDay.format(from)}：${level === 'operational' ? '障害なし' : LEVELS[level].label}`;
        bars.append(bar);
      });
      bars.setAttribute('aria-label', `過去${DAYS}日間で障害があった日：${affectedDays}日`);

      const scale = el('div', 'uptime-scale');
      const start = el('span');
      start.append(el('span', 'scale-long', `${DAYS}日前`), el('span', 'scale-short', '30日前'));
      scale.append(start, el('span', null, '今日'));
      row.append(head, bars, scale);
      return row;
    }));

    const past = incidents.filter(item => !item.active && now - item.start < DAYS * DAY_MS);
    $('history').replaceChildren(...(past.length ? past.map(item => {
      const li = el('li', 'history-row');
      li.dataset.level = item.level;
      const meta = el('p', 'history-meta');
      meta.append(el('span', null, item.product), el('span', null, LEVELS[item.level].label));
      li.append(meta, el('h3', null, item.title || '障害'),
        el('p', 'history-time', `${formatDateTime.format(item.start)}・${duration(item.end - item.start)}で復旧`));
      return li;
    }) : [el('li', 'history-empty', `過去${DAYS}日間に障害はありません。`)]));
  }

  // Reload the data file every minute so edits appear without refreshing the page.
  function refresh() {
    const script = document.createElement('script');
    script.src = `status-data.js?t=${Date.now()}`;
    script.onload = () => { script.remove(); render(window.HINOKO_STATUS); };
    script.onerror = () => { script.remove(); $('updated').textContent = '最新の情報を取得できませんでした'; };
    document.head.append(script);
  }

  render(window.HINOKO_STATUS);
  setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
