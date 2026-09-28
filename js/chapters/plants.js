// Chapter 4: plants into medicines, and where the evidence is real. A plant goes down a production
// line: dry and grind the root, soak out its compounds, separate them, crystallise the pure one, and
// press exact tablets. The whole-herb route stops at the powder. The board compares how much of the
// active compound batches contain, whole root against tablets.
// Sources and numbers:
//  - Rauvolfia serpentina (sarpagandha, "Indian snakeroot"): used in India for madness, fever and
//    snakebite. Gananath Sen (a Kolkata kaviraj, 1877–c. 1945) & Kartick Chandra Bose, Indian Medical World 1931: root powder calmed patients and lowered
//    blood pressure. Salimuzzaman Siddiqui isolated its first alkaloids (ajmaline and others) in 1931.
//    R.J. Vakil, Br Heart J 11:350, 1949 (Mumbai): 50 patients with hypertension on Rauwolfia tablets
//    for 4 weeks; 85% had an average fall of 21 mmHg systolic. Reserpine isolated in 1952 by Müller,
//    Schlittler and Bein at Ciba, Basel; FDA approval 1955. It empties nerve endings of noradrenaline,
//    dopamine and serotonin by blocking the vesicle pump (VMAT). Depression at higher doses and newer
//    drugs made it rare, though cheap low-dose combinations are still used. Arvid Carlsson's reserpine
//    experiments on dopamine led to the 2000 Nobel Prize (Nobel lecture 2000). (Bhatara & Gupta,
//    Can J Psychiatry 42:790, 1997; "Indian Rauwolfia research led to the evolution of
//    neuropsychopharmacology & the 2000 Nobel Prize", Indian J Med Res, 2021 (Parts I and II); "Global Pharma and Local Science: the untold tale of reserpine", Indian J
//    Psychiatry, 2018.)
//  - Reserpine is 0.03–0.14% of the dry root, varying from plant to plant and place to place
//    ("Distribution of reserpine in Rauvolfia species from India: HPTLC and LC–MS studies", JNTBGRI
//    Thiruvananthapuram, Industrial Crops and Products, 2014; ScienceDirect Topics "Rauwolfia
//    alkaloid"). The Ayurvedic Pharmacopoeia of India sets a minimum alkaloid content for the root. Tablets
//    must hold 90–110% of the labelled amount (USP "Reserpine Tablets"; IP has similar limits).
//    The board draws batches uniformly across that range, seeded so the video repeats.
//  - Turmeric (haridra, Curcuma longa): curcumin is a few per cent of the dried rhizome. It is barely
//    absorbed: in people, 2 g of curcumin gave very low or undetectable blood levels, and 20 mg of
//    piperine from black pepper raised absorption about 20-fold (Shoba et al., Planta Med 64:353,
//    1998, St John's Medical College, Bengaluru). "No double-blinded, placebo-controlled clinical trial
//    of curcumin has been successful" (Nelson et al., J Med Chem 60:1620, 2017); some small trials
//    report help for knee arthritis pain, but reviews rate them low quality. Liver injury has been
//    reported with high-dose turmeric supplements (NIH LiverTox "Turmeric"). As a spice in food it is
//    considered safe.
//  - Ashwagandha (Withania somnifera): withanolides are the compounds most studied. A meta-analysis of
//    12 small trials (1,002 adults) found lower stress and anxiety scores (Akhgarjand et al.,
//    Phytother Res 36:4115, 2022), but trials are short and often funded by makers of the extract.
//    Liver injury: 5 cases from Iceland and the US DILIN (Björnsson et al., Liver Int 40:825, 2020).
//    Possible interactions with thyroid, diabetes, blood-pressure and sedative medicines (NIH NCCIH
//    "Ashwagandha"). Denmark restricted it in 2023; Indian researchers disputed the basis (Int J Ayurveda Res, 2024).
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { tint, fitNarrow, compactReadout, inReel, viewSwitcher, board, panel, wrap, leafGeo, capsule, blob, rnd, prng, glowMat } from '../ayur.js';

