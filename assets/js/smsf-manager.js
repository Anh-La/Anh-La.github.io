const STORAGE_KEY = 'wealthbuilder_smsf_v2';
const LANG_KEY = 'wealthbuilder_smsf_lang';
let LANG = localStorage.getItem(LANG_KEY) || 'en';

const TRANSLATIONS = {
  en: {
    appTitle:'Pension Fund', appSub:'Superannuation Management',
    btnSave:'Save', btnExport:'↓ Export', btnReport:'Pension Fund Report', btnLangToggle:'🌐 Tiếng Việt', btnAdd:'+ Add',
    btnRecalc:'Recalculate', btnRunProj:'Run Projections', btnSaveSettings:'Save', btnSaveTargets:'Save Targets',
    btnExportJson:'↓ Export JSON', btnImportJson:'↑ Import JSON', btnClearAll:'⚠ Clear All',
    tabDashboard:'📊 Dashboard', tabPortfolio:'💼 Fund Portfolio', tabContributions:'💰 Contributions',
    tabCompliance:'📋 Compliance', tabProjections:'📈 Projections', tabSettings:'⚙️ Settings',
    dashTitle:'Overview', dashSub:'Pension fund overview · caps, compliance & projected balance',
    dashAlloc:'Fund Asset Allocation', dashRetirement:'Years to Preservation Age',
    dashRetirementSub:'Target balance at age 60', dashContrib:'Annual Contributions Breakdown',
    dashCompliance:'Compliance Snapshot', dashRoadmap:'Pension Fund Strategy Roadmap',
    settingsDataMgmt:'Data Management', toastSaved:'✓ Saved', savedPrefix:'Saved ',
    reportGenerating:'Generating Pension Fund report…', reportReady:'Pension Fund report downloaded'
  },
  vi: {
    appTitle:'Quy Huu Tri', appSub:'Quan ly Super',
    btnSave:'Lưu', btnExport:'↓ Xuất', btnReport:'Pension Fund Report', btnLangToggle:'🌐 English', btnAdd:'+ Thêm',
    btnRecalc:'Tính Lại', btnRunProj:'Chạy Dự Báo', btnSaveSettings:'Lưu', btnSaveTargets:'Lưu Mục Tiêu',
    btnExportJson:'↓ Xuất JSON', btnImportJson:'↑ Nhập JSON', btnClearAll:'⚠ Xóa',
    toastSaved:'✓ Đã Lưu', savedPrefix:'Đã lưu ',
    reportGenerating:'Dang tao bao cao…', reportReady:'Da tai bao cao'
  }
};

function t(k){ return (TRANSLATIONS[LANG]&&TRANSLATIONS[LANG][k])||TRANSLATIONS.en[k]||k; }
function toggleLanguage(){ LANG=LANG==='en'?'vi':'en'; localStorage.setItem(LANG_KEY,LANG); applyLanguage(); refreshAll(); }
function applyLanguage(){
  const sub=t('appSub');
  document.title=sub ? (t('appTitle')+' · '+sub) : t('appTitle');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const v=t(el.getAttribute('data-i18n')); if(v) el.textContent=v; });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{ const v=t(el.getAttribute('data-i18n-html')); if(v) el.innerHTML=v; });
}

const DEFAULT_STATE = {
  settings:{ fundName:'My SMSF', age:42, preservationAge:60, trustees:2 },
  targets:{ STRC:25, SATA:15, 'US ETF':20, 'Commercial RE':15, Bitcoin:5, Gold:5, Cash:5, 'Listed Property':5, 'Fixed Income':5 },
  holdings:[
    { id:1, name:'STRC', cat:'STRC', qty:552, price:0, cost:0, drip:'Yes' },
    { id:2, name:'Bitcoin', cat:'Bitcoin', qty:0.1, price:0, cost:0, drip:'No' },
    { id:3, name:'US Shares', cat:'US ETF', qty:0, price:0, cost:0, drip:'Yes' }
  ],
  fund:{ balance:0, ss:1828, sg:0, voluntary:0, conCap:32500, nonConCap:120000, returnPct:8, target:1650000 },
  compliance:{ inHouseValue:0, checklist:{ audit:true, actuarial:false, minutes:true, investmentStrategy:true, valuations:true } },
  lastUpdated:null
};

