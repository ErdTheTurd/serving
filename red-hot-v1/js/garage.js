import { calcSpeedProfile, RARITIES, CAR_TEMPLATES } from './progression.js';

const STORAGE_KEY = 'redhotv1_profile';

let nextCarId = 1;

export const CASES = {
  redhot: {
    id: 'redhot',
    name: 'Red Hot Case',
    price: 249,
    keyId: 'redhot_key',
    image: '🔥',
    pool: ['rust_bucket', 'civic_dx', 'mustang_lx', 'camaro_rs', 'corvette_c4', 'viper_gts', 'laferrari_sh'],
  },
  turbo: {
    id: 'turbo',
    name: 'Turbo Case',
    price: 499,
    keyId: 'turbo_key',
    image: '⚡',
    pool: ['camaro_rs', 'corvette_c4', 'viper_gts', 'porsche_gt3', 'mclaren_p1', 'bugatti_v', 'koenigsegg_j'],
  },
};

export const KEYS = {
  redhot_key: { id: 'redhot_key', name: 'Red Hot Case Key', price: 239, caseId: 'redhot' },
  turbo_key: { id: 'turbo_key', name: 'Turbo Case Key', price: 399, caseId: 'turbo' },
};

const WEAR_NAMES = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

export function createCarFromTemplate(templateId, float = Math.random()) {
  const tpl = CAR_TEMPLATES[templateId];
  if (!tpl) return null;
  const wearIdx = Math.min(4, Math.floor(float * 5));
  return {
    id: `car_${nextCarId++}_${Date.now()}`,
    templateId,
    name: `${tpl.name} | ${tpl.finish}`,
    rarity: tpl.rarity,
    baseMph: tpl.baseMph + (1 - float) * 8,
    invested: 0,
    races: 0,
    wins: 0,
    color: tpl.color,
    float: Math.round(float * 10000) / 10000,
    wear: WEAR_NAMES[wearIdx],
    acquired: Date.now(),
  };
}

export function createStarterCar() {
  return createCarFromTemplate('stock_sedan', 0.15);
}