const PLANT = {
  rauvolfia: { label: 'Sarpagandha', latin: 'Rauvolfia serpentina', part: 'root', cpd: 'reserpine', powder: 0xb08a60, liquid: 0xd8c070, crystal: 0xf4f4f0 },
  turmeric: { label: 'Turmeric', latin: 'Curcuma longa', part: 'rhizome', cpd: 'curcumin', powder: 0xe8a020, liquid: 0xf0a020, crystal: 0xf09a10 },
  ashwagandha: { label: 'Ashwagandha', latin: 'Withania somnifera', part: 'root', cpd: 'withanolides', powder: 0xd8c8a0, liquid: 0xc8d090, crystal: 0xf0f0e0 },
};
const STEPS = [
  'Grow and harvest the plant',
  'Dry and grind the root to powder',
  'Soak in a solvent: compounds dissolve out',
  'Separate them in a column (chromatography)',
  'Crystallise one pure compound; check it',
  'Press tablets with an exact amount; test in trials',
];
// Reserpine in the dry root, % (range from surveys of Indian Rauvolfia): 0.03–0.14.
const RES = { lo: 0.03, hi: 0.14 };
export function batches(seed) {
  const r = prng(seed), avg = (RES.lo + RES.hi) / 2;
  const herb = Array.from({ length: 10 }, () => (lerp(RES.lo, RES.hi, r()) / avg) * 100);
  const tab = Array.from({ length: 10 }, () => 100 + (r() - 0.5) * 8);   // within the 90–110% limit, typically ±4%
  return { herb, tab };
}

function drawBoard(g, w, h, st = { plant: 'rauvolfia', seed: 1 }) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 28px sans-serif';
  if (st.plant === 'rauvolfia') {
    const b = batches(st.seed);
    g.fillText('Reserpine in 10 batches, % of the average', 24, 40);
    const L = 70, R = w - 24, T = 70, B = h - 60, Y = (v) => B - (v / 180) * (B - T);
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.fillStyle = 'rgba(232,238,248,.55)'; g.font = '18px sans-serif';
    [0, 50, 100, 150].forEach((v) => { g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(R, Y(v)); g.stroke(); g.fillText(v + '%', 18, Y(v) + 6); });
    const bw = (R - L) / 10;
    b.herb.forEach((v, i) => { g.fillStyle = '#e0bd7a'; g.fillRect(L + i * bw + 6, Y(v), bw / 2 - 8, B - Y(v)); });
    b.tab.forEach((v, i) => { g.fillStyle = '#6ee7a8'; g.fillRect(L + i * bw + bw / 2, Y(v), bw / 2 - 8, B - Y(v)); });
    g.font = 'bold 20px sans-serif'; g.fillStyle = '#e0bd7a'; g.fillText('whole root powder', L, h - 22); g.fillStyle = '#6ee7a8'; g.fillText('pure-compound tablets', L + 230, h - 22);
    const mn = Math.min(...b.herb), mx = Math.max(...b.herb);
    g.fillStyle = 'rgba(232,238,248,.8)'; g.font = '19px sans-serif'; g.fillText(`root: ${Math.round(mn)}–${Math.round(mx)}%   tablets: ${Math.round(Math.min(...b.tab))}–${Math.round(Math.max(...b.tab))}%`, L + 490 > w - 280 ? w - 330 : L + 490, h - 22);
  } else if (st.plant === 'turmeric') {
    g.fillText('Curcumin: how much reaches the blood?', 24, 40);
    g.font = '20px sans-serif'; g.fillStyle = 'rgba(232,238,248,.8)';
    let y = wrap(g, '2 g of curcumin by mouth gave very low or undetectable blood levels (Shoba et al., Bengaluru, 1998).', 24, 80, w - 48, 26);
    const bar = (lab, v, c, yy) => { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(250, yy - 22, w - 280, 30); g.fillStyle = c; g.fillRect(250, yy - 22, Math.max(4, (w - 280) * v), 30); g.fillStyle = '#e8eef8'; g.font = 'bold 20px sans-serif'; g.fillText(lab, 24, yy); };
    bar('Curcumin alone', 0.03, '#f0a020', y + 30); bar('+ piperine (pepper)', 0.6, '#ffd166', y + 80);
    g.fillStyle = 'rgba(232,238,248,.8)'; g.font = '20px sans-serif';
    wrap(g, 'About 20 times more with piperine, but still low. Large trials have not shown clear benefits (Nelson et al., 2017).', 24, y + 140, w - 48, 26);
  } else {
    g.fillText('Ashwagandha: what trials report', 24, 40);
    const rows = [['#6ee7a8', '12 small trials, 1,002 adults: lower stress and anxiety scores (2022 review)'], ['#ffd166', 'Short trials, often funded by extract makers: evidence rated low to moderate'], ['#ff8a8a', 'Rare liver injury reported (5 cases, 2020); Denmark restricted it in 2023']];
    let y = 90; g.font = '21px sans-serif';
    rows.forEach(([c, t]) => { g.fillStyle = c; g.fillRect(24, y - 20, 10, 50); g.fillStyle = '#e8eef8'; y = wrap(g, t, 48, y, w - 80, 27) + 24; });
  }
}

