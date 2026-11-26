import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sphere = new THREE.SphereGeometry(1, 24, 18);

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeTexture(draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  draw(canvas.getContext("2d"), canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;
  return texture;
}

function makeFurTexture(base, fibers, seed) {
  const random = seededRandom(seed);
  return makeTexture((context, width, height) => {
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 6200; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const length = 2 + random() * 7;
      context.strokeStyle = fibers[Math.floor(random() * fibers.length)];
      context.lineWidth = 0.35 + random() * 0.8;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + (random() - 0.5) * 2, y + length * 0.5, x + (random() - 0.5) * 3, y + length);
      context.stroke();
    }
  }, 2, 2);
}

const whiteFur = makeFurTexture("#f2efeb", ["rgba(255,255,255,.72)", "rgba(173,164,159,.38)", "rgba(221,215,210,.48)"], 1701);
const blackFur = makeFurTexture("#25242a", ["rgba(132,128,137,.42)", "rgba(12,12,15,.48)", "rgba(83,79,88,.5)"], 2409);
const white = new THREE.MeshPhysicalMaterial({
  map: whiteFur, bumpMap: whiteFur, bumpScale: 0.042, roughness: 0.94,
  sheen: 0.36, sheenColor: 0xf0e9e3, sheenRoughness: 0.94
});
const black = new THREE.MeshPhysicalMaterial({
  map: blackFur, bumpMap: blackFur, bumpScale: 0.032, roughness: 0.88,
  sheen: 0.3, sheenColor: 0xd3cdd1, sheenRoughness: 0.96
});
const pawBlack = new THREE.MeshStandardMaterial({ color: 0x28272c, roughness: 0.78 });
const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfff9f3, roughness: 0.22 });
const iris = new THREE.MeshStandardMaterial({ color: 0x56372e, roughness: 0.24 });
const pupil = new THREE.MeshStandardMaterial({ color: 0x151318, roughness: 0.12 });
const eyeShine = new THREE.MeshBasicMaterial({ color: 0xffffff });
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x29272b, roughness: 0.34 });
const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x55464a, roughness: 0.7 });
const pink = new THREE.MeshStandardMaterial({ color: 0xe88fa8, roughness: 0.72 });
const palePink = new THREE.MeshStandardMaterial({ color: 0xffc7d5, roughness: 0.78 });
const petalWhite = new THREE.MeshStandardMaterial({ color: 0xfff7f0, roughness: 0.78 });
const leafGreen = new THREE.MeshStandardMaterial({ color: 0x6f965d, roughness: 0.86 });
const bambooGreen = new THREE.MeshStandardMaterial({ color: 0x698d57, roughness: 0.72 });
const bambooLight = new THREE.MeshStandardMaterial({ color: 0xa5bc7b, roughness: 0.65 });
const gold = new THREE.MeshStandardMaterial({ color: 0xe8b85f, roughness: 0.62 });
const whiteStrands = new THREE.MeshStandardMaterial({ color: 0xf3efeb, roughness: 0.98 });
const blackStrands = new THREE.MeshStandardMaterial({ color: 0x302f34, roughness: 0.96 });
const furStrandGeometry = new THREE.ConeGeometry(0.0045, 0.08, 4);
const furRandom = seededRandom(905);

function addFur(mesh, count, material) {
  const strands = new THREE.InstancedMesh(furStrandGeometry, material, count);
  const transform = new THREE.Object3D();
  strands.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  for (let index = 0; index < count; index += 1) {
    const height = furRandom() * 2 - 1;
    const angle = furRandom() * Math.PI * 2;
    const radius = Math.sqrt(1 - height * height);
    const normal = new THREE.Vector3(radius * Math.cos(angle), height, radius * Math.sin(angle));
    transform.position.copy(normal).multiplyScalar(1.04);
    transform.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    transform.scale.setScalar(0.72 + furRandom() * 0.6);
    transform.updateMatrix();
    strands.setMatrixAt(index, transform.matrix);
  }
  strands.castShadow = false;
  strands.receiveShadow = false;
  mesh.add(strands);
}

