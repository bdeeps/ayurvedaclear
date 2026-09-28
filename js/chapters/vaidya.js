// Chapter 3: how a vaidya works, described factually. Four stations:
//  1. Nadi pariksha (pulse reading). Three fingertips rest on the radial artery at the wrist; in the
//     tradition the index finger (nearest the hand) reads vata, the middle pitta, the ring kapha, and
//     later texts compare the pulse's "gait" to a snake (vata), a frog (pitta) or a swan (kapha)
//     (Sharangadhara Samhita, Purva 3, c. 13th–14th century; Yogaratnakara, c. 17th century). Pulse
//     reading is not described as a method in Charaka or Sushruta. The waveform shown is ordinary
//     physiology: a steep systolic upstroke, a peak, the dicrotic notch as the aortic valve closes,
//     then diastolic run-off (Guyton & Hall, 14th ed., ch. 15). Resting heart rate 60–100 beats a
//     minute in adults, often lower in fit people (American Heart Association).
//     Reliability: when 15 registered Ayurvedic doctors in Pune each examined the same 20 healthy
//     students, agreement on pulse diagnosis was "slight" (average weighted kappa 0.07) and on prakriti
//     "fair" (0.28) (Kurande et al., Evid Based Complement Alternat Med 2013:658275; overview in
//     J Ayurveda Integr Med 4:67, 2013).
//  2. Kwatha (decoction). The classical recipe: one part coarse herb powder boiled in 16 parts of
//     water and reduced to a quarter (for most herbs) or an eighth (Sharangadhara Samhita, Madhyama
//     Khanda 2.1–2; Ayurvedic Formulary of India, Part I, Ministry of AYUSH). Physics: water c =
//     4.186 J/(g·K), latent heat of vaporisation at 100 °C L = 2,257 J/g (NIST / CRC Handbook). With
//     P watts of heat actually reaching the water, warming takes m·c·ΔT / P and boiling away removes
//     P / L grams a second. A household LPG burner takes in about 1.5–2 kW; IS 4246 (BIS) asks for at
//     least 68% efficiency with a flat metal test vessel, and a round clay pot on a low flame gets far
//     less, so the slider runs from 200 to 1,200 W actually reaching the water. We ignore evaporation before the boil and heat soaked up by the herb.
//  3. Dinacharya and ritucharya (daily and seasonal routine) (AH Su. 2–3; Ch. Su. 5–6). The "4-hour
//     blocks" (kapha 6–10, pitta 10–2, vata 2–6, morning and night) are a common modern teaching of AH
//     Su. 1.8, which says each dosha is strongest at the start, middle or end of the day and night.
//     The six ritus, each about two months: Shishira, Vasanta, Grishma, Varsha, Sharad, Hemanta;
//     vata builds in Grishma and flares in Varsha, pitta builds in Varsha and flares in Sharad, kapha
//     builds in Shishira and flares in Vasanta (Ch. Su. 6; AH Su. 12.24–28). Month mapping to the
//     Gregorian calendar is approximate (mid-January to mid-March is Shishira, and so on).
//  4. Panchakarma: preparation by oiling (snehana) and sweating (svedana), then the five main
//     procedures: vamana (induced vomiting), virechana (purging), basti (medicated enema), nasya (nasal
//     medicine) and raktamokshana (bloodletting, e.g. with leeches), then a graded diet (samsarjana
//     krama) (Ch. Si. 1; AH Su. 18–20). AIIA New Delhi and CCRAS institutes run panchakarma units.
//     No dosing or how-to is given here.
import { THREE, M, clamp, lerp, canvasTexture, latheX } from '../kit.js';
import { tint, fitNarrow, compactReadout, inReel, viewSwitcher, board, panel, flame, capsule, blob, rnd, glowMat, DOSHA } from '../ayur.js';

const VIEWS = {
  pulse: { pos: [0.4, 5.0, 8.8], target: [-0.9, 3.0, 0] },
  kwatha: { pos: [-0.2, 4.4, 8.5], target: [-1.4, 2.6, 0] },
  routine: { pos: [-0.3, 5.6, 9.5], target: [-1.6, 2.9, 0] },
  panchakarma: { pos: [-0.6, 5.8, 10.5], target: [-1.8, 2.6, 0] },
};
const NARROW = {
  pulse: { pos: [0.6, 4.4, 8], target: [0.6, 2.6, 0] },
  kwatha: { pos: [0, 3.6, 7.5], target: [0, 2.4, 0] },
  routine: { pos: [0, 3.4, 8], target: [0, 2.6, 0] },
  panchakarma: { pos: [0, 5, 8.5], target: [0, 2, 0] },
};

