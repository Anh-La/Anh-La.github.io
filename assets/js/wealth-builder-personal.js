const STORAGE_KEY = 'wealthbuilder_personal_v2';
const LANG_KEY = 'wealthbuilder_personal_lang';
let LANG = localStorage.getItem(LANG_KEY) || 'en';

const TRANSLATIONS = {
  en: {
    appTitle:'Wealth Builder', appSub:'Personal Investment Strategy',
    btnSave:'Save', btnExport:'↓ Export', btnLangToggle:'🌐 Tiếng Việt',
    btnAdd:'+ Add', btnAddDebt:'+ Add Debt', btnRunProj:'Run Projections',
    btnSaveSettings:'Save Settings', btnSaveTargets:'Save Targets',
    btnExportJson:'↓ Export JSON', btnImportJson:'↑ Import JSON', btnClearAll:'⚠ Clear All',
    tabDashboard:'📊 Dashboard', tabPortfolio:'💼 Portfolio', tabCashflow:'💸 Cashflow',
    tabDebt:'🧹 Debt Tracker', tabProjections:'📈 Projections', tabSettings:'⚙️ Settings',
    dashTitle:'Overview', dashSub:'Personal net wealth · Outside super',
    dashAlloc:'Portfolio Allocation vs Target', dashFI:'Financial Independence Progress',
    dashFIYearSub:'years to FI target', dashCashflow:'Monthly Cashflow Summary',
    dashDebt:'Debt Paydown Status', dashRoadmap:'Personal Action Roadmap',
    portTitle:'Personal Portfolio', portSub:'Taxable & personal accounts · Outside super',
    portAlert:'💡 Target: STRC 25% · SATA 15% · US ETFs 20% · Commercial RE 15% · Bitcoin 10% · Gold 10% · Cash 5%',
    portAssetName:'Asset Name', portCategory:'Category', portUnits:'Units / Qty',
    portPrice:'Price (A$)', portCostBase:'Cost Base (A$)', portDrip:'DRIP?',
    portTableAsset:'Asset', portTableCat:'Category', portTableUnits:'Units', portTablePrice:'Price',
    portTableValue:'Value', portTableCost:'Cost Base', portTableGain:'Gain/Loss', portTablePct:'%Portfolio', portTableDrip:'DRIP',
    portTargetVsActual:'Target vs Actual Allocation',
    cfTitle:'Cashflow Analysis', cfSub:'Personal income, living costs & investable surplus',
    cfIncome:'Income', cfSalaryLabel:'Net Monthly Salary (after tax)', cfOtherLabel:'Other Income',
    cfFixedExp:'Fixed Expenses', cfRent:'Weekly Rent (A$)', cfGroceries:'Weekly Groceries',
    cfFuel:'Weekly Car Fuel', cfElec:'Weekly Electricity', cfTransport:'Weekly Transport', cfGym:'Fortnightly Gym',
    cfChildSupport:'Child Support & Quarterly Expenses', cfBball:'Basketball (quarterly)',
    cfSchool:'School Fees (quarterly)', cfPlay:'Weekly Play Activities',
    cfInvestContrib:'Investment Contributions', cfMonthlyContrib:'Monthly Personal Investments (A$)',
    cfDebtRepay:'Monthly Debt Repayment (A$)', cfMonthlySummary:'Monthly Summary', cfInflation:'Expense Inflation Projection',
    debtTitle:'Debt Tracker', debtSub:'Clear personal debts to accelerate FI',
    debtAlert:'⚠️ Pay high-interest debt first to free monthly cashflow for investing.',
    debtAddUpdate:'Add / Update Debt', debtName:'Debt Name', debtType:'Type',
    debtOriginal:'Original Balance (A$)', debtCurrent:'Current Balance (A$)',
    debtRate:'Interest Rate (% p.a.)', debtPayment:'Monthly Payment (A$)',
    debtTotalOutstanding:'Total Debt Outstanding', debtMonthlyInterest:'Monthly Interest Cost',
    debtTableDebt:'Debt', debtTableType:'Type', debtTableOriginal:'Original', debtTableCurrent:'Balance',
    debtTableRate:'Rate', debtTablePayment:'Payment', debtTablePayoffIn:'Payoff', debtTableProgress:'Progress', debtAmort:'Amortisation Schedule',
    projTitle:'Personal Growth Projections', projSub:'Outside-super portfolio · To FI target age',
    projInputs:'Projection Inputs', projCurrentPortfolio:'Current Personal Portfolio (A$)',
    projMonthly:'Monthly Investment (A$)', projWage:'Annual Wage Growth (%)',
    projTableYear:'Year', projTableAge:'Age', projTableCons:'Conservative (5%)',
    projTableBase:'Base (8%)', projTableOpt:'Optimistic (11%)', projTableFI:'FI Target?',
    settingsTitle:'Settings & Profile', settingsSub:'Personal strategy parameters',
    settingsProfile:'Investor Profile', settingsName:'Name', settingsAge:'Current Age',
    settingsFIAge:'FI Target Age', settingsFITarget:'FI Portfolio Target (A$)',
    settingsRisk:'Risk Profile', settingsInflation:'Inflation (% p.a.)',
    settingsEmergency:'Emergency Fund Target (A$)', settingsTargetAlloc:'Target Allocations (%)',
    settingsDataMgmt:'Data Management', toastSaved:'✓ Saved', savedPrefix:'Saved '
  },
  vi: {
    appTitle:'Xây Dựng Tài Sản', appSub:'Chiến Lược Đầu Tư Cá Nhân',
    btnSave:'Lưu', btnExport:'↓ Xuất', btnLangToggle:'🌐 English',
    btnAdd:'+ Thêm', btnAddDebt:'+ Thêm Nợ', btnRunProj:'Chạy Dự Báo',
    btnSaveSettings:'Lưu Cài Đặt', btnSaveTargets:'Lưu Mục Tiêu',
    btnExportJson:'↓ Xuất JSON', btnImportJson:'↑ Nhập JSON', btnClearAll:'⚠ Xóa Tất Cả',
    tabDashboard:'📊 Tổng Quan', tabPortfolio:'💼 Danh Mục', tabCashflow:'💸 Dòng Tiền',
    tabDebt:'🧹 Theo Dõi Nợ', tabProjections:'📈 Dự Báo', tabSettings:'⚙️ Cài Đặt',
    dashTitle:'Tổng Quan', dashSub:'Tài sản ròng cá nhân · Ngoài quỹ hưu trí',
    dashAlloc:'Phân Bổ So Với Mục Tiêu', dashFI:'Tiến Độ Độc Lập Tài Chính',
    dashFIYearSub:'năm đến mục tiêu ĐLTC', dashCashflow:'Tóm Tắt Dòng Tiền',
    dashDebt:'Tình Trạng Trả Nợ', dashRoadmap:'Lộ Trình Hành Động Cá Nhân',
    portTitle:'Danh Mục Cá Nhân', portSub:'Tài khoản cá nhân · Ngoài super',
    portAlert:'💡 Mục tiêu: STRC 25% · SATA 15% · ETF Mỹ 20% · BĐS TM 15% · Bitcoin 10% · Vàng 10% · Tiền mặt 5%',
    portAssetName:'Tên Tài Sản', portCategory:'Danh Mục', portUnits:'Số Lượng',
    portPrice:'Giá (A$)', portCostBase:'Giá Vốn (A$)', portDrip:'DRIP?',
    portTableAsset:'Tài Sản', portTableCat:'Danh Mục', portTableUnits:'Đơn Vị', portTablePrice:'Giá',
    portTableValue:'Giá Trị', portTableCost:'Giá Vốn', portTableGain:'Lãi/Lỗ', portTablePct:'%DM', portTableDrip:'DRIP',
    portTargetVsActual:'Mục Tiêu So Với Thực Tế',
    cfTitle:'Phân Tích Dòng Tiền', cfSub:'Thu nhập cá nhân & thặng dư đầu tư',
    cfIncome:'Thu Nhập', cfSalaryLabel:'Lương ròng hàng tháng', cfOtherLabel:'Thu nhập khác',
    cfFixedExp:'Chi Phí Cố Định', cfRent:'Thuê nhà/tuần', cfGroceries:'Thực phẩm/tuần',
    cfFuel:'Xăng/tuần', cfElec:'Điện/tuần', cfTransport:'Giao thông/tuần', cfGym:'Gym/2 tuần',
    cfChildSupport:'Hỗ trợ con & chi phí quý', cfBball:'Bóng rổ (quý)', cfSchool:'Học phí (quý)', cfPlay:'Vui chơi/tuần',
    cfInvestContrib:'Đóng Góp Đầu Tư', cfMonthlyContrib:'Đầu tư cá nhân/tháng',
    cfDebtRepay:'Trả nợ/tháng', cfMonthlySummary:'Tóm Tắt Tháng', cfInflation:'Dự Báo Lạm Phát',
    debtTitle:'Theo Dõi Nợ', debtSub:'Trả nợ cá nhân để đẩy nhanh ĐLTC',
    debtAlert:'⚠️ Ưu tiên nợ lãi cao để giải phóng dòng tiền đầu tư.',
    debtAddUpdate:'Thêm / Cập Nhật Nợ', debtName:'Tên Nợ', debtType:'Loại',
    debtOriginal:'Số dư gốc', debtCurrent:'Số dư hiện tại', debtRate:'Lãi suất', debtPayment:'Trả hàng tháng',
    debtTotalOutstanding:'Tổng Nợ', debtMonthlyInterest:'Lãi Hàng Tháng',
    debtTableDebt:'Nợ', debtTableType:'Loại', debtTableOriginal:'Gốc', debtTableCurrent:'Hiện tại',
    debtTableRate:'Lãi', debtTablePayment:'Trả', debtTablePayoffIn:'Hết trong', debtTableProgress:'Tiến độ', debtAmort:'Lịch Khấu Hao',
    projTitle:'Dự Báo Tăng Trưởng Cá Nhân', projSub:'Danh mục ngoài super',
    projInputs:'Thông Số', projCurrentPortfolio:'Danh mục hiện tại', projMonthly:'Đầu tư/tháng', projWage:'Tăng lương/năm',
    projTableYear:'Năm', projTableAge:'Tuổi', projTableCons:'Thận trọng', projTableBase:'Cơ sở', projTableOpt:'Lạc quan', projTableFI:'ĐLTC?',
    settingsTitle:'Cài Đặt', settingsSub:'Tham số chiến lược cá nhân',
    settingsProfile:'Hồ Sơ', settingsName:'Họ tên', settingsAge:'Tuổi', settingsFIAge:'Tuổi ĐLTC',
    settingsFITarget:'Mục tiêu danh mục ĐLTC', settingsRisk:'Rủi ro', settingsInflation:'Lạm phát',
    settingsEmergency:'Quỹ khẩn cấp', settingsTargetAlloc:'Phân bổ mục tiêu', settingsDataMgmt:'Dữ liệu',
    toastSaved:'✓ Đã Lưu', savedPrefix:'Đã lưu '
  }
};

