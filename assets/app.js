// Seedli ROI Calculator — Activation-aware (v6)
// - Activation basis: "Any Seedli use" (entered × 1.5, cap 45%) vs "Logins only" (strict)
// - Presets: Low impact / Typical / High impact (realistic adoption)
// - Clean 2×2 KPIs, negative ROI hint, single-page A4 print, logo fallback handled in HTML

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

  // --- Pricing ---
  const PRICE_PER_EMP = 500;        // inc GST
  const PRICE_INCLUDES_GST = true;  // ROI uses ex-GST
  const priceExGST = PRICE_INCLUDES_GST ? PRICE_PER_EMP / 1.10 : PRICE_PER_EMP;

  // --- Activation parameters (as agreed) ---
  const ANY_MULTIPLIER = 1.5;
  const ANY_CAP        = 0.45; // 45%

  function effectiveActivation(entered, basis){
    const a = Math.max(0, Math.min(1, entered/100));
    if (basis === 'any'){
      return Math.min(ANY_CAP, a * ANY_MULTIPLIER);
    }
    return a; // logins only
  }

  function calc(){
    // Core
    const employees   = num('employees', 0);
    const salary      = num('salary', 0);
    const enteredAdo  = num('adoptionPct', 0);
    const basis       = (document.querySelector('input[name="activationBasis"]:checked')?.value)||'any';
    const activation  = effectiveActivation(enteredAdo, basis); // 0..1

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
    const managerTotal = mgrCount * mgrHours * 12 * mgrHourly * activation; // weighted by activation
    const managerPerEmp = (activation > 0) ? managerTotal / (employees * activation) : 0;

    // Totals
    const weightedPerEmp = prodPerEmp + turnoverPerEmp + absencePerEmp;
    const channelSavings = employees * activation * weightedPerEmp + managerTotal;

    const cost = priceExGST * employees;
    const net  = channelSavings - cost;
    const roi  = cost > 0 ? (net / cost) * 100 : 0;

    // Break-even activation (%) – solve for activation given cost and per-emp savings
    const denom = weightedPerEmp + managerPerEmp;
    const be = denom > 0 ? (priceExGST / denom) * 100 : NaN;

    // UI render
    setText('savings', fmtAUD(channelSavings));
    setText('cost',    fmtAUD(cost));
    setText('net',     fmtAUD(net));
    setText('roiPct',  `${Math.round(roi)}% ROI`);
    setText('breakeven', Number.isFinite(be) ? `${Math.max(0, Math.min(100, be)).toFixed(1)}%` : '—');

    // Breakdown
    const b1 = fmtAUD(employees * activation * prodPerEmp);
    const b2 = fmtAUD(employees * activation * turnoverPerEmp);
    const b3 = fmtAUD(employees * activation * absencePerEmp);
    const b4 = fmtAUD(managerTotal);
    setText('savingsBreakdown', `Includes Productivity ${b1} · Turnover ${b2} · Absenteeism ${b3} · Manager time ${b4}`);

    const note = $('costNote');
    if (note) note.textContent = PRICE_INCLUDES_GST
      ? 'Ex-GST (plan price ÷ 1.10 × total employees)'
      : 'Ex-GST (plan price × total employees)';

    // Negative hint
    const hint = $('negHint');
    if (hint){
      if (net < 0 && Number.isFinite(be)){
        // suggest: either increase activation or reduction
        const neededAct = be.toFixed(1);
        const needBasis = (basis==='any')?'activation':'activation';
        hint.textContent = `Hint: Increase ${needBasis} to ~${neededAct}% or raise “Reduction with program” to improve ROI.`;
      } else {
        hint.textContent = '';
      }
    }

    // Activation line (web + print)
    const effPct = Math.round(activation*100);
    const line = $('activationLine');
    if (line){
      if (basis === 'any'){
        line.textContent = `Activation basis: Any Seedli use — effective ${effPct}% from entered ${enteredAdo}% (×1.5, capped at 45%).`;
      } else {
        line.textContent = `Activation basis: Logins only — effective ${effPct}% (same as entered ${enteredAdo}%).`;
      }
    }

    // Exec summary for print
    setText('sumSavings', `Savings ${fmtAUD(channelSavings)}`);
    setText('sumCost',    `Cost ${fmtAUD(cost)}`);
    setText('sumNet',     `Net ${fmtAUD(net)}`);
    setText('sumRoi',     `${Math.round(roi)}% ROI`);
  }

  // ---------- UI wiring ----------
  function wireInputs(){
    qa('input[type="number"]').forEach(el=>{
      el.addEventListener('input',  calc, { passive:true });
      el.addEventListener('change', calc);
    });
    qa('input[name="activationBasis"]').forEach(el=>{
      el.addEventListener('change', calc);
    });
  }

  function wireTooltips(){
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
    document.addEventListener('click', ()=>{
      qa('.field.open,.kbox.open').forEach(x=>x.classList.remove('open'));
      qa('.info[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));
    });
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape'){
        qa('.field.open,.kbox.open').forEach(x=>x.classList.remove('open'));
        qa('.info[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));
      }
    });
  }

  function applyPreset(kind){
    // Adoption (entered) based on realistic ranges
    if (kind === 'low'){
      $('salary').value = 100000;
      $('lossPct').value = 3.0;
      $('reductionPct').value = 22;
      $('adoptionPct').value = 18;

      $('turnoverRate').value = 10;
      $('turnoverReduction').value = 8;
      $('replacementPct').value = 45;

      $('daysAbsence').value = 3.0;
      $('absenceReduction').value = 10;

      $('managerRatio').value = 12;
      $('mgrHours').value = 0.6;
      $('mgrSalary').value = 135000;
      document.querySelector('input[name="activationBasis"][value="any"]').checked = true;
    } else if (kind === 'typical'){
      $('salary').value = 110000;
      $('lossPct').value = 4.0;
      $('reductionPct').value = 30;
      $('adoptionPct').value = 28;

      $('turnoverRate').value = 13;
      $('turnoverReduction').value = 10;
      $('replacementPct').value = 50;

      $('daysAbsence').value = 3.5;
      $('absenceReduction').value = 15;

      $('managerRatio').value = 10;
      $('mgrHours').value = 1.0;
      $('mgrSalary').value = 140000;
      document.querySelector('input[name="activationBasis"][value="any"]').checked = true;
    } else { // high
      $('salary').value = 120000;
      $('lossPct').value = 5.0;
      $('reductionPct').value = 35;
      $('adoptionPct').value = 38;

      $('turnoverRate').value = 16;
      $('turnoverReduction').value = 15;
      $('replacementPct').value = 60;

      $('daysAbsence').value = 4.0;
      $('absenceReduction').value = 18;

      $('managerRatio').value = 9;
      $('mgrHours').value = 1.2;
      $('mgrSalary').value = 145000;
      document.querySelector('input[name="activationBasis"][value="any"]').checked = true;
    }
    qa('.segment').forEach(b=>{ b.classList.toggle('is-active', b.dataset.preset===kind); b.setAttribute('aria-checked', String(b.dataset.preset===kind)); });
    calc();
  }

  function wirePresets(){
    qa('.segment').forEach(btn=>{
      btn.addEventListener('click', ()=> applyPreset(btn.dataset.preset));
      btn.addEventListener('keydown', (e)=>{
        const order = ['low','typical','high'];
        const curKey = qa('.segment.is-active')[0]?.dataset.preset;
        const cur = order.indexOf(curKey);
        if (e.key === 'ArrowRight'){ e.preventDefault(); applyPreset(order[Math.min(order.length-1, cur+1)]); }
        if (e.key === 'ArrowLeft'){  e.preventDefault(); applyPreset(order[Math.max(0, cur-1)]); }
      });
    });
    applyPreset('typical'); // default
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
    window.onbeforeprint = () => {
      document.body.classList.add('print-compact');
      document.querySelector('.exec-summary')?.style.setProperty('display','flex');
    };
    window.onafterprint  = () => {
      document.body.classList.remove('print-compact');
      document.querySelector('.exec-summary')?.style.removeProperty('display');
    };
    btn.addEventListener('click', (e)=>{ e.preventDefault(); window.print(); });
  }

  wireInputs();
  wireTooltips();
  wirePresets();
  wireAdvanced();
  wirePDF();
  calc();
})();
