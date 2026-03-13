# Gameplay Mechanics Reference

Complete formulas, balance parameters, and tuning guide for COCAINE 80s.

## Price Engine

### Ornstein-Uhlenbeck Process

Prices evolve each travel action via mean-reverting stochastic process:

```
newPrice = price + reversion + shock + drift

reversion = theta × (mean - price)     // Pull toward mean
shock     = sigma × price × N(0,1) × 0.3   // Random noise
drift     = momentum × price × 0.08    // Trend following
```

Where `N(0,1)` is a standard normal random variable (`randNorm()`).

### Drug Parameters

| Drug | Tier | Mean | Min | Max | Sigma | Theta | Emoji |
|------|------|------|-----|-----|-------|-------|-------|
| Weed | 0 | $22 | $8 | $55 | 0.40 | 0.30 | 🌿 |
| Xanax | 0 | $18 | $6 | $45 | 0.30 | 0.30 | 💊 |
| Oxy | 1 | $45 | $15 | $110 | 0.28 | 0.25 | 🩹 |
| Adderall | 1 | $20 | $7 | $50 | 0.32 | 0.30 | ⚡ |
| Crack | 1 | $35 | $10 | $90 | 0.50 | 0.20 | 🔥 |
| Cocaine | 2 | $300 | $120 | $700 | 0.25 | 0.15 | ❄️ |
| Heroin | 2 | $150 | $50 | $350 | 0.28 | 0.15 | 💀 |
| Ecstasy | 2 | $35 | $12 | $80 | 0.30 | 0.20 | 🦋 |

**Tuning notes:**
- Higher `sigma` = more volatile (Crack is most volatile: 0.50)
- Higher `theta` = faster mean reversion (street drugs revert fastest: 0.30)
- Luxury drugs (Cocaine, Heroin) have low theta (0.15) — trends persist longer
- Prices are clamped to `[min×0.5, max×2.5]`

### Street Price Calculation

```
streetPrice = basePrice × locationMod × eraDemand × localDemand × noise
noise = 1 + N(0,1) × 0.05   // ±5% random
```

Clamped to drug minimum.

### Location Price Modifiers

Each location has a 3-element `priceMod` array for tiers [0, 1, 2]:

| Location | Tier 0 | Tier 1 | Tier 2 |
|----------|--------|--------|--------|
| Miami Beach | 1.3 | 1.1 | 0.7 |
| Little Havana | 0.7 | 0.9 | 1.3 |
| Overtown | 0.6 | 1.2 | 1.1 |
| Coral Gables | 1.1 | 0.6 | 1.0 |
| Fort Lauderdale | 1.0 | 1.0 | 0.8 |
| The Keys | 1.2 | 1.1 | 0.5 |

**Key insight:** Buy luxury drugs (Cocaine, Heroin) cheap in Miami Beach (0.7×) or The Keys (0.5×), sell in Little Havana (1.3×). Buy street drugs cheap in Overtown (0.6×), sell in Miami Beach (1.3×).

### Era Demand Modifiers

Per-drug demand multipliers by era (indices 0-7 = Weed through Ecstasy):

| Era | Key Changes |
|-----|-------------|
| Paradise | All 1.0 (flat) |
| Anti-Drug Abuse Act | Weed 1.3×, Crack 1.2× |
| Crack Epidemic | **Crack 3.0×**, Heroin 1.8×, Ecstasy 1.2× |
| War on Drugs | All elevated (1.3-1.5×), Cocaine drops to 0.5× |
| Endgame | All depressed (0.4-0.7×) |

### Momentum

```
newMomentum = (15% chance) ? -momentum + N(0,1)×0.2   // Reversal
            : clamp(momentum × 0.85 + N(0,1) × 0.15, -1, 1)  // Decay
```

### Radio Events

35-50% chance per travel (50% in first 10 moves):

| Event | Multiplier Range |
|-------|-----------------|
| Coast Guard intercept | 2.5-4.0× spike |
| Cartel flooding | 0.2-0.45× crash |
| DEA warehouse raid | 2.0-3.5× spike |
| Spring break demand | 1.8-2.8× spike |
| New batch at docks | 0.3-0.5× crash |
| Vice squad bust | 2.2-3.2× spike |

### Demand Decay

Each sale reduces local demand:
```
newDemand = max(0.4, demand - qty × 0.010)
```

Per-move recovery:
```
newDemand = max(0.4, (demand + (1 - demand) × 0.20) × careerSaturation)
careerSaturation = max(0.75, 1 - totalDeals × 0.001)  // Floor at 0.75 after 250 deals
```

---

## Police & Heat

### Heat Accumulation

Per travel:
```
heatChange = inventoryHeatCost - safeHouseDecay - passiveDecay
inventoryHeatCost = +4 (inv > 50) | +2 (inv > 20) | 0 (inv > 0) | -1 (empty)
passiveDecay = 2 if carrying nothing
safeHouseDecay = SAFE_HOUSES[tier].heatDecay (0/2/4/6/8)
```

**Heat floor** (can never cool below):
```
floor = totalProfit / 50000 + totalBusts × 3
```

### Police Encounter Chance

