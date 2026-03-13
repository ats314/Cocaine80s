# Narrative Content Reference

Complete catalog of all storylets, NPC arcs, dialogue, and endings in COCAINE 80s.

## NPC Characters

### Maria Santos (💃)
**Voice:** Strategic wit, glamorous cynicism, occasionally vulnerable. Speaks in metaphors about class and hypocrisy.
**Color:** Flamingo pink (`#FF69B4`)
**Arc themes:** Connection, loyalty vs. business, class criticism, crack morality

| Trust | Relationship |
|-------|-------------|
| -3+   | Sells you out to Ramirez (evidence +5) |
| -1    | Cold, distant |
| 0     | Neutral |
| 1-2   | Helpful, gives tips |
| 3-4   | Close ally, laundering partner |
| 4+    | Personal connection, escape companion |

### Detective Ramirez (🕵️)
**Voice:** Tired, wry humor, fundamentally honest. Dark jokes about his salary and the system.
**Color:** Cyan (`#00E5FF`)
**Arc themes:** Patience, evidence accumulation, moral compromise, institutional failure

| Evidence | Status |
|----------|--------|
| 0-2      | Watching |
| 3-5      | Coffee meeting, establishing presence |
| 6-9      | Photos, direct warnings |
| 10-14    | Offer to become informant |
| 15-17    | Bribe opportunity |
| 18+      | Bust threshold (22 if protected informant) |

### El Colombiano (🇨🇴)
**Voice:** Quiet menace, darkly funny, philosophical. References Colombian proverbs. Owns a tiger named Capitalism.
**Color:** Orange (`#FF6B35`)
**Arc themes:** Power, partnership vs. independence, escalation, loyalty tests

| Trust | Relationship |
|-------|-------------|
| -5+   | Sends a hit crew (survivable with gun + cred 50) |
| -3    | Destroys product ($2K-$8K damage) |
| -2 to -1 | Hostile, applies tax |
| 0     | Neutral |
| 1-2   | Business partner |
| 3+    | Inner circle, crack business, zoo invitation |

### Agent Hoffman (🕴️)
**Voice:** Bureaucratic, transactional. Not a character you build a relationship with — he's a tool.
**Appears when:** `fedHeat >= 40` or `ramirez.evidence >= 8`, and `brick_deal_done` flag is set
**Role:** DEA agent, offers informant deal, calls in favors

---

## Storylet Catalog

### Opening Sequence (Comic Panels → Maria Brick Deal)

The game always starts with 5 comic panels, then Maria's brick deal:

**Maria Brick Deal** (inline at comic end):
- Lines: Maria calls about César, offers to sell the brick at 60/40
- Choice A: "Take the deal — $4,800" → trust +2, `maria_brick_debt` flag
- Choice B: "Push for 50/50 — $6,000" → trust +1, `maria_negotiated` flag
- Both set: `maria_friendly_intro`, `brick_deal_done`, `npc.maria.met`

### Maria Santos Arc

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `maria_intro` | 15 | 2+ deals, maria not met, no brick deal | Alternate intro at The Flamingo. Buy drink or refuse |
| `maria_second_chance` | 10 | $10K profit, cold intro, trust ≤0 | Recovery path — she offers wholesale tips |
| `maria_tip` | 9 | $5K profit, trust ≥1, friendly intro, 2+ deals since event | 2AM pager tip about Overtown demand |
| `maria_party` | 10 | cred ≥10, trust ≥2, 3+ deals since event | Coral Gables mansion party, meet connected people (+5 cred) |
| `maria_launder` | 9 | $30K profit, trust ≥2, cash ≥$8K | Art gallery laundering ($5K → $4.5K clean) |
| `maria_personal` | 10 | cred ≥20, trust ≥4, Ramirez met | 3AM vulnerable moment, mother's story |
| `maria_react_crack` | 7 | maria met, trust ≥0, selling crack | Maria confronts you about crack dealing (-2 trust) |

