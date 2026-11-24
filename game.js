/* Bigger or smaller: Indian banks by the numbers.
   Each round picks a measure (loan book, deposits or branches).
   Guess whether the next lender's figure is higher or lower.
   Keep going until you miss. */
(function () {
  'use strict';

  // Latest figure per lender from its own filings (Mar 2026 or later): [value, period end, source PDF, page].
  // Public sector and private banks only. loan_book and deposits in Rs crore, branches as a count.
  var LENDERS = [
    ["Axis Bank","private",{"branches":[6414,"2026-09-30","https://www.axis.bank.in/docs/default-source/shareholders/financial-results-and-other-information/investor-presentations/2026-2027/investor-presentation-for-the-quarter-ended-30th-september-2026.pdf",2],"deposits":[1452066,"2026-09-30","https://www.axis.bank.in/docs/default-source/shareholders/financial-results-and-other-information/investor-presentations/2026-2027/investor-presentation-for-the-quarter-ended-30th-september-2026.pdf",5],"loan_book":[1373727,"2026-09-30","https://nsearchives.nseindia.com/corporate/AXISBANK1_17102026131104_PressRelease_IR_PPT_Q2FY27Signed.pdf",15]}],
    ["Bandhan Bank","private",{"branches":[2001,"2026-09-30","https://bandhan.bank.in/sites/default/files/2026-10/Investor-Presentation-Q2-FY-26-27.pdf",4],"deposits":[172690,"2026-09-30","https://bandhan.bank.in/sites/default/files/2026-10/Investor-Presentation-Q2-FY-26-27.pdf",5],"loan_book":[158370,"2026-09-30","https://nsearchives.nseindia.com/corporate/BANDHANBNK_28102026161705_SE_Disclosure_Investor_PPT_Q2_28102026_sd.pdf",6]}],
    ["Bank of Baroda","psu",{"branches":[8648,"2026-03-31","https://bankofbaroda.bank.in/-/media/project/bob/countrywebsites/india/shareholders-corner2/2026/26-06/annualreport-03-26.pdf",83],"deposits":[1745435,"2026-09-30","https://bankofbaroda.bank.in/-/media/Project/BOB/CountryWebsites/India/pdfs2/2026/26-10/Presentation-Analysts",11],"loan_book":[1512448,"2026-09-30","https://nsearchives.nseindia.com/corporate/BANKBARODA_30102026163504_SEPRESENTATION.pdf",13]}],
    ["Bank of India","psu",{"branches":[5634,"2026-09-30","https://nsearchives.nseindia.com/corporate/BANKINDIA6_23102026171023_presentationQ2FY27.pdf",41],"deposits":[1037530,"2026-09-30","https://nsearchives.nseindia.com/corporate/BANKINDIA6_23102026171023_presentationQ2FY27.pdf",6],"loan_book":[855071,"2026-09-30","https://nsearchives.nseindia.com/corporate/BANKINDIA6_23102026171023_presentationQ2FY27.pdf",8]}],
    ["Bank of Maharashtra","psu",{"branches":[2859,"2026-09-30","https://bankofmaharashtra.bank.in/writereaddata/documentlibrary/1ab80929-5108-4fac-a45f-25170f797c45.pdf",33],"deposits":[376407,"2026-09-30","https://bankofmaharashtra.bank.in/writereaddata/documentlibrary/1ab80929-5108-4fac-a45f-25170f797c45.pdf",7],"loan_book":[329359,"2026-09-30","https://nsearchives.nseindia.com/corporate/MAHABANK_26102026154108_LettertoSE_InvestorPresentation26102026.pdf",20]}],
    ["Canara Bank","psu",{"branches":[10146,"2026-09-30","https://www.canarabank.bank.in/documents/d/guest/final-investors-presentation-sep-26-without-comment-for-upload-13-10-2026-1145pm",39],"deposits":[1697305,"2026-09-30","https://www.canarabank.bank.in/documents/d/guest/final-investors-presentation-sep-26-without-comment-for-upload-13-10-2026-1145pm",6],"loan_book":[1375060,"2026-09-30","https://nsearchives.nseindia.com/corporate/CANBK_14102026121259_LettertoSE14102026IPsD.pdf",7]}],
    ["Central Bank of India","psu",{"branches":[4623,"2026-09-30","https://nsearchives.nseindia.com/corporate/CENTRALBK_17102026133527_Final_SE_Presentation.pdf",49],"deposits":[508509,"2026-09-30","https://nsearchives.nseindia.com/corporate/CENTRALBK_17102026133527_Final_SE_Presentation.pdf",28],"loan_book":[381032,"2026-09-30","https://nsearchives.nseindia.com/corporate/CENTRALBK_17102026133527_Final_SE_Presentation.pdf",21]}],
    ["CSB Bank","private",{"branches":[872,"2026-09-30","https://www.csb.bank.in/pdf/annexure-5-23102026.pdf",6],"deposits":[46889,"2026-09-30","https://www.csb.bank.in/pdf/annexure-5-23102026.pdf",31],"loan_book":[42383,"2026-09-30","https://nsearchives.nseindia.com/corporate/CSBBANK_23102026135922_BSENSEPresentationUFR30092026f.pdf",16]}],
    ["City Union Bank","private",{"branches":[1002,"2026-09-30","https://www.cityunionbank.com/filemanager/Oct26/Press_Release_English_Sep2026-Finalupdated.pdf",5],"deposits":[83893.1,"2026-09-30","https://nsearchives.nseindia.com/corporate/CUB_28102026165006_InvestorPresentationQ2FY2027.pdf",14],"loan_book":[72442,"2026-09-30","https://nsearchives.nseindia.com/corporate/CUB_28102026165006_InvestorPresentationQ2FY2027.pdf",24]}],
    ["DCB Bank","private",{"branches":[483,"2026-09-30","https://nsearchives.nseindia.com/corporate/Priyeshjain_23102026155543_BSENSEInvestorPreesentation22October2026.pdf",4],"deposits":[76839,"2026-09-30","https://nsearchives.nseindia.com/corporate/Priyeshjain_23102026155543_BSENSEInvestorPreesentation22October2026.pdf",36],"loan_book":[64127,"2026-09-30","https://nsearchives.nseindia.com/corporate/Priyeshjain_23102026155543_BSENSEInvestorPreesentation22October2026.pdf",19]}],
    ["Federal Bank","private",{"deposits":[342694,"2026-09-30","https://nsearchives.nseindia.com/corporate/FEDERALBNK_16102026132852_FBL_Investor_Presentation_Q2.pdf",31],"loan_book":[298226,"2026-09-30","https://nsearchives.nseindia.com/corporate/FEDERALBNK_16102026132852_FBL_Investor_Presentation_Q2.pdf",6]}],
    ["HDFC Bank","private",{"branches":[9706,"2026-09-30","https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/pdf/about-us/financial-results/2026-2027/quarter-2/press-release-sep-2026.pdf",3],"deposits":[3327400,"2026-09-30","https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/pdf/about-us/financial-results/2026-2027/quarter-2/press-release-sep-2026.pdf",2],"loan_book":[3219500,"2026-09-30","https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/pdf/about-us/financial-results/2026-2027/quarter-2/q2fy27-earnings-presentation.pdf",10]}],
    ["ICICI Bank","private",{"branches":[7656,"2026-09-30","https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/about-us/2027/Q2-2027-investor-presentation.pdf",51],"deposits":[2049874,"2026-09-30","https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/about-us/2027/Q2-2027-investor-presentation.pdf",12],"loan_book":[1831580,"2026-09-30","https://nsearchives.nseindia.com/corporate/ICICI2022_17102026164525_BSENSE17102026.pdf",15]}],
    ["IDBI Bank","private",{"branches":[2174,"2026-03-31","https://www.idbi.bank.in/pdf/annualreport/IDBI-Bank-Annual-Report-2025-26.pdf",46],"deposits":[355684,"2026-09-30","https://www.idbi.bank.in/pdf/Analyst_Sep_2026.pdf",6],"loan_book":[276932,"2026-09-30","https://www.idbi.bank.in/pdf/Analyst_Sep_2026.pdf",19]}],
    ["IDFC First Bank","private",{"branches":[1200,"2026-09-30","https://nsearchives.nseindia.com/corporate/IDFCFIRSTB_24102026172636_Investor_Presentation_Q2FY27.pdf",19],"deposits":[348583,"2026-09-30","https://nsearchives.nseindia.com/corporate/IDFCFIRSTB_24102026172636_Investor_Presentation_Q2FY27.pdf",5],"loan_book":[346913,"2026-09-30","https://nsearchives.nseindia.com/corporate/IDFCFIRSTB_24102026172636_Investor_Presentation_Q2FY27.pdf",33]}],
    ["Indian Bank","psu",{"branches":[6017,"2026-09-30","https://nsearchives.nseindia.com/corporate/INDIANB_15102026135601_SE_Press_Release_30092026.pdf",4],"deposits":[874036,"2026-09-30","https://nsearchives.nseindia.com/corporate/INDIANB_15102026135601_SE_Press_Release_30092026.pdf",3],"loan_book":[721982,"2026-09-30","https://nsearchives.nseindia.com/corporate/INDIANB_15102026135601_SE_Press_Release_30092026.pdf",3]}],
    ["IndusInd Bank","private",{"branches":[3139,"2026-09-30","https://www.indusind.bank.in/content/dam/indusind-corporate/investors/QuarterFinancialResults/FY2026-2027/Quarter2/Investor-Presentation-Q2-FY27.pdf",13],"deposits":[428832,"2026-09-30","https://www.indusind.bank.in/content/dam/indusind-corporate/investors/QuarterFinancialResults/FY2026-2027/Quarter2/Press-Release-Q2-FY27.pdf",3],"loan_book":[363104,"2026-09-30","https://nsearchives.nseindia.com/corporate/INDUSINDBK4_23102026161027_Investor_Presentationmergedfinalsigned.pdf",14]}],
    ["Indian Overseas Bank","psu",{"branches":[3542,"2026-09-30","https://www.iob.bank.in/documents/d/guest/Investor-Presentation-30092026",26],"deposits":[407428,"2026-09-30","https://www.iob.bank.in/documents/d/guest/Investor-Presentation-30092026",13],"loan_book":[345650,"2026-09-30","https://nsearchives.nseindia.com/corporate/IOB_26102026161138_investorpresentation.pdf",14]}],
    ["Karur Vysya Bank","private",{"branches":[921,"2026-09-30","https://www.kvb.bank.in/docs/investor-presentation-2026-10-15.pdf",37],"deposits":[128123,"2026-09-30","https://www.kvb.bank.in/docs/investor-presentation-2026-10-15.pdf",13],"loan_book":[111589,"2026-09-30","https://nsearchives.nseindia.com/corporate/KARURVYSYA_15102026154151_NSE_BSE_IP_DSC.pdf",16]}],
    ["Punjab National Bank","psu",{"branches":[10481,"2026-09-30","https://pnb.bank.in/downloadprocess.aspx?fid=b2Yy%2BNrrTBBM1UVxgm%2FMaQ%3D%3D",40],"deposits":[1777240,"2026-09-30","https://pnb.bank.in/downloadprocess.aspx?fid=b2Yy%2BNrrTBBM1UVxgm%2FMaQ%3D%3D",10],"loan_book":[1341194,"2026-09-30","https://nsearchives.nseindia.com/corporate/pnb2_16102026162720_Intimation_AnalystPresentation_16102026_DS_.pdf",12]}],
    ["Punjab & Sind Bank","psu",{"branches":[1694,"2026-09-30","https://punjabandsind.bank.in/system/uploads/document/7932_2026101720511387675.pdf",30],"deposits":[153312,"2026-09-30","https://punjabandsind.bank.in/system/uploads/document/7932_2026101720511387675.pdf",7],"loan_book":[125919,"2026-09-30","https://nsearchives.nseindia.com/corporate/PSB_17102026195921_bsense17102026ppt.pdf",8]}],
    ["RBL Bank","private",{"branches":[628,"2026-09-30","https://webassets.rbl.bank.in/ir_admin/financial_highlights/InvestorPPTQ2FY27.pdf",11],"deposits":[156272,"2026-09-30","https://webassets.rbl.bank.in/ir_admin/financial_highlights/InvestorPPTQ2FY27.pdf",7],"loan_book":[142314,"2026-09-30","https://nsearchives.nseindia.com/corporate/RBLBANK_12102026165116_IntimationInvestorPresentationQ2FY2627Signed.pdf",8]}],
    ["State Bank of India","psu",{"branches":[23265,"2026-03-31","https://nsearchives.nseindia.com/corporate/SBIN_08052026142836_Presentation.pdf",15],"deposits":[6277919,"2026-09-30","https://nsearchives.nseindia.com/corporate/SBIN_03112026135925_Presentation.pdf",14],"loan_book":[5208344,"2026-09-30","https://nsearchives.nseindia.com/corporate/SBIN_03112026135925_Presentation.pdf",9]}],
    ["South Indian Bank","private",{"branches":[959,"2026-09-30","https://www.southindianbank.bank.in/userfiles/file/sib_investor_presentation_q2_fy2026-27.pdf",7],"deposits":[137279,"2026-09-30","https://www.southindianbank.bank.in/userfiles/file/sib_investor_presentation_q2_fy2026-27.pdf",30],"loan_book":[109517,"2026-09-30","https://www.southindianbank.bank.in/userfiles/file/sib_investor_presentation_q2_fy2026-27.pdf",6]}],
    ["UCO Bank","psu",{"branches":[3439,"2026-09-30","https://nsearchives.nseindia.com/corporate/UCOBANK_15102026142250_AnalystPPT.pdf",40],"deposits":[349590,"2026-09-30","https://nsearchives.nseindia.com/corporate/UCOBANK_15102026142250_AnalystPPT.pdf",8],"loan_book":[287690,"2026-09-30","https://nsearchives.nseindia.com/corporate/UCOBANK_15102026142250_AnalystPPT.pdf",34]}],
    ["Union Bank of India","psu",{"branches":[8713,"2026-09-30","https://www.unionbankofindia.bank.in/pdf/investor-presentation-Q2FY27.pdf",2],"deposits":[1319455,"2026-09-30","https://www.unionbankofindia.bank.in/pdf/investor-presentation-Q2FY27.pdf",3],"loan_book":[1155876,"2026-09-30","https://nsearchives.nseindia.com/corporate/UNIONBANK_19102026122926_Presentation_Sept2026.pdf",4]}],
    ["Yes Bank","private",{"branches":[1336,"2026-09-30","https://www.yes.bank.in/sites/web/content/published/api/v1.1/assets/CONTFBA8547CF87E4B70B0E73E1A380F1812/native/q2fy27_investor_presentation.pdf",21],"deposits":[354004,"2026-09-30","https://www.yes.bank.in/sites/web/content/published/api/v1.1/assets/CONTFBA8547CF87E4B70B0E73E1A380F1812/native/q2fy27_investor_presentation.pdf",14],"loan_book":[309510,"2026-09-30","https://nsearchives.nseindia.com/corporate/YESBANK_17102026201157_SE_Intimation_signed.pdf",18]}],
  ];

  var MEASURES = {
    loan_book: { label: 'Loan book', pre: 'Bigger or smaller', word: 'loan book' },
    deposits:  { label: 'Deposits',  pre: 'More or less in',   word: 'deposits' },
    branches:  { label: 'Branches',  pre: 'More or fewer',     word: 'branches' }
  };
  var TYPES = { psu: 'Public sector bank', private: 'Private bank', sfb: 'Small finance bank', nbfc: 'NBFC', hfc: 'Housing finance' };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var BEST_KEY = 'bs-best';

  var host = document.querySelector('[data-game]');
  if (!host) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pool = LENDERS.map(function (r) { return { name: r[0], type: r[1], m: r[2] }; });

  var best = 0;
  try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) {}

  var cur, nxt, measure, lastMeasure, streak = 0, used = [], locked = false;

  /* A clear gap only: at least 20% apart, so no round is a coin toss. */
  function clear(a, b, k) {
    var x = a.m[k][0], y = b.m[k][0];
    return Math.max(x, y) >= Math.min(x, y) * 1.2;
  }

  function nextRound(from) {
    var keys = Object.keys(MEASURES).filter(function (k) { return from.m[k]; });
    keys.sort(function () { return Math.random() - 0.5; });
    keys.sort(function (a, b) { return (a === lastMeasure) - (b === lastMeasure); });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var fresh = pool.filter(function (l) { return l !== from && l.m[k] && used.indexOf(l) === -1 && clear(from, l, k); });
      var any = fresh.length ? fresh : pool.filter(function (l) { return l !== from && l.m[k] && clear(from, l, k); });
      if (any.length) {
        if (!fresh.length) used = [from];
        return { k: k, l: any[Math.floor(Math.random() * any.length)] };
      }
    }
    return null;
  }

  function fmt(k, v) {
    if (k === 'branches') return Math.round(v).toLocaleString('en-IN');
    if (v >= 100000) return '₹' + (v / 100000).toFixed(v >= 1000000 ? 0 : 1).replace(/\.0$/, '') + ' lakh cr';
    return '₹' + Math.round(v).toLocaleString('en-IN') + ' cr';
  }
  function unitWord(k) { return k === 'branches' ? 'branches' : ''; }
  function asOf(d) { var p = d.split('-'); return MONTHS[+p[1] - 1] + ' ' + p[0]; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function sourceLink(l, k) {
    var f = l.m[k];
    var a = el('a', 'hl-src', 'Source · ' + asOf(f[1]) + ' ↗');
    a.href = f[2] + '#page=' + f[3];
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'Lender filing, PDF page ' + f[3];
    return a;
  }

  function setValue(node, k, v) {
    node.textContent = fmt(k, v);
    var u = unitWord(k);
    if (u) node.appendChild(el('span', 'hl-unit', ' ' + u));
  }

  function countUp(node, k, v, done) {
    if (reduceMotion) { setValue(node, k, v); return done(); }
    var t0 = null, dur = 900;
    function f(ts) {
      if (!t0) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      setValue(node, k, v * e);
      if (t < 1) requestAnimationFrame(f); else { setValue(node, k, v); done(); }
    }
    requestAnimationFrame(f);
  }

  function card(l, side) {
    var c = el('div', 'hl-card hl-' + side);
    c.appendChild(el('span', 'hl-type', TYPES[l.type] || ''));
    c.appendChild(el('p', 'hl-name', l.name));
    var pay = el('p', 'hl-pay');
    c.appendChild(pay);
    return { node: c, val: pay };
  }

  function header() {
    var top = el('div', 'hl-top');
    var s = el('span', 'hl-streak');
    s.innerHTML = 'Streak <b>' + streak + '</b>';
    top.appendChild(s);
    top.appendChild(el('span', 'hl-best', 'Best ' + best));
    return top;
  }

  function question() {
    var q = el('h3', 'hl-q');
    q.setAttribute('data-measure', measure);
    q.appendChild(document.createTextNode(MEASURES[measure].pre + ' '));
    q.appendChild(el('em', 'hl-q-word', MEASURES[measure].word));
    q.appendChild(document.createTextNode('?'));
    return q;
  }

  function render(entering) {
    locked = false;
    host.innerHTML = '';
    host.appendChild(header());
    host.appendChild(question());

    var row = el('div', 'hl-row' + (entering ? ' is-entering' : ''));
    var left = card(cur, 'left');
    setValue(left.val, measure, cur.m[measure][0]);
    left.node.appendChild(sourceLink(cur, measure));
    row.appendChild(left.node);

    row.appendChild(el('span', 'hl-vs', 'vs'));

    var right = card(nxt, 'right');
    right.val.textContent = '?';
    right.val.classList.add('is-hidden');
    var prompt = el('p', 'hl-prompt', 'than ' + cur.name);
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

  function ratioText(a, b, k) {
    var r = Math.max(a, b) / Math.min(a, b);
    var n = r >= 10 ? String(Math.round(r)) : r.toFixed(1).replace(/\.0$/, '');
    var word = k === 'branches' ? (b > a ? 'more' : 'fewer') : (b > a ? 'bigger' : 'smaller');
    return n + '\u00D7 ' + word;
  }

  function guess(dir, right, btns, prompt) {
    if (locked) return;
    locked = true;
    var a = cur.m[measure][0], b = nxt.m[measure][0];
    var higher = b > a;
    var hit = (dir === 'higher') === higher;

    Array.prototype.forEach.call(btns.children, function (bt) {
      bt.disabled = true;
      if (bt.getAttribute('data-dir') === dir) bt.classList.add(hit ? 'is-hit' : 'is-miss');
    });

    right.val.classList.remove('is-hidden');
    countUp(right.val, measure, b, function () {
      right.node.classList.add(hit ? 'is-hit' : 'is-miss');
      prompt.textContent = (higher ? 'Higher' : 'Lower') + ' · ' + ratioText(a, b, measure);
      prompt.classList.add('is-answer');
      btns.replaceWith(sourceLink(nxt, measure));

      if (hit) {
        streak++;
        if (streak > best) { best = streak; try { localStorage.setItem(BEST_KEY, best); } catch (e) {} }
        host.querySelector('.hl-top').replaceWith(header());
        setTimeout(advance, reduceMotion ? 300 : 1300);
      } else {
        setTimeout(over, reduceMotion ? 300 : 900);
      }
    });
  }

  function advance() {
    used.push(cur);
    cur = nxt;
    lastMeasure = measure;
    var r = nextRound(cur);
    if (!r) return over();
    measure = r.k; nxt = r.l;
    host.classList.add('is-sliding');
    setTimeout(function () { host.classList.remove('is-sliding'); render(true); }, reduceMotion ? 0 : 260);
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
    big.appendChild(el('span', 'hl-final-l', ' in a row'));
    panel.appendChild(big);

    var line = streak >= 10 ? 'You know Indian lending better than most people working in it.'
             : streak >= 5  ? 'Solid. Size in Indian lending is rarely what it looks like from outside.'
             : 'Size is hard to guess here. Branch counts fool almost everyone.';
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
      var text = 'Bigger or smaller: Indian banks\nStreak ' + streak + ' ' + squares() + '\n' + location.host + '/#play';
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

    if (typeof window.gtag === 'function') window.gtag('event', 'game_complete', { game: 'bigger_smaller_lenders', streak: streak });
  }

  function start() {
    streak = 0; used = []; lastMeasure = null;
    var r = null;
    while (!r) { cur = pool[Math.floor(Math.random() * pool.length)]; r = nextRound(cur); }
    measure = r.k; nxt = r.l;
    render(false);
  }

  host.classList.add('is-ready');
  start();
})();
