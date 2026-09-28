// Chapter 1: where Ayurveda comes from. A 3,500-year timeline in which each classical text is a
// palm-leaf manuscript standing over a glowing bar. The bar's length is the honest range of dates
// scholars give, because most of these texts grew in layers and cannot be dated to one year. Then
// the eight branches (Ashtanga Ayurveda) as eight leaves round a lamp, and Ayurveda in India today.
// Sources and numbers:
//  - Atharvaveda: healing hymns and plant charms; usually dated to about 1200–900 BCE, with wide
//    uncertainty. Ayurveda is traditionally called an upaveda (auxiliary) of it (Britannica
//    "Ayurveda"; Wujastyk, The Roots of Ayurveda, 2003). Some historians (Zysk, Asceticism and
//    Healing in Ancient India, 1991) link Ayurveda's systematic ideas more to later ascetic and
//    Buddhist circles, from the middle of the 1st millennium BCE.
//  - Charaka Samhita: 8 sections (sthanas), 120 chapters; compiled "likely between 100 BCE and 200 CE";
//    revised and completed by Dridhabala, c. 5th–6th century CE (Meulenbeld, A History of Indian
//    Medical Literature, 1999–2002, via Wikipedia "Charaka Samhita").
//  - Sushruta Samhita: 186 chapters in six books; "several historical layers" from the last
//    centuries BCE, completed c. 300–500 CE (Meulenbeld); famous for surgery and a cheek-flap
//    rhinoplasty; translated into Arabic in Baghdad in the 8th century (Wikipedia "Sushruta Samhita").
//  - Ashtanga Hridaya by Vagbhata, c. 7th century CE (c. 600 CE), a verse synthesis of both.
//  - Sharangadhara Samhita, c. 13th–14th century: earliest clear account of pulse diagnosis (nadi
//    pariksha), which is not described as a method in Charaka or Sushruta.
//  - Bhavaprakasha by Bhavamishra, 16th century: adds new plants and "phiranga roga" (syphilis).
//  - 1835: the Native Medical Institution (1822) and the Ayurveda and Unani classes at Calcutta's
//    Sanskrit College and Madrasa were closed by order of 28 January 1835 (Banglapedia "Calcutta
//    Medical College").
//  - Indian Medicine Central Council Act 1970 → Central Council of Indian Medicine (1971–2021);
//    NCISM Act (assent 20 Sept 2020; in force 11 June 2021) (India Code; ncismindia.org).
//  - Department of ISM&H (March 1995) → Department of AYUSH (Nov 2003) → Ministry of AYUSH (9 Nov
//    2014); nearly 8 lakh AYUSH practitioners registered in 2015, over 90% in Ayurveda or homeopathy
//    (Ministry of AYUSH, via Wikipedia "Ministry of Ayush"). CCRAS: from CCRIMH (1969), split 1978.
//  - BAMS: 4½ years of study plus a 1-year internship (NCISM minimum standards).
//  - NSS 79th round, first all-India survey on AYUSH (July 2022–June 2023, 1,81,298 households):
//    about 46% of rural and 53% of urban people used AYUSH for prevention or treatment in the past
//    365 days; Ayurveda was the most used system (MoSPI press note and PIB release, 13 June 2024).
//  - WHO Global Centre for Traditional Medicine, Jamnagar: agreement 25 March 2022, ground-breaking
//    19 April 2022, backed by US$250 million from India (WHO news release, 25 March 2022).
import { THREE, M, clamp } from '../kit.js';
import { tint, fitNarrow, compactReadout, inReel, viewSwitcher, pothi, flame, leafGeo, board, panel, wrap, glowMat } from '../ayur.js';
import { canvasTexture } from '../kit.js';

const X0 = -8, X1 = 8;
// A stretched time axis (like a map with a zoomed-in inset): early centuries are squeezed so the
// crowded recent past gets room. Breakpoints [year, x]; the tick labels show the real years.
const BRK = [[-1500, -8], [0, -3.5], [1000, 1], [1800, 4.5], [2030, 8]];
const yx = (y) => { for (let i = 1; i < BRK.length; i++) if (y <= BRK[i][0] || i === BRK.length - 1) { const [a, xa] = BRK[i - 1], [b, xb] = BRK[i]; return xa + ((y - a) / (b - a)) * (xb - xa); } return 0; };
const fmtY = (y) => (y < 0 ? `${-Math.round(y)} BCE` : `${Math.round(y)} CE`);

