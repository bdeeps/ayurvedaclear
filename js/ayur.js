// AyurvedaClear's shared pieces: colours for the five elements and three doshas, the system's own
// definitions (kept in one place so every chapter describes them the same way), label and layout
// helpers, canvas boards, and simple models: palm-leaf manuscripts, leaves and plants, a flame, a
// clay pot, and a clearly stylised seated figure.
//
// Fairness rule for the whole box (series brief, section E): chapters 1–3 describe Ayurveda in its
// own terms, and say so ("as described in Ayurveda"). Chapters 4–5 say, separately and with sources,
// what the scientific evidence shows. Nothing here is treatment or dosing advice.
//
// Classical sources for the definitions below:
//  - Charaka Samhita, Sutrasthana 1.57–61 (the three doshas and their qualities, gunas); 26.10–11 (the
//    five mahabhutas); Sharirasthana 4 and Vimanasthana 8.95–100 (prakriti, constitution);
//  - Sushruta Samhita, Sutrasthana 14–15 (the dhatus, each nourishing the next; doshas, dhatus and
//    malas as the roots of the body);
//  - Ashtanga Hridaya (Vagbhata), Sutrasthana 1.6–8 (doshas and their "seats" and times), 1.13 (the
//    seven dhatus), 3 (ritucharya, the six seasons), 2 (dinacharya, the daily routine), 12.1–3.
//  Translations consulted: P.V. Sharma (Charaka), K.L. Bhishagratna (Sushruta), K.R.S. Murthy
//  (Ashtanga Hridaya); summaries in Britannica "Ayurveda", and Wujastyk, "The Roots of Ayurveda"
//  (Penguin, 2003).
import { THREE, clamp, lerp } from './kit.js';

// ---------------------------------------------------------------- colours
export const EL = {
  akasha: { name: 'Akasha', en: 'space', col: 0xc9a7ff, css: '#c9a7ff' },
  vayu: { name: 'Vayu', en: 'air', col: 0x8ef0ff, css: '#8ef0ff' },
  agni: { name: 'Agni (tejas)', en: 'fire', col: 0xff7a45, css: '#ff9a6a' },
  jala: { name: 'Jala', en: 'water', col: 0x5b9dff, css: '#8ab4ff' },
  prithvi: { name: 'Prithvi', en: 'earth', col: 0xc8a060, css: '#e0bd7a' },
};
// The three doshas as the classical texts define them: the two elements each is "made of", what it
// does, and the qualities (gunas) Charaka lists for it (Ch. Su. 1.59–61).
export const DOSHA = {
  vata: { name: 'Vata', els: ['akasha', 'vayu'], col: 0x8ecbff, css: '#9ecfff', does: 'movement: breathing, the heartbeat, nerves, moving food and waste', gunas: 'dry, light, cold, rough, subtle, moving', seat: 'below the navel (the colon)' },
  pitta: { name: 'Pitta', els: ['agni', 'jala'], col: 0xff8a4c, css: '#ffa06a', does: 'transformation: digestion, body heat, vision, sharp thinking', gunas: 'slightly oily, sharp, hot, light, flowing, liquid', seat: 'between the navel and the heart' },
  kapha: { name: 'Kapha', els: ['jala', 'prithvi'], col: 0x6ee7a8, css: '#6ee7a8', does: 'structure and lubrication: bulk, joints, stamina, calm', gunas: 'heavy, cold, soft, oily, sweet, steady, slimy', seat: 'above the heart (the chest and head)' },
};
// The seven dhatus (body tissues) in the order in which, as the texts describe it, each is nourished
// by the one before (Su. Su. 14.10; AH Su. 1.13). Modern-sounding glosses are the usual translations.
export const DHATU = [
  { name: 'Rasa', en: 'plasma, the nourishing fluid' },
  { name: 'Rakta', en: 'blood' },
  { name: 'Mamsa', en: 'muscle' },
  { name: 'Meda', en: 'fat' },
  { name: 'Asthi', en: 'bone' },
  { name: 'Majja', en: 'marrow and nerve tissue' },
  { name: 'Shukra', en: 'reproductive tissue' },
];
// The four states of digestive fire (agni) in the texts (AH Su. 8; Ch. Vi. 6.12), each linked to a dosha.
export const AGNI = {
  sama: { name: 'Sama', en: 'balanced', dosha: null, strength: 1, flicker: 0.05, text: 'balanced: food is digested fully and on time' },
  vishama: { name: 'Vishama', en: 'irregular', dosha: 'vata', strength: 0.7, flicker: 0.9, text: 'irregular: sometimes strong, sometimes weak (linked to vata)' },
  tikshna: { name: 'Tikshna', en: 'sharp', dosha: 'pitta', strength: 1.5, flicker: 0.15, text: 'sharp: very strong, hungry often (linked to pitta)' },
  manda: { name: 'Manda', en: 'weak', dosha: 'kapha', strength: 0.4, flicker: 0.05, text: 'weak: slow, heavy digestion (linked to kapha)' },
};

