import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/*
 * „Wejdź do klubu” – proceduralna scena 3D sali Bałagan Team (Three.js).
 * Wszystko budowane w kodzie: faktury rysowane na canvasie (cegła, beton, maty, neon, banery),
 * zdjęcia z treningów jako ekrany LED na ścianach, logo partnerów na banerach.
 * Kamerą steruje setProgress(0..1) – ścieżka po krzywej Catmull-Rom z wygładzeniem.
 *
 * Układ (metry): fasada w z=0, drzwi x∈[-1.3,1.3]; hala z∈[-0.4,-42], x∈[-12,12], wys. 9 m.
 * Ring w z=-22, worki przy prawej ścianie, ściana sponsorów na końcu (z=-42).
 */

export interface GymAssets {
  logo: string;
  photos: string[];
  partners: string[];
}

export interface GymScene {
  setProgress: (p: number) => void;
  resize: () => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/* ---------------- faktury z canvasa ---------------- */
const cv = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')!] as const; };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const brickTex = () => {
  const [c, g] = cv(1024, 1024);
  g.fillStyle = '#121010'; g.fillRect(0, 0, 1024, 1024);
  const bw = 128, bh = 48;
  for (let y = 0; y < 1024; y += bh) {
    const off = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < 1024 + bw; x += bw) {
      const l = rnd(14, 30);
      g.fillStyle = `rgb(${l + rnd(4, 12)},${l},${l - 2})`;
      g.fillRect(x + off + 3, y + 3, bw - 6, bh - 6);
      for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(0,0,0,${rnd(0.05, 0.25)})`; g.fillRect(x + off + rnd(3, bw - 6), y + rnd(3, bh - 6), rnd(2, 10), rnd(1, 4)); }
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
};

const noiseTex = (base: number, spread: number, size = 512, streaks = false) => {
  const [c, g] = cv(size, size);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = base + (Math.random() - 0.5) * spread;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  for (let k = 0; k < 60; k++) {
    g.fillStyle = `rgba(${streaks ? 255 : 0},${streaks ? 255 : 0},${streaks ? 255 : 0},${rnd(0.02, 0.07)})`;
    g.beginPath(); g.ellipse(rnd(0, size), rnd(0, size), rnd(10, 80), rnd(4, 30), rnd(0, 3), 0, 6.28); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
};

const matTex = () => {
  const [c, g] = cv(1024, 1024);
  const n = 8, s = 1024 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const red = (x + y) % 2 === 0;
    g.fillStyle = red ? '#7a0c12' : '#141112';
    g.fillRect(x * s, y * s, s, s);
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 3; g.strokeRect(x * s + 1.5, y * s + 1.5, s - 3, s - 3);
    for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(255,255,255,${rnd(0, 0.03)})`; g.fillRect(x * s + rnd(0, s), y * s + rnd(0, s), 2, 2); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

const textTex = (lines: { text: string; font: string; color: string; y: number }[], w: number, h: number, bg?: string, extra?: (g: CanvasRenderingContext2D) => void) => {
  const [c, g] = cv(w, h);
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  extra?.(g);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const l of lines) { g.font = l.font; g.fillStyle = l.color; g.fillText(l.text, w / 2, l.y); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

/** Miękki gradient do snopów światła (stożki) i blasku. */
const beamMat = (color: THREE.ColorRepresentation, strength = 0.18) =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vD; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vD=-mv.z; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uStrength; varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vD; void main(){ float edge=pow(abs(dot(vN,vV)),1.6); float fall=pow(vUv.y,1.4); float near=smoothstep(1.5,7.0,vD); gl_FragColor=vec4(uColor*uStrength*edge*fall*near,1.); }',
  });

const loadTex = (url: string) =>
  new Promise<THREE.Texture | null>(res => {
    new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, () => res(null));
  });