// Timeline items: [from, to] is the range of dates scholars give. `book` items get a manuscript.
const TL = [
  { id: 'veda', ly: 1.7, from: -1200, to: -900, z: 0, title: 'Healing hymns of the Atharvaveda', date: 'c. 1200–900 BCE (dates debated)', col: 0xc9a7ff, text: 'Charms and prayers against fever, cough and snakebite, with healing plants. Ayurveda calls itself an offshoot (upaveda) of the Vedas; historians see the roots as older and more mixed.' },
  { id: 'charaka', ly: 1.9, from: -100, to: 200, late: 550, z: -1.1, book: 0xe2c98f, title: 'Charaka Samhita', date: 'compiled c. 100 BCE–200 CE; revised by Dridhabala c. 500 CE', col: 0xffd166, text: 'The great text of internal medicine: 120 chapters on the doshas, diet, diagnosis, medicines and how to train a good physician.' },
  { id: 'sushruta', ly: 0.95, from: -200, to: 500, z: 1.1, book: 0xd6b47a, title: 'Sushruta Samhita', date: 'layers from the last centuries BCE to c. 300–500 CE', col: 0xff9a6a, text: 'The surgery text: 186 chapters, over 100 instruments, and the first written account of rebuilding a nose with a flap of cheek skin.' },
  { id: 'vagbhata', ly: 1.45, from: 560, to: 660, z: 0, book: 0xcfb07a, title: 'Ashtanga Hridaya, by Vagbhata', date: 'c. 7th century CE', col: 0x6ee7a8, text: 'A clear verse summary of Charaka and Sushruta. Still the main textbook in Kerala and widely taught today.' },
  { id: 'sharangadhara', ly: 1.2, from: 1250, to: 1400, z: 0, book: 0xd9c08a, title: 'Sharangadhara Samhita', date: 'c. 13th–14th century', col: 0x8ef0ff, text: 'Standard recipes for medicines, and the earliest clear account of reading the pulse (nadi pariksha).' },
  { id: 'colonial', ly: 2.0, from: 1835, to: 1835, z: 0, title: 'Colonial decline, then revival', date: '1835: Calcutta classes closed', col: 0xff8a8a, text: 'The British closed the Ayurveda and Unani classes in Calcutta in 1835 and taught only Western medicine. Vaidyas kept practising, and colleges and the All India Ayurvedic Congress (1907) revived it.' },
  { id: 'act', ly: 1.35, from: 1970, to: 1970, z: -0.8, title: 'The Indian Medicine Central Council Act', date: '1970', col: 0x9db4ff, text: 'Set national standards for Ayurveda, Siddha and Unani colleges and a register of qualified practitioners.' },
  { id: 'ministry', ly: 2.5, from: 2014, to: 2014, z: 0.8, title: 'Ministry of AYUSH', date: '1995 department, 2003 AYUSH, 2014 ministry', col: 0x6ee7a8, text: 'India made Ayurveda, Yoga, Unani, Siddha, Sowa-Rigpa and Homoeopathy a full ministry, with research councils and a regulator (NCISM, 2020).' },
];

const BRANCH = [
  { n: 'Kayachikitsa', en: 'internal medicine', today: 'like general medicine' },
  { n: 'Kaumarabhritya', en: 'care of children and mothers', today: 'like paediatrics and obstetrics' },
  { n: 'Shalya tantra', en: 'surgery', today: 'like surgery' },
  { n: 'Shalakya tantra', en: 'eyes, ears, nose, throat, head', today: 'like ENT and eye care' },
  { n: 'Bhuta vidya', en: 'disorders blamed on unseen forces', today: 'now taught as mental health' },
  { n: 'Agada tantra', en: 'poisons and bites', today: 'like toxicology' },
  { n: 'Rasayana', en: 'rejuvenation and long life', today: 'like care of ageing' },
  { n: 'Vajikarana', en: 'fertility and healthy offspring', today: 'like reproductive health' },
];

const VIEWS = {
  timeline: { pos: [0.8, 4.8, 15.5], target: [0.2, 3.1, 0] },
  branches: { pos: [-1.2, 9.5, 8.5], target: [-2.0, 1.2, 0] },
  today: { pos: [-0.6, 3.4, 11.5], target: [-1.6, 2.8, 0] },
};
const NARROW = {
  timeline: { pos: [-1.5, 3.4, 11], target: [-1.5, 1.4, 0] },
  branches: { pos: [0, 8, 7], target: [0, 0.6, 0] },
  today: { pos: [0, 3, 10], target: [0, 2.9, 0] },
};

