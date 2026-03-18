# Architecture Reference

Complete code map of `cocaine80master` (~3,200 lines). All line numbers are approximate and may shift with edits.

## File Layout

```
Lines 1-14        Imports, header comments
Lines 15-22       C (color palette constant)
Lines 23-31       LOCS (6 locations)
Lines 33-48       LOCATION_VIBE (day/night atmosphere text per location)
Lines 50-61       DRUGS (8 drugs with price parameters)
Lines 63-70       RADIO_EVENTS (6 price-shock events)
Lines 72-83       PAGER_DEALS (10 timed bonus contracts)
Lines 85-108      ERAS (5 game phases) + PHASE_TRANSITIONS
Lines 110-136     LIFESTYLE (8 items), SAFE_HOUSES (4 tiers), TURF_LEVELS (5 levels)
Lines 138         RIVALS_NAMES
Lines 141-150     COACH_MARKS (7 contextual hints)
Lines 152-175     COMIC_PANELS (5), NEWSPAPERS (15)
Lines 177-333     NARRATIVE ENGINE — openers, beats, generateNarrative()
Lines 335-349     ENCOUNTERS (random events, including witness defuse)
Lines 352-356     HELPERS — R, RF, FM, CL, randNorm
Lines 359-380     PRICE ENGINE — initBasePrices, initMomentum, evolveBasePrices, evolveMomentum, getStreetPrices
Lines 382-391     calcTxRisk, calcLegalFees, getEra
Lines 393-403     getSkyGradient (visual background based on time/heat)
Lines 405-410     NPCS

Lines 412-854     ═══ STORYLET SYSTEM ═══
Lines 419-503     Maria storylets (maria_intro → maria_react_crack)
Lines 504-571     Ramirez storylets (ramirez_intro → ramirez_bribe)
Lines 572-627     Colombiano storylets (colombiano_intro → colombiano_zoo)
Lines 628-738     Gameplay-triggered storylets (milestones, flavor)
Lines 739-792     Faction dispute chain (Medellín/Cali/Independent)
Lines 793-854     Informant arc chain

Lines 855-858     NPC_COLORS, NPC_NAMES
Lines 859-868     computeQualities
Lines 869-910     meetsConditions
Lines 911-924     selectStorylet (priority queue)
Lines 925-938     applyChoiceEffects

Lines 940-982     createInitialState (state factory, no parameters)

Lines 984-1770    ═══ PURE STATE TRANSITIONS ═══
Lines 988-1463    processTravel (the big one — ~475 lines)
Lines 1465-1503   processBuyDrug
Lines 1505-1597   processSellDrug
Lines 1599-1621   processPolice
Lines 1623-1640   processBuyTurf
Lines 1642-1649   processHireEnforcers
Lines 1651-1682   processTurfWar
Lines 1684-1719   processEncounter
Lines 1721-1736   processBank
Lines 1738-1754   processBuyLifestyle
Lines 1756-1764   processBuySafeHouse
Lines 1766-1770   processBuyGun

Lines 1771-1888   ═══ AUDIO ENGINE ═══
Lines 1775-1793   getCtx, startAudio, playTone, playChord
Lines 1795-1801   SYNTH_SCALES (per-era music parameters), SFX
Lines 1803-1888   SynthEngine class (arpeggio, bass, pads, hihat)

Lines 1890-1900   ═══ STYLES ═══
Lines 1893-1898   ft, ftBody, bx, bt, inp (style factories)
Lines 1899        UNLOCK_MAP (achievement → feature unlock)
Lines 1900        CSS (all keyframe animations)

Lines 1901-2175   ═══ UI COMPONENTS ═══
Lines 1905-1912   WeatherOverlay
Lines 1914-1930   AmbientMotes
Lines 1932-1948   Particles
Lines 1949        Neon
Lines 1950-1961   TravelAnim
Lines 1962-2008   AnimatedNumber
Lines 2010-2078   SaleBreakdown
Lines 2079-2089   CoachMark
Lines 2091-2105   SKYLINE_PROFILES (per-location building data)
Lines 2106-2170   Skyline (renders skyline with buildings, palms, water)
Lines 2171-2175   priceColor

Lines 2177-3270   ═══ MAIN COMPONENT (Cocaine80s) ═══
Lines 2180-2215   State declarations (game state, UI state)
Lines 2220-2265   Derived values, feature unlocks, progressive HUD
Lines 2268-2278   Synth engine lifecycle
Lines 2280-2355   processEffects (effect dispatcher)
Lines 2358-2380   Coach mark helpers
Lines 2383-2388   act() wrapper
Lines 2391-2403   startGame()
Lines 2407-2445   doTravel, completeTravelTo (travel + storylet check)
Lines 2447-2495   Dialogue handlers (advanceDialogue, makeDialogueChoice)
Lines 2497-2568   Action handlers (bank, turf, encounters, deals)
Lines 2570-2608   COMIC screen
Lines 2610-2660   TITLE screen
Lines 2662-2676   POLICE screen
Lines 2678-2688   POLICE RESULT screen
Lines 2690-2730   BROKE CHOICE screen
Lines 2732-2780   ESCAPE screen
Lines 2781-2855   GAME OVER screen (narrative epilogue)
Lines 2956-3270   MAIN GAME screen (HUD, tabs, market, bag, travel, bank, empire, life)
```

