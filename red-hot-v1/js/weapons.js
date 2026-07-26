export const WEAPONS = {
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    price: 0,
    damage: 25,
    fireRate: 400,
    magSize: 12,
    reserve: 24,
    reloadTime: 1500,
    range: 80,
    spread: 0.02,
    auto: false,
  },
  smg: {
    id: 'smg',
    name: 'SMG',
    price: 1050,
    damage: 18,
    fireRate: 90,
    magSize: 30,
    reserve: 90,
    reloadTime: 2000,
    range: 60,
    spread: 0.04,
    auto: true,
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    price: 2700,
    damage: 33,
    fireRate: 100,
    magSize: 30,
    reserve: 90,
    reloadTime: 2500,
    range: 100,
    spread: 0.025,
    auto: true,
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper',
    price: 4750,
    damage: 100,
    fireRate: 1200,
    magSize: 5,
    reserve: 15,
    reloadTime: 3000,
    range: 150,
    spread: 0.001,
    auto: false,
  },
};

export const SHOP_ITEMS = [
  { ...WEAPONS.smg, category: 'weapon' },
  { ...WEAPONS.rifle, category: 'weapon' },
  { ...WEAPONS.sniper, category: 'weapon' },
  {
    id: 'armor',
    name: 'Kevlar',
    price: 650,
    category: 'gear',
    desc: 'Reduces damage by 50%',
    armor: 50,
  },
  {
    id: 'armor_helmet',
    name: 'Kevlar + Helmet',
    price: 1000,
    category: 'gear',
    desc: 'Full body protection',
    armor: 100,
  },
  {
    id: 'engine',
    name: 'Engine Upgrade',
    price: 500,
    category: 'car',
    desc: '+15% top speed',
    speedBoost: 0.15,
  },
  {
    id: 'turbo',
    name: 'Turbo',
    price: 1500,
    category: 'car',
    desc: '+30% top speed',
    speedBoost: 0.30,
  },
  {
    id: 'nitro',
    name: 'Nitro Boost',
    price: 300,
    category: 'car',
    desc: '3 burst speed boosts per round',
    nitro: 3,
  },
];

export function createWeaponState(weaponId) {
  const def = WEAPONS[weaponId] || WEAPONS.pistol;
  return {
    id: def.id,
    ammo: def.magSize,
    reserve: def.reserve,
    lastFire: 0,
    reloading: false,
    reloadEnd: 0,
  };
}

export function canFire(weaponState, weaponDef, now) {
  if (weaponState.reloading) return false;
  if (weaponState.ammo <= 0) return false;
  if (now - weaponState.lastFire < weaponDef.fireRate) return false;
  return true;
}

export function fireWeapon(weaponState, weaponDef, now) {
  weaponState.ammo--;
  weaponState.lastFire = now;
}

export function startReload(weaponState, weaponDef, now) {
  if (weaponState.reloading) return false;
  if (weaponState.ammo >= weaponDef.magSize) return false;
  if (weaponState.reserve <= 0) return false;
  weaponState.reloading = true;
  weaponState.reloadEnd = now + weaponDef.reloadTime;
  return true;
}

export function updateReload(weaponState, weaponDef, now) {
  if (!weaponState.reloading) return false;
  if (now < weaponState.reloadEnd) return false;

  const needed = weaponDef.magSize - weaponState.ammo;
  const toLoad = Math.min(needed, weaponState.reserve);
  weaponState.ammo += toLoad;
  weaponState.reserve -= toLoad;
  weaponState.reloading = false;
  return true;
}

export function getSpreadDirection(baseAngle, spread) {
  const angle = baseAngle + (Math.random() - 0.5) * spread * 2;
  return {
    x: Math.sin(angle),
    z: Math.cos(angle),
  };
}
