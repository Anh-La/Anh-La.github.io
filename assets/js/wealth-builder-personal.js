const STORAGE_KEY = 'wealthbuilder_personal_v2';
const LANG_KEY = 'wealthbuilder_personal_lang';
let LANG = localStorage.getItem(LANG_KEY) || 'en';

const TRANSLATIONS = {
  en: {
    appTitle:'Individual', appSub:'Finance & Planning',
    btnSave:'Save', btnExport:'↓ Export', btnReport:'Net worth report', btnLangToggle:'🌐 Tiếng Việt',
    btnAdd:'+ Add', btnAddDebt:'+ Add Debt', btnRunProj:'Run Projections',
    btnSaveSettings:'Save Settings', btnSaveTargets:'Save Targets',
    btnExportJson:'↓ Export JSON', btnImportJson:'↑ Import JSON', btnClearAll:'⚠ Clear All',
    tabDashboard:'📊 Dashboard', tabPortfolio:'💼 Portfolio', tabCashflow:'💸 Cashflow',
    tabDebt:'🧹 Debt & Loans', tabTax:'🧾 Tax & Documents', tabProjections:'📈 Projections', tabSettings:'⚙️ Settings',
    dashTitle:'Overview', dashSub:'Your financial life on one screen',
    dashAlloc:'Portfolio Allocation vs Target', dashFI:'Financial Freedom Progress',
    dashFIYearSub:'years to freedom target', dashCashflow:'Monthly Cashflow Summary',
    dashDebt:'Debt Paydown Status', dashRoadmap:'Personal Action Roadmap',
    portTitle:'Personal Portfolio', portSub:'Taxable & personal accounts',
    projTableYear:'Year', projTableAge:'Age', projTableCons:'Conservative (5%)',
    projTableBase:'Base (8%)', projTableOpt:'Optimistic (11%)', projTableFI:'Freedom Target?',
    settingsTitle:'Settings & Profile', settingsSub:'Strategy parameters & data management',
    settingsProfile:'Investor Profile', settingsName:'Name', settingsAge:'Current Age',
    settingsFIAge:'Freedom Target Age', settingsFITarget:'Freedom Portfolio Target ($)',
    settingsRisk:'Risk Profile', settingsInflation:'Inflation (% p.a.)',
    settingsEmergency:'Emergency Fund Target ($)', settingsTargetAlloc:'Target Allocations (%)',
    settingsDataMgmt:'Data Management', toastSaved:'✓ Saved', savedPrefix:'Saved ',
    reportGenerating:'Generating LifePlan report…', reportReady:'Client report downloaded'
  },
  vi: {
    appTitle:'Cá Nhân', appSub:'Tài chính & Kế hoạch',
    btnSave:'Lưu', btnExport:'↓ Xuất', btnReport:'Net worth report', btnLangToggle:'🌐 English',
    btnExportJson:'↓ Xuất JSON', btnImportJson:'↑ Nhập JSON', btnClearAll:'⚠ Xóa Tất Cả',
    toastSaved:'✓ Đã Lưu', savedPrefix:'Đã lưu ',
    reportGenerating:'Đang tạo báo cáo LifePlan…', reportReady:'Đã tải báo cáo khách hàng'
  }
};

function t(k){ return (TRANSLATIONS[LANG]&&TRANSLATIONS[LANG][k])||TRANSLATIONS.en[k]||k; }
function toggleLanguage(){ LANG=LANG==='en'?'vi':'en'; localStorage.setItem(LANG_KEY,LANG); applyLanguage(); refreshAll(); }
function applyLanguage(){
  const sub=t('appSub');
  document.title=sub? (t('appTitle')+' · '+sub) : t('appTitle');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const v=t(el.getAttribute('data-i18n')); if(v) el.textContent=v; });
}

const DEFAULT_STATE = {
  settings:{ name:'Client', planner:'', age:42, fiAge:48, fiTarget:1200000, risk:'Balanced-Growth', inflation:5, emergency:28000 },
  targets:{ STRC:25, SATA:15, 'US ETF':20, 'Commercial RE':15, Bitcoin:10, Gold:10, Cash:5 },
  holdings:[
    { id:1, name:'STRC', cat:'STRC', qty:55, price:0, cost:0, drip:'Yes' },
    { id:2, name:'Bitcoin', cat:'Bitcoin', qty:0.05, price:0, cost:0, drip:'No' },
    { id:3, name:'Gold Shares', cat:'Gold', qty:0, price:0, cost:0, drip:'No' }
  ],
  debts:[
    { id:1, name:'Credit Card', type:'Credit Card', original:4195, balance:4195, rate:20, payment:500 },
    { id:2, name:'Prepayment Liability', type:'Prepayment Liability', original:4855, balance:4855, rate:0, payment:300 }
  ],
  cashflow:{ salary:5500, other:0, rent:410, groceries:150, fuel:60, electricity:40, transport:17, gym:90,
    bball:200, school:550, play:50, invest:2000, debtRepay:500 },
  projections:{ start:0, monthly:2000, wage:3.5 },
  tax:{ salary:0, interest:0, dividends:0, rental:0, otherIncome:0, workExp:0, homeOffice:0, vehicle:0, invFees:0, donations:0, otherDed:0 },
  receipts:[],
  vault:[],
  lastUpdated:null
};

let S = JSON.parse(JSON.stringify(DEFAULT_STATE));
let donutChart,cashflowBarChart,debtChartInst,projChartInst;
const COLORS=['#c8a96e','#5c9eff','#4ecb8a','#e06b6b','#f59e0b','#a78bfa','#64748b'];
const CAT_COLORS={ STRC:'#c8a96e',SATA:'#5c9eff','US ETF':'#4ecb8a','Commercial RE':'#e06b6b',Bitcoin:'#f59e0b',Gold:'#a78bfa',Cash:'#64748b',Other:'#94a3b8' };

const fmt=(n,d=0)=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtNum=(n,d=2)=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