let S = JSON.parse(JSON.stringify(DEFAULT_STATE));
let donutChart, contribChart, fundGrowthChart, projChartInst;
const COLORS=['#c8a96e','#5c9eff','#4ecb8a','#e06b6b','#f59e0b','#a78bfa','#64748b','#94a3b8','#22d3ee'];
const CAT_COLORS={ STRC:'#c8a96e',SATA:'#5c9eff','US ETF':'#4ecb8a','Commercial RE':'#e06b6b',Bitcoin:'#f59e0b',Gold:'#a78bfa',Cash:'#64748b','Listed Property':'#22d3ee','Fixed Income':'#94a3b8',Other:'#64748b' };
const fmt=(n,d=0)=>'A$'+Number(n||0).toLocaleString('en-AU',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtNum=(n,d=2)=>Number(n||0).toLocaleString('en-AU',{minimumFractionDigits:d,maximumFractionDigits:d});

function loadState(){ try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),JSON.parse(raw)); }catch(e){} }
function saveAll(){
  collectFund(); collectSettings();
  S.lastUpdated=new Date().toISOString();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(S));
  const toast=document.getElementById('save-toast');
  toast.textContent=t('toastSaved'); toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1800);
  updateLastUpdated(); refreshAll();
}
function updateLastUpdated(){
  const el=document.getElementById('last-updated-label');
  if(S.lastUpdated) el.textContent=t('savedPrefix')+new Date(S.lastUpdated).toLocaleString(LANG==='vi'?'vi-VN':'en-AU',{dateStyle:'short',timeStyle:'short'});
}
function exportData(){ collectFund(); collectSettings();
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)]));
  a.download='pension-fund-'+new Date().toISOString().slice(0,10)+'.json'; a.click(); }
function importData(e){ const file=e.target.files[0]; if(!file) return;
  const r=new FileReader(); r.onload=ev=>{ try{ S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),JSON.parse(ev.target.result));
    localStorage.setItem(STORAGE_KEY,JSON.stringify(S)); populateForms(); refreshAll(); alert('Imported!'); }catch(err){ alert('Invalid file.'); } }; r.readAsText(file); }
function clearAll(){ if(!confirm('Clear ALL fund data?')) return; S=JSON.parse(JSON.stringify(DEFAULT_STATE)); localStorage.removeItem(STORAGE_KEY); populateForms(); refreshAll(); }

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
  if(id==='contributions') renderContributions();
  if(id==='compliance') renderCompliance();
  if(id==='projections') renderProjections();
  if(id==='settings') renderSettings();
}

function totalValue(h){ return (h.qty||0)*(h.price||0); }
function fundAssetsValue(){ return S.holdings.reduce((s,h)=>s+totalValue(h),0); }
function fundTotalBalance(){ return Math.max(S.fund.balance||0, fundAssetsValue()); }
function allocationByCategory(){
  const map={}, total=fundTotalBalance();
  S.holdings.forEach(h=>{ const v=totalValue(h); map[h.cat]=(map[h.cat]||0)+v; });
  const r={}; Object.keys(map).forEach(k=>{ r[k]=total>0?map[k]/total*100:0; }); return r;
}
function annualConcessional(){ const f=S.fund; return (f.ss+f.sg+f.voluntary)*12; }
function capUsedPct(){ return Math.min(100, annualConcessional()/(S.fund.conCap||32500)*100); }

