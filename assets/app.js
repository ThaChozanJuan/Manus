// Seedli ROI Calculator — plain JS, no external dependencies.
// - AUD formatting (en-AU), instant updates.
// - Working PDF button (window.print) with print CSS.
// - Accessible, clickable info bubbles with aria-expanded.
// - Exact formulas: see calc().

(() => {
  const $ = (id) => document.getElementById(id);
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const fmtAUD = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString('en-AU', {
      style:'currency', currency:'AUD', maximumFractionDigits:0
    });

  function getNum(id, dflt=0){
    const el = $(id);
    if(!el) return dflt;
    // Strip any stray symbols/commas
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
    const price   = getNum('pricePerEmp', 0);
    const gstIncl = q('#gstIncl')?.checked ?? true;
    const fixed   = getNum('fixedFee', 0);

    // Ex-GST for ROI comparison if checkbox is ticked
    const priceUsed = gstIncl ? (price / 1.10) : price;
    const stressPerEmp = salary * loss;
    const savePerEmp   = stressPerEmp * red;
    const adopters     = emp * adopt;

    const annualSavings = savePerEmp * adopters;
    const programCost   = (priceUsed * adopters) + fixed;
    const net           = annualSavings - programCost;
    const roiPct        = programCost > 0 ? (net / programCost) * 100 : 0;
    const beAdopt       = (priceUsed > 0 && savePerEmp > 0) ? (priceUsed / savePerEmp) * 100 : NaN;

    setText('savings',   fmtAUD(annualSavings));
    setText('cost',      fmtAUD(programCost));
    setText('net',       fmtAUD(net));
    setText('roiPct',    `${Math.round(roiPct)}% ROI`);
    setText('breakeven', Number.isFinite(beAdopt) ? `${beAdopt.toFixed(1)}%` : '—');

    // cost note
    const note = $('costNote');
    if (note) note.textContent = gstIncl
      ? 'Ex-GST (price ÷ 1.10 × adopters + fixed)'
      : 'Adopters × price + fixed';
  }

  function wireInputs(){
    qa('input[type="number"], input[type="checkbox"]').forEach(el=>{
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
    // toggle current, close others
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
    document.addEventListener('click', (e)=>{
      if (!e.target.closest('.kbox')){
        qa('.kbox.open').forEach(b => b.classList.remove('open'));
        qa('.kbox .info[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded','false'));
      }
    });
  }

  // Init
  wireInputs();
  wireTooltips();
  wirePDF();
  calc();

  // --- Acceptance sanity with defaults (should render):
  // Annual Savings = $79,200
  // Program Cost   = $36,364
  // Net ROI        = $42,836
  // ROI %          = 118%
  // Break-even     = 45.9%
})();