function ellipsoid(parent, material, position, scale, rotation = [0, 0, 0], furCount = 0) {
  const mesh = new THREE.Mesh(sphere, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  if (furCount) addFur(mesh, furCount, material === white ? whiteStrands : blackStrands);
  return mesh;
}

function makePanda() {
  const panda = new THREE.Group();
  const body = new THREE.Group();
  const head = new THREE.Group();
  panda.add(body, head);

  ellipsoid(body, white, [0, 0.93, 0], [0.55, 0.72, 0.43], [0, 0, 0], 450);
  ellipsoid(body, white, [0, 1.37, 0.015], [0.47, 0.31, 0.37], [0, 0, 0], 140);
  ellipsoid(body, black, [0, 0.48, -0.035], [0.46, 0.24, 0.35], [0, 0, 0], 180);
  ellipsoid(body, white, [0, 0.84, 0.386], [0.31, 0.43, 0.075], [0, 0, 0], 160);

  const armLeft = new THREE.Group();
  const armRight = new THREE.Group();
  armLeft.position.set(-0.47, 1.39, 0.005);
  armRight.position.set(0.47, 1.39, 0.005);
  body.add(armLeft, armRight);
  for (const [arm, direction] of [[armLeft, -1], [armRight, 1]]) {
    ellipsoid(arm, black, [direction * 0.035, -0.28, 0], [0.2, 0.37, 0.22], [0, 0, direction * 0.08], 180);
    ellipsoid(arm, pawBlack, [direction * 0.055, -0.53, 0.05], [0.19, 0.17, 0.19]);
    for (let toe = -1; toe <= 1; toe += 1) {
      ellipsoid(arm, pawBlack, [direction * 0.055 + toe * 0.075, -0.59, 0.1], [0.055, 0.07, 0.08]);
    }
  }

  const legLeft = new THREE.Group();
  const legRight = new THREE.Group();
  legLeft.position.set(-0.27, 0.39, 0.02);
  legRight.position.set(0.27, 0.39, 0.02);
  body.add(legLeft, legRight);
  for (const leg of [legLeft, legRight]) {
    ellipsoid(leg, black, [0, -0.17, 0], [0.24, 0.3, 0.25], [0, 0, 0], 160);
    ellipsoid(leg, pawBlack, [0, -0.34, 0.09], [0.25, 0.13, 0.31]);
  }

  head.position.set(0, 1.99, 0.015);
  ellipsoid(head, white, [0, 0, 0], [0.68, 0.59, 0.55], [0, 0, 0], 560);
  ellipsoid(head, black, [-0.46, 0.43, -0.015], [0.22, 0.24, 0.2], [0, 0, -0.22], 130);
  ellipsoid(head, black, [0.46, 0.43, -0.015], [0.22, 0.24, 0.2], [0, 0, 0.22], 130);

  const eyes = [];
  for (const side of [-1, 1]) {
    ellipsoid(head, black, [side * 0.27, 0.055, 0.42], [0.205, 0.275, 0.115], [0, 0, side * -0.34], 180);
    const eye = new THREE.Group();
    eye.position.set(side * 0.27, 0.06, 0.515);
    ellipsoid(eye, eyeWhite, [0, 0, 0], [0.09, 0.105, 0.066]);
    ellipsoid(eye, iris, [0, -0.008, 0.052], [0.055, 0.065, 0.027]);
    ellipsoid(eye, pupil, [0, -0.006, 0.071], [0.033, 0.045, 0.018]);
    ellipsoid(eye, eyeShine, [-0.014, 0.022, 0.086], [0.014, 0.018, 0.01]);
    head.add(eye);
    eyes.push(eye);
  }

  ellipsoid(head, white, [-0.105, -0.22, 0.47], [0.17, 0.125, 0.13], [0, 0, 0], 55);
  ellipsoid(head, white, [0.105, -0.22, 0.47], [0.17, 0.125, 0.13], [0, 0, 0], 55);
  ellipsoid(head, noseMaterial, [0, -0.155, 0.585], [0.105, 0.073, 0.068]);

  const mouthCurveLeft = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, -0.22, 0.575),
    new THREE.Vector3(-0.015, -0.31, 0.585),
    new THREE.Vector3(-0.09, -0.32, 0.555)
  );
  const mouthCurveRight = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, -0.22, 0.575),
    new THREE.Vector3(0.015, -0.31, 0.585),
    new THREE.Vector3(0.09, -0.32, 0.555)
  );
  head.add(new THREE.Mesh(new THREE.TubeGeometry(mouthCurveLeft, 10, 0.012, 5, false), mouthMaterial));
  head.add(new THREE.Mesh(new THREE.TubeGeometry(mouthCurveRight, 10, 0.012, 5, false), mouthMaterial));
  panda.userData.rig = { body, head, armLeft, armRight, legLeft, legRight, eyes };
  panda.traverse((part) => {
    if (part.isMesh && part.geometry !== furStrandGeometry) {
      part.castShadow = true;
      part.receiveShadow = true;
    }
  });
  return panda;
}