function loadState(){ try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),JSON.parse(raw)); }catch(e){} }
function saveAll(){
  collectCashflow(); collectProjections(); collectSettings(); collectTax();
  S.lastUpdated=new Date().toISOString();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(S));
  const toast=document.getElementById('save-toast');
  toast.textContent=t('toastSaved'); toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1800);
  updateLastUpdated(); refreshAll();
}
function updateLastUpdated(){
  const el=document.getElementById('last-updated-label');
  if(S.lastUpdated){ const d=new Date(S.lastUpdated); el.textContent=t('savedPrefix')+d.toLocaleString(LANG==='vi'?'vi-VN':'en-US',{dateStyle:'short',timeStyle:'short'}); }
}
function exportData(){
  collectCashflow(); collectProjections(); collectSettings(); collectTax();
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));
  a.download='financial-planner-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
}
function importData(e){
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{ try{ S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),JSON.parse(ev.target.result));
    localStorage.setItem(STORAGE_KEY,JSON.stringify(S)); populateForms(); refreshAll(); alert('Imported!'); }catch(err){ alert('Invalid file.'); } };
  r.readAsText(file);
}
function clearAll(){ if(!confirm('Clear ALL data?')) return; S=JSON.parse(JSON.stringify(DEFAULT_STATE)); localStorage.removeItem(STORAGE_KEY); populateForms(); refreshAll(); }

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(tb=>tb.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.getElementById('tab-'+id).classList.add('active');
  refreshPage(id);
}
function currentPage(){ const p=document.querySelector('.page.active'); return p?p.id.replace('page-',''):'dashboard'; }
function refreshAll(){ refreshPage(currentPage()); }
function refreshPage(id){
  if(id==='dashboard') renderDashboard();
  if(id==='portfolio') renderPortfolio();
  if(id==='cashflow') renderCashflow();
  if(id==='debt') renderDebt();
  if(id==='tax') renderTax();
  if(id==='projections') renderProjections();
  if(id==='settings') renderSettings();
}

function totalValue(h){ return (h.qty||0)*(h.price||0); }
function totalPortfolioValue(){ return S.holdings.reduce((s,h)=>s+totalValue(h),0); }
function allocationByCategory(){
  const map={}, total=totalPortfolioValue();
  S.holdings.forEach(h=>{ const v=totalValue(h); map[h.cat]=(map[h.cat]||0)+v; });
  const result={}; Object.keys(map).forEach(k=>{ result[k]=total>0?map[k]/total*100:0; }); return result;
}
function calcMonthlyExpenses(cf){
  const w=n=>(cf[n]||0)*52/12, f=n=>(cf[n]||0)*26/12, q=n=>(cf[n]||0)/3;
  return w('rent')+w('groceries')+w('fuel')+w('electricity')+w('transport')+w('play')+f('gym')+q('bball')+q('school');
}
function monthsToPayoff(balance,rate,payment){
  if(payment<=0) return 999; const r=rate/100/12;
  if(r===0) return Math.ceil(balance/payment);
  if(payment<=balance*r) return 999;
  return Math.ceil(-Math.log(1-(balance*r)/payment)/Math.log(1+r));
}

function addHolding(){
  const name=document.getElementById('h-name').value.trim();
  if(!name) return;
  S.holdings.push({ id:Date.now(), name, cat:document.getElementById('h-cat').value,
    qty:parseFloat(document.getElementById('h-qty').value)||0,
    price:parseFloat(document.getElementById('h-price').value)||0,
    cost:parseFloat(document.getElementById('h-cost').value)||0,
    drip:document.getElementById('h-drip').value });
  ['h-name','h-qty','h-price','h-cost'].forEach(id=>document.getElementById(id).value='');
  renderPortfolio();
}
function removeHolding(id){ S.holdings=S.holdings.filter(h=>h.id!==id); renderPortfolio(); }
function updateHoldingPrice(id,val){ const h=S.holdings.find(x=>x.id===id); if(h) h.price=parseFloat(val)||0; renderPortfolio(); }

function addDebt(){
  const name=document.getElementById('d-name').value.trim(); if(!name) return;
  S.debts.push({ id:Date.now(), name, type:document.getElementById('d-type').value,
    original:parseFloat(document.getElementById('d-original').value)||0,
    balance:parseFloat(document.getElementById('d-balance').value)||0,
    rate:parseFloat(document.getElementById('d-rate').value)||0,
    payment:parseFloat(document.getElementById('d-payment').value)||0 });
  ['d-name','d-original','d-balance','d-rate','d-payment'].forEach(id=>document.getElementById(id).value='');
  renderDebt();
}
function removeDebt(id){ S.debts=S.debts.filter(d=>d.id!==id); renderDebt(); }
function updateDebtBalance(id,val){ const d=S.debts.find(x=>x.id===id); if(d) d.balance=parseFloat(val)||0; renderDebt(); }

function collectCashflow(){
  const g=id=>parseFloat(document.getElementById(id)?.value)||0;
  S.cashflow={ salary:g('cf-salary'), other:g('cf-other'), rent:g('exp-rent'), groceries:g('exp-groceries'),
    fuel:g('exp-fuel'), electricity:g('exp-electricity'), transport:g('exp-transport'), gym:g('exp-gym'),
    bball:g('exp-bball'), school:g('exp-school'), play:g('exp-play'), invest:g('cf-invest'), debtRepay:g('cf-debt-repay') };
}
function collectProjections(){
  const g=id=>parseFloat(document.getElementById(id)?.value)||0;
  S.projections={ start:g('proj-start'), monthly:g('proj-monthly'), wage:g('proj-wage') };
}
function collectSettings(){
  S.settings={ name:document.getElementById('s-name')?.value||S.settings.name,
    planner:document.getElementById('s-planner')?.value||S.settings.planner||'',
    age:parseInt(document.getElementById('s-age')?.value)||S.settings.age,
    fiAge:parseInt(document.getElementById('s-fi-age')?.value)||S.settings.fiAge,
    fiTarget:parseFloat(document.getElementById('s-fi-target')?.value)||S.settings.fiTarget,
    risk:document.getElementById('s-risk')?.value||S.settings.risk,
    inflation:parseFloat(document.getElementById('s-inflation')?.value)||S.settings.inflation,
    emergency:parseFloat(document.getElementById('s-emergency')?.value)||S.settings.emergency };
}
function collectTax(){
  const g=id=>parseFloat(document.getElementById(id)?.value)||0;
  S.tax={ salary:g('tax-salary'), interest:g('tax-interest'), dividends:g('tax-dividends'), rental:g('tax-rental'),
    otherIncome:g('tax-other-income'), workExp:g('tax-work-exp'), homeOffice:g('tax-home-office'),
    vehicle:g('tax-vehicle'), invFees:g('tax-inv-fees'), donations:g('tax-donations'), otherDed:g('tax-other-ded') };
}