function addHolding(){
  const name=document.getElementById('h-name').value.trim(); if(!name) return;
  S.holdings.push({ id:Date.now(), name, cat:document.getElementById('h-cat').value,
    qty:parseFloat(document.getElementById('h-qty').value)||0, price:parseFloat(document.getElementById('h-price').value)||0,
    cost:parseFloat(document.getElementById('h-cost').value)||0, drip:document.getElementById('h-drip').value });
  document.getElementById('h-name').value=''; renderPortfolio();
}
function removeHolding(id){ S.holdings=S.holdings.filter(h=>h.id!==id); renderPortfolio(); }
function updateHoldingPrice(id,val){ const h=S.holdings.find(x=>x.id===id); if(h) h.price=parseFloat(val)||0; renderPortfolio(); }

function collectFund(){
  const g=id=>parseFloat(document.getElementById(id)?.value)||0;
  S.fund={ balance:g('fund-balance'), ss:g('fund-ss'), sg:g('fund-sg'), voluntary:g('fund-vol'),
    conCap:g('fund-con-cap'), nonConCap:g('fund-non-cap'), returnPct:g('fund-return'), target:g('fund-target') };
}
function collectSettings(){
  S.settings={ fundName:document.getElementById('s-fund-name')?.value||S.settings.fundName,
    age:parseInt(document.getElementById('s-age')?.value)||S.settings.age,
    preservationAge:parseInt(document.getElementById('s-pres-age')?.value)||60,
    trustees:parseInt(document.getElementById('s-trustees')?.value)||2 };
}
function populateForms(){
  const s=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v??''; };
  const f=S.fund;
  s('fund-balance',f.balance); s('fund-ss',f.ss); s('fund-sg',f.sg); s('fund-vol',f.voluntary);
  s('fund-con-cap',f.conCap); s('fund-non-cap',f.nonConCap); s('fund-return',f.returnPct); s('fund-target',f.target);
  s('s-fund-name',S.settings.fundName); s('s-age',S.settings.age); s('s-pres-age',S.settings.preservationAge); s('s-trustees',S.settings.trustees);
  s('inhouse-value',S.compliance.inHouseValue||0);
}

function projectToPreservation(){
  const age=S.settings.age, pres=S.settings.preservationAge, years=Math.max(0,pres-age);
  const f=S.fund, annual=annualConcessional(), r=(f.returnPct||8)/100;
  let bal=fundTotalBalance(), data=[{age,balance:bal}];
  for(let yr=1;yr<=years;yr++){ bal=bal*(1+r)+annual; data.push({age:age+yr,balance:bal}); }
  return { data, projected:bal, years };
}

