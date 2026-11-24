/* "Who decides?" — a five-round mini game.
   Edit ROUNDS to change the scenarios, answers and takes.
   answer must be one of: 'agent', 'human', 'together'. */
(function () {
  'use strict';

  var ROUNDS = [
    {
      q: 'Matching 40,000 invoices against incoming payments overnight.',
      answer: 'agent',
      take: 'Pure pattern-matching at volume. A human in this loop only adds delay. Let people handle the handful of mismatches.'
    },
    {
      q: 'Telling a long-time SME customer their credit line is being cut.',
      answer: 'human',
      take: 'The decision can be modelled. The conversation can’t. Trust is built or lost in this moment.'
    },
    {
      q: 'Approving a ₹50 lakh supply-chain loan for a brand-new vendor.',
      answer: 'together',
      take: 'The agent assembles the file and surfaces the risk. A human signs. Accountability needs a name.'
    },
    {
      q: 'Blocking a card after three failed foreign transactions in one minute.',
      answer: 'agent',
      take: 'Seconds matter. Block first, explain after — and make unblocking one tap so it stays humane.'
    },
    {
      q: 'Deciding which customer complaints point to a broken process.',
      answer: 'together',
      take: 'Agents cluster thousands of complaints in minutes. Humans spot which cluster is actually a design failure.'
    }
  ];

  var LABELS = { agent: 'Agent', human: 'Human', together: 'Together' };
  var GLYPHS = { agent: '◇', human: '○', together: '◈' };
  var VERDICTS = [
    { min: 5, line: 'Perfect match. You already think in human + agent.' },
    { min: 3, line: 'Close. We should argue about the rest.' },
    { min: 0, line: 'Strong opinions. I’d genuinely like to hear them.' }
  ];

  var host = document.querySelector('[data-game]');
  if (!host) return;
  var contact = host.getAttribute('data-contact') || '';

  var i = 0, picks = [], locked = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function swap(build) {
    host.classList.add('is-leaving');
    setTimeout(function () {
      host.innerHTML = '';
      build();
      host.classList.remove('is-leaving');
      host.classList.add('is-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { host.classList.remove('is-entering'); });
      });
    }, host.childElementCount ? 220 : 0);
  }

  function pips() {
    var row = el('div', 'g-pips');
    ROUNDS.forEach(function (_, k) {
      var p = el('span', 'g-pip');
      if (k < picks.length) p.classList.add(picks[k] === ROUNDS[k].answer ? 'is-hit' : 'is-miss');
      if (k === i && picks.length === i) p.classList.add('is-now');
      row.appendChild(p);
    });
    return row;
  }

  function renderRound() {
    locked = false;
    var r = ROUNDS[i];

    var top = el('div', 'g-top');
    top.appendChild(el('span', 'g-count', String(i + 1).padStart(2, '0') + ' / ' + String(ROUNDS.length).padStart(2, '0')));
    top.appendChild(pips());
    host.appendChild(top);

    host.appendChild(el('p', 'g-q', r.q));

    var choices = el('div', 'g-choices');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', 'Who should decide?');
    Object.keys(LABELS).forEach(function (key) {
      var b = el('button', 'g-choice');
      b.type = 'button';
      b.setAttribute('data-key', key);
      b.appendChild(el('span', 'g-glyph', GLYPHS[key]));
      b.appendChild(el('span', 'g-label', LABELS[key]));
      b.addEventListener('click', function () { choose(key, choices); });
      choices.appendChild(b);
    });
    host.appendChild(choices);

    var reveal = el('div', 'g-reveal');
    reveal.setAttribute('aria-live', 'polite');
    host.appendChild(reveal);
  }

  function choose(key, choices) {
    if (locked) return;
    locked = true;
    var r = ROUNDS[i];
    picks.push(key);
    var hit = key === r.answer;

    choices.classList.add('is-locked');
    Array.prototype.forEach.call(choices.children, function (b) {
      var k = b.getAttribute('data-key');
      b.disabled = true;
      if (k === r.answer) b.classList.add('is-answer');
      if (k === key) b.classList.add(hit ? 'is-hit' : 'is-miss');
    });

    var oldPips = host.querySelector('.g-pips');
    if (oldPips) oldPips.parentNode.replaceChild(pips(), oldPips);

    var reveal = host.querySelector('.g-reveal');
    reveal.innerHTML = '';
    var head = el('p', 'g-verdict');
    head.appendChild(el('span', hit ? 'g-tag is-hit' : 'g-tag is-miss', hit ? 'Same call' : 'Different call'));
    head.appendChild(document.createTextNode(' My take: ' + LABELS[r.answer] + '.'));
    reveal.appendChild(head);
    reveal.appendChild(el('p', 'g-take', r.take));

    var next = el('button', 'g-next', i < ROUNDS.length - 1 ? 'Next →' : 'See result →');
    next.type = 'button';
    next.addEventListener('click', function () {
      i++;
      swap(i < ROUNDS.length ? renderRound : renderEnd);
    });
    reveal.appendChild(next);
    reveal.classList.add('is-on');
    setTimeout(function () { next.focus({ preventScroll: true }); }, 50);
  }

  function score() {
    return picks.reduce(function (n, p, k) { return n + (p === ROUNDS[k].answer ? 1 : 0); }, 0);
  }

  function squares() {
    return picks.map(function (p, k) { return p === ROUNDS[k].answer ? '🟧' : '⬛'; }).join('');
  }

  function renderEnd() {
    var s = score(), n = ROUNDS.length;
    var verdict = VERDICTS.filter(function (v) { return s >= v.min; })[0];

    var top = el('div', 'g-top');
    top.appendChild(el('span', 'g-count', 'Result'));
    top.appendChild(pips());
    host.appendChild(top);

    var big = el('p', 'g-score');
    big.appendChild(el('span', 'g-score-n', String(s)));
    big.appendChild(el('span', 'g-score-d', ' / ' + n));
    host.appendChild(big);
    host.appendChild(el('p', 'g-line', verdict.line));
    host.appendChild(el('p', 'g-squares', squares()));

    var actions = el('div', 'g-actions');
    var share = el('button', 'g-btn is-primary', 'Copy result');
    share.type = 'button';
    share.addEventListener('click', function () {
      var text = 'Who decides? ' + s + '/' + n + '\n' + squares() + '\n' + location.origin.replace(/^https?:\/\//, '');
      var done = function () { share.textContent = 'Copied ✓'; setTimeout(function () { share.textContent = 'Copy result'; }, 1600); };
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        navigator.share({ text: text }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    });
    actions.appendChild(share);

    var again = el('button', 'g-btn', 'Play again');
    again.type = 'button';
    again.addEventListener('click', function () { i = 0; picks = []; swap(renderRound); });
    actions.appendChild(again);

    if (contact) {
      var argue = el('a', 'g-link', 'Argue with me →');
      argue.href = 'mailto:' + contact + '?subject=' + encodeURIComponent('Who decides? I got ' + s + '/' + n);
      actions.appendChild(argue);
    }
    host.appendChild(actions);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'game_complete', { game: 'who_decides', score: s });
    }
  }

  host.innerHTML = '';
  host.classList.add('is-ready');
  renderRound();
})();
