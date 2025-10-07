// Seedli ROI Calculator — v2
// - 2×2 results grid, locked tile heights
// - Input info tooltips (i) + KPI tooltips
// - Removed editable price; logic uses fixed Seedli plan rate (see constants)
// - AUD formatting, clean PDF, accessible updates

(() => {
  const $ = (id) => document.getElementById(id);
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- Brand pricing (edit here if your plan changes) ----------
  const PRICE_PER_EMP = 500;        // Seedli plan, per employee per year (INC GST)
  const PRICE_INCLUDES_GST = true;  // true = includes GST; ROI math uses ex-GST

  const fmtAUD = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString('en-AU', {
      style:'currency', currency:'AUD', maximumFractionDigits:0
    });

  function getNum(id, dflt=0){
    const el = $(id);
    if(!el) return dflt;
    const v = parseFloat((el.value||'').toString().replace(/[^\d.]/g,''));
    return Number.isFinite(v) ? v : dflt;
  }
  function setText(id, text){ const el = $(id); if(el) el.textContent = text; }

  function calc(){
    const emp     = getNum('employees', 0);
    const salary  = getNum('salary', 0);
    const loss    = getNum('lossPct', 0)       / 100;
    const red     = getNum('reductionPct', 0)  / 100;
    const adopt   = getNum('adoptionPct', 0)   / 100;

    const priceUsed = PRICE_INCLUDES_GST ? (PRICE_PER_EMP / 1.10) : PRICE_PER_EMP;

    const stressPerEmp = salary * loss;
    const savePerEmp   = stressPerEmp * red;
    const adopters     = emp * adopt;

    const annualSavings = savePerEmp * adopters;
    const programCost   = priceUsed * adopters;
    const net           = annualSavings - programCost;
    const roiPct        = programCost > 0 ? (net / programCost) * 100 : 0;
    const beAdopt       = (priceUsed > 0 && savePerEmp > 0) ? (priceUsed / savePerEmp) * 100 : NaN;

    setText('savings',   fmtAUD(annualSavings));
    setText('cost',      fmtAUD(programCost));
    setText('net',       fmtAUD(net));
    setText('roiPct',    `${Math.round(roiPct)}% ROI`);
    setText('breakeven', Number.isFinite(beAdopt) ? `${beAdopt.toFixed(1)}%` : '—');

    const note = $('costNote');
    if (note) note.textContent = PRICE_INCLUDES_GST
      ? 'Ex-GST (plan price ÷ 1.10 × adopters)'
      : 'Ex-GST (plan price × adopters)';
  }

  // --------- wiring
  function wireInputs(){
    qa('input[type="number"]').forEach(el=>{
      el.addEventListener('input', calc, { passive:true });
      el.addEventListener('change', calc);
    });
  }

  function wirePDF(){
    const btn = $('pdfBtn');
    if (!btn) return;
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      window.print();
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
        if (!open){
          field.classList.add('open');
          btn.setAttribute('aria-expanded','true');
        }
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
        if (!open){
          box.classList.add('open');
          btn.setAttribute('aria-expanded','true');
        }
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

  // init
  wireInputs();
  wireTooltips();
  wirePDF();
  calc();

  // Sanity with defaults (500 inc. GST): Savings $79,200 | Cost $36,364 | Net $42,836 | ROI 118% | Break-even 45.9%
})();
