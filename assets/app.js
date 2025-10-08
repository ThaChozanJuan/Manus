// Seedli ROI Calculator — v3.1
// Cost = plan price × TOTAL EMPLOYEES (ex-GST). ROI% varies with adoption.
// One-page A4 print, AU date, aligned inputs, 2×2 KPI grid.

(() => {
  const $ = (id) => document.getElementById(id);
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- Brand pricing (edit here if plan changes) ----------
  const PRICE_PER_EMP = 500;        // Seedli plan, per employee per year (INC GST)
  const PRICE_INCLUDES_GST = true;  // true = includes GST; ROI math uses ex-GST

  const fmtAUD = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString('en-AU', {
      style:'currency', currency:'AUD', maximumFractionDigits:0
    });

  function num(id, d=0){
    const el = $(id); if(!el) return d;
    const v = parseFloat((el.value||'').toString().replace(/[^\d.]/g,''));
    return Number.isFinite(v) ? v : d;
  }
  const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };

  function calc(){
    const employees = num('employees', 0);
    const salary    = num('salary', 0);
    const lossPct   = num('lossPct', 0)      / 100;
    const reducPct  = num('reductionPct', 0) / 100;
    const adoptPct  = num('adoptionPct', 0)  / 100;

    // Plan price used in ROI (ex-GST if PRICE_INCLUDES_GST)
    const priceUsed = PRICE_INCLUDES_GST ? (PRICE_PER_EMP / 1.10) : PRICE_PER_EMP;

    // Per-employee economics
    const stressPerEmp = salary * lossPct;
    const savePerEmp   = stressPerEmp * reducPct;

    // Totals
    const annualSavings = savePerEmp * employees * adoptPct;
    const programCost   = priceUsed   * employees;           // <-- FIX: total headcount
    const net           = annualSavings - programCost;
    const roiPct        = programCost > 0 ? (net / programCost) * 100 : 0;

    // Break-even adoption (% of staff required)
    const beAdopt = (priceUsed > 0 && savePerEmp > 0)
      ? (priceUsed / savePerEmp) * 100
      : NaN;

    // UI
    setText('savings',   fmtAUD(annualSavings));
    setText('cost',      fmtAUD(programCost));
    setText('net',       fmtAUD(net));
    setText('roiPct',    `${Math.round(roiPct)}% ROI`);
    setText('breakeven', Number.isFinite(beAdopt) ? `${beAdopt.toFixed(1)}%` : '—');

    const note = $('costNote');
    if (note) note.textContent = PRICE_INCLUDES_GST
      ? 'Ex-GST (plan price ÷ 1.10 × total employees)'
      : 'Ex-GST (plan price × total employees)';
  }

  function wireInputs(){
    qa('input[type="number"]').forEach(el=>{
      el.addEventListener('input',  calc, { passive:true });
      el.addEventListener('change', calc);
    });
  }

  function wireTooltips(){
    // Inputs
    qa('.field .info').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const field = btn.closest('.field');
        const open = field.classList.contains('open');
        qa('.field.open').forEach(f => f.classList.remove('open'));
        qa('.field .info[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded','false'));
        if (!open){ field.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
    // KPIs
    qa('.kbox .info').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const box = btn.closest('.kbox');
        const open = box.classList.contains('open');
        qa('.kbox.open').forEach(b => b.classList.remove('open'));
        qa('.kbox .info[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded','false'));
        if (!open){ box.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
    // Global close
    document.addEventListener('click', ()=>{
      qa('.field.open').forEach(f => f.classList.remove('open'));
      qa('.field .info[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded','false'));
      qa('.kbox.open').forEach(b => b.classList.remove('open'));
      qa('.kbox .info[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded','false'));
    });
  }

  function wirePDF(){
    const btn = $('pdfBtn'); if (!btn) return;
    const ph = document.getElementById('printDate');
    if (ph) ph.textContent = new Date().toLocaleDateString('en-AU', { day:'2-digit', month:'2-digit', year:'numeric' });

    window.onbeforeprint = () => document.body.classList.add('print-compact');
    window.onafterprint  = () => document.body.classList.remove('print-compact');

    btn.addEventListener('click', (e)=>{ e.preventDefault(); window.print(); });
  }

  wireInputs();
  wireTooltips();
  wirePDF();
  calc();

  // Quick sanity with defaults (200 emp / $110k / 3% loss / 30% reduction / 40% adoption):
  // priceUsed = 454.55; cost = 200*454.55 = 90,909; savings = 110000*0.03*0.30*200*0.40 = 79200
  // net = -11,709 ; ROI ≈ -13%
})();
