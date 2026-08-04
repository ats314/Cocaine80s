import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";

// ╔═══════════════════════════════════════════════════════════════╗
// ║  PORTABLE GAME ENGINE — Cut here for React Native port       ║
// ║  v3.0 — THE SAFEHOUSE UPDATE                                 ║
// ║  + Meta-progression + Playbooks + Daily Challenges           ║
// ╚═══════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════
// COCAINE 80s — GAME ENGINE (Portable)
// No React. No DOM. Pure state transitions.
// This file ports to React Native with ZERO changes.
// ═══════════════════════════════════════════════════════════════

// ── PALETTE ──
const C = {
pink:"#FF2D7B", blue:"#00E5FF", orange:"#FF6B35", green:"#00C9A7",
purple:"#7B2FBE", gold:"#FFD700", flamingo:"#FF69B4", ocean:"#0A1628",
dark:"#060E1A", panel:"#0C1829", border:"#152238", text:"#D4E0ED",
dim:"#4A6280", midnight:"#020810",
};

// ── LOCATIONS ──
const LOCS = [
{ name:"Miami Beach", icon:"🏖️", color:C.flamingo, creed:.8, heat:.06, desc:"Tourist cover, luxury buyers", priceMod:[1.3,1.1,.7] },
{ name:"Little Havana", icon:"🌴", color:C.orange, creed:1, heat:.10, desc:"Cartel connections, cheap imports", priceMod:[.7,.9,1.3] },
{ name:"Overtown", icon:"🏚️", color:C.pink, creed:1.2, heat:.14, desc:"Crack territory, high volume", priceMod:[.6,1.2,1.1] },
{ name:"Coral Gables", icon:"🏛️", color:C.green, creed:.6, heat:.05, desc:"Rich suburbs, quiet deals", priceMod:[1.1,.6,1.0] },
{ name:"Fort Lauderdale", icon:"🎓", color:C.blue, creed:.9, heat:.08, desc:"College town, party drugs", priceMod:[1.0,1.0,.8] },
{ name:"The Keys", icon:"🚤", color:C.gold, creed:.7, heat:.04, desc:"Smuggling routes, low police", priceMod:[1.2,1.1,.5] },
];

// ── LOCATION ATMOSPHERE ──
// Short evocative lines that change with time of day. Shown in game header.
const LOCATION_VIBE = [
// Miami Beach
{ day: ["Tourist cameras flash on every corner", "Sunscreen and money in the salt air", "Bikinis and Benzes line the strip"], night: ["Neon reflects off wet Ocean Drive", "Bass thumps from club doors left open", "The beautiful people pretend not to see you"] },
// Little Havana
{ day: ["Domino tiles crack like gunshots in the park", "Café Cubano steam rises through open windows", "Old men argue about a country they’ll never see again"], night: ["Salsa pours from every doorway on Calle Ocho", "The smell of lechón and danger", "Headlights sweep past murals of a homeland lost"] },
// Overtown
{ day: ["Crackheads pace the sidewalk like broken clocks", "Boarded windows watch with painted eyes", "A shopping cart rolls through an intersection alone"], night: ["Blue TV glow behind barred windows", "Sirens in the distance — always in the distance", "The only open business sells what you’re selling"] },
// Coral Gables
{ day: ["Sprinklers hiss on lawns that cost more than your life", "A gardener pretends he didn’t see you", "Spanish tile roofs gleam like teeth"], night: ["Porch lights illuminate nothing but silence", "Money sleeps here. Crime visits.", "Your footsteps echo off Mediterranean Revival walls"] },
// Fort Lauderdale
{ day: ["Spring breakers stumble from bar to bar before noon", "Frat boys haggle like they invented the hustle", "Sand in everything — shoes, pockets, product"], night: ["Party boats throb on the Intracoastal", "College kids will buy anything you tell them to", "Red and blue lights sweep the strip — spring break patrol"] },
// The Keys
{ day: ["Pelicans circle a shrimp boat heading south", "The water is so clear you can see the bottom", "A seaplane banks low over the mangroves"], night: ["Cigarette boats hug the dark shoreline", "Stars you never see in Miami", "The tide whispers about what it’s carried in"] },
];

// ── DRUGS (8 total) ──
const DRUGS = [
{ name:"Weed",     tier:0, mean:22,  min:8,   max:55,  sigma:.40, theta:.3,  emoji:"🌿" },
{ name:"Xanax",    tier:0, mean:18,  min:6,   max:45,  sigma:.30, theta:.3,  emoji:"💊" },
{ name:"Oxy",      tier:1, mean:45,  min:15,  max:110, sigma:.28, theta:.25, emoji:"🩹" },
{ name:"Adderall", tier:1, mean:20,  min:7,   max:50,  sigma:.32, theta:.3,  emoji:"⚡" },
{ name:"Crack",    tier:1, mean:35,  min:10,  max:90,  sigma:.50, theta:.2,  emoji:"🔥" },
{ name:"Cocaine",  tier:2, mean:300, min:120, max:700, sigma:.25, theta:.15, emoji:"❄️" },
{ name:"Heroin",   tier:2, mean:150, min:50,  max:350, sigma:.28, theta:.15, emoji:"💀" },
{ name:"Ecstasy",  tier:2, mean:35,  min:12,  max:80,  sigma:.30, theta:.2,  emoji:"🦋" },
];
const DRUG_COUNT = DRUGS.length;

const RADIO_EVENTS = [
{ msg:"Coast Guard intercepted a shipment! {d} prices through the roof!", type:"spike", m:[2.5,4] },
{ msg:"Colombian cartel flooding Miami with {d}! Prices crash!", type:"crash", m:[.2,.45] },
{ msg:"DEA just raided a {d} warehouse in Overtown!", type:"spike", m:[2,3.5] },
{ msg:"Spring break in Fort Lauderdale — {d} demand is insane!", type:"spike", m:[1.8,2.8] },
{ msg:"New batch of {d} hit the docks. Street prices dropping!", type:"crash", m:[.3,.5] },
{ msg:"Vice squad busted three dealers. {d} supply is tight!", type:"spike", m:[2.2,3.2] },
];

const PAGER_DEALS = [
{ msg:"📟 NEED {q} {d}. SOUTH BEACH. PARTY AT THE FONTAINEBLEAU. MODELS. +{p}%.", bonus:[1.3,1.8], qty:[5,20] },
{ msg:"📟 KEYS. MIDNIGHT. BRING {q} {d}. IF NO BOAT, BRING SWIMMING SKILLS. +{p}%.", bonus:[1.4,2.0], qty:[10,30] },
{ msg:"📟 CRACK DRY IN OVERTOWN. {q} UNITS. NAME YOUR PRICE. LITERAL. +{p}%.", bonus:[1.5,2.2], qty:[8,25] },
{ msg:"📟 SPRING BREAK EMERGENCY. FRAT HOUSE ON A1A. {q} {d}. DADDY’S AMEX. +{p}%.", bonus:[1.3,1.6], qty:[15,40] },
{ msg:"📟 CORAL GABLES DINNER PARTY. {q} {d}. ‘PHARMACEUTICAL GRADE ONLY.’ +{p}% OVER.", bonus:[1.6,2.5], qty:[5,15] },
{ msg:"📟 COP’S BACHELOR PARTY. YES REALLY. {q} {d}. DOUBLE RATE. IRONY IS FREE. +{p}%.", bonus:[1.5,2.0], qty:[5,15] },
{ msg:"📟 MUSICIAN AT FONTAINEBLEAU. LAST TIME HE TIPPED $3K. {q} {d}. NO AUTOGRAPHS. +{p}%.", bonus:[1.6,2.2], qty:[8,20] },
{ msg:"📟 YACHT PARTY BISCAYNE BAY. PASSWORD IS ‘REAGAN SUCKS.’ {q} {d}. DRESS CODE: WHITE. +{p}%.", bonus:[1.4,1.9], qty:[10,25] },
{ msg:"📟 COLOMBIANO LOOKING FOR {q} {d}. THIS IS NOT A TRAP. (PROBABLY NOT A TRAP.) +{p}%.", bonus:[1.3,1.7], qty:[10,30] },
{ msg:"📟 DOCTOR NEEDS {q} {d}. YES THE DOCTOR IS THE CUSTOMER. DON’T JUDGE. +{p}%.", bonus:[1.4,2.0], qty:[5,15] },
];

const ERAS = [
{ name:"Paradise", desc:"No enforcement. Easy money.", copsMod:0.5, penaltyMod:0.5, color:C.gold,
demandMod:[1,1,1,1,1,1,1,1] },
{ name:"Anti-Drug Abuse Act", desc:"Mandatory minimums. The heat is real.", copsMod:1.0, penaltyMod:1.5, color:C.orange,
demandMod:[1.3,.8,.7,1,1.2,.8,.9,1.1] },
{ name:"Crack Epidemic", desc:"Crack demand explodes. Choose your path.", copsMod:1.2, penaltyMod:1.5, color:C.pink,
demandMod:[.9,1.1,1,1,3,.6,1.8,1.2] },
{ name:"War on Drugs", desc:"Military interdiction. The walls are closing in.", copsMod:1.6, penaltyMod:2.0, color:C.pink,
demandMod:[1.4,1.5,1.3,1.4,.8,.5,.6,1] },
{ name:"Endgame", desc:"Everyone wants you — dead or alive.", copsMod:2.0, penaltyMod:2.5, color:"#ff0000",
demandMod:[.7,.6,.6,.7,.5,.4,.5,.6] },
];

// Phase transition thresholds — checked every travel action
const PHASE_TRANSITIONS = [
// Paradise → Anti-Drug Abuse Act
(s) => s.totalProfit >= 25000 || s.cred >= 30 || s.fedHeat >= 15 || s.turf.filter(t=>t>0).length >= 2,
// Anti-Drug Abuse Act → Crack Epidemic
(s) => s.totalProfit >= 100000 || s.cred >= 60 || s.turf.filter(t=>t>0).length >= 4 || (s.fedHeat >= 40 && (s.totalBusts||0) >= 3),
// Crack Epidemic → War on Drugs
(s) => s.totalProfit >= 300000 || s.fedHeat >= 65 || (s.cred >= 80 && s.turf.filter(t=>t>0).length >= 5) || (s.npcState?.ramirez?.evidence||0) >= 10,
// War on Drugs → Endgame
(s) => s.fedHeat >= 70 || (s.npcState?.ramirez?.evidence||0) >= 16 || s.totalProfit >= 500000,
];

const LIFESTYLE = [
{ name:"Ray-Bans", icon:"🕶️", cost:500, credBoost:2, desc:"+2 street cred", effect:"cred" },
{ name:"Versace Suit", icon:"🕴️", cost:3000, credBoost:5, desc:"5% better buy prices", effect:"prices" },
{ name:"Brick Phone", icon:"📱", cost:5000, desc:"Trade remotely 1x/day", effect:"phone" },
{ name:"Countach", icon:"🏎️", cost:25000, credBoost:10, desc:"Skip travel animation, +10 cred", effect:"car" },
{ name:"Cigarette Boat", icon:"🚤", cost:40000, desc:"Smuggling runs from Keys", effect:"boat" },
{ name:"Scarface Mansion", icon:"🏠", cost:100000, credBoost:20, desc:"Ultimate safe house, +20 cred", effect:"mansion" },
{ name:"Rolex", icon:"⌚", cost:15000, desc:"+5 extra moves", effect:"rolex" },
{ name:"Nightclub", icon:"🪩", cost:60000, desc:"Launders $2K/move to clean cash", effect:"club" },
];

const SAFE_HOUSES = [
{ name:"Motel Room", cost:1500, storage:50, heatDecay:2, icon:"🏨" },
{ name:"Apartment", cost:5000, storage:120, heatDecay:4, icon:"🏢" },
{ name:"Waterfront Condo", cost:15000, storage:200, heatDecay:6, icon:"🌊" },
{ name:"Houseboat", cost:25000, storage:300, heatDecay:8, icon:"⛵" },
];

const TURF_LEVELS = [
{ name:"Unclaimed", income:0, cost:0, dangerMod:0, icon:"⬜" },
{ name:"Corner", income:200, cost:3000, dangerMod:-.02, icon:"🟨" },
{ name:"Block", income:600, cost:10000, dangerMod:-.04, icon:"🟧" },
{ name:"Territory", income:1500, cost:25000, dangerMod:-.06, icon:"🟥" },
{ name:"Borough", income:3000, cost:60000, dangerMod:-.08, icon:"👑" },
];
const ENFORCER_COST = 1500;
const ENFORCER_UPKEEP = 80;

const RIVALS_NAMES = ["Rico","Alejandra","El Gato","Scarface Jr.","Mama Coco"];


// ── COACH MARKS — Contextual hints that teach by doing ──
const COACH_MARKS = [
{ id:"tap_drug",   text:"Tap a drug to see the price", trigger:"market_first", dismiss:"select_drug" },
{ id:"buy_low",    text:"Buy low, sell high", trigger:"select_drug_first", dismiss:"first_buy" },
{ id:"travel_tip", text:"Prices change by location →", trigger:"first_buy", dismiss:"timer", timerMs:4000 },
{ id:"new_loc",    text:"Prices are different here", trigger:"first_travel", dismiss:"open_market" },
{ id:"sell_high",  text:"This sells for more here 📈", trigger:"profitable_item", dismiss:"first_sell" },
{ id:"heat_warn",  text:"Heat rises when you deal big ⚠️", trigger:"first_police", dismiss:"timer", timerMs:3000 },
{ id:"qte_hint",   text:"Try ESCAPE for a QTE mini-game ⚡", trigger:"first_police", dismiss:"timer", timerMs:4000 },
{ id:"loan_help",  text:"Need cash? Pay off debt in Bank 🦈", trigger:"first_broke", dismiss:"timer", timerMs:4000 },
{ id:"enc_intro",  text:"Random encounter — read carefully ⚡", trigger:"first_encounter", dismiss:"timer", timerMs:3000 },
{ id:"deal_intro", text:"Multi-step deal — choices matter 🤝", trigger:"first_deal", dismiss:"timer", timerMs:3500 },
{ id:"defuse_hint",text:"Pay now or face consequences later 💣", trigger:"first_defuse", dismiss:"timer", timerMs:3500 },
];

// ── QTE (Quick Time Events) — Timed action sequences ──
const QTE_SEQUENCES = [
["←","→","←"],         // Easy (3 inputs)
["→","↑","←","→"],     // Medium (4 inputs)
["↑","←","↓","→","↑"], // Hard (5 inputs)
]
const QTE_KEYS = { ArrowLeft:"←", ArrowRight:"→", ArrowUp:"↑", ArrowDown:"↓", a:"←", d:"→", w:"↑", s:"↓" }
const QTE_TIME_MS = [4000, 3500, 3000] // Time limit per difficulty

const COMIC_PANELS = [
{ bg:"linear-gradient(180deg,#0a0818 0%,#1a0a30 20%,#e87040 55%,#f0a030 75%,#060E1A 100%)", text:"MIAMI. AUGUST 1980.", sub:"The cocaine cowboys just started the party.", icon:"🌴" },
{ bg:"linear-gradient(180deg,#0a0a15 0%,#151525 40%,#252535 70%,#0a0a15 100%)", text:"CÉSAR GOT ARRESTED IN PANAMA.", sub:"You kept the brick.", icon:"🚌" },
{ bg:"linear-gradient(180deg,#1a0a20 0%,#3d1040 50%,#1a0a20 100%)", text:"ONE NAME. ONE KILO. NO PLAN.", sub:"Classic.", icon:"🔥" },
{ bg:"linear-gradient(180deg,#050510 0%,#0d0a22 40%,#3d1040 80%,#060E1A 100%)", text:"YOU JUST GOT OFF THE BUS.", sub:"In your bag: $200 and one brick of Bolivian flake.", icon:"💰" },
{ bg:"linear-gradient(180deg,#3d1040 0%,#8b2050 30%,#cc4060 60%,#060E1A 100%)", text:"FIND MARIA SANTOS.", sub:"Flip the brick. Start the clock.", icon:"💃" },
];

const NEWSPAPERS = [
{ headline:"BANK VAULT OVERFLOW", sub:"First National has too much cash, orders second vault. ‘It’s a good problem to have,’ says manager who definitely doesn’t know where the cash comes from.", icon:"🏦" },
{ headline:"LOCAL MAN BUYS TWELVE LAMBORGHINIS IN CASH", sub:"‘I have a large family,’ he told the dealer. IRS has requested an interview.", icon:"🏎️" },
{ headline:"COAST GUARD RETRIEVES 500 LBS FROM BEACH", sub:"Local joggers got there first. Report ‘only 200 lbs found.’ Math teachers concerned.", icon:"🏖️" },
{ headline:"REAL ESTATE BOOM CONTINUES", sub:"Luxury condos selling faster than developers can build. Buyers pay cash. Nobody asks questions. It’s called the free market.", icon:"🏗️" },
{ headline:"DADE COUNTY ME RENTS BURGER KING TRAILER", sub:"‘We needed the cold storage,’ he says. ‘I want to be clear that no burgers were involved.’ Murder rate exceeded capacity.", icon:"🍔" },
{ headline:"MANDATORY MINIMUMS SIGNED INTO LAW", sub:"Congress decides 5 grams of crack equals 500 grams of powder. Math teachers even more concerned.", icon:"⚖️" },
{ headline:"DEA AGENT CAUGHT STEALING FROM EVIDENCE LOCKER", sub:"‘It was a moment of weakness,’ says man wearing new Rolex.", icon:"🕵️" },
{ headline:"ASSET FORFEITURE BONANZA", sub:"Government seizes 47 Ferraris, 12 yachts, 3 private planes, and one very confused tiger.", icon:"🐅" },
{ headline:"TURF WAR CLAIMS SIX IN OVERTOWN", sub:"Witnesses saw nothing, heard nothing, know nothing. ‘We have selective amnesia,’ says resident. ‘It’s a survival strategy.’", icon:"🔫" },
{ headline:"SUBURBAN CRACK USE SURGES", sub:"Coral Gables parents shocked to discover drugs exist outside of neighborhoods they’d never visit.", icon:"🏡" },
{ headline:"INFORMANT PROGRAM EXPANDS", sub:"‘Snitching is patriotic,’ says prosecutor who has never lived in a neighborhood where snitching has consequences.", icon:"🐀" },
{ headline:"LOCAL BANKER INDICTED", sub:"Processed $1.2B without filing currency reports. His defense: ‘I thought they were very successful lemonade stands.’", icon:"💰" },
{ headline:"WITNESS PROTECTION AT CAPACITY", sub:"‘We’re running out of small towns in Ohio,’ says U.S. Marshal.", icon:"🏘️" },
{ headline:"MIAMI RENAMES ITSELF", sub:"New tourism slogan: ‘Miami: We Have Culture Now. Please Stop Asking About the Cocaine.’", icon:"🌴" },
];

// ── END-OF-RUN NARRATIVE ──
// Assembles montage events into a cinematic 2-3 sentence story.
// Framed as Miami Herald article (busts/death) or VHS voiceover (escape/retirement).
const NARRATIVE_OPENERS = {
death: [
"They found Diego Reyes in a drainage ditch off the Palmetto. The wallet was empty. The pager was still buzzing.",
"It ended the way the barber predicted. Fast, bloody, and forgotten by Tuesday. César would’ve laughed.",
"The bus from Panama brought him here. A coroner’s van took him away. Miami doesn’t remember either trip.",
],
bust: [
"VICE BUST — Ramirez closes the book on {loc} operation. \"This one’s for César Vargas,\" he told the Herald.",
"BREAKING: DEA Task Force arrests suspect linked to Panama pipeline. Evidence included a matchbook with a phone number.",
"The handcuffs went on outside the café on Calle Ocho. Ramirez had been patient. Fifteen years of patience, and it paid off.",
],
kingpin: [
"They say Diego Reyes owns Miami now. The feds can’t touch him. The cartel respects him. The city belongs to the man who arrived on a Greyhound.",
"From one brick and a matchbook to an empire. The bus station janitor still tells the story.",
"Kingpin. The word used to mean someone else. Now it means the kid who got off the bus from Panama with nothing and took everything.",
],
escape: [
"Diego Reyes boarded a charter to the Caymans with {cash} in clean money. The feds arrived twenty minutes later. The tarmac was empty.",
"The matchbook went in the trash at Miami International. María’s number was memorized. Everything else was left behind.",
"He came on a Greyhound. He left on a Cessna. In between, he became someone worth chasing — and smart enough to stop running.",
],
broke: [
"The Greyhound to Tallahassee leaves at 6 AM. Diego Reyes is on it. Same bag. No brick this time. Just a tan and a story nobody believes.",
"Miami chewed him up and spit him back onto the bus. César’s name on that matchbook was supposed to change everything. It didn’t.",
"In the end, the city took back everything it gave him. The pager doesn’t buzz anymore. The phone number’s been disconnected.",
],
informant: [
"Diego Reyes walked out of the federal building a free man. The price: every name he ever knew. The streets will find out eventually.",
"Hoffman kept his word. The charges disappeared. So did every friend Diego ever made in Miami.",
"Protected witness. New name, new city, new life. The old one is sealed in a file cabinet in the Dade County courthouse. Nobody will ever open it.",
],
burned: [
"They found out. Both sides — the law and the cartel — and neither side protects a snitch. Diego Reyes became a cautionary tale told in whispers at Café Versailles.",
"The informant who got caught. It happens more than the FBI admits. Hoffman’s umbrella wasn’t big enough. Colombiano’s reach was longer.",
"A snitch in Miami has a life expectancy measured in news cycles. Diego’s lasted three. The Herald ran his photo on page six. Nobody claimed the body.",
],
};

const NARRATIVE_BEATS = {
bigScore:  "The {drug} play in {loc} — that score changed everything. Word spread through every strip in Dade County.",
snitched:  "Ramirez got his informant. El Colombiano never saw it coming, and the streets never forgot.",
allied:    "The alliance with El Colombiano opened doors most people don’t even know exist.",
turfWon:   "Taking {loc} by force sent a message from the Keys to Broward.",
turfLost:  "Losing ground in {loc} was the kind of wound that doesn’t heal.",
mansion:   "The mansion on Star Island — white marble, infinity pool, the whole fever dream made real.",
countach:  "The white Countach became a calling card. You could hear it three blocks away.",
bustSurv:  "Survived a bust in {loc}. The holding cell was cold, but the lawyer was colder.",
eraCrack:  "When the Crack Epidemic hit, the money came faster than anyone could count.",
eraWar:    "The War on Drugs turned every deal into a coin flip between fortune and a cell.",
streak:    "A {n}-trade streak that had every dealer on the strip asking for the playbook.",
mariaMet:  "Maria Santos opened doors that money alone couldn’t buy.",
debt:      "The shark got his money. Every cent, plus interest. That was the deal.",
heatHigh:  "Every cop in Dade County had the description. Even the dirty ones were scared.",
};

function generateNarrative(s) {
const nw = Math.max(0, s.cash + s.bank + s.cleanCash - s.debt + s.inv.reduce((a, v, i) => a + v * s.prices[i], 0));
const days = Math.floor(s.move / 2) + 1;
const loc = LOCS[s.loc].name;

// Use the ending stored in state (set by action-driven triggers)
const ending = s.ending || 'broke';

// Pick opener
const openers = NARRATIVE_OPENERS[ending] || NARRATIVE_OPENERS.broke;
const opener = openers[s.move % openers.length]
.replace("{player}", "Diego")
.replace("{loc}", loc)
.replace("{days}", days)
.replace("{cash}", FM(s.cleanCash || 0));

// Scan montage for narrative beats
const beats = [];
const montage = s.montage || [];

// Find biggest score from montage
const bigScores = montage.filter(m => m.text.startsWith("Big score:"));
if (bigScores.length > 0) {
const last = bigScores[bigScores.length - 1];
const drugMatch = last.text.match(/on (.+)$/);
beats.push(NARRATIVE_BEATS.bigScore
.replace("{drug}", drugMatch ? drugMatch[1] : "that")
.replace("{loc}", loc));
}

// NPC events
if (montage.some(m => m.text.includes("Snitched"))) beats.push(NARRATIVE_BEATS.snitched);
else if (montage.some(m => m.text.includes("Allied"))) beats.push(NARRATIVE_BEATS.allied);
if (s.npcState.maria.met && s.npcState.maria.trust > 2) beats.push(NARRATIVE_BEATS.mariaMet);

// Turf
const turfWins = montage.filter(m => m.text.startsWith("Won turf"));
const turfLosses = montage.filter(m => m.text.startsWith("Lost turf"));
if (turfWins.length > turfLosses.length && turfWins.length > 0) {
const wLoc = turfWins[turfWins.length - 1].text.match(/in (.+)$/)?.[1] || "the streets";
beats.push(NARRATIVE_BEATS.turfWon.replace("{loc}", wLoc));
} else if (turfLosses.length > 0 && ending !== "kingpin") {
const lLoc = turfLosses[turfLosses.length - 1].text.match(/in (.+)$/)?.[1] || "the streets";
beats.push(NARRATIVE_BEATS.turfLost.replace("{loc}", lLoc));
}

// Lifestyle
if (montage.some(m => m.text.includes("Scarface Mansion"))) beats.push(NARRATIVE_BEATS.mansion);
else if (montage.some(m => m.text.includes("Countach"))) beats.push(NARRATIVE_BEATS.countach);

// Eras
if (montage.some(m => m.text.includes("Crack Epidemic"))) beats.push(NARRATIVE_BEATS.eraCrack);
else if (montage.some(m => m.text.includes("War on Drugs"))) beats.push(NARRATIVE_BEATS.eraWar);

// Streak
if (s.bestStreak >= 5) beats.push(NARRATIVE_BEATS.streak.replace("{n}", s.bestStreak));

// Busts survived
if (montage.filter(m => m.text.includes("Busted")).length >= 2 && s.hp > 0) beats.push(NARRATIVE_BEATS.bustSurv.replace("{loc}", loc));

// Debt
if (s.debt === 0 && ending !== "broke") beats.push(NARRATIVE_BEATS.debt);

// Heat
if (s.fedHeat > 70) beats.push(NARRATIVE_BEATS.heatHigh);

// NPC-specific closers based on ending
const npcClosers = [];
if (ending === 'escape') {
if (s.npcState.maria.trust >= 4) npcClosers.push("Maria was on the plane. She didn’t look back either.");
else if (s.npcState.maria.met) npcClosers.push("Maria didn’t come. She said she had unfinished business. She always does.");
if (s.npcState.colombiano.trust >= 3) npcClosers.push("El Colombiano sent a bottle of champagne to the airport. No card. He doesn’t need one.");
} else if (ending === 'bust') {
if (s.npcState.maria.trust >= 2) npcClosers.push("Maria’s lawyer showed up within the hour. \"Don’t say a word,\" she said. \"I’ll handle this.\"");
else if (s.npcState.maria.trust < 0) npcClosers.push("Maria’s name came up in the investigation. She denied everything. Nobody believed her.");
if (s.storyFlags?.hoffman_cooperated) npcClosers.push("Hoffman tried to intervene. \"He’s one of mine,\" he said. It wasn’t enough.");
} else if (ending === 'dead') {
if (s.npcState.maria.met && s.npcState.maria.trust > 0) npcClosers.push("Maria paid for the funeral. It was a nice one. She said Diego deserved that much.");
if (s.npcState.colombiano.trust < -3) npcClosers.push("El Colombiano sent flowers. Everyone knew what that meant.");
} else if (ending === 'kingpin') {
if (s.npcState.maria.trust >= 4) npcClosers.push("Maria runs the legitimate side. Art galleries, real estate, a foundation. The IRS has questions. She has lawyers.");
if (s.npcState.colombiano.trust >= 3) npcClosers.push("El Colombiano is a silent partner. The tiger has a bigger enclosure now.");
npcClosers.push("Ramirez retired six months later. His pension covers the apartment in Hialeah. He drives past the old precinct sometimes and doesn’t stop.");
} else if (ending === 'informant') {
if (s.storyFlags?.burned_colombiano) npcClosers.push("El Colombiano is serving 40 years in Coleman Federal. He knows who put him there. He has a very long memory.");
else if (s.storyFlags?.burned_maria) npcClosers.push("Maria Santos was acquitted on all charges. Her lawyers were better than Ramirez’s evidence. She left Miami anyway. Some things you can’t lawyer away.");
npcClosers.push("Hoffman got a promotion. He doesn’t call anymore. Informants are disposable. That was always the deal.");
} else if (ending === 'burned') {
if (s.npcState.colombiano?.alive) npcClosers.push("El Colombiano didn’t send a crew. He sent a message. The message was the absence of everything — no contacts, no supply, no protection. In Miami, silence is a death sentence.");
if (s.npcState.maria.met) npcClosers.push("Maria heard what happened. She lit a candle at the church on Calle Ocho. She didn’t say who it was for.");
npcClosers.push("Hoffman’s file on Diego Reyes was reclassified. The official status: \"Asset compromised. No further action.\" Government speak for: we lost one.");
}

// Assemble
const selected = beats.slice(0, 2);
const parts = [opener, ...selected, ...npcClosers.slice(0, 1)];

return { text: parts.join(" "), ending };
}

const ENCOUNTERS = [
{ type:"find", text:"You’re cutting through the alley behind the bodega and there’s a baggie. Just sitting there. The universe provides.", amount:[3,12], chance:.15 },
{ type:"find", text:"A dealer dropped his whole stash running from a brown sedan. Ramirez’s sedan? Who cares. Finders keepers.", amount:[5,20], chance:.10 },
{ type:"mugger", text:"A man the approximate size of a commercial refrigerator blocks the sidewalk. He doesn’t introduce himself. He doesn’t need to.", hpLoss:[5,15], cashLoss:[100,500], chance:.12 },
{ type:"tip", text:"Your barber puts down the scissors. \"The new girl at the laundromat? She’s a fed. She’s been writing down plates. Yours was on the list.\" He picks the scissors back up. \"Same as usual?\"", chance:.12 },
{ type:"tip", text:"A street kid whispers: \"{d} is dirt cheap in {l} right now. Don’t ask how I know.\"", chance:.18 },
{ type:"bribe_offer", text:"Officer Delgado has a menu. $500 blind eye. $1,500 lost report. He does NOT accept checks. \"What am I, a dentist?\"", cost:[500,2000], heatReduce:15, chance:.10 },
{ type:"gamble", text:"A dice game behind the bodega. Three guys, a milk crate, and enough cash to buy a used Honda. \"You in or you out?\"", chance:.08 },
{ type:"healer", text:"A back-alley doc who smells like rubbing alcohol and poor decisions offers to patch you up. His diploma is from a country that no longer exists.", cost:300, hpGain:30, chance:.08 },
{ type:"snitch_warning", text:"A man on a milk crate on NW 7th is screaming about the end times. He makes eye contact. \"THE WAGES OF SIN ARE DEATH!\" he bellows. \"BUT THE HOURLY RATE IS EXCELLENT!\"", heatGain:5, chance:.07 },
{ type:"tip", text:"A sunburned tourist in a Hawaiian shirt corners you. \"Hey buddy, you know where I can get some…\" He does the nose-touch gesture with all the subtlety of a man wearing a Hawaiian shirt in a drug neighborhood.", chance:.10 },
{ type:"find", text:"Someone hands you a black card with a gold address. No name. Just: TONIGHT. MIDNIGHT. BRING PRODUCT AND A SWIMSUIT. The address is a penthouse on Fisher Island.", amount:[2,8], chance:.06 },
{ type:"snitch_warning", text:"You’re cutting through the alley and there’s a body. Not fresh, but not old. The suit is nice — nicer than yours. The pockets are empty except for a pager. You walk. Faster than usual.", heatGain:8, chance:.05 },
{ type:"tip", text:"A realtor with physics-defying hair hands you a card. “I have a property in Coconut Grove. The previous owner is… no longer available. There may be items in the basement you’d find professionally interesting.”", chance:.06 },
// witness_defuse is filtered out of normal pool — only appears when witness fuse is active (see processTravel)
{ type:"witness_defuse", text:"A kid from the block pulls you aside. “That lady from your last big deal? She’s been talking to a detective. I know where she lives. Two grand and she forgets everything.”", cost:2000, chance:1 },
// dea_defuse only appears when DEA surveillance fuse is active (see processTravel)
{ type:"dea_defuse", text:"A courthouse clerk you know pulls you aside. “There’s a wiretap warrant with your name on it. My lawyer buddy can get it killed — five grand, cash.”", cost:5000, chance:1 },
];

// ── HELPERS ──
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const RF=(a,b)=>a+Math.random()*(b-a);
const FM=n=>(n<0?"-$":"$")+Math.abs(Math.round(n)).toLocaleString();
const CL=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const randNorm=()=>{const u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};

// ── PRICE ENGINE ──
const initBasePrices=()=>DRUGS.map(d=>d.mean+Math.floor(randNorm()*d.mean*.15));
const initMomentum=()=>DRUGS.map(()=>(Math.random()-.5)*.4);

const evolveBasePrices=(prev,mom,evtDrug,evtType,evtMulti)=>prev.map((p,i)=>{
const d=DRUGS[i],rev=d.theta*(d.mean-p),shock=d.sigma*p*randNorm()*.3,drift=mom[i]*p*.08;
let np=p+rev+shock+drift;
if(evtDrug===d.name&&evtMulti){const m=evtMulti[0]+Math.random()*(evtMulti[1]-evtMulti[0]);np*=m;}
return Math.max(d.min*.5,Math.min(d.max*2.5,Math.round(np)));
});

const evolveMomentum=prev=>prev.map(m=>Math.random()<.15?-m+randNorm()*.2:CL(m*.85+randNorm()*.15,-1,1));

const getStreetPrices=(base,locIdx,eraDemand,localDemand)=>{
const loc=LOCS[locIdx];
return base.map((bp,i)=>{
const d=DRUGS[i],locMul=loc.priceMod[d.tier],noise=1+randNorm()*.05;
const demMul=eraDemand?eraDemand[i]:1;
const locDem=localDemand?localDemand[i]:1;
return Math.max(d.min,Math.round(bp*locMul*demMul*locDem*noise));
});
};

const calcTxRisk=(amt,baseRisk,eraCopsMod)=>{
if(amt<=3)return 0;
const threshold=40,exponent=2.0;
const sizeMultiplier=Math.pow(Math.max(0,amt-8)/threshold,exponent);
return Math.min(0.85,baseRisk*0.5*(1+sizeMultiplier)*eraCopsMod);
};

const calcLegalFees=(txValue,eraPenaltyMod)=>Math.floor(txValue*0.2*eraPenaltyMod)+R(200,800);

const getEra=(s)=>ERAS[s.currentEra||0];

const getSkyGradient=(move,heat)=>{
const isNight=move%2===1;
const heatR=CL(heat/100,0,1);
if(isNight){
const r=Math.round(10+heatR*60),g=Math.round(15+heatR*5),b=Math.round(40-heatR*20);
return `linear-gradient(180deg, rgb(${r},${g},${b}) 0%, ${C.midnight} 60%, ${C.dark} 100%)`;
}
if(heatR<.3) return `linear-gradient(180deg, #1a1040 0%, #4a1942 20%, #c94b4b 45%, #f09819 70%, ${C.dark} 100%)`;
if(heatR<.6) return `linear-gradient(180deg, #1a0a20 0%, #6b2040 25%, #d44040 50%, #a04010 75%, ${C.dark} 100%)`;
return `linear-gradient(180deg, #200808 0%, #801515 25%, #cc2020 50%, #601010 75%, ${C.dark} 100%)`;
};

// ── THREE KEY NPCs ──
const NPCS = {
colombiano: { name:"El Colombiano", icon:"🇨🇴", desc:"Criminal rival. Mirrors your moves." },
ramirez: { name:"Det. Ramirez", icon:"🕵️", desc:"Building a case against you." },
maria: { name:"Maria Santos", icon:"💃", desc:"Connected socialite. Insider info." },
};

// ═══════════════════════════════════════════════════════════════
// NARRATIVE ENGINE — Quality-Based Storylet System
// Flat map of storylets with declarative conditions.
// Priority queue selects best match. ~30 initial nodes.
// ═══════════════════════════════════════════════════════════════

