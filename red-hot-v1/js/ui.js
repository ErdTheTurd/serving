import { SHOP_ITEMS, WEAPONS, createWeaponState } from './weapons.js';
import { formatSpeedDisplay } from './progression.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.buyTimer = 0;
    this.setupElements();
    this.setupBuyMenu();
  }

  setupElements() {
    this.hud = document.getElementById('hud');
    this.buyMenu = document.getElementById('buy-menu');
    this.roundOverlay = document.getElementById('round-overlay');
    this.killFeed = document.getElementById('kill-feed');
    this.interactHint = document.querySelector('.interact-hint');
    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.raceHud = document.getElementById('race-hud');
  }

  setupBuyMenu() {
    const grid = document.querySelector('.buy-grid');
    grid.innerHTML = '';
    for (const item of SHOP_ITEMS) {
      const el = document.createElement('div');
      el.className = 'buy-item';
      el.dataset.id = item.id;
      el.innerHTML = `
        <div class="name">${item.name}</div>
        <div class="price">$${item.price}</div>
        <div class="desc">${item.desc || ''}</div>
      `;
      el.addEventListener('click', () => this.game.buyItem(item.id));
      grid.appendChild(el);
    }
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.remove('hidden');
  }

  showHUD() {
    this.hud.classList.add('active');
  }

  hideHUD() {
    this.hud.classList.remove('active');
  }

  showBuyMenu(duration) {
    this.buyMenu.classList.add('active');
    this.buyTimer = duration;
    this.updateBuyMenu();
  }

  hideBuyMenu() {
    this.buyMenu.classList.remove('active');
  }

  updateBuyMenu() {
    const player = this.game.player;
    if (!player) return;

    document.querySelector('.buy-money').textContent = `$${player.money}`;

    document.querySelectorAll('.buy-item').forEach((el) => {
      const item = SHOP_ITEMS.find((i) => i.id === el.dataset.id);
      el.classList.remove('owned', 'cant-afford');

      if (item.category === 'weapon' && player.weaponId === item.id) {
        el.classList.add('owned');
      }
      if (item.category === 'gear' && player.armor >= (item.armor || 0) && item.armor) {
        el.classList.add('owned');
      }
      if (item.category === 'car' && item.id === 'engine' && player.speedBoost >= 0.15) {
        el.classList.add('owned');
      }
      if (item.category === 'car' && item.id === 'turbo' && player.speedBoost >= 0.30) {
        el.classList.add('owned');
      }
      if (player.money < item.price) {
        el.classList.add('cant-afford');
      }
    });

    document.querySelector('.buy-timer').textContent =
      `Round starts in ${Math.ceil(this.buyTimer)}s — Press B to skip`;
  }

  updateHUD() {
    const g = this.game;
    const p = g.player;
    if (!p) return;

    document.querySelector('.hud-score .red').textContent = g.scores.red;
    document.querySelector('.hud-score .hot').textContent = g.scores.hot;

    const mins = Math.floor(g.roundTimer / 60);
    const secs = Math.floor(g.roundTimer % 60);
    document.querySelector('.hud-timer').textContent =
      `${mins}:${secs.toString().padStart(2, '0')}`;

    const hpPct = (p.health / p.maxHealth) * 100;
    const bar = document.querySelector('.hud-health .bar-fill');
    bar.style.width = `${hpPct}%`;
    bar.classList.toggle('low', hpPct < 30);

    const wDef = WEAPONS[p.weaponId];
    document.querySelector('.hud-weapon .name').textContent = wDef.name;
    document.querySelector('.hud-weapon .ammo').innerHTML =
      `${p.weapon.ammo} <span>/ ${p.weapon.reserve}</span>`;

    document.querySelector('.hud-money').textContent = `$${p.money}`;

    const carSpeedEl = document.getElementById('hud-car-speed');
    if (p.garageCar && this.game.garage) {
      carSpeedEl.textContent = formatSpeedDisplay(this.game.garage.getSpeedProfile(p.garageCar));
    }

    const bombEl = document.querySelector('.hud-bomb');
    if (g.bomb.planted) {
      bombEl.classList.add('active');
      bombEl.textContent = `BOMB: ${Math.ceil(g.bomb.timer)}s`;
    } else {
      bombEl.classList.remove('active');
    }

    this.updateMinimap();
    this.updateInteractHint();
  }

  updateMinimap() {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const scale = w / 120;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,68,68,0.3)';
    ctx.beginPath();
    ctx.arc(
      (this.game.mapData.sites.A.x + 60) * scale,
      (this.game.mapData.sites.A.z + 60) * scale,
      6 * scale, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      (this.game.mapData.sites.B.x + 60) * scale,
      (this.game.mapData.sites.B.z + 60) * scale,
      6 * scale, 0, Math.PI * 2
    );
    ctx.fill();

    for (const car of this.game.allCars) {
      if (!car.alive) continue;
      const cx = (car.x + 60) * scale;
      const cz = (car.z + 60) * scale;
      ctx.fillStyle = car.team === 'red' ? '#c44a2a' : '#2a6fc4';
      ctx.beginPath();
      ctx.arc(cx, cz, car.isPlayer ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.game.bomb.planted) {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(
        (this.game.bomb.x + 60) * scale,
        (this.game.bomb.z + 60) * scale,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  updateInteractHint() {
    const hint = this.interactHint;
    const p = this.game.player;
    if (!p || !p.alive) {
      hint.classList.remove('active');
      return;
    }

    if (p.team === 'red' && !this.game.bomb.planted && !this.game.bomb.carried) {
      const inSite = this.game.isInBombSite(p);
      if (inSite) {
        hint.textContent = 'Hold E to plant bomb';
        hint.classList.add('active');
        return;
      }
    }

    if (p.team === 'hot' && this.game.bomb.planted) {
      const dist = Math.hypot(p.x - this.game.bomb.x, p.z - this.game.bomb.z);
      if (dist < 3) {
        hint.textContent = 'Hold E to defuse bomb';
        hint.classList.add('active');
        return;
      }
    }

    hint.classList.remove('active');
  }

  addKillFeed(killer, victim) {
    const entry = document.createElement('div');
    entry.className = 'kill-entry';
    const kClass = killer.team === 'red' ? 'killer-red' : 'killer-hot';
    const vClass = victim.team === 'red' ? 'killer-red' : 'killer-hot';
    entry.innerHTML = `<span class="${kClass}">${killer.name}</span> 🔫 <span class="${vClass}">${victim.name}</span>`;
    this.killFeed.prepend(entry);
    if (this.killFeed.children.length > 6) {
      this.killFeed.lastChild.remove();
    }
    setTimeout(() => entry.remove(), 4000);
  }

  showRoundEnd(winner, reason) {
    this.roundOverlay.classList.add('active');
    const h2 = this.roundOverlay.querySelector('h2');
    h2.textContent = winner === 'red' ? 'RED WINS' : 'HOT WINS';
    h2.style.color = winner === 'red' ? 'var(--red-team)' : 'var(--hot-team)';
    this.roundOverlay.querySelector('.reason').textContent = reason;
  }

  hideRoundEnd() {
    this.roundOverlay.classList.remove('active');
  }

  showRaceHUD() {
    this.raceHud.classList.add('active');
    document.getElementById('race-countdown').textContent = '3';
  }

  hideRaceHUD() {
    this.raceHud.classList.remove('active');
  }

  updateRaceCountdown(n) {
    const el = document.getElementById('race-countdown');
    el.textContent = n > 0 ? n : 'GO!';
    el.style.opacity = n > 0 ? 1 : 0;
  }

  updateRaceHUD(race) {
    const player = race.runners[race.playerIdx];
    document.getElementById('race-mph').textContent = player.currentMph;
    document.getElementById('race-lap').textContent = Math.min(player.lap + 1, 3);
    document.getElementById('race-top').textContent = player.topMph;

    const pos = race.finished.indexOf(player) + 1 ||
      1 + race.runners.filter((r) => !r.finished && r.lap * 4 + r.nextCp > player.lap * 4 + player.nextCp).length;
    document.getElementById('race-pos').textContent = pos;

    const profile = race.garage.getSpeedProfile(race.garageCar);
    document.getElementById('race-tolerance').textContent = formatSpeedDisplay(profile);
  }

  showRaceResults(placement, reward, topMph, car) {
    this.showScreen('race-results');
    const titles = ['1st Place!', '2nd Place', '3rd Place', '4th Place', '5th Place'];
    document.getElementById('race-result-title').textContent = titles[placement - 1] || `${placement}th Place`;
    document.getElementById('race-result-detail').innerHTML =
      `${car.name}<br>Top speed: ${topMph} mph · Earned $${(reward / 100).toFixed(2)}<br>` +
      `${car.races} races on this car — keep racing to tighten your ± mph band!`;
    this.game.garageUI.updateWalletDisplay();
    this.game.state = 'menu';
  }
}