function t(k){ return (TRANSLATIONS[LANG]&&TRANSLATIONS[LANG][k])||TRANSLATIONS.en[k]||k; }
function toggleLanguage(){ LANG=LANG==='en'?'vi':'en'; localStorage.setItem(LANG_KEY,LANG); applyLanguage(); refreshAll(); }
function applyLanguage(){
  document.title=t('appTitle')+' · '+t('appSub');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const v=t(el.getAttribute('data-i18n')); if(v) el.textContent=v; });
}

const DEFAULT_STATE = {
  settings:{ name:'Investor', age:42, fiAge:48, fiTarget:1200000, risk:'Balanced-Growth', inflation:5, emergency:28000 },
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
  lastUpdated:null
};

let S = JSON.parse(JSON.stringify(DEFAULT_STATE));
let donutChart,cashflowBarChart,debtChartInst,projChartInst;
const COLORS=['#c8a96e','#5c9eff','#4ecb8a','#e06b6b','#f59e0b','#a78bfa','#64748b'];
const CAT_COLORS={ STRC:'#c8a96e',SATA:'#5c9eff','US ETF':'#4ecb8a','Commercial RE':'#e06b6b',Bitcoin:'#f59e0b',Gold:'#a78bfa',Cash:'#64748b',Other:'#94a3b8' };