// The pulse waveform, one beat (phase 0–1) → pressure 0–1: upstroke, peak, notch, run-off.
export function pulseShape(ph) {
  if (ph < 0.12) return Math.sin((ph / 0.12) * Math.PI / 2);
  if (ph < 0.33) return 1 - 0.45 * ((ph - 0.12) / 0.21) ** 1.2;
  if (ph < 0.38) return 0.55 - 0.08 * Math.sin(((ph - 0.33) / 0.05) * Math.PI / 2);   // dicrotic notch
  if (ph < 0.45) return 0.47 + 0.09 * Math.sin(((ph - 0.38) / 0.07) * Math.PI);
  return 0.5 * Math.exp(-(ph - 0.45) * 2.6);
}

// Decoction physics. Returns {T °C, water g, phase} after `sec` seconds of heating with P watts net.
export const KW = { herb: 20, parts: 16, c: 4.186, L: 2257, T0: 27 };
export function decoct(sec, P, frac) {
  const m0 = KW.herb * KW.parts, tHeat = (m0 * KW.c * (100 - KW.T0)) / P;
  if (sec < tHeat) return { T: KW.T0 + (100 - KW.T0) * (sec / tHeat), water: m0, boil: false, tHeat, done: false };
  const target = m0 * frac, water = Math.max(target, m0 - (P / KW.L) * (sec - tHeat));
  return { T: 100, water, boil: water > target, tHeat, done: water <= target, tTotal: tHeat + ((m0 - target) * KW.L) / P };
}

const RITU = [
  { n: 'Shishira', en: 'late winter', m: 'mid-Jan to mid-Mar', note: 'kapha builds up', col: '#9db4ff' },
  { n: 'Vasanta', en: 'spring', m: 'mid-Mar to mid-May', note: 'kapha flares: lighter food advised', col: '#6ee7a8' },
  { n: 'Grishma', en: 'summer', m: 'mid-May to mid-Jul', note: 'vata builds up: cool, liquid food advised', col: '#ffd166' },
  { n: 'Varsha', en: 'monsoon', m: 'mid-Jul to mid-Sep', note: 'vata flares, pitta builds: easy-to-digest food', col: '#8ef0ff' },
  { n: 'Sharad', en: 'autumn', m: 'mid-Sep to mid-Nov', note: 'pitta flares: cooling, bitter food advised', col: '#ffa06a' },
  { n: 'Hemanta', en: 'early winter', m: 'mid-Nov to mid-Jan', note: 'strong agni: nourishing food advised', col: '#c9a7ff' },
];
const DAY = [
  [2, 6, 'vata', 'Brahma muhurta: the texts say rise before dawn'],
  [6, 10, 'kapha', 'Morning: clean teeth and tongue, exercise to half your strength, bathe'],
  [10, 14, 'pitta', 'Midday: agni is strongest, so the main meal'],
  [14, 18, 'vata', 'Afternoon: work, study, a light snack'],
  [18, 22, 'kapha', 'Evening: a light early dinner, wind down'],
  [22, 26, 'pitta', 'Night: sleep; the body "digests" the day'],
];
const PK = [
  { n: 'Snehana', en: 'oiling: medicated ghee or oil, inside and out', stage: 'Preparation' },
  { n: 'Svedana', en: 'sweating, often in a herbal steam box', stage: 'Preparation' },
  { n: 'Vamana', en: 'induced vomiting, for kapha', stage: 'Main procedure' },
  { n: 'Virechana', en: 'purging with herbal laxatives, for pitta', stage: 'Main procedure' },
  { n: 'Basti', en: 'medicated enema, for vata; called "half of all treatment"', stage: 'Main procedure' },
  { n: 'Nasya', en: 'medicine given through the nose', stage: 'Main procedure' },
  { n: 'Raktamokshana', en: 'letting a little blood, sometimes with leeches', stage: 'Main procedure' },
  { n: 'Samsarjana krama', en: 'a graded diet: thin gruel back up to normal food', stage: 'Aftercare' },
];