## State Shape

```javascript
{
  // Core
  move: number,              // Current move (0-based). Odd = night
  cash: number,              // Dirty cash on hand
  debt: number,              // Owed to Tiburón (loan shark)
  bank: number,              // Deposited in bank
  cleanCash: number,         // Laundered money
  hp: number,                // Health points (0-100)
  loc: number,               // Current location index (0-5)

  // Inventory
  inv: number[8],            // Units held per drug
  avgC: number[8],           // Average cost per drug (for profit calc)
  coatSp: number,            // Inventory capacity

  // Prices
  prices: number[8],         // Current street prices at current location
  basePrices: number[8],     // Base prices (location-independent)
  momentum: number[8],       // Price momentum per drug
  hist: number[8][],         // Price history (last 8 per drug)
  demand: number[8],         // Local demand multipliers (0.4-1.0)

  // Progression
  cred: number,              // Street cred (0-100)
  fedHeat: number,           // Federal heat (0-100)
  currentEra: number,        // Era index (0-4, from ERAS)
  eraStartMove: number,      // Move when current era began
  totalProfit: number,       // Lifetime profit
  totalDeals: number,        // Total buy+sell count
  totalBusts: number,        // Times caught by police
  dealsSinceLastEvent: number, // Resets when NPC storylet fires
  peakNetWorth: number,      // Highest net worth achieved
  streak: number,            // Current profitable trade streak
  bestStreak: number,        // Best streak this run
  biggestDeal: number,       // Largest single profit

  // Equipment
  gun: boolean,              // Has a gun ($4000)
  lifestyle: string[],       // Purchased lifestyle effects
  safeHouses: number[6],     // Safe house tier per location (-1 = none)

  // Empire
  turf: number[6],           // Turf level per location (0-4)
  enforcers: number[6],      // Enforcer count per location
  rivals: { name, loc, rep }[], // Active rival NPCs

  // NPCs
  npcState: {
    maria:      { met: bool, trust: number, active: bool, lastEventMove: number },
    ramirez:    { met: bool, evidence: number, bribed: bool, lastEventMove: number },
    colombiano: { met: bool, trust: number, alive: bool, lastEventMove: number },
  },

  // Narrative
  storyFlags: { [string]: boolean },  // Flags set by storylets
  storySeen: { [string]: boolean },   // Which storylets have fired
  activeStorylet: object | null,      // Currently displayed storylet
  tradeHistory: { drug, qty, loc, move, prof }[], // Last 30 trades
  montage: { move, text }[],          // Key events for end narrative
  fuseChains: { mariaBrickDebt, mariaNegotiated, cesarGhost: bool },
  fuseTimers: { id, movePlanted, fuseLength, defused }[],
  supplierHistory: { [locIdx]: number }, // Buy count per location

  // Systems
  pagerDeal: object | null,   // Active pager deal
  activeDeal: object | null,  // Active poker-style deal
  evtMsg: string | null,      // Current event message
  achievements: string[],     // Earned this run
  nwHist: number[],           // Net worth history (sparkline)
  scores: number[],           // High scores

  // Ending
  ending: string | null,      // Set on game over
}
```

