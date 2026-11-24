/* Higher or lower: Indian lender pay.
   Each round shows one lender's median employee pay. Guess whether the
   next lender's is higher or lower. Keep going until you miss. */
(function () {
  'use strict';

  // [name, type, low, high, source PDF, page, document]. Median pay, rupees a year, FY2025-26,
  // from each lender's own annual report or BRSR. All employees, not credit staff.
  var LENDERS = [
    ["AU Small Finance Bank", "sfb", 365000, 380000, "https://www.au.bank.in/pdfs/other-reports/business-responsibility-and-sustainability-report/BRSR_FY-2025-26.pdf", 28, "AU Small Finance Bank Business Responsibility and Sustainability Report FY2025-26"],
    ["Aadhar Housing Finance", "hfc", 524170, 583259, "https://prodwebsite-static.aadharhousing.com/s3/investor_relations_assets/AHFL%20BRSR%20FY%202025-26.pdf", 23, "Aadhar Housing Finance Business Responsibility and Sustainability Report FY2025-26"],
    ["Aavas Financiers", "hfc", 513280, 527380, "https://www.aavas.in/img/pdf/Aavas_Financiers_2025_26_BRSR.pdf", 34, "Aavas Financiers Business Responsibility and Sustainability Report 2025-26"],
    ["Aditya Birla Capital", "nbfc", 700000, 900000, "https://www.adityabirlacapital.com/-/media/ABCL/pdf/Financial-Reports/Annual-Reports-New-2025-26/130726_Annual-Report-for-2025-26.ashx", 220, "Aditya Birla Capital Annual Report 2025-26"],
    ["Axis Bank", "private", 1250004, 1268148, "https://www.axis.bank.in/docs/default-source/business-responsibility-reports/business-responsibility-sustainability-report-for-the-year-2025-26.pdf", 30, "Axis Bank Business Responsibility and Sustainability Report 2025-26"],
    ["Bajaj Finance", "nbfc", 700000, 700000, "https://www.bajajfinserv.in/finance-digital-annual-report-fy26/bajaj-finance-ltd-ar-2025-26-assets/pdf/business-responsibility-and-sustainability-report.pdf", 31, "Bajaj Finance Business Responsibility and Sustainability Report FY2026"],
    ["Bajaj Housing Finance", "hfc", 1000000, 1200000, "https://www.bajajhousingfinance.in/documents/37350/8835647/18th+Annual+Report.pdf", 124, "Bajaj Housing Finance Annual Report 2025-26"],
    ["Bandhan Bank", "private", 290560, 303912, "https://bandhan.bank.in/sites/default/files/2026-07/Integrated-Annual-Report-FY25-26-1.pdf", 225, "Bandhan Bank Integrated Annual Report 2025-26"],
    ["Bank of Baroda", "psu", 1474000, 1652525, "https://bankofbaroda.bank.in/-/media/project/bob/countrywebsites/india/shareholders-corner2/2026/26-05/bankbaroda-29052026182051-sebrsr-29-25.pdf", 105, "Bank of Baroda Business Responsibility and Sustainability Report 2025-26"],
    ["Bank of Maharashtra", "psu", 1265343, 1353069, "https://bankofmaharashtra.bank.in/writereaddata/documentlibrary/e00300e6-4b22-4309-a749-e393e9070600.pdf", 32, "Bank of Maharashtra Business Responsibility and Sustainability Report 2025-26"],
    ["CSB Bank", "private", 283483, 431422, "https://www.csb.bank.in/pdf/brsr_fy_2025_26.pdf", 29, "CSB Bank Business Responsibility and Sustainability Report 2025-26"],
    ["Canara Bank", "psu", 1187147, 1310045, "https://www.canarabank.bank.in/documents/d/guest/annual-20report-202025-26", 202, "Canara Bank Annual Report 2025-26"],
    ["Cholamandalam Investment and Finance", "nbfc", 350000, 350000, "https://nsearchives.nseindia.com/corporate/lakshmits_06072026201442_Despatch_of_AnnualReportFY2026.pdf", 133, "Cholamandalam Investment and Finance Annual Report 2026 (NSE filing)"],
    ["City Union Bank", "private", 448222, 1001715, "https://cityunionbank.bank.in/filemanager/Jul26/BRSR2026.pdf", 46, "City Union Bank Business Responsibility and Sustainability Report 2026"],
    ["DCB Bank", "private", 500000, 518500, "https://nsearchives.nseindia.com/annual_reports/AR_29381_DCBBANK_2025_2026_A_16873942_10062026213515.pdf", 106, "DCB Bank Integrated Annual Report 2025-26 (NSE filing)"],
    ["ESAF Small Finance Bank", "sfb", 355020, 420000, "https://nsearchives.nseindia.com/corporate/esfb_20072026182135_SEIntimation_BRSR2026.pdf", 18, "ESAF Small Finance Bank Business Responsibility and Sustainability Report 2025-26 (NSE filing)"],
    ["Equitas Small Finance Bank", "sfb", 374165, 382709, "https://ir.equitas.bank.in/wp-content/uploads/2026/08/Equitas-SFB-Integrated-Annual-Report-2025-26.pdf", 52, "Equitas Small Finance Bank Integrated Annual Report 2025-26"],
    ["Federal Bank", "private", 1509780, 1630129, "https://nsearchives.nseindia.com/corporate/FEDERALBNK_30072026210213_FBL_Notice_of_AGMAR_FY_25-26_S.pdf", 141, "Federal Bank Notice of AGM and Integrated Annual Report 2025-26 (NSE filing)"],
    ["HDFC Bank", "private", 481290, 681759, "https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/pdf/annual-reports/2025-26/reports/HDFC_Bank_IR26.pdf", 584, "HDFC Bank Integrated Annual Report 2025-26"],
    ["Hero FinCorp", "nbfc", 993000, 993000, "https://hfcl-website-cms.s3.ap-south-1.amazonaws.com/2025_26_18b9e11e2f.pdf", 137, "Hero FinCorp Annual Report 2025-26"],
    ["Home First Finance Company", "hfc", 616615, 799983, "https://homefirstindia.com/files/Integrated%20Annual%20Report%20FY26.pdf", 312, "Home First Finance Integrated Annual Report FY26"],
    ["ICICI Bank", "private", 658450, 698717, "https://www.icici.bank.in/content/dam/icicibank/managed-assets/docs/investor/annual-reports/2026/icici-bank-brsr-2026.pdf", 26, "ICICI Bank Business Responsibility and Sustainability Report FY2026"],
    ["IDBI Bank", "private", 1512613, 2012801, "https://www.idbi.bank.in/pdf/annualreport/IDBI-Bank-Annual-Report-2025-26.pdf", 367, "IDBI Bank Annual Report 2025-26"],
    ["IDFC First Bank", "private", 597000, 622000, "https://www.idfcfirst.bank.in/content/dam/idfcfirstbank/pdf/annual-report/Business-Responsibility-and-Sustainability-Report-FY-2025-2026.pdf", 34, "IDFC First Bank Business Responsibility and Sustainability Report FY2025-26"],
    ["IIFL Finance", "nbfc", 336000, 408504, "https://nbfciiflprodstg.blob.core.windows.net/iifl-finance-storage/files/investor/financials/Annual_Report_with_Notice_2025-2026.pdf", 204, "IIFL Finance Annual Report 2025-26"],
    ["IndusInd Bank", "private", 523000, 584699, "https://www.indusind.bank.in/content/dam/indusind-corporate/generic/Business-Responsibility-and-Sustainability-Report-(BRSR)-FY-2025-26.pdf", 22, "IndusInd Bank Business Responsibility and Sustainability Report FY2025-26"],
    ["Jana Small Finance Bank", "sfb", 313500, 350000, "https://www.jana.bank.in/images/PDF/Annual-Report-2025-26.pdf", 131, "Jana Small Finance Bank Annual Report 2025-26"],
    ["Karur Vysya Bank", "private", 1010700, 1161012, "https://www.kvb.bank.in/docs/annual-report-for-the-financial-year-2025-2026.pdf", 131, "Karur Vysya Bank Integrated Annual Report 2025-26"],
    ["L&T Finance", "nbfc", 271965, 345673, "https://www.ltfs.com/docs/default-source/corporatedisclosure/ltf_integrated-annual-report-fy2025-26.pdf", 185, "L&T Finance Integrated Annual Report 2025-26"],
    ["LIC Housing Finance", "hfc", 1943685, 2106972, "https://cdn.lichousing.com/2026/08/37th-Annual-Report.pdf", 188, "LIC Housing Finance Annual Report 2025-26"],
    ["Mahindra Finance", "nbfc", 500000, 500000, "https://nsearchives.nseindia.com/annual_reports/AR_29455_M&MFIN_2025_2026_A_14497256_25062026233609.pdf", 157, "Mahindra Finance Integrated Annual Report 2025-26 (NSE filing)"],
    ["Manappuram Finance", "nbfc", 253524, 324285, "https://www.manappuram.com/sites/default/files/2026-07/20-07-26-FINAL-HI-RES.pdf", 109, "Manappuram Finance Annual Report 2025-26"],
    ["Muthoot Finance", "nbfc", 399174, 399174, "https://cdn.muthootfinance.com/sites/default/files/files/2026-08/annual-report-fy26.pdf", 76, "Muthoot Finance Annual Report 2025-26"],
    ["PNB Housing Finance", "hfc", 660000, 900000, "https://www.pnbhousing.com/documents/d/guest/PNBH_Annual%20Report_FY25-26-1", 88, "PNB Housing Finance Annual Report 2025-26"],
    ["Poonawalla Fincorp", "nbfc", 600000, 800000, "https://poonawallafincorp.com/documents/20121/0/PFL-Annual-Report-FY-2025-26.pdf", 112, "Poonawalla Fincorp Annual Report 2025-26"],
    ["Punjab & Sind Bank", "psu", 1326000, 1495000, "https://punjabandsind.bank.in/system/uploads/document/2150_2026070616580150330.pdf", 38, "Punjab & Sind Bank Business Responsibility and Sustainability Report 2025-26"],
    ["Punjab National Bank", "psu", 1136363, 1255289, "https://pnb.bank.in/downloadprocess.aspx?fid=3tNq9iGo%2FM5fDJSR54hUXw%3D%3D", 30, "Punjab National Bank Business Responsibility and Sustainability Report 2025-26"],
    ["RBL Bank", "private", 599436, 684540, "https://webassets.rbl.bank.in/ir_admin/financial_highlights/RBL-AR25-BRSR.pdf", 18, "RBL Bank Business Responsibility and Sustainability Report 2025-26"],
    ["Shriram Finance", "nbfc", 290508, 369146, "https://nsearchives.nseindia.com/annual_reports/AR_29401_SHRIRAMFIN_2025_2026_A_18605156_17062026163904.pdf", 97, "Shriram Finance Annual Report 2025-26 (NSE filing)"],
    ["South Indian Bank", "private", 1328874, 1617399, "https://nsearchives.nseindia.com/annual_reports/AR_30026_SOUTHBANK_2025_2026_A_6412651_27072026204452.pdf", 269, "South Indian Bank Annual Report 2025-26 (NSE filing)"],
    ["State Bank of India", "psu", 1354968, 1512156, "https://sbi.bank.in/documents/17836/58092042/Annual%20Report%20FY2026.pdf", 562, "State Bank of India Annual Report 2025-26"],
    ["Sundaram Finance", "nbfc", 572000, 760000, "https://sundaramfinance.in/assets/app_docs/downloads/annual-reports/2025-2026/annual_report_2025_26_29062026.pdf", 96, "Sundaram Finance Annual Report 2025-26"],
    ["Tata Capital", "nbfc", 310000, 318240, "https://www.tatacapital.com/content/dam/tata-capital/pdf/investors-and-financial-reports/annual-reports/25-26/tata-capital-limited-annual-report-fy-2025-26.pdf", 138, "Tata Capital Annual Report 2025-26"],
    ["Ujjivan Small Finance Bank", "sfb", 370590, 400000, "https://www.ujjivansfb.bank.in/assets/41_Filing_of_BRSR_FY_202526_30062026_197eb01765.pdf", 28, "Ujjivan Small Finance Bank Business Responsibility and Sustainability Report FY2025-26 (filing)"],
    ["Yes Bank", "private", 724000, 927000, "https://nsearchives.nseindia.com/corporate/YESBANK_25072026001338_YBL_SE_Annual_Report202526_Signed.pdf", 203, "Yes Bank Integrated Annual Report 2025-26 (NSE filing)"],
  ];

  var TYPES = { psu: 'Public sector bank', private: 'Private bank', sfb: 'Small finance bank', nbfc: 'NBFC', hfc: 'Housing finance' };
  var BEST_KEY = 'hl-best';

  var host = document.querySelector('[data-game]');
  if (!host) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pool = LENDERS.map(function (r) {
    return { name: r[0], type: r[1], lo: r[2], hi: r[3], url: r[4], page: r[5], doc: r[6], mid: (r[2] + r[3]) / 2 };
  });

  var best = 0;
  try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) {}

  var cur, nxt, streak = 0, used = [], locked = false;

  /* Only pair lenders whose ranges don't overlap, with a little air
     between them, so every round has one clear answer. */
  function clear(a, b) {
    return a.hi * 1.04 < b.lo || b.hi * 1.04 < a.lo;
  }

  function pickNext(from) {
    var options = pool.filter(function (l) { return l !== from && used.indexOf(l) === -1 && clear(from, l); });
    if (!options.length) { used = [from]; options = pool.filter(function (l) { return l !== from && clear(from, l); }); }
    return options[Math.floor(Math.random() * options.length)];
  }

  function lakh(n) {
    var v = n / 100000;
    return v >= 10 ? v.toFixed(1).replace(/\.0$/, '') : v.toFixed(1);
  }
  function payText(l) {
    return l.lo === l.hi ? '₹' + lakh(l.lo) + ' lakh' : '₹' + lakh(l.lo) + '–' + lakh(l.hi) + ' lakh';
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function sourceLink(l) {
    var a = el('a', 'hl-src', 'Source ↗');
    a.href = l.url + '#page=' + l.page;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = l.doc + ', PDF page ' + l.page;
    return a;
  }

  function countUp(node, l, done) {
    if (reduceMotion) { node.textContent = payText(l); return done(); }
    var t0 = null, dur = 900;
    function f(ts) {
      if (!t0) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      var shown = { lo: Math.round(l.lo * e), hi: Math.round(l.hi * e) };
      node.textContent = payText(shown);
      if (t < 1) requestAnimationFrame(f); else { node.textContent = payText(l); done(); }
    }
    requestAnimationFrame(f);
  }

  function card(l, side) {
    var c = el('div', 'hl-card hl-' + side);
    c.appendChild(el('span', 'hl-type', TYPES[l.type] || ''));
    c.appendChild(el('p', 'hl-name', l.name));
    var pay = el('p', 'hl-pay');
    c.appendChild(pay);
    return { node: c, pay: pay };
  }

  function header() {
    var top = el('div', 'hl-top');
    var s = el('span', 'hl-streak');
    s.innerHTML = 'Streak <b>' + streak + '</b>';
    top.appendChild(s);
    top.appendChild(el('span', 'hl-best', 'Best ' + best));
    return top;
  }

  function render(entering) {
    locked = false;
    host.innerHTML = '';
    host.appendChild(header());

    var row = el('div', 'hl-row' + (entering ? ' is-entering' : ''));
    var left = card(cur, 'left');
    left.pay.textContent = payText(cur);
    left.node.appendChild(sourceLink(cur));
    row.appendChild(left.node);

    row.appendChild(el('span', 'hl-vs', 'vs'));

    var right = card(nxt, 'right');
    right.pay.textContent = '?';
    right.pay.classList.add('is-hidden');
    var prompt = el('p', 'hl-prompt', 'pays its median employee');
    right.node.appendChild(prompt);

    var btns = el('div', 'hl-btns');
    [['higher', 'Higher', '↑'], ['lower', 'Lower', '↓']].forEach(function (b) {
      var btn = el('button', 'hl-btn');
      btn.type = 'button';
      btn.setAttribute('data-dir', b[0]);
      btn.appendChild(el('span', 'hl-arrow', b[2]));
      btn.appendChild(document.createTextNode(' ' + b[1]));
      btn.addEventListener('click', function () { guess(b[0], right, btns, prompt); });
      btns.appendChild(btn);
    });
    right.node.appendChild(btns);
    row.appendChild(right.node);
    host.appendChild(row);

    if (entering) requestAnimationFrame(function () { requestAnimationFrame(function () { row.classList.remove('is-entering'); }); });
  }

  function guess(dir, right, btns, prompt) {
    if (locked) return;
    locked = true;
    var higher = nxt.mid > cur.mid;
    var hit = (dir === 'higher') === higher;

    Array.prototype.forEach.call(btns.children, function (b) {
      b.disabled = true;
      if (b.getAttribute('data-dir') === dir) b.classList.add(hit ? 'is-hit' : 'is-miss');
    });

    right.pay.classList.remove('is-hidden');
    countUp(right.pay, nxt, function () {
      right.node.classList.add(hit ? 'is-hit' : 'is-miss');
      prompt.textContent = higher ? 'Higher' : 'Lower';
      prompt.classList.add('is-answer');
      btns.replaceWith(sourceLink(nxt));

      if (hit) {
        streak++;
        if (streak > best) { best = streak; try { localStorage.setItem(BEST_KEY, best); } catch (e) {} }
        host.querySelector('.hl-top').replaceWith(header());
        setTimeout(function () {
          used.push(cur);
          cur = nxt;
          nxt = pickNext(cur);
          host.classList.add('is-sliding');
          setTimeout(function () { host.classList.remove('is-sliding'); render(true); }, reduceMotion ? 0 : 260);
        }, reduceMotion ? 300 : 1100);
      } else {
        setTimeout(function () { over(right); }, reduceMotion ? 300 : 900);
      }
    });
  }

  function squares() {
    var s = '';
    for (var k = 0; k < Math.min(streak, 15); k++) s += '🟧';
    return s + '⬛';
  }

  function over() {
    var panel = el('div', 'hl-over');
    var big = el('p', 'hl-final');
    big.appendChild(el('span', 'hl-final-n', String(streak)));
    big.appendChild(el('span', 'hl-final-l', streak === 1 ? ' in a row' : ' in a row'));
    panel.appendChild(big);

    var line = streak >= 10 ? 'You know this industry better than most people in it.'
             : streak >= 5  ? 'Solid. Most people guess private banks pay more. They mostly don’t.'
             : streak >= 1  ? 'Public sector banks surprise almost everyone.'
             : 'Tricky, right? Public sector banks surprise almost everyone.';
    panel.appendChild(el('p', 'hl-line', line));
    panel.appendChild(el('p', 'hl-squares', squares()));

    var actions = el('div', 'hl-actions');
    var again = el('button', 'hl-cta is-primary', 'Play again');
    again.type = 'button';
    again.addEventListener('click', start);
    actions.appendChild(again);

    var share = el('button', 'hl-cta', 'Share streak');
    share.type = 'button';
    share.addEventListener('click', function () {
      var text = 'Higher or lower: Indian bank pay\nStreak ' + streak + ' ' + squares() + '\n' + location.host + '/#play';
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        navigator.share({ text: text }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          share.textContent = 'Copied ✓';
          setTimeout(function () { share.textContent = 'Share streak'; }, 1600);
        }, function () {});
      }
    });
    actions.appendChild(share);
    panel.appendChild(actions);

    host.appendChild(panel);
    requestAnimationFrame(function () { panel.classList.add('is-on'); });
    setTimeout(function () { again.focus({ preventScroll: true }); }, 60);

    if (typeof window.gtag === 'function') window.gtag('event', 'game_complete', { game: 'higher_lower_pay', streak: streak });
  }

  function start() {
    streak = 0; used = [];
    cur = pool[Math.floor(Math.random() * pool.length)];
    nxt = pickNext(cur);
    render(false);
  }

  host.classList.add('is-ready');
  start();
})();
