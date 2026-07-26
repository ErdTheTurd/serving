export const RARITIES = {
  consumer:    { name: 'Consumer Grade',  color: '#b0c3d9', short: 'Consumer' },
  industrial:  { name: 'Industrial Grade', color: '#5e98d9', short: 'Industrial' },
  milspec:     { name: 'Mil-Spec',        color: '#4b69ff', short: 'Mil-Spec' },
  restricted:  { name: 'Restricted',      color: '#8847ff', short: 'Restricted' },
  classified:  { name: 'Classified',      color: '#d32ce6', short: 'Classified' },
  covert:      { name: 'Covert',          color: '#eb4b4b', short: 'Covert' },
  rare:        { name: 'Exceedingly Rare', color: '#e4ae39', short: '★ Rare' },
};

export const CAR_TEMPLATES = {
  stock_sedan:  { name: 'Stock Sedan',    finish: 'Default',       rarity: 'consumer',   baseMph: 95,  color: 0x888888 },
  rust_bucket:  { name: 'Rust Bucket',    finish: 'Oxidized',      rarity: 'consumer',   baseMph: 78,  color: 0x8b4513 },
  civic_dx:     { name: 'Civic DX',       finish: 'Street',        rarity: 'industrial', baseMph: 112, color: 0xcccccc },
  mustang_lx:   { name: 'Mustang LX',     finish: 'Candy Red',     rarity: 'milspec',    baseMph: 135, color: 0xcc2222 },
  camaro_rs:    { name: 'Camaro RS',      finish: 'Rally Yellow',  rarity: 'milspec',    baseMph: 142, color: 0xffcc00 },
  corvette_c4:  { name: 'Corvette C4',    finish: 'Torch Red',     rarity: 'restricted', baseMph: 158, color: 0xff2200 },
  viper_gts:    { name: 'Viper GTS',      finish: 'Viper Blue',    rarity: 'restricted', baseMph: 168, color: 0x2244cc },
  porsche_gt3:  { name: 'Porsche GT3',    finish: 'GT Silver',     rarity: 'classified', baseMph: 178, color: 0xc0c0c0 },
  mclaren_p1:   { name: 'McLaren P1',     finish: 'Volcano Orange', rarity: 'classified', baseMph: 190, color: 0xff6600 },
  laferrari_sh: { name: 'LaFerrari',      finish: 'Scuderia Red',  rarity: 'covert',     baseMph: 205, color: 0xdd0000 },
  bugatti_v:    { name: 'Bugatti Veyron', finish: 'Carbon Fiber',  rarity: 'covert',     baseMph: 215, color: 0x111111 },
  koenigsegg_j: { name: 'Koenigsegg Jesko', finish: 'Ghost Shell', rarity: 'rare',     baseMph: 230, color: 0xe8e8ff },
};

const MAX_TOLERANCE = 50;
const MIN_TOLERANCE = 3;

/**
 * Speed profile for a car.
 * centerMph rises with investment + races; tolerance shrinks from ±50 toward ±3.
 */
export function calcSpeedProfile(car, totalRaces = 0) {
  const investmentBonus = Math.min(35, car.invested / 500);
  const raceBonus = Math.min(25, car.races * 0.6 + (car.wins || 0) * 1.5);
  const globalBonus = Math.min(12, totalRaces * 0.04);
  const centerMph = Math.round(car.baseMph + investmentBonus + raceBonus + globalBonus);

  const tolerance = Math.max(
    MIN_TOLERANCE,
    MAX_TOLERANCE - car.invested / 250 - car.races * 0.35 - totalRaces * 0.02
  );

  return {
    centerMph,
    tolerance: Math.round(tolerance * 10) / 10,
    minMph: Math.round(centerMph - tolerance),
    maxMph: Math.round(centerMph + tolerance),
    investmentBonus: Math.round(investmentBonus),
    raceBonus: Math.round(raceBonus),
    globalBonus: Math.round(globalBonus),
  };
}

/** Sample actual mph for a race tick (within tolerance band). */
export function sampleRaceMph(profile, throttle = 1) {
  const spread = profile.tolerance * (1 - throttle * 0.6);
  return profile.centerMph + (Math.random() * 2 - 1) * spread;
}

/** Convert mph to in-game speed units (18 ≈ 108 mph baseline). */
export function mphToGameSpeed(mph) {
  return mph * (18 / 108);
}

export function gameSpeedToMph(speed) {
  return speed * (108 / 18);
}

export function formatSpeedDisplay(profile) {
  return `${profile.centerMph} ± ${profile.tolerance} mph`;
}