export class Garage {
  constructor() {
    this.profile = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        nextCarId = p.nextCarId || 1;
        return p;
      }
    } catch { /* fresh start */ }
    const starter = createStarterCar();
    return {
      wallet: 5000,
      keys: {},
      cases: {},
      inventory: [starter],
      activeCarId: starter.id,
      totalRaces: 0,
      totalWins: 0,
      marketListings: generateMarketListings(),
      nextCarId: 2,
    };
  }

  save() {
    this.profile.nextCarId = nextCarId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
  }

  get activeCar() {
    return this.profile.inventory.find((c) => c.id === this.profile.activeCarId) || this.profile.inventory[0];
  }

  getCar(id) {
    return this.profile.inventory.find((c) => c.id === id);
  }

  setActiveCar(id) {
    if (this.getCar(id)) {
      this.profile.activeCarId = id;
      this.save();
    }
  }

  addCar(car) {
    this.profile.inventory.push(car);
    this.save();
    return car;
  }

  removeCar(id) {
    this.profile.inventory = this.profile.inventory.filter((c) => c.id !== id);
    if (this.profile.activeCarId === id) {
      this.profile.activeCarId = this.profile.inventory[0]?.id;
    }
    this.save();
  }

  buyKey(keyId) {
    const key = KEYS[keyId];
    if (!key || this.profile.wallet < key.price) return false;
    this.profile.wallet -= key.price;
    this.profile.keys[keyId] = (this.profile.keys[keyId] || 0) + 1;
    this.save();
    return true;
  }

  buyCase(caseId) {
    const c = CASES[caseId];
    if (!c || this.profile.wallet < c.price) return false;
    this.profile.wallet -= c.price;
    this.profile.cases[caseId] = (this.profile.cases[caseId] || 0) + 1;
    this.save();
    return true;
  }

  openCase(caseId) {
    const c = CASES[caseId];
    if (!c) return null;
    if ((this.profile.cases[caseId] || 0) < 1) return null;
    if ((this.profile.keys[c.keyId] || 0) < 1) return null;

    this.profile.cases[caseId]--;
    this.profile.keys[c.keyId]--;

    const templateId = rollFromCase(c.pool);
    const car = createCarFromTemplate(templateId, Math.random());
    this.addCar(car);
    return car;
  }

  investInCar(carId, amount) {
    const car = this.getCar(carId);
    if (!car || amount <= 0 || this.profile.wallet < amount) return false;
    this.profile.wallet -= amount;
    car.invested += amount;
    this.save();
    return true;
  }

  recordRace(carId, placement, totalRunners) {
    const car = this.getCar(carId);
    if (!car) return;
    car.races++;
    this.profile.totalRaces++;
    if (placement === 1) {
      car.wins++;
      this.profile.totalWins++;
    }
    const reward = Math.round(200 + (totalRunners - placement) * 150 + car.races * 5);
    this.profile.wallet += reward;
    this.save();
    return reward;
  }

  sellCar(carId) {
    const car = this.getCar(carId);
    if (!car || this.profile.inventory.length <= 1) return false;
    const profile = calcSpeedProfile(car, this.profile.totalRaces);
    const price = Math.round(profile.centerMph * 8 + car.invested * 0.85);
    this.profile.wallet += price;
    this.removeCar(carId);
    return price;
  }

  listOnMarket(carId, askPrice) {
    const car = this.getCar(carId);
    if (!car || this.profile.inventory.length <= 1) return false;
    this.profile.marketListings.push({
      id: `listing_${Date.now()}`,
      car: { ...car },
      price: askPrice,
      seller: 'You',
      isPlayer: true,
    });
    this.removeCar(carId);
    return true;
  }

  buyFromMarket(listingId) {
    const idx = this.profile.marketListings.findIndex((l) => l.id === listingId);
    if (idx < 0) return false;
    const listing = this.profile.marketListings[idx];
    if (this.profile.wallet < listing.price) return false;

    this.profile.wallet -= listing.price;
    const car = { ...listing.car, id: `car_${nextCarId++}_${Date.now()}` };
    this.addCar(car);

    if (listing.isPlayer) {
      const payout = Math.round(listing.price * 0.85);
      // In real game would go to seller; here it's absorbed
    }

    this.profile.marketListings.splice(idx, 1);
    if (this.profile.marketListings.length < 8) {
      this.profile.marketListings.push(generateMarketListing());
    }
    this.save();
    return car;
  }

  getSpeedProfile(car = this.activeCar) {
    return calcSpeedProfile(car, this.profile.totalRaces);
  }
}

function rollFromCase(pool) {
  const weights = pool.map((id) => {
    const r = CAR_TEMPLATES[id]?.rarity || 'consumer';
    const w = { consumer: 50, industrial: 25, milspec: 15, restricted: 6, classified: 3, covert: 1, rare: 0.5 };
    return w[r] || 10;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[0];
}

function generateMarketListings() {
  const listings = [];
  for (let i = 0; i < 10; i++) listings.push(generateMarketListing());
  return listings;
}

function generateMarketListing() {
  const ids = Object.keys(CAR_TEMPLATES).filter((k) => k !== 'stock_sedan');
  const templateId = ids[Math.floor(Math.random() * ids.length)];
  const car = createCarFromTemplate(templateId, Math.random());
  car.invested = Math.floor(Math.random() * 3000);
  car.races = Math.floor(Math.random() * 40);
  const profile = calcSpeedProfile(car, Math.floor(Math.random() * 100));
  const sellers = ['SpeedTrader', 'DriftKing99', 'NitroDealer', 'RedHotMarket', 'TurboFlipper'];
  return {
    id: `listing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    car,
    price: Math.round(profile.centerMph * 10 + car.invested * 0.7 + Math.random() * 500),
    seller: sellers[Math.floor(Math.random() * sellers.length)],
    isPlayer: false,
  };
}

export { RARITIES, CAR_TEMPLATES };