function renderDashboard(){
  collectFund();
  const f=S.fund, total=fundTotalBalance(), annual=annualConcessional(), capPct=capUsedPct();
  const { projected } = projectToPreservation();
  const shortfall=f.target-projected, yearsLeft=Math.max(0,S.settings.preservationAge-S.settings.age);
  const inHouseLimit=total*0.05, inHouse=S.compliance.inHouseValue||0, inHouseOk=inHouse<=inHouseLimit;

  document.getElementById('kpi-row').innerHTML=`
    <div class="kpi blue"><div class="kpi-label">Fund Balance</div><div class="kpi-value">${fmt(total)}</div><div class="kpi-sub">${S.settings.fundName}</div></div>
    <div class="kpi gold"><div class="kpi-label">Annual Contributions</div><div class="kpi-value">${fmt(annual)}</div><div class="kpi-sub">Cap: ${fmt(f.conCap)}</div></div>
    <div class="kpi ${capPct<=100?'green':'red'}"><div class="kpi-label">Concessional Cap Used</div><div class="kpi-value">${capPct.toFixed(0)}%</div></div>
    <div class="kpi ${shortfall<=0?'green':'red'}"><div class="kpi-label">Projected at ${S.settings.preservationAge}</div><div class="kpi-value">${fmt(projected)}</div><div class="kpi-sub">Target ${fmt(f.target)}</div></div>`;

  document.getElementById('years-to-60').textContent=yearsLeft;
  const targetPct=Math.min(100,projected/(f.target||1)*100);
  document.getElementById('retirement-progress-bars').innerHTML=[
    { label:'Retirement Target', pct:targetPct, color:'var(--accent)' },
    { label:'Concessional Cap', pct:capUsedPct(), color:capUsedPct()>100?'var(--accent4)':'var(--accent2)' },
    { label:'In-House Assets', pct:total>0?Math.min(100,inHouse/inHouseLimit*100):0, color:inHouseOk?'var(--accent3)':'var(--accent4)' }
  ].map(b=>`<div class="progress-wrap"><div class="progress-header"><span>${b.label}</span><span>${b.pct.toFixed(0)}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${b.pct}%;background:${b.color}"></div></div></div>`).join('');

  const alloc=allocationByCategory(), cats=Object.keys(S.targets);
  if(donutChart) donutChart.destroy();
  donutChart=new Chart(document.getElementById('donut-chart').getContext('2d'),{
    type:'doughnut', data:{ labels:cats, datasets:[{ data:cats.map(c=>alloc[c]||0), backgroundColor:COLORS, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, cutout:'70%' }
  });
  document.getElementById('donut-legend').innerHTML=cats.map((c,i)=>`<div class="legend-item"><div class="legend-dot" style="background:${COLORS[i]}"></div><span>${c}</span><span style="font-family:var(--font-mono);color:var(--muted);margin-left:auto">${(alloc[c]||0).toFixed(1)}% / ${S.targets[c]}%</span></div>`).join('');

  if(contribChart) contribChart.destroy();
  contribChart=new Chart(document.getElementById('contrib-chart').getContext('2d'),{
    type:'bar', data:{ labels:['Salary Sacrifice','Employer SG','Voluntary'],
      datasets:[{ data:[f.ss*12,f.sg*12,f.voluntary*12], backgroundColor:['#c8a96e','#5c9eff','#4ecb8a'], borderRadius:4, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } },
      scales:{ y:{ ticks:{ callback:v=>'A$'+v.toLocaleString() } } } }
  });

  const checks=[
    { ok: capUsedPct()<=100, text:'Concessional cap within limit' },
    { ok: inHouseOk, text:'In-house assets ≤5%' },
    { ok: S.compliance.checklist.investmentStrategy, text:'Investment strategy documented' },
    { ok: S.compliance.checklist.minutes, text:'Trustee minutes current' },
    { ok: S.compliance.checklist.valuations, text:'Asset valuations up to date' }
  ];
  document.getElementById('compliance-snapshot').innerHTML=checks.map(c=>
    `<div class="check-item"><span class="check-icon">${c.ok?'✅':'⚠️'}</span><span>${c.text}</span></div>`).join('');

  const roadmap=[
    { phase:'Phase 1', timeframe:'FY Current', priority:'Maximise Concessional', action:'Salary sacrifice to cap. Review employer SG.', status:'Active' },
    { phase:'Phase 2', timeframe:'Year 1–2', priority:'STRC / SATA Core', action:'Build listed income core with DRIP in accumulation.', status:'Planned' },
    { phase:'Phase 3', timeframe:'Year 2–4', priority:'Commercial RE', action:'Acquire business real property if IPS permits at arm\'s length lease terms.', status:'Planned' },
    { phase:'Phase 4', timeframe:'Pre-60', priority:'Risk Review', action:'Rebalance toward capital preservation 5 years before pension phase.', status:'Planned' },
    { phase:'Phase 5', timeframe:'Age '+S.settings.preservationAge, priority:'Pension Phase', action:'Commence account-based pension. Meet minimum drawdown.', status:'Goal' }
  ];
  document.getElementById('roadmap-table').innerHTML=`<table><thead><tr><th>Phase</th><th>Timeframe</th><th>Priority</th><th>Action</th><th>Status</th></tr></thead><tbody>${roadmap.map(r=>`<tr><td class="td-gold">${r.phase}</td><td class="td-mono">${r.timeframe}</td><td style="font-weight:600">${r.priority}</td><td>${r.action}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
}

function renderPortfolio(){
  const total=fundTotalBalance(), tbody=document.getElementById('holdings-tbody'), tfoot=document.getElementById('holdings-tfoot');
  if(!S.holdings.length){ tbody.innerHTML='<tr><td colspan="9"><div class="empty-state">No fund assets</div></td></tr>'; tfoot.innerHTML=''; return; }
  tbody.innerHTML=S.holdings.map(h=>{
    const val=totalValue(h), gain=val-(h.cost||0), pct=total>0?val/total*100:0;
    return `<tr><td style="font-weight:600">${h.name}</td><td><span class="badge badge-blue">${h.cat}</span></td>
      <td class="td-mono">${fmtNum(h.qty,4)}</td>
      <td class="td-mono"><input type="number" value="${h.price}" style="width:100px;padding:4px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text)" onchange="updateHoldingPrice(${h.id},this.value)"></td>
      <td class="td-mono td-gold">${fmt(val)}</td><td class="td-mono">${fmt(h.cost)}</td>
      <td class="td-mono ${gain>=0?'td-green':'td-red'}">${fmt(gain)}</td><td class="td-mono">${pct.toFixed(1)}%</td>
      <td><button class="btn" style="padding:4px 10px;font-size:11px;color:var(--accent4)" onclick="removeHolding(${h.id})">✕</button></td></tr>`;
  }).join('');
  const tc=S.holdings.reduce((s,h)=>s+(h.cost||0),0);
  tfoot.innerHTML=`<tr><td colspan="4" style="font-weight:700;color:var(--accent)">TOTAL</td><td class="td-gold" style="font-weight:700">${fmt(total)}</td><td>${fmt(tc)}</td><td colspan="3"></td></tr>`;
  const alloc=allocationByCategory();
  document.getElementById('allocation-bars').innerHTML=Object.entries(S.targets).map(([cat,tgt])=>{
    const actual=alloc[cat]||0, color=CAT_COLORS[cat]||'#64748b';
    return `<div class="progress-wrap"><div class="progress-header"><span>${cat}</span><span>${actual.toFixed(1)}% vs ${tgt}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,actual/(tgt||1)*100)}%;background:${color}"></div></div></div>`;
  }).join('');
}

function calcFund(){ collectFund(); renderContributions(); }
function renderContributions(){
  populateForms(); collectFund();
  const f=S.fund, annual=annualConcessional(), capPct=capUsedPct();
  const { data, projected } = projectToPreservation();

  document.getElementById('contrib-kpis').innerHTML=`
    <div class="kpi gold"><div class="kpi-label">FY Concessional</div><div class="kpi-value">${fmt(annual)}</div><div class="kpi-sub">${capPct.toFixed(0)}% of cap</div></div>
    <div class="kpi blue"><div class="kpi-label">Employer SG (p.a.)</div><div class="kpi-value">${fmt(f.sg*12)}</div></div>
    <div class="kpi green"><div class="kpi-label">Salary Sacrifice (p.a.)</div><div class="kpi-value">${fmt(f.ss*12)}</div></div>
    <div class="kpi ${annual<=f.conCap?'green':'red'}"><div class="kpi-label">Cap Headroom</div><div class="kpi-value">${fmt(Math.max(0,f.conCap-annual))}</div></div>`;

  if(fundGrowthChart) fundGrowthChart.destroy();
  fundGrowthChart=new Chart(document.getElementById('fund-growth-chart').getContext('2d'),{
    type:'line', data:{ labels:data.map(d=>'Age '+d.age),
      datasets:[
        { label:'Fund Balance', data:data.map(d=>d.balance), borderColor:'#5c9eff', backgroundColor:'rgba(92,158,255,.1)', fill:true, tension:.3 },
        { label:'Target', data:data.map(()=>f.target), borderColor:'#c8a96e', borderDash:[5,5], pointRadius:0 }
      ] },
    options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ ticks:{ callback:v=>'A$'+(v/1e6).toFixed(1)+'M' } } } }
  });

  document.getElementById('fy-contrib-table').innerHTML=`<table><thead><tr><th>Source</th><th>Monthly</th><th>Annual</th><th>% of Cap</th></tr></thead><tbody>
    <tr><td>Salary Sacrifice</td><td class="td-mono">${fmt(f.ss)}</td><td class="td-mono">${fmt(f.ss*12)}</td><td class="td-mono">${(f.ss*12/f.conCap*100).toFixed(1)}%</td></tr>
    <tr><td>Employer SG</td><td class="td-mono">${fmt(f.sg)}</td><td class="td-mono">${fmt(f.sg*12)}</td><td class="td-mono">${(f.sg*12/f.conCap*100).toFixed(1)}%</td></tr>
    <tr><td>Voluntary Concessional</td><td class="td-mono">${fmt(f.voluntary)}</td><td class="td-mono">${fmt(f.voluntary*12)}</td><td class="td-mono">${(f.voluntary*12/f.conCap*100).toFixed(1)}%</td></tr>
    <tr style="background:rgba(200,169,110,.05)"><td style="font-weight:700">Total Concessional</td><td></td><td class="td-gold" style="font-weight:700">${fmt(annual)}</td><td class="td-mono ${capPct>100?'td-red':'td-green'}">${capPct.toFixed(0)}%</td></tr>
    <tr><td colspan="4" style="font-size:12px;color:var(--muted);padding-top:12px">Non-concessional cap available: ${fmt(f.nonConCap)} p.a. · Projected balance at ${S.settings.preservationAge}: <strong>${fmt(projected)}</strong></td></tr>
  </tbody></table>`;
}