/* ---------------- scena ---------------- */
export async function createGym(canvas: HTMLCanvasElement, assets: GymAssets, opts: { mobile: boolean; reduced: boolean }): Promise<GymScene> {
  const { mobile, reduced } = opts;
  try { await (document as Document & { fonts?: FontFaceSet }).fonts?.load('80px Anton'); } catch { /* fallback font */ }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050404');
  scene.fog = new THREE.FogExp2('#070404', 0.016);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.18;

  const camera = new THREE.PerspectiveCamera(mobile ? 62 : 48, 1, 0.05, 120);
  const disposables: { dispose: () => void }[] = [];
  const add = <T extends THREE.Object3D>(o: T) => { scene.add(o); return o; };
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

  /* ---------- materiały ---------- */
  const brick = track(brickTex()); brick.repeat.set(6, 2.2);
  const brickBump = track(brick.clone()); brickBump.colorSpace = THREE.NoColorSpace;
  const facadeMat = track(new THREE.MeshStandardMaterial({ map: brick, bumpMap: brickBump, bumpScale: 2.2, roughness: 0.92, color: '#a59a98' }));
  const asphaltRough = track(noiseTex(110, 120, 512, true)); asphaltRough.repeat.set(8, 8);
  const asphaltMat = track(new THREE.MeshStandardMaterial({ color: '#0d0c0c', roughness: 0.32, roughnessMap: asphaltRough, metalness: 0.15 }));
  const concrete = track(noiseTex(46, 30, 512)); concrete.repeat.set(5, 2); concrete.colorSpace = THREE.SRGBColorSpace;
  const wallMat = track(new THREE.MeshStandardMaterial({ map: concrete, color: '#6b6262', roughness: 0.95 }));
  const floorRough = track(noiseTex(150, 90, 512)); floorRough.repeat.set(10, 18);
  const floorMat = track(new THREE.MeshStandardMaterial({ color: '#141212', roughness: 0.5, roughnessMap: floorRough, metalness: 0.1 }));
  const mats = track(matTex()); mats.repeat.set(2, 3);
  const matMat = track(new THREE.MeshStandardMaterial({ map: mats, roughness: 0.78 }));
  const steel = track(new THREE.MeshStandardMaterial({ color: '#2a2a2e', metalness: 0.85, roughness: 0.35 }));
  const black = track(new THREE.MeshStandardMaterial({ color: '#0d0c0d', roughness: 0.55 }));
  const leather = track(new THREE.MeshPhysicalMaterial({ color: '#0f0d0e', roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.35 }));
  const red = track(new THREE.MeshStandardMaterial({ color: '#b10f17', roughness: 0.45 }));
  const redGlow = track(new THREE.MeshStandardMaterial({ color: '#ff2a2a', emissive: '#ff1a1a', emissiveIntensity: 3.2, toneMapped: false }));
  const warmGlow = track(new THREE.MeshStandardMaterial({ color: '#ffd8a8', emissive: '#ffb066', emissiveIntensity: 1.8, toneMapped: false }));
  const whiteGlow = track(new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e6', emissiveIntensity: 1.6, toneMapped: false }));

  /* ======================= ZEWNĄTRZ ======================= */
  // ziemia: mokry asfalt przed wejściem
  const ground = add(new THREE.Mesh(track(new THREE.PlaneGeometry(60, 30)), asphaltMat));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 14); ground.receiveShadow = true;
  // krawężnik / chodnik
  const sidewalk = add(new THREE.Mesh(track(new THREE.BoxGeometry(30, 0.14, 3.4)), track(new THREE.MeshStandardMaterial({ color: '#1d1b1b', roughness: 0.6 }))));
  sidewalk.position.set(0, 0.07, 1.7); sidewalk.receiveShadow = true;

  // fasada z otworem na drzwi
  const fShape = new THREE.Shape();
  fShape.moveTo(-14, 0); fShape.lineTo(14, 0); fShape.lineTo(14, 9.4); fShape.lineTo(-14, 9.4); fShape.lineTo(-14, 0);
  const hole = new THREE.Path(); hole.moveTo(-1.3, 0.14); hole.lineTo(1.3, 0.14); hole.lineTo(1.3, 2.9); hole.lineTo(-1.3, 2.9); hole.lineTo(-1.3, 0.14);
  fShape.holes.push(hole);
  const fGeo = track(new THREE.ExtrudeGeometry(fShape, { depth: 0.45, bevelEnabled: false }));
  const facade = add(new THREE.Mesh(fGeo, facadeMat));
  facade.position.z = -0.45; facade.receiveShadow = true;
  // ExtrudeGeometry UV w metrach – skala faktury
  brick.repeat.set(0.22, 0.24); brickBump.repeat.set(0.22, 0.24);

  // rama drzwi + daszek
  const frameGeo = track(new THREE.BoxGeometry(0.12, 2.9, 0.55));
  [-1.36, 1.36].forEach(x => { const m = add(new THREE.Mesh(frameGeo, steel)); m.position.set(x, 1.45, -0.2); });
  const lintel = add(new THREE.Mesh(track(new THREE.BoxGeometry(2.84, 0.14, 0.55)), steel)); lintel.position.set(0, 2.95, -0.2);
  const canopy = add(new THREE.Mesh(track(new THREE.BoxGeometry(4.6, 0.12, 1.6)), black)); canopy.position.set(0, 3.35, 0.6); canopy.castShadow = true;
  const canopyLight = add(new THREE.Mesh(track(new THREE.BoxGeometry(3.6, 0.03, 0.08)), warmGlow)); canopyLight.position.set(0, 3.28, 1.2);

  // drzwi dwuskrzydłowe ze szkłem (otwierają się na zawiasach)
  const doorGlass = track(new THREE.MeshPhysicalMaterial({ color: '#ffcf9a', emissive: '#ff9a50', emissiveIntensity: 0.22, roughness: 0.15, transmission: 0.2, transparent: true, opacity: 0.4 }));
  const mkDoor = (side: -1 | 1) => {
    const pivot = new THREE.Group(); pivot.position.set(side * 1.3, 0.14, -0.08);
    const frame = new THREE.Mesh(track(new THREE.BoxGeometry(1.3, 2.76, 0.06)), steel);
    frame.position.set(-side * 0.65, 1.38, 0);
    const glass = new THREE.Mesh(track(new THREE.PlaneGeometry(1.04, 2.3)), doorGlass);
    glass.position.set(-side * 0.65, 1.42, 0.035);
    const handle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 10)), steel);
    handle.position.set(-side * 1.12, 1.25, 0.09);
    pivot.add(frame, glass, handle);
    return add(pivot);
  };
  const doorL = mkDoor(-1), doorR = mkDoor(1);
  // ciepłe światło wypadające z drzwi
  const doorLight = add(new THREE.SpotLight('#ffb070', 26, 16, 0.7, 0.6, 1.6));
  doorLight.position.set(0, 2.6, -3); doorLight.target.position.set(0, 0, 6); add(doorLight.target);
  const doorSpill = add(new THREE.Mesh(track(new THREE.PlaneGeometry(2.6, 5)), track(new THREE.MeshBasicMaterial({ color: '#ff9a4a', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }))));
  doorSpill.rotation.x = -Math.PI / 2; doorSpill.position.set(0, 0.16, 2.4);

  // szyld: BAŁAGAN TEAM + neon
  const signTex = track(textTex([
    { text: 'BAŁAGAN', font: '200px Anton, Impact, sans-serif', color: '#e9eaee', y: 150 },
    { text: 'TEAM', font: 'italic 800 120px "Barlow Condensed", Impact, sans-serif', color: '#ff2a2a', y: 300 },
    { text: 'BOXING · KICKBOXING · CROSSFIT', font: '700 38px "Barlow Condensed", sans-serif', color: '#bfc2c8', y: 392 },
  ], 1024, 440, '#0b0909'));
  const signMat = track(new THREE.MeshStandardMaterial({ map: signTex, emissiveMap: signTex, emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.6 }));
  const sign = add(new THREE.Mesh(track(new THREE.BoxGeometry(5.4, 2.3, 0.18)), [black, black, black, black, signMat, black]));
  sign.position.set(0, 5.0, 0.12);
  // neonowa rama
  const neonPath = new THREE.CurvePath<THREE.Vector3>();
  const nw = 2.85, nh = 1.3, nz = 0.24, ny = 5.0;
  const pts = [[-nw, -nh], [nw, -nh], [nw, nh], [-nw, nh], [-nw, -nh]].map(([x, y]) => new THREE.Vector3(x, ny + y, nz));
  for (let i = 0; i < 4; i++) neonPath.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  add(new THREE.Mesh(track(new THREE.TubeGeometry(neonPath, 64, 0.035, 8, false)), redGlow));
  const neonLight = add(new THREE.PointLight('#ff2020', 18, 9, 1.8)); neonLight.position.set(0, 5, 1.2);

  // tabliczka z adresem
  const plate = add(new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 0.36)), track(new THREE.MeshStandardMaterial({
    map: track(textTex([{ text: 'BRUGPLEIN 2', font: '700 54px "Barlow Condensed", sans-serif', color: '#e9eaee', y: 64 }, { text: '8223 AJ LELYSTAD', font: '600 34px "Barlow Condensed", sans-serif', color: '#ff4a3d', y: 120 }], 360, 150, '#1a1617')),
    roughness: 0.4, metalness: 0.4,
  }))));
  plate.position.set(2.1, 1.85, 0.02);

  // kinkiety po bokach drzwi
  [-2.2, 2.2].forEach(x => {
    const box = add(new THREE.Mesh(track(new THREE.BoxGeometry(0.2, 0.5, 0.18)), steel)); box.position.set(x, 2.6, 0.08);
    const glow = add(new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.42, 0.02)), warmGlow)); glow.position.set(x, 2.6, 0.18);
  });
  // latarnia uliczna z daleka
  const street = add(new THREE.SpotLight('#9fb6ff', 120, 30, 0.5, 0.8, 1.2)); street.position.set(-9, 8, 9); street.target.position.set(-3, 0, 2); add(street.target);
  if (!mobile) { street.castShadow = true; street.shadow.mapSize.set(1024, 1024); }

  // deszcz
  const rainCount = mobile ? 900 : 2200;
  const rainGeo = track(new THREE.BufferGeometry());
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) { rainPos[i * 3] = rnd(-14, 14); rainPos[i * 3 + 1] = rnd(0, 12); rainPos[i * 3 + 2] = rnd(-0.2, 22); }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = add(new THREE.Points(rainGeo, track(new THREE.PointsMaterial({ color: '#9fb0c8', size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }))));

  /* ======================= WNĘTRZE ======================= */
  const HZ0 = -0.45, HZ1 = -42, HW = 12, HH = 9;
  const hallLen = HZ0 - HZ1;
  // podłoga
  const floor = add(new THREE.Mesh(track(new THREE.PlaneGeometry(HW * 2, hallLen)), floorMat));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.001, (HZ0 + HZ1) / 2); floor.receiveShadow = true;
  // strefa mat
  const matArea = add(new THREE.Mesh(track(new THREE.PlaneGeometry(14, 24)), matMat));
  matArea.rotation.x = -Math.PI / 2; matArea.position.set(0, 0.012, -22); matArea.receiveShadow = true;
  // ściany i sufit
  const wallGeoSide = track(new THREE.PlaneGeometry(hallLen, HH));
  const wl = add(new THREE.Mesh(wallGeoSide, wallMat)); wl.rotation.y = Math.PI / 2; wl.position.set(-HW, HH / 2, (HZ0 + HZ1) / 2); wl.receiveShadow = true;
  const wr = add(new THREE.Mesh(wallGeoSide, wallMat)); wr.rotation.y = -Math.PI / 2; wr.position.set(HW, HH / 2, (HZ0 + HZ1) / 2); wr.receiveShadow = true;
  const wb = add(new THREE.Mesh(track(new THREE.PlaneGeometry(HW * 2, HH)), wallMat)); wb.position.set(0, HH / 2, HZ1);
  const ceil = add(new THREE.Mesh(track(new THREE.PlaneGeometry(HW * 2, hallLen)), black)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, HH, (HZ0 + HZ1) / 2);
  // wewnętrzna strona fasady (żeby z hali nie było widać „dziury”)
  const inner = add(new THREE.Mesh(track(new THREE.PlaneGeometry(HW * 2, HH)), wallMat)); inner.rotation.y = Math.PI; inner.position.set(0, HH / 2, HZ0 - 0.01);
  inner.visible = false; // włączana, gdy kamera jest daleko w środku

  // kratownice pod sufitem
  for (let z = -4; z > HZ1; z -= 6) {
    const beam = add(new THREE.Mesh(track(new THREE.BoxGeometry(HW * 2, 0.35, 0.35)), steel)); beam.position.set(0, HH - 0.6, z);
  }
  [-6, 0, 6].forEach(x => { const r = add(new THREE.Mesh(track(new THREE.BoxGeometry(0.25, 0.25, hallLen)), steel)); r.position.set(x, HH - 0.9, (HZ0 + HZ1) / 2); });

  // reflektory sufitowe + snopy światła
  const beamGeo = track(new THREE.CylinderGeometry(0.18, 2.4, 7.6, 32, 1, true));
  beamGeo.translate(0, -3.8, 0);
  const spots: THREE.SpotLight[] = [];
  const mkSpot = (x: number, z: number, target: THREE.Vector3, color = '#fff1e0', intensity = 160, shadow = false, beamStrength = 0.12, real = true) => {
    const housing = add(new THREE.Mesh(track(new THREE.CylinderGeometry(0.22, 0.3, 0.45, 16)), steel)); housing.position.set(x, HH - 1.2, z);
    const lens = add(new THREE.Mesh(track(new THREE.CircleGeometry(0.2, 24)), whiteGlow)); lens.rotation.x = Math.PI / 2; lens.position.set(x, HH - 1.43, z);
    if (real) {
      const s = add(new THREE.SpotLight(color, intensity, 22, 0.42, 0.55, 1.3));
      s.position.set(x, HH - 1.45, z); s.target.position.copy(target); add(s.target);
      if (shadow && !mobile) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0004; }
      spots.push(s);
    }
    const beam = add(new THREE.Mesh(beamGeo, beamMat(color, beamStrength)));
    beam.position.set(x, HH - 1.45, z);
    beam.lookAt(target); beam.rotateX(-Math.PI / 2);
  };
  mkSpot(0, -22, new THREE.Vector3(0, 1, -22), '#fff4e8', 320, true, 0.11);
  mkSpot(-3.2, -19, new THREE.Vector3(-1.5, 1, -21), '#ffd6d0', 110, false, 0.08);
  mkSpot(3.2, -25, new THREE.Vector3(1.5, 1, -23), '#ffd6d0', 110, false, 0.08);
  for (let z = -8; z >= -34; z -= 6.5) mkSpot(8.6, z, new THREE.Vector3(9, 0.5, z), '#ffe6cc', 80, false, 0.05, false);
  // jedno szerokie światło na rząd worków zamiast pięciu
  const bagLight = add(new THREE.SpotLight('#ffe2c4', 260, 40, 0.9, 0.7, 1.2)); bagLight.position.set(5, HH - 1.5, -20); bagLight.target.position.set(10, 0.5, -21); add(bagLight.target);
  mkSpot(-8.5, -10, new THREE.Vector3(-11, 3, -10), '#ffffff', 60, false, 0.05, false);
  mkSpot(-8.5, -26, new THREE.Vector3(-11, 3, -26), '#ffffff', 60, false, 0.05, false);
  mkSpot(-5, -38, new THREE.Vector3(-3, 3.5, -42), '#ff6a5a', 160, false, 0.1);
  mkSpot(5, -38, new THREE.Vector3(3, 3.5, -42), '#ff6a5a', 160, false, 0.1);
  // ogólne oświetlenie hali (ciemne, czerwonawe)
  add(new THREE.HemisphereLight('#3a1a1c', '#050304', 0.55));
  const redWash = add(new THREE.PointLight('#ff1a1a', 30, 30, 1.6)); redWash.position.set(0, 6, -36);
  // światło na ekrany ze zdjęciami (lewa ściana)
  const screenWash = add(new THREE.SpotLight('#ffd0c0', 120, 30, 1.0, 0.8, 1.2)); screenWash.position.set(-4, HH - 1.5, -17); screenWash.target.position.set(-12, 4, -17); add(screenWash.target);

  /* ---------- RING ---------- */
  const ringG = new THREE.Group(); ringG.position.set(0, 0, -22); add(ringG);
  const RS = 6.4, RH = 1.0;
  const ringCanvas = track(textTex([
    { text: 'BAŁAGAN', font: '230px Anton, Impact, sans-serif', color: 'rgba(220,222,228,.92)', y: 450 },
    { text: 'TEAM', font: 'italic 800 150px "Barlow Condensed", Impact, sans-serif', color: '#e3131c', y: 620 },
  ], 1024, 1024, '#1b1718', g => {
    g.strokeStyle = 'rgba(227,19,28,.85)'; g.lineWidth = 14; g.strokeRect(40, 40, 944, 944);
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 4; g.beginPath(); g.arc(512, 512, 360, 0, 6.28); g.stroke();
    for (let k = 0; k < 4000; k++) { g.fillStyle = `rgba(255,255,255,${rnd(0, 0.025)})`; g.fillRect(rnd(0, 1024), rnd(0, 1024), 2, 2); }
  }));
  const canvasTop = new THREE.Mesh(track(new THREE.BoxGeometry(RS, 0.12, RS)), [black, black, track(new THREE.MeshStandardMaterial({ map: ringCanvas, roughness: 0.85 })), black, black, black]);
  canvasTop.position.y = RH; canvasTop.receiveShadow = true; ringG.add(canvasTop);
  const apronTex = track(textTex([{ text: 'BAŁAGAN TEAM · LELYSTAD', font: '120px Anton, Impact, sans-serif', color: '#e9eaee', y: 82 }], 2048, 160, '#8f0c13'));
  const apron = new THREE.Mesh(track(new THREE.BoxGeometry(RS + 0.1, RH - 0.05, RS + 0.1)), track(new THREE.MeshStandardMaterial({ map: apronTex, roughness: 0.7 })));
  apron.position.y = (RH - 0.05) / 2; apron.castShadow = true; apron.receiveShadow = true; ringG.add(apron);
  const postGeo = track(new THREE.CylinderGeometry(0.08, 0.08, 1.7, 16));
  const padGeo = track(new THREE.BoxGeometry(0.26, 1.15, 0.26));
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => new THREE.Vector3((x * RS) / 2 - x * 0.12, 0, (z * RS) / 2 - z * 0.12));
  corners.forEach((c, i) => {
    const p = new THREE.Mesh(postGeo, steel); p.position.set(c.x, RH + 0.85, c.z); p.castShadow = true; ringG.add(p);
    const pad = new THREE.Mesh(padGeo, i % 2 ? black : red); pad.position.set(c.x, RH + 0.75, c.z); pad.castShadow = true; ringG.add(pad);
  });
  const ropeMat = [track(new THREE.MeshStandardMaterial({ color: '#d4141c', roughness: 0.35, emissive: '#3a0003' })), track(new THREE.MeshStandardMaterial({ color: '#e6e6e8', roughness: 0.4 }))];
  [0.45, 0.85, 1.25].forEach((h, k) => {
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4];
      const len = a.distanceTo(b);
      const rope = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, len, 10)), ropeMat[k % 2]);
      rope.position.set((a.x + b.x) / 2, RH + h, (a.z + b.z) / 2);
      rope.rotation.z = Math.PI / 2; rope.rotation.y = Math.atan2(b.z - a.z, b.x - a.x) * -1;
      rope.castShadow = true; ringG.add(rope);
    }
  });
  // schodki
  const steps = new THREE.Mesh(track(new THREE.BoxGeometry(1.1, 0.5, 0.7)), steel); steps.position.set(RS / 2 + 0.4, 0.25, RS / 2 - 1.2); ringG.add(steps);

  /* ---------- WORKI TRENINGOWE ---------- */
  const bags: { g: THREE.Group; phase: number; amp: number }[] = [];
  const bagBand = track(textTex([{ text: 'BAŁAGAN TEAM', font: '86px Anton, Impact, sans-serif', color: '#e9eaee', y: 64 }], 1024, 128, '#0f0d0e'));
  bagBand.wrapS = THREE.RepeatWrapping; bagBand.repeat.set(2, 1);
  const bagSide = track(new THREE.MeshPhysicalMaterial({ map: bagBand, roughness: 0.4, clearcoat: 0.5 }));
  for (let z = -8; z >= -34; z -= 6.5) {
    for (const dx of [0, -1.4]) {
      const g = new THREE.Group(); g.position.set(9 + dx, HH - 1.0, z + (dx ? 1.8 : 0)); add(g);
      const chain = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.025, 4.2, 6)), steel); chain.position.y = -2.1; g.add(chain);
      const bag = new THREE.Mesh(track(new THREE.CylinderGeometry(0.34, 0.34, 1.6, 32)), [bagSide, leather, leather]); bag.position.y = -5.0; bag.castShadow = true; g.add(bag);
      const band1 = new THREE.Mesh(track(new THREE.CylinderGeometry(0.345, 0.345, 0.12, 32)), red); band1.position.y = -4.35; g.add(band1);
      const band2 = band1.clone(); band2.position.y = -5.65; g.add(band2);
      bags.push({ g, phase: Math.random() * 6, amp: rnd(0.03, 0.07) });
    }
  }

  /* ---------- KETTLEBELLE / sztangi przy lewej ścianie ---------- */
  const rack = add(new THREE.Mesh(track(new THREE.BoxGeometry(0.7, 0.9, 8)), steel)); rack.position.set(-11.3, 0.45, -33);
  const kbMat = track(new THREE.MeshStandardMaterial({ color: '#141214', roughness: 0.4, metalness: 0.6 }));
  for (let i = 0; i < 9; i++) {
    const kb = add(new THREE.Mesh(track(new THREE.SphereGeometry(0.17 + (i % 3) * 0.03, 20, 16)), kbMat)); kb.position.set(-11.3, 1.08, -29.6 - i * 0.8);
    const h = add(new THREE.Mesh(track(new THREE.TorusGeometry(0.1, 0.02, 8, 20, Math.PI)), kbMat)); h.position.set(-11.3, 1.25, -29.6 - i * 0.8); h.rotation.y = Math.PI / 2;
  }
  // opona
  const tire = add(new THREE.Mesh(track(new THREE.TorusGeometry(0.85, 0.32, 18, 40)), track(new THREE.MeshStandardMaterial({ color: '#0b0a0a', roughness: 0.85 }))));
  tire.rotation.x = Math.PI / 2; tire.position.set(-7.5, 0.32, -35);

  /* ---------- ŚCIANA: DISCIPLINE · WORK · RESULTS ---------- */
  const motto = add(new THREE.Mesh(track(new THREE.PlaneGeometry(12, 3)), track(new THREE.MeshStandardMaterial({
    map: track(textTex([
      { text: 'DISCIPLINE · WORK · RESULTS', font: '150px Anton, Impact, sans-serif', color: '#d6d8dc', y: 200 },
    ], 2048, 512, undefined, g => { g.fillStyle = 'rgba(227,19,28,.85)'; g.fillRect(560, 330, 928, 14); })),
    transparent: true, roughness: 0.9,
  }))));
  motto.rotation.y = -Math.PI / 2; motto.position.set(11.95, 6.6, -21);

  /* ---------- ekrany ze zdjęciami (lewa ściana) ---------- */
  const screens: THREE.Mesh[] = [];
  const photoTex = await Promise.all(assets.photos.map(loadTex));
  photoTex.forEach((t, i) => {
    if (!t) return;
    track(t);
    const img = t.image as { width: number; height: number };
    const ar = img.width / img.height;
    const h = 2.6, w = Math.min(4.6, h * ar);
    const z = -6 - i * 5.4;
    const frame = add(new THREE.Mesh(track(new THREE.BoxGeometry(0.12, h + 0.24, w + 0.24)), black));
    frame.position.set(-11.92, 4.2, z);
    const scr = add(new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.35 }))));
    scr.rotation.y = Math.PI / 2; scr.position.set(-11.85, 4.2, z);
    screens.push(scr);
  });

  /* ---------- ściana końcowa: wielkie godło + baner sponsorów ---------- */
  const logoTex = await loadTex(assets.logo);
  if (logoTex) {
    track(logoTex);
    const emblem = add(new THREE.Mesh(track(new THREE.CircleGeometry(3.1, 64)), track(new THREE.MeshStandardMaterial({ map: logoTex, emissiveMap: logoTex, emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 0.6 }))));
    emblem.position.set(0, 5.4, HZ1 + 0.05);
    const ring = add(new THREE.Mesh(track(new THREE.TorusGeometry(3.2, 0.05, 8, 96)), redGlow)); ring.position.set(0, 5.4, HZ1 + 0.08);
  }
  const partnerTex = await Promise.all(assets.partners.map(loadTex));
  const banW = 2.6, banH = 1.45, gap = 0.35;
  const totalW = partnerTex.length * banW + (partnerTex.length - 1) * gap;
  const cloth = track(new THREE.MeshStandardMaterial({ color: '#0d0b0c', roughness: 0.95 }));
  partnerTex.forEach((t, i) => {
    const x = -totalW / 2 + banW / 2 + i * (banW + gap);
    const ban = add(new THREE.Mesh(track(new THREE.PlaneGeometry(banW, banH)), cloth)); ban.position.set(x, 1.45, HZ1 + 0.06);
    const rod = add(new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.025, banW + 0.2, 8)), steel)); rod.rotation.z = Math.PI / 2; rod.position.set(x, 1.45 + banH / 2 + 0.03, HZ1 + 0.1);
    if (!t) return;
    track(t);
    const img = t.image as { width: number; height: number };
    const ar = img.width / img.height;
    let w = banW * 0.8, h = w / ar; if (h > banH * 0.72) { h = banH * 0.72; w = h * ar; }
    const logo = add(new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshStandardMaterial({ map: t, transparent: true, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 0.8 }))));
    logo.position.set(x, 1.45, HZ1 + 0.08);
  });
  const sponsorLabel = add(new THREE.Mesh(track(new THREE.PlaneGeometry(6, 0.5)), track(new THREE.MeshBasicMaterial({
    map: track(textTex([{ text: 'PARTNERZY KLUBU', font: '700 64px "Barlow Condensed", sans-serif', color: '#ff4a3d', y: 50 }], 1024, 100)), transparent: true,
  }))));
  sponsorLabel.position.set(0, 2.55, HZ1 + 0.06);

  /* ---------- kurz w świetle ---------- */
  const dustCount = mobile ? 700 : 1800;
  const dGeo = track(new THREE.BufferGeometry());
  const dPos = new Float32Array(dustCount * 3);
  const dSeed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) { dPos[i * 3] = rnd(-11, 11); dPos[i * 3 + 1] = rnd(0.2, 8); dPos[i * 3 + 2] = rnd(-41, -1); dSeed[i] = Math.random() * 100; }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dustTex = (() => { const [c, g] = cv(64, 64); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,240,220,1)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return track(new THREE.CanvasTexture(c)); })();
  const dust = add(new THREE.Points(dGeo, track(new THREE.PointsMaterial({ map: dustTex, size: 0.06, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffd9c0' }))));

  /* ======================= KAMERA ======================= */
  // klatki: [czas, pozycja, cel]
  const K: [number, THREE.Vector3, THREE.Vector3][] = [
    [0.0, new THREE.Vector3(0, 1.8, 16), new THREE.Vector3(0, 3.2, 0)],
    [0.12, new THREE.Vector3(-0.8, 1.7, 7), new THREE.Vector3(0, 2.4, 0)],
    [0.2, new THREE.Vector3(0, 1.65, 2.2), new THREE.Vector3(0, 1.6, -4)],
    [0.27, new THREE.Vector3(0, 1.7, -1.6), new THREE.Vector3(0, 2.4, -14)],
    [0.36, new THREE.Vector3(-1.5, 2.6, -8), new THREE.Vector3(0, 1.8, -22)],
    [0.47, new THREE.Vector3(-5.8, 2.4, -16), new THREE.Vector3(0, 1.4, -22)],
    [0.55, new THREE.Vector3(-6.6, 2.1, -25.5), new THREE.Vector3(0, 1.5, -22)],
    [0.61, new THREE.Vector3(-5.6, 2.6, -14.5), new THREE.Vector3(2, 1.6, -22)],
    [0.67, new THREE.Vector3(4.8, 2.0, -13), new THREE.Vector3(9, 1.9, -24)],
    [0.76, new THREE.Vector3(5.2, 1.7, -32), new THREE.Vector3(9, 2.1, -19)],
    [0.86, new THREE.Vector3(-2, 2.2, -30), new THREE.Vector3(-11, 4, -18)],
    [1.0, new THREE.Vector3(0, 2.3, -31.5), new THREE.Vector3(0, 3.4, -42)],
  ];
  const posCurve = new THREE.CatmullRomCurve3(K.map(k => k[1]), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(K.map(k => k[2]), false, 'centripetal');
  const ease = (t: number) => t * t * (3 - 2 * t);
  const sample = (p: number, out: THREE.Vector3, curve: THREE.CatmullRomCurve3) => {
    let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
    const t = (p - K[i][0]) / (K[i + 1][0] - K[i][0]);
    curve.getPoint(Math.min(1, (i + ease(Math.max(0, Math.min(1, t)))) / (K.length - 1)), out);
  };

  /* ---------- postprocessing ---------- */
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.4, 0.93);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ---------- pętla ---------- */
  let target = 0, cur = 0, raf = 0, running = false, last = 0, time = 0, frameNo = 0;
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), lookNow = new THREE.Vector3();
  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  const onMove = (e: PointerEvent) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
  if (!mobile && !reduced) window.addEventListener('pointermove', onMove, { passive: true });

  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now; time += dt;
    cur += (target - cur) * (reduced ? 1 : Math.min(1, dt * 4.2));
    sample(cur, camPos, posCurve); sample(cur, camTgt, tgtCurve);
    mouse.cx += (mouse.x - mouse.cx) * 0.05; mouse.cy += (mouse.y - mouse.cy) * 0.05;
    camera.position.copy(camPos);
    camera.position.x += mouse.cx * 0.35; camera.position.y -= mouse.cy * 0.2;
    if (!reduced) camera.position.y += Math.sin(time * 1.6) * 0.012; // oddech kamery
    lookNow.lerp(camTgt, lookNow.lengthSq() === 0 ? 1 : 0.2);
    camera.lookAt(lookNow);

    // drzwi otwierają się, gdy kamera podchodzi
    const open = Math.max(0, Math.min(1, (cur - 0.1) / 0.1));
    const o = ease(open) * 1.75;
    doorL.rotation.y = o; doorR.rotation.y = -o;
    rain.visible = cur < 0.3;
    // deszcz
    if (rain.visible && !reduced) {
      const a = rainGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < rainCount; i++) { let y = a.getY(i) - dt * 9; if (y < 0) y = 12; a.setY(i, y); }
      a.needsUpdate = true;
    }
    // kurz
    if (!reduced && (frameNo++ & 1) === 0) {
      const a = dGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i += 2) { a.setY(i, a.getY(i) + Math.sin(time * 0.6 + dSeed[i]) * 0.0016); a.setX(i, a.getX(i) + Math.cos(time * 0.4 + dSeed[i]) * 0.0012); }
      a.needsUpdate = true;
      bags.forEach(b => { b.g.rotation.z = Math.sin(time * 1.3 + b.phase) * b.amp; b.g.rotation.x = Math.cos(time * 1.1 + b.phase) * b.amp * 0.6; });
      neonLight.intensity = 18 * (0.92 + Math.sin(time * 23) * 0.04 + (Math.random() < 0.004 ? -0.6 : 0));
    }
    if (composer) composer.render(); else renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    bloom?.setSize(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 66 : mobile ? 62 : 48;
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    setProgress: p => { target = Math.max(0, Math.min(1, p)); },
    resize,
    start: () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
    stop: () => { running = false; cancelAnimationFrame(raf); raf = 0; },
    dispose: () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      disposables.forEach(d => { try { d.dispose(); } catch { /* */ } });
      scene.traverse(o => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry?.dispose(); });
      pmrem.dispose(); composer?.dispose(); renderer.dispose();
    },
  };
}