const STORY = {
// ════════════════════════════════════════════
// MARIA SANTOS — “A smile that’s ninety percent strategy”
// ════════════════════════════════════════════
maria_intro: { speaker:'maria', portrait:'amused', priority:15,
conditions: { totalDealsGte:2, 'npc.maria.met':{eq:false}, notFlag:'brick_deal_done' },
lines: [
{ text:"The bouncer at The Flamingo waves you through like he was told to. Inside: bass so deep you feel it in your teeth. Neon. Smoke. Bodies.", portrait:'neutral' },
{ text:"A woman in white finds you at the bar like she’s been waiting. Gold earrings. A smile that’s ninety percent strategy.", portrait:'amused' },
{ text:"\"You’re the new one. César’s friend from Panama. Everyone’s talking about the idiot who rode a Greyhound into Miami with a kilo in his bag.\"", portrait:'amused' },
{ text:"\"Don’t worry — I like idiots. They’re unpredictable. I’m Maria. Buy me a drink and I’ll tell you something useful.\"", portrait:'flirty' },
],
choices: [
{ text:"Buy her a drink", reaction:"\"Smart. I knew you weren’t completely stupid.\" She leans in. \"There’s a shipment coming through the Keys tomorrow. Prices are going to drop. Buy cheap there, sell in the Gables. The rich housewives pay double and never ask questions.\"", effects:{ 'npc.maria.trust':2, 'npc.maria.met':true, flags:['maria_friendly_intro'] } },
{ text:"I don’t take drinks with strangers", reaction:"\"Your loss, honey.\" She doesn’t look offended. She looks amused, which is worse. \"I don’t offer twice. But you look like the kind of mistake I enjoy watching unfold. I’ll be around.\"", effects:{ 'npc.maria.trust':-1, 'npc.maria.met':true, flags:['maria_cold_intro'] } },
],
},
maria_second_chance: { speaker:'maria', portrait:'knowing', priority:10,
conditions: { totalProfitGte:10000, flag:'maria_cold_intro', 'npc.maria.trust':{lte:0}, notFlag:'maria_recovered' },
lines: [
{ text:"You’re counting bills at a back table when someone slides into the booth opposite. Maria. No drink this time. No smile.", portrait:'neutral' },
{ text:"\"I’m going to do something I never do, which is give you a second chance. Not because I like you — because you’re useful.\"", portrait:'knowing' },
{ text:"\"You’re buying retail like a tourist. Paying corner prices for product you could get wholesale through me. I have contacts at the port. I know which neighborhoods are buying and which are dry.\"", portrait:'knowing' },
{ text:"\"So. Do you want to keep playing small, or do you want to make real money?\"", portrait:'flirty' },
],
choices: [
{ text:"I’m listening", reaction:"\"Good. First thing — stop holding product too long. Prices change every time you move. Check what you paid versus what it’s worth here. That spread is your whole life now.\"", effects:{ 'npc.maria.trust':2, flags:['maria_recovered','maria_friendly_intro'] } },
{ text:"I told you. I work alone.", reaction:"\"Then die alone. Same difference in this town.\" She’s gone before you can respond. The bartender looks at you like you just turned down a winning lottery ticket.", effects:{ 'npc.maria.trust':-1, flags:['maria_recovered'] } },
],
},
maria_tip: { speaker:'maria', portrait:'amused', priority:9,
conditions: { totalProfitGte:5000, 'npc.maria.trust':{gte:1}, flag:'maria_friendly_intro', notFlag:'maria_gave_tip', dealsSinceGte:2 },
lines: [
{ text:"Your pager buzzes at 2 AM. Maria’s code. You call back from a payphone that smells like bad decisions and worse cologne.", portrait:'neutral' },
{ text:"\"I got a guy in Overtown who’s dry. Crack and cocaine — he’ll pay anything. And I mean anything. The man is desperate and desperate men are profitable.\"", portrait:'amused' },
{ text:"\"Buy cheap anywhere else, sell there. And do it before someone else figures it out — I gave this number to two people. You’re the one I like slightly more.\"", portrait:'flirty' },
],
choices: [{ text:"Thanks, Maria", reaction:"\"Don’t thank me. César would’ve done the same thing. Actually, César would’ve charged me. You’re already an improvement.\" She hangs up. The payphone smells slightly better now.", effects:{ 'npc.maria.trust':1, flags:['maria_gave_tip'] } }],
},
maria_party: { speaker:'maria', portrait:'flirty', priority:10,
conditions: { credGte:10, 'npc.maria.trust':{gte:2}, notFlag:'maria_party_done', dealsSinceGte:3 },
lines: [
{ text:"Maria takes you to a private party in a Coral Gables mansion. The pool is shaped like a dollar sign. This is not a joke. The host is a \"real estate developer\" whose real estate consists primarily of cocaine warehouses.", portrait:'amused' },
{ text:"\"See the woman in the red dress? She’s a federal prosecutor. See the man she’s talking to? He’s her biggest defendant. They’ve been sleeping together since April.\"", portrait:'knowing' },
{ text:"\"This city runs on three things: cocaine, hypocrisy, and pool parties. Try the ceviche — it’s actually good.\"", portrait:'flirty' },
],
choices: [
{ text:"Mingle with the guests", reaction:"You spend the night learning that everyone in Coral Gables is either a criminal or married to one. Several are both. Maria introduces you to people whose handshakes feel like contracts. Your cred just went up.", effects:{ 'npc.maria.trust':1, cred:5, flags:['maria_party_done','high_society'] } },
{ text:"This isn’t my scene", reaction:"\"Suit yourself.\" Maria shrugs and disappears into a crowd of people whose net worth exceeds the GDP of several Caribbean nations. You eat the ceviche alone. She was right — it’s actually good.", effects:{ 'npc.maria.trust':-1, flags:['maria_party_done'] } },
],
},
maria_launder: { speaker:'maria', portrait:'knowing', priority:9,
conditions: { totalProfitGte:30000, 'npc.maria.trust':{gte:2}, cashGte:8000, notFlag:'maria_launder_offered' },
lines: [
{ text:"Maria is waiting at her gallery. The paintings are aggressively terrible. A canvas splattered with what looks like ketchup has a $28,000 price tag.", portrait:'amused' },
{ text:"\"Don’t look at me like that. Art is subjective. Money laundering is objective. I can clean $5K for you right now.\"", portrait:'knowing' },
{ text:"She gestures at a painting of a sad horse. \"Run it through as a sale of… this masterpiece. The IRS will never question it. Nobody wants to admit they don’t understand art.\"", portrait:'amused' },
],
choices: [
{ text:"Launder $5,000", reaction:"\"Pleasure doing business.\" She writes a receipt. The painting of the sad horse now has a red \"SOLD\" sticker. \"I sold that horse four times this month. He’s my best performer. Better than the Basquiat.\"", effects:{ cashDelta:-5000, cleanCashDelta:4500, 'npc.maria.trust':1, flags:['maria_launder_offered','used_launder'] } },
{ text:"Not yet", reaction:"\"The offer stands. The horse isn’t going anywhere — nobody actually wants to own it. That’s the whole point.\"", effects:{ flags:['maria_launder_offered'] } },
],
},
maria_personal: { speaker:'maria', portrait:'vulnerable', priority:10,
conditions: { credGte:20, 'npc.maria.trust':{gte:4}, 'npc.ramirez.met':{eq:true}, notFlag:'maria_personal_done' },
lines: [
{ text:"3 AM. Maria’s gallery. She’s drinking wine from a coffee mug and her shoes are off. This is the most human you’ve seen her.", portrait:'vulnerable' },
{ text:"\"You want to know why I do this? My mother cleaned hotel rooms for twenty years. TWENTY. Her back is destroyed. She can’t stand for more than ten minutes.\"", portrait:'angry' },
{ text:"\"And the woman in the penthouse suite — the one whose sheets she changed every day — made her money the same way I make mine. The only difference is the number of zeros and the quality of the attorney.\"", portrait:'vulnerable' },
{ text:"She looks at you. The strategy is gone for a moment. What’s underneath is more dangerous.", portrait:'vulnerable' },
{ text:"\"Stay alive, okay? I’m running out of people I actually like in this city.\"", portrait:'flirty' },
],
choices: [
{ text:"I’m not going anywhere", reaction:"She doesn’t say anything for a long time. Then: \"Don’t make me regret saying that.\" She puts her shoes back on. The strategy returns. But something behind it has shifted, and you both know it.", effects:{ 'npc.maria.trust':2, flags:['maria_personal_done','maria_close'] } },
{ text:"We’re business. That’s all.", reaction:"\"Right. Business.\" She finishes the wine. The coffee mug clinks on the desk. \"Of course.\" You’ve never heard two words carry that much weight. The gallery feels colder when you leave.", effects:{ 'npc.maria.trust':-2, flags:['maria_personal_done','maria_rejected'] } },
],
},
maria_react_crack: { speaker:'maria', portrait:'angry', priority:7,
conditions: { 'npc.maria.met':{eq:true}, 'npc.maria.trust':{gte:0}, productIs:'crack', notFlag:'maria_hates_crack' },
lines: [
{ text:"Maria finds you at the bar. She’s not smiling. \"Crack. You’re selling crack now.\"", portrait:'angry' },
{ text:"\"I watched what that did to Overtown. Kids on corners. Mothers who can’t remember their own names. You want to get rich? Fine. But not like that. Not around me.\"", portrait:'angry' },
],
choices: [
{ text:"It’s just business, Maria", reaction:"”My mother said the same thing about the hotel. ‘It’s just work, Maria.’ It’s never just anything.” She leaves her drink untouched. That’s how you know it’s serious.", effects:{ 'npc.maria.trust':-2, flags:['maria_hates_crack'] } },
{ text:"You’re right. I’ll stop.", reaction:"You—“ She stops. Studies your face like she’s looking for the lie. Doesn’t find one. “Okay. Okay.” She picks up her drink. Takes a sip. “You know, César would never have said that. He would’ve laughed at me. You’re not him. I keep forgetting that’s a good thing.", effects:{ 'npc.maria.trust':1, flags:['maria_hates_crack','quit_crack_for_maria'] } },
],
},

// ════════════════════════════════════════════
// DETECTIVE RAMIREZ — “The humor of a man who’s seen too much”
// ════════════════════════════════════════════
ramirez_intro: { speaker:'ramirez', portrait:'neutral', priority:15,
conditions: { fedHeatGte:15, 'npc.ramirez.met':{eq:false} },
lines: [
{ text:"Your barber stops mid-cut. Nods toward the window. Brown sedan. A man in a suit that was last fashionable during the Carter administration, drinking coffee from a thermos and reading a very thick file.", portrait:'neutral' },
{ text:"\"That’s Ramirez. Vice Intelligence. He’s been out there since Tuesday.\"", portrait:'neutral' },
{ text:"You ask if he’s dangerous.", portrait:'neutral' },
{ text:"\"He’s honest. In this town, that’s the most dangerous thing you can be.\"", portrait:'neutral' },
],
choices: [{ text:"Noted", reaction:"Your barber finishes the cut in silence. When you leave, Ramirez doesn’t look up from his file. He doesn’t need to. He already has your picture in it.", effects:{ 'npc.ramirez.met':true, 'npc.ramirez.evidence':2, flags:['ramirez_watching'] } }],
},
ramirez_coffee: { speaker:'ramirez', portrait:'wry', priority:10,
conditions: { 'npc.ramirez.met':{eq:true}, evidenceGte:3, bustsGte:1, notFlag:'ramirez_coffee', dealsSinceGte:3 },
lines: [
{ text:"He’s waiting outside the café on Calle Ocho. Doesn’t try to hide. Steps right up like you’re old friends.", portrait:'neutral' },
{ text:"\"Nice morning, isn’t it? I love Miami in the spring. The weather’s beautiful. The crime rate, less so. You want a coffee? I’m buying.\"", portrait:'wry' },
{ text:"\"Don’t worry — accepting coffee from a police officer is not legally admissible. I checked.\"", portrait:'wry' },
{ text:"He smiles. It’s the smile of a man who’s patient in a way that should terrify you.", portrait:'neutral' },
{ text:"\"I’m not going to arrest you today. I just wanted you to know that I know. And now you know that I know. So we both know. Isn’t that nice? Enjoy your coffee.\"", portrait:'wry' },
],
choices: [
{ text:"Drink the coffee", reaction:"Good coffee. He watches you drink it with the expression of a man who has all the time in the world. \"I make $38,000 a year,\" he says. \"The guy I was surveilling yesterday tipped a valet more than my monthly mortgage. But sure, the system works.\"", effects:{ 'npc.ramirez.evidence':1, flags:['ramirez_coffee'] } },
{ text:"Walk away", reaction:"\"They always walk away.\" You hear him take a sip behind you. \"That’s fine. I’m patient. My captain says I’m ‘turning the tide.’ I’ve been turning the tide for fifteen years. The tide doesn’t seem to notice.\"", effects:{ flags:['ramirez_coffee','ramirez_disrespected'] } },
],
},
ramirez_photos: { speaker:'ramirez', portrait:'neutral', priority:10,
conditions: { evidenceGte:6, flag:'ramirez_coffee', notFlag:'ramirez_photos', dealsSinceGte:3 },
lines: [
{ text:"An envelope on your windshield. No stamp. Inside: three Polaroids.", portrait:'neutral' },
{ text:"You, making a deal in Overtown. You, counting cash in Little Havana. You, meeting El Colombiano’s lieutenant.", portrait:'neutral' },
{ text:"On the back of the third photo, in neat handwriting: \"My daughter wants to be a photographer. I told her I’m already pretty good at it. — H.R.\"", portrait:'wry' },
{ text:"The man has a sense of humor. That makes it worse.", portrait:'neutral' },
],
choices: [
{ text:"Burn the photos", reaction:"You burn them over the stove. The smoke smells like evidence and bad decisions. But you know Ramirez has copies. A man that patient always has copies.", effects:{ flags:['ramirez_photos'] } },
{ text:"He’s bluffing", reaction:"He wasn’t bluffing. Somewhere in the Vice Intelligence office, Ramirez adds a note to your file: \"Subject displays poor judgment under pressure.\" He underlines it twice.", effects:{ 'npc.ramirez.evidence':2, flags:['ramirez_photos','ignored_warning'] } },
],
},
ramirez_offer: { speaker:'ramirez', portrait:'tired', priority:12,
conditions: { evidenceGte:10, notFlag:'ramirez_deal_offered', dealsSinceGte:3 },
lines: [
{ text:"He calls from a payphone. You can hear traffic. He sounds tired.", portrait:'tired' },
{ text:"\"Alright, let’s skip the part where I pretend this is a social call. I have enough on you for fifteen to twenty. Federal. The Colombians, the laundering, the whole circus.\"", portrait:'neutral' },
{ text:"\"But here’s the thing — I don’t want you. You’re not the prize. You’re the door.\"", portrait:'tired' },
{ text:"\"Give me El Colombiano. Real intel. Shipment dates, routes, contacts. In exchange, your file goes in a drawer that doesn’t get opened. You walk away clean. Maybe not morally clean, but legally clean, and in Miami that’s the best anyone can hope for.\"", portrait:'wry' },
],
choices: [
{ text:"Become an informant", reaction:"\"Smart. Or desperate. Either way, we have a deal.\" A pause. Coffee being sipped. \"I’ll be in touch. And for what it’s worth? You made the right call. The other option involved handcuffs and a prison in Coleman, Florida. It’s two hours from Miami. You can almost smell the ocean on humid days.\"", effects:{ 'npc.ramirez.trust':5, 'npc.colombiano.trust':-3, flags:['ramirez_deal_offered','became_informant'] } },
{ text:"Go to hell, Ramirez", reaction:"\"I figured you’d say that. They always say that. And then about six months from now, when the walls are really closing in, you’ll wish you’d taken the deal. My number hasn’t changed. It won’t.\" He hangs up. You hear him start his car. The engine takes three tries. Even his car is exhausted.", effects:{ 'npc.ramirez.evidence':3, flags:['ramirez_deal_offered','refused_ramirez'] } },
],
},
ramirez_bribe: { speaker:'ramirez', portrait:'tired', priority:9,
conditions: { evidenceGte:8, fedHeatGte:30, notFlag:'ramirez_bribe_done', cashGte:5000, dealsSinceGte:3 },
lines: [
{ text:"A parking garage in Brickell. Ramirez looks like he hasn’t slept in a week.", portrait:'tired' },
{ text:"\"Twenty years. Twenty years of doing this the right way. You know what the right way has gotten me? A pension I can’t retire on, a wife who left, and an apartment in Hialeah with a view of a parking lot.\"", portrait:'tired' },
{ text:"He stares at the envelope you’re holding.", portrait:'vulnerable' },
{ text:"\"$5,000 and I lose some paperwork. Not all of it. Some. You buy yourself six months, maybe eight. I buy my daughter another semester at UF.\"", portrait:'vulnerable' },
{ text:"His hand is shaking. This is not a man who does this. This is a man who’s breaking in real-time.", portrait:'tired' },
],
choices: [
{ text:"Give him the envelope", reaction:"He takes the envelope without counting it. Puts it inside his jacket like it’s radioactive. \"We never met. This never happened. And for the record? I hate you for this. Not as much as I hate myself, but you’re a close second.\"", effects:{ cashDelta:-5000, 'npc.ramirez.evidence':-5, flags:['ramirez_bribe_done','bribed_ramirez'] } },
{ text:"Walk away", reaction:"You leave the envelope in your pocket. Ramirez watches you go. He looks relieved and devastated in equal measure. Three weeks later, you hear he bought his daughter a used Toyota Corolla. She’s the only person in this story who gets a happy ending.", effects:{ flags:['ramirez_bribe_done','spared_ramirez'] } },
],
},

// ════════════════════════════════════════════
// EL COLOMBIANO — “Quietly funny in a way that makes you nervous”
// ════════════════════════════════════════════
colombiano_intro: { speaker:'colombiano', portrait:'neutral', priority:15,
conditions: { totalProfitGte:25000, 'npc.colombiano.met':{eq:false} },
lines: [
{ text:"The café smells like Cuban coffee and destiny. An old man is playing chess in the corner. Two young men in guayaberas stand near the door, not eating, not drinking, just watching.", portrait:'neutral' },
{ text:"The man at the back table waves you over like he’s been expecting you since you were born.", portrait:'neutral' },
{ text:"\"Sit. Eat something. The croquetas here are excellent — I should know, I own the building.\"", portrait:'amused' },
{ text:"He studies you the way a jeweler studies a stone. Deciding if you’re worth cutting.", portrait:'cold' },
{ text:"\"I know everything about you. What you buy, what you sell, where you sell it, and how much you make doing it. Don’t be offended — I know this about everyone. It’s how I stay alive.\"", portrait:'cold' },
{ text:"\"Now. Let’s discuss whether you’re going to work with me, work for me, or become a cautionary anecdote I tell at dinner parties. I’m hoping for option one. Option three means I have to find someone to clean the upholstery in my car, and good detailers are surprisingly hard to find in this city.\"", portrait:'amused' },
],
choices: [
{ text:"Let’s talk business", reaction:"\"Good. I prefer option one.\" He pushes a plate of croquetas toward you. \"In Colombia, we have a saying: ‘The cemeteries are full of indispensable men.’ I find it motivating. You should too. Eat. We have much to discuss.\"", effects:{ 'npc.colombiano.trust':2, 'npc.colombiano.met':true, flags:['colombiano_friendly'] } },
{ text:"I work alone", reaction:"\"Everyone works alone. Until they don’t.\" He takes a bite of a croqueta. He doesn’t look angry. That’s worse than angry. \"I offered you partnership. You chose pride. Pride is expensive in this city. I should know — I sell the thing that makes people feel it.\"", effects:{ 'npc.colombiano.trust':-2, 'npc.colombiano.met':true, flags:['colombiano_rejected'] } },
],
},
colombiano_second: { speaker:'colombiano', portrait:'cold', priority:10,
conditions: { totalProfitGte:40000, flag:'colombiano_rejected', 'npc.colombiano.trust':{lte:0}, notFlag:'colombiano_recovered' },
lines: [
{ text:"A man in a guayabera is waiting outside your safe house. He doesn’t speak. He hands you a phone.", portrait:'neutral' },
{ text:"\"I hear you’re independent. I respect that. But independent men in my territory pay a tax. Think of it as… rent.\"", portrait:'cold' },
{ text:"\"Or — and I suggest you consider this carefully — we can renegotiate. I supply you product at cost. You sell it. We split the profit. Everybody wins. Especially me, but that’s how business works.\"", portrait:'amused' },
],
choices: [
{ text:"Accept the deal", reaction:"\"Wise. I’ll send product tomorrow. Don’t disappoint me. The last person who disappointed me is currently explaining himself to God. Or the devil. I’m not sure which one handles middle management.\"", effects:{ 'npc.colombiano.trust':2, flags:['colombiano_recovered','colombiano_friendly'] } },
{ text:"I’ll pay the tax", reaction:"\"The tax is 30% of everything you move through my territory. Starting now.\" A pause. \"You Americans. You think ‘drug lord’ is a job title. It’s not. It’s a temporary medical condition.\" He hangs up.", effects:{ 'npc.colombiano.trust':0, flags:['colombiano_recovered','colombiano_taxed'] } },
],
},
colombiano_gift: { speaker:'colombiano', portrait:'amused', priority:10,
conditions: { biggestDealGte:10000, 'npc.colombiano.trust':{gte:1}, flag:'colombiano_friendly', notFlag:'colombiano_gift', dealsSinceGte:3 },
lines: [
{ text:"A man you’ve never seen delivers a briefcase to your safe house. Inside: 10 kilos of uncut cocaine packed in coffee bags.", portrait:'neutral' },
{ text:"A handwritten note on monogrammed stationery:", portrait:'neutral' },
{ text:"\"A sample. Sell it as you see fit. Return the briefcase — it’s Italian leather and I’m sentimental. If you’re successful, we’ll talk about volume. If you’re not, I’ll assume you were eaten by an alligator. It happens more often than you’d think.\"", portrait:'amused' },
],
choices: [
{ text:"Sell the product", reaction:"You move the product in two days. The briefcase is returned with a note: \"Good. We talk Tuesday.\" Tuesday arrives. So does more product. This is how empires begin — not with a bang, but with a briefcase.", effects:{ invDelta:{drug:'cocaine',qty:5}, 'npc.colombiano.trust':1, flags:['colombiano_gift','took_product'] } },
{ text:"Return it untouched", reaction:"The briefcase comes back full. No note. No phone call. Nothing. In El Colombiano’s world, silence is louder than a gunshot. You’ve made your position clear. So has he.", effects:{ 'npc.colombiano.trust':-1, flags:['colombiano_gift','returned_product'] } },
],
},
colombiano_zoo: { speaker:'colombiano', portrait:'amused', priority:10,
conditions: { credGte:25, 'npc.colombiano.trust':{gte:3}, notFlag:'colombiano_zoo', dealsSinceGte:3 },
lines: [
{ text:"El Colombiano invites you to his compound. It is insane. A waterfall in the foyer. A pool shaped like Colombia. An actual, literal Bengal tiger named \"Capitalism\" roaming the grounds.", portrait:'neutral' },
{ text:"\"People ask why I keep a tiger. I tell them it’s a metaphor. They nod like they understand. They don’t. There is no metaphor. I just like tigers. A man should have hobbies.\"", portrait:'amused' },
{ text:"Over dinner — lobster, obviously — he outlines his vision:", portrait:'neutral' },
{ text:"\"Crack is the future. Powder cocaine is a luxury product. Crack is a consumer product. I didn’t go to business school, but I understand the difference between selling Champagne and selling beer. Beer moves faster.\"", portrait:'cold' },
],
choices: [
{ text:"Join the crack business", reaction:"\"Welcome to the future.\" He raises his glass. Capitalism the tiger yawns in the background. \"Beer moves faster, my friend. And in this city, speed is everything.\" The lobster is excellent. Everything about this evening is excellent. That should worry you more than it does.", effects:{ 'npc.colombiano.trust':3, flags:['colombiano_zoo','crack_partner'] } },
{ text:"Stay independent", reaction:"\"Independence. How American.\" He cuts his lobster with surgical precision. \"I respect it. For now. But the market is changing, and men who don’t change with it become… what’s the English word? Obsolete. I learned that from a business magazine. In prison.\"", effects:{ 'npc.colombiano.trust':-2, flags:['colombiano_zoo','stayed_independent'] } },
],
},

// ════════════════════════════════════════════
// GAMEPLAY-TRIGGERED — React to what the player does
// ════════════════════════════════════════════
first_big_sale: { speaker:'narrator', priority:4,
conditions: { biggestDealGte:5000, notFlag:'ev_big_sale' },
lines: [{ text:"Word travels fast on these streets. Corner boys nod when you pass. Barbers know your name. You just became someone worth talking about — and someone worth watching." }],
choices: [{ text:"x", effects:{ flags:['ev_big_sale'] } }],
},
ten_k_milestone: { speaker:'maria', portrait:'amused', priority:8,
conditions: { cashGte:10000, 'npc.maria.met':{eq:true}, 'npc.maria.trust':{gte:0}, notFlag:'ev_ten_k' },
lines: [
{ text:"Maria spots you at a back table, counting bills. She slides into the booth.", portrait:'amused' },
{ text:"\"Ten grand. Not bad for someone who showed up from Panama with one brick and a matchbook.\" She steals one of your french fries.", portrait:'flirty' },
{ text:"\"You know what you should do? Pay off that debt. Tiburón’s interest is eating you alive. The shark doesn’t stop circling just because you’re swimming faster.\"", portrait:'knowing' },
],
choices: [{ text:"Solid advice", reaction:"\"I’m full of it.\" She pauses. \"The advice, I mean. Well — both.\" She steals another fry and disappears back into the neon.", effects:{ 'npc.maria.trust':1, flags:['ev_ten_k'] } }],
},
debt_paid: { speaker:'narrator', priority:5,
conditions: { debtLte:0, totalDealsGte:3, notFlag:'ev_debt_free' },
lines: [{ text:"The loan shark’s man nods when you hand over the last payment. \"Tiburón says we’re square. Don’t make him regret it.\" For the first time since you got off that bus, nobody owns a piece of you." }],
choices: [{ text:"x", effects:{ flags:['ev_debt_free'] } }],
},
first_bust_react: { speaker:'ramirez', portrait:'wry', priority:8,
conditions: { bustsGte:1, 'npc.ramirez.met':{eq:true}, notFlag:'ev_first_bust' },
lines: [
{ text:"A note appears under your door. Ramirez’s handwriting.", portrait:'neutral' },
{ text:"\"Heard you had a run-in with the boys in blue. That’s going in your file — and mine. Every time you get caught, my case gets easier. You’re doing my job for me. — H.R.\"", portrait:'wry' },
{ text:"\"P.S. — Maybe try smaller deals in quieter neighborhoods. Or don’t. I get overtime either way.\"", portrait:'wry' },
],
choices: [{ text:"Crumple the note", reaction:"But you read it twice first. He’s not wrong.", effects:{ 'npc.ramirez.evidence':1, flags:['ev_first_bust'] } }],
},
colombiano_notices: { speaker:'colombiano', portrait:'amused', priority:7,
conditions: { 'npc.colombiano.met':{eq:true}, biggestDealGte:30000, notFlag:'ev_col_notice' },
lines: [
{ text:"Your pager buzzes. Unfamiliar number. The message is three words: \"Impressive. — E.C.\"", portrait:'amused' },
{ text:"El Colombiano is paying attention. In this business, that’s either the best thing that can happen to you or the worst. There is no middle ground.", portrait:'neutral' },
],
choices: [{ text:"Let him watch", reaction:"A second message arrives an hour later: \"I’m watching. Keep impressing me.\" You can’t tell if it’s a compliment or a threat. In El Colombiano’s world, they’re the same thing.", effects:{ 'npc.colombiano.trust':1, flags:['ev_col_notice'] } }],
},

// ════════════════════════════════════════════
// ══ MID-GAME MILESTONES — comic-panel-style rewards ══
milestone_week_one: { speaker:'narrator', priority:4,
conditions: { totalProfitGte:10000, notFlag:'ms_week1' },
lines: [{ text:"Week one. Still alive. The bus terminal feels like a lifetime ago. You’re starting to learn the rhythms — which corners are safe, which cops are blind, which prices mean money." }],
choices: [{ text:"x", effects:{ flags:['ms_week1'] } }],
},
milestone_ramirez_knows: { speaker:'narrator', priority:4,
conditions: { 'npc.ramirez.evidence':{gte:5}, notFlag:'ms_ramirez' },
lines: [{ text:"A surveillance photo slips out of a file folder at the Vice Intelligence office. Your face. Circled in red. Detective Ramirez knows what you look like now." }],
choices: [{ text:"x", effects:{ flags:['ms_ramirez'] } }],
},
milestone_crossroads: { speaker:'narrator', priority:4,
conditions: { credGte:20, fedHeatGte:25, notFlag:'ms_crossroads' },
lines: [{ text:"Halfway. The city wants to know: are you a businessman or a criminal? The answer used to be obvious. It isn’t anymore." }],
choices: [{ text:"x", effects:{ flags:['ms_crossroads'] } }],
},

// FLAVOR — shown as inline evtMsg, not overlays
// ════════════════════════════════════════════
flav_bank: { speaker:'narrator', priority:2,
conditions: { totalProfitGte:3000, notFlag:'f_bank' },
lines: [{ text:"📻 First National ordered a second vault. \"It’s a good problem,\" says the manager who definitely knows where the cash comes from." }],
choices: [{ text:"x", effects:{ flags:['f_bank'] } }],
},
flav_mutiny: { speaker:'narrator', priority:2,
conditions: { totalDealsGte:4, locIs:0, notFlag:'f_mutiny' },
lines: [{ text:"The Mutiny Hotel on Biscayne is the center of everything. Judges dance with dealers. Senators have reserved tables. The bathrooms have seen more crime than most courthouses." }],
choices: [{ text:"x", effects:{ flags:['f_mutiny'] } }],
},
flav_stirrers: { speaker:'narrator', priority:1,
conditions: { totalDealsGte:5, notFlag:'f_stirrers' },
lines: [{ text:"📻 The McDonald’s on Biscayne keeps running out of coffee stirrers. They’re not being used for coffee. The sign says ONE PER CUSTOMER. It doesn’t help." }],
choices: [{ text:"x", effects:{ flags:['f_stirrers'] } }],
},
flav_lambos: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:4000, notFlag:'f_lambos' },
lines: [{ text:"A man bought twelve Lamborghinis this week. Cash. The dealer asked about his family. \"The largest,\" the man said. He wasn’t talking about relatives." }],
choices: [{ text:"x", effects:{ flags:['f_lambos'] } }],
},
flav_speedboat: { speaker:'narrator', priority:1,
conditions: { totalDealsGte:5, locIs:5, notFlag:'f_speed' },
lines: [{ text:"A guy in the Keys races cigarette boats by day, runs product by night. Three championships. DEA’s been chasing him four years. Last Tuesday he outran their fastest boat. He waved." }],
choices: [{ text:"x", effects:{ flags:['f_speed'] } }],
},
flav_godmother: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:8000, notFlag:'f_godmother' },
lines: [{ text:"📻 Before El Colombiano, there was La Madrina. She ran the pipeline like a Fortune 500 — org charts, performance reviews, mandatory vacation. Also murder. Lots of murder." }],
choices: [{ text:"x", effects:{ flags:['f_godmother'] } }],
},
flav_banker: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:15000, notFlag:'f_banker' },
lines: [{ text:"There’s a banker in Brickell who processes $50 million a week in ‘international transfers.’ He wears khakis and a polo. Drives a Volvo. Most successful money launderer in American history. The Volvo is a nice touch." }],
choices: [{ text:"x", effects:{ flags:['f_banker'] } }],
},
flav_burger: { speaker:'narrator', priority:2,
conditions: { totalProfitGte:50000, notFlag:'f_burger' },
lines: [{ text:"📻 The Dade County ME rented a refrigerated Burger King trailer to store bodies. \"We’re running out of room,\" he told the Herald. \"We’re also running out of hope, but room is the more immediate problem.\"" }],
choices: [{ text:"x", effects:{ flags:['f_burger'] } }],
},
flav_doctor: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:30000, notFlag:'f_doctor' },
lines: [{ text:"The ME’s office started abbreviating cause of death. ‘GSW-DC’ means ‘gunshot wound, drug-related, Colombian.’ It saves time. There are a lot of forms." }],
choices: [{ text:"x", effects:{ flags:['f_doctor'] } }],
},
flav_vice: { speaker:'narrator', priority:1,
conditions: { totalDealsGte:5, locIs:0, notFlag:'f_vice' },
lines: [{ text:"Two undercover detectives working the waterfront. One drives a Ferrari. The other wears Armani. Their boss doesn’t ask questions. Their informants don’t last long." }],
choices: [{ text:"x", effects:{ flags:['f_vice'] } }],
},

// ════════════════════════════════════════════
// CASCADE CHAIN — The Cartel Dispute
// ════════════════════════════════════════════
faction_dispute: { speaker:'colombiano', portrait:'cold', priority:13,
conditions: { 'npc.colombiano.met':{eq:true}, credGte:50, eraGte:2, notFlag:'faction_chosen', dealsSinceGte:3 },
lines: [
{ text:"El Colombiano is waiting at a different café. No croquetas this time. Two men stand behind him — one in a Medellín jersey, one in a Cali polo. They don’t look at each other.", portrait:'cold' },
{ text:"\"The pipeline has split. Medellín and Cali are at war over the routes. Everyone in Miami has to choose a side.\"", portrait:'neutral' },
{ text:"\"Medellín: cheap product, reliable volume. But the Cali people will mark you. And Medellín’s heat is… significant. They are not subtle men.\"", portrait:'amused' },
{ text:"\"Cali: better quality, higher margins. But supply is unpredictable, and Medellín will cut you off overnight. You’ll never buy wholesale from them again.\"", portrait:'cold' },
{ text:"\"Or choose neither. Keep your independence. Both sides will respect it — for a while. Eventually, neutrality becomes a position they can’t afford to tolerate.\"", portrait:'cold' },
],
choices: [
{ text:"🇨🇴 Medellín — volume and loyalty", reaction:"\"Medellín it is. Pablo will be pleased. Volume starts tomorrow — wholesale, 30% under street.\" He pauses. \"The Cali people will know by sundown. Watch your back. They have long memories and short fuses.\"", effects:{ 'npc.colombiano.trust':2, flags:['faction_chosen','faction_medellin'] } },
{ text:"🏔️ Cali — quality and margins", reaction:"\"Interesting. The Cali gentlemen are… more refined. Better product, better lawyers. Medellín will be furious, but Medellín is always furious about something.\" He doesn’t look happy. His loyalty was always Medellín.", effects:{ 'npc.colombiano.trust':-1, flags:['faction_chosen','faction_cali'] } },
{ text:"🐺 Neither — I work alone", reaction:"\"The lone wolf. Romantic. Impractical. But I respect it.\" He stands. \"You have maybe three months before one side or the other decides neutrality is a luxury they can’t afford. Use the time wisely.\"", effects:{ flags:['faction_chosen','faction_independent'] } },
],
},

// Downstream: Medellín gets raided — your supply collapses
faction_medellin_heat: { speaker:'colombiano', portrait:'cold', priority:11,
conditions: { flag:'faction_medellin', fedHeatGte:50, totalProfitGte:200000, notFlag:'faction_downstream', dealsSinceGte:5 },
lines: [
{ text:"The call comes at 3 AM. El Colombiano sounds like he’s been running. \"Medellín got hit. DEA coordinated raids across three countries. The pipeline is gone.\"", portrait:'cold' },
{ text:"\"Your supply chain just evaporated. Everything you were getting wholesale? Gone. You’re buying retail like a tourist now.\"", portrait:'cold' },
{ text:"\"There’s one way out. Hoffman — the DEA agent. He’s offering deals to anyone who’ll flip. You could walk away clean. Or you could ride this out and rebuild.\"", portrait:'neutral' },
],
choices: [
{ text:"🤝 Call Hoffman — time to cooperate", reaction:"Hoffman answers on the first ring. He was expecting your call. \"Welcome to the winning team,\" he says. It doesn’t feel like winning.", effects:{ flags:['faction_downstream','became_informant','hoffman_cooperated','protected_informant'] } },
{ text:"💪 Ride it out — I’ll find new supply", reaction:"El Colombiano laughs. It’s not a happy laugh. \"You’re either brave or stupid. In Miami, the difference doesn’t matter much. Good luck.\" The line goes dead.", effects:{ flags:['faction_downstream','medellin_collapsed'] } },
],
},

