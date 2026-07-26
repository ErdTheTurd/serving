import { WEAPONS } from './weapons.js';

const BOT_NAMES = [
  'V8', 'Turbo', 'Nitro', 'Drift', 'Burnout', 'Chrome', 'Raptor',
  'Phantom', 'Blaze', 'Storm', 'Viper', 'Ghost', 'Razor', 'Tank',
];

export class BotAI {
  constructor(car, game) {
    this.car = car;
    this.game = game;
    this.state = 'patrol';
    this.target = null;
    this.waypoint = null;
    this.thinkTimer = 0;
    this.shootTimer = 0;
    car.name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  }

  update(dt) {
    if (!this.car.alive) return;

    this.thinkTimer -= dt;
    this.shootTimer -= dt;

    if (this.thinkTimer <= 0) {
      this.thinkTimer = 0.5 + Math.random() * 0.5;
      this.decide();
    }

    const input = this.drive();
    this.car.update(dt, input, this.game.mapData.walls);

    if (this.shootTimer <= 0 && this.target && this.target.alive) {
      this.car.aimAt(this.target.x, this.target.z);
      const now = performance.now();
      const result = this.car.tryShoot(now, this.game.allCars, (killer, victim, dmg) => {
        this.game.onKill(killer, victim);
      });
      if (result) {
        this.shootTimer = WEAPONS[this.car.weaponId].fireRate / 1000;
      }
    }
  }

  decide() {
    const enemies = this.game.allCars.filter(
      (c) => c.team !== this.car.team && c.alive
    );

    if (enemies.length === 0) {
      this.state = 'patrol';
      this.target = null;
      return;
    }

    let nearest = null;
    let nearestDist = Infinity;
    for (const e of enemies) {
      const d = Math.hypot(e.x - this.car.x, e.z - this.car.z);
      if (d < nearestDist) {
        nearest = e;
        nearestDist = d;
      }
    }

    this.target = nearest;

    if (this.car.team === 'red' && !this.game.bomb.planted && !this.game.bomb.carried) {
      const distA = Math.hypot(this.car.x - this.game.mapData.sites.A.x, this.car.z - this.game.mapData.sites.A.z);
      const distB = Math.hypot(this.car.x - this.game.mapData.sites.B.x, this.car.z - this.game.mapData.sites.B.z);
      const site = distA < distB ? this.game.mapData.sites.A : this.game.mapData.sites.B;
      const distSite = Math.min(distA, distB);

      if (distSite < site.radius) {
        this.state = 'plant';
        return;
      }
      this.state = 'goSite';
      this.waypoint = { x: site.x, z: site.z };
      return;
    }

    if (this.car.team === 'red' && this.game.bomb.planted) {
      this.state = 'guard';
      this.waypoint = { x: this.game.bomb.x, z: this.game.bomb.z };
      return;
    }

    if (this.car.team === 'hot' && this.game.bomb.planted) {
      const dist = Math.hypot(this.car.x - this.game.bomb.x, this.car.z - this.game.bomb.z);
      if (dist < 3) {
        this.state = 'defuse';
        return;
      }
      this.state = 'goSite';
      this.waypoint = { x: this.game.bomb.x, z: this.game.bomb.z };
      return;
    }

    if (nearestDist < 40) {
      this.state = 'attack';
      this.waypoint = { x: nearest.x, z: nearest.z };
    } else {
      this.state = 'patrol';
      this.waypoint = this.getPatrolPoint();
    }
  }

  getPatrolPoint() {
    const sites = this.game.mapData.sites;
    if (this.car.team === 'hot') {
      const site = Math.random() > 0.5 ? sites.A : sites.B;
      return { x: site.x + (Math.random() - 0.5) * 8, z: site.z + (Math.random() - 0.5) * 8 };
    }
    return { x: (Math.random() - 0.5) * 60, z: (Math.random() - 0.5) * 60 };
  }

  drive() {
    const input = { accelerate: false, brake: false, steer: 0, nitro: false };

    if (this.state === 'plant') {
      this.game.tryPlant(this.car);
      return input;
    }

    if (this.state === 'defuse') {
      this.game.tryDefuse(this.car);
      return input;
    }

    if (!this.waypoint) return input;

    const dx = this.waypoint.x - this.car.x;
    const dz = this.waypoint.z - this.car.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 3) {
      if (this.state === 'attack' && this.target) {
        this.car.aimAt(this.target.x, this.target.z);
      }
      return input;
    }

    const targetAngle = Math.atan2(dx, dz);
    let angleDiff = targetAngle - this.car.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    input.steer = Math.max(-1, Math.min(1, angleDiff * 2));
    input.accelerate = true;

    if (Math.abs(angleDiff) > 1) input.brake = true;

    if (this.target && this.state === 'attack') {
      this.car.aimAt(this.target.x, this.target.z);
    }

    return input;
  }
}

export function autoBuyBot(car) {
  const money = car.money;
  if (money >= 2700) {
    car.weaponId = 'rifle';
    car.money -= 2700;
  } else if (money >= 1050) {
    car.weaponId = 'smg';
    car.money -= 1050;
  }
  if (car.money >= 1000) {
    car.armor = 100;
    car.money -= 1000;
  } else if (car.money >= 650) {
    car.armor = 50;
    car.money -= 650;
  }
  if (car.money >= 500) {
    car.speedBoost = 0.15;
    car.money -= 500;
  }
}
