// Chapter 5: what the evidence says. Two stations.
//  1. A fair-test simulator. 2 × n people with the same illness; some get better anyway (natural
//     course, regression to the mean, placebo response). A treatment with a chosen true effect is
//     compared with a dummy. Switch randomisation and blinding off to see how bias creeps in.
//     Model: each person has a prognosis z ~ N(0, 1); chance of improving without treatment
//     p = logistic(logit(0.35) + 0.8 z) (about 35% improve anyway); treatment adds the true effect to
//     p. Without randomisation, healthier people are likelier to pick the herb: P(herb) =
//     logistic(z). Without blinding, people who know they got the herb report about 10 points
//     more improvement and those who know they got nothing about 3 points less (effect sizes of this
//     order: Hróbjartsson et al., CMAJ 185:E201, 2013, observer bias in trials with non-blinded
//     assessors; Wood et al., BMJ 336:601, 2008). Result: difference in improvement rates with a 95%
//     confidence interval, p1 − p2 ± 1.96·√(p1(1−p1)/n + p2(1−p2)/n). "Run 100 trials" repeats with
//     new people and shows how often a trial of this size finds the effect. The same idea is built out
//     in MedicineClear's trial simulator.
//  2. Safety: two well-known studies of Ayurvedic products bought in the US.
//     Saper et al., JAMA 292:2868, 2004: 70 products made in South Asia, bought in Boston shops; 14
//     (20%) had potentially harmful lead, mercury or arsenic.
//     Saper et al., JAMA 300:915, 2008: 193 products bought online, made in the US or India; 20.7%
//     had detectable lead, mercury or arsenic; rasa shastra products 40.6% vs other products 17.1%;
//     US-made 21.7% vs Indian-made 19.5%.
//     Indian case reports: e.g. three patients with lead poisoning after Ayurvedic medicines (Indian J
//     Clin Biochem 25:326, 2010). Liver injury: giloy (Tinospora cordifolia) case series from Mumbai
//     (Nagral et al., J Clin Exp Hepatol 11:732, 2021) and a nationwide Indian multicentre study (Hepatol
//     Commun, 2022); the Ministry of AYUSH said giloy is safe and warned that similar-looking plants may be
//     mistaken for it (PIB, 2021). Ashwagandha: Björnsson et al., Liver Int 40:825, 2020.
//     Regulation in India: Ayurvedic, Siddha and Unani drugs need a state licence under the Drugs and
//     Cosmetics Act 1940 (Chapter IVA, added 1964), with Good Manufacturing Practice in Schedule T;
//     since 1 Jan 2006 every export batch must be tested for heavy metals (Dept of AYUSH order,
//     Oct 2005); a national pharmacovigilance programme for AYUSH drugs has run since 2018 (PIB, 2018;
//     AIIA New Delhi is the national centre). The Drugs and Magic Remedies (Objectionable
//     Advertisements) Act 1954 bans ads that claim to cure diseases such as diabetes or cancer.
//  Systematic reviews summarised in the readout: Park & Ernst, Semin Arthritis Rheum 34:705, 2005
//  (rheumatoid arthritis: no convincing evidence, poor trials); Kessler et al., Rheumatol Int 35:211,
//  2015 (osteoarthritis: some promising results, low-quality trials); Chopra et al., Rheumatology
//  52:1408, 2013 (Pune, 440 patients, double-blind: standardised Ayurvedic formulas as good as
//  glucosamine and celecoxib for knee pain); Furst et al., J Clin Rheumatol 17:185, 2011 (43 patients:
//  classical Ayurveda, methotrexate and both similar in RA); NIH NCCIH "Ayurvedic Medicine: In Depth";
//  WHO Traditional Medicine Strategy 2014–2023.
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { tint, fitNarrow, compactReadout, inReel, viewSwitcher, board, panel, wrap, prng, rnd, capsule } from '../ayur.js';

const logistic = (x) => 1 / (1 + Math.exp(-x));
const BASE = Math.log(0.35 / 0.65);
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