function updateInHouse(){
  S.compliance.inHouseValue=parseFloat(document.getElementById('inhouse-value').value)||0;
  renderCompliance(); saveAll();
}
function renderCompliance(){
  populateForms();
  const total=fundTotalBalance(), limit=total*0.05, val=S.compliance.inHouseValue||0;
  document.getElementById('inhouse-limit').value=fmt(limit);
  document.getElementById('inhouse-status').innerHTML=`<div class="progress-wrap"><div class="progress-header"><span>Related-party assets</span><span>${fmt(val)} / ${fmt(limit)}</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${limit>0?Math.min(100,val/limit*100):0}%;background:${val<=limit?'var(--accent3)':'var(--accent4)'}"></div></div>
    <p style="margin-top:8px;font-size:12px;color:${val<=limit?'var(--accent3)':'var(--accent4)'}">${val<=limit?'✓ Within 5% limit':'⚠ Exceeds in-house asset limit'}</p></div>`;

  const items=[
    'Annual independent audit completed','Trustee meeting minutes (min quarterly)','Investment strategy reviewed',
    'Asset market valuations documented','ATO SMSF annual return lodged','Beneficiary nominations current',
    'Related-party lease agreements (if LRBA/property)','Segregated pension assets (if in pension phase)'
  ];
  document.getElementById('compliance-checklist-full').innerHTML=items.map((text,i)=>{
    const key=Object.keys(S.compliance.checklist)[i];
    const checked=key?S.compliance.checklist[key]:i<3;
    return `<label class="check-item" style="cursor:pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleCheck('${key||'item'+i}',this.checked)" style="margin-right:8px"><span>${text}</span></label>`;
  }).join('');
}
function toggleCheck(key,val){ if(S.compliance.checklist[key]!==undefined) S.compliance.checklist[key]=val; }