```
policeChance = locHeat × 0.5 × eraCopsMod × (1 + fedHeat/300) × nightMod × wealthMod

nightMod = 1.2 if night, 1.0 if day
wealthMod = 1.6 (cash ≥ $500K) | 1.4 (≥$250K) | 1.2 (≥$100K) | 1.0
```

Only triggers if carrying product.

### Location Heat Values

| Location | Base Heat | Description |
|----------|-----------|-------------|
| Miami Beach | 0.06 | Low |
| Little Havana | 0.10 | Medium |
| Overtown | 0.14 | High |
| Coral Gables | 0.05 | Low |
| Fort Lauderdale | 0.08 | Medium |
| The Keys | 0.04 | Lowest |

### Transaction Risk (Buy/Sell)

```
if (amount ≤ 3) return 0;  // Small deals are safe
sizeMultiplier = ((amount - 8) / 40)^2   // Quadratic above 8 units
risk = min(0.85, locHeat × 0.5 × (1 + sizeMultiplier) × eraCopsMod × (1 + fedHeat/200))
```

Sell risk is multiplied by 0.6 (selling is safer than buying).

### Legal Fees

```
fees = floor(txValue × 0.2 × eraPenaltyMod) + random(200, 800)
```

### Police Encounter Outcomes

**Run:**
- 55% success: escape, lose 40% of inventory
- 45% failure: 10-25 HP damage, lose 50% of inventory

**Fight:**
- With gun: 60% success. Without: 25% success
- Success: +5 cred
- Failure: 20-45 HP damage (scaled by era penalty), lose 25% of cash

**Bribe:**
- Cost: 15% of cash + $500-$2000
- If can't pay: all inventory confiscated

---

## Economy

### Loan Shark (Tiburón)

**Interest:** Every 4 moves:
```
baseInterest = 0.08
debtPenalty = +0.06 (≥$30K) | +0.04 (≥$20K) | +0.02 (≥$10K) | 0
debt = floor(debt × (1 + baseInterest + debtPenalty))
```

**Violence escalation (each travel):**

| Debt Tier | Threshold | Frequency | HP Loss | Cash Stolen |
|-----------|-----------|-----------|---------|-------------|
| Tier 1 | < $10K | Interest only | — | — |
| Tier 2 | ≥ $10K | Every 6 moves | 5-12 | — |
| Tier 3 | ≥ $20K | Every 4 moves | 10-20 | $300-$1000 |
| Tier 4 | ≥ $30K | Every 3 moves | 15-30 | $500-$2000 |

### Bank

- **Savings interest:** 3% every 4 moves (on bank balance)
- **Deposit/withdraw:** No fees
- **Debt payment:** Direct from cash

### Nightclub Laundering

If `club` lifestyle item owned:
```
laundered = min(2000, cash)
cash -= laundered
cleanCash += laundered
```

Happens automatically every travel.

### Success Tax

When cash ≥ $100K and era ≥ 1, every 8 moves:
```
shakedown = min(cash, floor(cash × 0.02))  // 2% of cash
```

### Failure Bonus

One-time mercy mechanic when:
- Cash ≤ $2000
- Total profit ≥ $5000 (not a brand new player)
- Has debt
- `got_failure_bonus` flag not set

Effect: Random drug at 40% of current price appears.

---

## Turf & Empire

### Turf Levels

| Level | Name | Income/move | Cost | Danger Mod |
|-------|------|-------------|------|------------|
| 0 | Unclaimed | $0 | — | — |
| 1 | Corner | $200 | $3,000 | -0.02 |
| 2 | Block | $600 | $10,000 | -0.04 |
| 3 | Territory | $1,500 | $25,000 | -0.06 |
| 4 | Borough | $3,000 | $60,000 | -0.08 |

### Enforcers

- **Cost:** $1,500 each
- **Upkeep:** $80/move each
- **Max per location:** 10
- **Requires:** Turf level > 0

### Turf War Resolution

Power calculation:
```
myPower = enforcers[loc] × 2 + (gun ? 3 : 0) + cred / 10
```

**Fight:** Win if `myPower > rivalPower` OR 40% random chance
- Win: +8 cred
- Lose: turf level -1, 1-2 enforcers lost

