// Chapter 2: the ideas, exactly as Ayurveda describes them. Nothing here is anatomy or a lab
// measurement: every piece is labelled "as described in Ayurveda".
//  - Panchamahabhuta: everything, the body included, is made of five "great elements": space (akasha),
//    air (vayu), fire (agni/tejas), water (jala) and earth (prithvi) (Ch. Sa. 1; Su. Sa. 1).
//  - Tridosha: three doshas, each "made mainly of" two elements: vata = space + air, pitta = fire (+
//    water), kapha = water + earth (AH Su. 1.6; Su. Su. 21). Qualities (gunas) from Ch. Su. 1.59–61.
//    Balance of the doshas is health; imbalance is disease (Ch. Su. 9.4).
//  - Prakriti: each person's inborn mix of the doshas, fixed at conception; seven types (one, two
//    or all three doshas dominant) (Ch. Vi. 8.95–100; Su. Sa. 4.61–78). In practice it is assessed
//    by questionnaire and examination; CCRAS publishes a standard prakriti assessment scale. Studies
//    that look for links with genes or blood tests are small and early (e.g. Prasher et al., J Transl Med 6:48, 2008, CSIR-IGIB New Delhi;
//    Govindaraj et al., Sci Rep 5:15786, 2015, CCMB Hyderabad).
//  - Agni: the digestive "fire"; four states: sama (balanced), vishama (irregular, vata), tikshna
//    (sharp, pitta), manda (weak, kapha) (Ch. Vi. 6.12; AH Su. 8). Ama: undigested, "sticky" residue
//    of poor digestion, said to block the body's channels (srotas) and start disease (AH Su. 13.25).
//  - Seven dhatus, each nourished from the one before: rasa → rakta → mamsa → meda → asthi → majja →
//    shukra (Su. Su. 14.10). Sushruta describes this nourishment as taking about a month in all.
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { EL, DOSHA, DHATU, AGNI, tint, fitNarrow, compactReadout, inReel, viewSwitcher, board, panel, wrap, flame, seatedFigure, rnd, glowMat } from '../ayur.js';

const VIEWS = {
  elements: { pos: [-0.4, 5.8, 13.5], target: [-1.3, 4.7, 0] },
  prakriti: { pos: [-0.8, 4.4, 11.5], target: [-1.9, 3.2, 0] },
  agni: { pos: [-0.6, 5.6, 13.5], target: [-1.6, 4.6, 0] },
};
const NARROW = {
  elements: { pos: [0, 5.6, 11], target: [0, 4.4, 0] },
  prakriti: { pos: [0.6, 3.4, 9.5], target: [0.6, 2.8, 0] },
  agni: { pos: [0, 4.8, 10.5], target: [0, 4.2, 0] },
};
const DK = ['vata', 'pitta', 'kapha'];

// Prakriti type from the three shares, as the texts group it: one dominant, two dominant, or all three
// in balance (sama). Thresholds are ours, for the demo: a dosha "counts" if it is within 10 points of
// the biggest, and all three within 10 points is sama.
export function prakriti(v, p, k) {
  const sum = Math.max(1e-6, v + p + k), sh = [v / sum, p / sum, k / sum];
  const mx = Math.max(...sh), on = DK.filter((_, i) => sh[i] >= mx - 0.1);
  const name = on.length === 3 ? 'Sama (all three in balance)' : on.map((d) => DOSHA[d].name).join('–');
  return { sh, on, name };
}
const TRAITS = {
  vata: 'light build, quick and lively, variable appetite and sleep, feels the cold',
  pitta: 'medium build, warm, strong appetite, sharp and determined, dislikes heat',
  kapha: 'sturdy build, calm and steady, slow digestion, deep sleep, strong stamina',
};