function calcProjections(){ renderProjections(); }
function renderProjections(){
  collectFund();
  const { data } = projectToPreservation(), years=data.length-1;
  const scenarios=[{label:'Conservative',r:5,c:'#5c9eff'},{label:'Base',r:S.fund.returnPct||8,c:'#c8a96e'},{label:'Optimistic',r:11,c:'#4ecb8a'}];
  const annual=annualConcessional();
  const datasets=scenarios.map(sc=>{
    let bal=fundTotalBalance(); const pts=[bal];
    for(let i=1;i<=years;i++){ bal=bal*(1+sc.r/100)+annual; pts.push(bal); }
    return { label:sc.label+' ('+sc.r+'%)', data:pts, borderColor:sc.c, tension:.3, borderWidth:2 };
  });
  if(projChartInst) projChartInst.destroy();
  projChartInst=new Chart(document.getElementById('proj-chart').getContext('2d'),{
    type:'line', data:{ labels:data.map(d=>'Age '+d.age), datasets },
    options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ ticks:{ callback:v=>'A$'+(v/1e6).toFixed(1)+'M' } } } }
  });
  document.getElementById('proj-table').innerHTML=`<table><thead><tr><th>Age</th><th>Conservative</th><th>Base</th><th>Optimistic</th><th>Target?</th></tr></thead><tbody>${data.map((d,i)=>{
    const row=scenarios.map(sc=>{ let bal=fundTotalBalance();
      for(let y=1;y<=i;y++) bal=bal*(1+sc.r/100)+annual; return bal; });
    const hit=row[1]>=S.fund.target;
    return `<tr ${hit?"style='background:rgba(78,203,138,.05)'":''}><td class="td-mono">${d.age}</td>
      <td class="td-mono">${fmt(row[0])}</td><td class="td-mono td-gold">${fmt(row[1])}</td><td class="td-mono td-green">${fmt(row[2])}</td>
      <td>${hit?'<span class="badge badge-green">On target</span>':''}</td></tr>`;
  }).join('')}</tbody></table>`;
}