// Downstream: Cali squeezes you
faction_cali_squeeze: { speaker:'colombiano', portrait:'amused', priority:11,
conditions: { flag:'faction_cali', totalProfitGte:200000, notFlag:'faction_downstream', dealsSinceGte:5 },
lines: [
{ text:"A man you don’t recognize shows up at your spot. Pressed suit. Briefcase. Cali accent. \"The organization has reviewed your performance. It’s been… adequate.\"", portrait:'neutral' },
{ text:"\"Going forward, we require 40% of all revenue from product we supply. Non-negotiable. This is the cost of quality.\"", portrait:'cold' },
{ text:"\"Alternatively, you can return to buying on the street like an amateur. We’ll find someone else. There’s always someone else.\"", portrait:'cold' },
],
choices: [
{ text:"💰 Pay the 40% — keep the supply", reaction:"\"Wise.\" He opens the briefcase. Inside: paperwork. Actual paperwork. The Cali cartel has accountants. Of course they do. You just became a franchise.", effects:{ flags:['faction_downstream','cali_franchise'] } },
{ text:"🖕 Walk away — nobody owns me", reaction:"He closes the briefcase with a click that sounds expensive. \"A shame. You had potential.\" By morning, every Cali contact in your phone is disconnected. You’re on your own.", effects:{ 'npc.colombiano.trust':-2, flags:['faction_downstream','cali_rejected'] } },
],
},

// Independent: both sides lose patience
faction_lone_wolf: { speaker:'narrator', priority:8,
conditions: { flag:'faction_independent', totalProfitGte:150000, notFlag:'faction_downstream', dealsSinceGte:5 },
lines: [{ text:"A note under your door: \"PICK A SIDE.\" No signature. The handwriting is Colombian. Both cartels are running out of patience with your neutrality. Prices are rising. Suppliers are nervous. The lone wolf winter is coming." }],
choices: [{ text:"x", effects:{ flags:['faction_downstream','lone_wolf_pressure'] } }],
},

// ════════════════════════════════════════════
// INFORMANT ARC — Working with the feds
// ════════════════════════════════════════════
informant_first_task: { speaker:'ramirez', portrait:'wry', priority:14,
conditions: { flag:'became_informant', notFlag:'informant_task_1', dealsSinceGte:2 },
lines: [
{ text:"Ramirez calls from a different payphone. Paranoid now. \"First job. I need names. The people you buy from — locations, times, quantities. Write it down. Leave it in the newspaper box on 4th and Flagler.\"", portrait:'neutral' },
{ text:"\"And choose carefully what you give me. Give me garbage and I’ll know. Give me gold and your contacts start disappearing. Either way, you’re the one who has to live with the consequences.\"", portrait:'wry' },
],
choices: [
{ text:"🐀 Give him real intel — burn a supplier", reaction:"You write down the address in Little Havana. Two days later, the building is empty. Ramirez got his raid. Your supplier is gone. So is your cheapest source.", effects:{ 'npc.ramirez.evidence':{gte:0}, flags:['informant_task_1','burned_supplier'], cred:-5 } },
{ text:"📝 Give him garbage — buy time", reaction:"You write down a fake address. Ramirez will figure it out in a week, maybe two. You bought yourself time. But the clock is still ticking.", effects:{ flags:['informant_task_1','gave_garbage'] } },
],
},

informant_second_task: { speaker:'ramirez', portrait:'tired', priority:14,
conditions: { flag:'informant_task_1', notFlag:'informant_task_2', totalDealsGte:5 },
lines: [
{ text:"Ramirez again. He sounds different this time. Tired. \"I need more. My captain wants a name. A real one. Not a corner boy — someone who matters.\"", portrait:'tired' },
{ text:"\"El Colombiano. Maria Santos. Pick one. I need to give them somebody or they pull my funding and we both go down.\"", portrait:'neutral' },
],
choices: [
{ text:"🇨🇴 Give him El Colombiano", reaction:"\"Colombiano.\" Ramirez writes it down. His hand is steady. Yours isn’t. \"That’s a big fish. If this checks out, your file goes in the shredder. If it doesn’t, Coleman Federal Penitentiary has a bed with your name on it.\"", effects:{ 'npc.colombiano.trust':-8, flags:['informant_task_2','burned_colombiano'] } },
{ text:"💃 Give him Maria", reaction:"The word tastes like ash. \"Santos.\" Ramirez pauses. \"The socialite? She’s connected to half the judges in Dade County.\" A longer pause. \"This is either very brave or very stupid. I’ll take it.\"", effects:{ 'npc.maria.trust':-10, flags:['informant_task_2','burned_maria'] } },
{ text:"🤐 Refuse — I’m not burning anyone", reaction:"\"Then we have a problem.\" Ramirez’s voice goes flat. \"You signed up for this. There’s no halfway. Evidence goes back in the active file. You have maybe two weeks before the grand jury sees it.\"", effects:{ 'npc.ramirez.evidence':5, flags:['informant_task_2','refused_to_burn'] } },
],
},

// Colombiano finds out you’re an informant
informant_discovered: { speaker:'colombiano', portrait:'cold', priority:15,
conditions: { flag:'became_informant', 'npc.colombiano.trust':{lte:-3}, 'npc.colombiano.met':{eq:true}, notFlag:'informant_exposure', dealsSinceGte:3 },
lines: [
{ text:"No phone call this time. A car pulls up beside you. The window rolls down. El Colombiano is in the back seat. He doesn’t look angry. That’s worse.", portrait:'cold' },
{ text:"\"I know what you’ve been doing. Who you’ve been talking to. The newspaper box on 4th and Flagler — did you think nobody was watching?\"", portrait:'cold' },
{ text:"\"In Colombia, we have a word for what you are. But I won’t say it. Words are cheap. Consequences are expensive.\"", portrait:'cold' },
{ text:"\"You have until tomorrow to leave Miami. After that, the conversation changes. And I won’t be the one having it.\"", portrait:'cold' },
],
choices: [
{ text:"Run — get out NOW", reaction:"You don’t go home. You don’t pack. You drive straight to the airport with whatever’s in your pockets. The Caymans flight leaves in two hours. If you’re alive when it takes off, you win.", effects:{ flags:['informant_exposure','burned_must_flee'] } },
{ text:"Call Hoffman — I need protection", reaction:"Hoffman answers. \"How bad?\" You tell him. A long silence. \"Stay in public places. I’ll have a marshal at your location in four hours. Don’t go anywhere alone.\" The next four hours are the longest of your life.", effects:{ flags:['informant_exposure','hoffman_protection'] } },
],
},

// Maria finds out about the betrayal
maria_betrayal_react: { speaker:'maria', portrait:'angry', priority:14,
conditions: { flag:'burned_maria', 'npc.maria.met':{eq:true}, notFlag:'maria_betrayal_done', dealsSinceGte:2 },
lines: [
{ text:"Maria is waiting outside your apartment. She’s not wearing white. She’s wearing black. She looks like a funeral.", portrait:'angry' },
{ text:"\"You gave Ramirez my name.\" It’s not a question. \"I had lawyers lined up in twenty minutes. The charges won’t stick — I’m not stupid. But my reputation? That takes longer to fix than a federal case.\"", portrait:'angry' },
{ text:"\"We’re done. Not business-done. Done-done. I hope whatever Ramirez offered you was worth it. Because everything I could have given you — the contacts, the intel, the laundering, the future we were building — that’s gone. Permanently.\"", portrait:'vulnerable' },
{ text:"She leaves. She doesn’t slam the door. She closes it quietly. That’s how you know it’s real.", portrait:'neutral' },
],
choices: [{ text:"Watch her go", reaction:"The gallery closes the next week. Maria Santos leaves Miami six months later. You hear she’s in Cartagena. She doesn’t leave a forwarding address.", effects:{ 'npc.maria.trust':-10, 'npc.maria.active':false, flags:['maria_betrayal_done','maria_gone'] } }],
},

// Colombiano reacts to being burned
colombiano_betrayal_react: { speaker:'narrator', portrait:'neutral', priority:14,
conditions: { flag:'burned_colombiano', notFlag:'colombiano_betrayal_done', dealsSinceGte:2 },
lines: [{ text:"El Colombiano was arrested at dawn. Federal marshals. Three SUVs. The tiger was tranquilized and relocated to a zoo in Tampa. Colombiano’s attorney says it’s a “misunderstanding.” The 47 kilos found in the pool house suggest otherwise. The streets know who talked. Your name isn’t safe anymore." }],
choices: [{ text:"x", effects:{ 'npc.colombiano.alive':false, flags:['colombiano_betrayal_done','colombiano_arrested'], cred:-15 } }],
},

// ════════════════════════════════════════════
// DEEPER ARCS — Character backstory, lifestyle reactions
// ════════════════════════════════════════════

// Colombiano vulnerable moment — his family, why he left Colombia
colombiano_personal: { speaker:'colombiano', portrait:'amused', priority:10,
conditions: { 'npc.colombiano.trust':{gte:2}, flag:'colombiano_friendly', credGte:35, notFlag:'colombiano_personal_done', dealsSinceGte:3 },
lines: [
{ text:"El Colombiano is drunk. You’ve never seen him drunk. He’s sitting by the pool — the one shaped like Colombia — staring at the shallow end where Bogotá would be.", portrait:'neutral' },
{ text:"My daughter turned seven today. Or maybe eight. I don’t know anymore. Her mother sends photos. I can’t open them.", portrait:'neutral' },
{ text:"You know why I left? Not the police. Not the cartels. My brother. He was a teacher. A real one — chalk on his hands, terrible salary, happy. They killed him for his car. A 1979 Toyota. Not even a good car.", portrait:'cold' },
{ text:"I decided that if the world was going to be cruel, I would be the one holding the knife. Not the other way around.” He finishes his drink. “Don’t feel sorry for me. Feel sorry for the people who made me necessary.", portrait:'cold' },
],
choices: [
{ text:"That’s a hell of a reason", reaction:"”Every reason is a hell of a reason in Colombia.” He stands. Capitalism the tiger pads over and leans against his leg like a housecat. “I named him Capitalism because he eats everything in sight and feels nothing. I find it educational.” He almost smiles. Almost.", effects:{ 'npc.colombiano.trust':2, flags:['colombiano_personal_done'] } },
{ text:"You could still call her", reaction:"”And say what? ‘Happy birthday, your father is a narcotics trafficker who lives with a Bengal tiger in Miami’? Some things are kinder left unsaid.” He scratches Capitalism behind the ears. The tiger purrs. It’s the saddest sound you’ve ever heard.", effects:{ 'npc.colombiano.trust':1, flags:['colombiano_personal_done'] } },
],
},

// Maria bridge — trust 3, between launder and personal
maria_rising: { speaker:'maria', portrait:'knowing', priority:9,
conditions: { 'npc.maria.trust':{gte:3}, credGte:15, notFlag:'maria_rising_done', dealsSinceGte:3 },
lines: [
{ text:"Maria meets you at the marina. She’s watching a yacht pull out — some banker’s boat, all teak and tax evasion.", portrait:'neutral' },
{ text:"You’re getting big. That’s good and terrible. Good because money. Terrible because the bigger you get, the more people need you to fall.", portrait:'knowing' },
{ text:"Ramirez needs a case. The Colombians need a scapegoat. The Cali people need a competitor to disappear. And everybody needs someone to blame when the music stops.", portrait:'knowing' },
{ text:"I’m telling you this because—“ She stops. Watches the yacht. “Because I’d rather not attend your funeral. The catering is always terrible at those things.", portrait:'amused' },
],
choices: [
{ text:"You worried about me?", reaction:"Worried is a strong word. ‘Strategically concerned’ is more accurate.” She steals your sunglasses, puts them on. “Keep these. You’ll need them. The future is very bright, and very dangerous, and you should look good while it kills you.", effects:{ 'npc.maria.trust':1, flags:['maria_rising_done'] } },
{ text:"I can handle it", reaction:"That’s what César said. César is currently decomposing in a cemetery in Hialeah.” A pause. “But sure. You can handle it.” She takes a sip of your coffee. “I’ll be at the gallery if you need someone to identify the body.", effects:{ flags:['maria_rising_done'] } },
],
},

// Maria reacts to your Countach
maria_notices_lifestyle: { speaker:'maria', portrait:'amused', priority:7,
conditions: { 'npc.maria.met':{eq:true}, 'npc.maria.trust':{gte:1}, lifestyleHas:'car', notFlag:'maria_lifestyle_react' },
lines: [
{ text:"Maria sees the Countach parked outside. She walks around it once. Twice. Runs a finger along the hood.", portrait:'amused' },
{ text:"A Lamborghini. How wonderfully subtle. You might as well tattoo ‘DRUG MONEY’ on your forehead. At least the forehead tattoo is free.", portrait:'knowing' },
{ text:"Every cop in Dade County is going to see this car and think ‘probable cause on wheels.’ Ramirez is going to love it. He’ll probably take a photo for his file.", portrait:'amused' },
],
choices: [
{ text:"You like it though", reaction:"It’s gorgeous. It’s also the dumbest purchase in the history of crime, and I say that as someone who once watched a man buy a gold-plated AK-47.” She opens the passenger door. “Take me to dinner. Somewhere expensive. If you’re going to be stupid, at least be stupid with company.", effects:{ 'npc.maria.trust':1, flags:['maria_lifestyle_react'] } },
{ text:"It’s an investment", reaction:"In what? Your own arrest?” She laughs. It’s a real laugh. “Fine. Keep your investment. But when Ramirez pulls you over — and he will — remember that I told you so. I always tell you so. It’s my most attractive quality.", effects:{ flags:['maria_lifestyle_react'] } },
],
},

// Colombiano reacts to your visible rise
colombiano_notices_lifestyle: { speaker:'colombiano', portrait:'amused', priority:7,
conditions: { 'npc.colombiano.met':{eq:true}, 'npc.colombiano.trust':{gte:1}, totalProfitGte:75000, notFlag:'col_lifestyle_react', dealsSinceGte:3 },
lines: [
{ text:"El Colombiano sends a gift basket. Inside: champagne, cigars, and a framed photo of Pablo Escobar’s bombed-out mansion.", portrait:'amused' },
{ text:"The card reads: “Congratulations on your success. The champagne is to celebrate. The photo is to remind you how every celebration in this business eventually ends. Enjoy both. — E.C.”", portrait:'cold' },
{ text:"P.S. — I hear you bought some things. Good for you. Material possessions are the cocaine of the middle class. We sell the real thing, which I suppose makes us more honest.", portrait:'amused' },
],
choices: [
{ text:"Cheers, Colombiano", reaction:"You drink the champagne. It’s excellent. Of course it is. You look at the photo of the bombed mansion for a long time. Then you put it face-down in a drawer. Some things are better not stared at.", effects:{ 'npc.colombiano.trust':1, flags:['col_lifestyle_react'] } },
{ text:"Toss the photo", reaction:"The champagne is excellent. The photo goes in the trash. You’ll think about endings later. Or never. Never works too.", effects:{ flags:['col_lifestyle_react'] } },
],
},

// ════════════════════════════════════════════
// LATE-GAME FLAVOR — The world at $100K+
// ════════════════════════════════════════════
flav_coast_guard: { speaker:'narrator', priority:2,
conditions: { totalProfitGte:100000, notFlag:'f_coast' },
lines: [{ text:"📻 The Coast Guard intercepted a shrimp boat carrying 3 tons of cocaine. The captain claimed he was “just fishing.” His fishing rod was made of gold. The Coast Guard was not convinced." }],
choices: [{ text:"x", effects:{ flags:['f_coast'] } }],
},
flav_congress: { speaker:'narrator', priority:2,
conditions: { totalProfitGte:150000, notFlag:'f_congress' },
lines: [{ text:"📻 Congress is debating the Anti-Drug Abuse Act. A senator who receives campaign donations from a pharmaceutical company that manufactures synthetic opioids gave an impassioned speech about “the scourge of illegal drugs.” Nobody laughed. Somebody should have." }],
choices: [{ text:"x", effects:{ flags:['f_congress'] } }],
},
flav_dolphins: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:120000, notFlag:'f_dolphins' },
lines: [{ text:"The Dolphins’ new defensive end drives a different Porsche every day of the week. His salary is $180,000. Nobody at the Herald writes the story. The Herald’s advertising manager drives a Porsche too." }],
choices: [{ text:"x", effects:{ flags:['f_dolphins'] } }],
},
flav_cemetery: { speaker:'narrator', priority:2,
conditions: { totalProfitGte:200000, notFlag:'f_cemetery' },
lines: [{ text:"Woodlawn Cemetery ran out of plots. They’re expanding into what used to be a Little League field. “The children can play somewhere else,” said the director. “The dead are less flexible about relocation.”" }],
choices: [{ text:"x", effects:{ flags:['f_cemetery'] } }],
},
flav_realtor: { speaker:'narrator', priority:1,
conditions: { totalProfitGte:250000, notFlag:'f_realtor' },
lines: [{ text:"A real estate agent in Coral Gables sells $40 million in homes this quarter. Cash buyers only. She doesn’t ask questions. Her business card says “Dreams Made Real.” She means it more literally than her clients would like." }],
choices: [{ text:"x", effects:{ flags:['f_realtor'] } }],
},
};
const NPC_COLORS = { maria:C.flamingo, ramirez:C.blue, colombiano:C.orange, narrator:C.dim };
const NPC_NAMES = { maria:'Maria Santos', ramirez:'Det. Ramirez', colombiano:'El Colombiano', narrator:'' };

// ── NPC PORTRAIT PIPELINE ──
// Portrait images: replace these with full data URIs or URLs
const NPC_PORTRAITS = { maria:null, ramirez:null, colombiano:null, hoffman:null };
const NPC_ROLES = { maria:'THE INSIDER', ramirez:'LAW ENFORCEMENT', colombiano:'CRIMINAL RIVAL', hoffman:'FEDERAL AGENT', narrator:'NARRATOR' };
const NPC_GLOW = { maria:'255,105,180', ramirez:'0,229,255', colombiano:'255,107,53', hoffman:'123,47,190' };
const NPC_EMOJI = { maria:'💃', ramirez:'🕵️', colombiano:'🇨🇴', hoffman:'🕴️', narrator:'📻' };

// Compute player qualities from state
const computeQualities = (s) => {
const flash = CL((s.lifestyle?.length||0)*2 + (s.cred>30?2:0) + (s.cash>50000?2:0), 0, 10);
const th = s.tradeHistory || [];
const dc = {};
th.forEach(t => { dc[t.drug] = (dc[t.drug]||0) + t.qty; });
const top = Object.entries(dc).sort((a,b)=>b[1]-a[1])[0];
return { flash, productId: top ? DRUGS[parseInt(top[0])]?.name?.toLowerCase() : null };
};

// Evaluate conditions against state
const meetsConditions = (conds, s, q) => {
for (const [k, v] of Object.entries(conds)) {
if (k==='moveGte' && s.move<v) return false;
if (k==='moveLte' && s.move>v) return false;
if (k==='flashGte' && q.flash<v) return false;
if (k==='flashLte' && q.flash>v) return false;
if (k==='heatGte' && s.fedHeat<v) return false;
if (k==='fedHeatGte' && s.fedHeat<v) return false;
if (k==='heatLte' && s.fedHeat>v) return false;
if (k==='credGte' && s.cred<v) return false;
if (k==='credLte' && s.cred>v) return false;
if (k==='cashGte' && s.cash<v) return false;
if (k==='bustsGte' && (s.totalBusts||0)<v) return false;
if (k==='biggestDealGte' && (s.biggestDeal||0)<v) return false;
if (k==='locIs' && s.loc!==v) return false;
if (k==='productIs' && q.productId!==v) return false;
if (k==='debtLte' && (s.debt||0)>v) return false;
if (k==='nightOnly' && s.move%2!==1) return false;
if (k==='bagFullPct') { const used=s.inv.reduce((a,b)=>a+b,0); if(used/s.coatSp*100<v) return false; }
if (k==='flag' && !s.storyFlags?.[v]) return false;
if (k==='notFlag' && s.storyFlags?.[v]) return false;
// Action-driven conditions (replace moveGte/moveLte)
if (k==='totalProfitGte' && (s.totalProfit||0)<v) return false;
if (k==='totalDealsGte' && (s.totalDeals||0)<v) return false;
if (k==='evidenceGte' && (s.npcState?.ramirez?.evidence||0)<v) return false;
if (k==='eraIs' && (s.currentEra||0)!==v) return false;
if (k==='eraGte' && (s.currentEra||0)<v) return false;
if (k==='dealsSinceGte' && (s.dealsSinceLastEvent||0)<v) return false;
if (k==='turfCountGte' && s.turf.filter(t=>t>0).length<v) return false;
if (k==='lifestyleHas' && !(s.lifestyle||[]).some(l=>l.effect===v)) return false;
if (k.startsWith('npc.')) {
const p=k.split('.'), nv=s.npcState?.[p[1]]?.[p[2]];
if (typeof v==='object') {
if ('eq' in v && nv!==v.eq) return false;
if ('gte' in v && (nv||0)<v.gte) return false;
if ('lte' in v && (nv||0)>v.lte) return false;
}
}
}
return true;
};

// Select best storylet (Hades priority queue)
const selectStorylet = (s) => {
const q = computeQualities(s);
const seen = s.storySeen || {};
const avail = Object.entries(STORY)
.filter(([id, n]) => !seen[id] && meetsConditions(n.conditions, s, q))
.sort((a,b) => (b[1].priority||0) - (a[1].priority||0));
if (!avail.length) return null;
const topP = avail[0][1].priority;
const tier = avail.filter(([_,n]) => n.priority===topP);
const pick = tier[Math.floor(Math.random()*tier.length)];
return { id:pick[0], ...pick[1] };
};

// Apply choice effects to state
const applyChoiceEffects = (s, eff) => {
if (!eff) return s;
let ns = { ...s, storyFlags: { ...(s.storyFlags||{}) } };
for (const [k,v] of Object.entries(eff)) {
if (k==='flags') v.forEach(f=>ns.storyFlags[f] = true);
else if (k==='cashDelta') ns.cash=Math.max(0,ns.cash+v);
else if (k==='cleanCashDelta') ns.cleanCash=(ns.cleanCash||0)+v;
else if (k==='cred') ns.cred=CL((ns.cred||0)+v,0,100);
else if (k==='invDelta') { const di=DRUGS.findIndex(d=>d.name.toLowerCase()===v.drug); if(di>=0){ns.inv=[...ns.inv];ns.inv[di]+=v.qty;} }
else if (k.startsWith('npc.')) { const p=k.split('.'); ns.npcState={...ns.npcState,[p[1]]:{...ns.npcState[p[1]],[p[2]]:typeof v==='boolean'?v:(ns.npcState[p[1]]?.[p[2]]||0)+v}}; }
}
return ns;
};

// ── INITIAL STATE FACTORY ──
const createInitialState = () => {
const bp = initBasePrices();
const ip = getStreetPrices(bp, 0, ERAS[0].demandMod, Array(DRUG_COUNT).fill(1));
// Semi-script: make one mid-tier drug obviously cheap so first trade feels smart
// Crack (idx 4, mean 35) → force near-minimum so it glows green
ip[4] = R(12, 16);
// And make it expensive somewhere else by adjusting base price momentum
bp[4] = DRUGS[4].mean * 0.6; // Low base = will mean-revert UP at next location

return {
move: 0, cash: 200, debt: 8000, bank: 0, cleanCash: 0, hp: 100, loc: 0,
inv: Array(DRUG_COUNT).fill(0), avgC: Array(DRUG_COUNT).fill(0), coatSp: 100,
prices: ip, hist: ip.map(p => [p]), basePrices: bp, momentum: initMomentum(),
cred: 0, fedHeat: 0, gun: false,
rivals: RIVALS_NAMES.slice(0, 3).map(n => ({ name: n, loc: R(0, 5), rep: R(0, 15) })),
lifestyle: [], safeHouses: Array(6).fill(-1),
turf: Array(6).fill(0), enforcers: Array(6).fill(0), demand: Array(DRUG_COUNT).fill(1),
achievements: [], montage: [], nwHist: [0], evtMsg: null, scores: [],
streak: 0, bestStreak: 0,
npcState: {
colombiano: { met: false, trust: 0, alive: true, lastEventMove: 0 },
ramirez: { met: false, evidence: 0, bribed: false, lastEventMove: 0 },
maria: { met: false, trust: 0, active: true, lastEventMove: 0 },
},
pagerDeal: null,
totalProfit: 0, totalBusts: 0, biggestDeal: 0,
// Narrative state
storyFlags: {}, storySeen: {}, tradeHistory: [], activeStorylet: null,
// Backstory: player carries a brick from Panama
fuseChains: { mariaBrickDebt:false, mariaNegotiated:false, cesarGhost:false },
// Action-driven progression (replaces move-based triggers)
currentEra: 0,           // Index into ERAS, advanced by player actions
eraStartMove: 0,         // Move when current era began (for min-duration)
totalDeals: 0,           // Every buy or sell increments
dealsSinceLastEvent: 0,  // Resets when NPC event fires
peakNetWorth: 0,         // Highest net worth achieved
supplierHistory: {},     // { locIdx: buyCount } for betrayal triggers
// Poker-style multi-turn deals
activeDeal: null,        // { step:0-3, drugIdx, qty, cost, targetLoc, altDropPaid, rivalBought, movePlanted }
// Defusable fuse timers (planted consequences)
fuseTimers: [],          // [{ id, movePlanted, fuseLength, defused }]
};
};

// ═══════════════════════════════════════════════════════════════
// PURE STATE TRANSITIONS (Same as v2, with minor mods for new systems)
// ═══════════════════════════════════════════════════════════════

function processTravel(s, destLoc) {
const nm = s.move + 1;
const isNight = nm % 2 === 1;
const era = getEra(s); // era from state, not move number
const usedSp = s.inv.reduce((a, b) => a + b, 0);
const effects = [];

// Radio event
let evtMsg = null, evtDrug = null, evtType = null, evtMulti = null;
if (Math.random() < (nm < 10 ? .5 : .35)) {
const e = RADIO_EVENTS[R(0, RADIO_EVENTS.length - 1)];
const dr = DRUGS[R(0, DRUG_COUNT - 1)];
evtMsg = `📻 ${e.msg.replace("{d}", dr.name)}`;
evtDrug = dr.name; evtType = e.type; evtMulti = e.m;
}

// Evolve economy
const newMom = evolveMomentum(s.momentum);
const newBase = evolveBasePrices(s.basePrices, newMom, evtDrug, evtType, evtMulti);
const np = getStreetPrices(newBase, destLoc, era.demandMod, s.demand);
const newHist = s.hist.map((h, i) => [...h.slice(-7), np[i]]);

// Heat (with passive decay and safehouse mods)
const sh = s.safeHouses[destLoc];
let heatDecay = sh >= 0 ? SAFE_HOUSES[sh].heatDecay : 0;
const passiveDecay = usedSp === 0 ? 2 : 0;
const hc = usedSp > 50 ? 4 : usedSp > 20 ? 2 : usedSp > 0 ? 0 : -1;
// Heat floor: rises with career activity — you can never fully cool off
const heatFloor = Math.floor((s.totalProfit||0) / 50000) + Math.floor((s.totalBusts||0) * 3);
let nh = CL(Math.max(s.fedHeat + hc - heatDecay - passiveDecay, heatFloor), 0, 100);

if (nh > 20) effects.push({ type: 'SYNTH_PULSE', heat: nh });

// Police check
// Success tax: wealth makes you a bigger target
const wealthMod = s.cash >= 500000 ? 1.6 : s.cash >= 250000 ? 1.4 : s.cash >= 100000 ? 1.2 : 1;
const policeEff = LOCS[destLoc].heat * 0.5 * era.copsMod * (1 + nh / 300) * (isNight ? 1.2 : 1) * wealthMod;

if (Math.random() < policeEff && usedSp > 0) {
effects.push({ type: 'SFX', name: 'police' }, { type: 'SCREEN', screen: 'police' });
const newRivals = s.rivals.map(v => ({ ...v, loc: Math.random() < .4 ? R(0, 5) : v.loc }));
return {
state: {
...s, loc: destLoc, move: nm, prices: np, hist: newHist, basePrices: newBase, momentum: newMom,
fedHeat: Math.min(100, nh + 5), evtMsg, rivals: newRivals
}, effects
};
}

// Nightclub laundering
let cash = s.cash, cleanCash = s.cleanCash;
if (s.lifestyle.includes("club")) {
const launder = Math.min(2000, cash);
if (launder > 0) { cash -= launder; cleanCash += launder; }
}

let debt = s.debt, bank = s.bank;
// Interest scales with debt — Tiburón charges more as you owe more
const baseInterest = 0.08;
const debtPenalty = debt >= 30000 ? 0.06 : debt >= 20000 ? 0.04 : debt >= 10000 ? 0.02 : 0;
const interestRate = 1 + baseInterest + debtPenalty;
if (nm % 4 === 0 && debt > 0) debt = Math.floor(debt * interestRate);
if (nm % 4 === 0 && bank > 0) bank = Math.floor(bank * 1.03);

// Empire income
const turfIncome = s.turf.reduce((sum, lv) => sum + TURF_LEVELS[lv].income, 0);
const enfUpkeep = s.enforcers.reduce((sum, e) => sum + e * ENFORCER_UPKEEP, 0);
const empNet = turfIncome - enfUpkeep;
cash += empNet;
if (empNet > 0) effects.push({ type: 'SPAWN', text: `+${FM(empNet)} turf`, color: C.gold, y: 350 });

// Turf war (scaled)
let turfWar = null;
const rivalInTurf = s.rivals.find(r => s.turf[r.loc] > 0 && r.loc !== destLoc);
if (rivalInTurf && Math.random() < .15) {
const basePower = R(3, 8);
const scaledPower = basePower + Math.floor(nm / 12);
turfWar = { loc: rivalInTurf.loc, rivalName: rivalInTurf.name, rivalPower: scaledPower };
}

// ── LOAN SHARK ESCALATION — debt-scaled, not timer-based ──
let hpDelta = 0;
if (debt > 0) {
if (debt >= 30000) {
// Tier 4: Kill zone. Severe damage every 3 moves.
if (nm % 3 === 0) {
const loss = R(15, 30);
hpDelta = -loss;
effects.push({ type: 'SHAKE' }, { type: 'FLASH', color: C.pink + '44' });
evtMsg = `🦈 Tiburón's enforcer kicks in the door. -${loss} HP. "Last warning."`;
const stolen = Math.min(cash, R(500, 2000));
cash -= stolen;
if (stolen > 0) effects.push({ type: 'SPAWN', text: `-${FM(stolen)} stolen`, color: C.pink, size: 11 });
}
} else if (debt >= 20000) {
// Tier 3: Frequent damage + cash theft
if (nm % 4 === 0) {
const loss = R(10, 20);
hpDelta = -loss;
effects.push({ type: 'SHAKE' });
const stolen = Math.min(cash, R(300, 1000));
cash -= stolen;
evtMsg = evtMsg || `🦈 Shark's crew cornered you. -${loss} HP${stolen > 0 ? ', -' + FM(stolen) + ' taken' : ''}.`;
}
} else if (debt >= 10000) {
// Tier 2: Occasional damage
if (nm % 6 === 0) {
const loss = R(5, 12);
hpDelta = -loss;
effects.push({ type: 'SHAKE' });
evtMsg = evtMsg || `🦈 Shark's boys found you. -${loss} HP. Pay what you owe.`;
}
}
// Tier 1 (debt < 10K): interest only, no violence
}

// ── SUCCESS TAX — flashy wealth attracts attention ──
if (cash >= 100000 && (s.currentEra||0) >= 1) {
// Heat accumulates 50% faster when you’re rich
// Corrupt cop demands payment every 8 moves
if (nm % 8 === 0) {
const shakedown = Math.min(cash, Math.floor(cash * 0.02));
if (shakedown > 500) {
cash -= shakedown;
if (!evtMsg) evtMsg = `👮 A dirty cop wants his cut. -${FM(shakedown)}. "Price of doing business, amigo."`;
effects.push({ type: 'SPAWN', text: `-${FM(shakedown)}`, color: C.pink, size: 10 });
}
}
}

// ── FAILURE BONUS — mercy for struggling players (one-time) ──
let usedFailureBonus = false;
if (cash <= 2000 && (s.totalProfit||0) >= 5000 && debt > 0 && !s.storyFlags?.got_failure_bonus) {
// One-time lifeline: cheap product appears
const cheapDrug = R(0, DRUG_COUNT-1);
const cheapAmt = R(5, 15);
if (!evtMsg) evtMsg = `A desperate dealer dumps ${cheapAmt}x ${DRUGS[cheapDrug].name} at half price. Grab it while you can.`;
// Halve the price of a random drug at current location
np[cheapDrug] = Math.max(DRUGS[cheapDrug].min, Math.floor(np[cheapDrug] * 0.4));
usedFailureBonus = true;
}

// Demand decay — moderate recovery preserves location price differentiation
const careerSaturation = Math.max(0.75, 1 - (s.totalDeals||0) * 0.001); // gentler: floor at 0.75 after 250 deals
const newDemand = s.demand.map(v => Math.max(0.4, (v + (1 - v) * .20) * careerSaturation));

// Newspaper
let newspaper = null;
if (nm > 0 && nm % 10 === 0) newspaper = NEWSPAPERS[R(0, NEWSPAPERS.length - 1)];

// Random encounter
let randEnc = null;
// Defuse opportunities — active fuses get priority (40% chance each)
const activeWitness = fuseTimers.find(f => f.id === 'witness' && !f.defused);
const activeDEA = fuseTimers.find(f => f.id === 'dea_surveil' && !f.defused);
if (activeWitness && Math.random() < 0.4) {
const defuseEnc = ENCOUNTERS.find(e => e.type === "witness_defuse");
randEnc = { ...defuseEnc, fuseId: 'witness' };
} else if (activeDEA && Math.random() < 0.4) {
const defuseEnc = ENCOUNTERS.find(e => e.type === "dea_defuse");
randEnc = { ...defuseEnc, fuseId: 'dea_surveil' };
} else if (nm > 8 && Math.random() < (isNight ? .30 : .18)) {
const pool = ENCOUNTERS.filter(e => e.type !== "witness_defuse" && e.type !== "dea_defuse" && Math.random() < e.chance);
if (pool.length > 0) {
const enc = pool[R(0, pool.length - 1)];
if (enc.type === "find") randEnc = { ...enc, drugIdx: R(0, DRUG_COUNT - 1), amt: R(enc.amount[0], enc.amount[1]) };
else if (enc.type === "tip") randEnc = { ...enc, text: enc.text.replace("{d}", DRUGS[R(0, DRUG_COUNT - 1)].name).replace("{l}", LOCS[R(0, 5)].name) };
else if (enc.type === "mugger") randEnc = { ...enc, hpLoss: R(enc.hpLoss[0], enc.hpLoss[1]), cashLoss: R(enc.cashLoss[0], enc.cashLoss[1]) };
else if (enc.type === "bribe_offer") randEnc = { ...enc, cost: R(enc.cost[0], enc.cost[1]) };
else randEnc = { ...enc };
}
}

// Pager deal (with safehouse mod)
let pagerDeal = null;
const basePagerChance = 0.12;
if (Math.random() < basePagerChance && nm > 5) {
const pd = PAGER_DEALS[R(0, PAGER_DEALS.length - 1)];
const drugIdx = R(0, DRUG_COUNT - 1);
const qty = R(pd.qty[0], pd.qty[1]);
const bonusPct = Math.round((RF(pd.bonus[0], pd.bonus[1]) - 1) * 100);
const targetLoc = R(0, 5);
pagerDeal = {
drugIdx, qty, bonusPct, targetLoc,
msg: pd.msg.replace("{q}", qty).replace("{d}", DRUGS[drugIdx].name).replace("{p}", bonusPct),
expiresMove: nm + 3,
};
effects.push({ type: 'SFX', name: 'pager' });
}

// NPC state updates (evidence accumulation only — introductions handled by storylet system)
let npcState = { ...s.npcState };
let npcEvent = null;

// Ramirez passively accumulates evidence based on heat
if (npcState.ramirez.met && nm % 5 === 0) {
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence || 0) + Math.floor(nh / 25));
}
// Evidence creep: every 10th deal adds 1 evidence automatically (the streets talk)
const td = (s.totalDeals||0);
if (td > 0 && td % 10 === 0 && npcState.ramirez.met) {
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence || 0) + 1);
}
// High-profile dealing: operating with turf level 3+ generates evidence
if (s.turf[destLoc] >= 3 && npcState.ramirez.met && nm % 5 === 0) {
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence || 0) + 1);
}