// ---------------------------------------------------------------- label and layout helpers
const TINT = { vata: '#9ecfff', pitta: '#ffa06a', kapha: '#6ee7a8', gold: '#ffd166', good: '#6ee7a8', bad: '#ff8a8a', blue: '#9db4ff', purple: '#c9a7ff', side: '#8ef0ff', muted: '#a8b0c0', leaf: '#9be08a' };
export function tint(l, cls) { const c = TINT[cls] || cls; if (c && c[0] === '#') { l.element.style.borderColor = c; l.element.style.color = c; } return l; }
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage the readout covers the upper left: re-centre once, unless orbited.
export function fitNarrow(stage, view) {
  let done = false;
  return () => {
    const narrow = stage.host.clientWidth < 560;
    if (narrow && !done && !stage.moved && !inReel()) { stage.setView(view.pos, view.target, 0.01); done = true; }
    return narrow;
  };
}
// On phones keep only the readout's headline and two rows.
export function compactReadout(stage, api) {
  const full = api.readout;
  if (!full) return api;
  api.readout = (s) => {
    const html = full(s);
    if (stage.host.clientWidth >= 560 || !html) return html;
    let rows = 0;
    return html.replace(/<small>[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (++rows <= 2 ? m : ''));
  };
  return api;
}
// Re-frame the camera when a chapter's "show" switch changes (not on the first frame, and not in the
// video, where each scene sets its own view).
export function viewSwitcher(stage, views, fitView) {
  let last = null;
  return (key) => {
    if (key === last) return;
    const first = last === null; last = key;
    if (first || inReel()) return;
    const v = stage.host.clientWidth < 560 && fitView?.[key] ? fitView[key] : views[key];
    if (v) stage.setView(v.pos, v.target, 0.9);
  };
}

// ---------------------------------------------------------------- canvas boards
export function board(ct, w, h) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
}
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function panel(g, w, h, a = 0.88) { g.clearRect(0, 0, w, h); g.fillStyle = `rgba(10,12,18,${a})`; rrect(g, 0, 0, w, h, 20); g.fill(); }
// Wrap text into lines that fit maxW; returns the y after the last line.
export function wrap(g, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = t;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// A tiny seeded generator, so simulations replay the same way in the video.
export function prng(seed = 1) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- geometry helpers
export const V = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(...p));
export function capsule(a, b, r, mat) {
  const A = V(a), B = V(b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  m.castShadow = true;
  return m;
}
export function blob(r, pos, mat, seg = 32) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), mat);
  m.scale.set(...r); m.position.set(...pos); m.castShadow = true;
  return m;
}
export const glowMat = (c, ei = 0.45, op = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: ei, transparent: op < 1, opacity: op, depthWrite: op >= 1 });

// A leaf blade (in the XY plane, pointing +Y, base at the origin), gently curved.
export function leafGeo(len = 1, wid = 0.35, bend = 0.15) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.bezierCurveTo(wid, len * 0.25, wid * 0.9, len * 0.7, 0, len);
  sh.bezierCurveTo(-wid * 0.9, len * 0.7, -wid, len * 0.25, 0, 0);
  const g = new THREE.ShapeGeometry(sh, 10);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / len, x = p.getX(i) / wid; p.setZ(i, bend * len * y * y - 0.08 * len * x * x); }
  g.computeVertexNormals();
  return g;
}