// One trial. Returns the people (arm, improved) and the result.
export function runTrial(seed, { n, effect, randomise, blind }) {
  const r = prng(seed), people = [];
  let herbN = 0, plN = 0;
  // recruit until both arms have n people
  while (herbN < n || plN < n) {
    const z = gauss(r);
    let herb = randomise ? r() < 0.5 : r() < logistic(1.0 * z);
    if (herb && herbN >= n) herb = false; else if (!herb && plN >= n) herb = true;
    if (herb) herbN++; else plN++;
    let p = logistic(BASE + 0.8 * z) + (herb ? effect : 0);
    if (!blind) p += herb ? 0.1 : -0.03;
    people.push({ herb, better: r() < clamp(p, 0, 1), z });
  }
  const a = people.filter((q) => q.herb), b = people.filter((q) => !q.herb);
  const p1 = a.filter((q) => q.better).length / n, p2 = b.filter((q) => q.better).length / n;
  const se = Math.sqrt(Math.max(1e-9, (p1 * (1 - p1)) / n + (p2 * (1 - p2)) / n)), d = p1 - p2;
  return { people, p1, p2, d, lo: d - 1.96 * se, hi: d + 1.96 * se, found: d - 1.96 * se > 0 };
}
export function runMany(seed, opts, k = 100) { return Array.from({ length: k }, (_, i) => runTrial(seed * 1000 + i + 1, opts)); }

function drawHist(g, w, h, st) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 26px sans-serif';
  if (!st || !st.many) {
    g.fillText('Press "Run 100 trials"', 24, 40);
    g.font = '20px sans-serif'; g.fillStyle = 'rgba(232,238,248,.7)';
    wrap(g, 'Each trial draws new people. See how often a trial of this size, done this way, finds the true effect.', 24, 80, w - 48, 26);
    return;
  }
  g.fillText(`100 trials: ${st.many.filter((x) => x.found).length} found a benefit`, 24, 40);
  const L = 30, R = w - 24, T = 70, B = h - 60, X = (d) => L + ((d + 0.3) / 0.9) * (R - L);
  const bins = new Array(36).fill(0); st.many.forEach((x) => { const i = clamp(Math.floor((x.d + 0.3) / 0.025), 0, 35); bins[i]++; });
  const mx = Math.max(4, ...bins), bw = (R - L) / 36;
  bins.forEach((c, i) => { const x = L + i * bw, hh = (c / mx) * (B - T); g.fillStyle = (i * 0.025 - 0.3) >= 0 ? '#6ee7a8' : '#8a93a8'; g.fillRect(x + 1, B - hh, bw - 2, hh); });
  g.strokeStyle = '#ffd166'; g.lineWidth = 4; g.beginPath(); g.moveTo(X(st.effect), T - 6); g.lineTo(X(st.effect), B); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), T); g.lineTo(X(0), B); g.stroke(); g.lineWidth = 1;
  g.font = '18px sans-serif'; g.fillStyle = 'rgba(232,238,248,.7)';
  [-0.2, 0, 0.2, 0.4, 0.6].forEach((d) => g.fillText((d > 0 ? '+' : '') + Math.round(d * 100), X(d) - 12, B + 24));
  g.fillText('measured difference (percentage points)', L, h - 10);
  g.fillStyle = '#ffd166'; g.font = 'bold 18px sans-serif'; g.fillText('true effect', X(st.effect) + 6, T + 8);
}
function drawShelf(g, w, h, st = { study: 2008 }) {
  panel(g, w, h);
  const y4 = st.study === 2004;
  g.fillStyle = '#e8eef8'; g.font = 'bold 26px sans-serif'; g.fillText(y4 ? 'Saper et al., JAMA 2004' : 'Saper et al., JAMA 2008', 24, 40);
  g.font = '20px sans-serif'; g.fillStyle = 'rgba(232,238,248,.8)';
  const lines = y4 ? ['70 Ayurvedic products made in South Asia, bought in Boston shops.', '14 of 70 (20%) had potentially harmful lead, mercury or arsenic.'] : ['193 products bought online, made in the US or India.', '20.7% had detectable lead, mercury or arsenic.', 'Rasa shastra (metal-based) 40.6%; others 17.1%.', 'US-made 21.7%, Indian-made 19.5%: no real difference.'];
  let y = 80; lines.forEach((l) => { y = wrap(g, l, 24, y, w - 48, 26) + 6; });
}

const SHELF = { 2004: { n: 70, bad: 14 }, 2008: { n: 193, bad: 40 } };

