import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
export function createWorld(canvas, reducedMotion) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c8bd9e');
  scene.fog = new THREE.FogExp2('#c8bd9e', .011);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 280);
  const initial = new THREE.Vector3(-5.4, 2.8, -6.8);
  camera.position.copy(initial);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.25, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI / 2 - .035;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = .25;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  const ambient = new THREE.HemisphereLight('#c8d3db', '#704c2a', 1.1);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#ffe2b1', 4.5);
  sun.position.set(-12, 8, -8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 70 });
  sun.shadow.normalBias = .025;
  sun.shadow.bias = -.0002;
  scene.add(sun);
  const sky = new Sky(); sky.scale.setScalar(200); scene.add(sky);
  sky.material.uniforms.turbidity.value = 5;
  sky.material.uniforms.rayleigh.value = 1.4;
  sky.material.uniforms.mieCoefficient.value = .005;
  sky.material.uniforms.mieDirectionalG.value = .8;
  sky.material.uniforms.sunPosition.value.copy(sun.position);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(sky, .03);
  scene.environment = environment.texture;
  pmrem.dispose();
  let seed = 42;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  const texCanvas = document.createElement('canvas'); texCanvas.width = texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');
  const data = ctx.createImageData(512, 512);
  for (let i = 0; i < data.data.length; i += 4) { const v = 165 + random() * 80; data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255; }
  ctx.putImageData(data, 0, 0);
  const sandTexture = new THREE.CanvasTexture(texCanvas); sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping; sandTexture.repeat.set(100, 100);
  const sand = new THREE.MeshStandardMaterial({ color: '#c59b66', roughness: .97, bumpMap: sandTexture, bumpScale: .035 });
  const terrain = new THREE.PlaneGeometry(220, 220, 220, 220); terrain.rotateX(-Math.PI / 2);
  const points = terrain.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i), z = points.getZ(i);
    const fade = Math.min(1, Math.max(0, (Math.hypot(x, z) - 5) / 20));
    const dune = Math.sin(x * .075 + Math.sin(z * .06) * 2.2) * 2.8 + Math.sin(z * .12 + x * .025) * 1.1;
    const ripple = Math.sin(z * 4 + Math.sin(x * .13) * 5) * .017;
    points.setY(i, dune * fade + ripple - .06);
  }
  terrain.computeVertexNormals();
  const ground = new THREE.Mesh(terrain, sand); ground.receiveShadow = true; scene.add(ground);
  const mat = (color, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const metal = mat('#424540', .28, .85), aluminum = mat('#9d9f97', .25, .88), dark = mat('#181c19', .75), wood = mat('#706853', .65);
  function box(w, h, d, material, pos, parent = scene) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(...pos); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh; }
  function ellipsoid(sx, sy, sz, material, pos, parent = scene) { const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), material); mesh.scale.set(sx, sy, sz); mesh.position.set(...pos); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh; }
  function rod(from, to, radius, material, parent = scene) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 12), material);
    mesh.position.copy(a.add(b).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  // Workstation: separate physical objects, all lit by the same environment.
  const desk = new THREE.Group(); scene.add(desk); desk.position.x = .7;
  box(2.7, .095, 1.4, wood, [0, 1.5, 0], desk);
  for (const x of [-1.22, 1.22]) for (const z of [-.57, .57]) box(.055, 1.48, .055, metal, [x, .74, z], desk);
  rod([-1.22, .18, -.57], [1.22, .18, -.57], .025, metal, desk);
  const laptop = new THREE.Group(); laptop.position.set(.2, 1.565, -.05); laptop.rotation.y = -.17; desk.add(laptop);
  box(.92, .035, .64, aluminum, [0, 0, 0], laptop);
  box(.26, .002, .14, mat('#7e827d', .35, .5), [0, .02, .19], laptop);
  for (let row = 0; row < 5; row++) for (let col = 0; col < 12; col++) box(.053, .008, .042, dark, [-.37 + col * .067, .024, -.22 + row * .06], laptop);
  const display = new THREE.Group(); display.position.set(0, .015, -.3); display.rotation.x = -.16; laptop.add(display);
  box(.92, .6, .028, dark, [0, .3, 0], display);
  const screenCanvas = document.createElement('canvas'); screenCanvas.width = 1024; screenCanvas.height = 640;
  const sc = screenCanvas.getContext('2d');
  sc.fillStyle = '#20281f'; sc.fillRect(0, 0, 1024, 640);
  sc.fillStyle = '#dce6af'; sc.font = 'bold 30px sans-serif'; sc.fillText('K A R T A L', 65, 70);
  sc.font = '64px Georgia'; sc.fillText('Bakışın ötesinde.', 65, 210);
  sc.strokeStyle = '#78866a'; sc.beginPath(); sc.moveTo(65, 255); sc.lineTo(950, 255); sc.stroke();
  for (let i = 0; i < 9; i++) { sc.fillStyle = i % 3 ? '#89967e' : '#dce6af'; sc.fillRect(65, 300 + i * 22, 100 + (i * 137) % 700, 5); }
  sc.fillStyle = '#dce6af'; sc.fillRect(65, 550, 210, 40); sc.fillStyle = '#20281f'; sc.font = '18px sans-serif'; sc.fillText('KEŞFET  →', 105, 577);
  const screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.colorSpace = THREE.SRGBColorSpace;
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(.84, .51), new THREE.MeshStandardMaterial({ map: screenTex, emissiveMap: screenTex, emissive: '#ffffff', emissiveIntensity: .35, roughness: .2 })); screenMesh.position.set(0, .3, .016); display.add(screenMesh);
  // Five-legged chair with upholstered seat and back.
  const chair = new THREE.Group(); chair.position.set(-1.05, 0, .75); chair.rotation.y = -.3; scene.add(chair);
  rod([0, .16, 0], [0, .82, 0], .055, aluminum, chair);
  for (let i = 0; i < 5; i++) { const angle = i * Math.PI * 2 / 5; const x = Math.cos(angle) * .52, z = Math.sin(angle) * .52; rod([0, .2, 0], [x, .1, z], .028, aluminum, chair); ellipsoid(.07, .07, .045, dark, [x, .07, z], chair); }
  const seat = box(.82, .11, .75, dark, [0, .85, 0], chair);
  box(.72, .65, .07, dark, [0, 1.29, .34], chair);
  for (const x of [-.44, .44]) { rod([x, .85, .18], [x, 1.18, .18], .025, aluminum, chair); box(.09, .05, .53, dark, [x, 1.18, -.02], chair); }
  // Procedural eagle: layered individual feathers, hooked beak, eyes, talons.
  const bird = new THREE.Group(); bird.position.set(-1.05, .96, .65); bird.rotation.y = .7; scene.add(bird);
  const bodyMat = mat('#35271c', .95), headMat = mat('#5c4230', .85), gold = mat('#a98b43', .6), beakMat = mat('#3a3931', .45);
  ellipsoid(.31, .47, .27, bodyMat, [0, .52, 0], bird);
  ellipsoid(.19, .3, .19, headMat, [0, .95, -.08], bird);
  const head = new THREE.Group(); head.position.set(0, 1.12, -.12); bird.add(head);
  ellipsoid(.225, .21, .22, headMat, [0, 0, 0], head);
  ellipsoid(.09, .065, .1, gold, [0, -.055, -.19], head);
  const beakCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.035, -.23), new THREE.Vector3(0, -.07, -.34), new THREE.Vector3(0, -.16, -.36), new THREE.Vector3(0, -.22, -.32)]);
  const beakGeo = new THREE.TubeGeometry(beakCurve, 18, .066, 10, false);
  const beakPos = beakGeo.attributes.position;
  for (let i = 0; i < beakPos.count; i++) { const t = Math.floor(i / 11) / 18; const center = beakCurve.getPointAt(t); const scale = 1 - t * .92; beakPos.setXYZ(i, center.x + (beakPos.getX(i) - center.x) * scale, center.y + (beakPos.getY(i) - center.y) * scale, center.z + (beakPos.getZ(i) - center.z) * scale); }
  beakGeo.computeVertexNormals(); head.add(new THREE.Mesh(beakGeo, beakMat));
  const eyeMat = mat('#bd7930', .18), pupilMat = mat('#050504', .12);
  for (const side of [-1, 1]) { ellipsoid(.032, .054, .054, eyeMat, [side * .207, .018, -.075], head); ellipsoid(.012, .033, .033, pupilMat, [side * .23, .018, -.083], head); const brow = ellipsoid(.07, .035, .11, headMat, [side * .19, .07, -.078], head); brow.rotation.x = -.15; ellipsoid(.008, .008, .008, mat('#ffffff', .1), [side * .239, .031, -.099], head); }
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.bezierCurveTo(-.1, .3, -.075, .79, 0, 1); shape.bezierCurveTo(.075, .79, .1, .3, 0, 0);
  const featherGeo = new THREE.ShapeGeometry(shape, 7);
  // Tiny ridges drawn into an alpha-free feather surface make each vane legible.
  const fc = document.createElement('canvas'); fc.width = 128; fc.height = 512; const fctx = fc.getContext('2d');
  fctx.fillStyle = '#ac997e'; fctx.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 140; i++) { const y = i * 4; fctx.strokeStyle = i % 2 ? '#827462' : '#c1ae8f'; fctx.lineWidth = 1; fctx.beginPath(); fctx.moveTo(64, y); fctx.lineTo(0, y + 35); fctx.moveTo(64, y); fctx.lineTo(128, y + 35); fctx.stroke(); }
  fctx.strokeStyle = '#d1bc94'; fctx.lineWidth = 2; fctx.beginPath(); fctx.moveTo(64, 0); fctx.lineTo(64, 512); fctx.stroke();
  const featherTex = new THREE.CanvasTexture(fc); featherTex.colorSpace = THREE.SRGBColorSpace;
  const featherMat = new THREE.MeshStandardMaterial({ map: featherTex, color: '#624b35', side: THREE.DoubleSide, roughness: .87 });
  const feathers = new THREE.InstancedMesh(featherGeo, featherMat, 1300); feathers.castShadow = feathers.receiveShadow = true; bird.add(feathers);
  const dummy = new THREE.Object3D(); let n = 0;
  const color = new THREE.Color();
  function feather(x, y, z, length, width, rx, ry, rz, shade) { dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, rz); dummy.scale.set(width, length, 1); dummy.updateMatrix(); feathers.setMatrixAt(n, dummy.matrix); color.setRGB(shade, shade * .88, shade * .7); feathers.setColorAt(n++, color); }
  for (let row = 0; row < 18; row++) for (let j = 0; j < 28; j++) { const theta = j / 28 * Math.PI * 2 + (row % 2) * .11; const y = .24 + row * .045; const radius = .29 * Math.sqrt(Math.max(.06, 1 - ((y - .57) / .48) ** 2)); feather(Math.sin(theta) * radius, y, Math.cos(theta) * radius, .17 + random() * .065, .6 + random() * .25, .1, theta, Math.PI + (random() - .5) * .15, .32 + random() * .4); }
  for (const side of [-1, 1]) { ellipsoid(.13, .34, .23, bodyMat, [side * .245, .55, .07], bird); for (let row = 0; row < 5; row++) for (let j = 0; j < 15; j++) feather(side * (.24 + row * .018), .78 - row * .09, -.09 + j * .026, .37 + row * .045, .75, .28, side * 1.45, Math.PI + side * .12, .2 + random() * .3); }
  for (let i = 0; i < 13; i++) feather((i - 6) * .025, .33, .16, .57, .8, -.65, 0, Math.PI + (i - 6) * .035, .27 + random() * .2);
  for (let row = 0; row < 12; row++) for (let j = 0; j < 24; j++) {
    const theta = j / 24 * Math.PI * 2 + (row % 2) * .13;
    const yy = .96 + row * .028;
    const radius = .225 * Math.sqrt(Math.max(.05, 1 - ((yy - 1.12) / .23) ** 2));
    feather(Math.sin(theta) * radius, yy, -.12 + Math.cos(theta) * radius, .09, .3, .1, theta, Math.PI, .38 + random() * .35);
  }
  feathers.count = n; feathers.instanceMatrix.needsUpdate = true;
  for (const side of [-1, 1]) { rod([side * .13, .24, -.01], [side * .13, .03, -.09], .032, gold, bird); for (let toe = 0; toe < 3; toe++) { const x = side * .13 + (toe - 1) * .065; rod([side * .13, .05, -.09], [x, -.005, -.24], .014, gold, bird); rod([x, -.005, -.24], [x, -.025, -.28], .009, beakMat, bird); } }
  document.querySelector('#reset-view').addEventListener('click', () => { camera.position.copy(initial); controls.target.set(0, 1.25, 0); controls.update(); });
  document.querySelectorAll('[data-light]').forEach(button => button.addEventListener('click', () => {
    const day = button.dataset.light === 'day';
    sun.color.set(day ? '#fff6df' : '#ffe2b1'); sun.position.set(day ? -3 : -12, day ? 24 : 11, 8);
    sun.intensity = day ? 3.6 : 4.5; renderer.toneMappingExposure = day ? 1.1 : 1.05;
    sky.material.uniforms.sunPosition.value.copy(sun.position);
    scene.fog.color.set(day ? '#c9d4d3' : '#c8bd9e');
    document.querySelectorAll('[data-light]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  }));
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-'].includes(event.key)) return;
    event.preventDefault(); const offset = camera.position.clone().sub(controls.target);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), event.key === 'ArrowLeft' ? .12 : -.12);
    else offset.multiplyScalar(event.key === 'ArrowUp' || event.key === '+' ? .9 : 1.1);
    offset.clampLength(controls.minDistance, controls.maxDistance); camera.position.copy(controls.target).add(offset); controls.update();
  });
  const sizeObserver = new ResizeObserver(() => { const { width, height } = canvas.parentElement.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }); sizeObserver.observe(canvas.parentElement);
  let visible = true;
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); visibilityObserver.observe(canvas);
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => { if (!visible || document.hidden) return; const t = clock.getElapsedTime(); if (!reducedMotion) { head.rotation.y = Math.sin(t * .35) * .09; head.rotation.z = Math.sin(t * .25) * .025; } controls.update(); renderer.render(scene, camera); });
  document.querySelector('#world-loading').hidden = true;
  document.querySelector('#world-loading').style.display = 'none';
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); document.querySelector('#world-loading').style.display = 'grid'; document.querySelector('#world-loading').textContent = '3D bağlantısı kesildi. Sayfayı yenileyerek tekrar deneyebilirsin.'; });
}