function addFlowerField(scene, random, count) {
  const placements = [];
  for (let index = 0; index < count; index += 1) {
    placements.push({
      x: (index % 2 === 0 ? -1 : 1) * (1.15 + random() * 2.8),
      y: -0.02,
      z: 2 - random() * 59,
      size: 0.56 + random() * 0.36,
      color: index % 3,
      rotation: random() * Math.PI * 2
    });
  }

  const transform = new THREE.Object3D();
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.032, 0.05, 0.64, 8), leafGreen, count);
  const leaves = new THREE.InstancedMesh(sphere, leafGreen, count * 2);
  const centers = new THREE.InstancedMesh(sphere, gold, count);
  const petalGeometry = new THREE.SphereGeometry(0.13, 14, 10);
  const petalMaterials = [pink, palePink, petalWhite];
  const petalCounts = [0, 0, 0];
  placements.forEach(({ color }) => {
    petalCounts[color] += 6;
  });
  const petals = petalMaterials.map((material, index) => new THREE.InstancedMesh(petalGeometry, material, petalCounts[index]));
  const petalIndices = [0, 0, 0];
  let leafIndex = 0;

  placements.forEach(({ x, y, z, size, color, rotation }, index) => {
    transform.position.set(x, y + 0.31 * size, z);
    transform.rotation.set(0, rotation, 0);
    transform.scale.set(size, size, size);
    transform.updateMatrix();
    stems.setMatrixAt(index, transform.matrix);

    for (const [leaf, offset, angle] of [[-1, 0.24, 0.38], [1, 0.39, -0.38]]) {
      transform.position.set(x + leaf * 0.12 * size, y + offset * size, z);
      transform.rotation.set(0, rotation, angle);
      transform.scale.set(size * 0.15, size * 0.045, size * 0.07);
      transform.updateMatrix();
      leaves.setMatrixAt(leafIndex, transform.matrix);
      leafIndex += 1;
    }

    transform.position.set(x, y + 0.64 * size, z + 0.045 * size);
    transform.rotation.set(0, rotation, 0);
    transform.scale.set(size * 0.095, size * 0.095, size * 0.085);
    transform.updateMatrix();
    centers.setMatrixAt(index, transform.matrix);

    for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
      const angle = (Math.PI * 2 * petalIndex) / 6;
      transform.position.set(x + Math.cos(angle) * 0.17 * size, y + (0.64 + Math.sin(angle) * 0.17) * size, z);
      transform.rotation.set(0, rotation, angle - Math.PI / 2);
      transform.scale.set(size * 0.83, size * 1.25, size * 0.55);
      transform.updateMatrix();
      petals[color].setMatrixAt(petalIndices[color], transform.matrix);
      petalIndices[color] += 1;
    }
  });

  [stems, leaves, centers, ...petals].forEach((instances) => {
    instances.computeBoundingSphere();
    scene.add(instances);
  });
}

function addBambooCluster(scene, x, z, height, random) {
  const stalkCount = 3 + Math.floor(random() * 2);
  const maxSegments = stalkCount * Math.ceil((height + 0.4) / 0.78);
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.065, 0.065, 0.78, 10), bambooGreen, maxSegments);
  const joints = new THREE.InstancedMesh(new THREE.TorusGeometry(0.064, 0.012, 5, 10), bambooLight, maxSegments);
  const leaves = new THREE.InstancedMesh(sphere, leafGreen, maxSegments * 2);
  const transform = new THREE.Object3D();
  let stemIndex = 0;
  let jointIndex = 0;
  let leafIndex = 0;

  for (let stalkIndex = 0; stalkIndex < stalkCount; stalkIndex += 1) {
    const heightOffset = (random() - 0.5) * 0.65;
    const stalkHeight = height + heightOffset;
    const stalkX = (random() - 0.5) * 0.56;
    const stalkZ = (random() - 0.5) * 0.42;
    const segmentHeight = 0.78;
    const segments = Math.ceil(stalkHeight / segmentHeight);
    for (let index = 0; index < segments; index += 1) {
      const sectionHeight = Math.min(segmentHeight, stalkHeight - index * segmentHeight);
      transform.position.set(x + stalkX, index * segmentHeight + sectionHeight / 2, z + stalkZ);
      transform.rotation.set(0, 0, 0);
      transform.scale.set(1, sectionHeight / segmentHeight, 1);
      transform.updateMatrix();
      stems.setMatrixAt(stemIndex, transform.matrix);
      stemIndex += 1;

      if (index > 0) {
        transform.position.set(x + stalkX, index * segmentHeight, z + stalkZ);
        transform.rotation.set(Math.PI / 2, 0, 0);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        joints.setMatrixAt(jointIndex, transform.matrix);
        jointIndex += 1;
      }
      if (index > 0 || stalkIndex === 0) {
        for (const direction of [-1, 1]) {
          transform.position.set(
            x + stalkX + direction * (0.12 + random() * 0.12),
            index * segmentHeight + 0.08,
            z + stalkZ + (random() - 0.5) * 0.1
          );
          transform.rotation.set(0, direction * 0.42, direction * -0.44);
          transform.scale.set(0.22 + random() * 0.1, 0.025, 0.055);
          transform.updateMatrix();
          leaves.setMatrixAt(leafIndex, transform.matrix);
          leafIndex += 1;
        }
      }
    }
  }
  stems.count = stemIndex;
  joints.count = jointIndex;
  leaves.count = leafIndex;
  stems.castShadow = true;
  stems.computeBoundingSphere();
  joints.computeBoundingSphere();
  leaves.computeBoundingSphere();
  scene.add(stems, joints, leaves);
}

