// Chapter 6: using it wisely. Where Ayurveda's lifestyle advice overlaps with modern health advice,
// the safety rules that matter whatever you use, and the integrative-medicine debate, stated fairly.
// No treatment or dosing advice; "see a qualified doctor" throughout.
// Sources:
//  - Dinacharya: AH Su. 2 (waking early, cleaning teeth and tongue, oil massage, exercise "to half
//    one's strength", AH Su. 2.10–11); Ch. Vi. 2.3 (fill the stomach one third with food, one third
//    with liquid, and leave one third empty).
//  - Diet: ICMR-National Institute of Nutrition, Dietary Guidelines for Indians (2024): a varied diet
//    with vegetables and fruits making up about half the plate, whole grains and pulses, less salt,
//    sugar and ultra-processed food.
//  - Activity: WHO guidelines on physical activity (2020): 5–17 year-olds at least 60 minutes a day of
//    moderate-to-vigorous activity; adults 150–300 minutes a week.
//  - Sleep: teenagers 8–10 hours (American Academy of Sleep Medicine, Paruthi et al., J Clin Sleep Med
//    12:785, 2016).
//  - Yoga: small to moderate benefit for chronic low back pain, low-to-moderate certainty (Cochrane,
//    Wieland et al., 2022); the Ministry of AYUSH's Common Yoga Protocol (International Day of Yoga).
//  - Oil pulling (gandusha): small, mostly Indian trials suggest less plaque and gum inflammation;
//    evidence is low quality and it does not replace brushing (Shanbhag, J Tradit Complement Med
//    7:106, 2017, review). Abhyanga (oil massage): relaxing; little evidence for other claims.
//  - Safety rules: NCCIH "Ayurvedic medicine: in depth"; Ministry of AYUSH "Ayush Suraksha" portal for
//    reporting side effects; licence numbers on AYUSH drug labels (Drugs and Cosmetics Rules, rule 161);
//    the Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 bans advertising cures for
//    listed diseases such as diabetes and cancer; registration of BAMS practitioners with NCISM and
//    state boards.
//  - Integration: WHO Traditional Medicine Strategy 2014–2023 (safe, effective traditional medicine
//    within health systems); AYUSH doctors co-located at primary health centres under the National
//    Health Mission ("mainstreaming of AYUSH", MoHFW); AYUSH Health and Wellness Centres (Ayushman
//    Arogya Mandirs). Concerns: the Nov 2020 CCIM regulation allowing Ayurveda postgraduates in
//    surgery (Shalya, Shalakya) to perform 58 listed procedures, opposed by the Indian Medical
//    Association as "mixopathy"; misleading advertising (Supreme Court of India, IMA v Union of India,
//    2024); patients delaying effective treatment for serious disease.
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { tint, fitNarrow, compactReadout, inReel, viewSwitcher, board, panel, wrap, seatedFigure, capsule, blob, rnd, glowMat } from '../ayur.js';

const TAG = { yes: ['#6ee7a8', 'Fits modern advice'], some: ['#ffd166', 'Some evidence'], weak: ['#ff8a8a', 'Little evidence'] };
const HABITS = [
  { n: 'Regular sleep, early to bed', ay: 'Sleep at night, rise early (dinacharya)', ev: 'Teens need 8–10 hours; a regular schedule helps', tag: 'yes', obj: 'moon' },
  { n: 'Fresh, mostly plant food', ay: 'Fresh, warm, home-cooked food suited to you', ev: 'ICMR-NIN: vegetables and fruit about half the plate', tag: 'yes', obj: 'thali' },
  { n: 'Don’t overeat', ay: 'A third food, a third liquid, a third empty (Charaka)', ev: 'Eating slowly and stopping when full helps weight', tag: 'yes', obj: 'thali' },
  { n: 'Daily exercise', ay: 'Exercise to half your strength (Vagbhata)', ev: 'WHO: at least 60 minutes a day for 5–17 year-olds', tag: 'yes', obj: 'figure' },
  { n: 'Yoga and breathing', ay: 'Part of a healthy routine', ev: 'Helps back pain and stress a little in trials', tag: 'some', obj: 'figure' },
  { n: 'Oil pulling, tongue scraping', ay: 'Swish oil, scrape the tongue each morning', ev: 'Small trials only; never instead of brushing', tag: 'weak', obj: 'glass' },
  { n: 'Oil massage (abhyanga)', ay: 'Daily oil massage for strength and skin', ev: 'Relaxing; other claims untested', tag: 'weak', obj: 'glass' },
];
const RULES = [
  ['#ff8a8a', 'Never stop or change a prescribed medicine without your doctor.'],
  ['#ffd166', 'Tell every doctor and pharmacist about every herb or supplement you take.'],
  ['#ff8a8a', 'Chest pain, breathlessness, high fever, injury, diabetes, TB or cancer: see a qualified doctor at once.'],
  ['#9db4ff', 'Buy licensed products (licence number on the label). "Cures diabetes" ads are illegal in India.'],
  ['#c9a7ff', 'Extra care in pregnancy, for children, and with metal-based (rasa shastra) medicines.'],
  ['#6ee7a8', 'Check your vaidya is registered, and report side effects to Ayush Suraksha.'],
];
const DEBATE = {
  for: ['Many families already use both, by choice', 'Focus on lifestyle and prevention', 'Low cost, available in villages', 'AYUSH doctors at many health centres', 'WHO backs safe, tested traditional medicine'],
  against: ['Evidence for many treatments is weak', '"Mixopathy": training in one system, practising another', 'Delay in effective care can be dangerous', 'Quality and metal contamination', 'Misleading "cure" advertising'],
};

