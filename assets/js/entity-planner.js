(() => {
  const cfg = Object.assign({
    appTitle: 'Entity',
    appSub: 'Planning',
    storageKey: 'entity_planner',
    reportTitle: 'Entity Report',
    reportFilename: 'entity-report'
  }, window.ENTITY_CONFIG || {});

  const STORAGE_KEY = cfg.storageKey;
  const fmt = (n, d = 0) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const byId = (id) => document.getElementById(id);

  let S = {
    settings: { name: cfg.appTitle, target: 500000, years: 10 },
    portfolio: [],
    cashflow: { income: 0, expenses: 0, debt: 0, invest: 0 },
    tax: { income: 0, deductions: 0 },
    lastUpdated: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) S = Object.assign(S, JSON.parse(raw));
    } catch (_) {}
  }

  function saveAll() {
    collect();
    S.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
    renderAll();
    const t = byId('save-toast');
    if (t) { t.textContent = 'Saved'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600); }
  }

  function collect() {
    const g = (id) => parseFloat(byId(id)?.value) || 0;
    S.cashflow = { income: g('cf-income'), expenses: g('cf-expenses'), debt: g('cf-debt'), invest: g('cf-invest') };
    S.tax = { income: g('tax-income'), deductions: g('tax-deductions') };
    S.settings = { name: byId('s-name')?.value || cfg.appTitle, target: g('s-target'), years: Math.max(1, parseInt(byId('s-years')?.value) || 10) };
  }

  function populate() {
    const s = (id, v) => { const el = byId(id); if (el) el.value = v ?? ''; };
    s('cf-income', S.cashflow.income); s('cf-expenses', S.cashflow.expenses); s('cf-debt', S.cashflow.debt); s('cf-invest', S.cashflow.invest);
    s('tax-income', S.tax.income); s('tax-deductions', S.tax.deductions);
    s('s-name', S.settings.name); s('s-target', S.settings.target); s('s-years', S.settings.years);
    if (byId('last-updated-label') && S.lastUpdated) byId('last-updated-label').textContent = 'Saved ' + new Date(S.lastUpdated).toLocaleString();
  }

  function addAsset() {
    const name = (byId('p-name')?.value || '').trim();
    if (!name) return;
    S.portfolio.push({
      id: Date.now(),
      name,
      category: byId('p-cat')?.value || 'Core',
      value: parseFloat(byId('p-value')?.value) || 0,
      cost: parseFloat(byId('p-cost')?.value) || 0
    });
    byId('p-name').value = ''; byId('p-value').value = ''; byId('p-cost').value = '';
    renderPortfolio();
  }

  function removeAsset(id) {
    S.portfolio = S.portfolio.filter(a => a.id !== id);
    renderPortfolio();
  }

  function totalPortfolio() { return S.portfolio.reduce((s, a) => s + (a.value || 0), 0); }

  function renderDashboard() {
    collect();
    const total = totalPortfolio();
    const surplus = S.cashflow.income - S.cashflow.expenses - S.cashflow.debt - S.cashflow.invest;
    const taxable = Math.max(0, S.tax.income - S.tax.deductions);
    const progress = S.settings.target > 0 ? Math.min(100, total / S.settings.target * 100) : 0;
    byId('kpi-row').innerHTML = `
      <div class="kpi gold"><div class="kpi-label">Portfolio</div><div class="kpi-value">${fmt(total)}</div></div>
      <div class="kpi ${surplus>=0?'green':'red'}"><div class="kpi-label">Monthly Surplus</div><div class="kpi-value">${fmt(surplus)}</div></div>
      <div class="kpi blue"><div class="kpi-label">Taxable Income</div><div class="kpi-value">${fmt(taxable)}</div></div>
      <div class="kpi"><div class="kpi-label">Target Progress</div><div class="kpi-value">${progress.toFixed(0)}%</div></div>
    `;
  }

  function renderPortfolio() {
    const tbody = byId('portfolio-body');
    const total = totalPortfolio();
    if (!tbody) return;
    if (!S.portfolio.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No assets yet</div></td></tr>`;
      byId('portfolio-foot').innerHTML = '';
      return;
    }
    tbody.innerHTML = S.portfolio.map(a => {
      const gain = (a.value || 0) - (a.cost || 0);
      const pct = total ? (a.value / total * 100) : 0;
      return `<tr>
        <td>${a.name}</td><td>${a.category}</td><td class="td-mono">${fmt(a.value)}</td>
        <td class="td-mono">${fmt(a.cost)}</td><td class="td-mono ${gain>=0?'td-green':'td-red'}">${fmt(gain)}</td>
        <td class="td-mono">${pct.toFixed(1)}% <button class="btn" style="margin-left:8px;padding:2px 8px" onclick="removeAsset(${a.id})">x</button></td>
      </tr>`;
    }).join('');
    byId('portfolio-foot').innerHTML = `<tr><td colspan="2"><strong>TOTAL</strong></td><td class="td-mono">${fmt(total)}</td><td colspan="3"></td></tr>`;
  }

  function renderProjections() {
    collect();
    const rows = [];
    let bal = totalPortfolio();
    for (let i = 0; i <= S.settings.years; i++) {
      if (i > 0) bal = bal * 1.08 + (S.cashflow.invest * 12);
      rows.push(`<tr><td>Y${i}</td><td class="td-mono">${fmt(bal)}</td><td>${bal >= S.settings.target ? 'On target' : ''}</td></tr>`);
    }
    byId('proj-table').innerHTML = `<table><thead><tr><th>Year</th><th>Projected Balance</th><th>Status</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }

  function exportData() {
    collect();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = `${cfg.reportFilename}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  }

  function exportEntityReport() {
    if (typeof window.jspdf === 'undefined') { alert('PDF library not loaded.'); return; }
    collect();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 14, pageW = doc.internal.pageSize.getWidth();
    const total = totalPortfolio();
    const surplus = S.cashflow.income - S.cashflow.expenses - S.cashflow.debt - S.cashflow.invest;
    const taxable = Math.max(0, S.tax.income - S.tax.deductions);
    const date = new Date().toLocaleDateString('en-US',{ day:'numeric', month:'long', year:'numeric' });

    doc.setFontSize(20); doc.text(cfg.appTitle, margin, 18);
    doc.setFontSize(12); doc.text(cfg.reportTitle, margin, 26);
    doc.setFontSize(9); doc.text(date, pageW - margin, 18, { align: 'right' });

    doc.autoTable({
      startY: 34,
      head: [['Metric', 'Value']],
      body: [
        ['Portfolio value', fmt(total)],
        ['Monthly surplus', fmt(surplus)],
        ['Taxable income', fmt(taxable)],
        ['Target', fmt(S.settings.target)],
        ['Projection years', String(S.settings.years)]
      ],
      margin: { left: margin, right: margin }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      head: [['Asset', 'Category', 'Value', 'Cost Base']],
      body: S.portfolio.length ? S.portfolio.map(a => [a.name, a.category, fmt(a.value), fmt(a.cost)]) : [['No assets', '-', '-', '-']],
      margin: { left: margin, right: margin }
    });

    doc.setFontSize(8);
    doc.text('Information only. Not financial advice.', margin, 292);
    doc.save(`${cfg.reportFilename}-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    byId('page-' + id)?.classList.add('active');
    byId('tab-' + id)?.classList.add('active');
    if (id === 'dashboard') renderDashboard();
    if (id === 'portfolio') renderPortfolio();
    if (id === 'projections') renderProjections();
  }

  function renderAll() {
    populate();
    renderDashboard();
    renderPortfolio();
    renderProjections();
  }

  window.showPage = showPage;
  window.saveAll = saveAll;
  window.exportData = exportData;
  window.exportEntityReport = exportEntityReport;
  window.addAsset = addAsset;
  window.removeAsset = removeAsset;

  document.addEventListener('click', (e) => {
    const dd = byId('header-actions');
    if (!dd) return;
    if (e.target.closest('#header-actions-toggle')) dd.classList.toggle('open');
    else if (!e.target.closest('#header-actions')) dd.classList.remove('open');
  });

  load();
  renderAll();
})();