function addBushField(scene, random, count) {
  const instances = new THREE.InstancedMesh(sphere, leafGreen, count * 5);
  const transform = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const x = side * (1.3 + random() * 3.9);
    const z = 1 - random() * 58;
    const size = 0.32 + random() * 0.48;
    for (let clump = 0; clump < 5; clump += 1) {
      const angle = (Math.PI * 2 * clump) / 5;
      transform.position.set(
        x + Math.cos(angle) * size * 0.34,
        -0.08 + size * (0.32 + random() * 0.16),
        z + Math.sin(angle) * size * 0.2
      );
      transform.rotation.set(0, 0, (random() - 0.5) * 0.3);
      transform.scale.set(size * 0.46, size * (0.35 + random() * 0.18), size * 0.35);
      transform.updateMatrix();
      instances.setMatrixAt(index * 5 + clump, transform.matrix);
    }
  }
  instances.computeBoundingSphere();
  scene.add(instances);
}
function makeGrassTexture() {
  const random = seededRandom(481);
  return makeTexture((context, width, height) => {
    context.fillStyle = "#6f8e59";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 17000; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const shade = Math.floor(76 + random() * 86);
      context.strokeStyle = `rgba(${shade * 0.58},${shade},${shade * 0.43},${0.18 + random() * 0.36})`;
      context.lineWidth = 0.7 + random() * 1.4;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 4, y - 3 - random() * 8);
      context.stroke();
    }
  }, 14, 34);
}

function addGrassBlades(scene, random) {
  const blade = new THREE.BufferGeometry();
  blade.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.018, 0, 0, 0.018, 0, 0, 0.004, 0.15, 0.018
  ], 3));
  blade.setIndex([0, 1, 2]);
  blade.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.94,
    side: THREE.DoubleSide
  });
  const bladeCount = 13000;
  const placements = [];
  for (let index = 0; index < bladeCount; index += 1) {
    const x = (random() - 0.5) * 13.5;
    const z = 2.2 - random() * 59;
    if (Math.abs(x) < 1.05 && z > -3.8) continue;
    placements.push({ x, z, scale: 0.58 + random() * 1.25, rotation: random() * Math.PI });
  }
  const plant = new THREE.Object3D();
  const colors = [0x93aa70, 0x7d9c61, 0xacc17e, 0x698b55].map((color) => new THREE.Color(color));
  [0, Math.PI / 2].forEach((crossAngle) => {
    const blades = new THREE.InstancedMesh(blade, material, placements.length);
    blades.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    placements.forEach(({ x, z, scale, rotation }, index) => {
      plant.position.set(x, -0.028, z);
      plant.rotation.set(0, rotation + crossAngle, (random() - 0.5) * 0.12);
      plant.scale.set(scale, scale, scale);
      plant.updateMatrix();
      blades.setMatrixAt(index, plant.matrix);
      blades.setColorAt(index, colors[Math.floor(random() * colors.length)]);
    });
    blades.computeBoundingSphere();
    scene.add(blades);
  });
}

function addHills(scene) {
  const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x91ae79, roughness: 1 });
  const hillGeometry = new THREE.SphereGeometry(1, 24, 16);
  const hills = [
    [-6.4, -0.72, -12, 5.2, 2.3, 2.8],
    [6.8, -0.82, -13, 5.7, 2.6, 3.2],
    [0.4, -1.32, -16, 7.5, 2.4, 3.3],
    [-6.8, -0.82, -35, 5.7, 2.6, 3.2],
    [6.1, -0.72, -37, 5.2, 2.3, 2.8],
    [0.4, -1.32, -41, 7.5, 2.4, 3.3],
    [-6.2, -0.82, -57, 5.7, 2.6, 3.2],
    [6.6, -0.72, -59, 5.2, 2.3, 2.8]
  ];
  const instances = new THREE.InstancedMesh(hillGeometry, hillMaterial, hills.length);
  const transform = new THREE.Object3D();
  hills.forEach(([x, y, z, sx, sy, sz], index) => {
    transform.position.set(x, y, z);
    transform.scale.set(sx, sy, sz);
    transform.updateMatrix();
    instances.setMatrixAt(index, transform.matrix);
  });
  instances.computeBoundingSphere();
  scene.add(instances);
}

function addBackgroundPanda(scene, x, z, scale, behavior, index) {
  const panda = makePanda();
  panda.scale.setScalar(scale);
  panda.position.set(x, 0, z);
  panda.rotation.y = x < 0 ? 0.15 : -0.15;
  const { legLeft, legRight, armLeft } = panda.userData.rig;
  if (behavior === "sitting") {
    legLeft.rotation.x = -0.78;
    legRight.rotation.x = -0.78;
    armLeft.rotation.x = -0.18;
  }
  scene.add(panda);
  return { panda, behavior, x, z, index };
}

function addPetals(scene, random) {
  const petals = [];
  for (let index = 0; index < 10; index += 1) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 6),
      index % 2 ? palePink : petalWhite
    );
    petal.scale.set(1, 1.7, 0.35);
    const x = (random() - 0.5) * 7;
    const y = 0.8 + random() * 3;
    const z = 1 - random() * 57;
    petal.position.set(x, y, z);
    petal.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    scene.add(petal);
    petals.push({ mesh: petal, x, y, phase: random() * Math.PI * 2, speed: 0.16 + random() * 0.18 });
  }
  return petals;
}

function makePathTexture() {
  const random = seededRandom(3301);
  return makeTexture((context, width, height) => {
    context.fillStyle = "#b89b7b";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 9000; index += 1) {
      const shade = Math.floor(116 + random() * 72);
      context.fillStyle = `rgba(${shade},${shade * 0.79},${shade * 0.6},${0.12 + random() * 0.3})`;
      context.beginPath();
      context.ellipse(random() * width, random() * height, 1 + random() * 3, 1 + random() * 2, random(), 0, Math.PI * 2);
      context.fill();
    }
  }, 2, 18);
}