function populateForms(){
  const s=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v??''; };
  const cf=S.cashflow;
  s('cf-salary',cf.salary); s('cf-other',cf.other);
  ['rent','groceries','fuel','electricity','transport','gym','bball','school','play'].forEach(k=>{
    s(k==='rent'?'exp-rent':k==='groceries'?'exp-groceries':k==='fuel'?'exp-fuel':k==='electricity'?'exp-electricity':k==='transport'?'exp-transport':k==='gym'?'exp-gym':k==='bball'?'exp-bball':k==='school'?'exp-school':'exp-play', cf[k]);
  });
  s('cf-invest',cf.invest); s('cf-debt-repay',cf.debtRepay);
  s('proj-start',S.projections.start); s('proj-monthly',S.projections.monthly); s('proj-wage',S.projections.wage);
  s('s-name',S.settings.name); s('s-planner',S.settings.planner); s('s-age',S.settings.age); s('s-fi-age',S.settings.fiAge);
  s('s-fi-target',S.settings.fiTarget); s('s-risk',S.settings.risk); s('s-inflation',S.settings.inflation); s('s-emergency',S.settings.emergency);
  const tx=S.tax||{};
  s('tax-salary',tx.salary); s('tax-interest',tx.interest); s('tax-dividends',tx.dividends); s('tax-rental',tx.rental);
  s('tax-other-income',tx.otherIncome); s('tax-work-exp',tx.workExp); s('tax-home-office',tx.homeOffice);
  s('tax-vehicle',tx.vehicle); s('tax-inv-fees',tx.invFees); s('tax-donations',tx.donations); s('tax-other-ded',tx.otherDed);
}

function getRoadmap(){
  return [
    { phase:'Phase 1', timeframe:'Months 1–6', priority:'Debt Clearance', action:'Pay off high-interest debt first.', status:'Priority' },
    { phase:'Phase 2', timeframe:'Months 7–12', priority:'Debt-Free', action:'Clear remaining liabilities. Top up emergency fund.', status:'Next' },
    { phase:'Phase 3', timeframe:'Year 2', priority:'Core Holdings', action:'Build STRC, SATA, US ETF and Gold positions per target allocation.', status:'Planned' },
    { phase:'Phase 4', timeframe:'Years 3–5', priority:'Diversification', action:'Expand Commercial RE and alternative exposure.', status:'Planned' },
    { phase:'Phase 5', timeframe:'Age '+S.settings.fiAge, priority:'Financial Freedom', action:'Portfolio income covers living expenses.', status:'Goal' }
  ];
}