const fmt=(n,d=0)=>'A$'+Number(n||0).toLocaleString('en-AU',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtNum=(n,d=2)=>Number(n||0).toLocaleString('en-AU',{minimumFractionDigits:d,maximumFractionDigits:d});

function loadState(){ try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),JSON.parse(raw)); }catch(e){} }
function saveAll(){
  collectCashflow(); collectProjections(); collectSettings();
  S.lastUpdated=new Date().toISOString();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(S));
  const toast=document.getElementById('save-toast');
  toast.textContent=t('toastSaved'); toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1800);
  updateLastUpdated(); refreshAll();
}
function updateLastUpdated(){
  const el=document.getElementById('last-updated-label');
  if(S.lastUpdated){ const d=new Date(S.lastUpdated); el.textContent=t('savedPrefix')+d.toLocaleString(LANG==='vi'?'vi-VN':'en-AU',{dateStyle:'short',timeStyle:'short'}); }
}
function exportData(){
  collectCashflow(); collectProjections(); collectSettings();
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));
  a.download='wealth-builder-personal-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
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
    age:parseInt(document.getElementById('s-age')?.value)||S.settings.age,
    fiAge:parseInt(document.getElementById('s-fi-age')?.value)||S.settings.fiAge,
    fiTarget:parseFloat(document.getElementById('s-fi-target')?.value)||S.settings.fiTarget,
    risk:document.getElementById('s-risk')?.value||S.settings.risk,
    inflation:parseFloat(document.getElementById('s-inflation')?.value)||S.settings.inflation,
    emergency:parseFloat(document.getElementById('s-emergency')?.value)||S.settings.emergency };
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
  s('s-name',S.settings.name); s('s-age',S.settings.age); s('s-fi-age',S.settings.fiAge);
  s('s-fi-target',S.settings.fiTarget); s('s-risk',S.settings.risk); s('s-inflation',S.settings.inflation); s('s-emergency',S.settings.emergency);
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
    <div class="kpi gold"><div class="kpi-label">Personal Portfolio</div><div class="kpi-value">${fmt(totalPV)}</div><div class="kpi-sub">Outside super</div></div>
    <div class="kpi ${netWorth>=0?'green':'red'}"><div class="kpi-label">Net Worth</div><div class="kpi-value">${fmt(netWorth)}</div><div class="kpi-sub">Portfolio − debts</div></div>
    <div class="kpi blue"><div class="kpi-label">Monthly Surplus</div><div class="kpi-value">${fmt(surplus)}</div><div class="kpi-delta ${surplus>=0?'pos':'neg'}">${surplus>=0?'▲ Positive':'▼ Deficit'}</div></div>
    <div class="kpi ${totalDebt>0?'red':'green'}"><div class="kpi-label">Total Debt</div><div class="kpi-value">${fmt(totalDebt)}</div></div>`;

  document.getElementById('fi-years-left').textContent=fiYears;
  document.getElementById('fi-progress-bars').innerHTML=[
    { label:'FI Portfolio Target', pct:fiPct, color:'var(--accent)' },
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
      scales:{ x:{ ticks:{ color:'#7a7f8e',font:{size:10}} }, y:{ ticks:{ color:'#7a7f8e', callback:v=>'A$'+(v/1000).toFixed(0)+'k' } } } }
  });

  const totalOrig=S.debts.reduce((s,d)=>s+(d.original||0),0), paidOff=totalOrig-S.debts.reduce((s,d)=>s+(d.balance||0),0);
  document.getElementById('debt-summary-panel').innerHTML=S.debts.length?S.debts.map(d=>{
    const paid=Math.min(100,((d.original-d.balance)/(d.original||1))*100);
    const mo=monthsToPayoff(d.balance,d.rate,d.payment);
    return `<div class="progress-wrap"><div class="progress-header"><span class="progress-label">${d.name}</span><span class="progress-val">${fmt(d.balance)} · ${mo<999?mo+' mo':'∞'}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${paid}%;background:var(--accent4)"></div></div></div>`;
  }).join('')+`<div style="margin-top:12px;font-size:12px;color:var(--muted)">Repaid: <span class="td-green">${fmt(paidOff)}</span> of ${fmt(totalOrig)}</div>`:'<div class="empty-state"><div class="icon">✓</div>Debt free</div>';

  const roadmap=[
    { phase:'Phase 1', timeframe:'Months 1–6', priority:'Debt Clearance', action:'Pay off high-interest credit card first.', status:'🎯 Priority' },
    { phase:'Phase 2', timeframe:'Months 7–12', priority:'Debt-Free', action:'Clear remaining liabilities. Top up emergency fund.', status:'⏳ Next' },
    { phase:'Phase 3', timeframe:'Year 2', priority:'STRC / SATA', action:'DRIP compounding. Build US ETF & Gold positions.', status:'📅 Planned' },
    { phase:'Phase 4', timeframe:'Years 3–5', priority:'Diversification', action:'Commercial RE exposure via listed trusts or direct.', status:'📅 Planned' },
    { phase:'Phase 5', timeframe:'Age '+S.settings.fiAge, priority:'Financial Independence', action:'Portfolio income covers living expenses outside super.', status:'🏆 Goal' }
  ];
  document.getElementById('roadmap-table').innerHTML=`<table><thead><tr><th>Phase</th><th>Timeframe</th><th>Priority</th><th>Action</th><th>Status</th></tr></thead><tbody>${roadmap.map(r=>`<tr><td class="td-gold">${r.phase}</td><td class="td-mono td-muted">${r.timeframe}</td><td style="font-weight:600">${r.priority}</td><td>${r.action}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
}

