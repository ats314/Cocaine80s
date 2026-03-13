# COCAINE 80s

**A Miami Vice Empire Game**

A single-file React game engine set in 1980s Miami. Build a drug empire from one brick of Bolivian flake, navigate cartel politics, dodge Detective Ramirez, and decide whether to escape, rule, or burn.

```
╔═══════════════════════════════════════════════════════╗
║  🌴  MIAMI. AUGUST 1980.                             ║
║  César got arrested in Panama. You kept the brick.    ║
║  One name. One kilo. No plan.                         ║
╚═══════════════════════════════════════════════════════╝
```

## Gameplay

Buy low, sell high across 6 Miami neighborhoods. Prices shift with supply, demand, and random events. Every deal raises your heat. Every move is a gamble.

**The loop:** Buy drugs cheap → Travel to where they're expensive → Sell → Avoid cops → Repeat until you escape, get caught, or die.

### Locations

| Location | Vibe | Risk |
|----------|------|------|
| 🏖️ Miami Beach | Tourist cover, luxury buyers | Low |
| 🌴 Little Havana | Cartel connections, cheap imports | Medium |
| 🏚️ Overtown | Crack territory, high volume | High |
| 🏛️ Coral Gables | Rich suburbs, quiet deals | Low |
| 🎓 Fort Lauderdale | College town, party drugs | Medium |
| 🚤 The Keys | Smuggling routes, low police | Low |

### Drugs

8 products across 3 tiers — street (Weed, Xanax), prescription (Oxy, Adderall, Crack), and luxury (Cocaine, Heroin, Ecstasy). Each has unique price dynamics with mean reversion, momentum, and random shocks.

### NPCs

Three characters with branching storylines driven by your actions:

- **💃 Maria Santos** — Connected socialite. Opens doors money can't buy. Has opinions about crack.
- **🕵️ Detective Ramirez** — Building a case. Patient. Honest. Dangerous.
- **🇨🇴 El Colombiano** — Cartel boss. Owns a tiger named Capitalism. Offers partnership or threats.

### Systems

- **Price Engine** — Ornstein-Uhlenbeck process with location modifiers, era demand, and radio events
- **Heat & Police** — Accumulates with deals, decays with safe houses, triggers encounters
- **Eras** — 5 phases from Paradise to Endgame, driven by your profit/heat/cred
- **Turf Wars** — Claim territory, hire enforcers, defend against rivals
- **Pager Deals** — Time-limited bonus contracts
- **Poker Deals** — Multi-turn high-stakes trades with complications
- **Money Laundering** — Clean cash through Maria's art gallery or your nightclub
- **Fuse Timers** — Hidden delayed consequences from your actions

### Endings

| Ending | How |
|--------|-----|
| ✈️ Escape | Fly to the Caymans with clean cash |
| 👑 Kingpin | High cred + profit + turf = you own Miami |
| 🚔 Busted | Ramirez builds enough evidence |
| 💀 Dead | HP hits zero (cops, muggers, cartel) |
| 🚌 Broke | No cash, no product, no income |
| 🐀 Informant | Cooperate with the feds |
| 🔥 Burned | Both sides discover you're a snitch |

Each ending generates a unique narrative epilogue — either a Miami Herald article or a VHS-style voiceover — assembled from your run's key moments.

## Tech

- **React** (hooks only) — `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`, `memo`
- **Zero dependencies** — no external packages, no build tools
- **Pure state transitions** — all game logic returns `{ state, effects }`, framework-agnostic
- **Web Audio API** — dynamic synth engine that responds to era, heat, and time of day
- **CSS-in-JS** — all styles inline, no external stylesheets
- **LocalStorage** — meta-progression persistence

### Architecture

The entire game is one file (`cocaine80master`) designed for portability:

```
Lines 1-500      Constants, data, price engine
Lines 500-1000   NPCs, storylet system, narrative engine
Lines 1000-1300  Meta-progression, state factory
Lines 1300-2130  Pure state transitions (travel, buy, sell, police, turf, bank)
Lines 2130-2300  Audio engine, synth, SFX
Lines 2300-2530  UI components (particles, skyline, sparklines, animations)
Lines 2530-3630  Main React component, screens, game UI
```

### Portability

The game engine (lines 1-2130) has **no React or DOM dependencies**. It can be dropped into React Native or any JS runtime with zero changes. The React component layer (2530+) is the only platform-specific code.

## Usage

Import the component into any React project:

```jsx
import Cocaine80s from './cocaine80master';

function App() {
  return <Cocaine80s />;
}
```

No build step required. Just needs React available in scope.

## Meta-Progression (v3.0)

Built into the engine but not yet exposed in UI:

- **8 Playbooks** — Character classes (Hustler, Mule, Connected, Enforcer, Smuggler, Banker, Ghost, Kingpin)
- **7 Heat Levels** — Difficulty tiers from Tourist to Scarface
- **Safehouse Upgrades** — Persistent upgrades purchased with Rep
- **Daily Challenges** — Seeded runs with modifiers
- **Completion Grid** — Track every playbook × heat level combination

## Documentation

| File | Purpose |
|------|---------|
| [CLAUDE.md](CLAUDE.md) | Agent onboarding guide — conventions, how-tos, common pitfalls |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code map with line numbers, state shape, all functions, data flow |
| [NARRATIVE.md](NARRATIVE.md) | All storylets, NPC arcs, dialogue catalog, endings, content map |
| [GAMEPLAY.md](GAMEPLAY.md) | Mechanics reference — formulas, balance parameters, tuning guide |
| [REVIEW.md](REVIEW.md) | Technical review with known bugs and recommendations |

## Known Issues

See [REVIEW.md](REVIEW.md) for a detailed technical review including critical bugs and architecture recommendations.