// ---------------- plant models (about 2.4 units tall, standing on a soil block with a see-through side)
function makePlant(kind) {
  const g = new THREE.Group(), leafM = new THREE.MeshStandardMaterial({ color: kind === 'ashwagandha' ? 0x7a9a5a : 0x3f8a3a, roughness: kind === 'rauvolfia' ? 0.3 : 0.6, side: THREE.DoubleSide });
  const stemM = M.matte(kind === 'rauvolfia' ? 0x5a4030 : 0x6a8a4a);
  const rootM = M.matte(kind === 'turmeric' ? 0xd88a20 : 0xb89a70);
  const leafAt = (geo, pos, yaw, tilt) => { const m = new THREE.Mesh(geo, leafM); m.position.set(...pos); m.rotation.set(0, yaw, 0); m.rotateX(tilt); m.castShadow = true; g.add(m); return m; };
  if (kind === 'rauvolfia') {
    g.add(capsule([0, 0.9, 0], [0, 2.9, 0], 0.05, stemM));
    const lg = leafGeo(0.75, 0.22, 0.1);
    // leaves in whorls of three, glossy and elliptic
    [1.4, 1.85, 2.3, 2.7].forEach((y, k) => { for (let i = 0; i < 3; i++) leafAt(lg, [0, y, 0], (i / 3) * Math.PI * 2 + k * 0.6, 1.0); });
    // a cluster of small pink-white flowers on red stalks, and a few dark drupes
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.12 + 0.1 * rnd(i); g.add(capsule([0, 2.9, 0], [Math.cos(a) * r, 3.12, Math.sin(a) * r], 0.012, M.matte(0xb03030))); g.add(blob([0.05, 0.05, 0.05], [Math.cos(a) * r, 3.16, Math.sin(a) * r], M.matte(i % 4 === 0 ? 0x3a1a3a : 0xf6d8e0))); }
    // tuberous roots: a thick tap root with side roots
    g.add(capsule([0, 0.9, 0], [0.05, 0.2, 0.05], 0.12, rootM));
    [[0.4, 0.4, 0.2], [-0.35, 0.3, -0.1], [0.1, 0.25, -0.4]].forEach((p) => g.add(capsule([0, 0.75, 0], p, 0.05, rootM)));
  } else if (kind === 'turmeric') {
    const lg = leafGeo(1.6, 0.35, 0.3);
    for (let i = 0; i < 6; i++) { g.add(capsule([0, 0.9, 0], [0, 1.4 + 0.1 * i, 0], 0.07 - i * 0.005, stemM)); leafAt(lg, [0, 1.3 + 0.1 * i, 0], i * 2.2, 0.35 + 0.1 * (i % 2)); }
    // the orange rhizome with its "fingers"
    g.add(blob([0.3, 0.16, 0.2], [0, 0.72, 0], rootM));
    [[0.45, 0.62, 0.1], [-0.4, 0.66, 0.15], [0.15, 0.6, -0.4], [-0.1, 0.58, 0.42]].forEach((p) => g.add(capsule([0, 0.72, 0], p, 0.08, rootM)));
  } else {
    g.add(capsule([0, 0.9, 0], [0, 2.4, 0], 0.05, stemM));
    const lg = leafGeo(0.55, 0.3, 0.05);
    [[0.3, 1.6], [-0.35, 1.9], [0.25, 2.2]].forEach(([dx, y], k) => {
      g.add(capsule([0, y - 0.2, 0], [dx * 2, y + 0.2, dx], 0.03, stemM));
      for (let i = 0; i < 4; i++) leafAt(lg, [dx * (1 + i * 0.3), y + i * 0.05, dx * 0.5], i * 1.7 + k, 1.1);
      // orange-red berries half hidden in papery husks
      for (let i = 0; i < 3; i++) { const p = [dx * (1.2 + i * 0.25), y - 0.08, dx * 0.5 + 0.12]; g.add(blob([0.05, 0.05, 0.05], p, M.matte(0xe0402a))); g.add(blob([0.08, 0.1, 0.08], [p[0], p[1] + 0.03, p[2]], new THREE.MeshStandardMaterial({ color: 0xc8b890, transparent: true, opacity: 0.6, roughness: 0.9 }))); }
    });
    g.add(capsule([0, 0.9, 0], [0.02, 0.1, 0.02], 0.1, rootM));
    g.add(capsule([0, 0.6, 0], [0.3, 0.2, 0.1], 0.04, rootM));
  }
  return g;
}