// A palm-leaf manuscript (pothi): a stack of long narrow leaves between two wooden covers, tied with
// a cord through a hole. Ayurvedic texts were copied this way in South Asia for centuries. `open`
// (0→1) fans the leaves out. Size in model units: about 3 long.
export function pothi(color = 0xd9c08a, len = 3, n = 14) {
  const g = new THREE.Group(), leaves = [];
  const leafM = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const woodM = new THREE.MeshStandardMaterial({ color: 0x6b3b22, roughness: 0.6 });
  const inkM = new THREE.MeshBasicMaterial({ color: 0x3a2a18 });
  const lg = new THREE.BoxGeometry(len, 0.02, 0.42);
  for (let i = 0; i < n; i++) {
    const piv = new THREE.Group(); piv.position.set(-len * 0.3, 0.06 + i * 0.024, 0);
    const m = new THREE.Mesh(lg, leafM); m.position.x = len * 0.3; m.castShadow = true; piv.add(m);
    // three faint lines of "writing" on the top leaf
    if (i === n - 1) for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.8, 0.02), inkM); t.rotation.x = -Math.PI / 2; t.position.set(len * 0.3, 0.012, -0.12 + k * 0.12); piv.add(t); }
    g.add(piv); leaves.push(piv);
  }
  const cov = (y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(len * 1.02, 0.07, 0.46), woodM); b.position.y = y; b.castShadow = true; g.add(b); return b; };
  cov(0.02); const top = cov(0.1 + n * 0.024);
  const cord = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 24), new THREE.MeshStandardMaterial({ color: 0xb03a2e, roughness: 0.6 }));
  cord.rotation.y = Math.PI / 2; cord.position.set(-len * 0.3, 0.2, 0); g.add(cord);
  g.setOpen = (k) => {
    k = clamp(k, 0, 1);
    leaves.forEach((p, i) => { p.rotation.y = k * (i - n / 2) * 0.09; p.position.y = 0.06 + i * 0.024 * (1 - 0.3 * k); });
    top.position.y = 0.1 + n * 0.024 + k * 0.5; top.rotation.z = k * 0.25;
    cord.visible = k < 0.05;
  };
  g.setOpen(0);
  return g;
}

// A flame: two nested cones that flicker. set(strength 0–1.5, flicker 0–1, t).
export function flame(scale = 1) {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.75, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 16), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }));
  outer.position.y = 0.55; inner.position.y = 0.3;
  g.add(outer, inner); g.scale.setScalar(scale);
  const light = new THREE.PointLight(0xff9a50, 2, 6 * scale); light.position.y = 0.6; g.add(light);
  g.set = (k, flick, t) => {
    const f = 1 + flick * 0.45 * Math.sin(t * 13.1) * Math.sin(t * 7.3 + 1) + 0.06 * Math.sin(t * 21);
    const h = Math.max(0.05, k * f);
    outer.scale.set(0.6 + 0.4 * Math.min(1.4, h), h, 0.6 + 0.4 * Math.min(1.4, h)); outer.position.y = 0.55 * h;
    inner.scale.set(0.8, h, 0.8); inner.position.y = 0.3 * h;
    light.intensity = 2.5 * h;
  };
  g.set(1, 0, 0);
  return g;
}

// A clearly stylised seated figure (cross-legged), about 3.2 units tall, facing +z.
export function seatedFigure(mat) {
  const g = new THREE.Group();
  g.add(blob([0.42, 0.52, 0.46], [0, 2.95, 0], mat));                    // head
  g.add(capsule([0, 2.35, 0], [0, 2.5, 0], 0.18, mat));                  // neck
  const prof = [[2.4, 0.02], [2.35, 0.35], [2.2, 0.72], [1.9, 0.78], [1.4, 0.62], [1.0, 0.6], [0.7, 0.68], [0.55, 0.02]];
  const torso = new THREE.LatheGeometry(prof.map(([y, r]) => new THREE.Vector2(r, y)), 40);
  torso.scale(1, 1, 0.62); torso.computeVertexNormals();
  g.add(new THREE.Mesh(torso, mat));
  for (const sx of [1, -1]) {
    g.add(capsule([sx * 0.75, 2.15, 0], [sx * 0.95, 1.35, 0.2], 0.16, mat));   // upper arm
    g.add(capsule([sx * 0.95, 1.35, 0.2], [sx * 0.75, 0.75, 0.75], 0.13, mat)); // forearm to knee
    g.add(capsule([sx * 0.35, 0.55, 0.1], [sx * 1.05, 0.3, 0.8], 0.26, mat));  // thigh
    g.add(capsule([sx * 1.05, 0.3, 0.8], [-sx * 0.3, 0.22, 1.05], 0.2, mat));  // crossed shin
  }
  return g;
}
export { lerp };
