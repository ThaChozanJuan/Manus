// Seedli ROI Calculator — Clean UI (v7)
// - No activation-basis control; adoption treated as “any use”: entered × 1.5, cap 45%
// - 3-stop preset slider (Low impact / Typical / High impact)
// - Floating tooltips (don't push layout)
// - One-page print tightening handled by CSS in index.html

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

  // Pricing
  const PRICE_PER_EMP = 500;        // inc GST
  const PRICE_INCLUDES_GST = true;  // ROI uses ex-GST
  const priceExGST = PRICE_INCLUDES_GST ? PRICE_PER_EMP / 1.10 : PRICE_PER_EMP;

  // Activation model (always-on)
  const ANY_MULTIPLIER = 1.5;
  const ANY_CAP        = 0.45; // 45%
  const effectiveActivation = (entered) => Math.min(ANY_CAP, Math.max(0, Math.min(1, entered/100) * ANY_MULTIPLIER));

  function calc(){
    const employees  = num('employees', 0);
    const salary     = num('salary', 0);
    const lossPct    = num('lossPct', 0) / 100;
    const reducPct   = num('reductionPct', 0) / 100;
    const enteredAdo = num('adoptionPct', 0);
    const activation = effectiveActivation(enteredAdo); // 0..1

    // Productivity
    const prodPerEmp = salary * lossPct * reducPct;

    // Turnover
    const tRate      = num('turnoverRate', 0) / 100;
    const tRed       = num('turnoverReduction', 0) / 100;
    const replPct    = num('replacementPct', 50) / 100;
    const turnoverPerEmp = tRate * (replPct * salary) * tRed;

    // Absenteeism
    const days       = num('daysAbsence', 0);
    const aRed       = num('absenceReduction', 0) / 100;
    const dailyCost  = salary / 220;
    const absencePerEmp = days * aRed * dailyCost;

    // Manager time saved
    const mgrRatio   = Math.max(1, num('managerRatio', 10));
    const mgrCount   = employees / mgrRatio;
    const mgrHours   = num('mgrHours', 1.0);
    const mgrSalary  = num('mgrSalary', 140000);
    const mgrHourly  = mgrSalary / 1980;
    const managerTotal = mgrCount * mgrHours * 12 * mgrHourly * activation; // weighted by activation
    const managerPerEmp = (activation > 0) ? managerTotal / (employees * activation) : 0;

    // Totals
    const weightedPerEmp = prodPerEmp + turnoverPerEmp + absencePerEmp;
    const channelSavings = employees * activation * weightedPerEmp + managerTotal;

    const cost = priceExGST * employees;
    const net  = channelSavings - cost;
    const roi  = cost > 0 ? (net / cost) * 100 : 0;

    // Break-even activation (%)
    const denom = weightedPerEmp + managerPerEmp;
    const be = denom > 0 ? (priceExGST / denom) * 100 : NaN;

    // UI
    setText('savings', fmtAUD(channelSavings));
    setText('cost',    fmtAUD(cost));
    setText('net',     fmtAUD(net));
    setText('roiPct',  `${Math.round(roi)}% ROI`);
    setText('breakeven', Number.isFinite(be) ? `${Math.max(0, Math.min(100, be)).toFixed(1)}%` : '—');

    const hint = $('negHint');
    if (hint){
      if (net < 0 && Number.isFinite(be)){
        hint.textContent = `Hint: Increase activation to ~${be.toFixed(1)}% or raise “Reduction with program” to improve ROI.`;
      } else {
        hint.textContent = '';
      }
    }
  }

  // Floating tooltip behaviour
  function wireTooltips(){
    qa('.info').forEach(btn=>{
      const id = btn.getAttribute('data-tip');
      const pop = id ? document.getElementById(id) : null;
      const holder = btn.closest('.field') || btn.closest('.kbox');
      if (!pop || !holder) return;

      const open = (show) => holder.classList.toggle('show-tip', show);

      btn.addEventListener('click', (e)=>{ e.stopPropagation(); open(!holder.classList.contains('show-tip')); });
      document.addEventListener('click', ()=> open(false));
      document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') open(false); });
    });
  }

  // Advanced toggle
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

  // Preset slider
  function applyPreset(idx){
    const i = Number(idx);
    if (i===0){           // Low impact
      $('salary').value=100000; $('lossPct').value=3.0; $('reductionPct').value=22; $('adoptionPct').value=18;
      $('turnoverRate').value=10; $('turnoverReduction').value=8; $('replacementPct').value=45;
      $('daysAbsence').value=3.0; $('absenceReduction').value=10;
      $('managerRatio').value=12; $('mgrHours').value=0.6; $('mgrSalary').value=135000;
    } else if (i===1){    // Typical
      $('salary').value=110000; $('lossPct').value=4.0; $('reductionPct').value=30; $('adoptionPct').value=28;
      $('turnoverRate').value=13; $('turnoverReduction').value=10; $('replacementPct').value=50;
      $('daysAbsence').value=3.5; $('absenceReduction').value=15;
      $('managerRatio').value=10; $('mgrHours').value=1.0; $('mgrSalary').value=140000;
    } else {              // High impact
      $('salary').value=120000; $('lossPct').value=5.0; $('reductionPct').value=35; $('adoptionPct').value=38;
      $('turnoverRate').value=16; $('turnoverReduction').value=15; $('replacementPct').value=60;
      $('daysAbsence').value=4.0; $('absenceReduction').value=18;
      $('managerRatio').value=9;  $('mgrHours').value=1.2; $('mgrSalary').value=145000;
    }
    calc();
  }
  function wirePresetSlider(){
    const r = $('presetRange'); if(!r) return;
    r.addEventListener('input', ()=>applyPreset(r.value));
    applyPreset(r.value);
  }

  // Inputs + print
  function wireInputs(){
    qa('input[type="number"]').forEach(el=>{
      el.addEventListener('input',  calc, { passive:true });
      el.addEventListener('change', calc);
    });
  }
  function wirePrint(){
    const btn = $('pdfBtn'); if (!btn) return;
    btn.addEventListener('click', (e)=>{ e.preventDefault(); window.print(); });
  }

  wireInputs();
  wireTooltips();
  wireAdvanced();
  wirePresetSlider();
  wirePrint();
  calc();
})();