function nearest(year) {
  let best = TL[0], bd = 1e9;
  // Outside every range: the closest range wins. Inside overlapping ranges: the closest middle wins.
  TL.forEach((t) => { const d = (year < t.from ? t.from - year : year > (t.late ?? t.to) ? year - (t.late ?? t.to) : 0) * 1000 + Math.abs(year - (t.from + t.to) / 2); if (d < bd) { bd = d; best = t; } });
  return best;
}

function drawToday(g, w, h) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 34px sans-serif'; g.fillText('Ayurveda in India today', 36, 56);
  const rows = [
    ['#6ee7a8', 'Ministry of AYUSH (2014)', 'Runs Ayurveda, Yoga, Unani, Siddha, Sowa-Rigpa and Homoeopathy.'],
    ['#ffd166', 'NCISM (2020)', 'Regulator: sets college standards and keeps the register of practitioners.'],
    ['#9db4ff', 'CCRAS', 'Research council: runs clinical studies, drug standards and plant surveys.'],
    ['#ffa06a', 'BAMS degree', '4½ years of study plus a 1-year internship, anatomy and physiology included.'],
    ['#c9a7ff', 'WHO centre, Jamnagar (2022)', 'The World Health Organization’s global centre for traditional medicine.'],
  ];
  let y = 108;
  rows.forEach(([c, a, b]) => {
    g.fillStyle = c; g.fillRect(36, y - 22, 10, 56);
    g.font = 'bold 26px sans-serif'; g.fillText(a, 62, y);
    g.fillStyle = 'rgba(232,238,248,.75)'; g.font = '22px sans-serif'; y = wrap(g, b, 62, y + 30, w - 100, 28) + 26;
  });
  g.fillStyle = 'rgba(232,238,248,.55)'; g.font = '20px sans-serif';
  g.fillText('NSS 2022–23: about half of Indians used AYUSH in the past year.', 36, h - 28);
}