**Negotiate:** Pay $2,000-$6,000 bribe (if can't afford: turf -1)

**Abandon:** Turf and enforcers zeroed

Rival power scales: `basePower(3-8) + floor(move / 12)`

---

## Progression

### Era Transitions

Action-driven (minimum 5 moves per era):

| Transition | Conditions (any one) |
|------------|---------------------|
| Paradise → Anti-Drug Abuse Act | profit ≥ $25K, cred ≥ 30, fedHeat ≥ 15, turf ≥ 2 locations |
| Anti-Drug → Crack Epidemic | profit ≥ $100K, cred ≥ 60, turf ≥ 4 locations, (fedHeat ≥ 40 AND busts ≥ 3) |
| Crack → War on Drugs | profit ≥ $300K, fedHeat ≥ 65, (cred ≥ 80 AND turf ≥ 5), evidence ≥ 10 |
| War → Endgame | fedHeat ≥ 70, evidence ≥ 16, profit ≥ $500K |

### Era Parameters

| Era | Cops Mod | Penalty Mod | Color |
|-----|----------|-------------|-------|
| Paradise | 0.5 | 0.5 | Gold |
| Anti-Drug Abuse Act | 1.0 | 1.5 | Orange |
| Crack Epidemic | 1.2 | 1.5 | Pink |
| War on Drugs | 1.6 | 2.0 | Pink |
| Endgame | 2.0 | 2.5 | Red |

### Cred

- +1 per buy
- +2 per profitable sell
- +1 per unprofitable sell
- +5 from Maria's party
- +5 from buying turf
- +3-8 from turf war victories
- +5 from winning police fight
- Capped at 100

### Achievements

| ID | Trigger | Unlock |
|----|---------|--------|
| `first_sale` | First sell | Bank |
| `10k` | Net worth > $10K during travel | Safe Houses |
| `debt_free` | Debt reaches 0 | Empire, Lifestyle |
| `big_score` | Profit > $20K on single sale | — |
| `100k` | Net worth > $100K during travel | — |
| `kingpin_deal` | Profit > $100K on single sale | Kingpin Status |
| `first_turf` | Buy first turf | — |
| `empire3` | Own turf in 3+ locations | — |

### Streaks

Consecutive profitable trades. Bonuses:
- 3+: Gold border glow
- 5+: Stronger glow, particle text
- 10+: Rainbow border animation, fire particle burst, screen shake

---

## Lifestyle Items

| Item | Cost | Effect | Cred |
|------|------|--------|------|
| Ray-Bans 🕶️ | $500 | +2 cred | +2 |
| Versace Suit 🕴️ | $3,000 | 5% better buy prices | +5 |
| Brick Phone 📱 | $5,000 | Trade remotely 1x/day | — |
| Rolex ⌚ | $15,000 | +5 extra moves | — |
| Countach 🏎️ | $25,000 | Skip travel animation | +10 |
| Cigarette Boat 🚤 | $40,000 | Smuggling from Keys | — |
| Nightclub 🪩 | $60,000 | Launders $2K/move | — |
| Scarface Mansion 🏠 | $100,000 | Ultimate safe house | +20 |

### Safe Houses

| Tier | Name | Cost | Storage | Heat Decay |
|------|------|------|---------|------------|
| 0 | Motel Room 🏨 | $1,500 | 50 | 2/move |
| 1 | Apartment 🏢 | $5,000 | 120 | 4/move |
| 2 | Waterfront Condo 🌊 | $15,000 | 200 | 6/move |
| 3 | Houseboat ⛵ | $25,000 | 300 | 8/move |

---

## Pager Deals

12% base chance per travel (after move 5).

- **Bonus:** 30-150% over street price
- **Quantity:** 5-40 units
- **Expiry:** 3 moves
- **Completion:** Sell the specified drug at the target location before expiry

---

## Poker-Style Multi-Turn Deals

Activate when: cred ≥ 40, cash ≥ $30K, 15+ deals, era ≥ 1, 15% chance

**Step 0 — Offer:** Pay deposit, product arrives in 3 moves
**Step 1 — Complication:** DEA rumor. Pay 12% for alternate drop or risk it
**Step 2 — Temptation:** Rival offers to buy half at 80% value
**Step 3 — Resolution:**
- Intercept chance: 5% (alt drop) or 15% + heat×0.003 (direct)
- Success: product added to inventory
- Failure: lose deposit, evidence +3

---

## Random Encounters

18% day / 30% night chance after move 8:

| Type | Effect |
|------|--------|
| Find drugs | Free 3-20 units (if space) |
| Mugger | Fight (35%/65% with gun) or pay $100-$500, 5-15 HP loss |
| Tip | Flavor text about cheap drugs somewhere |
| Bribe offer | Pay $500-$2000 for -15 heat |
| Gamble | 45% win, bet 20% of cash (max $2000) |
| Healer | $300 for +30 HP |
| Snitch warning | +5-8 heat, flavor text |
| Witness defuse | Pay $2K to silence a witness (appears when witness fuse active, 40% chance) |
| DEA defuse | Pay $5K to kill a wiretap warrant (appears when DEA surveillance fuse active, 40% chance) |

---

## Balance Tuning Cheat Sheet

| Want to... | Adjust... |
|-----------|-----------|
| Make a drug more volatile | Increase `sigma` in DRUGS |
| Make prices revert faster | Increase `theta` in DRUGS |
| Change location specialization | Modify `priceMod` in LOCS |
| Adjust police frequency | Change `heat` in LOCS or `copsMod` in ERAS |
| Speed up era progression | Lower thresholds in PHASE_TRANSITIONS |
| Change loan shark pressure | Adjust debt tiers in processTravel (~line 1406) |
| Modify turf economics | Change `income`/`cost` in TURF_LEVELS |
| Adjust cred gains | Change per-action cred additions in processBuyDrug/processSellDrug |
| Scale enforcer effectiveness | Change power formula in processTurfWar |
| Tune pager deal frequency | Change base 0.12 chance in processTravel (~line 1492) |
