# Red Hot V1

Counter-Strike 2 mechanics reimagined with cars — plus a full garage economy.

## Play

Open `index.html` in a browser, or serve locally:

```bash
npx serve red-hot-v1
```

## Game Modes

### Competitive
Round-based 5v5 bomb defusal on a Dust2-inspired map. Your garage car's speed stats apply in-match.

### Race
3-lap oval time trial. Earn wallet cash and build experience on your active car.

## Garage Economy (CS2-style)

- **Buy keys** and **cases** from the Marketplace (just like CS2)
- **Open cases** with a matching key to unbox random cars by rarity
- **Invest money** into a car to raise its top speed and tighten the ± mph tolerance band
- **Sell cars** or buy from the Community Market
- Progress persists in localStorage

## Speed Progression

Each car has a speed profile:

```
Center speed = base mph + investment bonus + race XP + career bonus
Tolerance  = ±50 mph (shrinks as you invest and race)
```

The more money you put into a car and the more you race it, the faster and more consistent it gets.

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Drive |
| Mouse | Aim turret (Competitive) |
| Click | Shoot |
| R | Reload |
| E | Plant / Defuse |
| Shift | Nitro |
| B | Skip buy phase |