function renderDashboard(){
  collectCashflow();
  const totalPV=totalPortfolioValue(), cf=S.cashflow, monthlyExp=calcMonthlyExpenses(cf);
  const totalDebt=S.debts.reduce((s,d)=>s+(d.balance||0),0);
  const netWorth=totalPV-totalDebt;
  const surplus=cf.salary+cf.other-monthlyExp-cf.invest-cf.debtRepay;
  const fiYears=Math.max(0,S.settings.fiAge-S.settings.age);
  const cashVal=S.holdings.filter(h=>h.cat==='Cash').reduce((s,h)=>s+totalValue(h),0);
  const emergencyPct=Math.min(100,cashVal/(S.settings.emergency||1)*100);
  const debtOrig=S.debts.reduce((s,d)=>s+(d.original||0),0)||1;
  const debtClearPct=Math.min(100,100-totalDebt/debtOrig*100);
  const fiPct=Math.min(100,totalPV/(S.settings.fiTarget||1)*100);

  document.getElementById('kpi-row').innerHTML=`
    <div class="kpi gold"><div class="kpi-label">Portfolio Value</div><div class="kpi-value">${fmt(totalPV)}</div><div class="kpi-sub">Personal investments</div></div>
    <div class="kpi ${netWorth>=0?'green':'red'}"><div class="kpi-label">Net Worth</div><div class="kpi-value">${fmt(netWorth)}</div><div class="kpi-sub">Portfolio − debts</div></div>
    <div class="kpi blue"><div class="kpi-label">Monthly Surplus</div><div class="kpi-value">${fmt(surplus)}</div><div class="kpi-delta ${surplus>=0?'pos':'neg'}">${surplus>=0?'▲ Positive':'▼ Deficit'}</div></div>
    <div class="kpi ${totalDebt>0?'red':'green'}"><div class="kpi-label">Total Debt</div><div class="kpi-value">${fmt(totalDebt)}</div></div>`;

  document.getElementById('fi-years-left').textContent=fiYears;
  document.getElementById('fi-progress-bars').innerHTML=[
    { label:'Freedom Portfolio Target', pct:fiPct, color:'var(--accent)' },
    { label:'Emergency Fund', pct:emergencyPct, color:'var(--accent2)' },
    { label:'Debt Clearance', pct:debtClearPct, color:'var(--accent3)' }
  ].map(b=>`<div class="progress-wrap"><div class="progress-header"><span class="progress-label">${b.label}</span><span class="progress-val">${b.pct.toFixed(0)}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${b.pct}%;background:${b.color}"></div></div></div>`).join('');

  const alloc=allocationByCategory(), cats=Object.keys(S.targets);
  if(donutChart) donutChart.destroy();
  donutChart=new Chart(document.getElementById('donut-chart').getContext('2d'),{
    type:'doughnut', data:{ labels:cats, datasets:[{ data:cats.map(c=>alloc[c]||0), backgroundColor:COLORS, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, cutout:'70%' }
  });
  document.getElementById('donut-legend').innerHTML=cats.map((c,i)=>`<div class="legend-item"><div class="legend-dot" style="background:${COLORS[i]}"></div><span class="legend-name">${c}</span><span class="legend-pct">${(alloc[c]||0).toFixed(1)}% (tgt ${S.targets[c]}%)</span></div>`).join('');

  const income=cf.salary+cf.other;
  if(cashflowBarChart) cashflowBarChart.destroy();
  cashflowBarChart=new Chart(document.getElementById('cashflow-bar').getContext('2d'),{
    type:'bar', data:{ labels:['Income','Living','Invest','Debt','Surplus'],
      datasets:[{ data:[income,monthlyExp,cf.invest,cf.debtRepay,Math.max(0,surplus)],
        backgroundColor:['#4ecb8a','#e06b6b','#c8a96e','#f59e0b','#64748b'], borderRadius:4, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } },
      scales:{ x:{ ticks:{ color:'#7a7f8e',font:{size:10}} }, y:{ ticks:{ color:'#7a7f8e', callback:v=>'$'+(v/1000).toFixed(0)+'k' } } } }
  });

  const totalOrig=S.debts.reduce((s,d)=>s+(d.original||0),0), paidOff=totalOrig-S.debts.reduce((s,d)=>s+(d.balance||0),0);
  document.getElementById('debt-summary-panel').innerHTML=S.debts.length?S.debts.map(d=>{
    const paid=Math.min(100,((d.original-d.balance)/(d.original||1))*100);
    const mo=monthsToPayoff(d.balance,d.rate,d.payment);
    return `<div class="progress-wrap"><div class="progress-header"><span class="progress-label">${d.name}</span><span class="progress-val">${fmt(d.balance)} · ${mo<999?mo+' mo':'∞'}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${paid}%;background:var(--accent4)"></div></div></div>`;
  }).join('')+`<div style="margin-top:12px;font-size:12px;color:var(--muted)">Repaid: <span class="td-green">${fmt(paidOff)}</span> of ${fmt(totalOrig)}</div>`:'<div class="empty-state"><div class="icon">✓</div>Debt free</div>';

  const roadmap=getRoadmap();
  document.getElementById('roadmap-table').innerHTML=`<table><thead><tr><th>Phase</th><th>Timeframe</th><th>Priority</th><th>Action</th><th>Status</th></tr></thead><tbody>${roadmap.map(r=>`<tr><td class="td-gold">${r.phase}</td><td class="td-mono td-muted">${r.timeframe}</td><td style="font-weight:600">${r.priority}</td><td>${r.action}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
}

function renderPortfolio(){
  const total=totalPortfolioValue(), tbody=document.getElementById('holdings-tbody'), tfoot=document.getElementById('holdings-tfoot');
  if(!S.holdings.length){ tbody.innerHTML='<tr><td colspan="10"><div class="empty-state"><div class="icon">📂</div>No holdings yet</div></td></tr>'; tfoot.innerHTML=''; document.getElementById('allocation-bars').innerHTML=''; return; }
  tbody.innerHTML=S.holdings.map(h=>{
    const val=totalValue(h), gain=val-(h.cost||0), gainPct=h.cost>0?gain/h.cost*100:0, portPct=total>0?val/total*100:0;
    return `<tr><td style="font-weight:600">${h.name}</td><td><span class="badge badge-gold">${h.cat}</span></td>
      <td class="td-mono">${fmtNum(h.qty,4)}</td>
      <td class="td-mono"><input type="number" value="${h.price}" step="any" style="width:100px;padding:4px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text)" onchange="updateHoldingPrice(${h.id},this.value)"></td>
      <td class="td-mono td-gold">${fmt(val)}</td><td class="td-mono td-muted">${fmt(h.cost)}</td>
      <td class="td-mono ${gain>=0?'td-green':'td-red'}">${gain>=0?'+':''}${fmt(gain)} (${gainPct.toFixed(1)}%)</td>
      <td class="td-mono">${portPct.toFixed(1)}%</td>
      <td>${h.drip==='Yes'?'<span class="badge badge-green">DRIP</span>':'—'}</td>
      <td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4);border-color:var(--accent4)" onclick="removeHolding(${h.id})">✕</button></td></tr>`;
  }).join('');
  const totalCost=S.holdings.reduce((s,h)=>s+(h.cost||0),0), totalGain=total-totalCost;
  tfoot.innerHTML=`<tr style="background:rgba(200,169,110,.05)"><td colspan="4" style="font-weight:700;color:var(--accent)">TOTAL</td><td class="td-mono td-gold" style="font-weight:700">${fmt(total)}</td><td class="td-mono">${fmt(totalCost)}</td><td class="td-mono ${totalGain>=0?'td-green':'td-red'}">${fmt(totalGain)}</td><td>100%</td><td colspan="2"></td></tr>`;
  const alloc=allocationByCategory();
  document.getElementById('allocation-bars').innerHTML=Object.entries(S.targets).map(([cat,tgt])=>{
    const actual=alloc[cat]||0, color=CAT_COLORS[cat]||'#64748b';
    return `<div class="progress-wrap"><div class="progress-header"><span class="progress-label">${cat}</span><span class="progress-val">${actual.toFixed(1)}% vs ${tgt}%</span></div><div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${Math.min(100,actual/tgt*100||0)}%;background:${color}"></div></div></div>`;
  }).join('');
}

function renderCashflow(){
  populateForms(); collectCashflow(); const cf=S.cashflow;
  const w=n=>n*52/12, f=n=>n*26/12, q=n=>n/3;
  const items=[{l:'Rent',m:w(cf.rent)},{l:'Groceries',m:w(cf.groceries)},{l:'Fuel',m:w(cf.fuel)},{l:'Electricity',m:w(cf.electricity)},{l:'Transport',m:w(cf.transport)},{l:'Play',m:w(cf.play)},{l:'Gym',m:f(cf.gym)},{l:'Basketball',m:q(cf.bball)},{l:'School',m:q(cf.school)}];
  const monthlyExp=items.reduce((s,i)=>s+i.m,0), income=cf.salary+cf.other, totalOut=monthlyExp+cf.invest+cf.debtRepay, surplus=income-totalOut;
  document.getElementById('cf-summary').innerHTML=`
    <div class="grid-2" style="margin-bottom:16px"><div><div class="label">Income</div><div style="font-family:var(--font-mono);font-size:22px;color:var(--accent3)">${fmt(income)}</div></div>
    <div><div class="label">Outgoings</div><div style="font-family:var(--font-mono);font-size:22px;color:var(--accent4)">${fmt(totalOut)}</div></div></div>
    <div class="divider"></div><div class="label">Net Surplus</div><div style="font-family:var(--font-mono);font-size:28px;color:${surplus>=0?'var(--accent3)':'var(--accent4)'}">${fmt(surplus)}</div>
    <div class="divider"></div><table><thead><tr><th>Expense</th><th>Monthly</th></tr></thead><tbody>
    ${items.map(i=>`<tr><td>${i.l}</td><td class="td-mono">${fmt(i.m)}</td></tr>`).join('')}
    <tr><td>Investments</td><td class="td-mono td-gold">${fmt(cf.invest)}</td></tr>
    <tr><td>Debt repay</td><td class="td-mono td-red">${fmt(cf.debtRepay)}</td></tr></tbody></table>`;
  const rows=[]; for(let yr=0;yr<=6;yr++){ const factor=Math.pow(1+(S.settings.inflation||5)/100,yr);
    rows.push({yr,exp:monthlyExp*factor,invest:cf.invest*Math.pow(1.035,yr)}); }
  document.getElementById('cf-inflation-table').innerHTML=`<table><thead><tr><th>Year</th><th>Age</th><th>Expenses</th><th>Investment</th><th>Surplus</th></tr></thead><tbody>${rows.map(r=>{
    const inc=cf.salary*Math.pow(1.035,r.yr), sur=inc-r.exp-r.invest;
    return `<tr><td>${r.yr===0?'Now':'Y'+r.yr}</td><td>${S.settings.age+r.yr}</td><td class="td-mono">${fmt(r.exp)}</td><td class="td-mono">${fmt(r.invest)}</td><td class="td-mono ${sur>=0?'td-green':'td-red'}">${fmt(sur)}</td></tr>`;
  }).join('')}</tbody></table>`;
}

function renderDebt(){
  const totalDebt=S.debts.reduce((s,d)=>s+(d.balance||0),0);
  const totalInterest=S.debts.reduce((s,d)=>s+(d.balance||0)*(d.rate||0)/100/12,0);
  document.getElementById('total-debt-kpi').textContent=fmt(totalDebt);
  document.getElementById('monthly-interest-kpi').textContent=fmt(totalInterest);
  const maxMo=S.debts.reduce((m,d)=>Math.max(m,monthsToPayoff(d.balance,d.rate,d.payment)),0);
  if(maxMo<999){ const d=new Date(); d.setMonth(d.getMonth()+maxMo);
    document.getElementById('debt-payoff-date').textContent='Est. cleared: '+d.toLocaleDateString('en-US',{month:'short',year:'numeric'}); }
  const tbody=document.getElementById('debt-tbody');
  tbody.innerHTML=S.debts.length?S.debts.map(d=>{
    const mo=monthsToPayoff(d.balance,d.rate,d.payment), paid=d.original>0?Math.min(100,(d.original-d.balance)/d.original*100):0;
    return `<tr><td style="font-weight:600">${d.name}</td><td><span class="badge badge-red">${d.type}</span></td>
      <td class="td-mono">${fmt(d.original)}</td><td class="td-mono"><input type="number" value="${d.balance}" style="width:110px;padding:4px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text)" onchange="updateDebtBalance(${d.id},this.value)"></td>
      <td class="td-mono">${d.rate}%</td><td class="td-mono">${fmt(d.payment)}</td><td class="td-mono">${mo<999?mo+' mo':'∞'}</td>
      <td><div class="progress-bar"><div class="progress-fill" style="width:${paid}%;background:var(--accent3)"></div></div></td>
      <td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4);border-color:var(--accent4)" onclick="removeDebt(${d.id})">✕</button></td></tr>`;
  }).join(''):'<tr><td colspan="9"><div class="empty-state">✅ No debts</div></td></tr>';
  const months=Math.min(48,S.debts.length?Math.max(...S.debts.map(d=>monthsToPayoff(d.balance,d.rate,d.payment)).filter(m=>m<999))+3:24);
  const labels=Array.from({length:months},(_,i)=>'M'+(i+1));
  const datasets=S.debts.map((d,i)=>{ let bal=d.balance; const data=[bal];
    for(let m=0;m<months-1;m++){ const interest=bal*(d.rate/100/12); bal=Math.max(0,bal+interest-d.payment); data.push(bal); }
    return { label:d.name, data, borderColor:['#e06b6b','#f59e0b','#5c9eff'][i%3], tension:.3, borderWidth:2 }; });
  if(debtChartInst) debtChartInst.destroy();
  debtChartInst=new Chart(document.getElementById('debt-chart').getContext('2d'),{ type:'line', data:{labels,datasets},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#7a7f8e' } } },
      scales:{ x:{ ticks:{ color:'#7a7f8e', maxTicksLimit:12 } }, y:{ ticks:{ color:'#7a7f8e', callback:v=>'$'+v.toLocaleString() } } } } });
}

function calcLoan(){
  const bal=parseFloat(document.getElementById('la-balance').value)||0;
  const r1=(parseFloat(document.getElementById('la-current-rate').value)||0)/100/12;
  const r2=(parseFloat(document.getElementById('la-new-rate').value)||0)/100/12;
  const n=parseInt(document.getElementById('la-term').value)||36;
  const pmt=(r,b,n)=>r===0?b/n:b*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const p1=pmt(r1,bal,n), p2=pmt(r2,bal,n);
  const total1=p1*n, total2=p2*n, save=total1-total2;
  document.getElementById('loan-analyser-result').innerHTML=`
    <div class="grid-3"><div class="kpi red"><div class="kpi-label">Current payment</div><div class="kpi-value">${fmt(p1)}</div></div>
    <div class="kpi green"><div class="kpi-label">Better rate payment</div><div class="kpi-value">${fmt(p2)}</div></div>
    <div class="kpi gold"><div class="kpi-label">Total interest saved</div><div class="kpi-value">${fmt(save)}</div></div></div>`;
}

function calcTax(){
  collectTax(); const tx=S.tax;
  const gross=tx.salary+tx.interest+tx.dividends+tx.rental+tx.otherIncome;
  const ded=tx.workExp+tx.homeOffice+tx.vehicle+tx.invFees+tx.donations+tx.otherDed;
  const receiptDed=(S.receipts||[]).reduce((s,r)=>s+(r.amount||0),0);
  const taxable=Math.max(0,gross-ded-receiptDed);
  document.getElementById('tax-summary').innerHTML=`
    <div class="grid-3">
      <div class="kpi blue"><div class="kpi-label">Total Income</div><div class="kpi-value">${fmt(gross)}</div></div>
      <div class="kpi gold"><div class="kpi-label">Total Deductions</div><div class="kpi-value">${fmt(ded+receiptDed)}</div></div>
      <div class="kpi green"><div class="kpi-label">Est. Taxable Income</div><div class="kpi-value">${fmt(taxable)}</div></div>
    </div><p style="margin-top:12px;font-size:12px;color:var(--muted)">Summary for accountant review — not a tax calculation.</p>`;
}

function addReceipt(){
  const desc=document.getElementById('rcpt-desc').value.trim(); if(!desc) return;
  S.receipts.push({ id:Date.now(), date:document.getElementById('rcpt-date').value||'',
    desc, cat:document.getElementById('rcpt-cat').value, amount:parseFloat(document.getElementById('rcpt-amount').value)||0 });
  document.getElementById('rcpt-desc').value=''; document.getElementById('rcpt-amount').value='';
  renderTax();
}
function removeReceipt(id){ S.receipts=(S.receipts||[]).filter(r=>r.id!==id); renderTax(); }

function addVaultDoc(){
  const name=document.getElementById('vault-name').value.trim(); if(!name) return;
  S.vault.push({ id:Date.now(), type:document.getElementById('vault-type').value, name,
    date:document.getElementById('vault-date').value||'', notes:document.getElementById('vault-notes').value||'' });
  document.getElementById('vault-name').value=''; document.getElementById('vault-notes').value='';
  renderTax();
}
function removeVaultDoc(id){ S.vault=(S.vault||[]).filter(v=>v.id!==id); renderTax(); }

function renderTax(){
  populateForms();
  const tbody=document.getElementById('receipts-tbody');
  const receipts=S.receipts||[];
  tbody.innerHTML=receipts.length?receipts.map(r=>`<tr>
    <td class="td-muted">${r.date||'—'}</td><td>${r.desc}</td><td><span class="badge badge-gold">${r.cat}</span></td>
    <td class="td-mono">${fmt(r.amount)}</td><td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4);border-color:var(--accent4)" onclick="removeReceipt(${r.id})">✕</button></td></tr>`).join('')
    :'<tr><td colspan="5"><div class="empty-state">No receipts logged</div></td></tr>';
  const totalRcpt=receipts.reduce((s,r)=>s+(r.amount||0),0);
  document.getElementById('receipts-tfoot').innerHTML=receipts.length?`<tr><td colspan="3" style="font-weight:700">Total</td><td class="td-mono td-gold">${fmt(totalRcpt)}</td><td></td></tr>`:'';
  const vbody=document.getElementById('vault-tbody');
  const vault=S.vault||[];
  vbody.innerHTML=vault.length?vault.map(v=>`<tr>
    <td><span class="badge badge-green">${v.type}</span></td><td style="font-weight:600">${v.name}</td>
    <td class="td-muted">${v.date||'—'}</td><td class="td-muted">${v.notes||'—'}</td>
    <td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4);border-color:var(--accent4)" onclick="removeVaultDoc(${v.id})">✕</button></td></tr>`).join('')
    :'<tr><td colspan="5"><div class="empty-state">No documents in vault</div></td></tr>';
}

function calcProjections(){ collectProjections(); renderProjections(); }
function renderProjections(){
  populateForms(); const pr=S.projections, age=S.settings.age, years=Math.max(1,S.settings.fiAge-age);
  const scenarios=[{label:'Conservative',return:5,color:'#5c9eff'},{label:'Base',return:8,color:'#c8a96e'},{label:'Optimistic',return:11,color:'#4ecb8a'}];
  const datasets=scenarios.map(sc=>{ let bal=pr.start||0, monthly=pr.monthly||0; const data=[bal];
    for(let yr=1;yr<=years;yr++){ bal=bal*(1+sc.return/100)+monthly*12; monthly*=(1+(pr.wage||3.5)/100); data.push(bal); }
    return { label:sc.label+' ('+sc.return+'%)', data, borderColor:sc.color, tension:.3, borderWidth:2 }; });
  const labels=Array.from({length:years+1},(_,i)=>'Age '+(age+i));
  if(projChartInst) projChartInst.destroy();
  projChartInst=new Chart(document.getElementById('proj-chart').getContext('2d'),{ type:'line', data:{labels,datasets},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#7a7f8e' } } },
      scales:{ y:{ ticks:{ callback:v=>'$'+(v>=1e6?(v/1e6).toFixed(1)+'M':(v/1e3).toFixed(0)+'k') } } } } });
  const tableRows=[]; for(let yr=0;yr<=years;yr++){
    const row={yr,age:age+yr}; scenarios.forEach(sc=>{ let bal=pr.start||0,m=pr.monthly||0;
      for(let y=1;y<=yr;y++){ bal=bal*(1+sc.return/100)+m*12; m*=1.035; } row[sc.label]=bal; }); tableRows.push(row); }
  document.getElementById('proj-table').innerHTML=`<table><thead><tr><th>${t('projTableYear')}</th><th>${t('projTableAge')}</th><th>${t('projTableCons')}</th><th>${t('projTableBase')}</th><th>${t('projTableOpt')}</th><th>${t('projTableFI')}</th></tr></thead><tbody>${tableRows.map(r=>{
    const isFI=r.age>=S.settings.fiAge;
    return `<tr ${isFI?"style='background:rgba(78,203,138,.05)'":''}><td>Y${r.yr}</td><td class="td-mono ${isFI?'td-gold':''}">${r.age}${isFI?' 🏆':''}</td>
      <td class="td-mono">${fmt(r.Conservative)}</td><td class="td-mono td-gold">${fmt(r.Base)}</td><td class="td-mono td-green">${fmt(r.Optimistic)}</td>
      <td>${isFI?'<span class="badge badge-green">Target</span>':''}</td></tr>`; }).join('')}</tbody></table>`;
}