function drawHabits(g, w, h, st = { i: 0 }) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 26px sans-serif'; g.fillText('Ayurveda says  →  what modern evidence says', 24, 40);
  let y = 84;
  HABITS.forEach((x, i) => {
    const on = i === st.i, [c, lab] = TAG[x.tag];
    if (on) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(12, y - 28, w - 24, 50); }
    g.fillStyle = on ? '#ffffff' : 'rgba(232,238,248,.75)'; g.font = (on ? 'bold ' : '') + '22px sans-serif'; g.fillText(x.n, 24, y);
    g.fillStyle = c; g.font = 'bold 18px sans-serif'; const tw = g.measureText(lab).width;
    g.globalAlpha = 0.18; g.fillRect(w - tw - 44, y - 20, tw + 20, 28); g.globalAlpha = 1; g.fillText(lab, w - tw - 34, y);
    y += 52;
  });
}
function drawRules(g, w, h) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 28px sans-serif'; g.fillText('Six rules, whatever medicine you use', 24, 42);
  let y = 88;
  RULES.forEach(([c, t], i) => { g.fillStyle = c; g.beginPath(); g.arc(34, y - 8, 12, 0, 7); g.fill(); g.fillStyle = '#0a0c12'; g.font = 'bold 16px sans-serif'; g.fillText(String(i + 1), 29, y - 2); g.fillStyle = '#e8eef8'; g.font = '21px sans-serif'; y = wrap(g, t, 58, y, w - 80, 26) + 14; });
}
function drawDebate(g, w, h) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 28px sans-serif'; g.fillText('Integrative medicine: the debate', 24, 42);
  const col = (x, title, c, items) => { g.fillStyle = c; g.font = 'bold 22px sans-serif'; g.fillText(title, x, 86); let y = 124; g.fillStyle = 'rgba(232,238,248,.85)'; g.font = '19px sans-serif'; items.forEach((t) => { y = wrap(g, '• ' + t, x, y, w / 2 - 40, 24) + 8; }); };
  col(24, 'Supporters say', '#6ee7a8', DEBATE.for); col(w / 2 + 8, 'Critics worry', '#ffa06a', DEBATE.against);
}

