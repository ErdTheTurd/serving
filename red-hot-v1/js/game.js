import { buildMap, MAP_SIZE } from './map.js';
import { Car, createBulletTrail } from './car.js';
import { BotAI, autoBuyBot } from './bots.js';
import { UI } from './ui.js';
import { SHOP_ITEMS, WEAPONS, createWeaponState, startReload } from './weapons.js';

const ROUND_TIME = 115;
const BUY_TIME = 15;
const PLANT_TIME = 3.5;
const DEFUSE_TIME = 5;
const MAX_ROUNDS = 24;
const WIN_SCORE = 13;
const PLAYERS_PER_TEAM = 5;

class Game {
  constructor() {
    this.state = 'menu';
    this.playerTeam = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mapData = null;
    this.player = null;
    this.allCars = [];
    this.bots = [];
    this.scores = { red: 0, hot: 0 };
    this.round = 0;
    this.roundTimer = ROUND_TIME;
    this.buyPhase = false;
    this.consecutiveLosses = { red: 0, hot: 0 };
    this.bomb = { planted: false, x: 0, z: 0, timer: 40, carrier: null, mesh: null };
    this.keys = {};
    this.mouseDown = false;
    this.lastTime = 0;
    this.ui = null;
    this.lossStreak = 0;
  }

  init() {
    this.setupRenderer();
    this.ui = new UI(this);
    this.setupInput();
    this.animate();
  }

