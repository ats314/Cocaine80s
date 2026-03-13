# Architecture Reference

Complete code map of `cocaine80master` (~3,630 lines). All line numbers are approximate and may shift with edits.

## File Layout

```
Lines 1-14        Imports, header comments
Lines 16-21       C (color palette constant)
Lines 24-31       LOCS (6 locations)
Lines 35-48       LOCATION_VIBE (day/night atmosphere text per location)
Lines 51-61       DRUGS (8 drugs with price parameters)
Lines 63-70       RADIO_EVENTS (6 price-shock events)
Lines 72-83       PAGER_DEALS (10 timed bonus contracts)
Lines 85-108      ERAS (5 game phases) + PHASE_TRANSITIONS
Lines 110-136     LIFESTYLE (8 items), SAFE_HOUSES (4 tiers), TURF_LEVELS (5 levels)
Lines 138-139     RIVALS_NAMES, MAX_MOVES
Lines 145-195     PLAYBOOKS (8 character classes)
Lines 201-222     SAFEHOUSE_UPGRADES (10 meta-progression upgrades)
Lines 228-269     DAILY_MODIFIERS (10), getDailySeed, getDailyModifiers, SeededRNG
Lines 272-280     COACH_MARKS (7 contextual hints)
Lines 282-305     COMIC_PANELS (5), NEWSPAPERS (15)
Lines 307-463     NARRATIVE ENGINE — openers, beats, generateNarrative()
Lines 465-479     ENCOUNTERS (random events)
Lines 482-486     HELPERS — R, RF, FM, CL, randNorm
Lines 488-508     PRICE ENGINE — initBasePrices, initMomentum, evolveBasePrices, evolveMomentum, getStreetPrices
Lines 511-518     calcTxRisk, calcLegalFees, getEra
Lines 522-532     getSkyGradient (visual background based on time/heat)
Lines 534-549     NPCS, HEAT_LADDER (7 difficulty levels)

Lines 552-994     ═══ STORYLET SYSTEM ═══
Lines 558-573     Maria storylets (maria_intro → maria_react_crack)
Lines 647-709     Ramirez storylets (ramirez_intro → ramirez_bribe)
Lines 715-765     Colombiano storylets (colombiano_intro → colombiano_zoo)
Lines 771-877     Gameplay-triggered storylets (milestones, flavor)
Lines 882-931     Faction dispute chain (Medellín/Cali/Independent)
Lines 936-993     Informant arc chain

Lines 995-1006    NPC_COLORS, NPC_NAMES, computeQualities
Lines 1008-1062   meetsConditions, selectStorylet (priority queue)
Lines 1064-1077   applyChoiceEffects

Lines 1078-1104   ═══ META-PROGRESSION ═══
Lines 1081-1090   DEFAULT_META shape
Lines 1092-1104   loadMeta, saveMeta (localStorage)
Lines 1107-1135   calcRepEarned
Lines 1137-1186   applySafehouseUpgrades
Lines 1188-1217   applyPlaybookMods
Lines 1220-1255   applyDailyMods
Lines 1258-1312   createInitialState (state factory)

Lines 1314-2129   ═══ PURE STATE TRANSITIONS ═══
Lines 1318-1818   processTravel (the big one — ~500 lines)
Lines 1820-1863   processBuyDrug
Lines 1865-1960   processSellDrug
Lines 1962-1984   processPolice
Lines 1986-2003   processBuyTurf
Lines 2005-2012   processHireEnforcers
Lines 2014-2045   processTurfWar
Lines 2047-2077   processEncounter
Lines 2079-2094   processBank
Lines 2096-2113   processBuyLifestyle
Lines 2115-2123   processBuySafeHouse
Lines 2125-2128   processBuyGun

Lines 2130-2249   ═══ AUDIO ENGINE ═══
Lines 2133-2137   getCtx, startAudio, playTone, playChord
Lines 2139-2151   SFX (10 sound effects)
Lines 2154-2160   SYNTH_SCALES (per-era music parameters)
Lines 2162-2247   SynthEngine class (arpeggio, bass, pads, hihat)

Lines 2251-2261   ═══ STYLES ═══
Lines 2254-2258   ft, ftBody, bx, bt, inp (style factories)
Lines 2259       UNLOCK_MAP (achievement → feature unlock)
Lines 2261       CSS (all keyframe animations)

Lines 2263-2539   ═══ UI COMPONENTS ═══
Lines 2265-2272   WeatherOverlay
Lines 2275-2289   AmbientMotes
Lines 2291-2302   Particles
Lines 2304-2309   Neon
Lines 2311-2321   TravelAnim
Lines 2323-2371   AnimatedNumber
Lines 2373-2432   SaleBreakdown
Lines 2434-2440   Sparkline
Lines 2442-2451   CoachMark
Lines 2453-2467   SKYLINE_PROFILES (per-location building data)
Lines 2469-2532   Skyline (renders skyline with buildings, palms, water)
Lines 2534-2538   priceColor

Lines 2540-3630   ═══ MAIN COMPONENT (Cocaine80s) ═══
Lines 2543-2578   State declarations (game state, UI state)
Lines 2584-2631   Derived values, feature unlocks, progressive HUD
Lines 2634-2642   Synth engine lifecycle
Lines 2645-2721   processEffects (effect dispatcher)
Lines 2724-2747   Coach mark helpers
Lines 2750-2755   act() wrapper
Lines 2758-2771   startGame()
Lines 2781-2821   doTravel, completeTravelTo (travel + storylet check)
Lines 2824-2827   doBuy, doSell, doPolice
Lines 2829-2877   Dialogue handlers (advanceDialogue, makeDialogueChoice)
Lines 2880-2933   Action handlers (bank, turf, encounters, deals)
Lines 2935-2950   Visual state (sky gradient, streak border, VHS overlay)
Lines 2954-2991   COMIC screen
Lines 2993-3044   TITLE screen
Lines 3047-3061   POLICE screen
Lines 3063-3080   POLICE RESULT screen
Lines 3082-3168   GAME OVER screen (narrative epilogue)
Lines 3170-3250   BROKE CHOICE screen
Lines 3252-3340   ESCAPE screen
Lines 3342-3630   MAIN GAME screen (HUD, tabs, market, bag, travel, bank, empire, life)
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
  stashInv: number[8],       // Stashed units (in safe house)

  // Prices
  prices: number[8],         // Current street prices at current location
  basePrices: number[8],     // Base prices (location-independent)
  momentum: number[8],       // Price momentum per drug
  hist: number[8][],         // Price history (last 8 per drug)
  demand: number[8],         // Local demand multipliers (0.4-1.0)

  // Progression
  cred: number,              // Street cred (0-100)
  fedHeat: number,           // Federal heat (0-100)
  heatLevel: number,         // Difficulty tier (0-6, from HEAT_LADDER)
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

  // Meta
  playbook: string,           // Playbook ID for this run
  isDaily: boolean,           // Is this a daily challenge
  bonusMoves: number,         // Extra moves from upgrades
  achievements: string[],     // Earned this run
  nwHist: number[],           // Net worth history (sparkline)
  scores: number[],           // High scores

  // Ending
  ending: string | null,      // Set on game over
}
```