// ── NPC PATIENCE — they don’t wait forever ──
// Ramirez escalates if offer was refused and player keeps dealing
if (s.storyFlags?.refused_ramirez && (npcState.ramirez.evidence || 0) >= 10 && td > (s.storyFlags?.ramirez_refused_at_deal||0) + 10) {
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence || 0) + 3);
if (!evtMsg) evtMsg = "🕵️ Ramirez is done waiting. The case file just got thicker.";
}
// Maria sells you out if trust stays negative for too long
if (npcState.maria.met && npcState.maria.trust <= -3 && td > 0 && td % 15 === 0 && !s.storyFlags?.maria_sold_out) {
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence || 0) + 5);
if (!evtMsg) evtMsg = "💃 Word on the street: someone close to you talked to Vice. Maria isn’t answering her phone.";
}
// Colombiano acts if rejected and player grows too big
if (npcState.colombiano.met && npcState.colombiano.trust <= -3 && (s.totalProfit||0) >= 100000 && Math.random() < .12 && (nm - (npcState.colombiano.lastEventMove||0)) >= 6) {
const loss = R(2000, 8000);
cash = Math.max(0, cash - loss);
npcState.colombiano.lastEventMove = nm;
evtMsg = `🇨🇴 El Colombiano sent a message. ${FM(loss)} worth of product destroyed. "You were warned."`;
effects.push({ type: 'SHAKE' });
}

// ── FUSE CHAINS — delayed consequences from backstory choices ──
const fc = s.fuseChains || {};
let fuseChains = { ...fc };
// Maria’s brick debt — she tips you off when you’ve established yourself
if ((s.totalProfit||0) >= 15000 && s.storyFlags?.maria_brick_debt && !fc.mariaBrickDebt) {
fuseChains.mariaBrickDebt = true;
const tipDrug = R(0, DRUG_COUNT-1), tipLoc = R(0, 5);
evtMsg = `📟 Maria: "Remember that brick? Consider this interest." ${DRUGS[tipDrug].name} prices about to crater in ${LOCS[tipLoc].name}.`;
effects.push({ type: 'SFX', name: 'pager' });
}
// Maria tests the negotiator — sends bad intel when stakes are higher
if ((s.totalProfit||0) >= 30000 && s.storyFlags?.maria_negotiated && !fc.mariaNegotiated) {
fuseChains.mariaNegotiated = true;
evtMsg = `📟 Maria: "Heroin's about to spike in Overtown. Load up." She sounds too casual. Something feels off.`;
}
// César’s ghost — Hoffman appears when your profile gets high enough
if (s.storyFlags?.brick_deal_done && !fc.cesarGhost && (nh >= 40 || (npcState.ramirez?.evidence||0) >= 8)) {
fuseChains.cesarGhost = true;
npcEvent = {
npc: "hoffman", type: "choice",
text: "🕴️ A man in a cheap suit and cheaper sunglasses is waiting outside the café. Federal ID. \"Agent Hoffman. DEA. I want to talk about a dead courier named César Vargas.\" He knows you were on that bus.",
opts: [
{ label: "🤐 DENY EVERYTHING", action: "hoffman_deny" },
{ label: "🏃 RUN", action: "hoffman_run" },
{ label: "🤝 GIVE HIM SOMETHING SMALL", action: "hoffman_cooperate" },
]
};
}

// ── POKER-STYLE MULTI-TURN DEALS ──
let activeDeal = s.activeDeal ? { ...s.activeDeal } : null;
let dealEvent = null; // UI event for deal step

if (activeDeal) {
// Advance deal by one step on each travel
activeDeal.step++;
const d = activeDeal;
if (d.step === 1) {
// Complication: DEA rumor
dealEvent = {
type: 'deal_step', step: 'complication',
text: `📟 Word is DEA might be watching the drop in ${LOCS[d.targetLoc].name}. Pay $${Math.floor(d.cost * 0.12)} for an alternate route?`,
opts: [
{ label: "💰 PAY FOR ALT DROP", action: "deal_altdrop" },
{ label: "🎲 RISK IT", action: "deal_norisk" },
]
};
} else if (d.step === 2) {
// Temptation: rival offers to buy half
const halfValue = Math.floor(d.qty * np[d.drugIdx] * 0.5 * 0.8);
dealEvent = {
type: 'deal_step', step: 'temptation',
text: `A rival offers ${FM(halfValue)} for half the shipment. Safe money — but you leave the rest on the table.`,
opts: [
{ label: `💰 SELL HALF — ${FM(halfValue)}`, action: "deal_sellhalf" },
{ label: "🃏 KEEP IT ALL", action: "deal_keepall" },
]
};
} else if (d.step >= 3) {
// Resolution
const interceptChance = d.altDropPaid ? 0.05 : (0.15 + nh * 0.003);
const intercepted = Math.random() < interceptChance;
const deliveryQty = d.rivalBought ? Math.floor(d.qty / 2) : d.qty;

  if (intercepted) {
    // DEA intercept — lose everything
    activeDeal = null;
    evtMsg = `🚔 DEA intercepted the shipment. ${FM(d.cost)} gone. The contact disappeared.`;
    effects.push({ type: 'SHAKE' }, { type: 'FLASH', color: C.pink + '44' });
    npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence||0) + 3);
  } else {
    // Delivery success — product added to inventory
    const newInv = [...s.inv];
    newInv[d.drugIdx] = (newInv[d.drugIdx]||0) + deliveryQty;
    // We can't modify s.inv directly, so store in deal for return
    activeDeal = { ...d, resolved: true, deliveryQty, newInv };
    const value = deliveryQty * np[d.drugIdx];
    evtMsg = `📦 Shipment landed. ${deliveryQty}x ${DRUGS[d.drugIdx].name} in your bag. Street value: ~${FM(value)}.`;
    effects.push({ type: 'SFX', name: 'pager' }, { type: 'SPAWN', text: `+${deliveryQty} ${DRUGS[d.drugIdx].emoji}`, color: C.gold, size: 14 });
  }
}

} else if (
s.cred >= 40 && cash >= 30000 && (s.totalDeals||0) >= 15 && (s.currentEra||0) >= 1
&& Math.random() < 0.15
) {
// Activate a new deal
const dealDrug = cash >= 80000 ? 5 : (cash >= 40000 ? R(5,6) : R(2,4)); // Scale drug tier with wealth
const dealQty = R(8, Math.min(30, Math.floor(cash / (DRUGS[dealDrug].mean * 1.5))));
const dealCost = dealQty * Math.floor(DRUGS[dealDrug].mean * RF(0.7, 0.9));
const dealLoc = R(0, 5);
if (dealCost <= cash * 0.8) { // Don’t offer deals that would bankrupt
activeDeal = { step: 0, drugIdx: dealDrug, qty: dealQty, cost: dealCost, targetLoc: dealLoc, altDropPaid: false, rivalBought: false, movePlanted: nm };
cash -= dealCost; // Lock in the deposit
dealEvent = {
type: 'deal_step', step: 'offer',
text: `📟 A contact offers ${dealQty}x ${DRUGS[dealDrug].name} for ${FM(dealCost)}. Delivery in 3 moves to ${LOCS[dealLoc].name}. The money's already gone.`,
opts: [{ label: "👍 UNDERSTOOD", action: "deal_ack" }]
};
effects.push({ type: 'SFX', name: 'pager' });
}
}

// ── DEFUSABLE FUSE TIMERS ──
let fuseTimers = [...(s.fuseTimers || [])];

// Plant: Witness fuse — big public deal in high-traffic location
if ((s.biggestDeal||0) >= 15000 && [0,1,3].includes(destLoc) && !fuseTimers.some(f => f.id === 'witness') && !s.storyFlags?.witness_fired) {
fuseTimers.push({ id: 'witness', movePlanted: nm, fuseLength: 8, defused: false });
}

// Plant: DEA surveillance fuse — high federal heat draws wiretap attention
if (nh >= 45 && (s.totalProfit||0) >= 80000 && !fuseTimers.some(f => f.id === 'dea_surveil') && !s.storyFlags?.dea_surveil_fired) {
fuseTimers.push({ id: 'dea_surveil', movePlanted: nm, fuseLength: 6, defused: false });
}

// Plant: Supplier betrayal fuse — same source too many times + heat
const supplierCount = (s.supplierHistory||{})[destLoc] || 0;
if (supplierCount >= 5 && nh >= 20 && !fuseTimers.some(f => f.id === `supplier_${destLoc}`) && !s.storyFlags?.[`supplier_flipped_${destLoc}`]) {
fuseTimers.push({ id: `supplier_${destLoc}`, movePlanted: nm, fuseLength: 4, defused: false, loc: destLoc });
}

// Detonate fuses
let supplierFlipped = false;
fuseTimers = fuseTimers.map(f => {
if (f.defused || nm < f.movePlanted + f.fuseLength) return f;
if (f.id === 'witness' && !s.storyFlags?.witness_fired) {
if (!evtMsg) evtMsg = "🕵️ A witness from your deal talked. Police sketch circulating. Ramirez has a new lead.";
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence||0) + 3);
return { ...f, defused: true };
}
if (f.id === 'dea_surveil' && !s.storyFlags?.dea_surveil_fired) {
if (!evtMsg) evtMsg = "📡 A DEA wiretap caught your name on three calls this week. Federal heat is climbing.";
nh = Math.min(100, nh + 12);
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence||0) + 2);
effects.push({ type: 'SHAKE' });
return { ...f, defused: true };
}
if (f.id.startsWith('supplier_') && !s.storyFlags?.[`supplier_flipped_${f.loc}`]) {
const flippedLoc = f.loc;
if (!evtMsg) evtMsg = `🐀 Your regular connect in ${LOCS[flippedLoc].name} got flipped. Deals here carry a sting risk now.`;
npcState.ramirez.evidence = Math.min(20, (npcState.ramirez.evidence||0) + 2);
effects.push({ type: 'SHAKE' });
supplierFlipped = true;
return { ...f, defused: true };
}
return f;
});

// Defuse opportunities handled via encounter system (witness_defuse, dea_defuse encounter types)

// Achievements
const achs = [...s.achievements];
const nw = cash + bank + cleanCash - debt + s.inv.reduce((sum, q, i) => sum + q * np[i], 0);
if (nw > 100000 && !achs.includes("100k")) { achs.push("100k"); effects.push({ type: 'ACHIEVEMENT', id: "100k" }); }
if (cash >= 10000 && !achs.includes("10k")) { achs.push("10k"); effects.push({ type: 'ACHIEVEMENT', id: "10k" }); }

// ── PHASE TRANSITION (action-driven, not move-driven) ──
let currentEra = s.currentEra || 0;
let phaseShifted = false;
// Build temp state for threshold check (includes this move’s changes)
const _ts = { ...s, cash, debt, fedHeat: nh, cred: s.cred, totalProfit: s.totalProfit, totalBusts: s.totalBusts, npcState, totalDeals: (s.totalDeals||0) };
if (currentEra < PHASE_TRANSITIONS.length && PHASE_TRANSITIONS[currentEra](_ts)) {
// Minimum 5 moves in current era before transitioning (prevents instant skip)
if (nm - (s.eraStartMove||0) >= 5) {
currentEra++;
phaseShifted = true;
const newEra = ERAS[currentEra];
effects.push({ type: 'ERA_SHIFT', era: newEra.name });
evtMsg = `📺 BREAKING NEWS: ${newEra.name} — ${newEra.desc}`;
}
}

// ── ENDING CHECKS (action-driven) ──
// Bust: Ramirez has enough evidence
const bustThreshold = s.storyFlags?.protected_informant ? 22 : 18;
const evidence = npcState.ramirez?.evidence || 0;
if (evidence >= bustThreshold) effects.push({ type: 'GAME_OVER', ending: 'bust' });
else if (evidence >= 15 && s.storyFlags?.hoffman_cooperated && !s.storyFlags?.informant_complete) {
// Hoffman calls in the deal — you walk, but you burn everyone
effects.push({ type: 'GAME_OVER', ending: 'informant' });
}
// Dead: HP from any source
if (s.hp + (hpDelta||0) <= 0) effects.push({ type: 'GAME_OVER', ending: 'dead' });
// Dead: Colombiano hit — trust too low, he sends a crew
if (npcState.colombiano?.met && npcState.colombiano.trust <= -5 && npcState.colombiano.alive && !s.storyFlags?.colombiano_hit_survived) {
// One chance to survive: gun + high cred
if (s.gun && s.cred >= 50) {
if (!evtMsg) evtMsg = "🇨🇴 Colombiano’s crew came for you. You were armed. They weren’t expecting that. They won’t try again — but he’ll find another way.";
npcState.colombiano.trust = -3; // Reset slightly so it doesn’t instant-repeat
} else {
effects.push({ type: 'GAME_OVER', ending: 'dead' });
}
}
// Broke: nothing left, in debt, no income
const turfHasIncome = s.turf.some(t => t > 0);
if (cash <= 0 && bank <= 0 && cleanCash <= 0 && s.inv.reduce((a,b)=>a+b,0) === 0 && debt > 0 && !turfHasIncome) effects.push({ type: 'GAME_OVER', ending: 'broke' });

// Burned: informant exposed, forced to flee or die
if (s.storyFlags?.burned_must_flee) {
// Player chose to run — force escape with whatever they have
effects.push({ type: 'GAME_OVER', ending: 'escape' });
}
if (s.storyFlags?.informant_exposure && !s.storyFlags?.hoffman_protection && !s.storyFlags?.burned_must_flee
&& npcState.colombiano?.alive && npcState.colombiano.trust <= -5) {
// Colombiano found out and Hoffman isn’t protecting you — burned ending
effects.push({ type: 'GAME_OVER', ending: 'burned' });
}

// ── FACTION ECONOMY EFFECTS ──
// Medellín: cheaper buy prices (wholesale access)
if (s.storyFlags?.faction_medellin && !s.storyFlags?.medellin_collapsed) {
// 20% discount on cocaine (idx 5)
np[5] = Math.max(DRUGS[5].min, Math.floor(np[5] * 0.8));
}
// Medellín collapsed: cocaine prices spike
if (s.storyFlags?.medellin_collapsed) {
np[5] = Math.min(DRUGS[5].max, Math.floor(np[5] * 1.4));
}
// Cali franchise: better quality margins (higher sell prices on cocaine)
if (s.storyFlags?.cali_franchise) {
np[5] = Math.min(DRUGS[5].max, Math.floor(np[5] * 1.15));
}
// Lone wolf pressure: all prices +10% (suppliers nervous)
if (s.storyFlags?.lone_wolf_pressure) {
for (let i = 0; i < np.length; i++) np[i] = Math.floor(np[i] * 1.1);
}

const newRivals = s.rivals.map(v => ({ ...v, loc: Math.random() < .4 ? R(0, 5) : v.loc }));

if (!evtMsg && empNet > 0) evtMsg = `🏴 Empire: +${FM(empNet)}/move`;
if (pagerDeal && !evtMsg) evtMsg = pagerDeal.msg;

let activePager = s.pagerDeal;
if (activePager && nm > activePager.expiresMove) activePager = null;
if (pagerDeal) activePager = pagerDeal;

// Handle resolved deal inventory
let finalInv = s.inv;
if (activeDeal?.resolved) {
finalInv = activeDeal.newInv;
activeDeal = null; // Clear after resolution
}
// Handle stash raid
// Track fuse/supplier/failure flags
const newFlags = { ...(s.storyFlags||{}) };
if (fuseTimers.some(f => f.id === 'witness' && f.defused)) newFlags.witness_fired = true;
if (fuseTimers.some(f => f.id === 'dea_surveil' && f.defused)) newFlags.dea_surveil_fired = true;
fuseTimers.filter(f => f.id.startsWith('supplier_') && f.defused).forEach(f => { newFlags[`supplier_flipped_${f.loc}`] = true; });
if (usedFailureBonus) newFlags.got_failure_bonus = true;

return {
state: {
...s, loc: destLoc, move: nm, cash, debt, bank, cleanCash, prices: np, hist: newHist,
basePrices: newBase, momentum: newMom, fedHeat: nh, evtMsg, rivals: newRivals,
demand: newDemand, achievements: achs, npcState, hp: Math.max(0, s.hp + hpDelta),
inv: finalInv, storyFlags: newFlags,
pagerDeal: activePager, fuseChains,
activeDeal, fuseTimers: fuseTimers.filter(f => !f.defused), // Clean up detonated fuses
nwHist: [...s.nwHist, nw].slice(-30),
// Action-driven progression
currentEra, eraStartMove: phaseShifted ? nm : (s.eraStartMove||0),
peakNetWorth: Math.max(s.peakNetWorth||0, nw),
montage: phaseShifted ? [...s.montage, { move: nm, text: `Era shift: ${ERAS[currentEra].name}` }] : s.montage,
},
effects, turfWar, newspaper, randEnc, npcEvent, dealEvent,
};
}

function processBuyDrug(s, idx, amt) {
const price = s.prices[idx];
const cost = amt * price;
const usedSp = s.inv.reduce((a, b) => a + b, 0);
const freeSp = s.coatSp - usedSp;
const era = getEra(s);
if (cost > s.cash || amt > freeSp || amt <= 0) return { state: s, ok: false, effects: [{ type: 'SHAKE' }] };

const risk = calcTxRisk(amt, LOCS[s.loc].heat, era.copsMod * (1 + s.fedHeat / 200));
if (Math.random() < risk) {
const fees = Math.floor(calcLegalFees(cost, era.penaltyMod));
const totalLoss = cost + fees;
let cash = s.cash, debt = s.debt;
if (totalLoss > cash) { debt += totalLoss - cash; cash = 0; }
else cash -= totalLoss;
return {
state: { ...s, cash, debt, fedHeat: Math.min(100, s.fedHeat + 5), totalDeals: (s.totalDeals||0) + 1, totalBusts: (s.totalBusts||0) + 1,
montage: [...s.montage, { move: s.move, text: `Busted buying ${DRUGS[idx].name}! Fees: ${FM(fees)}` }] },
ok: false, busted: true, fees,
effects: [{ type: 'SFX', name: 'police' }, { type: 'SHAKE' }, { type: 'FLASH', color: C.pink }, { type: 'HITSTOP', dur: 60 }],
};
}

const newInv = s.inv.map((q, i) => i === idx ? q + amt : q);
const newAvgC = s.avgC.map((a, i) => {
if (i !== idx) return a;
const oldQ = s.inv[i], newQ = oldQ + amt;
return Math.floor((a * oldQ + finalPrice * amt) / newQ);
});

// Track supplier history for betrayal triggers
const newSupplierHist = { ...(s.supplierHistory||{}), [s.loc]: ((s.supplierHistory||{})[s.loc]||0) + 1 };
return {
state: { ...s, cash: s.cash - cost, inv: newInv, avgC: newAvgC, cred: Math.min(100, s.cred + 1), fedHeat: Math.min(100, s.fedHeat + Math.ceil(amt / 30)),
totalDeals: (s.totalDeals||0) + 1, dealsSinceLastEvent: (s.dealsSinceLastEvent||0) + 1, supplierHistory: newSupplierHist },
ok: true, cost,
effects: [{ type: 'SFX', name: 'buy' }, { type: 'SPAWN', text: `-${FM(cost)}`, color: C.pink }],
};
}

function processSellDrug(s, idx, amt) {
if (amt > s.inv[idx] || amt <= 0) return { state: s, ok: false, effects: [{ type: 'SHAKE' }] };
const era = getEra(s);
let price = s.prices[idx];

let pagerBonus = false;
if (s.pagerDeal && s.pagerDeal.drugIdx === idx && s.loc === s.pagerDeal.targetLoc && s.move <= s.pagerDeal.expiresMove) {
price = Math.round(price * (1 + s.pagerDeal.bonusPct / 100));
pagerBonus = true;
}

const risk = calcTxRisk(amt, LOCS[s.loc].heat, era.copsMod * (1 + s.fedHeat / 200)) * 0.6;
if (Math.random() < risk) {
const txVal = amt * price;
const fees = Math.floor(calcLegalFees(txVal, era.penaltyMod));
const newInv = s.inv.map((q, i) => i === idx ? q - amt : q);
let cash = s.cash, debt = s.debt;
if (fees > cash) { debt += fees - cash; cash = 0; } else cash -= fees;
return {
state: { ...s, cash, debt, inv: newInv, fedHeat: Math.min(100, s.fedHeat + 4), totalDeals: (s.totalDeals||0) + 1, totalBusts: (s.totalBusts||0) + 1,
montage: [...s.montage, { move: s.move, text: `Busted selling ${DRUGS[idx].name}!` }] },
ok: false, busted: true, fees,
effects: [{ type: 'SFX', name: 'police' }, { type: 'SHAKE' }, { type: 'FLASH', color: C.pink }, { type: 'HITSTOP', dur: 60 }],
};
}

const rev = amt * price;
const prof = rev - (s.avgC[idx] * amt);
const newInv = s.inv.map((q, i) => i === idx ? q - amt : q);
const newDemand = s.demand.map((v, i) => i === idx ? Math.max(.4, v - amt * .010) : v);
const achs = [...s.achievements];

const newStreak = prof > 0 ? s.streak + 1 : 0;
const bestStreak = Math.max(s.bestStreak, newStreak);
const biggestDeal = Math.max(s.biggestDeal, prof);

const effects = [];
const isMassive = prof > 100000;
const isHuge = prof > 50000;
const isBig = prof > 20000;

if (isMassive) effects.push({ type: 'SFX', name: 'sellMassive' });
else if (isHuge) effects.push({ type: 'SFX', name: 'sellHuge' });
else if (isBig) effects.push({ type: 'SFX', name: 'sellBig' });
else effects.push({ type: 'SFX', name: 'sell' });

if (isMassive) effects.push({ type: 'HITSTOP', dur: 120 });
else if (isHuge) effects.push({ type: 'HITSTOP', dur: 80 });
else if (isBig) effects.push({ type: 'HITSTOP', dur: 50 });

if (isMassive) effects.push({ type: 'FLASH', color: C.gold + '66' });
else if (isHuge) effects.push({ type: 'FLASH', color: C.gold + '44' });
else if (isBig) effects.push({ type: 'FLASH', color: C.green + '44' });
else if (prof > 0) effects.push({ type: 'FLASH', color: C.green + '22' });

effects.push({
type: 'SALE_BREAKDOWN',
drugName: DRUGS[idx].name, drugEmoji: DRUGS[idx].emoji,
qty: amt, buyPrice: s.avgC[idx], sellPrice: price,
revenue: rev, profit: prof, pagerBonus, streak: newStreak,
});

if (!achs.includes("first_sale")) { achs.push("first_sale"); effects.push({ type: 'ACHIEVEMENT', id: 'first_sale' }); }
if (prof > 20000 && !achs.includes("big_score")) { achs.push("big_score"); effects.push({ type: 'ACHIEVEMENT', id: 'big_score' }); }
if (prof > 100000 && !achs.includes("kingpin_deal")) { achs.push("kingpin_deal"); effects.push({ type: 'ACHIEVEMENT', id: 'kingpin_deal' }); }

if (newStreak >= 10) effects.push({ type: 'STREAK_CELEBRATION', streak: newStreak });
else if (newStreak >= 5) effects.push({ type: 'SPAWN', text: `🔥🔥 ${newStreak}x STREAK!`, color: C.gold, delay: 800, size: 14 });
else if (newStreak >= 3) effects.push({ type: 'SPAWN', text: `🔥 ${newStreak}x streak`, color: C.gold, delay: 600, size: 11 });

if (amt > 30) effects.push({ type: 'SPAWN', text: "Market saturated!", color: C.orange, y: 300, size: 9 });

let newPagerDeal = s.pagerDeal;
if (pagerBonus) {
newPagerDeal = null;
effects.push({ type: 'SPAWN', text: "📟 PAGER DEAL COMPLETE!", color: C.gold, delay: 1000, size: 12 });
}

// Big sales generate evidence — the streets talk
let sellNpcState = s.npcState;
if (rev > 10000 && s.npcState?.ramirez?.met) {
sellNpcState = { ...s.npcState, ramirez: { ...s.npcState.ramirez, evidence: Math.min(20, (s.npcState.ramirez.evidence||0) + 1) } };
}
return {
state: { ...s, cash: s.cash + rev, inv: newInv, demand: newDemand, cred: Math.min(100, s.cred + (prof > 0 ? 2 : 1)),
achievements: achs, streak: newStreak, bestStreak, biggestDeal, totalProfit: s.totalProfit + (prof > 0 ? prof : 0),
totalDeals: (s.totalDeals||0) + 1, dealsSinceLastEvent: (s.dealsSinceLastEvent||0) + 1, npcState: sellNpcState,
pagerDeal: newPagerDeal,
tradeHistory: [...(s.tradeHistory||[]), { drug:idx, qty:amt, loc:s.loc, move:s.move, prof }].slice(-30),
montage: isBig ? [...s.montage, { move: s.move, text: `Big score: ${FM(prof)} on ${DRUGS[idx].name}` }] : s.montage },
ok: true, rev, prof, streak: newStreak, effects,
};
}

function processPolice(s, action) {
const era = getEra(s);
let hp = s.hp, cash = s.cash, cred = s.cred, fedHeat = s.fedHeat, inv = s.inv, resultText = "";
const effects = [];

if (action === "run") {
if (Math.random() < .55) { resultText = "You escaped through the back alleys!"; inv = inv.map(q => Math.floor(q * .6)); }
else { const d = R(10, 25); hp = Math.max(0, hp - d); resultText = `Caught! -${d} HP. Lost half your stash.`; inv = inv.map(q => Math.floor(q * .5)); effects.push({ type: 'SHAKE' }); }
} else if (action === "fight") {
if (Math.random() < (s.gun ? .6 : .25)) { resultText = "Shots fired! They backed off."; cred = Math.min(100, cred + 5); effects.push({ type: 'SPAWN', text: '+5 CRED', color: C.gold }); }
else { const d = Math.floor(R(20, 45) * (1 / era.penaltyMod)); const f = Math.floor(cash * .25); hp = Math.max(0, hp - d); cash -= f; resultText = `Lost the fight! -${d} HP, ${FM(f)} in legal fees.`; effects.push({ type: 'SHAKE' }); }
} else {
const br = Math.floor(cash * .15) + R(500, 2000);
if (cash >= br) { cash -= br; resultText = `Paid ${FM(br)} to make it go away.`; }
else { resultText = "Can’t pay! Product confiscated."; inv = Array(DRUG_COUNT).fill(0); effects.push({ type: 'SHAKE' }); }
}

return {
state: { ...s, hp, cash, cred, inv, fedHeat: Math.max(0, fedHeat - 10),
montage: [...s.montage, { move: s.move, text: "Police encounter — " + action }] },
resultText, effects,
};
}

function processQTE(s, success) {
const effects = [];
if (success) {
// Perfect escape — keep all inventory, gain cred, reduce heat
effects.push({ type: 'SFX', name: 'qteWin' }, { type: 'FLASH', color: C.green + '44' },
{ type: 'SPAWN', text: 'CLEAN GETAWAY!', color: C.green, size: 18 });
const achs = [...s.achievements];
if (!achs.includes("qte_escape")) { achs.push("qte_escape"); effects.push({ type: 'ACHIEVEMENT', id: 'qte_escape' }); }
return {
state: { ...s, fedHeat: Math.max(0, s.fedHeat - 8), cred: Math.min(100, s.cred + 5), achievements: achs,
montage: [...s.montage, { move: s.move, text: "Outran the vice squad — clean getaway." }] },
resultText: "You weaved through alleys like a ghost. They never had a chance.",
effects,
};
} else {
// Failed QTE — worse than normal run (you tried and failed)
const hpLoss = R(15, 30);
const lostInv = s.inv.map(q => Math.floor(q * .4));
effects.push({ type: 'SHAKE' }, { type: 'FLASH', color: C.pink + '66' },
{ type: 'SPAWN', text: `CAUGHT! -${hpLoss} HP`, color: C.pink, size: 16 });
return {
state: { ...s, hp: Math.max(0, s.hp - hpLoss), inv: lostInv, fedHeat: Math.min(100, s.fedHeat + 3),
montage: [...s.montage, { move: s.move, text: "Tried to run. Didn't make it." }] },
resultText: `You stumbled. They caught you. -${hpLoss} HP, lost most of your stash.`,
effects,
};
}
}

function processBuyTurf(s, locIdx) {
const nextLv = s.turf[locIdx] + 1;
if (nextLv >= TURF_LEVELS.length) return { state: s, ok: false };
const cost = TURF_LEVELS[nextLv].cost;
if (s.cash < cost) return { state: s, ok: false, effects: [{ type: 'SHAKE' }] };

const newTurf = s.turf.map((lv, i) => i === locIdx ? nextLv : lv);
const achs = [...s.achievements];
const effects = [{ type: 'SFX', name: 'coin' }, { type: 'SPAWN', text: `🏴 ${TURF_LEVELS[nextLv].name}`, color: C.gold, size: 12 }];
if (nextLv === 1 && !achs.includes("first_turf")) { achs.push("first_turf"); effects.push({ type: 'ACHIEVEMENT', id: 'first_turf' }); }
if (newTurf.filter(lv => lv > 0).length >= 3 && !achs.includes("empire3")) { achs.push("empire3"); effects.push({ type: 'ACHIEVEMENT', id: 'empire3' }); }

return {
state: { ...s, cash: s.cash - cost, turf: newTurf, cred: Math.min(100, s.cred + 5), fedHeat: Math.min(100, s.fedHeat + 3), achievements: achs,
montage: nextLv === 1 ? [...s.montage, { move: s.move, text: `Claimed corner in ${LOCS[locIdx].name}` }] : s.montage },
ok: true, effects,
};
}

function processHireEnforcers(s, locIdx, count) {
const cost = count * ENFORCER_COST;
if (s.cash < cost || s.turf[locIdx] === 0) return { state: s, ok: false, effects: [{ type: 'SHAKE' }] };
return {
state: { ...s, cash: s.cash - cost, enforcers: s.enforcers.map((n, i) => i === locIdx ? Math.min(n + count, 10) : n) },
ok: true, effects: [{ type: 'SFX', name: 'coin' }, { type: 'SPAWN', text: `+${count} 👊`, color: C.orange }],
};
}

function processTurfWar(s, turfWar, action) {
if (!turfWar) return { state: s };
const { loc: wLoc, rivalPower } = turfWar;
const myPower = s.enforcers[wLoc] * 2 + (s.gun ? 3 : 0) + s.cred / 10;
let newTurf = [...s.turf], newEnf = [...s.enforcers], cash = s.cash, cred = s.cred;
const effects = [];
let montageText = "";

if (action === "fight") {
if (myPower > rivalPower || Math.random() < .4) {
effects.push({ type: 'SPAWN', text: '🏴 Defended!', color: C.gold, size: 12 });
cred = Math.min(100, cred + 8); montageText = `Won turf war in ${LOCS[wLoc].name}`;
} else {
newTurf[wLoc] = Math.max(0, newTurf[wLoc] - 1);
newEnf[wLoc] = Math.max(0, newEnf[wLoc] - R(1, 2));
effects.push({ type: 'SHAKE' }, { type: 'SPAWN', text: 'Lost ground!', color: C.pink, size: 12 });
montageText = `Lost turf war in ${LOCS[wLoc].name}`;
}
} else if (action === "negotiate") {
const bribe = R(2000, 6000);
if (cash >= bribe) { cash -= bribe; effects.push({ type: 'SPAWN', text: `-${FM(bribe)} bribe`, color: C.gold }); }
else { newTurf[wLoc] = Math.max(0, newTurf[wLoc] - 1); effects.push({ type: 'SHAKE' }); }
} else {
newTurf[wLoc] = 0; newEnf[wLoc] = 0;
}

return {
state: { ...s, turf: newTurf, enforcers: newEnf, cash, cred,
montage: montageText ? [...s.montage, { move: s.move, text: montageText }] : s.montage },
effects,
};
}

function processEncounter(s, enc, action) {
if (!enc) return { state: s };
let hp = s.hp, cash = s.cash, cred = s.cred, fedHeat = s.fedHeat, inv = [...s.inv];
const effects = [];
const usedSp = inv.reduce((a, b) => a + b, 0);
const freeSp = s.coatSp - usedSp;

if (enc.type === "find" && action === "take") {
const amt = Math.min(enc.amt, freeSp);
if (amt > 0) { inv[enc.drugIdx] += amt; effects.push({ type: 'SPAWN', text: `+${amt} ${DRUGS[enc.drugIdx].emoji}`, color: C.green }); }
} else if (enc.type === "mugger") {
if (action === "fight") {
if (Math.random() < (s.gun ? .65 : .35)) { cred = Math.min(100, cred + 3); effects.push({ type: 'SPAWN', text: 'Fought them off!', color: C.green }); }
else { hp = Math.max(0, hp - enc.hpLoss); cash = Math.max(0, cash - enc.cashLoss); effects.push({ type: 'SHAKE' }); }
} else {
cash = Math.max(0, cash - enc.cashLoss); effects.push({ type: 'SPAWN', text: `-${FM(enc.cashLoss)}`, color: C.pink });
}
} else if (enc.type === "bribe_offer" && action === "accept" && cash >= enc.cost) {
cash -= enc.cost; fedHeat = Math.max(0, fedHeat - enc.heatReduce); effects.push({ type: 'SPAWN', text: '-🔥', color: C.blue });
} else if (enc.type === "gamble" && action === "accept") {
const bet = Math.min(Math.floor(cash * .2), 2000);
if (Math.random() < .45) { cash += bet; effects.push({ type: 'SPAWN', text: `+${FM(bet)} 🎲`, color: C.gold }); }
else { cash = Math.max(0, cash - bet); effects.push({ type: 'SPAWN', text: `-${FM(bet)} 🎲`, color: C.pink }, { type: 'SHAKE' }); }
} else if (enc.type === "healer" && action === "accept" && cash >= enc.cost) {
cash -= enc.cost; hp = Math.min(100, hp + enc.hpGain); effects.push({ type: 'SPAWN', text: '+HP', color: C.green });
} else if (enc.type === "snitch_warning") {
fedHeat = Math.min(100, fedHeat + enc.heatGain);
} else if (enc.type === "witness_defuse" && action === "accept" && cash >= enc.cost) {
cash -= enc.cost;
const newTimers = (s.fuseTimers || []).map(f => f.id === enc.fuseId ? { ...f, defused: true } : f);
effects.push({ type: 'SPAWN', text: '🤫 Witness silenced', color: C.green, size: 13 });
return { state: { ...s, hp, cash, cred, fedHeat, inv, fuseTimers: newTimers }, effects };
} else if (enc.type === "dea_defuse" && action === "accept" && cash >= enc.cost) {
cash -= enc.cost;
const newTimers = (s.fuseTimers || []).map(f => f.id === enc.fuseId ? { ...f, defused: true } : f);
fedHeat = Math.max(0, fedHeat - 5);
effects.push({ type: 'SPAWN', text: '📋 Wiretap killed', color: C.green, size: 13 });
return { state: { ...s, hp, cash, cred, fedHeat, inv, fuseTimers: newTimers }, effects };
}

return { state: { ...s, hp, cash, cred, fedHeat, inv }, effects };
}

function processBank(s, action, amount) {
let cash = s.cash, bank = s.bank, debt = s.debt;
const achs = [...s.achievements];
const effects = [{ type: 'SFX', name: 'coin' }];

if (action === "deposit") { if (amount > cash || amount <= 0) return { state: s, ok: false }; cash -= amount; bank += amount; }
else if (action === "withdraw") { if (amount > bank || amount <= 0) return { state: s, ok: false }; cash += amount; bank -= amount; }
else if (action === "paydebt") {
const p = Math.min(amount, cash, debt);
if (p <= 0) return { state: s, ok: false };
cash -= p; debt -= p;
if (debt <= 0) { achs.push("debt_free"); effects.push({ type: 'ACHIEVEMENT', id: 'debt_free' }); }
}

return { state: { ...s, cash, bank, debt, achievements: achs }, ok: true, effects };
}

