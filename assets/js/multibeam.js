/* ==========================================================================
   multibeam.js — night driving scene demonstrating two lighting control
   systems on the same car:

     MULTIBEAM          a camera sensor finds oncoming vehicles and the
                        microprocessor switches off only the LED segments
                        pointing at them, so full beam is kept everywhere else.

     NIGHT VIEW ASSIST  an infrared sensor sees heat beyond the reach of the
                        headlights. When a person or animal is found out there,
                        the segments aimed at it are flashed as a warning.

   Both are control systems: sensor -> microprocessor -> actuator, with the
   sensor re-reading the result every frame as feedback.
   ========================================================================== */

import * as THREE from "three";
import { createViewer } from "./viewer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/* ------------------------------------------------------------- constants */
const SEG        = 42;      /* LED segments per headlamp (84 in total)      */
const FAN        = THREE.MathUtils.degToRad(23);   /* half spread of a lamp */
const LOW_RANGE  = 68;      /* metres a dipped beam reaches                 */
const HIGH_RANGE = 142;     /* metres with full beam                        */
const IR_RANGE   = 185;     /* metres the infrared sensor can see           */
/* The scene is deliberately static: it is a diagram of what the systems do,
   not a driving simulation. Positions below are chosen so that both systems
   are demonstrating themselves at once. */
const STATIC_ONCOMING = 62;    /* close enough for the masked corridor to read */
const STATIC_DEER     = 124;   /* past the headlights, inside infrared range   */
const STATIC_PERSON   = 150;

const ROAD_LEN   = 460;
const LANE_MINE  = 0.0;     /* centre of our lane                           */
const LANE_OPP   = -3.6;    /* centre of the oncoming lane                  */

/* --------------------------------------------------------------- state */
const S = {
  masking: true,
  nightView: true,
  highBeam: true,
  segs:   new Float32Array(SEG * 2).fill(1),   /* what each LED is doing now */
  target: new Float32Array(SEG * 2).fill(1),
  hazards: [],
  oncoming: null,
  detected: null,
  warnTimer: 0,
  warnFlash: 0,
  maskedCount: 0
};

/* The viewer starts its render loop immediately, which can fire a frame
   before the rest of this module has finished evaluating. */
let booted = false;

const viewer = createViewer({
  canvas: document.getElementById("view"),
  night: true,
  autoRotate: false,
  onFrame: (dt, t) => update(dt, t)
});
const { scene, camera, controls, renderer } = viewer;

scene.fog = new THREE.FogExp2(0x070b13, 0.0052);

/* ====================================================================== */
/*  LED segment state, shared with every shader through one small texture  */
/* ====================================================================== */
const segData = new Uint8Array(SEG * 2);
const segTex  = new THREE.DataTexture(segData, SEG, 2, THREE.RedFormat);
segTex.minFilter = segTex.magFilter = THREE.LinearFilter;
segTex.wrapS = segTex.wrapT = THREE.ClampToEdgeWrapping;
segTex.needsUpdate = true;

/* ====================================================================== */
/*  Night sky and stars                                                    */
/* ====================================================================== */
{
  const g = new THREE.BufferGeometry();
  const n = 1400, pos = new Float32Array(n * 3), sz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = 300, th = Math.random() * Math.PI * 2, ph = Math.random() * 0.42 + 0.04;
    pos[i*3]   = Math.cos(th) * Math.cos(ph) * r;
    pos[i*3+1] = Math.sin(ph) * r + 20;
    pos[i*3+2] = Math.sin(th) * Math.cos(ph) * r;
    sz[i] = Math.random() * 1.6 + 0.4;
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uT: { value: 0 } },
    vertexShader: `
      attribute float aSize; varying float vS;
      void main(){ vS = aSize;
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * (260.0 / -mv.z);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      varying float vS; uniform float uT;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.06, d) * (0.35 + 0.3 * sin(uT * 1.7 + vS * 40.0));
        gl_FragColor = vec4(vec3(0.82,0.87,1.0), a * 0.8); }`
  });
  const stars = new THREE.Points(g, m);
  stars.renderOrder = -10;
  scene.add(stars);
  S.stars = m;
}