function renderPortfolio(){
  const total=totalPortfolioValue(), tbody=document.getElementById('holdings-tbody'), tfoot=document.getElementById('holdings-tfoot');
  if(!S.holdings.length){ tbody.innerHTML='<tr><td colspan="9"><div class="empty-state"><div class="icon">📂</div>No holdings yet</div></td></tr>'; tfoot.innerHTML=''; document.getElementById('allocation-bars').innerHTML=''; return; }
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
    const actual=alloc[cat]||0, diff=actual-tgt, color=CAT_COLORS[cat]||'#64748b';
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
    document.getElementById('debt-payoff-date').textContent='Est. cleared: '+d.toLocaleDateString('en-AU',{month:'short',year:'numeric'}); }
  const tbody=document.getElementById('debt-tbody');
  tbody.innerHTML=S.debts.length?S.debts.map(d=>{
    const mo=monthsToPayoff(d.balance,d.rate,d.payment), paid=d.original>0?Math.min(100,(d.original-d.balance)/d.original*100):0;
    return `<tr><td style="font-weight:600">${d.name}</td><td><span class="badge badge-red">${d.type}</span></td>
      <td class="td-mono">${fmt(d.original)}</td><td class="td-mono"><input type="number" value="${d.balance}" style="width:110px;padding:4px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text)" onchange="updateDebtBalance(${d.id},this.value)"></td>
      <td class="td-mono">${d.rate}%</td><td class="td-mono">${fmt(d.payment)}</td><td class="td-mono">${mo<999?mo+' mo':'∞'}</td>
      <td><div class="progress-bar"><div class="progress-fill" style="width:${paid}%;background:var(--accent3)"></div></div></td>
      <td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4);border-color:var(--accent4)" onclick="removeDebt(${d.id})">✕</button></td></tr>`;
  }).join(''):'<tr><td colspan="8"><div class="empty-state">✅ No debts</div></td></tr>';
  const months=Math.min(48,S.debts.length?Math.max(...S.debts.map(d=>monthsToPayoff(d.balance,d.rate,d.payment)).filter(m=>m<999))+3:24);
  const labels=Array.from({length:months},(_,i)=>'M'+(i+1));
  const datasets=S.debts.map((d,i)=>{ let bal=d.balance; const data=[bal];
    for(let m=0;m<months-1;m++){ const interest=bal*(d.rate/100/12); bal=Math.max(0,bal+interest-d.payment); data.push(bal); }
    return { label:d.name, data, borderColor:['#e06b6b','#f59e0b','#5c9eff'][i%3], tension:.3, borderWidth:2 }; });
  if(debtChartInst) debtChartInst.destroy();
  debtChartInst=new Chart(document.getElementById('debt-chart').getContext('2d'),{ type:'line', data:{labels,datasets},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#7a7f8e' } } },
      scales:{ x:{ ticks:{ color:'#7a7f8e', maxTicksLimit:12 } }, y:{ ticks:{ color:'#7a7f8e', callback:v=>'A$'+v.toLocaleString() } } } } });
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
      scales:{ y:{ ticks:{ callback:v=>'A$'+(v>=1e6?(v/1e6).toFixed(1)+'M':(v/1e3).toFixed(0)+'k') } } } } });
  const tableRows=[]; for(let yr=0;yr<=years;yr++){
    const row={yr,age:age+yr}; scenarios.forEach(sc=>{ let bal=pr.start||0,m=pr.monthly||0;
      for(let y=1;y<=yr;y++){ bal=bal*(1+sc.return/100)+m*12; m*=1.035; } row[sc.label]=bal; }); tableRows.push(row); }
  document.getElementById('proj-table').innerHTML=`<table><thead><tr><th>${t('projTableYear')}</th><th>${t('projTableAge')}</th><th>${t('projTableCons')}</th><th>${t('projTableBase')}</th><th>${t('projTableOpt')}</th><th>${t('projTableFI')}</th></tr></thead><tbody>${tableRows.map(r=>{
    const isFI=r.age>=S.settings.fiAge;
    return `<tr ${isFI?"style='background:rgba(78,203,138,.05)'":''}><td>Y${r.yr}</td><td class="td-mono ${isFI?'td-gold':''}">${r.age}${isFI?' 🏆':''}</td>
      <td class="td-mono">${fmt(r.Conservative)}</td><td class="td-mono td-gold">${fmt(r.Base)}</td><td class="td-mono td-green">${fmt(r.Optimistic)}</td>
      <td>${isFI?'<span class="badge badge-green">FI</span>':''}</td></tr>`; }).join('')}</tbody></table>`;
}

function renderSettings(){
  populateForms();
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

loadState(); updateLastUpdated(); populateForms(); applyLanguage(); renderDashboard();
document.querySelectorAll('#page-cashflow input').forEach(el=>el.addEventListener('change',()=>{ collectCashflow(); renderCashflow(); }));