**Maria flags:**
- `maria_friendly_intro` — Positive first meeting
- `maria_cold_intro` — Negative first meeting
- `maria_recovered` — Second chance storylet fired
- `maria_gave_tip` — Received pager tip
- `maria_party_done` — Attended party
- `high_society` — Mingled at party
- `maria_launder_offered` — Laundering offered
- `used_launder` — Used laundering
- `maria_personal_done` — Personal scene completed
- `maria_close` — Close relationship
- `maria_rejected` — Rejected personal connection
- `maria_hates_crack` — Confronted about crack
- `maria_brick_debt` — Took 60/40 deal
- `maria_negotiated` — Pushed for 50/50
- `maria_gone` — Left Miami (after betrayal)
- `maria_sold_out` — Maria leaked to Ramirez (auto, trust ≤-3)

### Detective Ramirez Arc

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `ramirez_intro` | 15 | fedHeat ≥15, not met | Barber warns about brown sedan outside |
| `ramirez_coffee` | 10 | met, evidence ≥3, 1+ bust, 3+ deals since | "I know that you know" coffee meeting |
| `ramirez_photos` | 10 | evidence ≥6, had coffee, 3+ deals since | Polaroids on windshield with wry note |
| `ramirez_offer` | 12 | evidence ≥10, 3+ deals since | Become informant or refuse |
| `ramirez_bribe` | 9 | evidence ≥8, fedHeat ≥30, cash ≥$5K, 3+ deals since | $5K bribe in parking garage |

**Ramirez flags:**
- `ramirez_watching` — Met, now under surveillance
- `ramirez_coffee` — Coffee meeting occurred
- `ramirez_disrespected` — Walked away from coffee
- `ramirez_photos` — Received photos
- `ignored_warning` — Dismissed photos as bluff (+2 evidence)
- `ramirez_deal_offered` — Informant deal offered
- `became_informant` — Accepted informant role
- `refused_ramirez` — Refused deal (+3 evidence, escalates patience mechanic)
- `ramirez_bribe_done` — Bribe scene occurred
- `bribed_ramirez` — Gave $5K (-5 evidence)
- `spared_ramirez` — Walked away from bribe

### El Colombiano Arc

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `colombiano_intro` | 15 | $25K profit, not met | Café meeting, croquetas, partnership offer |
| `colombiano_second` | 10 | $40K profit, rejected, trust ≤0 | Second chance — supply deal or pay tax |
| `colombiano_gift` | 10 | biggest deal ≥$10K, trust ≥1, friendly, 3+ deals since | Briefcase of cocaine |
| `colombiano_zoo` | 10 | cred ≥25, trust ≥3, 3+ deals since | Compound visit, tiger, crack business |

**Colombiano flags:**
- `colombiano_friendly` — Accepted partnership
- `colombiano_rejected` — Refused partnership
- `colombiano_recovered` — Second chance resolved
- `colombiano_taxed` — Paying 30% tax
- `colombiano_gift` — Gift storylet fired
- `took_product` — Accepted cocaine gift
- `returned_product` — Returned gift
- `colombiano_zoo` — Zoo storylet fired
- `crack_partner` — Joined crack business
- `stayed_independent` — Refused crack business
- `colombiano_arrested` — Arrested via informant arc
- `colombiano_hit_survived` — Survived assassination (gun + cred 50)

### Faction Dispute Chain (Mid-Game)

**Trigger:** Colombiano met, cred ≥50, era ≥2

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `faction_dispute` | 13 | As above, 3+ deals since | Choose Medellín, Cali, or independent |
| `faction_medellin_heat` | 11 | Medellín chosen, fedHeat ≥50, $200K profit | DEA raids Medellín, supply collapses |
| `faction_cali_squeeze` | 11 | Cali chosen, $200K profit | Cali demands 40% revenue |
| `faction_lone_wolf` | 8 | Independent chosen, $150K profit | Both sides lose patience, prices +10% |

**Faction flags:**
- `faction_chosen` — Made faction decision
- `faction_medellin` / `faction_cali` / `faction_independent` — Which faction
- `faction_downstream` — Consequence storylet fired
- `medellin_collapsed` — Medellín raids, cocaine prices +40%
- `cali_franchise` — Paying Cali, cocaine prices +15%
- `cali_rejected` — Left Cali
- `lone_wolf_pressure` — All prices +10%