function processBuyLifestyle(s, effect) {
const item = LIFESTYLE.find(l => l.effect === effect);
if (!item || s.cash < item.cost || s.lifestyle.includes(effect)) return { state: s, ok: false };

const actualCost = item.cost;
if (s.cash < actualCost) return { state: s, ok: false };

let cred = s.cred;
if (item.credBoost) cred = Math.min(100, cred + item.credBoost);
const montageItems = { rolex: "Bought the Rolex — more time.", car: "Rolled out in the Countach.", mansion: "Bought the Scarface Mansion." };
return {
state: { ...s, cash: s.cash - actualCost, lifestyle: [...s.lifestyle, effect], cred,
montage: montageItems[effect] ? [...s.montage, { move: s.move, text: montageItems[effect] }] : s.montage },
ok: true, item,
effects: [{ type: 'SFX', name: 'coin' }, { type: 'SPAWN', text: `${item.icon} ${item.name}`, color: C.gold, size: 12 }],
};
}

function processBuySafeHouse(s, tier) {
const sh = SAFE_HOUSES[tier];
if (s.cash < sh.cost) return { state: s, ok: false };
return {
state: { ...s, cash: s.cash - sh.cost, safeHouses: s.safeHouses.map((v, i) => i === s.loc ? tier : v),
montage: [...s.montage, { move: s.move, text: `Bought ${sh.name} in ${LOCS[s.loc].name}` }] },
ok: true, effects: [{ type: 'SFX', name: 'coin' }],
};
}

function processBuyGun(s) {
if (s.cash < 4000 || s.gun) return { state: s, ok: false };
return { state: { ...s, cash: s.cash - 4000, gun: true }, ok: true, effects: [{ type: 'SFX', name: 'coin' }] };
}

// ═══════════════════════════════════════════════════════════════
// AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════
let _ctx = null;
const getCtx = () => { if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)(); return _ctx; };
const startAudio = () => { try { const c = getCtx(); if (c.state === "suspended") c.resume(); } catch (e) { } };
const playTone = (freq, dur, type = "sine", vol = .1) => { try { const c = getCtx(), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = vol; g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur); } catch (e) { } };
const playChord = (freqs, dur, type = "sine", vol = .04) => { freqs.forEach(f => playTone(f, dur, type, vol)); };

const SFX = {
buy: () => playChord([523, 659], .15, "triangle", .06),
sell: () => { playTone(659, .08, "triangle", .08); setTimeout(() => playTone(784, .08, "triangle", .08), 80); setTimeout(() => playTone(1047, .15, "triangle", .08), 160); },
sellBig: () => { playChord([523, 659, 784], .12, "triangle", .07); setTimeout(() => playChord([659, 784, 1047], .12, "triangle", .08), 100); setTimeout(() => playChord([784, 1047, 1319], .2, "triangle", .09), 200); },
sellHuge: () => { playChord([392, 523, 659], .15, "triangle", .08); setTimeout(() => playChord([523, 659, 784], .15, "triangle", .09), 120); setTimeout(() => playChord([659, 784, 1047], .15, "triangle", .10), 240); setTimeout(() => playChord([784, 1047, 1319], .25, "triangle", .11), 360); },
sellMassive: () => { playChord([261, 329, 392], .2, "sawtooth", .06); setTimeout(() => playChord([329, 392, 523], .2, "sawtooth", .07), 150); setTimeout(() => playChord([392, 523, 659], .2, "sawtooth", .08), 300); setTimeout(() => playChord([523, 659, 784], .25, "sawtooth", .09), 450); setTimeout(() => playChord([659, 784, 1047, 1319], .4, "triangle", .12), 600); },
police: () => { playTone(440, .2, "sawtooth", .06); setTimeout(() => playTone(659, .2, "sawtooth", .06), 200); },
travel: () => { try { const c = getCtx(), buf = c.createBuffer(1, c.sampleRate * .6, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; g.gain.value = .03; g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .6); s.connect(g); g.connect(c.destination); s.start(); } catch (e) { } },
achieve: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, .15, "sine", .08), i * 100)),
coin: () => playTone(1568, .08, "sine", .06),
pager: () => { playTone(1200, .05, "square", .04); setTimeout(() => playTone(1200, .05, "square", .04), 100); setTimeout(() => playTone(1400, .08, "square", .05), 200); },
streak: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, .12, "triangle", .06), i * 60)); },
qteHit: () => playTone(880, .06, "triangle", .08),
qteMiss: () => { playTone(220, .15, "sawtooth", .06); setTimeout(() => playTone(165, .2, "sawtooth", .05), 100); },
qteWin: () => { [784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, .12, "triangle", .08), i * 70)); },
qteTick: () => playTone(1200, .03, "square", .03),
upgrade: () => { playChord([392, 523, 659], .2, "sine", .08); setTimeout(() => playChord([523, 659, 784], .3, "sine", .10), 200); },
};

const SYNTH_SCALES = {
Paradise: { root: 130.81, scale: [0, 3, 7, 12, 15, 19, 24], bpm: 85, mood: "chill" },
"Anti-Drug Abuse Act": { root: 146.83, scale: [0, 2, 5, 7, 10, 12, 14], bpm: 100, mood: "tense" },
"Crack Epidemic": { root: 116.54, scale: [0, 3, 6, 7, 10, 12, 15], bpm: 120, mood: "dark" },
"War on Drugs": { root: 98.00, scale: [0, 1, 5, 7, 8, 12, 13], bpm: 135, mood: "aggressive" },
Endgame: { root: 82.41, scale: [0, 3, 5, 6, 7, 10, 12], bpm: 145, mood: "chaos" },
};

class SynthEngine {
constructor() { this.running = false; this.timer = null; this.step = 0; this.nodes = {}; }
start() { if (this.running) return; this.running = true; this.heat = 0; this.era = "Paradise"; this.night = false; this._loop(); }
stop() { this.running = false; if (this.timer) clearTimeout(this.timer); try { Object.values(this.nodes).forEach(n => { if (n && n.stop) n.stop(); }); } catch (e) { } this.nodes = {}; }
update(heat, eraName, isNight) { this.heat = heat || 0; this.era = eraName || "Paradise"; this.night = !!isNight; }
_loop() {
if (!this.running) return;
try {
const c = getCtx();
const sc = SYNTH_SCALES[this.era] || SYNTH_SCALES.Paradise;
const heatN = Math.min(this.heat / 100, 1);
const beatMs = Math.floor(60000 / (sc.bpm + heatN * 15));
const noteIdx = this.step % sc.scale.length;
const semitone = sc.scale[noteIdx];
const freq = sc.root * Math.pow(2, semitone / 12);

  const arpFreq = freq * 2;
  const arpVol = 0.025 + heatN * 0.015;
  const arpDur = beatMs / 1000 * 0.7;
  const oArp = c.createOscillator();
  const gArp = c.createGain();
  oArp.type = "triangle";
  oArp.frequency.value = arpFreq;
  gArp.gain.value = arpVol * (this.night ? 0.7 : 1);
  gArp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + arpDur);
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 800 + heatN * 3000 + (this.night ? -200 : 200);
  filt.Q.value = 2 + heatN * 4;
  oArp.connect(filt); filt.connect(gArp); gArp.connect(c.destination);
  oArp.start(); oArp.stop(c.currentTime + arpDur);

  if (this.step % 4 === 0) {
    const bassFreq = sc.root * (this.step % 8 === 0 ? 1 : 1.5);
    const oBass = c.createOscillator();
    const gBass = c.createGain();
    oBass.type = "sawtooth";
    oBass.frequency.value = bassFreq;
    gBass.gain.value = 0.02 + heatN * 0.01;
    gBass.gain.exponentialRampToValueAtTime(0.001, c.currentTime + beatMs / 1000 * 2);
    const bFilt = c.createBiquadFilter();
    bFilt.type = "lowpass";
    bFilt.frequency.value = 200 + heatN * 400;
    oBass.connect(bFilt); bFilt.connect(gBass); gBass.connect(c.destination);
    oBass.start(); oBass.stop(c.currentTime + beatMs / 1000 * 2);
  }

  if (this.step % 8 === 0) {
    [0, 7, 12].forEach(s => {
      const pFreq = sc.root * Math.pow(2, s / 12) * 0.5;
      const oPad = c.createOscillator();
      const gPad = c.createGain();
      oPad.type = "sine";
      oPad.frequency.value = pFreq + (Math.random() - .5) * 2;
      gPad.gain.value = this.night ? 0.015 : 0.01;
      gPad.gain.exponentialRampToValueAtTime(0.001, c.currentTime + beatMs / 1000 * 6);
      oPad.connect(gPad); gPad.connect(c.destination);
      oPad.start(); oPad.stop(c.currentTime + beatMs / 1000 * 6);
    });
  }

  if ((sc.mood === "aggressive" || sc.mood === "chaos") && this.step % 2 === 0) {
    const buf = c.createBuffer(1, c.sampleRate * 0.03, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.008));
    const src = c.createBufferSource();
    const gH = c.createGain();
    src.buffer = buf; gH.gain.value = 0.02 + heatN * 0.01;
    const hpf = c.createBiquadFilter(); hpf.type = "highpass"; hpf.frequency.value = 8000;
    src.connect(hpf); hpf.connect(gH); gH.connect(c.destination);
    src.start();
  }

  this.step++;
  this.timer = setTimeout(() => this._loop(), beatMs);
} catch (e) {
  // Fallback scheduling if audio fails
  const fbSc = SYNTH_SCALES[this.era] || SYNTH_SCALES.Paradise;
  const fbBeat = Math.floor(60000 / (fbSc.bpm + Math.min(this.heat / 100, 1) * 15));
  this.timer = setTimeout(() => this._loop(), fbBeat);
}

}
}

const synthEngine = new SynthEngine();

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const ft = "+name+,+name+,monospace";
const ftBody = "+name+,monospace";
const bx = { background: `linear-gradient(180deg, ${C.panel}ee, ${C.panel}cc)`, border: "1px solid " + C.border, borderRadius: 8, margin: "6px 12px", padding: "12px 14px", backdropFilter: "blur(8px)", boxShadow: `0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)` };
const bt = (c, bg = "transparent") => ({ fontFamily: ft, fontSize: 12, border: bg !== "transparent" ? ("2px solid " + c) : ("1px solid " + c + "66"), borderRadius: 6, padding: "9px 14px", cursor: "pointer", letterSpacing: ".5px", textTransform: "uppercase", fontWeight: "bold", background: bg !== "transparent" ? `linear-gradient(180deg, ${c}, ${c}cc)` : `linear-gradient(180deg, ${c}11, ${c}08)`, color: bg !== "transparent" ? "#fff" : c, boxShadow: bg !== "transparent" ? `0 0 8px ${c}88, 0 0 20px ${c}44, inset 0 1px 0 rgba(255,255,255,.2)` : `inset 0 0 12px ${c}11`, textShadow: bg !== "transparent" ? `0 0 10px ${c}, 0 0 20px ${c}66` : "none", transition: "all .15s" });
const inp = { fontFamily: ftBody, fontSize: 16, background: C.dark, color: C.green, border: "1px solid " + C.green + "66", borderRadius: 5, padding: "10px", width: "100%", outline: "none", textAlign: "center", letterSpacing: 1 };
const UNLOCK_MAP = { first_sale: { msg: "🏦 BANK UNLOCKED", sub: "Deposit cash, pay off the loan shark, buy gear", color: C.blue }, "10k": { msg: "🏠 SAFE HOUSES UNLOCKED", sub: "Buy property to stash product and cool your heat", color: C.green }, debt_free: { msg: "🏴 EMPIRE UNLOCKED", sub: "Claim territory, hire enforcers, build your kingdom", color: C.gold }, kingpin_deal: { msg: "👑 KINGPIN STATUS", sub: "$100K in a single deal. You’re a legend.", color: C.gold } };

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'); @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}50%{opacity:.8;transform:translateY(-30px) scale(1.1)}100%{opacity:0;transform:translateY(-70px) scale(.6)}} @keyframes floatSale{0%{opacity:1;transform:translateY(0) scale(.8)}20%{transform:translateY(-10px) scale(1.2)}100%{opacity:0;transform:translateY(-80px) scale(.7) rotate(5deg)}} @keyframes shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-8px) rotate(-.5deg)}30%{transform:translateX(6px) rotate(.5deg)}50%{transform:translateX(-5px)}70%{transform:translateX(4px)}90%{transform:translateX(-2px)}} @keyframes bigShake{0%,100%{transform:translate(0,0) rotate(0)}15%{transform:translate(-10px,2px) rotate(-1deg)}35%{transform:translate(8px,-2px) rotate(1deg)}55%{transform:translate(-6px,1px) rotate(-.5deg)}75%{transform:translate(4px,-1px) rotate(.3deg)}} @keyframes screenIn{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:scale(1)}} @keyframes screenSlideUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}} @keyframes screenFadeIn{0%{opacity:0}100%{opacity:1}} @keyframes travelFade{0%{opacity:0;transform:scale(1.05)}15%{opacity:1;transform:scale(1)}85%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.95)}} @keyframes dotPulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}} @keyframes neonFlicker{0%,100%{opacity:1}93%{opacity:.4}94%{opacity:1}96%{opacity:.6}97%{opacity:1}} @keyframes neonPulse{0%,100%{text-shadow:0 0 2px #fff,0 0 4px #fff,0 0 8px currentColor,0 0 16px currentColor,0 0 32px currentColor}50%{text-shadow:0 0 4px #fff,0 0 8px #fff,0 0 16px currentColor,0 0 32px currentColor,0 0 64px currentColor,0 0 90px currentColor}} @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}} @keyframes fadeIn{0%{opacity:0}100%{opacity:1}} @keyframes slideIn{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}} @keyframes slideDown{0%{transform:translateY(-100%);opacity:0}100%{transform:translateY(0);opacity:1}} @keyframes achSlide{0%{transform:translateY(-80px) scale(.9);opacity:0}15%{transform:translateY(0) scale(1);opacity:1}85%{opacity:1}100%{transform:translateY(-80px) scale(.9);opacity:0}} @keyframes cloudDrift{0%,100%{transform:translateX(-5%)}50%{transform:translateX(5%)}} @keyframes palmSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}} @keyframes bustedFlash{0%{background:rgba(255,45,123,.3)}100%{background:transparent}} @keyframes priceUp{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}} @keyframes rollUp{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}} @keyframes scalePunch{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}} @keyframes streakGlow{0%,100%{box-shadow:0 0 10px ${C.gold}44,0 0 20px ${C.gold}22,inset 0 0 20px ${C.gold}11}50%{box-shadow:0 0 20px ${C.gold}66,0 0 40px ${C.gold}44,inset 0 0 30px ${C.gold}22}} @keyframes rainbowBorder{0%{border-color:${C.pink}}14%{border-color:${C.orange}}28%{border-color:${C.gold}}42%{border-color:${C.green}}57%{border-color:${C.blue}}71%{border-color:${C.purple}}85%{border-color:${C.flamingo}}100%{border-color:${C.pink}}} @keyframes slideReveal{0%{width:0;opacity:0}100%{width:100%;opacity:1}} @keyframes numberPop{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}} @keyframes glowPulse{0%,100%{box-shadow:0 0 5px currentColor}50%{box-shadow:0 0 20px currentColor,0 0 30px currentColor}} @keyframes btnPress{0%{transform:scale(1)}40%{transform:scale(.93,.97)}100%{transform:scale(1)}} @keyframes easeOutBack{0%{transform:translateY(12px) scale(.95);opacity:0}70%{transform:translateY(-3px) scale(1.02);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}} @keyframes hudReveal{0%{transform:scale(0) translateY(8px);opacity:0}50%{transform:scale(1.15) translateY(-2px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}} @keyframes vhsScan{0%{top:-80px}100%{top:100vh}} @keyframes retroGrid{0%{transform:perspective(400px) rotateX(65deg) translateY(0)}100%{transform:perspective(400px) rotateX(65deg) translateY(50px)}} @keyframes ambientFloat{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.6}50%{transform:translateY(-40vh) translateX(15px);opacity:.4}90%{opacity:.1}100%{transform:translateY(-80vh) translateX(-10px);opacity:0}} @keyframes ambientDrift{0%{transform:translateX(-5px) translateY(0);opacity:0}15%{opacity:.5}85%{opacity:.3}100%{transform:translateX(8px) translateY(-60vh);opacity:0}} @keyframes heatCritical{0%,100%{box-shadow:0 0 4px ${C.pink}88}50%{box-shadow:0 0 12px ${C.pink}cc,0 0 24px ${C.pink}66}} @keyframes streakPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}} input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0} input[type=number]{-moz-appearance:textfield}*{box-sizing:border-box} button:active{animation:btnPress .2s ease-out!important}`;
// ═══════════════════════════════════════════════════════════════
// SMALL UI COMPONENTS
// ═══════════════════════════════════════════════════════════════
const WeatherOverlay = memo(function W({ heat }) {
if (heat < 20) return null;
return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
{heat >= 50 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "linear-gradient(180deg, rgba(0,0,0,.3) 0%, transparent 100%)", animation: "cloudDrift 8s ease-in-out infinite" }} />}
{heat >= 90 && <div style={{ position: "absolute", top: "-10%", left: "30%", width: 60, height: "120%", background: "linear-gradient(180deg, rgba(255,255,255,.08), transparent 20%, transparent 80%, rgba(255,255,255,.05))", transform: "rotate(15deg)", animation: "heliSweep 6s ease-in-out infinite" }} />}

  </div>;
});

// Ambient floating particles — dust motes, fireflies, or neon sparks
const AmbientMotes = memo(function AM({ locColor, isNight, count = 12 }) {
return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
{Array.from({ length: count }).map((_, i) => {
const size = 1 + (i % 3);
const x = ((i * 37 + 13) % 100);
const startY = 60 + ((i * 23) % 40);
const dur = 8 + (i % 5) * 3;
const delay = (i * 1.7) % 10;
const anim = i % 2 === 0 ? "ambientFloat" : "ambientDrift";
const color = isNight ? (i % 3 === 0 ? locColor : i % 3 === 1 ? "#fff" : "#ffcc44") : (i % 2 === 0 ? "#fff" : locColor);
return <div key={"am"+i} style={{ position: "absolute", left: `${x}%`, top: `${startY}%`, width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size * 2}px ${color}88, 0 0 ${size * 4}px ${color}44`, animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`, opacity: 0 }} />;
})}

  </div>;
});

function Particles({ items }) {
return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 900 }}>
{items.map(p => {
const isGain = p.text.startsWith("+");
const isLoss = p.text.startsWith("-");
const anim = isGain ? ("floatSale " + (p.dur || 1.5) + "s ease-out forwards") : isLoss ? ("floatUp " + (p.dur || 1.5) + "s ease-out forwards, neonFlicker 0.3s ease-in-out 2") : ("floatUp " + (p.dur || 1.5) + "s ease-out forwards");
const glowIntensity = (p.size || 14) > 20 ? "88" : "66";
return <div key={p.id} style={{ position: "absolute", left: p.x, top: p.y, fontSize: p.size || 14, color: p.color, fontFamily: ft, fontWeight: "bold", textShadow: `0 0 10px ${p.color}${glowIntensity}, 0 0 20px ${p.color}44, 0 0 30px ${p.color}22`, animation: anim, letterSpacing: 1 }}>{p.text}</div>;
})}

  </div>;
}

const Neon = memo(function N({ children, color = C.pink, size = 14, flicker = false, pulse = false, style = {} }) {
// 7-layer neon glow: white core → color bloom → deep ambient
const glow = `0 0 2px #fff, 0 0 4px #fff, 0 0 8px ${color}, 0 0 16px ${color}cc, 0 0 32px ${color}88, 0 0 48px ${color}44, 0 0 72px ${color}22`;
const anim = flicker ? "neonFlicker 3s ease-in-out infinite" : pulse ? "neonPulse 2.5s ease-in-out infinite" : "none";
return <span style={{ color: "#fff", fontSize: size, fontFamily: "+name+,sans-serif", fontWeight: 700, textShadow: glow, animation: anim, letterSpacing: 1, WebkitTextStrokeWidth: "0.5px", WebkitTextStrokeColor: color, ...style }}>{children}</span>;
});

// ── NPC PORTRAIT with CSS post-processing pipeline ──
const NpcPortrait = memo(function NP({ speaker, size = 140 }) {
const img = NPC_PORTRAITS[speaker];
const color = NPC_COLORS[speaker] || C.dim;
const glow = NPC_GLOW[speaker] || '255,255,255';
const emoji = NPC_EMOJI[speaker] || '📻';
const isCircle = size <= 180;
const dim = isCircle ? size : size;
// If no portrait image, render enhanced emoji fallback
if (!img) return <div style={{ width: dim, height: dim, borderRadius: isCircle ? "50%" : 8, background: `radial-gradient(ellipse at center, ${color}22, ${C.dark}ee)`, border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px rgba(${glow},0.3), 0 0 40px rgba(${glow},0.15), inset 0 0 30px rgba(${glow},0.08)`, position: "relative", overflow: "hidden" }}>
  <span style={{ fontSize: dim * 0.45, filter: `drop-shadow(0 0 12px rgba(${glow},0.6))`, animation: "fadeIn .5s ease-out" }}>{emoji}</span>
  {/* Scanline overlay */}
  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)", pointerEvents: "none", borderRadius: "inherit" }} />
  {/* Vignette */}
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", borderRadius: "inherit" }} />
</div>;
// Full portrait pipeline with image
return <div style={{ width: dim, height: dim, borderRadius: isCircle ? "50%" : 8, overflow: "hidden", position: "relative", boxShadow: `0 0 20px rgba(${glow},0.3), 0 0 40px rgba(${glow},0.15)` }}>
  <img src={img} alt={NPC_NAMES[speaker]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `contrast(1.25) saturate(1.4) brightness(1.05) drop-shadow(0 0 8px rgba(${glow},0.7)) drop-shadow(0 0 20px rgba(${glow},0.3))` }} />
  {/* Gradient overlay — screen-blend from below */}
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, ${color}33 80%, ${color}55 100%)`, mixBlendMode: "screen" }} />
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%)" }} />
  {/* VHS scanlines */}
  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)", pointerEvents: "none" }} />
  {/* Film grain */}
  <div style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay", backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+)", backgroundSize: "100px 100px" }} />
  {/* Vignette */}
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
</div>;
});

// ── SEGMENTED TRUST BAR ──
function TrustBar({ value, max = 10, color, size = "normal" }) {
const segments = 3;
const pct = Math.max(0, Math.min(1, (value + (max/2)) / max));
const filledSegments = Math.round(pct * segments);
const trustLabel = filledSegments <= 1 ? "Low" : filledSegments === 2 ? "Medium" : "High";
const trustColor = filledSegments <= 1 ? C.pink : filledSegments === 2 ? C.orange : C.green;
const segW = size === "small" ? 16 : 24;
const segH = size === "small" ? 4 : 6;
return <div style={{ display: "flex", alignItems: "center", gap: size === "small" ? 4 : 6 }}>
  <span style={{ fontFamily: ft, fontSize: size === "small" ? 8 : 9, color: C.dim, letterSpacing: 1 }}>TRUST</span>
  <div style={{ display: "flex", gap: 2 }}>{Array.from({length:segments}).map((_,i) => <div key={i} style={{ width: segW, height: segH, borderRadius: 2, background: i < filledSegments ? (color || trustColor) : C.border, boxShadow: i < filledSegments ? `0 0 4px ${color || trustColor}66` : "none", transition: "all .3s ease" }} />)}</div>
  <span style={{ fontFamily: ft, fontSize: size === "small" ? 8 : 9, color: trustColor }}>{trustLabel}</span>
</div>;
}

function TravelAnim({ from, to, onDone, fast }) {
useEffect(() => { const t = setTimeout(onDone, fast ? 400 : 1200); return () => clearTimeout(t); }, [onDone, fast]);
return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.midnight, zIndex: 800, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "travelFade " + (fast ? .4 : 1.2) + "s ease-in-out forwards" }}>
<div style={{ fontSize: 11, color: C.dim, letterSpacing: 4, marginBottom: 10, fontFamily: ft }}>{fast ? "CRUISING" : "TRAVELING"}</div>
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<span style={{ fontSize: 13, color: LOCS[from].color }}>{LOCS[from].icon} {LOCS[from].name}</span>
<span style={{ fontSize: 13, color: LOCS[to].color }}>{LOCS[to].icon} {LOCS[to].name}</span>
</div>

  </div>;
}

function AnimatedNumber({ value, duration = 800, color = C.green, size = 24, prefix = "$" }) {
const displayRef = useRef(0);
const scaleRef = useRef(1);
const glowRef = useRef(1);
const elRef = useRef(null);
const startVal = useRef(0);
const startTime = useRef(null);
const rafRef = useRef(null);

useEffect(() => {
startVal.current = displayRef.current;
startTime.current = Date.now();
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const animate = () => {
const elapsed = Date.now() - startTime.current;
const progress = Math.min(elapsed / duration, 1);
const easedProgress = easeOutExpo(progress);
const current = Math.round(startVal.current + (value - startVal.current) * easedProgress);
displayRef.current = current;

  // Threshold scale-ups: brief 20% scale bump when crossing thresholds
  let sc = 1, glow = 1;
  const remaining = 1 - progress;
  if (value >= 100000 && progress > 0.85) { sc = 1 + remaining * 0.5; glow = 2.5; }
  else if (value >= 50000 && progress > 0.8) { sc = 1 + remaining * 0.4; glow = 2.0; }
  else if (value >= 25000 && progress > 0.75) { sc = 1 + remaining * 0.35; glow = 1.7; }
  else if (value >= 10000 && progress > 0.7) { sc = 1 + remaining * 0.3; glow = 1.4; }
  scaleRef.current = sc;
  glowRef.current = glow;

  if (elRef.current) {
    elRef.current.textContent = prefix + Math.abs(current).toLocaleString();
    elRef.current.style.transform = `scale(${sc})`;
    const g = glow;
    elRef.current.style.textShadow = `0 0 ${Math.round(10*g)}px ${color}66, 0 0 ${Math.round(20*g)}px ${color}44, 0 0 ${Math.round(35*g)}px ${color}22`;
  }

  if (progress < 1) rafRef.current = requestAnimationFrame(animate);
  else if (elRef.current) { elRef.current.style.transform = 'scale(1)'; elRef.current.style.textShadow = `0 0 10px ${color}66, 0 0 20px ${color}44`; }
};
rafRef.current = requestAnimationFrame(animate);
return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };

}, [value, duration, color, prefix]);

return <span ref={elRef} style={{ color, fontSize: size, fontFamily: ft, fontWeight: 900, textShadow: `0 0 10px ${color}66, 0 0 20px ${color}44`, display: 'inline-block', transition: 'transform 0.1s ease-out' }}>{prefix}{Math.abs(value).toLocaleString()}</span>;
}