function renderSettings(){
  populateForms();
  if(!document.getElementById('s-planner')){
    const nameGroup=document.getElementById('s-name')?.closest('.form-group');
    if(nameGroup){ const g=document.createElement('div'); g.className='form-group'; g.style.marginBottom='10px';
      g.innerHTML='<label>Financial Planner</label><input id="s-planner" placeholder="Advisor name">';
      nameGroup.parentNode.insertBefore(g,nameGroup.nextSibling); s('s-planner',S.settings.planner); }
  }
  document.getElementById('target-alloc-form').innerHTML=Object.keys(S.targets).map(cat=>`
    <div class="form-group" style="margin-bottom:10px"><label>${cat} (%)</label>
    <input type="number" id="tgt-${cat.replace(/\s+/g,'-')}" value="${S.targets[cat]}" step="0.5"></div>`).join('')+
    `<div style="margin-top:12px;font-size:12px;color:var(--muted)" id="tgt-sum">Total: ${Object.values(S.targets).reduce((s,v)=>s+v,0)}%</div>`;
}
function saveTargets(){
  Object.keys(S.targets).forEach(cat=>{ const el=document.getElementById('tgt-'+cat.replace(/\s+/g,'-')); if(el) S.targets[cat]=parseFloat(el.value)||0; });
  saveAll();
}
function saveSettings(){ collectSettings(); saveAll(); }