### Informant Arc

**Trigger:** `became_informant` flag (from Ramirez offer or Medellín collapse)

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `informant_first_task` | 14 | became informant, 2+ deals since | Give real intel or garbage |
| `informant_second_task` | 14 | completed first task, 5+ deals | Give up Colombiano or Maria |
| `informant_discovered` | 15 | informant, colombiano trust ≤-3, colombiano met, 3+ deals since | Colombiano finds out — run or get protection |
| `maria_betrayal_react` | 14 | burned_maria, maria met, 2+ deals since | Maria confronts you |
| `colombiano_betrayal_react` | 14 | burned_colombiano, 2+ deals since | Colombiano arrested, narrator report |

**Informant flags:**
- `informant_task_1` / `informant_task_2` — Task milestones
- `burned_supplier` / `gave_garbage` — First task choices
- `burned_colombiano` / `burned_maria` — Second task targets
- `refused_to_burn` — Refused both (+5 evidence)
- `informant_exposure` — Cover blown
- `burned_must_flee` — Chose to run
- `hoffman_protection` — Called Hoffman for protection
- `maria_betrayal_done` / `colombiano_betrayal_done` — Reactions completed

### Gameplay-Triggered Storylets

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `first_big_sale` | 4 | biggest deal ≥$5K | "Corner boys nod when you pass" |
| `ten_k_milestone` | 8 | cash ≥$10K, Maria met, trust ≥0 | Maria congratulates, advises paying debt |
| `debt_paid` | 5 | debt ≤0, 3+ deals | "Nobody owns a piece of you" |
| `first_bust_react` | 8 | 1+ bust, Ramirez met | Note from Ramirez about evidence |
| `colombiano_notices` | 7 | Colombiano met, biggest deal ≥$30K | Pager: "Impressive. — E.C." |

### Milestone Storylets

| ID | Priority | Conditions | Summary |
|----|----------|------------|---------|
| `milestone_week_one` | 4 | $10K profit | "Week one. Still alive." |
| `milestone_ramirez_knows` | 4 | evidence ≥5 | Surveillance photo circled in red |
| `milestone_crossroads` | 4 | cred ≥20, heat ≥25 | "Are you a businessman or a criminal?" |

### Flavor Storylets (Narrator, inline as evtMsg)

| ID | Priority | Trigger | Text Theme |
|----|----------|---------|------------|
| `flav_bank` | 2 | $3K profit | First National orders second vault |
| `flav_mutiny` | 2 | 4+ deals, in Miami Beach | Mutiny Hotel description |
| `flav_stirrers` | 1 | 5+ deals | McDonald's coffee stirrer shortage |
| `flav_lambos` | 1 | $4K profit | Twelve Lamborghinis, cash |
| `flav_speedboat` | 1 | 5+ deals, in Keys | Cigarette boat racer story |
| `flav_godmother` | 1 | $8K profit | La Madrina backstory |
| `flav_banker` | 1 | $15K profit | Brickell banker in khakis |
| `flav_burger` | 2 | $50K profit | ME rents Burger King trailer |
| `flav_doctor` | 1 | $30K profit | ME abbreviating cause of death |
| `flav_vice` | 1 | 5+ deals, Miami Beach | Undercover detectives in Ferrari |

### Hoffman Encounter (Fuse Chain)

Not a storylet — triggered directly in `processTravel` when:
- `brick_deal_done` flag set
- `fedHeat >= 40` OR `ramirez.evidence >= 8`
- `cesarGhost` fuse not yet fired

Choices:
- **Deny everything** → fedHeat +8, evidence +3, `hoffman_denied`
- **Run** → move +2, fedHeat +5, `hoffman_ran`
- **Give him something small** → fedHeat -10, `hoffman_cooperated`, `protected_informant` (bust threshold raised to 22)

---

## Ending System

### Endings and Triggers