  setupRenderer() {
    const canvas = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 80, 160);

    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 300
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(40, 60, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    this.scene.add(sun);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyB' && this.buyPhase) this.endBuyPhase();
      if (e.code === 'KeyR' && this.state === 'playing') this.playerReload();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (this.state !== 'playing' || !this.player?.alive) return;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      const ray = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.camera);
      const dir = ray.sub(this.camera.position).normalize();
      const t = -this.camera.position.y / dir.y;
      const hitX = this.camera.position.x + dir.x * t;
      const hitZ = this.camera.position.z + dir.z * t;
      this.player.aimAt(hitX, hitZ);
    });

    document.getElementById('btn-play').addEventListener('click', () => {
      this.ui.showScreen('team-select');
    });
    document.querySelectorAll('.team-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.playerTeam = card.dataset.team;
        this.startMatch();
      });
    });
  }

  startMatch() {
    this.ui.showScreen(null);
    this.scores = { red: 0, hot: 0 };
    this.round = 0;
    this.lossStreak = 0;
    this.consecutiveLosses = { red: 0, hot: 0 };

    if (this.mapData) {
      while (this.scene.children.length > 2) {
        this.scene.remove(this.scene.children[this.scene.children.length - 1]);
      }
    }
    this.mapData = buildMap(this.scene);
    this.allCars = [];
    this.bots = [];

    for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
      const redCar = new Car('red', false);
      redCar.createMesh(this.scene);
      this.allCars.push(redCar);
      this.bots.push(new BotAI(redCar, this));

      const hotCar = new Car('hot', false);
      hotCar.createMesh(this.scene);
      this.allCars.push(hotCar);
      this.bots.push(new BotAI(hotCar, this));
    }

    this.player = new Car(this.playerTeam, true);
    this.player.createMesh(this.scene);
    this.allCars.push(this.player);

    this.ui.showHUD();
    this.startRound();
  }

  startRound() {
    this.round++;
    this.roundTimer = ROUND_TIME;
    this.state = 'buy';
    this.buyPhase = true;

    this.bomb.planted = false;
    this.bomb.carried = null;
    this.bomb.timer = 40;
    if (this.bomb.mesh) {
      this.scene.remove(this.bomb.mesh);
      this.bomb.mesh = null;
    }

    for (const car of this.allCars) {
      const spawns = this.mapData.spawns[car.team];
      const spawn = spawns[Math.floor(Math.random() * spawns.length)];
      car.respawn(spawn);
      car.resetForRound();
      if (!car.isPlayer) autoBuyBot(car);
    }

    this.ui.showBuyMenu(BUY_TIME);
  }

  endBuyPhase() {
    if (!this.buyPhase) return;
    this.buyPhase = false;
    this.state = 'playing';
    this.ui.hideBuyMenu();
  }

  buyItem(itemId) {
    if (!this.buyPhase || !this.player) return;
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || this.player.money < item.price) return;

    if (item.category === 'weapon') {
      this.player.weaponId = item.id;
      this.player.weapon = createWeaponState(item.id);
      this.player.money -= item.price;
    } else if (item.category === 'gear') {
      if (this.player.armor >= item.armor) return;
      this.player.armor = item.armor;
      this.player.money -= item.price;
    } else if (item.category === 'car') {
      if (item.id === 'engine' && this.player.speedBoost >= 0.15) return;
      if (item.id === 'turbo' && this.player.speedBoost >= 0.30) return;
      if (item.speedBoost) this.player.speedBoost = item.speedBoost;
      if (item.nitro) this.player.nitroCharges = item.nitro;
      this.player.money -= item.price;
    }

    this.ui.updateBuyMenu();
  }

  playerReload() {
    if (!this.player?.alive) return;
    startReload(this.player.weapon, WEAPONS[this.player.weaponId], performance.now());
  }

  isInBombSite(car) {
    for (const site of Object.values(this.mapData.sites)) {
      const dist = Math.hypot(car.x - site.x, car.z - site.z);
      if (dist < site.radius) return true;
    }
    return false;
  }

  tryPlant(car) {
    if (car.team !== 'red' || this.bomb.planted) return;
    if (!this.isInBombSite(car)) return;

    if (this.keys['KeyE'] || !car.isPlayer) {
      car.planting = true;
      car.plantProgress += 1 / 60 / PLANT_TIME;
      if (car.plantProgress >= 1) {
        this.plantBomb(car);
      }
    } else {
      car.planting = false;
      car.plantProgress = 0;
    }
  }

  tryDefuse(car) {
    if (car.team !== 'hot' || !this.bomb.planted) return;
    const dist = Math.hypot(car.x - this.bomb.x, car.z - this.bomb.z);
    if (dist > 3) return;

    if (this.keys['KeyE'] || !car.isPlayer) {
      car.defusing = true;
      car.defuseProgress += 1 / 60 / DEFUSE_TIME;
      if (car.defuseProgress >= 1) {
        this.endRound('hot', 'Bomb defused');
      }
    } else {
      car.defusing = false;
      car.defuseProgress = 0;
    }
  }

  plantBomb(car) {
    this.bomb.planted = true;
    this.bomb.x = car.x;
    this.bomb.z = car.z;
    this.bomb.timer = 40;
    car.planting = false;
    car.plantProgress = 0;

    const geo = new THREE.BoxGeometry(0.8, 0.4, 1.2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    this.bomb.mesh = new THREE.Mesh(geo, mat);
    this.bomb.mesh.position.set(this.bomb.x, 0.2, this.bomb.z);
    this.scene.add(this.bomb.mesh);

    if (car.isPlayer) car.money += 300;
  }

  onKill(killer, victim) {
    if (killer.isPlayer) killer.money += 300;
    this.ui.addKillFeed(killer, victim);
    this.checkRoundEnd();
  }

  checkRoundEnd() {
    const redAlive = this.allCars.filter((c) => c.team === 'red' && c.alive).length;
    const hotAlive = this.allCars.filter((c) => c.team === 'hot' && c.alive).length;

    if (redAlive === 0) {
      this.endRound('hot', 'Team eliminated');
    } else if (hotAlive === 0) {
      this.endRound('red', 'Team eliminated');
    }
  }

  endRound(winner, reason) {
    if (this.state === 'round_end') return;
    this.state = 'round_end';

    const loser = winner === 'red' ? 'hot' : 'red';
    this.scores[winner]++;

    this.consecutiveLosses[winner] = 0;
    this.consecutiveLosses[loser]++;

    const lossBonus = [1400, 1900, 2400, 2900, 3400];
    const idx = Math.min(this.consecutiveLosses[loser] - 1, 4);

    for (const car of this.allCars) {
      if (car.team === winner) {
        car.money += 3250;
      } else {
        car.money += lossBonus[idx];
      }
    }

    if (this.player) {
      if (winner === this.playerTeam) this.lossStreak = 0;
      else this.lossStreak++;
    }

    this.ui.showRoundEnd(winner, reason);

    setTimeout(() => {
      this.ui.hideRoundEnd();
      if (this.scores.red >= WIN_SCORE || this.scores.hot >= WIN_SCORE || this.round >= MAX_ROUNDS) {
        this.endMatch();
      } else {
        this.startRound();
      }
    }, 4000);
  }

  endMatch() {
    this.state = 'menu';
    this.ui.hideHUD();
    const winner = this.scores.red > this.scores.hot ? 'RED' : 'HOT';
    document.querySelector('#match-end h2').textContent = `${winner} WINS THE MATCH`;
    document.querySelector('#match-end .final-score').textContent =
      `${this.scores.red} — ${this.scores.hot}`;
    this.ui.showScreen('match-end');
  }

  updatePlayer(dt) {
    if (!this.player?.alive || this.state !== 'playing') return;

    const input = {
      accelerate: this.keys['KeyW'] || this.keys['ArrowUp'],
      brake: this.keys['KeyS'] || this.keys['ArrowDown'],
      steer: (this.keys['KeyD'] || this.keys['ArrowRight'] ? 1 : 0) -
             (this.keys['KeyA'] || this.keys['ArrowLeft'] ? 1 : 0),
      nitro: this.keys['ShiftLeft'],
    };

    this.player.update(dt, input, this.mapData.walls);

    if (this.player.team === 'red' && !this.bomb.planted) {
      this.tryPlant(this.player);
    }
    if (this.player.team === 'hot' && this.bomb.planted) {
      this.tryDefuse(this.player);
    }

    if (this.mouseDown) {
      const now = performance.now();
      const result = this.player.tryShoot(now, this.allCars, (k, v) => this.onKill(k, v));
      if (result) createBulletTrail(this.scene, result.x, result.z, result.angle, result.def.range);
    }
  }

  updateCamera() {
    if (!this.player) return;
    const p = this.player;
    const camDist = 16;
    const camHeight = 10;
    const targetX = p.x - Math.sin(p.angle) * camDist;
    const targetZ = p.z - Math.cos(p.angle) * camDist;

    this.camera.position.lerp(
      new THREE.Vector3(targetX, camHeight, targetZ), 0.08
    );
    this.camera.lookAt(p.x, 1, p.z);
  }

  update(dt) {
    if (this.buyPhase) {
      this.ui.buyTimer -= dt;
      this.ui.updateBuyMenu();
      if (this.ui.buyTimer <= 0) this.endBuyPhase();
      return;
    }

    if (this.state !== 'playing') return;

    this.roundTimer -= dt;
    if (this.roundTimer <= 0) {
      this.endRound('hot', 'Time expired');
      return;
    }

    if (this.bomb.planted) {
      this.bomb.timer -= dt;
      if (this.bomb.timer <= 0) {
        this.endRound('red', 'Bomb exploded');
        return;
      }
    }

    this.updatePlayer(dt);

    for (const bot of this.bots) {
      bot.update(dt);
    }

    this.checkRoundEnd();
    this.ui.updateHUD();
    this.updateCamera();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const now = performance.now();
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    if (this.scene) this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
  window.game = game;

  document.getElementById('btn-rematch')?.addEventListener('click', () => {
    game.ui.showScreen('team-select');
  });
  document.getElementById('btn-menu')?.addEventListener('click', () => {
    game.ui.showScreen('main-menu');
  });
});