/* ── LifePlan Client Report PDF (template: LifePlan - Client Report) ── */
function exportClientReport(){
  if(typeof window.jspdf==='undefined'){ alert('PDF library not loaded. Check your internet connection and reload.'); return; }
  collectCashflow(); collectProjections(); collectSettings(); collectTax();

  const toast=document.getElementById('save-toast');
  toast.textContent=t('reportGenerating'); toast.classList.add('show');

  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
  const pageW=doc.internal.pageSize.getWidth();
  const margin=14;
  const owner=S.settings.name||'Client';
  const reportDate=new Date().toLocaleDateString('en-US',{month:'long',year:'numeric',day:'numeric'});
  const cf=S.cashflow, tx=S.tax||{};
  const totalPV=totalPortfolioValue();
  const totalDebt=S.debts.reduce((s,d)=>s+(d.balance||0),0);
  const netWorth=totalPV-totalDebt;
  const monthlyExp=calcMonthlyExpenses(cf);
  const annualEmployment=(cf.salary+cf.other)*12;
  const annualTaxIncome=tx.salary+tx.interest+tx.dividends+tx.rental+tx.otherIncome;
  const annualIncome=annualTaxIncome>0?annualTaxIncome:annualEmployment;

  const NAVY=[30,58,95], GOLD=[200,169,110], GRAY=[100,100,100];

  function drawHeader(isCover){
    doc.setFillColor(...NAVY);
    doc.rect(0,0,pageW,isCover?32:22,'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(isCover?26:18);
    doc.text('LifePlan',margin,isCover?18:14);
    doc.setFontSize(isCover?14:11);
    doc.setFont('helvetica','normal');
    doc.text('Client Report',margin,isCover?26:20);
    if(!isCover){ doc.setFontSize(8); doc.text(reportDate,pageW-margin,14,{align:'right'}); }
    doc.setTextColor(0,0,0);
  }

  function sectionTitle(title,y){
    if(y>260){ doc.addPage(); drawHeader(false); y=28; }
    doc.setFont('helvetica','bold');
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text(title,margin,y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(margin,y+2,pageW-margin,y+2);
    doc.setTextColor(0,0,0);
    return y+8;
  }

  function addTable(head,body,startY,opts={}){
    doc.autoTable({
      startY:startY, head:[head], body,
      margin:{left:margin,right:margin},
      theme:'grid',
      headStyles:{ fillColor:NAVY, textColor:[255,255,255], fontStyle:'bold', fontSize:9 },
      bodyStyles:{ fontSize:9, cellPadding:2.5 },
      alternateRowStyles:{ fillColor:[248,248,252] },
      ...opts
    });
    return doc.lastAutoTable.finalY+6;
  }

  drawHeader(true);
  let y=40;
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('Client Information',margin,y); y+=7;
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text('Client Name: '+owner,margin,y); y+=6;
  if(S.settings.planner){ doc.text('Financial Planner: '+S.settings.planner,margin,y); y+=6; }
  doc.text('Report Date: '+reportDate,margin,y); y+=6;
  doc.text('Risk Profile: '+(S.settings.risk||'—')+'  ·  Current Age: '+S.settings.age+'  ·  Freedom Target Age: '+S.settings.fiAge,margin,y);
  y+=12;

  y=sectionTitle('Your Current Financial Situation',y);
  doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('Assets',margin,y); y+=4;

  const assetRows=S.holdings.length
    ? S.holdings.map(h=>[h.name, fmt(totalValue(h)), h.cat, owner])
    : [['Personal portfolio (no holdings entered)','$0','—',owner]];
  y=addTable(['Asset','Amount','Category','Owner'],assetRows,y);

  doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('Liabilities',margin,y); y+=4;
  const liabRows=S.debts.length
    ? S.debts.map(d=>[d.name, fmt(d.balance), d.type, owner])
    : [['No liabilities recorded','$0','—',owner]];
  y=addTable(['Liability','Amount','Type','Owner'],liabRows,y);

  y=addTable(['Summary','Amount'],[
    ['Total Assets',fmt(totalPV)],
    ['Total Liabilities',fmt(totalDebt)],
    ['Net Worth',fmt(netWorth)],
    ['Portfolio Gain/Loss',fmt(totalPV-S.holdings.reduce((s,h)=>s+(h.cost||0),0))]
  ],y,{ headStyles:{ fillColor:GOLD, textColor:[0,0,0] } });

  y=sectionTitle('Annual Income',y);
  const incomeRows=[
    ['Employment / Salary (annual est.)', fmt(annualEmployment), owner],
    ['Interest Income', fmt(tx.interest), owner],
    ['Dividends', fmt(tx.dividends), owner],
    ['Rental Income', fmt(tx.rental), owner],
    ['Other Income', fmt(tx.otherIncome), owner],
    ['TOTAL ANNUAL INCOME', fmt(annualIncome), owner]
  ];
  y=addTable(['Income Source','Amount','Owner'],incomeRows,y);

  y=sectionTitle('Monthly Cashflow',y);
  const surplus=cf.salary+cf.other-monthlyExp-cf.invest-cf.debtRepay;
  y=addTable(['Item','Monthly Amount'],[
    ['Net salary & other income',fmt(cf.salary+cf.other)],
    ['Living expenses',fmt(monthlyExp)],
    ['Investment contributions',fmt(cf.invest)],
    ['Debt repayments',fmt(cf.debtRepay)],
    ['Net surplus',fmt(surplus)]
  ],y);

  y=sectionTitle('Portfolio Allocation',y);
  const alloc=allocationByCategory();
  y=addTable(['Category','Actual %','Target %','Variance'],
    Object.keys(S.targets).map(c=>{ const a=alloc[c]||0; return [c,a.toFixed(1)+'%',S.targets[c]+'%',(a-S.targets[c]).toFixed(1)+'%']; }),y);

  y=sectionTitle('Freedom Plan Snapshot',y);
  const pr=S.projections, age=S.settings.age, years=Math.max(1,S.settings.fiAge-age);
  let bal=pr.start||totalPV, monthly=pr.monthly||cf.invest||0;
  for(let yr=1;yr<=years;yr++){ bal=bal*1.08+monthly*12; monthly*=(1+(pr.wage||3.5)/100); }
  y=addTable(['Measure','Value'],[
    ['Freedom portfolio target',fmt(S.settings.fiTarget)],
    ['Current portfolio',fmt(totalPV)],
    ['Progress to target',((totalPV/(S.settings.fiTarget||1))*100).toFixed(1)+'%'],
    ['Years to freedom target',Math.max(0,S.settings.fiAge-S.settings.age)],
    ['Projected portfolio at age '+S.settings.fiAge+' (8% base)',fmt(bal)],
    ['Monthly investment (current)',fmt(pr.monthly||cf.invest)]
  ],y);

  y=sectionTitle('Key Assumptions',y);
  y=addTable(['Assumption','Value'],[
    ['Annual employment / income increase',(pr.wage||3.5)+'%'],
    ['Expense inflation',(S.settings.inflation||5)+'%'],
    ['Shares / portfolio growth (base case)','8%'],
    ['Conservative projection','5%'],
    ['Optimistic projection','11%'],
    ['Income return from investments (est.)','4%']
  ],y);

  y=sectionTitle('Recommended Action Steps',y);
  const totalDebtFmt=fmt(totalDebt);
  const actions=[
    ['Debt Reduction', totalDebt>0
      ? 'Prioritise paying down '+totalDebtFmt+' of debt. Current monthly repayments: '+fmt(cf.debtRepay)+'.'
      : 'Maintain debt-free status and redirect former repayments to investing.'],
    ['Invest for Growth', (cf.invest||pr.monthly)>0
      ? 'Continue monthly investments of '+fmt(cf.invest||pr.monthly)+' aligned to target allocation.'
      : 'Establish regular monthly investments toward your freedom portfolio target.'],
    ['Supercharge Superannuation', 'Seek advice about concessional contributions and whether an SMSF suits your goals.'],
    ['Income Protection', 'Review income protection insurance to cover '+fmt(cf.salary*12)+' annual earnings.'],
    ['Family Protection', 'Request advice about Life / TPD / Trauma insurance for your household.'],
    ['Estate Planning', (S.vault||[]).some(v=>v.type==='Will')
      ? 'Will on file — review with estate planning lawyer every 3 years.'
      : 'Meet with an estate planning lawyer to prepare or update your Will.'],
    ['Manage Personal Finances', 'Use this Financial Planner to track cashflow, debt, tax receipts and portfolio monthly.']
  ];
  getRoadmap().forEach(r=>actions.push([r.priority+' ('+r.phase+')', r.action]));
  y=addTable(['Key Area','Recommended Action'],actions,y);

  if((S.receipts||[]).length){
    if(y>240){ doc.addPage(); drawHeader(false); y=28; }
    y=sectionTitle('Tax Receipt Log',y);
    y=addTable(['Date','Description','Category','Amount'],
      S.receipts.map(r=>[r.date||'—',r.desc,r.cat,fmt(r.amount)]),y);
  }
  if((S.vault||[]).length){
    if(y>240){ doc.addPage(); drawHeader(false); y=28; }
    y=sectionTitle('Document Vault',y);
    y=addTable(['Type','Document','Date','Notes'],
      S.vault.map(v=>[v.type,v.name,v.date||'—',v.notes||'—']),y);
  }

  const pageCount=doc.getNumberOfPages();
  for(let i=1;i<=pageCount;i++){
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text('LifePlan Client Report · Prepared '+reportDate+' · Page '+i+' of '+pageCount,margin,290);
    doc.text('This report is for information purposes only and does not constitute financial advice.',margin,294);
  }

  const safeName=(owner||'client').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-')||'client';
  doc.save('LifePlan-Client-Report-'+safeName+'-'+new Date().toISOString().slice(0,10)+'.pdf');
  toast.textContent=t('reportReady');
  setTimeout(()=>toast.classList.remove('show'),2200);
}

loadState(); updateLastUpdated(); populateForms(); applyLanguage();
const _hash = location.hash.replace('#', '');
if (_hash && document.getElementById('page-' + _hash)) showPage(_hash);
else renderDashboard();
document.querySelectorAll('#page-cashflow input').forEach(el=>el.addEventListener('change',()=>{ collectCashflow(); renderCashflow(); }));

// Close header dropdown when clicking outside (and on Escape)
(() => {
  const dd = document.getElementById('header-actions');
  if (!dd) return;
  document.addEventListener('click', (e) => {
    if (!dd.classList.contains('open')) return;
    if (dd.contains(e.target)) {
      // If the user clicked a menu item, close after selection.
      const menu = dd.querySelector('.dropdown-menu');
      if (menu && menu.contains(e.target)) dd.classList.remove('open');
      return;
    }
    dd.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dd.classList.remove('open');
  });
})();