export default {
  id: 'roots',
  short: 'Roots and texts',
  title: 'Three old books and a living system',
  subtitle: 'The Charaka and Sushruta Samhitas, Vagbhata’s Ashtanga Hridaya, the eight branches, and Ayurveda in India today.',
  view: VIEWS.timeline,
  learn: `<p><b>Ayurveda</b> means "knowledge (veda) of life (ayus)". It is India’s best-known traditional system of medicine, and millions of families use it alongside modern medicine. This box explains it the way it explains itself first. Chapters 4 and 5 then look, separately, at what scientific tests have found.</p>
    <p>Its ideas were collected in Sanskrit texts copied for centuries on <b>palm leaves</b>. The <b>Charaka Samhita</b> covers internal medicine. The <b>Sushruta Samhita</b> is famous for surgery, including rebuilding a nose with skin from the cheek. Vagbhata’s <b>Ashtanga Hridaya</b> (about the 7th century CE) summed both up in verse.</p>
    <p>Nobody can date these books to one year. They grew in <b>layers</b>, added to by many hands. That is why each glowing bar is long: it shows the range historians give. Claims that they are many thousands of years old are not supported by the evidence.</p>
    <p>Classical Ayurveda has <b>eight branches</b> (Ashtanga), from internal medicine and surgery to children’s health and poisons. Today India has a <b>Ministry of AYUSH</b>, a regulator (<b>NCISM</b>), a research council (<b>CCRAS</b>) and a 5½-year <b>BAMS</b> degree. Its sister systems have their own boxes: see UnaniClear, SiddhaClear, HomeopathyClear, NaturopathyClear and MedicineClear.</p>
    <p class="tip"><b>Try it:</b> drag the year slider through time and watch each manuscript open. Then switch to the eight branches.</p>`,
  terms: [
    { t: 'Ayurveda', d: '"Knowledge of life": India’s classical system of medicine, written down in Sanskrit texts.' },
    { t: 'Samhita', d: 'A compiled text or collection, like the Charaka Samhita.' },
    { t: 'Vaidya', d: 'A practitioner of Ayurveda.' },
    { t: 'Ashtanga', d: 'The "eight limbs": Ayurveda’s eight classical branches.' },
    { t: 'AYUSH', d: 'Ayurveda, Yoga and Naturopathy, Unani, Siddha, Sowa-Rigpa and Homoeopathy: India’s ministry for them.' },
    { t: 'BAMS', d: 'Bachelor of Ayurvedic Medicine and Surgery, the degree for a registered Ayurvedic doctor.' },
    { t: 'NCISM', d: 'National Commission for Indian System of Medicine, the regulator since 2020–21.' },
  ],
  defaults: { show: 'timeline', year: 0, branch: 0, labels: true },
  controls: [
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'timeline', label: 'The texts' }, { v: 'branches', label: 'Eight branches' }, { v: 'today', label: 'India today' }] },
    { key: 'year', type: 'range', label: 'Travel through time', min: -1400, max: 2025, step: 5, ends: ['1400 BCE', '2025'], fmt: (v) => fmtY(v) },
    { key: 'branch', type: 'range', label: 'Branch', min: 0, max: 7, step: 1, fmt: (v) => BRANCH[v].n },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) { if (key === 'year' || key === 'action') s.show = 'timeline'; if (key === 'branch') s.show = 'branches'; },
  quiz: [
    { q: 'What does the word "Ayurveda" mean?', options: ['Medicine of plants', 'Knowledge of life', 'The five elements', 'Healing by fire'], answer: 1, why: 'Ayus means life and veda means knowledge.' },
    { q: 'Why are the bars for the Charaka and Sushruta Samhitas so long?', options: ['They took 700 years to print', 'They grew in layers, so historians give a range of dates', 'They were lost and found again', 'Each bar is one author’s life'], answer: 1, why: 'The texts were compiled, added to and revised by many hands, so scholars date them to ranges, not single years.' },
    { q: 'Which classical text is famous for surgery?', options: ['Charaka Samhita', 'Sushruta Samhita', 'Atharvaveda', 'Bhavaprakasha'], answer: 1, why: 'The Sushruta Samhita describes surgical instruments and operations, including rebuilding a nose.' },
  ],
  reel: [
    { ms: 5000, caption: 'Ayurveda\'s great texts, the Charaka and Sushruta Samhitas, grew in layers about 2,000 years ago.', set: { show: 'timeline', year: 0, labels: false }, anim: { year: [-300, 650] }, view: { pos: [-2.0, 3.4, 8.5], target: [-2.2, 0.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { timeline: new THREE.Group(), branches: new THREE.Group(), today: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);

    // ---------------- the timeline
    const rail = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 0.6, 0.08, 0.2), M.matte(0x3a4152)); rail.position.set(0, 0.04, 0); G.timeline.add(rail);
    const ticks = [];
    for (const y of [-1500, -1000, -500, 0, 500, 1000, 1500, 1800, 1900, 2000]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 3), M.ghost(0x8a93a8, 0.35)); t.position.set(yx(y), 0.02, 0); G.timeline.add(t);
      ticks.push(L(y === 0 ? '0' : fmtY(y), [yx(y), 0, 1.9], 'muted', G.timeline));
    }
    const items = TL.map((it) => {
      const x0 = yx(it.from), x1 = yx(it.to), w = Math.max(0.12, x1 - x0);
      const mat = glowMat(it.col, 0.6, 0.85);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.34), mat); bar.position.set((x0 + x1) / 2, 0.15, it.z); G.timeline.add(bar);
      let late = null;
      if (it.late) { late = new THREE.Mesh(new THREE.BoxGeometry(yx(it.late) - x1, 0.08, 0.2), glowMat(it.col, 0.3, 0.35)); late.position.set((x1 + yx(it.late)) / 2, 0.13, it.z); G.timeline.add(late); }
      let book = null, post = null;
      if (it.book) { book = pothi(it.book, 1.5, 12); book.position.set((x0 + x1) / 2 - 0.3, 0.25, it.z); G.timeline.add(book); }
      else { post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), glowMat(it.col, 0.5)); post.scale.y = it.ly / 1.3; post.position.set((x0 + x1) / 2, it.ly / 2, it.z); G.timeline.add(post); }
      const lab = L(it.title, [(x0 + x1) / 2, it.ly, it.z], '#' + it.col.toString(16).padStart(6, '0'), G.timeline);
      return { it, bar, mat, book, post, lab };
    });
    const marker = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 10, 32), M.glow(0xffffff)); marker.rotation.x = Math.PI / 2; G.timeline.add(marker);
    const markerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 8), M.ghost(0xffffff, 0.5)); G.timeline.add(markerPin);

    // ---------------- the eight branches: eight leaves round a lamp
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.1, 0.25, 64), M.matte(0x2a2f3c)); base.position.y = 0.12; G.branches.add(base);
    const diya = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.matte(0xa0522d, { side: THREE.DoubleSide })); diya.position.y = 0.72; G.branches.add(diya);
    const fl = flame(0.9); fl.position.y = 0.72; G.branches.add(fl);
    const lg = leafGeo(2.0, 0.55, 0.25);
    const leaves = BRANCH.map((b, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const piv = new THREE.Group(); piv.position.set(Math.sin(a) * 0.7, 0.3, Math.cos(a) * 0.7); piv.rotation.y = a;
      const mat = new THREE.MeshStandardMaterial({ color: 0x5aa04a, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x6ee7a8, emissiveIntensity: 0 });
      const m = new THREE.Mesh(lg, mat); m.rotation.x = Math.PI / 2 - 0.25; piv.add(m); m.castShadow = true;
      G.branches.add(piv);
      const lab = L(b.n, [Math.sin(a) * 3.4, 0.5, Math.cos(a) * 3.4], 'leaf', G.branches);
      return { piv, mat, lab, b };
    });

    // ---------------- India today: a board, and the 5½ years of a BAMS degree as steps
    const ct = canvasTexture(900, 700, drawToday);
    const bd = board(ct, 5.0, 3.89); bd.position.set(1.6, 2.4, -0.4); G.today.add(bd);
    const stepM = [0x9db4ff, 0x9db4ff, 0x9db4ff, 0x9db4ff, 0x9db4ff, 0x6ee7a8];
    const steps = stepM.map((c, i) => { const w = i < 4 ? 0.9 : i === 4 ? 0.45 : 0.9; const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3 * (i + 1), 0.8), glowMat(c, 0.25)); b.position.set(-4.6 + i * 0.85, 0.15 * (i + 1), 1.4); b.scale.x = w / 0.9; G.today.add(b); return b; });
    const stepL = [L('BAMS: 4½ years of study', [-3.4, -0.3, 1.4], 'blue', G.today), L('+ 1-year internship', [-0.4, 2.2, 1.4], 'good', G.today)];

    const tag = L('Dates are ranges: the texts grew in layers', [0, -0.2, 2.8], 'gold', G.timeline);
    let t = 0;
    const fit = fitNarrow(stage, NARROW.timeline);
    const sw = viewSwitcher(stage, VIEWS, NARROW);
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t = time;
        sw(s.show);
        Object.entries(G).forEach(([k, g]) => { g.visible = k === s.show; });
        const narrow = fit(), on = s.labels && !inReel();
        // timeline
        const cur = nearest(s.year);
        marker.position.set(yx(s.year), 0.2, 0); markerPin.position.set(yx(s.year), 1.2, 0);
        items.forEach((o) => {
          const hot = o.it === cur;
          o.mat.emissiveIntensity = hot ? 1.0 + 0.3 * Math.sin(t * 4) : 0.35;
          if (o.book) { const k = o.book.userData.k = (o.book.userData.k ?? 0) + ((hot ? 1 : 0) - (o.book.userData.k ?? 0)) * Math.min(1, dt * 4); o.book.setOpen(k); }
          o.lab.visible = on && (hot || !narrow);
          o.lab.element.style.opacity = hot ? '1' : '0.55';
        });
        ticks.forEach((l) => { l.visible = on && !narrow; });
        tag.visible = on;
        // branches
        fl.set(1, 0.1, t);
        leaves.forEach((o, i) => { const hot = i === s.branch; o.mat.emissiveIntensity = hot ? 0.55 : 0.02; o.piv.position.y = 0.3 + (hot ? 0.25 + 0.05 * Math.sin(t * 3) : 0); o.lab.visible = on && (hot || !narrow); o.lab.element.style.opacity = hot ? '1' : '0.5'; o.lab.element.textContent = hot ? `${o.b.n}: ${o.b.en}` : o.b.n; });
        stepL.forEach((l) => { l.visible = on && !narrow; });
      },
      readout: (s) => {
        if (s.show === 'branches') {
          const b = BRANCH[s.branch];
          return `<div class="big">${b.n}</div><div class="row"><span>Branch</span><b>${s.branch + 1} of 8</b></div><div class="row"><span>What it covers</span><b>${b.en}</b></div><div class="row"><span>Closest modern field</span><b>${b.today}</b></div><small>The eight branches (Ashtanga Ayurveda) as listed in the Sushruta and Charaka Samhitas.</small>`;
        }
        if (s.show === 'today') return `<div class="big">A recognised system in India</div><div class="row"><span>Ministry of AYUSH</span><b>since 2014</b></div><div class="row"><span>Regulator</span><b>NCISM (2020 Act)</b></div><div class="row"><span>Research council</span><b>CCRAS</b></div><div class="row"><span>Used AYUSH in the past year</span><b>46% rural, 53% urban (2022–23)</b></div><div class="row"><span>Most-used AYUSH system</span><b>Ayurveda</b></div><small>Official recognition sets training and licensing standards. It is not the same as proof that every treatment works: see chapter 5.</small>`;
        const c = nearest(s.year);
        return `<div class="big">${c.title}</div><div class="row"><span>When</span><b>${c.date}</b></div><small>${c.text}</small>`;
      },
    });
  },
};