function drawPulse(g, w, h, st = { hr: 72, t: 0 }) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 26px sans-serif'; g.fillText(`Radial pulse: ${Math.round(st.hr)} beats a minute`, 24, 38);
  const L = 24, R = w - 24, T = 70, B = h - 40, span = 4;   // seconds shown
  g.strokeStyle = 'rgba(255,255,255,.1)'; for (let s = 0; s <= span; s++) { const x = L + (s / span) * (R - L); g.beginPath(); g.moveTo(x, T); g.lineTo(x, B); g.stroke(); }
  g.strokeStyle = '#ff8a8a'; g.lineWidth = 4; g.beginPath();
  for (let i = 0; i <= 400; i++) { const tt = st.t - span + (i / 400) * span, ph = ((tt * st.hr) / 60) % 1; const y = B - pulseShape(ph < 0 ? ph + 1 : ph) * (B - T - 10); i ? g.lineTo(L + (i / 400) * (R - L), y) : g.moveTo(L, y); }
  g.stroke(); g.lineWidth = 1;
  g.fillStyle = 'rgba(232,238,248,.6)'; g.font = '18px sans-serif'; g.fillText('1 second per grid square', L, h - 12);
  g.fillText('notch: the aortic valve shuts', R - 250, h - 12);
}
function drawClock(g, w, h, st = { hour: 7, month: 8 }) {
  g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, R0 = w * 0.27, R1 = w * 0.38, R2 = w * 0.49;
  const ang = (hr) => ((hr / 24) * Math.PI * 2) - Math.PI / 2;
  DAY.forEach(([a, b, d]) => { g.fillStyle = DOSHA[d].css + '55'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R1, ang(a), ang(b)); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.stroke(); });
  g.fillStyle = 'rgba(10,12,18,.9)'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill();
  const mA = (m) => (m / 12) * Math.PI * 2 - Math.PI / 2;   // month 0 = 1 January, at the top
  RITU.forEach((r, i) => { const a0 = mA(0.5 + 2 * i); g.strokeStyle = r.col; g.lineWidth = 44; g.beginPath(); g.arc(cx, cy, (R1 + R2) / 2 + 4, a0 + 0.02, a0 + Math.PI / 3 - 0.02); g.stroke(); });
  g.lineWidth = 1;
  g.fillStyle = '#e8eef8'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center';
  [0, 6, 12, 18].forEach((hr) => { const a = ang(hr); g.fillText(hr === 0 ? '12 am' : hr === 12 ? '12 pm' : hr === 6 ? '6 am' : '6 pm', cx + Math.cos(a) * (R0 - 50), cy + Math.sin(a) * (R0 - 50) + 10); });
  DAY.forEach(([a, b, d]) => { const m = ang((a + b) / 2); g.fillStyle = DOSHA[d].css; g.font = 'bold 26px sans-serif'; g.fillText(DOSHA[d].name, cx + Math.cos(m) * (R0 + R1) / 2, cy + Math.sin(m) * (R0 + R1) / 2 + 9); });
  g.font = 'bold 26px sans-serif';
  RITU.forEach((r, i) => { const m = mA(1.5 + 2 * i); g.fillStyle = '#0a0c12'; g.fillText(r.n, cx + Math.cos(m) * ((R1 + R2) / 2 + 4), cy + Math.sin(m) * ((R1 + R2) / 2 + 4) + 8); });
  g.textAlign = 'left';
  // hands: hour (white) and month (gold, on the ritu ring)
  const a = ang(st.hour); g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R1 - 6), cy + Math.sin(a) * (R1 - 6)); g.stroke();
  const am = (st.month / 12) * Math.PI * 2 - Math.PI / 2; g.fillStyle = '#ffd166'; g.beginPath(); g.arc(cx + Math.cos(am) * (R2 + 2), cy + Math.sin(am) * (R2 + 2), 12, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.fill(); g.lineWidth = 1;
}