| Ending | ID | Trigger |
|--------|----|---------|
| Busted 🚔 | `bust` | Ramirez evidence ≥ 18 (or 22 if protected) |
| Informant 🐀 | `informant` | Evidence ≥ 15 + `hoffman_cooperated` + not `informant_complete` |
| Dead 💀 | `dead` | HP ≤ 0, or Colombiano hit (trust ≤-5, no gun/cred counter) |
| Broke 🚌 | `broke` | Cash, bank, cleanCash all 0 + no inventory + debt > 0 + no turf income |
| Burned 🔥 | `burned` | `informant_exposure` + no `hoffman_protection` + Colombiano alive + trust ≤-5 |
| Escape ✈️ | `escape` | Player-initiated at escape screen (cash ≥ $50K clean) or `burned_must_flee` |
| Kingpin 👑 | `kingpin` | Player-initiated at escape screen (cred ≥ 80 + profit ≥ $500K + turf ≥ 5) |

### Broke Choice Screen

When `broke` triggers, player gets a choice screen:
- **Take the bus home** → broke ending
- **Beg Tiburón** → $2000 cash, +$5000 debt, continues game
- **Call Maria** (if trust ≥ 1) → $3000 cash, continues game

### Escape Screen

Appears from game menu when conditions are met:
- **Fly to the Caymans** → requires cleanCash ≥ $50K → escape ending
- **Claim the throne** → requires cred ≥ 80, profit ≥ $500K, turf ≥ 5 → kingpin ending
- **Stay in the game** → dismiss

### Narrative Epilogue (generateNarrative)

Each ending generates a unique epilogue assembled from:

1. **Opener** — 3 templates per ending in `NARRATIVE_OPENERS` (line ~310)
2. **Beats** — Selected from `NARRATIVE_BEATS` based on montage events:
   - Big score, snitching, alliance, turf won/lost, mansion/countach, era shifts, streaks, bust survival, debt, high heat
3. **NPC Closers** — Per-ending NPC epilogues (line ~432):
   - Maria's fate (on the plane / didn't come / lit a candle / runs legitimate side)
   - Colombiano's fate (champagne / flowers / 40 years in Coleman / silent partner)
   - Ramirez's fate (retired / tried to intervene / pension in Hialeah)
   - Hoffman's fate (promotion / doesn't call anymore)

---

## Fuse Chains (Delayed Consequences)

Backstory-driven, triggered by flags + thresholds in `processTravel`:

| Fuse | Trigger | Effect |
|------|---------|--------|
| `mariaBrickDebt` | $15K profit + `maria_brick_debt` flag | Maria sends pager tip as payback |
| `mariaNegotiated` | $30K profit + `maria_negotiated` flag | Maria sends bad intel (test) |
| `cesarGhost` | `brick_deal_done` + (heat ≥40 OR evidence ≥8) | Agent Hoffman appears |

## Defusable Fuse Timers

Planted silently, detonate after N moves:

| Timer | Planted When | Fuse | Detonation |
|-------|-------------|------|------------|
| `witness` | Deal ≥$15K in public location (Beach/Havana/Gables) | 8 moves | Evidence +3, police sketch |
| `stash_raid` | Stash value >$30K + heat ≥25 | 6 moves | All stash inventory zeroed |

Defuse: Witness — return and pay $2K (encounter). Stash — empty the stash before timer.

---

## Content Statistics

- **Total storylets:** 30 (in STORY object)
- **Maria storylets:** 7 + brick deal + betrayal reaction
- **Ramirez storylets:** 5 + first bust reaction
- **Colombiano storylets:** 5 + notice + betrayal reaction
- **Faction chain:** 4 storylets
- **Informant chain:** 3 storylets
- **Milestone/flavor:** 13 storylets
- **Narrative openers:** 21 (3 per 7 endings)
- **Narrative beats:** 13 templates
- **Newspaper headlines:** 15
- **Random encounters:** 12
- **Pager deal templates:** 10
- **Radio event templates:** 6
- **Location vibe lines:** 36 (6 locations × 3 day + 3 night)
- **Comic panels:** 5