function renderSettings(){
  populateForms();
  document.getElementById('target-alloc-form').innerHTML=Object.keys(S.targets).map(cat=>`
    <div class="form-group"><label>${cat} (%)</label><input type="number" id="tgt-${cat.replace(/\s+/g,'-')}" value="${S.targets[cat]}" step="0.5"></div>`).join('')+
    `<div style="margin-top:12px;font-size:12px;color:var(--muted)">Total: ${Object.values(S.targets).reduce((s,v)=>s+v,0)}%</div>`;
}
function saveTargets(){
  Object.keys(S.targets).forEach(cat=>{ const el=document.getElementById('tgt-'+cat.replace(/\s+/g,'-')); if(el) S.targets[cat]=parseFloat(el.value)||0; });
  saveAll();
}
function saveSettings(){ collectSettings(); saveAll(); }

function calcFireUp(){
  const balance=parseFloat(document.getElementById('fu-balance')?.value)||0;
  const fee=parseFloat(document.getElementById('fu-fee')?.value)||0;
  const ret=parseFloat(document.getElementById('fu-return')?.value)||0;
  const lost=parseFloat(document.getElementById('fu-lost')?.value)||0;
  const improved=balance+lost-fee;
  const est5=improved*Math.pow(1+ret/100,5);
  const el=document.getElementById('fire-up-result');
  if(el){ el.innerHTML=`<div class="card"><h3>Fire-Up Snapshot</h3><p>Adjusted starting balance: <strong>${fmt(improved)}</strong></p><p>Indicative 5-year balance at ${ret}%: <strong>${fmt(est5)}</strong></p></div>`; }
}