export default {
  id: 'vaidya',
  short: 'How a vaidya works',
  title: 'Pulse, pot and routine',
  subtitle: 'A consultation, nadi pariksha, decoctions like triphala, the daily and seasonal routine, and Panchakarma.',
  view: VIEWS.pulse,
  learn: `<p>A visit to a <b>vaidya</b> (an Ayurvedic doctor, with a BAMS degree in India) starts with questions and looking: your tongue, eyes, skin, sleep, appetite, habits and the season. The aim is to judge your <b>prakriti</b> and which dosha is out of balance. This chapter describes what they do; chapter 5 looks at the evidence.</p>
    <p><b>Nadi pariksha</b>, pulse reading, came into the texts later, around the 13th century. Three fingertips rest on the wrist: the index finger is said to read vata, the middle pitta, the ring finger kapha. Any doctor can feel your pulse’s rate and rhythm; the <b>notch</b> in the trace is simply a heart valve closing.</p>
    <p>Treatment is mostly <b>diet and routine</b> first (dinacharya, the daily routine, and ritucharya, the seasonal one), then <b>herbal medicines</b>. They come as powders (<b>churna</b>, like <b>triphala</b>: amla, haritaki and bibhitaki), tablets, medicated ghee, fermented tonics, or a <b>kwatha</b>: a decoction boiled down to a quarter. Some classical medicines (<b>rasa shastra</b>) deliberately include processed metals and minerals, which matters in chapter 5.</p>
    <p><b>Panchakarma</b> is a supervised "cleansing" course: oiling and steam first, then up to five procedures, then a slow return to normal food. It is done only under qualified supervision. Never try any of this on your own: for any health problem, see a qualified doctor.</p>
    <p class="tip"><b>Try it:</b> in "Decoction", turn the heat up and press Boil. How long does it take to reduce 320 mL of water to a quarter?</p>`,
  terms: [
    { t: 'Vaidya', d: 'A practitioner of Ayurveda.' },
    { t: 'Nadi pariksha', d: 'Reading the pulse at the wrist with three fingertips.' },
    { t: 'Dinacharya', d: 'The daily routine the texts recommend.' },
    { t: 'Ritucharya', d: 'Changes to food and habits for each of the six seasons.' },
    { t: 'Churna', d: 'A fine herbal powder, such as triphala.' },
    { t: 'Kwatha', d: 'A decoction: herbs boiled in water and reduced, usually to a quarter.' },
    { t: 'Rasa shastra', d: 'The branch of Ayurvedic pharmacy that processes metals and minerals into medicines (bhasmas).' },
    { t: 'Panchakarma', d: 'A supervised five-part cleansing treatment with preparation and aftercare.' },
  ],
  defaults: { show: 'pulse', hr: 72, power: 700, frac: 0.25, hour: 7, month: 8.5, pk: 0, labels: true },
  controls: [
    { key: 'show', type: 'seg', label: 'Station', options: [{ v: 'pulse', label: 'Pulse' }, { v: 'kwatha', label: 'Decoction' }, { v: 'routine', label: 'Routine' }, { v: 'panchakarma', label: 'Panchakarma' }] },
    { key: 'hr', type: 'range', label: 'Heart rate', min: 45, max: 130, step: 1, ends: ['resting athlete', 'after running'], fmt: (v) => Math.round(v) + ' a minute' },
    { key: 'power', type: 'range', label: 'Heat reaching the water', min: 200, max: 1200, step: 10, ends: ['low flame', 'full flame'], fmt: (v) => Math.round(v) + ' W' },
    { key: 'frac', type: 'seg', label: 'Boil down to', options: [{ v: 0.5, label: 'a half' }, { v: 0.25, label: 'a quarter' }, { v: 0.125, label: 'an eighth' }] },
    { key: 'boil', type: 'buttons', label: 'Decoction', items: [{ label: 'Boil (1 s = 1 min)', act: (s) => { s._boil = true; s.show = 'kwatha'; } }] },
    { key: 'hour', type: 'range', label: 'Time of day', min: 0, max: 23.9, step: 0.1, fmt: (v) => `${Math.floor(v) % 12 || 12}:${String(Math.floor((v % 1) * 60)).padStart(2, '0')} ${v < 12 ? 'am' : 'pm'}` },
    { key: 'month', type: 'range', label: 'Month', min: 0, max: 11.99, step: 0.05, fmt: (v) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(v)] },
    { key: 'pk', type: 'range', label: 'Panchakarma step', min: 0, max: 7, step: 1, fmt: (v) => PK[v].n },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) {
    if (key === 'hr') s.show = 'pulse';
    if (key === 'power' || key === 'frac') s.show = 'kwatha';
    if (key === 'hour' || key === 'month') s.show = 'routine';
    if (key === 'pk') s.show = 'panchakarma';
  },
  quiz: [
    { q: 'In nadi pariksha, which finger is said to read vata?', options: ['The thumb', 'The index finger', 'The ring finger', 'The little finger'], answer: 1, why: 'Tradition places the index finger nearest the hand for vata, the middle finger for pitta and the ring finger for kapha.' },
    { q: 'A classical kwatha boils one part herb in 16 parts water. What is it usually reduced to?', options: ['Twice as much', 'A quarter', 'Nothing: it is boiled dry', 'It is not boiled at all'], answer: 1, why: 'Most decoctions are boiled down to a quarter of the water (some to an eighth), concentrating what dissolves out of the herb.' },
    { q: 'What makes rasa shastra medicines different?', options: ['They are only for children', 'They deliberately include processed metals and minerals', 'They are made from animal milk', 'They are taken through the nose'], answer: 1, why: 'Rasa shastra processes metals and minerals, such as mercury or lead compounds, into medicines called bhasmas. This matters for safety.' },
  ],
  reel: [
    { ms: 5400, caption: 'A kwatha boils one part herb in 16 parts water down to a quarter: here 320 mL becomes 80 mL.', set: { show: 'kwatha', power: 900, frac: 0.25, labels: false }, act: (s) => { s._boil = true; s._fast = true; }, view: { pos: [0.4, 3.8, 6.5], target: [0, 1.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { pulse: new THREE.Group(), kwatha: new THREE.Group(), routine: new THREE.Group(), panchakarma: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);
    const skin = M.matte(0xc68a62), skin2 = M.matte(0x9a6446);

    // ---------------- pulse: a patient's forearm, palm up, and the vaidya's three fingers
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.4, 32), M.matte(0x7a3a4a)); cushion.rotation.z = Math.PI / 2; cushion.position.set(-0.6, 0.7, 0); G.pulse.add(cushion);
    G.pulse.add(capsule([-2.4, 1.55, 0], [1.1, 1.55, 0], 0.36, skin));      // forearm along x, hand to +x
    const hand = blob([0.62, 0.16, 0.42], [1.85, 1.52, 0.05], skin); G.pulse.add(hand);
    for (let i = 0; i < 4; i++) G.pulse.add(capsule([2.35, 1.52, -0.25 + i * 0.16], [2.95, 1.5, -0.25 + i * 0.16], 0.065, skin));
    G.pulse.add(capsule([1.7, 1.52, 0.42], [2.2, 1.55, 0.72], 0.08, skin));  // thumb, on the +z side
    // the radial artery runs on the thumb side of the wrist, just under the skin
    const artM = new THREE.MeshStandardMaterial({ color: 0xd9434e, emissive: 0xd9434e, emissiveIntensity: 0.4, roughness: 0.4 });
    const artery = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 16), artM); artery.rotation.z = Math.PI / 2; artery.position.set(0.1, 1.86, 0.2); G.pulse.add(artery);
    const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), artM); G.pulse.add(bulge);
    const FX = [1.05, 0.65, 0.25], FD = ['vata', 'pitta', 'kapha'], FN = ['Index', 'Middle', 'Ring'];
    // the vaidya's hand reaches over from behind: palm above and behind the wrist, three fingertips down on the artery
    const vh = new THREE.Group(); G.pulse.add(vh);
    const fingers = FX.map((x, i) => { const f = new THREE.Group(); f.add(capsule([x, 2.02, 0.22], [x - 0.05, 2.35, -0.1], 0.085, skin2), capsule([x - 0.05, 2.35, -0.1], [x - 0.08, 2.6, -0.45], 0.09, skin2)); vh.add(f); return f; });
    vh.add(blob([0.62, 0.16, 0.42], [0.62, 2.72, -0.75], skin2));
    vh.add(capsule([0.1, 2.85, -1.1], [-0.6, 3.4, -2.6], 0.3, skin2));
    vh.add(capsule([1.15, 2.62, -0.55], [1.45, 2.3, 0.05], 0.09, skin2));   // the vaidya's thumb steadies the wrist
    const fL = FX.map((x, i) => L(`${FN[i]}: ${DOSHA[FD[i]].name}`, [x + (1 - i) * 0.9, 2.3 + (i === 1 ? 0.5 : 0.1), 0.8], FD[i], G.pulse));
    const pulseCT = canvasTexture(640, 300, drawPulse);
    const pb = board(pulseCT, 3.2, 1.5); pb.position.set(2.9, 3.4, -1.0); pb.rotation.y = -0.25; G.pulse.add(pb);

    // ---------------- kwatha: a clay pot on a flame
    const stove = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.35, 32), M.metal(0x3b3f47)); stove.position.set(0, 0.18, 0); G.kwatha.add(stove);
    const fireK = flame(0.9); fireK.position.set(0, 0.35, 0); G.kwatha.add(fireK);
    const POT = [[0, 0], [0.55, 0.05], [0.95, 0.25], [1.15, 0.7], [1.1, 1.2], [0.9, 1.6], [0.85, 1.75], [0.95, 1.85]];
    const potMesh = new THREE.Mesh(new THREE.LatheGeometry(POT.map(([r, y]) => new THREE.Vector2(r, y)), 48, 0, Math.PI * 1.45), new THREE.MeshStandardMaterial({ color: 0xa4552f, roughness: 0.8, side: THREE.DoubleSide }));
    potMesh.rotation.y = Math.PI * 0.3; potMesh.position.y = 0.95; G.kwatha.add(potMesh);
    const waterM = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, transparent: true, opacity: 0.85, roughness: 0.2 });
    const water = new THREE.Mesh(new THREE.BufferGeometry(), waterM); water.position.y = 0.95; G.kwatha.add(water);
    let waterLev = -1;
    // pot inner radius at height y (above the pot base), from the profile, for the water column
    const rAt = (y) => { for (let i = 1; i < POT.length; i++) if (y <= POT[i][1]) { const [r0, y0] = POT[i - 1], [r1, y1] = POT[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return 0.9; };
    // model volume: 320 mL fills to y = 1.35 above the base; the level for less water is found by integrating the profile
    const volTo = (y) => { let v = 0; for (let k = 0; k < 60; k++) { const yy = (k + 0.5) / 60 * y; v += Math.PI * rAt(yy) ** 2 * (y / 60); } return v; };
    const FULL = volTo(1.35);
    const levelFor = (frac) => { let lo = 0, hi = 1.35; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (volTo(m) / FULL < frac) lo = m; else hi = m; } return (lo + hi) / 2; };
    const herbs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.03, 0.05), M.matte(0x5a3a1a), 60); G.kwatha.add(herbs);
    const steam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false }), 40); steam.frustumCulled = false; G.kwatha.add(steam);
    const kwL = [L('Clay pot: 20 g herb + 320 mL water', [-1.6, 3.2, 0], 'gold', G.kwatha), L('Flame', [1.4, 0.4, 0.6], '#ffa06a', G.kwatha)];
    const levelMark = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 60), M.glow(0x6ee7a8)); levelMark.rotation.x = Math.PI / 2; G.kwatha.add(levelMark);
    const markL = L('Target level', [1.5, 1.2, 0], 'good', G.kwatha);

    // ---------------- routine: a day-and-season dial
    const clockCT = canvasTexture(900, 900, drawClock);
    const dial = board(clockCT, 5.2, 5.2); dial.position.set(0, 2.9, 0); G.routine.add(dial);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), M.glow(0xffd166)); G.routine.add(sun);
    let clockSig = '';

    // ---------------- panchakarma: a wooden droni (treatment table) with a stylised figure
    const wood = M.matte(0x7a4a2a);
    const table = new THREE.Group(); table.position.set(0, 0, 0); G.panchakarma.add(table);
    const top = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 1.6), wood); top.position.y = 1.2; table.add(top);
    [[-2.2, -0.6], [2.2, -0.6], [-2.2, 0.6], [2.2, 0.6]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 0.2), wood); l.position.set(x, 0.6, z); table.add(l); });
    const rimG = new THREE.BoxGeometry(5, 0.2, 0.1); [-0.78, 0.78].forEach((z) => { const r = new THREE.Mesh(rimG, wood); r.position.set(0, 1.38, z); table.add(r); });
    const lyM = new THREE.MeshStandardMaterial({ color: 0xd9a47e, roughness: 0.4, metalness: 0.1 });
    table.add(blob([0.34, 0.3, 0.3], [-2.0, 1.62, 0], lyM), capsule([-1.5, 1.6, 0], [0.3, 1.6, 0], 0.42, lyM), capsule([0.3, 1.52, 0.2], [2.1, 1.48, 0.2], 0.17, lyM), capsule([0.3, 1.52, -0.2], [2.1, 1.48, -0.2], 0.17, lyM));
    const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe0b040, roughness: 0.1, metalness: 0.2 }), 24); drops.frustumCulled = false; G.panchakarma.add(drops);
    const pkPos = [[-0.6, 2.6, 0.6], [0.8, 2.4, 0.9], [-1.8, 2.5, 0.8], [-0.6, 0.6, 1.4], [1.8, 1.0, 1.2], [-2.6, 2.1, 0.3], [1.6, 2.4, -0.4], [2.9, 2.6, 0]];
    const pkL = PK.map((p, i) => L(p.n, pkPos[i], i < 2 ? 'gold' : i === 7 ? 'good' : '#ffa06a', G.panchakarma));
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.45, depthWrite: false })); G.panchakarma.add(hl);
    const HL = [[-0.6, 1.9, 0], [-0.6, 1.9, 0], [-2.0, 1.75, 0.25], [-0.6, 1.75, 0.3], [0.3, 1.6, 0], [-2.2, 1.65, 0.2], [1.2, 1.65, 0.2], [0, 1.9, 0]];

    let t = 0, boilT = 0, boiling = false, st = decoct(0, 700, 0.25);
    const fit = fitNarrow(stage, NARROW.pulse);
    const sw = viewSwitcher(stage, VIEWS, NARROW);
    const o = new THREE.Object3D();
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t += dt;
        sw(s.show);
        Object.entries(G).forEach(([k, g]) => { g.visible = k === s.show; });
        const narrow = fit(), on = s.labels && !inReel();
        // pulse
        const ph = ((t * s.hr) / 60) % 1, p = pulseShape(ph);
        artery.scale.set(1, 1, 1); artery.scale.x = 1 + 0.35 * p; artery.scale.z = 1 + 0.35 * p;
        // the pressure wave travels from the elbow (-x) to the hand (+x) at a few metres a second; shown as a moving bulge
        bulge.position.set(lerp(-1.1, 1.3, (ph * 3) % 1), 1.86, 0.2); bulge.scale.setScalar(0.6 + 0.9 * p);
        fingers.forEach((f, i) => { f.position.y = 0.025 * pulseShape((ph - 0.02 * i + 1) % 1); });
        if (s.show === 'pulse') pulseCT.redraw({ hr: s.hr, t });
        fL.forEach((l) => { l.visible = on; });
        // kwatha: 1 s on screen = 60 s of heating (the video runs faster still)
        if (s._boil) { s._boil = false; boilT = 0; boiling = true; }
        if (boiling) boilT += dt * (s._fast ? 240 : 60);
        st = decoct(boilT, s.power, s.frac);
        if (st.done) boiling = false;
        fireK.set(0.5 + 0.7 * (s.power / 1200), 0.2, t);
        const frac = st.water / (KW.herb * KW.parts);
        const lev = Math.max(0.03, levelFor(frac) - 0.0), base = 0.95;
        if (Math.abs(lev - waterLev) > 0.004) {   // rebuild the water as a lathe that follows the pot's inside up to the level
          waterLev = lev; const prof = [new THREE.Vector2(0, 0.02)]; for (let k = 0; k <= 12; k++) { const y = 0.02 + (k / 12) * (lev - 0.02); prof.push(new THREE.Vector2(rAt(y) * 0.96, y)); } prof.push(new THREE.Vector2(0, lev));
          water.geometry.dispose(); water.geometry = new THREE.LatheGeometry(prof, 40); water.geometry.computeVertexNormals();
        }
        const tl = levelFor(s.frac); levelMark.scale.setScalar(rAt(tl)); levelMark.position.y = base + tl; markL.position.set(1.5, base + tl, 0);
        waterM.color.setHex(0x7aa0c8).lerp(new THREE.Color(0x7a4a1a), clamp(0.3 + (1 - frac) * 0.9, 0, 1));
        for (let i = 0; i < 60; i++) { const a = rnd(i) * 6.28, r = 0.6 * Math.sqrt(rnd(i + 3)); const bob = st.boil ? 0.08 * Math.sin(t * 9 + i) : 0; o.position.set(Math.cos(a) * r, base + Math.min(lev - 0.02, 0.05 + rnd(i + 9) * lev * 0.5 + bob), Math.sin(a) * r); o.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, 0); o.scale.setScalar(1); o.updateMatrix(); herbs.setMatrixAt(i, o.matrix); }
        herbs.instanceMatrix.needsUpdate = true;
        const sInt = st.boil ? 1 : st.T > 70 ? (st.T - 70) / 30 * 0.4 : 0;
        for (let i = 0; i < 40; i++) { const u = (t * 0.4 + rnd(i)) % 1; o.position.set((rnd(i + 2) - 0.5) * 1.2 + Math.sin(t + i) * 0.2 * u, base + 1.1 + u * 2.2, (rnd(i + 5) - 0.5) * 0.8); o.scale.setScalar(sInt * (0.4 + u * 0.8) + 0.0001); o.rotation.set(0, 0, 0); o.updateMatrix(); steam.setMatrixAt(i, o.matrix); }
        steam.instanceMatrix.needsUpdate = true;
        kwL.forEach((l) => { l.visible = on && !narrow; }); markL.visible = on;
        // routine
        const sig = s.hour.toFixed(2) + '|' + s.month.toFixed(2);
        if (s.show === 'routine' && sig !== clockSig) { clockSig = sig; clockCT.redraw({ hour: s.hour, month: s.month }); }
        const sa = (s.hour / 24) * Math.PI * 2 - Math.PI / 2; sun.position.set(Math.cos(sa) * 1.05, 2.9 - Math.sin(sa) * 1.05, 0.15);
        const night = s.hour < 6 || s.hour >= 18; sun.material.color.setHex(night ? 0xc9d4ff : 0xffd166); sun.scale.setScalar(night ? 0.7 : 1);
        // panchakarma: warm oil drips during snehana
        for (let i = 0; i < 24; i++) { const u = (t * 0.8 + rnd(i)) % 1; o.position.set(-1.2 + rnd(i + 1) * 2, 3.2 - u * 1.3, (rnd(i + 4) - 0.5) * 0.4); o.scale.setScalar(s.pk === 0 ? 1 : 0.0001); o.updateMatrix(); drops.setMatrixAt(i, o.matrix); }
        drops.instanceMatrix.needsUpdate = true;
        hl.position.set(...HL[s.pk]); hl.scale.setScalar(1 + 0.2 * Math.sin(t * 4));
        pkL.forEach((l, i) => { l.visible = on && i === s.pk; });
      },
      readout: (s) => {
        if (s.show === 'kwatha') {
          const m0 = KW.herb * KW.parts, eta = st.tTotal ?? decoct(1e9, s.power, s.frac).tTotal;
          const mm = (x) => `${Math.floor(x / 60)} min ${String(Math.round(x % 60)).padStart(2, '0')} s`;
          return `<div class="big">Kwatha: 1 part herb, 16 parts water</div><div class="row"><span>Heating time</span><b>${mm(Math.min(boilT, eta))}</b></div><div class="row"><span>Temperature</span><b>${Math.round(st.T)} °C</b></div><div class="row"><span>Water left</span><b>${Math.round(st.water)} of ${m0} mL</b></div><div class="row"><span>Whole job at ${Math.round(s.power)} W</span><b>about ${Math.round(eta / 60)} min</b></div><small>Warming needs 4.19 J per gram per °C; boiling away needs 2,257 J per gram. Press Boil to start.</small>`;
        }
        if (s.show === 'routine') {
          const hr = s.hour < 2 ? s.hour + 24 : s.hour, d = DAY.find(([a, b]) => hr >= a && hr < b) || DAY[0], r = RITU[Math.floor((((s.month - 0.5) + 12) % 12) / 2)];
          return `<div class="big">${DOSHA[d[2]].name} time, ${r.n} season</div><div class="row"><span>Routine</span><b>${d[3]}</b></div><div class="row"><span>Season</span><b>${r.en}, ${r.m}</b></div><div class="row"><span>The texts say</span><b>${r.note}</b></div><small>Dinacharya and ritucharya, Ashtanga Hridaya Sutrasthana 2–3. The 4-hour blocks are a common modern way to teach them.</small>`;
        }
        if (s.show === 'panchakarma') {
          const p = PK[s.pk];
          return `<div class="big">${p.n}</div><div class="row"><span>Stage</span><b>${p.stage}</b></div><div class="row"><span>What it is</span><b>${p.en}</b></div><small>Chosen and supervised by a qualified vaidya, usually over 1–3 weeks. Purging and vomiting can dehydrate, so it is not for home use. Evidence: chapter 5.</small>`;
        }
        return `<div class="big">Nadi pariksha</div><div class="row"><span>Heart rate</span><b>${Math.round(s.hr)} a minute</b></div><div class="row"><span>Fingers (tradition)</span><b>index vata, middle pitta, ring kapha</b></div><div class="row"><span>Gaits (later texts)</span><b>snake, frog, swan</b></div><small>What any doctor reads here: rate, rhythm and strength. A resting adult’s rate is usually 60–100.</small>`;
      },
    });
  },
};
