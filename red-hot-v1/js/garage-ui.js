import { RARITIES, CASES, KEYS } from './garage.js';
import { calcSpeedProfile, formatSpeedDisplay } from './progression.js';

export class GarageUI {
  constructor(game) {
    this.game = game;
    this.caseRevealCallback = null;
    this.setupListeners();
  }

  setupListeners() {
    document.getElementById('btn-garage')?.addEventListener('click', () => this.showGarage());
    document.getElementById('btn-market')?.addEventListener('click', () => this.showMarket());
    document.getElementById('btn-race')?.addEventListener('click', () => this.startRace());
    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
      this.game.ui.showScreen('main-menu');
      this.updateWalletDisplay();
    });
    document.getElementById('btn-back-garage')?.addEventListener('click', () => this.showGarage());
    document.getElementById('btn-back-market')?.addEventListener('click', () => this.showMarket());
    document.getElementById('btn-race-back')?.addEventListener('click', () => {
      this.game.ui.showScreen('main-menu');
    });
    document.getElementById('btn-invest')?.addEventListener('click', () => this.investInActive());
    document.getElementById('btn-sell-car')?.addEventListener('click', () => this.sellActive());
    document.getElementById('case-reveal-close')?.addEventListener('click', () => {
      document.getElementById('case-reveal').classList.remove('active');
    });
  }

  updateWalletDisplay() {
    const w = this.game.garage.profile.wallet;
    document.querySelectorAll('.wallet-balance').forEach((el) => {
      el.textContent = `$${(w / 100).toFixed(2)}`;
    });
  }

  showGarage() {
    this.game.ui.showScreen('garage-screen');
    this.renderGarage();
    this.updateWalletDisplay();
  }

  showMarket() {
    this.game.ui.showScreen('market-screen');
    this.renderMarket();
    this.updateWalletDisplay();
  }

  renderGarage() {
    const g = this.game.garage;
    const inv = document.getElementById('garage-inventory');
    inv.innerHTML = '';

    for (const car of g.profile.inventory) {
      const profile = calcSpeedProfile(car, g.profile.totalRaces);
      const rarity = RARITIES[car.rarity];
      const el = document.createElement('div');
      el.className = `car-card ${car.id === g.profile.activeCarId ? 'active' : ''}`;
      el.style.borderColor = rarity.color;
      el.innerHTML = `
        <div class="car-rarity" style="color:${rarity.color}">${rarity.short}</div>
        <div class="car-name">${car.name}</div>
        <div class="car-wear">${car.wear} · Float ${car.float.toFixed(4)}</div>
        <div class="car-speed">${formatSpeedDisplay(profile)}</div>
        <div class="car-stats">${car.races} races · $${car.invested} invested</div>
      `;
      el.addEventListener('click', () => {
        g.setActiveCar(car.id);
        this.renderGarage();
      });
      inv.appendChild(el);
    }

    const active = g.activeCar;
    const profile = g.getSpeedProfile();
    const detail = document.getElementById('garage-detail');
    detail.innerHTML = `
      <h3>${active.name}</h3>
      <p class="detail-rarity" style="color:${RARITIES[active.rarity].color}">${RARITIES[active.rarity].name}</p>
      <div class="speed-breakdown">
        <div>Base: <strong>${Math.round(active.baseMph)} mph</strong></div>
        <div>Investment: <strong>+${profile.investmentBonus} mph</strong> ($${active.invested})</div>
        <div>Experience: <strong>+${profile.raceBonus} mph</strong> (${active.races} races, ${active.wins} wins)</div>
        <div>Career: <strong>+${profile.globalBonus} mph</strong> (${g.profile.totalRaces} total races)</div>
        <div class="speed-total">${formatSpeedDisplay(profile)}</div>
        <div class="speed-range">Range: ${profile.minMph} – ${profile.maxMph} mph</div>
      </div>
    `;

    const keysEl = document.getElementById('owned-keys');
    keysEl.innerHTML = Object.entries(g.profile.keys)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `<span class="key-badge">${KEYS[k]?.name}: ${v}</span>`)
      .join('') || '<span class="dim">No keys — buy from Marketplace</span>';

    const casesEl = document.getElementById('owned-cases');
    casesEl.innerHTML = Object.entries(g.profile.cases)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => {
        const c = CASES[k];
        return `<button class="open-case-btn" data-case="${k}">${c.image} ${c.name} (${v}) — Open</button>`;
      })
      .join('') || '<span class="dim">No cases — buy from Marketplace</span>';

    casesEl.querySelectorAll('.open-case-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.openCase(btn.dataset.case));
    });
  }

  renderMarket() {
    const g = this.game.garage;
    const shop = document.getElementById('market-shop');
    shop.innerHTML = '';

    // Keys
    for (const key of Object.values(KEYS)) {
      const el = this.createShopItem(key.name, key.price, 'Buy Key', () => {
        if (g.buyKey(key.id)) { this.renderMarket(); this.updateWalletDisplay(); }
      });
      shop.appendChild(el);
    }

    // Cases
    for (const c of Object.values(CASES)) {
      const el = this.createShopItem(`${c.image} ${c.name}`, c.price, 'Buy Case', () => {
        if (g.buyCase(c.id)) { this.renderMarket(); this.updateWalletDisplay(); }
      });
      shop.appendChild(el);
    }

    // Community listings
    const listings = document.getElementById('market-listings');
    listings.innerHTML = '<h3>Community Market</h3>';
    for (const listing of g.profile.marketListings) {
      const profile = calcSpeedProfile(listing.car, 0);
      const rarity = RARITIES[listing.car.rarity];
      const el = document.createElement('div');
      el.className = 'market-listing';
      el.style.borderLeftColor = rarity.color;
      el.innerHTML = `
        <div class="listing-info">
          <div class="listing-name" style="color:${rarity.color}">${listing.car.name}</div>
          <div class="listing-meta">${formatSpeedDisplay(profile)} · ${listing.car.races} races · ${listing.seller}</div>
        </div>
        <div class="listing-price">$${(listing.price / 100).toFixed(2)}</div>
        <button class="menu-btn small buy-listing">Buy</button>
      `;
      el.querySelector('.buy-listing').addEventListener('click', () => {
        const car = g.buyFromMarket(listing.id);
        if (car) { this.renderMarket(); this.updateWalletDisplay(); }
      });
      listings.appendChild(el);
    }
  }

  createShopItem(name, priceCents, btnLabel, onClick) {
    const el = document.createElement('div');
    el.className = 'shop-item';
    el.innerHTML = `
      <div class="shop-name">${name}</div>
      <div class="shop-price">$${(priceCents / 100).toFixed(2)}</div>
      <button class="menu-btn small">${btnLabel}</button>
    `;
    el.querySelector('button').addEventListener('click', onClick);
    return el;
  }

  openCase(caseId) {
    const car = this.game.garage.openCase(caseId);
    if (!car) {
      alert('You need both a case and its key!');
      return;
    }
    this.showCaseReveal(car);
    this.renderGarage();
    this.updateWalletDisplay();
  }

  showCaseReveal(car) {
    const overlay = document.getElementById('case-reveal');
    const rarity = RARITIES[car.rarity];
    const reel = document.getElementById('case-reel');
    reel.innerHTML = '';

    const pool = Object.values(RARITIES);
    for (let i = 0; i < 20; i++) {
      const fake = pool[Math.floor(Math.random() * pool.length)];
      const item = document.createElement('div');
      item.className = 'reel-item';
      item.style.color = fake.color;
      item.textContent = '???';
      reel.appendChild(item);
    }
    const winner = document.createElement('div');
    winner.className = 'reel-item winner';
    winner.style.color = rarity.color;
    winner.textContent = car.name;
    reel.appendChild(winner);

    document.getElementById('case-reveal-result').innerHTML = `
      <div class="reveal-rarity" style="color:${rarity.color}">${rarity.name}</div>
      <div class="reveal-name">${car.name}</div>
      <div class="reveal-stats">${car.wear} · ${Math.round(car.baseMph)} base mph</div>
    `;

    overlay.classList.add('active');
    reel.style.transform = 'translateX(0)';
    requestAnimationFrame(() => {
      reel.style.transform = `translateX(-${(reel.children.length - 3) * 160}px)`;
    });
  }

  investInActive() {
    const amounts = [500, 1000, 2500, 5000];
    const amount = amounts.find((a) => this.game.garage.profile.wallet >= a) || 0;
    if (!amount) return;
    this.game.garage.investInCar(this.game.garage.activeCar.id, amount);
    this.renderGarage();
    this.updateWalletDisplay();
  }

  sellActive() {
    const price = this.game.garage.sellCar(this.game.garage.activeCar.id);
    if (price) {
      this.renderGarage();
      this.updateWalletDisplay();
    }
  }

  startRace() {
    const car = this.game.garage.activeCar;
    if (!car) return;

    this.game.ui.showScreen(null);
    this.game.ui.hideHUD();

    while (this.game.scene.children.length > 2) {
      this.game.scene.remove(this.game.scene.children[this.game.scene.children.length - 1]);
    }

    this.game.raceMode.buildTrack(this.game.scene);
    this.game.raceMode.start(car, this.game.garage);
    this.game.state = 'racing';
  }
}