export default {
  id: 'plants',
  short: 'Plants into medicines',
  title: 'From a snakeroot to a blood-pressure pill',
  subtitle: 'How reserpine came from Ayurveda’s sarpagandha, and what research says about turmeric and ashwagandha.',
  view: { pos: [0.2, 4.6, 13.5], target: [-0.6, 3.0, 0] },
  learn: `<p>Now the science. Plants make powerful chemicals, and some Ayurvedic plants have given the world real medicines. The best example is <b>sarpagandha</b> (<i>Rauvolfia serpentina</i>, Indian snakeroot), long used in India for madness and snakebite.</p>
    <p>In <b>1931</b> the Kolkata Ayurvedic physician (kaviraj) <b>Gananath Sen</b> and the doctor Kartick Chandra Bose reported that its root powder calmed patients and <b>lowered blood pressure</b>. In <b>1949</b> the Mumbai cardiologist <b>Rustom Jal Vakil</b> published a careful study of 50 patients in the <i>British Heart Journal</i>. In <b>1952</b> chemists in Switzerland isolated the pure compound, <b>reserpine</b>, which became one of the first modern blood-pressure drugs.</p>
    <p>Isolating a compound matters. The amount of reserpine in the root varies about <b>fourfold</b> from plant to plant. A pure tablet holds the same exact amount every time, so doctors can set a dose, test it in <b>fair trials</b>, and learn its side effects. Reserpine’s turned out to include depression at higher doses, and newer drugs mostly replaced it.</p>
    <p>For other famous herbs the evidence is <b>mixed or still emerging</b>. <b>Curcumin</b> from turmeric is barely absorbed, and large careful trials have not shown clear benefits. <b>Ashwagandha</b> lowered stress scores in small trials, but they are short, and rare liver injury has been reported. "Natural" does not mean "safe" or "proven". Always ask a qualified doctor.</p>
    <p class="tip"><b>Try it:</b> press "Test 10 new batches" a few times. Compare how much the root powder and the tablets vary.</p>`,
  terms: [
    { t: 'Sarpagandha', d: 'Rauvolfia serpentina, Indian snakeroot: the source of reserpine.' },
    { t: 'Reserpine', d: 'A pure compound from sarpagandha root, made into a blood-pressure drug in the 1950s.' },
    { t: 'Alkaloid', d: 'A nitrogen-containing plant chemical, often strongly active in the body, like reserpine or caffeine.' },
    { t: 'Chromatography', d: 'Separating a mixture by how fast each compound travels through a column or paper.' },
    { t: 'Standardisation', d: 'Making every batch contain the same amount of the active compound.' },
    { t: 'Bioavailability', d: 'How much of a swallowed compound actually reaches the blood.' },
    { t: 'Curcumin', d: 'The yellow compound in turmeric, much studied but poorly absorbed.' },
  ],
  defaults: { plant: 'rauvolfia', route: 'isolate', step: 5, seed: 3, labels: true },
  controls: [
    { key: 'plant', type: 'seg', label: 'Plant', options: Object.entries(PLANT).map(([v, p]) => ({ v, label: p.label })), fmt: (v) => PLANT[v].latin },
    { key: 'route', type: 'seg', label: 'Route', options: [{ v: 'isolate', label: 'Isolate a compound' }, { v: 'herb', label: 'Whole herb' }] },
    { key: 'step', type: 'range', label: 'Production step', min: 0, max: 5, step: 1, fmt: (v) => STEPS[v] },
    { key: 'test', type: 'buttons', label: 'Quality check', items: [{ label: 'Test 10 new batches', act: (s) => { s.seed = (s.seed * 7 + 3) % 997; s.plant = 'rauvolfia'; } }] },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) { if (key === 'route' && s.route === 'herb') s.step = Math.min(s.step, 1); if (key === 'step' && s.step > 1) s.route = 'isolate'; },
  quiz: [
    { q: 'Which modern drug came from the Ayurvedic plant sarpagandha?', options: ['Aspirin', 'Reserpine', 'Penicillin', 'Insulin'], answer: 1, why: 'Reserpine was isolated from Rauvolfia serpentina root in 1952 and used to treat high blood pressure.' },
    { q: 'Why is a pure-compound tablet easier to test than root powder?', options: ['It tastes better', 'Every tablet holds the same exact amount, so doses and effects can be measured', 'It is always stronger', 'Plants have no active compounds'], answer: 1, why: 'The amount of reserpine in the root varies about fourfold. Pure tablets let doctors set a dose and study it fairly.' },
    { q: 'What is the main problem with curcumin as a medicine?', options: ['It is too expensive', 'Very little of it is absorbed into the blood', 'It is radioactive', 'It only works at night'], answer: 1, why: 'Curcumin is barely absorbed, and careful trials have not shown clear benefits. Turmeric in food is fine.' },
  ],
  reel: [
    { ms: 5600, caption: 'In 1949 a Mumbai cardiologist found sarpagandha root lowered blood pressure in most of his 50 patients.', set: { plant: 'rauvolfia', route: 'herb', step: 1, labels: false }, view: { pos: [-3.2, 3.6, 6.5], target: [-3.8, 1.8, 0] }, spin: 0 },
    { ms: 5600, caption: 'Its pure compound, reserpine, became a blood-pressure drug: every tablet holds the same exact dose.', set: { plant: 'rauvolfia', route: 'isolate', step: 0, labels: false }, anim: { step: [0, 5] }, view: { pos: [0.6, 5.0, 12.5], target: [0.3, 2.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);
    const SX = [-4.4, -2.5, -0.8, 0.9, 2.5, 4.1];
    // soil block with a see-through front so the roots show
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.9, 40), new THREE.MeshStandardMaterial({ color: 0x5a3f28, transparent: true, opacity: 0.35, roughness: 1, depthWrite: false })); soil.position.set(SX[0], 0.45, 0); root.add(soil);
    const plants = {}; Object.keys(PLANT).forEach((k) => { const p = makePlant(k); p.position.x = SX[0]; root.add(p); plants[k] = p; });
    // 1: powder mound
    const powderM = M.matte(0xb08a60); const mound = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 40), powderM); mound.position.set(SX[1], 0.25, 0); root.add(mound);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.matte(0x5b5f68, { side: THREE.DoubleSide })); bowl.position.set(SX[1], 0.6, 0); bowl.scale.y = 0.6; root.add(bowl);
    // 2: extraction flask
    const flaskM = M.clear(0xcfe8ff, 0.25);
    const flask = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.7, 0.05], [0.75, 0.3], [0.55, 0.8], [0.18, 1.1], [0.16, 1.7], [0.2, 1.75]].map(([r, y]) => new THREE.Vector2(r, y)), 40), flaskM); flask.position.set(SX[2], 0, 0); root.add(flask);
    const liqM = new THREE.MeshStandardMaterial({ color: 0xd8c070, transparent: true, opacity: 0.75, roughness: 0.2 });
    const liq = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.02], [0.66, 0.06], [0.7, 0.3], [0.56, 0.62], [0, 0.62]].map(([r, y]) => new THREE.Vector2(r, y)), 40), liqM); liq.position.set(SX[2], 0, 0); root.add(liq);
    // 3: chromatography column with bands that separate as they move down
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.6, 24, 1, true), M.clear(0xcfe8ff, 0.25)); col.position.set(SX[3], 1.5, 0); root.add(col);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.0, 0.1), M.metal()); stand.position.set(SX[3] - 0.5, 1.5, -0.2); root.add(stand);
    const BAND = [0x6ee7a8, 0xffd166, 0xff8a8a, 0xc9a7ff];
    const bands = BAND.map((c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), glowMat(c, 0.6, 0.85)); root.add(m); return m; });
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glowMat(0xffd166, 0.6)); root.add(drip);
    // 4: crystals
    const crystM = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f0, roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.95 });
    const crystals = new THREE.Group(); crystals.position.set(SX[4], 0.1, 0); root.add(crystals);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 40), M.clear(0xcfe8ff, 0.3)); crystals.add(dish);
    for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3 + 0.3 * rnd(i), 6), crystM); const a = rnd(i + 1) * 6.28, r = 0.45 * Math.sqrt(rnd(i + 2)); c.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r); c.rotation.set((rnd(i + 3) - 0.5) * 1.2, 0, (rnd(i + 4) - 0.5) * 1.2); crystals.add(c); }
    // 5: tablets in a blister strip
    const blister = new THREE.Group(); blister.position.set(SX[5], 0.1, 0); root.add(blister);
    blister.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.6), M.metal(0xc8ccd4)));
    for (let i = 0; i < 8; i++) { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 24), M.plastic(0xf8f8f8)); tb.position.set(-0.3 + (i % 2) * 0.6, 0.08, -0.6 + Math.floor(i / 2) * 0.4); blister.add(tb); }
    // whole-herb route: a jar of churna and a spoon
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 32), M.clear(0xffffff, 0.3)); jar.position.set(SX[1] + 0.2, 0.45, 1.3); root.add(jar);
    const jarFill = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.6, 32), powderM); jarFill.position.set(SX[1] + 0.2, 0.32, 1.3); root.add(jarFill);
    // arrows between stations
    const arrows = SX.slice(0, 5).map((x, i) => { const a = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 12), M.glow(0xffd166)); a.rotation.z = -Math.PI / 2; a.position.set((x + SX[i + 1]) / 2, 2.9, 0); root.add(a); return a; });
    const stageObjs = [[soil, ...Object.values(plants)], [mound, bowl], [flask, liq], [col, stand, ...bands, drip], [crystals], [blister]];
    const stepL = STEPS.map((txt, i) => L(`${i + 1}. ${txt}`, [clamp(SX[i], -3.2, 2.6), -0.3, 1.2], i === 5 ? 'good' : 'gold'));
    const jarL = L('Churna: whole-herb powder', [SX[1] + 0.2, 1.3, 1.3], '#e0bd7a');
    const bct = canvasTexture(760, 400, drawBoard);
    const bd = board(bct, 3.8, 2.0); bd.position.set(2.7, 3.8, -1.8); root.add(bd);
    let t = 0, sig = '';
    const fit = fitNarrow(stage, { pos: [-1, 4.2, 11], target: [-1, 2.4, 0] });
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t += dt;
        const narrow = fit(), on = s.labels && !inReel(), P = PLANT[s.plant];
        Object.entries(plants).forEach(([k, p]) => { p.visible = k === s.plant; p.rotation.y = 0.2 * Math.sin(t * 0.4); });
        powderM.color.setHex(P.powder); liqM.color.setHex(P.liquid); crystM.color.setHex(P.crystal);
        const step = Math.round(s.step), herb = s.route === 'herb';
        stageObjs.forEach((objs, i) => objs.forEach((o) => { o.visible = i <= step && (!herb || i <= 1); }));
        arrows.forEach((a, i) => { a.visible = i < step && (!herb || i < 1); a.scale.setScalar(1 + 0.15 * Math.sin(t * 4 - i)); });
        jar.visible = jarFill.visible = herb; jarL.visible = herb && on;
        // chromatography: bands start together at the top and spread out, each at its own speed
        const u = (t * 0.15) % 1;
        bands.forEach((b, i) => { b.position.set(SX[3], 2.6 - u * (0.6 + i * 0.45), 0); b.visible = step >= 3 && !herb; });
        drip.position.set(SX[3], 0.2 - ((t * 1.2) % 1) * 0.3, 0);
        crystals.rotation.y = t * 0.3;
        stepL.forEach((l, i) => { l.visible = on && i === step; });
        const k = s.plant + s.seed; if (k !== sig) { sig = k; bct.redraw({ plant: s.plant, seed: s.seed }); }
      },
      readout: (s) => {
        const P = PLANT[s.plant];
        if (s.plant === 'rauvolfia') {
          const b = batches(s.seed);
          return `<div class="big">Sarpagandha → reserpine</div><div class="row"><span>Reserpine in dry root</span><b>0.03–0.14%</b></div><div class="row"><span>These 10 root batches</span><b>${Math.round(Math.min(...b.herb))}–${Math.round(Math.max(...b.herb))}% of average</b></div><div class="row"><span>Tablets must hold</span><b>90–110% of the label</b></div><div class="row"><span>Proven in trials</span><b>yes: lowers blood pressure</b></div><small>1931 Kolkata, 1949 Mumbai (Vakil), 1952 isolated in Basel. Now little used: side effects and better drugs.</small>`;
        }
        if (s.plant === 'turmeric') return `<div class="big">Turmeric → curcumin</div><div class="row"><span>Used for</span><b>inflammation, wounds, digestion</b></div><div class="row"><span>Absorbed into the blood</span><b>very little</b></div><div class="row"><span>Evidence</span><b>mixed, mostly small trials</b></div><small>Fine as a spice. High-dose supplements have rarely been linked to liver injury.</small>`;
        return `<div class="big">Ashwagandha → withanolides</div><div class="row"><span>Used as</span><b>a rasayana (tonic), for stress and sleep</b></div><div class="row"><span>Trials</span><b>12 small ones: lower stress scores</b></div><div class="row"><span>Evidence</span><b>emerging, low to moderate quality</b></div><small>Rare liver injury reported. Can interact with thyroid, diabetes and sedative medicines: tell your doctor.</small>`;
      },
    });
  },
};
