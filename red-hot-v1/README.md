# Red Hot V1

Counter-Strike 2 mechanics reimagined with cars.

## Play

Open `index.html` in a browser, or serve locally:

```bash
npx serve red-hot-v1
```

Then visit `http://localhost:3000`.

## Gameplay

- **Red team (Attackers)** — Plant the bomb at site A or B
- **Hot team (Defenders)** — Defuse the bomb or eliminate Red
- **First to 13 rounds wins**

### Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Drive |
| Mouse | Aim turret |
| Click | Shoot |
| R | Reload |
| E | Plant / Defuse bomb |
| Shift | Nitro boost |
| B | Skip buy phase |

### Buy Menu

Between rounds, spend money on weapons (SMG, Rifle, Sniper), armor, and car upgrades (engine, turbo, nitro).

## Map

Dust2-inspired layout with A site (long), B site (short), mid, and CT/T spawns adapted for car combat.

## Tech

- Three.js (WebGL 3D)
- Vanilla JS modules
- No build step required