function drawBanner(g, w, h) {
  panel(g, w, h, 0.8);
  g.fillStyle = '#ffd166'; g.font = 'bold 30px sans-serif'; g.fillText('AS DESCRIBED IN AYURVEDA', 28, 44);
  g.fillStyle = 'rgba(232,238,248,.8)'; g.font = '22px sans-serif'; g.fillText('The system’s own ideas, not structures seen in anatomy or lab tests.', 28, 80);
}
function drawTri(g, w, h, st = { sh: [0.5, 0.3, 0.2], name: '' }) {
  panel(g, w, h);
  g.fillStyle = '#e8eef8'; g.font = 'bold 26px sans-serif'; g.fillText('Your mix of the three doshas', 28, 42);
  const A = [w / 2, 130], B = [70, h - 50], C = [w - 70, h - 50];   // vata top, pitta left, kapha right
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.lineTo(...C); g.closePath(); g.stroke();
  const P = [A[0] * st.sh[0] + B[0] * st.sh[1] + C[0] * st.sh[2], A[1] * st.sh[0] + B[1] * st.sh[1] + C[1] * st.sh[2]];
  const grd = g.createRadialGradient(P[0], P[1], 2, P[0], P[1], 34); grd.addColorStop(0, 'rgba(255,255,255,.95)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(P[0], P[1], 34, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(P[0], P[1], 9, 0, 7); g.fill();
  g.font = 'bold 24px sans-serif';
  g.fillStyle = DOSHA.vata.css; g.fillText(`Vata ${Math.round(st.sh[0] * 100)}%`, A[0] - 60, A[1] - 14);
  g.fillStyle = DOSHA.pitta.css; g.fillText(`Pitta ${Math.round(st.sh[1] * 100)}%`, B[0] - 40, B[1] + 34);
  g.fillStyle = DOSHA.kapha.css; g.fillText(`Kapha ${Math.round(st.sh[2] * 100)}%`, C[0] - 100, C[1] + 34);
  g.fillStyle = '#ffd166'; g.font = 'bold 24px sans-serif'; g.fillText(st.name, 28, 76);
}

export default {
  id: 'doshas',
  short: 'Elements and doshas',
  title: 'Five elements, three doshas',
  subtitle: 'Panchamahabhuta, vata, pitta and kapha, prakriti, agni, the seven dhatus and ama, as Ayurveda describes them.',
  view: VIEWS.elements,
  learn: `<p>This chapter shows Ayurveda’s ideas <b>as Ayurveda describes them</b>. They are a way of organising what a vaidya sees, not parts you could find with a microscope. What experiments say comes later, in chapter 5.</p>
    <p>Everything, the classical texts say, is built from <b>five great elements</b> (panchamahabhuta): <b>space, air, fire, water and earth</b>. In the body they work as three <b>doshas</b>. <b>Vata</b> (space and air) moves things: breath, nerves, the gut. <b>Pitta</b> (fire and water) transforms: digestion, heat, sight. <b>Kapha</b> (water and earth) holds things together: bulk, joints, stamina. When the three are in balance you are healthy; when one builds up, illness follows.</p>
    <p>Everyone is born with their own mix, their <b>prakriti</b> or constitution. A "vata" person is described as light and quick, a "pitta" person as warm and sharp, a "kapha" person as sturdy and calm. Most people are a blend.</p>
    <p>At the centre sits <b>agni</b>, the digestive fire. Good agni turns food into <b>rasa</b>, which feeds the <b>seven dhatus</b> (tissues) one after another, from plasma and blood to bone and marrow. Weak agni leaves <b>ama</b>, a sticky undigested residue the texts blame for many illnesses. Compare how digestion really works in DigestionClear and StomachClear.</p>
    <p class="tip"><b>Try it:</b> push vata up and watch the point move in the triangle. Then set agni to "weak" and watch ama pile up at the base.</p>`,
  terms: [
    { t: 'Panchamahabhuta', d: 'The five great elements: space, air, fire, water and earth.' },
    { t: 'Dosha', d: 'One of three functional principles in the body: vata, pitta and kapha.' },
    { t: 'Vata', d: 'The dosha of movement, said to be made of space and air.' },
    { t: 'Pitta', d: 'The dosha of transformation and heat, said to be made of fire and water.' },
    { t: 'Kapha', d: 'The dosha of structure and lubrication, said to be made of water and earth.' },
    { t: 'Prakriti', d: 'A person’s inborn constitution: their own mix of the three doshas.' },
    { t: 'Agni', d: 'The "digestive fire" that transforms food.' },
    { t: 'Dhatu', d: 'One of seven body tissues, each nourished by the one before.' },
    { t: 'Ama', d: 'Undigested, sticky residue of weak digestion, in Ayurvedic theory.' },
  ],
  defaults: { show: 'elements', dosha: 'vata', v: 50, p: 30, k: 20, agni: 'sama', labels: true },
  controls: [
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'elements', label: 'Elements to doshas' }, { v: 'prakriti', label: 'Prakriti' }, { v: 'agni', label: 'Agni and dhatus' }] },
    { key: 'dosha', type: 'seg', label: 'Look at a dosha', options: DK.map((d) => ({ v: d, label: DOSHA[d].name })), fmt: (v) => DOSHA[v].els.map((e) => EL[e].en).join(' + ') },
    { key: 'v', type: 'range', label: 'Vata in your mix', min: 0, max: 100, step: 1, fmt: (v) => Math.round(v) },
    { key: 'p', type: 'range', label: 'Pitta in your mix', min: 0, max: 100, step: 1, fmt: (v) => Math.round(v) },
    { key: 'k', type: 'range', label: 'Kapha in your mix', min: 0, max: 100, step: 1, fmt: (v) => Math.round(v) },
    { key: 'agni', type: 'seg', label: 'Agni (digestive fire)', options: Object.entries(AGNI).map(([v, a]) => ({ v, label: a.name })), fmt: (v) => AGNI[v].en },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) {
    if (key === 'dosha') s.show = 'elements';
    if (key === 'v' || key === 'p' || key === 'k') s.show = 'prakriti';
    if (key === 'agni') s.show = 'agni';
  },
  quiz: [
    { q: 'In Ayurveda, which two elements make up vata?', options: ['Fire and water', 'Water and earth', 'Space and air', 'Earth and fire'], answer: 2, why: 'Vata is described as space and air, which is why it is linked to movement, lightness and dryness.' },
    { q: 'What is prakriti?', options: ['A herbal medicine', 'A person’s inborn mix of the three doshas', 'A kind of massage', 'A blood test'], answer: 1, why: 'Prakriti is your constitution, the mix of vata, pitta and kapha you are said to be born with.' },
    { q: 'According to Ayurveda, what does weak agni leave behind?', options: ['Ama, a sticky undigested residue', 'Extra blood', 'Pure rasa', 'Nothing at all'], answer: 0, why: 'The texts say weak digestive fire leaves ama, which is said to clog the body’s channels.' },
  ],
  reel: [
    { ms: 5400, caption: 'Ayurveda says everything is made of five elements: space, air, fire, water and earth.', set: { show: 'elements', dosha: 'vata', labels: false }, view: { pos: [0, 4.2, 10.5], target: [0, 2.9, 0] }, spin: 0 },
    { ms: 5400, caption: 'In the body they act as three doshas: vata moves, pitta transforms, kapha holds together.', set: { show: 'prakriti', v: 70, p: 20, k: 10, labels: false }, anim: { v: [70, 20], k: [10, 60] }, view: { pos: [0, 3.2, 9], target: [0.6, 2.0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { elements: new THREE.Group(), prakriti: new THREE.Group(), agni: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, c, parent = root) => tint(stage.label(h, p, parent), c);
    const banner = board(canvasTexture(800, 100, drawBanner), 5.6, 0.7);
    root.add(banner);

    // ---------------- elements → doshas
    const EK = Object.keys(EL);
    const EX = (i) => -3.8 + i * 1.9;
    const elObjs = EK.map((k, i) => {
      const g = new THREE.Group(); g.position.set(EX(i), 4.0, 0); G.elements.add(g);
      const c = EL[k].col;
      let m;
      if (k === 'akasha') m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.8 }));
      else if (k === 'vayu') m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.32, 0.06, 80, 8, 2, 3), glowMat(c, 0.6));
      else if (k === 'agni') { m = flame(0.7); m.position.y = -0.4; }
      else if (k === 'jala') { m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.05, transmission: 0.5, transparent: true, opacity: 0.85, clearcoat: 1 })); m.scale.set(1, 1.2, 1); }
      else m = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), M.matte(c));
      g.add(m);
      const lab = L(`${EL[k].name}: ${EL[k].en}`, [0, 0.95, 0], EL[k].css, g);
      return { k, g, m, lab };
    });
    const DX = { vata: -2.9, pitta: 0, kapha: 2.9 };
    const doshaObjs = DK.map((d) => {
      const g = new THREE.Group(); g.position.set(DX[d], 1.3, 0); G.elements.add(g);
      const mat = new THREE.MeshStandardMaterial({ color: DOSHA[d].col, transparent: true, opacity: 0.28, roughness: 0.2, emissive: DOSHA[d].col, emissiveIntensity: 0.3, depthWrite: false });
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 24), mat); g.add(shell);
      // a swirl of motes in the colours of its two elements
      const motes = DOSHA[d].els.map((e) => { const s = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), M.glow(EL[e].col), 24); g.add(s); return s; });
      const lab = L(`${DOSHA[d].name}`, [0, -1.25, 0], d, g);
      const links = DOSHA[d].els.map((e) => {
        const a = new THREE.Vector3(EX(EK.indexOf(e)), 3.5, 0), b = new THREE.Vector3(DX[d], 2.2, 0);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, a.distanceTo(b), 8), M.glow(EL[e].col, { transparent: true, opacity: 0.5 }));
        m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); G.elements.add(m);
        return m;
      });
      return { d, g, mat, motes, lab, links };
    });

    // ---------------- prakriti: a seated figure with three bands whose size follows your mix
    const skin = new THREE.MeshStandardMaterial({ color: 0xd9a47e, transparent: true, opacity: 0.35, roughness: 0.6, depthWrite: false });
    const fig = seatedFigure(skin); fig.position.set(-1.2, 0, 0); G.prakriti.add(fig);
    const mat3 = DK.map((d) => new THREE.MeshStandardMaterial({ color: DOSHA[d].col, emissive: DOSHA[d].col, emissiveIntensity: 0.5, transparent: true, opacity: 0.55, depthWrite: false }));
    // each band sits at its dosha's main seat: vata below the navel, pitta between navel and heart, kapha in the chest and head
    const BY = [0.75, 1.35, 2.15];
    const bands = DK.map((d, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 10, 80), mat3[i]); m.position.set(-1.2, BY[i], 0); m.rotation.x = Math.PI / 2; G.prakriti.add(m); return m; });
    const bandL = DK.map((d, i) => L(`${DOSHA[d].name}: ${DOSHA[d].seat}`, [-3.6, BY[i], 0], d, G.prakriti));
    const triCT = canvasTexture(560, 520, drawTri);
    let triSig = '';
    const tri = board(triCT, 3.4, 3.16); tri.position.set(2.6, 1.9, 0); G.prakriti.add(tri);

    // ---------------- agni and the seven dhatus
    const hearth = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.3, 48), M.matte(0x3a2f2a)); hearth.position.set(-0.6, 0.15, 0); G.agni.add(hearth);
    const fire = flame(1.1); fire.position.set(-0.6, 0.3, 0); G.agni.add(fire);
    const DCOL = [0xffe6a8, 0xd9434e, 0xe07a7a, 0xf2d27a, 0xe8e2d0, 0xc9a7ff, 0x8ef0ff];
    const dMats = DCOL.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.2, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    const DY = (i) => 1.9 + i * 0.72;
    const rings = DHATU.map((dh, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.08, 10, 60), dMats[i]); m.rotation.x = Math.PI / 2; m.position.set(-0.6, DY(i), 0); G.agni.add(m); return m; });
    const ringL = DHATU.map((dh, i) => L(`${i + 1}. ${dh.name}: ${dh.en}`, [1.6, DY(i), 0], '#' + DCOL[i].toString(16).padStart(6, '0'), G.agni));
    const NP = 150;
    const parts = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), NP);
    parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); parts.frustumCulled = false; G.agni.add(parts);
    const ph = Array.from({ length: NP }, (_, i) => rnd(i + 1)), ama = new Array(NP).fill(false), cyc = new Array(NP).fill(-1);
    const o = new THREE.Object3D(), col = new THREE.Color(), grey = new THREE.Color(0x77706a), food = new THREE.Color(0xc8e07a);
    const amaL = L('Ama: undigested residue', [-2.8, 0.6, 0.6], 'muted', G.agni);
    const foodL = L('Food in', [-3.0, 1.6, 0], 'leaf', G.agni);

    const tagL = L('As described in Ayurveda', [0, -0.35, 1.2], 'gold');
    let t = 0, amaLevel = 0;
    const fit = fitNarrow(stage, NARROW.elements);
    const sw = viewSwitcher(stage, VIEWS, NARROW);
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt); t = time;
        sw(s.show);
        Object.entries(G).forEach(([k, g]) => { g.visible = k === s.show; });
        const narrow = fit(), on = s.labels && !inReel();
        banner.position.set(s.show === 'elements' ? 0 : s.show === 'agni' ? -4.2 : 0.4, s.show === 'agni' ? 2.4 : 0.05, s.show === 'agni' ? 0 : 1.5); banner.rotation.x = -0.35;
        tagL.visible = false;
        // elements
        const hot = DOSHA[s.dosha].els;
        elObjs.forEach((e, i) => {
          const h = hot.includes(e.k);
          e.g.scale.setScalar(h ? 1.18 + 0.04 * Math.sin(t * 3) : 0.9);
          if (e.k === 'agni') e.m.set(1, 0.3, t); else e.m.rotation.y = t * (0.4 + 0.1 * i);
          e.lab.visible = on && (h || !narrow); e.lab.element.style.opacity = h ? '1' : '0.6';
        });
        doshaObjs.forEach((d, j) => {
          const h = d.d === s.dosha;
          d.mat.emissiveIntensity = h ? 0.7 + 0.2 * Math.sin(t * 3) : 0.15; d.mat.opacity = h ? 0.4 : 0.18;
          d.links.forEach((l) => { l.material.opacity = h ? 0.9 : 0.15; });
          // motes: vata swirl fast and loose, pitta churn, kapha slow and settled
          const sp = [2.4, 1.4, 0.45][j], spread = [0.75, 0.6, 0.45][j];
          d.motes.forEach((m, a) => { for (let i = 0; i < 24; i++) { const q = i * 2.39996 + a * 1.3, ang = q + t * sp * (1 + 0.3 * rnd(i + a * 40)); const r = spread * Math.sqrt((i + 0.5) / 24); const y = (rnd(i * 3 + a) - 0.5) * 1.2 * spread + (j === 2 ? -0.25 : j === 0 ? 0.15 * Math.sin(t * 3 + i) : 0); o.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r); o.scale.setScalar(1); o.updateMatrix(); m.setMatrixAt(i, o.matrix); } m.instanceMatrix.needsUpdate = true; });
          d.lab.visible = on;
        });
        // prakriti
        const pr = prakriti(s.v, s.p, s.k);
        bands.forEach((b, i) => { const k = pr.sh[i]; b.scale.setScalar(0.6 + 1.0 * k); mat3[i].emissiveIntensity = 0.25 + 1.2 * k; b.rotation.z = t * (0.6 - i * 0.2); b.position.y = BY[i] + 0.05 * Math.sin(t * (3 - i) + i); });
        bandL.forEach((l) => { l.visible = on && !narrow; });
        const sig = pr.sh.map((x) => x.toFixed(3)).join(); if (sig !== triSig) { triSig = sig; triCT.redraw({ sh: pr.sh, name: 'Prakriti: ' + pr.name }); }
        // agni: particles of food rise past the fire, turn into rasa, and climb the dhatus
        const A = AGNI[s.agni];
        fire.set(A.strength, A.flicker, t);
        const speed = s.agni === 'tikshna' ? 0.34 : s.agni === 'manda' ? 0.12 : 0.2;
        let amaCount = 0;
        for (let i = 0; i < NP; i++) {
          ph[i] += dt * speed * (0.8 + 0.4 * rnd(i + 7));
          const c = Math.floor(ph[i]);
          if (c !== cyc[i]) {
            cyc[i] = c;
            // chance of becoming ama in this pass, from how well the fire burns at this moment
            const k = A.strength * (1 + A.flicker * 0.9 * Math.sin(t * 1.7 + i));
            const pAma = clamp(1 - k, 0, 0.85) * 0.9 + (s.agni === 'vishama' ? 0.12 : 0) + (s.agni === 'tikshna' ? 0.02 : 0);
            ama[i] = rnd(i * 13 + c * 7.1) < pAma;
          }
          const u = ph[i] - c;
          const a = i * 2.39996 + t * 0.6;
          if (u < 0.12) { const k = u / 0.12; o.position.set(lerp(-3.2, -0.6 + Math.cos(a) * 0.3, k), lerp(1.4, 0.75, k), Math.sin(a) * 0.3 * k); col.copy(food); }
          else if (ama[i]) {
            amaCount++;
            // ama settles in a sticky heap beside the hearth
            const r = 0.2 + 0.5 * Math.sqrt(rnd(i + 3)), b = rnd(i + 11) * 6.28;
            o.position.set(-2.4 + Math.cos(b) * r, 0.12 + 0.35 * (1 - r) * (0.4 + 0.6 * rnd(i + 5)), 0.6 + Math.sin(b) * r * 0.6); col.copy(grey);
          } else {
            const k = (u - 0.12) / 0.88, y = lerp(0.9, DY(6) + 0.3, k), di = clamp(Math.floor((y - 1.55) / 0.72), 0, 6);
            const rr = 0.95 + 0.08 * Math.sin(i);
            o.position.set(-0.6 + Math.cos(a + k * 6) * rr, y, Math.sin(a + k * 6) * rr);
            col.setHex(DCOL[di]);
            if (s.agni === 'tikshna' && k > 0.6 && rnd(i + 99) < 0.35) col.setHex(0xff6a3a);   // "burns" the tissues, in the texts
          }
          o.scale.setScalar(1); o.updateMatrix(); parts.setMatrixAt(i, o.matrix); parts.setColorAt(i, col);
        }
        parts.instanceMatrix.needsUpdate = true; if (parts.instanceColor) parts.instanceColor.needsUpdate = true;
        amaLevel = amaCount / NP;
        dMats.forEach((m, i) => { m.emissiveIntensity = 0.1 + 0.9 * (1 - amaLevel) * (0.7 + 0.3 * Math.sin(t * 2 - i * 0.6)); });
        ringL.forEach((l) => { l.visible = on && !narrow; });
        amaL.visible = on && amaLevel > 0.1; foodL.visible = on && !narrow;
      },
      readout: (s) => {
        const head = '<small style="color:#ffd166">As described in Ayurveda</small>';
        if (s.show === 'prakriti') {
          const pr = prakriti(s.v, s.p, s.k);
          return `${head}<div class="big">Prakriti: ${pr.name}</div>${DK.map((d, i) => `<div class="row"><span>${DOSHA[d].name}</span><b>${Math.round(pr.sh[i] * 100)}%</b></div>`).join('')}<small>Described traits: ${pr.on.map((d) => TRAITS[d]).join('; ')}. Tests of prakriti are questionnaires; links to genes are still early research.</small>`;
        }
        if (s.show === 'agni') {
          const A = AGNI[s.agni];
          return `${head}<div class="big">${A.name} agni: ${A.en}</div><div class="row"><span>The texts say</span><b>${A.text}</b></div><div class="row"><span>Turned to ama (this model)</span><b>${Math.round(amaLevel * 100)}%</b></div><small>Rasa nourishes the seven dhatus in turn. Real digestion is in DigestionClear.</small>`;
        }
        const D = DOSHA[s.dosha];
        return `${head}<div class="big">${D.name}: ${D.els.map((e) => EL[e].en).join(' + ')}</div><div class="row"><span>Does</span><b>${D.does}</b></div><div class="row"><span>Qualities (gunas)</span><b>${D.gunas}</b></div><small>From Charaka Samhita and Ashtanga Hridaya, Sutrasthana 1.</small>`;
      },
    });
  },
};