## Condition Keys (for storylets)

Used in `STORY[id].conditions` and evaluated by `meetsConditions()` (line ~1008):

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
| `npc.X.Y` | object | Nested NPC state check: `{ eq, gte, lte }` |

## Effect Types

Returned in `effects` arrays from state transitions, processed by `processEffects()` (line ~2664):

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
    → SFX, particles, screen changes, achievements, meta saves
  → completeTravelTo also checks:
    → selectStorylet(state)      // NPC/narrator events
    → Newspaper, encounter, turf war, deal events
```

## processTravel Breakdown

The largest function (~500 lines). On each travel action:

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
14. **Random encounter** — Night increases chance
15. **Pager deal** — ~12% chance, timed bonus contract
16. **NPC evidence** — Ramirez accumulates passively
17. **Fuse chains** — Delayed backstory consequences
18. **Poker deals** — Multi-turn trade with complications
19. **Defusable fuse timers** — Witness/stash raid timers
20. **Supplier betrayal** — Same source 5+ times + high heat
21. **Achievements** — Net worth milestones
22. **Phase transition** — Action-driven era advancement
23. **Ending checks** — Bust, dead, broke, burned, informant, escape
24. **Faction effects** — Medellín/Cali price modifiers

## Functions Reference

### Pure State Transitions (no side effects)
| Function | Line | Input | Returns |
|----------|------|-------|---------|
| `processTravel(s, destLoc)` | ~1318 | state, destination | `{ state, effects, turfWar, newspaper, randEnc, npcEvent, dealEvent }` |
| `processBuyDrug(s, idx, amt)` | ~1820 | state, drug index, amount | `{ state, ok, cost, busted, fees, effects }` |
| `processSellDrug(s, idx, amt)` | ~1865 | state, drug index, amount | `{ state, ok, rev, prof, streak, effects }` |
| `processPolice(s, action)` | ~1962 | state, "run"/"fight"/"bribe" | `{ state, resultText, effects }` |
| `processBuyTurf(s, locIdx)` | ~1986 | state, location | `{ state, ok, effects }` |
| `processHireEnforcers(s, locIdx, count)` | ~2005 | state, location, count | `{ state, ok, effects }` |
| `processTurfWar(s, turfWar, action)` | ~2014 | state, war data, action | `{ state, effects }` |
| `processEncounter(s, enc, action)` | ~2047 | state, encounter, action | `{ state, effects }` |
| `processBank(s, action, amount)` | ~2079 | state, action, amount | `{ state, ok, effects }` |
| `processBuyLifestyle(s, effect)` | ~2096 | state, effect key | `{ state, ok, item, effects }` |
| `processBuySafeHouse(s, tier)` | ~2115 | state, safe house tier | `{ state, ok, effects }` |
| `processBuyGun(s)` | ~2125 | state | `{ state, ok, effects }` |

### Narrative Engine
| Function | Line | Purpose |
|----------|------|---------|
| `computeQualities(s)` | ~999 | Derive `flash` and `productId` from state |
| `meetsConditions(conds, s, q)` | ~1008 | Check if storylet conditions are met |
| `selectStorylet(s)` | ~1051 | Pick highest-priority matching storylet |
| `applyChoiceEffects(s, eff)` | ~1064 | Apply storylet choice effects to state |
| `generateNarrative(s)` | ~365 | Generate end-of-run narrative epilogue |

### Price Engine
| Function | Line | Purpose |
|----------|------|---------|
| `initBasePrices()` | ~489 | Generate initial base prices around drug means |
| `initMomentum()` | ~490 | Generate initial random momentum values |
| `evolveBasePrices(prev, mom, ...)` | ~492 | Ornstein-Uhlenbeck price evolution |
| `evolveMomentum(prev)` | ~499 | Evolve momentum with random reversals |
| `getStreetPrices(base, loc, era, demand, multi)` | ~501 | Calculate final street prices |

### Meta-Progression
| Function | Line | Purpose |
|----------|------|---------|
| `loadMeta()` | ~1092 | Load from localStorage |
| `saveMeta(meta)` | ~1100 | Save to localStorage |
| `calcRepEarned(g, finalNW, heatLevel, playbook, isDaily)` | ~1107 | Calculate rep from a run |
| `applySafehouseUpgrades(state, upgrades)` | ~1137 | Apply persistent upgrades |
| `applyPlaybookMods(state, playbook)` | ~1188 | Apply playbook starting mods |
| `applyDailyMods(state, modifiers)` | ~1220 | Apply daily challenge modifiers |
| `createInitialState(heat, playbook, daily, upgrades)` | ~1258 | Build initial game state |