function SaleBreakdown({ data, onDone, onShake, onSpawn }) {
const [step, setStep] = useState(0);
const { drugName, drugEmoji, qty, buyPrice, sellPrice, revenue, profit, pagerBonus, streak } = data;

const profitColor = profit >= 0 ? C.green : C.pink;
const isBigDeal = profit > 20000;
const isHugeDeal = profit > 50000;
const isMassiveDeal = profit > 100000;

useEffect(() => {
const timings = [0, 400, 800, 1200, 1800, 2800];
const timers = timings.map((t, i) => setTimeout(() => {
setStep(i + 1);
// Shake on profit reveal (step 4 = index 3 in 0-based, but step state will be 4)
if (i === 3 && onShake && (isBigDeal || isHugeDeal || isMassiveDeal)) onShake();
// Particle burst on profit reveal
if (i === 3 && onSpawn) {
const burstCount = isMassiveDeal ? 6 : isHugeDeal ? 4 : isBigDeal ? 3 : 1;
for (let b = 0; b < burstCount; b++) {
setTimeout(() => onSpawn(`+${FM(Math.floor(profit / burstCount))}`, R(60, 300), R(200, 400), profit >= 0 ? (isBigDeal ? C.gold : C.green) : C.pink, { size: isMassiveDeal ? 16 : 12 }), b * 100);
}
}
}, t));
return () => timers.forEach(clearTimeout);
}, []);

return (
<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.92)", zIndex: 850, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => step >= 5 && onDone()}>
<div style={{ ...bx, maxWidth: 340, textAlign: "center", margin: 0, background: C.panel, border: `2px solid ${isMassiveDeal ? C.gold : isHugeDeal ? C.green : C.blue}44`, animation: "slideIn .4s ease-out", boxShadow: isMassiveDeal ? `0 0 40px ${C.gold}44, 0 0 80px ${C.gold}22` : isHugeDeal ? `0 0 30px ${C.green}33` : 'none' }}>
<div style={{ marginBottom: 16 }}>
<span style={{ fontSize: 40, display: "inline-block", animation: step >= 4 && isBigDeal ? "scalePunch 0.6s ease-out" : "none" }}>{drugEmoji}</span>
<Neon color={C.text} size={18} style={{ display: "block", marginTop: 4 }}>{drugName.toUpperCase()}</Neon>
</div>
{step >= 1 && <div style={{ animation: "slideReveal 0.3s ease-out", marginBottom: 8, padding: "8px 12px", background: C.dark + "88", borderRadius: 4, borderLeft: `3px solid ${C.pink}` }}>
<span style={{ color: C.dim, fontSize: 11 }}>BOUGHT </span>
<span style={{ color: C.text, fontSize: 13, fontWeight: "bold" }}>{qty}x</span>
<span style={{ color: C.dim, fontSize: 11 }}> @ </span>
<span style={{ color: C.pink, fontSize: 13, fontWeight: "bold" }}>{FM(buyPrice)}</span>
</div>}
{step >= 2 && <div style={{ animation: "slideReveal 0.3s ease-out", marginBottom: 8, padding: "8px 12px", background: C.dark + "88", borderRadius: 4, borderLeft: `3px solid ${C.green}` }}>
<span style={{ color: C.dim, fontSize: 11 }}>SOLD </span>
<span style={{ color: C.text, fontSize: 13, fontWeight: "bold" }}>{qty}x</span>
<span style={{ color: C.dim, fontSize: 11 }}> @ </span>
<span style={{ color: C.green, fontSize: 13, fontWeight: "bold" }}>{FM(sellPrice)}</span>
{pagerBonus && <span style={{ color: C.gold, fontSize: 10, marginLeft: 6 }}>📟 PAGER BONUS!</span>}
</div>}
{step >= 3 && <div style={{ animation: "numberPop 0.4s ease-out", marginBottom: 8, padding: "10px 12px", background: C.dark + "cc", borderRadius: 4, borderLeft: `3px solid ${C.blue}` }}>
<span style={{ color: C.dim, fontSize: 11 }}>REVENUE </span>
<AnimatedNumber value={revenue} duration={600} color={C.blue} size={16} />
</div>}
{step >= 4 && <div style={{ animation: isMassiveDeal ? "bigShake 0.5s ease-out, scalePunch 0.5s ease-out" : "scalePunch 0.5s ease-out", marginTop: 12, padding: "14px 12px", background: profitColor + "22", borderRadius: 6, border: `2px solid ${profitColor}66`, boxShadow: isBigDeal ? `0 0 20px ${profitColor}33` : 'none' }}>
<div style={{ color: C.dim, fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>{profit >= 0 ? "PROFIT" : "LOSS"}</div>
<AnimatedNumber value={Math.abs(profit)} duration={isMassiveDeal ? 1200 : 800} color={profitColor} size={isMassiveDeal ? 34 : isHugeDeal ? 30 : 28} prefix={profit >= 0 ? "+$" : "-$"} />
{streak >= 3 && <div style={{ marginTop: 6, color: C.gold, fontSize: 11, animation: "glowPulse 1.5s ease-in-out infinite" }}>🔥 {streak}x STREAK</div>}
</div>}
{step >= 5 && <div style={{ marginTop: 14, fontSize: 10, color: C.dim, animation: "pulse 2s infinite" }}>TAP TO CONTINUE</div>}
</div>
</div>
);
}

function Sparkline({ data, color, w = 60, h = 16 }) {
if (!data || data.length < 2) return null;
const mn = Math.min(...data), mx = Math.max(...data);
const range = mx - mn || 1;
const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * h}`).join(' ');
return <svg width={w} height={h} style={{ overflow: 'visible' }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CoachMark({ text, position = "bottom", onDismiss }) {
const posStyle = position === "top" ? { top: 70, left: "50%", transform: "translateX(-50%)" } :
position === "bottom" ? { bottom: 90, left: "50%", transform: "translateX(-50%)" } :
{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
return <div style={{ position: "fixed", ...posStyle, zIndex: 850, maxWidth: 280, padding: "10px 18px", background: C.panel + "ee", border: `1px solid ${C.blue}66`, borderRadius: 20, backdropFilter: "blur(8px)", animation: "easeOutBack .4s ease-out, glowPulse 2s ease-in-out infinite", cursor: "pointer", textAlign: "center" }} onClick={onDismiss}>
<div style={{ fontSize: 13, color: C.text, fontFamily: ft, letterSpacing: .5, lineHeight: 1.5 }}>{text}</div>
<div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: position === "bottom" ? `6px solid ${C.blue}66` : "none", borderBottom: position === "top" ? `6px solid ${C.blue}66` : "none", position: "absolute", left: "50%", marginLeft: -6, ...(position === "bottom" ? { bottom: -6 } : { top: -6 }) }} />

  </div>;
}

// Per-location skyline profiles: buildings [x%, width, height, windowRows, windowCols, hasSign]
const SKYLINE_PROFILES = [
// 0: Miami Beach — tall resort hotels, wide beachfront, many signs
{ buildings: [[2,10,60,5,3,true],[14,8,42,3,2,false],[23,14,72,6,4,true],[38,7,35,2,1,false],[47,12,55,4,3,true],[60,9,48,3,2,false],[70,11,65,5,3,true],[83,8,38,3,1,false],[93,6,30,2,1,false]], palms: [[5,58,-6],[18,50,4],[52,55,-3],[78,48,6],[96,52,-8]] },
// 1: Little Havana — low-rise, dense, colorful, fewer palms
{ buildings: [[1,8,35,3,2,false],[10,7,30,2,1,true],[18,9,40,3,2,false],[28,6,28,2,1,false],[35,10,38,3,2,true],[46,7,32,2,1,false],[54,8,36,3,2,false],[63,11,42,3,3,true],[75,7,30,2,1,false],[84,9,34,3,2,false],[94,6,28,2,1,false]], palms: [[22,42,5],[68,38,-4],[90,44,3]] },
// 2: Overtown — gritty, uneven heights, fewer signs, more palms
{ buildings: [[3,9,50,4,2,false],[13,6,32,2,1,false],[20,8,58,4,2,true],[30,7,28,2,1,false],[38,11,45,3,2,false],[50,6,38,3,1,false],[58,9,52,4,2,false],[68,7,30,2,1,false],[76,12,62,5,3,true],[90,7,35,2,1,false]], palms: [[8,50,-7],[35,45,5],[55,48,-3],[85,42,6],[97,46,-5]] },
// 3: Coral Gables — elegant, uniform medium height, many signs
{ buildings: [[4,10,48,4,3,true],[16,9,44,3,2,true],[27,11,50,4,3,true],[39,8,42,3,2,false],[49,12,52,4,3,true],[62,9,46,3,2,true],[73,10,48,4,3,false],[85,8,44,3,2,true]], palms: [[1,52,-5],[24,48,3],[46,50,-4],[70,46,5],[95,50,-6]] },
// 4: Fort Lauderdale — beachy, medium rise, spread out
{ buildings: [[5,11,55,4,3,true],[18,7,35,2,1,false],[26,9,48,3,2,false],[37,13,62,5,3,true],[52,7,32,2,1,false],[61,10,50,4,2,true],[73,8,40,3,2,false],[84,11,58,4,3,true]], palms: [[2,55,-8],[15,48,5],[42,52,-3],[58,45,7],[80,50,-5],[96,48,4]] },
// 5: The Keys — low, sparse, lots of water feel, many palms
{ buildings: [[8,7,28,2,1,false],[18,9,35,3,2,true],[30,6,24,2,1,false],[42,10,32,3,2,false],[56,7,28,2,1,true],[68,8,30,2,1,false],[80,6,26,2,1,false]], palms: [[2,52,-6],[14,48,4],[26,55,-3],[38,42,7],[50,50,-5],[64,46,5],[76,52,-4],[90,48,6],[98,44,-7]] },
];

function Skyline({ locIdx, isNight, heat }) {
const lc = LOCS[locIdx].color;
const profile = SKYLINE_PROFILES[locIdx] || SKYLINE_PROFILES[0];
const buildings = profile.buildings;
const palms = profile.palms;
const isWater = locIdx === 0 || locIdx === 4 || locIdx === 5; // Beach, FtL, Keys
const heatTint = heat > 60 ? `rgba(255,45,123,${heat/500})` : 'transparent';
const skyGrad = isNight
? `linear-gradient(180deg, #05060f 0%, #0d0e22 20%, #1a0e33 40%, ${lc}15 65%, ${lc}0a 80%, ${C.dark} 100%)`
: `linear-gradient(180deg, #1a0828 0%, #5b1845 15%, #a82855 30%, #d84a50 42%, #e87040 54%, #f0a030 68%, #e8c040 78%, ${C.dark} 100%)`;

return <div style={{ height: 140, position: "relative", overflow: "hidden", background: skyGrad }}>
{/* Heat tint overlay */}
{heat > 40 && <div style={{ position: "absolute", inset: 0, background: heatTint, zIndex: 4, pointerEvents: "none" }} />}
{/* Sun */}
{!isNight && <div style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, #fff 0%, #ffdd66 25%, #ff880088 55%, transparent 70%)", boxShadow: "0 0 50px #ff880066, 0 0 100px #ff660033, 0 0 150px #ff440011", opacity: .85 }}>
{/* Horizontal lines through sun — retrowave style */}
{[18, 26, 32, 37, 41, 44, 47].map((y, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: Math.max(1, 3 - i * .3), background: skyGrad, opacity: .6 + i * .05 }} />)}
</div>}
{/* Moon + stars */}
{isNight && <>
<div style={{ position: "absolute", right: "22%", top: 12, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #f0f0ff, #bbbbd0)", boxShadow: "0 0 20px rgba(200,200,255,.25), 0 0 50px rgba(180,180,255,.1)" }} />
{Array.from({ length: 40 }).map((_, i) => <div key={"s"+i} style={{ position: "absolute", left: `${(i * 31 + 7) % 100}%`, top: `${(i * 17 + 3) % 50}px`, width: i % 7 === 0 ? 2 : 1, height: i % 7 === 0 ? 2 : 1, background: "#fff", borderRadius: "50%", opacity: .15 + (i % 5) * .12, animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${(i * .4) % 3}s` }} />)}
</>}
{/* Atmospheric haze layer */}
<div style={{ position: "absolute", bottom: 20, left: 0, right: 0, height: 40, background: `linear-gradient(180deg, transparent, ${isNight ? lc + '08' : '#ff880011'})`, filter: "blur(8px)", zIndex: 1 }} />
{/* Horizon glow — brighter, wider */}
<div style={{ position: "absolute", bottom: 32, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent 5%, ${lc}55, ${lc}aa, ${lc}55, transparent 95%)`, boxShadow: `0 0 12px ${lc}44, 0 0 30px ${lc}22, 0 -6px 20px ${lc}11`, zIndex: 2 }} />
{/* Buildings */}
{buildings.map(([x, w, h, rows, cols, sign], bi) => {
const windowOn = isNight ? .55 : .12;
return <div key={"b"+bi} style={{ position: "absolute", left: `${x}%`, bottom: isWater ? 34 : 30, width: `${w}%`, height: h, zIndex: 3 }}>
<div style={{ width: "100%", height: "100%", background: isNight ? `linear-gradient(180deg, #0c0f1e, #060a14)` : `linear-gradient(180deg, #1a1030dd, #0e0818dd)`, borderRadius: "2px 2px 0 0", border: `1px solid ${lc}10`, borderBottom: "none", position: "relative", overflow: "hidden" }}>
{Array.from({ length: rows * cols }).map((_, wi) => {
const row = Math.floor(wi / cols), col = wi % cols;
const lit = ((bi * 7 + wi * 13 + row * 3) % 10) / 10 < windowOn;
const wColor = lit ? (((bi + wi) % 4 === 0) ? "#ffcc44" : ((bi + wi) % 4 === 1) ? lc : ((bi + wi) % 4 === 2) ? "#44ccff" : "#ff66aa") : "transparent";
return <div key={wi} style={{ position: "absolute", left: `${15 + col * (70 / cols)}%`, top: `${10 + row * (80 / rows)}%`, width: `${Math.max(3, 50 / cols)}%`, height: `${Math.min(8, 60 / rows)}%`, background: wColor, boxShadow: lit ? `0 0 4px ${wColor}, 0 0 8px ${wColor}55` : "none", borderRadius: 1 }} />;
})}
{/* Neon sign — glowing bar with subtle flicker */}
{sign && <div style={{ position: "absolute", top: 4, left: "20%", right: "20%", height: 4, background: lc, borderRadius: 2, boxShadow: `0 0 8px ${lc}, 0 0 16px ${lc}88, 0 0 28px ${lc}44`, animation: `neonFlicker ${3 + bi % 3}s ease-in-out infinite`, animationDelay: `${bi * .8}s` }} />}
</div>
{/* Art Deco roofline */}
<div style={{ position: "absolute", top: -4, left: "15%", right: "15%", height: 4, background: `linear-gradient(90deg, transparent, ${lc}33, transparent)`, borderRadius: "3px 3px 0 0" }} />
</div>;
})}
{/* Water reflections for coastal locations */}
{isWater && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 34, background: isNight ? `linear-gradient(180deg, ${lc}15, #030810)` : `linear-gradient(180deg, ${lc}12, #0a0818ee)`, overflow: "hidden", zIndex: 2 }}>
{/* Reflected light ripples */}
{buildings.filter(b => b[5]).map(([x, w], ri) => <div key={"wr"+ri} style={{ position: "absolute", left: `${x + w/2 - 2}%`, top: 4 + ri * 3, width: `${w * 1.5}%`, height: 2, background: `linear-gradient(90deg, transparent, ${lc}44, transparent)`, borderRadius: 4, animation: `pulse ${2 + ri}s ease-in-out infinite`, filter: "blur(1px)" }} />)}
{/* Shimmer lines */}
{[8, 16, 24].map((y, i) => <div key={"sh"+i} style={{ position: "absolute", left: `${10 + i * 25}%`, top: y, width: `${20 + i * 5}%`, height: 1, background: `linear-gradient(90deg, transparent, ${isNight ? lc + '22' : '#ffcc4422'}, transparent)`, animation: `pulse ${3 + i}s ease-in-out ${i * .5}s infinite` }} />)}
</div>}
{/* Ground line for non-water locations */}
{!isWater && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 30, background: `linear-gradient(180deg, transparent, ${C.dark})`, zIndex: 2 }} />}
{/* Palm tree silhouettes */}
{palms.map(([x, h, lean], pi) => <div key={"p"+pi} style={{ position: "absolute", left: `${x}%`, bottom: isWater ? 34 : 30, height: h, width: 3, background: isNight ? "#080a14" : "#1a0820cc", transformOrigin: "bottom center", transform: `rotate(${lean}deg)`, zIndex: 5 }}>
{[-40, -18, 8, 32, -55].map((angle, fi) => <div key={fi} style={{ position: "absolute", top: fi < -50 ? -2 : 0, left: "50%", width: fi < -50 ? 12 : 20, height: fi < -50 ? 3 : 5, background: isNight ? "#080a14" : "#1a0820cc", borderRadius: "50%", transformOrigin: "left center", transform: `rotate(${angle}deg) translateX(-2px)`, animation: `palmSway ${3.5 + pi % 2}s ease-in-out infinite`, animationDelay: `${pi * .2 + fi * .1}s` }} />)}
</div>)}
{/* Location name — positioned above water/ground */}
<div style={{ position: "absolute", bottom: isWater ? 36 : 8, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: isNight ? lc + 'cc' : "#ffddaa", letterSpacing: 3, fontFamily: ft, textShadow: `0 0 10px ${lc}88, 0 0 20px ${lc}44, 0 1px 3px rgba(0,0,0,.8)`, zIndex: 6, whiteSpace: "nowrap" }}>{LOCS[locIdx].name.toUpperCase()}</div>

  </div>;
}

const priceColor = (price, drugIdx) => {
const d = DRUGS[drugIdx];
if (price <= d.min * 1.3) return C.green;
if (price >= d.max * .75) return C.pink;
return C.text;
};
// ═══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Cocaine80s() {
// Game state
const [g, setG] = useState(() => createInitialState());
const [screen, setScreen] = useState("title");
const [tab, setTab] = useState("market");
const [selDrug, setSelDrug] = useState(null);
const [trMode, setTrMode] = useState(null);
const [trAmt, setTrAmt] = useState("");

// UI state
const [particles, setParticles] = useState([]);
const [shake, setShake] = useState(false);
const [flash, setFlash] = useState(null);
const [hitstop, setHitstop] = useState(false);
const [travelAnim, setTravelAnim] = useState(null);
const [achPopup, setAchPopup] = useState(null);
const [featureUnlock, setFeatureUnlock] = useState(null);
// Coach marks — contextual hints that dismiss on action
const [coachShown, setCoachShown] = useState({}); // { markId: true } — which have been shown
const [coachActive, setCoachActive] = useState(null); // currently visible mark ID
const coachTimerRef = useRef(null);
const [newspaper, setNewspaper] = useState(null);
const [randEnc, setRandEnc] = useState(null);
const [turfWar, setTurfWar] = useState(null);
const [npcEvent, setNpcEvent] = useState(null);
const [policeResultText, setPoliceResultText] = useState("");
const [dealEvt, setDealEvt] = useState(null); // Poker deal step events
const [saleBreakdown, setSaleBreakdown] = useState(null);
const [qte, setQte] = useState(null); // { seq, inputIdx, timeLeft, startTime, difficulty, failed }
const qteTimerRef = useRef(null);
const [streakBorder, setStreakBorder] = useState(false);
const [eraTransition, setEraTransition] = useState(null);
const [comicIdx, setComicIdx] = useState(0);
const [scores, setScores] = useState([]);
// Narrative dialogue state

const pid = useRef(0);
const unlockNotifs = useRef(new Set());

// Derived values
const era = useMemo(() => getEra(g), [g.currentEra]);
const isNight = g.move % 2 === 1;
const lc = LOCS[g.loc].color;
const dayNum = Math.floor(g.move / 2) + 1;
const usedSp = g.inv.reduce((a, b) => a + b, 0);
const nw = g.cash + g.bank + g.cleanCash - g.debt + g.inv.reduce((sum, q, i) => sum + q * g.prices[i], 0);
const ownedTurfCount = g.turf.filter(l => l > 0).length;

// Feature unlocks
const UL = useMemo(() => ({
bank: g.achievements.includes("first_sale"),
safe: g.achievements.includes("10k"),
empire: g.achievements.includes("debt_free") || ownedTurfCount > 0,
lifestyle: g.achievements.includes("debt_free") || g.cred >= 15,
club: isNight && g.achievements.includes("first_sale"),
}), [g.achievements, g.cred, isNight, ownedTurfCount]);

const visibleTabs = useMemo(() => {
const tabs = [["market", isNight ? "🌙 Night" : "☀️ Market"], ["bag", "🎒 Bag"], ["travel", "🚗 Travel"]];
if (UL.bank) tabs.push(["bank", "🏦 Bank"]);
if (UL.empire) tabs.push(["empire", "🏴 Empire"]);
if (UL.lifestyle || g.lifestyle.length > 0) tabs.push(["life", "💎 Life"]);
return tabs;
}, [isNight, UL, g.lifestyle.length]);

// Streak border effect — starts at 3, intensifies at 5 and 10
useEffect(() => { setStreakBorder(g.streak >= 3); }, [g.streak]);

// ── Progressive HUD ──
// Stats reveal after the player EXPERIENCES the mechanic (research: “earn → experience → see”)
// Derived from state — no extra fields needed. Ref tracks which have already animated.
const hudAnimated = useRef({});
const hudVisible = useMemo(() => ({
debt: g.move >= 4,                                         // After a few trades — debt exists but don’t overwhelm
hp: g.hp < 100 || g.totalBusts > 0,                       // After first damage
heat: g.fedHeat > 5,                                       // After heat actually builds — not at 1%
cred: g.cred >= 3,                                         // After a few successful sells
bank: UL.bank,
}), [g.move, g.hp, g.totalBusts, g.fedHeat, g.cred, UL.bank]);

// Track first-reveal for entrance animation
const getHudAnim = (key) => {
if (!hudVisible[key]) return null;
if (hudAnimated.current[key]) return null; // Already animated
hudAnimated.current[key] = true;
return "hudReveal .5s ease-out";
};

// Synth engine
useEffect(() => {
if (screen === "game" || screen === "qte") {
synthEngine.start();
synthEngine.update(g.fedHeat, era.name, isNight);
} else {
synthEngine.stop();
}
return () => synthEngine.stop();
}, [screen, g.fedHeat, era.name, isNight]);

// Effects processor
const doShake = () => { setShake(true); setTimeout(() => setShake(false), 400); };
const doFlash = c => { setFlash(c); setTimeout(() => setFlash(null), 300); };
const spawn = (text, x, y, color, opts = {}) => {
const id = pid.current++;
// Magnitude scaling: extract dollar value from text, scale size with log2
let size = opts.size || 14;
let finalColor = color;
const match = text.match(/[$+-]?([\d,]+)/);
if (match && !opts.size) {
const val = parseInt(match[1].replace(/,/g, ''));
if (val > 0) {
size = Math.min(32, Math.max(12, 12 + Math.floor(Math.log2(Math.max(1, val)) * 1.5)));
if (val >= 10000 && text.startsWith('+')) finalColor = C.gold;
}
}
setParticles(p => [...p, { id, text, x: x || R(80, 250), y: y || R(150, 300), color: finalColor, size, ...opts, size: opts.size || size }]);
setTimeout(() => setParticles(p => p.filter(v => v.id !== id)), (opts.dur || 1.5) * 1000);
};

const processEffects = (effects) => {
if (!effects) return;
effects.forEach(fx => {
if (fx.type === "SFX" && SFX[fx.name]) SFX[fx.name]();
else if (fx.type === "HITSTOP") { setHitstop(fx.dur || 80); setTimeout(() => setHitstop(false), fx.dur || 80); }
else if (fx.type === "SHAKE") doShake();
else if (fx.type === "FLASH") doFlash(fx.color);
else if (fx.type === "SPAWN") setTimeout(() => spawn(fx.text, null, fx.y, fx.color, { size: fx.size }), fx.delay || 0);
else if (fx.type === "SCREEN") setScreen(fx.screen);
else if (fx.type === "GAME_OVER") {
const finalNW = Math.max(0, nw);
setScores(p => [...p, finalNW].sort((a, b) => b - a).slice(0, 5));
setG(prev => ({ ...prev, ending: fx.ending || 'unknown' }));
// Broke ending gets a choice screen first
if (fx.ending === 'broke') setScreen("broke_choice");
else setScreen("gameover");
}
else if (fx.type === "SALE_BREAKDOWN") setSaleBreakdown(fx);
else if (fx.type === "STREAK_CELEBRATION") {
SFX.streak();
doShake();
doFlash(C.gold + '33');
for (let i = 0; i < Math.min(fx.streak, 15); i++) {
setTimeout(() => spawn(`🔥`, R(40, 320), R(100, 500), C.gold, { size: R(12, 20), dur: 2 }), i * 60);
}
}
else if (fx.type === "ERA_SHIFT") {
setEraTransition(fx.era);
doShake();
doFlash(C.pink + '44');
setTimeout(() => setEraTransition(null), 3500);
}
else if (fx.type === "ACHIEVEMENT") {
SFX.achieve();
setAchPopup(fx.id);
setTimeout(() => setAchPopup(null), 3000);
const fi = UNLOCK_MAP[fx.id];
if (fi && !unlockNotifs.current.has(fx.id)) {
unlockNotifs.current.add(fx.id);
setTimeout(() => { setFeatureUnlock(fi); SFX.achieve(); setTimeout(() => setFeatureUnlock(null), 4000); }, 3200);
}
}
});
};

// Coach mark helpers
const showCoach = useCallback((id) => {
if (coachShown[id] || coachActive) return;
const mark = COACH_MARKS.find(m => m.id === id);
if (!mark) return;
// Delay appearance by 1.5s so it doesn’t feel aggressive
setTimeout(() => {
setCoachActive(id);
setCoachShown(prev => ({ ...prev, [id]: true }));
// Auto-dismiss timed marks
if (mark.dismiss === "timer" && mark.timerMs) {
if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
coachTimerRef.current = setTimeout(() => setCoachActive(null), mark.timerMs);
}
}, 1500);
}, [coachShown, coachActive]);

const dismissCoach = useCallback((triggerId) => {
if (!coachActive) return;
const mark = COACH_MARKS.find(m => m.id === coachActive);
if (mark && (mark.dismiss === triggerId || triggerId === "force")) {
if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
setCoachActive(null);
}
}, [coachActive]);

// Action wrapper
const act = (fn, ...args) => {
const result = fn(g, ...args);
setG(result.state);
processEffects(result.effects);
return result;
};

// Start game
const startGame = () => {
startAudio();
const newState = createInitialState();
setG(newState);
setScreen("comic");
setTab("market");
setSelDrug(null);
setCoachShown({});
setCoachActive(null);
setQte(null);
if (qteTimerRef.current) clearInterval(qteTimerRef.current);
setTimeout(() => showCoach("tap_drug"), 500);
hudAnimated.current = {};
unlockNotifs.current.clear();
SFX.travel();
};

// End run - update meta
const endRun = () => {
const finalNW = Math.max(0, nw);
setScores(p => [...p, finalNW].sort((a, b) => b - a).slice(0, 5));
setScreen("title");
};

// Game actions
const doTravel = (dest) => { if (dest === g.loc) return; SFX.travel(); setTravelAnim({ from: g.loc, to: dest }); };
const completeTravelTo = (dest) => {
setTravelAnim(null);
const result = processTravel(g, dest);
setG(result.state);
processEffects(result.effects);
if (result.newspaper) setNewspaper(result.newspaper);
if (result.randEnc) { setRandEnc(result.randEnc); if (!coachShown["enc_intro"] && result.randEnc.type !== "witness_defuse" && result.randEnc.type !== "dea_defuse") showCoach("enc_intro"); if (!coachShown["defuse_hint"] && (result.randEnc.type === "witness_defuse" || result.randEnc.type === "dea_defuse")) showCoach("defuse_hint"); }
if (result.turfWar) setTurfWar(result.turfWar);
if (result.npcEvent) setNpcEvent(result.npcEvent);
if (result.dealEvent) { setDealEvt(result.dealEvent); if (!coachShown["deal_intro"]) showCoach("deal_intro"); }
// Coach marks: first travel + profitable item check
dismissCoach("force");
if (!coachShown["new_loc"]) showCoach("new_loc");
else if (!coachShown["sell_high"]) {
// Check if player has any item worth more here than they paid
const ns = result.state;
const hasProfitable = ns.inv.some((q, i) => q > 0 && ns.prices[i] > ns.avgC[i] * 1.15);
if (hasProfitable) showCoach("sell_high");
}
// Check for police encounter — show heat warning
const hadPolice = result.effects?.some(e => e.type === "SCREEN" && e.screen === "police");
if (hadPolice && !coachShown["heat_warn"]) showCoach("heat_warn");
if (hadPolice && coachShown["heat_warn"] && !coachShown["qte_hint"]) showCoach("qte_hint");
// Check broke
if (result.state.cash < 200 && result.state.inv.reduce((a,b) => a+b, 0) === 0 && !coachShown["loan_help"]) showCoach("loan_help");
// ── NARRATIVE: check storylets, store in game state directly ──
if (!result.effects?.some(e => e.type === "SCREEN" || e.type === "GAME_OVER") && !result.newspaper && !result.randEnc && !result.turfWar && !result.dealEvent) {
const _st = selectStorylet(result.state);
if (_st) {
if (_st.speaker === 'narrator') {
// Narrator → inline msg, auto-mark seen
setG(prev => {
const _ns = { ...prev, storySeen: { ...(prev.storySeen||{}), [_st.id]:true }, evtMsg: _st.lines[0]?.text || '', dealsSinceLastEvent: 0 };
return applyChoiceEffects(_ns, _st.choices?.[0]?.effects);
});
} else {
// NPC → store in g.activeStorylet so it renders as overlay
setG(prev => ({ ...prev, dealsSinceLastEvent: 0, activeStorylet: { id:_st.id, speaker:_st.speaker, portrait:_st.lines[0]?.portrait||_st.portrait, lines:_st.lines, choices:_st.choices, lineIdx:0, ready:false } }));
}
}
}
};

const doBuy = () => { if (selDrug === null || !trAmt) return; const r = act(processBuyDrug, selDrug, parseInt(trAmt) || 0); if (r.ok) { dismissCoach("first_buy"); if (!coachShown["travel_tip"]) showCoach("travel_tip"); } setTrAmt(""); setTrMode(null); };
const doSell = () => { if (selDrug === null || !trAmt) return; const r = act(processSellDrug, selDrug, parseInt(trAmt) || 0); if (r.ok) { dismissCoach("first_sell"); const _st2 = selectStorylet(r.state); if (_st2 && _st2.speaker !== 'narrator') setG(prev => ({ ...prev, activeStorylet: { id:_st2.id, speaker:_st2.speaker, portrait:_st2.lines[0]?.portrait||_st2.portrait, lines:_st2.lines, choices:_st2.choices, lineIdx:0, ready:false } })); } setTrAmt(""); setTrMode(null); };
const doPolice = (action) => { const r = act(processPolice, action); setPoliceResultText(r.resultText || ""); setScreen("policeResult"); setTimeout(() => setScreen("game"), 2500); };
const dismissPolice = () => setScreen("game");
// ── QTE HANDLERS ──
const startQTE = () => {
const diff = g.fedHeat >= 60 ? 2 : g.fedHeat >= 30 ? 1 : 0;
const seq = QTE_SEQUENCES[diff];
const timeMs = QTE_TIME_MS[diff];
const startTime = Date.now();
setQte({ seq, inputIdx: 0, timeLeft: timeMs, startTime, difficulty: diff, failed: false });
setScreen("qte");
SFX.police();
if (qteTimerRef.current) clearInterval(qteTimerRef.current);
qteTimerRef.current = setInterval(() => {
setQte(prev => {
if (!prev || prev.failed) return prev;
const elapsed = Date.now() - prev.startTime;
const remaining = Math.max(0, QTE_TIME_MS[prev.difficulty] - elapsed);
if (remaining <= 0) {
clearInterval(qteTimerRef.current);
// Time's up — fail
SFX.qteMiss();
return { ...prev, timeLeft: 0, failed: true };
}
if (remaining < 1500 && remaining % 400 < 60) SFX.qteTick();
return { ...prev, timeLeft: remaining };
});
}, 50);
};
const resolveQTE = useCallback((success) => {
clearInterval(qteTimerRef.current);
const r = processQTE(g, success);
setG(r.state);
processEffects(r.effects);
setPoliceResultText(r.resultText || "");
setTimeout(() => { setScreen("policeResult"); setTimeout(() => setScreen("game"), 2500); }, success ? 600 : 800);
}, [g]);
const handleQTEInput = useCallback((key) => {
setQte(prev => {
if (!prev || prev.failed || prev.resolved) return prev;
const expected = prev.seq[prev.inputIdx];
const pressed = QTE_KEYS[key];
if (!pressed) return prev;
if (pressed === expected) {
SFX.qteHit();
const nextIdx = prev.inputIdx + 1;
if (nextIdx >= prev.seq.length) {
resolveQTE(true);
return { ...prev, inputIdx: nextIdx, resolved: true };
}
return { ...prev, inputIdx: nextIdx };
} else {
SFX.qteMiss();
resolveQTE(false);
return { ...prev, failed: true, resolved: true };
}
});
}, [resolveQTE]);
useEffect(() => {
if (screen !== "qte") return;
const handler = (e) => { if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) { e.preventDefault(); handleQTEInput(e.key); } };
window.addEventListener("keydown", handler);
return () => window.removeEventListener("keydown", handler);
}, [screen, handleQTEInput]);
useEffect(() => () => { if (qteTimerRef.current) clearInterval(qteTimerRef.current); }, []);
// QTE timeout resolution
useEffect(() => {
if (qte && qte.timeLeft <= 0 && !qte.resolved) {
SFX.qteMiss();
setQte(prev => prev ? { ...prev, failed: true, resolved: true } : prev);
resolveQTE(false);
}
}, [qte?.timeLeft, qte?.resolved]);
// ── DIALOGUE HANDLERS ──
const advanceDialogue = () => {
if (!g.activeStorylet) return;
const d = g.activeStorylet;
const nextIdx = d.lineIdx + 1;
if (nextIdx >= d.lines.length) {
setG(prev => ({ ...prev, activeStorylet: { ...prev.activeStorylet, ready: true } }));
} else {
setG(prev => ({ ...prev, activeStorylet: { ...prev.activeStorylet, lineIdx: nextIdx, portrait: d.lines[nextIdx]?.portrait || prev.activeStorylet.portrait } }));
}
};
const makeDialogueChoice = (choiceIdx) => {
const d = g.activeStorylet;
if (!d) return;
const choice = d.choices[choiceIdx];
if (!choice) return;
const speakerColor = NPC_COLORS[d.speaker] || C.dim;
const speakerName = NPC_NAMES[d.speaker] || '';

// Apply effects and mark seen
setG(prev => {
  let ns = applyChoiceEffects(prev, choice.effects);
  ns.storySeen = { ...(ns.storySeen||{}), [d.id]: true };
  
  if (choice.reaction) {
    // Show reaction as final line before closing
    ns.activeStorylet = {
      ...prev.activeStorylet,
      lines: [...prev.activeStorylet.lines, { text: choice.reaction, portrait: prev.activeStorylet.portrait }],
      lineIdx: prev.activeStorylet.lines.length,
      choices: [{ text: "Continue", _dismiss: true }],
      ready: true,
    };
  } else {
    // No reaction — dismiss immediately
    ns.activeStorylet = null;
  }
  return ns;
});

// Trust feedback particles
if (d.speaker !== 'narrator' && !choice.reaction) {
  const trustKey = 'npc.' + d.speaker + '.trust';
  const td = choice.effects?.[trustKey];
  if (td && td > 0) spawn('+' + td + ' 🤝 ' + speakerName, null, null, speakerColor, { size: 13 });
  else if (td && td < 0) spawn(td + ' 💔 ' + speakerName, null, null, C.pink, { size: 13 });
}

};

const doBank = (action, amt) => act(processBank, action, amt);
const doBuyTurf = (loc) => act(processBuyTurf, loc);
const doHireEnforcers = (loc, n) => act(processHireEnforcers, loc, n);
const doTurfWar = (action) => { act(processTurfWar, turfWar, action); setTurfWar(null); };
const doEncounter = (action) => { act(processEncounter, randEnc, action); setRandEnc(null); };
const doBuyLife = (eff) => act(processBuyLifestyle, eff);
const doBuySafe = (tier) => act(processBuySafeHouse, tier);
const doBuyGun = () => act(processBuyGun);

// NPC choice handler
const doNpcChoice = (action) => {
if (!npcEvent) return;
const ns = { ...g.npcState };
if (npcEvent.npc === "ramirez") {
if (action === "bribe") { if (g.cash >= 5000) { setG(prev => ({ ...prev, cash: prev.cash - 5000, npcState: { ...ns, ramirez: { ...ns.ramirez, evidence: Math.max(0, ns.ramirez.evidence - 5), bribed: true } } })); spawn("-$5K bribe", null, null, C.gold); } }
else if (action === "snitch") { setG(prev => ({ ...prev, npcState: { ...ns, ramirez: { ...ns.ramirez, evidence: 0 }, colombiano: { ...ns.colombiano, alive: false, trust: -10 } }, fedHeat: Math.max(0, prev.fedHeat - 20), cred: Math.max(0, prev.cred - 15), montage: [...prev.montage, { move: prev.move, text: "Snitched on El Colombiano to Ramirez." }] })); }
else if (action === "refuse") { setG(prev => ({ ...prev, npcState: { ...ns, ramirez: { ...ns.ramirez, evidence: ns.ramirez.evidence + 3 } }, fedHeat: Math.min(100, prev.fedHeat + 10) })); }
} else if (npcEvent.npc === "colombiano") {
if (action === "ally") { setG(prev => ({ ...prev, npcState: { ...ns, colombiano: { ...ns.colombiano, trust: Math.min(10, ns.colombiano.trust + 3) } }, montage: [...prev.montage, { move: prev.move, text: "Allied with El Colombiano." }] })); }
else if (action === "reject") { setG(prev => ({ ...prev, npcState: { ...ns, colombiano: { ...ns.colombiano, trust: Math.max(-10, ns.colombiano.trust - 3) } } })); }
} else if (npcEvent.npc === "hoffman") {
if (action === "hoffman_deny") {
setG(prev => ({ ...prev, fedHeat: Math.min(100, prev.fedHeat + 8), npcState: { ...ns, ramirez: { ...ns.ramirez, evidence: (ns.ramirez.evidence||0) + 3 } }, storyFlags: { ...(prev.storyFlags||{}), hoffman_denied: true }, evtMsg: "Hoffman writes something in his notebook. He doesn’t believe you. Neither would you." }));
} else if (action === "hoffman_run") {
setG(prev => ({ ...prev, move: prev.move + 2, fedHeat: Math.min(100, prev.fedHeat + 5), storyFlags: { ...(prev.storyFlags||{}), hoffman_ran: true }, evtMsg: "You burn two days laying low. Hoffman’s card is under your door when you get back." }));
} else if (action === "hoffman_cooperate") {
setG(prev => ({ ...prev, fedHeat: Math.max(0, prev.fedHeat - 10), storyFlags: { ...(prev.storyFlags||{}), hoffman_cooperated: true, protected_informant: true }, evtMsg: "\"Smart.\" Hoffman pockets his notebook. \"You’re under my umbrella now.\"" }));
}
}
setNpcEvent(null);
};

// ── DEAL CHOICE HANDLER ──
const doDealChoice = (action) => {
if (!dealEvt) return;
if (action === 'deal_ack') { /* nothing to do, just dismiss */ }
else if (action === 'deal_altdrop') {
setG(prev => {
const cost = Math.floor((prev.activeDeal?.cost||0) * 0.12);
return { ...prev, cash: Math.max(0, prev.cash - cost), activeDeal: { ...prev.activeDeal, altDropPaid: true } };
});
}
else if (action === 'deal_norisk') { /* default — altDropPaid stays false */ }
else if (action === 'deal_sellhalf') {
setG(prev => {
const d = prev.activeDeal;
if (!d) return prev;
const halfValue = Math.floor(d.qty * prev.prices[d.drugIdx] * 0.5 * 0.8);
return { ...prev, cash: prev.cash + halfValue, activeDeal: { ...d, rivalBought: true } };
});
}
else if (action === 'deal_keepall') { /* default — rivalBought stays false */ }
setDealEvt(null);
};

const skyGrad = getSkyGradient(g.move, g.fedHeat);
const streakBorderStyle = streakBorder ? (
g.streak >= 10 ? { border: `3px solid ${C.gold}`, animation: "rainbowBorder 1.5s linear infinite, streakGlow 0.8s ease-in-out infinite" } :
g.streak >= 5 ? { border: `2px solid ${C.gold}88`, animation: "streakGlow 1.5s ease-in-out infinite", boxShadow: `0 0 15px ${C.gold}22` } :
{ border: `1px solid ${C.gold}44`, animation: "streakGlow 3s ease-in-out infinite" }
) : {};
const hitstopIntensity = hitstop ? (hitstop >= 100 ? 1.8 : hitstop >= 60 ? 1.5 : 1.3) : 1;
const ctr = { fontFamily: ftBody, background: skyGrad, color: C.text, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", overflow: "hidden", userSelect: "none", animation: shake ? "bigShake .5s ease" : "screenIn .4s ease-out", transition: hitstop ? "none" : "background 1s ease", filter: hitstop ? `brightness(${hitstopIntensity}) saturate(0.7)` : "none", transform: hitstop ? `scale(${1 + (hitstopIntensity - 1) * 0.02})` : "none", ...streakBorderStyle };
const vhsOverlay = <>
{/* CRT Scanlines */}
<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 998, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px)", backgroundSize: "100% 4px" }} />
{/* Moving scanline bar */}
<div style={{ position: "fixed", left: 0, right: 0, height: 80, pointerEvents: "none", zIndex: 998, background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,.03) 40%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.03) 60%, transparent 100%)", animation: "vhsScan 8s linear infinite" }} />
{/* Vignette */}
<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 997, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.4) 100%)" }} />
</>;
const achPopupEl = achPopup && <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 960, background: C.panel, border: "1px solid " + C.gold + "66", borderRadius: 10, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, animation: "achSlide 3s ease-in-out forwards", boxShadow: "0 0 20px " + C.gold + "22", fontFamily: ft }}><span style={{ fontSize: 20 }}>🏆</span><div><div style={{ fontSize: 10, color: C.gold, letterSpacing: 2 }}>ACHIEVEMENT</div><div style={{ fontSize: 13, color: C.text }}>{achPopup}</div></div></div>;
const featureUnlockEl = featureUnlock && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.88)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .4s ease-out" }} onClick={() => setFeatureUnlock(null)}><div style={{ textAlign: "center", animation: "slideIn .5s ease-out" }}><Neon color={featureUnlock.color} size={24}>{featureUnlock.msg}</Neon><div style={{ fontSize: 14, color: C.dim, lineHeight: 1.6, maxWidth: 300, margin: "12px auto 20px", fontFamily: ftBody }}>{featureUnlock.sub}</div><div style={{ fontSize: 11, color: C.dim, animation: "pulse 2s infinite", fontFamily: ft }}>TAP TO CONTINUE</div></div></div>;
// ═══════ COMIC INTRO ═══════
if (screen === "comic") {
const p = COMIC_PANELS[comicIdx];
const isLast = comicIdx === COMIC_PANELS.length - 1;
return <div style={{ ...ctr, background: p.bg, position: "relative" }} onClick={() => { startAudio(); if (!isLast) setComicIdx(i => i + 1); else {
setComicIdx(0); setScreen("game");
// Trigger Maria brick deal immediately
setG(prev => ({ ...prev, activeStorylet: {
id:'maria_brick', speaker:'maria', portrait:'amused',
lines: [
{ text:"You call the number on the matchbook. Maria Santos answers on the second ring.", portrait:'neutral' },
{ text:"\"César’s friend. I heard about Panama.\" A pause. The sound of ice in a glass.", portrait:'neutral' },
{ text:"\"Bring the brick to Little Havana. I know a buyer — a very impatient man with very good taste. We split the difference.\"", portrait:'amused' },
{ text:"\"60/40. You’re the 40.\" She hangs up before you can argue.", portrait:'knowing' },
],
choices: [
{ text:"🤝 Take the deal — $4,800", reaction:"Maria’s buyer shows up in a white Countach. He doesn’t get out. An envelope comes through the window. $4,800 cash. \"Pleasure doing business,\" Maria says on the phone. \"Now you have cash. Go make more. I’ll be in touch.\"", effects:{ 'npc.maria.trust':2, 'npc.maria.met':true, cashDelta:4800, flags:['maria_friendly_intro','brick_deal_done','maria_brick_debt'] } },
{ text:"💰 Push for 50/50 — $6,000", reaction:"Silence on the line. Then: \"Okay, cowboy. 50/50.\" She sounds amused. That’s either good or dangerous. $6,000 cash. You feel like you won something. You’ll find out later what it cost.", effects:{ 'npc.maria.trust':1, 'npc.maria.met':true, cashDelta:6000, flags:['maria_friendly_intro','brick_deal_done','maria_negotiated'] } },
],
lineIdx:0, ready:false
}}));
} }}>
<style>{CSS}</style>{vhsOverlay}
{/* Skip button */}
<div onClick={(e) => { e.stopPropagation(); setComicIdx(0); setScreen("game"); setG(prev => ({ ...prev, activeStorylet: { id:'maria_brick', speaker:'maria', portrait:'amused', lines:[{text:"\"César’s friend. Bring the brick to Little Havana. 60/40.\"",portrait:'amused'}], choices:[{text:"🤝 Deal — $4,800",reaction:"$4,800 cash. \"Go make more.\"",effects:{'npc.maria.trust':2,'npc.maria.met':true,cashDelta:4800,flags:['maria_friendly_intro','brick_deal_done','maria_brick_debt']}},{text:"💰 50/50 — $6,000",reaction:"\"Okay, cowboy.\" $6,000.",effects:{'npc.maria.trust':1,'npc.maria.met':true,cashDelta:6000,flags:['maria_friendly_intro','brick_deal_done','maria_negotiated']}}], lineIdx:0, ready:true }})); }} style={{ position:"absolute", top:16, right:16, zIndex:20, fontSize:11, color:C.dim+"aa", fontFamily:ft, letterSpacing:2, cursor:"pointer", padding:"6px 12px" }}>SKIP ›</div>
{/* Retrowave grid floor */}
<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "25vh", pointerEvents: "none", overflow: "hidden", opacity: .08 }}>
<div style={{ width: "200%", height: "200%", marginLeft: "-50%", backgroundImage: `linear-gradient(${C.pink}44 1px, transparent 1px), linear-gradient(90deg, ${C.pink}44 1px, transparent 1px)`, backgroundSize: "40px 40px", animation: "retroGrid 4s linear infinite", transformOrigin: "center top" }} />
</div>
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 30, textAlign: "center", position: "relative", zIndex: 2 }}>
<span style={{ fontSize: 70, marginBottom: 20, filter: "drop-shadow(0 0 20px rgba(255,45,123,.4))", animation: "fadeIn .8s ease-out" }}>{p.icon}</span>
<Neon color={C.pink} size={24} style={{ marginBottom: 12, lineHeight: 1.3, letterSpacing: 3, animation: "screenSlideUp .6s ease-out" }}>{p.text}</Neon>
<div style={{ width: 60, height: 2, background: `linear-gradient(90deg, transparent, ${C.pink}, transparent)`, marginBottom: 16, animation: "fadeIn 1s ease-out .3s both" }} />
<div style={{ fontSize: 14, color: C.text + 'dd', lineHeight: 1.8, maxWidth: 320, animation: "fadeIn 1s ease-out .5s both", fontFamily: ftBody }}>{p.sub}</div>
<div style={{ marginTop: 40, fontSize: 10, color: C.dim, animation: "pulse 2s infinite", fontFamily: ft, letterSpacing: 2 }}>{isLast ? "TAP TO BEGIN" : "TAP TO CONTINUE"}</div>
<div style={{ display: "flex", gap: 8, marginTop: 16 }}>{COMIC_PANELS.map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= comicIdx ? C.pink : C.border + '66', transition: "all .4s", boxShadow: i === comicIdx ? `0 0 8px ${C.pink}, 0 0 16px ${C.pink}66` : "none" }} />)}</div>
</div>
</div>;
}