export default {
  id: 'evidence',
  short: 'What the evidence says',
  title: 'A fair test, and a safety check',
  subtitle: 'Placebo, blinding and randomisation; what reviews of Ayurveda have found; heavy metals, interactions and how products are regulated in India.',
  view: { pos: [0.4, 7.2, 11.5], target: [-1.2, 1.8, 0] },
  learn: `<p>How do we know if any medicine works, Ayurvedic or modern? People often get better anyway: many illnesses pass, and believing in a treatment can make you feel better (the <b>placebo effect</b>). So a <b>fair test</b> compares two similar groups: one gets the treatment, one gets a dummy that looks the same.</p>
    <p>Three rules keep the test honest. <b>Randomise</b>: a coin, not a person, decides who gets what, so healthier people don’t all end up in one group. <b>Blind</b>: nobody knows who got the real thing, so hopes don’t colour the results. <b>Enough people</b>: small trials are ruled by luck. MedicineClear builds a bigger simulator of the same idea.</p>
    <p>What have fair tests found for Ayurveda? Reviews say most trials so far are small or poorly designed, so for most uses the evidence is <b>weak or unclear</b>. A few better trials are encouraging: in a 2013 double-blind trial of 440 people in Pune, standardised Ayurvedic formulas eased knee arthritis pain about as well as two common modern treatments. India’s CCRAS and AIIA now run many more trials.</p>
    <p><b>Safety</b> matters too. US studies found lead, mercury or arsenic in about <b>1 in 5</b> Ayurvedic products tested, and in 4 in 10 metal-based (rasa shastra) ones. Herbs can <b>interact</b> with medicines, and some have been linked to rare <b>liver injury</b>. In India, Ayurvedic medicines need a state licence, export batches must pass heavy-metal tests, and side effects can be reported to a national AYUSH safety programme.</p>
    <p class="tip"><b>Try it:</b> set the true effect to 0, turn randomisation and blinding off, and run 100 trials. How many "find" a benefit that isn’t there?</p>`,
  terms: [
    { t: 'Placebo', d: 'A dummy treatment that looks real but has no active ingredient.' },
    { t: 'Placebo effect', d: 'Feeling better because you expect to, not because of the treatment.' },
    { t: 'Randomised', d: 'Chance, not choice, decides who gets which treatment.' },
    { t: 'Blinded', d: 'Patients (and ideally doctors) don’t know who got the real treatment.' },
    { t: 'Systematic review', d: 'A study that gathers and weighs every fair trial on one question.' },
    { t: 'Heavy metals', d: 'Toxic elements such as lead, mercury and arsenic.' },
    { t: 'Pharmacovigilance', d: 'Collecting reports of side effects to keep medicines safe.' },
  ],
  defaults: { show: 'trial', effect: 0.1, n: 30, randomise: true, blind: true, study: 2008, seed: 11, labels: true },
  controls: [
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'trial', label: 'A fair test' }, { v: 'safety', label: 'Safety check' }] },
    { key: 'effect', type: 'range', label: 'True effect of the treatment', min: 0, max: 0.3, step: 0.01, ends: ['none', '+30 points'], fmt: (v) => (v ? '+' + Math.round(v * 100) + ' points' : 'none at all') },
    { key: 'n', type: 'seg', label: 'People in each group', options: [{ v: 10, label: '10' }, { v: 30, label: '30' }, { v: 100, label: '100' }] },
    { key: 'randomise', type: 'toggle', label: 'Randomise (a coin decides)' },
    { key: 'blind', type: 'toggle', label: 'Blind (identical dummy pills)' },
    { key: 'run', type: 'buttons', label: 'Run', items: [{ label: 'Run one trial', act: (s) => { s.seed++; s._many = false; s._go = true; s.show = 'trial'; } }, { label: 'Run 100 trials', act: (s) => { s.seed++; s._many = true; s._go = true; s.show = 'trial'; } }] },
    { key: 'study', type: 'seg', label: 'Safety study', options: [{ v: 2004, label: '2004: shops' }, { v: 2008, label: '2008: online' }] },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) {
    if (['effect', 'n', 'randomise', 'blind'].includes(key)) { s.show = 'trial'; s._go = true; }
    if (key === 'study') s.show = 'safety';
  },
  quiz: [
    { q: 'Why do fair trials give some people a placebo?', options: ['To save money', 'Because many people improve anyway, so we need a comparison', 'To trick doctors', 'Placebos are the real medicine'], answer: 1, why: 'Illnesses often pass and expectations make people feel better. Only a comparison group shows what the treatment itself adds.' },
    { q: 'What does randomising a trial protect against?', options: ['Side effects', 'Healthier people ending up mostly in one group', 'Heavy metals', 'Spelling mistakes'], answer: 1, why: 'If people or doctors choose, the healthier ones may cluster in one group and make a treatment look better than it is.' },
    { q: 'In the 2008 US study, about what share of rasa shastra (metal-based) products contained lead, mercury or arsenic?', options: ['About 4 in 100', 'About 4 in 10', 'All of them', 'None'], answer: 1, why: '40.6% of rasa shastra products had detectable metals, compared with 17.1% of other Ayurvedic products.' },
  ],
  reel: [
    { ms: 5600, caption: 'A fair test: a coin decides who gets the herb and who gets an identical dummy, and nobody knows which.', set: { show: 'trial', effect: 0.15, n: 30, randomise: true, blind: true, labels: false }, act: (s) => { s._go = true; s._many = false; }, view: { pos: [0, 8.0, 9.5], target: [0, 0.6, 0] }, spin: 0 },
    { ms: 5400, caption: 'Skip randomising and blinding, and even a useless treatment can look like it works.', set: { show: 'trial', effect: 0, n: 100, randomise: false, blind: false, labels: false }, act: (s) => { s._go = true; s._many = true; }, view: { pos: [1.0, 6.5, 10.5], target: [1.0, 2.0, 0] }, spin: 0 },
    { ms: 5000, caption: 'US tests found lead, mercury or arsenic in about 1 in 5 Ayurvedic products checked.', set: { show: 'safety', study: 2008, labels: false }, view: { pos: [0, 3.6, 9], target: [0, 2.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { trial: new THREE.Group(), safety: new THREE.Group() }; root.add(G.trial, G.safety);
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);

    // ---------------- the trial: up to 200 little people in two groups
    const MAXP = 200;
    const bodyG = new THREE.CapsuleGeometry(0.1, 0.22, 4, 10); bodyG.translate(0, 0.21, 0);
    const headG = new THREE.SphereGeometry(0.09, 12, 8); headG.translate(0, 0.5, 0);
    const pm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const bodies = new THREE.InstancedMesh(bodyG, pm, MAXP), heads = new THREE.InstancedMesh(headG, pm, MAXP);
    [bodies, heads].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; G.trial.add(m); });
    const padA = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: 0xffd166, transparent: true, opacity: 0.12 })); padA.position.set(-2.6, 0.02, 0.4); G.trial.add(padA);
    const padB = padA.clone(); padB.material = new THREE.MeshStandardMaterial({ color: 0x9db4ff, transparent: true, opacity: 0.12 }); padB.position.x = 2.6; G.trial.add(padB);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.04, 40), M.ghost(0xffffff, 0.08)); pool.position.set(0, 0.02, -3.2); G.trial.add(pool);
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 32), M.metal(0xd4af37)); coin.position.set(0, 2.2, -1.6); coin.rotation.x = Math.PI / 2; G.trial.add(coin);
    const blindfold = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 30), M.matte(0x222630)); blindfold.position.set(0, 2.2, -1.6); G.trial.add(blindfold);
    const lA = L('Gets the herb', [-2.6, 0.2, 2.3], 'gold', G.trial), lB = L('Gets a dummy (placebo)', [2.6, 0.2, 2.3], 'blue', G.trial), lP = L('People who join', [0, 0.3, -4.6], 'muted', G.trial);
    const lCoin = L('', [0, 2.9, -1.6], 'gold', G.trial);
    const hct = canvasTexture(700, 380, drawHist);
    const hist = board(hct, 4.4, 2.4); hist.position.set(2.8, 3.4, -3.8); G.trial.add(hist);
    const rateA = L('', [-2.6, 1.3, 0.4], 'good', G.trial), rateB = L('', [2.6, 1.3, 0.4], 'good', G.trial);

    // ---------------- safety: a shelf of bottles
    const shelfM = M.matte(0x6b4a30);
    const SH = { cols: 25, rows: 8, w: 7.2 };
    for (let r = 0; r <= SH.rows / 2; r++) { const b = new THREE.Mesh(new THREE.BoxGeometry(SH.w + 0.4, 0.08, 1.0), shelfM); b.position.set(0, 0.4 + r * 1.0, 0); G.safety.add(b); }
    const bottleG = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12); bottleG.translate(0, 0.15, 0);
    const capG = new THREE.CylinderGeometry(0.07, 0.07, 0.07, 10); capG.translate(0, 0.33, 0);
    const bm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.0 });
    const bottles = new THREE.InstancedMesh(bottleG, bm, 200), caps = new THREE.InstancedMesh(capG, M.matte(0x303440), 200);
    [bottles, caps].forEach((m) => { m.frustumCulled = false; G.safety.add(m); });
    const glow = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff4a4a, transparent: true, opacity: 0.35, depthWrite: false }), 60); glow.frustumCulled = false; G.safety.add(glow);
    const sct = canvasTexture(700, 260, drawShelf);
    const sb = board(sct, 3.8, 1.41); sb.position.set(2.1, 4.9, -0.3); G.safety.add(sb);
    const safeL = [L('Red: lead, mercury or arsenic found', [2.8, 0.05, 0.9], 'bad', G.safety), L('Ayurvedic products tested', [-2.6, 0.05, 0.9], 'muted', G.safety)];

    let t = 0, res = null, many = null, runT = 99, lastSig = '', shelfSig = '';
    const o = new THREE.Object3D(), c = new THREE.Color();
    const green = new THREE.Color(0x6ee7a8), grey = new THREE.Color(0x70788a), white = new THREE.Color(0xe8eef8);
    const VIEWS = { trial: { pos: [0.4, 7.2, 11.5], target: [-1.2, 1.8, 0] }, safety: { pos: [0.2, 4.2, 10.5], target: [-1.3, 3.0, 0] } };
    const NV = { trial: { pos: [0, 7, 10], target: [0, 1.6, 0] }, safety: { pos: [0, 3.6, 9.5], target: [0, 3.0, 0] } };
    const sw = viewSwitcher(stage, VIEWS, NV);
    const fit = fitNarrow(stage, NV.trial);
    const home = (i, arm, n) => { const cols = n <= 10 ? 5 : 10, sp = n <= 10 ? 0.6 : n <= 30 ? 0.4 : 0.38; const k = i % cols, r = Math.floor(i / cols); const rows = Math.ceil(n / cols); return [(arm ? -2.6 : 2.6) + (k - (cols - 1) / 2) * sp, 0.04, 0.4 + (r - (rows - 1) / 2) * (n > 30 ? 0.3 : sp)]; };
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t += dt;
        sw(s.show);
        G.trial.visible = s.show === 'trial'; G.safety.visible = s.show === 'safety';
        const narrow = fit(), on = s.labels && !inReel();
        const opts = { n: s.n, effect: s.effect, randomise: s.randomise, blind: s.blind };
        const sig = JSON.stringify(opts) + s.seed;
        if (s._go || !res || sig !== lastSig) {
          s._go = false; lastSig = sig; runT = 0;
          res = runTrial(s.seed, opts);
          many = s._many ? runMany(s.seed, opts) : null;
          hct.redraw(many ? { many, effect: s.effect } : null);
        }
        runT += dt;
        // 0–1.6 s: people walk from the pool to their group; 1.6–2.6 s: the results come in
        const nA = [0, 0];
        res.people.forEach((q, i) => {
          const idx = q.herb ? nA[0]++ : nA[1]++;
          const h = home(idx, q.herb, s.n);
          const k = clamp((runT - (i / res.people.length) * 0.8) / 0.8, 0, 1), e = k * k * (3 - 2 * k);
          const a = rnd(i) * 6.28, rr = 1.1 * Math.sqrt(rnd(i + 1));
          o.position.set(lerp(Math.cos(a) * rr, h[0], e), 0.04 + Math.sin(e * Math.PI) * 0.5, lerp(-3.2 + Math.sin(a) * rr * 0.9, h[2], e));
          o.scale.setScalar(s.n > 30 ? 0.8 : 1); o.rotation.set(0, 0, 0); o.updateMatrix();
          bodies.setMatrixAt(i, o.matrix); heads.setMatrixAt(i, o.matrix);
          const shown = runT > 1.6 + (idx / s.n) * 0.8;
          c.copy(shown ? (q.better ? green : grey) : white); bodies.setColorAt(i, c); heads.setColorAt(i, c);
        });
        for (let i = res.people.length; i < MAXP; i++) { o.scale.setScalar(0.0001); o.updateMatrix(); bodies.setMatrixAt(i, o.matrix); heads.setMatrixAt(i, o.matrix); }
        [bodies, heads].forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
        coin.visible = s.randomise; coin.rotation.z = t * 6; coin.rotation.y = runT < 1.6 ? t * 8 : 0;
        blindfold.visible = s.blind; blindfold.rotation.y = t;
        lCoin.element.textContent = s.randomise ? (s.blind ? 'A coin decides; nobody knows who got what' : 'A coin decides, but everyone knows') : (s.blind ? 'People choose (healthier ones pick the herb)' : 'People choose, and everyone knows');
        const done = runT > 2.6;
        rateA.element.textContent = done ? `${Math.round(res.p1 * 100)}% better` : ''; rateB.element.textContent = done ? `${Math.round(res.p2 * 100)}% better` : '';
        [lA, lB].forEach((l) => { l.visible = on; }); lP.visible = on && !narrow; lCoin.visible = on && !narrow; rateA.visible = rateB.visible = on && done;
        // safety shelf
        const S = SHELF[s.study], ss = String(s.study);
        if (ss !== shelfSig) {
          shelfSig = ss; sct.redraw({ study: s.study });
          const bad = new Set(); const r = prng(s.study); while (bad.size < S.bad) bad.add(Math.floor(r() * S.n));
          let gi = 0;
          for (let i = 0; i < 200; i++) {
            const on2 = i < S.n, row = Math.floor(i / SH.cols), col = i % SH.cols;
            o.position.set(-SH.w / 2 + 0.15 + col * (SH.w - 0.3) / (SH.cols - 1), 0.44 + Math.floor(row / 2) * 1.0, row % 2 ? 0.22 : -0.22);
            o.scale.setScalar(on2 ? 1 : 0.0001); o.rotation.set(0, 0, 0); o.updateMatrix(); bottles.setMatrixAt(i, o.matrix); caps.setMatrixAt(i, o.matrix);
            const isBad = on2 && bad.has(i);
            c.setHex(isBad ? 0xff5a5a : [0xd9c08a, 0x8fbf7a, 0xc9a7ff, 0xe8e2d0][i % 4]); bottles.setColorAt(i, c);
            if (isBad && gi < 60) { o.position.y += 0.15; o.updateMatrix(); glow.setMatrixAt(gi++, o.matrix); }
          }
          for (; gi < 60; gi++) { o.scale.setScalar(0.0001); o.updateMatrix(); glow.setMatrixAt(gi, o.matrix); }
          [bottles, caps, glow].forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
        }
        glow.material.opacity = 0.25 + 0.2 * Math.sin(t * 3);
        safeL.forEach((l) => { l.visible = on && !narrow; });
      },
      readout: (s) => {
        if (s.show === 'safety') {
          const S = SHELF[s.study];
          return `<div class="big">${S.bad} of ${S.n} products had metals</div><div class="row"><span>Metal-based (rasa shastra)</span><b>about 4 in 10 (2008)</b></div><div class="row"><span>Other risks</span><b>herb–drug interactions, rare liver injury</b></div><div class="row"><span>In India</span><b>state licence; metal tests for exports</b></div><small>Report side effects to the AYUSH pharmacovigilance programme (since 2018). Reviews: most Ayurveda trials are small; evidence for most uses is weak or unclear.</small>`;
        }
        if (!res) return '';
        const pct = (x) => (x >= 0 ? '+' : '') + Math.round(x * 100);
        const verdict = res.found ? '<span class="ok">looks like it works</span>' : '<span class="no">no clear benefit</span>';
        const bias = !s.randomise || !s.blind ? `<small>Bias switched on: ${!s.randomise ? 'healthier people chose the herb' : ''}${!s.randomise && !s.blind ? ', and ' : ''}${!s.blind ? 'people knew what they got' : ''}. The result can mislead.</small>` : '<small>Randomised and blinded: the difference is the treatment, plus luck. Bigger groups mean less luck.</small>';
        const m = many ? `<div class="row"><span>Of 100 such trials</span><b>${many.filter((x) => x.found).length} found a benefit</b></div>` : '';
        return `<div class="big">Result: ${verdict}</div><div class="row"><span>True effect</span><b>${pct(s.effect)} points</b></div><div class="row"><span>Measured</span><b>${pct(res.d)} points (95%: ${pct(res.lo)} to ${pct(res.hi)})</b></div>${m}${bias}`;
      },
    });
  },
};
