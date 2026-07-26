/**
 * Dust2-inspired map layout for Red Hot V1
 * Coordinates: X = east/west, Z = north/south, Y = up
 * Map roughly 120x120 units
 */

export const MAP_SIZE = 120;
export const WALL_HEIGHT = 4;

export function buildMap(scene) {
  const walls = [];
  const floorMat = new THREE.MeshLambertMaterial({ color: 0xc4a882 });
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xd4b892 });
  const darkWallMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
  const crateMat = new THREE.MeshLambertMaterial({ color: 0x6b5030 });

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE),
    floorMat
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  function addWall(x, z, w, d, h = WALL_HEIGHT, mat = wallMat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    walls.push({ mesh, x, z, w, d, h });
    return mesh;
  }

  function addCrate(x, z, w, d, h = 2) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), crateMat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    scene.add(mesh);
    walls.push({ mesh, x, z, w, d, h });
    return mesh;
  }

  // Outer boundary
  const half = MAP_SIZE / 2;
  addWall(0, -half + 1, MAP_SIZE, 2);
  addWall(0, half - 1, MAP_SIZE, 2);
  addWall(-half + 1, 0, 2, MAP_SIZE);
  addWall(half - 1, 0, 2, MAP_SIZE);

  // ── CT Spawn (southwest) ──
  addWall(-35, -35, 20, 2);
  addWall(-45, -28, 2, 16);
  addWall(-25, -28, 2, 16);

  // ── T Spawn (northeast) ──
  addWall(35, 35, 20, 2);
  addWall(45, 28, 2, 16);
  addWall(25, 28, 2, 16);

  // ── Mid area ──
  addWall(0, 0, 2, 30);
  addWall(0, -18, 14, 2);
  addWall(8, -10, 2, 18);

  // Mid doors / boxes
  addCrate(-6, -8, 3, 3);
  addCrate(6, -8, 3, 3);
  addCrate(0, 5, 4, 2);

  // ── A Site (long / east) ──
  addWall(30, -15, 2, 30);
  addWall(40, 0, 2, 30);
  addWall(35, -30, 12, 2);
  addWall(35, 15, 12, 2);
  addCrate(32, -5, 3, 3);
  addCrate(38, -5, 3, 3);
  addCrate(35, 5, 4, 4, 3);

  // A ramp / catwalk
  addWall(22, -20, 2, 20);
  addWall(22, 10, 2, 20);

  // ── B Site (short / west) ──
  addWall(-30, 10, 2, 30);
  addWall(-40, 25, 2, 20);
  addWall(-35, 0, 12, 2);
  addWall(-35, 30, 12, 2);
  addCrate(-32, 15, 3, 3);
  addCrate(-38, 18, 3, 3);
  addCrate(-35, 22, 4, 4, 3);

  // B tunnels
  addWall(-20, 20, 2, 16);
  addWall(-15, 28, 12, 2);

  // ── Connecting corridors ──
  addWall(-10, -25, 2, 20);
  addWall(10, 20, 2, 20);
  addWall(-5, 35, 20, 2);

  // Cover crates scattered
  addCrate(-15, -10, 2, 2);
  addCrate(15, 10, 2, 2);
  addCrate(-8, 0, 2, 2);
  addCrate(12, -15, 2, 2);
  addCrate(-20, -5, 2, 2);
  addCrate(20, 5, 2, 2);

  // Site markers (bomb plant zones)
  const siteMat = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.15,
  });

  const aSite = new THREE.Mesh(new THREE.CircleGeometry(6, 32), siteMat);
  aSite.rotation.x = -Math.PI / 2;
  aSite.position.set(35, 0.05, -5);
  scene.add(aSite);

  const bSite = new THREE.Mesh(new THREE.CircleGeometry(6, 32), siteMat);
  bSite.rotation.x = -Math.PI / 2;
  bSite.position.set(-35, 0.05, 18);
  scene.add(bSite);

  return {
    walls,
    sites: {
      A: { x: 35, z: -5, radius: 6 },
      B: { x: -35, z: 18, radius: 6 },
    },
    spawns: {
      red: [
        { x: 35, z: 40, angle: -Math.PI / 2 },
        { x: 40, z: 35, angle: -Math.PI / 2 },
        { x: 30, z: 38, angle: -Math.PI / 2 },
        { x: 38, z: 42, angle: -Math.PI / 2 },
        { x: 42, z: 38, angle: -Math.PI / 2 },
      ],
      hot: [
        { x: -35, z: -40, angle: Math.PI / 2 },
        { x: -40, z: -35, angle: Math.PI / 2 },
        { x: -30, z: -38, angle: Math.PI / 2 },
        { x: -38, z: -42, angle: Math.PI / 2 },
        { x: -42, z: -38, angle: Math.PI / 2 },
      ],
    },
  };
}

export function checkWallCollision(x, z, radius, walls) {
  for (const w of walls) {
    const halfW = w.w / 2 + radius;
    const halfD = w.d / 2 + radius;
    if (Math.abs(x - w.x) < halfW && Math.abs(z - w.z) < halfD) {
      return true;
    }
  }
  const half = MAP_SIZE / 2 - radius;
  if (Math.abs(x) > half || Math.abs(z) > half) return true;
  return false;
}

export function resolveWallCollision(x, z, prevX, prevZ, radius, walls) {
  if (!checkWallCollision(x, z, radius, walls)) return { x, z };

  const tryX = checkWallCollision(x, prevZ, radius, walls);
  const tryZ = checkWallCollision(prevX, z, radius, walls);

  if (!tryX) return { x, z: prevZ };
  if (!tryZ) return { x: prevX, z };
  return { x: prevX, z: prevZ };
}