// ═══════ TITLE ═══════
if (screen === "title") {
return <div style={{ ...ctr, background: "linear-gradient(180deg, #0a0818 0%, #1a0a30 12%, #4a1545 26%, #8b2050 38%, #cc4060 48%, #e87040 58%, #f0a030 68%, #e8c040 76%, #e8c040 80%, #0a0818 100%)", position: "relative" }}>
<style>{CSS}</style>{vhsOverlay}
{/* Retrowave sun with horizontal slice lines */}
<div style={{ position: "absolute", top: "22%", left: "50%", transform: "translateX(-50%)", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, #fff 0%, #ffdd66 20%, #ff8800 45%, #ff4488 70%, transparent 72%)", opacity: .7, zIndex: 1, pointerEvents: "none" }}>
{[40, 52, 62, 70, 77, 83, 88, 92, 95].map((y, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, height: Math.max(2, 6 - i), background: "linear-gradient(180deg, #0a0818, #1a0a30)" }} />)}
</div>
{/* Skyline silhouette */}
<div style={{ position: "absolute", top: "52%", left: 0, right: 0, height: 80, zIndex: 2, pointerEvents: "none" }}>
{/* Buildings as silhouettes */}
{[[5,12,55],[18,8,35],[27,15,70],[43,7,30],[52,12,50],[65,9,42],[75,14,65],[90,8,38]].map(([x,w,h],i) =>
<div key={i} style={{ position:"absolute", left:`${x}%`, bottom:0, width:`${w}%`, height:h, background:"#080412", borderRadius:"2px 2px 0 0" }}>
{/* Neon signs on some buildings */}
{i % 2 === 0 && <div style={{ position:"absolute", top:4, left:"15%", right:"15%", height:3, background: [C.pink, C.blue, C.flamingo, C.green][i%4], borderRadius:2, boxShadow:`0 0 8px ${[C.pink,C.blue,C.flamingo,C.green][i%4]}, 0 0 20px ${[C.pink,C.blue,C.flamingo,C.green][i%4]}66`, animation:`neonFlicker ${3+i%3}s ease-in-out infinite`, animationDelay:`${i*.6}s` }} />}
</div>
)}
{/* Palm silhouettes */}
{[[10,65,-8],[35,55,6],[60,60,-5],[85,50,7],[95,58,-10]].map(([x,h,lean],i) =>
<div key={"p"+i} style={{ position:"absolute", left:`${x}%`, bottom:0, height:h, width:3, background:"#080412", transformOrigin:"bottom center", transform:`rotate(${lean}deg)`, zIndex:3 }}>
{[-45,-20,8,35,-60].map((a,fi) => <div key={fi} style={{ position:"absolute", top:fi<-50?-2:0, left:"50%", width:fi<-50?14:22, height:fi<-50?3:5, background:"#080412", borderRadius:"50%", transformOrigin:"left center", transform:`rotate(${a}deg) translateX(-2px)`, animation:`palmSway ${3+i%2}s ease-in-out infinite`, animationDelay:`${i*.3}s` }} />)}
</div>
)}
{/* Horizon glow */}
<div style={{ position:"absolute", bottom:-1, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${C.pink}88, ${C.orange}aa, ${C.pink}88, transparent)`, boxShadow:`0 0 15px ${C.pink}44, 0 0 30px ${C.orange}22` }} />
</div>
{/* Water reflections area */}
<div style={{ position:"absolute", top:"57%", left:0, right:0, bottom:"22%", background:"linear-gradient(180deg, #0a0818cc 0%, #080412 30%)", zIndex:1, overflow:"hidden", pointerEvents:"none" }}>
{/* Shimmer reflections */}
{[0,1,2,3,4,5].map(i => <div key={i} style={{ position:"absolute", left:`${8+i*16}%`, top:`${8+i*6}%`, width:`${15+i*3}%`, height:1, background:`linear-gradient(90deg, transparent, ${[C.pink,C.blue,C.flamingo,C.orange,C.gold,C.green][i]}33, transparent)`, animation:`pulse ${2.5+i*.3}s ease-in-out ${i*.4}s infinite` }} />)}
</div>
{/* Retrowave perspective grid */}
<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", pointerEvents: "none", overflow: "hidden", opacity: .15, zIndex: 2 }}>
<div style={{ width: "200%", height: "200%", marginLeft: "-50%", backgroundImage: `linear-gradient(${C.pink}55 1px, transparent 1px), linear-gradient(90deg, ${C.pink}55 1px, transparent 1px)`, backgroundSize: "50px 50px", animation: "retroGrid 3s linear infinite", transformOrigin: "center top" }} />
</div>
{/* Content overlay */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, textAlign: "center", position: "relative", zIndex: 10 }}>
<div style={{ fontSize: 11, color: C.blue + 'cc', letterSpacing: 8, fontFamily: ft, marginBottom: 10, animation: "fadeIn 1s ease-out" }}>— MIAMI 1980 —</div>
<h1 style={{ fontSize: 42, fontWeight: 900, fontFamily: ft, color: "#fff", WebkitTextStrokeWidth: "1px", WebkitTextStrokeColor: C.pink, textShadow: `0 0 4px #fff, 0 0 10px ${C.pink}, 0 0 25px ${C.pink}, 0 0 50px ${C.pink}cc, 0 0 80px ${C.pink}88, 0 0 120px ${C.pink}44`, margin: "0 0 6px", letterSpacing: 5, animation: "neonFlicker 4s ease-in-out infinite, fadeIn 1.5s ease-out" }}>COCAINE 80s</h1>
<div style={{ fontSize: 10, color: C.dim + 'aa', letterSpacing: 4, fontFamily: ft, marginBottom: 50, animation: "fadeIn 2s ease-out" }}>A MIAMI VICE EMPIRE GAME</div>

    <button onClick={startGame} style={{ ...bt(C.pink, C.pink), fontSize: 16, padding: "16px 60px", boxShadow: `0 0 30px ${C.pink}66, 0 0 60px ${C.pink}33`, fontFamily: ft, letterSpacing: 4, animation: "fadeIn 2.5s ease-out, glowPulse 3s ease-in-out infinite", position: "relative", zIndex: 20 }}>▶ START GAME</button>
    
    {scores.length > 0 && <div style={{ marginTop: 35, animation: "fadeIn 3s ease-out" }}>
      <div style={{ fontSize: 9, color: C.dim + '88', letterSpacing: 3, fontFamily: ft, marginBottom: 6 }}>HIGH SCORES</div>
      {scores.slice(0, 3).map((s, i) => <div key={i} style={{ fontSize: 12, color: i === 0 ? C.gold : C.dim + '88', fontFamily: ft }}>{i + 1}. {FM(s)}</div>)}
    </div>}
  </div>
</div>;

}

// ═══════ POLICE ═══════
if (screen === "police") {
return <div style={{ ...ctr, animation: "bustedFlash .6s ease-out, bigShake .5s ease" }}><style>{CSS}</style>{vhsOverlay}{achPopupEl}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 30, textAlign: "center", animation: "screenSlideUp .4s ease-out" }}>
<div style={{ fontSize: 48, marginBottom: 10 }}>🚔</div>
<Neon color={C.pink} size={22}>BUSTED!</Neon>
<p style={{ fontSize: 13, color: C.dim, marginBottom: 6, marginTop: 8, lineHeight: 1.6 }}>Vice squad spotted you in {LOCS[g.loc].name}!<br /><span style={{ fontSize: 11 }}>Era: {era.name} · Penalty: {era.penaltyMod}x</span></p>
<div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 280, marginTop: 10 }}>
<button onClick={() => startQTE()} style={bt(C.green, C.green)}>⚡ ESCAPE (QTE)</button>
<button onClick={() => doPolice("run")} style={bt(C.blue)}>🏃 RUN</button>
<button onClick={() => doPolice("fight")} style={bt(C.pink)}>{g.gun ? "🔫" : "👊"} FIGHT</button>
<button onClick={() => doPolice("bribe")} disabled={g.cash < 500} style={{ ...bt(C.gold), opacity: g.cash >= 500 ? 1 : .4 }}>💰 BRIBE</button>
</div>
</div>
</div>;
}

// ═══════ POLICE RESULT ═══════
if (screen === "policeResult") {
return <div style={{ ...ctr }}><style>{CSS}</style>{vhsOverlay}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 30, textAlign: "center", animation: "screenSlideUp .4s ease-out" }}>
<div style={{ fontSize: 48, marginBottom: 10 }}>{g.hp > 0 ? "😮‍💨" : "💀"}</div>
<Neon color={g.hp > 0 ? C.blue : C.pink} size={18}>{g.hp > 0 ? "ESCAPED" : "CRITICAL"}</Neon>
{policeResultText && <div style={{ fontSize: 13, color: C.text, marginTop: 8, marginBottom: 8, lineHeight: 1.6, maxWidth: 300, fontFamily: ftBody }}>{policeResultText}</div>}
<div style={{ fontSize: 12, color: C.pink, marginBottom: 14 }}>HP: {g.hp}/100</div>
<button onClick={dismissPolice} style={bt(C.green, C.green)}>CONTINUE</button>
</div>
</div>;
}
// ═══════ QTE — Quick Time Event ═══════
if (screen === "qte" && qte) {
const pct = qte.timeLeft / QTE_TIME_MS[qte.difficulty] * 100;
const completed = qte.inputIdx >= qte.seq.length;
const timerColor = pct > 50 ? C.green : pct > 25 ? C.orange : C.pink;
return <div style={{ ...ctr, animation: "bustedFlash .6s ease-out" }}><style>{CSS}</style>{vhsOverlay}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 30, textAlign: "center" }}>
<div style={{ fontSize: 36, marginBottom: 8, animation: "shake .5s ease" }}>🚔</div>
<Neon color={C.blue} size={18} flicker>ESCAPE!</Neon>
<p style={{ fontSize: 11, color: C.dim, marginTop: 6, marginBottom: 16 }}>Hit the arrows in order to escape!</p>
{/* Timer bar */}
<div style={{ width: "100%", maxWidth: 280, height: 6, background: C.dark, borderRadius: 3, marginBottom: 20, overflow: "hidden", border: `1px solid ${timerColor}44` }}>
<div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}cc)`, borderRadius: 3, transition: "width .1s linear", boxShadow: `0 0 8px ${timerColor}66` }} />
</div>
{/* Arrow sequence */}
<div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
{qte.seq.map((arrow, i) => {
const done = i < qte.inputIdx;
const current = i === qte.inputIdx && !qte.failed && !completed;
const missed = qte.failed && i === qte.inputIdx;
const bg = done ? C.green : missed ? C.pink : current ? C.blue : C.dark;
const borderC = done ? C.green : missed ? C.pink : current ? C.blue : C.border;
const scale = current ? "scale(1.3)" : done ? "scale(1)" : "scale(.9)";
return <div key={i} style={{ width: 52, height: 52, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontFamily: ft, color: done ? "#fff" : missed ? "#fff" : current ? "#fff" : C.dim, background: `linear-gradient(180deg, ${bg}33, ${bg}11)`, border: `2px solid ${borderC}`, boxShadow: current ? `0 0 16px ${C.blue}66, 0 0 32px ${C.blue}33` : done ? `0 0 8px ${C.green}44` : "none", transform: scale, transition: "all .15s ease", animation: current ? "neonPulse 1.5s ease-in-out infinite" : done ? "scalePunch .3s ease-out" : "none" }}>{arrow}</div>;
})}
</div>
{/* Mobile touch buttons */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, width: 200, margin: "0 auto" }}>
<div />
<button onClick={() => handleQTEInput("ArrowUp")} disabled={qte.failed || completed} style={{ ...bt(C.blue), fontSize: 18, padding: "12px 0", opacity: qte.failed || completed ? .3 : 1 }}>↑</button>
<div />
<button onClick={() => handleQTEInput("ArrowLeft")} disabled={qte.failed || completed} style={{ ...bt(C.blue), fontSize: 18, padding: "12px 0", opacity: qte.failed || completed ? .3 : 1 }}>←</button>
<button onClick={() => handleQTEInput("ArrowDown")} disabled={qte.failed || completed} style={{ ...bt(C.blue), fontSize: 18, padding: "12px 0", opacity: qte.failed || completed ? .3 : 1 }}>↓</button>
<button onClick={() => handleQTEInput("ArrowRight")} disabled={qte.failed || completed} style={{ ...bt(C.blue), fontSize: 18, padding: "12px 0", opacity: qte.failed || completed ? .3 : 1 }}>→</button>
</div>
{qte.failed && <div style={{ marginTop: 16, animation: "fadeIn .3s ease-out" }}><Neon color={C.pink} size={14}>CAUGHT!</Neon></div>}
{completed && <div style={{ marginTop: 16, animation: "scalePunch .6s ease-out" }}><Neon color={C.green} size={14}>CLEAN GETAWAY!</Neon></div>}
</div>
</div>;
}
// ═══════ BROKE CHOICE — bus ticket or double down ═══════
if (screen === "broke_choice") {
const takeTheLoan = () => {
// Shark gives you one more chance — but the terms are worse
setG(prev => ({
...prev,
cash: 3000, debt: (prev.debt || 0) + 12000, hp: Math.min(100, prev.hp + 20),
ending: null,
montage: [...prev.montage, { move: prev.move, text: "Took Tiburón’s last-chance loan. $3K cash, $12K new debt. The interest is criminal." }],
}));
setScreen("game");
};
const takeTheBus = () => {
setG(prev => ({ ...prev, ending: 'broke', montage: [...prev.montage, { move: prev.move, text: "Bought a one-way Greyhound ticket. Destination: anywhere but here." }] }));
setScreen("gameover");
};

return <div style={{ ...ctr, background: "linear-gradient(180deg, #0a0818 0%, #151520 50%, #0a0818 100%)" }}>
  <style>{CSS}</style>{vhsOverlay}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
    <div style={{ fontSize: 50, marginBottom: 16, animation: "fadeIn .8s ease-out" }}>🚌</div>
    <Neon color={C.dim} size={22} style={{ marginBottom: 12 }}>YOU'RE BROKE</Neon>
    <div style={{ fontSize: 12, color: C.text + 'cc', lineHeight: 1.8, maxWidth: 320, marginBottom: 8, fontFamily: ftBody }}>
      No cash. No product. No way to earn. Tiburón's people are asking questions.
    </div>
    <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.8, maxWidth: 320, marginBottom: 24, fontFamily: ftBody }}>
      The Greyhound to Tallahassee leaves at 6 AM. Or you can beg the shark for one more chance. He'll say yes. The terms will be ugly.
    </div>
    
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
      <button onClick={takeTheLoan} style={{ ...bt(C.orange), padding: "14px 20px", fontSize: 12, letterSpacing: 1 }}>
        🦈 BEG TIBURÓN — $3K cash, $12K new debt
      </button>
      <button onClick={takeTheBus} style={{ ...bt(C.dim), padding: "14px 20px", fontSize: 12, letterSpacing: 1 }}>
        🚌 GET ON THE BUS — it's over
      </button>
    </div>
  </div>
</div>;

}

// ═══════ ESCAPE CHOICE ═══════
if (screen === "escape") {
const canKingpin = g.cred >= 80 && (g.totalProfit||0) >= 500000 && g.turf.filter(t=>t>0).length >= 4;
const mariaComes = g.npcState.maria.trust >= 4;
const colombianoPlane = g.npcState.colombiano.trust >= 3;
const hoffmanSafe = g.storyFlags?.hoffman_cooperated;

const doEscape = () => {
  setG(prev => ({ ...prev, ending: 'escape', montage: [...prev.montage, { move: prev.move, text: `Escaped to the Caymans with ${FM(prev.cleanCash)} clean.` }] }));
  const finalNW = Math.max(0, nw);
  setScores(p => [...p, finalNW].sort((a, b) => b - a).slice(0, 5));
  setScreen("gameover");
};
const doKingpin = () => {
  setG(prev => ({ ...prev, ending: 'kingpin', montage: [...prev.montage, { move: prev.move, text: `Crowned kingpin of Miami.` }] }));
  const finalNW = Math.max(0, nw);
  setScores(p => [...p, finalNW].sort((a, b) => b - a).slice(0, 5));
  setScreen("gameover");
};

return <div style={{ ...ctr, background: "linear-gradient(180deg, #0a0818 0%, #1a0a20 40%, #0d2a1a 100%)" }}>
  <style>{CSS}</style>{vhsOverlay}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
    <div style={{ fontSize: 50, marginBottom: 16, animation: "fadeIn .8s ease-out" }}>✈️</div>
    <Neon color={C.green} size={26} style={{ marginBottom: 12, letterSpacing: 3 }}>GET OUT?</Neon>
    <div style={{ fontSize: 12, color: C.text + 'cc', lineHeight: 1.8, maxWidth: 320, marginBottom: 20, fontFamily: ftBody }}>
      You have <span style={{ color: C.green, fontWeight: "bold" }}>{FM(g.cleanCash)}</span> in clean cash. That's enough for a one-way charter to Grand Cayman and a life nobody can trace.
      {mariaComes && <><br/><span style={{ color: C.flamingo }}>Maria says she's coming with you.</span></>}
      {colombianoPlane && <><br/><span style={{ color: C.orange }}>El Colombiano offered his private plane.</span></>}
      {hoffmanSafe && <><br/><span style={{ color: C.blue }}>Hoffman says he'll clear you at customs.</span></>}
    </div>
    <div style={{ fontSize: 10, color: C.dim, marginBottom: 24, fontFamily: ftBody, lineHeight: 1.6 }}>Every move you stay is a gamble. Ramirez has {g.npcState.ramirez.evidence || 0} evidence. Your heat is {g.fedHeat}.</div>
    
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
      <button onClick={doEscape} style={{ ...bt(C.green, C.green), padding: "14px 20px", fontSize: 13, letterSpacing: 2, boxShadow: `0 0 20px ${C.green}44` }}>
        ✈️ FLY TO THE CAYMANS
      </button>
      {canKingpin && <button onClick={doKingpin} style={{ ...bt(C.gold, C.gold), padding: "14px 20px", fontSize: 13, letterSpacing: 2, boxShadow: `0 0 20px ${C.gold}44` }}>
        👑 STAY — RULE MIAMI
      </button>}
      <button onClick={() => setScreen("game")} style={{ ...bt(C.dim), padding: "12px 20px", fontSize: 11, letterSpacing: 2 }}>
        ← KEEP PLAYING
      </button>
    </div>
  </div>
</div>;

}

// ═══════ GAME OVER ═══════
if (screen === "gameover") {
const finalNW = Math.max(0, nw);
const ending = g.ending || 'broke';
const narrative = generateNarrative(g);
const isHerald = ending === "bust" || ending === "dead" || ending === "burned";
const isWin = ending === "escape" || ending === "kingpin" || ending === "informant";

// Ending-specific config
const endingConfig = {
  escape:    { label: "ESCAPED", icon: "✈️", color: C.green, tagline: "You got out." },
  kingpin:   { label: "KINGPIN", icon: "👑", color: C.gold, tagline: "You own Miami." },
  informant: { label: "INFORMANT", icon: "🐀", color: C.blue, tagline: "Freedom has a price." },
  bust:      { label: "BUSTED", icon: "🚔", color: C.pink, tagline: "Ramirez wins." },
  dead:      { label: "R.I.P.", icon: "💀", color: C.pink, tagline: "Miami takes another." },
  broke:     { label: "BROKE", icon: "🚌", color: C.dim, tagline: "Back to the bus station." },
  burned:    { label: "BURNED", icon: "🔥", color: C.orange, tagline: "Both sides want you dead." },
};
const ec = endingConfig[ending] || endingConfig.broke;

return <div style={{ ...ctr, background: isWin ? `linear-gradient(180deg, ${C.midnight} 0%, #0a1a15 50%, ${C.dark} 100%)` : `linear-gradient(180deg, ${C.midnight} 0%, #1a0a15 50%, ${C.dark} 100%)`, animation: "screenFadeIn 1s ease-out" }}>
  <style>{CSS}</style>{vhsOverlay}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", animation: "screenSlideUp .6s ease-out" }}>
    <div style={{ fontSize: 50, marginBottom: 8, animation: "fadeIn .8s ease-out" }}>{ec.icon}</div>
    <div style={{ fontSize: 10, color: C.dim, letterSpacing: 4, fontFamily: ft, marginBottom: 4 }}>{ec.tagline}</div>
    <Neon color={ec.color} size={28} style={{ marginBottom: 12 }}>{ec.label}</Neon>

    {/* Narrative — Miami Herald or VHS voiceover */}
    <div style={{ width: "100%", maxWidth: 340, marginBottom: 16, padding: isHerald ? "16px 20px" : "14px 18px",
      background: isHerald ? "linear-gradient(180deg, #f8f4e8, #f0ecd8)" : C.dark + "dd",
      border: isHerald ? "2px solid #c8c0a8" : ("1px solid " + ec.color + "33"),
      borderRadius: isHerald ? 2 : 8,
      animation: "easeOutBack .6s ease-out .3s both",
      boxShadow: isHerald ? "0 4px 20px rgba(0,0,0,.5), inset 0 0 40px rgba(0,0,0,.05)" : ("0 0 25px " + ec.color + "11") }}>
      {isHerald && <>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Georgia',serif", letterSpacing: 1, marginBottom: 2 }}>The Miami Herald</div>
        <div style={{ width: "100%", height: 2, background: "#1a1a1a", marginBottom: 3 }} />
        <div style={{ width: "100%", height: 1, background: "#1a1a1a", marginBottom: 8 }} />
        <div style={{ fontSize: 8, color: "#888", fontFamily: "'Georgia',serif", marginBottom: 8 }}>METRO/DADE EDITION · DAY {Math.ceil(g.move/2)}</div>
      </>}
      {!isHerald && <div style={{ fontSize: 9, letterSpacing: 3, color: ec.color + '88', fontFamily: ft, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><span style={{ display: "inline-block", width: 0, height: 0, borderLeft: "6px solid " + ec.color, borderTop: "4px solid transparent", borderBottom: "4px solid transparent" }} /> PLAY</div>}
      <div style={{ fontSize: isHerald ? 13 : 12, color: isHerald ? "#1a1a1a" : C.text + 'ee', fontStyle: isHerald ? "normal" : "italic", lineHeight: 1.8, fontFamily: isHerald ? "'Georgia',serif" : ftBody }}>{narrative.text}</div>
    </div>

    {/* Montage Timeline */}
    {g.montage.length > 0 && <div style={{ width: "100%", maxWidth: 340, marginBottom: 12, padding: "8px 12px", background: C.dark + "77", borderRadius: 6, border: "1px solid " + C.border + "33" }}>
      <div style={{ fontSize: 8, color: C.dim, letterSpacing: 2, marginBottom: 6, fontFamily: ft }}>TIMELINE</div>
      {g.montage.slice(-6).map((m, i, arr) => { const mtColor = m.text.includes('turf') || m.text.includes('territory') ? C.pink : m.text.includes('deal') || m.text.includes('sold') || m.text.includes('profit') ? C.green : m.text.includes('NPC') || m.text.includes('Maria') || m.text.includes('Ramirez') || m.text.includes('Colombiano') ? C.purple : C.blue; return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 0, position: "relative", paddingLeft: 12, paddingBottom: i < arr.length - 1 ? 8 : 0 }}>
        <div style={{ position: "absolute", left: 3, top: 2, width: 6, height: 6, borderRadius: "50%", background: mtColor, boxShadow: `0 0 4px ${mtColor}66` }} />
        {i < arr.length - 1 && <div style={{ position: "absolute", left: 5, top: 10, width: 1, height: "calc(100% - 4px)", background: C.border }} />}
        <span style={{ fontSize: 8, color: ec.color, minWidth: 24, fontFamily: ft }}>D{Math.floor(m.move / 2) + 1}</span>
        <span style={{ fontSize: 9, color: C.dim + 'cc' }}>{m.text}</span>
      </div>; })}
    </div>}
    
    {/* Final Stats */}
    <div style={{ fontSize: 10, color: C.dim, lineHeight: 2.2, marginBottom: 10 }}>
      <div>Cash: <span style={{ color: C.green }}>{FM(g.cash)}</span> · Clean: <span style={{ color: C.green }}>{FM(g.cleanCash||0)}</span> · Debt: <span style={{ color: g.debt > 0 ? C.pink : C.green }}>{FM(g.debt)}</span></div>
      <div>Deals: <span style={{ color: C.blue }}>{g.totalDeals||0}</span> · Moves: <span style={{ color: C.blue }}>{g.move}</span> · Best streak: <span style={{ color: C.gold }}>{g.bestStreak}x</span></div>
      <div>Phase: <span style={{ color: era.color }}>{era.name}</span> · Evidence: <span style={{ color: (g.npcState.ramirez.evidence||0) >= 10 ? C.pink : C.dim }}>{g.npcState.ramirez.evidence||0}</span></div>
    </div>
    
    <div style={{ marginBottom: 20 }}><Neon color={ec.color} size={22}>NET WORTH: {FM(finalNW)}</Neon></div>
    
    <button onClick={endRun} style={{ ...bt(ec.color, ec.color), fontSize: 14, padding: "14px 48px", letterSpacing: 3, boxShadow: `0 0 20px ${ec.color}44` }}>PLAY AGAIN</button>
  </div>
</div>;

}

// ═══════ TUTORIAL ═══════
// Coach mark overlay
const activeCoachMark = coachActive ? COACH_MARKS.find(m => m.id === coachActive) : null;
const coachOverlay = activeCoachMark && <CoachMark
text={activeCoachMark.text}
position={["tap_drug","buy_low","sell_high"].includes(coachActive) ? "bottom" : ["heat_warn","loan_help"].includes(coachActive) ? "top" : "bottom"}
onDismiss={() => setCoachActive(null)}
/>;

// ── DIALOGUE OVERLAY ── reads from g.activeStorylet
const activeD = g.activeStorylet;
const npcColor = activeD ? (NPC_COLORS[activeD.speaker] || C.dim) : C.dim;
const dialogueOverlay = activeD && <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background: activeD.speaker==='maria' ? `linear-gradient(180deg, rgba(0,0,0,.92), ${C.flamingo}15)` : activeD.speaker==='ramirez' ? `linear-gradient(180deg, rgba(0,0,0,.92), ${C.blue}12)` : activeD.speaker==='colombiano' ? `linear-gradient(180deg, rgba(0,0,0,.92), ${C.orange}12)` : "rgba(0,0,0,.92)", zIndex:870, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:0, animation:"fadeIn .3s ease-out" }} onClick={!activeD.ready ? advanceDialogue : undefined}>
{/* NPC portrait area */}
<div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", gap:8 }}>
<div style={{ animation:"fadeIn .5s ease-out, easeOutBack .5s ease-out" }}>
  <NpcPortrait speaker={activeD.speaker} size={140} />
</div>
{/* Role + name + trust */}
{activeD.speaker !== 'narrator' && <div style={{ textAlign:"center", animation:"fadeIn .6s ease-out .2s both" }}>
  <div style={{ fontFamily:ft, fontSize:9, letterSpacing:3, color:npcColor, marginBottom:2 }}>{NPC_ROLES[activeD.speaker] || ''}</div>
  <div style={{ fontFamily:"’Georgia’,serif", fontSize:16, color:C.text, fontWeight:"bold", marginBottom:4 }}>{NPC_NAMES[activeD.speaker] || ''}</div>
  {activeD.speaker !== 'hoffman' && <div style={{ display:"flex", justifyContent:"center" }}><TrustBar value={activeD.speaker === 'ramirez' ? -(g.npcState.ramirez.evidence||0) : (g.npcState[activeD.speaker]?.trust || 0)} color={npcColor} size="small" /></div>}
</div>}
</div>
{/* Dialogue box */}
<div style={{ background:`linear-gradient(180deg, ${C.panel}ee, ${C.dark}ff)`, borderTop:`2px solid ${npcColor}44`, padding:"20px 24px 24px", minHeight:180 }}>
{/* Current line */}
<div style={{ fontSize:14, color:C.text, lineHeight:1.8, fontFamily:ftBody, marginBottom:16, animation:"fadeIn .3s ease-out", minHeight:60, fontStyle:"italic" }}>
“{activeD.lines[activeD.lineIdx]?.text || ''}”
</div>
{/* Choices or tap prompt */}
{activeD.ready ? (
<div style={{ display:"flex", flexDirection:"column", gap:8 }}>
{activeD.choices.map((ch, ci) => <button key={ci} onClick={(e) => { e.stopPropagation(); if (ch._dismiss) { setG(prev => ({ ...prev, activeStorylet: null })); } else { makeDialogueChoice(ci); } }} style={{ ...bt(npcColor), padding:"10px 16px", fontSize:12, textAlign:"left", fontFamily:ftBody, lineHeight:1.4, minHeight:48 }}>{ch.text}</button>)}
</div>
) : (
<div style={{ fontSize:10, color:C.dim, textAlign:"center", animation:"pulse 2s infinite", letterSpacing:2, fontFamily:ft }}>TAP TO CONTINUE</div>
)}
</div>

  </div>;

// Overlays
const newsOverlay = newspaper && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.88)", zIndex: 810, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setNewspaper(null)}>
<div style={{ maxWidth: 360, textAlign: "center", margin: 0, padding: "20px 24px", background: "linear-gradient(180deg, #f8f4e8, #f0ecd8)", border: "2px solid #c8c0a8", borderRadius: 2, animation: "slideIn .4s ease-out", color: "#1a1a1a", boxShadow: "0 6px 30px rgba(0,0,0,.6), inset 0 0 40px rgba(0,0,0,.05)" }}>
<div style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", fontFamily: "+name+,serif", letterSpacing: 1, marginBottom: 2 }}>The Miami Herald</div>
<div style={{ width: "100%", height: 2, background: "#1a1a1a", marginBottom: 3 }} />
<div style={{ width: "100%", height: 1, background: "#1a1a1a", marginBottom: 8 }} />
<div style={{ fontSize: 8, color: "#888", fontFamily: "+name+,serif", marginBottom: 10 }}>METRO/DADE EDITION · DAY {dayNum}</div>
<span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>{newspaper.icon}</span>
<div style={{ fontSize: 17, fontWeight: 900, color: "#111", lineHeight: 1.3, margin: "0 0 8px", fontFamily: "+name+,serif" }}>{newspaper.headline}</div>
<div style={{ width: 40, height: 1, background: "#ccc", margin: "0 auto 10px" }} />
<div style={{ fontSize: 12, color: "#333", lineHeight: 1.7, fontFamily: "+name+,serif" }}>{newspaper.sub}</div>
<div style={{ fontSize: 9, color: "#999", marginTop: 14, animation: "pulse 2s infinite" }}>TAP TO DISMISS</div>
</div>

  </div>;

const encOverlay = randEnc && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", zIndex: 820, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div style={{ ...bx, maxWidth: 340, textAlign: "center", margin: 0, background: C.panel, border: "1px solid " + C.orange + "44", animation: "slideIn .4s ease-out" }}>
<Neon color={C.orange} size={14} style={{ marginBottom: 8 }}>ENCOUNTER</Neon>
<div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>{randEnc.text}</div>
{randEnc.type === "find" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("take")} style={bt(C.green, C.green)}>TAKE ({randEnc.amt}x {DRUGS[randEnc.drugIdx].emoji})</button><button onClick={() => doEncounter("leave")} style={bt(C.dim)}>LEAVE</button></div>}
{randEnc.type === "mugger" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("fight")} style={bt(C.pink)}>{g.gun ? "🔫" : "👊"} FIGHT</button><button onClick={() => doEncounter("pay")} style={bt(C.gold)}>PAY {FM(randEnc.cashLoss)}</button></div>}
{randEnc.type === "bribe_offer" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("accept")} disabled={g.cash < randEnc.cost} style={{ ...bt(C.blue), opacity: g.cash >= randEnc.cost ? 1 : .3 }}>PAY {FM(randEnc.cost)}</button><button onClick={() => doEncounter("decline")} style={bt(C.dim)}>DECLINE</button></div>}
{randEnc.type === "gamble" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("accept")} style={bt(C.gold)}>🎲 BET</button><button onClick={() => doEncounter("decline")} style={bt(C.dim)}>WALK AWAY</button></div>}
{randEnc.type === "healer" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("accept")} disabled={g.cash < randEnc.cost || g.hp >= 100} style={{ ...bt(C.green), opacity: g.cash >= randEnc.cost && g.hp < 100 ? 1 : .3 }}>PAY {FM(randEnc.cost)} (+HP)</button><button onClick={() => doEncounter("decline")} style={bt(C.dim)}>NO THANKS</button></div>}
{randEnc.type === "witness_defuse" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("accept")} disabled={g.cash < randEnc.cost} style={{ ...bt(C.green), opacity: g.cash >= randEnc.cost ? 1 : .3 }}>PAY {FM(randEnc.cost)}</button><button onClick={() => doEncounter("decline")} style={bt(C.dim)}>TOO RISKY</button></div>}
{randEnc.type === "dea_defuse" && <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><button onClick={() => doEncounter("accept")} disabled={g.cash < randEnc.cost} style={{ ...bt(C.green), opacity: g.cash >= randEnc.cost ? 1 : .3 }}>PAY {FM(randEnc.cost)}</button><button onClick={() => doEncounter("decline")} style={bt(C.dim)}>LET IT PLAY OUT</button></div>}
{(randEnc.type === "tip" || randEnc.type === "snitch_warning") && <button onClick={() => doEncounter("ok")} style={bt(C.blue)}>GOT IT</button>}
</div>

  </div>;