/* a faint glow where the road meets the sky, so the horizon is not a hard line */
{
  const g = new THREE.PlaneGeometry(900, 150);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
    uniforms: {},
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv;
      void main(){ float a = pow(1.0 - vUv.y, 5.0) * 0.5;
        gl_FragColor = vec4(mix(vec3(0.04,0.07,0.13), vec3(0.11,0.15,0.24), vUv.y), a); }`
  });
  const horizon = new THREE.Mesh(g, m);
  horizon.position.set(240, 40, 0);
  horizon.rotation.y = -Math.PI / 2;
  scene.add(horizon);
}

/* a low moon, to give the bodywork some shape away from the headlights */
const moon = new THREE.DirectionalLight(0x9fb8e8, 0.55);
moon.position.set(-60, 42, -70);
scene.add(moon);

/* ====================================================================== */
/*  Road                                                                   */
/* ====================================================================== */
const roadUniforms = THREE.UniformsUtils.merge([
  THREE.UniformsLib.fog,
  {
    uSeg:      { value: segTex },
    uLamp0:    { value: new THREE.Vector3() },
    uLamp1:    { value: new THREE.Vector3() },
    uFan:      { value: FAN },
    uRange:    { value: HIGH_RANGE },
    uScroll:   { value: 0 },
    uBeamCol:  { value: new THREE.Color(0xfff2d2) },
    uWarnPos:  { value: new THREE.Vector3(0, 0, 0) },
    uWarnAmt:  { value: 0 }
  }
]);
roadUniforms.uSeg.value = segTex;

const roadMat = new THREE.ShaderMaterial({
  fog: true,
  uniforms: roadUniforms,
  vertexShader: `
    varying vec3 vW;
    #include <fog_pars_vertex>
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      vW = wp.xyz;
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    uniform sampler2D uSeg;
    uniform vec3  uLamp0, uLamp1, uBeamCol, uWarnPos;
    uniform float uFan, uRange, uScroll, uWarnAmt;
    varying vec3 vW;
    #include <fog_pars_fragment>

    float lamp(vec3 lp, float row){
      vec2 d = vW.xz - lp.xz;
      float dist = length(d);
      float ang  = atan(d.y, d.x);
      if (abs(ang) > uFan) return 0.0;
      float t    = (ang + uFan) / (2.0 * uFan);
      float seg  = texture2D(uSeg, vec2(t, row)).r;
      float near = smoothstep(1.0, 9.0, dist);
      float far  = 1.0 - smoothstep(uRange * 0.30, uRange, dist);
      float inv  = 1.0 / (1.0 + pow(dist / 22.0, 2.2));   /* light falls off */
      float hot  = mix(0.22, 1.0, pow(1.0 - abs(ang) / uFan, 0.75));
      float edge = 1.0 - smoothstep(0.74, 1.0, abs(ang) / uFan);  /* soft sides */
      return seg * near * far * hot * edge * (0.10 + 0.95 * inv);
    }

    void main(){
      float onRoad = step(-5.62, vW.z) * step(vW.z, 1.98);

      float beam = (lamp(uLamp0, 0.25) + lamp(uLamp1, 0.75)) * 0.5;

      /* the warning beam puts a bright pool on whatever was detected */
      float wd = length(vW.xz - uWarnPos.xz);
      beam += uWarnAmt * (1.0 - smoothstep(0.0, 3.6, wd)) * 0.9;

      /* lane markings */
      float mk = 0.0;
      float dash = step(0.55, fract((vW.x + uScroll) / 9.0));
      mk += (1.0 - smoothstep(0.07, 0.14, abs(vW.z + 1.8))) * dash;
      mk += 1.0 - smoothstep(0.06, 0.13, abs(vW.z - 1.8));
      mk += 1.0 - smoothstep(0.06, 0.13, abs(vW.z + 5.4));
      mk = clamp(mk, 0.0, 1.0) * onRoad;

      vec3 verge   = vec3(0.012, 0.016, 0.012);
      vec3 asphalt = vec3(0.030, 0.031, 0.036);
      vec3 base    = mix(verge, asphalt, onRoad);

      vec3 col = base
               + uBeamCol * beam * (0.09 + 0.58 * onRoad)
               + vec3(0.95, 0.95, 0.88) * mk * (0.02 + beam * 0.5);

      gl_FragColor = vec4(col, 1.0);
      #include <fog_fragment>
    }`
});

const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_LEN, 70, 1, 1), roadMat);
road.rotation.x = -Math.PI / 2;
road.position.set(ROAD_LEN / 2 - 60, 0, -1.8);
scene.add(road);

/* ====================================================================== */
/*  Beam shafts in the air, one fan of triangles per headlamp              */
/* ====================================================================== */
function buildFan(row) {
  const pos = [], seg = [], far = [];
  for (let i = 0; i < SEG; i++) {
    const a0 = -FAN + (2 * FAN) * (i / SEG);
    const a1 = -FAN + (2 * FAN) * ((i + 1) / SEG);
    const t  = (i + 0.5) / SEG;
    const R  = HIGH_RANGE * 0.80;
    const c0 = Math.cos(a0) * R, s0 = Math.sin(a0) * R;
    const c1 = Math.cos(a1) * R, s1 = Math.sin(a1) * R;
    /* a wedge per segment: the beam spreads vertically as well as sideways,
       so it still reads as a shaft when seen from the side */
    pos.push(0,0,0,  c0, -0.70, s0,  c1, -0.70, s1);
    seg.push(t,t,t); far.push(0,1,1);
    pos.push(0,0,0,  c0,  0.95, s0,  c1,  0.95, s1);
    seg.push(t,t,t); far.push(0,1,1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aSeg", new THREE.Float32BufferAttribute(seg, 1));
  g.setAttribute("aFar", new THREE.Float32BufferAttribute(far, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: {
      uSeg: { value: segTex }, uRow: { value: row },
      uCol: { value: new THREE.Color(0xffeec8) }, uStrength: { value: 0.14 }
    },
    vertexShader: `
      attribute float aSeg; attribute float aFar;
      varying float vSeg; varying float vFar;
      void main(){ vSeg=aSeg; vFar=aFar;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D uSeg; uniform float uRow, uStrength; uniform vec3 uCol;
      varying float vSeg; varying float vFar;
      void main(){
        float s = texture2D(uSeg, vec2(vSeg, uRow)).r;
        float a = s * uStrength * (1.0 - vFar) * smoothstep(0.0, 0.10, vFar);
        gl_FragColor = vec4(uCol * a, a); }`
  });
  return new THREE.Mesh(g, m);
}

/* ====================================================================== */
/*  Roadside furniture, built procedurally so it costs nothing to download */
/* ====================================================================== */
function buildRoadside() {
  const grp = new THREE.Group();

  const postGeo = new THREE.CylinderGeometry(0.045, 0.055, 1.05, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.85 });
  const refGeo  = new THREE.PlaneGeometry(0.1, 0.17);
  const refMatL = new THREE.MeshBasicMaterial({ color: 0xfff4d0, side: THREE.DoubleSide });
  const refMatR = new THREE.MeshBasicMaterial({ color: 0xff5a4a, side: THREE.DoubleSide });

  const posts = new THREE.InstancedMesh(postGeo, postMat, 120);
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let x = -40; x < 380; x += 26) {
    for (const z of [2.6, -6.2]) {
      dummy.position.set(x, 0.52, z);
      dummy.updateMatrix();
      posts.setMatrixAt(n++, dummy.matrix);
      const ref = new THREE.Mesh(refGeo, z > 0 ? refMatL : refMatR);
      ref.position.set(x - 0.05, 0.86, z);
      ref.rotation.y = -Math.PI / 2;
      grp.add(ref);
    }
  }
  posts.count = n;
  grp.add(posts);

  return grp;
}
scene.add(buildRoadside());

/* ====================================================================== */
/*  The oncoming vehicle — only its lamps really read at this distance     */
/* ====================================================================== */
function buildOncoming() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 1.35, 1.85),
    new THREE.MeshStandardMaterial({ color: 0x0b0e13, roughness: 0.6, metalness: 0.4 }));
  body.position.y = 0.78;
  g.add(body);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.72, 1.68),
    new THREE.MeshStandardMaterial({ color: 0x0a0d11, roughness: 0.5, metalness: 0.3 }));
  roof.position.set(-0.25, 1.62, 0);
  g.add(roof);

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xeaf2ff });
  g.userData.lights = [];
  for (const z of [-0.62, 0.62]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.42), lampMat);
    l.position.set(-2.32, 0.78, z);
    g.add(l);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowSprite(), color: 0xdfeaff, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.scale.set(5, 5, 1);
    halo.position.set(-2.4, 0.78, z);
    g.add(halo);
    g.userData.lights.push(halo);
  }
  const pl = new THREE.PointLight(0xcfe0ff, 6, 26, 2);
  pl.position.set(-3.2, 0.8, 0);
  g.add(pl);
  return g;
}

function glowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const gr = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(220,235,255,0.5)");
  gr.addColorStop(1, "rgba(180,210,255,0)");
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const oncoming = buildOncoming();
oncoming.position.set(STATIC_ONCOMING, 0, LANE_OPP);
oncoming.rotation.y = Math.PI;
scene.add(oncoming);
S.oncoming = oncoming;

export { S, segData, segTex, buildFan, glowSprite };

/* ====================================================================== */
/*  Headlamps: 42 individually switchable LED segments per side           */
/* ====================================================================== */
const lamps = [];              /* { pos, fan, leds, row } */

function buildLamps(carSize) {
  const lx = carSize.x / 2 - 0.26;
  const ly = carSize.y * 0.455;
  const lz = carSize.z * 0.335;

  [[lz, 0.25], [-lz, 0.75]].forEach(([z, row], idx) => {
    const pos = new THREE.Vector3(lx, ly, z);

    /* the fan of light in the air */
    const fan = buildFan(row);
    fan.position.copy(pos);
    fan.renderOrder = 5;
    scene.add(fan);

    /* the physical LED strip inside the housing */
    const ledGeo = new THREE.BoxGeometry(0.015, 0.03, 0.0085);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const leds = new THREE.InstancedMesh(ledGeo, ledMat, SEG);
    const d = new THREE.Object3D();
    for (let i = 0; i < SEG; i++) {
      const u = (i + 0.5) / SEG - 0.5;
      d.position.set(pos.x + 0.004, pos.y + Math.abs(u) * 0.035, pos.z + u * 0.235);
      d.updateMatrix();
      leds.setMatrixAt(i, d.matrix);
      leds.setColorAt(i, new THREE.Color(1, 1, 1));
    }
    leds.instanceColor.needsUpdate = true;
    scene.add(leds);

    /* a soft halo so the lamp itself reads as lit */
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowSprite(), color: 0xfff0d4, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85
    }));
    halo.scale.set(1.5, 0.75, 1);
    halo.position.copy(pos).add(new THREE.Vector3(0.06, 0, 0));
    scene.add(halo);

    /* real light so the road right in front of the car is genuinely lit */
    const spot = new THREE.SpotLight(0xfff0d8, 50, 70, FAN * 1.05, 0.55, 1.4);
    spot.position.copy(pos);
    spot.target.position.set(pos.x + 60, -1.5, pos.z);
    scene.add(spot, spot.target);

    lamps.push({ pos, fan, leds, halo, spot, row, idx });
  });

  roadUniforms.uLamp0.value.copy(lamps[0].pos);
  roadUniforms.uLamp1.value.copy(lamps[1].pos);
}

/* angle of a segment's centre, in the lamp's own frame */
function segAngle(i) { return -FAN + (2 * FAN) * ((i + 0.5) / SEG); }

/* ====================================================================== */
/*  Hazards: a deer in the road and someone walking on the verge          */
/* ====================================================================== */
const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const mixers = [];

function addHazard(url, opts) {
  gltf.load(url, g => {
    const root = g.scene;
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const s = opts.height / Math.max(size.y, 0.001);
    root.scale.setScalar(s);

    const b2 = new THREE.Box3().setFromObject(root);
    const c2 = b2.getCenter(new THREE.Vector3());
    root.position.x -= c2.x;
    root.position.z -= c2.z;
    root.position.y -= b2.min.y;

    const holder = new THREE.Group();
    holder.add(root);
    holder.rotation.y = opts.facing;
    holder.position.set(opts.x, 0, opts.z);
    scene.add(holder);

    root.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m) return;
        m.envMapIntensity = 0.08;
        /* without this the figures are lit as if it were daylight */
        if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 0;
      });
    });

    if (g.animations && g.animations.length) {
      /* step the clip once to a natural mid-stride pose, then leave it there */
      const mx = new THREE.AnimationMixer(root);
      mx.clipAction(g.animations[0]).play();
      mx.setTime(opts.pose || 0.45);
      mixers.push(mx);
    }

    S.hazards.push({
      obj: holder, kind: opts.kind, label: opts.label,
      radius: opts.radius, height: opts.height, lane: opts.z
    });
  }, null, err => console.warn("hazard failed:", url, err));
}

/* ====================================================================== */
/*  Detection marker — what the infrared sensor has picked out             */
/* ====================================================================== */
function ringTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  x.strokeStyle = "#fff"; x.lineWidth = 7;
  const corners = [[18,18,1,1],[110,18,-1,1],[18,110,1,-1],[110,110,-1,-1]];
  corners.forEach(([cx,cy,dx,dy]) => {
    x.beginPath();
    x.moveTo(cx, cy + 30*dy); x.lineTo(cx, cy); x.lineTo(cx + 30*dx, cy);
    x.stroke();
  });
  return new THREE.CanvasTexture(c);
}

const detMarker = new THREE.Sprite(new THREE.SpriteMaterial({
  map: ringTexture(), color: 0xffa23c, transparent: true,
  depthTest: false, depthWrite: false, opacity: 0
}));
detMarker.renderOrder = 20;
detMarker.scale.set(2.6, 2.6, 1);
scene.add(detMarker);

const detGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowSprite(), color: 0xff9a40, transparent: true,
  blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0
}));
detGlow.renderOrder = 19;
detGlow.scale.set(5, 5, 1);
scene.add(detGlow);

/* ====================================================================== */
/*  Scenery loaded from real models                                        */
/* ====================================================================== */
function addScenery() {
  gltf.load("assets/models/pine.glb", g => {
    const src = g.scene;
    const h = new THREE.Box3().setFromObject(src).getSize(new THREE.Vector3()).y || 1;
    src.traverse(o => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m) return;
        /* the scan is lit for daylight; at night these are near-silhouettes */
        m.envMapIntensity = 0.05;
        m.roughness = 1;
        m.metalness = 0;
        if (m.color) m.color.multiplyScalar(0.20);
        if (m.emissive) m.emissive.setScalar(0);
      });
    });
    for (let i = 0; i < 30; i++) {
      const t = src.clone();
      t.scale.setScalar((7.5 + Math.random() * 6.5) / h);
      const side = Math.random() > 0.45 ? 1 : -1;
      t.position.set(-30 + Math.random() * 420, 0,
                     side > 0 ? 7 + Math.random() * 17 : -11 - Math.random() * 17);
      t.rotation.y = Math.random() * Math.PI * 2;
      scene.add(t);
    }
  }, null, () => {});

  gltf.load("assets/models/roadsign.glb", g => {
    const src = g.scene;
    const h = new THREE.Box3().setFromObject(src).getSize(new THREE.Vector3()).y || 1;
    src.traverse(o => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m) return;
        m.envMapIntensity = 0.2;
        if (m.color) m.color.multiplyScalar(0.55);
      });
    });
    [58, 173, 288].forEach(x => {
      const sgn = src.clone();
      sgn.scale.setScalar(2.4 / h);
      sgn.position.set(x, 0, 3.4);
      sgn.rotation.y = -Math.PI / 2;
      scene.add(sgn);
    });
  }, null, () => {});
}

/* ====================================================================== */
/*  The control systems                                                    */
/* ====================================================================== */
function angularExtent(lamp, x, z, radius) {
  const dx = x - lamp.pos.x;
  if (dx <= 1) return null;
  const a = Math.atan2(z - radius - lamp.pos.z, dx);
  const b = Math.atan2(z + radius - lamp.pos.z, dx);
  return [Math.min(a, b), Math.max(a, b)];
}

function computeTargets() {
  const range = S.highBeam ? HIGH_RANGE : LOW_RANGE;
  roadUniforms.uRange.value += (range - roadUniforms.uRange.value) * 0.08;

  S.target.fill(1);
  S.maskedCount = 0;

  /* --- MULTIBEAM: carve a dark corridor around the oncoming vehicle --- */
  if (S.masking && S.oncoming) {
    const ox = S.oncoming.position.x, oz = S.oncoming.position.z;
    if (ox > 6 && ox < 260) {
      lamps.forEach(l => {
        const ext = angularExtent(l, ox, oz, 1.5);
        if (!ext) return;
        const margin = THREE.MathUtils.degToRad(1.6);
        for (let i = 0; i < SEG; i++) {
          const a = segAngle(i);
          if (a > ext[0] - margin && a < ext[1] + margin) {
            S.target[l.idx * SEG + i] = 0;
            S.maskedCount++;
          }
        }
      });
    }
  }

  /* --- NIGHT VIEW ASSIST: flash a warning at whatever the IR sensor sees
         that the headlights cannot yet reach ---------------------------- */
  S.detected = null;
  if (S.nightView) {
    let best = null;
    S.hazards.forEach(h => {
      const d = h.obj.position.x - lamps[0].pos.x;
      if (d > 2 && d < IR_RANGE && (!best || d < best.d)) best = { h, d };
    });
    if (best) {
      const beyond = best.d > roadUniforms.uRange.value * 0.80;
      S.detected = { label: best.h.label, dist: best.d, beyond };
      if (beyond) {
        S.warnTimer += 1 / 60;
        const phase = S.warnTimer % 1.9;
        const flashing = phase < 1.2;
        S.warnFlash = flashing ? (Math.sin(phase * 34) * 0.5 + 0.5) : 0;

        const hx = best.h.obj.position.x, hz = best.h.obj.position.z;
        roadUniforms.uWarnPos.value.set(hx, 0, hz);
        roadUniforms.uWarnAmt.value += (S.warnFlash * 1.5 - roadUniforms.uWarnAmt.value) * 0.35;

        lamps.forEach(l => {
          const ext = angularExtent(l, hx, hz, best.h.radius + 0.5);
          if (!ext) return;
          for (let i = 0; i < SEG; i++) {
            const a = segAngle(i);
            if (a > ext[0] && a < ext[1]) {
              S.target[l.idx * SEG + i] = 0.12 + 0.88 * S.warnFlash;
            }
          }
        });
      } else {
        S.warnTimer = 0;
        roadUniforms.uWarnAmt.value *= 0.85;
      }

      /* mark whatever was found, whether or not the beam can reach it */
      const h = best.h.obj.position;
      const lift = best.h.height * 0.62;
      detMarker.position.set(h.x, lift, h.z);
      detGlow.position.set(h.x, lift, h.z);
      const sc = 1.5 + best.h.height * 0.9;
      detMarker.scale.set(sc, sc, 1);
      detGlow.scale.set(sc * 2.1, sc * 2.1, 1);
      const col = beyond ? 0xffa23c : 0x7fd4ff;
      detMarker.material.color.setHex(col);
      detGlow.material.color.setHex(col);
      detMarker.material.opacity = beyond ? (0.55 + 0.45 * S.warnFlash) : 0.4;
      detGlow.material.opacity   = beyond ? (0.22 + 0.5 * S.warnFlash) : 0.1;
    } else {
      roadUniforms.uWarnAmt.value *= 0.85;
      detMarker.material.opacity *= 0.8;
      detGlow.material.opacity *= 0.8;
    }
  } else {
    roadUniforms.uWarnAmt.value *= 0.85;
    detMarker.material.opacity *= 0.8;
    detGlow.material.opacity *= 0.8;
  }
}

/* ====================================================================== */
/*  Frame update                                                           */
/* ====================================================================== */
const tmpCol = new THREE.Color();
let hudTick = 0;

function update(dt, t) {
  if (!booted) return;
  if (S.stars) S.stars.uniforms.uT.value = t;

  /* nothing moves — only the lamps respond, which is the point of the page */
  if (lamps.length) computeTargets();

  /* ease every LED toward its target — the system never snaps */
  const k = Math.min(1, dt * 14);
  for (let i = 0; i < S.segs.length; i++) {
    S.segs[i] += (S.target[i] - S.segs[i]) * k;
    segData[i] = Math.max(0, Math.min(255, S.segs[i] * 255)) | 0;
  }
  segTex.needsUpdate = true;

  /* the LED strip on the car shows exactly the same state */
  lamps.forEach(l => {
    for (let i = 0; i < SEG; i++) {
      const v = S.segs[l.idx * SEG + i];
      tmpCol.setRGB(v, v * 0.96, v * 0.86);
      l.leds.setColorAt(i, tmpCol);
    }
    l.leds.instanceColor.needsUpdate = true;
    let lit = 0;
    for (let i = 0; i < SEG; i++) lit += S.segs[l.idx * SEG + i];
    l.halo.material.opacity = 0.25 + 0.6 * (lit / SEG);
    l.spot.intensity = 18 + 46 * (lit / SEG);
  });

  hudTick += dt;
  if (hudTick > 0.1) { hudTick = 0; paintHUD(); }
}

/* ====================================================================== */
/*  Readout                                                                */
/* ====================================================================== */
const el = id => document.getElementById(id);

function paintHUD() {
  let lit = 0;
  for (let i = 0; i < S.segs.length; i++) lit += S.segs[i] > 0.5 ? 1 : 0;
  const off = S.segs.length - lit;

  el("ledLit").textContent = lit;
  el("ledOff").textContent = off;
  el("ledBar").style.setProperty("--on", (lit / S.segs.length * 100).toFixed(1) + "%");

  const ox = S.oncoming ? S.oncoming.position.x : 999;
  const seeingCar = S.oncoming && ox > 6 && ox < 260;
  el("camState").textContent = seeingCar
    ? "oncoming vehicle at " + Math.round(ox) + " m"
    : "road clear";
  el("camState").className = "val " + (seeingCar ? "hit" : "");
  el("camAction").textContent = !S.masking
    ? "masking off — oncoming driver is dazzled"
    : seeingCar ? off + " LED segments switched off" : "full beam, nothing to mask";
  el("camAction").classList.toggle("warn", !S.masking && seeingCar);

  const d = S.detected;
  el("irState").textContent = d
    ? d.label + " at " + Math.round(d.dist) + " m"
    : "nothing detected";
  el("irState").className = "val " + (d ? "hit" : "");
  el("irAction").textContent = !S.nightView
    ? "night view assist off"
    : d ? (d.beyond ? "beyond the headlights — flashing a warning"
                    : "now lit by the headlights")
        : "scanning to " + IR_RANGE + " m";
  el("irAction").classList.toggle("warn", !!(d && d.beyond));

  el("beamMode").textContent = S.highBeam
    ? "full beam, " + HIGH_RANGE + " m"
    : "dipped, " + LOW_RANGE + " m";
}

/* ====================================================================== */
/*  Controls                                                               */
/* ====================================================================== */
function wire() {
  const bind = (id, key) => {
    const c = el(id);
    if (!c) return;
    c.checked = S[key];
    c.addEventListener("change", () => { S[key] = c.checked; });
  };
  bind("optMask", "masking");
  bind("optNight", "nightView");
  bind("optHigh", "highBeam");

  document.querySelectorAll("[data-view]").forEach(b => {
    b.addEventListener("click", () => {
      const v = b.dataset.view;
      const p = { driver: [-8.5, 2.5, 0.5], side: [4, 2.4, 17], above: [34, 62, 3] }[v];
      if (!p) return;
      controls.autoRotate = false;
      camera.position.set(...p);
      controls.target.set(v === "above" ? 60 : 30, v === "above" ? 0 : 0.8, -1.4);
      document.querySelectorAll("[data-view]").forEach(x =>
        x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    });
  });
}

/* ====================================================================== */
/*  Go                                                                     */
/* ====================================================================== */
booted = true;

/* handy when checking the scene from the console, and used by the
   offline screenshot tooling since this page is too heavy for software GL */
window.__dbg = { THREE, scene, camera, controls, renderer, S, lamps,
                 roadUniforms, update, segData, segTex };

viewer.ready.then(({ size }) => {
  buildLamps(size);
  addScenery();

  addHazard("assets/models/deer.glb", {
    kind: "deer", label: "Deer", height: 1.35, radius: 0.9,
x: STATIC_DEER, z: LANE_MINE - 0.45, facing: Math.PI * 0.5, pose: 0.7
  });
  addHazard("assets/models/pedestrian.glb", {
    kind: "person", label: "Pedestrian", height: 1.78, radius: 0.45,
x: STATIC_PERSON, z: 2.3, facing: -Math.PI / 2, pose: 0.55
  });

  camera.position.set(-7.5, 2.4, 0.4);
  controls.target.set(22, 0.9, -1.2);
  controls.minDistance = 4;
  controls.maxDistance = 90;

  wire();
  paintHUD();
});