export default {
  id: 'wisely',
  short: 'Using it wisely',
  title: 'Using it wisely',
  subtitle: 'Where Ayurveda’s routine overlaps with modern health advice, the safety rules that always apply, and the integrative-medicine debate.',
  view: { pos: [0.6, 5.2, 10.5], target: [-1.0, 2.6, 0] },
  learn: `<p>Some of Ayurveda’s everyday advice matches what modern research recommends: <b>regular sleep</b>, <b>fresh, mostly plant-based food</b>, <b>not overeating</b> and <b>daily exercise</b>. India’s own nutrition institute (ICMR-NIN) says vegetables and fruit should fill about half your plate, and the WHO asks 5–17 year-olds for an hour of activity a day. Yoga has some evidence for back pain and stress. Other habits, like oil pulling, are pleasant but little tested.</p>
    <p>Whatever you use, a few rules keep you safe. <b>Never stop a prescribed medicine</b> on your own. <b>Tell every doctor</b> what herbs or supplements you take, because they can interact. For anything serious or sudden, like chest pain, breathlessness, a high fever, diabetes, TB or cancer, <b>see a qualified doctor</b> straight away. Buy licensed products, be wary of "miracle cure" claims, and take extra care in pregnancy, for children and with metal-based medicines.</p>
    <p>Should Ayurveda and modern medicine work together? Supporters point to choice, prevention, low cost and AYUSH doctors already in many health centres. Critics worry about weak evidence, practitioners working outside their training ("mixopathy"), and delays in effective care. Both sides agree on one thing: <b>fair tests</b> should decide what works. Compare the other systems in UnaniClear, SiddhaClear, HomeopathyClear, NaturopathyClear and MedicineClear.</p>
    <p class="tip"><b>Try it:</b> step through the habits and see which ones modern evidence supports. Then read the six rules.</p>`,
  terms: [
    { t: 'Lifestyle medicine', d: 'Using sleep, diet, activity and stress control to prevent and manage illness.' },
    { t: 'Integrative medicine', d: 'Combining conventional medicine with traditional or complementary care.' },
    { t: 'Herb–drug interaction', d: 'When a herb changes how a medicine works, making it stronger, weaker or harmful.' },
    { t: 'Mixopathy', d: 'A critics’ word for practising a system you were not trained in.' },
    { t: 'Ayush Suraksha', d: 'India’s portal for reporting side effects of AYUSH medicines.' },
  ],
  defaults: { show: 'habits', habit: 0, labels: true },
  controls: [
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'habits', label: 'Habits that overlap' }, { v: 'rules', label: 'Safety rules' }, { v: 'debate', label: 'The debate' }] },
    { key: 'habit', type: 'range', label: 'Habit', min: 0, max: HABITS.length - 1, step: 1, fmt: (v) => HABITS[v].n },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) { if (key === 'habit') s.show = 'habits'; },
  quiz: [
    { q: 'You are taking a medicine from your doctor and want to try an Ayurvedic herb. What should you do?', options: ['Stop the medicine and switch', 'Take both without telling anyone', 'Tell your doctor (and the vaidya) everything you take', 'Double the herb dose'], answer: 2, why: 'Herbs can interact with medicines. Never stop a prescribed medicine yourself, and tell every doctor what you take.' },
    { q: 'Which Ayurvedic habit fits modern health advice best?', options: ['Oil pulling instead of brushing', 'Regular sleep and daily exercise', 'Metal-based tonics for children', 'Skipping all meals'], answer: 1, why: 'Regular sleep and daily activity are strongly supported. Oil pulling is little tested and never replaces brushing.' },
    { q: 'What do supporters and critics of integrative medicine agree on?', options: ['Nothing at all', 'That fair tests should decide what works', 'That all herbs are safe', 'That doctors should never talk to vaidyas'], answer: 1, why: 'Whatever their views, both sides accept that well-run trials are the way to find out what helps and what harms.' },
  ],
  reel: [
    { ms: 5400, caption: 'Never stop a prescribed medicine, tell every doctor what you take, and see a qualified doctor for serious illness.', set: { show: 'rules', labels: false }, view: { pos: [0.2, 3.6, 8.5], target: [0.2, 2.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { habits: new THREE.Group(), rules: new THREE.Group(), debate: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);

    // ---------------- habits: a thali, a person on a yoga mat, the moon, a glass
    const steel = M.metal(0xc8ccd4, { roughness: 0.25 });
    const thali = new THREE.Group(); thali.position.set(-2.4, 0.9, 1.0); G.habits.add(thali);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.12, 48), M.matte(0x6b4a30)); table.position.set(-2.4, 0.8, 1.0); G.habits.add(table);
    [[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), M.matte(0x6b4a30)); l.position.set(-2.4 + x, 0.4, 1.0 + z); G.habits.add(l); });
    thali.add(new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.2, 0.06, 64), steel));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.04, 8, 64), steel); rim.rotation.x = Math.PI / 2; rim.position.y = 0.04; thali.add(rim);
    const katori = (x, z, col) => { const k = new THREE.Group(); k.position.set(x, 0.05, z); k.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.18, 32, 1, true), M.metal(0xc8ccd4, { side: THREE.DoubleSide }))); const f = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 32), M.matte(col)); f.position.y = 0.06; k.add(f); thali.add(k); return k; };
    katori(-0.6, -0.55, 0xe8b830); katori(0.05, -0.75, 0x4a8a3a); katori(0.7, -0.5, 0xf4f0e6); katori(0.8, 0.2, 0x9a4a2a);
    const rice = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.matte(0xf6f2ea)); rice.scale.y = 0.6; rice.position.set(-0.35, 0.03, 0.35); thali.add(rice);
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), M.matte(0xd8b070)); r.position.set(0.35, 0.05 + i * 0.025, 0.55); r.rotation.z = 0.08 * i; thali.add(r); }
    for (let i = 0; i < 8; i++) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.matte([0xd94a3a, 0x6ab04a, 0xf0e0a0][i % 3])); v.position.set(-0.85 + rnd(i) * 0.3, 0.07, 0.05 + rnd(i + 3) * 0.35); thali.add(v); }
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.4), M.matte(0x3a7a9a)); mat.position.set(1.4, 0.02, 0.6); G.habits.add(mat);
    const figM = new THREE.MeshStandardMaterial({ color: 0xd9a47e, roughness: 0.6, emissive: 0x6ee7a8, emissiveIntensity: 0 });
    const fig = seatedFigure(figM); fig.scale.setScalar(0.75); fig.position.set(1.4, 0.04, 0.5); G.habits.add(fig);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 16), new THREE.MeshStandardMaterial({ color: 0xdfe6ff, emissive: 0x8ea0ff, emissiveIntensity: 0.2 })); moon.position.set(-0.6, 4.4, -1.8); G.habits.add(moon);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.55, 24), M.clear(0xcfe8ff, 0.35)); glass.position.set(-0.5, 1.15, 1.2); G.habits.add(glass);
    const oil = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.25, 24), new THREE.MeshStandardMaterial({ color: 0xe0b040, transparent: true, opacity: 0.8 })); oil.position.set(-0.5, 1.02, 1.2); G.habits.add(oil);
    const hct = canvasTexture(760, 460, drawHabits);
    const hb = board(hct, 4.4, 2.66); hb.position.set(2.0, 3.6, -2.0); G.habits.add(hb);
    const hl = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 60), M.glow(0xffd166)); hl.rotation.x = Math.PI / 2; G.habits.add(hl);
    const OBJ = { thali: [[-2.4, 0.95, 1.0], 1.45], figure: [[1.4, 0.06, 0.6], 1.1], moon: [[-0.6, 3.8, -1.8], 0.7], glass: [[-0.5, 0.95, 1.2], 0.4] };
    const hL = L('', [0, 0, 0], 'gold', G.habits);

    // ---------------- rules: a medicine box and the six rules
    const rb = board(canvasTexture(760, 560, drawRules), 4.2, 3.1); rb.position.set(1.3, 2.3, -0.6); G.rules.add(rb);
    const boxM = M.plastic(0xf4f4f4);
    const medbox = new THREE.Group(); medbox.position.set(-2.9, 0, 1.0); G.rules.add(medbox);
    const mb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.9), boxM); mb.position.y = 0.4; medbox.add(mb);
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), M.glow(0x2fbf71)); cross1.position.set(0, 0.45, 0.46); medbox.add(cross1);
    const cross2 = cross1.clone(); cross2.rotation.z = Math.PI / 2; medbox.add(cross2);
    const bottleA = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 20), M.plastic(0xd98a3a)); bottleA.position.set(-2.2, 0.25, 1.9); G.rules.add(bottleA);
    const bottleB = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 20), M.plastic(0x5a8a4a)); bottleB.position.set(-3.6, 0.2, 2.0); G.rules.add(bottleB);
    const rL = [L('Your prescribed medicines', [-2.9, 1.2, 1.0], 'good', G.rules), L('Herbs and supplements: tell your doctor', [-2.9, 0.8, 2.4], 'gold', G.rules)];

    // ---------------- debate: a balanced pair of scales
    const scale = new THREE.Group(); scale.position.set(-1.8, 0, 0.8); G.debate.add(scale);
    const brass = M.metal(0xc9a24a, { roughness: 0.3 });
    scale.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.15, 32), brass));
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 16), brass); post.position.y = 1.35; scale.add(post);
    const beamG = new THREE.Group(); beamG.position.y = 2.65; scale.add(beamG);
    const beamM = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.08), brass); beamG.add(beamM);
    const pans = [-1.4, 1.4].map((x, i) => {
      const p = new THREE.Group(); p.position.set(x, 0, 0); beamG.add(p);
      [0, 2.1, 4.2].forEach((a) => { const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), M.matte(0x999999)); str.position.set(Math.cos(a) * 0.25, -0.6, Math.sin(a) * 0.25); str.rotation.z = Math.cos(a) * 0.2; str.rotation.x = -Math.sin(a) * 0.2; p.add(str); });
      const dish = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 8, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4), M.metal(0xc9a24a, { side: THREE.DoubleSide })); dish.position.y = -0.7; p.add(dish);
      for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.22), glowMat(i ? 0xffa06a : 0x6ee7a8, 0.35)); b.position.set(-0.2 + (k % 3) * 0.2, -1.1 + 0.12 + Math.floor(k / 3) * 0.15, (k % 2) * 0.1 - 0.05); p.add(b); }
      return p;
    });
    const db = board(canvasTexture(760, 460, drawDebate), 4.2, 2.55); db.position.set(2.0, 2.3, -1.0); G.debate.add(db);
    const dL = [L('Supporters', [-3.2, 0.9, 0.8], 'good', G.debate), L('Critics', [-0.4, 0.9, 0.8], '#ffa06a', G.debate), L('Both: let fair tests decide', [-1.8, 3.2, 0.8], 'gold', G.debate)];

    let t = 0;
    const VIEWS = { habits: { pos: [0.6, 5.2, 10.5], target: [-1.0, 2.6, 0] }, rules: { pos: [0.4, 3.2, 8.0], target: [-0.9, 2.3, 0] }, debate: { pos: [0.4, 3.4, 8.2], target: [-0.9, 2.3, 0] } };
    const NV = { habits: { pos: [0, 4.4, 9.5], target: [-0.4, 2.6, 0] }, rules: { pos: [0, 3, 8], target: [0.6, 2.6, 0] }, debate: { pos: [0, 3.2, 8.5], target: [0, 2.6, 0] } };
    const sw = viewSwitcher(stage, VIEWS, NV);
    const fit = fitNarrow(stage, NV.habits);
    let hsig = -1;
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t += dt;
        sw(s.show);
        Object.entries(G).forEach(([k, g]) => { g.visible = k === s.show; });
        const narrow = fit(), on = s.labels && !inReel();
        const hi = Math.round(s.habit), H = HABITS[hi];
        if (hi !== hsig) { hsig = hi; hct.redraw({ i: hi }); }
        const [p, r] = OBJ[H.obj]; hl.position.set(...p); hl.scale.setScalar(r * (1 + 0.05 * Math.sin(t * 4)));
        figM.emissiveIntensity = H.obj === 'figure' ? 0.25 : 0;
        moon.material.emissiveIntensity = H.obj === 'moon' ? 0.8 : 0.15;
        hL.element.textContent = H.n; hL.position.set(p[0], p[1] + (H.obj === 'moon' ? 1.1 : 1.6), p[2]); hL.visible = on;
        fig.rotation.y = 0.15 * Math.sin(t * 0.5);
        rL.forEach((l) => { l.visible = on && !narrow; });
        // the scales settle level: a gentle wobble that dies away
        beamG.rotation.z = 0.08 * Math.sin(t * 1.3) * Math.exp(-((t % 12) / 4));
        pans.forEach((pp) => { pp.rotation.z = -beamG.rotation.z; });
        dL.forEach((l) => { l.visible = on && !narrow; });
      },
      readout: (s) => {
        if (s.show === 'rules') return `<div class="big">Safe use, whatever you choose</div><div class="row"><span>Prescribed medicines</span><b>never stop them yourself</b></div><div class="row"><span>Every doctor</span><b>tell them all you take</b></div><div class="row"><span>Serious illness</span><b>see a qualified doctor now</b></div><small>This box explains; it cannot advise you. For your own health, see a qualified doctor.</small>`;
        if (s.show === 'debate') return `<div class="big">Working together?</div><div class="row"><span>Supporters stress</span><b>choice, prevention, access</b></div><div class="row"><span>Critics stress</span><b>evidence, training, safety</b></div><small>India places AYUSH doctors in many public health centres. The WHO backs traditional medicine that is proven safe and effective.</small>`;
        const H = HABITS[Math.round(s.habit)], [c, lab] = TAG[H.tag];
        return `<div class="big">${H.n}</div><div class="row"><span>Ayurveda says</span><b>${H.ay}</b></div><div class="row"><span>Evidence says</span><b>${H.ev}</b></div><div class="row"><span>Verdict</span><b style="color:${c}">${lab}</b></div>`;
      },
    });
  },
};