function addGardenPath(scene) {
  const segments = 120;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const z = 4 - progress * 66;
    const center = Math.sin(progress * Math.PI * 5) * 0.68;
    positions.push(center - 0.92, -0.018, z, center + 0.92, -0.018, z);
    uvs.push(0, progress * 18, 1, progress * 18);
    if (index < segments) {
      const point = index * 2;
      indices.push(point, point + 2, point + 1, point + 1, point + 2, point + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const path = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: makePathTexture(), roughness: 1, side: THREE.DoubleSide }));
  path.receiveShadow = true;
  scene.add(path);
}

function addRocks(scene, random) {
  const geometry = new THREE.IcosahedronGeometry(0.18, 1);
  const materials = [0x9d9a8b, 0xb5aa95, 0x858b7b].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  const placements = materials.map(() => []);
  for (let index = 0; index < 34; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const size = 0.45 + random() * 1.4;
    placements[index % materials.length].push({
      x: side * (1.3 + random() * 4.2),
      y: -0.04,
      z: 1 - random() * 60,
      scale: [size, size * (0.55 + random() * 0.4), size * (0.7 + random() * 0.5)],
      rotation: [random(), random(), random()]
    });
  }
  const transform = new THREE.Object3D();
  placements.forEach((rocks, index) => {
    const instances = new THREE.InstancedMesh(geometry, materials[index], rocks.length);
    rocks.forEach(({ x, y, z, scale, rotation }, rockIndex) => {
      transform.position.set(x, y, z);
      transform.rotation.set(...rotation);
      transform.scale.set(...scale);
      transform.updateMatrix();
      instances.setMatrixAt(rockIndex, transform.matrix);
    });
    instances.computeBoundingSphere();
    scene.add(instances);
  });
}