## Condition Keys (for storylets)

Used in `STORY[id].conditions` and evaluated by `meetsConditions()` (line ~869):

| Key | Type | Description |
|-----|------|-------------|
| `totalDealsGte` | number | `s.totalDeals >= v` |
| `totalProfitGte` | number | `s.totalProfit >= v` |
| `cashGte` | number | `s.cash >= v` |
| `credGte` | number | `s.cred >= v` |
| `heatGte` | number | `s.fedHeat >= v` |
| `fedHeatGte` | number | `s.fedHeat >= v` (alias) |
| `evidenceGte` | number | `s.npcState.ramirez.evidence >= v` |
| `bustsGte` | number | `s.totalBusts >= v` |
| `biggestDealGte` | number | `s.biggestDeal >= v` |
| `dealsSinceGte` | number | `s.dealsSinceLastEvent >= v` |
| `eraGte` | number | `s.currentEra >= v` |
| `debtLte` | number | `s.debt <= v` |
| `locIs` | number | `s.loc === v` |
| `productIs` | string | Player's most-traded product matches |
| `flag` | string | `s.storyFlags[v] === true` |
| `notFlag` | string | `s.storyFlags[v] !== true` |
| `lifestyleHas` | string | `s.lifestyle.some(l => l.effect === v)` — checks owned lifestyle items by effect name |
| `turfCountGte` | number | `s.turf.filter(t=>t>0).length >= v` |
| `npc.X.Y` | object | Nested NPC state check: `{ eq, gte, lte }` |

## Effect Types

Returned in `effects` arrays from state transitions, processed by `processEffects()` (line ~2280):

| Type | Fields | Description |
|------|--------|-------------|
| `SFX` | `name` | Play sound: buy, sell, sellBig, sellHuge, sellMassive, police, travel, achieve, coin, pager, streak, upgrade |
| `SHAKE` | — | Screen shake animation |
| `FLASH` | `color` | Screen flash overlay |
| `HITSTOP` | `dur` | Freeze-frame effect (ms) |
| `SPAWN` | `text, color, y, size, delay, dur` | Floating particle text |
| `SCREEN` | `screen` | Navigate to screen |
| `GAME_OVER` | `ending` | Trigger game over with ending type |
| `ACHIEVEMENT` | `id` | Show achievement popup |
| `ERA_SHIFT` | `era` | Era transition overlay |
| `SALE_BREAKDOWN` | `drugName, qty, buyPrice, sellPrice, revenue, profit, pagerBonus, streak` | Sale receipt overlay |
| `STREAK_CELEBRATION` | `streak` | Fire particle burst |
| `SYNTH_PULSE` | `heat` | Update synth engine |

## Screen States

```
title → comic → game (main loop)
                  ↓ (police encounter)
                police → policeResult → game
                  ↓ (game over triggers)
                broke_choice → gameover
                escape → gameover
                gameover → title
```

## Key Data Flow

```
User Action (tap buy/sell/travel)
  → act(processFunction, ...args)
    → Pure state transition returns { state, effects, ... }
  → setG(result.state)           // Update React state
  → processEffects(result.effects) // Dispatch side effects
    → SFX, particles, screen changes, achievements
  → completeTravelTo also checks:
    → selectStorylet(state)      // NPC/narrator events
    → Newspaper, encounter, turf war, deal events
```

## processTravel Breakdown

The largest function (~475 lines). On each travel action:

1. **Radio event** — Random price shock (35-50% chance)
2. **Price evolution** — Ornstein-Uhlenbeck with momentum
3. **Heat calculation** — Decay from safe houses, accumulation from inventory
4. **Police check** — Based on location risk × era × heat × wealth × time of day
5. **Nightclub laundering** — $2K/move if owned
6. **Interest & banking** — Every 4 moves, debt compounds
7. **Empire income** — Turf income minus enforcer upkeep
8. **Turf war** — Random rival attack on owned territory
9. **Loan shark escalation** — Debt-tiered violence ($10K/$20K/$30K thresholds)
10. **Success tax** — Dirty cop shakedown when cash > $100K
11. **Failure bonus** — One-time cheap drug mercy mechanic
12. **Demand decay** — Career saturation reduces demand over time
13. **Newspaper** — Every 10 moves
14. **Random encounter** — Night increases chance; defuse encounters (witness, DEA) prioritized if fuse active
15. **Pager deal** — ~12% chance, timed bonus contract
16. **NPC evidence** — Ramirez accumulates passively
17. **Fuse chains** — Delayed backstory consequences
18. **Poker deals** — Multi-turn trade with complications
19. **Defusable fuse timers** — Witness, DEA surveillance, and supplier betrayal (all via fuse system)
21. **Achievements** — Net worth milestones
22. **Phase transition** — Action-driven era advancement
23. **Ending checks** — Bust, dead, broke, burned, informant, escape
24. **Faction effects** — Medellín/Cali price modifiers

## Functions Reference

### Pure State Transitions (no side effects)
| Function | Line | Input | Returns |
|----------|------|-------|---------|
| `processTravel(s, destLoc)` | ~988 | state, destination | `{ state, effects, turfWar, newspaper, randEnc, npcEvent, dealEvent }` |
| `processBuyDrug(s, idx, amt)` | ~1465 | state, drug index, amount | `{ state, ok, cost, busted, fees, effects }` |
| `processSellDrug(s, idx, amt)` | ~1505 | state, drug index, amount | `{ state, ok, rev, prof, streak, effects }` |
| `processPolice(s, action)` | ~1599 | state, "run"/"fight"/"bribe" | `{ state, resultText, effects }` |
| `processBuyTurf(s, locIdx)` | ~1623 | state, location | `{ state, ok, effects }` |
| `processHireEnforcers(s, locIdx, count)` | ~1642 | state, location, count | `{ state, ok, effects }` |
| `processTurfWar(s, turfWar, action)` | ~1651 | state, war data, action | `{ state, effects }` |
| `processEncounter(s, enc, action)` | ~1684 | state, encounter, action | `{ state, effects }` |
| `processBank(s, action, amount)` | ~1721 | state, action, amount | `{ state, ok, effects }` |
| `processBuyLifestyle(s, effect)` | ~1738 | state, effect key | `{ state, ok, item, effects }` |
| `processBuySafeHouse(s, tier)` | ~1756 | state, safe house tier | `{ state, ok, effects }` |
| `processBuyGun(s)` | ~1766 | state | `{ state, ok, effects }` |

### Narrative Engine
| Function | Line | Purpose |
|----------|------|---------|
| `computeQualities(s)` | ~859 | Derive `flash` and `productId` from state |
| `meetsConditions(conds, s, q)` | ~869 | Check if storylet conditions are met |
| `selectStorylet(s)` | ~911 | Pick highest-priority matching storylet |
| `applyChoiceEffects(s, eff)` | ~925 | Apply storylet choice effects to state |
| `generateNarrative(s)` | ~234 | Generate end-of-run narrative epilogue |

### Price Engine
| Function | Line | Purpose |
|----------|------|---------|
| `initBasePrices()` | ~359 | Generate initial base prices around drug means |
| `initMomentum()` | ~360 | Generate initial random momentum values |
| `evolveBasePrices(prev, mom, ...)` | ~362 | Ornstein-Uhlenbeck price evolution |
| `evolveMomentum(prev)` | ~370 | Evolve momentum with random reversals |
| `getStreetPrices(base, loc, era, demand)` | ~372 | Calculate final street prices |

### State Factory
| Function | Line | Purpose |
|----------|------|---------|
| `createInitialState()` | ~940 | Build initial game state (no parameters) |
