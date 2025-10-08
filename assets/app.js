// Seedli ROI Calculator — Final polish (v5)
// Channels: Productivity + Turnover + Absenteeism + Manager time
// Cost = price × total employees (ex-GST). One-page A4 print with AU date.
// Segmented presets (Conservative, Base, Confident). Info-bubble tooltips.
// All numbers in AUD.

(() => {
  const $  = (id) => document.getElementById(id);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  const num = (id, d=0) => {
    const el = $(id); if(!el) return d;
    const v = parseFloat((el.value||'').toString().replace(/[^\d.]/g,''));
    return Number.isFinite(v) ? v : d;
  };
  const fmtAUD = (n) => (Number.isFinite(n)?n:0).toLocaleString('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});

  // Pricing (edit if plan changes)
  const PRICE_PER_EMP = 500;        // inc GST
  const PRICE_INCLUDES_GST = true;  // ROI uses ex-GST
  const priceExGST = PRICE_INCLUDES_GST ? PRICE_PER_EMP / 1.10 : PRICE_PER_EMP;

  function calc(){
    // Core
    const employees   = num('employees', 0);
    const salary      = num('salary', 0);
    const adoption    = num('adoptionPct', 0) / 100;

    // Productivity
    const lossPct     = num('lossPct', 0) / 100;
    const reducPct    = num('reductionPct', 0) / 100;
    const prodPerEmp  = salary * lossPct * reducPct;

    // Turnover
    const tRate       = num('turnoverRate', 0) / 100;
    const tRed        = num('turnoverReduction', 0) / 100;
    const replacePct  = num('replacementPct', 50) / 100;
    const turnoverPerEmp = tRate * (replacePct * salary) * tRed;

    // Absenteeism
    const days        = num('daysAbsence', 0);
    const aRed        = num('absenceReduction', 0) / 100;
    const dailyCost   = salary / 220;
    const absencePerEmp = days * aRed * dailyCost;

    // Manager time saved
    const mgrRatio    = Math.max(1, num('managerRatio', 10));
    const mgrCount    = employees / mgrRatio;
    const mgrHours    = num('mgrHours', 1.0);
    const mgrSalary   = num('mgrSalary', 140000);
    const mgrHourly   = mgrSalary / 1980;
    const managerTotal = mgrCount * mgrHours * 12 * mgrHourly * adoption; // weighted by adoption exposure
    const managerPerEmp = (adoption > 0) ? managerTotal / (employees * adoption) : 0;

    // Totals
    const weightedPerEmp = prodPerEmp + turnoverPerEmp + absencePerEmp;
    const channelSavings = employees * adoption * weightedPerEmp + managerTotal;

    const cost = priceExGST * employees;
    const net  = channelSavings - cost;
    const roi  = cost > 0 ? (net / cost) * 100 : 0;

    // Break-even adoption (%) – solve for adoption given cost and per-emp savings
    const denom = weightedPerEmp + managerPerEmp;
    const be = denom > 0 ? (priceExGST / denom) * 100 : NaN;

    setText('savings', fmtAUD(channelSavings));
    setText('cost',    fmtAUD(cost));
    setText('net',     fmtAUD(net));
    setText('roiPct',  `${Math.round(roi)}% ROI`);
    setText('breakeven', Number.isFinite(be) ? `${Math.max(0, Math.min(100, be)).toFixed(1)}%` : '—');

    // Breakdown
    const b1 = fmtAUD(employees * adoption * prodPerEmp);
    const b2 = fmtAUD(employees * adoption * turnoverPerEmp);
    const b3 = fmtAUD(employees * adoption * absencePerEmp);
    const b4 = fmtAUD(managerTotal);
    setText('savingsBreakdown', `Includes Productivity ${b1} · Turnover ${b2} · Absenteeism ${b3} · Manager time ${b4}`);

    const note = $('costNote');
    if (note) note.textContent = PRICE_INCLUDES_GST
      ? 'Ex-GST (plan price ÷ 1.10 × total employees)'
      : 'Ex-GST (plan price × total employees)';
  }

  // ---------- UI wiring ----------
  function wireInputs(){
    qa('input[type="number"]').forEach(el=>{
      el.addEventListener('input',  calc, { passive:true });
      el.addEventListener('change', calc);
    });
  }

  function wireTooltips(){
    // open/close on click
    qa('.info').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const holder = btn.closest('.field') || btn.closest('.kbox');
        const open = holder.classList.contains('open');
        qa('.field.open,.kbox.open').forEach(x=>x.classList.remove('open'));
        qa('.info[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));
        if (!open){ holder.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
    // global close
    document.addEventListener('click', ()=>{
      qa('.field.open,.kbox.open').forEach(x=>x.classList.remove('open'));
      qa('.info[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));
    });
    // esc close
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape'){
        qa('.field.open,.kbox.open').forEach(x=>x.classList.remove('open'));
        qa('.info[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));
      }
    });
  }

  function applyPreset(kind){
    // Preset values (can be tuned later)
    if (kind === 'conservative'){
      $('salary').value = 100000;
      $('lossPct').value = 3.5;
      $('reductionPct').value = 30;
      $('adoptionPct').value = 50;

      $('turnoverRate').value = 12;
      $('turnoverReduction').value = 8;
      $('replacementPct').value = 40;

      $('daysAbsence').value = 3.0;
      $('absenceReduction').value = 12;

      $('managerRatio').value = 12;
      $('mgrHours').value = 0.7;
      $('mgrSalary').value = 135000;
    } else if (kind === 'base'){
      $('salary').value = 110000;
      $('lossPct').value = 4.0;
      $('reductionPct').value = 30;
      $('adoptionPct').value = 50;

      $('turnoverRate').value = 15;
      $('turnoverReduction').value = 10;
      $('replacementPct').value = 50;

      $('daysAbsence').value = 4.0;
      $('absenceReduction').value = 15;

      $('managerRatio').value = 10;
      $('mgrHours').value = 1.0;
      $('mgrSalary').value = 140000;
    } else { // confident
      $('salary').value = 120000;
      $('lossPct').value = 5.0;
      $('reductionPct').value = 35;
      $('adoptionPct').value = 60;

      $('turnoverRate').value = 18;
      $('turnoverReduction').value = 12;
      $('replacementPct').value = 60;

      $('daysAbsence').value = 4.5;
      $('absenceReduction').value = 18;

      $('managerRatio').value = 9;
      $('mgrHours').value = 1.2;
      $('mgrSalary').value = 145000;
    }
    qa('.segment').forEach(b=>{ b.classList.toggle('is-active', b.dataset.preset===kind); b.setAttribute('aria-checked', String(b.dataset.preset===kind)); });
    calc();
  }

  function wirePresets(){
    qa('.segment').forEach(btn=>{
      btn.addEventListener('click', ()=> applyPreset(btn.dataset.preset));
      btn.addEventListener('keydown', (e)=>{
        const order = ['conservative','base','confident'];
        const cur = order.findIndex(k => qa('.segment.is-active')[0]?.dataset.preset === k);
        if (e.key === 'ArrowRight'){ e.preventDefault(); applyPreset(order[Math.min(order.length-1, cur+1)]); }
        if (e.key === 'ArrowLeft'){  e.preventDefault(); applyPreset(order[Math.max(0, cur-1)]); }
      });
    });
    applyPreset('base'); // default
  }

  function wireAdvanced(){
    const t = document.querySelector('.adv-toggle');
    const p = document.getElementById('adv');
    if (!t || !p) return;
    t.addEventListener('click', ()=>{
      const open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!open));
      p.classList.toggle('show', !open);
    });
  }

  function wirePDF(){
    const btn = $('pdfBtn'); if (!btn) return;
    const ph = $('printDate');
    if (ph) ph.textContent = new Date().toLocaleDateString('en-AU',{day:'2-digit',month:'2-digit',year:'numeric'});
    window.onbeforeprint = () => document.body.classList.add('print-compact');
    window.onafterprint  = () => document.body.classList.remove('print-compact');
    btn.addEventListener('click', (e)=>{ e.preventDefault(); window.print(); });
  }

  wireInputs();
  wireTooltips();
  wirePresets();
  wireAdvanced();
  wirePDF();
  calc();
})();