function createStars(scene, random) {
  const positions = [];
  for (let index = 0; index < 55; index += 1) {
    positions.push((random() - 0.5) * 9, random() * 5 + 0.5, 1 - random() * 59);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffe6ec, size: 0.035, transparent: true, opacity: 0.55 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

function smoothstep(value) {
  const amount = THREE.MathUtils.clamp(value, 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function buildGarden(canvas, preloader = false) {
  if (!canvas || !window.WebGLRenderingContext) return null;

  try {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const compactDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 600;
    const targetFrameDuration = compactDevice ? 1000 / 45 : 1000 / 60;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !compactDevice, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1 : 1.25));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = window.innerWidth > 600;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xdfe9d5, 8, 25);
    const camera = new THREE.PerspectiveCamera(preloader ? 34 : 40, width / height, 0.1, 60);
    camera.position.set(0, preloader ? 2.25 : 2.05, preloader ? 9.2 : 7.2);
    camera.lookAt(0, 1.13, -0.3);

    scene.add(new THREE.HemisphereLight(0xfff8f2, 0x667c52, 1.8));
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.6);
    keyLight.position.set(-3.5, 8, 5);
    keyLight.castShadow = renderer.shadowMap.enabled;
    keyLight.shadow.mapSize.set(renderer.shadowMap.enabled ? 512 : 256, renderer.shadowMap.enabled ? 512 : 256);
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 3;
    const lightTarget = new THREE.Object3D();
    keyLight.target = lightTarget;
    scene.add(keyLight, lightTarget);
    const fillLight = new THREE.PointLight(0xffc6d4, 0.65, 14);
    fillLight.position.set(3.2, 3.5, 3.4);
    scene.add(fillLight);

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 84),
      new THREE.MeshStandardMaterial({ map: makeGrassTexture(), roughness: 1 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.035, -25);
    grass.receiveShadow = true;
    scene.add(grass);
    addHills(scene);
    addGardenPath(scene);

    const random = seededRandom(3407);
    addGrassBlades(scene, random);
    addRocks(scene, random);
    addFlowerField(scene, random, 82);
    addBushField(scene, random, 34);
    [
      [-2.9, -1.3, 3.4], [2.9, -1.75, 3.15], [-4.1, -3.1, 2.7], [4, -3.4, 2.9],
      [-3.6, -10.5, 3.6], [3.8, -14.2, 3.1], [-3.2, -20.5, 3.4], [3.4, -26.8, 3.2],
      [-3.8, -33.5, 3.6], [3.8, -39.5, 3], [-3.2, -47, 3.5], [2.8, -53, 3.2]
    ].forEach(([x, z, height]) => addBambooCluster(scene, x, z, height, random));

    const panda = makePanda();
    panda.position.set(0, 0, -3.8);
    if (preloader && reducedMotion) {
      panda.position.z = 1.35;
      panda.userData.rig.armLeft.rotation.x = -0.34;
      panda.userData.rig.armRight.rotation.x = -0.34;
    }
    scene.add(panda);

    const backgroundPandas = [
      addBackgroundPanda(scene, -2.45, -3.5, 0.43, "sitting", 0),
      addBackgroundPanda(scene, 2.38, -3.8, 0.4, "eating", 1),
      addBackgroundPanda(scene, -2.65, -16, 0.4, "wandering", 2),
      addBackgroundPanda(scene, 2.45, -32, 0.42, "sitting", 3),
      addBackgroundPanda(scene, -1.9, -50, 0.4, "eating", 4)
    ];
    const pandaCharacters = [panda, ...backgroundPandas.map(({ panda: backgroundPanda }) => backgroundPanda)];
    const pandaRaycaster = new THREE.Raycaster();
    const pandaPointer = new THREE.Vector2();
    const petals = addPetals(scene, random);
    const stars = preloader ? createStars(scene, random) : null;
    const clock = new THREE.Clock();
    const sceneElement = preloader ? document.getElementById("preloader-scene") : null;
    let active = preloader;
    let stopped = false;
    let frame = 0;
    let lastFrame = 0;
    let previousElapsed = 0;
    let wasKissing = false;
    let introDismissed = false;
    let elapsedTime = 0;

    function syncCameraToScroll(delta = Infinity) {
      if (!introDismissed) return;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1);
      const smoothing = Number.isFinite(delta) ? 1 - Math.exp(-14 * Math.max(0, delta)) : 1;
      const targetY = 2.25 - progress * 0.18;
      const targetZ = 9.2 - progress * 34;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, smoothing);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, smoothing);
      camera.lookAt(0, 1.13, camera.position.z - 9.5);
      keyLight.position.set(-3.5, 8, camera.position.z + 5);
      lightTarget.position.set(0, 0, camera.position.z - 9);
      fillLight.position.set(3.2, 3.5, camera.position.z - 2.2);
    }

    function startWave(character) {
      const rig = character.userData.rig;
      if (reducedMotion) {
        window.clearTimeout(character.userData.waveTimer);
        const originalPose = character.userData.waveOriginalPose || {
          leftX: rig.armLeft.rotation.x,
          rightX: rig.armRight.rotation.x,
          rightZ: rig.armRight.rotation.z
        };
        character.userData.waveOriginalPose = originalPose;
        rig.armLeft.rotation.x = -0.45;
        rig.armRight.rotation.x = -1;
        rig.armRight.rotation.z = 0;
        renderer.render(scene, camera);
        character.userData.waveTimer = window.setTimeout(() => {
          rig.armLeft.rotation.x = originalPose.leftX;
          rig.armRight.rotation.x = originalPose.rightX;
          rig.armRight.rotation.z = originalPose.rightZ;
          delete character.userData.waveOriginalPose;
          renderer.render(scene, camera);
        }, 1400);
        return;
      }

      character.userData.waveStart = elapsedTime;
    }

    function closestPandaToScreenPoint(x, y) {
      const bounds = canvas.getBoundingClientRect();
      let closestPanda = panda;
      let closestDistance = Infinity;
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();

      pandaCharacters.forEach((character) => {
        const head = new THREE.Vector3(0, 2.25, 0).applyMatrix4(character.matrixWorld).project(camera);
        if (head.z < -1 || head.z > 1) return;
        const screenX = bounds.left + (head.x * 0.5 + 0.5) * bounds.width;
        const screenY = bounds.top + (-head.y * 0.5 + 0.5) * bounds.height;
        const distance = Math.hypot(screenX - x, screenY - y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPanda = character;
        }
      });

      return closestPanda;
    }

    function handlePandaGreeting(event) {
      const character = pandaCharacters.includes(event.detail.character)
        ? event.detail.character
        : closestPandaToScreenPoint(event.detail.x, event.detail.y);
      startWave(character);
    }

    function handlePandaSceneClick(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (target && target.closest("[data-panda-greet]")) return;
      if (target && target.closest('a, button, input, select, textarea, [role="button"], [role="link"], [contenteditable="true"]')) return;

      const bounds = canvas.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      pandaPointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      );
      camera.updateMatrixWorld();
      scene.updateMatrixWorld(true);
      pandaRaycaster.setFromCamera(pandaPointer, camera);
      const hit = pandaRaycaster.intersectObjects(pandaCharacters, true)[0];
      if (!hit) return;

      let character = hit.object;
      while (character && !pandaCharacters.includes(character)) character = character.parent;
      if (!character) return;

      const head = new THREE.Vector3(0, 2.25, 0).applyMatrix4(character.matrixWorld).project(camera);
      window.dispatchEvent(new CustomEvent("panda-greet", {
        detail: {
          character,
          x: bounds.left + (head.x * 0.5 + 0.5) * bounds.width,
          y: bounds.top + (-head.y * 0.5 + 0.5) * bounds.height
        }
      }));
    }

    window.addEventListener("panda-greet", handlePandaGreeting);
    document.addEventListener("click", handlePandaSceneClick, true);

    function animate(elapsed) {
      elapsedTime = elapsed;
      const rig = panda.userData.rig;
      rig.body.scale.y = 1 + Math.sin(elapsed * 2.15) * 0.008;
      rig.head.rotation.x = Math.sin(elapsed * 0.72) * 0.025;
      rig.head.rotation.z = Math.sin(elapsed * 0.48) * 0.025;

      const blinkPhase = elapsed % 4.6;
      const blink = blinkPhase > 4.28 ? Math.max(0.12, 1 - (blinkPhase - 4.28) / 0.16) : 1;
      rig.eyes.forEach((eye) => {
        eye.scale.y = blink;
      });

      let kissing = false;
      if (preloader) {
        const walkProgress = smoothstep((elapsed - 1.55) / 4.2);
        const approachZ = -3.8 + walkProgress * 5.25;
        const walking = elapsed > 1.55 && elapsed < 5.85;
        const walkBlend = walking ? Math.sin(Math.PI * THREE.MathUtils.clamp((elapsed - 1.55) / 4.3, 0, 1)) : 0;
        const gait = ((elapsed - 1.55) * Math.PI * 2) / 1.16;
        rig.legLeft.rotation.x = Math.sin(gait) * 0.31 * walkBlend;
        rig.legRight.rotation.x = Math.sin(gait + Math.PI) * 0.31 * walkBlend;
        rig.armLeft.rotation.x = Math.sin(gait + Math.PI) * 0.16 * walkBlend;
        rig.armRight.rotation.x = Math.sin(gait) * 0.16 * walkBlend;
        rig.body.position.x = Math.sin(gait) * 0.025 * walkBlend;
        rig.body.position.y = walking ? Math.abs(Math.sin(gait)) * 0.018 : 0;
        rig.body.rotation.z = Math.sin(gait) * 0.018 * walkBlend;
        rig.head.rotation.y = elapsed < 1.55 ? Math.sin(elapsed * 1.8) * 0.14 : (1 - walkProgress) * Math.sin(elapsed * 1.5) * 0.07;

        const greet = smoothstep((elapsed - 5.72) / 0.85);
        const relax = smoothstep((elapsed - 8.6) / 0.7);
        const armsRaised = greet * (1 - relax);
        rig.armLeft.rotation.x = -0.94 * armsRaised + Math.sin(elapsed * 2) * 0.035 * armsRaised;
        rig.armRight.rotation.x = -0.94 * armsRaised + Math.sin(elapsed * 2 + 0.35) * 0.035 * armsRaised;
        rig.armLeft.rotation.z = -0.22 * armsRaised;
        rig.armRight.rotation.z = 0.22 * armsRaised;
        rig.head.rotation.z += 0.12 * greet * (1 - relax);

        const kissApproach = smoothstep((elapsed - 7.75) / 0.42);
        const kissRetreat = smoothstep((elapsed - 8.35) / 0.48);
        const retreat = smoothstep((elapsed - 9.55) / 2.8);
        const retreatWalk = elapsed > 9.55 && elapsed < 12.35
          ? Math.sin(Math.PI * smoothstep((elapsed - 9.55) / 2.8))
          : 0;
        const retreatGait = ((elapsed - 9.55) * Math.PI * 2) / 1.36;
        panda.position.x = -1.7 * retreat;
        panda.position.z = THREE.MathUtils.lerp(
          approachZ + 0.2 * kissApproach * (1 - kissRetreat),
          -7.5,
          retreat
        );
        panda.rotation.y = -0.22 * retreat;
        rig.legLeft.rotation.x = THREE.MathUtils.lerp(rig.legLeft.rotation.x, Math.sin(retreatGait) * 0.24 * retreatWalk - 0.78 * retreat, retreat);
        rig.legRight.rotation.x = THREE.MathUtils.lerp(rig.legRight.rotation.x, Math.sin(retreatGait + Math.PI) * 0.24 * retreatWalk - 0.78 * retreat, retreat);
        rig.body.position.y = Math.abs(Math.sin(retreatGait)) * 0.012 * retreatWalk;
        rig.armLeft.rotation.x = THREE.MathUtils.lerp(rig.armLeft.rotation.x, Math.sin(retreatGait + Math.PI) * 0.14 * retreatWalk - 0.12 * retreat, retreat);
        rig.armRight.rotation.x = THREE.MathUtils.lerp(rig.armRight.rotation.x, Math.sin(retreatGait) * 0.14 * retreatWalk, retreat);
        rig.head.position.z = 0.015 + 0.17 * kissApproach * (1 - kissRetreat);
        rig.head.rotation.x += 0.1 * kissApproach * (1 - kissRetreat);
        kissing = elapsed >= 8.08 && elapsed <= 8.92;
      }

      if (sceneElement && kissing !== wasKissing) {
        sceneElement.classList.toggle("is-kissing", kissing);
        wasKissing = kissing;
      }

      backgroundPandas.forEach(({ panda: backgroundPanda, behavior, x, z, index }) => {
        const backgroundRig = backgroundPanda.userData.rig;
        const phase = elapsed * 0.72 + index * 1.7;
        backgroundRig.body.scale.y = 1 + Math.sin(phase) * 0.006;
        backgroundRig.armLeft.rotation.x = behavior === "sitting" ? -0.18 : 0;
        backgroundRig.armRight.rotation.x = 0;
        backgroundRig.armRight.rotation.z = 0;
        if (behavior === "eating") {
          backgroundRig.head.rotation.x = 0.1 + Math.sin(elapsed * 1.3) * 0.075;
          backgroundRig.head.rotation.y = Math.sin(elapsed * 0.62) * 0.07;
          backgroundRig.armRight.rotation.x = -0.18 + Math.sin(elapsed * 1.3) * 0.08;
        } else if (behavior === "wandering") {
          backgroundPanda.position.x = x + Math.sin(elapsed * 0.18) * 0.5;
          backgroundPanda.position.z = z + Math.sin(elapsed * 0.24) * 0.18;
          backgroundRig.head.rotation.y = Math.sin(elapsed * 0.7) * 0.16;
        } else {
          backgroundRig.head.rotation.y = Math.sin(phase) * 0.11;
        }
      });

      pandaCharacters.forEach((character) => {
        const waveStart = character.userData.waveStart;
        if (waveStart === undefined) return;
        const progress = (elapsed - waveStart) / 2.4;
        if (progress >= 1) {
          delete character.userData.waveStart;
          return;
        }

        const lift = smoothstep(progress / 0.16) * (1 - smoothstep((progress - 0.78) / 0.22));
        const characterRig = character.userData.rig;
        const armX = characterRig.armRight.rotation.x;
        const armZ = characterRig.armRight.rotation.z;
        const headX = characterRig.head.rotation.x;
        const headY = characterRig.head.rotation.y;
        character.updateMatrixWorld(true);
        const cameraInPandaSpace = character.worldToLocal(camera.position.clone());
        const horizontalDistance = Math.hypot(cameraInPandaSpace.x, cameraInPandaSpace.z);
        const targetHeadY = THREE.MathUtils.clamp(
          Math.atan2(cameraInPandaSpace.x, cameraInPandaSpace.z),
          -1.15,
          1.15
        );
        const targetHeadX = THREE.MathUtils.clamp(
          -Math.atan2(cameraInPandaSpace.y - characterRig.head.position.y, horizontalDistance),
          -0.3,
          0.3
        );
        const headYawDelta = Math.atan2(Math.sin(targetHeadY - headY), Math.cos(targetHeadY - headY));
        characterRig.armLeft.rotation.x -= 0.3 * lift;
        characterRig.armRight.rotation.x = armX - 0.92 * lift;
        characterRig.armRight.rotation.z = armZ + Math.sin((elapsed - waveStart) * 13) * 0.42 * lift;
        characterRig.head.rotation.x = headX + (targetHeadX - headX) * lift;
        characterRig.head.rotation.y = headY + headYawDelta * lift;
      });

      petals.forEach(({ mesh, x, y, phase, speed }) => {
        mesh.position.y = y + Math.sin(elapsed * speed + phase) * 0.35;
        mesh.position.x = x + Math.cos(elapsed * speed * 0.7 + phase) * 0.6;
        mesh.rotation.z = phase + elapsed * speed;
      });
      if (stars) stars.rotation.y = elapsed * 0.018;
    }

    const handleScroll = () => {
      if (reducedMotion) {
        syncCameraToScroll();
        renderer.render(scene, camera);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const resize = () => {
      const nextWidth = Math.max(1, canvas.clientWidth);
      const nextHeight = Math.max(1, canvas.clientHeight);
      renderer.setSize(nextWidth, nextHeight, false);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      syncCameraToScroll();
      if (reducedMotion || !active) renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const render = (timestamp = 0) => {
      if (stopped) return;
      if (!reducedMotion && timestamp - lastFrame < targetFrameDuration) {
        frame = window.requestAnimationFrame(render);
        return;
      }
      lastFrame = timestamp;
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(Math.max(0, elapsed - previousElapsed), 0.05);
      previousElapsed = elapsed;
      if (active && !reducedMotion) animate(elapsed);
      syncCameraToScroll(delta);
      renderer.render(scene, camera);
      if (active && !reducedMotion) frame = window.requestAnimationFrame(render);
    };
    render();

    return {
      dismiss() {
        introDismissed = true;
        if (reducedMotion) {
          panda.position.set(-1.7, 0, -7.5);
          panda.userData.rig.legLeft.rotation.x = -0.78;
          panda.userData.rig.legRight.rotation.x = -0.78;
        }
        syncCameraToScroll();
        if (reducedMotion) renderer.render(scene, camera);
      },
      stop() {
        stopped = true;
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("panda-greet", handlePandaGreeting);
        document.removeEventListener("click", handlePandaSceneClick, true);
        pandaCharacters.forEach((character) => window.clearTimeout(character.userData.waveTimer));
        observer.disconnect();
        renderer.dispose();
      }
    };
  } catch (error) {
    console.warn("The 3D panda garden could not be initialized.", error);
    return null;
  }
}

const garden = buildGarden(document.getElementById("garden-canvas"), true);
if (garden) document.body.classList.add("webgl-garden-ready");
window.addEventListener("garden-preloader-dismissed", () => {
  garden?.dismiss();
}, { once: true });
window.addEventListener("pagehide", () => garden?.stop(), { once: true });