function exportPensionFundReport(){
  if(typeof window.jspdf==='undefined'){ alert('PDF library not loaded. Please reload with internet access.'); return; }
  collectFund(); collectSettings();
  const toast=document.getElementById('save-toast');
  if(toast){ toast.textContent=t('reportGenerating'); toast.classList.add('show'); }

  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({ unit:'mm', format:'a4' });
  const pageW=doc.internal.pageSize.getWidth();
  const margin=14;
  const reportDate=new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
  const total=fundTotalBalance();
  const annual=annualConcessional();
  const capPct=capUsedPct();
  const proj=projectToPreservation();
  const alloc=allocationByCategory();
  const inHouseLimit=total*0.05;
  const inHouse=S.compliance.inHouseValue||0;

  const NAVY=[30,58,95], GOLD=[200,169,110], GRAY=[100,100,100];
  function header(cover){
    doc.setFillColor(...NAVY); doc.rect(0,0,pageW,cover?32:22,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.setFontSize(cover?24:16); doc.text('Pension Fund',margin,cover?18:14);
    doc.setFont('helvetica','normal'); doc.setFontSize(cover?13:10);
    doc.text('Client Report',margin,cover?26:20);
    if(!cover) doc.text(reportDate,pageW-margin,14,{align:'right'});
    doc.setTextColor(0,0,0);
  }
  function section(title,y){
    if(y>260){ doc.addPage(); header(false); y=28; }
    doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...NAVY); doc.text(title,margin,y);
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(margin,y+2,pageW-margin,y+2); doc.setTextColor(0,0,0);
    return y+8;
  }
  function table(head,body,y){
    doc.autoTable({
      startY:y, head:[head], body, margin:{left:margin,right:margin}, theme:'grid',
      headStyles:{ fillColor:NAVY, textColor:[255,255,255], fontSize:9 }, bodyStyles:{ fontSize:9, cellPadding:2.5 },
      alternateRowStyles:{ fillColor:[248,248,252] }
    });
    return doc.lastAutoTable.finalY+6;
  }

  header(true);
  let y=42;
  y=section('Fund Profile',y);
  y=table(['Field','Value'],[
    ['Fund name',S.settings.fundName||'Pension Fund'],
    ['Member age',String(S.settings.age)],
    ['Preservation age',String(S.settings.preservationAge)],
    ['Trustees',String(S.settings.trustees)],
    ['Report date',reportDate]
  ],y);

  y=section('Current Financial Position',y);
  y=table(['Metric','Value'],[
    ['Total fund balance',fmt(total)],
    ['Annual concessional contributions',fmt(annual)],
    ['Concessional cap',fmt(S.fund.conCap)],
    ['Cap used',capPct.toFixed(1)+'%'],
    ['Projected at preservation age',fmt(proj.projected)],
    ['Target balance',fmt(S.fund.target)]
  ],y);

  y=section('Holdings Register',y);
  y=table(['Asset','Class','Value','Cost Base'],S.holdings.map(h=>[
    h.name,h.cat,fmt(totalValue(h)),fmt(h.cost||0)
  ]),y);

  y=section('IPS Target vs Actual',y);
  y=table(['Asset Class','Actual %','Target %','Variance'],Object.keys(S.targets).map(cat=>{
    const actual=alloc[cat]||0; return [cat,actual.toFixed(1)+'%',S.targets[cat]+'%',(actual-S.targets[cat]).toFixed(1)+'%'];
  }),y);

  y=section('Compliance Snapshot',y);
  y=table(['Check','Status'],[
    ['In-house assets <= 5%', inHouse<=inHouseLimit ? 'Pass' : 'Review required'],
    ['In-house value', fmt(inHouse)],
    ['In-house limit', fmt(inHouseLimit)],
    ['Investment strategy documented', S.compliance.checklist.investmentStrategy ? 'Yes' : 'No'],
    ['Trustee minutes current', S.compliance.checklist.minutes ? 'Yes' : 'No'],
    ['Asset valuations current', S.compliance.checklist.valuations ? 'Yes' : 'No']
  ],y);

  const count=doc.getNumberOfPages();
  for(let i=1;i<=count;i++){
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text(`Pension Fund Report · ${reportDate} · Page ${i} of ${count}`,margin,290);
    doc.text('Information only. Not financial advice.',margin,294);
  }
  const safe=(S.settings.fundName||'pension-fund').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-');
  doc.save(`Pension-Fund-Report-${safe||'fund'}-${new Date().toISOString().slice(0,10)}.pdf`);
  if(toast){ toast.textContent=t('reportReady'); setTimeout(()=>toast.classList.remove('show'),2200); }
}

loadState(); updateLastUpdated(); populateForms(); applyLanguage();
const _hash = location.hash.replace('#', '');
if (_hash && document.getElementById('page-' + _hash)) showPage(_hash);
else renderDashboard();

(() => {
  const dd = document.getElementById('header-actions');
  if (!dd) return;
  document.addEventListener('click', (e) => {
    if (!dd.classList.contains('open')) return;
    if (dd.contains(e.target)) {
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
