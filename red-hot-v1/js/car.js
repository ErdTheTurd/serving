import { WEAPONS, createWeaponState, canFire, fireWeapon, startReload, updateReload, getSpreadDirection } from './weapons.js';
import { checkWallCollision, resolveWallCollision } from './map.js';

let nextId = 1;

export class Car {
  constructor(team, isPlayer = false) {
    this.id = nextId++;
    this.team = team;
    this.isPlayer = isPlayer;
    this.name = isPlayer ? 'You' : `Bot ${this.id}`;

    this.x = 0;
    this.z = 0;
    this.prevX = 0;
    this.prevZ = 0;
    this.angle = 0;
    this.speed = 0;
    this.maxSpeed = 18;
    this.acceleration = 12;
    this.brakeForce = 18;
    this.turnSpeed = 2.8;
    this.radius = 1.8;

    this.health = 100;
    this.maxHealth = 100;
    this.armor = 0;
    this.alive = true;

    this.weaponId = 'pistol';
    this.weapon = createWeaponState('pistol');
    this.speedBoost = 0;
    this.nitroCharges = 0;
    this.nitroActive = false;
    this.nitroTimer = 0;

    this.mesh = null;
    this.turretAngle = 0;
    this.money = 800;

    this.planting = false;
    this.plantProgress = 0;
    this.defusing = false;
    this.defuseProgress = 0;

    this.respawnTimer = 0;
  }

  createMesh(scene) {
    const group = new THREE.Group();
    const bodyColor = this.garageColor || (this.team === 'red' ? 0xc44a2a : 0x2a6fc4);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.2, 5),
      new THREE.MeshLambertMaterial({ color: bodyColor })
    );
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.8, 2.5),
      new THREE.MeshLambertMaterial({ color: 0x222222 })
    );
    cabin.position.set(0, 1.8, -0.3);
    cabin.castShadow = true;
    group.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wheelPositions = [
      [-1.4, 0.5, 1.8], [1.4, 0.5, 1.8],
      [-1.4, 0.5, -1.8], [1.4, 0.5, -1.8],
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
    }

    const turret = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 2.5),
      new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    turret.position.set(0, 2.2, 1.2);
    turret.name = 'turret';
    group.add(turret);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 2.2, 2.5);
    group.add(barrel);

    group.position.set(this.x, 0, this.z);
    scene.add(group);
    this.mesh = group;
    return group;
  }

  get effectiveMaxSpeed() {
    let max = this.maxSpeed * (1 + this.speedBoost);
    if (this.nitroActive) max *= 1.6;
    return max;
  }

  update(dt, input, walls) {
    if (!this.alive) return;

    this.prevX = this.x;
    this.prevZ = this.z;

    if (this.nitroActive) {
      this.nitroTimer -= dt;
      if (this.nitroTimer <= 0) this.nitroActive = false;
    }

    if (input) {
      if (input.accelerate) {
        this.speed = Math.min(this.speed + this.acceleration * dt, this.effectiveMaxSpeed);
      } else if (input.brake) {
        this.speed = Math.max(this.speed - this.brakeForce * dt, -this.effectiveMaxSpeed * 0.4);
      } else {
        this.speed *= Math.pow(0.02, dt);
        if (Math.abs(this.speed) < 0.1) this.speed = 0;
      }

      if (Math.abs(this.speed) > 0.5) {
        const turnDir = input.steer || 0;
        const turnFactor = this.speed > 0 ? 1 : -1;
        this.angle += turnDir * this.turnSpeed * dt * turnFactor;
      }

      if (input.nitro && this.nitroCharges > 0 && !this.nitroActive) {
        this.nitroActive = true;
        this.nitroTimer = 2;
        this.nitroCharges--;
      }
    }

    const dx = Math.sin(this.angle) * this.speed * dt;
    const dz = Math.cos(this.angle) * this.speed * dt;

    const newX = this.x + dx;
    const newZ = this.z + dz;
    const resolved = resolveWallCollision(newX, newZ, this.prevX, this.prevZ, this.radius, walls);
    this.x = resolved.x;
    this.z = resolved.z;

    if (this.mesh) {
      this.mesh.position.set(this.x, 0, this.z);
      this.mesh.rotation.y = this.angle;
      const turret = this.mesh.getObjectByName('turret');
      if (turret) turret.rotation.y = this.turretAngle - this.angle;
    }

    updateReload(this.weapon, WEAPONS[this.weaponId], performance.now());
  }

  aimAt(targetX, targetZ) {
    this.turretAngle = Math.atan2(targetX - this.x, targetZ - this.z);
  }

  tryShoot(now, targets, onHit) {
    const def = WEAPONS[this.weaponId];
    if (!canFire(this.weapon, def, now)) return null;

    fireWeapon(this.weapon, def, now);
    const dir = getSpreadDirection(this.turretAngle, def.spread);

    let closest = null;
    let closestDist = def.range;

    for (const target of targets) {
      if (!target.alive || target.team === this.team) continue;

      const tx = target.x - this.x;
      const tz = target.z - this.z;
      const dist = Math.sqrt(tx * tx + tz * tz);
      if (dist > def.range || dist < 1) continue;

      const targetAngle = Math.atan2(tx, tz);
      let angleDiff = targetAngle - this.turretAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) > 0.3) continue;

      const dot = (tx / dist) * dir.x + (tz / dist) * dir.z;
      if (dot > 0.85 && dist < closestDist) {
        closest = target;
        closestDist = dist;
      }
    }

    if (closest) {
      let dmg = def.damage;
      if (closest.armor > 0) {
        dmg *= closest.armor >= 100 ? 0.45 : 0.65;
      }
      closest.takeDamage(dmg);
      if (onHit) onHit(this, closest, dmg);
    }

    return { x: this.x, z: this.z, angle: this.turretAngle, def };
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      this.speed = 0;
      if (this.mesh) {
        this.mesh.rotation.z = 0.3;
        this.mesh.position.y = -0.3;
      }
    }
  }

  respawn(spawn) {
    this.x = spawn.x;
    this.z = spawn.z;
    this.angle = spawn.angle;
    this.speed = 0;
    this.health = this.maxHealth;
    this.alive = true;
    this.planting = false;
    this.plantProgress = 0;
    this.defusing = false;
    this.defuseProgress = 0;
    if (this.mesh) {
      this.mesh.rotation.z = 0;
      this.mesh.position.set(this.x, 0, this.z);
      this.mesh.rotation.y = this.angle;
    }
  }

  resetForRound() {
    this.weapon = createWeaponState(this.weaponId);
    this.planting = false;
    this.plantProgress = 0;
    this.defusing = false;
    this.defuseProgress = 0;
    this.nitroActive = false;
  }
}

export function createBulletTrail(scene, fromX, fromZ, angle, range) {
  const points = [];
  points.push(new THREE.Vector3(fromX, 2, fromZ));
  points.push(new THREE.Vector3(
    fromX + Math.sin(angle) * range * 0.3,
    2,
    fromZ + Math.cos(angle) * range * 0.3
  ));
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  setTimeout(() => scene.remove(line), 80);
}