const turfWarOverlay = turfWar && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.88)", zIndex: 830, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div style={{ ...bx, maxWidth: 340, textAlign: "center", margin: 0, background: C.panel, border: "1px solid " + C.pink + "44", animation: "slideIn .4s ease-out" }}>
<Neon color={C.pink} size={16} style={{ marginBottom: 6 }}>⚔️ TURF WAR</Neon>
<div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 12 }}><span style={{ color: C.orange }}>{turfWar.rivalName}</span> is moving on your territory in <span style={{ color: LOCS[turfWar.loc].color }}>{LOCS[turfWar.loc].name}</span>!</div>
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
<button onClick={() => doTurfWar("fight")} style={bt(C.pink, C.pink)}>👊 FIGHT</button>
<button onClick={() => doTurfWar("negotiate")} style={bt(C.gold)}>💰 NEGOTIATE</button>
<button onClick={() => doTurfWar("abandon")} style={bt(C.dim)}>🏳️ ABANDON</button>
</div>
</div>

  </div>;

const npcOverlay = npcEvent && (() => { const nc = NPC_COLORS[npcEvent.npc] || C.purple; const npcTrust = npcEvent.npc === 'ramirez' ? -(g.npcState.ramirez.evidence||0) : (g.npcState[npcEvent.npc]?.trust || 0); return <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg, rgba(0,0,0,.92), ${nc}10)`, zIndex: 835, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div style={{ ...bx, maxWidth: 360, textAlign: "center", margin: 0, background: C.panel, border: `1px solid ${nc}33`, animation: "slideIn .4s ease-out", padding: "16px 16px 20px" }}>
<NpcPortrait speaker={npcEvent.npc} size={120} />
<div style={{ fontFamily: ft, fontSize: 9, letterSpacing: 3, color: nc, marginTop: 10, marginBottom: 2 }}>{NPC_ROLES[npcEvent.npc] || ''}</div>
<div style={{ fontFamily: "'Georgia',serif", fontSize: 16, color: C.text, fontWeight: "bold", marginBottom: 6 }}>{NPC_NAMES[npcEvent.npc] || npcEvent.npc?.toUpperCase()}</div>
{npcEvent.npc !== 'hoffman' && npcEvent.npc !== 'narrator' && <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><TrustBar value={npcTrust} color={nc} /></div>}
<div style={{ background: C.dark + "cc", border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 14px", marginBottom: 14 }}><div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic", fontFamily: ftBody }}>”{npcEvent.text}”</div></div>
{npcEvent.opts ? <div style={{ display: "flex", gap: 8 }}>{npcEvent.opts.map((o, i) => <button key={i} onClick={() => doNpcChoice(o.action)} style={{ ...bt(i === 0 ? nc : C.dim, i === 0 ? nc : undefined), flex: 1, fontSize: 11 }}>{o.label}</button>)}</div> :
<button onClick={() => setNpcEvent(null)} style={{ ...bt(nc), width: "100%" }}>GOT IT</button>}
</div>
</div>; })();

// ── DEAL STEP OVERLAY ──
const dealOverlay = dealEvt && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.88)", zIndex: 836, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div style={{ ...bx, maxWidth: 340, textAlign: "center", margin: 0, background: C.panel, border: `1px solid ${C.gold}44`, animation: "slideIn .4s ease-out" }}>
<div style={{ fontSize: 36, marginBottom: 6 }}>🃏</div>
<Neon color={C.gold} size={13} style={{ marginBottom: 4 }}>THE DEAL — {dealEvt.step?.toUpperCase()}</Neon>
<div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 14, fontFamily: ftBody }}>{dealEvt.text}</div>
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{dealEvt.opts?.map((o, i) => <button key={i} onClick={() => doDealChoice(o.action)} style={bt(i === 0 ? C.gold : C.dim)}>{o.label}</button>)}</div>
</div>

  </div>;

// ═══════ MAIN GAME ═══════
return <div style={{ ...ctr, paddingBottom: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
<style>{CSS}</style>
{vhsOverlay}
{/* Synthwave perspective grid — bottom of screen */}
<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "30vh", pointerEvents: "none", zIndex: 0, overflow: "hidden", opacity: isNight ? .15 : .08 }}>
<div style={{ width: "200%", height: "200%", marginLeft: "-50%", backgroundImage: `linear-gradient(${lc}33 1px, transparent 1px), linear-gradient(90deg, ${lc}33 1px, transparent 1px)`, backgroundSize: "50px 50px", animation: "retroGrid 3s linear infinite", transformOrigin: "center top" }} />
</div>
{flash && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 997, background: flash, animation: "fadeIn .05s ease-out", opacity: 0.6, transition: "opacity .3s ease-out" }} />}
{hitstop && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 996, background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,${hitstop >= 100 ? 0.15 : 0.08}) 100%)` }} />}
<WeatherOverlay heat={g.fedHeat} />
<AmbientMotes locColor={LOCS[g.loc].color} isNight={isNight} />
<Particles items={particles} />
{travelAnim && <TravelAnim from={travelAnim.from} to={travelAnim.to} onDone={() => completeTravelTo(travelAnim.to)} fast={g.lifestyle.includes("car")} />}
{dialogueOverlay}{coachOverlay}{achPopupEl}{featureUnlockEl}{newsOverlay}{encOverlay}{turfWarOverlay}{npcOverlay}{dealOverlay}
{saleBreakdown && <SaleBreakdown data={saleBreakdown} onDone={() => setSaleBreakdown(null)} onShake={doShake} onSpawn={spawn} />}

{/* ── TOP: Header (non-scrolling) ── */}
<div style={{ flexShrink: 0, zIndex: 3 }}>
  <Skyline locIdx={g.loc} isNight={isNight} heat={g.fedHeat} />
  <div style={{ ...bx, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 8, marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
    <div>
      {(g.currentEra||0) > 0 && <div style={{ fontSize: 9, color: era.color || C.dim, letterSpacing: 2, fontFamily: ft, animation: "hudReveal .5s ease-out" }}>{era.name.toUpperCase()}</div>}
      <Neon color={lc} size={14}>{LOCS[g.loc].icon} {LOCS[g.loc].name}</Neon>
      <div style={{ fontSize: 9, color: C.dim + 'bb', fontStyle: "italic", marginTop: 2, maxWidth: 180, lineHeight: 1.3 }}>{(isNight ? LOCATION_VIBE[g.loc]?.night : LOCATION_VIBE[g.loc]?.day)?.[g.move % 3] || ''}</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontFamily: ft }}>{isNight ? "NIGHT" : "DAY"} {dayNum}</div>
      <div style={{ fontSize: 11, color: C.text, fontFamily: ft, fontWeight: "bold" }}>{FM(g.cash)} {g.streak >= 3 && <span style={{ color: C.gold, fontSize: 9, display: "inline-block", animation: "streakPop .4s ease-out", textShadow: `0 0 6px ${C.gold}66` }}>🔥{g.streak}x</span>}</div>
    </div>
  </div>

  {/* Stats Bar */}
  {(hudVisible.debt || hudVisible.hp || hudVisible.heat || hudVisible.cred || hudVisible.bank) && <div style={{ ...bx, display: "flex", justifyContent: "space-around", paddingTop: 6, paddingBottom: 6, marginTop: 4, gap: 2 }}>
    {hudVisible.hp && <div style={{ textAlign: "center", animation: getHudAnim("hp"), minWidth: 44 }}><div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>HP</div><div style={{ fontSize: 11, color: g.hp < 30 ? C.pink : C.green, fontFamily: ft, textShadow: `0 0 6px ${g.hp < 30 ? C.pink : C.green}66` }}>{g.hp}</div><div style={{ height: 2, marginTop: 3, borderRadius: 1, background: C.dark, overflow: "hidden" }}><div style={{ height: "100%", width: `${g.hp}%`, background: g.hp < 30 ? C.pink : C.green, boxShadow: `0 0 4px ${g.hp < 30 ? C.pink : C.green}88`, transition: "width .5s ease" }} /></div></div>}
    {hudVisible.debt && <div style={{ textAlign: "center", animation: getHudAnim("debt"), minWidth: 44 }}><div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>DEBT</div><div style={{ fontSize: 11, color: g.debt > 0 ? C.pink : C.green, fontFamily: ft, textShadow: `0 0 6px ${g.debt > 0 ? C.pink : C.green}66` }}>{FM(g.debt)}</div></div>}
    {hudVisible.bank && <div style={{ textAlign: "center", animation: getHudAnim("bank"), minWidth: 44 }}><div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>BANK</div><div style={{ fontSize: 11, color: C.blue, fontFamily: ft, textShadow: `0 0 6px ${C.blue}66` }}>{FM(g.bank)}</div></div>}
    {hudVisible.heat && <div style={{ textAlign: "center", animation: getHudAnim("heat"), minWidth: 44 }}><div style={{ fontSize: 8, color: g.fedHeat >= 90 ? C.pink : C.dim, letterSpacing: 1, animation: g.fedHeat >= 90 ? "pulse 1s infinite" : "none" }}>{g.fedHeat >= 90 ? "⚠ CRITICAL" : "HEAT"}</div><div style={{ fontSize: 11, color: g.fedHeat > 60 ? C.pink : g.fedHeat > 30 ? C.orange : C.green, fontFamily: ft, textShadow: `0 0 6px ${g.fedHeat > 60 ? C.pink : g.fedHeat > 30 ? C.orange : C.green}66` }}>{g.fedHeat}%</div><div style={{ height: 2, marginTop: 3, borderRadius: 1, background: C.dark, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(g.fedHeat, 100)}%`, background: `linear-gradient(90deg, ${C.green}, ${g.fedHeat > 30 ? C.orange : C.green}, ${g.fedHeat > 60 ? C.pink : C.orange})`, boxShadow: `0 0 4px ${g.fedHeat > 60 ? C.pink : C.orange}88`, transition: "width .5s ease", animation: g.fedHeat > 70 ? "heatCritical 1.5s ease-in-out infinite" : "none" }} /></div></div>}
    {hudVisible.cred && <div style={{ textAlign: "center", animation: getHudAnim("cred"), minWidth: 44 }}><div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>CRED</div><div style={{ fontSize: 11, color: C.gold, fontFamily: ft, textShadow: `0 0 6px ${C.gold}66` }}>{g.cred}</div></div>}
  </div>}

  {/* NPC Relationships — shows after meeting first NPC */}
  {(g.npcState.maria.met || g.npcState.ramirez.met || g.npcState.colombiano.met) && <div style={{ display:"flex", justifyContent:"center", gap:12, padding:"4px 12px", margin:"2px 12px 0", background:C.dark+"66", borderRadius:4 }}>
    {g.npcState.maria.met && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color: g.npcState.maria.trust > 2 ? C.flamingo : g.npcState.maria.trust < -1 ? C.pink : C.dim }}>
      <span style={{ fontSize:14 }}>💃</span>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        <span style={{ fontFamily:ft, letterSpacing:1 }}>{g.npcState.maria.trust > 4 ? '♥♥' : g.npcState.maria.trust > 1 ? '♥' : g.npcState.maria.trust < -2 ? '✗✗' : g.npcState.maria.trust < 0 ? '✗' : '—'}</span>
        <div style={{ width:24, height:2, borderRadius:1, background:C.dark, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.max(0, Math.min(100, (g.npcState.maria.trust + 5) * 10))}%`, background: g.npcState.maria.trust > 0 ? C.flamingo : g.npcState.maria.trust < 0 ? C.pink : C.dim, transition:"width .5s ease" }} /></div>
      </div>
    </div>}
    {g.npcState.ramirez.met && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color: g.npcState.ramirez.evidence > 5 ? C.pink : g.npcState.ramirez.evidence > 2 ? C.orange : C.dim }}>
      <span style={{ fontSize:14 }}>🕵️</span>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        <span style={{ fontFamily:ft, letterSpacing:1 }}>📋{g.npcState.ramirez.evidence||0}</span>
        <div style={{ width:24, height:2, borderRadius:1, background:C.dark, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(100, (g.npcState.ramirez.evidence||0) * 10)}%`, background: (g.npcState.ramirez.evidence||0) > 7 ? C.pink : (g.npcState.ramirez.evidence||0) > 4 ? C.orange : C.blue, transition:"width .5s ease", animation: (g.npcState.ramirez.evidence||0) > 7 ? "pulse 1.5s infinite" : "none" }} /></div>
      </div>
    </div>}
    {g.npcState.colombiano.met && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color: g.npcState.colombiano.trust > 2 ? C.orange : g.npcState.colombiano.trust < -1 ? C.pink : C.dim }}>
      <span style={{ fontSize:14 }}>🇨🇴</span>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        <span style={{ fontFamily:ft, letterSpacing:1 }}>{g.npcState.colombiano.trust > 3 ? '★★' : g.npcState.colombiano.trust > 0 ? '★' : g.npcState.colombiano.trust < -2 ? '✗✗' : g.npcState.colombiano.trust < 0 ? '✗' : '—'}</span>
        <div style={{ width:24, height:2, borderRadius:1, background:C.dark, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.max(0, Math.min(100, (g.npcState.colombiano.trust + 5) * 10))}%`, background: g.npcState.colombiano.trust > 0 ? C.orange : g.npcState.colombiano.trust < 0 ? C.pink : C.dim, transition:"width .5s ease" }} /></div>
      </div>
    </div>}
  </div>}

  {/* Event Message */}
  {g.evtMsg && (() => { const em = g.evtMsg; const evtBorderColor = em.includes('🚔') || em.includes('🕵️') || em.includes('📡') || em.includes('🐀') ? C.pink : em.includes('🦈') || em.includes('👮') ? C.orange : em.includes('📟') || em.includes('💃') ? C.gold : em.includes('📦') || em.includes('💰') ? C.green : C.blue; return <div style={{ margin: "4px 12px", padding: "8px 12px", background: C.dark + "cc", borderRadius: 6, border: "1px solid " + evtBorderColor + "33", borderLeft: "3px solid " + evtBorderColor, animation: "slideDown .3s ease-out" }}><div style={{ fontSize: 11, color: C.text, fontFamily: ftBody }}>{g.evtMsg}</div></div>; })()}

  {/* Pager Deal Banner */}
  {/* ── ACTIVE POKER DEAL tracker ── */}
  {g.activeDeal && (() => { const ds = g.activeDeal.step; const stepLabels = ["SETUP", "COMPLICATION", "TEMPTATION", "RESOLUTION"]; const riskColor = ds >= 3 ? C.pink : ds >= 2 ? C.orange : ds >= 1 ? C.gold : C.blue; return <div style={{ margin: "4px 12px", padding: "10px 12px", background: riskColor + "12", borderRadius: 6, border: `1px solid ${riskColor}44`, borderLeft: `3px solid ${riskColor}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 10, color: riskColor, fontFamily: ft, letterSpacing: 1 }}>🃏 DEAL IN PROGRESS</div>
        <div style={{ fontSize: 9, color: C.text, marginTop: 2 }}>{g.activeDeal.qty}x {DRUGS[g.activeDeal.drugIdx]?.emoji} {DRUGS[g.activeDeal.drugIdx]?.name} → {LOCS[g.activeDeal.targetLoc]?.name}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 9, color: riskColor, fontFamily: ft }}>{stepLabels[Math.min(ds, 3)]}</div>
        <div style={{ fontSize: 8, color: C.dim }}>{ds}/3</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 2, marginTop: 4 }}>{[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= ds ? riskColor : C.border + '44', transition: "background .3s ease" }} />)}</div>
  </div>; })()}

  {g.pagerDeal && g.move <= g.pagerDeal.expiresMove && (
    <div style={{ margin: "4px 12px", padding: "10px 12px", background: C.gold + "22", borderRadius: 6, border: "1px solid " + C.gold + "66", animation: "pulse 2s infinite" }}>
      <div style={{ fontSize: 11, color: C.gold, fontFamily: ft }}>📟 ACTIVE DEAL</div>
      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>{g.pagerDeal.qty}x {DRUGS[g.pagerDeal.drugIdx].emoji} {DRUGS[g.pagerDeal.drugIdx].name} → {LOCS[g.pagerDeal.targetLoc].name} for +{g.pagerDeal.bonusPct}%</div>
      <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>Expires in {g.pagerDeal.expiresMove - g.move} moves</div>
    </div>
  )}

  {/* ── GET OUT — escape button when clean cash qualifies ── */}
  {(g.cleanCash||0) >= 50000 && <div onClick={() => setScreen("escape")} style={{ margin: "4px 12px", padding: "12px 14px", background: `linear-gradient(135deg, ${C.green}33, ${C.gold}22)`, borderRadius: 8, border: `1px solid ${C.green}66`, cursor: "pointer", animation: "pulse 2.5s infinite", boxShadow: `0 0 20px ${C.green}22` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 12, color: C.green, fontFamily: ft, letterSpacing: 2 }}>✈️ GET OUT</div>
        <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>Clean cash: {FM(g.cleanCash)} — enough to disappear</div>
      </div>
      <div style={{ fontSize: 20, filter: `drop-shadow(0 0 8px ${C.green}66)` }}>→</div>
    </div>
  </div>}
</div>

{/* Era Transition Overlay */}
{eraTransition && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.92)", zIndex: 860, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease-out" }} onClick={() => setEraTransition(null)}>
  <div style={{ textAlign: "center", animation: "screenSlideUp .5s ease-out", maxWidth: 320, padding: 30 }}>
    <div style={{ fontSize: 9, letterSpacing: 4, color: C.pink, fontFamily: ft, marginBottom: 12 }}>📺 BREAKING NEWS</div>
    <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${C.pink}, transparent)`, marginBottom: 16 }} />
    <Neon color={C.pink} size={22} style={{ lineHeight: 1.4 }}>{eraTransition.toUpperCase()}</Neon>
    <div style={{ fontSize: 12, color: C.dim, marginTop: 12, lineHeight: 1.6 }}>{ERAS.find(e => e.name === eraTransition)?.desc}</div>
    <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${C.pink}44, transparent)`, marginTop: 16 }} />
    <div style={{ fontSize: 10, color: C.dim, marginTop: 12, animation: "pulse 2s infinite" }}>TAP TO CONTINUE</div>
  </div>
</div>}

{/* ── MIDDLE: Scrollable content ── */}
<div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 8, position: "relative", zIndex: 2 }}>

{/* ══ MARKET ══ */}
{tab === "market" && <>
  <div style={{ ...bx, marginTop: 0, borderTopLeftRadius: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <Neon color={lc} size={11}>{isNight ? "🌙 NIGHT" : "☀️"} STREET PRICES</Neon>
      <span style={{ fontSize: 10, color: C.dim }}>🎒 {usedSp}/{g.coatSp}</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
      {DRUGS.map((drug, idx) => {
        const owned = g.inv[idx], price = g.prices[idx], h = g.hist[idx] || [];
        const prev = h.length > 1 ? h[h.length - 2] : price;
        const pct = prev ? ((price - prev) / prev * 100).toFixed(0) : 0;
        const isSel = selDrug === idx;
        const pc = priceColor(price, idx);
        const hasPagerDeal = g.pagerDeal && g.pagerDeal.drugIdx === idx && g.move <= g.pagerDeal.expiresMove;
        // Price intensity: how extreme is the current price?
        const priceRatio = price / drug.mean;
        const isHot = priceRatio >= 1.8; // Way above mean — sell signal
        const isCold = priceRatio <= 0.5; // Way below mean — buy signal
        const intensityColor = isHot ? C.pink : isCold ? C.green : null;
        const cardBg = isSel ? C.panel : isHot ? (C.pink + "12") : isCold ? (C.green + "12") : (C.dark + "aa");
        const cardBorder = hasPagerDeal ? C.gold + "88" : isSel ? lc + "88" : intensityColor ? (intensityColor + "44") : C.border;
        const isExtreme = priceRatio >= 2.5 || priceRatio <= 0.3;
        const cardGlow = isExtreme ? `0 0 12px ${intensityColor}44, 0 0 24px ${intensityColor}22, inset 0 0 16px ${intensityColor}11` : (isHot || isCold) ? `0 0 8px ${intensityColor}22, inset 0 0 12px ${intensityColor}08` : "none";
        return <div key={idx} onClick={() => { setSelDrug(isSel ? null : idx); setTrMode(null); setTrAmt(""); dismissCoach("select_drug"); dismissCoach("open_market"); if (!coachShown["buy_low"]) showCoach("buy_low"); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px", background: cardBg, border: "1px solid " + cardBorder, borderRadius: 6, cursor: "pointer", transition: "all .2s", borderLeft: isSel ? "3px solid " + lc : hasPagerDeal ? "3px solid " + C.gold : intensityColor ? ("3px solid " + intensityColor + "66") : "3px solid transparent", boxShadow: cardGlow, minHeight: 56, animation: isSel ? "screenSlideUp .2s ease-out" : (isHot || isCold) ? `easeOutBack .3s ease-out ${idx * 50}ms both, pulse 3s ease-in-out infinite` : `easeOutBack .3s ease-out ${idx * 50}ms both` }}>
          <span style={{ fontSize: 22, width: 28, textAlign: "center", flexShrink: 0 }}>{drug.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: isSel ? C.text : C.dim, fontWeight: "bold", fontFamily: ft }}>{drug.name}</span>
              <span style={{ fontSize: 14, color: pc, fontWeight: "bold", fontFamily: ft, animation: Math.abs(Number(pct)) > 15 ? "priceUp .4s ease" : "none" }}>{FM(price)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3, gap: 6 }}>
              <span style={{ fontSize: 10, color: Number(pct) >= 0 ? C.green : C.pink, fontWeight: "bold", fontFamily: ft }}>{Number(pct) >= 0 ? "+" : ""}{pct}%</span>
              <Sparkline data={h} color={pc !== C.text ? pc : lc} w={55} h={14} />
              {owned > 0 && <span style={{ fontSize: 11, color: C.blue, fontFamily: ft }}>x{owned}</span>}
              <span style={{ fontSize: 8, color: C.dim, fontFamily: ft, opacity: .6 }}>{drug.tier === 0 ? "STR" : drug.tier === 1 ? "RX" : "LUX"}</span>
            </div>
          </div>
        </div>;
      })}
    </div>

    {/* Trade Panel */}
    {selDrug !== null && <div style={{ marginTop: 10, padding: "12px", background: C.dark + "cc", borderRadius: 6, border: "1px solid " + lc + "33", animation: "slideIn .2s ease-out" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setTrMode("buy")} style={{ ...bt(trMode === "buy" ? C.green : C.dim, trMode === "buy" ? C.green + "33" : undefined), flex: 1, minHeight: 48 }}>BUY</button>
        <button onClick={() => setTrMode("sell")} disabled={g.inv[selDrug] === 0} style={{ ...bt(trMode === "sell" ? C.pink : C.dim, trMode === "sell" ? C.pink + "33" : undefined), flex: 1, minHeight: 48, opacity: g.inv[selDrug] > 0 ? 1 : .4 }}>SELL</button>
      </div>
      {trMode && <div>
        <input type="number" value={trAmt} onChange={e => setTrAmt(e.target.value)} placeholder="Amount" style={inp} />
        <div style={{ display: "flex", gap: 4, margin: "8px 0", flexWrap: "wrap" }}>
          {[1, 5, 10, 25].map(n => <button key={n} onClick={() => setTrAmt(String(n))} style={{ ...bt(C.dim), padding: "8px 14px", fontSize: 11, minHeight: 40 }}>{n}</button>)}
          <button onClick={() => setTrAmt(String(trMode === "sell" ? g.inv[selDrug] : Math.floor(Math.min(g.cash / g.prices[selDrug], g.coatSp - usedSp))))} style={{ ...bt(C.blue), padding: "8px 14px", fontSize: 11, minHeight: 40 }}>MAX</button>
        </div>
        <button onClick={trMode === "buy" ? doBuy : doSell} style={{ ...bt(trMode === "buy" ? C.green : C.pink, trMode === "buy" ? C.green : C.pink), width: "100%", minHeight: 48, fontSize: 13 }}>
          {trMode === "buy" ? `BUY ${trAmt || 0} FOR ${FM((parseInt(trAmt) || 0) * g.prices[selDrug])}` : `SELL ${trAmt || 0} FOR ${FM((parseInt(trAmt) || 0) * g.prices[selDrug])}`}
        </button>
      </div>}
    </div>}

  </div>
</>}

{/* ══ BAG ══ */}
{tab === "bag" && <div style={bx}>
  <Neon color={C.blue} size={12} style={{ marginBottom: 8 }}>🎒 INVENTORY ({usedSp}/{g.coatSp})</Neon>
  {g.inv.every(q => q === 0) ? <div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: 20 }}>Your bag is empty</div> :
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {g.inv.map((q, i) => { if (q <= 0) return null; const profitable = g.prices[i] > g.avgC[i]; const pnlColor = profitable ? C.green : C.pink; const pnlPct = g.avgC[i] > 0 ? Math.round(((g.prices[i] - g.avgC[i]) / g.avgC[i]) * 100) : 0; return <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: C.dark + "aa", borderRadius: 4, border: "1px solid " + C.border, borderLeft: "3px solid " + pnlColor + "88" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{DRUGS[i].emoji}</span>
          <div><div style={{ fontSize: 12, color: C.text }}>{DRUGS[i].name}</div><div style={{ fontSize: 9, color: C.dim }}>Avg cost: {FM(g.avgC[i])}</div></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: C.blue, fontWeight: "bold" }}>x{q}</div>
          <div style={{ fontSize: 9, color: pnlColor, fontWeight: "bold" }}>{profitable ? "▲" : "▼"} {profitable ? "+" : ""}{FM(g.prices[i] - g.avgC[i])}/ea ({pnlPct > 0 ? "+" : ""}{pnlPct}%)</div>
        </div>
      </div>; })}
    </div>}
  {g.gun && <div style={{ marginTop: 10, padding: "8px 10px", background: C.pink + "22", borderRadius: 4, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>🔫</span><span style={{ fontSize: 12, color: C.text }}>Piece (better fight odds)</span></div>}
</div>}

{/* ══ TRAVEL ══ */}
{tab === "travel" && <div style={bx}>
  <Neon color={C.blue} size={12} style={{ marginBottom: 8 }}>🚗 TRAVEL</Neon>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
    {LOCS.map((loc, i) => {
      const isCurrent = i === g.loc;
      const hasTurf = g.turf[i] > 0;
      const hasSafe = g.safeHouses[i] >= 0;
      const isPagerTarget = g.pagerDeal && g.pagerDeal.targetLoc === i && g.move <= g.pagerDeal.expiresMove;
      return <button key={i} onClick={() => !isCurrent && doTravel(i)} disabled={isCurrent}
        style={{ ...bt(isCurrent ? C.dim : isPagerTarget ? C.gold : loc.color), padding: "14px 8px", opacity: isCurrent ? .5 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: isPagerTarget ? C.gold + "22" : "transparent", animation: `easeOutBack .3s ease-out ${i * 50}ms both`, minHeight: 64 }}>
        <span style={{ fontSize: 20 }}>{loc.icon}</span>
        <span style={{ fontSize: 10 }}>{loc.name}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {hasTurf && <span style={{ fontSize: 8 }}>{TURF_LEVELS[g.turf[i]].icon}</span>}
          {hasSafe && <span style={{ fontSize: 8 }}>{SAFE_HOUSES[g.safeHouses[i]].icon}</span>}
          {isPagerTarget && <span style={{ fontSize: 8 }}>📟</span>}
        </div>
      </button>;
    })}
  </div>
</div>}

{/* ══ BANK ══ */}
{tab === "bank" && <div style={bx}>
  <Neon color={C.blue} size={12} style={{ marginBottom: 8 }}>🏦 FIRST MIAMI BANK</Neon>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
    <div style={{ textAlign: "center", padding: 10, background: C.dark + "aa", borderRadius: 4 }}><div style={{ fontSize: 9, color: C.dim }}>CASH</div><div style={{ fontSize: 14, color: C.green }}>{FM(g.cash)}</div></div>
    <div style={{ textAlign: "center", padding: 10, background: C.dark + "aa", borderRadius: 4 }}><div style={{ fontSize: 9, color: C.dim }}>BANK</div><div style={{ fontSize: 14, color: C.blue }}>{FM(g.bank)}</div></div>
    <div style={{ textAlign: "center", padding: 10, background: C.dark + "aa", borderRadius: 4 }}><div style={{ fontSize: 9, color: C.dim }}>DEBT</div><div style={{ fontSize: 14, color: C.pink }}>{FM(g.debt)}</div></div>
  </div>
  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
    <button onClick={() => doBank("deposit", Math.floor(g.cash * .5))} disabled={g.cash < 100} style={{ ...bt(C.blue), flex: 1, opacity: g.cash >= 100 ? 1 : .4 }}>DEPOSIT 50%</button>
    <button onClick={() => doBank("withdraw", Math.floor(g.bank * .5))} disabled={g.bank < 100} style={{ ...bt(C.green), flex: 1, opacity: g.bank >= 100 ? 1 : .4 }}>WITHDRAW 50%</button>
  </div>
  <button onClick={() => doBank("paydebt", Math.min(g.cash, g.debt))} disabled={g.debt === 0 || g.cash < 100} style={{ ...bt(C.pink, C.pink), width: "100%", opacity: g.debt > 0 && g.cash >= 100 ? 1 : .4 }}>PAY DEBT ({FM(Math.min(g.cash, g.debt))})</button>
  <div style={{ fontSize: 9, color: C.dim, marginTop: 8, textAlign: "center" }}>Debt: 8% interest / 4 moves · Bank: 3% interest / 4 moves</div>
  {!g.gun && <button onClick={doBuyGun} disabled={g.cash < 4000} style={{ ...bt(C.orange), width: "100%", marginTop: 8, opacity: g.cash >= 4000 ? 1 : .4 }}>🔫 BUY PIECE ($4,000)</button>}
</div>}

{/* ══ EMPIRE ══ */}
{tab === "empire" && <div style={bx}>
  <Neon color={C.gold} size={12} style={{ marginBottom: 8 }}>🏴 EMPIRE</Neon>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 10, padding: "8px 10px", background: C.dark + "aa", borderRadius: 4, border: "1px solid " + C.border }}>
    {LOCS.map((loc, i) => { const lv = g.turf[i]; return <div key={"tm"+i} style={{ textAlign: "center", padding: "4px 2px", borderRadius: 3, background: lv > 0 ? loc.color + "22" : "transparent", border: lv > 0 ? ("1px solid " + loc.color + "44") : "1px solid " + C.border + "44", opacity: lv > 0 ? 1 : .4 }}>
      <div style={{ fontSize: 12 }}>{loc.icon}</div>
      <div style={{ fontSize: 7, color: lv > 0 ? loc.color : C.dim, fontFamily: ft, letterSpacing: .5 }}>{lv > 0 ? TURF_LEVELS[lv].name.toUpperCase() : "—"}</div>
    </div>; })}
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {LOCS.map((loc, i) => {
      const lv = g.turf[i];
      const enf = g.enforcers[i];
      const nextLv = lv + 1 < TURF_LEVELS.length ? TURF_LEVELS[lv + 1] : null;
      return <div key={i} style={{ padding: "10px", background: C.dark + "aa", borderRadius: 4, border: "1px solid " + (lv > 0 ? loc.color + "44" : C.border) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div><span style={{ fontSize: 14 }}>{loc.icon}</span> <span style={{ fontSize: 12, color: C.text }}>{loc.name}</span></div>
          <span style={{ fontSize: 10, color: C.gold }}>{TURF_LEVELS[lv].icon} {TURF_LEVELS[lv].name}</span>
        </div>
        {lv > 0 && <div style={{ fontSize: 10, color: C.dim, marginBottom: 6 }}>Income: +{FM(TURF_LEVELS[lv].income)}/move · Enforcers: {enf} (-{FM(enf * ENFORCER_UPKEEP)}/move)</div>}
        <div style={{ display: "flex", gap: 4 }}>
          {nextLv && <button onClick={() => doBuyTurf(i)} disabled={g.cash < nextLv.cost} style={{ ...bt(C.gold), flex: 1, fontSize: 9, padding: "6px", opacity: g.cash >= nextLv.cost ? 1 : .4 }}>UPGRADE {FM(nextLv.cost)}</button>}
          {lv > 0 && <button onClick={() => doHireEnforcers(i, 1)} disabled={g.cash < ENFORCER_COST} style={{ ...bt(C.orange), flex: 1, fontSize: 9, padding: "6px", opacity: g.cash >= ENFORCER_COST ? 1 : .4 }}>+1 👊 {FM(ENFORCER_COST)}</button>}
        </div>
      </div>;
    })}
  </div>
</div>}

{/* ══ LIFESTYLE ══ */}
{tab === "life" && <div style={bx}>
  <Neon color={C.flamingo} size={12} style={{ marginBottom: 8 }}>💎 LIFESTYLE</Neon>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
    {LIFESTYLE.map(item => {
      const owned = g.lifestyle.includes(item.effect);
      const displayCost = item.cost;
      const canAfford = g.cash >= displayCost;
      return <button key={item.effect} onClick={() => !owned && doBuyLife(item.effect)} disabled={owned || !canAfford}
        style={{ ...bt(owned ? C.green : canAfford ? C.flamingo : C.dim), padding: "10px 8px", opacity: owned ? .7 : canAfford ? 1 : .3, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", boxShadow: owned ? `inset 0 0 20px ${C.green}11` : "none" }}>
        <span style={{ fontSize: 24, filter: owned ? "none" : canAfford ? "none" : "grayscale(.8)" }}>{item.icon}</span>
        <span style={{ fontSize: 10 }}>{item.name}</span>
        <span style={{ fontSize: 9, color: owned ? C.green : canAfford ? C.flamingo : C.pink }}>{owned ? "✓ OWNED" : FM(displayCost)}</span>
        <span style={{ fontSize: 8, color: C.dim }}>{item.desc}</span>
      </button>;
    })}
  </div>
  {g.loc !== undefined && <div style={{ marginTop: 12 }}>
    <Neon color={C.blue} size={11} style={{ marginBottom: 6 }}>🏠 SAFE HOUSE IN {LOCS[g.loc].name.toUpperCase()}</Neon>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {SAFE_HOUSES.map((sh, i) => {
        const current = g.safeHouses[g.loc];
        const owned = current >= i;
        const canBuy = current === i - 1 || (current === -1 && i === 0);
        return <button key={i} onClick={() => canBuy && doBuySafe(i)} disabled={!canBuy || g.cash < sh.cost}
          style={{ ...bt(owned ? C.green : canBuy ? C.blue : C.dim), padding: "8px", opacity: owned ? .6 : canBuy && g.cash >= sh.cost ? 1 : .4 }}>
          <span style={{ fontSize: 16 }}>{sh.icon}</span>
          <div style={{ fontSize: 10 }}>{sh.name}</div>
          <div style={{ fontSize: 8, color: C.dim }}>{owned ? "OWNED" : FM(sh.cost)}</div>
          <div style={{ fontSize: 7, color: C.dim }}>+{sh.storage} stash · -{sh.heatDecay} heat</div>
        </button>;
      })}
    </div>
  </div>}
</div>}

</div>{/* end scrollable content */}

{/* ── BOTTOM: Tab bar (thumb zone) ── */}
<div style={{ flexShrink: 0, display: "flex", gap: 0, background: C.dark + "f8", borderTop: "1px solid " + C.border, backdropFilter: "blur(12px)", zIndex: 10, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
  {visibleTabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ flex: 1, fontFamily: ft, fontSize: 10, border: "none", borderTop: tab === id ? "2px solid " + lc : "2px solid transparent", background: tab === id ? lc + "11" : "transparent", color: tab === id ? C.text : C.dim, padding: "12px 4px", cursor: "pointer", letterSpacing: .5, transition: "all .15s", minHeight: 48 }}>{label}</button>)}
</div>

  </div>;
}