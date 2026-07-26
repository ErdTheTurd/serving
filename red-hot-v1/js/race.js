import { calcSpeedProfile, mphToGameSpeed, gameSpeedToMph, sampleRaceMph } from './progression.js';
import { resolveWallCollision } from './map.js';

const LAPS = 3;
const RACE_BOTS = 4;

export class RaceMode {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.track = null;
    this.runners = [];
    this.playerIdx = 0;
    this.lap = 0;
    this.checkpoints = [];
    this.nextCheckpoint = 0;
    this.finished = [];
    this.raceTimer = 0;
    this.countdown = 3;
    this.state = 'countdown';
  }

  buildTrack(scene) {
    const walls = [];
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    function addWall(x, z, w, d) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 3, d), trackMat);
      mesh.position.set(x, 1.5, z);
      mesh.castShadow = true;
      scene.add(mesh);
      walls.push({ x, z, w, d, h: 3 });
      return mesh;
    }

    // Oval track ~80x50
    addWall(0, -30, 90, 2);
    addWall(0, 30, 90, 2);
    addWall(-42, 0, 2, 64);
    addWall(42, 0, 2, 64);
    addWall(-30, -22, 30, 2);
    addWall(30, -22, 30, 2);
    addWall(-30, 22, 30, 2);
    addWall(30, 22, 30, 2);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 40), trackMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    scene.add(road);

    // Start line
    const startLine = new THREE.Mesh(new THREE.PlaneGeometry(12, 1), lineMat);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(0, 0.05, 28);
    scene.add(startLine);

    this.checkpoints = [
      { x: 0, z: 28, r: 8 },
      { x: 38, z: 0, r: 8 },
      { x: 0, z: -28, r: 8 },
      { x: -38, z: 0, r: 8 },
    ];

    this.track = { walls, startPos: { x: 0, z: 24, angle: -Math.PI / 2 } };
    return this.track;
  }

  start(garageCar, garage) {
    this.active = true;
    this.garage = garage;
    this.garageCar = garageCar;
    this.lap = 0;
    this.nextCheckpoint = 0;
    this.finished = [];
    this.raceTimer = 0;
    this.countdown = 3;
    this.state = 'countdown';
    this.runners = [];

    const profile = calcSpeedProfile(garageCar, garage.profile.totalRaces);

    // Player
    this.runners.push({
      name: 'You',
      isPlayer: true,
      x: -4, z: 24, angle: -Math.PI / 2, speed: 0,
      profile, color: garageCar.color,
      lap: 0, nextCp: 0, finished: false, finishTime: 0,
      mesh: null, currentMph: 0, topMph: 0,
    });

    // AI opponents with varied profiles
    const aiNames = ['V8Ghost', 'TurboTom', 'NitroNina', 'DriftDax'];
    for (let i = 0; i < RACE_BOTS; i++) {
      const baseMph = profile.centerMph + (Math.random() * 2 - 1) * 20;
      const aiProfile = {
        centerMph: Math.round(baseMph),
        tolerance: 15 + Math.random() * 20,
        minMph: Math.round(baseMph - 20),
        maxMph: Math.round(baseMph + 20),
      };
      this.runners.push({
        name: aiNames[i],
        isPlayer: false,
        x: (i + 1) * 4 - 2, z: 24, angle: -Math.PI / 2, speed: 0,
        profile: aiProfile,
        color: [0xc44a2a, 0x2a6fc4, 0x44aa44, 0xcc44cc][i],
        lap: 0, nextCp: 0, finished: false, finishTime: 0,
        mesh: null, currentMph: 0, topMph: 0,
      });
    }

    for (const r of this.runners) {
      r.mesh = this.createRaceCarMesh(r);
      this.game.scene.add(r.mesh);
    }

    this.playerIdx = 0;
    this.game.ui.showRaceHUD();
  }

  createRaceCarMesh(runner) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1, 4.5),
      new THREE.MeshLambertMaterial({ color: runner.color })
    );
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    for (const [wx, wz] of [[-1.2, 1.5], [1.2, 1.5], [-1.2, -1.5], [1.2, -1.5]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.4, wz);
      group.add(w);
    }

    group.position.set(runner.x, 0, runner.z);
    return group;
  }

  update(dt) {
    if (!this.active) return;
    if (this.state === 'countdown') {
      this.countdown -= dt;
      this.game.ui.updateRaceCountdown(Math.ceil(Math.max(0, this.countdown)));
      if (this.countdown <= 0) this.state = 'racing';
      return;
    }

    if (this.state === 'finished') return;

    this.raceTimer += dt;
    const player = this.runners[this.playerIdx];

    for (let i = 0; i < this.runners.length; i++) {
      const r = this.runners[i];
      if (r.finished) continue;

      let input;
      if (r.isPlayer) {
        input = {
          accelerate: this.game.keys['KeyW'] || this.game.keys['ArrowUp'],
          brake: this.game.keys['KeyS'] || this.game.keys['ArrowDown'],
          steer: (this.game.keys['KeyD'] || this.game.keys['ArrowRight'] ? 1 : 0) -
                 (this.game.keys['KeyA'] || this.game.keys['ArrowLeft'] ? 1 : 0),
        };
      } else {
        input = this.aiDrive(r);
      }

      this.updateRunner(r, dt, input);

      if (r.mesh) {
        r.mesh.position.set(r.x, 0, r.z);
        r.mesh.rotation.y = r.angle;
      }
    }

    this.updateCamera(player);
    this.game.ui.updateRaceHUD(this);

    if (this.finished.length >= this.runners.length) {
      this.endRace();
    }
  }

  aiDrive(r) {
    const cp = this.checkpoints[r.nextCp];
    const dx = cp.x - r.x;
    const dz = cp.z - r.z;
    const targetAngle = Math.atan2(dx, dz);
    let diff = targetAngle - r.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return {
      accelerate: true,
      brake: Math.abs(diff) > 1.2,
      steer: Math.max(-1, Math.min(1, diff * 2.5)),
    };
  }

  updateRunner(r, dt, input) {
    const throttle = input?.accelerate ? 1 : 0;
    const targetMph = sampleRaceMph(r.profile, throttle);
    const targetSpeed = mphToGameSpeed(targetMph);

    if (input?.accelerate) {
      r.speed = Math.min(r.speed + 15 * dt, targetSpeed);
    } else if (input?.brake) {
      r.speed = Math.max(r.speed - 20 * dt, 0);
    } else {
      r.speed *= Math.pow(0.05, dt);
    }

    if (Math.abs(r.speed) > 0.5 && input) {
      const turnFactor = r.speed > 0 ? 1 : -1;
      r.angle += (input.steer || 0) * 3 * dt * turnFactor;
    }

    r.currentMph = Math.round(gameSpeedToMph(r.speed));
    r.topMph = Math.max(r.topMph, r.currentMph);

    const prevX = r.x, prevZ = r.z;
    r.x += Math.sin(r.angle) * r.speed * dt;
    r.z += Math.cos(r.angle) * r.speed * dt;

    const resolved = resolveWallCollision(r.x, r.z, prevX, prevZ, 1.5, this.track.walls);
    r.x = resolved.x;
    r.z = resolved.z;

    this.checkCheckpoint(r);
  }

  checkCheckpoint(r) {
    const cp = this.checkpoints[r.nextCp];
    const dist = Math.hypot(r.x - cp.x, r.z - cp.z);
    if (dist < cp.r) {
      r.nextCp = (r.nextCp + 1) % this.checkpoints.length;
      if (r.nextCp === 0) {
        r.lap++;
        if (r.lap >= LAPS && !r.finished) {
          r.finished = true;
          r.finishTime = this.raceTimer;
          this.finished.push(r);
        }
      }
    }
  }

  updateCamera(player) {
    const camDist = 14;
    const camHeight = 8;
    const tx = player.x - Math.sin(player.angle) * camDist;
    const tz = player.z - Math.cos(player.angle) * camDist;
    this.game.camera.position.lerp(new THREE.Vector3(tx, camHeight, tz), 0.1);
    this.game.camera.lookAt(player.x, 1, player.z);
  }

  endRace() {
    this.state = 'finished';
    const player = this.runners[this.playerIdx];
    const placement = this.finished.indexOf(player) + 1;
    const reward = this.garage.recordRace(this.garageCar.id, placement, this.runners.length);

    setTimeout(() => {
      this.cleanup();
      this.game.ui.showRaceResults(placement, reward, player.topMph, this.garageCar);
      this.active = false;
    }, 1500);
  }

  cleanup() {
    for (const r of this.runners) {
      if (r.mesh) this.game.scene.remove(r.mesh);
    }
    this.runners = [];
    this.game.ui.hideRaceHUD();
  }
}
