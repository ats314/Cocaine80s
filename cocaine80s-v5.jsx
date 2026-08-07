import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo, memo } from "react";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  COCAINE 80s — v4.0 "NEON NOIR"                                   ║
// ║  ── What's new over v3.0 ──────────────────────────────────────── ║
// ║  • CINEMATIC NPC SYSTEM — hand-built SVG portraits for Maria,     ║
// ║    Ramirez, El Colombiano & Tiburón, run through the 5-layer      ║
// ║    neon-noir pipeline from the portrait research doc (contrast,   ║
// ║    signature glow, gradient, VHS scanlines, vignette + grain).    ║
// ║    Storylets are now full dialogue scenes with typewriter text,   ║
// ║    mood-reactive expressions, and a CONTACTS dossier tab.         ║
// ║  • LIVING MIAMI HEADER — animated skyline that reacts to game     ║
// ║    state: sun/moon day cycle, sky bleeds red as heat rises,       ║
// ║    cop-light wash above 60 heat, neon horizon in district color.  ║
// ║  • JUICE PASS (Roadmap P1) — magnetic cash particles that fly     ║
// ║    into the wallet, hit-stop + white vignette on massive sales,   ║
// ║    rolling cash counter, squash-stretch buttons, staggered list   ║
// ║    entrances, profit streak combos, cascading sale breakdowns.    ║
// ║  • 30/60/90 ONBOARDING — 4-panel comic → Maria's brick call       ║
// ║    (first choice ~60s, guaranteed first reward ~90s), progressive ║
// ║    HUD (cash → debt → HP → heat → cred → era, each pings in when  ║
// ║    it becomes real), 5-8 word coach marks dismissed by doing.     ║
// ║  • ERA TAKEOVERS, Miami Herald game-over front pages, VHS         ║
// ║    freeze-frame endings, procedural synth soundtrack + SFX.       ║
// ║  Engine stays portable: pure state transitions, zero DOM, ports   ║
// ║  to React Native unchanged. View layer starts at AUDIO ENGINE.    ║
// ╚══════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════
// COCAINE 80s — GAME ENGINE (Portable)
// ═══════════════════════════════════════════════════════════════

// ── PALETTE ──
const C = {
  pink:"#FF2D7B", blue:"#00E5FF", orange:"#FF6B35", green:"#00C9A7",
  purple:"#7B2FBE", gold:"#FFD700", flamingo:"#FF69B4", ocean:"#0A1628",
  dark:"#060E1A", panel:"#0C1829", border:"#152238", text:"#D4E0ED",
  dim:"#4A6280", midnight:"#020810", paper:"#EDE6D6", ink:"#1A1410",
};

// ── LOCATIONS ──
const LOCS = [
  { name:"Miami Beach",     icon:"🏖️", color:C.flamingo, heat:.06, desc:"Tourist cover, luxury buyers",  priceMod:[1.3,1.1,.7] },
  { name:"Little Havana",   icon:"🌴", color:C.orange,   heat:.10, desc:"Cartel routes, cheap imports",  priceMod:[.7,.9,1.3] },
  { name:"Overtown",        icon:"🏚️", color:C.pink,     heat:.14, desc:"High volume, high risk",        priceMod:[.6,1.2,1.1] },
  { name:"Coral Gables",    icon:"🏛️", color:C.green,    heat:.05, desc:"Rich suburbs, quiet money",     priceMod:[1.1,.6,1.0] },
  { name:"Fort Lauderdale", icon:"🎓", color:C.blue,     heat:.08, desc:"College strip, party drugs",    priceMod:[1.0,1.0,.8] },
  { name:"The Keys",        icon:"🚤", color:C.gold,     heat:.04, desc:"Smuggling inlets, no police",   priceMod:[1.2,1.1,.5] },
];

const LOCATION_VIBE = [
  { day:["Tourist cameras flash on every corner","Sunscreen and money in the salt air","Bikinis and Benzes line the strip"], night:["Neon reflects off wet Ocean Drive","Bass thumps from club doors left open","The beautiful people pretend not to see you"] },
  { day:["Domino tiles crack like gunshots in the park","Café Cubano steam rises through open windows","Old men argue about a country they’ll never see again"], night:["Salsa pours from every doorway on Calle Ocho","The smell of lechón and danger","Headlights sweep past murals of a homeland lost"] },
  { day:["Boarded windows watch with painted eyes","A shopping cart rolls through the intersection alone","Everyone here knows what you’re carrying"], night:["Blue TV glow behind barred windows","Sirens in the distance — always in the distance","The only open business sells what you’re selling"] },
  { day:["Sprinklers hiss on lawns that cost more than your life","A gardener pretends he didn’t see you","Spanish tile roofs gleam like teeth"], night:["Porch lights illuminate nothing but silence","Money sleeps here. Crime visits.","Your footsteps echo off Mediterranean Revival walls"] },
  { day:["Spring breakers stumble bar to bar before noon","Frat boys haggle like they invented the hustle","Sand in everything — shoes, pockets, product"], night:["Party boats throb on the Intracoastal","College kids will buy anything you tell them to","Red and blue sweep the strip — spring break patrol"] },
  { day:["Pelicans circle a shrimp boat heading south","Water so clear you can see the bottom","A seaplane banks low over the mangroves"], night:["Cigarette boats hug the dark shoreline","Stars you never see in Miami","The tide whispers about what it’s carried in"] },
];

// ── DRUGS ──
const DRUGS = [
  { name:"Weed",     tier:0, mean:22,  min:8,   max:55,  sigma:.40, theta:.30, emoji:"🌿" },
  { name:"Xanax",    tier:0, mean:18,  min:6,   max:45,  sigma:.30, theta:.30, emoji:"💊" },
  { name:"Oxy",      tier:1, mean:45,  min:15,  max:110, sigma:.28, theta:.25, emoji:"🩹" },
  { name:"Adderall", tier:1, mean:20,  min:7,   max:50,  sigma:.32, theta:.30, emoji:"⚡" },
  { name:"Crack",    tier:1, mean:35,  min:10,  max:90,  sigma:.50, theta:.20, emoji:"🔥" },
  { name:"Cocaine",  tier:2, mean:300, min:120, max:700, sigma:.25, theta:.15, emoji:"❄️" },
  { name:"Heroin",   tier:2, mean:150, min:50,  max:350, sigma:.28, theta:.15, emoji:"💀" },
  { name:"Ecstasy",  tier:2, mean:35,  min:12,  max:80,  sigma:.30, theta:.20, emoji:"🦋" },
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
  { msg:"NEED {q} {d}. SOUTH BEACH. PARTY AT THE FONTAINEBLEAU. MODELS. +{p}%.", bonus:[1.3,1.8], qty:[5,20] },
  { msg:"KEYS. MIDNIGHT. BRING {q} {d}. IF NO BOAT, BRING SWIMMING SKILLS. +{p}%.", bonus:[1.4,2.0], qty:[10,30] },
  { msg:"DRY SPELL IN OVERTOWN. {q} {d}. NAME YOUR PRICE. LITERAL. +{p}%.", bonus:[1.5,2.2], qty:[8,25] },
  { msg:"SPRING BREAK EMERGENCY. FRAT HOUSE ON A1A. {q} {d}. DADDY’S AMEX. +{p}%.", bonus:[1.3,1.6], qty:[15,40] },
  { msg:"CORAL GABLES DINNER PARTY. {q} {d}. ‘PHARMACEUTICAL GRADE ONLY.’ +{p}%.", bonus:[1.6,2.5], qty:[5,15] },
  { msg:"COP’S BACHELOR PARTY. YES REALLY. {q} {d}. DOUBLE RATE. IRONY IS FREE. +{p}%.", bonus:[1.5,2.0], qty:[5,15] },
  { msg:"MUSICIAN AT THE FONTAINEBLEAU. LAST TIME HE TIPPED $3K. {q} {d}. +{p}%.", bonus:[1.6,2.2], qty:[8,20] },
  { msg:"YACHT PARTY, BISCAYNE BAY. PASSWORD: ‘REAGAN SUCKS.’ {q} {d}. WEAR WHITE. +{p}%.", bonus:[1.4,1.9], qty:[10,25] },
];

// ── ERAS — action-driven, never move-driven ──
const ERAS = [
  { name:"Paradise",            desc:"No enforcement. Easy money.",                copsMod:0.5, penaltyMod:0.5, color:C.gold,   demandMod:[1,1,1,1,1,1,1,1] },
  { name:"Anti-Drug Abuse Act", desc:"Mandatory minimums. The heat is real.",      copsMod:1.0, penaltyMod:1.5, color:C.orange, demandMod:[1.3,.8,.7,1,1.2,.8,.9,1.1] },
  { name:"Crack Epidemic",      desc:"Crack demand explodes. Choose your path.",   copsMod:1.2, penaltyMod:1.5, color:C.pink,   demandMod:[.9,1.1,1,1,3,.6,1.8,1.2] },
  { name:"War on Drugs",        desc:"Military interdiction. Walls closing in.",   copsMod:1.6, penaltyMod:2.0, color:C.purple, demandMod:[1.4,1.5,1.3,1.4,.8,.5,.6,1] },
  { name:"Endgame",             desc:"Everyone wants you — dead or alive.",        copsMod:2.0, penaltyMod:2.5, color:"#FF1744",demandMod:[.7,.6,.6,.7,.5,.4,.5,.6] },
];
const PHASE_TRANSITIONS = [
  s => s.totalProfit>=25000 || s.cred>=30 || s.fedHeat>=15 || s.turf.filter(t=>t>0).length>=2,
  s => s.totalProfit>=100000 || s.cred>=60 || s.turf.filter(t=>t>0).length>=4 || (s.fedHeat>=40 && (s.totalBusts||0)>=3),
  s => s.totalProfit>=300000 || s.fedHeat>=65 || (s.cred>=80 && s.turf.filter(t=>t>0).length>=5) || (s.npcState?.ramirez?.evidence||0)>=10,
  s => s.fedHeat>=70 || (s.npcState?.ramirez?.evidence||0)>=16 || s.totalProfit>=500000,
];

const LIFESTYLE = [
  { name:"Ray-Bans",        icon:"🕶️", cost:500,    credBoost:2,  desc:"+2 street cred",            effect:"cred" },
  { name:"Versace Suit",    icon:"🕴️", cost:3000,   credBoost:5,  desc:"5% better buy prices",      effect:"prices" },
  { name:"Rolex",           icon:"⌚", cost:15000,  credBoost:4,  desc:"+2 heat decay every move",  effect:"rolex" },
  { name:"Countach",        icon:"🏎️", cost:25000,  credBoost:10, desc:"Instant travel, +10 cred",  effect:"car" },
  { name:"Cigarette Boat",  icon:"🚤", cost:40000,  credBoost:6,  desc:"Keys buys cost 15% less",   effect:"boat" },
  { name:"Nightclub",       icon:"🪩", cost:60000,  credBoost:8,  desc:"Launders $2K/move clean",   effect:"club" },
  { name:"Scarface Mansion",icon:"🏠", cost:100000, credBoost:20, desc:"+20 cred. They know you.",  effect:"mansion" },
];

const SAFE_HOUSES = [
  { name:"Motel Room",       cost:1500,  storage:50,  heatDecay:2, icon:"🏨" },
  { name:"Apartment",        cost:5000,  storage:120, heatDecay:4, icon:"🏢" },
  { name:"Waterfront Condo", cost:15000, storage:200, heatDecay:6, icon:"🌊" },
  { name:"Houseboat",        cost:25000, storage:300, heatDecay:8, icon:"⛵" },
];

const TURF_LEVELS = [
  { name:"Unclaimed", income:0,    cost:0,     icon:"·"  },
  { name:"Corner",    income:200,  cost:3000,  icon:"▪" },
  { name:"Block",     income:600,  cost:10000, icon:"◼" },
  { name:"Territory", income:1500, cost:25000, icon:"⬛" },
  { name:"Borough",   income:3000, cost:60000, icon:"♛" },
];
const ENFORCER_COST = 1500, ENFORCER_UPKEEP = 80;
const RIVAL_NAMES = ["Rico","Alejandra","El Gato","Scarface Jr.","Mama Coco"];

// ── PLAYBOOKS ──
const PLAYBOOKS = [
  { id:"hustler",   name:"The Hustler",   icon:"🎲", color:C.gold,   desc:"Balanced start. The classic.",                       mods:{}, flavor:"You came to Miami with nothing but ambition." },
  { id:"mule",      name:"The Mule",      icon:"🧳", color:C.green,  desc:"+40 bag space, but start with $3K.",                 mods:{ startCash:3000, bonusCoat:40 }, flavor:"You can carry more than anyone. That’s your edge." },
  { id:"connected", name:"The Connected", icon:"🤝", color:C.purple, desc:"Maria & El Colombiano start friendly.",              mods:{ mariaTrust:3, colombianoTrust:2 }, flavor:"You have friends in low places. And high ones." },
  { id:"enforcer",  name:"The Enforcer",  icon:"👊", color:C.pink,   desc:"Start with a corner & 2 enforcers.",                 mods:{ startTurf:1, startEnforcers:2, turfLoc:2 }, flavor:"You’re not here to deal. You’re here to own." },
  { id:"smuggler",  name:"The Smuggler",  icon:"🚤", color:C.blue,   desc:"Start in the Keys. Imports 30% off.",                mods:{ startLoc:5, importBonus:0.7 }, flavor:"You know every inlet from here to Cuba." },
  { id:"banker",    name:"The Banker",    icon:"💰", color:C.green,  desc:"$8K cash, $5K debt, quarter interest.",              mods:{ startCash:8000, startDebt:5000, interestMod:0.25 }, flavor:"You laundered on Wall Street. This is a vacation." },
  { id:"ghost",     name:"The Ghost",     icon:"👻", color:C.dim,    desc:"Cops −30%, cred gains −20%.",                        mods:{ copsMod:0.7, credMod:0.8 }, flavor:"No one knows your name. That’s the point." },
  { id:"kingpin",   name:"The Kingpin",   icon:"👑", color:C.gold,   desc:"$15K debt, but double cred gains.",                  mods:{ startDebt:15000, credMultiplier:2 }, flavor:"Go big or go home. You’re not going home.", unlockRep:5000 },
];

// ── SAFEHOUSE META-UPGRADES (Rep) ──
const SAFEHOUSE_UPGRADES = [
  { id:"cash1",  name:"Rainy Day Fund",   icon:"💵", cost:500,  maxLevel:3, desc:"+$500 starting cash / lvl",   effect:"startCash",    value:500 },
  { id:"coat1",  name:"Bigger Coat",      icon:"🧥", cost:750,  maxLevel:3, desc:"+15 bag space / lvl",         effect:"coatSpace",    value:15 },
  { id:"heat1",  name:"Cool Connections", icon:"❄️", cost:1000, maxLevel:3, desc:"−5% police attention / lvl",  effect:"heatMod",      value:-0.05 },
  { id:"cred1",  name:"Street Rep",       icon:"⭐", cost:600,  maxLevel:3, desc:"+5 starting cred / lvl",      effect:"startCred",    value:5 },
  { id:"gun1",   name:"Piece in the Drawer", icon:"🔫", cost:2000, maxLevel:1, desc:"Start armed",              effect:"startGun",     value:true },
  { id:"phone1", name:"Pager Network",    icon:"📟", cost:1500, maxLevel:2, desc:"+10% pager deals / lvl",      effect:"pagerChance",  value:0.10 },
  { id:"price1", name:"Market Intel",     icon:"📊", cost:1200, maxLevel:2, desc:"5% better buys / lvl",        effect:"priceDiscount",value:0.05 },
  { id:"legal1", name:"Smooth Talker",    icon:"🗣️", cost:800,  maxLevel:2, desc:"−15% legal fees / lvl",       effect:"legalFeeMod",  value:-0.15 },
];

// ── HEAT LADDER ──
const HEAT_LADDER = [
  { level:0, name:"Tourist",    mods:"Standard game",                 copsMod:1.00, priceMod:1.00, startCash:5000, startDebt:8000 },
  { level:1, name:"Corner Boy", mods:"Cops +15%",                     copsMod:1.15, priceMod:1.00, startCash:5000, startDebt:8000 },
  { level:2, name:"Hustler",    mods:"Cops +25%, wilder prices",      copsMod:1.25, priceMod:1.15, startCash:4500, startDebt:8000 },
  { level:3, name:"Dealer",     mods:"Cops +40%, less cash",          copsMod:1.40, priceMod:1.20, startCash:3500, startDebt:8000 },
  { level:4, name:"Supplier",   mods:"Cops +60%, more debt",          copsMod:1.60, priceMod:1.30, startCash:3000, startDebt:10000 },
  { level:5, name:"Kingpin",    mods:"Everything stacked against you",copsMod:2.00, priceMod:1.50, startCash:2000, startDebt:12000 },
  { level:6, name:"Scarface",   mods:"One mistake and it’s over",     copsMod:2.50, priceMod:1.70, startCash:1500, startDebt:15000 },
];

// ── DAILY CHALLENGE ──
const DAILY_MODIFIERS = [
  { id:"drought",  name:"Supply Drought",    desc:"All prices +40%",        icon:"📈", effect:"priceMulti", value:1.4 },
  { id:"flood",    name:"Market Flood",      desc:"All prices −30%",        icon:"📉", effect:"priceMulti", value:0.7 },
  { id:"crackdown",name:"Federal Crackdown", desc:"Cops +50%",              icon:"🚔", effect:"copsMod",    value:1.5 },
  { id:"holiday",  name:"Holiday Weekend",   desc:"Demand +60%",            icon:"🎉", effect:"demandMod",  value:1.6 },
  { id:"heatwave", name:"Heat Wave",         desc:"Heat decays 50% slower", icon:"🌡️", effect:"heatDecayMod",value:0.5 },
  { id:"recession",name:"Recession",         desc:"Start −$2K cash",        icon:"💸", effect:"startCashMod",value:-2000 },
  { id:"windfall", name:"Windfall",          desc:"Start +$3K cash",        icon:"🎰", effect:"startCashMod",value:3000 },
  { id:"goldmine", name:"Gold Mine",         desc:"Pager deals pay +50%",   icon:"⛏️", effect:"pagerBonus", value:1.5 },
];
const getDailySeed = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  let h = 0; for (let i=0;i<dateStr.length;i++){ h=((h<<5)-h)+dateStr.charCodeAt(i); h&=h; }
  return { seed:Math.abs(h), dateStr, caseNumber:`1986-${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}` };
};
class SeededRNG {
  constructor(seed){ this.s = seed>>>0 || 1; }
  next(){ this.s = (this.s*1103515245 + 12345) & 0x7fffffff; return this.s/0x7fffffff; }
  int(a,b){ return Math.floor(this.next()*(b-a+1))+a; }
}
const getDailyModifiers = seed => {
  const rng = new SeededRNG(seed);
  const pool = [...DAILY_MODIFIERS];
  const count = 2 + (rng.next()>0.6?1:0);
  const out = [];
  for (let i=0;i<count && pool.length;i++) out.push(pool.splice(rng.int(0,pool.length-1),1)[0]);
  return out;
};

// ── NEWSPAPERS ──
const NEWSPAPERS = [
  { headline:"BANK VAULT OVERFLOW", sub:"First National orders second vault. ‘A good problem to have,’ says manager who definitely doesn’t know where the cash comes from.", icon:"🏦" },
  { headline:"MAN BUYS TWELVE LAMBORGHINIS IN CASH", sub:"‘I have a large family,’ he told the dealer. IRS has requested an interview.", icon:"🏎️" },
  { headline:"COAST GUARD RETRIEVES 500 LBS FROM BEACH", sub:"Local joggers got there first; report ‘only 200 lbs found.’ Math teachers concerned.", icon:"🏖️" },
  { headline:"DADE COUNTY ME RENTS BURGER KING TRAILER", sub:"‘We needed the cold storage. No burgers were involved.’ Murder rate exceeded capacity.", icon:"🍔" },
  { headline:"MANDATORY MINIMUMS SIGNED INTO LAW", sub:"Congress decides 5 grams of crack equals 500 grams of powder. Math teachers even more concerned.", icon:"⚖️" },
  { headline:"DEA AGENT CAUGHT STEALING FROM EVIDENCE LOCKER", sub:"‘A moment of weakness,’ says man wearing new Rolex.", icon:"🕵️" },
  { headline:"ASSET FORFEITURE BONANZA", sub:"Government seizes 47 Ferraris, 12 yachts, 3 planes, and one very confused tiger.", icon:"🐅" },
  { headline:"TURF WAR CLAIMS SIX IN OVERTOWN", sub:"Witnesses saw nothing, heard nothing, know nothing. ‘Selective amnesia. It’s a survival strategy.’", icon:"🔫" },
  { headline:"SUBURBAN CRACK USE SURGES", sub:"Coral Gables parents shocked to discover drugs exist outside neighborhoods they’d never visit.", icon:"🏡" },
  { headline:"WITNESS PROTECTION AT CAPACITY", sub:"‘We’re running out of small towns in Ohio,’ says U.S. Marshal.", icon:"🏘️" },
];

// ── RANDOM ENCOUNTERS ──
const ENCOUNTERS = [
  { type:"find",   text:"A duffel bag in a dumpster behind the Mutiny. Inside: product. No note. No witnesses. Miami provides.", amount:[3,12], chance:.30 },
  { type:"tip",    text:"A valet leans in: “Heard {d} is about to move in {l}. You didn’t hear it from me.”", chance:.35 },
  { type:"mugger", text:"A man the approximate size of a commercial refrigerator blocks the sidewalk. He doesn’t introduce himself. He doesn’t need to.", hpLoss:[5,15], cashLoss:[100,500], chance:.25 },
  { type:"bribe_offer", text:"A patrol cop taps your window. “Funny weather we’re having.” He isn’t talking about the weather.", cost:[300,900], heatReduce:18, chance:.35 },
  { type:"healer", text:"A retired Army medic runs a clinic out of a pool hall. Cash only. No questions, no paperwork, no judgment.", cost:[200,600], hpGain:30, chance:.18 },
];

// ── COMIC INTRO — 4 panels, tap-through ──
const COMIC_PANELS = [
  { bg:"linear-gradient(180deg,#0a0818 0%,#1a0a30 20%,#e87040 55%,#f0a030 75%,#060E1A 100%)", text:"MIAMI. AUGUST 1986.", sub:"Hot enough that the asphalt on the causeway prints your shoes.", icon:"🌴" },
  { bg:"linear-gradient(180deg,#0a1420 0%,#0d2438 40%,#123048 70%,#060E1A 100%)", text:"A MAN WENT INTO THE WATER OFF VIRGINIA KEY.", sub:"Eleven days ago. They ruled it accidental. It took them an afternoon.", icon:"🌊" },
  { bg:"linear-gradient(180deg,#0a0a15 0%,#151525 40%,#252535 70%,#0a0a15 100%)", text:"HIS NAME WAS CÉSAR VARGAS.", sub:"He was your brother. You came down on the bus to bury him.", icon:"🕯️" },
  { bg:"linear-gradient(180deg,#050510 0%,#0d0a22 40%,#3d1040 80%,#060E1A 100%)", text:"THE GREYHOUND STATION. DOWNTOWN.", sub:"Ninety dollars. A duffel bag. A phone number on the back of a funeral card.", icon:"🚌" },
  { bg:"linear-gradient(180deg,#3d1040 0%,#8b2050 30%,#cc4060 60%,#060E1A 100%)", text:"HE LEFT TWO THINGS BEHIND.", sub:"A debt that does not care he is dead. And a face this city keeps mistaking for his.", icon:"📇" },
];

// ── COACH MARKS — one concept, ≤8 words, dismissed by action ──
const COACH_MARKS = {
  tap_drug:   { text:"Tap a drug to trade" },
  buy_low:    { text:"Buy low. Sell high." },
  travel_tip: { text:"Prices change every district →" },
  sell_here:  { text:"Green chip = profit here" },
  heat_warn:  { text:"Big deals raise heat" },
  debt_tip:   { text:"The book charges 8% interest" },
};

// ═══════════════════════════════════════════════════════════════
// UTILS + PRICE ENGINE
// ═══════════════════════════════════════════════════════════════
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const RF=(a,b)=>a+Math.random()*(b-a);
const FM=n=>(n<0?"-$":"$")+Math.abs(Math.round(n)).toLocaleString();
const CL=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const randNorm=()=>{const u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};

const initBasePrices=(rng)=>DRUGS.map(d=>d.mean+Math.floor((rng?rng.next()*2-1:randNorm())*d.mean*.15));
const initMomentum=()=>DRUGS.map(()=>(Math.random()-.5)*.4);
const evolveBasePrices=(prev,mom,evtDrug,evtType,evtMulti)=>prev.map((p,i)=>{
  const d=DRUGS[i],rev=d.theta*(d.mean-p),shock=d.sigma*p*randNorm()*.3,drift=mom[i]*p*.08;
  let np=p+rev+shock+drift;
  if(evtDrug===d.name&&evtMulti){const m=evtMulti[0]+Math.random()*(evtMulti[1]-evtMulti[0]);np*=m;}
  return Math.max(d.min*.5,Math.min(d.max*2.5,Math.round(np)));
});
const evolveMomentum=prev=>prev.map(m=>Math.random()<.15?-m+randNorm()*.2:CL(m*.85+randNorm()*.15,-1,1));
const getStreetPrices=(base,locIdx,eraDemand,localDemand,priceMulti=1)=>{
  const loc=LOCS[locIdx];
  return base.map((bp,i)=>{
    const d=DRUGS[i],locMul=loc.priceMod[d.tier],noise=1+randNorm()*.05;
    return Math.max(d.min,Math.round(bp*locMul*(eraDemand?eraDemand[i]:1)*(localDemand?localDemand[i]:1)*noise*priceMulti));
  });
};
const calcTxRisk=(amt,baseRisk,eraCopsMod)=>{
  if(amt<=3)return 0;
  const sizeMultiplier=Math.pow(Math.max(0,amt-8)/40,2.0);
  return Math.min(0.85,baseRisk*0.5*(1+sizeMultiplier)*eraCopsMod);
};
const calcLegalFees=(txValue,eraPenaltyMod,mod=1)=>Math.max(100,Math.floor((txValue*0.2*eraPenaltyMod+R(200,800))*mod));
const getEra=s=>ERAS[s.currentEra||0];

// ═══════════════════════════════════════════════════════════════
// LIVING CITY ENGINE — pure. Per-district demand, telegraphed supply
// shocks, patrol pressure, informants, crew loyalty, laundering, and
// a rival kingpin who plays the whole game against you.
// Every function takes state and returns new state or plain data.
// ═══════════════════════════════════════════════════════════════
const LOC_COUNT=LOCS.length;

const MKT={
  sellHit:0.009, buyDrain:0.005, demFloor:0.40, demCeil:1.45, recover:0.16,
  mktLo:0.30, mktHi:2.40,
  shockChance:0.26, shockCap:3,
  patrolMax:6, patrolDecay:0.55, patrolPerTrade:0.7,
  infMax:5, infGain:0.50, infDecay:0.20,
  wireKeep:6,
};

const initLocDemand=()=>LOCS.map(()=>DRUGS.map(()=>1));
const initPatrols=()=>LOCS.map(l=>Math.round(l.heat*100)/10);
const initInformants=()=>LOCS.map(()=>0);
const initRival=()=>({ power:5, cash:30000, heat:0, truce:0, confront:0, broken:false,
  flood:null, hitFuse:0, raids:0, lastAction:"build",
  lastText:"Counting money somewhere south of you." });
const pushWire=(wire,item)=>[item,...(wire||[])].slice(0,MKT.wireKeep);

// ── SUPPLY SHOCKS — announced one move before they land ──
const SHOCK_KINDS=[
  { kind:"spike", icon:"🚢", mult:[1.45,2.05],
    warn:"WIRE: Coast Guard is staging cutters off {L}. {D} there gets thin by morning.",
    landed:"Interdiction off {L} — {D} is scarce and expensive." },
  { kind:"spike", icon:"🚔", mult:[1.40,1.90],
    warn:"WIRE: Vice is prepping a sweep in {L}. Every connect there will sit on their hands.",
    landed:"Vice swept {L}. {D} is hard to find at any price." },
  { kind:"spike", icon:"🎉", mult:[1.35,1.75],
    warn:"WIRE: A convention books out {L} this week. Somebody there is going to want {D}.",
    landed:"{L} is full of out-of-towners. {D} moves at a premium." },
  { kind:"crash", icon:"📦", mult:[0.52,0.72],
    warn:"WIRE: A go-fast unloads tonight. {D} is about to flood {L}.",
    landed:"{D} is everywhere in {L}. Buyers are picky and prices are ugly." },
  { kind:"crash", icon:"🇨🇴", mult:[0.48,0.68],
    warn:"WIRE: The cartel is clearing inventory before the season. {D} will crater in {L}.",
    landed:"Cartel dumping killed the {D} price in {L}." },
  { kind:"crash", icon:"⚔", mult:[0.55,0.78],
    warn:"WIRE: Two crews in {L} are undercutting each other over {D}. It gets cheap before it gets bloody.",
    landed:"Price war on {D} in {L}. Cheap to buy. Miserable to sell." },
];
const rollShock=()=>{
  const t=SHOCK_KINDS[R(0,SHOCK_KINDS.length-1)];
  const drug=R(0,DRUG_COUNT-1);
  const citywide=Math.random()<0.22;
  const loc=citywide?-1:R(0,LOC_COUNT-1);
  const where=citywide?"Miami":LOCS[loc].name;
  const fill=str=>str.replace("{D}",DRUGS[drug].name).replace("{L}",where);
  return { kind:t.kind, icon:t.icon, drug, loc, pending:true, moves:R(2,4),
    mult:Math.round(RF(t.mult[0],t.mult[1])*100)/100,
    warn:fill(t.warn), landed:fill(t.landed) };
};

// ── MARKET MICROSTRUCTURE ──
// Local demand (what THIS district will still absorb), live shocks and the
// rival flooding a corner all fold into one capped multiplier per drug.
const shockMultAt=(shocks,loc,drugIdx)=>{
  let m=1;
  for(const sk of (shocks||[])){
    if(sk.pending||sk.drug!==drugIdx) continue;
    if(sk.loc>=0&&sk.loc!==loc) continue;
    m*=sk.mult;
  }
  return m;
};
const marketMult=(s,loc,drugIdx)=>{
  const row=(s.locDemand||[])[loc];
  let m=row?CL(row[drugIdx],MKT.demFloor,MKT.demCeil):1;
  m*=shockMultAt(s.shocks,loc,drugIdx);
  const fl=s.rival&&s.rival.flood;
  if(fl&&fl.loc===loc&&fl.drug===drugIdx&&(s.move||0)<fl.until) m*=0.84;
  return CL(m,MKT.mktLo,MKT.mktHi);
};
// Mutates the freshly generated price row in place so history, sparklines,
// buy price and sell price all agree. Called once per travel.
const applyMarketPrices=(s,loc,prices)=>{
  for(let i=0;i<prices.length;i++)
    prices[i]=Math.max(DRUGS[i].min,Math.round(prices[i]*marketMult(s,loc,i)));
  return prices;
};
// Every trade moves the district: dumping saturates it, buying it out
// tightens it, and volume anywhere pulls patrol cars and then informants.
const tradeMarketPatch=(s,drugIdx,amt,kind)=>{
  const loc=s.loc;
  const locDemand=(s.locDemand||initLocDemand()).map(r=>[...r]);
  const patrols=[...(s.patrols||initPatrols())];
  const informants=[...(s.informants||initInformants())];
  const districtSales=[...(s.districtSales||LOCS.map(()=>0))];
  const cur=locDemand[loc][drugIdx];
  if(kind==="sell"){
    locDemand[loc][drugIdx]=CL(cur*(1-Math.min(0.5,amt*MKT.sellHit)),MKT.demFloor,MKT.demCeil);
    districtSales[loc]=(districtSales[loc]||0)+amt;
  } else {
    locDemand[loc][drugIdx]=CL(cur*(1+Math.min(0.35,amt*MKT.buyDrain)),MKT.demFloor,MKT.demCeil);
  }
  const w=amt>=20?1:amt>=10?0.6:amt>=5?0.3:0.1;
  patrols[loc]=CL(patrols[loc]+w*MKT.patrolPerTrade,0,MKT.patrolMax);
  if(patrols[loc]>=2.6&&amt>=6)
    informants[loc]=CL(informants[loc]+MKT.infGain*(kind==="sell"?1:0.6),0,MKT.infMax);
  return { locDemand, patrols, informants, districtSales };
};

// ── RISK YOU CAN READ AND PLAN AROUND ──
const districtRisk=(s,loc)=>{
  const p=(s.patrols||[])[loc]||0, inf=(s.informants||[])[loc]||0;
  const den=((s.safeHouses||[])[loc]>=0)?0.88:1;
  const crew=Math.min(0.15,((s.enforcers||[])[loc]||0)*0.05);
  return CL((1+p*0.11+inf*0.16)*den*(1-crew),0.55,2.40);
};
// Exactly mirrors the heat math in processTravel, so the number the player
// is shown is the number they will get.
const heatAt=(s,loc)=>{
  const used=(s.inv||[]).reduce((a,b)=>a+b,0);
  const hc=used>50?3:used>20?2:used>0?0:-1;
  const passive=used===0?3:0;
  const sh=(s.safeHouses||[])[loc];
  let decay=(sh>=0?SAFE_HOUSES[sh].heatDecay:0)+((s.lifestyle||[]).includes("rolex")?2:0);
  if(s.dailyHeatDecayMod) decay*=s.dailyHeatDecayMod;
  const floor=Math.floor((s.totalProfit||0)/50000)+Math.floor((s.totalBusts||0)*3);
  return { next:Math.round(CL(Math.max(s.fedHeat+hc-decay-passive,floor),0,100)), floor };
};

// ── EMPIRE ECONOMICS — income you can strangle, upkeep that escalates ──
const empireIncome=s=>(s.turf||[]).reduce((sum,lv,i)=>{
  if(!lv) return sum;
  const row=(s.locDemand||[])[i];
  const sat=row?CL(row.reduce((a,b)=>a+b,0)/DRUG_COUNT,0.55,1.12):1;
  const pat=CL(1-((s.patrols||[])[i]||0)*0.06,0.66,1);
  const loy=CL((((s.enfLoyalty||[])[i])??100)/100,0.5,1.1);
  const held=((s.enforcers||[])[i]||0)>0?1:0.78;
  const col=((s.colTurf||[])[i]&&!(s.storyFlags||{}).col_peace)?0.8:1;
  return sum+Math.round(TURF_LEVELS[lv].income*CL(sat*pat*loy*held*col,0.35,1.12));
},0);
const crewUpkeep=s=>(s.enforcers||[]).reduce(
  (sum,e)=>sum+e*Math.round(ENFORCER_UPKEEP*(1+(s.currentEra||0)*0.15)),0);
const strengthOf=s=>Math.round((s.enforcers||[]).reduce((a,b)=>a+b,0)*2
  +(s.gun?4:0)+((s.cred||0)/12)+(s.turf||[]).filter(t=>t>0).length*2);

// ── LAUNDERING — clean money is safe and useless; dirty money is neither ──
const LAUNDER_CHANNELS=[
  { id:"cambio", name:"Casa de Cambio", icon:"💱", fee:0.20, cap:8000, risk:0,
    desc:"A window on Flagler that turns anything into anything. The rate is robbery. Nobody asks.",
    need:()=>true },
  { id:"club", name:"Door Receipts", icon:"🪩", fee:0.09, cap:14000, risk:0.07,
    desc:"The club reports a very good night. Every night. Auditors love a pattern.",
    need:s=>(s.lifestyle||[]).includes("club") },
  { id:"marina", name:"Charter Fleet", icon:"🚤", fee:0.13, cap:22000, risk:0.11,
    desc:"Charters out of Dinner Key that never leave the dock. Customs boards boats on slow afternoons.",
    need:s=>(s.lifestyle||[]).includes("boat")||!!s.importBonus },
  { id:"cass", name:"Cass's Network", icon:"🏦", fee:0.11, cap:45000, risk:0.05,
    desc:"Shells, a marina, two funeral homes. Paper trails have authors, and authors have memories.",
    need:s=>!!(s.storyFlags||{}).cass_network&&!(s.storyFlags||{}).cass_burned },
];
const launderUsed=(s,id)=>(s.launderMove===s.move)?(((s.launderUse||{})[id])||0):0;
const launderCap=(s,ch)=>Math.max(0,ch.cap-launderUsed(s,ch.id));

function processLaunder(s,channelId,amount){
  const ch=LAUNDER_CHANNELS.find(c=>c.id===channelId);
  if(!ch||!ch.need(s)) return { state:s, ok:false };
  const amt=Math.min(Math.floor(amount||0),s.cash,launderCap(s,ch));
  if(amt<500) return { state:s, ok:false };
  const fee=Math.floor(amt*ch.fee), clean=amt-fee;
  const use={...((s.launderMove===s.move)?(s.launderUse||{}):{})};
  use[ch.id]=(use[ch.id]||0)+amt;
  const effects=[{type:"SFX",name:"coin"},{type:"SPAWN",text:`✨ ${FM(clean)} CLEAN`,color:C.gold,y:.46}];
  let npcState=s.npcState, wire=s.newsWire;
  if(ch.risk&&Math.random()<ch.risk){
    npcState={...s.npcState, ramirez:{...s.npcState.ramirez,
      evidence:CL((s.npcState.ramirez.evidence||0)+1,0,20)}};
    wire=pushWire(wire,{icon:"🕵️",tone:"bad",move:s.move,
      text:`The wash through ${ch.name} left a trail. Somebody photocopied it.`});
    effects.push({type:"SPAWN",text:"🕵️ THE WASH LEFT A TRAIL (+1 EVIDENCE)",color:C.pink,y:.36},{type:"SHAKE"});
  }
  return { state:{...s, cash:s.cash-amt, cleanCash:(s.cleanCash||0)+clean, npcState, newsWire:wire,
    launderMove:s.move, launderUse:use, launderedTotal:(s.launderedTotal||0)+amt}, ok:true, effects };
}

// ── STREET OPERATIONS — informants and crew are problems you can pay,
//    threaten, or ignore, and each of those costs something different ──
function processPayInformant(s,loc){
  const inf=((s.informants||[])[loc])||0;
  if(inf<1||s.loc!==loc) return { state:s, ok:false };
  const cost=Math.floor(700+inf*1500+(s.totalProfit||0)*0.005);
  if(s.cash<cost) return { state:s, ok:false };
  const informants=[...s.informants]; informants[loc]=Math.max(0,inf-2.5);
  return { state:{...s, cash:s.cash-cost, informants,
    newsWire:pushWire(s.newsWire,{icon:"🤐",tone:"good",move:s.move,
      text:`Somebody in ${LOCS[loc].name} decided they never saw you. ${FM(cost)}, well spent.`})},
    ok:true, effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:`🤐 −${FM(cost)} SILENCE`,color:C.blue,y:.46}] };
}
function processLeanOnInformant(s,loc){
  const inf=((s.informants||[])[loc])||0;
  if(inf<1||s.loc!==loc) return { state:s, ok:false };
  const power=((s.enforcers||[])[loc]||0)*2+(s.gun?2:0)+Math.floor(s.cred/25);
  if(Math.random()<CL(0.22+power*0.09,0.22,0.88)){
    const informants=[...s.informants]; informants[loc]=0;
    return { state:{...s, informants, cred:CL(s.cred+2,0,100), fedHeat:CL(s.fedHeat+3,0,100),
      newsWire:pushWire(s.newsWire,{icon:"👊",tone:"good",move:s.move,
        text:`A short conversation in ${LOCS[loc].name}. The snitch has relatives in Georgia now.`})},
      ok:true, effects:[{type:"SFX",name:"sellBig"},{type:"SHAKE"},
        {type:"SPAWN",text:"👊 THE STREET GOT QUIET",color:C.orange,y:.46}] };
  }
  const npcState={...s.npcState, ramirez:{...s.npcState.ramirez,
    evidence:CL((s.npcState.ramirez.evidence||0)+2,0,20)}};
  const hp=CL(s.hp-R(6,14),0,100);
  const effects=[{type:"SFX",name:"police"},{type:"SHAKE"},{type:"FLASH",color:C.pink+"55"},
    {type:"PING",stat:"hp"},{type:"SPAWN",text:"🚨 WITNESSED (+2 EVIDENCE)",color:C.pink,y:.46}];
  if(hp<=0) effects.push({type:"GAME_OVER",ending:"dead"});
  return { state:{...s, npcState, hp, fedHeat:CL(s.fedHeat+8,0,100),
    hudSeen:{...s.hudSeen,hp:true},
    newsWire:pushWire(s.newsWire,{icon:"🚨",tone:"bad",move:s.move,
      text:`It went badly in ${LOCS[loc].name}. There is a report with your description on it.`})},
    ok:true, effects };
}
function processCrewBonus(s,loc){
  const n=((s.enforcers||[])[loc])||0;
  if(n<=0) return { state:s, ok:false };
  const cost=n*900;
  if(s.cash<cost) return { state:s, ok:false };
  const enfLoyalty=[...(s.enfLoyalty||LOCS.map(()=>100))];
  if(enfLoyalty[loc]>=98) return { state:s, ok:false };
  enfLoyalty[loc]=CL(enfLoyalty[loc]+34,0,100);
  return { state:{...s, cash:s.cash-cost, enfLoyalty, cred:CL(s.cred+1,0,100)}, ok:true,
    effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:"👊 CREW PAID — LOYALTY UP",color:C.gold,y:.46}] };
}

// ── THE RIVAL KINGPIN ──
// El Colombiano runs a parallel empire: he grows, floods your districts,
// buys cops, raids your turf and escalates through three confrontations.
function processSabotage(s){
  const cost=6000, r=s.rival||initRival();
  if(s.cash<cost||s.cred<25||r.broken) return { state:s, ok:false };
  const rival={...r};
  const npcState={...s.npcState, colombiano:{...s.npcState.colombiano, met:true}};
  const odds=CL(0.35+s.cred/220+(s.enforcers||[]).reduce((a,b)=>a+b,0)*0.03,0.35,0.85);
  if(Math.random()<odds){
    rival.power=Math.max(3,Math.round((rival.power-3)*10)/10);
    rival.cash=Math.max(0,rival.cash-8000);
    return { state:{...s, cash:s.cash-cost, rival, npcState,
      newsWire:pushWire(s.newsWire,{icon:"🔥",tone:"good",move:s.move,
        text:"A Colombian stash house in Hialeah burned down. No insurance was carried."})},
      ok:true, effects:[{type:"SFX",name:"sellBig"},{type:"SHAKE"},
        {type:"SPAWN",text:"🔥 −3 RIVAL POWER",color:C.gold,y:.46}] };
  }
  npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-2,-10,10);
  return { state:{...s, cash:s.cash-cost, rival, npcState, fedHeat:CL(s.fedHeat+6,0,100),
    storyFlags:{...s.storyFlags,col_war:true},
    newsWire:pushWire(s.newsWire,{icon:"🚨",tone:"bad",move:s.move,
      text:"Your people got caught doing it. He knows who sent them."})},
    ok:true, effects:[{type:"SFX",name:"police"},{type:"SHAKE"},
      {type:"SPAWN",text:"🚨 IT WENT WRONG",color:C.pink,y:.46}] };
}

const buildRivalEvent=(level,st,rival)=>{
  if(level>=3){
    const mine=strengthOf(st), cost=Math.floor((st.cash+st.bank)*0.25);
    return { kind:"rival", level:3, header:"THE RIVAL — ENDGAME", icon:"🛥", color:C.gold,
      title:"THE LAST BOAT",
      text:"He is loading a boat at a private dock in the Keys, which means he is either leaving or clearing space for something. His man calls your motel at midnight. \"He says you can come to the dock tonight. He says bring whatever you think you need.\"",
      opts:[
        { id:"assault", label:`🔫 TAKE THE DOCK — YOU ${mine} vs HIM ${Math.round(rival.power)}`, color:C.pink, cost:0,
          note:`You need roughly ${Math.ceil(rival.power*0.8)} strength on the night — how hard you fight swings it by half, and luck does the rest. Win and his organization is yours. Lose and you crawl home short a district.` },
        { id:"tribute_final", label:`💵 BUY PERMANENT PEACE — ${FM(cost)}`, color:C.gold, cost,
          note:"He never touches you again. Your escape fund never recovers either." },
        { id:"informant", label:"📞 HAND HIM TO RAMIREZ", color:C.blue, cost:0,
          note:"He disappears tonight. So does 12 cred — and Ramirez now knows exactly who you are (+5 evidence)." },
      ] };
  }
  if(level===2) return { kind:"rival", level:2, header:"THE RIVAL — THE SIT-DOWN", icon:"🗺", color:C.orange,
    title:"THE SIT-DOWN",
    text:"Two cars, one warehouse in Hialeah, nobody armed — officially. He has the map again and this time your name is written on part of it. \"We are past the part where one of us leaves,\" he says. \"Now we only choose HOW.\"",
    opts:[
      { id:"split", label:"🕊 SPLIT THE CITY", color:C.green, cost:0,
        note:"Peace: his crews stop undercutting you and the raids stop. He keeps growing anyway." },
      { id:"setup", label:"🕵️ GIVE RAMIREZ HIS ROUTE", color:C.blue, cost:0,
        note:"Guts his organization. Ramirez gets your number with it (+2 evidence, and the file starts moving)." },
      { id:"war", label:"⚔ NO DEAL — WAR", color:C.pink, cost:0,
        note:"+6 cred. He commits everything to taking your blocks." },
    ] };
  const tcost=Math.floor((st.cash||0)*0.12);
  return { kind:"rival", level:1, header:"THE RIVAL — THE OFFER", icon:"🥃", color:C.orange,
    title:"THE OFFER",
    text:"A waiter you did not order from sets down a rum you did not ask for. El Colombiano is two tables away, not looking at you. His man leaves a napkin with a number on it: what he thinks your week is worth. \"He is not asking for your city,\" the man says. \"Only rent.\"",
    opts:[
      { id:"tribute", label:`💵 PAY THE RENT — ${FM(tcost)}`, color:C.gold, cost:0,
        note:"He stands down for eight moves. Your money buys his next block." },
      { id:"buyoff", label:"🤝 BUY HIS LIEUTENANT — $12,000", color:C.blue, cost:12000,
        note:"Might split his organization. Might fund the man who reports you." },
      { id:"refuse", label:"🖕 SEND THE NAPKIN BACK", color:C.pink, cost:0,
        note:"+4 cred. His crews start working your corners tomorrow." },
    ] };
};

function resolveWorldEvent(s,ev,opt,skill=0.5){
  const id=(opt&&opt.id)?opt.id:opt;
  const rival={...(s.rival||initRival())};
  const npcState={...s.npcState, colombiano:{...s.npcState.colombiano}, ramirez:{...s.npcState.ramirez}};
  const storyFlags={...s.storyFlags};
  const montage=[...(s.montage||[])];
  const effects=[{type:"SFX",name:"click"}];
  let cash=s.cash, bank=s.bank, hp=s.hp, cred=s.cred, evtMsg=null;
  let colTurf=[...(s.colTurf||LOCS.map(()=>false))];
  const turf=[...(s.turf||LOCS.map(()=>0))];
  let wire=s.newsWire;
  npcState.colombiano.met=true;

  if(id==="tribute"){
    const cost=Math.min(cash,Math.floor(cash*0.12));
    cash-=cost; rival.cash+=cost; rival.power+=1.5; rival.truce=8;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)+1,-10,10);
    cred=CL(cred-2,0,100);
    evtMsg=`🇨🇴 You paid the rent — ${FM(cost)}. His crews will look through you for a while. Everybody else saw you pay.`;
    montage.push({move:s.move,text:`Paid El Colombiano ${FM(cost)} in tribute.`});
    effects.push({type:"SFX",name:"coin"},{type:"SPAWN",text:`−${FM(cost)} TRIBUTE`,color:C.pink,y:.46});
    wire=pushWire(wire,{icon:"🇨🇴",tone:"info",move:s.move,text:"Word is you pay rent to the Colombians now."});
  } else if(id==="buyoff"){
    if(cash<12000) return { state:s, ok:false };
    cash-=12000;
    if(Math.random()<0.6){
      rival.power=Math.max(4,rival.power-6); rival.cash=Math.max(0,rival.cash-9000);
      evtMsg="🤝 His lieutenant took the envelope, and two weeks later took three crews with him. The Colombian is smaller today than he was yesterday.";
      effects.push({type:"SFX",name:"sellBig"},{type:"SPAWN",text:"🤝 HIS ORGANIZATION SPLIT",color:C.gold,y:.46});
      wire=pushWire(wire,{icon:"🤝",tone:"good",move:s.move,text:"A Colombian lieutenant left with three crews. Nobody is calling it a defection."});
    } else {
      npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-3,-10,10);
      rival.hitFuse=s.move+2; storyFlags.col_war=true;
      evtMsg="🤝 The lieutenant carried your money to his boss the same afternoon. You bought a $12,000 introduction to a grudge.";
      effects.push({type:"SFX",name:"police"},{type:"SHAKE"},{type:"FLASH",color:C.pink+"44"});
      wire=pushWire(wire,{icon:"🚗",tone:"bad",move:s.move,text:"You are being watched. He knows what you tried to buy."});
    }
  } else if(id==="refuse"){
    cred=CL(cred+4,0,100); storyFlags.col_war=true;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-2,-10,10);
    evtMsg="🖕 You sent the napkin back with the number crossed out. The waiter looked ill. El Colombiano laughed once and never looked at you again.";
    effects.push({type:"SPAWN",text:"⭐ +4 CRED",color:C.gold,y:.46});
  } else if(id==="split"){
    storyFlags.col_peace=true; storyFlags.col_war=false;
    rival.truce=14; rival.flood=null; rival.hitFuse=0;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)+2,-10,10);
    evtMsg="🕊 Somebody drew a line through the map. His crews stop undercutting you tonight — and he keeps everything on his side of it, growing.";
    montage.push({move:s.move,text:"Split Miami with El Colombiano at a sit-down."});
    effects.push({type:"SFX",name:"coin"});
  } else if(id==="setup"){
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+2,0,20);
    npcState.ramirez.met=true;
    rival.power=Math.max(4,rival.power-9); rival.heat+=25; rival.cash=Math.max(0,rival.cash-15000);
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-3,-10,10);
    storyFlags.col_war=true;
    evtMsg="🕵️ Customs opened a container in Port Everglades that was never supposed to be opened. He lost a season. You lost deniability.";
    effects.push({type:"SFX",name:"police"},{type:"SPAWN",text:"🕵️ −9 RIVAL POWER, +2 EVIDENCE",color:C.blue,y:.46});
    wire=pushWire(wire,{icon:"🕵️",tone:"info",move:s.move,text:"A seizure at Port Everglades. Somebody talked. Two somebodies, actually."});
  } else if(id==="war"){
    cred=CL(cred+6,0,100); storyFlags.col_war=true; rival.power+=2;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-2,-10,10);
    evtMsg="⚔ Nobody shook hands. Both cars left fast. By morning there were new crews on two of your corners.";
    effects.push({type:"SFX",name:"police"},{type:"SPAWN",text:"⚔ WAR — +6 CRED",color:C.pink,y:.46});
  } else if(id==="assault"){
    const mine=Math.round(strengthOf(s)*(0.45+skill*1.10))+R(0,4);
    if(mine>=rival.power*0.8){
      const take=Math.floor(rival.cash*0.5);
      cash+=take; cred=CL(cred+15,0,100);
      colTurf=colTurf.map(()=>false);
      rival.broken=true; rival.power=0; rival.cash=0; rival.flood=null; rival.hitFuse=0; rival.truce=999;
      storyFlags.col_broken=true; storyFlags.col_war=false;
      evtMsg=`👑 The dock burned for an hour. His people left in boats that were not his. ${FM(take)} came out of a safe that was. Miami is short one kingpin.`;
      montage.push({move:s.move,text:"Took the dock. Broke El Colombiano."});
      effects.push({type:"SFX",name:"sellMassive"},{type:"SHAKE"},{type:"FLASH",color:C.gold+"55"},
        {type:"CASHFLY",count:14},{type:"SPAWN",text:"👑 HIS EMPIRE IS YOURS",color:C.gold,y:.42});
      wire=pushWire(wire,{icon:"👑",tone:"good",move:s.move,text:"El Colombiano is finished. The corners are asking who to pay now."});
    } else {
      const loss=R(18,30); hp=CL(hp-loss,0,100);
      const li=turf.map((t,i)=>t>0?i:-1).filter(i=>i>=0);
      if(li.length){ const d=li[R(0,li.length-1)]; turf[d]=Math.max(0,turf[d]-1); }
      npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-3,-10,10);
      storyFlags.col_war=true; rival.power+=3; rival.truce=0;
      evtMsg=`🔫 They were ready. Of course they were ready. −${loss} HP and a block you used to own.`;
      effects.push({type:"SFX",name:"police"},{type:"SHAKE"},{type:"FLASH",color:C.pink+"66"},{type:"PING",stat:"hp"});
      wire=pushWire(wire,{icon:"🔫",tone:"bad",move:s.move,text:"The dock was a trap. Everybody knew it but you."});
    }
  } else if(id==="tribute_final"){
    let cost=Math.floor((cash+bank)*0.25);
    const fromCash=Math.min(cash,cost); cash-=fromCash; cost-=fromCash;
    bank=Math.max(0,bank-cost);
    rival.truce=999; rival.power+=2; rival.flood=null; rival.hitFuse=0;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)+2,-10,10);
    storyFlags.col_peace=true; storyFlags.col_war=false;
    evtMsg="🕊 A quarter of everything bought a peace with no expiry date. He toasts you at the dock. You do not drink it.";
    montage.push({move:s.move,text:"Bought a permanent peace from El Colombiano."});
    effects.push({type:"SFX",name:"coin"},{type:"SPAWN",text:"🕊 PERMANENT PEACE",color:C.green,y:.46});
  } else if(id==="informant"){
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+5,0,20);
    npcState.ramirez.met=true;
    npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-4,-10,10);
    cred=CL(cred-12,0,100);
    rival.broken=true; rival.power=0; rival.flood=null; rival.hitFuse=0; rival.truce=999;
    colTurf=colTurf.map(()=>false);
    storyFlags.col_broken=true; storyFlags.became_informant=true;
    evtMsg="📞 Federal agents took the dock at 4 AM. Ramirez did not thank you. He wrote your name down twice.";
    montage.push({move:s.move,text:"Handed El Colombiano to Vice."});
    effects.push({type:"SFX",name:"police"},{type:"FLASH",color:C.blue+"55"},
      {type:"SPAWN",text:"📞 HE IS GONE — SO IS YOUR NAME",color:C.blue,y:.44});
    wire=pushWire(wire,{icon:"📞",tone:"info",move:s.move,text:"A federal raid took the Keys dock. Somebody made a phone call."});
  } else return { state:s, ok:false };

  if(hp<=0) effects.push({type:"GAME_OVER",ending:"dead"});
  return { state:{...s, cash:Math.max(0,cash), bank, hp, cred, turf, colTurf, rival, npcState, storyFlags,
    montage, newsWire:wire, evtMsg:evtMsg||s.evtMsg,
    hudSeen:{...s.hudSeen,hp:s.hudSeen.hp||hp<s.hp}}, ok:true, effects };
}

// ── THE WORLD TICK — one call per travel, after the state is assembled.
//    Returns a patch (never mutates), effects, and any modal it wants raised.
function worldTick(s,out,ctx){
  const nm=out.move, destLoc=out.loc, era=getEra(out);
  const effects=[], patch={};
  let evtMsg=null, turfWar=null, worldEvent=null;
  let wire=[...(s.newsWire||[])];
  let cash=out.cash, bank=out.bank, hp=out.hp, cred=out.cred;
  const npcState={...out.npcState, ramirez:{...out.npcState.ramirez}, colombiano:{...out.npcState.colombiano}};
  const storyFlags={...out.storyFlags};
  const colTurf=[...(out.colTurf||LOCS.map(()=>false))];
  const enforcers=[...(out.enforcers||LOCS.map(()=>0))];
  const turf=[...(out.turf||LOCS.map(()=>0))];

  // 1 ── the districts breathe back toward normal
  const locDemand=(s.locDemand||initLocDemand()).map(row=>row.map(v=>
    Math.round(CL(v+(1-v)*MKT.recover,MKT.demFloor,MKT.demCeil)*1000)/1000));
  const districtSales=(s.districtSales||LOCS.map(()=>0)).map(v=>Math.round(v*8.5)/10);

  // 2 ── patrols chase your noise, informants forget slowly
  const patrols=(s.patrols||initPatrols()).map((p,i)=>{
    const base=Math.round(LOCS[i].heat*100)/10;
    let v=p-MKT.patrolDecay*(i===destLoc?0.5:1);
    if(i===destLoc&&out.fedHeat>=35) v+=out.fedHeat>=60?0.5:0.25;
    v+=turf[i]*0.18;
    return Math.round(CL(Math.max(base,v),0,MKT.patrolMax)*100)/100;
  });
  const informants=(s.informants||initInformants()).map((v,i)=>
    Math.round(CL(i===destLoc?v:v-MKT.infDecay,0,MKT.infMax)*100)/100);
  const infHere=informants[destLoc]||0;
  if(infHere>=2.4&&(npcState.ramirez.evidence||0)<12&&Math.random()<0.10+infHere*0.04){
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+1,0,20);
    evtMsg="🐀 Somebody around here has your plate number written down. The file grew a page.";
    wire=pushWire(wire,{icon:"🐀",tone:"bad",move:nm,text:`An informant in ${LOCS[destLoc].name} called Vice. +1 evidence.`});
  }

  // 3 ── supply shocks: telegraphed, then live, then over
  const shocks=[];
  for(const sk of (s.shocks||[])){
    if(sk.pending){
      shocks.push({...sk,pending:false});
      wire=pushWire(wire,{icon:sk.icon,tone:sk.kind==="spike"?"good":"bad",move:nm,text:sk.landed});
      continue;
    }
    const left=(sk.moves||1)-1;
    if(left>0) shocks.push({...sk,moves:left});
    else wire=pushWire(wire,{icon:"⌛",tone:"info",move:nm,
      text:`${DRUGS[sk.drug].name} ${sk.loc>=0?"in "+LOCS[sk.loc].name:"citywide"} is back to normal.`});
  }
  if(shocks.length<MKT.shockCap&&Math.random()<MKT.shockChance){
    const sk=rollShock();
    shocks.push(sk);
    wire=pushWire(wire,{icon:"📻",tone:"info",move:nm,text:sk.warn});
    effects.push({type:"SFX",name:"pager"});
  }

  // 4 ── street rivals spoil the buyers wherever they are standing
  const focus=[...(s.rivalFocus||[])];
  (out.rivals||[]).forEach((rv,i)=>{
    if(focus[i]==null||Math.random()<0.25) focus[i]=R(0,DRUG_COUNT-1);
    const L=rv.loc, D=focus[i];
    if(L>=0&&L<LOC_COUNT) locDemand[L][D]=CL(locDemand[L][D]*0.95,MKT.demFloor,MKT.demCeil);
    if(L===destLoc&&Math.random()<0.16)
      wire=pushWire(wire,{icon:"⚔",tone:"bad",move:nm,
        text:`${rv.name} is moving ${DRUGS[D].name} in ${LOCS[L].name}. Buyers here have options.`});
  });

  // 5 ── the rival kingpin wakes up once you are worth his attention
  const rival={...(s.rival||initRival())};
  if(storyFlags.col_broken) rival.broken=true;
  const grudge=Math.max(0,-(npcState.colombiano.trust||0))+(storyFlags.col_war?2:0);

  // 6 ── the crew: paid on time they hold, unpaid they take other offers
  const enfLoyalty=[...(s.enfLoyalty||LOCS.map(()=>100))];
  if(enforcers.some(e=>e>0)){
    if(cash<0){
      cash=0;
      for(let i=0;i<enfLoyalty.length;i++) if(enforcers[i]>0) enfLoyalty[i]=CL(enfLoyalty[i]-20,0,100);
      evtMsg=evtMsg||"👊 Payday came and went. Your crew noticed. They always notice.";
      wire=pushWire(wire,{icon:"👊",tone:"bad",move:nm,text:"The crew went unpaid. Loyalty is bleeding out."});
      effects.push({type:"SHAKE"},{type:"SPAWN",text:"👊 CREW UNPAID",color:C.pink,y:.5});
    } else {
      const gain=(cred>=40?2.5:1.5)-(era.copsMod>=1.6?1:0);
      for(let i=0;i<enfLoyalty.length;i++) enfLoyalty[i]=CL(enfLoyalty[i]+(enforcers[i]>0?gain:3),0,100);
    }
    for(let i=0;i<enforcers.length;i++){
      if(enforcers[i]>0&&enfLoyalty[i]<=28&&Math.random()<0.28){
        enforcers[i]-=1; enfLoyalty[i]=CL(enfLoyalty[i]+34,0,100);
        const flip=!rival.broken&&Math.random()<0.5;
        if(flip) rival.power+=1.5;
        evtMsg=evtMsg||(flip
          ?`👊 One of your people in ${LOCS[i].name} is working a Colombian corner now. He did not say goodbye.`
          :`👊 One of your people in ${LOCS[i].name} did not show up. His apartment is empty.`);
        wire=pushWire(wire,{icon:"👊",tone:"bad",move:nm,
          text:flip?`A soldier defected to El Colombiano in ${LOCS[i].name}.`:`A soldier walked off in ${LOCS[i].name}.`});
        effects.push({type:"SHAKE"});
      }
    }
  }

  // 7 ── his moves
  const awake=!rival.broken&&((out.currentEra||0)>=1||(out.totalProfit||0)>=20000);
  if(awake){
    rival.power=Math.min(60,Math.round((rival.power+0.28+(out.currentEra||0)*0.10
      +colTurf.filter(Boolean).length*0.18)*10)/10);
    rival.cash+=1000+colTurf.filter(Boolean).length*800;
    if(rival.truce>0&&rival.truce<900) rival.truce--;
    if(rival.flood&&nm>=rival.flood.until) rival.flood=null;
    npcState.colombiano.met=true;
    storyFlags.col_rival_active=true;

    if(rival.truce<=0&&nm%2===0){
      const mine=turf.map((t,i)=>t>0?i:-1).filter(i=>i>=0);
      const open=LOCS.map((l,i)=>i).filter(i=>!turf[i]&&!colTurf[i]&&i!==destLoc);
      const roll=Math.random(), warMode=grudge>=3&&!storyFlags.col_peace;
      if(warMode&&mine.length&&roll<0.22&&nm-(rival.lastRaid||0)>=4){
        const target=mine[R(0,mine.length-1)];
        turfWar={ loc:target, rivalName:"El Colombiano", rivalPower:CL(Math.round(rival.power*0.5)+R(0,2),3,15) };
        rival.raids=(rival.raids||0)+1; rival.lastRaid=nm;
        rival.lastAction="raid"; rival.lastText=`Moving on your block in ${LOCS[target].name}.`;
      } else if(roll<0.50){
        const L=(mine.length&&Math.random()<0.6)?mine[R(0,mine.length-1)]:R(0,LOC_COUNT-1);
        const D=R(0,DRUG_COUNT-1);
        rival.flood={loc:L,drug:D,until:nm+3};
        locDemand[L][D]=CL(locDemand[L][D]*0.88,MKT.demFloor,MKT.demCeil);
        rival.lastAction="flood"; rival.lastText=`Dumping ${DRUGS[D].name} in ${LOCS[L].name}.`;
        wire=pushWire(wire,{icon:"🇨🇴",tone:"bad",move:nm,
          text:`He is flooding ${LOCS[L].name} with ${DRUGS[D].name}. Sells there are ruined for a few days.`});
      } else if(roll<0.68&&open.length&&!storyFlags.col_peace){
        const claim=open[R(0,open.length-1)];
        colTurf[claim]=true; rival.power+=0.6;
        rival.lastAction="expand"; rival.lastText=`Took ${LOCS[claim].name}.`;
        wire=pushWire(wire,{icon:"🇨🇴",tone:"bad",move:nm,
          text:`New paint on the corners in ${LOCS[claim].name}. His crews work it now.`});
      } else if(roll<0.76&&(npcState.ramirez.evidence||0)<10){
        npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+1,0,20);
        rival.heat=Math.max(0,rival.heat-2);
        rival.lastAction="tip"; rival.lastText="Fed Vice a name. Yours.";
        wire=pushWire(wire,{icon:"📞",tone:"bad",move:nm,
          text:"An anonymous call to Vice today. Anonymous, accurate, and Colombian."});
      } else {
        rival.power+=0.7; rival.cash+=4500;
        rival.lastAction="build"; rival.lastText="Quiet week. Counting money.";
      }
    }

    // the contract, telegraphed two moves out
    if(grudge>=5&&!rival.hitFuse&&rival.truce<=0&&Math.random()<0.20){
      rival.hitFuse=nm+2;
      evtMsg=evtMsg||"🚗 A cream-colored Chevy has been parked across from your place since Tuesday. Nobody gets out of it.";
      wire=pushWire(wire,{icon:"🚗",tone:"bad",move:nm,text:"You are being watched. Two moves, maybe less."});
      effects.push({type:"SFX",name:"police"});
    }
    if(rival.hitFuse&&nm>=rival.hitFuse){
      rival.hitFuse=0;
      const guard=(out.gun?3:0)+(enforcers[destLoc]||0)*2+(((out.safeHouses||[])[destLoc]>=0)?2:0);
      if(guard>=5){
        cred=CL(cred+4,0,100);
        npcState.colombiano.trust=CL((npcState.colombiano.trust||0)-1,-10,10);
        evtMsg="🔫 They came for you in a parking lot. Your people were already there. Somebody else went to the hospital tonight.";
        effects.push({type:"SHAKE"},{type:"SFX",name:"sellBig"},{type:"SPAWN",text:"🔫 THEY MISSED — +4 CRED",color:C.gold,y:.42});
        wire=pushWire(wire,{icon:"🔫",tone:"good",move:nm,text:"Somebody tried. Somebody failed. The street noticed both."});
      } else {
        const loss=R(10,22), take=Math.min(Math.max(0,cash),R(1500,6000));
        hp=CL(hp-loss,0,100); cash-=take;
        evtMsg=`🔫 Two men, one car, eleven seconds. −${loss} HP${take>0?", −"+FM(take):""}. You never saw faces.`;
        effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"66"},{type:"SFX",name:"police"},{type:"PING",stat:"hp"});
        wire=pushWire(wire,{icon:"🔫",tone:"bad",move:nm,text:"Shots on your block. Yours, specifically."});
      }
    }

    // escalating confrontations — power 13 / 22 / 34
    const level=rival.power>=34?3:rival.power>=22?2:rival.power>=13?1:0;
    const busy=turfWar||(ctx&&(ctx.turfWar||ctx.dealEvent||ctx.randEnc));
    if(level>(rival.confront||0)&&!busy){
      rival.confront=level;
      worldEvent=buildRivalEvent(level,{...out,cash,bank,cred},rival);
      effects.push({type:"SFX",name:"pager"});
    }
  }

  // 8 ── Treasury: dirty money is the only money they can take
  let forfeitFuse=s.forfeitFuse||0;
  if(!forfeitFuse&&out.fedHeat>=58&&(cash+bank)>=50000&&Math.random()<0.18){
    forfeitFuse=nm+3;
    evtMsg=evtMsg||"🏛 A Treasury agent spent the afternoon with your bank's records. Dirty money is the only kind they can take.";
    wire=pushWire(wire,{icon:"🏛",tone:"bad",move:nm,
      text:"Treasury subpoenaed account records. Wash it, spend it, or lose it — three moves."});
    effects.push({type:"SFX",name:"pager"});
  } else if(forfeitFuse&&nm>=forfeitFuse){
    forfeitFuse=0;
    if(out.fedHeat>=45){
      const sb=Math.floor(bank*0.25), sc=Math.floor(Math.max(0,cash)*0.10);
      bank-=sb; cash-=sc;
      evtMsg=`🏛 ASSET FORFEITURE. ${FM(sb+sc)} seized. The clean money in your pocket is untouched — that was always the point of it.`;
      effects.push({type:"SHAKE"},{type:"FLASH",color:C.blue+"55"},{type:"SFX",name:"police"},
        {type:"SPAWN",text:`−${FM(sb+sc)} SEIZED`,color:C.pink,y:.48});
      wire=pushWire(wire,{icon:"🏛",tone:"bad",move:nm,text:`Forfeiture order executed: ${FM(sb+sc)} gone.`});
    } else {
      evtMsg=evtMsg||"🏛 The audit closed. Nothing on paper, nothing to take. Cold money is invisible money.";
      wire=pushWire(wire,{icon:"🏛",tone:"good",move:nm,text:"Treasury closed the file. You were boring enough."});
    }
  }

  patch.locDemand=locDemand; patch.districtSales=districtSales;
  patch.patrols=patrols; patch.informants=informants;
  patch.shocks=shocks; patch.newsWire=wire; patch.rivalFocus=focus;
  patch.rival=rival; patch.enfLoyalty=enfLoyalty; patch.enforcers=enforcers;
  patch.colTurf=colTurf; patch.turf=turf; patch.npcState=npcState; patch.storyFlags=storyFlags;
  patch.cash=Math.max(0,cash); patch.bank=Math.max(0,bank); patch.hp=hp; patch.cred=cred;
  patch.forfeitFuse=forfeitFuse;
  if(hp<=0) effects.push({type:"GAME_OVER",ending:"dead"});
  if(hp<out.hp) patch.hudSeen={...out.hudSeen,hp:true};
  return { patch, effects, evtMsg, turfWar, worldEvent };
}

// Sky colors for the living header — heat bleeds the sky red
const skyStops=(move,heat)=>{
  const night=move%2===1, h=CL(heat/100,0,1);
  if(night){
    const r=Math.round(12+h*70), g=Math.round(16+h*6), b=Math.round(46-h*22);
    return [`rgb(${r},${g},${b})`, "#0a1030", C.midnight];
  }
  if(h<.3) return ["#1a1040","#7a2a52","#f09819"];
  if(h<.6) return ["#1a0a20","#9a3040","#c05418"];
  return ["#260a0a","#8a1818","#cc2020"];
};

// ── NPC registry ──
const NPCS = {
  maria:      { name:"Maria Santos",   role:"THE INSIDER",     color:C.flamingo, glow:"255,105,180" },
  ramirez:    { name:"Det. Ramirez",   role:"VICE INTELLIGENCE", color:C.blue,   glow:"0,229,255" },
  colombiano: { name:"El Colombiano",  role:"THE RIVAL",       color:C.orange,   glow:"255,107,53" },
  tiburon:    { name:"Tiburón",        role:"THE LOAN SHARK",  color:C.green,    glow:"0,201,167" },
  cass:       { name:"Cass Delgado",   role:"THE LAUNDERER",   color:C.gold,     glow:"255,215,0" },
  narrator:   { name:"MIAMI",          role:"AUGUST 1986",     color:C.purple,   glow:"123,47,190" },
  nestor:     { name:"Néstor Vargas",  role:"THE BROTHER",     color:C.gold,     glow:"255,215,0" },
};

// ═══════════════════════════════════════════════════════════════
// NARRATIVE ENGINE — Quality-Based Storylets
// ═══════════════════════════════════════════════════════════════
const STORY = {
  // ═══════════════════════════════════════════════════════════
  // MARIA SANTOS — the ally who wants something (ids: m_)
  // ACT I: m_brick_call, m_gallery, m_cesar_ledger
  // ACT II: m_not_surprised, m_elena_show, m_back_office, m_causeway_lie
  // ACT III: m_maria_knew, m_subpoena, m_last_ask, m_after_betrayal, m_after_protection
  // ═══════════════════════════════════════════════════════════

  // ── ACT I ──────────────────────────────────────────────────
  m_brick_call: { speaker:"maria", portrait:"amused", priority:60,
    conditions:{ flag:"c_opened", flagNot:"m_met" },
    lines:[
      { text:"The payphone outside the Greyhound station rings while you are still deciding whether to call the number on the back of the funeral card. The man leaning on it says, “It’s for you,” and walks off, which is how you learn this city already knows your name.", portrait:"neutral" },
      { text:"“César’s brother. Ninety dollars, a duffel bag, and a haircut from a town with one barber.” A woman’s voice. Amused, expensive, in no hurry at all. “Relax. If I were police you would be in a van already, and the van would have air conditioning, which is more than that phone booth can say.”", portrait:"amused" },
      { text:"“They gave you his things at the funeral home in a paper sack. Look in the sack, under the Dolphins shirt. That is a kilo, and your brother owed me money — I say that part first, because you will hear it from somebody eventually and I prefer to be the one who chooses the sentence. Which makes it partly mine. Little Havana, tonight. I take forty. Or argue. Arguing is also fine. It is how I learn what people are.”", portrait:"knowing" },
    ],
    choices:[
      { text:"Forty is fine. You knew him.", reaction:"The buyer arrives in a white Countach and never gets out of it. An envelope comes through the window: $4,800, banded, still warm from somebody’s dashboard. “It took César three days to agree to that number,” Maria says down the line. “You did it in nine seconds. Now you have money, which is the least interesting thing you will ever have. I’ll be in touch.”", effects:{ cashDelta:4800, "npc.maria.trust":2, "npc.maria.met":true, flags:["m_met","m_took_terms"], montage:"Flipped Cesar's last kilo through Maria. $4,800." } },
      { text:"Fifty-fifty. I never met you.", reaction:"Silence long enough to hear the traffic on her end. Then: “Fifty-fifty. Okay, cowboy.” $6,000 through the window of a car that never stops running. “You have just taught me that our friendship has a rate. I am writing the number down. Not as a threat — I simply find that I never forget the ones I have to negotiate with, and I would rather you knew that going in.”", effects:{ cashDelta:6000, "npc.maria.trust":1, "npc.maria.met":true, flags:["m_met","m_priced_her"], montage:"Squeezed Maria for 50/50 on the first kilo. $6,000. She wrote it down." } },
    ] },

  m_gallery: { speaker:"maria", portrait:"amused", priority:11,
    conditions:{ flag:"m_met", flagNot:"m_gallery_done", totalProfitGte:3000, cashGte:4000, dealsSinceGte:2 },
    lines:[
      { text:"The gallery is between shows, which means it is a white room with a horse in it. The horse is four feet of oil paint, aggressively sad, and priced at twenty-eight thousand dollars.", portrait:"neutral" },
      { text:"“Don’t make that face. Art is subjective. Laundry is objective.” She writes something on a clipboard, which is the thing she does instead of having feelings. “I have sold that horse four times this year. He outperforms the Basquiat and he has never once asked me about the market.”", portrait:"amused" },
      { text:"“Your money is loud right now. Cash is loud — it has a smell, and men who carry it start walking differently, and eventually somebody at a bank remembers a face. Bring it here and it becomes a receipt. A receipt is the quietest object in America.” She caps the pen. “César used the horse. Two years, the most boring man in my books. Then in March he stopped, and I did not ask him why, and here we both are.”", portrait:"knowing" },
    ],
    choices:[
      { text:"Sell me the horse — $4,000", reaction:"The horse gets a red SOLD sticker. She types an invoice on an IBM Selectric that she says she keeps because computers remember things. “Congratulations. You own a horse. You will never see the horse.” Then she signs the bottom, under your name, and turns it so you can watch her do it. “People think this business is about money. It is about paper. Both of us are on this one now.”", effects:{ cashDelta:-4000, cleanDelta:3600, "npc.maria.trust":2, "npc.maria.exposure":1, flags:["m_gallery_done","m_launder_yes"], montage:"Bought a sad horse for $4,000. Never saw the horse." } },
      { text:"Keep it in cash. Your name doesn't need to be on my paper.", reaction:"“How gallant.” She puts the clipboard down, which is rare enough to notice. “Also stupid, and I want to be clear that both things are true at once. The offer does not expire — the horse is not going anywhere. Nobody actually wants to own him. That is the entire point of him.”", effects:{ cred:2, "npc.maria.trust":1, flags:["m_gallery_done","m_launder_no"], montage:"Kept it in cash. Left Maria's name off the paper." } },
    ] },

  m_cesar_ledger: { speaker:"maria", portrait:"knowing", priority:12,
    conditions:{ flag:"m_gallery_done", flagNone:["m_ledger_done","act2_done"], totalProfitGte:6000, cashGte:3000, dealsSinceGte:3 },
    lines:[
      { text:"A lunch counter on Flagler with tables older than either of you. Yours has a scratch in it shaped almost exactly like Florida. She does not order. She never orders — she eats a third of whatever you order and calls it something else.", portrait:"neutral" },
      { text:"The ledger comes out of her bag and it is not a ledger, it is a child’s green notebook. “Six thousand four hundred. That is what your brother owed me. You want to see the arithmetic. Everyone wants to see the arithmetic, and in eleven years nobody has ever once disputed it.”", portrait:"knowing" },
      { text:"“Six of it is money. The rest is a favor I did in March that I would very much like to stop having done.” She turns the notebook so you can read César’s handwriting crawling up the margin: a phone number, and under it, in his terrible capitals, DO NOT CALL FROM HOME.", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Put three thousand against it. I'll clear the rest.", reaction:"She writes the payment under his name, in the same column, in the same notebook, and you watch your family become a line item in real time. “You understand I did not ask you for this,” she says. “I want that on the record, because in about a month you are going to decide I have been managing you, and on this one item you will be wrong.”", effects:{ cashDelta:-3000, "npc.maria.trust":3, flags:["m_ledger_done","m_paid_debt"], montage:"Paid $3,000 against Cesar's book. She wrote it under his name." } },
      { text:"Whose number is it?", reaction:"“A man who sold him a car,” she says, and closes the notebook with one finger — the first time you have ever seen her do anything quickly. “César bought a lot of cars.” Then she pays for the food you ordered, which she has never done in her life, and that is how you know.", effects:{ "npc.maria.trust":-1, flags:["m_ledger_done","m_saw_the_number"], montage:"Asked Maria whose number was in Cesar's margin. She paid for lunch." } },
    ] },

  // ── ACT II ─────────────────────────────────────────────────
  m_not_surprised: { speaker:"maria", portrait:"knowing", priority:13,
    conditions:{ flag:"act1_done", flagNot:"m_not_surprised_done", "npc.maria.met":{eq:true}, dealsSinceGte:1 },
    lines:[
      { text:"You get to the gallery at eleven at night with it still in your mouth. She is hanging a show — sleeves rolled, a level in one hand, a nail between her lips. She takes the nail out to talk to you. That is the only concession she makes.", portrait:"neutral" },
      { text:"“Not an accident.” She repeats it flat, the way you repeat an address back to somebody. Then she goes back to the level. The bubble takes a long time to settle and neither of you says anything while it does.", portrait:"knowing" },
      { text:"“He went into the water with his shoes on, cowboy. I have known that for eleven days.” The frame is already straight. She marks the wall anyway. “I did not tell you because there was a version of this where you got back on a bus on Tuesday and grew old somewhere with a lawn.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"What else have you decided not to tell me?", reaction:"“That is the right question and I hate it.” She gives you one true thing, because she has decided one is the correct dose: in April your brother paid a criminal lawyer eleven hundred dollars for a case that did not exist. “He was buying something. I did not ask what.” The room is colder for the rest of the night and she hangs the last four frames without help.", effects:{ "npc.maria.trust":-1, flags:["m_not_surprised_done","m_pressed_her"], montage:"Pressed Maria. Cesar paid a lawyer in April for a case that did not exist." } },
      { text:"Then help me find out who.", reaction:"“Okay.” She hangs the next frame. “Then we do it my way, which is slowly, and you are going to hate it.” Two days later a man who used to call you three times a week stops calling. It will be a month before you find out she is the reason, and by then you will have stopped counting the things she handled.", effects:{ "npc.maria.trust":2, flags:["m_not_surprised_done","m_enlisted"], montage:"Maria agreed to help. Slowly. Her way." } },
    ] },

  m_elena_show: { speaker:"maria", portrait:"amused", priority:12,
    conditions:{ flag:"m_not_surprised_done", flagNot:"m_show_hung", moveGte:18, dealsSinceGte:2 },
    lines:[
      { text:"“I am giving the back room to a twenty-two-year-old,” Maria announces, in the tone other women use for a diagnosis. “Thirty prints. Overtown at dusk, mostly, and a series of the Miami River at four in the morning that I would not have had the nerve to take at her age.”", portrait:"amused" },
      { text:"She slides the mailer across the desk. E. RAMIREZ. “She is good, which is the inconvenient part — if she were bad I could simply be kind and be done. The frames are two thousand dollars. The wine is four hundred. The invitations went out Monday to every collector I have, and every collector I have is somebody you have shaken hands with at a pool party.”", portrait:"knowing" },
      { text:"“Her father will stand in that room. So will a man in a cream suit, because he sends orchids to openings, because he enjoys rooms where everyone is behaving.” She squares the mailer to the edge of the desk. “I wanted you to hear the guest list from me instead of from the door. That is the whole favor. There is no second part.”", portrait:"neutral" },
    ],
    choices:[
      { text:"The gallery shouldn't carry it. I'll cover the show — $5,000", reaction:"The receipt says ACQUISITIONS, which is a word that has never meant what it says in this building. The girl gets frames she could not afford and a wall she did not have to beg for, and she will believe for the rest of her life that a gallery in Coral Gables simply believed in her. “She will never know,” Maria says. “We just agreed to that. It took us four seconds and neither of us said it out loud.”", effects:{ cashDelta:-5000, "npc.maria.trust":2, "npc.maria.exposure":1, flags:["m_show_hung","m_funded_show"], montage:"Paid $5,000 for Elena Ramirez's frames. The receipt said ACQUISITIONS." } },
      { text:"Keep my money out of it. All of it.", reaction:"“Then I pay for the frames out of a gallery that is not having a good year, and I do it happily, which should frighten you.” She covers it by taking three canvases on consignment from a man she has spent two years politely not owing anything to — cream suit, orchids, no hurry. “Do not look at me like that. I have made worse trades before lunch.”", effects:{ "npc.maria.trust":3, flags:["m_show_hung","m_kept_out","m_maria_owes_col"], montage:"Kept your money out of Elena's show. Maria took consignment from the cream suit instead." } },
    ] },

  m_back_office: { speaker:"maria", portrait:"knowing", priority:12,
    conditions:{ flag:"m_show_hung", flagNot:"m_back_office_done", dealsSinceGte:2 },
    lines:[
      { text:"Opening night. Ninety people, four hundred dollars of wine gone in an hour, and a spray of white orchids by the door with a card that says only CONGRATULATIONS in a hand nobody claims. Elena is photographing her own opening, which Maria says is the most hopeful thing she has seen all year.", portrait:"neutral" },
      { text:"Maria takes your elbow and walks you into the back office like a woman showing a serious buyer a serious canvas. She closes the door with her hip. Through the wall you can hear a detective laughing at something his daughter said.", portrait:"knowing" },
      { text:"“The man in the cream suit asked me tonight how long you have been buying from him. Not whether. How long.” She is straightening invoices that do not need straightening. “I told him fourteen months. He did not check. Men like that never check the first number — they only ever check the second one.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Don't do that again.", reaction:"“Okay.” She says it much too easily and you both hear it happen. Then she opens the door onto ninety people and a girl with a camera, and hands you a glass of wine you did not ask for, and for the rest of the night she is the most charming person in Coral Gables.", effects:{ "npc.maria.trust":-1, flags:["m_back_office_done","m_told_her_no"], montage:"Told Maria to stop covering for you. She said okay far too easily." } },
      { text:"Fourteen months. Got it.", reaction:"You say it yourself an hour later, by the orchids, to a man who does not blink, and it works. That is the part you will think about at three in the morning: not that she lied, but how well it worked, and how quickly you picked it up, and that you did not have to practice.", effects:{ "npc.maria.trust":1, "npc.maria.exposure":1, cred:3, flags:["m_back_office_done","m_took_the_lie"], montage:"Fourteen months. You said it out loud by the orchids and it worked." } },
      { text:"Why fourteen?", reaction:"“Because it is a number I have used before and nobody died of it,” she says, and before you can hold that sentence up to the light somebody needs a check written and she is gone through the door with her hand already out. You stand in a back office full of invoices doing arithmetic you do not want the answer to.", effects:{ flags:["m_back_office_done","m_asked_fourteen"], montage:"Asked Maria why fourteen months. She said nobody had died of that number." } },
    ] },

  m_causeway_lie: { speaker:"maria", portrait:"vulnerable", priority:11,
    conditions:{ flag:"act1_done", flagNone:["m_lie_done"], moveGte:24, dealsSinceGte:3 },
    lines:[
      { text:"She makes you pull over halfway across the MacArthur at three in the morning and shut the engine off. The water is flat and black and the skyline does the thing it does, which is pretend to be a promise.", portrait:"neutral" },
      { text:"“Nine thousand dollars left the gallery on Tuesday, under frames and freight.” She is sitting on the hood with her shoes in her hand. “A man on Twelfth Avenue was four days from saying your name to somebody who writes things down. Now he is going to say a different name, and he will be in Tampa by Sunday, and you were never going to hear about any of it.”", portrait:"knowing" },
      { text:"“I did this for César too. March. And it worked, cowboy — that is the part nobody warns you about. It worked for four months and I got to walk around feeling like a woman who was handling it.” She keeps her eyes on the water instead of on you. “And then it was July.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Do it again if you have to.", reaction:"“I will.” She puts her shoes back on, one hand on the windshield for balance. “And you will not know when. That is the arrangement you just made, and I would like you to notice that you made it on a bridge, in the dark, at three in the morning, exactly like everybody else who ever made it.”", effects:{ heatDelta:-8, "npc.maria.trust":2, "npc.maria.exposure":2, flags:["m_lie_done","m_let_her_lie"], montage:"Told Maria to keep handling it. She said you would not know when." } },
      { text:"Never again. Not for me.", reaction:"“That is a beautiful thing to say on a bridge.” She gets back in the car and does not slam the door, which somehow is worse. Two weeks later a detective knows the name of the corner you use on Wednesdays, and there is nobody standing between those two facts, and you chose that.", effects:{ "npc.ramirez.evidence":2, "npc.maria.trust":-1, flags:["m_lie_done","m_no_more_lies"], montage:"Told Maria never to lie for you. Two weeks later Vice knew about Wednesdays." } },
      { text:"Who did you tell in March?", reaction:"She does not answer. She flicks a cigarette into Biscayne Bay — a felony for which nobody in the history of Florida has ever been charged — and says, “Drive.” You drive. Neither of you speaks again until Alton Road, and then only about parking.", effects:{ "npc.maria.trust":-2, flags:["m_lie_done","m_asked_march"], montage:"Asked Maria who she told in March. She said: drive." } },
    ] },

  // ── ACT III ────────────────────────────────────────────────
  m_maria_knew: { speaker:"maria", portrait:"vulnerable", priority:14,
    conditions:{ flag:"act2_done", flagNot:"maria_knew", "npc.maria.met":{eq:true}, dealsSinceGte:1 },
    lines:[
      { text:"You come in through the back at one in the morning. She has not turned the lights on — after ten the streetlight does all the work in here, which she calls the only free lighting designer in Florida. She is sitting on the floor with her back against the horse.", portrait:"neutral" },
      { text:"“Ask it,” she says. “You have been carrying it since Thursday and it is making you walk funny.”", portrait:"knowing" },
      { text:"“Yes. I knew. Since about February.” She says it the way you read a number off a receipt. “He told me himself, in this room, standing roughly where you are standing. And I did not turn him in, and I did not stop him. I have had a long time to work out which of those two is the crime and I have decided they are the same one.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"You could have stopped him.", reaction:"“I could have.” She does not argue — she has never in her life argued with a true sentence. “I thought that if I did not look at it directly it would stay small. That is what I do. You have watched me do it to you for a month.” Then she stands and turns the lights on, which from Maria Santos is slamming a door.", effects:{ "npc.maria.trust":-2, flags:["maria_knew","m_blamed_her"], montage:"Told Maria she could have stopped him. She turned the lights on." } },
      { text:"So did I. Since Thursday. And I haven't done anything either.", reaction:"For a second she looks at you like you have handed her something heavy that she now has to hold. “That is not the same thing,” she says. “I appreciate it enormously. It is not the same thing.” Then: “Stay for one drink. I will even order one, which you have never seen me do.” She does. It is terrible. Neither of you finishes it.", effects:{ "npc.maria.trust":3, flags:["maria_knew","m_shared_guilt"], montage:"Sat on the gallery floor with Maria. She ordered a drink. Nobody finished it." } },
      { text:"You knew it was Ramirez.", reaction:"“I have hung his daughter’s photographs. I have poured him wine. Eleven times, cowboy — I counted, because counting is what I do instead of sleeping.” She rolls the glass between her palms. “You are allowed to think about what that makes me. I have thought about very little else since July.”", effects:{ "npc.maria.trust":-1, flags:["maria_knew","m_knew_it_was_ray"], montage:"Maria has poured Ramirez wine eleven times since July. She counted." } },
    ] },

  m_subpoena: { speaker:"maria", portrait:"knowing", priority:13,
    conditions:{ flag:"maria_knew", flagNone:["m_subpoena_done","betrayed_maria","protected_maria"], dealsSinceGte:2 },
    lines:[
      { text:"A kid in a bad blazer serves the gallery at ten on a Tuesday morning and apologizes twice, which is the most Miami part of the whole thing. Subpoena duces tecum. Three years of consignment records, sales invoices and wire instructions, to the grand jury, in twelve days.", portrait:"neutral" },
      { text:"Maria reads it standing up, all the way through, twice. “Twelve days is a courtesy. Somebody downtown decided to be polite to me, and people are polite to you when they want you to call them.” She sets it on the desk very precisely, squared to the edge.", portrait:"knowing" },
      { text:"“There is a version of that drawer where I am a fool who sold a horse forty times to a charming young man. There is a version where I signed things. Both versions are in there, cowboy. The only difference between them is whose name is on the wire instructions.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Put my name on all of it. Every wire. — $12,000", reaction:"Two days and twelve thousand dollars with a lawyer named Broche who bills by the sentence, and at the end of it the gallery is simply a place where a young man with more money than taste bought a great deal of art. “This is stupid,” Maria says, reading the new paper. “Thank you. It is still stupid.” It is the only time she has ever thanked you for anything.", effects:{ cashDelta:-12000, heatDelta:8, "npc.ramirez.evidence":3, "npc.maria.trust":3, flags:["m_subpoena_done","protected_maria"], montage:"Put your name on every wire in Maria's books. $12,000 and a lawyer named Broche." } },
      { text:"Let the paper stand.", reaction:"She files what exists, because what exists is what exists. She does not ask you for anything, and you notice that she does not, and then on the drive home you notice that you were relieved, and you have to sit at a light on Coral Way with that for a while.", effects:{ "npc.maria.trust":-1, flags:["m_subpoena_done","m_let_paper_stand"], montage:"Let the gallery's paper stand as written. She did not ask you for anything." } },
      { text:"Give Ramirez the gallery. Buy yourself the twelve days.", reaction:"You meet him in the lot of a Farm Store on Bird Road and you say the word CONSIGNMENT and he stops chewing. It buys you a month, which is real, and you should be honest with yourself about how good the month feels. It costs her a decade in installments, beginning with a phone call she gets on Thursday and ending somewhere you will not be.", effects:{ "npc.ramirez.evidence":-5, "npc.maria.trust":-6, cred:-4, flags:["m_subpoena_done","betrayed_maria"], montage:"Gave Ramirez the gallery for a month of daylight." } },
    ] },

  m_last_ask: { speaker:"maria", portrait:"vulnerable", priority:12,
    conditions:{ flag:"maria_knew", flagNone:["m_last_ask_done"], moveGte:36, dealsSinceGte:4 },
    lines:[
      { text:"The show comes down on a Sunday. Thirty prints into thirty sleeves, and the back room goes back to being a back room. Maria works the wall with a putty knife and does not offer you one, which is how you know you are being talked to.", portrait:"neutral" },
      { text:"“This city has taken four people I liked. Two went to Raiford. One went in the water. One is in Kendall selling boats and will not return a call, which I maintain is the worst of the four outcomes.” Putty. Sand. Putty. “I am not doing a fifth.”", portrait:"knowing" },
      { text:"“So here is the only thing I have ever asked you for, and I am going to say it once, standing up, holding a putty knife, because if I sit down I will say it badly.” She does not turn around. “Nestor. Be the one who leaves.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Come with me.", reaction:"“Ah.” She goes back to the wall. “That is a beautiful answer to a different question.” She does not say yes. She also does not say no, and she does not throw you out, and at two in the morning she is still filling holes in a wall with a man standing behind her holding the light, which for Maria Santos is practically a wedding.", effects:{ "npc.maria.trust":2, flags:["m_last_ask_done","m_offered_seat","m_asked_her_to_come"], montage:"Asked Maria to come with you. She held the putty knife and did not say no." } },
      { text:"I can't. Not yet.", reaction:"“Not yet.” She tests the phrase like a bad oyster. “César said ‘after the summer.’ Yours is shorter. I suppose that is progress.” She finishes the wall alone. The next time you come by, the door is locked at an hour it has never once been locked.", effects:{ "npc.maria.trust":-2, flags:["m_last_ask_done","m_offered_seat","m_refused_seat"], montage:"Told Maria not yet. Cesar said after the summer." } },
      { text:"Sell the gallery. Go yourself — I'll cover the difference. $20,000", reaction:"She looks at the twenty thousand for a long time, the way she looked at your first deposit slip. “You have just tried to buy me a life. It is the rudest thing anybody has done for me in years.” She takes it. There is a buyer for the building by Friday, because of course there is, and the horse goes into the back of a station wagon like a piece of furniture.", effects:{ cashDelta:-20000, "npc.maria.trust":4, flags:["m_last_ask_done","m_offered_seat","m_bought_her_out","protected_maria"], montage:"Put $20,000 on the desk to get Maria out of Miami. She called it rude." } },
    ] },

  m_after_betrayal: { speaker:"maria", portrait:"vulnerable", priority:11,
    conditions:{ flag:"betrayed_maria", flagNone:["m_epilogue_done"], dealsSinceGte:3 },
    lines:[
      { text:"The gallery is closed on a Wednesday, which it has never been. The horse is gone from the window. Through the glass the white room is only a white room, with banker’s boxes stacked by the desk, taped and labeled in her handwriting.", portrait:"neutral" },
      { text:"She is at the coffee window on Ponce with a cortadito she is not drinking. She sees you, and does not stand up, and does not leave, which is worse than either.", portrait:"knowing" },
      { text:"“They came Thursday at seven in the morning, which is an hour chosen by a man who wants you in a robe.” She turns the cup a quarter turn on the saucer. “The lawyer says four years, probably three. He also says I should not be seen with you, and here I am being seen with you, so you can measure exactly how much I am able to help myself.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Take the money. Whatever you need. — $15,000", reaction:"She takes it, because she has never once been sentimental about money. “This buys a better lawyer and a worse feeling. The better lawyer is real, so I am going to accept it.” She still does not stand up. “Go on. You are late for whatever it is. You always were, actually — I never mentioned it.”", effects:{ cashDelta:-15000, "npc.maria.trust":1, flags:["m_epilogue_done","m_paid_after"], montage:"Put $15,000 on a coffee counter on Ponce. She did not stand up." } },
      { text:"I'd do it again.", reaction:"“I believe you.” She finishes the cortadito in one go, which you have never seen her do with anything. “That is the only compliment I have left in the drawer: I believe absolutely every word you say now. You have become extremely easy to understand.” Then she walks back toward a building she no longer has the keys to.", effects:{ cred:4, "npc.maria.trust":-3, flags:["m_epilogue_done","m_no_regret"], montage:"Told Maria you would do it again. She said you had become easy to understand." } },
      { text:"I'm sorry.", reaction:"“Don’t.” She says it kindly, which is unbearable. “Sorry is what men say instead of money, and I have sat across from forty of them while they said it. You were not the worst of them.” She looks at the empty window where the horse used to be. “You were only the fastest.”", effects:{ "npc.maria.trust":-1, flags:["m_epilogue_done","m_apologized"], montage:"Apologized to Maria on Ponce. She said you were only the fastest." } },
    ] },

  m_after_protection: { speaker:"maria", portrait:"amused", priority:11,
    conditions:{ flag:"protected_maria", flagNone:["m_epilogue_done","betrayed_maria"], dealsSinceGte:3 },
    lines:[
      { text:"The gallery survives, which in this city qualifies as a plot twist. There is a new show up — boats, obviously, because rich people adore boats — and the horse has been moved into the back office where he can be sad in private.", portrait:"neutral" },
      { text:"“The grand jury received four hundred pages about a young man with more money than taste,” Maria says. “Then they subpoenaed my accountant, who is seventy-one and answers every question with a story about Havana. I am told they gave up on a Tuesday, which is the correct day to give up.”", portrait:"amused" },
      { text:"She pours two glasses of something and hands you one without being asked, which has not happened before. “I have spent a week looking for a way to say thank you that does not sound like the beginning of an obligation, and there isn’t one. So: thank you. You are owed. I hate it, and I am not going to do anything about it.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Then we're even.", reaction:"“We are not,” she says, “but I accept the accounting.” The glasses touch. Outside, a man in a bad Corvette attempts to parallel park for the fourth time, and the two of you watch him fail from inside a white room with a boat in it, and neither of you says anything for a while, and it is the best hour of the month.", effects:{ "npc.maria.trust":2, flags:["m_epilogue_done","m_even"], montage:"Watched a man fail to parallel park from inside a white room with a boat in it." } },
      { text:"Then use it. Get out of Miami.", reaction:"“And go where — Atlanta? I have SEEN Atlanta.” But she does not laugh at the end of it, and later, on your way out, with her back to you and her hand already on the light switch, she says, “If you go first, I will consider it.” From her that is a signed document.", effects:{ "npc.maria.trust":1, flags:["m_epilogue_done","m_told_her_go"], montage:"Told Maria to use the favor and leave. She said: if you go first." } },
    ] },

  // ═══════════════════════════════════════════════════════════════
  // v5 SPINE + EL COLOMBIANO  (ids prefixed c_)
  // ═══════════════════════════════════════════════════════════════

  // ── SPINE: THE OPENING (force-injected at run start) ──
  c_open_station: { speaker:"narrator", portrait:"neutral", priority:100,
    conditions:{ moveLte:0, flagNot:"c_opened" },
    lines:[
      { text:"The Greyhound gets in at 6:40 in the morning and the station smells like floor wax and other people’s cigarettes. Eleven days ago your brother went into the water off Virginia Key. The county mailed you a card with a phone number on the back of it, in handwriting that is not his.", portrait:"neutral" },
      { text:"You have a duffel bag, ninety dollars, and a return ticket you already know you are not going to use. Outside, the heat comes off the sidewalk like something with an opinion. There is a payphone by the men’s room and a Coral Gables number on the card and, above the number, one word: MARIA.", portrait:"neutral" },
      { text:"Behind you the driver is hauling bags out of the belly of the bus and calling MIAMI, MIAMI, as if anybody still on board could be in doubt about that.", portrait:"neutral" },
    ],
    choices:[
      { text:"Call the number now", reaction:"It rings four times. A woman picks up and does not say hello. You get out two words — your brother’s name — and she says, “Not on a telephone,” in the voice of somebody who has said it before, and gives you a street in Coral Gables. Then the line is just a line again. You are across the causeway before you have slept, or eaten, or put the bag down.", effects:{ hpDelta:-6, flags:["c_opened","c_called_first_night"], montage:"Called the number on the funeral card from a station payphone." } },
      { text:"Find a room. Call when you’ve slept", reaction:"A room on Biscayne with a fan bolted to the ceiling and a Bible in the drawer with forty dollars in it, which you leave, because you are not that yet. In the morning the card is on the nightstand where you put it and the handwriting is still not his and the city has already been awake for hours.", effects:{ cashDelta:-60, flags:["c_opened","c_waited"], montage:"Slept one night before you called. It was the last easy night." } },
    ] },

  // ── THE KID FROM THE BENCHES — the bottom of the supplier’s organisation ──
  c_the_duffel_man: { speaker:"narrator", portrait:"neutral", priority:11,
    conditions:{ flag:"c_opened", flagNot:"c_duffel_man", totalDealsGte:2, dealsSinceGte:2 },
    lines:[
      { text:"You have seen this kid before. He was working the benches at the Greyhound station your first morning — sixteen, maybe, a Members Only jacket in August, moving through the waiting room like a man reading a menu. You were the only thing in the building worth reading.", portrait:"neutral" },
      { text:"He is on a corner in Overtown now with a beeper on his belt and a roll in his sock, and when he sees you he does not run, which means somebody has already told him who you are. “You César brother,” he says. It is not a question. “Everybody know that.”", portrait:"neutral" },
      { text:"“You want to meet the man, I get you to the man. He don’t come to corners. He got a house.” He never once says a name, the way you would never say a name for weather.", portrait:"neutral" },
    ],
    choices:[
      { text:"Send word up. I’ll take the meeting", reaction:"Two days later a car you did not order is outside your motel at four in the afternoon with the engine off and the windows down, and the driver reads a paperback until you are ready. Nobody in this city has ever waited for you before.", effects:{ "npc.colombiano.met":true, flags:["c_duffel_man","c_sent_for"], montage:"Sent word up the ladder. A car came back down and waited." } },
      { text:"Not yet. Buy what’s in his sock", reaction:"Three hundred dollars for a sock roll, and he counts it twice the way somebody taught him to, and you walk off with product and without an introduction. Somewhere a man is told that César’s brother is buying off corners, which is either humility or an insult, and he will decide which at his leisure.", effects:{ cashDelta:-300, invGift:{idx:4,qty:8}, "npc.colombiano.trust":-1, flags:["c_duffel_man","c_bought_the_corner"], montage:"Bought a kid’s sock roll instead of taking the meeting." } },
    ] },

  // ── EL COLOMBIANO 1: THE POSITION ──
  c_col_intro: { speaker:"colombiano", portrait:"neutral", priority:13,
    conditions:{ totalDealsGte:3, flagNot:"c_col_met", dealsSinceGte:2 },
    lines:[
      { text:"The house is in Coral Gables and the driveway is longer than the street you grew up on. There is a birdcage in the front room with nothing in it. He is in a chair by the window that is plainly the good chair, and he does not stand, and he does not offer a name, and it will be four months before you understand that this is not rudeness. It is hygiene.", portrait:"neutral" },
      { text:"“Your brother came to me on a Tuesday in 1983 with eleven hundred dollars and a plan that was not good.” He turns his glass a quarter turn on the table. “I gave him back the eleven hundred and a kilo on paper. The plan improved. This is what I do. I do not sell to men. I put men in a position where it is worth selling to them.”", portrait:"neutral" },
      { text:"“You are here because the position is empty, and the position does not enjoy being empty. His terms are available to you. His terms were not generous. He never once asked me for better, which I always thought was the only stupid thing about him.”", portrait:"pleased" },
    ],
    choices:[
      { text:"The same terms are fine", reaction:"“Good.” He does not smile; his face simply stops doing the other thing. “A man who takes the first number is humble or he is planning. I have known both and I prefer neither, but the paperwork is identical.” The package is in the trunk of your car before you reach the car.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":2, invGift:{idx:5,qty:6}, flags:["c_col_met","c_took_his_terms"], montage:"Took César’s old terms from the man in the cream suit." } },
      { text:"Then I’m asking for better", reaction:"The pause is not long. It is exactly as long as it needs to be. “Eight points,” he says. “You will find that eight points is a great deal of money and no protection at all. One day you will want to trade it back, and on that day it will cost more than eight points.” He is looking out the window before you reach the door.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":-1, cred:4, invGift:{idx:5,qty:4}, flags:["c_col_met","c_asked_for_better"], montage:"Asked the supplier for eight points. Got them. Noted." } },
    ] },

  // ── EL COLOMBIANO 2: WEATHER ──
  c_col_weather: { speaker:"colombiano", portrait:"neutral", priority:11,
    conditions:{ flag:"c_col_met", flagNot:"c_col_weather", totalDealsGte:6, dealsSinceGte:3 },
    lines:[
      { text:"He calls you to a marina in Coconut Grove to look at a boat he is not going to buy. “In Barranquilla the rain comes at four o’clock,” he says. “Every day, four o’clock, you can set a watch by it. Here it comes when it wants. Everybody here believes that is freedom. It is only bad scheduling.”", portrait:"neutral" },
      { text:"A pelican lands on the piling beside him and he watches it with real interest for eleven seconds. “Your brother became difficult to schedule. In the last months. He would be late — and then he would be very early, which is worse, because early is a man who has already been somewhere.”", portrait:"cold" },
    ],
    choices:[
      { text:"Where was he going first?", reaction:"He looks at you the way a man looks at a bill he has already decided to pay. “To breakfast, I assumed. He liked a place on Coral Way with the pressed sandwich and the terrible coffee.” He is telling the truth about the sandwich. He is telling you something else about everything around the sandwich, and you both know it, and neither of you says so.", effects:{ "npc.colombiano.trust":-1, flags:["c_col_weather","c_col_pressed"], montage:"Asked where César went in the mornings. He described a sandwich." } },
      { text:"Let it go. Talk about the boat", reaction:"So you talk about the boat, which is forty-two feet and Italian and will be sold to a dentist, and he relaxes by one degree, which on him is a party. On the drive back you understand that he told you something and then let you decide not to hear it, and that he will remember which you chose.", effects:{ "npc.colombiano.trust":2, flags:["c_col_weather","c_col_let_it_go"], montage:"Let the supplier change the subject. He noticed that, too." } },
    ] },

  // ── EL COLOMBIANO 3: THE INVENTORY ──
  c_col_debt: { speaker:"colombiano", portrait:"neutral", priority:12,
    conditions:{ flag:"c_col_met", flagNot:"c_col_debt_done", totalProfitGte:9000, dealsSinceGte:2 },
    lines:[
      { text:"A man in a barbershop on Calle Ocho hands you a folded sheet of graph paper while you are still in the chair. A column of numbers in pencil. The last one is circled twice. It is nine thousand four hundred dollars.", portrait:"neutral" },
      { text:"That evening the telephone in your motel rings at the exact minute you walk in. “You have seen the paper. I want to be clear that this is not a demand, it is an inventory. Your brother’s balance did not die with him, because the product did not die with him. Somebody smoked it. Somebody enjoyed it. Here we are.”", portrait:"neutral" },
      { text:"“You may pay it or you may carry it. Carrying is not a punishment. It is only that a carried number is a different kind of relationship than a paid one — and both of them are relationships.”", portrait:"cold" },
    ],
    choices:[
      { text:"Pay it. Today — $9,400", reaction:"You count it out on a coffee table in front of a man who does not count it after you. “Now you are a customer,” he says, and there is something underneath it that might be regret. “A customer may leave. Remember that I told you this on the day you paid, and not later, when it would be a kindness.”", effects:{ cashDelta:-9400, "npc.colombiano.trust":3, flags:["c_col_debt_done","c_paid_cesars_balance"], montage:"Paid César’s balance in cash. $9,400, counted once." } },
      { text:"Carry it", reaction:"“Of course.” Nothing in his voice moves at all, which is the entire message. The number goes onto a page in a book you have never seen, in a house you have been inside once, and it will grow at a rate that nobody is ever going to state out loud to you.", effects:{ debtDelta:11000, "npc.colombiano.trust":1, flags:["c_col_debt_done","c_carried_the_balance"], montage:"Carried César’s balance. It went into a book you’ve never seen." } },
    ] },

  // ── EL COLOMBIANO 4: THE TURN — successor, not customer ──
  c_col_successor: { speaker:"colombiano", portrait:"pleased", priority:12,
    conditions:{ flag:"act1_done", flagNot:"c_col_successor", totalProfitGte:30000, "npc.colombiano.trust":{gte:1}, dealsSinceGte:2 },
    lines:[
      { text:"This time you are not received in the front room. You are taken through it, past the empty birdcage, into a kitchen where a woman is making lunch for eleven people and nobody is coming for lunch. He is at the table with a ledger and reading glasses, which is the first evidence you have ever had that he is a person who ages.", portrait:"neutral" },
      { text:"“Sit. Eat something, she will be insulted.” He turns the ledger around so that you can read it, which is either the greatest compliment of your life or the beginning of a problem. Four columns. Six months. A number at the bottom that makes everything you have done so far look like a hobby.", portrait:"neutral" },
      { text:"“Sixty kilos a month move through this city on my paper and I touch none of it. That is not a boast, it is an instruction. The man who touches it goes to prison. The man who schedules it goes to Barranquilla in November for his mother’s birthday.” He closes the book. “I am going to give you weight on consignment. Not because I trust you. Because you are the only person in this arrangement who is not yet tired.”", portrait:"pleased" },
    ],
    choices:[
      { text:"Take the consignment", reaction:"Weight on paper and no money changes hands, which is the most frightening transaction of your life. “Now you understand the difference,” he says, walking you out. “Before today, if you had disappeared it would have been unfortunate. Today it would be arithmetic.”", effects:{ invGift:{idx:5,qty:24}, debtDelta:9000, "npc.colombiano.trust":3, flags:["c_col_successor","col_heir_path"], montage:"Took weight on consignment. You are arithmetic now." } },
      { text:"I’d rather buy what I can pay for", reaction:"He accepts this without argument, which is worse than an argument. “A careful man. Your brother was also careful, in his own way, about his own things.” Then he walks you out anyway — all the way to the car, and stands in the driveway until you are gone, which he has never done before.", effects:{ "npc.colombiano.trust":-1, cred:3, flags:["c_col_successor","col_declined_weight"], montage:"Turned down the consignment. He walked you to the car himself." } },
    ] },

  // ── EL COLOMBIANO 5: THE FLOWERS (Elena’s show, from his side) ──
  c_col_flowers: { speaker:"colombiano", portrait:"pleased", priority:12,
    conditions:{ flag:"act1_done", flagNot:"c_col_flowers", totalProfitGte:22000, dealsSinceGte:3 },
    lines:[
      { text:"There is an exhibition at the gallery in Coral Gables. A young photographer, first show, her name on a card by the door in a typeface somebody agonised over. He knows about it before you mention it. He knows the date, the hours, and the name of the caterer.", portrait:"neutral" },
      { text:"“I am sending flowers. Birds of paradise — vulgar, but they last.” He is writing on a small card as he says it. “You will carry the card. A card from me arriving by van is a different sentence than a card from me arriving in a friend’s hand.” He writes four words and does not show you which four.", portrait:"pleased" },
      { text:"Then, while he is capping the pen: “The girl’s father attends these things, I imagine. A working man. Detectives have Thursdays like everybody else.” He says it in exactly the voice he used for the rain at four o’clock.", portrait:"cold" },
    ],
    choices:[
      { text:"Tell him the detective will be there", reaction:"“Thank you.” He puts the pen in his pocket. “Then I will not go. I have no interest in standing in a room with a man who is paid to remember faces. You see — you have done him a favour and he will never know it, and that is the only kind that is safe to do.” The flowers arrive at eleven. They are, in fact, vulgar. They last three weeks.", effects:{ "npc.colombiano.trust":2, flags:["c_col_flowers","col_told_of_ramirez"], montage:"Told the supplier which night the detective would be at the gallery." } },
      { text:"Say nothing about who comes", reaction:"You carry the card and say nothing, and the evening happens the way evenings happen: wine in plastic cups, a father standing a little too close to a photograph of a parking lot at dawn. Two weeks later, apropos of a shipment, he mentions that he understands the show was well attended — and then lets the sentence sit there until you are certain he is not going to finish it.", effects:{ "npc.colombiano.trust":-1, flags:["c_col_flowers","col_edited"], montage:"Kept the guest list to yourself. He noticed the gap in it." } },
    ] },

  // ── EL COLOMBIANO 6: THE CHAIR WITH THE LOOSE JOINT ──
  c_col_ledger: { speaker:"colombiano", portrait:"cold", priority:12,
    conditions:{ flag:"act2_done", flagNot:"c_col_ledger", dealsSinceGte:2 },
    lines:[
      { text:"He is repairing a chair when you arrive. Actually repairing it — glue, a clamp, newspaper spread on the floor. “The joint has been loose a year and I sat in it anyway. This is a thing men do. They sit in the loose chair and they say: next month.”", portrait:"neutral" },
      { text:"“You have learned something recently and you are carrying it badly. So — a lesson, since we are both here and the glue must dry.” He wipes his hands. “A man who talks to the police is not a traitor. Traitor is a word for families. He is a leak. You do not punish a leak. You do not raise your voice at a leak. You repair it, and then you sit in the chair again.”", portrait:"cold" },
    ],
    choices:[
      { text:"Who repaired César?", reaction:"He tightens the clamp one full turn and tests it with his thumb. “Not today,” he says. “Today the glue is wet and you are angry, and neither of those improves an answer.” It is the first time he has ever declined to lie to you.", effects:{ "npc.colombiano.trust":1, flags:["c_col_ledger","c_col_almost"], montage:"Asked who repaired César. He said: not today." } },
      { text:"Understood", reaction:"“I don’t think it is, yet,” he says, almost kindly. “But you said it in the right order, which is most of it.” He hands you the newspaper off the floor to put in the bin. It is eleven days old. You check the date twice on the way out.", effects:{ "npc.colombiano.trust":3, flags:["c_col_ledger","c_col_swallowed_it"], montage:"Said Understood to a man gluing a chair. He corrected you gently." } },
    ] },

  // ── EL COLOMBIANO 7: PUNCTUALITY (fires if you have turned) ──
  c_col_punctual: { speaker:"colombiano", portrait:"cold", priority:13,
    conditions:{ flagAny:["ending_witness","betrayed_col"], flagNot:"c_col_punctual", "npc.colombiano.met":{eq:true}, dealsSinceGte:2 },
    lines:[
      { text:"He remarks, in passing, on your punctuality. “You have become punctual. Three weeks now — exactly on the hour, every time, and you never stay for the second drink.” He is not accusing you of anything. He is describing the weather.", portrait:"neutral" },
      { text:"“I will tell you what I have decided, so that there is no misunderstanding later, which is when misunderstandings become expensive. I have decided to do nothing. For now. Because I am leaving anyway — and because a man who is careful about the hour is a man who still believes he is choosing.”", portrait:"cold" },
    ],
    choices:[
      { text:"Buy the doubt — wire $25,000 tonight", reaction:"The money moves through a marina account in Coconut Grove and buys, by any honest accounting, about six weeks. He never acknowledges receiving it, which is how you know that he received it. Six weeks is not nothing. Six weeks is a trial date.", effects:{ cashDelta:-25000, "npc.colombiano.trust":2, flags:["c_col_punctual","col_bought_silence"], montage:"Wired $25,000 through a marina account to buy six weeks." } },
      { text:"Be late. Stay for the second drink", reaction:"So you are late, and you stay, and the second drink is rum you do not want at a table you cannot leave, and for ninety minutes you are the most relaxed man in Dade County. Later, in the car, your hands start, and it takes both of them on the wheel to stop it.", effects:{ heatDelta:4, hpDelta:-8, "npc.colombiano.trust":1, flags:["c_col_punctual","col_played_it_out"], montage:"Stayed for the second drink. Your hands started afterward." } },
    ] },

  // ── EL COLOMBIANO 8: THE CHAIR (Act III — commits ending_inheritor) ──
  c_col_offer: { speaker:"colombiano", portrait:"pleased", priority:14,
    conditions:{ flagAll:["act2_done","c_col_ledger"], flagNot:"c_col_offer", flagNone:["ending_witness","ending_ghost"], totalProfitGte:60000, "npc.colombiano.trust":{gte:3}, dealsSinceGte:2 },
    lines:[
      { text:"November. There is a suitcase in the front room — a real one, leather, packed. The birdcage is gone. “My mother is eighty-one on the fourteenth. I have not sat at her table since 1979. She is not sentimental about this. She is Colombian. She is simply keeping score.”", portrait:"neutral" },
      { text:"“So. The route.” He says it the way a man says the name of a dog he is rehoming. “It has a schedule, and the schedule does not care who is holding it. Whoever holds it in December holds it in April, and by April it is very difficult to put down.”", portrait:"neutral" },
      { text:"“I am not asking you to be me. That would be flattering and stupid. I am asking whether the schedule will be kept. It is the only question I have ever asked anybody.”", portrait:"pleased" },
    ],
    choices:[
      { text:"The schedule will be kept", reaction:"“Good.” He carries his glass to the sink and washes it himself, which you have never seen him do, and dries it, and puts it back in the cupboard where it lives. “The chair by the window is a good chair. It is also the only chair in the room that can see the driveway. In a year you will have stopped noticing that you sit in it.”", effects:{ "npc.colombiano.trust":3, cred:8, flags:["c_col_offer","ending_inheritor","col_chair_taken"], montage:"Told him the schedule would be kept. The chair by the window is yours." } },
      { text:"Give it to somebody else", reaction:"“Somebody else.” He tries the phrase out and finds it acceptable, and that is the worst part — it costs him nothing. “Then I give it to a man from Cali whom I do not like, and in nine months something will happen to him, and neither of us will be surprised, and you will read about it in the newspaper and feel nothing. That is the part I would like you to be ready for.”", effects:{ "npc.colombiano.trust":-2, flags:["c_col_offer","col_refused_chair"], montage:"Refused the route. He gave it to a man from Cali." } },
    ] },

  // ── EL COLOMBIANO 9: THE ADMISSION (Act III — sets knows_col_ordered) ──
  c_col_admission: { speaker:"colombiano", portrait:"cold", priority:15,
    conditions:{ flagAll:["act2_done","c_col_ledger"], flagNot:"c_col_admission", moveGte:32, dealsSinceGte:2 },
    lines:[
      { text:"Last time. He is standing in an empty room — the furniture went ahead of him in a truck this morning — and the light through the window is the wrong colour without curtains. “Ask,” he says, before you have said anything at all. “You have carried the question through two rooms. Set it down.”", portrait:"neutral" },
      { text:"So you ask. And he answers immediately, without ceremony, the way a man confirms a delivery. “Yes. In July. He had been in a brown car eleven times, and the eleventh time he stayed forty minutes, and forty minutes is not a conversation, it is a statement.” A pause, only for accuracy: “It was done in the water because the water is quiet, and because his mother is alive.”", portrait:"cold" },
    ],
    choices:[
      { text:"Why tell me at all?", reaction:"“Because you would have found it, and found it badly, and made it into a story about yourself.” He looks around the empty room for something to do with his hands and finds nothing. “I did not hate your brother. I have never hated anybody in this business — it is an expensive emotion and it does not scale. He was a good earner, he became a leak, and I repaired him. If you require me to be sorry you will be standing here a long time, and the truck is already on I-95.”", effects:{ "npc.colombiano.trust":1, flags:["c_col_admission","knows_col_ordered","c_col_asked_why"], montage:"He said yes. In March. Because of a brown car and forty minutes." } },
      { text:"Say it in plain words", reaction:"“I had your brother killed.” He says it exactly once, at conversational volume, in an empty room with no curtains — and then waits. Not defensively. The way a man waits after reading something aloud, to see whether you would like him to continue. That is the part you will still be hearing in five years.", effects:{ "npc.colombiano.trust":-1, flags:["c_col_admission","knows_col_ordered","c_col_made_him_say_it"], montage:"Made him say it in plain words. Conversational volume. Once." } },
    ] },

  // ── SPINE: ACT I CLOSE — the death was not an accident ──
  c_act1_close: { speaker:"narrator", portrait:"neutral", priority:15,
    conditions:{ flag:"c_opened", flagNot:"act1_done", totalDealsGte:6, totalProfitGte:8000, moveGte:8, dealsSinceGte:2 },
    lines:[
      { text:"The Medical Examiner’s office on NW 10th Avenue releases personal effects on weekdays between nine and eleven-thirty. The clerk is a large, calm man named Fitzgerald who has done this several thousand times and has never once got used to it, which you can tell because he says your brother’s whole name every time instead of shortening it.", portrait:"neutral" },
      { text:"One manila envelope. A wallet with sixty-one dollars in it. A key to a car that was never found. A wristwatch — steel, not expensive — stopped at 11:40. The report says he entered the water some time after two in the morning.", portrait:"neutral" },
      { text:"You sit in the parking lot with the envelope on your knees for a while. A watch that stops at 11:40 was on a wrist that stopped at 11:40. There is a version of this where the water came second, and it is the only version, and it took you nine minutes in a parking lot to see it, and it took a county employee an entire afternoon not to.", portrait:"neutral" },
    ],
    choices:[
      { text:"Keep the watch. Say nothing to anybody", reaction:"You put it on. It is a little loose and you do not have it adjusted, because having it adjusted would be a decision and this is not that yet. It stays at 11:40 for the rest of the summer. You look at it far more often than a stopped watch deserves.", effects:{ flags:["act1_done","c_kept_watch"], montage:"The watch stopped at 11:40. He went into the water after two." } },
      { text:"Ask who signed for the body", reaction:"Fitzgerald turns the log book around without being asked twice. A detective’s signature, Metro-Dade, dated the following morning at 6:15 — which is early, even for a man doing paperwork. He also signed the line for personal effects, and then took none, which the form has no box for. Fitzgerald mentions that you are the second person this month to ask, and does not say who the first was.", effects:{ heatDelta:4, flags:["act1_done","c_saw_signature"], montage:"A detective signed for the body at 6:15 the next morning. Took nothing." } },
    ] },

  // ── SPINE: ACT II CLOSE — César was informing, and to whom ──
  c_act2_close: { speaker:"colombiano", portrait:"neutral", priority:15,
    conditions:{ flag:"act1_done", flagNot:"act2_done", totalProfitGte:26000, moveGte:18, dealsSinceGte:2 },
    lines:[
      { text:"A man you have never met is sitting in the passenger seat of your car outside a Farm Store on Bird Road, eating a sandwich, with a manila envelope on his lap. He apologises for the sandwich. He does not apologise for the seat.", portrait:"neutral" },
      { text:"Photographs. Eleven of them, dated in grease pencil across five months. A brown Plymouth in a supermarket lot before dawn. Your brother getting in on the passenger side. Your brother getting out. Your brother laughing at something, once, in frame seven — which is the one you will not be able to stop looking at.", portrait:"neutral" },
      { text:"“He says you should have these,” the man says, folding the wax paper. “He says you should have them from a friend and not from a lawyer.” On the back of frame eleven somebody has written the tag number of the brown car in the same pencil. You have seen that car. You have seen that car this week.", portrait:"cold" },
    ],
    choices:[
      { text:"Take the envelope", reaction:"You take it. He gets out, shakes your hand through the window with sandwich still in it, and walks off toward a bus stop like a man with a job, which he has. That night you lay eleven photographs out on a motel bed in date order and understand that your brother talked to a detective for five months, and that most of this city knew before you did, and that all of them let you find out on a Tuesday, from a stranger, in a parking lot.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":1, flags:["act2_done","knows_ramirez_ran","c_photos_taken"], montage:"Eleven photographs. Five months. A brown Plymouth and César laughing." } },
      { text:"Refuse it. Get out of the car", reaction:"“As you like.” He does not put the envelope away. He describes them to you instead — in order, in a mild voice, standing on the sidewalk with the sun going: the lot, the car, the passenger door, the five months, the tag number. When he is finished he says it was nice to meet you and goes to catch his bus. You never had to look at anything. You will never be able to stop.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":-1, hpDelta:-6, flags:["act2_done","knows_ramirez_ran","c_photos_described"], montage:"Refused the envelope. He described all eleven from memory instead." } },
    ] },

  // ── SPINE: ACT III COMMITMENT (fallback — yields to the other arcs’ beats) ──
  c_act3_commit: { speaker:"narrator", portrait:"neutral", priority:14,
    conditions:{ flag:"act2_done", flagNone:["ending_witness","ending_inheritor","ending_ghost"], moveGte:34, dealsSinceGte:2 },
    lines:[
      { text:"You are supposed to be on a plane in four days. You have known this for two weeks and you have not bought the ticket, which is its own kind of answer.", portrait:"neutral" },
      { text:"Three people want the same thing from you in three different sets of words. The detective wants somebody who will sit in a chair and say a date out loud. The man in the cream suit wants a schedule kept after he is gone — he made that offer once and has never withdrawn it, because withdrawing things is not something he does. Maria has never asked you for anything at all, which is how you know what she wants: for one of you to get out of this city, so that it isn’t a hundred percent.", portrait:"neutral" },
      { text:"The gallery closes at seven on Friday. Whatever you decide, that is where it happens, because that is where everybody already knows to go.", portrait:"neutral" },
    ],
    choices:[
      { text:"Give the detective the whole thing", reaction:"You call the number he wrote on a napkin in April and you say one sentence and he does not ask you to repeat it. “Friday,” he says. “Okay. Friday.” Then, after a silence you can hear him deciding about: “You know this doesn’t end with anybody being glad.” You say you know. Neither of you says goodbye. You both just stop.", effects:{ flags:["ending_witness"], montage:"Called the detective. Friday, at the gallery, after closing." } },
      { text:"Keep the schedule", reaction:"You do not call anybody. You take your suit to be cleaned, and on the way back you catch yourself checking the driveway of a house you do not own yet, and the man at the dry cleaner calls you sir in a way that he did not in June.", effects:{ cred:5, flags:["ending_inheritor"], montage:"Got the suit cleaned. Nobody needed to be called." } },
      { text:"Take the money and go", reaction:"You buy the ticket at a travel agent on Ponce with cash, one way, and then you sit in the car in the lot for a while with the envelope on the passenger seat. It is a good decision. It has been a good decision for eleven days. That is exactly how long it has been available.", effects:{ flags:["ending_ghost"], montage:"Bought a one-way ticket with cash and sat in the lot holding it." } },
    ] },

  // ── ONBOARDING: the brick call (priority forced; fires immediately) ──
  r_sedan: { speaker:"ramirez", portrait:"neutral", priority:14,
    conditions:{ "npc.ramirez.met":{eq:false}, moveGte:3, dealsSinceGte:2 },
    lines:[
      { text:"The brown sedan was outside the funeral home on Flagler. Then outside your motel. Then outside the botánica where you buy coffee, which is either surveillance or the worst coincidence in Dade County.", portrait:"neutral" },
      { text:"“Ray Ramirez, Metro-Dade.” Cuban sandwich in wax paper, and the suit of a man who stopped shopping under Carter. “I’d show you the badge, but you already read my plates. Twice. On Tuesday you read them from the bus bench, which I respected.”", portrait:"wry" },
      { text:"“I worked your brother. Not a case — a DROWNING. Eleven days old, closed in an afternoon.” He folds the wax paper into a square, then into a smaller square. “I have signed off on maybe four hundred of those. I have lost sleep over one. Coffee? I’m buying. Accepting coffee from a police officer is not admissible. I checked.”", portrait:"tired" },
    ],
    choices:[
      { text:"Take the coffee", reaction:"He waits until you have both hands on the cup. “Did he swim?” You say yes — everyone in your family swims, César went a mile out at Crandon and came back bored. Ramirez nods the way a man nods when you confirm the thing he was hoping to be wrong about, and writes nothing down at all. “Okay,” he says. “Okay.” He pays with exact change he had already counted out in the car.", effects:{ "npc.ramirez.met":true, "npc.ramirez.trust":1, flags:["r_met"], montage:"Drank a cop’s coffee on Flagler. He asked whether César could swim." } },
      { text:"I came to bury him, not to talk to you", reaction:"“Sure.” He steps aside and lets you past, which costs him nothing and somehow costs you something. “For the record — I came to the service. Back row. You shook my hand, you thanked me for coming, and you thought I was from the union.” The sedan takes three tries to start. Even his car is exhausted.", effects:{ "npc.ramirez.met":true, "npc.ramirez.evidence":1, flags:["r_met","r_cold_open"], montage:"Walked past Ramirez on Flagler. He had been at the funeral. Back row." } },
    ] },

  r_frame_nineteen: { speaker:"ramirez", portrait:"tired", priority:11,
    conditions:{ flag:"r_met", flagNot:"r_elena_known", evidenceGte:3, dealsSinceGte:3 },
    lines:[
      { text:"Ramirez is on the hood of the sedan with a manila envelope on one knee and a sandwich on the other, eating with the concentration of a man who missed lunch on Tuesday and is aware that it is now Thursday.", portrait:"neutral" },
      { text:"“My kid takes pictures. Twenty-two. Night classes at Miami-Dade. Thinks this city is a SUBJECT instead of a place.” He slides a contact sheet across the hood. Thirty-six frames of Overtown at dusk. “Nineteen.”", portrait:"tired" },
      { text:"Frame nineteen is you. Half-turned, hand out, on a corner nobody has ever photographed for the architecture. “She doesn’t know what she got. She thinks it’s a picture about the light. It IS a picture about the light. That’s the part that keeps me up.”", portrait:"wry" },
    ],
    choices:[
      { text:"She won't see me on that corner again", reaction:"“That’s the correct answer. It is also the answer everybody gives me.” He folds the sheet back into the envelope like a man putting a bird back in a cage. “Elena. Her name is Elena. Now you know it, which means now it costs you something.”", effects:{ "npc.ramirez.trust":1, flags:["r_elena_known","r_elena_promise"], montage:"Ramirez showed you frame nineteen. Her name is Elena." } },
      { text:"Name a price for the negative", reaction:"“It’s a contact sheet, kid. A dollar forty of paper and a chemistry set.” He does not get angry, which is the problem. “You just tried to buy a photograph of yourself off a police officer in a parking lot. Write today’s date down somewhere. You’ll want it later, for the part where you wonder when it started.”", effects:{ cred:2, "npc.ramirez.evidence":1, flags:["r_elena_known","r_offered_money"], montage:"Tried to buy frame nineteen off a cop. He told you to note the date." } },
      { text:"Keep your family out of my business", reaction:"“She walked into YOUR business. With a camera her grandmother paid for.” He gets off the hood and brushes crumbs from a tie that stopped being fashionable during a different presidency. “Fifteen years I have done this job without hating anybody. Don’t be the one who ruins the record.”", effects:{ "npc.ramirez.trust":-1, "npc.ramirez.evidence":1, flags:["r_elena_known","r_warned_off"], montage:"Told Ramirez to keep his daughter out of it. He remembered that." } },
    ] },

  r_the_water: { speaker:"ramirez", portrait:"tired", priority:13,
    conditions:{ flag:"r_met", flagNone:["r_file_seen"], totalProfitGte:9000, moveGte:8, dealsSinceGte:2 },
    lines:[
      { text:"He does not call ahead. He is in the booth across from you with a folder he should not have photocopied, and he turns it around so it faces you, which detectives are trained never to do.", portrait:"neutral" },
      { text:"“Two teaspoons. That is how much water was in your brother. A man who drowns is FULL — foam in the airway, they call it a foam cone, it is the least poetic thing in medicine.” He turns a page with one finger. “Your brother was dry. He went into that ocean already finished.”", portrait:"tired" },
      { text:"“Also his shoes were on. Tied. I have pulled eleven men out of that water and every one came up barefoot — the ocean takes shoes, it’s the first thing it does.” He closes the folder. “Manner: accident. Signed 4:40 on a Friday. I have seen faster. I have never seen tidier.”", portrait:"wry" },
    ],
    choices:[
      { text:"Then open it again", reaction:"“I asked. Then I asked a second time, which in my building is once too many. A captain told me the family had been through enough, and used my first name, which he had never done before and has not done since.” He leaves the photocopies on the table. He does not say keep them. He does not take them. On his way out he writes the date in a notebook.", effects:{ "npc.ramirez.trust":1, "npc.ramirez.evidence":1, flags:["act1_done","r_file_seen"], montage:"Two teaspoons of water, and his shoes still tied. It was not an accident." } },
      { text:"You showed me this because you want something", reaction:"“Obviously. I’m police. I don’t have friends, I have a caseload.” It is his usual joke and it lands about a foot short of where he threw it. He puts money on the table for a coffee he did not drink. “Take the pages anyway. When you get tired of being the only person who knows, you have my number, and I have nothing else going on.”", effects:{ cred:2, "npc.ramirez.evidence":2, flags:["act1_done","r_file_seen","r_kept_distance"], montage:"Asked Ramirez what the file cost. He left the pages on the table anyway." } },
    ] },

  r_hanging_the_show: { speaker:"ramirez", portrait:"wry", priority:10,
    conditions:{ flagAll:["act1_done","r_elena_known"], flagNone:["r_show_open"], totalProfitGte:25000, dealsSinceGte:3 },
    lines:[
      { text:"Maria’s gallery, Tuesday, three days out. A young woman is up a stepladder with a spirit level in her teeth. Her father is holding the ladder. In a suit. At four in the afternoon on a workday, which tells you his priorities and roughly what his captain thinks of them.", portrait:"neutral" },
      { text:"“Thirty prints, thirty frames.” He says it the way other men say a sentence length. “Museum glass. Forty dollars a frame. I priced it. Then I priced it again in a Pearle Vision parking lot, on a pad, like an idiot, in case the first place was robbing me.”", portrait:"tired" },
      { text:"“Maria told her there’s a grant. There is no grant. Fifteen years of listening to people lie, and a grant does not sound like a woman changing the subject twice.” He looks at the wall instead of at you. “So here I am. Holding a ladder. In a room I would need a warrant to search.”", portrait:"wry" },
    ],
    choices:[
      { text:"Tell her", reaction:"“And say what? Sweetheart, the frames are dirty, hang it on nails?” The ladder does not move an inch while he says it. “She got ONE thing this year. She’s twenty-two and she got one thing. I am not the man who takes it — and now neither are you, because I just made you a witness to me not being him.”", effects:{ "npc.ramirez.trust":1, flags:["r_show_open","r_grant_known"], montage:"Ramirez knows there is no grant. He is holding the ladder anyway." } },
      { text:"Pay for the opening. Through Maria. — $4,000", reaction:"Wine, cards, a listing in the Herald’s Friday section, and a printer in Hialeah who suddenly discounts everything. Nobody tells anybody. Two weeks later Ramirez buys your coffee, which from a man who has never once bought your coffee is a full paragraph, and neither of you mentions it, ever.", effects:{ cashDelta:-4000, "npc.maria.trust":1, "npc.ramirez.trust":1, flags:["r_show_open","r_funded_show"], montage:"Paid for the opening through Maria. $4,000. Nobody said anything." } },
      { text:"Take the ladder. Let him go back to work.", reaction:"He looks at his own hands on the rail for a second before he lets go. Then he sits in the sedan across the street for six hours with a thermos and a notebook, working on you — which is his way of saying thank you and also his way of saying nothing has changed.", effects:{ "npc.ramirez.trust":2, "npc.ramirez.evidence":1, flags:["r_show_open","r_held_ladder"], montage:"Held the ladder so a detective could get back to working your case." } },
    ] },

  r_the_turn: { speaker:"ramirez", portrait:"tired", priority:12,
    conditions:{ flag:"r_show_open", flagNone:["r_turn_done"], evidenceGte:7, dealsSinceGte:3 },
    lines:[
      { text:"Four in the morning at a Denny’s on Biscayne. Ramirez has the corner booth and the look of a man who rehearsed in the car. There is no file on the table. That is how you know this is not police work.", portrait:"tired" },
      { text:"“I’m going to do this badly, so I’ll do it fast. I have had this conversation with eleven people. Nine of them I had something on. Two of them I liked.” He turns his coffee cup a quarter turn. “Tonight I have nothing on you I would carry upstairs to Vance. I’m asking anyway.”", portrait:"tired" },
      { text:"“Somebody I was responsible for went into that water. Not a case. A guy. He called me from a payphone every other Thursday for nine months and I bought his groceries out of my own pocket, and I have never told anybody that, including my wife, who thinks I am bad with the checkbook.” His hand does something that fails to become a word. “Help me. Not as a — just help me.”", portrait:"wry" },
    ],
    choices:[
      { text:"What do you need?", reaction:"A name, a district, and a Thursday. You give him one of the three and it is true, which surprises you considerably more than it surprises him. He writes it on a napkin. Then — because he is police and cannot help it — he writes the date, the time, and the words SUBJECT VOLUNTEERED underneath.", effects:{ "npc.ramirez.trust":2, "npc.ramirez.evidence":1, flags:["r_turn_done","r_helping"], montage:"Gave Ramirez one true thing at 4 AM. He wrote SUBJECT VOLUNTEERED on a napkin." } },
      { text:"Who was he?", reaction:"“Ask me again when you can afford the answer.” He puts three dollars on a four-dollar check and goes. For nine days the sedan is not behind you, and you notice, and you find that you miss it, which is a thing you are going to have to sit with later.", effects:{ "npc.ramirez.trust":1, "npc.ramirez.evidence":2, flags:["r_turn_done","r_pressed_name"], montage:"Asked Ramirez who he lost. He said you couldn’t afford the answer yet." } },
      { text:"You're recruiting me", reaction:"“Yes.” He says it instantly, which is the worst part of the entire evening. “That is exactly what this is. I was good at it in 1979 and I am better now, and I would like you to know that I know precisely what I am doing to you while I do it.” He drinks his coffee. “Does knowing help? It never helps.”", effects:{ cred:3, "npc.ramirez.trust":-1, "npc.ramirez.evidence":1, flags:["r_turn_done","r_named_it"], montage:"Told Ramirez you knew a recruitment when you saw one. He agreed immediately." } },
    ] },

  r_confession: { speaker:"ramirez", portrait:"tired", priority:13,
    conditions:{ flagAll:["r_turn_done","knows_ramirez_ran"], flagNone:["r_confessed"], evidenceGte:10, totalProfitGte:30000, dealsSinceGte:2 },
    lines:[
      { text:"He picks you up himself, six in the morning, and drives to a Farm Store on Bird Road and parks facing a payphone with a cracked hood. “This one,” he says. “Not the one by the door. This one.”", portrait:"neutral" },
      { text:"“Every other Thursday. Nine months. He’d let it ring twice and hang up so I would know to call the booth back — he got that out of a paperback and he was very proud of it.” The engine ticks as it cools. “César Vargas. He was mine. I ran him.”", portrait:"tired" },
      { text:"“I put him next to the Colombian in March because I wanted a route and a date. In July he told me he thought somebody had made him. I said give me two more weeks.” He watches the payphone as though it might ring. “He gave me eleven days. Then the tide.”", portrait:"wry" },
    ],
    choices:[
      { text:"You got him killed", reaction:"“Yes.” No hedge, no pause, nothing rehearsed. “The department’s position is that he drowned. My position is that I drowned him from a Buick, eleven miles away, with a telephone.” The sun comes up over a Farm Store. A man buys a lottery ticket and a banana and drives off, and the world declines to stop.", effects:{ "npc.ramirez.trust":1, flags:["knows_ramirez_ran","act2_done","r_confessed"], montage:"Ramirez ran César. He said it in a parking lot at 6 AM and did not look away." } },
      { text:"Who made him?", reaction:"“If I knew that, I’d have arrested a man in July and you’d have a brother.” He knows the shape of it — a neighborhood kept tidy, a courtesy call, a man who would think of it as MAINTENANCE — and he will not say a name he cannot spell inside a warrant. “I have killed one Vargas with a guess. I am not spending another one.”", effects:{ "npc.ramirez.trust":1, "npc.ramirez.evidence":1, flags:["knows_ramirez_ran","act2_done","r_confessed","r_asked_who"], montage:"Asked who made César. Ramirez refused to guess out loud a second time." } },
      { text:"Let me out of the car", reaction:"He unlocks the door and does not follow. You walk two miles in dress shoes past a Zayre, a church, and a lot full of boats on trailers, and by the time you arrive anywhere you have decided nothing whatsoever. The sedan is behind you again on Wednesday. Neither of you mentions the parking lot.", effects:{ cred:2, "npc.ramirez.trust":-2, "npc.ramirez.evidence":2, flags:["knows_ramirez_ran","act2_done","r_confessed","r_walked_out"], montage:"Got out of Ramirez’s car on Bird Road and walked two miles in dress shoes." } },
    ] },

  r_the_same_thing: { speaker:"ramirez", portrait:"neutral", priority:12,
    conditions:{ flag:"knows_ramirez_ran", flagNone:["r_wire_done"], evidenceGte:11, dealsSinceGte:3 },
    lines:[
      { text:"A one-bedroom on Northwest 12th that Metro-Dade rents by the month and furnishes with whatever the last tenant abandoned. On the table: a Nagra in a shoebox, a roll of surgical tape, and a paper plate of pastelitos, because he is not a monster.", portrait:"neutral" },
      { text:"“I know what I’m asking. I know what happened the last time I asked it. I wrote a version of this where I don’t ask — I performed it for myself in the car, out loud, and it is a hell of a speech, and I did not believe one word of it.”", portrait:"tired" },
      { text:"“One meeting. He talks about a route, I have a case, and your brother stops being a DROWNING and becomes a HOMICIDE. Different file. Different building. Different clock.” He taps the roll of tape. “It itches. Everybody says it itches. Nobody warns you first. So: it itches.”", portrait:"wry" },
    ],
    choices:[
      { text:"Tape it on", reaction:"Ninety minutes of a man discussing shipping schedules and his mother’s hip, and one sentence in the middle worth all of it. Afterward you sit in a Burger King bathroom peeling tape off your ribs and your hands will not hold still. Ramirez waits in the lot. When you come out he says, “Your brother threw up the first time,” and it is the kindest thing anyone has said to you in Miami.", effects:{ cred:-4, "npc.ramirez.trust":3, "npc.ramirez.evidence":-4, "npc.colombiano.trust":-2, flags:["r_wire_done","r_wore_wire"], montage:"Wore the wire for ninety minutes. Peeled it off in a Burger King bathroom." } },
      { text:"No. You already know how this ends.", reaction:"“Yeah.” He doesn’t argue, which is worse than arguing. He puts the Nagra in the shoebox and the shoebox on the floor and eats a pastelito standing at the counter like a man at a wake. “Okay. Then we do it the slow way. The slow way is me. Alone. For another eleven years.”", effects:{ "npc.ramirez.trust":1, flags:["r_wire_done","r_refused_wire"], montage:"Refused the wire. Ramirez put it back in the shoebox and ate a pastelito." } },
      { text:"Sell the ask — tell the Colombian a cop wants a wire on him", reaction:"You say it once, quietly, and it travels the way only that kind of sentence travels. By Friday a lieutenant you have never met is calling you by your first name. By Monday, Internal Review has an anonymous letter about a detective who ran an unregistered informant in July. Ramirez does not call. Ramirez does not need to.", effects:{ cred:5, "npc.colombiano.trust":2, "npc.ramirez.trust":-5, "npc.ramirez.evidence":2, flags:["r_wire_done","betrayed_ramirez"], montage:"Sold Ramirez to the Colombian. Internal Review got a letter about July." } },
    ] },

  r_elena_asks: { speaker:"narrator", portrait:"neutral", priority:9,
    conditions:{ flag:"r_show_open", flagNone:["r_elena_portrait","elena_endangered"], totalProfitGte:35000, dealsSinceGte:4 },
    lines:[
      { text:"The gallery, Thursday, an hour before anybody arrives. A young woman in a paint-stained Hurricanes sweatshirt sits on the floor with thirty index cards, arranging them in an order only she can see. She does not look up. “If you’re the wine guy, it’s in the back. If you’re not the wine guy — do you know anything about wine?”", portrait:"neutral" },
      { text:"Elena Ramirez has a Nikon with gaffer tape on the strap lug and her father’s habit of asking a question sideways. Eight months on the Overtown series. “Everybody thinks it’s about danger. It’s about the six minutes after sunset when everybody’s face is the same color as the buildings.”", portrait:"neutral" },
      { text:"“Hold still. No — don’t POSE, that is the entire problem with men.” The shutter goes. It is a small, cheap, final sound. “You’ve got a face like you’re doing arithmetic. What is it you do?”", portrait:"wry" },
    ],
    choices:[
      { text:"“Import”", reaction:"“Everybody in this city is in import.” She laughs, writes IMPORT GUY on the back of an index card and clips it to a print she hasn’t hung yet. That card is still clipped there in November. A federal paralegal photographs it in March.", effects:{ cred:1, "npc.ramirez.evidence":1, flags:["r_elena_portrait","r_elena_lied"], montage:"Elena Ramirez photographed you and wrote IMPORT GUY on an index card." } },
      { text:"Step out of the frame", reaction:"You move before the second frame. She lowers the camera and looks at you the way her father looks at a witness who has just corrected a small detail. “Okay,” she says. “Sorry. My dad does that too. He has been in four photographs since 1979 and he’s blurry in three of them.”", effects:{ "npc.ramirez.evidence":-1, flags:["r_elena_portrait","r_elena_unphotographed"], montage:"Stepped out of Elena Ramirez’s frame. She said her father does that too." } },
      { text:"Ask her about her father", reaction:"“He came home in July and sat in the car for an hour. A whole hour — I watched him from the window.” She squares two cards that are already square. “Then he came in and asked if I still wanted that lens. He bought it that weekend. He can’t afford it. He did it anyway.” Across the room, Maria stops pretending to do inventory.", effects:{ "npc.maria.trust":-1, flags:["r_elena_portrait","r_elena_july"], montage:"Elena said her father sat in the car for an hour in July, then bought her a lens." } },
    ] },

  r_the_flowers: { speaker:"colombiano", portrait:"neutral", priority:12,
    conditions:{ flagAll:["betrayed_ramirez","r_show_open"], flagNone:["r_flowers_done"], "npc.colombiano.trust":{gte:2}, fedHeatGte:35, dealsSinceGte:2 },
    lines:[
      { text:"He is in the back of the car with the Herald folded open to the arts page, a section you did not know it had. “Your detective’s daughter. The photographs. I sent flowers. Orchids — they last. Everything else in this city is dead by Sunday.”", portrait:"neutral" },
      { text:"“It is a courtesy. When a man’s child does a thing, you send flowers; my mother would come out of the ground.” He refolds the paper along its original creases. “Someone signed for them. A young woman, the delivery man says. She wrote her name on the line very neatly. He mentioned that. The neatness.”", portrait:"cold" },
      { text:"He has not threatened anybody. He has told you about flowers, and about a section of the newspaper, and about his mother. That is the entire content of the conversation, and you are sweating through a shirt that cost ninety dollars.", portrait:"pleased" },
    ],
    choices:[
      { text:"Take the gallery onto your own books — $12,000", reaction:"You absorb the lease, the insurance, and a favor in a currency he has not named yet, so that the address stops being interesting to anyone. He agrees pleasantly and does not raise the price, which is how you know that he will. You have shown a careful man exactly where you are soft, and he thanked you for it in the voice people use for weather.", effects:{ cashDelta:-12000, cred:-5, "npc.colombiano.trust":-1, "npc.ramirez.trust":1, flags:["r_flowers_done","protected_ramirez"], montage:"Paid $12,000 to make a gallery boring. He did not raise the price. Yet." } },
      { text:"Say nothing. Ask about the route.", reaction:"You change the subject and he allows it, which is the transaction completing. Nothing happens to anybody. A car idles outside the gallery for three nights and Elena photographs it twice, because she likes what the streetlight does to the hood. Everyone who loves her finds out separately. Everyone who loves her looks at you.", effects:{ flags:["r_flowers_done","elena_endangered"], montage:"Let the orchids stand. A car idled outside the gallery for three nights." } },
    ] },

  r_act3_witness: { speaker:"ramirez", portrait:"neutral", priority:13,
    conditions:{ flag:"r_confessed", flagNone:["r_witness_asked","ending_witness","ending_inheritor","ending_ghost"], evidenceGte:10, totalProfitGte:40000, dealsSinceGte:2 },
    lines:[
      { text:"Room 411, federal building, a table with a scratch in it shaped almost exactly like Florida. AUSA Vance lays two documents side by side and does not sit down. Ramirez sits. Ramirez brought his own thermos, because he does not trust the machine on four.", portrait:"neutral" },
      { text:"“Everything,” Vance says. “The route, the wash, the names, and the eleven days in July. In exchange you testify — and you do not live in this state again. Not Tampa. Not Orlando. Not a beach house under your mother’s maiden name. I have seen all three.”", portrait:"tired" },
      { text:"Ramirez says nothing at all through this, which you have learned is what he does when he wants a thing so badly he does not trust his own voice to carry it. Then: “Your brother’s file says ACCIDENT. I can make it say something else. It is the only thing I have ever had to offer anybody, and I have offered it twice.”", portrait:"tired" },
    ],
    choices:[
      { text:"Sign it. All of it — including how he ran César.", reaction:"Six hours, a court reporter, and one sentence you have to say twice because the first time it does not come out loud enough: he ran my brother off the books. Vance underlines it. Ramirez looks at the scratch shaped like Florida for the rest of the afternoon. The case is twice as strong, and he will not have a badge when it is tried.", effects:{ cred:-14, "npc.ramirez.evidence":-9, "npc.ramirez.trust":-3, "npc.colombiano.trust":-4, flags:["ending_witness","r_witness_asked","betrayed_ramirez"], montage:"Signed. Told them Ramirez ran César off the books. Vance underlined it." } },
      { text:"Sign it. César was never anybody's informant.", reaction:"You leave one man out of six hours of truth, which is the most expensive editing of your life. Vance asks the question three different ways; you give the same answer three times. In the elevator Ramirez says, “You shouldn’t have done that,” and then holds the door for you, and then says nothing at all for eleven floors.", effects:{ cred:-10, "npc.ramirez.evidence":-6, "npc.ramirez.trust":3, "npc.colombiano.trust":-4, flags:["ending_witness","r_witness_asked","protected_ramirez"], montage:"Signed, and left Ramirez out of it. He held the elevator and said nothing." } },
      { text:"Not today, counselor", reaction:"Vance caps her pen with the finality of a woman who has just been handed a gift. “Good. Honestly. Half my convictions are men who signed that thing badly.” In the elevator Ramirez says, to nobody in particular, “That’s the one I’d have picked too,” and then does not speak to you for a month.", effects:{ cred:6, "npc.ramirez.evidence":3, flags:["r_witness_asked","r_refused_witness"], montage:"Refused the proffer in room 411. Vance capped her pen and looked relieved." } },
    ] },

  r_head_start: { speaker:"ramirez", portrait:"tired", priority:11,
    conditions:{ flag:"protected_ramirez", flagNone:["r_head_start","ending_witness"], "npc.ramirez.trust":{gte:3}, evidenceGte:9, dealsSinceGte:2 },
    lines:[
      { text:"A shopping-center parking lot in Kendall, which is where men do the things they cannot do downtown. Ramirez has a cardboard box in the trunk and a lighter he borrowed off somebody, because he quit smoking in 1979 and has mentioned it every year since.", portrait:"neutral" },
      { text:"“Two hundred and six pages in this box exist only because I wrote them down. Not evidence — INTELLIGENCE. The difference is a lawyer. The difference is also me.” He lights the first page off the second. “She printed a photograph of me last month. I look old in it. I AM old in it.”", portrait:"tired" },
      { text:"“This doesn’t make us friends and it doesn’t make you clean. It makes us two men who agreed about one thing, one time.” The box burns in a shopping cart behind a closed Zayre. A security guard watches it for a while and decides it is not his problem.", portrait:"wry" },
    ],
    choices:[
      { text:"Thank you, detective", reaction:"“Don’t.” He watches the last page curl. “Thank me by being GONE. Genuinely gone — not Fort Lauderdale gone. If I see you in this city in six months I will rebuild every page, and I will be faster the second time.”", effects:{ "npc.ramirez.evidence":-8, "npc.ramirez.trust":1, flags:["r_head_start","ramirez_debt"], montage:"Ramirez burned 206 pages in a shopping cart behind a dead Zayre." } },
      { text:"Rebuild it. I'll still be here.", reaction:"He laughs — an actual laugh, rusty from lack of use. “That is the most honest thing anybody has said to me all year.” He burns the pages anyway. “Consider it a head start. I have never given one before and I do not expect to enjoy the experience.”", effects:{ cred:5, "npc.ramirez.evidence":-6, flags:["r_head_start","ramirez_debt"], montage:"Told Ramirez you would stay. He gave you the head start anyway." } },
    ] },

  r_last_call: { speaker:"ramirez", portrait:"tired", priority:12,
    conditions:{ flag:"knows_ramirez_ran", flagAny:["ending_inheritor","ending_ghost"], flagNone:["r_last_call"] },
    lines:[
      { text:"The sedan is outside your building at five in the morning with the engine off, which is new. He does not get out. He rolls the window down four inches, which is as far as it goes, because the crank came off in 1984 and lives in the glovebox.", portrait:"neutral" },
      { text:"“I’m not going to ask again. Eleven people in fifteen years, and I have learned to hear the answer about two days before anybody says it.” The thermos is on the dash. He does not open it. “I want you to know I’m not angry. I’d like to be. It would be easier to drive home angry.”", portrait:"tired" },
      { text:"“His file stays ACCIDENT. In eighteen months a clerk boxes it. In five years the box goes to a warehouse in Doral with forty thousand other boxes, and that’s it, that’s the whole thing, that is what a life gets when nobody says anything.”", portrait:"wry" },
    ],
    choices:[
      { text:"Buy back the July paperwork — $15,000", reaction:"Four informant-fund vouchers with his signature and a blank payee line, and by Thursday they are not in the building any more. It costs fifteen thousand and a favor to a man who now knows something about you. Ramirez never learns why Internal Review stopped calling. He assumes he got lucky. He has never once gotten lucky.", effects:{ cashDelta:-15000, heatDelta:6, "npc.ramirez.trust":2, flags:["r_last_call","protected_ramirez"], montage:"Spent $15,000 pulling four vouchers with a detective’s signature on them." } },
      { text:"Give him Maria instead", reaction:"You hand a tired man a case he can actually close, and it is not yours and it is not the Colombian’s. He takes it, because he is police at five in the morning and because you knew he would. The gallery’s books go to a forensic accountant in September. Maria calls you once. You let it ring.", effects:{ cred:-4, "npc.ramirez.trust":2, "npc.ramirez.evidence":-5, "npc.maria.trust":-6, flags:["r_last_call","betrayed_maria"], montage:"Gave Ramirez the gallery’s books instead of the route. She called once." } },
      { text:"Let him drive home", reaction:"You say nothing worth writing down and he nods as though it were an answer, because it is. The window goes up in four-inch increments. “Take care of yourself,” he says — which is what he says to victims — and drives off toward a house in Westchester where somebody has left a light on for him.", effects:{ "npc.ramirez.trust":1, flags:["r_last_call","r_let_him_go"], montage:"Let Ramirez drive home with nothing. He said take care of yourself." } },
    ] },

  // ── ARC: ELENA — the detective's daughter (5 beats, branch pays off in the ending) ──
};

// Storylet condition checker
// ═══════════════════════════════════════════════════════════════
// V5 CAMPAIGN — three acts, one ending in three variants.
// Acts are gated on STORY FLAGS, never on money alone.
//   ACT I  INHERIT — ends on act1_done (the death was not an accident)
//   ACT II BECOME  — ends on act2_done (César was informing, and to whom)
//   ACT III CHOOSE — ends on the last night, at the gallery, after closing
// ═══════════════════════════════════════════════════════════════
const ACTS=[
  null,
  { n:1, name:"INHERIT", color:C.blue, goal:"Find out what happened to César.",
    sub:"Take his route. Learn the city. Meet the three people who knew him." },
  { n:2, name:"BECOME", color:C.gold, goal:"It was not an accident. Somebody decided.",
    sub:"Find out who César was talking to — and who found out he was talking." },
  { n:3, name:"CHOOSE", color:C.pink, goal:"César was informing. You know who ran him.",
    sub:"All three of them want you to be their version of him. Pick one, then leave." },
];
const getAct=s=>{
  const f=(s&&s.storyFlags)||{};
  return f.act2_done?3:(f.act1_done?2:1);
};
const BETRAY_FLAGS={ betrayed_maria:"maria", betrayed_ramirez:"ramirez", betrayed_col:"colombiano" };
const PROTECT_FLAGS={ protected_maria:"maria", protected_ramirez:"ramirez" };
const betrayedList=s=>{ const f=(s&&s.storyFlags)||{};
  return Object.keys(BETRAY_FLAGS).filter(k=>f[k]).map(k=>BETRAY_FLAGS[k]); };
const protectedList=s=>{ const f=(s&&s.storyFlags)||{};
  return Object.keys(PROTECT_FLAGS).filter(k=>f[k]).map(k=>PROTECT_FLAGS[k]); };
const ENDING_ROUTES=[
  { id:"witness", flag:"ending_witness", icon:"⚖️", name:"THE WITNESS", color:C.blue, who:"ramirez",
    blurb:"Give Ramirez the network. César stops being a drowning and becomes a source, and you stop being a person and become a number in a filing." },
  { id:"inheritor", flag:"ending_inheritor", icon:"🪑", name:"THE INHERITOR", color:C.gold, who:"colombiano",
    blurb:"Take the chair. Become a man who could order what was ordered on your brother, and find out how little it weighs." },
  { id:"ghost", flag:"ending_ghost", icon:"🛫", name:"THE GHOST", color:C.green, who:"maria",
    blurb:"Take the money and go. Nobody is punished. That includes you, and that is the problem." },
];
const CAMPAIGN_ENDINGS={ witness:true, inheritor:true, ghost:true };
const commitmentOf=s=>{
  if(s&&s.commitment) return s.commitment;
  const f=(s&&s.storyFlags)||{};
  const hit=ENDING_ROUTES.find(r=>f[r.flag]);
  return hit?hit.id:null;
};
// The last night arms itself once Nestor has told somebody what he will do, or
// once Act III has run long enough that the city stops waiting for him to decide.
const lastNightOpen=s=>{
  if(!s) return false;
  if(s.lastNight) return true;
  if(getAct(s)!==3) return false;
  return !!commitmentOf(s)||((s.move||0)-(s.actStartMove||0))>=8;
};

const meetsConditions=(conds,s)=>{
  const ev=s.npcState?.ramirez?.evidence||0;
  for(const [k,v] of Object.entries(conds)){
    if(k==="totalProfitGte"){ if((s.totalProfit||0)<v) return false; }
    else if(k==="totalDealsGte"){ if((s.totalDeals||0)<v) return false; }
    else if(k==="credGte"){ if(s.cred<v) return false; }
    else if(k==="cashGte"){ if(s.cash<v) return false; }
    else if(k==="fedHeatGte"){ if(s.fedHeat<v) return false; }
    else if(k==="evidenceGte"){ if(ev<v) return false; }
    else if(k==="turfGte"){ if(s.turf.filter(t=>t>0).length<v) return false; }
    else if(k==="moveLte"){ if(s.move>v) return false; }
    else if(k==="debtGte"){ if(s.debt<v) return false; }
    else if(k==="debtLte"){ if(s.debt>v) return false; }
    else if(k==="liquidGte"){ if(s.cash+s.bank+(s.cleanCash||0)<v) return false; }
    else if(k==="dealsSinceGte"){ if((s.dealsSinceStory||0)<v) return false; }
    else if(k==="soldCrack"){ if(!s.storyFlags?.sold_crack) return false; }
    else if(k==="flag"){ if(!s.storyFlags?.[v]) return false; }
    else if(k==="flagNot"){ if(s.storyFlags?.[v]) return false; }
    else if(k==="flagAll"){ for(const f of v){ if(!s.storyFlags?.[f]) return false; } }
    else if(k==="flagAny"){ if(!v.some(f=>s.storyFlags?.[f])) return false; }
    else if(k==="flagNone"){ if(v.some(f=>s.storyFlags?.[f])) return false; }
    else if(k==="moveGte"){ if((s.move||0)<v) return false; }
    else if(k==="cashLte"){ if((s.cash||0)>v) return false; }
    else if(k==="liquidLte"){ if((s.cash||0)+(s.bank||0)+(s.cleanCash||0)>v) return false; }
    else if(k==="fedHeatLte"){ if((s.fedHeat||0)>v) return false; }
    else if(k==="credLte"){ if((s.cred||0)>v) return false; }
    else if(k==="hpLte"){ if((s.hp||0)>v) return false; }
    else if(k==="hpGte"){ if((s.hp||0)<v) return false; }
    else if(k==="evidenceLte"){ if(ev>v) return false; }
    else if(k==="eraGte"){ if((s.currentEra||0)<v) return false; }
    else if(k==="eraLte"){ if((s.currentEra||0)>v) return false; }
    else if(k==="bustsGte"){ if((s.totalBusts||0)<v) return false; }
    else if(k==="turfLte"){ if((s.turf||[]).filter(t=>t>0).length>v) return false; }
    else if(k==="invGte"){ if((s.inv||[]).reduce((a,b)=>a+b,0)<v) return false; }
    else if(k==="locIn"){ if(!v.includes(s.loc)) return false; }
    else if(k==="nightOnly"){ if((((s.move||0)%2)===1)!==!!v) return false; }
    else if(k==="hasGun"){ if(!!s.gun!==!!v) return false; }
    else if(k==="hasLifestyle"){ if(!(s.lifestyle||[]).includes(v)) return false; }
    else if(k==="actGte"){ if(getAct(s)<v) return false; }
    else if(k==="actLte"){ if(getAct(s)>v) return false; }
    else if(k==="actEq"){ if(getAct(s)!==v) return false; }
    else if(k==="actMoveGte"){ if((s.move||0)-(s.actStartMove||0)<v) return false; }
    else if(k==="actMoveLte"){ if((s.move||0)-(s.actStartMove||0)>v) return false; }
    else if(k==="committed"){ if(!!commitmentOf(s)!==!!v) return false; }
    else if(k==="commitmentIs"){ if(commitmentOf(s)!==v) return false; }
    else if(k==="betrayedGte"){ if(betrayedList(s).length<v) return false; }
    else if(k==="betrayedLte"){ if(betrayedList(s).length>v) return false; }
    else if(k==="protectedGte"){ if(protectedList(s).length<v) return false; }
    else if(k==="protectedLte"){ if(protectedList(s).length>v) return false; }
    else if(k==="betrayedIs"){ if(!betrayedList(s).includes(v)) return false; }
    else if(k==="protectedIs"){ if(!protectedList(s).includes(v)) return false; }
    else if(k==="lastNight"){ if(lastNightOpen(s)!==!!v) return false; }
    else if(k==="orGroup"){
      let ok=false;
      if(v.totalProfitGte!=null && (s.totalProfit||0)>=v.totalProfitGte) ok=true;
      if(v.credGte!=null && s.cred>=v.credGte) ok=true;
      if(v.turfGte!=null && s.turf.filter(t=>t>0).length>=v.turfGte) ok=true;
      if(!ok) return false;
    }
    else if(k.startsWith("npc.")){
      const p=k.split("."), nv=s.npcState?.[p[1]]?.[p[2]];
      if(v.eq!==undefined && nv!==v.eq) return false;
      if(v.gte!==undefined && (nv||0)<v.gte) return false;
      if(v.lte!==undefined && (nv||0)>v.lte) return false;
    }
  }
  return true;
};
const selectStorylet=s=>{
  const seen=s.storySeen||{};
  const avail=Object.entries(STORY).filter(([id,n])=>!seen[id]&&meetsConditions(n.conditions,s)).sort((a,b)=>b[1].priority-a[1].priority);
  if(!avail.length) return null;
  const top=avail[0][1].priority, tier=avail.filter(([,n])=>n.priority===top);
  const [id,node]=tier[Math.floor(Math.random()*tier.length)];
  return { id, ...node, lineIdx:0 };
};
const applyChoiceEffects=(s,eff)=>{
  let ns={...s, npcState:{...s.npcState}, storyFlags:{...s.storyFlags}, montage:[...s.montage]};
  for(const [k,v] of Object.entries(eff||{})){
    if(k==="cashDelta") ns.cash=Math.max(0,ns.cash+v);
    else if(k==="debtDelta") ns.debt=Math.max(0,ns.debt+v);
    else if(k==="heatDelta") ns.fedHeat=CL(ns.fedHeat+v,0,100);
    else if(k==="launderPct"){ const amt=Math.floor(ns.cash*v.pct); const fee=Math.floor(amt*v.fee);
      ns.cash-=amt; ns.cleanCash=(ns.cleanCash||0)+amt-fee; }
    else if(k==="cleanDelta") ns.cleanCash=(ns.cleanCash||0)+v;
    else if(k==="hpDelta") ns.hp=CL((ns.hp||0)+v,0,100);
    else if(k==="bankDelta") ns.bank=Math.max(0,(ns.bank||0)+v);
    else if(k==="gun") ns.gun=!!v;
    else if(k==="coatDelta") ns.coatSp=Math.max(20,(ns.coatSp||0)+v);
    else if(k==="demandBoost"){ ns.demand=ns.demand.map((d,i)=>i===v.idx?Math.max(.4,d*v.mult):d); }
    else if(k==="invGift"){
      const room=Math.max(0,(ns.coatSp||0)-ns.inv.reduce((a,b)=>a+b,0)), qty=Math.min(v.qty,room);
      if(qty>0){ const inv=[...ns.inv], ac=[...ns.avgCost], pre=inv[v.idx];
        ac[v.idx]=Math.round((ac[v.idx]*pre)/(pre+qty)); inv[v.idx]=pre+qty; ns.inv=inv; ns.avgCost=ac; } }
    else if(k==="cred") ns.cred=CL(ns.cred+v,0,100);
    else if(k==="flags"){ v.forEach(f=>ns.storyFlags[f]=true);
      // Elena is the line nobody crosses. Crossing it costs with everyone at once.
      if(v.indexOf("elena_endangered")>=0&&!s.storyFlags?.elena_endangered){
        ns.npcState.maria={...ns.npcState.maria, trust:(ns.npcState.maria?.trust||0)-3};
        ns.npcState.ramirez={...ns.npcState.ramirez, trust:(ns.npcState.ramirez?.trust||0)-5, evidence:CL((ns.npcState.ramirez?.evidence||0)+4,0,20)};
        ns.npcState.colombiano={...ns.npcState.colombiano, trust:(ns.npcState.colombiano?.trust||0)-2};
        ns.cred=CL(ns.cred-6,0,100); ns.fedHeat=CL((ns.fedHeat||0)+8,0,100);
      } }
    else if(k==="montage") ns.montage.push({move:ns.move,text:v});
    else if(k==="demandSpike") ns.demand=ns.demand.map((d,i)=>d*( [4,5].includes(i)?1.6:1 ));
    else if(k==="commit"){
      const rt=ENDING_ROUTES.find(r=>r.id===v);
      if(rt){ ns.commitment=rt.id; ns.storyFlags[rt.flag]=true; }
    }
    else if(k==="lastNight") ns.lastNight=!!v;
    else if(k==="actDone"){ if(v===1) ns.storyFlags.act1_done=true; else if(v===2) ns.storyFlags.act2_done=true; }
    else if(k.startsWith("npc.")){
      const p=k.split(".");
      ns.npcState[p[1]]={...ns.npcState[p[1]],[p[2]]:typeof v==="boolean"?v:(ns.npcState[p[1]]?.[p[2]]||0)+v};
      if(p[2]==="evidence") ns.npcState[p[1]].evidence=CL(ns.npcState[p[1]].evidence,0,20);
    }
  }
  ns.dealsSinceStory=0;
  return ns;
};

// ── ENDING NARRATIVE (Miami Herald / VHS voiceover) ──
const NARRATIVE_OPENERS = {
  witness:[
    "PLAY ▸ The file on César Vargas comes out of a cabinet in the basement of the Metro-Dade building for the first time in eighteen months. It comes out heavier than it went in.",
    "PLAY ▸ A federal grand jury sits for eleven weeks. The transcript runs four thousand pages, and one witness appears on nine hundred of them, identified only by a number.",
  ],
  inheritor:[
    "PLAY ▸ Nothing is announced. A cream suit boards an Avianca flight to Barranquilla on a Thursday, and on Monday the corners are supplied exactly as they were on Friday.",
    "PLAY ▸ The route does not notice. Not noticing is the entire point of the route, and now it is the entire point of the man running it.",
  ],
  ghost:[
    "PLAY ▸ The Eastern flight out of Miami International boards at 6:40 in the morning. Nobody is running. Nobody is following. That turns out to be the hard part.",
    "PLAY ▸ No warrant, no headline, no second funeral. A man leaves a city, and the city, which has never once looked up, does not look up.",
  ],
  dead:[
    "They found the new player in a drainage ditch off the Palmetto. The wallet was empty. The pager was still buzzing.",
    "The medical examiner logged another John Doe Tuesday. Nice suit, the coroner noted. Sand in the shoes.",
  ],
  bust:[
    "Federal agents executed a pre-dawn warrant Tuesday, ending what prosecutors called ‘a remarkably fast rise.’",
    "The arraignment took four minutes. The defendant smiled once — when the prosecutor mispronounced ‘Medellín.’",
  ],
  broke:[
    "The 6 AM Greyhound to Tallahassee carried one passenger with a familiar face and an unfamiliar posture.",
    "You arrived in Miami with nothing. You leave with less. The bus smells exactly like it did on the way down.",
  ],
  escape:[
    "PLAY ▸ A charter lifts off a private strip in the Keys at dawn. No flight plan. No names on the manifest.",
    "PLAY ▸ Grand Cayman immigration stamps a passport that is six days old. The officer doesn’t look up. He’s paid not to.",
  ],
  kingpin:[
    "PLAY ▸ The footage is grainy: a rooftop in Brickell, a skyline that — for tonight, at least — belongs to one person.",
    "PLAY ▸ Channel 7 calls it ‘an empire.’ The DEA calls it ‘a priority.’ The corners just call it by your name.",
  ],
};
const generateNarrative=s=>{
  const ending=s.ending||"broke";
  const openers=NARRATIVE_OPENERS[ending]||NARRATIVE_OPENERS.broke;
  const opener=openers[(s.move||0)%openers.length];
  const days=Math.floor(s.move/2)+1;
  const beats=[];
  const m=s.montage||[];
  const big=m.filter(x=>/Big score|brick/i.test(x.text));
  if(big.length) beats.push(big[big.length-1].text);
  if((s.totalBusts||0)>0) beats.push(`Police records show ${s.totalBusts} prior encounter${s.totalBusts>1?"s":""} with vice units.`);
  if(s.turf.filter(t=>t>0).length>0) beats.push(`At peak, the operation controlled ${s.turf.filter(t=>t>0).length} district${s.turf.filter(t=>t>0).length>1?"s":""}.`);
  const npcLines=[];
  if(s.npcState?.maria?.trust>=4) npcLines.push("A gallery owner in Coral Gables declined to comment, then poured a drink nobody asked for.");
  else if(s.npcState?.maria?.trust<=-2) npcLines.push("An anonymous tip, sources say, came from someone who once called the suspect a friend.");
  if(s.npcState?.ramirez?.met) npcLines.push("Det. R. Ramirez, asked for a statement, said only: “The tide turns. Eventually.”");
  if(s.storyFlags?.col_broken) npcLines.push("Cartel activity in the city, sources say, has 'reorganized under new local management.' The DEA declined to celebrate.");
  else if((s.colTurf||[]).filter(Boolean).length>=3) npcLines.push("Half the corners in the city now answer to a man with a scar and a cream suit.");
  if(s.npcState?.cass?.trust>=2) npcLines.push("A Brickell bank closed four accounts the same morning. 'Routine housekeeping,' said a manager with a new tan.");
  if(s.storyFlags?.shark_grudge) npcLines.push("A man at the fish market, asked if he knew the subject, gutted a snapper and said nothing at all.");
  if(s.storyFlags?.cartel_supplier) npcLines.push("Federal sources allege ties to Medellín. Medellín, as always, alleges nothing.");
  const coda=[], fl=s.storyFlags||{};
  if(s.ending==="witness"||s.ending==="inheritor"||s.ending==="ghost"){
    if(fl.knows_col_ordered) coda.push("A federal affidavit describes the death of César Vargas as “a maintenance decision.” The phrase appears in quotation marks and is attributed to nobody.");
    if(fl.c_col_made_him_say_it) coda.push("One account includes a four-second admission delivered, per the transcript, “at conversational volume,” in an empty room.");
    if(fl.knows_ramirez_ran) coda.push("Internal Affairs opened a file on the handling of a confidential informant designated CI-1140 and closed it in nine weeks, citing the informant’s unavailability.");
    if(fl.maria_knew) coda.push("A Coral Gables gallery owner, asked whether she had known, said that she had, and that she had decided long ago that knowing and telling were the same crime, and then asked that this not be printed.");
    if(fl.elena_endangered) coda.push("A photography student withdrew from a Coral Gables exhibition and gave no reason. Her father drove her to the airport himself and then sat in the short-term lot for an hour.");
    if(fl.col_chair_taken) coda.push("Wholesale prices in Dade County did not move that quarter, which one DEA memo called “the single most alarming thing about it.”");
    else if(fl.col_refused_chair) coda.push("The route went to a man from Cali who lasted nine months. Nobody in Miami remembers his name either, which was always the idea.");
    if(fl.col_bought_silence) coda.push("Twenty-five thousand dollars moved through a marina account in Coconut Grove and bought, by one participant’s estimate, “about six weeks.”");
    if(fl.c_kept_watch) coda.push("Among the effects released by the Medical Examiner: one steel wristwatch, stopped at 11:40, which nobody in the office could explain and nobody in the office wrote down.");
    else if(fl.c_saw_signature) coda.push("A property log at the Medical Examiner’s office carries a detective’s signature dated 6:15 the following morning, on a line for effects that were never collected.");
    if(fl.c_called_first_night) coda.push("A Coral Gables number logged one call from the downtown bus terminal at 7:02 on a Tuesday morning in August. It lasted forty seconds.");
    else if(fl.c_waited) coda.push("A motel on Biscayne still keeps a Bible in the drawer of room 14 with forty dollars in it. Housekeeping has been told for years to leave it alone.");
  }
  if(fl.ramirez_debt) coda.push("Det. R. Ramirez filed his retirement papers in the spring. Colleagues recall a cardboard box burning in a shopping cart behind a closed department store, and no explanation ever offered.");
  else if(fl.ramirez_vendetta) coda.push("A detective who had not taken a vacation since 1981 took two weeks. Sources familiar with the resulting file describe it as “unusually personal.”");
  if(fl.elena_published) coda.push("A student photograph titled FRAME NINETEEN hangs in a permanent collection four blocks from the State Attorney’s office. The subject has never been identified.");
  if(fl.chemist_freed) coda.push("A secondary-school chemistry teacher in Puntarenas, reached by telephone, said he had never been to Florida, and then hung up very politely.");
  else if(fl.chemist_delivered) coda.push("A warehouse in Doral changed hands quietly last quarter. So, apparently, did a chemist.");
  if(fl.shark_loyal_final) coda.push("At a fish market on the river, an old man still guts snapper at 6 AM and still owns his own name.");
  else if(fl.shark_heir) coda.push("A car wash in Tampa reopened under new ownership. Its books, associates note admiringly, are accurate to the gram.");
  if(fl.cesar_held) coda.push("César Santos, released without charge after nine hours of silence, sells boats in Gainesville now and lies cheerfully about why he left.");
  else if(fl.cesar_burned) coda.push("A man deported to Panama gave a statement on his way out. It ran four pages and it named exactly one person.");
  if(fl.walk_good) coda.push("A family on 58th Street received five thousand dollars and a note reading only WALK GOOD. They kept the note. They framed it.");
  if(fl.no_more_crack) coda.push("Corners in Overtown that had one steady supplier in the spring had none at all by the end of summer. Nobody has ever explained it.");
  if(fl.proffer_signed) coda.push("Federal filings identify a cooperating witness by number only. The number appears eleven times.");
  if(fl.postcard_framed) coda.push("A Coral Gables gallery lists a framed postcard at forty thousand dollars. It is not for sale, which the owner considers the entire point.");
  return [opener, `The run lasted ${days} days.`, ...beats.slice(0,2), ...npcLines.slice(0,2), ...coda.slice(0,2)].join(" ");
};
const ENDING_HEADLINES={
  witness:["FEDERAL CASE REOPENS 1986 DROWNING","COOPERATING SOURCE NAMED IN SEALED FILING"],
  inheritor:["ROUTE CHANGES HANDS; NOBODY NOTICES","NO ARRESTS, NO INTERRUPTION, NO COMMENT"],
  ghost:["MAN WHO WAS NEVER HERE LEAVES ANYWAY","VARGAS FILE REMAINS CLOSED"],
  bust:["KINGPIN FALLS IN DAWN RAID","VICE NETS BIGGEST FISH YET"],
  dead:["GANGLAND SLAYING SHOCKS NO ONE","ANOTHER BODY, ANOTHER TUESDAY"],
  broke:["WHO? CITY ALREADY FORGOT","SMALL TIME, SMALLER EXIT"],
  escape:["SUSPECT VANISHES; CASE COLD","GHOST OF BISCAYNE BAY"],
  kingpin:["MIAMI HAS A NEW OWNER","THE CITY KNEELS"],
};

// ═══════════════════════════════════════════════════════════════
// META-PROGRESSION (guarded storage — falls back to memory in artifacts)
// ═══════════════════════════════════════════════════════════════
const ACHIEVEMENTS=[
  { id:"the_witness",  icon:"⚖️", name:"The Witness",   desc:"Testify. Never come back to Florida.",  test:(g,nw)=>g.ending==="witness" },
  { id:"the_inheritor",icon:"🪑", name:"The Inheritor", desc:"Take the chair by the window.",         test:(g,nw)=>g.ending==="inheritor" },
  { id:"the_ghost",    icon:"👻", name:"The Ghost",     desc:"Leave with the money and the truth.",   test:(g,nw)=>g.ending==="ghost" },
  { id:"eleven_days",  icon:"🕯", name:"Eleven Days",   desc:"Learn who gave the order, and why.",    test:(g,nw)=>!!g.storyFlags?.knows_col_ordered },
  { id:"first_blood", icon:"\ud83e\ude78", name:"First Blood",      desc:"Finish a run, any ending",            test:(g,nw)=>true },
  { id:"escape_artist",icon:"\ud83d\udeeb", name:"Escape Artist",   desc:"Get out of Miami alive",              test:(g,nw)=>g.ending==="escape" },
  { id:"the_throne",  icon:"\ud83d\udc51", name:"The Throne",       desc:"Claim the kingpin ending",            test:(g,nw)=>g.ending==="kingpin" },
  { id:"broke_free",  icon:"\ud83d\ude8c", name:"Broke but Free",   desc:"Take the bus home after making $20K", test:(g,nw)=>g.ending==="broke"&&(g.totalProfit||0)>=20000 },
  { id:"clean_hands", icon:"\ud83e\uddfc", name:"Clean Hands",      desc:"Win without ever cutting product",    test:(g,nw)=>(g.ending==="escape"||g.ending==="kingpin")&&!g.storyFlags?.has_cut },
  { id:"ghost_run",   icon:"\ud83d\udc7b", name:"Ghost",            desc:"Win with 8 or less evidence",         test:(g,nw)=>(g.ending==="escape"||g.ending==="kingpin")&&(g.npcState?.ramirez?.evidence||0)<=8 },
  { id:"shark_friend",icon:"\ud83e\udd88", name:"Friend of the Shark", desc:"Clear the whole book",             test:(g,nw)=>g.debt<=0&&(g.totalDeals||0)>=10 },
  { id:"high_roller", icon:"\ud83d\udcb0", name:"High Roller",      desc:"$50K+ in a single sale",              test:(g,nw)=>(g.biggestDeal||0)>=50000 },
  { id:"empire_state",icon:"\ud83c\udfd9\ufe0f", name:"Empire State", desc:"Hold 4+ districts at once",        test:(g,nw)=>g.turf.filter(t=>t>0).length>=4 },
  { id:"storyteller", icon:"\ud83d\udcd6", name:"Storyteller",      desc:"Live 8+ scenes in one run",           test:(g,nw)=>Object.keys(g.storySeen||{}).length>=8 },
  { id:"hurricane",   icon:"\ud83c\udf00", name:"Eye of the Storm", desc:"Trade through the hurricane",         test:(g,nw)=>!!g.storyFlags?.hurricane_done },
  { id:"conquistador",icon:"\u2694\ufe0f", name:"Conquistador",     desc:"Break El Colombiano's empire",        test:(g,nw)=>!!g.storyFlags?.col_broken },
  { id:"frame_19",   icon:"📷", name:"Frame Nineteen",   desc:"Make an honest cop burn his own file", test:(g,nw)=>!!g.storyFlags?.ramirez_debt },
  { id:"succession", icon:"🐟", name:"The Succession",   desc:"Keep Tiburon's name on Tiburon's book", test:(g,nw)=>!!g.storyFlags?.shark_loyal_final },
  { id:"ninety_six", icon:"⚗️", name:"Ninety-Six",       desc:"Put the cartel's chemist on a boat",    test:(g,nw)=>!!g.storyFlags?.chemist_freed },
  { id:"keeper",     icon:"🚌", name:"Brother's Keeper", desc:"Get Cesar Santos out of the room",      test:(g,nw)=>!!(g.storyFlags?.cesar_held||g.storyFlags?.cesar_exiled) },
];
const DEFAULT_META={ rep:0, totalRep:0, runs:0, bestNW:0, wins:0, maxHeatBeaten:-1, upgrades:{}, sound:true, lastDaily:null, ach:{}, endings:{}, topRuns:[], biggestDeal:0 };
let MEM_META=null;
const lsGet=k=>{ try{ return typeof window!=="undefined"&&window.localStorage?window.localStorage.getItem(k):null; }catch(e){ return null; } };
const lsSet=(k,v)=>{ try{ if(typeof window!=="undefined"&&window.localStorage) window.localStorage.setItem(k,v); }catch(e){} };
const loadMeta=()=>{ if(MEM_META) return MEM_META; try{ const s=lsGet("cocaine80s_meta_v4"); MEM_META=s?{...DEFAULT_META,...JSON.parse(s)}:{...DEFAULT_META}; }catch(e){ MEM_META={...DEFAULT_META}; } return MEM_META; };
const saveMeta=m=>{ MEM_META={...m}; lsSet("cocaine80s_meta_v4",JSON.stringify(m)); };

const calcRepEarned=(g,finalNW,isDaily)=>{
  let rep=Math.floor(finalNW/1000);
  rep+=(g.totalDeals||0)*2;
  rep+=g.turf.filter(t=>t>0).length*50;
  rep+=Object.values(g.storySeen||{}).length*15;
  if(g.ending==="escape") rep=Math.floor(rep*1.5);
  if(g.ending==="kingpin") rep=Math.floor(rep*2);
  rep=Math.floor(rep*(1+(g.heatLevel||0)*0.25));
  if(isDaily) rep=Math.floor(rep*1.2);
  return Math.max(10,rep);
};

const applyUpgrades=(st,upg)=>{
  const s={...st};
  for(const [id,lvl] of Object.entries(upg||{})){
    if(!lvl) continue;
    const u=SAFEHOUSE_UPGRADES.find(x=>x.id===id); if(!u) continue;
    const tv=typeof u.value==="number"?u.value*lvl:u.value;
    if(u.effect==="startCash") s.cash+=tv;
    else if(u.effect==="coatSpace") s.coatSp+=tv;
    else if(u.effect==="heatMod") s.upgradeHeatMod=(s.upgradeHeatMod||0)+tv;
    else if(u.effect==="startCred") s.cred=CL(s.cred+tv,0,100);
    else if(u.effect==="startGun") s.gun=true;
    else if(u.effect==="pagerChance") s.pagerChanceMod=(s.pagerChanceMod||0)+tv;
    else if(u.effect==="priceDiscount") s.priceDiscount=(s.priceDiscount||0)+tv;
    else if(u.effect==="legalFeeMod") s.legalFeeMod=(s.legalFeeMod||0)+tv;
  }
  return s;
};
const applyPlaybook=(st,pb)=>{
  if(!pb||!pb.mods) return st;
  const s={...st,playbook:pb.id}, m=pb.mods;
  if(m.startCash!=null) s.cash=m.startCash;
  if(m.bonusCoat) s.coatSp+=m.bonusCoat;
  if(m.startDebt!=null) s.debt=m.startDebt;
  if(m.interestMod) s.interestMod=m.interestMod;
  if(m.copsMod) s.playbookCopsMod=m.copsMod;
  if(m.credMod) s.credMod=m.credMod;
  if(m.credMultiplier) s.credMultiplier=m.credMultiplier;
  if(m.startLoc!=null){ s.loc=m.startLoc; }
  if(m.importBonus) s.importBonus=m.importBonus;
  if(m.mariaTrust) s.npcState={...s.npcState, maria:{...s.npcState.maria, trust:m.mariaTrust}};
  if(m.colombianoTrust) s.npcState={...s.npcState, colombiano:{...s.npcState.colombiano, trust:m.colombianoTrust}};
  if(m.startTurf){ const loc=m.turfLoc||0; s.turf=s.turf.map((t,i)=>i===loc?m.startTurf:t); }
  if(m.startEnforcers){ const loc=m.turfLoc||0; s.enforcers=s.enforcers.map((e,i)=>i===loc?m.startEnforcers:e); }
  return s;
};
const applyDailyMods=(st,mods)=>{
  if(!mods) return st;
  const s={...st,isDaily:true,dailyMods:mods};
  for(const mod of mods){
    if(mod.effect==="priceMulti") s.dailyPriceMulti=mod.value;
    else if(mod.effect==="copsMod") s.dailyCopsMod=mod.value;
    else if(mod.effect==="demandMod") s.dailyDemandMod=mod.value;
    else if(mod.effect==="heatDecayMod") s.dailyHeatDecayMod=mod.value;
    else if(mod.effect==="startCashMod") s.cash=Math.max(200,s.cash+mod.value);
    else if(mod.effect==="pagerBonus") s.dailyPagerBonus=mod.value;
  }
  return s;
};

const createInitialState=()=>{
  const bp=initBasePrices(null);
  const s={
    move:0, loc:0, hp:100, cash:90, bank:0, cleanCash:0, debt:8400,
    cred:0, fedHeat:0, gun:false,
    inv:Array(DRUG_COUNT).fill(0), avgCost:Array(DRUG_COUNT).fill(0), purity:Array(DRUG_COUNT).fill(1), coatSp:100,
    stashInv:Array(DRUG_COUNT).fill(0),
    basePrices:bp, momentum:initMomentum(),
    prices:[], hist:[], demand:Array(DRUG_COUNT).fill(1),
    turf:Array(6).fill(0), enforcers:Array(6).fill(0), safeHouses:Array(6).fill(-1), colTurf:Array(6).fill(false),
    lifestyle:[], rivals:RIVAL_NAMES.slice(0,3).map(n=>({name:n,loc:R(0,5)})),
    currentEra:0, eraStartMove:0,
    totalProfit:0, totalDeals:0, totalBusts:0, biggestDeal:0, streak:0,
    npcState:{ maria:{met:false,trust:0,exposure:0,alive:true}, ramirez:{met:false,trust:0,evidence:0,alive:true}, colombiano:{met:false,trust:0,alive:true}, tiburon:{met:false,trust:0,alive:true}, cass:{met:false,trust:0,alive:true} },
    storyFlags:{}, storySeen:{}, montage:[], dealsSinceStory:0,
    fuseTimers:[], activeDeal:null, supplierHistory:{},
    pagerDeal:null, evtMsg:null, activeStorylet:null,
    hudSeen:{ debt:true, hp:false, heat:false, cred:false, era:false },
    coach:{}, ending:null,
    locDemand:initLocDemand(), patrols:initPatrols(), informants:initInformants(),
    districtSales:LOCS.map(()=>0), shocks:[], newsWire:[], forfeitFuse:0,
    rival:initRival(), rivalFocus:RIVAL_NAMES.slice(0,3).map(()=>R(0,DRUG_COUNT-1)),
    enfLoyalty:LOCS.map(()=>100), launderMove:-1, launderUse:{}, launderedTotal:0,
    // ── V5 CAMPAIGN — every field below is read by getAct / lastNightOpen / the HUD ──
    act:1, actStartMove:0, commitment:null, lastNight:false,
  };
  s.prices=getStreetPrices(bp,s.loc,ERAS[0].demandMod,s.demand,1);
  s.hist=s.prices.map(p=>[p]);
  s.startedAt=Date.now();
  return s;
};

// ═══════════════════════════════════════════════════════════════
// CORE TRANSITIONS — every fn returns { state, effects }
// ═══════════════════════════════════════════════════════════════
function processTravel(s,destLoc){
  const nm=s.move+1, isNight=nm%2===1, era=getEra(s);
  const usedSp=s.inv.reduce((a,b)=>a+b,0);
  const effects=[];

  // Radio event
  let evtMsg=null, evtDrug=null, evtType=null, evtMulti=null;
  if(Math.random()<(nm<10?.5:.35)){
    const e=RADIO_EVENTS[R(0,RADIO_EVENTS.length-1)], dr=DRUGS[R(0,DRUG_COUNT-1)];
    evtMsg=`📻 ${e.msg.replace("{d}",dr.name)}`;
    evtDrug=dr.name; evtType=e.type; evtMulti=e.m;
  }

  // Economy evolve
  const newMom=evolveMomentum(s.momentum);
  const newBase=evolveBasePrices(s.basePrices,newMom,evtDrug,evtType,evtMulti);
  const np=getStreetPrices(newBase,destLoc,era.demandMod,s.demand,s.dailyPriceMulti||1);
  applyMarketPrices(s,destLoc,np);
  const newHist=s.hist.map((h,i)=>[...h.slice(-9),np[i]]);

  // Heat decay & floor
  const sh=s.safeHouses[destLoc];
  let heatDecay=(sh>=0?SAFE_HOUSES[sh].heatDecay:0)+(s.lifestyle.includes("rolex")?2:0);
  if(s.dailyHeatDecayMod) heatDecay*=s.dailyHeatDecayMod;
  const passive=usedSp===0?3:0;
  const hc=usedSp>50?3:usedSp>20?2:usedSp>0?0:-1;
  const heatFloor=Math.floor((s.totalProfit||0)/50000)+Math.floor((s.totalBusts||0)*3);
  const nh=CL(Math.max(s.fedHeat+hc-heatDecay-passive,heatFloor),0,100);

  // Police roll
  const hl=HEAT_LADDER[s.heatLevel||0]||HEAT_LADDER[0];
  const wealthMod=s.cash>=500000?1.6:s.cash>=250000?1.4:s.cash>=100000?1.2:1;
  const policeEff=LOCS[destLoc].heat*0.5*era.copsMod*hl.copsMod*(s.playbookCopsMod||1)*(s.dailyCopsMod||1)*(1+(s.upgradeHeatMod||0))*(1+nh/300)*(isNight?1.2:1)*wealthMod*districtRisk(s,destLoc);
  if(Math.random()<policeEff && usedSp>0){
    effects.push({type:"SFX",name:"police"},{type:"SCREEN",screen:"police"});
    if(!s.hudSeen.heat) effects.push({type:"PING",stat:"heat"});
    return { state:{...s, loc:destLoc, move:nm, prices:np, hist:newHist, basePrices:newBase, momentum:newMom,
      fedHeat:Math.min(100,nh+5), evtMsg, hudSeen:{...s.hudSeen, heat:true},
      rivals:s.rivals.map(v=>({...v,loc:Math.random()<.4?R(0,5):v.loc})) }, effects };
  }

  // Club laundering
  let cash=s.cash, cleanCash=s.cleanCash||0;
  if(s.lifestyle.includes("club")){ const l=Math.min(2000,cash); if(l>0){cash-=l; cleanCash+=l;} }
  if(s.storyFlags?.cass_network&&cash>1500){ const l2=Math.min(1500,cash); cash-=l2; cleanCash+=Math.floor(l2*0.88); }

  // Interest (debt scales)
  let debt=s.debt, bank=s.bank;
  const baseInt=s.interestMod?0.08*s.interestMod:0.08;
  const debtPenalty=debt>=30000?0.06:debt>=20000?0.04:debt>=10000?0.02:0;
  if(nm%4===0&&debt>0) debt=Math.floor(debt*(1+baseInt+debtPenalty));
  if(nm%4===0&&bank>0) bank=Math.floor(bank*1.03);

  // Empire income
  const turfIncome=empireIncome(s);
  const enfUpkeep=crewUpkeep(s);
  const empNet=turfIncome-enfUpkeep;
  cash+=empNet;
  if(empNet>0) effects.push({type:"SPAWN",text:`+${FM(empNet)} turf`,color:C.gold,y:.55});

  // Turf war
  let turfWar=null;
  const rivalInTurf=s.rivals.find(r=>s.turf[r.loc]>0&&r.loc!==destLoc);
  if(rivalInTurf&&Math.random()<.15){
    turfWar={loc:rivalInTurf.loc, rivalName:rivalInTurf.name, rivalPower:R(3,8)+Math.floor(nm/12)};
  }

  // ── THE BOOK — César's line, collected impersonally. No face. No dialogue. ──
  let hpDelta=0;
  const COLLECT_HARD=[
    "Two men are waiting in the stairwell. One of them apologizes before he starts, which is the most frightening part.",
    "They do it in the lot behind a Farm Store on 27th, between a Datsun and a wall, and neither of them says one word the entire time.",
    "The one holding the clipboard reads your brother's account number out loud first, like a teller, and then puts the clipboard down.",
  ];
  const COLLECT_MID=[
    "A man you have never seen holds the door of the phone booth shut until you stop pulling on it.",
    "They catch you at the bus bench on Flagler. It takes forty seconds. A woman across the street goes on waiting for her bus.",
    "The collector is maybe nineteen and clearly hates this, which does not slow him down at all.",
  ];
  const COLLECT_SOFT=[
    "Somebody has written a number on your motel door in grease pencil. It is the correct number.",
    "A man asks you for a light on Washington Avenue, takes your wrist instead of the match, and tells you the date the vig posts.",
    "The envelope under the wiper has no note in it. Just a photograph of the front of the motel, taken this morning.",
  ];
  if(debt>=30000 && nm%3===0){
    const loss=R(15,30); hpDelta=-loss;
    effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"44"},{type:"PING",stat:"hp"});
    const stolen=Math.min(cash,R(500,2000)); cash-=stolen;
    evtMsg=`📕 ${COLLECT_HARD[nm%COLLECT_HARD.length]} −${loss} HP${stolen>0?", −"+FM(stolen)+" taken against the book":""}.`;
  } else if(debt>=20000 && nm%4===0){
    const loss=R(10,20); hpDelta=-loss; effects.push({type:"SHAKE"},{type:"PING",stat:"hp"});
    const stolen=Math.min(cash,R(300,1000)); cash-=stolen;
    evtMsg=evtMsg||`📕 ${COLLECT_MID[nm%COLLECT_MID.length]} −${loss} HP${stolen>0?", −"+FM(stolen)+" taken against the book":""}.`;
  } else if(debt>=10000 && nm%6===0){
    const loss=R(5,12); hpDelta=-loss; effects.push({type:"SHAKE"},{type:"PING",stat:"hp"});
    evtMsg=evtMsg||`📕 ${COLLECT_SOFT[nm%COLLECT_SOFT.length]} −${loss} HP. The vig does not care whose name is on it.`;
  }

  // Success tax
  if(cash>=100000 && (s.currentEra||0)>=1 && nm%8===0){
    const cut=Math.min(cash,Math.floor(cash*0.02));
    if(cut>500){ cash-=cut; if(!evtMsg) evtMsg=`👮 A dirty cop wants his cut. −${FM(cut)}. “Price of doing business, amigo.”`; effects.push({type:"SPAWN",text:`−${FM(cut)}`,color:C.pink,y:.5}); }
  }
  // Failure bonus — one-time lifeline
  if(cash<=2000 && (s.totalProfit||0)>=5000 && debt>0 && !s.storyFlags?.got_failure_bonus){
    const cd=R(0,DRUG_COUNT-1);
    np[cd]=Math.max(DRUGS[cd].min,Math.floor(np[cd]*0.4));
    if(!evtMsg) evtMsg=`A desperate dealer dumps ${DRUGS[cd].name} at fire-sale prices. Grab it while you can.`;
  }

  // Demand recovery + career saturation
  const sat=Math.max(0.75,1-(s.totalDeals||0)*0.001);
  const newDemand=s.demand.map(v=>Math.max(0.4,(v+(1-v)*.20)*(s.dailyDemandMod||1)*sat));

  // Newspaper
  let newspaper=null;
  if(nm>0&&nm%10===0) newspaper=NEWSPAPERS[R(0,NEWSPAPERS.length-1)];

  // Random encounter
  let randEnc=null;
  if(nm>6&&Math.random()<(isNight?.28:.16)){
    const pool=ENCOUNTERS.filter(e=>Math.random()<e.chance);
    if(pool.length){
      const enc=pool[R(0,pool.length-1)];
      if(enc.type==="find") randEnc={...enc,drugIdx:R(0,DRUG_COUNT-1),amt:R(enc.amount[0],enc.amount[1])};
      else if(enc.type==="tip") randEnc={...enc,text:enc.text.replace("{d}",DRUGS[R(0,DRUG_COUNT-1)].name).replace("{l}",LOCS[R(0,5)].name)};
      else if(enc.type==="mugger") randEnc={...enc,hpLoss:R(enc.hpLoss[0],enc.hpLoss[1]),cashLoss:R(enc.cashLoss[0],enc.cashLoss[1])};
      else if(enc.type==="bribe_offer") randEnc={...enc,cost:R(enc.cost[0],enc.cost[1])};
      else if(enc.type==="healer") randEnc={...enc,cost:R(enc.cost[0],enc.cost[1])};
    }
  }

  // Pager deal
  let pagerDeal=s.pagerDeal&&nm<=s.pagerDeal.expiresMove?s.pagerDeal:null;
  // Maria's last favor — act-III rubber band for stalled runs
  let lastFavor=false;
  if(s.storyFlags?.act2_done&&!s.storyFlags?.maria_last_favor&&nm>=40&&(cash+bank+cleanCash)<40000){
    lastFavor=true;
    const di=cash>=3000?R(2,7):R(0,1), q=R(6,10), tl=R(0,5);
    pagerDeal={ drugIdx:di, qty:q, bonusPct:160, targetLoc:tl, expiresMove:nm+6,
      msg:`MARIA: LAST FAVOR. ${q} ${DRUGS[di].name.toUpperCase()} TO ${LOCS[tl].name.toUpperCase()}. MY BUYER PAYS STUPID MONEY. +160%. DON'T WASTE IT.` };
    if(!evtMsg) evtMsg="📟 Maria, one last time: \u201cI'm tired of watching you almost leave. Check your pager. Then GO.\u201d";
    effects.push({type:"SFX",name:"pager"});
  }
  if(!pagerDeal && Math.random()<(0.12+(s.pagerChanceMod||0)) && nm>4){
    const pd=PAGER_DEALS[R(0,PAGER_DEALS.length-1)], drugIdx=R(0,DRUG_COUNT-1), qty=R(pd.qty[0],pd.qty[1]);
    let bonusPct=Math.round((RF(pd.bonus[0],pd.bonus[1])-1)*100);
    if(s.dailyPagerBonus) bonusPct=Math.round(bonusPct*s.dailyPagerBonus);
    const targetLoc=R(0,5);
    pagerDeal={ drugIdx, qty, bonusPct, targetLoc, expiresMove:nm+4,
      msg:pd.msg.replace("{q}",qty).replace("{d}",DRUGS[drugIdx].name.toUpperCase()).replace("{p}",bonusPct) };
    effects.push({type:"SFX",name:"pager"});
  }

  // NPC simulation: evidence creep, patience, betrayal
  let npcState={...s.npcState, maria:{...s.npcState.maria}, ramirez:{...s.npcState.ramirez}, colombiano:{...s.npcState.colombiano}};
  if(npcState.ramirez.met&&nm%5===0) npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+Math.floor(nh/32),0,20);
  const td=s.totalDeals||0;
  if(td>0&&td%10===0&&npcState.ramirez.met&&nh>=40) npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+1,0,20);
  if(s.storyFlags?.refused_ramirez&&(npcState.ramirez.evidence||0)>=10&&nh>=25&&Math.random()<.10){
    npcState.ramirez.evidence=CL(npcState.ramirez.evidence+2,0,20);
    if(!evtMsg) evtMsg="🕵️ Ramirez is done waiting. The case file just got thicker.";
  }
  if(npcState.maria.met&&npcState.maria.trust<=-3&&td%15===0&&td>0&&!s.storyFlags?.maria_sold_out){
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+5,0,20);
    if(!evtMsg) evtMsg="💃 Word on the street: someone close to you talked to Vice. Maria isn’t answering her phone.";
  }
  if(npcState.colombiano.met&&npcState.colombiano.trust<=-3&&(s.totalProfit||0)>=100000&&Math.random()<.12){
    const loss=R(2000,8000); cash=Math.max(0,cash-loss);
    evtMsg=`🇨🇴 El Colombiano sent a message. ${FM(loss)} worth of product destroyed. “You were warned.”`;
    effects.push({type:"SHAKE"});
  }
  // Cartel supplier perk: cheaper coke
  if(s.storyFlags?.cartel_supplier) np[5]=Math.max(DRUGS[5].min,Math.floor(np[5]*0.85));

  // ── FUSE CHAINS ──
  let storyFlags={...s.storyFlags};
  // Maria’s brick debt pays off as a tip once you’ve established yourself
  if((s.totalProfit||0)>=15000&&storyFlags.maria_brick_debt&&!storyFlags.brick_debt_paid){
    storyFlags.brick_debt_paid=true;
    const tipLoc=R(0,5);
    evtMsg=`📟 Maria: “Remember that brick? Consider this interest.” Prices about to crater in ${LOCS[tipLoc].name}.`;
    effects.push({type:"SFX",name:"pager"});
  }
  // The negotiator gets tested — bad intel later
  if((s.totalProfit||0)>=30000&&storyFlags.maria_negotiated&&!storyFlags.negotiator_tested){
    storyFlags.negotiator_tested=true;
    evtMsg=`📟 Maria: “Heroin’s about to spike in Overtown. Load up.” She sounds too casual. Something feels off.`;
  }
  // Burned banker: Cass's memory "improves" once, painfully
  if(storyFlags.cass_burned&&!storyFlags.cass_burn_fired){
    storyFlags.cass_burn_fired=true;
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+3,0,20);
    if(!evtMsg) evtMsg="\ud83c\udfe6 A banker spent four hours at the Federal Building today. Volunteered. Brought files.";
    effects.push({type:"SHAKE"});
  }
  if(lastFavor) storyFlags.maria_last_favor=true;
  // Defusable fuses
  let fuseTimers=[...(s.fuseTimers||[])];
  if((s.biggestDeal||0)>=15000&&[0,1,3].includes(destLoc)&&!fuseTimers.some(f=>f.id==="witness")&&!storyFlags.witness_fired){
    fuseTimers.push({id:"witness",movePlanted:nm,fuseLength:8});
  }
  const stashValue=s.stashInv.reduce((sum,q,i)=>sum+q*(np[i]||0),0);
  if(stashValue>30000&&nh>=25&&!fuseTimers.some(f=>f.id==="stash_raid")&&!storyFlags.stash_raided){
    fuseTimers.push({id:"stash_raid",movePlanted:nm,fuseLength:6});
  }
  let zeroStash=false;
  fuseTimers=fuseTimers.filter(f=>{
    if(nm<f.movePlanted+f.fuseLength) return true;
    if(f.id==="witness"&&!storyFlags.witness_fired){
      storyFlags.witness_fired=true;
      if(!evtMsg) evtMsg="🕵️ A witness from your deal talked. A police sketch is circulating. Ramirez has a new lead.";
      npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+3,0,20);
    }
    if(f.id==="stash_raid"&&!storyFlags.stash_raided){
      const sv=s.stashInv.reduce((a,q,i)=>a+q*(np[i]||0),0);
      if(sv>1000){
        storyFlags.stash_raided=true; zeroStash=true;
        if(!evtMsg) evtMsg="🚔 RAID! Your stash house got hit. Everything inside — gone.";
        effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"66"});
      }
    }
    return false;
  });
  // Supplier flip
  const supCount=(s.supplierHistory||{})[destLoc]||0;
  if(supCount>=5&&nh>=20&&!storyFlags["supplier_flipped_"+destLoc]&&Math.random()<0.3){
    storyFlags["supplier_flipped_"+destLoc]=true;
    if(!evtMsg) evtMsg=`🐀 Your regular connect in ${LOCS[destLoc].name} got flipped. Deals here carry sting risk now.`;
    npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+2,0,20);
    effects.push({type:"SHAKE"});
  }

  // ── POKER-STYLE MULTI-TURN DEAL ──
  let activeDeal=s.activeDeal?{...s.activeDeal}:null;
  let dealEvent=null, dealInvAdd=null;
  if(activeDeal){
    activeDeal.step++;
    const d=activeDeal;
    if(d.step===1){
      dealEvent={ step:"complication",
        text:`Word is DEA might be watching the drop in ${LOCS[d.targetLoc].name}. Pay ${FM(Math.floor(d.cost*0.12))} for an alternate route?`,
        opts:[{label:`💰 PAY ALT ROUTE — ${FM(Math.floor(d.cost*0.12))}`,action:"deal_altdrop"},{label:"🎲 RISK IT",action:"deal_norisk"}] };
    } else if(d.step===2){
      const halfValue=Math.floor(d.qty*np[d.drugIdx]*0.5*0.8);
      dealEvent={ step:"temptation",
        text:`A rival offers ${FM(halfValue)} for half the shipment, sight unseen. Safe money — but you leave the rest on the table.`,
        opts:[{label:`💰 SELL HALF — ${FM(halfValue)}`,action:"deal_sellhalf",value:halfValue},{label:"🃏 KEEP IT ALL",action:"deal_keepall"}] };
    } else if(d.step>=3){
      const interceptChance=d.altDropPaid?0.05:(0.15+nh*0.003);
      if(Math.random()<interceptChance){
        activeDeal=null;
        evtMsg=`🚔 DEA intercepted the shipment. ${FM(d.cost)} gone. The contact disappeared.`;
        effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"44"});
        npcState.ramirez.evidence=CL((npcState.ramirez.evidence||0)+3,0,20);
      } else {
        const dq=d.rivalBought?Math.ceil(d.qty/2):d.qty;
        // Every other inventory add is clamped to coatSp; this one was not, so
        // a shipment landing into a full bag pushed it past capacity (126/100).
        const dealRoom=Math.max(0,(s.coatSp||0)-s.inv.reduce((a,b)=>a+b,0));
        const landed=Math.min(dq,dealRoom), spilled=dq-landed;
        // The deal was paid for up front, so it carries a real cost basis.
        // Landing it at avgCost 0 booked the entire sale as profit, which also
        // permanently raised the heat floor via totalProfit.
        dealInvAdd={idx:d.drugIdx,qty:landed,unit:Math.round(d.cost/Math.max(1,d.qty))};
        evtMsg=`📦 Shipment landed. ${landed}× ${DRUGS[d.drugIdx].name} in your bag. Street value ~${FM(landed*np[d.drugIdx])}.${spilled>0?` No room for ${spilled} — left in the boat.`:""}`;
        effects.push({type:"SFX",name:"pager"},{type:"SPAWN",text:`+${landed} ${DRUGS[d.drugIdx].emoji}`,color:C.gold,y:.45},
          {type:"DEAL_SCENE",data:{kind:"shipment",emoji:DRUGS[d.drugIdx].emoji,qty:landed,cash:0}});
        activeDeal=null;
      }
    }
  } else if(s.cred>=30&&cash>=15000&&(s.totalDeals||0)>=10&&(s.currentEra||0)>=1&&Math.random()<0.22){
    const dealDrug=cash>=80000?5:cash>=40000?R(5,6):R(2,4);
    const dealQty=R(8,Math.max(8,Math.min(30,Math.floor(cash/(DRUGS[dealDrug].mean*1.5)))));
    const dealCost=dealQty*Math.floor(DRUGS[dealDrug].mean*RF(0.7,0.9));
    if(dealCost<=cash*0.8){
      activeDeal={step:0,drugIdx:dealDrug,qty:dealQty,cost:dealCost,targetLoc:R(0,5),altDropPaid:false,rivalBought:false};
      cash-=dealCost;
      dealEvent={ step:"offer",
        text:`A contact offers ${dealQty}× ${DRUGS[dealDrug].name} for ${FM(dealCost)}. Delivery in 3 moves. The money’s already gone.`,
        opts:[{label:"👍 UNDERSTOOD",action:"deal_ack"}] };
      effects.push({type:"SFX",name:"pager"});
    }
  }

  let colTurf=[...(s.colTurf||Array(6).fill(false))];

  // ── HURRICANE — one-time chaos scaling, hits rich and poor differently ──
  let hurricaneLoss=false;
  if(nm>=30&&!storyFlags.hurricane_done){
    storyFlags.hurricane_done=true;
    const liquid=cash+bank+cleanCash;
    if(liquid>=100000&&usedSp>0){
      hurricaneLoss=true;
      evtMsg="🌀 HURRICANE. Biscayne Bay came through your stash — 30% of product gone with the storm surge. The rich always lose more.";
      effects.push({type:"SHAKE"},{type:"FLASH",color:C.blue+"55"},{type:"SFX",name:"police"});
    } else {
      for(let di=0;di<DRUG_COUNT;di++) np[di]=Math.min(DRUGS[di].max*2,Math.floor(np[di]*1.8));
      evtMsg="🌀 HURRICANE. Supply lines cut, every cop on evacuation duty — prices through the roof. Sell NOW, before the sky clears.";
      effects.push({type:"FLASH",color:C.blue+"44"},{type:"SFX",name:"pager"});
    }
  }

  // ── ERA TRANSITION (action-driven) ──
  let currentEra=s.currentEra||0, eraStartMove=s.eraStartMove||0, eraShift=null;
  const _ts={...s,cash,debt,fedHeat:nh,npcState,totalDeals:s.totalDeals||0};
  if(currentEra<PHASE_TRANSITIONS.length&&PHASE_TRANSITIONS[currentEra](_ts)&&nm-eraStartMove>=5){
    currentEra++; eraStartMove=nm;
    eraShift={era:ERAS[currentEra]};
    effects.push({type:"ERA_SHIFT",eraIdx:currentEra},{type:"PING",stat:"era"});
    // El Colombiano expands with every era — unless you made peace or broke him
    if(!storyFlags.col_peace&&!storyFlags.col_broken){
      const open=[0,1,2,3,4,5].filter(j=>s.turf[j]===0&&!colTurf[j]&&j!==destLoc);
      if(open.length){
        const claim=open[R(0,open.length-1)];
        colTurf[claim]=true;
        npcState.colombiano.met=true;
        storyFlags.col_rival_active=true;
        if(!evtMsg) evtMsg=`\ud83c\udde8\ud83c\uddf4 El Colombiano's crews moved into ${LOCS[claim].name} overnight. New paint on the corners. New rules.`;
        effects.push({type:"SFX",name:"pager"});
      }
    }
  }

  // ── ACT ADVANCE — flags only. Money never moves the story forward by itself. ──
  const nextAct=getAct({storyFlags});
  let nextActStart=s.actStartMove||0;
  if(nextAct>(s.act||1)){
    nextActStart=nm;
    const A=ACTS[nextAct];
    effects.push({type:"ACT_CARD",data:{n:A.n,name:A.name,color:A.color,goal:A.goal,sub:A.sub}},
      {type:"SFX",name:"era"},{type:"FLASH",color:A.color+"33"});
  }
  // The last night arms itself once Nestor has told somebody what he will do, or
  // once Act III has run long enough that the city stops waiting for him to decide.
  const nextLastNight=lastNightOpen({...s,storyFlags,move:nm,actStartMove:nextActStart});
  if(nextLastNight&&!s.lastNight){
    effects.push({type:"SFX",name:"pager"});
    evtMsg="📟 Maria, from the gallery, after nine: “We are all going to be in one room on your last night. Everybody already knows the date. Including you.”";
  }

  // ── ENDING CHECKS ──
  const evd=npcState.ramirez?.evidence||0;
  if(evd>=20){
    if(!storyFlags.final_grace){
      storyFlags.final_grace=true;
      evtMsg="🚨 RAID AT DAWN. A friend in dispatch buys you ONE move. The warrant is signed. RUN. NOW.";
      effects.push({type:"SHAKE"},{type:"FLASH",color:"#FF173366"},{type:"SFX",name:"police"});
    } else effects.push({type:"GAME_OVER",ending:"bust"});
  }
  const newHp=CL(s.hp+hpDelta,0,100);
  if(newHp<=0) effects.push({type:"GAME_OVER",ending:"dead"});
  if(npcState.colombiano?.met&&npcState.colombiano.trust<=-5&&!storyFlags.colombiano_hit_survived){
    if(s.gun&&s.cred>=50){
      storyFlags.colombiano_hit_survived=true; npcState.colombiano.trust=-3;
      if(!evtMsg) evtMsg="🇨🇴 The cartel’s crew came for you. You were armed. They weren’t expecting that. He’ll find another way.";
    } else effects.push({type:"GAME_OVER",ending:"dead"});
  }
  const invCount=s.inv.reduce((a,b)=>a+b,0);
  if(cash<=0&&bank<=0&&cleanCash<=0&&invCount===0&&debt>0&&!s.turf.some(t=>t>0)) effects.push({type:"SCREEN",screen:"broke_choice"});

  // HUD reveal pings
  const hudSeen={...s.hudSeen};
  if(!hudSeen.debt&&debt>0&&nm>=1){ hudSeen.debt=true; effects.push({type:"PING",stat:"debt"}); }
  if(!hudSeen.hp&&hpDelta<0){ hudSeen.hp=true; }
  if(hpDelta<0&&!s.hudSeen.hp) effects.push({type:"PING",stat:"hp"});
  if(!hudSeen.heat&&nh>=5){ hudSeen.heat=true; effects.push({type:"PING",stat:"heat"}); }
  if(!hudSeen.cred&&s.cred>=10){ hudSeen.cred=true; effects.push({type:"PING",stat:"cred"}); }
  if(eraShift) hudSeen.era=true;

  effects.push({type:"SFX",name:"travel"});

  const out={
    ...s, loc:destLoc, move:nm, hp:newHp, cash, bank, cleanCash, debt,
    prices:np, hist:newHist, basePrices:newBase, momentum:newMom, demand:newDemand,
    fedHeat:nh, evtMsg, pagerDeal, npcState, storyFlags, fuseTimers, activeDeal, colTurf,
    currentEra, eraStartMove, hudSeen,
    act:nextAct, actStartMove:nextActStart, lastNight:nextLastNight, commitment:commitmentOf({...s,storyFlags}),
    stashInv:zeroStash?Array(DRUG_COUNT).fill(0):s.stashInv,
    inv:(()=>{let iv=dealInvAdd?s.inv.map((q,i)=>i===dealInvAdd.idx?q+dealInvAdd.qty:q):s.inv;
      if(hurricaneLoss) iv=iv.map(q=>q-Math.ceil(q*0.3)); return iv;})(),
    // Blend the shipment's real unit cost into the running average, otherwise
    // selling it books 100% profit against a zero basis.
    avgCost:(()=>{
      if(!dealInvAdd||dealInvAdd.qty<=0) return s.avgCost;
      const i=dealInvAdd.idx, had=s.inv[i]||0, add=dealInvAdd.qty, tot=had+add;
      if(tot<=0) return s.avgCost;
      const blended=((had*(s.avgCost[i]||0))+(add*(dealInvAdd.unit||0)))/tot;
      return s.avgCost.map((v,k)=>k===i?blended:v);})(),
    dealsSinceStory:(s.dealsSinceStory||0),
    rivals:s.rivals.map(v=>({...v,loc:Math.random()<.3?R(0,5):v.loc})),
  };
  // ── LIVING CITY — district demand, shocks, patrols, informants, crew, rival ──
  const world=worldTick(s,out,{turfWar,dealEvent,randEnc});
  Object.assign(out,world.patch);
  for(const we of world.effects) effects.push(we);
  if(world.evtMsg) out.evtMsg=world.evtMsg;
  const worldTurfWar=world.turfWar, worldEvent=world.worldEvent;

  // Storylet selection happens AFTER other modals resolve, only if nothing big fired
  const blocked=effects.some(e=>e.type==="SCREEN"||e.type==="GAME_OVER")||newspaper||randEnc||turfWar||worldTurfWar||worldEvent||dealEvent||eraShift;
  let storylet=null;
  if(!blocked){
    storylet=selectStorylet(out);
    if(storylet){ out.storySeen={...out.storySeen,[storylet.id]:true}; out.activeStorylet=storylet; out.dealsSinceStory=0; }
  }
  return { state:out, effects, newspaper, randEnc, turfWar:turfWar||worldTurfWar, dealEvent, eraShift, worldEvent };
}

// ── CAMPAIGN END — the last night resolves into one of three variants ──
function processCampaignEnd(s,route){
  const rt=ENDING_ROUTES.find(r=>r.id===route)||ENDING_ROUTES[2];
  const effects=[{type:"SFX",name:"sellMassive"},{type:"FLASH",color:rt.color+"44"}];
  const storyFlags={...s.storyFlags,[rt.flag]:true,campaign_over:true};
  if(rt.id==="witness"){
    storyFlags.betrayed_col=true;
    if(!storyFlags.protected_maria) storyFlags.betrayed_maria=true;
  }
  if(rt.id==="inheritor") storyFlags.betrayed_ramirez=true;
  return { state:{...s, storyFlags, commitment:rt.id, lastNight:true, ending:rt.id}, effects };
}

function processBuy(s,drugIdx,amt){
  const price=Math.floor(s.prices[drugIdx]*(1-(s.priceDiscount||0))*(s.lifestyle.includes("prices")?0.95:1)*(s.loc===5&&(s.importBonus||s.lifestyle.includes("boat"))?(s.importBonus||0.85):1));
  const cost=price*amt;
  const used=s.inv.reduce((a,b)=>a+b,0);
  if(amt<=0||cost>s.cash||used+amt>s.coatSp) return { state:s, ok:false };
  const effects=[{type:"SFX",name:"buy"},{type:"SPAWN",text:`−${FM(cost)}`,color:C.pink,y:.62}];
  if(cost>=8000) effects.push({type:"DEAL_SCENE",data:{kind:"buy",emoji:DRUGS[drugIdx].emoji,qty:amt,cash:cost}});
  // Big buy risk
  const era=getEra(s);
  if(Math.random()<calcTxRisk(amt,LOCS[s.loc].heat,era.copsMod*(s.playbookCopsMod||1)*(s.dailyCopsMod||1))){
    effects.push({type:"SFX",name:"police"},{type:"SCREEN",screen:"police"});
  }
  const inv=[...s.inv], avgCost=[...s.avgCost];
  const pre=inv[drugIdx];
  avgCost[drugIdx]=Math.round((avgCost[drugIdx]*pre+cost)/(pre+amt));
  const purity=[...(s.purity||DRUGS.map(()=>1))];
  purity[drugIdx]=Math.min(1,(purity[drugIdx]*pre+amt)/(pre+amt));
  inv[drugIdx]+=amt;
  const supplierHistory={...s.supplierHistory,[s.loc]:((s.supplierHistory||{})[s.loc]||0)+1};
  const demand=s.demand.map((d,i)=>i===drugIdx?Math.max(.4,d*.97):d);
  return { state:{...s, ...tradeMarketPatch(s,drugIdx,amt,"buy"), cash:s.cash-cost, inv, avgCost, purity, supplierHistory, demand,
    totalDeals:(s.totalDeals||0)+1, dealsSinceStory:(s.dealsSinceStory||0)+1,
    fedHeat:CL(s.fedHeat+(amt>20?2:amt>8?1:0),0,100) }, ok:true, effects };
}

function processSell(s,drugIdx,amt){
  amt=Math.min(amt,s.inv[drugIdx]);
  if(amt<=0) return { state:s, ok:false };
  const pur=((s.purity||[])[drugIdx])??1;
  const colCut=(s.colTurf?.[s.loc]&&!s.storyFlags?.col_peace)?0.88:1;
  let price=Math.max(1,Math.floor(s.prices[drugIdx]*pur*colCut));
  // Pager fulfillment
  let pagerDeal=s.pagerDeal, pagerHit=false;
  if(pagerDeal&&pagerDeal.drugIdx===drugIdx&&s.loc===pagerDeal.targetLoc&&amt>=pagerDeal.qty&&s.move<=pagerDeal.expiresMove){
    price=Math.floor(price*(1+pagerDeal.bonusPct/100)); pagerHit=true; pagerDeal=null;
  }
  const revenue=price*amt;
  const costBasis=s.avgCost[drugIdx]*amt;
  const profit=revenue-costBasis;
  const era=getEra(s);
  const effects=[];
  // Risk on big sales
  if(Math.random()<calcTxRisk(amt,LOCS[s.loc].heat,era.copsMod*(s.playbookCopsMod||1)*(s.dailyCopsMod||1))){
    effects.push({type:"SFX",name:"police"},{type:"SCREEN",screen:"police"});
  }
  const inv=[...s.inv]; inv[drugIdx]-=amt;
  let credGain=Math.floor((profit>0?Math.min(8,1+Math.log10(Math.max(10,profit))):0)*(s.credMod||1)*(s.credMultiplier||1));
  if(pur<0.75) credGain=Math.floor(credGain*0.5);
  const streak=profit>0?(s.streak||0)+1:0;
  const tier=profit>=50000?"sellMassive":profit>=20000?"sellHuge":profit>=5000?"sellBig":"sell";
  effects.push({type:"SFX",name:tier});
  effects.push({type:"CASHFLY",count:CL(Math.floor(Math.log2(Math.max(2,profit))/1.4),4,16)});
  effects.push({type:"BREAKDOWN",data:{qty:amt,price,revenue,costBasis,profit,purity:pur,drug:DRUGS[drugIdx].name,emoji:DRUGS[drugIdx].emoji,pagerHit,bonusPct:pagerHit?s.pagerDeal.bonusPct:0,streak}});
  if(revenue>=10000||pagerHit) effects.push({type:"DEAL_SCENE",data:{kind:pagerHit?"pager":"sale",emoji:DRUGS[drugIdx].emoji,qty:amt,cash:revenue}});
  if(profit>=25000) effects.push({type:"HITSTOP"},{type:"FLASH",color:"#ffffff55"},{type:"SHAKE"});
  else if(profit>=8000) effects.push({type:"SHAKE"});
  if(pagerHit) effects.push({type:"SPAWN",text:`📟 DEAL FILLED +${s.pagerDeal.bonusPct}%`,color:C.gold,y:.4});
  if(streak>=3) effects.push({type:"STREAK",n:streak});
  const montage=[...s.montage];
  if(profit>=10000) montage.push({move:s.move,text:`Big score: ${FM(profit)} on ${DRUGS[drugIdx].name}`});
  const storyFlags={...s.storyFlags};
  if(drugIdx===4) storyFlags.sold_crack=true;
  let demand=s.demand.map((d,i)=>i===drugIdx?Math.max(.4,d*(amt>15?.85:.93)):d);
  let npcState=s.npcState;
  if(pur<0.6&&amt>=5&&Math.random()<0.35){
    demand=demand.map((d,i)=>i===drugIdx?Math.max(.4,d*0.8):d);
    effects.push({type:"SPAWN",text:"⚠ WORD'S OUT: STEPPED ON",color:C.pink,y:.36});
    if(!storyFlags.quality_complaints&&s.npcState.maria.met){
      storyFlags.quality_complaints=true;
      npcState={...s.npcState, maria:{...s.npcState.maria, trust:(s.npcState.maria.trust||0)-1}};
      effects.push({type:"SPAWN",text:"💃 MARIA HEARD ABOUT THE CUT (−TRUST)",color:C.flamingo,y:.30});
    }
  }
  const hudSeen={...s.hudSeen};
  if(!hudSeen.cred&&CL(s.cred+credGain,0,100)>=10){ hudSeen.cred=true; effects.push({type:"PING",stat:"cred"}); }
  return { state:{...s, ...tradeMarketPatch(s,drugIdx,amt,"sell"), cash:s.cash+revenue, inv, demand, pagerDeal, montage, storyFlags, hudSeen, streak, npcState,
    cred:CL(s.cred+credGain,0,100), totalProfit:(s.totalProfit||0)+Math.max(0,profit),
    totalDeals:(s.totalDeals||0)+1, dealsSinceStory:(s.dealsSinceStory||0)+1,
    biggestDeal:Math.max(s.biggestDeal||0,revenue),
    fedHeat:CL(s.fedHeat+(amt>20?3:amt>8?1:0),0,100) }, ok:true, effects, profit };
}

function processPolice(s,action,skill=0.5){
  const era=getEra(s);
  const effects=[];
  let { hp, cash, fedHeat, inv, cred }=s;
  let result;
  if(action==="run"){
    const odds=CL(.55+(s.lifestyle.includes("car")?.2:0)-fedHeat/400+(skill-.5)*.5,.05,.97);
    if(Math.random()<odds){ result={ok:true,text:"You vanish into a service alley behind the Mutiny. Sirens fade. Your heart doesn’t."}; fedHeat=CL(fedHeat+4,0,100); }
    else {
      const fee=calcLegalFees(s.inv.reduce((a,q,i)=>a+q*s.prices[i],0),era.penaltyMod,1+(s.legalFeeMod||0));
      const lost=inv.map(q=>Math.ceil(q*.5));
      inv=inv.map((q,i)=>q-lost[i]);
      cash=Math.max(0,cash-fee); hp=CL(hp-R(5,15),0,100);
      result={ok:false,text:`Tackled at the fence line. They take half your product and ${FM(fee)} in “processing fees.”`};
      fedHeat=CL(fedHeat+10,0,100); effects.push({type:"SHAKE"});
    }
  } else if(action==="fight"){
    const odds=CL((s.gun?.6:.3)+(skill-.5)*.6,.05,.97);
    if(Math.random()<odds){ result={ok:true,text:s.gun?"Two warning shots into a dumpster buy you a head start. Expensive, loud, effective.":"A wild swing, a lucky connect, and you’re gone before backup arrives."}; fedHeat=CL(fedHeat+12,0,100); cred=CL(cred+4,0,100); }
    else {
      const fee=calcLegalFees(s.inv.reduce((a,q,i)=>a+q*s.prices[i],0),era.penaltyMod,1+(s.legalFeeMod||0));
      inv=inv.map(()=>0); cash=Math.max(0,cash-fee); hp=CL(hp-R(20,35),0,100);
      result={ok:false,text:`They were ready for that. Everything confiscated. ${FM(fee)} in fines. Your ribs file a complaint.`};
      fedHeat=CL(fedHeat+15,0,100); effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"55"});
    }
  } else { // bribe
    const cost=Math.min(cash,Math.max(500,Math.floor(cash*.15)));
    if(cash>=500&&Math.random()<CL(.55+skill*.4,.1,.97)){ cash-=cost; result={ok:true,text:`${FM(cost)} changes hands inside a folded newspaper. “Drive safe,” the officer says, already walking away.`}; fedHeat=CL(fedHeat-5,0,100); }
    else if(cash<500){ result={ok:false,text:"You turn out your pockets. Lint. The officer is not impressed by lint."}; hp=CL(hp-10,0,100); inv=inv.map(q=>Math.ceil(q*.5)); }
    else { cash=Math.max(0,cash-cost); inv=inv.map(q=>Math.floor(q*.6));
      result={ok:false,text:"Wrong cop. He takes the money AND writes you up. Honest enough to be expensive."};
      fedHeat=CL(fedHeat+8,0,100);
    }
  }
  const busts=result.ok?s.totalBusts||0:(s.totalBusts||0)+1;
  const npcState={...s.npcState, ramirez:{...s.npcState.ramirez, evidence:CL((s.npcState.ramirez.evidence||0)+(result.ok?0:2),0,20)}};
  effects.push({type:"SCREEN",screen:"policeResult"});
  return { state:{...s,hp,cash,fedHeat,inv,cred,npcState,totalBusts:busts,policeResult:result,hudSeen:{...s.hudSeen,heat:true,hp:s.hudSeen.hp||hp<s.hp}}, effects };
}

function resolveEncounter(s,enc,action,skill=0.5){
  let { hp, cash, cred, fedHeat }=s; const inv=[...s.inv];
  const effects=[];
  if(enc.type==="find"&&action==="take"){
    const used=inv.reduce((a,b)=>a+b,0);
    const amt=Math.min(enc.amt,s.coatSp-used);
    inv[enc.drugIdx]+=amt;
    effects.push({type:"SPAWN",text:`+${amt} ${DRUGS[enc.drugIdx].emoji}`,color:C.gold,y:.5},{type:"SFX",name:"coin"});
  } else if(enc.type==="mugger"){
    if(action==="fight"&&s.gun){ cred=CL(cred+3,0,100); effects.push({type:"SPAWN",text:"+3 CRED",color:C.gold,y:.5}); }
    else if(action==="fight"&&skill>=0.62){ cred=CL(cred+3,0,100); effects.push({type:"SPAWN",text:"🥊 DROPPED HIM +3 CRED",color:C.gold,y:.5},{type:"SFX",name:"sellBig"}); }
    else if(action==="fight"){ const dmg=Math.max(2,Math.round(enc.hpLoss*(1-skill*.7))); hp=CL(hp-dmg,0,100); effects.push({type:"SHAKE"},{type:"PING",stat:"hp"}); }
    else { cash=Math.max(0,cash-enc.cashLoss); effects.push({type:"SPAWN",text:`−${FM(enc.cashLoss)}`,color:C.pink,y:.5}); }
  } else if(enc.type==="bribe_offer"&&action==="accept"&&cash>=enc.cost){
    cash-=enc.cost; fedHeat=CL(fedHeat-enc.heatReduce,0,100); effects.push({type:"SPAWN",text:"−🔥 HEAT",color:C.blue,y:.5},{type:"SFX",name:"coin"});
  } else if(enc.type==="healer"&&action==="accept"&&cash>=enc.cost){
    cash-=enc.cost; hp=CL(hp+enc.hpGain,0,100); effects.push({type:"SPAWN",text:`+${enc.hpGain} HP`,color:C.green,y:.5});
  }
  return { state:{...s,hp,cash,cred,fedHeat,inv,hudSeen:{...s.hudSeen,hp:s.hudSeen.hp||hp<s.hp}}, effects };
}

function resolveTurfWar(s,war,action,skill=0.5){
  const effects=[];
  let turf=[...s.turf], enforcers=[...s.enforcers], cash=s.cash, hp=s.hp, cred=s.cred;
  const myPower=Math.round((enforcers[war.loc]*2+(s.gun?2:0)+Math.floor(cred/20))*(0.55+skill*1.05));
  if(action==="defend"){
    if(myPower>=war.rivalPower){
      cred=CL(cred+5,0,100);
      effects.push({type:"SPAWN",text:"TURF HELD +5 CRED",color:C.gold,y:.45},{type:"SFX",name:"sellBig"});
      return { state:{...s,cred,montage:[...s.montage,{move:s.move,text:`Held turf in ${LOCS[war.loc].name}`}]}, effects };
    }
    turf[war.loc]=Math.max(0,turf[war.loc]-1);
    enforcers[war.loc]=Math.max(0,enforcers[war.loc]-1);
    hp=CL(hp-R(8,18),0,100);
    effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"44"},{type:"PING",stat:"hp"});
    return { state:{...s,turf,enforcers,hp,hudSeen:{...s.hudSeen,hp:true},montage:[...s.montage,{move:s.move,text:`Lost turf in ${LOCS[war.loc].name}`}]}, effects };
  }
  // pay off
  const cost=war.rivalPower*800;
  if(cash>=cost){ cash-=cost; effects.push({type:"SPAWN",text:`−${FM(cost)}`,color:C.pink,y:.5});
    return { state:{...s,cash}, effects };
  }
  turf[war.loc]=Math.max(0,turf[war.loc]-1);
  return { state:{...s,turf}, effects:[{type:"SHAKE"}] };
}

function processBank(s,action,amount){
  let { cash, bank, debt }=s;
  const effects=[{type:"SFX",name:"coin"}];
  if(action==="deposit"){ if(amount>cash||amount<=0) return {state:s,ok:false}; cash-=amount; bank+=amount; }
  else if(action==="withdraw"){ if(amount>bank||amount<=0) return {state:s,ok:false}; cash+=amount; bank-=amount; }
  else if(action==="paydebt"){
    const p=Math.min(amount,cash,debt); if(p<=0) return {state:s,ok:false};
    cash-=p; debt-=p;
    if(debt<=0) effects.push({type:"SPAWN",text:"🦈 DEBT CLEARED",color:C.green,y:.4},{type:"SFX",name:"sellBig"});
  }
  return { state:{...s,cash,bank,debt}, ok:true, effects };
}

function processBuyTurf(s,locIdx){
  const lv=s.turf[locIdx], next=TURF_LEVELS[lv+1];
  if(!next||s.cash<next.cost) return {state:s,ok:false};
  return { state:{...s,cash:s.cash-next.cost,turf:s.turf.map((t,i)=>i===locIdx?lv+1:t),
    cred:CL(s.cred+3,0,100), montage:[...s.montage,{move:s.move,text:`Claimed ${next.name} in ${LOCS[locIdx].name}`}]},
    ok:true, effects:[{type:"SFX",name:"sellBig"},{type:"SPAWN",text:`${next.icon} ${next.name.toUpperCase()}`,color:C.gold,y:.5}] };
}
function processHireEnforcer(s,locIdx){
  if(s.cash<ENFORCER_COST) return {state:s,ok:false};
  return { state:{...s,cash:s.cash-ENFORCER_COST,enforcers:s.enforcers.map((e,i)=>i===locIdx?e+1:e)}, ok:true,
    effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:"+1 👊",color:C.orange,y:.5}] };
}
function processBuyLifestyle(s,effect){
  const item=LIFESTYLE.find(l=>l.effect===effect);
  if(!item||s.lifestyle.includes(effect)) return {state:s,ok:false};
  let cost=item.cost;
  if(s.cash<cost) return {state:s,ok:false};
  return { state:{...s,cash:s.cash-cost,lifestyle:[...s.lifestyle,effect],cred:CL(s.cred+(item.credBoost||0),0,100),
    montage:effect==="mansion"||effect==="car"?[...s.montage,{move:s.move,text:`Bought the ${item.name}.`}]:s.montage},
    ok:true, effects:[{type:"SFX",name:"sellBig"},{type:"SPAWN",text:`${item.icon} ${item.name.toUpperCase()}`,color:C.flamingo,y:.5}] };
}
function processBuySafeHouse(s,tier){
  const sh=SAFE_HOUSES[tier];
  if(s.cash<sh.cost) return {state:s,ok:false};
  return { state:{...s,cash:s.cash-sh.cost,safeHouses:s.safeHouses.map((v,i)=>i===s.loc?tier:v)}, ok:true,
    effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:`${sh.icon} ${sh.name.toUpperCase()}`,color:C.blue,y:.5}] };
}
function processAttackRival(s,locIdx,skill=0.5){
  if(!s.colTurf?.[locIdx]) return {state:s,ok:false};
  const era=getEra(s);
  const myPower=Math.round((s.enforcers[locIdx]*2+(s.gun?3:0)+Math.floor(s.cred/15))*(0.55+skill*1.05));
  const colPower=4+(s.currentEra||0)*2+R(0,3);
  const colTurf=[...s.colTurf];
  const storyFlags={...s.storyFlags};
  const npcState={...s.npcState, colombiano:{...s.npcState.colombiano, met:true}};
  if(storyFlags.col_peace){ storyFlags.col_peace=false; storyFlags.col_war=true; npcState.colombiano.trust=(npcState.colombiano.trust||0)-3; }
  const effects=[];
  if(myPower>=colPower){
    colTurf[locIdx]=false;
    npcState.colombiano.trust=(npcState.colombiano.trust||0)-2;
    storyFlags.col_war=true;
    const broke=!colTurf.some(Boolean);
    if(broke) storyFlags.col_broken=true;
    effects.push({type:"SFX",name:"sellBig"},{type:"SHAKE"},
      {type:"SPAWN",text:broke?"\ud83d\udc51 HIS EMPIRE IS BROKEN":"\u2694 BLOCK TAKEN +6 CRED",color:C.gold,y:.45});
    return { state:{...s,colTurf,npcState,storyFlags,cred:CL(s.cred+(broke?12:6),0,100),
      montage:[...s.montage,{move:s.move,text:broke?"Broke El Colombiano's grip on Miami.":`Took ${LOCS[locIdx].name} from El Colombiano.`}]}, ok:true, effects };
  }
  const hpLoss=R(10,22);
  effects.push({type:"SFX",name:"police"},{type:"SHAKE"},{type:"FLASH",color:C.pink+"55"},{type:"PING",stat:"hp"},
    {type:"SPAWN",text:`\u2694 REPELLED \u2212${hpLoss} HP`,color:C.pink,y:.45});
  return { state:{...s,npcState,storyFlags:{...storyFlags,col_war:true},hp:CL(s.hp-hpLoss,0,100),fedHeat:CL(s.fedHeat+5,0,100),
    hudSeen:{...s.hudSeen,hp:true}}, ok:true, effects };
}
function processLawyer(s){
  const cost=Math.max(1500,Math.floor(1500+s.fedHeat*70+(s.npcState.ramirez.evidence||0)*350));
  if(s.cash<cost||(s.fedHeat<15&&(s.npcState.ramirez.evidence||0)<4)) return {state:s,ok:false};
  const npcState={...s.npcState, ramirez:{...s.npcState.ramirez, evidence:CL((s.npcState.ramirez.evidence||0)-3,0,20)}};
  return { state:{...s, cash:s.cash-cost, fedHeat:CL(s.fedHeat-25,0,100), npcState,
    montage:[...s.montage,{move:s.move,text:"Retained counsel. Files went missing."}]}, ok:true,
    effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:"⚖️ −25 HEAT, −3 EVIDENCE",color:C.blue,y:.45}] };
}
function processBuyGun(s){
  if(s.cash<4000||s.gun) return {state:s,ok:false};
  return { state:{...s,cash:s.cash-4000,gun:true}, ok:true, effects:[{type:"SFX",name:"coin"},{type:"SPAWN",text:"🔫 ARMED",color:C.orange,y:.5}] };
}
function processCut(s,drugIdx){
  const d=DRUGS[drugIdx];
  if(d.tier<1||s.inv[drugIdx]<2) return {state:s,ok:false};
  const pur=((s.purity||[])[drugIdx])??1;
  if(pur<=0.4) return {state:s,ok:false};
  const oldQ=s.inv[drugIdx];
  const space=s.coatSp-s.inv.reduce((a,b)=>a+b,0);
  const add=Math.min(space,Math.floor(oldQ*0.8));
  if(add<1) return {state:s,ok:false};
  const inv=[...s.inv]; inv[drugIdx]=oldQ+add;
  const avgCost=[...s.avgCost]; avgCost[drugIdx]=Math.floor(avgCost[drugIdx]*oldQ/(oldQ+add));
  const purity=[...(s.purity||DRUGS.map(()=>1))]; purity[drugIdx]=Math.max(0.35,pur*0.65);
  return { state:{...s,inv,avgCost,purity,storyFlags:{...s.storyFlags,has_cut:true}}, ok:true,
    effects:[{type:"SFX",name:"click"},{type:"SPAWN",text:`✂ +${add} ${d.emoji} — NOW ${Math.round(purity[drugIdx]*100)}% PURE`,color:C.orange,y:.48}] };
}
function processStash(s,drugIdx,amt,toStash){
  const shTier=s.safeHouses[s.loc];
  if(shTier<0) return {state:s,ok:false};
  const cap=SAFE_HOUSES[shTier].storage;
  const inv=[...s.inv], stash=[...s.stashInv];
  if(toStash){
    const stashUsed=stash.reduce((a,b)=>a+b,0);
    const a=Math.min(amt,inv[drugIdx],cap-stashUsed); if(a<=0) return {state:s,ok:false};
    inv[drugIdx]-=a; stash[drugIdx]+=a;
  } else {
    const used=inv.reduce((a,b)=>a+b,0);
    const a=Math.min(amt,stash[drugIdx],s.coatSp-used); if(a<=0) return {state:s,ok:false};
    stash[drugIdx]-=a; inv[drugIdx]+=a;
  }
  return { state:{...s,inv,stashInv:stash}, ok:true, effects:[{type:"SFX",name:"click"}] };
}

// ═══════════════════════════════════════════════════════════════
// AUDIO ENGINE  (view layer begins — not portable)
// ═══════════════════════════════════════════════════════════════
let AC=null;
const ctx=()=>{ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); return AC; }catch(e){ return null; } };
const tone=(f,dur,type="square",vol=.08,when=0,slide=0)=>{
  const a=ctx(); if(!a) return;
  const o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f,a.currentTime+when);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),a.currentTime+when+dur);
  g.gain.setValueAtTime(vol,a.currentTime+when);
  g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+when+dur);
  o.connect(g); g.connect(a.destination);
  o.start(a.currentTime+when); o.stop(a.currentTime+when+dur+.02);
};
const SFX={
  click:()=>tone(880,.05,"square",.04),
  buy:()=>{tone(420,.07,"square",.06);tone(560,.08,"square",.05,.06);},
  sell:()=>{tone(660,.08,"square",.07);tone(880,.1,"square",.06,.07);},
  sellBig:()=>{[523,659,784].forEach((f,i)=>tone(f,.12,"square",.07,i*.07));},
  sellHuge:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.14,"sawtooth",.06,i*.07));tone(1318,.3,"sine",.05,.3);},
  sellMassive:()=>{[392,523,659,784,1046,1318].forEach((f,i)=>tone(f,.16,"sawtooth",.07,i*.06));tone(1568,.5,"sine",.06,.4);},
  coin:()=>{tone(987,.06,"square",.05);tone(1318,.09,"square",.05,.05);},
  police:()=>{for(let i=0;i<4;i++){tone(880,.16,"sawtooth",.07,i*.32);tone(660,.16,"sawtooth",.07,i*.32+.16);}},
  pager:()=>{for(let i=0;i<3;i++)tone(1760,.07,"square",.05,i*.13);},
  travel:()=>tone(220,.18,"sine",.05,0,80),
  era:()=>{tone(110,.8,"sawtooth",.08,0,440);tone(55,.9,"sine",.07);},
  error:()=>tone(160,.15,"sawtooth",.06),
  type:()=>tone(1200+Math.random()*400,.015,"square",.018),
};
// ═══════════════════════════════════════════════════════════════
// NEON NOIR AUDIO ENGINE v2 — everything synthesized, zero assets
// ═══════════════════════════════════════════════════════════════
// Bus layout (built lazily, once, on the first sound after a gesture):
//
//   one-shot voices ──> sfxBus ──┬─────────────────────────────┐
//                                └─> sfxSend ─> convolver ─┐   │
//   music voices ─> mFilt ─> mLvl ─> mDuck ──┬─────────────┼──>│─> master ─> limiter ─> out
//                   (tension sweep)          └─> mSend ────┘   │
//
// The convolver runs a procedurally generated impulse response (no files).
// Every one-shot node disconnects itself in onended, so nothing ever leaks.

const mtof=m=>440*Math.pow(2,(m-69)/12);

const AUDIO=(()=>{
  let G=null, muted=false, hidden=false;

  const mkNoise=a=>{
    const n=Math.floor(a.sampleRate*2), b=a.createBuffer(1,n,a.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    return b;
  };
  // Procedural impulse response: a few early reflections + exponential tail.
  const mkIR=(a,sec,decay)=>{
    const n=Math.max(8,Math.floor(a.sampleRate*sec)), b=a.createBuffer(2,n,a.sampleRate);
    for(let c=0;c<2;c++){
      const d=b.getChannelData(c);
      for(let i=0;i<n;i++){ const t=i/n; d[i]=(Math.random()*2-1)*Math.pow(1-t,decay)*(1-t*0.12); }
      d[Math.floor(n*0.011)]+=c?0.50:-0.55;
      d[Math.floor(n*0.026)]+=c?-0.38:0.34;
      d[Math.floor(n*0.049)]+=c?0.22:0.25;
    }
    return b;
  };

  const g=()=>{
    const a=ctx(); if(!a) return null;
    if(G&&G.a===a) return G;
    const master=a.createGain(); master.gain.value=muted?0.0001:0.85;
    const lim=a.createDynamicsCompressor();
    lim.threshold.value=-9; lim.knee.value=14; lim.ratio.value=9;
    lim.attack.value=0.004; lim.release.value=0.2;
    master.connect(lim); lim.connect(a.destination);

    const verb=a.createConvolver(); verb.normalize=true; verb.buffer=mkIR(a,2.6,2.4);
    const verbLvl=a.createGain(); verbLvl.gain.value=0.9;
    verb.connect(verbLvl); verbLvl.connect(master);

    const sfx=a.createGain(); sfx.gain.value=0.85;
    const sfxSend=a.createGain(); sfxSend.gain.value=0.18;
    sfx.connect(master); sfx.connect(sfxSend); sfxSend.connect(verb);

    const mFilt=a.createBiquadFilter(); mFilt.type="lowpass"; mFilt.frequency.value=3600; mFilt.Q.value=0.8;
    const mLvl=a.createGain(); mLvl.gain.value=0.0001;
    const mDuck=a.createGain(); mDuck.gain.value=1;
    const mSend=a.createGain(); mSend.gain.value=0.30;
    mFilt.connect(mLvl); mLvl.connect(mDuck); mDuck.connect(master);
    mDuck.connect(mSend); mSend.connect(verb);

    G={a,master,lim,verb,verbLvl,sfx,sfxSend,mFilt,mLvl,mDuck,mSend,noise:mkNoise(a)};
    return G;
  };

  const now=()=>{ const b=g(); return b?b.a.currentTime:0; };
  const dead=(...n)=>{ n.forEach(x=>{ try{ x.disconnect(); }catch(e){} }); };

  // ── primitive voices ─────────────────────────────────────────
  const osc=(type,freq,when,dur,peak,dest,detune,slideTo)=>{
    const b=g(); if(!b) return null;
    const a=b.a, o=a.createOscillator(), gn=a.createGain();
    o.type=type; o.frequency.setValueAtTime(Math.max(20,freq),when);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20,slideTo),when+dur);
    if(detune) o.detune.setValueAtTime(detune,when);
    gn.gain.setValueAtTime(0.0001,when);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),when+0.008);
    gn.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    o.connect(gn); gn.connect(dest||b.sfx);
    o.start(when); o.stop(when+dur+0.03);
    o.onended=()=>dead(o,gn);
    return o;
  };
  const noise=(when,dur,peak,type,freq,Q,dest,sweepTo)=>{
    const b=g(); if(!b) return null;
    const a=b.a, s=a.createBufferSource(); s.buffer=b.noise; s.loop=true;
    s.playbackRate.value=0.85+Math.random()*0.4;
    const f=a.createBiquadFilter(); f.type=type||"bandpass"; f.Q.value=Q||1;
    f.frequency.setValueAtTime(Math.max(30,freq),when);
    if(sweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(30,sweepTo),when+dur);
    const gn=a.createGain();
    gn.gain.setValueAtTime(0.0001,when);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),when+0.005);
    gn.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    s.connect(f); f.connect(gn); gn.connect(dest||b.sfx);
    s.start(when,Math.random()*1.2); s.stop(when+dur+0.03);
    s.onended=()=>dead(s,f,gn);
    return s;
  };
  // plucked/filtered synth note — the workhorse for arps, stabs and SFX melody
  const pluck=(when,freq,dur,peak,type,dest,cutMul)=>{
    const b=g(); if(!b) return;
    const a=b.a, o=a.createOscillator(), f=a.createBiquadFilter(), gn=a.createGain();
    o.type=type||"square"; o.frequency.setValueAtTime(Math.max(20,freq),when);
    f.type="lowpass"; f.Q.value=4;
    f.frequency.setValueAtTime(Math.min(12000,freq*(cutMul||9)+200),when);
    f.frequency.exponentialRampToValueAtTime(Math.max(160,freq*1.5),when+dur);
    gn.gain.setValueAtTime(0.0001,when);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),when+0.006);
    gn.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    o.connect(f); f.connect(gn); gn.connect(dest||b.sfx);
    o.start(when); o.stop(when+dur+0.03);
    o.onended=()=>dead(o,f,gn);
  };
  // fat detuned bass with its own filter envelope + clean sub
  const bass=(when,freq,dur,peak,dest,bright)=>{
    const b=g(); if(!b) return;
    const a=b.a, o1=a.createOscillator(), o2=a.createOscillator(), sub=a.createOscillator();
    const f=a.createBiquadFilter(), gn=a.createGain();
    o1.type="sawtooth"; o2.type="sawtooth"; sub.type="sine";
    o1.frequency.setValueAtTime(freq,when);
    o2.frequency.setValueAtTime(freq,when); o2.detune.setValueAtTime(-12,when);
    sub.frequency.setValueAtTime(freq/2,when);
    f.type="lowpass"; f.Q.value=7;
    f.frequency.setValueAtTime(Math.min(7000,freq*(bright||7)+140),when);
    f.frequency.exponentialRampToValueAtTime(Math.max(100,freq*1.7),when+Math.min(0.32,dur));
    gn.gain.setValueAtTime(0.0001,when);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),when+0.012);
    gn.gain.setValueAtTime(Math.max(0.0002,peak),when+Math.max(0.03,dur*0.55));
    gn.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    o1.connect(f); o2.connect(f); f.connect(gn);
    const sg=a.createGain(); sg.gain.value=0.85; sub.connect(sg); sg.connect(gn);
    gn.connect(dest||b.sfx);
    o1.start(when); o2.start(when); sub.start(when);
    o1.stop(when+dur+0.05); o2.stop(when+dur+0.05); sub.stop(when+dur+0.05);
    sub.onended=()=>dead(o1,o2,sub,sg,f,gn);
  };
  // inharmonic bell — used for coins, chimes, achievements
  const bell=(when,freq,dur,peak,dest)=>{
    osc("sine",freq,when,dur,peak,dest);
    osc("sine",freq*2.76,when,dur*0.55,peak*0.32,dest);
    osc("sine",freq*5.40,when,dur*0.30,peak*0.14,dest);
  };

  // ── drum kit ─────────────────────────────────────────────────
  const DRUM={
    kick(when,vel,dest){
      const b=g(); if(!b) return; const a=b.a;
      const o=a.createOscillator(), gn=a.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(150,when);
      o.frequency.exponentialRampToValueAtTime(44,when+0.09);
      gn.gain.setValueAtTime(0.0001,when);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,vel),when+0.006);
      gn.gain.exponentialRampToValueAtTime(0.0001,when+0.30);
      o.connect(gn); gn.connect(dest||b.sfx);
      o.start(when); o.stop(when+0.34);
      o.onended=()=>dead(o,gn);
      noise(when,0.018,vel*0.30,"highpass",2400,0.7,dest);
    },
    snare(when,vel,dest){
      const b=g(); if(!b) return; const a=b.a;
      noise(when,0.15,vel*0.85,"bandpass",1750,0.9,dest);
      noise(when,0.05,vel*0.45,"highpass",4400,0.7,dest);
      const o=a.createOscillator(), gn=a.createGain();
      o.type="triangle";
      o.frequency.setValueAtTime(198,when);
      o.frequency.exponentialRampToValueAtTime(148,when+0.09);
      gn.gain.setValueAtTime(0.0001,when);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,vel*0.5),when+0.005);
      gn.gain.exponentialRampToValueAtTime(0.0001,when+0.13);
      o.connect(gn); gn.connect(dest||b.sfx);
      o.start(when); o.stop(when+0.17);
      o.onended=()=>dead(o,gn);
    },
    hat(when,vel,open,dest){ noise(when,open?0.20:0.035,vel,"highpass",open?6600:8400,0.6,dest); },
    tom(when,freq,vel,dest){
      const b=g(); if(!b) return; const a=b.a;
      const o=a.createOscillator(), gn=a.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(freq,when);
      o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*0.55),when+0.28);
      gn.gain.setValueAtTime(0.0001,when);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002,vel),when+0.008);
      gn.gain.exponentialRampToValueAtTime(0.0001,when+0.34);
      o.connect(gn); gn.connect(dest||b.sfx);
      o.start(when); o.stop(when+0.38);
      o.onended=()=>dead(o,gn);
      noise(when,0.05,vel*0.25,"bandpass",freq*3,1.4,dest);
    },
    clap(when,vel,dest){ for(let i=0;i<3;i++) noise(when+i*0.013,0.085+i*0.035,vel*(1-i*0.22),"bandpass",1150+i*200,1.6,dest); },
    rim(when,vel,dest){ noise(when,0.028,vel,"bandpass",2700,4,dest); },
    crash(when,vel,dest){ noise(when,1.35,vel,"highpass",5200,0.5,dest); noise(when,0.9,vel*0.6,"bandpass",9000,0.4,dest); },
  };

  return {
    g, now, osc, noise, pluck, bass, bell, DRUM, dead,
    // peek() never calls ctx(), so the scheduler cannot accidentally
    // resume a context we deliberately suspended when the tab went away.
    peek:()=>G,
    isMuted:()=>muted,
    // Mute is a gain ramp, not a teardown — the transport keeps its phase.
    setMuted(m){
      muted=!!m; const b=G;
      if(!b) return;
      const t=b.a.currentTime;
      b.master.gain.cancelScheduledValues(t);
      b.master.gain.setValueAtTime(Math.max(0.0001,b.master.gain.value),t);
      b.master.gain.exponentialRampToValueAtTime(muted?0.0001:0.85,t+0.25);
    },
    // Tab hidden -> suspend the whole context (stops all CPU + scheduling drift).
    setHidden(h){
      hidden=!!h; const a=AC; if(!a) return;
      try{ if(hidden) a.suspend(); else if(!muted) a.resume(); }catch(e){}
    },
    // Call from a real user gesture. Safe to call many times.
    unlock(){
      const b=g(); if(!b) return;
      try{ if(b.a.state!=="running") b.a.resume(); }catch(e){}
    },
  };
})();

// ═══════════════════════════════════════════════════════════════
// ADAPTIVE SYNTHWAVE SOUNDTRACK
// ═══════════════════════════════════════════════════════════════
// Lookahead scheduler (25ms timer, 120ms horizon) => sample-accurate,
// seamless looping. Mood is re-read from the game every bar, so heat /
// era / night / district changes glide in without restarting anything.

const MUSIC=(()=>{
  // [root midi, chord intervals] x 4 bars, one progression per era
  const PROGS=[
    [[45,[0,3,7,10]],[41,[0,4,7,11]],[48,[0,4,7,11]],[43,[0,4,7,9]]],   // Paradise  — Am7 Fmaj7 Cmaj7 G6
    [[38,[0,3,7,10]],[46,[0,4,7,11]],[43,[0,4,7,10]],[45,[0,4,7,10]]],  // Anti-Drug — Dm7 Bb^7 G7 A7
    [[36,[0,3,7,10]],[44,[0,4,7,11]],[39,[0,4,7,11]],[46,[0,4,7,10]]],  // Crack     — Cm7 Ab^7 Eb^7 Bb7
    [[42,[0,3,7,10]],[38,[0,4,7,9]],[37,[0,3,7,10]],[44,[0,4,7,10]]],   // War       — F#m7 D6 C#m7 Ab7
    [[40,[0,3,7,10]],[36,[0,3,6,10]],[44,[0,4,7,10]],[35,[0,3,7,11]]],  // Endgame   — Em7 Cdim Ab7 Bm^7
  ];
  // 16-step patterns, indexed by intensity 0..3
  const KICKS=[
    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
  ];
  const SNARES=[
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0],
    [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,1,0],
  ];
  const HATS=[
    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
  ];
  // bass rhythm: index into chord tones, -1 = rest
  const BASSES=[
    [0,-1,-1,-1, -1,-1,-1,-1, 0,-1,-1,-1, -1,-1,-1,-1],
    [0,-1,-1,0, -1,-1,2,-1, 0,-1,-1,0, -1,-1,1,-1],
    [0,-1,0,-1, 2,-1,0,-1, 0,-1,0,-1, 3,-1,2,-1],
    [0,0,-1,0, 2,0,-1,0, 0,0,-1,3, 2,0,3,2],
  ];
  // per-district accent: which step it lands on, semitone offset, waveform
  const DISTRICT=[
    {step:6, off:24, wave:"triangle", gain:0.030},  // Miami Beach   — glitter
    {step:10,off:12, wave:"square",   gain:0.026},  // Little Havana — clave stab
    {step:5, off:-12,wave:"sawtooth", gain:0.032},  // Overtown      — low menace
    {step:14,off:19, wave:"sine",     gain:0.028},  // Coral Gables  — soft chime
    {step:3, off:19, wave:"square",   gain:0.022},  // Ft Lauderdale — party blip
    {step:12,off:7,  wave:"sine",     gain:0.030},  // The Keys      — tide swell
  ];

  const DRUM=AUDIO.DRUM, bass=AUDIO.bass;
  let T=null;                       // transport, null when stopped
  const LOOK=0.12, TICK=25;

  const readMood=()=>{
    let m={};
    try{ m=(T&&T.getMood?T.getMood():null)||{}; }catch(e){ m={}; }
    const era=Math.max(0,Math.min(PROGS.length-1,m.era||0));
    const heat=Math.max(0,Math.min(100,m.heat||0));
    const move=m.move||0;
    const title=m.scene==="title";
    let lvl=title?0:heat>=70?3:heat>=45?2:heat>=20?1:0;
    if(!title&&era>=3) lvl=Math.min(3,lvl+1);
    if(!title&&m.move!=null&&move<6) lvl=Math.min(lvl,1);   // calm opening minutes
    if(!title&&m.deals!=null&&m.deals===0) lvl=0;
    return {
      era, heat, lvl, title,
      loc:Math.max(0,Math.min(DISTRICT.length-1,m.loc||0)),
      night:title?true:!!m.night,
      bpm:title?76:(90+heat*0.26+era*2.5+(m.night?-6:2)),
    };
  };

  const stepDur=()=>60/Math.max(50,T?T.bpm:96)/4;

  const setTension=(b,mood)=>{
    const t=b.a.currentTime;
    // Tension closes the room down: bright and open when clean, choked when hunted.
    const cut=mood.title?1500:5200-(mood.heat/100)*3500-(mood.night?500:0);
    b.mFilt.frequency.setTargetAtTime(Math.max(600,cut),t,0.7);
    b.mFilt.Q.setTargetAtTime(0.8+(mood.heat/100)*3.2,t,0.7);
    b.mSend.gain.setTargetAtTime(mood.night?0.42:0.26,t,0.9);
  };

  const schedule=(b,step,t,mood)=>{
    const bar=Math.floor(step/16)%4, i=step%16;
    const prog=PROGS[mood.era], ch=prog[bar];
    const root=ch[0], tones=ch[1];
    const L=mood.lvl;
    const swing=(i%2===1)?stepDur()*(mood.night?0.10:0.06):0;
    const t2=t+swing;

    // ── drums ──
    if(!mood.title||i===0){
      if(KICKS[L][i]) DRUM.kick(t,mood.title?0.28:0.60-(i?0.12:0),b.mFilt);
    }
    if(!mood.title){
      if(SNARES[L][i]) (L>=2?DRUM.clap:DRUM.snare)(t2,0.30,b.mFilt);
      if(HATS[L][i]) DRUM.hat(t2,L>=3&&i===14?0.10:0.055,L>=3&&i===14,b.mFilt);
      if(L>=2&&i===15) DRUM.rim(t2,0.07,b.mFilt);
      if(L>=3&&i===8) DRUM.tom(t,mtof(root+12),0.16,b.mFilt);
    }

    // ── bass ──
    const bi=BASSES[L][i];
    if(bi>=0&&!mood.title){
      const n=root+tones[Math.min(bi,tones.length-1)];
      bass(t,mtof(n),stepDur()*(L>=2?1.5:2.6),0.17+L*0.012,b.mFilt,5+L*1.5);
    }else if(mood.title&&i===0){
      bass(t,mtof(root),stepDur()*12,0.13,b.mFilt,3.5);
    }

    // ── pad chord change on the downbeat ──
    if(i===0) voicePad(b,root,tones,mood);

    // ── arpeggio ──
    if(L>=1&&!mood.title&&(i%2===(mood.night?1:0))){
      const idx=(step>>1)%(tones.length+1);
      const n=root+24+tones[idx%tones.length]+(idx>=tones.length?12:0);
      pluckMusic(b,t2,mtof(n),stepDur()*1.6,0.030+L*0.006,mood.night?"triangle":"square");
    }
    // ── lead motif every other bar once things get real ──
    if(L>=2&&i===0&&bar%2===1){
      const seq=[0,7,10,12,10,7];
      seq.forEach((s,k)=>pluckMusic(b,t+k*stepDur()*2,mtof(root+24+s),stepDur()*2.4,0.034,"sawtooth"));
    }
    // ── district accent ──
    const d=DISTRICT[mood.loc];
    if(!mood.title&&d&&i===d.step) pluckMusic(b,t2,mtof(root+d.off),stepDur()*2.2,d.gain,d.wave);
    // ── heat siren shadow ──
    if(L>=3&&i===12){
      AUDIO.osc("sawtooth",mtof(root+27),t,stepDur()*3,0.022,b.mFilt,0,mtof(root+20));
    }
  };

  const pluckMusic=(b,t,f,dur,peak,wave)=>AUDIO.pluck(t,f,dur,peak,wave,b.mFilt,7);

  // Persistent pad: 4 detuned saws + slow filter LFO. Retuned, never rebuilt.
  const buildPad=(b)=>{
    const a=b.a;
    const padFilt=a.createBiquadFilter(); padFilt.type="lowpass"; padFilt.frequency.value=1200; padFilt.Q.value=1.2;
    const padGain=a.createGain(); padGain.gain.value=0.0001;
    padFilt.connect(padGain); padGain.connect(b.mFilt);
    const lfo=a.createOscillator(); lfo.type="sine"; lfo.frequency.value=0.07;
    const lfoAmt=a.createGain(); lfoAmt.gain.value=520;
    lfo.connect(lfoAmt); lfoAmt.connect(padFilt.frequency);
    const vox=[];
    for(let i=0;i<4;i++){
      const o=a.createOscillator();
      o.type=i===3?"triangle":"sawtooth";
      o.frequency.value=220;
      o.detune.value=(i-1.5)*8;
      const vg=a.createGain(); vg.gain.value=i===3?0.20:0.13;
      o.connect(vg); vg.connect(padFilt);
      vox.push({o,vg});
    }
    const t=a.currentTime;
    vox.forEach(v=>v.o.start(t)); lfo.start(t);
    padGain.gain.setValueAtTime(0.0001,t);
    padGain.gain.exponentialRampToValueAtTime(0.20,t+2.2);
    return {padFilt,padGain,lfo,lfoAmt,vox};
  };
  const voicePad=(b,root,tones,mood)=>{
    if(!T||!T.pad) return;
    const t=b.a.currentTime, oct=mood.night?0:12;
    T.pad.vox.forEach((v,i)=>{
      const n=root+oct+tones[i%tones.length]+(i===3?12:0);
      v.o.frequency.setTargetAtTime(mtof(n),t,0.30);
    });
    T.pad.padFilt.frequency.setTargetAtTime(mood.night?820:1500+mood.lvl*260,t,1.2);
    T.pad.padGain.gain.setTargetAtTime(mood.title?0.26:0.20-mood.lvl*0.025,t,1.5);
  };

  const tick=()=>{
    const b=AUDIO.peek(); if(!b||!T) return;
    const a=b.a;
    if(a.state!=="running") return;               // suspended tab: hold position
    if(T.next<a.currentTime-0.4) T.next=a.currentTime+0.06;   // recover from throttling
    let guard=0;
    while(T.next<a.currentTime+LOOK&&guard++<64){
      if(T.step%16===0){                          // re-read the game once per bar
        const m=readMood();
        T.mood=m; T.bpm=m.bpm; setTension(b,m);
      }
      schedule(b,T.step,T.next,T.mood);
      T.next+=stepDur();
      T.step++;
    }
  };

  return {
    running:()=>!!T,
    root:()=>{
      if(!T||!T.mood) return 45;
      const p=PROGS[T.mood.era||0];
      return p[Math.floor(T.step/16)%4][0];
    },
    chord:()=>{
      if(!T||!T.mood) return [0,3,7,10];
      const p=PROGS[T.mood.era||0];
      return p[Math.floor(T.step/16)%4][1];
    },
    start(getMood,owner){
      const b=AUDIO.g(); if(!b) return;
      if(T){ T.getMood=getMood||T.getMood; T.owner=owner; return; }   // idempotent
      const a=b.a;
      T={ owner, getMood, step:0, next:a.currentTime+0.08, bpm:96, mood:null, pad:null, timer:null };
      T.mood=readMood(); T.bpm=T.mood.bpm;
      T.pad=buildPad(b);
      setTension(b,T.mood);
      const t=a.currentTime;
      b.mLvl.gain.cancelScheduledValues(t);
      b.mLvl.gain.setValueAtTime(0.0001,t);
      b.mLvl.gain.exponentialRampToValueAtTime(0.55,t+1.4);
      b.mDuck.gain.cancelScheduledValues(t); b.mDuck.gain.setValueAtTime(1,t);
      T.timer=setInterval(tick,TICK);
      tick();
    },
    // owner guard: a screen only stops the music it started, so React's
    // cleanup/setup ordering can never leave two transports fighting.
    stop(owner){
      if(!T) return;
      if(owner!==undefined&&T.owner!==owner) return;
      const b=AUDIO.g(), pad=T.pad;
      clearInterval(T.timer); T=null;
      if(!b) return;
      const t=b.a.currentTime;
      b.mLvl.gain.cancelScheduledValues(t);
      b.mLvl.gain.setValueAtTime(Math.max(0.0001,b.mLvl.gain.value),t);
      b.mLvl.gain.exponentialRampToValueAtTime(0.0001,t+0.4);
      if(pad){
        pad.padGain.gain.cancelScheduledValues(t);
        pad.padGain.gain.setValueAtTime(Math.max(0.0001,pad.padGain.gain.value),t);
        pad.padGain.gain.exponentialRampToValueAtTime(0.0001,t+0.4);
        pad.vox.forEach(v=>{ try{ v.o.stop(t+0.5); }catch(e){} v.o.onended=()=>AUDIO.dead(v.o,v.vg); });
        try{ pad.lfo.stop(t+0.5); }catch(e){}
        pad.lfo.onended=()=>AUDIO.dead(pad.lfo,pad.lfoAmt,pad.padFilt,pad.padGain);
      }
    },
    // sidechain the bed under a loud SFX so dialogue/sales cut through
    duck(amount,dur){
      const b=AUDIO.g(); if(!b) return;
      const t=b.a.currentTime, d=dur||0.6;
      b.mDuck.gain.cancelScheduledValues(t);
      b.mDuck.gain.setValueAtTime(b.mDuck.gain.value,t);
      b.mDuck.gain.linearRampToValueAtTime(Math.max(0.05,1-(amount||0.4)),t+0.04);
      b.mDuck.gain.linearRampToValueAtTime(1,t+d);
    },
  };
})();
// Tiny era-aware synth loop
const SCALES=[[261,329,392,523],[246,311,392,466],[233,311,349,466],[220,277,349,440],[207,261,311,415]];
class SynthLoop{
  constructor(){ this.timer=null; this.step=0; }
  start(getMood){
    this.stop();
    this.timer=setInterval(()=>{
      const a=ctx(); if(!a) return;
      const { era, heat, loc=0 }=getMood();
      const scale=SCALES[Math.min(era,SCALES.length-1)];
      const n=scale[this.step%scale.length]*(this.step%8>=4?2:1);
      tone(n,.14,"square",.022+heat*.0002);
      if(this.step%4===0) tone(scale[0]/2,.4,"sine",.03);
      if(heat>40&&this.step%2===0) tone(scale[2]/4,.08,"sawtooth",.02);
      // district flavor: each location colors the loop differently
      const LOCVOICE=[
        ()=>this.step%8===6&&tone(scale[3]*2,.09,"triangle",.022),            // Beach: glittery high
        ()=>this.step%4===2&&tone(scale[1]*1.5,.07,"square",.02,0,-30),       // Havana: clave-ish stab
        ()=>this.step%8===5&&tone(scale[0]/4,.22,"sawtooth",.025),            // Overtown: low menace
        ()=>this.step%8===7&&tone(scale[2]*2,.16,"sine",.02),                  // Gables: soft chime
        ()=>this.step%2===1&&heat<50&&tone(scale[(this.step>>1)%4]*2,.05,"square",.014), // Lauderdale: party arp
        ()=>this.step%8===3&&tone(scale[0]*0.75,.3,"sine",.022,0,12),          // Keys: tide swell
      ];
      (LOCVOICE[loc]||LOCVOICE[0])();
      this.step++;
    }, Math.max(140, 260-1.2*0));
  }
  stop(){ if(this.timer){clearInterval(this.timer);this.timer=null;} }
}

// ═══════════════════════════════════════════════════════════════
// VIEW LAYER — styles, juice, portraits, scenes  (React/DOM only)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// SFX v2 — musical one-shots, keyed to whatever chord the bed is on
// ═══════════════════════════════════════════════════════════════
// Every cue is built from the AUDIO primitives, lands on a chord tone of
// the running soundtrack, and ducks the bed instead of fighting it.
// SFX keeps its original keys so every existing { type:"SFX", name } effect
// and every SFX.foo() call site keeps working untouched.

const sfxKey=()=>MUSIC.root();
const sfxNote=semi=>mtof(sfxKey()+semi);

Object.assign(SFX,{
  click(){ const t=AUDIO.now()+0.001;
    AUDIO.noise(t,0.018,0.050,"bandpass",2600,2.2);
    AUDIO.osc("sine",sfxNote(24),t,0.050,0.030);
  },
  type(){ const t=AUDIO.now()+0.001;
    AUDIO.noise(t,0.012,0.020,"highpass",5200+Math.random()*1800,0.8);
  },
  error(){ const t=AUDIO.now()+0.001;
    AUDIO.pluck(t,sfxNote(-11),0.22,0.085,"sawtooth",null,1.8);
    AUDIO.pluck(t+0.006,sfxNote(-12),0.24,0.080,"sawtooth",null,1.6);
    AUDIO.DRUM.rim(t,0.045);
  },
  buy(){ const t=AUDIO.now()+0.001;
    AUDIO.pluck(t,sfxNote(19),0.14,0.075,"triangle",null,6);
    AUDIO.pluck(t+0.070,sfxNote(12),0.20,0.070,"triangle",null,5);
    AUDIO.noise(t,0.090,0.030,"bandpass",900,1.2,null,2600);
    AUDIO.DRUM.kick(t,0.22);
    MUSIC.duck(0.22,0.35);
  },
  sell(){ const t=AUDIO.now()+0.001;
    AUDIO.pluck(t,sfxNote(12),0.13,0.075,"square",null,8);
    AUDIO.pluck(t+0.075,sfxNote(19),0.22,0.080,"square",null,9);
    AUDIO.bell(t+0.075,sfxNote(31),0.50,0.030);
    AUDIO.DRUM.hat(t,0.050,false);
    MUSIC.duck(0.25,0.45);
  },
  sellBig(){ const t=AUDIO.now()+0.001, c=MUSIC.chord();
    [0,c[1],c[2],12].forEach((s,i)=>AUDIO.pluck(t+i*0.065,sfxNote(24+s),0.28,0.075,"square",null,9));
    AUDIO.DRUM.kick(t,0.42); AUDIO.DRUM.hat(t+0.13,0.050,false);
    AUDIO.bell(t+0.26,sfxNote(36),0.70,0.030);
    MUSIC.duck(0.35,0.70);
  },
  sellHuge(){ const t=AUDIO.now()+0.001, c=MUSIC.chord();
    [0,c[1],c[2],12,12+c[1]].forEach((s,i)=>AUDIO.pluck(t+i*0.062,sfxNote(24+s),0.30,0.080,"sawtooth",null,8));
    AUDIO.DRUM.kick(t,0.50); AUDIO.DRUM.clap(t+0.31,0.26);
    AUDIO.bell(t+0.33,sfxNote(43),1.00,0.036);
    AUDIO.noise(t+0.30,0.90,0.045,"highpass",5400,0.5);
    MUSIC.duck(0.50,1.10);
  },
  sellMassive(){ const t=AUDIO.now()+0.001, c=MUSIC.chord();
    [0,c[1],c[2],12,12+c[1],12+c[2],24].forEach((s,i)=>
      AUDIO.pluck(t+i*0.058,sfxNote(24+s),0.34,0.085,"sawtooth",null,9));
    AUDIO.DRUM.kick(t,0.62); AUDIO.DRUM.kick(t+0.40,0.48);
    AUDIO.DRUM.tom(t+0.20,sfxNote(-5),0.24); AUDIO.DRUM.tom(t+0.30,sfxNote(-12),0.24);
    AUDIO.DRUM.crash(t+0.41,0.10);
    [0,c[1],c[2],12].forEach(s=>AUDIO.osc("sawtooth",sfxNote(12+s),t+0.41,1.50,0.042,null,Math.random()*10-5));
    AUDIO.bell(t+0.44,sfxNote(48),1.60,0.040);
    MUSIC.duck(0.65,1.80);
  },
  coin(){ const t=AUDIO.now()+0.001;
    AUDIO.bell(t,sfxNote(31),0.35,0.045);
    AUDIO.bell(t+0.055,sfxNote(38),0.50,0.036);
  },
  pager(){ const t=AUDIO.now()+0.001;
    for(let i=0;i<3;i++) AUDIO.pluck(t+i*0.115,sfxNote(36),0.060,0.055,"square",null,3);
    AUDIO.noise(t,0.020,0.020,"highpass",4000,1);
  },
  police(){ const t=AUDIO.now()+0.001;
    for(let i=0;i<3;i++){ const a0=t+i*0.52;
      AUDIO.osc("sawtooth",740,a0,0.26,0.050,null,0,660);
      AUDIO.osc("sawtooth",988,a0+0.26,0.26,0.050,null,0,880);
      AUDIO.osc("sine",55,a0,0.50,0.050);
    }
    AUDIO.noise(t,1.50,0.035,"bandpass",300,1.4,null,1800);
    AUDIO.DRUM.kick(t,0.50);
    MUSIC.duck(0.70,1.80);
  },
  travel(){ const t=AUDIO.now()+0.001;
    AUDIO.noise(t,0.50,0.070,"bandpass",400,1.0,null,1800);
    AUDIO.osc("sine",110,t,0.45,0.045,null,0,190);
  },
  // richer version used by the travel overlay (car / boat variants)
  travelMove(car,boat){ const t=AUDIO.now()+0.001;
    AUDIO.noise(t,0.85,0.130,"bandpass",boat?200:300,1.1,null,boat?1400:3000);
    AUDIO.noise(t+0.30,0.60,0.055,"lowpass",boat?600:1600,0.8,null,300);
    AUDIO.osc("sine",boat?70:120,t,0.70,0.060,null,0,car?300:180);
    AUDIO.osc("triangle",boat?105:180,t+0.05,0.50,0.030,null,7,car?420:250);
    if(car) AUDIO.DRUM.hat(t+0.42,0.050,true);
    MUSIC.duck(0.30,0.90);
  },
  // a pager-lit dialogue sting: mallet chime over a low swell
  storylet(){ const t=AUDIO.now()+0.001, c=MUSIC.chord();
    AUDIO.bell(t,sfxNote(24),0.90,0.040);
    AUDIO.bell(t+0.13,sfxNote(24+c[2]),1.30,0.032);
    AUDIO.osc("sine",sfxNote(-12),t,1.60,0.045);
    AUDIO.noise(t,0.50,0.018,"lowpass",700,0.7,null,240);
    MUSIC.duck(0.45,1.60);
  },
  achievement(i){ const t=AUDIO.now()+0.001, up=((i||0)%3)*2;
    [0,4,7,12,16].forEach((s,k)=>AUDIO.bell(t+k*0.085,sfxNote(24+up+s),0.90,0.042-k*0.004));
    AUDIO.DRUM.kick(t,0.34); AUDIO.DRUM.crash(t,0.070);
    AUDIO.noise(t+0.40,1.10,0.028,"highpass",6000,0.5);
    MUSIC.duck(0.35,1.40);
  },
  // era takeover: 1.15s riser, then the impact
  era(){ const t=AUDIO.now()+0.001, h=t+1.15;
    AUDIO.noise(t,1.15,0.100,"bandpass",300,1.6,null,6500);
    AUDIO.osc("sawtooth",sfxNote(-12),t,1.15,0.050,null,0,sfxNote(12));
    AUDIO.osc("sawtooth",sfxNote(-12),t,1.15,0.040,null,9,sfxNote(11));
    AUDIO.DRUM.kick(h,0.72); AUDIO.DRUM.crash(h,0.120);
    AUDIO.DRUM.tom(h+0.12,sfxNote(-5),0.28); AUDIO.DRUM.tom(h+0.24,sfxNote(-12),0.28);
    AUDIO.osc("sawtooth",sfxNote(0),h,2.00,0.048,null,-7);
    AUDIO.osc("sawtooth",sfxNote(7),h,2.00,0.044,null,7);
    MUSIC.duck(0.75,2.60);
  },
  // ~0.9s tension pulse; the police screen retriggers it on an interval
  chaseBed(){ const t=AUDIO.now()+0.001;
    AUDIO.osc("sine",55,t,0.85,0.055);
    AUDIO.osc("sine",58.2,t,0.85,0.035);
    AUDIO.DRUM.kick(t,0.34); AUDIO.DRUM.kick(t+0.42,0.22);
    AUDIO.noise(t+0.10,0.45,0.022,"bandpass",900,2.4,null,2400);
    AUDIO.osc("sawtooth",311,t+0.02,0.30,0.020,null,0,440);
    AUDIO.osc("sawtooth",440,t+0.34,0.30,0.018,null,0,311);
  },
  endingWin(){ const t=AUDIO.now()+0.001;
    [0,7,12,16,19,24].forEach((s,i)=>AUDIO.pluck(t+i*0.12,sfxNote(12+s),0.70,0.075,"sawtooth",null,9));
    AUDIO.DRUM.kick(t,0.60); AUDIO.DRUM.crash(t+0.70,0.120);
    [0,4,7,12].forEach(s=>AUDIO.osc("sawtooth",sfxNote(s),t+0.72,2.60,0.048,null,Math.random()*8-4));
    AUDIO.bell(t+0.75,sfxNote(36),2.20,0.045);
  },
  endingLose(){ const t=AUDIO.now()+0.001;
    AUDIO.DRUM.kick(t,0.70); AUDIO.DRUM.crash(t,0.100);
    [0,3,6,11].forEach((s,i)=>AUDIO.osc("sawtooth",sfxNote(s-12),t+i*0.02,3.00,0.046,null,(i-1.5)*9));
    AUDIO.noise(t,2.40,0.040,"lowpass",1400,0.8,null,180);
    AUDIO.osc("sine",41,t,3.20,0.060);
  },
});

// The existing React effect keeps calling new SynthLoop().start()/.stop().
// Point that API at the new transport; `this` is the owner token so React's
// cleanup/setup ordering can never leave two transports running.
SynthLoop.prototype.start=function(getMood){ MUSIC.start(getMood,this); };
SynthLoop.prototype.stop=function(){ MUSIC.stop(this); };
const ft="'Courier New',monospace", fb="Georgia,'Times New Roman',serif";

const KEYFRAMES=`
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{opacity:0;transform:scale(.7)}70%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes riseIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes shakeA{0%,100%{transform:translate(0,0)}20%{transform:translate(-5px,2px)}40%{transform:translate(5px,-2px)}60%{transform:translate(-4px,-1px)}80%{transform:translate(4px,1px)}}
@keyframes flashFade{from{opacity:1}to{opacity:0}}
@keyframes neonFlick{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.4}94%{opacity:1}97%{opacity:.7}98%{opacity:1}}
@keyframes hudPing{0%{transform:scale(.5);box-shadow:0 0 0 0 rgba(255,215,0,.8)}60%{transform:scale(1.12)}100%{transform:scale(1);box-shadow:0 0 12px 2px rgba(255,215,0,0)}}
@keyframes glitchA{0%{clip-path:inset(0 0 0 0);transform:translate(0)}20%{clip-path:inset(20% 0 40% 0);transform:translate(-4px)}40%{clip-path:inset(60% 0 10% 0);transform:translate(4px)}60%{clip-path:inset(10% 0 70% 0);transform:translate(-3px)}80%{clip-path:inset(40% 0 30% 0);transform:translate(3px)}100%{clip-path:inset(0 0 0 0);transform:translate(0)}}
@keyframes floatUp{from{opacity:1;transform:translate(-50%,0) scale(1)}to{opacity:0;transform:translate(-50%,-70px) scale(1.15)}}
@keyframes streakPop{0%{transform:translate(-50%,0) scale(.6) rotate(-6deg);opacity:0}30%{transform:translate(-50%,0) scale(1.25) rotate(3deg);opacity:1}100%{transform:translate(-50%,-30px) scale(1) rotate(0);opacity:0}}
@keyframes caretB{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes sirenWash{0%,100%{opacity:.0}25%{opacity:.5}50%{opacity:.05}75%{opacity:.45}}
@keyframes twinkle{0%,100%{opacity:.25}50%{opacity:.9}}
@keyframes sunPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(255,160,60,.7))}50%{filter:drop-shadow(0 0 14px rgba(255,160,60,1))}}
@keyframes waterSh{0%{transform:translateX(-12px)}50%{transform:translateX(12px)}100%{transform:translateX(-12px)}}
@keyframes breakLine{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
@keyframes profitPunch{0%{transform:scale(.6);opacity:0}55%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
@keyframes vhsTrack{0%,100%{transform:translateY(0)}48%{transform:translateY(0)}50%{transform:translateY(2px)}52%{transform:translateY(-1px)}54%{transform:translateY(0)}}
@keyframes gridScroll{from{background-position:0 0}to{background-position:0 44px}}
@keyframes coachBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes portraitBreath{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.018) translateY(-.6%)}}
@keyframes cloudDrift{0%{transform:translateX(-34px)}100%{transform:translateX(46px)}}
@keyframes roadMove{from{background-position:0 0}to{background-position:0 60px}}
@keyframes streakMove{from{transform:translateX(0)}to{transform:translateX(-150vw)}}
@keyframes palmFlyL{0%{transform:translate(0,0) scale(.18);opacity:0}12%{opacity:1}100%{transform:translate(-250px,150px) scale(3.4);opacity:0}}
@keyframes palmFlyR{0%{transform:translate(0,0) scale(.18);opacity:0}12%{opacity:1}100%{transform:translate(250px,150px) scale(3.4);opacity:0}}
@keyframes vehBob{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.4deg)}50%{transform:translateX(-50%) translateY(-3px) rotate(.4deg)}}
@keyframes destIn{from{opacity:0;transform:translateY(20px) scale(.82)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes progressFill{from{width:0}to{width:100%}}
@keyframes slideDown{to{opacity:0;transform:translateY(26px)}}
@keyframes fadeOut{to{opacity:0}}
@keyframes popOut{to{opacity:0;transform:scale(.86)}}
@keyframes rgbSplit{0%,100%{text-shadow:2px 0 #FF1733,-2px 0 #00E5FF}50%{text-shadow:-3px 0 #FF1733,3px 0 #00E5FF}}
@keyframes shineSweep{from{transform:translateX(-130%)}to{transform:translateX(280%)}}
@keyframes figL{from{opacity:0;transform:translateX(-46px)}to{opacity:1;transform:translateX(0)}}
@keyframes figR{from{opacity:0;transform:translateX(46px)}to{opacity:1;transform:translateX(0)}}
@keyframes arcLR{0%{opacity:0;transform:translate(0,0) scale(.7)}15%{opacity:1}50%{transform:translate(60px,-20px) scale(1.1)}100%{opacity:0;transform:translate(120px,0) scale(.8)}}
@keyframes arcRL{0%{opacity:0;transform:translate(0,0) scale(.7)}15%{opacity:1}50%{transform:translate(-60px,-20px) scale(1.1)}100%{opacity:0;transform:translate(-120px,0) scale(.8)}}
@keyframes crateDrop{0%{opacity:0;transform:translateY(-46px)}55%{opacity:1;transform:translateY(6px)}75%{transform:translateY(-5px)}100%{opacity:1;transform:translateY(0)}}
@keyframes sweepPass{0%{transform:translateX(-130%) skewX(-18deg);opacity:0}12%{opacity:.9}100%{transform:translateX(240%) skewX(-18deg);opacity:0}}
@keyframes dsCaption{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
@keyframes sweepX{from{left:0}to{left:calc(100% - 14px)}}
@keyframes ringShrink{from{transform:scale(2.3);opacity:.9}to{transform:scale(.5);opacity:.4}}
@keyframes verdictIn{0%{opacity:0;transform:scale(.5) rotate(-6deg)}60%{transform:scale(1.18) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes mashShake{0%,100%{transform:translate(0,0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}}
@keyframes streakBorder{0%,100%{box-shadow:inset 0 0 26px #FF6B3550}50%{box-shadow:inset 0 0 64px #FF6B35a0}}
@keyframes rainbowB{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}
@keyframes hudPulse{0%,100%{box-shadow:0 0 4px #FF173355}50%{box-shadow:0 0 18px #FF1733}}
@keyframes skyDriftA{0%{transform:translateX(-16px)}100%{transform:translateX(16px)}}
@keyframes skyDriftB{0%{transform:translateX(9px)}100%{transform:translateX(-9px)}}
@keyframes fogRoll{0%{transform:translateX(-70px);opacity:.14}50%{opacity:.30}100%{transform:translateX(70px);opacity:.14}}
@keyframes neonBuzz{0%,100%{opacity:1}40%{opacity:1}41%{opacity:.22}42%{opacity:.9}43%{opacity:.35}44%{opacity:1}76%{opacity:1}77%{opacity:.45}78%{opacity:1}}
@keyframes neonBuzz2{0%,100%{opacity:.96}16%{opacity:.96}17%{opacity:.28}18%{opacity:.96}62%{opacity:.96}63%{opacity:.42}64%{opacity:.96}65%{opacity:.18}66%{opacity:.96}}
@keyframes tubeGlow{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes beaconBlink{0%,100%{opacity:.12}7%{opacity:1}15%{opacity:.12}}
@keyframes reflShimmer{0%{transform:translateX(-6px)}50%{transform:translateX(6px)}100%{transform:translateX(-6px)}}
@keyframes reflBand{0%{transform:translateY(0)}100%{transform:translateY(7px)}}
@keyframes crtRoll{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(0,-33.3333%,0)}}
@keyframes trackGlitch{0%{transform:translateY(-14vh);opacity:0}1%{opacity:.5}4%{opacity:.45}9%{transform:translateY(114vh);opacity:0}100%{transform:translateY(114vh);opacity:0}}
@keyframes hazeWave{0%,100%{transform:translateY(0) scaleY(1);opacity:.45}50%{transform:translateY(-5px) scaleY(1.07);opacity:.9}}
@keyframes strobeL{0%,100%{opacity:0}5%{opacity:.6}11%{opacity:0}19%{opacity:.4}25%{opacity:0}}
@keyframes strobeR{0%,100%{opacity:0}55%{opacity:.6}61%{opacity:0}69%{opacity:.4}75%{opacity:0}}
@keyframes aberrJit{0%,100%{transform:translateX(0)}50%{transform:translateX(1.3px)}}
@keyframes bloomBreath{0%,100%{opacity:.45}50%{opacity:.85}}
@keyframes logoBuzz{0%,100%{opacity:1}51%{opacity:1}52%{opacity:.22}53%{opacity:1}54%{opacity:.5}55%{opacity:1}87%{opacity:1}88%{opacity:.35}89%{opacity:1}}
@keyframes logoHum{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes palmSway{0%,100%{transform:rotate(-1.8deg)}50%{transform:rotate(1.8deg)}}
@keyframes washSweep{0%{transform:translateX(-130%) skewX(-14deg);opacity:0}12%{opacity:.9}60%{opacity:.5}100%{transform:translateX(250%) skewX(-14deg);opacity:0}}
@keyframes washTint{0%{opacity:.55}100%{opacity:0}}
@keyframes dotPulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.9);opacity:.18}}
@keyframes actNum{0%{opacity:0;transform:scale(1.35);filter:blur(10px)}60%{opacity:.55}100%{opacity:.55;transform:scale(1);filter:blur(0)}}
@keyframes vinylIn{from{opacity:0;letter-spacing:20px}to{opacity:1;letter-spacing:6px}}
@keyframes plateRise{from{opacity:0;transform:translateY(24px) scale(.965)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes kenBurns{from{transform:scale(1.02)}to{transform:scale(1.12)}}
@keyframes headlightPass{0%{transform:translateX(-60%) skewX(-16deg);opacity:0}14%{opacity:.9}78%{opacity:.7}100%{transform:translateX(320%) skewX(-16deg);opacity:0}}
@keyframes lampFlick{0%,100%{opacity:.9}42%{opacity:.9}43%{opacity:.25}44%{opacity:.85}45%{opacity:.4}46%{opacity:.9}87%{opacity:.9}88%{opacity:.5}89%{opacity:.9}}
button:active{transform:scale(.95)}
button{transition:transform .16s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease, filter .15s ease}
*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
`;

// ── style factories ──
const bt=(color,solid=false)=>({fontFamily:ft,fontWeight:"bold",fontSize:13,letterSpacing:.5,padding:"12px 14px",borderRadius:8,cursor:"pointer",border:`1px solid ${color}${solid?"":"88"}`,background:solid?`linear-gradient(180deg, ${color} 0%, ${color}c8 100%)`:`linear-gradient(180deg, ${color}22 0%, ${color}10 100%)`,color:solid?C.midnight:color,textShadow:solid?"none":`0 0 8px ${color}66`,boxShadow:solid?`0 3px 0 rgba(0,0,0,.45), inset 0 1px 0 #ffffff50, 0 0 16px ${color}44`:`inset 0 1px 0 ${color}22`});
const bx={background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:12};

// ── Neon text ──
const Neon=({children,color=C.pink,size=28,flicker=false,style:st={}})=>(
  <div style={{fontFamily:ft,fontWeight:"bold",fontSize:size,color,letterSpacing:2,
    textShadow:`0 0 6px ${color}, 0 0 18px ${color}88, 0 0 40px ${color}44`,
    animation:flicker?"neonFlick 4s infinite":"none",...st}}>{children}</div>
);

// ── Rolling cash counter w/ pop ──
const AnimatedNumber=({value,color=C.green,size=17})=>{
  const [disp,setDisp]=useState(value);
  const [pop,setPop]=useState(false);
  const prev=useRef(value);
  useEffect(()=>{
    if(value===prev.current) return;
    const from=prev.current,to=value,d=to-from; prev.current=value;
    if(d>0){ setPop(true); setTimeout(()=>setPop(false),320); }
    const t0=performance.now(),dur=Math.min(650,250+Math.abs(d)/80);
    let raf;
    const step=t=>{ const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
      setDisp(Math.round(from+d*e)); if(p<1) raf=requestAnimationFrame(step); };
    raf=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf);
  },[value]);
  return <span style={{fontFamily:ft,fontWeight:"bold",fontSize:size,color,display:"inline-block",
    transform:pop?"scale(1.14)":"scale(1)",transition:"transform .15s ease",
    textShadow:pop?`0 0 12px ${color}`:`0 0 4px ${color}55`}}>{FM(disp)}</span>;
};

// ── Sparkline ──
const Sparkline=({data,color,w=56,h=20})=>{
  if(!data||data.length<2) return <div style={{width:w,height:h}}/>;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-2-((v-mn)/r)*(h-4)}`).join(" ");
  return <svg width={w} height={h} style={{display:"block"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" opacity=".9"/>
    <circle cx={w} cy={h-2-((data[data.length-1]-mn)/r)*(h-4)} r="2" fill={color}/>
  </svg>;
};
const TrendArrow=({hist})=>{
  if(!hist||hist.length<2) return null;
  const a=hist[hist.length-2],b=hist[hist.length-1],d=(b-a)/a;
  if(Math.abs(d)<.02) return <span style={{color:C.dim,fontSize:11}}>→</span>;
  const up=d>0,big=Math.abs(d)>.15;
  return <span style={{color:up?C.green:C.pink,fontSize:big?13:11,fontWeight:"bold"}}>{up?(big?"▲▲":"▲"):(big?"▼▼":"▼")}</span>;
};
const Bar=({v,max=100,color,h=5})=>(
  <div style={{height:h,background:"#0008",borderRadius:h,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${CL(v/max*100,0,100)}%`,background:color,borderRadius:h,transition:"width .4s ease",boxShadow:`0 0 6px ${color}`}}/>
  </div>
);

// ── Tier-coded drug glyph: hex plate, tier color, break-even halo ──
const TIER_C=[C.green,C.orange,C.pink];
const TIER_TAG=["ST","MID","WT"];
const DrugGlyph=({d,owned=0,sel=false})=>{
  const c=TIER_C[d.tier]||C.dim;
  return(
    <div style={{position:"relative",width:30,height:34,flexShrink:0}}>
      <svg viewBox="0 0 30 34" style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}>
        <polygon points="15,1.4 28.7,9.2 28.7,24.8 15,32.6 1.3,24.8 1.3,9.2"
          fill={`${c}16`} stroke={`${c}${sel?"ee":owned>0?"aa":"55"}`} strokeWidth={sel?1.6:1.1}/>
        {owned>0&&<polygon points="15,3.8 26.3,10.3 26.3,23.7 15,30.2 3.7,23.7 3.7,10.3"
          fill="none" stroke={C.gold} strokeWidth=".8"
          style={{animation:"tubeGlow 2.6s ease-in-out infinite"}}/>}
        <polygon points="15,1.4 28.7,9.2 15,17 1.3,9.2" fill="#FFFFFF" opacity=".05"/>
      </svg>
      <div style={{position:"absolute",left:0,right:0,top:4,textAlign:"center",fontSize:14,
        lineHeight:1.15,filter:`drop-shadow(0 0 5px ${c}bb)`}}>{d.emoji}</div>
      <div style={{position:"absolute",left:0,right:0,bottom:1.5,textAlign:"center",fontFamily:ft,
        fontSize:6,letterSpacing:.5,fontWeight:"bold",color:c,opacity:.9}}>{TIER_TAG[d.tier]}</div>
    </div>
  );
};

// ── Price history sparkline: gradient area, trend color, break-even line ──
let SPARK_UID=0;
const SparkPro=({data,color=C.blue,avg=0,w=52,h=24})=>{
  const uid=useRef(0);
  if(!uid.current) uid.current=++SPARK_UID;
  if(!data||data.length<2) return <div style={{width:w,height:h,flexShrink:0}}/>;
  const mn=Math.min(...data), mx=Math.max(...data), rng=(mx-mn)||1;
  const yOf=v=>h-3-(CL((v-mn)/rng,0,1))*(h-8);
  const pts=data.map((v,i)=>[(i/(data.length-1))*w, yOf(v)]);
  const line=pts.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area=`0,${h} ${line} ${w},${h}`;
  const up=data[data.length-1]>=data[0];
  const sc=up?C.green:C.pink;
  const last=pts[pts.length-1];
  const gid="spk"+uid.current;
  const showAvg=avg>0&&avg>mn&&avg<mx;
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block",flexShrink:0}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sc} stopOpacity=".45"/>
          <stop offset="100%" stopColor={sc} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`}/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="3.2" opacity=".14" strokeLinejoin="round"/>
      {showAvg&&<line x1="0" y1={yOf(avg)} x2={w} y2={yOf(avg)} stroke={C.gold} strokeWidth=".7" strokeDasharray="2 2" opacity=".75"/>}
      <polyline points={line} fill="none" stroke={sc} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={sc} opacity=".3"
        style={{transformBox:"fill-box",transformOrigin:"center",animation:"dotPulse 2s ease-in-out infinite"}}/>
      <circle cx={last[0]} cy={last[1]} r="1.7" fill={sc}/>
    </svg>
  );
};

// ── FLIP-style price tick: animate the diff with native WAAPI before paint ──
const PriceCell=({value})=>{
  const ref=useRef(null), prev=useRef(value);
  useLayoutEffect(()=>{
    if(prev.current!==value&&ref.current&&ref.current.animate){
      const up=value>prev.current;
      ref.current.animate(
        [{transform:`translateY(${up?9:-9}px)`,color:up?C.green:C.pink,opacity:.12},
         {transform:"translateY(0)",color:C.text,opacity:1}],
        {duration:430,easing:"cubic-bezier(.22,1,.36,1)"});
    }
    prev.current=value;
  },[value]);
  return <div ref={ref} style={{fontFamily:ft,fontSize:15,fontWeight:"bold",color:C.text}}>{FM(value)}</div>;
};

// ── Coach mark — one concept, dismissed by action ──
const CoachMark=({k,style:st={}})=>(
  <div style={{position:"absolute",zIndex:30,pointerEvents:"none",animation:"coachBob 1.6s ease-in-out infinite",...st}}>
    <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:C.midnight,background:C.gold,
      padding:"5px 10px",borderRadius:14,boxShadow:`0 0 14px ${C.gold}88`,whiteSpace:"nowrap"}}>
      {COACH_MARKS[k].text}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// NPC PORTRAITS — hand-built SVG busts, mood-parameterized
// ═══════════════════════════════════════════════════════════════
// Every mood resolves to the same numeric drivers; each face interprets them
// through its own bone structure, so a mood is a real change of expression and
// not a palette swap. An unknown mood falls back to neutral, so a storylet
// writer can never crash a portrait with a typo.
//   lid   upper-lid weight (negative = eyes flown open)
//   brow  brow height (+ = pushed down)
//   tilt  inner-brow tilt (+ = inner ends up / grief, - = inner down / anger)
//   asym  one-sided lift — the smirk driver
//   curve mouth curvature (+ = up)
//   open  mouth aperture
//   tense jaw + nasolabial tension
//   gaze  pupil drift
//   glint catchlight strength
const MOODS={
  neutral:   {lid:.6,  brow:0,   tilt:0,   asym:0,   curve:1.6, open:0,  tense:.15,gaze:0,   glint:.55},
  pleased:   {lid:1.8, brow:-1,  tilt:.4,  asym:1,   curve:6,   open:0,  tense:.10,gaze:0,   glint:.70},
  amused:    {lid:1.3, brow:-2,  tilt:0,   asym:3.4, curve:8.5, open:2.6,tense:.10,gaze:1.6, glint:.85},
  knowing:   {lid:2.8, brow:-.6, tilt:-.6, asym:4.2, curve:4.2, open:0,  tense:.20,gaze:2.6, glint:.60},
  wry:       {lid:2.2, brow:.2,  tilt:-.3, asym:5,   curve:3.4, open:0,  tense:.26,gaze:-2.2,glint:.50},
  flirty:    {lid:3.6, brow:-2.2,tilt:.6,  asym:2.6, curve:7,   open:1.4,tense:.06,gaze:3,   glint:.90},
  tired:     {lid:4.2, brow:1.6, tilt:1.6, asym:.4,  curve:-2,  open:0,  tense:.32,gaze:-.6, glint:.28},
  vulnerable:{lid:.9,  brow:-1.2,tilt:3.6, asym:0,   curve:-2.6,open:0,  tense:.36,gaze:-1.6,glint:.80},
  cold:      {lid:2.4, brow:.6,  tilt:-1.2,asym:0,   curve:0,   open:0,  tense:.30,gaze:0,   glint:.35},
  angry:     {lid:.8,  brow:3.2, tilt:-4.6,asym:0,   curve:-5.2,open:2.4,tense:.85,gaze:0,   glint:.50},
  nervous:   {lid:-1.4,brow:-2.8,tilt:2.6, asym:0,   curve:-1.6,open:1.6,tense:.55,gaze:-3.2,glint:.95},
};
const MD=m=>MOODS[m]||MOODS.neutral;
const rn=n=>Math.round(n*10)/10;

// ── portrait geometry (no <defs> ids anywhere below: two portraits can be on
//    screen at once and duplicate ids would cross-wire them) ──
const eyeAlmond=(x,y,rx,up,dn)=>
  `M ${rn(x-rx)} ${y} Q ${x} ${rn(y-up*2)} ${rn(x+rx)} ${y} Q ${x} ${rn(y+dn*2)} ${rn(x-rx)} ${y} Z`;
const lidCap=(x,y,rx,up,h)=>
  `M ${rn(x-rx-4)} ${y} L ${rn(x-rx-4)} ${rn(y-h)} L ${rn(x+rx+4)} ${rn(y-h)} L ${rn(x+rx+4)} ${y} L ${rn(x+rx)} ${y} Q ${x} ${rn(y-up*2)} ${rn(x-rx)} ${y} Z`;
const lidFloor=(x,y,rx,dn,h)=>
  `M ${rn(x-rx-4)} ${y} L ${rn(x-rx-4)} ${rn(y+h)} L ${rn(x+rx+4)} ${rn(y+h)} L ${rn(x+rx+4)} ${y} L ${rn(x+rx)} ${y} Q ${x} ${rn(y+dn*2)} ${rn(x-rx)} ${y} Z`;
const lipLine=(x,y,hw,curve,lift)=>
  `M ${rn(x-hw)} ${y} Q ${x} ${rn(y+curve)} ${rn(x+hw)} ${rn(y-lift)}`;
const lipsShape=(x,y,hw,curve,lift,top,bot)=>
  `M ${rn(x-hw)} ${y} Q ${rn(x-hw*.5)} ${rn(y-top)} ${rn(x-hw*.16)} ${rn(y-top*.55)} Q ${x} ${rn(y-top*1.25)} ${rn(x+hw*.16)} ${rn(y-top*.55)} Q ${rn(x+hw*.5)} ${rn(y-top)} ${rn(x+hw)} ${rn(y-lift)} Q ${x} ${rn(y+curve+bot*2)} ${rn(x-hw)} ${y} Z`;
const lipOpen=(x,y,hw,curve,open,lift)=>
  `M ${rn(x-hw)} ${y} Q ${x} ${rn(y+curve+open*2)} ${rn(x+hw)} ${rn(y-lift)} Q ${x} ${rn(y+curve-open*1.1)} ${rn(x-hw)} ${y} Z`;
// side: -1 = viewer-left brow, +1 = viewer-right brow
const browArc=(x,y,hw,arch,tilt,side)=>{
  const ox=x-side*hw, ix=x+side*hw, oy=y+tilt*.35, iy=y-tilt;
  return `M ${rn(ox)} ${rn(oy)} Q ${rn((ox+ix)/2)} ${rn(Math.min(oy,iy)-arch*2)} ${rn(ix)} ${rn(iy)}`;
};

// ── backdrop: signature key light plus venetian slats on the wall behind ──
const PBack=({glow,base,tilt=-7})=>(<>
  <rect width="240" height="320" fill={base}/>
  <ellipse cx="120" cy="118" rx="150" ry="144" fill={glow} opacity=".14"/>
  <ellipse cx="120" cy="110" rx="104" ry="98" fill={glow} opacity=".13"/>
  <ellipse cx="120" cy="102" rx="62" ry="58" fill={glow} opacity=".12"/>
  <g opacity=".2" transform={`rotate(${tilt} 120 150)`}>
    {[-48,-16,16,48,80,112,144,176,208,240,272].map(y=>
      <rect key={y} x="-50" y={y} width="340" height="8" fill={glow}/>)}
  </g>
</>);

// ── eye: sclera, iris, then skin-coloured lids re-cover the overflow ──
const Eye=({x:X,y:Y,rx:RX,ry:RY,skin,iris,pupil,lid,gaze,glint,lash="#150C05",lashW=2.6,lower=true})=>{
  const x=+X, y=+Y, rx=+RX, ry=+RY, ld=+lid, gz=+gaze, gl=+glint;
  const up=CL(ry-ld*.72,1.7,ry+2.2), dn=CL(ry*.56-ld*.14,1.1,ry);
  const px=rn(x+gz), py=rn(y+.6);
  return(<>
    <path d={eyeAlmond(x,y,rx,up,dn)} fill="#F1EBE0"/>
    <circle cx={px} cy={py} r={rn(rx*.44)} fill={iris}/>
    <circle cx={px} cy={py} r={rn(rx*.44)} fill="#000" opacity=".2" transform={`translate(0,${rn(-rx*.18)})`}/>
    <circle cx={px} cy={py} r={rn(rx*.2)} fill={pupil}/>
    <circle cx={rn(px-rx*.2)} cy={rn(py-rx*.22)} r={rn(rx*.13)} fill="#fff" opacity={gl}/>
    <circle cx={rn(px+rx*.21)} cy={rn(py+rx*.17)} r={rn(rx*.07)} fill="#fff" opacity={gl*.5}/>
    <path d={lidCap(x,y,rx,up,30)} fill={skin}/>
    {lower&&<path d={lidFloor(x,y,rx,dn,22)} fill={skin}/>}
    <path d={`M ${rn(x-rx)} ${y} Q ${x} ${rn(y-up*2)} ${rn(x+rx)} ${y}`} fill="none"
      stroke={lash} strokeWidth={lashW} strokeLinecap="round"/>
    <path d={`M ${rn(x-rx*.8)} ${rn(y+dn*1.2)} Q ${x} ${rn(y+dn*2.1)} ${rn(x+rx*.8)} ${rn(y+dn*1.2)}`}
      fill="none" stroke={lash} strokeWidth={rn(lashW*.5)} opacity=".4"/>
  </>);
};

// ── blink: SMIL height animation, no transform-box dependency ──
const Blink=({skin,x1,x2,y,w,dh,dur="6.4s",kt="0;.945;.963;.982;1"})=>(
  <g fill={skin}>
    <rect x={x1} y={y} width={w} height="0" rx="4">
      <animate attributeName="height" values={`0;0;${dh};0;0`} keyTimes={kt} dur={dur} repeatCount="indefinite"/>
    </rect>
    <rect x={x2} y={y} width={w} height="0" rx="4">
      <animate attributeName="height" values={`0;0;${dh};0;0`} keyTimes={kt} dur={dur} repeatCount="indefinite"/>
    </rect>
  </g>
);

// legacy bust helper — still used by the pre-v5 portraits below
const Face=({skin,cx=120})=>(<>
  <ellipse cx={cx} cy="150" rx="46" ry="56" fill={skin}/>
  <rect x={cx-16} y="195" width="32" height="30" fill={skin}/>
</>);

// ═══════════════════════════════════════════════════════════════
// MARIA SANTOS — Coral Gables gallerist. Long face, big hair,
// shoulders you could hang a show on, gold she bought herself.
// ═══════════════════════════════════════════════════════════════
const MariaP=({mood="neutral"})=>{
  const M=MD(mood);
  const skin="#DCA87F", shade="#B07854", deep="#8A5232", warm="#F2CDA5";
  const lip=(mood==="vulnerable"||mood==="tired")?"#A82443":"#C4123F", lipD="#7A0A21";
  const eY=148, bY=128+M.brow, mY=193, lift=rn(M.asym*.6);
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <PBack glow="#FF2D7B" base="#0A0611" tilt={-7}/>

    {/* hair, back mass — 1986 volume, past the shoulder */}
    <path d="M120 66 C68 66 42 110 46 164 C48 198 40 232 30 262 C24 282 26 300 34 320 L78 320 C66 296 62 266 70 236 C78 208 78 182 76 156 L164 156 C162 182 162 208 170 236 C178 266 174 296 162 320 L206 320 C214 300 216 282 210 262 C200 232 192 198 194 164 C198 110 172 66 120 66 Z" fill="#150B05"/>
    <path d="M120 68 C78 68 52 108 54 154 C55 178 50 204 42 226 C52 200 60 174 64 150 C70 114 90 90 120 88 C150 90 170 114 176 150 C180 174 188 200 198 226 C190 204 185 178 186 154 C188 108 162 68 120 68 Z" fill="#2C1810"/>

    {/* neck */}
    <path d="M103 190 L103 234 Q120 246 137 234 L137 190 Z" fill={shade}/>
    <path d="M98 198 Q120 222 142 198 L142 214 Q120 236 98 214 Z" fill={deep} opacity=".55"/>

    {/* blazer — the shoulders are the whole point */}
    <path d="M12 320 C18 270 50 245 88 237 L120 258 L152 237 C190 245 222 270 228 320 Z" fill="#1D1529"/>
    <path d="M12 320 C18 270 50 245 88 237 L102 320 Z" fill="#120C1C"/>
    <path d="M228 320 C222 270 190 245 152 237 L138 320 Z" fill="#120C1C"/>
    <path d="M104 240 L120 294 L136 240 Z" fill="#3A1030"/>
    <path d="M92 239 L120 296 L148 239 L138 235 L120 274 L102 235 Z" fill="#E9DCC4"/>
    <path d="M92 239 L120 296 L110 320 L78 320 Z" fill="#261C36"/>
    <path d="M148 239 L120 296 L130 320 L162 320 Z" fill="#261C36"/>
    <path d="M88 237 Q120 258 152 237 L152 231 Q120 252 88 231 Z" fill={skin}/>
    <path d="M100 246 Q120 266 140 246" fill="none" stroke={C.gold} strokeWidth="3"/>
    <path d="M114 260 L126 260 L120 272 Z" fill={C.gold}/>

    {/* face — long, narrow, tapered */}
    <path d="M120 92 C97 92 83 110 81 134 C79 155 85 179 94 195 C102 211 111 221 120 221 C129 221 138 211 146 195 C155 179 161 155 159 134 C157 110 143 92 120 92 Z" fill={skin}/>
    <path d="M140 97 C153 106 159 120 159 134 C161 155 155 179 146 195 C138 211 129 221 120 221"
      fill="none" stroke={shade} strokeWidth="15" opacity=".4" strokeLinecap="round"/>
    <path d="M100 97 C88 106 82 120 81 134 C79 155 85 179 93 194"
      fill="none" stroke="#FF8FBC" strokeWidth="4.4" opacity=".5" strokeLinecap="round"/>
    <path d="M100 128 C93 140 90 156 92 172" fill="none" stroke={warm} strokeWidth="7" opacity=".22"/>
    <ellipse cx="95" cy="172" rx="12" ry="5.5" fill="#D8506F" opacity=".13" transform="rotate(-14 95 172)"/>
    <ellipse cx="145" cy="172" rx="12" ry="5.5" fill="#D8506F" opacity=".13" transform="rotate(14 145 172)"/>

    {/* eyes */}
    <Eye x={102} y={eY} rx={12.4} ry={7.6} skin={skin} iris="#4A2C15" pupil="#150C05"
      lid={M.lid} gaze={M.gaze} glint={M.glint} lashW={2.8}/>
    <Eye x={138} y={eY} rx={12.4} ry={7.6} skin={skin} iris="#4A2C15" pupil="#150C05"
      lid={M.lid} gaze={M.gaze} glint={M.glint} lashW={2.8}/>
    {/* 1986: shadow swept out past the crease, liner flicked at the corner */}
    <path d="M91 139 Q102 133 113 137 Q102 137 92 143 Z" fill="#7C2A50" opacity=".42"/>
    <path d="M149 139 Q138 133 127 137 Q138 137 148 143 Z" fill="#7C2A50" opacity=".42"/>
    <path d="M89 146 L82 141" stroke="#150C05" strokeWidth="2.6" strokeLinecap="round"/>
    <path d="M151 146 L158 141" stroke="#150C05" strokeWidth="2.6" strokeLinecap="round"/>
    <Blink skin={skin} x1="88" x2="124" dh="20" y="137" w="28" dur="6.4s"/>

    {/* brows — high, thin, architectural */}
    <path d={browArc(102,bY,14,2.6,M.tilt,-1)} fill="none" stroke="#211107" strokeWidth="3.6" strokeLinecap="round"/>
    <path d={browArc(138,rn(bY-M.asym*.6),14,2.6,M.tilt,1)} fill="none" stroke="#211107" strokeWidth="3.6" strokeLinecap="round"/>

    {/* nose */}
    <path d="M119 154 Q116 170 112 176 Q120 182 128 177" fill="none" stroke={deep} strokeWidth="2.3" strokeLinecap="round" opacity=".7"/>
    <path d="M122 152 Q125 164 127 174" fill="none" stroke={warm} strokeWidth="2.6" opacity=".4"/>
    <ellipse cx="112" cy="178" rx="3" ry="1.9" fill={deep} opacity=".42"/>
    <ellipse cx="128" cy="178" rx="3" ry="1.9" fill={deep} opacity=".42"/>

    {/* mouth */}
    <path d={lipsShape(120,mY,17.5,M.curve,lift,5.2,4)} fill={lip}/>
    {M.open>1&&<>
      <path d={lipOpen(120,mY,14.4,M.curve,M.open,lift)} fill="#3C0716"/>
      <path d={lipOpen(120,rn(mY-1),13,M.curve,rn(M.open*.5),lift)} fill="#F1E7D8"/>
    </>}
    {M.open<=1&&<path d={lipLine(120,mY,16,M.curve,lift)} fill="none" stroke={lipD} strokeWidth="2" strokeLinecap="round" opacity=".8"/>}
    <ellipse cx="120" cy={rn(mY-9)} rx="4.5" ry="2.2" fill="#fff" opacity=".2"/>
    <path d="M105 176 Q100 187 104 197" fill="none" stroke={deep} strokeWidth="2" opacity={rn(M.tense*.7)}/>
    <path d="M135 176 Q140 187 136 197" fill="none" stroke={deep} strokeWidth="2" opacity={rn(M.tense*.7)}/>
    <circle cx="141" cy="182" r="1.9" fill="#3A1E0C"/>

    {/* hair, front — crown, deep side part, face-framing waves */}
    <path d="M120 66 C82 66 60 98 62 142 C68 120 76 106 90 98 C102 92 111 99 120 99 C129 99 138 92 150 98 C164 106 172 120 178 142 C180 98 158 66 120 66 Z" fill="#20120A"/>
    <path d="M120 70 C102 70 89 82 85 100 C98 88 110 87 120 89 C130 87 142 88 155 100 C151 82 138 70 120 70 Z" fill="#3B2312"/>
    <path d="M78 126 C67 156 67 196 77 228 C73 246 64 258 54 266 C68 254 78 240 82 226 C72 194 72 156 82 128 Z" fill="#20120A"/>
    <path d="M162 126 C173 156 173 196 163 228 C167 246 176 258 186 266 C172 254 162 240 158 226 C168 194 168 156 158 128 Z" fill="#20120A"/>
    <path d="M97 76 C83 86 72 104 67 130" fill="none" stroke="#5E3A20" strokeWidth="3" opacity=".6"/>
    <path d="M145 76 C159 86 169 104 174 130" fill="none" stroke="#5E3A20" strokeWidth="3" opacity=".45"/>
    <path d="M62 176 C58 206 61 236 70 258" fill="none" stroke="#4C2C17" strokeWidth="3.4" opacity=".5"/>
    <path d="M178 176 C182 206 179 236 170 258" fill="none" stroke="#4C2C17" strokeWidth="3.4" opacity=".4"/>

    {/* the gold. she bought it herself */}
    <circle cx="83" cy="184" r="3.2" fill={C.gold}/>
    <path d="M75 189 L91 189 L83 212 Z" fill={C.gold}/>
    <path d="M78 191 L88 191 L83 205 Z" fill="#8A6A08" opacity=".5"/>
    <circle cx="157" cy="184" r="3.2" fill={C.gold}/>
    <path d="M149 189 L165 189 L157 212 Z" fill={C.gold}/>
    <path d="M152 191 L162 191 L157 205 Z" fill="#8A6A08" opacity=".5"/>
  </svg>);
};

// ═══════════════════════════════════════════════════════════════
// DET. RAY RAMIREZ — Metro-Dade. Wide face, heavy jaw, hairline in
// retreat, a sport coat last fashionable under Carter.
// ═══════════════════════════════════════════════════════════════
const RamirezP=({mood="neutral"})=>{
  const M=MD(mood);
  const skin="#C08A5E", shade="#96663F", deep="#734829", warm="#DFAF7E";
  const hair="#221A13", grey="#7C736A";
  const eY=149, bY=131+M.brow, mY=196, lift=rn(M.asym*.5);
  const worn=rn(.28+M.tense*.42);
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <PBack glow="#00E5FF" base="#050A12" tilt={6}/>

    {/* neck — thick, collar-strained */}
    <path d="M98 190 L98 240 Q120 252 142 240 L142 190 Z" fill={shade}/>
    <path d="M92 198 Q120 224 148 198 L148 216 Q120 240 92 216 Z" fill={deep} opacity=".55"/>

    {/* jacket — tan poly-blend, gone shiny at the shoulder */}
    <path d="M6 320 C14 272 46 248 86 239 L120 262 L154 239 C194 248 226 272 234 320 Z" fill="#8E7A55"/>
    <path d="M6 320 C14 272 46 248 86 239 L98 320 Z" fill="#6F5E3F"/>
    <path d="M234 320 C226 272 194 248 154 239 L142 320 Z" fill="#6F5E3F"/>
    <path d="M96 240 L120 300 L144 240 L134 236 L120 276 L106 236 Z" fill="#C7DCE8"/>
    <path d="M104 238 Q120 262 136 238 L136 231 Q120 256 104 231 Z" fill={skin}/>
    <path d="M96 240 L120 300 L108 320 L72 320 Z" fill="#9C8760"/>
    <path d="M144 240 L120 300 L132 320 L168 320 Z" fill="#9C8760"/>
    {/* maroon knit tie, pulled loose, knot off-centre */}
    <path d="M112 256 L128 256 L132 267 L124 271 L129 320 L111 320 L117 271 L109 267 Z" fill="#6B2334"/>
    <path d="M117 276 L127 276 M117 288 L128 288 M116 300 L128 300" stroke="#4C1624" strokeWidth="2"/>
    {/* shoulder holster strap */}
    <path d="M152 244 L178 320 L160 320 L138 254 Z" fill="#3A2A1C"/>
    <path d="M152 244 L178 320" fill="none" stroke="#22180F" strokeWidth="2" opacity=".7"/>
    {/* the shield, clipped where he can reach it */}
    <path d="M54 276 L74 276 L74 294 Q64 305 54 294 Z" fill="#C9A227"/>
    <path d="M58 280 L70 280 L70 292 Q64 298 58 292 Z" fill="none" stroke="#7B5D0E" strokeWidth="1.6"/>
    <circle cx="64" cy="286" r="2.8" fill="#7B5D0E"/>

    {/* ears */}
    <ellipse cx="70" cy="158" rx="7" ry="11" fill={shade}/>
    <ellipse cx="170" cy="158" rx="7" ry="11" fill={shade}/>

    {/* head — wide, heavy jaw, short chin */}
    <path d="M120 88 C89 88 71 108 70 137 C69 160 76 184 89 200 C99 213 109 221 120 221 C131 221 141 213 151 200 C164 184 171 160 170 137 C169 108 151 88 120 88 Z" fill={skin}/>
    <path d="M142 94 C160 105 170 120 170 137 C171 160 164 184 151 200 C141 213 131 221 120 221"
      fill="none" stroke={shade} strokeWidth="16" opacity=".38" strokeLinecap="round"/>
    <path d="M98 92 C82 103 71 120 70 139 C69 160 76 184 87 199"
      fill="none" stroke="#8CEEFF" strokeWidth="4.6" opacity=".38" strokeLinecap="round"/>
    {/* forehead — lines he did not have in 1979 */}
    <path d="M92 114 Q120 108 149 114" fill="none" stroke={deep} strokeWidth="2.2" opacity={rn(worn*.85)}/>
    <path d="M90 123 Q120 116 151 123" fill="none" stroke={deep} strokeWidth="2" opacity={rn(worn*.6)}/>
    <path d="M114 118 L114 128 M127 118 L127 128" stroke={deep} strokeWidth="2" opacity={rn(M.tense*.9)}/>

    {/* eye bags first, so the lower lid sits on them */}
    <path d="M84 158 Q98 174 114 160 Q99 168 84 158 Z" fill={deep} opacity=".26"/>
    <path d="M156 158 Q142 174 126 160 Q141 168 156 158 Z" fill={deep} opacity=".26"/>
    <Eye x={99} y={eY} rx={12.6} ry={7.2} skin={skin} iris="#3B2612" pupil="#120A04"
      lid={rn(M.lid+.6)} gaze={M.gaze} glint={rn(M.glint*.8)} lashW={2.6}/>
    <Eye x={141} y={eY} rx={12.6} ry={7.2} skin={skin} iris="#3B2612" pupil="#120A04"
      lid={rn(M.lid+.6)} gaze={M.gaze} glint={rn(M.glint*.8)} lashW={2.6}/>
    <path d="M87 160 Q99 168 112 161" fill="none" stroke={deep} strokeWidth="2.2" opacity=".55"/>
    <path d="M153 160 Q141 168 128 161" fill="none" stroke={deep} strokeWidth="2.2" opacity=".55"/>
    <path d="M88 165 Q99 171 111 166" fill="none" stroke={deep} strokeWidth="1.8" opacity=".45"/>
    <path d="M152 165 Q141 171 129 166" fill="none" stroke={deep} strokeWidth="1.8" opacity=".45"/>
    <Blink skin={skin} x1="85" x2="127" dh="21" y="138" w="28" dur="5.1s" kt="0;.90;.925;.95;1"/>

    {/* brows — heavy, greying at the outer third */}
    <path d={browArc(99,bY,16,1.4,M.tilt,-1)} fill="none" stroke={hair} strokeWidth="5.4" strokeLinecap="round"/>
    <path d={browArc(141,rn(bY-M.asym*.7),16,1.4,M.tilt,1)} fill="none" stroke={hair} strokeWidth="5.4" strokeLinecap="round"/>
    <path d="M83 131 L89 130" stroke={grey} strokeWidth="4" strokeLinecap="round" opacity=".65"/>
    <path d="M157 131 L151 130" stroke={grey} strokeWidth="4" strokeLinecap="round" opacity=".65"/>

    {/* nose — broad, broken once */}
    <path d="M117 155 Q112 175 107 181 Q120 189 133 181" fill="none" stroke={deep} strokeWidth="2.8" strokeLinecap="round" opacity=".75"/>
    <path d="M122 154 Q126 168 129 178" fill="none" stroke={warm} strokeWidth="3" opacity=".35"/>
    <ellipse cx="108" cy="182" rx="4" ry="2.5" fill={deep} opacity=".48"/>
    <ellipse cx="132" cy="182" rx="4" ry="2.5" fill={deep} opacity=".48"/>
    <path d="M119 160 L124 165" fill="none" stroke={deep} strokeWidth="2" opacity=".45"/>

    {/* nasolabial — permanent, deepens under pressure */}
    <path d="M102 182 Q95 196 100 208" fill="none" stroke={deep} strokeWidth="2.4" opacity={rn(.3+M.tense*.45)}/>
    <path d="M138 182 Q145 196 140 208" fill="none" stroke={deep} strokeWidth="2.4" opacity={rn(.3+M.tense*.45)}/>

    {/* mouth, then the moustache over it */}
    {M.open>1&&<path d={lipOpen(120,mY,14,M.curve,M.open,lift)} fill="#3B140C"/>}
    <path d={lipsShape(120,mY,15.5,M.curve,lift,2.8,3.2)} fill="#96563E"/>
    <path d={lipLine(120,mY,15,M.curve,lift)} fill="none" stroke="#4E2415" strokeWidth="2.4" strokeLinecap="round" opacity=".85"/>
    <path d="M100 184 Q110 179 120 180 Q130 179 140 184 Q144 190 137 191 Q128 187 120 187 Q112 187 103 191 Q96 190 100 184 Z" fill={hair}/>
    <path d="M103 185 Q111 182 120 183 Q129 182 137 185" fill="none" stroke="#4A3C31" strokeWidth="1.5" opacity=".75"/>
    <path d="M134 185 Q140 187 142 190" fill="none" stroke={grey} strokeWidth="1.8" opacity=".55"/>
    {/* 6pm on a double shift */}
    <path d="M86 188 C89 208 100 220 120 221 C140 220 151 208 154 188 C153 210 141 227 120 228 C99 227 87 210 86 188 Z" fill={hair} opacity=".18"/>
    <ellipse cx="120" cy="211" rx="32" ry="14" fill={hair} opacity=".14"/>

    {/* hair — receding, grey at the temples, combed with the hand */}
    <path d="M120 82 C93 82 78 96 75 118 C74 128 75 136 77 142 C80 124 88 112 101 106 C111 102 116 102 120 102 C124 102 129 102 139 106 C152 112 160 124 163 142 C165 136 166 128 165 118 C162 96 147 82 120 82 Z" fill={hair}/>
    <path d="M120 86 C105 86 94 92 88 103 C100 96 110 95 120 96 C130 95 140 96 152 103 C146 92 135 86 120 86 Z" fill="#33291F"/>
    <path d="M87 101 C95 92 106 88 119 88" fill="none" stroke="#453A2E" strokeWidth="2.6" opacity=".65"/>
    <path d="M75 118 C76 128 76 136 78 142 C80 130 82 122 87 114 Z" fill={grey} opacity=".45"/>
    <path d="M165 118 C164 128 164 136 162 142 C160 130 158 122 153 114 Z" fill={grey} opacity=".45"/>
    {/* sideburns, a decade out of date, and he knows */}
    <path d="M76 136 L84 136 L83 160 L77 155 Z" fill={hair}/>
    <path d="M164 136 L156 136 L157 160 L163 155 Z" fill={hair}/>
    <path d="M78 142 L83 142 M78 149 L83 149" stroke={grey} strokeWidth="2" opacity=".45"/>
    <path d="M162 142 L157 142 M162 149 L157 149" stroke={grey} strokeWidth="2" opacity=".45"/>
  </svg>);
};

// ═══════════════════════════════════════════════════════════════
// EL COLOMBIANO — no name. Narrow, still, bone linen over black silk,
// and the patience of a man who has never had to raise his voice.
// ═══════════════════════════════════════════════════════════════
const ColombianoP=({mood="neutral"})=>{
  const M=MD(mood);
  const skin="#C08F66", shade="#946741", deep="#6E4529", warm="#E0B287";
  const hair="#0F0D0B", silver="#B4ADA4";
  const eY=147, bY=130+M.brow, mY=194, lift=rn(M.asym*.45);
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <PBack glow="#FF6B35" base="#0B0705" tilt={-4}/>

    {/* neck — long, tendon showing */}
    <path d="M105 192 L105 238 Q120 250 135 238 L135 192 Z" fill={shade}/>
    <path d="M100 200 Q120 224 140 200 L140 216 Q120 238 100 216 Z" fill={deep} opacity=".5"/>
    <path d="M111 216 L108 240" fill="none" stroke={deep} strokeWidth="2" opacity=".45"/>

    {/* bone linen over black silk */}
    <path d="M10 320 C18 270 50 246 88 238 L120 258 L152 238 C190 246 222 270 230 320 Z" fill="#DCD2B6"/>
    <path d="M10 320 C18 270 50 246 88 238 L100 320 Z" fill="#BFB394"/>
    <path d="M230 320 C222 270 190 246 152 238 L140 320 Z" fill="#BFB394"/>
    <path d="M96 239 L120 302 L144 239 L134 235 L120 278 L106 235 Z" fill="#0F0D0B"/>
    <path d="M96 239 L120 302 L108 320 L74 320 Z" fill="#E9E1C8"/>
    <path d="M144 239 L120 302 L132 320 L166 320 Z" fill="#E9E1C8"/>
    <path d="M104 237 Q120 258 136 237 L136 231 Q120 252 104 231 Z" fill={skin}/>
    <path d="M102 244 Q120 274 138 244" fill="none" stroke={C.gold} strokeWidth="4"/>
    <path d="M104 248 Q120 274 136 248" fill="none" stroke="#8F7208" strokeWidth="1.6" opacity=".65"/>
    {/* folded sunglasses hooked in the placket */}
    <path d="M148 262 L163 255 L165 261 L150 268 Z" fill="#1A1714"/>
    <path d="M150 268 L154 282" fill="none" stroke="#1A1714" strokeWidth="3" strokeLinecap="round"/>
    <path d="M151 260 L161 256" fill="none" stroke="#66625A" strokeWidth="1.4" opacity=".8"/>
    <circle cx="158" cy="298" r="3" fill="#B6A97E"/>
    <circle cx="163" cy="284" r="3" fill="#B6A97E"/>

    {/* ears, close to the skull */}
    <ellipse cx="80" cy="156" rx="5.5" ry="10" fill={shade}/>
    <ellipse cx="160" cy="156" rx="5.5" ry="10" fill={shade}/>

    {/* head — narrow, long, carved. tall forehead */}
    <path d="M120 84 C99 84 85 104 84 133 C83 158 89 184 98 200 C106 214 113 224 120 224 C127 224 134 214 142 200 C151 184 157 158 156 133 C155 104 141 84 120 84 Z" fill={skin}/>
    <path d="M138 90 C151 101 156 117 156 133 C157 158 151 184 142 200 C134 214 127 224 120 224"
      fill="none" stroke={shade} strokeWidth="13" opacity=".45" strokeLinecap="round"/>
    <path d="M102 88 C90 99 85 116 84 135 C83 158 89 184 97 199"
      fill="none" stroke="#FFB37F" strokeWidth="4.2" opacity=".45" strokeLinecap="round"/>
    {/* the cheekbone is the thing you notice first */}
    <path d="M92 158 C89 176 94 194 103 206" fill="none" stroke={deep} strokeWidth="9" opacity=".3"/>
    <path d="M148 158 C151 176 146 194 137 206" fill="none" stroke={deep} strokeWidth="9" opacity=".3"/>
    <path d="M90 150 Q101 158 110 154" fill="none" stroke={warm} strokeWidth="4" opacity=".3"/>
    <path d="M150 150 Q139 158 130 154" fill="none" stroke={warm} strokeWidth="4" opacity=".22"/>
    {/* deep-set: brow-ridge shadow */}
    <path d="M89 138 Q102 132 114 139 Q101 138 91 145 Z" fill={deep} opacity=".42"/>
    <path d="M151 138 Q138 132 126 139 Q139 138 149 145 Z" fill={deep} opacity=".42"/>

    <Eye x={102} y={eY} rx={12} ry={6.8} skin={skin} iris="#241708" pupil="#080503"
      lid={rn(M.lid+1)} gaze={M.gaze} glint={rn(M.glint*.55)} lashW={3}/>
    <Eye x={138} y={eY} rx={12} ry={6.8} skin={skin} iris="#241708" pupil="#080503"
      lid={rn(M.lid+1)} gaze={M.gaze} glint={rn(M.glint*.55)} lashW={3}/>
    <path d="M91 157 Q102 163 112 158" fill="none" stroke={deep} strokeWidth="2" opacity=".5"/>
    <path d="M149 157 Q138 163 128 158" fill="none" stroke={deep} strokeWidth="2" opacity=".5"/>
    {/* he blinks about half as often as anyone you have met */}
    <Blink skin={skin} x1="89" x2="125" dh="19" y="137" w="26" dur="11.5s" kt="0;.965;.978;.99;1"/>

    {/* brows — flat, low, almost no arch */}
    <path d={browArc(102,bY,15,.7,M.tilt,-1)} fill="none" stroke={hair} strokeWidth="4.8" strokeLinecap="round"/>
    <path d={browArc(138,rn(bY-M.asym*.4),15,.7,M.tilt,1)} fill="none" stroke={hair} strokeWidth="4.8" strokeLinecap="round"/>
    {/* an old scar splits the right brow. nobody asks */}
    <path d="M143 123 L149 139" fill="none" stroke="#9A5E48" strokeWidth="2.2" strokeLinecap="round"/>

    {/* nose — long, thin bridge, slight hook */}
    <path d="M119 151 Q117 174 112 181 Q120 187 128 181" fill="none" stroke={deep} strokeWidth="2.3" strokeLinecap="round" opacity=".72"/>
    <path d="M121 149 Q124 166 126 178" fill="none" stroke={warm} strokeWidth="2.8" opacity=".35"/>
    <ellipse cx="112" cy="182" rx="3" ry="2" fill={deep} opacity=".45"/>
    <ellipse cx="128" cy="182" rx="3" ry="2" fill={deep} opacity=".45"/>

    {/* mouth — thin, unhurried, bracketed by two deep lines */}
    {M.open>1&&<path d={lipOpen(120,mY,13.5,M.curve,M.open,lift)} fill="#2E0F08"/>}
    <path d={lipsShape(120,mY,15.5,M.curve,lift,2.6,2.6)} fill="#92583D"/>
    <path d={lipLine(120,mY,15,M.curve,lift)} fill="none" stroke="#38160C" strokeWidth="3" strokeLinecap="round"/>
    <path d="M104 180 Q98 195 103 208" fill="none" stroke={deep} strokeWidth="2.4" opacity={rn(.4+M.tense*.4)}/>
    <path d="M136 180 Q142 195 137 208" fill="none" stroke={deep} strokeWidth="2.4" opacity={rn(.4+M.tense*.4)}/>

    {/* hair — black, combed straight back, still wet. silver only at the temple */}
    <path d="M120 68 C94 68 81 86 80 116 C79 128 81 138 84 146 C86 126 92 112 104 105 C112 100 117 99 120 99 C123 99 128 100 136 105 C148 112 154 126 156 146 C159 138 161 128 160 116 C159 86 146 68 120 68 Z" fill={hair}/>
    <path d="M120 68 C106 68 94 76 89 88 C101 79 111 78 120 79 C129 78 139 79 151 88 C146 76 134 68 120 68 Z" fill="#241F1A"/>
    <path d="M86 112 L154 112" stroke="#35322B" strokeWidth="1.8" opacity=".7"/>
    <path d="M84 100 L156 100" stroke="#35322B" strokeWidth="1.8" opacity=".55"/>
    <path d="M86 88 L154 88" stroke="#35322B" strokeWidth="1.6" opacity=".4"/>
    <path d="M80 116 C81 129 82 138 85 146 C86 132 88 122 92 115 Z" fill={silver} opacity=".42"/>
    <path d="M160 116 C159 129 158 138 155 146 C154 132 152 122 148 115 Z" fill={silver} opacity=".24"/>
    <path d="M83 124 L91 120" stroke={silver} strokeWidth="2" opacity=".4"/>
    <path d="M157 124 L149 120" stroke={silver} strokeWidth="2" opacity=".2"/>
  </svg>);
};

// ═══════════════════════════════════════════════════════════════
// NESTOR VARGAS — the player. Act I got off a bus. Act III sits the
// way El Colombiano sits. The face does the arc.
// ═══════════════════════════════════════════════════════════════
const NestorP=({mood="neutral",act=1})=>{
  const M=MD(mood);
  const a=CL(Math.round(+act)||1,1,3);
  const skin="#C99062", shade="#9E6840", deep="#754828", warm="#E3B285";
  const hair="#191109", greyT="#9A9088";
  const lidAdd=[-.6,.2,.9][a-1];
  const wear=[0,.45,1][a-1];
  const eY=148, bY=[131,130,129][a-1]+M.brow, mY=195, lift=rn(M.asym*.5);
  const facePath=a===3
    ? "M120 90 C98 90 84 109 83 135 C82 158 88 183 97 199 C105 213 113 222 120 222 C127 222 135 213 143 199 C152 183 158 158 157 135 C156 109 142 90 120 90 Z"
    : "M120 92 C96 92 81 111 80 137 C79 159 86 183 95 198 C104 212 112 220 120 220 C128 220 136 212 145 198 C154 183 161 159 160 137 C159 111 144 92 120 92 Z";
  const jacket=[["#79858E","#5B656C"],["#C6D6E2","#A2B4C3"],["#E2D8B4","#BCB18E"]][a-1];
  const under=[["#E8E4DC","#C7C2B8"],["#4FB9A2","#38897B"],["#100E0C","#050403"]][a-1];
  const eyeW=a===3?12.2:12.8, eyeH=a===1?7.8:7.2;
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <PBack glow={a===3?"#FF8A2E":"#FFD700"} base={a===3?"#0A0705":"#07070F"} tilt={a===3?-4:5}/>

    {/* neck */}
    <path d="M102 190 L102 238 Q120 250 138 238 L138 190 Z" fill={shade}/>
    <path d="M96 198 Q120 224 144 198 L144 213 Q120 235 96 213 Z" fill={deep} opacity=".5"/>

    {/* torso — thrift cotton, then linen, then the other man's silhouette */}
    <path d="M10 320 C18 270 50 246 88 238 L120 258 L152 238 C190 246 222 270 230 320 Z" fill={jacket[0]}/>
    <path d="M10 320 C18 270 50 246 88 238 L100 320 Z" fill={jacket[1]}/>
    <path d="M230 320 C222 270 190 246 152 238 L140 320 Z" fill={jacket[1]}/>
    <path d="M96 239 L120 300 L144 239 L134 235 L120 276 L106 235 Z" fill={under[0]}/>
    {a>1&&<path d="M104 262 L120 300 L136 262 L138 320 L102 320 Z" fill={under[1]} opacity=".9"/>}
    <path d="M96 239 L120 300 L108 320 L74 320 Z" fill={jacket[0]}/>
    <path d="M144 239 L120 300 L132 320 L166 320 Z" fill={jacket[0]}/>
    <path d="M104 237 Q120 258 136 237 L136 231 Q120 252 104 231 Z" fill={skin}/>
    {/* act I: the funeral card still in the shirt pocket */}
    {a===1&&<>
      <path d="M54 278 L80 271 L85 294 L59 301 Z" fill="#68737B"/>
      <path d="M60 274 L78 269 L81 278 L63 283 Z" fill="#E8E2D2"/>
    </>}
    {a>=2&&<path d="M104 246 Q120 272 136 246" fill="none" stroke={C.gold} strokeWidth={a===3?4:2.4}/>}
    {a===3&&<path d="M106 250 Q120 272 134 250" fill="none" stroke="#8F7208" strokeWidth="1.6" opacity=".65"/>}

    {/* ears */}
    <ellipse cx={a===3?83:80} cy="158" rx="6" ry="10.5" fill={shade}/>
    <ellipse cx={a===3?157:160} cy="158" rx="6" ry="10.5" fill={shade}/>

    {/* head */}
    <path d={facePath} fill={skin}/>
    <path d={a===3?"M139 96 C152 107 157 121 157 135 C158 158 152 183 143 199 C135 213 127 222 120 222":"M141 98 C155 109 160 123 160 137 C161 159 154 183 145 198 C136 212 128 220 120 220"}
      fill="none" stroke={shade} strokeWidth="14" opacity={rn(.32+wear*.14)} strokeLinecap="round"/>
    <path d={a===3?"M101 94 C90 105 84 121 83 137 C82 158 88 183 96 198":"M99 96 C87 107 81 123 80 139 C79 159 86 183 94 197"}
      fill="none" stroke={a===3?"#FFB273":"#FFE79A"} strokeWidth="4.4" opacity=".42" strokeLinecap="round"/>
    {/* the cheeks hollow out as he learns */}
    <path d="M92 158 C89 176 94 193 102 204" fill="none" stroke={deep} strokeWidth="8" opacity={rn(.06+wear*.26)}/>
    <path d="M148 158 C151 176 146 193 138 204" fill="none" stroke={deep} strokeWidth="8" opacity={rn(.06+wear*.26)}/>
    <path d="M97 116 Q120 111 144 116" fill="none" stroke={deep} strokeWidth="2.2" opacity={rn(wear*.5)}/>

    {/* eyes — wide in Act I, hooded by Act III */}
    <path d="M86 159 Q100 171 114 160 Q101 166 86 159 Z" fill={deep} opacity={rn(wear*.36)}/>
    <path d="M154 159 Q140 171 126 160 Q139 166 154 159 Z" fill={deep} opacity={rn(wear*.36)}/>
    <Eye x={101} y={eY} rx={eyeW} ry={eyeH} skin={skin} iris="#3E2712" pupil="#0F0803"
      lid={rn(M.lid+lidAdd)} gaze={M.gaze} glint={rn(M.glint*(a===3?.6:1))} lashW={2.6}/>
    <Eye x={139} y={eY} rx={eyeW} ry={eyeH} skin={skin} iris="#3E2712" pupil="#0F0803"
      lid={rn(M.lid+lidAdd)} gaze={M.gaze} glint={rn(M.glint*(a===3?.6:1))} lashW={2.6}/>
    <path d="M89 158 Q101 165 112 159" fill="none" stroke={deep} strokeWidth="2" opacity={rn(.16+wear*.46)}/>
    <path d="M151 158 Q139 165 128 159" fill="none" stroke={deep} strokeWidth="2" opacity={rn(.16+wear*.46)}/>
    <Blink skin={skin} x1="88" x2="126" dh="21" y="137" w="27"
      dur={a===3?"9.2s":a===2?"6.8s":"4.6s"} kt="0;.93;.952;.975;1"/>

    {/* brows */}
    <path d={browArc(101,bY,15,a===1?1.8:1.1,M.tilt,-1)} fill="none" stroke={hair} strokeWidth={a===1?4.4:5} strokeLinecap="round"/>
    <path d={browArc(139,rn(bY-M.asym*.6),15,a===1?1.8:1.1,M.tilt,1)} fill="none" stroke={hair} strokeWidth={a===1?4.4:5} strokeLinecap="round"/>
    {a===3&&<path d="M92 124 L98 137" fill="none" stroke="#9A5E48" strokeWidth="2.2" strokeLinecap="round"/>}

    {/* nose */}
    <path d="M118 153 Q114 172 110 179 Q120 186 130 179" fill="none" stroke={deep} strokeWidth="2.5" strokeLinecap="round" opacity=".72"/>
    <path d="M122 151 Q125 166 128 177" fill="none" stroke={warm} strokeWidth="2.8" opacity=".35"/>
    <ellipse cx="110" cy="180" rx="3.4" ry="2.2" fill={deep} opacity=".44"/>
    <ellipse cx="130" cy="180" rx="3.4" ry="2.2" fill={deep} opacity=".44"/>

    {/* mouth */}
    {M.open>1&&<path d={lipOpen(120,mY,14,M.curve,M.open,lift)} fill="#361208"/>}
    <path d={lipsShape(120,mY,16,M.curve,lift,3.2,3.2)} fill="#95573C"/>
    <path d={lipLine(120,mY,15,M.curve,lift)} fill="none" stroke="#48200F" strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M104 180 Q98 194 103 206" fill="none" stroke={deep} strokeWidth="2.2" opacity={rn(.08+wear*.3+M.tense*.28)}/>
    <path d="M136 180 Q142 194 137 206" fill="none" stroke={deep} strokeWidth="2.2" opacity={rn(.08+wear*.3+M.tense*.28)}/>

    {/* stubble — none, then two days, then a decision */}
    {a>1&&<>
      <path d="M87 186 C90 208 100 221 120 222 C140 221 150 208 153 186 C152 210 140 228 120 229 C100 228 88 210 87 186 Z" fill={hair} opacity={rn(wear*.28)}/>
      <path d="M103 198 Q120 208 137 198 Q136 216 120 220 Q104 216 103 198 Z" fill={hair} opacity={rn(wear*.38)}/>
      <path d="M104 188 Q120 183 136 188 Q136 194 120 192 Q104 194 104 188 Z" fill={hair} opacity={rn(wear*.34)}/>
    </>}

    {/* hair — three cuts */}
    {a===1&&<>
      <path d="M120 84 C95 84 80 100 79 126 C78 135 80 143 82 149 C84 130 91 116 103 108 C112 103 116 102 120 102 C124 102 128 103 137 108 C149 116 156 130 158 149 C160 143 162 135 161 126 C160 100 145 84 120 84 Z" fill={hair}/>
      <path d="M120 87 C104 87 92 94 87 106 C99 98 108 102 118 98 C128 94 141 100 152 107 C148 94 136 87 120 87 Z" fill="#2C1F14"/>
      <path d="M88 104 C96 93 108 87 121 87" fill="none" stroke="#43301F" strokeWidth="2.6" opacity=".6"/>
      <path d="M126 88 C136 90 145 97 151 106" fill="none" stroke="#43301F" strokeWidth="2.4" opacity=".4"/>
    </>}
    {a===2&&<>
      <path d="M120 78 C94 78 79 96 79 122 C79 132 81 141 83 148 C85 127 91 113 103 105 C112 99 117 98 120 98 C123 98 129 99 138 105 C150 113 156 127 158 148 C160 141 162 132 162 122 C162 96 146 78 120 78 Z" fill={hair}/>
      <path d="M120 80 C101 80 88 90 84 105 C97 93 108 92 120 94 C132 92 144 93 157 105 C153 90 139 80 120 80 Z" fill="#302317"/>
      <path d="M86 102 C96 88 109 81 123 81" fill="none" stroke="#453224" strokeWidth="3" opacity=".65"/>
      <path d="M94 91 C106 82 119 78 131 80" fill="none" stroke="#3A2A1D" strokeWidth="3" opacity=".5"/>
      <path d="M80 130 L88 126 M160 130 L152 126" stroke="#241A11" strokeWidth="3.4" strokeLinecap="round"/>
    </>}
    {a===3&&<>
      <path d="M120 76 C97 76 84 92 83 118 C82 128 84 137 86 144 C88 125 93 112 104 104 C112 99 117 98 120 98 C123 98 128 99 136 104 C147 112 152 125 154 144 C156 137 158 128 157 118 C156 92 143 76 120 76 Z" fill={hair}/>
      <path d="M120 76 C108 76 97 82 92 92 C103 84 112 83 120 84 C128 83 137 84 148 92 C143 82 132 76 120 76 Z" fill="#241C14"/>
      <path d="M89 110 L151 110" stroke="#2E2820" strokeWidth="1.6" opacity=".7"/>
      <path d="M87 100 L153 100" stroke="#2E2820" strokeWidth="1.6" opacity=".55"/>
      <path d="M90 91 L150 91" stroke="#2E2820" strokeWidth="1.4" opacity=".4"/>
      <path d="M83 116 C84 128 85 136 87 143 C88 130 91 120 95 113 Z" fill={greyT} opacity=".4"/>
    </>}
  </svg>);
};

const TiburonP=()=>{
  const skin="#B5793F";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <Face skin={skin}/>
    <path d="M120 88 C84 88 72 110 74 126 C90 102 104 98 120 98 C136 98 150 102 166 126 C168 110 156 88 120 88 Z" fill="#0C0A07"/>
    <path d="M38 320 C46 264 80 246 120 246 C160 246 194 264 202 320 Z" fill="#0E5E52"/>
    <path d="M96 246 L120 276 L144 246 L134 242 L120 262 L106 242 Z" fill={skin}/>
    <g opacity=".85">
      <path d="M62 286 q8 -14 18 0 q-10 12 -18 0" fill={C.flamingo}/>
      <path d="M150 300 q8 -14 18 0 q-10 12 -18 0" fill={C.orange}/>
      <path d="M86 312 q7 -12 15 0 q-8 10 -15 0" fill={C.gold}/>
      <path d="M168 270 q7 -12 15 0 q-8 10 -15 0" fill={C.blue}/>
    </g>
    <path d="M102 254 Q120 272 138 254" fill="none" stroke={C.gold} strokeWidth="4"/>
    <circle cx="120" cy="268" r="5" fill={C.gold}/>
    <rect x="86" y="134" width="28" height="16" rx="7" fill="#0A0805"/>
    <rect x="126" y="134" width="28" height="16" rx="7" fill="#0A0805"/>
    <path d="M114 140 L126 140" stroke="#0A0805" strokeWidth="3"/>
    <path d="M90 138 L100 144" stroke="#fff" strokeWidth="1.4" opacity=".5"/>
    <path d="M96 182 Q120 204 144 182 Q120 192 96 182 Z" fill="#fff"/>
    <rect x="126" y="184" width="7" height="8" fill={C.gold}/>
    <path d="M96 182 Q120 204 144 182" stroke="#5E2C18" strokeWidth="2.5" fill="none"/>
    <path d="M118 152 Q114 168 111 171 Q119 176 127 172" stroke="#8A5526" strokeWidth="2.4" fill="none"/>
    <path d="M88 128 L110 126 M152 128 L130 126" stroke="#0C0A07" strokeWidth="4" strokeLinecap="round"/>
  </svg>);
};

const CassP=({mood="neutral"})=>{
  const skin="#E5B68C";
  const mouth={pleased:"M104 184 Q120 193 136 184",nervous:"M106 188 Q120 184 134 189"}[mood]||"M104 186 Q120 189 136 186";
  const browL=mood==="nervous"?"M90 130 Q100 125 112 129":"M90 128 L112 127";
  const browR=mood==="nervous"?"M150 130 Q140 125 128 129":"M150 128 L128 127";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <path d="M120 62 C66 62 56 116 62 162 C64 186 60 206 70 216 L86 206 C78 184 78 152 86 132 L154 132 C162 152 162 184 154 206 L170 216 C180 206 176 186 178 162 C184 116 174 62 120 62 Z" fill="#D8A93F"/>
    <path d="M62 150 C58 170 60 196 70 214 C66 192 66 168 72 150 Z" fill="#C2932F"/>
    <path d="M178 150 C182 170 180 196 170 214 C174 192 174 168 168 150 Z" fill="#C2932F"/>
    <Face skin={skin}/>
    <path d="M120 66 C76 66 66 110 72 134 C82 104 92 96 124 96 C150 98 160 112 168 134 C174 110 164 66 120 66 Z" fill="#E5BA52"/>
    <path d="M72 110 C84 92 104 88 132 92 L120 104 C100 100 84 102 72 110 Z" fill="#F0CB6E"/>
    <circle cx="74" cy="192" r="4.5" fill="#F2EFE6"/><circle cx="166" cy="192" r="4.5" fill="#F2EFE6"/>
    <path d="M30 320 C38 262 76 244 120 244 C164 244 202 262 210 320 Z" fill="#16204A"/>
    <path d="M30 320 C34 280 44 260 64 250 L80 320 Z" fill="#0F1738"/>
    <path d="M210 320 C206 280 196 260 176 250 L160 320 Z" fill="#0F1738"/>
    <path d="M96 246 L120 282 L144 246 L134 242 L120 264 L106 242 Z" fill="#E8C25A"/>
    <path d="M96 246 L120 282 L100 320 L84 320 Z" fill="#1B2858"/>
    <path d="M144 246 L120 282 L140 320 L156 320 Z" fill="#1B2858"/>
    <circle cx="120" cy="294" r="3.4" fill={C.gold}/>
    <circle cx="100" cy="143" r="13" fill="none" stroke={C.gold} strokeWidth="2.2"/>
    <circle cx="140" cy="143" r="13" fill="none" stroke={C.gold} strokeWidth="2.2"/>
    <path d="M113 142 L127 142" stroke={C.gold} strokeWidth="2"/>
    <path d="M87 140 L78 136 M153 140 L162 136" stroke={C.gold} strokeWidth="2"/>
    <ellipse cx="100" cy="143" rx="8" ry="4.6" fill="#fff"/>
    <ellipse cx="140" cy="143" rx="8" ry="4.6" fill="#fff"/>
    <circle cx="101" cy="143.6" r="3" fill="#3A5A2E"/>
    <circle cx="141" cy="143.6" r="3" fill="#3A5A2E"/>
    <path d="M92 138 L106 144 M148 138 L134 144" stroke="#fff" strokeWidth="1" opacity=".45"/>
    <path d={browL} stroke="#A87E20" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
    <path d={browR} stroke="#A87E20" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
    <path d="M118 152 Q115 166 112 169 Q118 173 125 170" stroke="#C08A5A" strokeWidth="2" fill="none"/>
    <path d={mouth} stroke="#B3263F" strokeWidth="5.4" fill="none" strokeLinecap="round"/>
  </svg>);
};
// ── NARRATOR CARD — used by speaker:"narrator" storylets (the bus station, the parking lot) ──
const NarratorP=({mood="neutral"})=>{
  const band=mood==="cold"?"#2A3550":mood==="pleased"?"#7A2A50":"#5C1E48";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <defs>
      <linearGradient id="narSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#140A30"/><stop offset="58%" stopColor={band}/><stop offset="100%" stopColor="#C4531F"/>
      </linearGradient>
    </defs>
    <rect width="240" height="320" fill="#070C16"/>
    <rect x="22" y="26" width="196" height="156" fill="url(#narSky)"/>
    {/* skyline through the terminal glass */}
    <g fill="#0A101E">
      <rect x="22" y="122" width="26" height="60"/><rect x="52" y="102" width="20" height="80"/>
      <rect x="76" y="132" width="30" height="50"/><rect x="110" y="96" width="18" height="86"/>
      <rect x="132" y="118" width="26" height="64"/><rect x="162" y="106" width="22" height="76"/>
      <rect x="188" y="128" width="30" height="54"/>
    </g>
    <g fill="#FFD76B" opacity=".75">
      <rect x="57" y="112" width="4" height="5"/><rect x="64" y="126" width="4" height="5"/>
      <rect x="115" y="106" width="4" height="5"/><rect x="120" y="130" width="4" height="5"/>
      <rect x="167" y="118" width="4" height="5"/><rect x="196" y="140" width="4" height="5"/>
      <rect x="86" y="146" width="4" height="5"/><rect x="140" y="150" width="4" height="5"/>
    </g>
    {/* window frame + mullion */}
    <rect x="22" y="26" width="196" height="156" fill="none" stroke="#111C2E" strokeWidth="5"/>
    <line x1="120" y1="26" x2="120" y2="182" stroke="#111C2E" strokeWidth="5"/>
    <rect x="0" y="180" width="240" height="140" fill="#070C16"/>
    {/* the man, from behind, with the duffel and the card */}
    <ellipse cx="108" cy="200" rx="27" ry="31" fill="#03060C"/>
    <path d="M52 320 C55 250 78 226 108 226 C138 226 161 250 164 320 Z" fill="#03060C"/>
    <rect x="160" y="266" width="58" height="32" rx="14" fill="#0A121F" stroke="#18283C" strokeWidth="2"/>
    <path d="M174 266 Q189 251 204 266" fill="none" stroke="#18283C" strokeWidth="3"/>
    <g transform="rotate(-9 46 268)">
      <rect x="30" y="248" width="32" height="40" rx="2" fill="#E6DDCA"/>
      <line x1="36" y1="258" x2="56" y2="258" stroke="#8A8070" strokeWidth="1.6"/>
      <line x1="36" y1="266" x2="56" y2="266" stroke="#8A8070" strokeWidth="1.6"/>
      <line x1="36" y1="274" x2="49" y2="274" stroke="#C24A3A" strokeWidth="2"/>
    </g>
  </svg>);
};

const PORTRAITS={ maria:MariaP, ramirez:RamirezP, colombiano:ColombianoP, nestor:NestorP, tiburon:TiburonP, cass:CassP, narrator:NarratorP };

// ── 5-layer neon-noir frame (from the portrait pipeline doc) ──
// ── neon-noir frame — scales from the 88px empire-tab chip to a 300px+
//    ending plate without changing its look ──
const NPCFrame=({who,mood="neutral",w=160,showName=true,act=1,label,sub})=>{
  const npc=NPCS[who]||NPCS.nestor, P=PORTRAITS[who]||PORTRAITS.nestor;
  const s=CL(w/160,.62,2.4);
  const slat=rn(9*s), gap=rn(24*s);
  return(
    <div style={{position:"relative",width:w,aspectRatio:"3/4",borderRadius:rn(10*s),overflow:"hidden",flexShrink:0,
      border:`${Math.max(1,rn(s))}px solid rgba(${npc.glow},.45)`,
      background:"linear-gradient(165deg,#101a2e 0%,#070d18 100%)",
      boxShadow:`0 0 ${rn(22*s)}px rgba(${npc.glow},.32), 0 0 ${rn(60*s)}px rgba(${npc.glow},.12)`}}>
      {/* layer 1: the art, breathing */}
      <div style={{position:"absolute",inset:"-2%",filter:"contrast(1.16) saturate(1.3) brightness(1.03)",
        animation:"portraitBreath 7.5s ease-in-out infinite"}}><P mood={mood} act={act}/></div>
      {/* layer 2: venetian-blind slats across the art */}
      <div style={{position:"absolute",inset:0,opacity:.5,
        background:`repeating-linear-gradient(178deg, rgba(${npc.glow},.13) 0px ${slat}px, transparent ${slat}px ${gap}px)`}}/>
      {/* layer 3: signature color gradient */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, rgba(${npc.glow},.14) 0%, transparent 35%, rgba(2,8,16,.55) 100%)`}}/>
      {/* layer 4: key-light bloom */}
      <div style={{position:"absolute",inset:0,mixBlendMode:"screen",
        background:`radial-gradient(ellipse at 22% 18%, rgba(${npc.glow},.16) 0%, transparent 58%)`}}/>
      {/* layer 5: VHS scanlines */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0px 1px, transparent 1px 3px)",animation:"vhsTrack 7s infinite"}}/>
      {/* layer 6: grain */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.08,mixBlendMode:"overlay"}}>
        <filter id={`gr-${who}`}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/></filter>
        <rect width="100%" height="100%" filter={`url(#gr-${who})`}/>
      </svg>
      {/* layer 7: vignette */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 38%, transparent 52%, rgba(0,0,0,.55) 100%)"}}/>
      {showName&&<div style={{position:"absolute",left:0,right:0,bottom:0,padding:`${rn(5*s)}px ${rn(8*s)}px`,
        background:"linear-gradient(0deg, rgba(2,8,16,.92), transparent)"}}>
        <div style={{fontFamily:ft,fontSize:rn(8*s),letterSpacing:rn(2*s),color:`rgba(${npc.glow},1)`,fontWeight:"bold"}}>{label||npc.role}</div>
        <div style={{fontFamily:ft,fontSize:rn(12*s),fontWeight:"bold",color:"#fff",textShadow:`0 0 ${rn(8*s)}px rgba(${npc.glow},.8)`}}>{npc.name}</div>
        {sub&&<div style={{fontFamily:ft,fontSize:rn(7.5*s),letterSpacing:rn(1.2*s),color:"#8FA6BC",marginTop:rn(2*s)}}>{sub}</div>}
      </div>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LIVING MIAMI SKYLINE — reacts to move/heat/district
// ═══════════════════════════════════════════════════════════════
const BUILD1=[[0,46,30],[34,30,52],[68,58,24],[96,38,40],[140,52,30],[174,34,46],[212,60,22],[246,40,38],[290,48,28],[322,36,44],[362,54,26],[392,38,40]];
const BUILD2=[[14,70,18],[60,50,30],[114,80,16],[160,56,26],[210,72,20],[262,52,30],[316,76,18],[358,58,26]];
const MiamiSky=memo(({move,heat,locColor,locIdx=0})=>{
  const night=move%2===1;
  const stops=skyStops(move,heat);
  const siren=heat>60;
  return(
    <div style={{position:"relative",height:118,overflow:"hidden"}}>
      <svg viewBox="0 0 420 118" preserveAspectRatio="xMidYMax slice" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stops[0]}/><stop offset="55%" stopColor={stops[1]}/><stop offset="100%" stopColor={stops[2]}/>
          </linearGradient>
          <linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD76B"/><stop offset="100%" stopColor="#FF4D7E"/>
          </linearGradient>
          <clipPath id="sunClip">
            <path d="M0 0 H64 V20 H0 Z M0 24 H64 V32 H0 Z M0 36 H64 V41 H0 Z M0 44 H64 V47 H0 Z M0 49 H64 V64 H0 Z" transform="translate(-32,-32)"/>
          </clipPath>
        </defs>
        <rect width="420" height="118" fill="url(#sky)"/>
        {night?(<>
          <circle cx="332" cy="30" r="13" fill="#EDEFF5" opacity=".92"/>
          <circle cx="327" cy="26" r="11" fill={stops[1]} opacity=".55"/>
          {[30,80,140,200,255,300,375,400,55,170].map((x,i)=>(
            <circle key={i} cx={x} cy={10+((i*37)%34)} r={i%3===0?1.4:.9} fill="#fff"
              style={{animation:`twinkle ${2+(i%4)}s ease-in-out ${i*.4}s infinite`}}/>))}
        </>):(
          <g transform="translate(330,40)" style={{animation:"sunPulse 4s ease-in-out infinite"}}>
            <circle r="26" fill="url(#sunG)" clipPath="url(#sunClip)"/>
          </g>
        )}
        {!night&&<g style={{animation:"cloudDrift 36s ease-in-out infinite alternate"}}>
          <ellipse cx="86" cy="24" rx="26" ry="6.5" fill="#FFDCC2" opacity=".42"/>
          <ellipse cx="112" cy="20" rx="16" ry="4.5" fill="#FFEAD6" opacity=".34"/>
          <ellipse cx="236" cy="36" rx="30" ry="6" fill="#FFC9AE" opacity=".3"/>
        </g>}
        {/* far skyline */}
        <g fill={night?"#0B1224":"#22102E"} opacity=".85">
          {BUILD2.map(([x,h,w],i)=><rect key={i} x={x} y={96-h} width={w} height={h}/>)}
        </g>
        {/* near skyline + windows */}
        <g>
          {BUILD1.map(([x,h,w],i)=>(<g key={i}>
            <rect x={x} y={100-h} width={w} height={h} fill={night?"#060C1A":"#160A20"}/>
            {Array.from({length:Math.floor(h/9)}).map((_,r)=>
              Array.from({length:Math.floor(w/9)}).map((_,c)=>{
                const lit=((i*7+r*3+c*5+move)%(night?3:6))===0;
                return lit?<rect key={r+"-"+c} x={x+3+c*9} y={104-h+r*9} width="3.4" height="4" fill={night?"#FFD27A":"#FFB36B"} opacity={night?.95:.5}/>:null;
              }))}
          </g>))}
        </g>
        {/* palms */}
        <g fill="#03101C">
          <animateTransform attributeName="transform" type="rotate" values="-1.3 44 100;1.3 44 100;-1.3 44 100" dur="5.5s" repeatCount="indefinite"/>
          <path d="M44 100 q2 -16 0 -26 q10 4 14 -2 q-8 0 -12 -4 q10 -2 12 -8 q-10 2 -14 0 q2 -8 8 -10 q-9 0 -12 6 q-3 -6 -10 -7 q5 4 6 10 q-6 -2 -12 1 q7 2 12 6 q-7 3 -11 1 q5 6 13 5 q-2 12 0 28 Z"/>
          <path d="M388 100 q2 -14 0 -22 q9 3 12 -2 q-7 0 -10 -3 q9 -2 10 -7 q-8 2 -12 0 q2 -7 7 -8 q-8 0 -10 5 q-3 -5 -9 -6 q4 3 5 8 q-5 -2 -10 1 q6 2 10 5 q-6 3 -9 1 q4 5 11 4 q-2 10 0 24 Z"/>
        </g>
        {/* per-district scenery */}
        {locIdx===0&&<g>
          <rect x="300" y="68" width="26" height="32" rx="3" fill={night?"#0A1226":"#1B0E2A"}/>
          <rect x="306" y="64" width="14" height="6" rx="3" fill={C.flamingo} opacity=".85"/>
          <rect x="304" y="74" width="18" height="2" fill={C.blue} opacity=".8"/>
          <rect x="304" y="82" width="18" height="2" fill={C.blue} opacity=".6"/>
          <g><circle cx="262" cy="96" r="6" fill={C.flamingo} opacity=".8"/><rect x="261" y="96" width="2" height="6" fill="#03101C"/></g>
          <g><circle cx="278" cy="97" r="5" fill={C.gold} opacity=".8"/><rect x="277" y="97" width="2" height="5" fill="#03101C"/></g>
        </g>}
        {locIdx===1&&<g>
          <path d="M210 78 Q240 88 270 78" stroke={C.gold} strokeWidth="1" fill="none" opacity=".6"/>
          {[216,228,240,252,264].map((x,i)=><circle key={i} cx={x} cy={80+Math.sin(i)*3} r="1.6" fill={[C.flamingo,C.gold,C.blue,C.orange,C.green][i]} style={{animation:`twinkle ${1.8+i*.3}s infinite`}}/>)}
          <rect x="286" y="84" width="22" height="16" fill="#2A1430"/>
          <rect x="288" y="86" width="8" height="12" fill={C.orange} opacity=".7"/>
          <rect x="297" y="86" width="9" height="12" fill={C.blue} opacity=".6"/>
        </g>}
        {locIdx===2&&<g>
          <rect x="268" y="92" width="9" height="8" fill="#1A1208"/>
          <path d="M270 92 q1 -5 2.5 -2 q1 -4 2.5 0 q1.5 -3 2 2 Z" fill={C.orange} opacity={night?".95":".5"} style={{animation:"twinkle 1.1s infinite"}}/>
          <rect x="294" y="74" width="14" height="12" fill="#0A0A12"/>
          <path d="M294 74 L308 86 M308 74 L294 86" stroke="#3A2E1A" strokeWidth="2"/>
        </g>}
        {locIdx===3&&<g>
          <path d="M252 100 L252 84 L266 76 L280 84 L280 100 Z" fill={night?"#0D1430":"#241032"}/>
          <path d="M250 85 L266 75 L282 85" stroke={C.orange} strokeWidth="3" fill="none" opacity=".8"/>
          <circle cx="294" cy="92" r="7" fill="#0A2418"/><rect x="293" y="96" width="2" height="5" fill="#03101C"/>
          <circle cx="310" cy="93" r="5.5" fill="#0A2418"/><rect x="309" y="96" width="2" height="5" fill="#03101C"/>
        </g>}
        {locIdx===4&&<g>
          <path d="M250 106 L296 106 L290 112 L256 112 Z" fill="#0A0F1E"/>
          <rect x="262" y="99" width="22" height="7" rx="2" fill="#101A30"/>
          {[266,272,278].map((x,i)=><circle key={i} cx={x} cy="102" r="1.4" fill={[C.flamingo,C.blue,C.gold][i]} style={{animation:`twinkle ${.9+i*.25}s infinite`}}/>)}
          <path d="M252 104 L296 104" stroke={C.blue} strokeWidth=".8" opacity=".7"/>
        </g>}
        {locIdx===5&&<g>
          <path d="M306 100 L309 70 L315 70 L318 100 Z" fill={night?"#0B1226":"#1C0E28"}/>
          <rect x="307" y="64" width="10" height="7" rx="2" fill="#0A0F1E"/>
          <circle cx="312" cy="67" r="2.2" fill={C.gold} style={{animation:"twinkle 2.4s infinite"}}/>
          <path d="M312 67 L292 58 L292 76 Z" fill={C.gold} opacity=".12" style={{animation:"twinkle 2.4s infinite"}}/>
          <path d="M256 107 L276 107 L272 111 L260 111 Z" fill="#0A0F1E"/>
        </g>}
        {/* neon horizon in district color */}
        <rect x="0" y="100" width="420" height="2.4" fill={locColor} opacity=".95"/>
        <rect x="0" y="100" width="420" height="7" fill={locColor} opacity=".22"/>
        {/* water */}
        <rect x="0" y="103" width="420" height="15" fill={night?"#04101E":"#0A1A33"}/>
        <g stroke={locColor} strokeWidth="1" opacity=".4" style={{animation:"waterSh 5s ease-in-out infinite"}}>
          <line x1="40" y1="108" x2="110" y2="108"/><line x1="190" y1="112" x2="260" y2="112"/><line x1="310" y1="109" x2="380" y2="109"/>
        </g>
        {siren&&<g>
          <rect x="150" y="13" width="15" height="5" rx="2.5" fill="#0A0F1C"/>
          <rect x="142" y="11.4" width="30" height="1.6" rx=".8" fill="#0A0F1C">
            <animateTransform attributeName="transform" type="rotate" values="0 157 12.2;180 157 12.2" dur=".22s" repeatCount="indefinite"/>
          </rect>
          <circle cx="151" cy="15.5" r="1.2" fill="#FF1733">
            <animate attributeName="opacity" values="1;.2;1" dur=".8s" repeatCount="indefinite"/>
          </circle>
          <g transform="translate(157,18)">
            <polygon points="0,0 -14,80 14,80" fill="#FFF7C8" opacity=".13">
              <animateTransform attributeName="transform" type="rotate" values="-17;17;-17" dur="5.2s" repeatCount="indefinite"/>
            </polygon>
          </g>
        </g>}
        <g>
          <rect x="-14" y="98.6" width="6" height="1.5" rx=".75" fill="#FFE9A0" opacity=".9">
            <animateTransform attributeName="transform" type="translate" values="0 0;450 0" dur="7.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="430" y="97" width="6" height="1.5" rx=".75" fill="#FF7B7B" opacity=".85">
            <animateTransform attributeName="transform" type="translate" values="0 0;-450 0" dur="10s" repeatCount="indefinite" begin="2s"/>
          </rect>
        </g>
      </svg>
      {siren&&<>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg, #FF173344, transparent 55%)",animation:"sirenWash 1.4s infinite"}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(270deg, ${C.blue}44, transparent 55%)`,animation:"sirenWash 1.4s .7s infinite"}}/>
      </>}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px)"}}/>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// PARALLAX MIAMI — layered neon-noir skyline (drop-in for MiamiSky)
//   layer 0 haze towers · 1 far block · 2 near block + windows
//   3 rooftop neon + beacons · 4 district scenery · 5 wet-asphalt
//   reflection · 6 headlights · 7 siren wash · 8 CRT glass
// ═══════════════════════════════════════════════════════════════
const HX2=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const MIX=(a,b,t)=>{const A=HX2(a),B=HX2(b),k=CL(t,0,1);
  return "#"+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*k).toString(16).padStart(2,"0")).join("");};

// four-stop skies: 0 = high day, 1 = dusk, 2 = golden hour, 3 = deep night
const SKY_RAMPS=[
  ["#0A3C74","#2C74AE","#84BCD8","#F2B168"],
  ["#170A3A","#4A1858","#A62C58","#F2653A"],
  ["#2A1052","#7C2A64","#D6563C","#FFB53F"],
  ["#03060E","#080E2C","#121844","#241C56"],
];
const skyRamp=(move,heat)=>{
  const ph=((move%4)+4)%4, k=CL(heat/100,0,1), t=k*.66;
  return { ph, night:ph===1||ph===3,
    stops:SKY_RAMPS[ph].map((c,i)=>MIX(c, i<2?"#2C0509":"#C4181C", t*(i<2?.85:1))) };
};

// slowest parallax layer — hazy distance towers
const BUILD0=[[4,22,26],[42,30,18],[74,18,30],[118,26,22],[156,34,17],[186,20,28],[228,28,20],[266,17,32],[314,26,19],[352,21,26],[388,30,22]];
// rooftop signage, tuned to sit on BUILD1 roofs (base y = 124)
const SKY_SIGNS=[
  {x:70, y:56, w:22, h:8, c:C.pink,  d:5.5, dl:0},
  {x:213,y:54, w:21, h:8, c:C.blue,  d:7.2, dl:1.1, alt:true},
  {x:364,y:60, w:23, h:8, c:C.gold,  d:6.3, dl:2.4},
  {x:142,y:63, w:26, h:7, c:C.green, d:8.1, dl:.6, alt:true},
];

const SkySign=({x,y,w,h,c,d,dl,alt})=>(
  <g style={{animation:`${alt?"neonBuzz2":"neonBuzz"} ${d}s linear ${dl}s infinite`}}>
    <rect x={x-4} y={y-4} width={w+8} height={h+8} rx="4" fill={c} opacity=".07"/>
    <rect x={x-2} y={y-2} width={w+4} height={h+4} rx="3" fill={c} opacity=".14"/>
    <rect x={x} y={y} width={w} height={h} rx="2" fill="#04080F" stroke={c} strokeWidth="1"/>
    <rect x={x+2.4} y={y+h/2-.9} width={w*.26} height="1.8" rx=".9" fill={c}/>
    <rect x={x+w*.38} y={y+h/2-.9} width={w*.22} height="1.8" rx=".9" fill="#FFFFFF" opacity=".85"/>
    <rect x={x+w*.68} y={y+h/2-.9} width={w*.24} height="1.8" rx=".9" fill={c}/>
    <rect x={x+w/2-.6} y={y+h} width="1.2" height="5" fill="#050B16"/>
  </g>
);

const MiamiSkyDeluxe=memo(({move=0,heat=0,locColor=C.pink,locIdx=0,ht=146,plain=false})=>{
  const S=skyRamp(move,heat);
  const night=S.night, hot=CL(heat/100,0,1);
  const siren=heat>60&&!plain;
  const HZ=122;                                  // horizon / waterline
  const orb = S.ph===0 ? {x:336,y:32,r:16,day:true}
            : S.ph===2 ? {x:252,y:58,r:27,day:true}   // big retro sun sinking onto the roofline
            : S.ph===1 ? {x:350,y:42,r:12,day:false}
            :            {x:318,y:26,r:11,day:false};
  const winWarm = night?"#FFD27A":"#FFC98A";
  const winCool = night?"#8FE9FF":"#CFE6FF";
  const nearFill = night?"#050A16":MIX("#1A0A24",S.stops[1],.28);
  const midFill  = night?"#080F22":MIX("#22102E",S.stops[1],.42);
  const farFill  = MIX(S.stops[1],S.stops[2],.45);
  return(
    <div style={{position:"relative",height:ht,overflow:"hidden",background:S.stops[0]}}>
      <svg viewBox="0 0 420 146" preserveAspectRatio="xMidYMax slice"
        style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}>
        <defs>
          <linearGradient id="dxSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={S.stops[0]}/>
            <stop offset="38%"  stopColor={S.stops[1]}/>
            <stop offset="72%"  stopColor={S.stops[2]}/>
            <stop offset="100%" stopColor={S.stops[3]}/>
          </linearGradient>
          <radialGradient id="dxOrbG" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={orb.day?"#FFE9A8":"#EAF1FF"} stopOpacity=".55"/>
            <stop offset="55%"  stopColor={orb.day?"#FF8A46":"#9EC8FF"} stopOpacity=".22"/>
            <stop offset="100%" stopColor={orb.day?"#FF2D7B":"#5A7CC0"} stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="dxSunF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFE27A"/>
            <stop offset="48%"  stopColor="#FF8A3C"/>
            <stop offset="100%" stopColor="#FF2D7B"/>
          </linearGradient>
          <clipPath id="dxSlat">
            <rect x="-40" y="-40" width="80" height="46"/>
            <rect x="-40" y="9"   width="80" height="7"/>
            <rect x="-40" y="19"  width="80" height="5"/>
            <rect x="-40" y="27"  width="80" height="3.4"/>
            <rect x="-40" y="33"  width="80" height="2.2"/>
          </clipPath>
          <linearGradient id="dxWaterF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={night?"#0A1C34":"#123255"} stopOpacity=".95"/>
            <stop offset="100%" stopColor={night?"#01060E":"#050D1A"} stopOpacity="1"/>
          </linearGradient>
          <radialGradient id="dxOrbRef" cx="50%" cy="0%" r="88%">
            <stop offset="0%"   stopColor={orb.day?"#FFC069":"#DCEAFF"} stopOpacity=".62"/>
            <stop offset="52%"  stopColor={orb.day?"#FF7A46":"#8FB4F0"} stopOpacity=".24"/>
            <stop offset="100%" stopColor={orb.day?"#FF2D7B":"#4C6EB0"} stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* ── sky ── */}
        <rect x="0" y="0" width="420" height="146" fill="url(#dxSky)"/>

        {/* ── stars (night) ── */}
        {night&&<g style={{animation:"skyDriftB 46s ease-in-out infinite alternate"}}>
          {[24,58,96,132,168,204,240,272,308,344,380,404,44,148,286].map((x,i)=>(
            <circle key={i} cx={x} cy={8+((i*29)%52)} r={i%4===0?1.3:.75} fill="#FFFFFF"
              style={{animation:`twinkle ${2+(i%5)*.6}s ease-in-out ${i*.31}s infinite`}}/>))}
        </g>}

        {/* ── sun / moon + halo ── */}
        <g transform={`translate(${orb.x},${orb.y})`}>
          <circle r={orb.r*3.6} fill="url(#dxOrbG)"/>
          {orb.day?(
            <g style={{animation:"sunPulse 5s ease-in-out infinite"}}>
              <circle r={orb.r} fill="url(#dxSunF)" clipPath="url(#dxSlat)"/>
            </g>
          ):(<>
            <circle r={orb.r} fill="#EDF1F8" opacity=".93"/>
            <circle cx={-orb.r*.36} cy={-orb.r*.3} r={orb.r*.86} fill={S.stops[0]} opacity=".84"/>
          </>)}
        </g>

        {/* ── drifting cloud / fog bands ── */}
        <g style={{animation:"skyDriftA 54s ease-in-out infinite alternate"}} opacity={night?".26":".5"}>
          <ellipse cx="84"  cy="30" rx="34" ry="6"   fill={MIX(S.stops[2],"#FFFFFF",.35)} opacity=".4"/>
          <ellipse cx="118" cy="25" rx="20" ry="4.2" fill={MIX(S.stops[2],"#FFFFFF",.5)}  opacity=".33"/>
          <ellipse cx="248" cy="42" rx="40" ry="6.5" fill={MIX(S.stops[2],"#FFFFFF",.28)} opacity=".3"/>
          <ellipse cx="196" cy="18" rx="26" ry="4"   fill={MIX(S.stops[1],"#FFFFFF",.42)} opacity=".22"/>
        </g>

        {/* ── layer 0: haze towers ── */}
        <g fill={farFill} opacity=".55" style={{animation:"skyDriftB 70s ease-in-out infinite alternate"}}>
          {BUILD0.map(([x,bh,bw],i)=><rect key={i} x={x} y={118-bh} width={bw} height={bh}/>)}
        </g>

        {/* ── ground haze between layers ── */}
        <rect x="0" y="88" width="420" height="34" fill={MIX(S.stops[2],S.stops[3],.4)} opacity={night?".22":".38"}/>

        {/* ── layer 1: mid block ── */}
        <g fill={midFill} style={{animation:"skyDriftB 38s ease-in-out infinite alternate"}}>
          {BUILD2.map(([x,bh,bw],i)=><rect key={i} x={x} y={120-bh} width={bw} height={bh}/>)}
          {BUILD2.map(([x,bh,bw],i)=><rect key={"t"+i} x={x} y={120-bh} width={bw} height="1.2" fill={locColor} opacity=".22"/>)}
        </g>

        {/* ── layer 2: near block + lit windows ── */}
        <g>
          {BUILD1.map(([x,bh,bw],i)=>(<g key={i}>
            <rect x={x} y={124-bh} width={bw} height={bh} fill={nearFill}/>
            <rect x={x} y={124-bh} width={bw} height="1.4" fill={locColor} opacity=".55"/>
            <rect x={x} y={124-bh} width="1" height={bh} fill={locColor} opacity=".16"/>
            {Array.from({length:Math.floor(bh/9)}).map((_,r)=>
              Array.from({length:Math.floor(bw/9)}).map((_,c)=>{
                const seed=(i*7+r*3+c*5+move);
                const lit=(seed%(night?3:6))===0;
                if(!lit) return null;
                const cool=(seed%7)===0;
                return <rect key={r+"-"+c} x={x+3+c*9} y={128-bh+r*9} width="3.4" height="4"
                  fill={cool?winCool:winWarm} opacity={night?.95:.45}/>;
              }))}
          </g>))}
        </g>

        {/* ── layer 3: rooftop neon, antenna, beacon ── */}
        {SKY_SIGNS.map((s,i)=><SkySign key={i} {...s}/>)}
        <line x1="223" y1="64" x2="223" y2="46" stroke="#0A1424" strokeWidth="1.3"/>
        <circle cx="223" cy="45" r="1.9" fill="#FF3B4E" style={{animation:"beaconBlink 2.3s linear infinite"}}/>
        <line x1="16" y1="78" x2="16" y2="62" stroke="#0A1424" strokeWidth="1"/>
        <circle cx="16" cy="61" r="1.4" fill={C.blue} style={{animation:"beaconBlink 3.1s linear .8s infinite"}}/>

        {/* ── palms (foreground silhouettes) ── */}
        <g fill="#02090F">
          <animateTransform attributeName="transform" type="rotate" values="-1.4 44 124;1.4 44 124;-1.4 44 124" dur="6s" repeatCount="indefinite"/>
          <path d="M44 124 q2 -18 0 -29 q11 4 15 -2 q-9 0 -13 -4 q11 -2 13 -9 q-11 2 -15 0 q2 -9 9 -11 q-10 0 -13 7 q-3 -7 -11 -8 q6 4 7 11 q-7 -2 -13 1 q8 2 13 7 q-8 3 -12 1 q6 7 14 5 q-2 13 0 31 Z"/>
        </g>
        <g fill="#02090F">
          <animateTransform attributeName="transform" type="rotate" values="1.2 390 124;-1.2 390 124;1.2 390 124" dur="7.4s" repeatCount="indefinite"/>
          <path d="M390 124 q2 -16 0 -25 q10 3 13 -2 q-8 0 -11 -3 q10 -2 11 -8 q-9 2 -13 0 q2 -8 8 -9 q-9 0 -11 6 q-3 -6 -10 -7 q5 3 6 9 q-6 -2 -11 1 q7 2 11 6 q-7 3 -10 1 q5 6 12 4 q-2 11 0 27 Z"/>
        </g>

        {/* ── layer 4: district scenery ── */}
        {!plain&&locIdx===0&&<g>
          <rect x="300" y="92" width="26" height="32" rx="3" fill={night?"#0A1226":"#1B0E2A"}/>
          <rect x="306" y="88" width="14" height="6" rx="3" fill={C.flamingo} opacity=".85" style={{animation:"neonBuzz 4.4s linear infinite"}}/>
          <rect x="304" y="98" width="18" height="2" fill={C.blue} opacity=".8"/>
          <rect x="304" y="106" width="18" height="2" fill={C.blue} opacity=".6"/>
          <g><circle cx="262" cy="120" r="6" fill={C.flamingo} opacity=".8"/><rect x="261" y="120" width="2" height="6" fill="#03101C"/></g>
          <g><circle cx="278" cy="121" r="5" fill={C.gold} opacity=".8"/><rect x="277" y="121" width="2" height="5" fill="#03101C"/></g>
        </g>}
        {!plain&&locIdx===1&&<g>
          <path d="M210 102 Q240 112 270 102" stroke={C.gold} strokeWidth="1" fill="none" opacity=".6"/>
          {[216,228,240,252,264].map((x,i)=><circle key={i} cx={x} cy={104+Math.sin(i)*3} r="1.6" fill={[C.flamingo,C.gold,C.blue,C.orange,C.green][i]} style={{animation:`twinkle ${1.8+i*.3}s infinite`}}/>)}
          <rect x="286" y="108" width="22" height="16" fill="#2A1430"/>
          <rect x="288" y="110" width="8" height="12" fill={C.orange} opacity=".7"/>
          <rect x="297" y="110" width="9" height="12" fill={C.blue} opacity=".6"/>
        </g>}
        {!plain&&locIdx===2&&<g>
          <rect x="268" y="116" width="9" height="8" fill="#1A1208"/>
          <path d="M270 116 q1 -5 2.5 -2 q1 -4 2.5 0 q1.5 -3 2 2 Z" fill={C.orange} opacity={night?".95":".5"} style={{animation:"twinkle 1.1s infinite"}}/>
          <rect x="294" y="98" width="14" height="12" fill="#0A0A12"/>
          <path d="M294 98 L308 110 M308 98 L294 110" stroke="#3A2E1A" strokeWidth="2"/>
        </g>}
        {!plain&&locIdx===3&&<g>
          <path d="M252 124 L252 108 L266 100 L280 108 L280 124 Z" fill={night?"#0D1430":"#241032"}/>
          <path d="M250 109 L266 99 L282 109" stroke={C.orange} strokeWidth="3" fill="none" opacity=".8"/>
          <circle cx="294" cy="116" r="7" fill="#0A2418"/><rect x="293" y="120" width="2" height="5" fill="#03101C"/>
          <circle cx="310" cy="117" r="5.5" fill="#0A2418"/><rect x="309" y="120" width="2" height="5" fill="#03101C"/>
        </g>}
        {!plain&&locIdx===4&&<g>
          <path d="M250 128 L296 128 L290 134 L256 134 Z" fill="#0A0F1E"/>
          <rect x="262" y="121" width="22" height="7" rx="2" fill="#101A30"/>
          {[266,272,278].map((x,i)=><circle key={i} cx={x} cy="124" r="1.4" fill={[C.flamingo,C.blue,C.gold][i]} style={{animation:`twinkle ${.9+i*.25}s infinite`}}/>)}
          <path d="M252 126 L296 126" stroke={C.blue} strokeWidth=".8" opacity=".7"/>
        </g>}
        {!plain&&locIdx===5&&<g>
          <path d="M306 124 L309 94 L315 94 L318 124 Z" fill={night?"#0B1226":"#1C0E28"}/>
          <rect x="307" y="88" width="10" height="7" rx="2" fill="#0A0F1E"/>
          <circle cx="312" cy="91" r="2.2" fill={C.gold} style={{animation:"twinkle 2.4s infinite"}}/>
          <path d="M312 91 L292 82 L292 100 Z" fill={C.gold} opacity=".12" style={{animation:"twinkle 2.4s infinite"}}/>
          <path d="M256 131 L276 131 L272 135 L260 135 Z" fill="#0A0F1E"/>
        </g>}

        {/* ── neon horizon ── */}
        <rect x="0" y={HZ-5} width="420" height="5" fill={locColor} opacity=".16"/>
        <rect x="0" y={HZ} width="420" height="2.4" fill={locColor} opacity=".95"/>
        <rect x="0" y={HZ} width="420" height="8" fill={locColor} opacity=".2"/>

        {/* ── layer 5: wet asphalt / bay — smeared neon, not a mirror ── */}
        <rect x="0" y={HZ+2} width="420" height={146-HZ-2} fill="url(#dxWaterF)"/>
        {/* the horizon tube bleeding down into the wet */}
        <rect x="0" y={HZ+2} width="420" height="6"  fill={locColor} opacity=".24"/>
        <rect x="0" y={HZ+2} width="420" height="12" fill={locColor} opacity=".12"/>
        <rect x="0" y={HZ+2} width="420" height="20" fill={locColor} opacity=".06"/>
        {/* sun / moon light path */}
        <rect x={orb.x-36} y={HZ+2} width="72" height={146-HZ-2} fill="url(#dxOrbRef)"/>
        {/* vertical smears — signage first, then a few window columns */}
        <g style={{animation:"reflShimmer 5.6s ease-in-out infinite"}}>
          {SKY_SIGNS.map((s,i)=>(<g key={"s"+i}>
            <rect x={s.x+s.w*.06} y={HZ+2} width={s.w*.88} height="22" fill={s.c} opacity=".13"/>
            <rect x={s.x+s.w*.22} y={HZ+2} width={s.w*.56} height="15" fill={s.c} opacity=".2"/>
            <rect x={s.x+s.w*.4}  y={HZ+2} width={s.w*.2}  height="9"  fill={s.c} opacity=".34"/>
          </g>))}
          {BUILD1.map(([x,bh,bw],i)=>i%2===0?(
            <rect key={"w"+i} x={x+bw*.34} y={HZ+2} width="2.6" height={7+((i*5)%11)} fill={winWarm} opacity=".22"/>
          ):null)}
        </g>
        {/* ripple bands break the smears up */}
        <g style={{animation:"reflBand 3.4s ease-in-out infinite alternate"}}>
          {[126,129.5,133,136.5,140,143.5].map((y,i)=><rect key={i} x="0" y={y} width="420" height="1.5"
            fill={night?"#02070E":"#04101C"} opacity={.4+i*.08}/>)}
        </g>
        <g stroke={locColor} strokeWidth="1" opacity=".38" style={{animation:"waterSh 5s ease-in-out infinite"}}>
          <line x1="40" y1="131" x2="112" y2="131"/><line x1="192" y1="137" x2="262" y2="137"/><line x1="312" y1="133" x2="382" y2="133"/>
        </g>

        {/* ── layer 6: headlights on the causeway ── */}
        <g>
          <rect x="-14" y="120.4" width="7" height="1.5" rx=".75" fill="#FFE9A0" opacity=".9">
            <animateTransform attributeName="transform" type="translate" values="0 0;450 0" dur="7.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="430" y="118.6" width="7" height="1.5" rx=".75" fill="#FF7B7B" opacity=".85">
            <animateTransform attributeName="transform" type="translate" values="0 0;-450 0" dur="10s" repeatCount="indefinite" begin="2s"/>
          </rect>
          <rect x="-14" y="119" width="5" height="1.2" rx=".6" fill="#FFF3C0" opacity=".7">
            <animateTransform attributeName="transform" type="translate" values="0 0;450 0" dur="12s" repeatCount="indefinite" begin="4.4s"/>
          </rect>
        </g>

        {/* ── layer 7: chopper + searchlight when the feds are close ── */}
        {siren&&<g>
          <rect x="150" y="13" width="15" height="5" rx="2.5" fill="#0A0F1C"/>
          <rect x="142" y="11.4" width="30" height="1.6" rx=".8" fill="#0A0F1C">
            <animateTransform attributeName="transform" type="rotate" values="0 157 12.2;180 157 12.2" dur=".22s" repeatCount="indefinite"/>
          </rect>
          <circle cx="151" cy="15.5" r="1.2" fill="#FF1733">
            <animate attributeName="opacity" values="1;.2;1" dur=".8s" repeatCount="indefinite"/>
          </circle>
          <g transform="translate(157,18)">
            <polygon points="0,0 -16,104 16,104" fill="#FFF7C8" opacity=".13">
              <animateTransform attributeName="transform" type="rotate" values="-17;17;-17" dur="5.2s" repeatCount="indefinite"/>
            </polygon>
          </g>
        </g>}
      </svg>

      {/* ── heat bleed ── */}
      {hot>.35&&<div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:"radial-gradient(120% 80% at 50% 100%, rgba(196,24,28,.42), transparent 62%)",
        opacity:(hot-.35)*1.5}}/>}
      {hot>.45&&<div style={{position:"absolute",left:0,right:0,bottom:0,height:"66%",pointerEvents:"none",
        background:"repeating-linear-gradient(0deg, rgba(255,120,60,.09) 0 2px, rgba(0,0,0,0) 2px 6px)",
        animation:"hazeWave 2.8s ease-in-out infinite",willChange:"transform"}}/>}

      {/* ── siren wash ── */}
      {siren&&<>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(90deg, #FF173355, transparent 58%)",animation:"strobeL 1.5s linear infinite"}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:`linear-gradient(270deg, ${C.blue}55, transparent 58%)`,animation:"strobeR 1.5s linear infinite"}}/>
      </>}

      {/* ── layer 8: CRT glass ── */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:"repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 1px, rgba(0,0,0,0) 1px 3px)"}}/>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(120% 100% at 50% 40%, transparent 46%, rgba(0,0,0,.5) 100%), linear-gradient(180deg, transparent 76%, ${C.dark} 100%)`}}/>
    </div>
  );
});

// TYPEWRITER + STORY SCENE (cinematic dialogue overlay)
// ═══════════════════════════════════════════════════════════════
const TypeText=({text,sound,onDone,instant})=>{
  const [n,setN]=useState(instant?text.length:0);
  useEffect(()=>{ if(instant){ setN(text.length); onDone&&onDone(); return; }
    setN(0);
    let i=0;
    const t=setInterval(()=>{
      i+=2; setN(i);
      if(sound&&i%8===0) SFX.type();
      if(i>=text.length){ clearInterval(t); onDone&&onDone(); }
    },22);
    return ()=>clearInterval(t);
  },[text,instant]);
  return <span>{text.slice(0,n)}{n<text.length&&<span style={{animation:"caretB 1s infinite",color:C.blue}}>▌</span>}</span>;
};

const StoryScene=({story,g,sound,onApply,onClose})=>{
  const [idx,setIdx]=useState(0);
  const [typed,setTyped]=useState(false);
  const [instant,setInstant]=useState(false);
  const [reaction,setReaction]=useState(null);
  const lines=story.lines||[];
  const cur=reaction?null:lines[idx];
  const mood=reaction?reaction.portrait||story.portrait:(cur?.portrait||story.portrait);
  const atChoices=!reaction&&idx>=lines.length-1&&typed;
  const advance=()=>{
    if(reaction) return;
    if(!typed){ setInstant(true); setTyped(true); return; }
    if(idx<lines.length-1){ setIdx(idx+1); setTyped(false); setInstant(false); }
  };
  const pick=ch=>{
    const ns=applyChoiceEffects(g,ch.effects);
    onApply(ns,ch);
    setReaction({text:ch.reaction,portrait:ch.effects&&ch.effects["npc."+story.speaker+".trust"]<0?"angry":"knowing"});
  };
  const npc=NPCS[story.speaker];
  return(
    <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",flexDirection:"column",justifyContent:"flex-end",
      background:"linear-gradient(180deg, rgba(2,8,16,.82) 0%, rgba(2,8,16,.96) 100%)",animation:"fadeIn .3s ease"}}
      onClick={advance}>
      <div style={{maxWidth:430,width:"100%",margin:"0 auto",padding:14,paddingBottom:"calc(14px + env(safe-area-inset-bottom))"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:10,animation:"slideUp .35s ease"}}>
          <NPCFrame who={story.speaker} mood={mood} w={Math.min(132,Math.round((typeof window!=="undefined"?window.innerWidth:430)*.32))}/>
          <div style={{flex:1,paddingBottom:4}}>
            <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:`rgba(${npc.glow},1)`,marginBottom:6}}>
              ◆ {reaction?"OUTCOME":`SCENE ${idx+1}/${lines.length}`}
            </div>
            <div style={{...bx,border:`1px solid rgba(${npc.glow},.4)`,background:"rgba(7,13,24,.95)",
              boxShadow:`0 0 24px rgba(${npc.glow},.15)`,minHeight:96,maxHeight:"34dvh",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
              <div style={{fontFamily:fb,fontSize:14.5,lineHeight:1.55,color:C.text,fontStyle:"italic"}}>
                {reaction
                  ?<TypeText key={"rx"} text={reaction.text} sound={sound} onDone={()=>{}} instant={false}/>
                  :<TypeText key={idx} text={cur?.text||""} sound={sound} instant={instant} onDone={()=>setTyped(true)}/>}
              </div>
            </div>
          </div>
        </div>
        {reaction?(
          <button style={{...bt(npc.color,true),width:"100%",animation:"riseIn .3s ease"}}
            onClick={e=>{e.stopPropagation();onClose();}}>CONTINUE ▸</button>
        ):atChoices?(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {story.choices.map((ch,i)=>(
              <button key={i} style={{...bt(i===0?npc.color:C.gold),textAlign:"left",animation:`riseIn .3s ${i*.08}s ease both`}}
                onClick={e=>{e.stopPropagation();pick(ch);}}>{ch.text}</button>))}
          </div>
        ):(
          <div style={{textAlign:"center",fontFamily:ft,fontSize:10,color:C.dim,letterSpacing:1}}>TAP TO CONTINUE ▸</div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODALS — newspaper, encounter, turf war, deal step, era takeover
// ═══════════════════════════════════════════════════════════════
const Modal=({children,onClose,leaving})=>(
  <div style={{position:"fixed",inset:0,zIndex:55,background:"rgba(2,8,16,.85)",display:"flex",
    alignItems:"center",justifyContent:"center",padding:18,
    animation:leaving?"fadeOut .18s ease forwards":"fadeIn .25s ease"}} onClick={onClose}>
    <div style={{maxWidth:380,width:"100%",animation:leaving?"popOut .18s ease forwards":"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}
      onClick={e=>e.stopPropagation()}>{children}</div>
  </div>
);

const NewspaperModal=({paper,onClose,leaving})=>(
  <Modal onClose={onClose} leaving={leaving}>
    <div style={{background:C.paper,borderRadius:6,padding:16,color:C.ink,boxShadow:"0 12px 50px rgba(0,0,0,.7)",
      backgroundImage:"radial-gradient(rgba(26,20,16,.05) 1px, transparent 1px)",backgroundSize:"4px 4px"}}>
      <div style={{textAlign:"center",borderBottom:"3px double "+C.ink,paddingBottom:6,marginBottom:10}}>
        <div style={{fontFamily:fb,fontWeight:"bold",fontSize:22,letterSpacing:1}}>The Miami Herald</div>
        <div style={{fontFamily:ft,fontSize:8,letterSpacing:2}}>SOUTH FLORIDA'S NEWSPAPER ◆ 25¢ ◆ 1986</div>
      </div>
      <div style={{fontSize:34,textAlign:"center",marginBottom:6}}>{paper.icon}</div>
      <div style={{fontFamily:fb,fontWeight:"bold",fontSize:21,lineHeight:1.12,marginBottom:8}}>{paper.headline}</div>
      <div style={{fontFamily:fb,fontSize:13,lineHeight:1.5,fontStyle:"italic",borderTop:"1px solid "+C.ink+"44",paddingTop:8}}>{paper.sub}</div>
      <button style={{...bt(C.ink),width:"100%",marginTop:12,background:"transparent",color:C.ink,border:"1px solid "+C.ink}} onClick={onClose}>PUT IT DOWN</button>
    </div>
  </Modal>
);

const EncounterModal=({enc,onAct})=>{
  const opts=enc.type==="find"?[["TAKE IT","take",C.gold],["WALK AWAY","leave",C.dim]]
    :enc.type==="tip"?[["NOTED","leave",C.blue]]
    :enc.type==="mugger"?[["FIGHT","fight",C.pink],[`GIVE ${FM(enc.cashLoss)}`,"pay",C.dim]]
    :enc.type==="bribe_offer"?[[`PAY ${FM(enc.cost)} (−HEAT)`,"accept",C.blue],["DECLINE","decline",C.dim]]
    :[[`PAY ${FM(enc.cost)} (+${enc.hpGain} HP)`,"accept",C.green],["DECLINE","decline",C.dim]];
  return(<Modal onClose={()=>{}}>
    <div style={{...bx,border:`1px solid ${C.orange}66`,padding:16}}>
      <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.orange,marginBottom:8}}>◆ STREET ENCOUNTER</div>
      <div style={{fontFamily:fb,fontSize:14.5,fontStyle:"italic",lineHeight:1.55,color:C.text,marginBottom:14}}>
        {enc.text}{enc.type==="find"&&<span style={{color:C.gold}}> ({enc.amt}× {DRUGS[enc.drugIdx].emoji} {DRUGS[enc.drugIdx].name})</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {opts.map(([label,action,color],i)=><button key={i} style={bt(color)} onClick={()=>onAct(action)}>{label}</button>)}
      </div>
    </div>
  </Modal>);
};

const TurfWarModal=({war,g,onAct})=>{
  const myPower=g.enforcers[war.loc]*2+(g.gun?2:0)+Math.floor(g.cred/20);
  return(<Modal onClose={()=>{}}>
    <div style={{...bx,border:`1px solid ${C.pink}88`,padding:16,boxShadow:`0 0 30px ${C.pink}33`}}>
      <Neon color={C.pink} size={17}>⚔ TURF WAR</Neon>
      <div style={{fontFamily:fb,fontSize:14,fontStyle:"italic",color:C.text,margin:"10px 0",lineHeight:1.5}}>
        {war.rivalName} is moving on your turf in {LOCS[war.loc].name}.
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,fontFamily:ft,fontSize:12}}>
        <div style={{flex:1,...bx,textAlign:"center",padding:8}}>
          <div style={{color:C.dim,fontSize:9}}>YOUR POWER</div>
          <div style={{color:myPower>=war.rivalPower?C.green:C.pink,fontWeight:"bold",fontSize:18}}>{myPower}</div>
        </div>
        <div style={{flex:1,...bx,textAlign:"center",padding:8}}>
          <div style={{color:C.dim,fontSize:9}}>{war.rivalName.toUpperCase()}</div>
          <div style={{color:C.orange,fontWeight:"bold",fontSize:18}}>{war.rivalPower}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <button style={bt(C.pink)} onClick={()=>onAct("defend")}>⚔ DEFEND THE BLOCK</button>
        <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,textAlign:"center"}}>your power scales with the fight — mash hard</div>
        <button style={bt(C.gold)} onClick={()=>onAct("pay")}>💰 PAY THEM OFF — {FM(war.rivalPower*800)}</button>
      </div>
    </div>
  </Modal>);
};

const DealStepModal=({deal,g,onAct})=>(
  <Modal onClose={()=>{}}>
    <div style={{...bx,border:`1px solid ${C.gold}88`,padding:16,boxShadow:`0 0 30px ${C.gold}22`}}>
      <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.gold,marginBottom:8}}>
        ◆ THE BIG DEAL — {deal.step.toUpperCase()}
      </div>
      <div style={{fontFamily:fb,fontSize:14.5,fontStyle:"italic",lineHeight:1.55,color:C.text,marginBottom:14}}>{deal.text}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {deal.opts.map((o,i)=><button key={i} style={bt(i===0?C.gold:C.blue)} onClick={()=>onAct(o)}>{o.label}</button>)}
      </div>
    </div>
  </Modal>
);

const EraTakeover=({era,onDone})=>{
  useEffect(()=>{ const t=setTimeout(onDone,2400); return ()=>clearTimeout(t); },[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:70,background:C.midnight,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease",padding:20}} onClick={onDone}>
      <div style={{fontFamily:ft,fontSize:10,letterSpacing:4,color:era.color,marginBottom:14}}>— THE GAME CHANGES —</div>
      <div style={{position:"relative"}}>
        <Neon color={era.color} size={34} style={{textAlign:"center",animation:"glitchA .5s ease 2, rgbSplit .13s steps(2) 8"}}>{era.name.toUpperCase()}</Neon>
      </div>
      <div style={{fontFamily:fb,fontSize:15,fontStyle:"italic",color:C.text,marginTop:14,textAlign:"center",maxWidth:300,lineHeight:1.5}}>{era.desc}</div>
      <div style={{display:"flex",gap:14,marginTop:22,fontFamily:ft,fontSize:11}}>
        {era.demandMod.map((m,i)=>m>=1.4?<span key={i} style={{color:C.green}}>{DRUGS[i].emoji}▲</span>:m<=0.6?<span key={i} style={{color:C.pink}}>{DRUGS[i].emoji}▼</span>:null)}
      </div>
      <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginTop:26,letterSpacing:2}}>TAP TO CONTINUE</div>
    </div>
  );
};

// ── Sale breakdown cascade (Roadmap P1) ──
// ── ACT CARD — the three-act spine announces itself ──
const ActCard=({data,onDone})=>{
  useEffect(()=>{ const t=setTimeout(onDone,3600); return ()=>clearTimeout(t); },[]);
  return(
    <div onClick={onDone} style={{position:"fixed",inset:0,zIndex:72,background:C.midnight,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",animation:"fadeIn .25s ease",padding:24,cursor:"pointer"}}>
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px)"}}/>
      <div style={{position:"relative",fontFamily:ft,fontSize:10,letterSpacing:5,color:data.color,marginBottom:16}}>
        ACT {["","I","II","III"][data.n]||data.n}</div>
      <Neon color={data.color} size={36} style={{textAlign:"center",animation:"glitchA .5s ease 2, rgbSplit .13s steps(2) 8"}}>{data.name}</Neon>
      <div style={{position:"relative",fontFamily:fb,fontSize:16,fontStyle:"italic",color:C.text,marginTop:20,
        textAlign:"center",maxWidth:312,lineHeight:1.55}}>{data.goal}</div>
      <div style={{position:"relative",fontFamily:fb,fontSize:13,fontStyle:"italic",color:C.dim,marginTop:12,
        textAlign:"center",maxWidth:300,lineHeight:1.6}}>{data.sub}</div>
      <div style={{position:"relative",fontFamily:ft,fontSize:9,color:C.dim,marginTop:30,letterSpacing:2}}>TAP TO CONTINUE</div>
    </div>
  );
};

const SaleBreakdown=({d})=>(
  <div style={{position:"fixed",left:"50%",bottom:120,transform:"translateX(-50%)",zIndex:48,width:250,
    ...bx,border:`1px solid ${d.profit>=0?C.green:C.pink}66`,background:"rgba(7,13,24,.96)",
    boxShadow:`0 0 26px ${d.profit>=0?C.green:C.pink}33`,pointerEvents:"none"}}>
    <div style={{fontFamily:ft,fontSize:11,color:C.text}}>
      <div style={{animation:"breakLine .25s .05s ease both",display:"flex",justifyContent:"space-between"}}>
        <span style={{color:C.dim}}>{d.qty}× {d.emoji} @ {FM(d.price)}</span><span>{FM(d.revenue)}</span>
      </div>
      {d.purity!=null&&d.purity<1&&<div style={{animation:"breakLine .25s .25s ease both",color:C.orange,display:"flex",justifyContent:"space-between"}}>
        <span>✂ stepped on</span><span>{Math.round(d.purity*100)}% price</span></div>}
      {d.pagerHit&&<div style={{animation:"breakLine .25s .3s ease both",color:C.gold,display:"flex",justifyContent:"space-between"}}>
        <span>📟 DEAL BONUS</span><span>+{d.bonusPct}%</span></div>}
      <div style={{animation:"breakLine .25s .45s ease both",display:"flex",justifyContent:"space-between",color:C.dim}}>
        <span>cost basis</span><span>−{FM(d.costBasis)}</span>
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,marginTop:5,paddingTop:5,animation:"profitPunch .35s .7s ease both",
        display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:15,position:"relative",overflow:"hidden",
        color:d.profit>=0?C.green:C.pink,textShadow:`0 0 10px ${d.profit>=0?C.green:C.pink}88`}}>
        <span>{d.profit>=0?"PROFIT":"LOSS"}</span><span>{FM(d.profit)}</span>
        {d.profit>0&&<div style={{position:"absolute",top:0,bottom:0,width:"38%",
          background:"linear-gradient(105deg,transparent,#ffffff45,transparent)",
          animation:"shineSweep .7s ease 1.05s both"}}/>}
      </div>
      {d.streak>=2&&<div style={{animation:"breakLine .25s .95s ease both",textAlign:"center",color:C.orange,fontSize:10,marginTop:3}}>
        🔥 STREAK ×{d.streak}</div>}
    </div>
  </div>
);

// ── TRAVEL SEQUENCE — choreographed night drive / boat run ──
const CarRear=({sport})=>sport?(
  <svg width="128" height="56" viewBox="0 0 128 56">
    <path d="M10 40 L22 16 L106 16 L118 40 Z" fill="#0D0F16"/>
    <path d="M30 16 L40 6 L88 6 L98 16 Z" fill="#080A10"/>
    <rect x="38" y="9" width="52" height="6" rx="2" fill="#0E1A2E"/>
    <rect x="16" y="24" width="96" height="7" rx="3" fill="#FF1733" style={{filter:"drop-shadow(0 0 10px #FF1733)"}}/>
    <rect x="6" y="40" width="116" height="9" rx="3" fill="#05060A"/>
    <rect x="40" y="44" width="12" height="5" rx="2" fill="#1A1F2C"/><rect x="76" y="44" width="12" height="5" rx="2" fill="#1A1F2C"/>
    <circle cx="46" cy="46" r="2" fill="#FFB36B" opacity=".9"/><circle cx="82" cy="46" r="2" fill="#FFB36B" opacity=".9"/>
  </svg>
):(
  <svg width="108" height="52" viewBox="0 0 108 52">
    <path d="M12 38 L20 14 L88 14 L96 38 Z" fill="#10131C"/>
    <path d="M28 14 L36 5 L72 5 L80 14 Z" fill="#0A0D14"/>
    <rect x="34" y="8" width="40" height="5" rx="2" fill="#0E1A2E"/>
    <rect x="18" y="22" width="16" height="6" rx="2" fill="#FF3344" style={{filter:"drop-shadow(0 0 7px #FF3344)"}}/>
    <rect x="74" y="22" width="16" height="6" rx="2" fill="#FF3344" style={{filter:"drop-shadow(0 0 7px #FF3344)"}}/>
    <rect x="8" y="38" width="92" height="8" rx="3" fill="#05060A"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN-SPACE CRT / VHS GRADE — one fixed layer over everything
//   NOTE: a fixed + z-indexed element is its own stacking context,
//   so mix-blend-mode cannot reach the page. Everything here is
//   plain low-alpha compositing on purpose.
// ═══════════════════════════════════════════════════════════════
const CRTOverlay=memo(({heat=0,color=C.pink,night=false})=>{
  const k=CL(heat/100,0,1);
  return(
  <div style={{position:"fixed",inset:0,zIndex:2,pointerEvents:"none",overflow:"hidden"}}>
    {/* rolling scanlines — transform-animated so it composites, never repaints */}
    <div style={{position:"absolute",left:0,right:0,top:"-100%",height:"300%",opacity:.44,
      background:"repeating-linear-gradient(0deg, rgba(0,0,0,.34) 0 1px, rgba(0,0,0,0) 1px 3px)",
      animation:"crtRoll 10s linear infinite",willChange:"transform"}}/>
    {/* aperture grille — static, cheap */}
    <div style={{position:"absolute",inset:0,opacity:.07,
      background:"repeating-linear-gradient(90deg, rgba(255,45,123,.7) 0 1px, rgba(0,229,255,.7) 1px 2px, rgba(0,0,0,0) 2px 3px)"}}/>
    {/* chromatic fringe at the tube edges */}
    <div style={{position:"absolute",inset:0,opacity:.34,willChange:"transform",
      background:`radial-gradient(120% 92% at -10% 50%, ${C.pink}3a, transparent 40%), radial-gradient(120% 92% at 110% 50%, ${C.blue}3a, transparent 40%)`,
      animation:"aberrJit 3.7s ease-in-out infinite"}}/>
    {/* district bloom off the top of the frame */}
    <div style={{position:"absolute",left:0,right:0,top:0,height:"30%",opacity:.3,
      background:`linear-gradient(180deg, ${color}44, transparent)`,
      animation:"bloomBreath 6.5s ease-in-out infinite"}}/>
    {/* vignette + tube curvature */}
    <div style={{position:"absolute",inset:0,
      background:`radial-gradient(132% 108% at 50% 46%, transparent 42%, rgba(0,0,0,${night?".5":".4"}) 78%, rgba(0,0,0,.84) 100%)`}}/>
    <div style={{position:"absolute",inset:-2,borderRadius:16,
      boxShadow:"inset 0 0 90px rgba(0,0,0,.62), inset 0 0 12px rgba(0,0,0,.9)"}}/>
    {/* tracking glitch — one node, offscreen 90% of the time */}
    <div style={{position:"absolute",left:"-6%",right:"-6%",height:26,willChange:"transform",
      background:"linear-gradient(180deg, rgba(0,0,0,0), rgba(255,255,255,.42), rgba(0,229,255,.3), rgba(0,0,0,0))",
      animation:"trackGlitch 13s linear 4s infinite"}}/>
    {/* heat haze — only once the city starts cooking */}
    {k>.42&&<div style={{position:"absolute",left:0,right:0,bottom:0,height:"64%",willChange:"transform",
      opacity:CL((k-.42)*1.4,0,.9),
      background:"repeating-linear-gradient(0deg, rgba(255,110,50,.10) 0 2px, rgba(0,0,0,0) 2px 7px)",
      animation:"hazeWave 2.6s ease-in-out infinite"}}/>}
    {/* red/blue strobe — they are on the block */}
    {k>=.7&&<>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg, rgba(255,23,51,.36), transparent 48%)",animation:"strobeL 1.5s linear infinite"}}/>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(270deg, ${C.blue}55, transparent 48%)`,animation:"strobeR 1.5s linear infinite"}}/>
      <div style={{position:"absolute",inset:0,boxShadow:`inset 0 0 60px rgba(255,23,51,.35)`}}/>
    </>}
  </div>);
});

// ── district arrival wash — keyed on g.loc, replays on every move ──
const DistrictWash=memo(({color})=>(
  <div style={{position:"fixed",inset:0,zIndex:38,pointerEvents:"none",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,animation:"washTint .9s ease-out forwards",
      background:`linear-gradient(180deg, ${color}33, transparent 48%, ${color}26)`}}/>
    <div style={{position:"absolute",top:0,bottom:0,left:0,width:"32%",willChange:"transform",
      background:`linear-gradient(90deg, transparent, ${color}55, rgba(255,255,255,.16), ${color}55, transparent)`,
      animation:"washSweep .8s cubic-bezier(.4,0,.2,1) forwards"}}/>
  </div>
));

const TravelOverlay=({from,to,car,boat})=>{
  const L=LOCS[to], F=LOCS[from];
  return(
  <div style={{position:"fixed",inset:0,zIndex:75,overflow:"hidden",
    background:boat?"linear-gradient(180deg,#050B1C 0%,#0A1B3A 42%,#04203A 58%,#021426 100%)"
                   :"linear-gradient(180deg,#070D1E 0%,#12082E 36%,#0A0F1A 55%,#05080F 100%)",
    animation:"fadeIn .12s ease"}}>
    {Array.from({length:14}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*53)%100}%`,top:`${(i*29)%36}%`,
      width:2,height:2,borderRadius:1,background:"#fff",opacity:.7,animation:`twinkle ${1.5+(i%3)*.6}s infinite`}}/>)}
    {Array.from({length:7}).map((_,i)=><div key={"s"+i} style={{position:"absolute",top:`${11+i*8}%`,left:"108%",
      width:90+(i%3)*60,height:2,borderRadius:2,
      background:`linear-gradient(90deg,transparent,${i%2?C.blue:C.pink}aa)`,
      animation:`streakMove ${.55+(i%3)*.16}s linear ${i*.08}s infinite`}}/>)}
    {boat?(<>
      <div style={{position:"absolute",left:0,right:0,top:"54%",bottom:0,
        background:"repeating-linear-gradient(180deg,#0C2C50 0 3px,#06203A 3px 60px)",
        animation:"roadMove .3s linear infinite"}}/>
      <div style={{position:"absolute",left:"50%",top:"57%",bottom:0,width:150,transform:"translateX(-50%)",
        background:"linear-gradient(180deg,transparent,#9ADFF855)",clipPath:"polygon(45% 0,55% 0,100% 100%,0 100%)"}}/>
      <div style={{position:"absolute",left:"50%",bottom:48,transform:"translateX(-50%)",fontSize:54,
        animation:"vehBob .5s ease-in-out infinite",filter:"drop-shadow(0 7px 12px #000c)"}}>🚤</div>
    </>):(<>
      <div style={{position:"absolute",left:"50%",top:"54%",bottom:0,width:"92%",transform:"translateX(-50%)",
        clipPath:"polygon(44% 0,56% 0,100% 100%,0 100%)",background:"#0B0F18",boxShadow:"inset 0 0 46px #000"}}>
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:12,transform:"translateX(-50%)",
          clipPath:"polygon(34% 0,66% 0,100% 100%,0 100%)",opacity:.9,
          background:`repeating-linear-gradient(180deg,${C.gold} 0 24px,transparent 24px 60px)`,
          animation:`roadMove ${car?".18s":".3s"} linear infinite`}}/>
        <div style={{position:"absolute",left:"43%",top:0,bottom:0,width:3,background:C.pink,opacity:.5,transform:"skewX(-2deg)"}}/>
        <div style={{position:"absolute",right:"43%",top:0,bottom:0,width:3,background:C.blue,opacity:.5,transform:"skewX(2deg)"}}/>
      </div>
      {[0,1,2,3].map(i=><div key={"p"+i} style={{position:"absolute",left:i%2===0?"40%":"56%",top:"50%",fontSize:20,
        animation:`${i%2===0?"palmFlyL":"palmFlyR"} ${car?".8s":"1.05s"} linear ${i*.26}s infinite`}}>🌴</div>)}
      <div style={{position:"absolute",left:"50%",bottom:44,animation:"vehBob .42s ease-in-out infinite",
        filter:"drop-shadow(0 9px 16px #000d)"}}><CarRear sport={car}/></div>
    </>)}
    <div style={{position:"absolute",top:26,left:0,right:0,textAlign:"center",fontFamily:ft,fontSize:10,letterSpacing:2,color:C.dim}}>
      {F.icon} {F.name.toUpperCase()} <span style={{color:C.blue}}>━━▶</span>{car&&!boat?"  🏎 COUNTACH":""}{boat?"  🚤 CIGARETTE BOAT":""}
    </div>
    <div style={{position:"absolute",top:"31%",left:0,right:0,textAlign:"center",
      animation:"destIn .5s cubic-bezier(.34,1.56,.64,1) .32s both"}}>
      <div style={{fontSize:42,filter:`drop-shadow(0 0 16px ${L.color}88)`}}>{L.icon}</div>
      <Neon color={L.color} size={26}>{L.name.toUpperCase()}</Neon>
      <div style={{fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.dim,marginTop:5}}>{L.desc}</div>
    </div>
    <div style={{position:"absolute",left:"14%",right:"14%",bottom:18,height:3,background:"#ffffff14",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",background:L.color,boxShadow:`0 0 8px ${L.color}`,animation:`progressFill ${car&&!boat?".64s":".92s"} linear forwards`}}/>
    </div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// MINI-GAMES — skill moments that feed the engine a 0..1 score
// ═══════════════════════════════════════════════════════════════
const MiniShell=({title,desc,color,children,onAuto})=>(
  <div style={{position:"fixed",inset:0,zIndex:80,background:"rgba(2,6,12,.93)",display:"flex",
    alignItems:"center",justifyContent:"center",padding:18,animation:"fadeIn .18s ease"}}>
    <div style={{width:"min(330px,100%)",animation:"popIn .25s cubic-bezier(.34,1.56,.64,1)"}}>
      <div style={{textAlign:"center",marginBottom:4}}><Neon color={color} size={19}>{title}</Neon></div>
      <div style={{fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.dim,textAlign:"center",marginBottom:12}}>{desc}</div>
      {children}
      <div style={{textAlign:"center",marginTop:12}}>
        {/* A real button: the span was a ~9px tap target on a 420px phone,
            unreachable by keyboard and invisible to assistive tech. */}
        <button onClick={onAuto} style={{fontFamily:ft,fontSize:10,letterSpacing:1,color:C.dim,
          textDecoration:"underline",cursor:"pointer",background:"none",border:"none",
          padding:"10px 16px",minHeight:44,touchAction:"manipulation"}}>AUTO-RESOLVE INSTEAD</button>
      </div>
    </div>
  </div>
);
const Verdict=({score})=>(
  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
    <span style={{fontFamily:ft,fontWeight:"bold",fontSize:22,letterSpacing:2,animation:"verdictIn .3s ease both",
      color:score>=.8?C.gold:score>=.5?C.green:C.pink,
      textShadow:`0 0 14px ${score>=.8?C.gold:score>=.5?C.green:C.pink}`}}>
      {score>=.8?"PERFECT!":score>=.5?"GOOD":score>.15?"SLOPPY":"MISS"}</span>
  </div>
);

// Timing bar — the chase gaps / the bribe needle
const TimingMini=({cfg,sound,onDone})=>{
  const [round,setRound]=useState(0);
  const [zone]=useState(()=>Array.from({length:cfg.rounds}).map(()=>22+Math.random()*56));
  const [locked,setLocked]=useState(null);
  const scores=useRef([]);
  const trackRef=useRef(null), curRef=useRef(null);
  const tap=()=>{
    if(locked!=null) return;
    const t=trackRef.current.getBoundingClientRect(), c=curRef.current.getBoundingClientRect();
    const pos=((c.left+c.width/2-t.left)/t.width)*100;
    const dist=Math.abs(pos-zone[round]);
    const sc=CL(1-dist/cfg.zoneW,0,1);
    scores.current.push(sc); setLocked({pos,sc});
    if(sound)(sc>=.5?SFX.coin:SFX.error)();
    setTimeout(()=>{
      if(round+1<cfg.rounds){ setRound(round+1); setLocked(null); }
      else onDone(scores.current.reduce((a,b)=>a+b,0)/cfg.rounds);
    },560);
  };
  return(
  <div onPointerDown={tap} style={{cursor:"pointer",position:"relative"}}>
    {cfg.rounds>1&&<div style={{fontFamily:ft,fontSize:9,color:C.dim,textAlign:"center",marginBottom:6}}>
      {Array.from({length:cfg.rounds}).map((_,i)=><span key={i} style={{margin:"0 3px",color:i<round?(scores.current[i]>=.5?C.green:C.pink):i===round?cfg.color:C.dim}}>{i<round?"●":i===round?"◉":"○"}</span>)}</div>}
    <div ref={trackRef} style={{position:"relative",height:46,borderRadius:10,background:"#070C18",
      border:`1px solid ${cfg.color}44`,overflow:"hidden",boxShadow:`inset 0 0 18px #000`}}>
      <div style={{position:"absolute",top:0,bottom:0,left:`${zone[round]-cfg.zoneW}%`,width:`${cfg.zoneW*2}%`,
        background:`linear-gradient(90deg,transparent,${cfg.color}3a,transparent)`,borderLeft:`1px solid ${cfg.color}66`,borderRight:`1px solid ${cfg.color}66`}}/>
      <div style={{position:"absolute",top:6,bottom:6,left:`${zone[round]}%`,width:2,marginLeft:-1,background:cfg.color,boxShadow:`0 0 8px ${cfg.color}`}}/>
      <div ref={curRef} key={round} style={{position:"absolute",top:4,bottom:4,width:14,borderRadius:4,
        background:"#fff",boxShadow:"0 0 12px #fff",
        animationName:"sweepX",animationDuration:`${1.15/cfg.speed}s`,animationTimingFunction:"linear",
        animationIterationCount:"infinite",animationDirection:"alternate",
        animationPlayState:locked?"paused":"running"}}/>
      {locked&&<Verdict score={locked.sc}/>}
    </div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:1,color:C.dim,textAlign:"center",marginTop:8}}>TAP TO LOCK IN</div>
  </div>);
};

// Strike QTE — shrinking ring onto the fist
const StrikeMini=({cfg,sound,onDone})=>{
  const [round,setRound]=useState(0);
  const [hit,setHit]=useState(null);
  const start=useRef(0);
  const scores=useRef([]);
  const dur=900/cfg.speed;
  useEffect(()=>{ start.current=performance.now(); },[round]);
  const finishRound=sc=>{
    scores.current.push(sc); setHit({sc});
    if(sound)(sc>=.5?SFX.sellBig:SFX.error)();
    setTimeout(()=>{
      if(round+1<cfg.rounds){ setHit(null); setRound(round+1); }
      else onDone(scores.current.reduce((a,b)=>a+b,0)/cfg.rounds);
    },520);
  };
  const tap=()=>{
    if(hit) return;
    const el=CL((performance.now()-start.current)/dur,0,1);
    const scale=2.3-1.8*el;
    finishRound(CL(1-Math.abs(scale-1)/0.55,0,1));
  };
  return(
  <div onPointerDown={tap} style={{cursor:"pointer",position:"relative",height:170,display:"flex",
    alignItems:"center",justifyContent:"center",borderRadius:12,background:"#070C18",
    border:`1px solid ${C.pink}44`,boxShadow:"inset 0 0 24px #000"}}>
    <div style={{fontFamily:ft,fontSize:9,color:C.dim,position:"absolute",top:8,left:0,right:0,textAlign:"center"}}>
      STRIKE {round+1}/{cfg.rounds} — TAP WHEN THE RING LANDS</div>
    <div style={{position:"relative",width:84,height:84,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:42,filter:"drop-shadow(0 0 10px #000)"}}>{cfg.foe==="cop"?"🚔":"😠"}</div>
      <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`2px dashed ${C.dim}`}}/>
      {!hit&&<div key={round} onAnimationEnd={()=>finishRound(0)}
        style={{position:"absolute",inset:0,borderRadius:"50%",border:`3px solid ${C.pink}`,
        boxShadow:`0 0 14px ${C.pink}`,animation:`ringShrink ${dur}ms linear forwards`}}/>}
      {hit&&hit.sc>=.5&&<div style={{position:"absolute",fontSize:34,animation:"verdictIn .25s ease"}}>💥</div>}
    </div>
    {hit&&<Verdict score={hit.sc}/>}
  </div>);
};

// Masher — tug of war for the block
const MashMini=({cfg,sound,onDone})=>{
  const [power,setPower]=useState(50);
  const [left,setLeft]=useState(3.0);
  const pRef=useRef(50);
  const done=useRef(false);
  useEffect(()=>{
    const t0=performance.now();
    const iv=setInterval(()=>{
      const rem=3.0-(performance.now()-t0)/1000;
      pRef.current=CL(pRef.current-cfg.rival*0.5,0,100);
      setPower(pRef.current); setLeft(Math.max(0,rem));
      if(rem<=0&&!done.current){ done.current=true; clearInterval(iv);
        setTimeout(()=>onDone(pRef.current/100),420); }
    },90);
    return ()=>clearInterval(iv);
  },[]);
  const tap=()=>{ if(done.current) return;
    pRef.current=CL(pRef.current+4.6,0,100); setPower(pRef.current);
    if(sound&&Math.random()<.4)SFX.click();
    if(typeof navigator!=="undefined"&&navigator.vibrate) try{navigator.vibrate(8);}catch(e){} };
  return(
  <div onPointerDown={tap} style={{cursor:"pointer",userSelect:"none",position:"relative",
    animation:power>70?"mashShake .14s infinite":"none"}}>
    <div style={{display:"flex",justifyContent:"space-between",fontFamily:ft,fontSize:10,marginBottom:5}}>
      <span style={{color:C.gold,fontWeight:"bold"}}>YOU</span>
      <span style={{color:C.text}}>⏱ {left.toFixed(1)}s</span>
      <span style={{color:C.pink,fontWeight:"bold"}}>THEM</span>
    </div>
    <div style={{height:26,borderRadius:8,background:C.pink+"33",overflow:"hidden",
      border:`1px solid ${C.border}`,boxShadow:"inset 0 0 14px #0008"}}>
      <div style={{height:"100%",width:`${power}%`,background:`linear-gradient(90deg,${C.gold},${C.orange})`,
        boxShadow:`0 0 12px ${C.gold}`,transition:"width .09s linear"}}/>
    </div>
    <div style={{textAlign:"center",fontFamily:ft,fontSize:15,fontWeight:"bold",color:C.gold,
      marginTop:14,padding:"14px 0",border:`1px dashed ${C.gold}55`,borderRadius:10,
      textShadow:`0 0 10px ${C.gold}66`}}>👊 TAP! TAP! TAP! 👊</div>
  </div>);
};

const MiniGame=({mini,sound,onDone})=>{
  const auto=()=>onDone(0.5);
  if(mini.kind==="timing") return(<MiniShell title={mini.cfg.title} desc={mini.cfg.desc} color={mini.cfg.color} onAuto={auto}>
    <TimingMini cfg={mini.cfg} sound={sound} onDone={onDone}/></MiniShell>);
  if(mini.kind==="strike") return(<MiniShell title={mini.cfg.title} desc={mini.cfg.desc} color={C.pink} onAuto={auto}>
    <StrikeMini cfg={mini.cfg} sound={sound} onDone={onDone}/></MiniShell>);
  return(<MiniShell title={mini.cfg.title} desc={mini.cfg.desc} color={C.gold} onAuto={auto}>
    <MashMini cfg={mini.cfg} sound={sound} onDone={onDone}/></MiniShell>);
};

// ── DEAL SCENE — noir transaction vignette for big exchanges ──
const FigYou=()=>(
  <svg width="64" height="92" viewBox="0 0 64 92">
    <circle cx="34" cy="16" r="11" fill="#05080E"/>
    <path d="M22 12 q12 -9 24 0 l-2 5 q-10 -6 -20 0 Z" fill="#05080E"/>
    <path d="M14 92 q2 -42 20 -54 q18 12 20 54 Z" fill="#070B14"/>
    <path d="M30 40 q22 2 30 12" stroke="#070B14" strokeWidth="9" strokeLinecap="round" fill="none"/>
  </svg>);
const FigBuyer=()=>(
  <svg width="64" height="92" viewBox="0 0 64 92">
    <circle cx="30" cy="17" r="10" fill="#05080E"/>
    <rect x="16" y="6" width="28" height="6" rx="2" fill="#05080E"/>
    <rect x="22" y="0" width="16" height="8" rx="2" fill="#05080E"/>
    <path d="M10 92 q2 -40 20 -52 q18 12 20 52 Z" fill="#0A0E18"/>
    <path d="M34 40 q-22 2 -30 12" stroke="#0A0E18" strokeWidth="9" strokeLinecap="round" fill="none"/>
    <path d="M26 42 L34 58 M34 42 L26 58" stroke="#101626" strokeWidth="3"/>
  </svg>);
const VanRear=()=>(
  <svg width="92" height="92" viewBox="0 0 92 92">
    <rect x="10" y="18" width="72" height="56" rx="5" fill="#0A0E18"/>
    <rect x="16" y="24" width="60" height="34" rx="3" fill="#05080E"/>
    <rect x="45" y="24" width="2" height="34" fill="#141A2A"/>
    <rect x="14" y="62" width="14" height="7" rx="2" fill="#FF3344" style={{filter:"drop-shadow(0 0 6px #FF3344)"}}/>
    <rect x="64" y="62" width="14" height="7" rx="2" fill="#FF3344" style={{filter:"drop-shadow(0 0 6px #FF3344)"}}/>
    <rect x="6" y="74" width="80" height="9" rx="3" fill="#04060A"/>
  </svg>);
const DealSceneFX=({d})=>{
  const cap={sale:"DEAL CLOSED",pager:"📟 PAGER DEAL FILLED",buy:"RE-UP SECURED",shipment:"SHIPMENT LANDED"}[d.kind];
  const col={sale:C.green,pager:C.gold,buy:C.blue,shipment:C.gold}[d.kind];
  const productGoesRight=d.kind!=="buy"&&d.kind!=="shipment";
  return(
  <div style={{position:"fixed",left:"50%",top:"34%",transform:"translate(-50%,-50%)",zIndex:58,
    width:312,pointerEvents:"none",animation:"popIn .22s cubic-bezier(.34,1.56,.64,1)"}}>
    <div style={{position:"relative",borderRadius:12,overflow:"hidden",padding:"14px 14px 10px",
      background:"linear-gradient(180deg,#0A1222 0%,#060B16 100%)",
      border:`1px solid ${col}55`,boxShadow:`0 12px 50px rgba(0,0,0,.75), 0 0 28px ${col}22`}}>
      <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(176deg, ${col}10 0 8px, transparent 8px 22px)`}}/>
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px)"}}/>
      <div style={{position:"absolute",top:0,bottom:0,width:"34%",
        background:"linear-gradient(105deg,transparent,#ffffff22,transparent)",animation:"sweepPass .9s ease .15s both"}}/>
      <div style={{position:"relative",display:"flex",alignItems:"flex-end",justifyContent:"space-between",height:96}}>
        <div style={{animation:"figL .3s ease both"}}><FigYou/></div>
        <div style={{position:"absolute",left:54,top:14,fontSize:21,
          animation:`${productGoesRight?"arcLR":"arcRL"} .85s ease .25s both`,
          filter:"drop-shadow(0 2px 5px #000)",...(productGoesRight?{}:{left:"auto",right:54})}}>
          {d.kind==="shipment"?null:d.emoji}
        </div>
        {d.cash>0&&<div style={{position:"absolute",left:productGoesRight?"auto":54,right:productGoesRight?54:"auto",top:36,
          fontFamily:ft,fontSize:13,fontWeight:"bold",color:C.gold,textShadow:`0 0 8px ${C.gold}`,
          animation:`${productGoesRight?"arcRL":"arcLR"} .85s ease .32s both`}}>💵</div>}
        {d.kind==="shipment"
          ?<><div style={{position:"absolute",left:"50%",top:8,transform:"translateX(-50%)",fontSize:24,
              animation:"crateDrop .7s ease .3s both",filter:"drop-shadow(0 3px 6px #000)"}}>📦</div>
            <div style={{animation:"figR .3s ease both"}}><VanRear/></div></>
          :<div style={{animation:"figR .3s ease both"}}><FigBuyer/></div>}
      </div>
      <div style={{position:"relative",textAlign:"center",marginTop:6,animation:"dsCaption .3s ease .5s both"}}>
        <span style={{fontFamily:ft,fontSize:12,fontWeight:"bold",letterSpacing:2,color:col,
          textShadow:`0 0 10px ${col}88`}}>{cap}</span>
        <span style={{fontFamily:ft,fontSize:11,color:C.dim}}>  ◆  {d.qty}× {d.emoji}{d.cash>0?` ◆ ${FM(d.cash)}`:""}</span>
      </div>
    </div>
  </div>);
};

// ── Flight layer — cash AND product particles, any origin → any target ──
const FlightLayer=({flights})=>(
  <div style={{position:"fixed",inset:0,zIndex:49,pointerEvents:"none"}}>
    {flights.map(f=><FlyP key={f.id} f={f}/>)}
  </div>
);
const FlyP=({f})=>{
  const [go,setGo]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setGo(true),20+f.delay); return ()=>clearTimeout(t); },[]);
  const isCash=f.emoji==="$";
  return <div style={{position:"absolute",left:f.x,top:f.y,fontFamily:ft,fontWeight:"bold",
    fontSize:f.big?(isCash?20:22):(isCash?15:17),
    color:isCash?C.gold:"#fff",
    textShadow:isCash?`0 0 8px ${C.gold}`:"0 0 8px #ffffff88, 0 2px 4px #000",
    transform:go?`translate(${f.ex-f.x}px,${f.ey-f.y}px) scale(${f.fade?".9":".4"}) rotate(${isCash?300:140}deg)`
                :"translate(0,0) scale(1) rotate(0deg)",
    opacity:go?(f.fade?0:0.1):1,
    transition:`transform ${.45+f.delay/900}s cubic-bezier(.45,-0.25,.25,1), opacity ${.45+f.delay/900}s ease`}}>{f.emoji}</div>;
};

// ═══════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════
const ComicScreen=({idx,onTap,onSkip})=>{
  const p=COMIC_PANELS[idx];
  return(
    <div onClick={onTap} style={{position:"fixed",inset:0,background:p.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",cursor:"pointer",animation:"fadeIn .35s ease",zIndex:40}}>
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 2px, transparent 2px 5px)"}}/>
      <div key={idx} style={{textAlign:"center",padding:24,animation:"popIn .45s ease"}}>
        <div style={{fontSize:64,marginBottom:18,filter:"drop-shadow(0 0 18px rgba(255,255,255,.3))"}}>{p.icon}</div>
        <div style={{fontFamily:ft,fontWeight:"bold",fontSize:24,color:"#fff",letterSpacing:2,
          textShadow:"3px 3px 0 #000, 0 0 24px rgba(255,45,123,.6)",marginBottom:12,maxWidth:320}}>{p.text}</div>
        <div style={{fontFamily:fb,fontSize:15,fontStyle:"italic",color:"#E8D8C8",textShadow:"1px 1px 0 #000",maxWidth:280,margin:"0 auto",lineHeight:1.5}}>{p.sub}</div>
      </div>
      <div style={{position:"absolute",bottom:34,display:"flex",gap:8}}>
        {COMIC_PANELS.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i===idx?C.pink:"#ffffff44",boxShadow:i===idx?`0 0 8px ${C.pink}`:"none"}}/>)}
      </div>
      <button onClick={e=>{e.stopPropagation();onSkip();}} style={{position:"absolute",top:16,right:16,...bt(C.dim),padding:"7px 12px",fontSize:11,background:"rgba(0,0,0,.4)"}}>SKIP ▸</button>
      <div style={{position:"absolute",bottom:60,fontFamily:ft,fontSize:9,color:"#fff8",letterSpacing:2}}>TAP TO CONTINUE</div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TITLE TREATMENT — neon tube logo + atmosphere bed
// ═══════════════════════════════════════════════════════════════
const TitleLogo=()=>(
  <div style={{position:"relative",display:"inline-block",lineHeight:1.04,padding:"0 2px"}}>
    {/* bloom ghost sitting behind the tube */}
    <span aria-hidden="true" style={{position:"absolute",left:2,top:0,whiteSpace:"nowrap",
      fontFamily:ft,fontWeight:"bold",fontSize:46,letterSpacing:3,color:C.pink,
      filter:"blur(9px)",animation:"logoHum 3.8s ease-in-out infinite",pointerEvents:"none"}}>COCAINE</span>
    {/* the tube itself */}
    <span style={{position:"relative",display:"inline-block",whiteSpace:"nowrap",
      fontFamily:ft,fontWeight:"bold",fontSize:46,letterSpacing:3,color:"#FFF1F7",
      WebkitTextStroke:`1.1px ${C.pink}`,
      textShadow:`0 0 5px #fff, 0 0 13px ${C.pink}, 0 0 32px ${C.pink}cc, 0 0 64px ${C.pink}66`,
      animation:"logoBuzz 5.4s linear infinite"}}>COCAINE</span>
    {/* glass shine sweeping the tube */}
    <span style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      <span style={{position:"absolute",top:0,bottom:0,left:0,width:"34%",display:"block",
        background:"linear-gradient(90deg, transparent, rgba(255,255,255,.20), transparent)",
        animation:"shineSweep 5s ease-in-out 1.4s infinite"}}/>
    </span>
  </div>
);

// Two sibling roots on purpose: the bed sits UNDER the title content (z 0),
// the CRT glass sits OVER it (z 9). One wrapper could not do both.
const TitleFX=()=>(<>
  <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
    {/* low fog banks rolling across the middle distance */}
    <div style={{position:"absolute",left:"-20%",right:"-20%",top:"38%",height:70,willChange:"transform",
      background:`radial-gradient(60% 100% at 30% 50%, ${C.purple}44, transparent 70%), radial-gradient(50% 100% at 78% 50%, ${C.pink}33, transparent 70%)`,
      filter:"blur(14px)",animation:"fogRoll 22s ease-in-out infinite alternate"}}/>
    <div style={{position:"absolute",left:"-20%",right:"-20%",top:"52%",height:56,willChange:"transform",
      background:`radial-gradient(55% 100% at 62% 50%, ${C.blue}33, transparent 72%)`,
      filter:"blur(16px)",animation:"fogRoll 31s ease-in-out 3s infinite alternate-reverse"}}/>
    {/* neon horizon line where the grid floor begins */}
    <div style={{position:"absolute",left:0,right:0,bottom:"34%",height:2,background:C.pink,opacity:.85,
      boxShadow:`0 0 10px ${C.pink}, 0 0 30px ${C.pink}, 0 0 70px ${C.pink}88`}}/>
    <div style={{position:"absolute",left:0,right:0,bottom:"34%",height:60,
      background:`linear-gradient(180deg, ${C.pink}33, transparent)`,opacity:.5}}/>
    {/* foreground palm silhouettes */}
    <svg viewBox="0 0 60 120" style={{position:"absolute",left:-6,bottom:0,width:112,height:224,opacity:.92,
      transformOrigin:"50% 100%",animation:"palmSway 7s ease-in-out infinite"}}>
      <path fill="#03060E" d="M30 120 q3 -46 1 -70 q14 6 20 -3 q-12 1 -17 -5 q14 -3 17 -12 q-14 3 -20 0 q3 -12 12 -15 q-14 0 -17 9 q-4 -9 -15 -11 q8 5 9 15 q-9 -3 -17 2 q10 3 17 9 q-10 4 -16 1 q7 10 19 7 q-3 17 0 73 Z"/>
    </svg>
    <svg viewBox="0 0 60 120" style={{position:"absolute",right:-10,bottom:0,width:96,height:192,opacity:.9,
      transform:"scaleX(-1)",transformOrigin:"50% 100%",animation:"palmSway 9s ease-in-out 1.5s infinite"}}>
      <path fill="#03060E" d="M30 120 q3 -42 1 -64 q13 6 19 -3 q-11 1 -16 -5 q13 -3 16 -11 q-13 3 -19 0 q3 -11 11 -14 q-13 0 -16 8 q-4 -8 -14 -10 q7 5 8 14 q-8 -3 -16 2 q9 3 16 8 q-9 4 -15 1 q7 9 18 6 q-3 16 0 68 Z"/>
    </svg>
  </div>
  {/* CRT glass, over the title content */}
  <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:9}}>
    <div style={{position:"absolute",left:0,right:0,top:"-100%",height:"300%",opacity:.42,willChange:"transform",
      background:"repeating-linear-gradient(0deg, rgba(0,0,0,.3) 0 1px, rgba(0,0,0,0) 1px 3px)",
      animation:"crtRoll 12s linear infinite"}}/>
    <div style={{position:"absolute",inset:0,opacity:.3,willChange:"transform",
      background:`radial-gradient(120% 92% at -10% 50%, ${C.pink}3a, transparent 40%), radial-gradient(120% 92% at 110% 50%, ${C.blue}3a, transparent 40%)`,
      animation:"aberrJit 3.7s ease-in-out infinite"}}/>
    <div style={{position:"absolute",inset:0,
      background:"radial-gradient(122% 102% at 50% 42%, transparent 42%, rgba(0,0,0,.58) 100%)"}}/>
    <div style={{position:"absolute",left:"-6%",right:"-6%",height:24,willChange:"transform",
      background:"linear-gradient(180deg, rgba(0,0,0,0), rgba(255,255,255,.32), rgba(0,229,255,.22), rgba(0,0,0,0))",
      animation:"trackGlitch 9s linear 2s infinite"}}/>
  </div>
</>);

const TitleScreenV5=({meta,onPlay,onSound})=>(
  <div style={{minHeight:"100dvh",background:`linear-gradient(180deg, #12082E 0%, #2A0E45 30%, ${C.midnight} 62%)`,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    padding:"34px 16px 60px",position:"relative",overflow:"hidden"}}>
    <TitleFX/>
    <div style={{position:"absolute",left:"-30%",right:"-30%",bottom:0,height:"34%",transform:"perspective(220px) rotateX(58deg)",transformOrigin:"bottom",
      background:`repeating-linear-gradient(0deg, ${C.pink}33 0 2px, transparent 2px 44px), repeating-linear-gradient(90deg, ${C.pink}33 0 2px, transparent 2px 44px)`,
      animation:"gridScroll 2.4s linear infinite",maskImage:"linear-gradient(0deg, transparent, #000 70%)"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,opacity:.62,
      maskImage:"linear-gradient(180deg,#000 48%,transparent 100%)",WebkitMaskImage:"linear-gradient(180deg,#000 48%,transparent 100%)"}}>
      <MiamiSkyDeluxe move={2} heat={0} locColor={C.pink} locIdx={0} plain/>
    </div>
    <div style={{position:"relative",textAlign:"center",marginBottom:22,zIndex:2}}>
      <TitleLogo/>
      <div style={{fontFamily:ft,fontWeight:"bold",fontSize:58,letterSpacing:6,lineHeight:1,
        background:`linear-gradient(180deg,#fff 12%, ${C.blue} 38%, #0A2A55 50%, ${C.blue} 60%, #fff 90%)`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        filter:`drop-shadow(0 0 14px ${C.blue}88)`}}>80s</div>
      <div style={{fontFamily:ft,fontSize:9,letterSpacing:5,color:C.gold,marginTop:6}}>★ ELEVEN DAYS ★ MIAMI 1986 ★</div>
      <div style={{fontFamily:fb,fontSize:13.5,fontStyle:"italic",color:C.text,marginTop:16,maxWidth:330,lineHeight:1.6}}>
        Your brother went into the water off Virginia Key eleven days ago. They ruled it accidental. It took them an afternoon.
      </div>
      <div style={{fontFamily:fb,fontSize:12.5,fontStyle:"italic",color:C.dim,marginTop:10,maxWidth:330,lineHeight:1.6}}>
        You came down on the bus to bury him. You are staying because he left a debt and a reputation, and this city cannot tell the two of you apart.
      </div>
    </div>
    <div style={{width:"100%",maxWidth:340,position:"relative",zIndex:2}}>
      <button style={{...bt(C.pink,true),width:"100%",fontSize:17,padding:"15px",boxShadow:`0 0 26px ${C.pink}77`}} onClick={onPlay}>
        ▶ GET OFF THE BUS
      </button>
      <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
        <button style={{...bt(C.blue),width:64}} onClick={onSound}>{meta.sound?"🔊":"🔇"}</button>
      </div>
      <div style={{fontFamily:ft,fontSize:8.5,letterSpacing:2,color:C.dim,textAlign:"center",marginTop:16}}>
        ONE STORY ◆ THREE ACTS ◆ ONE SITTING
      </div>
    </div>
  </div>
);

const TitleScreen=({meta,cfg,setCfg,onPlay,onSafehouse,onLedger,onSound})=>{
  const pb=PLAYBOOKS[cfg.pb];
  const dailyInfo=getDailySeed();
  const dailyMods=getDailyModifiers(dailyInfo.seed);
  const maxHeat=Math.min(HEAT_LADDER.length-1,(meta.maxHeatBeaten??-1)+1);
  return(
    <div style={{minHeight:"100dvh",background:`linear-gradient(180deg, #12082E 0%, #2A0E45 30%, ${C.midnight} 62%)`,
      display:"flex",flexDirection:"column",alignItems:"center",padding:"34px 16px 90px",position:"relative",overflow:"hidden"}}>
      {/* synthwave grid floor */}
<TitleFX/>
      <div style={{position:"absolute",left:"-30%",right:"-30%",bottom:0,height:"34%",transform:"perspective(220px) rotateX(58deg)",transformOrigin:"bottom",
        background:`repeating-linear-gradient(0deg, ${C.pink}33 0 2px, transparent 2px 44px), repeating-linear-gradient(90deg, ${C.pink}33 0 2px, transparent 2px 44px)`,
        animation:"gridScroll 2.4s linear infinite",maskImage:"linear-gradient(0deg, transparent, #000 70%)"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,opacity:.62,maskImage:"linear-gradient(180deg,#000 48%,transparent 100%)",WebkitMaskImage:"linear-gradient(180deg,#000 48%,transparent 100%)"}}>
        <MiamiSkyDeluxe move={2} heat={0} locColor={C.pink} locIdx={0} plain/>
      </div>
      <div style={{position:"relative",textAlign:"center",marginBottom:6}}>
        <TitleLogo/>
        <div style={{fontFamily:ft,fontWeight:"bold",fontSize:58,letterSpacing:6,lineHeight:1,
          background:`linear-gradient(180deg,#fff 12%, ${C.blue} 38%, #0A2A55 50%, ${C.blue} 60%, #fff 90%)`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          filter:`drop-shadow(0 0 14px ${C.blue}88)`}}>80s</div>
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:5,color:C.gold,marginTop:4}}>★ MIAMI 1986 ★ v4.0 NEON NOIR ★</div>
        <div style={{fontFamily:fb,fontSize:11.5,fontStyle:"italic",color:C.text,marginTop:8}}>Rise. Reign. <b style={{color:C.blue}}>Get out.</b> A three-act story in one sitting.</div>
      </div>
      {(meta.runs>0)&&<div style={{fontFamily:ft,fontSize:10,color:C.dim,marginBottom:10}}>
        BEST {FM(meta.bestNW)} ◆ RUNS {meta.runs} ◆ WINS {meta.wins}{(meta.winStreak||0)>=2&&<span style={{color:C.orange}}> 🔥×{meta.winStreak}</span>} ◆ <span style={{color:C.gold}}>REP {meta.rep}</span></div>}

      {/* playbook carousel */}
      <div style={{width:"100%",maxWidth:392,position:"relative",zIndex:2}}>
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,margin:"8px 0 6px"}}>◆ CHOOSE YOUR PLAYBOOK</div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch"}}>
          {PLAYBOOKS.map((p,i)=>{
            const locked=p.unlockRep&&meta.totalRep<p.unlockRep;
            return(<button key={p.id} onClick={()=>!locked&&setCfg({...cfg,pb:i})}
              style={{...bx,minWidth:108,flexShrink:0,textAlign:"center",cursor:locked?"default":"pointer",
                border:`1px solid ${i===cfg.pb?p.color:C.border}`,opacity:locked?.45:1,
                boxShadow:i===cfg.pb?`0 0 16px ${p.color}44`:"none",background:i===cfg.pb?`${p.color}12`:C.panel}}>
              <div style={{fontSize:22}}>{locked?"🔒":p.icon}</div>
              <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:i===cfg.pb?p.color:C.text}}>{p.name}</div>
              <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,marginTop:3,lineHeight:1.4}}>{locked?`${p.unlockRep} lifetime rep`:p.desc}</div>
            </button>);})}
        </div>
        <div style={{fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.dim,textAlign:"center",margin:"4px 0 10px"}}>"{pb.flavor}"</div>

        {/* heat ladder */}
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:6}}>◆ HEAT LEVEL</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
          {HEAT_LADDER.map((h,i)=>{
            const locked=i>maxHeat;
            return(<button key={i} onClick={()=>!locked&&setCfg({...cfg,heat:i})}
              style={{fontFamily:ft,fontSize:10,fontWeight:"bold",padding:"6px 9px",borderRadius:6,cursor:locked?"default":"pointer",
                border:`1px solid ${i===cfg.heat?C.orange:C.border}`,opacity:locked?.4:1,
                background:i===cfg.heat?`${C.orange}1c`:C.panel,color:i===cfg.heat?C.orange:C.dim}}>
              {locked?"🔒":""}{h.name.toUpperCase()}</button>);})}
        </div>
        <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginBottom:10}}>{HEAT_LADDER[cfg.heat].mods}</div>

        {/* daily case file */}
        <button onClick={()=>setCfg({...cfg,daily:!cfg.daily})} style={{...bx,width:"100%",textAlign:"left",cursor:"pointer",
          border:`1px solid ${cfg.daily?C.gold:C.border}`,boxShadow:cfg.daily?`0 0 16px ${C.gold}33`:"none",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:cfg.daily?C.gold:C.text}}>📁 DAILY CASE FILE #{dailyInfo.caseNumber}</div>
            <div style={{fontFamily:ft,fontSize:10,color:cfg.daily?C.gold:C.dim}}>{cfg.daily?"ON ◆ +20% REP":"TAP TO ACCEPT"}</div>
          </div>
          <div style={{fontFamily:ft,fontSize:9.5,color:C.dim,marginTop:5}}>
            {dailyMods.map(m=>`${m.icon} ${m.name}: ${m.desc}`).join("  ◆  ")}
          </div>
        </button>

        <button style={{...bt(C.pink,true),width:"100%",fontSize:17,padding:"15px",boxShadow:`0 0 26px ${C.pink}77`}} onClick={onPlay}>
          ▶ HIT THE STREETS
        </button>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button style={{...bt(C.gold),flex:1}} onClick={onSafehouse}>🏚 SAFEHOUSE — {meta.rep} REP</button>
          <button style={{...bt(C.green),flex:1}} onClick={onLedger}>📒 LEDGER</button>
          <button style={{...bt(C.blue),width:56}} onClick={onSound}>{meta.sound?"🔊":"🔇"}</button>
        </div>
      </div>
    </div>
  );
};

const SafehouseScreen=({meta,setMeta,onBack})=>{
  const buy=u=>{
    const lvl=meta.upgrades[u.id]||0;
    if(lvl>=u.maxLevel||meta.rep<u.cost){ if(meta.sound)SFX.error(); return; }
    const m={...meta,rep:meta.rep-u.cost,upgrades:{...meta.upgrades,[u.id]:lvl+1}};
    saveMeta(m); setMeta(m); if(meta.sound)SFX.sellBig();
  };
  return(
    <div style={{minHeight:"100dvh",background:C.midnight,padding:"22px 16px 60px",maxWidth:430,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <Neon color={C.gold} size={20}>🏚 THE SAFEHOUSE</Neon>
        <button style={{...bt(C.dim),padding:"7px 12px",fontSize:11}} onClick={onBack}>← BACK</button>
      </div>
      <div style={{fontFamily:fb,fontSize:13,fontStyle:"italic",color:C.dim,marginBottom:12}}>
        Permanent upgrades. Every run starts here. Reputation: <span style={{color:C.gold}}>{meta.rep}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {SAFEHOUSE_UPGRADES.map((u,i)=>{
          const lvl=meta.upgrades[u.id]||0, maxed=lvl>=u.maxLevel, afford=meta.rep>=u.cost;
          return(<button key={u.id} onClick={()=>buy(u)} style={{...bx,textAlign:"left",cursor:maxed?"default":"pointer",
            animation:`riseIn .3s ${i*.05}s ease both`,
            border:`1px solid ${maxed?C.gold:afford?C.border:"#111a28"}`,opacity:maxed?1:afford?1:.55}}>
            <div style={{fontSize:20}}>{u.icon}</div>
            <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:maxed?C.gold:C.text,margin:"3px 0"}}>{u.name}</div>
            <div style={{fontFamily:ft,fontSize:9,color:C.dim,lineHeight:1.4}}>{u.desc}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontFamily:ft,fontSize:10}}>
              <span style={{color:C.gold}}>{"★".repeat(lvl)}{"☆".repeat(u.maxLevel-lvl)}</span>
              <span style={{color:maxed?C.gold:afford?C.green:C.pink}}>{maxed?"MAXED":`${u.cost} REP`}</span>
            </div>
          </button>);})}
      </div>
    </div>
  );
};

const LedgerScreen=({meta,onBack})=>{
  const endingsInfo=[["witness","⚖️","THE WITNESS"],["inheritor","🪑","THE INHERITOR"],["ghost","👻","THE GHOST"],["escape","🛫","GHOSTED OUT"],["kingpin","👑","KING OF MIAMI"],["bust","🚔","DAWN RAID"],["dead","⚰️","JOHN DOE"],["broke","🚌","THE BUS HOME"]];
  const achGot=Object.keys(meta.ach||{}).length;
  return(
  <div style={{minHeight:"100dvh",background:C.midnight,padding:"22px 16px 60px",maxWidth:430,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <Neon color={C.green} size={20}>📒 THE LEDGER</Neon>
      <button style={{...bt(C.dim),padding:"7px 12px",fontSize:11}} onClick={onBack}>← BACK</button>
    </div>
    <div style={{fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.dim,marginBottom:14}}>Every empire keeps books. Yours are just harder to subpoena.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
      {[["RUNS",meta.runs],["WINS",meta.wins],["BEST",FM(meta.bestNW)],["BIGGEST SALE",FM(meta.biggestDeal||0)],["LIFETIME REP",meta.totalRep||0],["ACHIEVEMENTS",achGot+"/"+ACHIEVEMENTS.length]].map(([k,v])=>
        <div key={k} style={{...bx,padding:8,textAlign:"center"}}>
          <div style={{fontFamily:ft,fontSize:7.5,color:C.dim,letterSpacing:1}}>{k}</div>
          <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:C.text}}>{v}</div></div>)}
    </div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ ENDINGS COLLECTED</div>
    <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
      {endingsInfo.map(([id,icon,name])=>{const got=(meta.endings||{})[id];
        return(<div key={id} style={{...bx,minWidth:96,flexShrink:0,textAlign:"center",opacity:got?1:.4,
          border:`1px solid ${got?C.gold+"66":C.border}`}}>
          <div style={{fontSize:22,filter:got?"none":"grayscale(1) brightness(.5)"}}>{got?icon:"❓"}</div>
          <div style={{fontFamily:ft,fontSize:9,fontWeight:"bold",color:got?C.gold:C.dim,marginTop:3}}>{got?name:"???"}</div>
        </div>);})}
    </div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ ACHIEVEMENTS</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
      {ACHIEVEMENTS.map((a,i)=>{const got=(meta.ach||{})[a.id];
        return(<div key={a.id} style={{...bx,display:"flex",gap:8,alignItems:"center",opacity:got?1:.45,
          animation:`riseIn .3s ${i*.03}s ease both`,border:`1px solid ${got?C.gold+"55":C.border}`}}>
          <span style={{fontSize:17,filter:got?"none":"grayscale(1) brightness(.6)"}}>{a.icon}</span>
          <div><div style={{fontFamily:ft,fontSize:10,fontWeight:"bold",color:got?C.gold:C.dim}}>{a.name}</div>
          <div style={{fontFamily:ft,fontSize:8,color:C.dim,lineHeight:1.3}}>{got?a.desc:"???"}</div></div>
        </div>);})}
    </div>
    {(meta.topRuns||[]).length>0&&<>
      <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ TOP RUNS — THE POLAROID WALL</div>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6}}>
        {meta.topRuns.map((r,i)=>(<div key={i} style={{background:"#F2EEE4",padding:"7px 7px 16px",flexShrink:0,width:104,
          transform:`rotate(${(i%2?1:-1)*(2+i)}deg)`,boxShadow:"0 4px 14px rgba(0,0,0,.5)"}}>
          <div style={{background:C.midnight,height:64,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
            {{escape:"🛫",kingpin:"👑",bust:"🚔",dead:"⚰️",broke:"🚌"}[r.ending]||"🎰"}</div>
          <div style={{fontFamily:ft,fontSize:9.5,fontWeight:"bold",color:C.ink,marginTop:5,textAlign:"center"}}>{FM(r.nw)}</div>
          <div style={{fontFamily:fb,fontSize:8.5,fontStyle:"italic",color:"#5A5248",textAlign:"center"}}>{r.days} days · {r.ending}</div>
        </div>))}
      </div></>}
  </div>);
};

const PoliceScreen=({g,onAct})=>(
  <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",padding:20,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#FF173366,transparent 50%)",animation:"sirenWash 1s infinite"}}/>
    <div style={{position:"absolute",inset:0,background:`linear-gradient(270deg,${C.blue}66,transparent 50%)`,animation:"sirenWash 1s .5s infinite"}}/>
    <div style={{position:"relative",textAlign:"center",animation:"popIn .3s ease"}}>
      <div style={{fontSize:50,marginBottom:8}}>🚔</div>
      <Neon color="#FF1733" size={30}>MIAMI VICE</Neon>
      <div style={{fontFamily:fb,fontSize:15,fontStyle:"italic",color:C.text,margin:"12px 0 4px",maxWidth:290,lineHeight:1.5}}>
        Blue and red in the mirror. They're not passing. {g.npcState.ramirez.met?"You recognize the unmarked Ford. Ramirez's people.":""}
      </div>
      <div style={{fontFamily:ft,fontSize:10,color:C.dim,marginBottom:18}}>
        CARRYING {g.inv.reduce((a,b)=>a+b,0)} UNITS ◆ HEAT {g.fedHeat} ◆ {g.gun?"ARMED":"UNARMED"}
      </div>
      {g.npcState.ramirez.met&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><NPCFrame who="ramirez" mood="wry" w={104}/></div>}
      <div style={{display:"flex",flexDirection:"column",gap:9,width:268,margin:"0 auto"}}>
        <button style={bt(C.blue)} onClick={()=>onAct("run")}>🏃 RUN {g.lifestyle.includes("car")?"(Countach +20%)":""}</button>
        <button style={bt(C.pink)} onClick={()=>onAct("fight")}>👊 FIGHT {g.gun?"(armed 60%)":"(bare hands 30%)"}</button>
        <button style={bt(C.gold)} onClick={()=>onAct("bribe")}>💵 BRIBE — ~{FM(Math.max(500,Math.floor(g.cash*.15)))}</button>
      </div>
    </div>
  </div>
);

const PoliceResultScreen=({g,onContinue})=>(
  <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{maxWidth:330,textAlign:"center",animation:"popIn .3s ease"}}>
      <div style={{fontSize:44,marginBottom:10}}>{g.policeResult?.ok?"😮‍💨":"🚨"}</div>
      <Neon color={g.policeResult?.ok?C.green:C.pink} size={20}>{g.policeResult?.ok?"YOU GOT AWAY":"BUSTED"}</Neon>
      <div style={{fontFamily:fb,fontSize:15,fontStyle:"italic",color:C.text,margin:"14px 0 20px",lineHeight:1.55}}>{g.policeResult?.text}</div>
      <button style={{...bt(C.blue,true),width:"100%"}} onClick={onContinue}>CONTINUE ▸</button>
    </div>
  </div>
);

const BrokeScreenV5=({g,onTake,onBus})=>(
  <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{maxWidth:352,textAlign:"center",animation:"popIn .3s ease"}}>
      <div style={{fontSize:44,marginBottom:10}}>📕</div>
      <Neon color={C.pink} size={19}>NOTHING LEFT TO SELL</Neon>
      <div style={{fontFamily:fb,fontSize:14,fontStyle:"italic",color:C.text,margin:"14px 0 10px",lineHeight:1.6}}>
        No cash. No product. No bank. What you do have is a line of credit that belonged to a dead man, with VARGAS, N. written under VARGAS, C. in the same handwriting.
      </div>
      <div style={{fontFamily:fb,fontSize:13,fontStyle:"italic",color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
        There is a phone number for this. You call it from the motel lobby and a woman who sounds bored reads you the terms twice. Three thousand out. Twelve thousand on.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <button style={bt(C.gold)} onClick={onTake}>📕 TAKE THE $3,000 — the book goes up $12,000</button>
        <button style={bt(C.dim)} onClick={onBus}>🚌 GET ON THE BUS — César stays buried</button>
      </div>
    </div>
  </div>
);

const EscapeScreen=({g,onAttempt,onBack})=>{
  const total=g.cash+g.bank+(g.cleanCash||0);
  const turfCt=g.turf.filter(t=>t>0).length;
  const routes=[
    { id:"c_end_witness_"+(g.storyFlags.protected_maria?"p":g.storyFlags.betrayed_maria?"b":"n"),
      name:"THE WITNESS", icon:"⚖️", cost:0,
      desc:"The gallery, after closing. The routes, the schedules, the broker's name — and César stops being an accident.",
      ok:!!g.storyFlags.ending_witness, req:"Requires what you promised the detective", ending:"witness" },
    { id:"c_end_inheritor_"+(g.storyFlags.protected_maria?"p":g.storyFlags.betrayed_maria?"b":"n"),
      name:"THE INHERITOR", icon:"🪑", cost:0,
      desc:"The gallery, after closing. He goes home to Barranquilla and the good chair by the window stays in Miami, with you in it.",
      ok:!!g.storyFlags.ending_inheritor, req:"Requires the chair you accepted", ending:"inheritor" },
    { id:"c_end_ghost_"+(g.storyFlags.protected_maria?"p":g.storyFlags.betrayed_maria?"b":"n"),
      name:"THE GHOST", icon:"👻", cost:0,
      desc:"The gallery, after closing. Two handshakes, two cheap lies, and a boat bag in a trunk already pointed at the causeway.",
      ok:!!g.storyFlags.ending_ghost&&total>=25000,
      req:g.storyFlags.ending_ghost?"Needs $25,000 to leave with":"Requires the way out you chose", ending:"ghost" },
    { id:"route50", name:"THE FORGER'S PACKAGE", icon:"🛫", cost:40000,
      desc:"New passport, charter out of the Keys, numbered account in Grand Cayman.",
      ok:total>=40000, req:"Needs $40,000 total (cash + bank + clean)", ending:"escape" },
    { id:"maria", name:"MARIA'S PLANE", icon:"💃", cost:20000,
      desc:g.storyFlags.maria_exit_plan?"The seat is being held. Homestead. The pilot doesn't ask names.":"She knows a strip near Homestead. Two seats. She's offering you one.",
      ok:(g.storyFlags.maria_exit_plan?(g.npcState.maria.trust||0)>=4:(g.npcState.maria.trust||0)>=6)&&total>=20000&&!g.storyFlags.sold_the_seat,
      req:g.storyFlags.sold_the_seat?"You sold this seat. The plane left Tuesday.":g.storyFlags.maria_exit_plan?"Maria trust 4+ and $20,000":"Maria trust 6+ and $20,000", ending:"escape" },
    { id:"cass", name:"CASS'S NUMBERED ACCOUNT", icon:"🏦", cost:35000,
      desc:"Zurich via Panama via a funeral home in Hialeah. You become a wire transfer, then a rumor.",
      ok:(g.npcState.cass&&g.npcState.cass.trust>=2)&&total>=35000&&!g.storyFlags.cass_burned,
      req:g.storyFlags.cass_burned?"Cass remembers things wrong about you now.":"Cass trust 2+ and $35,000", ending:"escape" },
    { id:"photograph", name:"THE HEAD START", icon:"📷", cost:10000,
      desc:"Ramirez burned two hundred and six pages behind a dead Zayre and told you to be gone. Gone means gone.",
      ok:!!g.storyFlags.ramirez_debt&&total>=10000,
      req:g.storyFlags.ramirez_vendetta?"He spent his vacation on you. There is no head start.":"Needs the detective's debt and $10,000", ending:"escape" },
    { id:"shrimp_boat", name:"THE ISLAMORADA BOAT", icon:"🦈", cost:15000,
      desc:"A shrimp boat with a bad radio and a good captain. Eleven hundred islands, forty police officers, and Thursday.",
      ok:!!g.storyFlags.shark_boat&&(g.npcState.tiburon&&(g.npcState.tiburon.trust||0)>=2)&&total>=15000,
      req:"Needs Tiburon's boat, trust 2+ and $15,000", ending:"escape" },
    { id:"second_seat", name:"THE SECOND SEAT", icon:"💺", cost:20000,
      desc:"Same strip near Homestead, worse plane, no discount. She wrote it on a clipboard, which is more binding than a contract.",
      ok:!!g.storyFlags.seat_rebought&&total>=20000,
      req:"Needs the seat you bought back and $20,000", ending:"escape" },
    { id:"medellin", name:"THE INVITATION", icon:"✈️", cost:30000,
      desc:"Not an escape. A TRANSFER. A farm above the valley, a telephone that rings when he wants it to, and no return leg.",
      ok:!!g.storyFlags.cartel_supplier&&(g.npcState.colombiano&&(g.npcState.colombiano.trust||0)>=4)&&total>=30000&&!g.storyFlags.became_informant,
      req:g.storyFlags.became_informant?"You talked to the government. There is no invitation.":"Needs cartel supply, standing 4+ and $30,000", ending:"escape" },
    { id:"quiet_crown", name:"THE QUIET CROWN", icon:"🃏", cost:0,
      desc:"No rooftop, no press. The rival left through departures, the honest cop burned his own file, and nobody announced anything.",
      ok:!!g.storyFlags.col_exile_witnessed&&!!g.storyFlags.ramirez_debt&&g.cred>=60&&(g.totalProfit||0)>=250000&&turfCt>=3,
      req:"Cartel exiled, detective's debt, cred 60+, $250K, 3 districts", ending:"kingpin" },
    { id:"kingpin", name:"CLAIM THE CITY", icon:"👑", cost:0,
      desc:"Stop running. Make Miami yours. Forever has a price — paid in advance.",
      ok:g.cred>=80&&(g.totalProfit||0)>=500000&&turfCt>=4, req:"Cred 80+, $500K profit, 4 districts", ending:"kingpin" },
  ];
  return(
    <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,padding:"26px 18px",overflowY:"auto"}}>
      <div style={{maxWidth:392,margin:"0 auto"}}>
        <Neon color={C.blue} size={22}>THE WAY OUT</Neon>
        <div style={{fontFamily:fb,fontSize:13,fontStyle:"italic",color:C.dim,margin:"8px 0 16px"}}>
          Every empire ends. The only question is who writes the ending. Liquid: <span style={{color:C.green}}>{FM(total)}</span>
        </div>
        {routes.map((r,i)=>(
          <div key={r.id} style={{...bx,marginBottom:10,opacity:r.ok?1:.55,animation:`riseIn .3s ${i*.07}s ease both`,
            border:`1px solid ${r.ok?(r.ending==="kingpin"?C.gold:C.blue):C.border}`}}>
            <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:r.ending==="kingpin"?C.gold:C.blue}}>{r.icon} {r.name}</div>
            <div style={{fontFamily:fb,fontSize:12.5,fontStyle:"italic",color:C.text,margin:"5px 0",lineHeight:1.45}}>{r.desc}</div>
            <div style={{fontFamily:ft,fontSize:9.5,color:C.dim,marginBottom:8}}>{r.req}</div>
            {r.ok&&<button style={{...bt(r.ending==="kingpin"?C.gold:C.blue,true),width:"100%"}}
              onClick={()=>onAttempt(r)}>{r.cost?`GO — ${FM(r.cost)}`:"TAKE THE THRONE"}</button>}
          </div>))}
        <button style={{...bt(C.dim),width:"100%",marginTop:4}} onClick={onBack}>← NOT YET</button>
      </div>
    </div>
  );
};

const LastNightScreen=({g,onCommit,onBack})=>{
  const committed=commitmentOf(g);
  const total=g.cash+g.bank+(g.cleanCash||0);
  const pl=protectedList(g), bl=betrayedList(g);
  const NAMES={maria:"MARIA",ramirez:"RAMIREZ",colombiano:"EL COLOMBIANO"};
  const rows=[...ENDING_ROUTES].sort((a,b)=>(b.id===committed?1:0)-(a.id===committed?1:0));
  const cost=r=>{
    if(r.id==="witness") return pl.includes("maria")
      ? "Maria keeps the gallery and stops returning your calls. You do not come back to Florida."
      : "Maria takes four years. The gallery is a shoe store by spring. You do not come back to Florida.";
    if(r.id==="inheritor") return pl.includes("maria")
      ? "Maria leaves Miami. You stay, in his chair, using his sentences."
      : "Maria stays and works for you, which is worse. You use his sentences either way.";
    return pl.includes("maria")
      ? `You and ${FM(total)} leave, and she comes. César's file stays closed, and it was you who closed it.`
      : `You and ${FM(total)} leave. She finds out from the Herald. César's file stays closed, and it was you who closed it.`;
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,padding:"26px 18px",overflowY:"auto"}}>
      <div style={{maxWidth:392,margin:"0 auto"}}>
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:4,color:C.dim,marginBottom:8}}>— THE LAST NIGHT —</div>
        <Neon color={C.flamingo} size={21}>THE GALLERY, AFTER CLOSING</Neon>
        <div style={{fontFamily:fb,fontSize:13.5,fontStyle:"italic",color:C.text,margin:"12px 0 6px",lineHeight:1.6}}>
          Maria locked the door at nine and left the lights on, because the paintings get lit whether or not anybody is looking at them. Ramirez is by the window with a coffee he is not drinking. El Colombiano is already sitting down.
        </div>
        <div style={{fontFamily:fb,fontSize:12.5,fontStyle:"italic",color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
          All three of them want the same thing in different words.{committed?" You already told one of them you would.":""}
        </div>
        {rows.map((r,i)=>{
          const isC=r.id===committed;
          return(
          <div key={r.id} style={{...bx,marginBottom:10,animation:`riseIn .3s ${i*.08}s ease both`,
            border:`1px solid ${isC?r.color:C.border}`,boxShadow:isC?`0 0 18px ${r.color}33`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
              <span style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:r.color}}>{r.icon} {r.name}</span>
              {isC&&<span style={{fontFamily:ft,fontSize:8,letterSpacing:1,color:r.color,whiteSpace:"nowrap"}}>YOU SAID YOU WOULD</span>}
            </div>
            <div style={{fontFamily:fb,fontSize:12.5,fontStyle:"italic",color:C.text,margin:"6px 0",lineHeight:1.5}}>{r.blurb}</div>
            <div style={{fontFamily:ft,fontSize:9.5,color:C.dim,marginBottom:9,lineHeight:1.5}}>◆ {cost(r)}</div>
            <button style={{...bt(r.color,isC),width:"100%"}} onClick={()=>onCommit(r.id)}>DO IT</button>
          </div>);})}
        <div style={{fontFamily:ft,fontSize:9,color:C.dim,textAlign:"center",margin:"4px 0 10px",lineHeight:1.6}}>
          {bl.length?`ALREADY GIVEN UP: ${bl.map(k=>NAMES[k]).join(" ◆ ")}`:"YOU HAVE NOT GIVEN ANYBODY UP. YET."}
          {pl.length?` ◆ SHIELDED: ${pl.map(k=>NAMES[k]).join(" ◆ ")}`:""}
        </div>
        <button style={{...bt(C.dim),width:"100%"}} onClick={onBack}>← NOT TONIGHT</button>
      </div>
    </div>
  );
};

// ── THE ENDING — the last night, at the gallery, after closing. Three variants,
//    each further varied by whether Maria was protected, betrayed, or neither. ──
const C_END_BASE={
  witness:{ who:"ramirez", mood:"tired", title:"THE WITNESS", color:C.blue, lines:[
    "The gallery closes at seven. At half past nine there are still three cars on Ponce and three people standing apart in a white room with a horse in it, and nobody has turned the track lighting off, because turning it off would mean the evening was over.",
    "You give Ramirez the routes, the schedules, the two warehouses in Doral and the name of the customs broker, and he writes it all down in a notebook he has been carrying since April. He does not say thank you. He says “Okay” eleven times, and then he stops writing and looks at the floor and keeps looking at it.",
    "It takes eighteen months. César Vargas is reclassified in a paragraph on page 6B — HOMICIDE, UNSOLVED — which is the closest thing to a resurrection the Herald offers. You testify four times. You do not come back to Florida. Not for the verdict. Not for anything.",
  ] },
  inheritor:{ who:"colombiano", mood:"pleased", title:"THE INHERITOR", color:C.orange, lines:[
    "The gallery closes at seven. By ten the wine is gone and so is the detective, who left the way men leave when they have finally understood something, and the man in the cream suit is still in the good chair by the window, because it is the only kind of chair he has ever sat in.",
    "“Barranquilla,” he says, as though it were a season. He sets his glass down on somebody else’s desk without a coaster, which is the most disrespectful thing you have ever watched a man do gently. “It is yours. Say something to me now, so that I can hear how you sound.”",
    "You tell him the route will keep its schedule and that nothing needs to change this year. And you hear the sentence leave your mouth — the pace of it, the small pause before the last word, the courtesy that is not courtesy — and you understand that you have been practising this without knowing, and that you are now a man who could order what was ordered on your brother, and that it would not even take anger.",
  ] },
  ghost:{ who:"maria", mood:"knowing", title:"THE GHOST", color:C.flamingo, lines:[
    "The gallery closes at seven. By eleven you have shaken two hands you will never shake again and told two lies that cost nothing, and the money is in a boat bag in the trunk of a car already pointed at the causeway.",
    "Ramirez walks you to the door, because he is that kind of man. “If you ever want to tell me anything,” he says, and then cannot find the end of the sentence, so he pats the doorframe twice like a horse and goes to his car. He will work César Vargas until 1994. It will never move an inch.",
    "Nobody is punished. Not the man in the cream suit, who goes home when he decides to. Not the detective, who keeps his pension and his cardboard box. Not you. César’s file stays closed, and it stays closed because you closed it, and that was the whole transaction, and there was no other bidder.",
  ] },
};
const C_END_MARIA={
  witness:{
    p:"Maria keeps the gallery. Her name is nowhere in the filings, which cost you a year off the deal you could have had. She sends a card the first Christmas and nothing after that, and when you call the number it rings in a room where somebody is deciding not to pick it up.",
    b:"Maria gets four years at Marianna and the gallery is auctioned to a dentist who paints. The last thing she ever says to you is at the sentencing, in Spanish, quietly, and the interpreter — correctly — declines to translate it.",
    n:"Maria is named twice in the indictment and neither time as a defendant, which is luck and not mercy, and she knows the difference. She keeps the gallery and she keeps the distance. Somebody has to stay in a city. It was never going to be you.",
  },
  inheritor:{
    p:"Maria is gone by February. She sells the gallery to a couple from Atlanta and leaves no number, and you let her, and that is the last expensive thing you ever do for anybody. The horse painting is still on the wall. Nobody has ever bought it.",
    b:"Maria stays. She comes in Tuesdays with the books and calls you señor in front of other people, and she is very good at it, and neither of you has ever once mentioned the thing you did. That is the arrangement. It holds for years.",
    n:"Maria neither leaves nor stays; she simply becomes somebody you do business with. There is a Thursday in the spring when you realise you cannot remember the last time she used your first name. It does not bother you. Later, that bothers you.",
  },
  ghost:{
    p:"Maria is on the boat at four in the morning with one suitcase and the ledger she should have burned, complaining about the seats. Somewhere past Bimini she says, “He would have hated this,” and you both laugh, and then neither of you says his name again for eleven years.",
    b:"Maria finds out from the Herald, three weeks later, in a paragraph about a gallery she no longer owns. She reads it twice. Then she goes to work, because the alternative is not going to work, and she has never once had that option.",
    n:"Maria hears about it the way everybody in Coral Gables hears about everything — from somebody at a party, incorrectly, and then later, correctly, from nobody at all. She keeps the gallery. She stops asking after people who leave.",
  },
};
const C_ENDING_FINALES=(()=>{
  const out={};
  for(const k of Object.keys(C_END_BASE)){
    const b=C_END_BASE[k];
    for(const m of ["p","b","n"]) out["c_end_"+k+"_"+m]={...b, lines:[...b.lines, C_END_MARIA[k][m]]};
  }
  return out;
})();

const FINALES={
  ...C_ENDING_FINALES,
  witness:{ who:"ramirez", mood:"tired", title:"THE WITNESS", color:C.blue,
    lines:g=>[
      "Ramirez does not sit down. He stands in front of a canvas that costs more than his car and says, to the canvas, that the U.S. Attorney is going to want it in writing.",
      "You give it to him on the fourth floor of the federal building over four days, in whatever order he asks for. On the second day he stops taking notes and just listens, which is worse. On the fourth he says thank you, and that is the last complete sentence he ever says to you.",
      "The network comes apart over eighteen months the way a sweater does — one thread, patiently, pulled by a man who has nothing else. César Vargas is entered into the record as a cooperating source, which is the nearest thing to a headstone the federal government issues.",
      protectedList(g).includes("maria")
        ? "Maria keeps the gallery. She also stops answering, and never explains it, and never needs to. Years later somebody mentions, secondhand, that one of Elena's photographs hangs where the horse used to be."
        : "Maria takes four years, and the gallery is a shoe store by spring. You watch the sentencing from a room in Wichita, under a name you still have to practise before you say it out loud.",
    ] },
  inheritor:{ who:"colombiano", mood:"pleased", title:"THE INHERITOR", color:C.gold,
    lines:g=>[
      "He takes the chair by the window without being offered it, which is how kings sit, and tells you the flight to Barranquilla is Thursday, and that it has always been Thursday.",
      "“You want me to say that I gave the order,” he says, unhurried, the way a man mentions weather. “I gave the order. It was not anger. Your brother became a maintenance problem and I performed maintenance. You will do it too one day, and you will be surprised how little it weighs.”",
      "Nothing is announced. On Monday the corners are supplied exactly as they were on Friday. In November a man out past the Palmetto asks you for two more weeks, and you hear yourself answer — courteous, unhurried, in a voice that is not entirely yours — that two weeks is a long time in this business.",
      protectedList(g).includes("maria")
        ? "Maria leaves Miami in the spring without a forwarding address and without a scene, which is the most Maria thing she ever does."
        : "Maria stays. She does the books now, and she is extremely good at it, and neither of you has ever once said out loud what that means.",
    ] },
  ghost:{ who:"maria", mood:"knowing", title:"THE GHOST", color:C.green,
    lines:g=>[
      "Nobody makes a speech. Ramirez has a case that is going nowhere and knows it. El Colombiano sent flowers, which is his way of attending. You stand in a white room with a horse in it and understand that you are the only person here who knows what everybody else is doing.",
      "The Eastern flight boards at 6:40 in the morning. Nobody is running. Nobody is following. You keep waiting for the part where somebody stops you, and the part never comes, and that is the part that stays.",
      "César's file stays closed. It is four pages long. Two of them are the same page, photocopied twice by somebody in a hurry in August, and it will sit in a basement on NW 2nd Avenue until the building is sold.",
      protectedList(g).includes("maria")
        ? "Maria is in the seat beside you doing inventory on a clipboard at thirty thousand feet, because she is incapable of waiting like a normal person. Neither of you looks down."
        : "Maria finds out from the Herald four days later, in a paragraph so small she almost misses it. She keeps the paragraph. She could not tell you why.",
    ] },
  photograph:{ who:"ramirez", mood:"tired", title:"THE HEAD START", color:C.blue,
    lines:["He does not come to see you off, because that would be a thing a friend does and this is not that. He sends a message through a barber on Calle Ocho: nine words, no signature. NORTHBOUND LANES ARE CLEAR UNTIL SIX. GO NOW.",
      "You take US 1 out of Dade County at 4:40 in the morning with the windows down, past the Krome Avenue turnoff, past the last streetlight, past the point where the radio stations start belonging to somebody else.",
      "In a parking lot behind a closed department store, ash from two hundred and six pages is still in a shopping cart, and a man who makes thirty-eight thousand dollars a year is at home, awake, deciding for the rest of his life whether he did the right thing."] },
  shrimp_boat:{ who:"tiburon", mood:"neutral", title:"ELEVEN HUNDRED ISLANDS", color:C.green,
    lines:["The boat smells like diesel and forty years of ice, and the captain is somebody’s cousin, and Tiburón stands on the dock in a shirt with parrots on it, waving with a fillet knife like a man seeing off a cruise.",
      "“Remember the geography, amigo!” he shouts across the water. “There is no smuggler! There is only a fishing guide, and there is THURSDAY!” The gold tooth catches the last of the dock light and then the dock light is gone.",
      "Somewhere south of Marathon the water turns a color that does not exist in Miami. Nobody files a report, because nobody has anything to report: a boat went out, a boat came back, and the manifest said ice."] },
  second_seat:{ who:"maria", mood:"knowing", title:"THE SECOND CHARTER", color:C.flamingo,
    lines:["The plane is worse this time — a Cessna with one working landing light and a pilot who apologizes for the seat belt. Maria is already on board, doing inventory on a clipboard at five in the morning, because she is incapable of waiting like a normal person.",
      "“You bought this seat twice,” she says, without looking up. “That is either the most expensive lesson in Dade County or the only one that ever took. I have decided not to tell you which.”",
      "At altitude she finally puts the clipboard down and looks out the window at the pink and blue and gold of a city that is no longer a factor in either of your lives. “God,” she says. “It really is beautiful from the outside.”"] },
  medellin:{ who:"colombiano", mood:"pleased", title:"THE INVITATION", color:C.orange,
    lines:["There is no forger, no charter, no numbered account. There is a first-class ticket in your own name and a customs officer in Rionegro who takes your passport, looks at nothing, and says “Welcome home, señor,” in a country you have never been to.",
      "“You misunderstand what has happened,” El Colombiano says on the drive up into the valley, where the air gets thin and green. “You did not escape Miami. Miami was a POSITION, and we have moved you off it. There is a difference, and one day it will matter to you.”",
      "The farm has a telephone that rings only when he decides it should. Some nights the fog comes up the mountain and covers everything, and you stand on the terrace with a drink you did not pour, a wealthy man in exile, listening to a phone that is not ringing yet."] },
  maria:{ who:"maria", mood:"flirty", title:"THE LAST FLIGHT OUT", color:C.flamingo,
    lines:["The airstrip near Homestead is a scar of cracked tarmac between two tomato fields. The plane is older than you and twice as tired. Maria is leaning against it like it owes her money.",
      "\u201cYou actually came,\u201d she says, and for one second the armor slips \u2014 then it\u2019s back, polished. \u201cMost of them don\u2019t, you know. Most of them love the table too much to leave it.\u201d",
      "Miami shrinks beneath the wing until it\u2019s just light \u2014 pink and blue and gold, all that neon money burning for somebody else now. Maria doesn\u2019t look down. You do. Once."] },
  route50:{ icon:"🛫", title:"THE FORGER'S PACKAGE", color:C.blue,
    lines:["The forger works out of a bait shop in Islamorada that has never sold bait. Your new passport smells like fresh ink and a clean conscience \u2014 one of those is real.",
      "\u201cYou were never here,\u201d he says, stamping a history you didn\u2019t live. \u201cThat\u2019ll be the hardest part. Not the leaving. The never-having-been.\u201d",
      "The charter lifts off a private strip at dawn with no flight plan and no names on the manifest. Behind you, the city keeps glowing. It doesn\u2019t notice. It never does."] },
  cass:{ who:"cass", mood:"pleased", title:"THE WIRE TRANSFER", color:C.gold,
    lines:["Cass meets you in the bank's basement vault, which smells like cold steel and other people's secrets. She slides a single page across the table: numbers, a signature line, a future.",
      "\u201cZurich, via Panama, via a funeral home in Hialeah,\u201d she says, almost fondly. \u201cAs of this signature, you are no longer a person. You are a WIRE TRANSFER. Congratulations \u2014 it's the safest thing to be.\u201d",
      "By the time the federal subpoena reaches Biscayne Fidelity, the accounts are folklore. Somewhere over the Atlantic, a number with your fingerprints on it becomes a rumor with a tan."] },
  kingpin:{ icon:"👑", title:"THE CITY KNEELS", color:C.gold,
    lines:["The rooftop in Brickell is yours. The building under it is yours. The skyline past it \u2014 pink, blue, gold, burning \u2014 answers, block by block, corner by corner, to your name.",
      "Somewhere below, a detective drops a four-hundred-page file on a desk and is told, gently, that the case lacks PRIORITY. Somewhere south, a man in a cream suit raises a glass he does not finish.",
      "They will write books about how this ends. Tonight is not about how it ends. Tonight, Miami is a machine of light and appetite \u2014 and every gear of it turns for you."] },
};
const FinaleScene=({route,g,onDone,sound})=>{
  const F=FINALES[route]||FINALES.ghost||{title:"THE END",color:C.blue,
    lines:["The city keeps glowing behind you. It does not notice. It never does."]};
  const L=typeof F.lines==="function"?F.lines(g||{}):F.lines;
  const [idx,setIdx]=useState(0);
  const [typed,setTyped]=useState(false);
  const [instant,setInstant]=useState(false);
  const last=idx>=L.length-1;
  const advance=()=>{
    if(!typed){ setInstant(true); setTyped(true); return; }
    if(!last){ setIdx(idx+1); setTyped(false); setInstant(false); }
  };
  return(
  <div onClick={advance} style={{position:"fixed",inset:0,zIndex:85,background:C.midnight,display:"flex",
    flexDirection:"column",alignItems:"center",justifyContent:"center",padding:22,animation:"fadeIn .5s ease",cursor:"pointer"}}>
    <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px)"}}/>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:4,color:C.dim,marginBottom:14}}>— FINALE —</div>
    {F.who?<NPCFrame who={F.who} mood={F.mood} w={138}/>
      :<div style={{fontSize:64,filter:`drop-shadow(0 0 24px ${F.color}88)`,animation:"sunPulse 3s infinite"}}>{F.icon}</div>}
    <div style={{marginTop:14,marginBottom:12}}><Neon color={F.color} size={22}>{F.title}</Neon></div>
    <div style={{maxWidth:330,minHeight:120,fontFamily:fb,fontSize:14.5,fontStyle:"italic",
      lineHeight:1.65,color:C.text,textAlign:"center"}}>
      <TypeText key={idx} text={L[idx]} sound={sound} instant={instant} onDone={()=>setTyped(true)}/>
    </div>
    <div style={{display:"flex",gap:6,margin:"16px 0 10px"}}>
      {L.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:4,background:i===idx?F.color:"#ffffff30"}}/>)}
    </div>
    {last&&typed
      ?<button onClick={e=>{e.stopPropagation();onDone();}}
        style={{...bt(F.color,true),padding:"13px 30px",animation:"riseIn .3s ease"}}>▸ AFTERWARD</button>
      :<div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim}}>TAP TO CONTINUE ▸</div>}
  </div>);
};

const CAMPAIGN_TITLES={
  witness:  { icon:"⚖️", label:"THE WITNESS",   color:C.blue },
  inheritor:{ icon:"🪑", label:"THE INHERITOR", color:C.gold },
  ghost:    { icon:"🛫", label:"THE GHOST",     color:C.green },
};
const CampaignEndScreen=({g,onTitle})=>{
  const ending=g.ending||"broke";
  const camp=CAMPAIGN_TITLES[ending];
  const story=generateNarrative(g);
  const days=Math.floor((g.move||0)/2)+1;
  const bl=betrayedList(g), pl=protectedList(g);
  const NAMES={maria:"Maria Santos",ramirez:"Ray Ramirez",colombiano:"El Colombiano"};
  const headline=(ENDING_HEADLINES[ending]||ENDING_HEADLINES.broke)[(g.move||0)%2];
  const ledger=[
    ["DAYS IN MIAMI",String(days)],
    ["GAVE UP",bl.length?bl.map(k=>NAMES[k]).join(", "):"nobody"],
    ["SHIELDED AT COST",pl.length?pl.map(k=>NAMES[k]).join(", "):"nobody"],
    ["CÉSAR'S FILE",g.storyFlags&&g.storyFlags.act2_done?"you know what is in it now":"closed, and it stays closed"],
  ];
  if(camp) return(
    <div style={{minHeight:"100dvh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div style={{maxWidth:380,width:"100%",animation:"fadeIn .5s ease",position:"relative"}}>
        <div style={{position:"absolute",inset:-20,background:"repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 2px, transparent 2px 4px)",pointerEvents:"none"}}/>
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:3,color:C.dim,marginBottom:12}}>— ELEVEN DAYS, AND THEN ALL THE REST OF THEM —</div>
        <Neon color={camp.color} size={25}>{camp.icon} {camp.label}</Neon>
        <div style={{fontFamily:ft,fontSize:13.5,color:"#cfe3ee",lineHeight:1.7,margin:"16px 0 16px"}}>{story}</div>
        <div style={{display:"grid",gap:8}}>
          {ledger.map(([k,v])=><div key={k} style={{...bx,padding:9}}>
            <div style={{fontFamily:ft,fontSize:8,color:C.dim,letterSpacing:1}}>{k}</div>
            <div style={{fontFamily:fb,fontSize:13.5,fontStyle:"italic",color:C.text,marginTop:2}}>{v}</div></div>)}
        </div>
        <button style={{...bt(camp.color),width:"100%",marginTop:18}} onClick={onTitle}>◂ THE END</button>
      </div>
    </div>);
  return(
    <div style={{minHeight:"100dvh",background:"#2A2520",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{maxWidth:380,width:"100%",background:C.paper,borderRadius:4,padding:18,color:C.ink,animation:"popIn .4s ease",
        boxShadow:"0 16px 60px rgba(0,0,0,.8)",backgroundImage:"radial-gradient(rgba(26,20,16,.05) 1px, transparent 1px)",backgroundSize:"4px 4px"}}>
        <div style={{textAlign:"center",borderBottom:"3px double "+C.ink,paddingBottom:6,marginBottom:10}}>
          <div style={{fontFamily:fb,fontWeight:"bold",fontSize:24}}>The Miami Herald</div>
          <div style={{fontFamily:ft,fontSize:8,letterSpacing:2}}>FINAL EDITION ◆ 1986 ◆ 25¢</div>
        </div>
        <div style={{fontFamily:fb,fontWeight:"bold",fontSize:26,lineHeight:1.05,marginBottom:10}}>{headline}</div>
        <div style={{fontFamily:fb,fontSize:13,lineHeight:1.6,fontStyle:"italic",borderTop:"1px solid "+C.ink+"33",paddingTop:8,marginBottom:12}}>{story}</div>
        <div style={{fontFamily:fb,fontSize:12.5,fontStyle:"italic",lineHeight:1.6,borderTop:"1px solid "+C.ink+"33",paddingTop:10}}>
          The file on César Vargas was never reopened. It is four pages long. Two of them are the same page.
        </div>
        <button style={{...bt(C.ink),width:"100%",marginTop:16}} onClick={onTitle}>◂ THE END</button>
      </div>
    </div>);
};

const GameOverScreen=({g,meta,repEarned,newAchs=[],onRunBack,onSafehouse,onTitle})=>{
  const [copied,setCopied]=useState(false);
  const nw=g.cash+g.bank+(g.cleanCash||0)-g.debt;
  const ending=g.ending||"broke";
  const vhs=ending==="escape"||ending==="kingpin"||ending==="inheritor"||ending==="ghost";
  const headline=ENDING_HEADLINES[ending][(g.move||0)%2];
  const story=generateNarrative(g);
  const days=Math.floor(g.move/2)+1;
  const stats=[["NET WORTH",FM(nw)],["DAYS SURVIVED",days],["DEALS",g.totalDeals||0],["BIGGEST SALE",FM(g.biggestDeal||0)],["DISTRICTS HELD",g.turf.filter(t=>t>0).length],["BUSTS",g.totalBusts||0]];
  const share=()=>{
    const txt=`COCAINE 80s ▸ ${g.isDaily?`CASE FILE #${getDailySeed().caseNumber} ▸ `:""}${headline} ▸ ${FM(nw)} in ${days} days ▸ ${g.totalDeals||0} deals${g.streak>=3?` ▸ 🔥×${g.streak} streak`:""}. Can you beat it?`;
    try{ navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1700);}); }catch(e){}
  };
  const btns=(
    <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:16}}>
      {newAchs.map((a,i)=><div key={a.id} style={{...bx,padding:"7px 10px",border:`1px solid ${C.gold}88`,
        display:"flex",alignItems:"center",gap:8,animation:`riseIn .4s ${.3+i*.15}s ease both`,boxShadow:`0 0 14px ${C.gold}33`}}>
        <span style={{fontSize:18}}>{a.icon}</span>
        <div style={{flex:1}}><div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:C.gold}}>ACHIEVEMENT — {a.name}</div>
        <div style={{fontFamily:ft,fontSize:9,color:C.dim}}>{a.desc} ◆ +100 REP</div></div>
      </div>)}
      <button style={{...bt(C.pink,true),width:"100%",fontSize:15}} onClick={onRunBack}>↻ RUN IT BACK</button>
      <div style={{display:"flex",gap:8}}>
        <button style={{...bt(C.gold),flex:1}} onClick={onSafehouse}>🏚 SAFEHOUSE</button>
        <button style={{...bt(C.blue),flex:1}} onClick={share}>{copied?"✓ COPIED":"📋 SHARE"}</button>
        <button style={{...bt(C.dim),flex:1}} onClick={onTitle}>TITLE</button>
      </div>
    </div>);
  if(vhs) return(
    <div style={{minHeight:"100dvh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div style={{maxWidth:380,width:"100%",animation:"fadeIn .5s ease",position:"relative"}}>
        <div style={{position:"absolute",inset:-20,background:"repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 2px, transparent 2px 4px)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:ft,fontSize:13,color:C.blue,marginBottom:14,animation:"vhsTrack 5s infinite"}}>
          <span>▶ PLAY</span><span>SP 0:{String(days).padStart(2,"0")}:00</span>
        </div>
        <Neon color={ending==="kingpin"?C.gold:ending==="inheritor"?C.orange:ending==="ghost"?C.flamingo:C.blue} size={26} style={{marginBottom:14}}>
          {ending==="kingpin"?"👑 KING OF MIAMI":ending==="inheritor"?"🪑 THE INHERITOR":ending==="ghost"?"👻 THE GHOST":"🛫 GHOSTED OUT"}</Neon>
        <div style={{fontFamily:ft,fontSize:13.5,color:"#cfe3ee",lineHeight:1.7,marginBottom:16,animation:"vhsTrack 6s infinite"}}>{story}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {stats.map(([k,v])=><div key={k} style={{...bx,padding:8}}>
            <div style={{fontFamily:ft,fontSize:8,color:C.dim,letterSpacing:1}}>{k}</div>
            <div style={{fontFamily:ft,fontSize:14,fontWeight:"bold",color:C.text}}>{v}</div></div>)}
        </div>
        <div style={{...bx,marginTop:10,textAlign:"center",border:`1px solid ${C.gold}66`}}>
          <span style={{fontFamily:ft,fontSize:12,color:C.gold,fontWeight:"bold"}}>+{repEarned} REP EARNED ◆ TOTAL {meta.rep}</span>
        </div>
        {btns}
      </div>
    </div>);
  return(
    <div style={{minHeight:"100dvh",background:"#2A2520",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{maxWidth:380,width:"100%",background:C.paper,borderRadius:4,padding:18,color:C.ink,animation:"popIn .4s ease",
        boxShadow:"0 16px 60px rgba(0,0,0,.8)",backgroundImage:"radial-gradient(rgba(26,20,16,.05) 1px, transparent 1px)",backgroundSize:"4px 4px"}}>
        <div style={{textAlign:"center",borderBottom:"3px double "+C.ink,paddingBottom:6,marginBottom:10}}>
          <div style={{fontFamily:fb,fontWeight:"bold",fontSize:24}}>The Miami Herald</div>
          <div style={{fontFamily:ft,fontSize:8,letterSpacing:2}}>FINAL EDITION ◆ 1986 ◆ 25¢</div>
        </div>
        <div style={{fontFamily:fb,fontWeight:"bold",fontSize:26,lineHeight:1.05,marginBottom:10}}>{headline}</div>
        <div style={{fontFamily:fb,fontSize:13,lineHeight:1.6,fontStyle:"italic",borderTop:"1px solid "+C.ink+"33",paddingTop:8,marginBottom:12}}>{story}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,borderTop:"1px solid "+C.ink+"33",paddingTop:10}}>
          {stats.map(([k,v])=><div key={k}>
            <div style={{fontFamily:ft,fontSize:7.5,letterSpacing:1,opacity:.6}}>{k}</div>
            <div style={{fontFamily:fb,fontWeight:"bold",fontSize:14}}>{v}</div></div>)}
        </div>
        <div style={{textAlign:"center",fontFamily:ft,fontSize:11,fontWeight:"bold",marginTop:10,padding:"6px 0",borderTop:"1px solid "+C.ink+"33"}}>
          +{repEarned} REP EARNED ◆ TOTAL {meta.rep}</div>
        {btns}
      </div>
    </div>);
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
let PID=0;
export default function Cocaine80s(){
  const [meta,setMeta]=useState(()=>loadMeta());
  const [screen,setScreen]=useState("title");
  const [g,setG]=useState(null);
  const gRef=useRef(null); gRef.current=g;
  const [cfg,setCfg]=useState({heat:0,pb:0,daily:false});
  const [tab,setTab]=useState("market");
  const [selDrug,setSelDrug]=useState(null);
  const [mode,setMode]=useState("buy");
  const [qty,setQty]=useState(1);
  const [parts,setParts]=useState([]);
  const [flights,setFlights]=useState([]);
  const [shake,setShake]=useState(false);
  const [flash,setFlash]=useState(null);
  const [hitstop,setHitstop]=useState(false);
  const [breakdown,setBreakdown]=useState(null);
  const [modal,setModal]=useState(null);
  const [eraOv,setEraOv]=useState(null);
  const [actCard,setActCard]=useState(null);
  const [comicIdx,setComicIdx]=useState(0);
  const [repEarned,setRepEarned]=useState(0);
  const [newAchs,setNewAchs]=useState([]);
  const [travelOv,setTravelOv]=useState(null);
  const [dealScene,setDealScene]=useState(null);
  const [mini,setMini]=useState(null);
  const [finale,setFinale]=useState(null);
  const [sheetExit,setSheetExit]=useState(false);
  const pendingModal=useRef(null);
  const cashRef=useRef(null);
  const bagRef=useRef(null);
  const sheetRef=useRef(null);
  const sheetTO=useRef(null);
  const metaSaved=useRef(false);
  const synth=useRef(null);
  const prevUnlocks=useRef({});

  // ── particles / juice helpers ──
  const addPart=useCallback((text,color,y=.5,big=false)=>{
    const id=++PID;
    setParts(p=>[...p.slice(-14),{id,text,color,y,big,x:50+(Math.random()*22-11)}]);
    setTimeout(()=>setParts(p=>p.filter(q=>q.id!==id)),1250);
  },[]);
  const spawnFly=useCallback((count,opts={})=>{
    if(typeof window==="undefined") return;
    const W=window.innerWidth,H=window.innerHeight;
    const rc=ref=>{const el=ref&&ref.current; if(!el) return null;
      const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};};
    const from=opts.from||{x:W/2,y:H*.52};
    const to=opts.to||rc(cashRef)||{x:60,y:140};
    const spread=opts.spread??140;
    const ids=[];
    const fl=Array.from({length:count}).map((_,i)=>{const id=++PID;ids.push(id);
      return {id,delay:i*38,big:i%4===0,emoji:opts.emoji||"$",fade:opts.fade,
        x:from.x+(Math.random()*spread-spread/2),
        y:from.y+(Math.random()*70-35),
        ex:to.x+(opts.fade?(Math.random()*40-20):0),
        ey:to.y+(opts.fade?(Math.random()*30-15):0)};});
    setFlights(f=>[...f,...fl]);
    setTimeout(()=>setFlights(f=>f.filter(q=>!ids.includes(q.id))),1500);
  },[]);

  const applyEffects=useCallback(effects=>{
    let over=null;
    (effects||[]).forEach(e=>{
      if(e.type==="SFX"){ if(meta.sound&&SFX[e.name]) SFX[e.name](); }
      else if(e.type==="SPAWN") addPart(e.text,e.color,e.y);
      else if(e.type==="SHAKE"){ setShake(true); setTimeout(()=>setShake(false),420); }
      else if(e.type==="FLASH"){ setFlash(e.color); setTimeout(()=>setFlash(null),380); }
      else if(e.type==="HITSTOP"){ setHitstop(true); setTimeout(()=>setHitstop(false),130); }
      else if(e.type==="SCREEN") setScreen(e.screen);
      else if(e.type==="PING"){ if(e.stat==="hp"){ setFlash("#FF173328"); setTimeout(()=>setFlash(null),320); } }
      else if(e.type==="ERA_SHIFT"){ setEraOv(ERAS[e.eraIdx]); if(meta.sound) SFX.era(); }
      else if(e.type==="ACT_CARD") setActCard(e.data);
      else if(e.type==="GAME_OVER") over=e.ending;
      else if(e.type==="CASHFLY") spawnFly(e.count);
      else if(e.type==="BREAKDOWN"){ setBreakdown(e.data); setTimeout(()=>setBreakdown(null),2700); }
      else if(e.type==="DEAL_SCENE"){ setDealScene(e.data); setTimeout(()=>setDealScene(null),1450); }
      else if(e.type==="STREAK") addPart(`🔥 STREAK ×${e.n}`,C.orange,.3,true);
    });
    return over;
  },[meta.sound,addPart,spawnFly]);

  const act=useCallback((fn,...args)=>{
    const res=fn(gRef.current,...args);
    if(res.ok===false){ if(meta.sound)SFX.error(); return null; }
    const over=applyEffects(res.effects);
    let ns=res.state;
    if(over&&!ns.ending){ ns={...ns,ending:over}; }
    gRef.current=ns; // sync NOW — rapid same-tick acts must chain, not overwrite
    setG(ns);
    if(over) setScreen("gameover");
    return res;
  },[applyEffects,meta.sound]);

  // ── run lifecycle ──
  // ── campaign lifecycle — one story, played once ──
  const startRun=useCallback((withComic=true)=>{
    metaSaved.current=false; setFinale(null);
    const st=createInitialState();
    const open=selectStorylet(st);
    if(open){ st.activeStorylet=open; st.storySeen={...st.storySeen,[open.id]:true}; }
    setG(st); setTab("market"); setSelDrug(null); setMode("buy"); setQty(1);
    setModal(null); setBreakdown(null); setEraOv(null); setActCard(null);
    prevUnlocks.current={};
    if(withComic){ setComicIdx(0); setScreen("comic"); } else setScreen("game");
  },[]);

  // campaign over → stop the music, remember which ending. No score. No rep. No ladder.
  useEffect(()=>{
    if(screen==="gameover"&&g&&!metaSaved.current){
      metaSaved.current=true;
      const m={...meta,lastEnding:g.ending||"broke",finished:true};
      saveMeta(m); setMeta(m);
      if(meta.sound){ MUSIC.stop();
        (CAMPAIGN_ENDINGS[g.ending]?SFX.endingWin:SFX.endingLose)();
      }
    }
  },[screen]);

  // synth loop
  useEffect(()=>{
    if(screen==="game"&&meta.sound){
      synth.current=new SynthLoop();
      synth.current.start(()=>{ const s=gRef.current||{};
        return { era:s.currentEra||0, heat:s.fedHeat||0, loc:s.loc||0,
                 night:(s.move||0)%2===1, move:s.move||0, deals:s.totalDeals||0 }; });
      return ()=>synth.current&&synth.current.stop();
    }
  },[screen,meta.sound]);

  // ── audio lifecycle: gesture unlock, mute, tab-hide suspend ──
  useEffect(()=>{ AUDIO.setMuted(!meta.sound); },[meta.sound]);
  useEffect(()=>{
    if(typeof window==="undefined") return;
    const onGesture=()=>AUDIO.unlock();
    const onVis=()=>AUDIO.setHidden(!!document.hidden);
    window.addEventListener("pointerdown",onGesture,{passive:true});
    window.addEventListener("keydown",onGesture);
    document.addEventListener("visibilitychange",onVis);
    return ()=>{
      window.removeEventListener("pointerdown",onGesture);
      window.removeEventListener("keydown",onGesture);
      document.removeEventListener("visibilitychange",onVis);
      MUSIC.stop();
    };
  },[]);

  // title-screen theme — slow, wet, drumless. Owner-guarded so it can never
  // collide with the in-game transport during a screen change.
  useEffect(()=>{
    if(screen==="title"&&meta.sound){
      MUSIC.start(()=>({scene:"title",era:0,heat:6,loc:0,night:true}),"title");
      return ()=>MUSIC.stop("title");
    }
  },[screen,meta.sound]);

  // dialogue chime when a storylet opens
  const lastStoryId=useRef(null);
  useEffect(()=>{
    const id=g&&g.activeStorylet?g.activeStorylet.id:null;
    if(id&&id!==lastStoryId.current&&meta.sound) SFX.storylet();
    lastStoryId.current=id;
  },[g&&g.activeStorylet?g.activeStorylet.id:null,meta.sound]);
  // low drone under the police stop
  useEffect(()=>{
    if(screen==="police"&&meta.sound){
      const t=setInterval(SFX.chaseBed,900); SFX.chaseBed();
      return ()=>clearInterval(t);
    }
  },[screen,meta.sound]);

  // tab unlocks + toast
  const unlocks=g?{
    market:true,travel:true,
    bank:(g.totalDeals||0)>0||g.hudSeen.debt,
    empire:(g.totalProfit||0)>=5000||g.turf.some(t=>t>0),
    contacts:Object.values(g.npcState).some(n=>n.met),
    life:g.cash>=10000||g.lifestyle.length>0,
  }:null;
  useEffect(()=>{
    if(!unlocks||screen!=="game") return;
    for(const k of Object.keys(unlocks)){
      if(unlocks[k]&&prevUnlocks.current[k]===false){
        addPart(`📂 ${k.toUpperCase()} UNLOCKED`,C.blue,.78);
        if(meta.sound)SFX.coin();
      }
    }
    prevUnlocks.current={...unlocks};
  },[unlocks&&Object.values(unlocks).join("")]);

  const markCoach=k=>setG(s=>s&&!s.coach[k]?{...s,coach:{...s.coach,[k]:true}}:s);

  // ── handlers ──
  const travel=dest=>{
    if(travelOv) return;
    setSelDrug(null); setSheetExit(false); markCoach("travel_tip");
    const fromLoc=g.loc;
    const useCar=g.lifestyle.includes("car");
    const useBoat=dest===5&&(g.lifestyle.includes("boat")||!!g.importBonus);
    setTravelOv({from:fromLoc,to:dest,car:useCar,boat:useBoat});
    if(meta.sound) SFX.travelMove(useCar,useBoat);
    const driveMs=useCar&&!useBoat?640:940;
    setTimeout(()=>{
      const res=act(processTravel,dest);
      if(!res){ setTravelOv(null); return; }
      const blocked=(res.effects||[]).some(e=>e.type==="SCREEN"||e.type==="GAME_OVER");
      if(blocked){ setTimeout(()=>setTravelOv(null),140); return; }
      let pending=null;
      if(res.dealEvent) pending={type:"deal",data:res.dealEvent};
      else if(res.randEnc) pending={type:"enc",data:res.randEnc};
      else if(res.turfWar) pending={type:"turf",data:res.turfWar};
      else if(res.worldEvent) pending={type:"world",data:res.worldEvent};
      else if(res.newspaper) pending={type:"news",data:res.newspaper};
      pendingModal.current=pending;
    },Math.floor(driveMs*.45));
    setTimeout(()=>{
      setTravelOv(null);
      if(pendingModal.current){ setModal(pendingModal.current); pendingModal.current=null; }
    },driveMs);
  };
  const exch=ref=>{const el=ref&&ref.current; if(!el) return undefined;
    const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height*.35};};
  const doBuy=()=>{ const i=selDrug; const n=qty==="max"?maxBuy(i):qty;
    if(act(processBuy,i,n)){ markCoach("buy_low");
      const sc=exch(sheetRef);
      spawnFly(CL(Math.ceil(n/2),3,9),{emoji:DRUGS[i].emoji,from:sc,to:exch(bagRef),spread:110});
      spawnFly(CL(Math.ceil(n/4),3,6),{from:exch(cashRef),to:sc,spread:24});
    } };
  const doSell=()=>{ const i=selDrug; const n=qty==="max"?g.inv[i]:Math.min(qty,g.inv[i]);
    if(act(processSell,i,n)){ markCoach("sell_here");
      const sc=exch(sheetRef)||{x:(typeof window!=="undefined"?window.innerWidth:400)/2,y:420};
      spawnFly(CL(Math.ceil(n/2),3,9),{emoji:DRUGS[i].emoji,from:sc,
        to:{x:(typeof window!=="undefined"?window.innerWidth:400)+70,y:sc.y-40},spread:90,fade:true});
    } };
  const buyPrice=(s,i)=>Math.floor(s.prices[i]*(1-(s.priceDiscount||0))*(s.lifestyle.includes("prices")?0.95:1)*(s.loc===5&&(s.importBonus||s.lifestyle.includes("boat"))?(s.importBonus||0.85):1));
  const sellPrice=(s,i)=>{ const pur=((s.purity||[])[i])??1;
    const cc=(s.colTurf?.[s.loc]&&!s.storyFlags?.col_peace)?0.88:1;
    return Math.max(1,Math.floor(s.prices[i]*pur*cc)); };
  const maxBuy=i=>{ const p=buyPrice(g,i)||1; const space=g.coatSp-g.inv.reduce((a,b)=>a+b,0);
    return Math.max(0,Math.min(Math.floor(g.cash/p),space)); };
  const dealAct=o=>{
    setModal(null); if(meta.sound)SFX.click();
    setG(s=>{
      if(!s) return s;
      let ns={...s,activeDeal:s.activeDeal?{...s.activeDeal}:null};
      if(o.action==="deal_altdrop"&&ns.activeDeal){
        const c=Math.floor(ns.activeDeal.cost*0.12);
        if(ns.cash>=c){ ns.cash-=c; ns.activeDeal.altDropPaid=true; addPart(`−${FM(c)}`,C.pink,.5); }
      } else if(o.action==="deal_sellhalf"&&ns.activeDeal){
        ns.cash+=o.value; ns.activeDeal.rivalBought=true; addPart(`+${FM(o.value)}`,C.green,.45); spawnFly(6);
      }
      return ns;
    });
  };
  const worldAct=o=>{ const ev=modal.data; setModal(null); if(meta.sound)SFX.click();
    if(o.id==="assault"){ setMini({kind:"mash",cfg:{title:"🔫 TAKE THE DOCK",
      desc:"His whole organization is on that pier. Push until something breaks.",
      rival:CL(Math.round(((g.rival&&g.rival.power)||10)*0.22),4,11),
      done:sc=>act(resolveWorldEvent,ev,o,sc)}}); return; }
    act(resolveWorldEvent,ev,o); };
  const encAct=action=>{ const enc=modal.data; setModal(null);
    if(action==="leave"||action==="decline") return;
    if(enc.type==="mugger"&&action==="fight"&&!g.gun){
      setMini({kind:"strike",cfg:{title:"🥊 STREET FIGHT",
        desc:"He's the size of a refrigerator. Hit first, hit clean.",rounds:3,foe:"mugger",speed:1,
        done:s=>act(resolveEncounter,enc,"fight",s)}});
      return;
    }
    act(resolveEncounter,enc,action); };
  const turfAct=action=>{ const war=modal.data; setModal(null);
    if(action==="defend"){
      setMini({kind:"mash",cfg:{title:"⚔ HOLD THE BLOCK",
        desc:`${war.rivalName}'s crew is pushing in. Push back HARDER.`,rival:war.rivalPower,
        done:s=>act(resolveTurfWar,war,"defend",s)}});
      return;
    }
    act(resolveTurfWar,war,action); };
  const escapeAttempt=r=>{
    let ns={...g};
    if(r.cost>0){ let rem=r.cost;
      const fromCash=Math.min(ns.cash,rem); ns.cash-=fromCash; rem-=fromCash;
      const fromBank=Math.min(ns.bank,rem); ns.bank-=fromBank; rem-=fromBank;
      ns.cleanCash=Math.max(0,(ns.cleanCash||0)-rem);
    }
    ns.ending=r.ending; setG(ns);
    setFinale(r.ending==="kingpin"?"kingpin":r.id);
    setScreen("finale");
    if(meta.sound)SFX.sellMassive();
  };

  const commitEnding=route=>{
    act(processCampaignEnd,route);
    setFinale(route);
    setScreen("finale");
  };

  // ── render ──
  if(screen==="title") return(<><style>{KEYFRAMES}</style>
    <TitleScreenV5 meta={meta}
      onPlay={()=>{ if(meta.sound)SFX.click(); startRun(true); }}
      onSound={()=>{ const m={...meta,sound:!meta.sound}; saveMeta(m); setMeta(m); }}/></>);
  if(screen==="comic") return(<><style>{KEYFRAMES}</style>
    <ComicScreen idx={comicIdx}
      onTap={()=>{ if(meta.sound)SFX.click(); comicIdx<COMIC_PANELS.length-1?setComicIdx(comicIdx+1):setScreen("game"); }}
      onSkip={()=>setScreen("game")}/></>);
  if(!g) return null;
  if(screen==="gameover") return(<><style>{KEYFRAMES}</style>
    <CampaignEndScreen g={g} onTitle={()=>setScreen("title")}/></>);
  if(screen==="police") return(<><style>{KEYFRAMES}</style>
    {mini&&<MiniGame mini={mini} sound={meta.sound}
      onDone={sc=>{ const d=mini.cfg.done; setMini(null); d(sc); }}/>}
    <PoliceScreen g={g} onAct={a=>{
      if(a==="run") setMini({kind:"timing",cfg:{title:"🏃 THE CHASE",color:C.blue,
        desc:"Three blocks of traffic. Tap when the gap lines up.",rounds:3,
        zoneW:g.lifestyle.includes("car")?15:11,speed:1.05+g.fedHeat/160,
        done:s=>act(processPolice,"run",s)}});
      else if(a==="fight") setMini({kind:"strike",cfg:{title:"👊 THROW DOWN",
        desc:g.gun?"Armed. Make the warning shots count.":"Bare knuckles. Time the swing.",
        rounds:3,foe:"cop",speed:.95+g.fedHeat/300,
        done:s=>act(processPolice,"fight",s)}});
      else setMini({kind:"timing",cfg:{title:"💵 THE HANDSHAKE",color:C.gold,
        desc:"Stop the needle in the officer's comfort zone. Heat makes it narrow.",rounds:1,
        zoneW:CL(20-g.fedHeat/8,6,20),speed:.85,
        done:s=>act(processPolice,"bribe",s)}});
    }}/></>);
  if(screen==="policeResult") return(<><style>{KEYFRAMES}</style>
    <PoliceResultScreen g={g} onContinue={()=>{
      if(g.hp<=0){ setG({...g,ending:"dead"}); setScreen("gameover"); } else setScreen("game"); }}/></>);
  if(screen==="broke_choice") return(<><style>{KEYFRAMES}</style>
    <BrokeScreenV5 g={g}
      onTake={()=>{ setG({...g,cash:g.cash+3000,debt:g.debt+12000}); addPart("📕 +$3,000 ◆ +$12,000 ON THE BOOK",C.gold,.4); setScreen("game"); }}
      onBus={()=>{ setG({...g,ending:"broke"}); setScreen("gameover"); }}/></>);
  if(screen==="finale") return(<><style>{KEYFRAMES}</style>
    <FinaleScene route={finale} g={g} sound={meta.sound} onDone={()=>setScreen("gameover")}/></>);
  if(screen==="lastnight") return(<><style>{KEYFRAMES}</style>
    <LastNightScreen g={g} onCommit={commitEnding} onBack={()=>setScreen("game")}/></>);

  // ═══ GAME SCREEN ═══
  const era=getEra(g), loc=LOCS[g.loc], night=g.move%2===1;
  const vibe=LOCATION_VIBE[g.loc][night?"night":"day"][g.move%3];
  const used=g.inv.reduce((a,b)=>a+b,0);
  const hud=g.hudSeen;
  const coachKey=
    !g.activeStorylet&&!modal&&(
      tab==="market"&&!g.coach.tap_drug&&selDrug==null&&g.totalDeals===0?"tap_drug"
      :selDrug!=null&&mode==="buy"&&!g.coach.buy_low?"buy_low"
      :tab==="market"&&used>0&&!g.coach.travel_tip&&selDrug==null?"travel_tip"
      :tab==="market"&&!g.coach.sell_here&&selDrug==null&&g.inv.some((q,i)=>q>0&&g.prices[i]>g.avgCost[i]&&g.avgCost[i]>0)?"sell_here"
      // heat_warn was marked seen on every sell but never listed here, so the
      // game's only heat tutorial could never render. Show it once heat is
      // actually visible to the player (the HUD reveals it at 5).
      :tab==="market"&&!g.coach.heat_warn&&selDrug==null&&g.fedHeat>=8?"heat_warn"
      :null);
  const TABS=[["market","💊"],["travel","🗺"],["bank","🏦"],["empire","👑"],["contacts","📇"],["life","🕶"]];

  return(
  <div style={{minHeight:"100dvh",background:`radial-gradient(135% 95% at 50% -12%, #0E2240 0%, ${C.dark} 52%, #04080F 100%)`,filter:hitstop?"brightness(1.6) contrast(1.2)":"none"}}>
    <style>{KEYFRAMES}</style>
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100dvh",background:"transparent",position:"relative",
      animation:shake?"shakeA .42s ease":"none",paddingBottom:74}}>

      {/* ── LIVING SKYLINE HEADER ── */}
      <MiamiSkyDeluxe move={g.move} heat={g.fedHeat} locColor={loc.color} locIdx={g.loc}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:`linear-gradient(180deg, ${era.color}10 0%, transparent 34%)`}}/>
      <div style={{padding:"8px 12px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
          <div style={{fontFamily:ft,fontWeight:"bold",fontSize:17,color:loc.color,textShadow:`0 0 10px ${loc.color}88`}}>
            {loc.icon} {loc.name.toUpperCase()}</div>
          <div style={{fontFamily:ft,fontSize:9,color:C.dim}}>{night?"🌙 NIGHT":"☀️ DAY"} {Math.floor(g.move/2)+1} ◆ <span style={{color:era.color}}>{era.name.toUpperCase()}</span></div>
        </div>
        <div style={{fontFamily:fb,fontSize:11.5,fontStyle:"italic",color:C.dim,margin:"2px 0 8px"}}>{vibe}</div>

        {/* ── PROGRESSIVE HUD ── */}
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
          <div ref={cashRef} style={{...bx,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,border:`1px solid ${C.green}44`}}>
            <span style={{fontSize:11}}>💵</span><AnimatedNumber value={g.cash} color={C.green} size={15}/>
          </div>
          {hud.debt&&g.debt>0&&<HudChip icon="🦈" label={FM(g.debt)} color={C.pink}/>}
          {hud.hp&&<HudChip icon="❤" label={g.hp} color={g.hp>50?C.green:C.pink} bar={g.hp}/>}
          {hud.heat&&<HudChip icon="🔥" label={g.fedHeat} color={g.fedHeat>60?"#FF1733":g.fedHeat>30?C.orange:C.blue} bar={g.fedHeat} pulse={g.fedHeat>=70}/>}
          {hud.cred&&<HudChip icon="⭐" label={g.cred} color={C.gold} bar={g.cred}/>}
          {/* v5: no run-streak chrome — this is one campaign, not a scored run */}
          <div ref={bagRef} style={{...bx,padding:"5px 10px",fontFamily:ft,fontSize:11,color:C.dim}}>🎒{used}/{g.coatSp}</div>
          <HeatPlanChip g={g}/>
        </div>

        {/* THE PLAN — three-act tracker, gated on story flags */}
        {g.move>=1&&(()=>{
          const A=ACTS[getAct(g)]||ACTS[1];
          const evd=g.npcState.ramirez.evidence||0;
          const open=lastNightOpen(g);
          const plan=
            g.storyFlags.final_grace?{label:"🚨 RAID AT DAWN — THIS IS YOUR LAST MOVE",sub:"end it, whatever ending you can still reach",v:1,max:1,color:"#FF1733",tap:true,alarm:true}
            :open?{label:"THE LAST NIGHT — THE GALLERY, AFTER CLOSING",sub:"all three of them will be in the room ◆ TAP to finish it",v:1,max:1,color:C.flamingo,tap:true}
            :evd>=15?{label:"⚠ RAMIREZ IS CLOSING THE FILE",sub:`${evd}/20 evidence ◆ finish your story before he finishes his`,v:evd,max:20,color:"#FF1733",alarm:true}
            :{label:`ACT ${["","I","II","III"][A.n]} — ${A.name}`,sub:`${A.goal} ◆ ${A.sub}`,v:A.n,max:3,color:A.color};
          return(
          <div onClick={plan.tap?()=>setScreen("lastnight"):undefined}
            style={{...bx,marginBottom:8,cursor:plan.tap?"pointer":"default",padding:"8px 10px",
              border:`1px solid ${plan.color}55`,animation:plan.alarm?"hudPulse 1.1s infinite":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
              <span style={{fontFamily:ft,fontSize:10,fontWeight:"bold",letterSpacing:1,color:plan.color}}>{plan.label}</span>
              {plan.tap&&<span style={{fontFamily:ft,fontSize:8.5,color:C.dim,whiteSpace:"nowrap"}}>TAP ▸</span>}
            </div>
            <div style={{fontFamily:ft,fontSize:9,color:C.dim,margin:"3px 0 5px",lineHeight:1.5}}>{plan.sub}</div>
            <Bar v={plan.v} max={plan.max} color={plan.color} h={4}/>
          </div>);})()}

        {/* pager banner */}
        {g.pagerDeal&&<button onClick={()=>setTab("travel")} style={{...bx,width:"100%",textAlign:"left",cursor:"pointer",marginBottom:8,
          border:`1px solid ${C.gold}88`,background:`${C.gold}10`,animation:"riseIn .3s ease"}}>
          <div style={{fontFamily:ft,fontSize:9,color:C.gold,fontWeight:"bold",letterSpacing:1}}>📟 PAGER ◆ EXPIRES DAY {Math.floor(g.pagerDeal.expiresMove/2)+1} ◆ {LOCS[g.pagerDeal.targetLoc].name.toUpperCase()}</div>
          <div style={{fontFamily:ft,fontSize:10,color:C.text,marginTop:3}}>{g.pagerDeal.msg}</div>
        </button>}
        {g.evtMsg&&<div style={{...bx,marginBottom:8,fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.text,border:`1px solid ${C.blue}33`,animation:"riseIn .3s ease"}}>{g.evtMsg}</div>}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{padding:"0 12px calc(96px + env(safe-area-inset-bottom))",position:"relative"}}>
        {coachKey==="tap_drug"&&<CoachMark k="tap_drug" style={{top:-2,left:"50%",transform:"translateX(-50%)"}}/>}
        {coachKey==="sell_here"&&<CoachMark k="sell_here" style={{top:-2,left:"50%",transform:"translateX(-50%)"}}/>}
        {coachKey==="heat_warn"&&<CoachMark k="heat_warn" style={{top:-2,left:"50%",transform:"translateX(-50%)"}}/>}

        {tab==="market"&&<div>
          <MarketWire g={g}/>
          {g.colTurf?.[g.loc]&&!g.storyFlags.col_peace&&<div style={{...bx,marginBottom:8,padding:"7px 10px",border:`1px solid ${C.orange}66`,
            fontFamily:ft,fontSize:10,color:C.orange}}>🇨🇴 HIS BLOCK — his crews undercut you. Sales pay −12% here.</div>}
          {DRUGS.map((d,i)=>{
            const owned=g.inv[i],eff=sellPrice(g,i),profit=owned>0&&g.avgCost[i]>0?eff-g.avgCost[i]:null;
            return(<button key={d.name} onClick={()=>{ clearTimeout(sheetTO.current); sheetTO.current=null; setSheetExit(false);
                setSelDrug(i); setQty(1); setMode(owned>0&&profit>0?"sell":"buy"); markCoach("tap_drug"); if(meta.sound)SFX.click(); }}
              style={{...bx,width:"100%",display:"flex",alignItems:"center",gap:10,marginBottom:7,cursor:"pointer",textAlign:"left",
                animation:`riseIn .3s ${i*.04}s ease both`,
                border:`1px solid ${selDrug===i?loc.color:owned>0?C.gold+"55":C.border}`}}
              onClickCapture={()=>setSheetExit(false)}>
              <DrugGlyph d={d} owned={owned} sel={selDrug===i}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:C.text}}>{d.name}
                  {owned>0&&<span style={{color:C.gold,fontSize:10}}> ×{owned}</span>}
                  {(((g.purity||[])[i])??1)<1&&g.inv[i]>0&&<span style={{color:C.orange,fontSize:9}}> ✂{Math.round(g.purity[i]*100)}%</span>}
                  {era.demandMod[i]>=1.4&&<span style={{color:C.orange,fontSize:9}}> 🔥HOT</span>}
                  {era.demandMod[i]<=0.6&&<span style={{color:C.blue,fontSize:9}}> 🧊COLD</span>}</div>
                <div style={{fontFamily:ft,fontSize:9,color:C.dim}}>
                  {owned>0&&g.avgCost[i]>0?`paid ${FM(g.avgCost[i])}/u`:["street","street","mid","mid","mid","weight","weight","weight"][i]}
                </div>
              </div>
              {profit!=null&&(profit>0
                ?<span onClick={e=>{e.stopPropagation();if(meta.sound)SFX.click();
                    const r=e.currentTarget.getBoundingClientRect();
                    const from={x:r.left+r.width/2,y:r.top};
                    if(act(processSell,i,g.inv[i])){
                      spawnFly(CL(Math.ceil(g.inv[i]/2)||3,3,8),{emoji:DRUGS[i].emoji,from,
                        to:{x:(typeof window!=="undefined"?window.innerWidth:400)+70,y:from.y-30},spread:60,fade:true});
                    }
                    markCoach("sell_here");}}
                  style={{fontFamily:ft,fontSize:10,fontWeight:"bold",padding:"4px 8px",borderRadius:10,cursor:"pointer",
                  background:C.green+"22",color:C.green,border:`1px solid ${C.green}66`,boxShadow:`0 0 10px ${C.green}33`}}>
                  💰SELL ×{owned}</span>
                :<span style={{fontFamily:ft,fontSize:10,fontWeight:"bold",padding:"3px 7px",borderRadius:10,
                  background:C.pink+"22",color:C.pink}}>{FM(profit)}/u</span>)}
              <SparkPro data={g.hist[i]} color={loc.color} avg={owned>0?g.avgCost[i]:0}/>
              <div style={{textAlign:"right",minWidth:64}}>
                <PriceCell value={g.prices[i]}/>
                <TrendArrow hist={g.hist[i]}/>
              </div>
            </button>);})}
        </div>}

        {tab==="travel"&&<div>
          <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ EVERY TRIP MOVES THE MARKET — AND THE HEAT</div>
          <DistrictBoard g={g}/>
          <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,marginBottom:8}}>
            ST/MID/WT = street, mid-tier, weight ◆ <span style={{color:C.green}}>▼ buys cheap</span> ◆ <span style={{color:C.gold}}>▲ sells high</span> ◆ <span style={{color:C.pink}}>⚔ rival spotted</span></div>
          {LOCS.map((l,i)=>(
            <button key={l.name} disabled={i===g.loc||!!travelOv} onClick={()=>{ if(meta.sound)SFX.click(); travel(i); }}
              style={{...bx,width:"100%",display:"flex",alignItems:"center",gap:10,marginBottom:7,textAlign:"left",
                cursor:i===g.loc?"default":"pointer",opacity:i===g.loc?.45:1,
                animation:`riseIn .3s ${i*.05}s ease both`,border:`1px solid ${i===g.loc?C.border:l.color+"55"}`}}>
              <span style={{fontSize:22}}>{l.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:l.color}}>{l.name}
                  {g.turf[i]>0&&<span style={{color:C.gold}}> {TURF_LEVELS[g.turf[i]].icon}</span>}
                  {g.safeHouses[i]>=0&&<span> {SAFE_HOUSES[g.safeHouses[i]].icon}</span>}
                  {g.pagerDeal&&g.pagerDeal.targetLoc===i&&<span style={{color:C.gold}}> 📟</span>}
                  {g.colTurf?.[i]&&<span style={{color:C.orange}}> 🇨🇴</span>}
                </div>
                <div style={{fontFamily:ft,fontSize:9,color:C.dim}}>{l.desc}</div>
                <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,marginTop:2}}>
                  {["ST","MID","WT"].map((t,k)=>{const m=l.priceMod[k];const[s,c]=m<=0.8?["▼",C.green]:m>=1.15?["▲",C.gold]:["•",C.dim];
                    return <span key={t} style={{marginRight:7}}>{t}<span style={{color:c}}>{s}</span></span>;})}
                  {g.rivals.filter(r=>r.loc===i).map(r=><span key={r.name} style={{color:C.pink}}>⚔{r.name} </span>)}
                </div>
              </div>
              <div style={{fontFamily:ft,fontSize:9,color:l.heat>=.12?C.pink:l.heat>=.07?C.orange:C.green}}>
                {"🚔".repeat(Math.ceil(l.heat*22))||"—"}</div>
            </button>))}
        </div>}

        {tab==="bank"&&<BankTab g={g} act={act} meta={meta} onEscape={()=>setScreen("lastnight")} markCoach={markCoach}/>}
        {tab==="empire"&&<EmpireTab g={g} act={act} setMini={setMini}/>}
        {tab==="contacts"&&<ContactsTab g={g}/>}
        {tab==="life"&&<LifeTab g={g} act={act}/>}
      </div>

      {/* ── TRADE SHEET ── */}
      {selDrug!=null&&(()=>{const i=selDrug,d=DRUGS[i];
        const bp=buyPrice(g,i),sp=sellPrice(g,i),rawSp=g.prices[i];
        const n=qty==="max"?(mode==="buy"?maxBuy(i):g.inv[i]):qty;
        const pd=g.pagerDeal;
        const pagerMatch=pd&&pd.drugIdx===i&&g.loc===pd.targetLoc&&g.move<=pd.expiresMove;
        const pagerHits=pagerMatch&&n>=pd.qty;
        const spP=pagerHits?Math.floor(sp*(1+pd.bonusPct/100)):sp;
        const total=mode==="buy"?n*bp:n*spP;
        return(
        <div ref={sheetRef} style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:64,width:"min(406px,calc(100% - 16px))",zIndex:35,
          ...bx,border:`1px solid ${loc.color}66`,boxShadow:`0 -4px 30px rgba(0,0,0,.6), 0 0 20px ${loc.color}22`,
          animation:sheetExit?"slideDown .2s ease forwards":"slideUp .28s cubic-bezier(.34,1.56,.64,1)"}}>
          {coachKey==="buy_low"&&<CoachMark k="buy_low" style={{top:-30,left:14}}/>}
          {pagerMatch&&mode!=="buy"&&<div style={{fontFamily:ft,fontSize:9.5,color:C.gold,marginBottom:7,
            padding:"5px 8px",borderRadius:6,background:C.gold+"14",border:`1px solid ${C.gold}55`,
            animation:pagerHits?"none":"hudPulse 1.6s infinite"}}>
            📟 {pagerHits?`BUYER PAYS +${pd.bonusPct}% — locked in below`:`Buyer waiting: sell ≥${pd.qty} for +${pd.bonusPct}%`}</div>}
          {sp<rawSp&&<div style={{fontFamily:ft,fontSize:9.5,color:C.orange,marginBottom:7,
            padding:"5px 8px",borderRadius:6,background:C.orange+"14",border:`1px solid ${C.orange}44`}}>
            ⚠ Street pays {FM(sp)}/u here (list {FM(rawSp)})
            {(((g.purity||[])[i])??1)<1?" — ✂ cut product":""}
            {g.colTurf?.[g.loc]&&!g.storyFlags.col_peace?" — 🇨🇴 his crews undercut":""}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontFamily:ft,fontSize:14,fontWeight:"bold",color:C.text}}>{d.emoji} {d.name}
              <span style={{color:C.dim,fontSize:10}}> ◆ own {g.inv[i]}{g.avgCost[i]>0&&g.inv[i]>0?` @ ${FM(g.avgCost[i])}`:""}</span></div>
            <button style={{...bt(C.dim),padding:"4px 10px",fontSize:11}}
              onClick={()=>{ setSheetExit(true);
                clearTimeout(sheetTO.current);
                sheetTO.current=setTimeout(()=>{setSelDrug(null);setSheetExit(false);sheetTO.current=null;},190); }}>✕</button>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <button style={{...bt(C.green,mode==="buy"),flex:1,padding:"9px"}} onClick={()=>setMode("buy")}>BUY {FM(bp)}</button>
            <button style={{...bt(C.gold,mode==="sell"),flex:1,padding:"9px"}} onClick={()=>setMode("sell")} disabled={g.inv[i]===0}>SELL {FM(sp)}</button>
          </div>
          {d.tier>=1&&g.inv[i]>=2&&(((g.purity||[])[i])??1)>0.4&&
            <button style={{...bt(C.orange),width:"100%",marginBottom:8,padding:"9px",fontSize:12}}
              onClick={()=>act(processCut,i)}>✂ CUT THE PRODUCT — +80% units, purity {Math.round((((g.purity||[])[i])??1)*100)}% → {Math.round(Math.max(35,(((g.purity||[])[i])??1)*65))}%</button>}
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {[1,5,"max"].map(q=><button key={q} style={{...bt(loc.color,qty===q),flex:1,padding:"8px"}} onClick={()=>setQty(q)}>{q==="max"?"MAX":`×${q}`}</button>)}
          </div>
          {mode==="sell"&&g.avgCost[i]>0&&n>0&&(()=>{const pf=n*(sp-g.avgCost[i]);return(
            <div style={{fontFamily:ft,fontSize:10,textAlign:"center",marginBottom:7,
              color:pf>=0?C.green:C.pink}}>projected {pf>=0?"profit":"loss"}: <b>{FM(pf)}</b></div>);})()}
          <button style={{...bt(mode==="buy"?C.green:C.gold,true),width:"100%",fontSize:14}}
            onClick={mode==="buy"?doBuy:doSell} disabled={n<=0||sheetExit}>
            {mode==="buy"?`BUY ${n} — ${FM(total)}`:`SELL ${n} — +${FM(total)}`}
          </button>
        </div>);})()}

      {/* ── TAB BAR ── */}
      <div style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:0,width:"min(430px,100%)",zIndex:36,
        background:"rgba(4,10,20,.97)",borderTop:`1px solid ${C.border}`,display:"flex",padding:"6px 4px calc(6px + env(safe-area-inset-bottom))"}}>
        {coachKey==="travel_tip"&&<CoachMark k="travel_tip" style={{top:-30,left:"14%"}}/>}
        {TABS.map(([k,icon])=>{
          const on=unlocks[k];
          return(<button key={k} disabled={!on} onClick={()=>{ if(tab==="bank"&&k!=="bank")markCoach("debt_tip"); setTab(k); setSelDrug(null); const rt=document.getElementById("root"); if(rt)rt.scrollTop=0; if(k==="travel"){markCoach("travel_tip"); if(coachKey==="heat_warn")markCoach("heat_warn");} if(meta.sound)SFX.click(); }}
            style={{flex:1,background:"none",border:"none",cursor:on?"pointer":"default",opacity:on?1:.25,padding:"4px 0"}}>
            <div style={{fontSize:17,filter:tab===k?`drop-shadow(0 0 6px ${loc.color})`:"grayscale(.6)"}}>{on?icon:"🔒"}</div>
            <div style={{fontFamily:ft,fontSize:7.5,letterSpacing:1,color:tab===k?loc.color:C.dim,fontWeight:tab===k?"bold":"normal"}}>{k.toUpperCase()}</div>
          </button>);})}
      </div>

      {/* ── OVERLAYS ── */}
      {g.activeStorylet&&<StoryScene key={g.activeStorylet.id} story={g.activeStorylet} g={g} sound={meta.sound}
        onApply={(ns,ch)=>{ setG({...ns,activeStorylet:g.activeStorylet});
          if(meta.sound)SFX.coin();
          if(ch.effects&&ch.effects.cashDelta>0){ addPart(`+${FM(ch.effects.cashDelta)}`,C.green,.42); spawnFly(8); } }}
        onClose={()=>setG(s=>({...s,activeStorylet:null}))}/>}
      {modal&&modal.type==="news"&&<NewspaperModal paper={modal.data} leaving={modal.leaving}
        onClose={()=>{ setModal(m=>m?{...m,leaving:true}:m); setTimeout(()=>setModal(null),180); }}/>}
      {modal&&modal.type==="enc"&&<EncounterModal enc={modal.data} onAct={encAct}/>}
      {modal&&modal.type==="turf"&&<TurfWarModal war={modal.data} g={g} onAct={turfAct}/>}
      {modal&&modal.type==="deal"&&<DealStepModal deal={modal.data} g={g} onAct={dealAct}/>}
      {modal&&modal.type==="world"&&<WorldEventModal ev={modal.data} g={g} onAct={worldAct}/>}
      {mini&&<MiniGame mini={mini} sound={meta.sound}
        onDone={sc=>{ const d=mini.cfg.done; setMini(null); d(sc); }}/>}
      {travelOv&&<TravelOverlay {...travelOv}/>}
      {eraOv&&<EraTakeover era={eraOv} onDone={()=>setEraOv(null)}/>}
      {actCard&&<ActCard data={actCard} onDone={()=>setActCard(null)}/>}
      {dealScene&&<DealSceneFX d={dealScene}/>}
      {breakdown&&<SaleBreakdown d={breakdown}/>}
      <DistrictWash key={"w"+g.loc} color={loc.color}/>
      <FlightLayer flights={flights}/>

      {/* floating numbers */}
      <div style={{position:"fixed",inset:0,zIndex:50,pointerEvents:"none"}}>
        {parts.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y*100}%`,
          fontFamily:ft,fontWeight:"bold",fontSize:p.big?20:14,color:p.color,whiteSpace:"nowrap",
          textShadow:`0 0 10px ${p.color}, 1px 1px 0 #000`,
          animation:p.big?"streakPop 1.1s ease forwards":"floatUp 1.15s ease forwards"}}>{p.text}</div>)}
      </div>
      {flash&&<div style={{position:"fixed",inset:0,zIndex:52,pointerEvents:"none",background:flash,animation:"flashFade .38s ease forwards"}}/>}
      {hitstop&&<div style={{position:"fixed",inset:0,zIndex:52,pointerEvents:"none",background:"radial-gradient(ellipse, transparent 40%, #ffffff33 100%)"}}/>}
      <CRTOverlay heat={g.fedHeat} color={loc.color} night={night}/>
      {/* v5: no run-streak chrome */}
    </div>
  </div>);
}

// ── HUD chip ──
// ═══════════════════════════════════════════════════════════════
// LIVING CITY — READOUTS. Everything the new systems do is legible
// before the player commits to a move.
// ═══════════════════════════════════════════════════════════════
const wireTone=t=>t==="good"?C.green:t==="bad"?C.pink:C.blue;

const NewsWireList=({wire,n=3})=>{
  const rows=(wire||[]).slice(0,n);
  if(!rows.length) return null;
  return(<div style={{marginTop:6,borderTop:`1px solid ${C.border}`,paddingTop:5}}>
    {rows.map((w,i)=><div key={i} style={{fontFamily:fb,fontSize:10.5,fontStyle:"italic",
      color:wireTone(w.tone),opacity:1-i*0.22,marginBottom:2,lineHeight:1.35}}>{w.icon} {w.text}</div>)}
  </div>);
};

// ── STREET INTEL — sits above the market list ──
const MarketWire=({g})=>{
  const loc=g.loc;
  const ld=(g.locDemand||[])[loc]||DRUGS.map(()=>1);
  const pat=(g.patrols||[])[loc]||0, inf=(g.informants||[])[loc]||0;
  const live=(g.shocks||[]).filter(k=>!k.pending&&(k.loc<0||k.loc===loc));
  const soon=(g.shocks||[]).filter(k=>k.pending);
  const fld=g.rival&&g.rival.flood;
  const flood=(fld&&fld.loc===loc&&g.move<fld.until)?fld:null;
  const ranked=ld.map((v,i)=>({i,v}));
  const hot=ranked.filter(x=>x.v>=1.08).sort((a,b)=>b.v-a.v).slice(0,3);
  const cold=ranked.filter(x=>x.v<=0.9).sort((a,b)=>a.v-b.v).slice(0,3);
  const vol=(g.districtSales||[])[loc]||0;
  const patLabel=pat>=4?"SATURATION":pat>=2.5?"HEAVY":"NORMAL";
  const patColor=pat>=4?"#FF1733":pat>=2.5?C.orange:C.dim;
  return(
  <div style={{...bx,marginBottom:8,padding:"8px 10px",border:`1px solid ${C.blue}33`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
      <span style={{fontFamily:ft,fontSize:8.5,letterSpacing:2,color:C.blue}}>
        ◆ STREET INTEL — {LOCS[loc].name.toUpperCase()}</span>
      <span style={{fontFamily:ft,fontSize:9,color:patColor}}>
        {"🚔".repeat(CL(Math.round(pat),1,5))} {patLabel}</span>
    </div>
    {inf>=1&&<div style={{fontFamily:ft,fontSize:9.5,color:inf>=2.5?"#FF1733":C.orange,marginBottom:4}}>
      🐀 INFORMANT WORKING THIS DISTRICT ({inf.toFixed(1)}/5) — settle it in EMPIRE, or trade elsewhere
    </div>}
    {flood&&<div style={{fontFamily:ft,fontSize:9.5,color:C.orange,marginBottom:4}}>
      🇨🇴 His crews are dumping {DRUGS[flood.drug].name} here — prices held down {Math.max(1,flood.until-g.move)} more move(s)
    </div>}
    {live.map((k,i)=><div key={"lv"+i} style={{fontFamily:ft,fontSize:9.5,marginBottom:3,
      color:k.kind==="spike"?C.green:C.pink}}>
      {k.icon} {k.kind==="spike"?"SPIKE":"CRASH"} ×{k.mult.toFixed(2)} on {DRUGS[k.drug].name} — {k.moves} move(s) left
    </div>)}
    {soon.map((k,i)=><div key={"sn"+i} style={{fontFamily:ft,fontSize:9.5,color:C.gold,marginBottom:3,
      animation:"hudPulse 1.8s infinite",borderRadius:6,padding:"2px 4px"}}>
      📻 INCOMING — {k.warn}
    </div>)}
    {vol>=12&&<div style={{fontFamily:ft,fontSize:9.5,color:C.dim,marginBottom:4}}>
      📦 You have moved {Math.round(vol)} units through here lately — the buyers are getting picky</div>}
    {(hot.length>0||cold.length>0)&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
      {hot.map(x=><span key={"h"+x.i} style={{fontFamily:ft,fontSize:9,color:C.gold,
        border:`1px solid ${C.gold}44`,borderRadius:8,padding:"2px 6px"}}>
        {DRUGS[x.i].emoji} HUNGRY ×{x.v.toFixed(2)}</span>)}
      {cold.map(x=><span key={"c"+x.i} style={{fontFamily:ft,fontSize:9,color:C.dim,
        border:`1px solid ${C.border}`,borderRadius:8,padding:"2px 6px"}}>
        {DRUGS[x.i].emoji} SATURATED ×{x.v.toFixed(2)}</span>)}
    </div>}
    <NewsWireList wire={g.newsWire} n={3}/>
  </div>);
};

// ── DISPATCH BOARD — sits above the travel list ──
const DistrictBoard=({g})=>(
  <div style={{...bx,marginBottom:8,padding:"8px 10px",border:`1px solid ${C.blue}33`}}>
    <div style={{fontFamily:ft,fontSize:8.5,letterSpacing:2,color:C.blue,marginBottom:5}}>
      ◆ DISPATCH BOARD — READ IT BEFORE YOU DRIVE</div>
    {LOCS.map((l,i)=>{
      const dh=heatAt(g,i).next-g.fedHeat;
      const pat=(g.patrols||[])[i]||0, inf=(g.informants||[])[i]||0;
      const sk=(g.shocks||[]).filter(k=>!k.pending&&(k.loc<0||k.loc===i));
      return(<div key={l.name} style={{display:"flex",alignItems:"center",gap:6,fontFamily:ft,fontSize:9,
        padding:"3px 0",borderBottom:i<LOCS.length-1?`1px solid ${C.border}66`:"none"}}>
        <span style={{width:15}}>{l.icon}</span>
        <span style={{flex:1,color:i===g.loc?l.color:C.text}}>
          {l.name}{g.turf[i]>0?" "+TURF_LEVELS[g.turf[i]].icon:""}</span>
        <span style={{minWidth:36,textAlign:"right",color:dh<0?C.green:dh>0?C.pink:C.dim}}>
          🔥{dh>0?"+":""}{dh}</span>
        <span style={{minWidth:32,textAlign:"right",color:pat>=4?"#FF1733":pat>=2.5?C.orange:C.dim}}>
          🚔{pat.toFixed(1)}</span>
        <span style={{minWidth:16,textAlign:"right",color:inf>=1?"#FF1733":C.border}}>{inf>=1?"🐀":"·"}</span>
        <span style={{minWidth:34,textAlign:"right"}}>
          {sk.length?sk.map((k,j)=><span key={j} style={{color:k.kind==="spike"?C.green:C.pink}}>
            {k.kind==="spike"?"▲":"▼"}{DRUGS[k.drug].emoji}</span>):<span style={{color:C.border}}>·</span>}</span>
        <span style={{minWidth:16,textAlign:"right",color:C.orange}}>{(g.colTurf||[])[i]?"🇨🇴":""}</span>
      </div>);})}
    <div style={{fontFamily:ft,fontSize:8,color:C.dim,marginTop:5,lineHeight:1.4}}>
      🔥 heat change if you go there now ◆ 🚔 patrol pressure ◆ 🐀 informant ◆ ▲▼ live supply shock</div>
    <NewsWireList wire={g.newsWire} n={2}/>
  </div>
);

// ── HEAT FORECAST CHIP — heat becomes a plan, not a surprise ──
const HeatPlanChip=({g})=>{
  if(!g.hudSeen.heat) return null;
  const h=heatAt(g,g.loc), d=h.next-g.fedHeat;
  const col=d<0?C.green:d>0?C.orange:C.dim;
  return(<div style={{...bx,padding:"5px 10px",fontFamily:ft,fontSize:11,fontWeight:"bold",
    border:`1px solid ${col}44`,color:col}}>
    🔮{d>0?"+":""}{d}<span style={{color:C.dim,fontSize:8,fontWeight:"normal"}}> next{h.floor>0?" ◆ floor "+h.floor:""}</span>
  </div>);
};

// ── THE LAUNDROMAT — clean money is safe and illiquid ──
const LaunderPanel=({g,act})=>{
  const chans=LAUNDER_CHANNELS.filter(c=>c.need(g));
  return(<div style={{...bx,marginBottom:8,border:`1px solid ${C.gold}33`}}>
    <div style={{fontFamily:ft,fontSize:8.5,letterSpacing:2,color:C.gold,marginBottom:4}}>◆ THE LAUNDROMAT</div>
    <div style={{fontFamily:fb,fontSize:10.5,fontStyle:"italic",color:C.dim,marginBottom:7,lineHeight:1.4}}>
      Clean money cannot buy product and cannot be seized. Dirty money buys everything and belongs to
      whoever can prove it is yours. Caps reset every move.</div>
    {chans.map(ch=>{
      const room=launderCap(g,ch);
      const amt=Math.min(g.cash,room);
      const clean=Math.floor(amt*(1-ch.fee));
      return(<div key={ch.id} style={{...bx,padding:"7px 9px",marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:6}}>
          <span style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:C.gold}}>{ch.icon} {ch.name}</span>
          <span style={{fontFamily:ft,fontSize:8.5,color:C.dim,textAlign:"right"}}>
            {Math.round(ch.fee*100)}% fee ◆ {FM(room)} left{ch.risk?` ◆ ${Math.round(ch.risk*100)}% trail`:""}</span>
        </div>
        <div style={{fontFamily:fb,fontSize:10.5,fontStyle:"italic",color:C.dim,margin:"3px 0 6px",lineHeight:1.35}}>{ch.desc}</div>
        <button style={{...bt(C.gold),width:"100%",padding:"8px",fontSize:11}} disabled={amt<500}
          onClick={()=>act(processLaunder,ch.id,amt)}>WASH {FM(amt)} ▸ ✨ {FM(clean)}</button>
      </div>);})}
  </div>);
};

// ── RIVAL DOSSIER — the whole-game opponent, visible at all times ──
const RivalDossier=({g,act})=>{
  const r=g.rival||initRival();
  const cols=(g.colTurf||[]).filter(Boolean).length;
  if(r.broken) return(<div style={{...bx,marginBottom:8,border:`1px solid ${C.gold}55`,
    fontFamily:ft,fontSize:10.5,color:C.gold}}>
    👑 EL COLOMBIANO IS FINISHED. The corners answer to you now.</div>);
  const awake=(g.currentEra||0)>=1||(g.totalProfit||0)>=20000;
  const mine=strengthOf(g), his=Math.round(r.power);
  const next=r.power>=22?34:r.power>=13?22:13;
  return(<div style={{...bx,marginBottom:8,border:`1px solid ${C.orange}55`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
      <span style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.orange}}>◆ THE RIVAL — EL COLOMBIANO</span>
      <span style={{fontFamily:ft,fontSize:9,color:r.truce>0?C.green:C.dim}}>
        {r.truce>=900?"PERMANENT PEACE":r.truce>0?`TRUCE ${r.truce}`:awake?"ACTIVE":"DORMANT"}</span>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:6}}>
      <div style={{flex:1}}>
        <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginBottom:2}}>YOUR STRENGTH {mine}</div>
        <Bar v={mine} max={Math.max(40,his,mine)} color={mine>=his?C.green:C.blue} h={5}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginBottom:2}}>HIS POWER {his}</div>
        <Bar v={his} max={Math.max(40,his,mine)} color={C.orange} h={5}/>
      </div>
    </div>
    <div style={{fontFamily:fb,fontSize:11,fontStyle:"italic",color:C.text,marginBottom:5,lineHeight:1.4}}>
      {r.lastText} {cols>0?`He holds ${cols} district${cols>1?"s":""}.`:""}
      {r.raids>0?` ${r.raids} raid${r.raids>1?"s":""} on your blocks so far.`:""}
    </div>
    <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,marginBottom:6}}>
      NEXT CONFRONTATION AT POWER {next} ◆ crews, guns, cred and districts all count toward your strength</div>
    <button style={{...bt(C.pink),width:"100%",padding:"8px",fontSize:11}}
      disabled={g.cash<6000||g.cred<25||!awake}
      onClick={()=>act(processSabotage)}>
      🔥 BURN A STASH HOUSE — $6,000 {g.cred<25?"(NEEDS 25 CRED)":"◆ −3 his power, or he learns your name"}</button>
  </div>);
};

// ── STREET OPERATIONS — informants and crew loyalty, per district ──
const DistrictOps=({g,act})=>{
  const rows=LOCS.map((l,i)=>({l,i,pat:(g.patrols||[])[i]||0,inf:(g.informants||[])[i]||0,
    loy:(((g.enfLoyalty||[])[i])??100),enf:(g.enforcers||[])[i]||0}))
    .filter(r=>r.inf>=1||r.enf>0);
  if(!rows.length) return null;
  return(<div style={{...bx,marginBottom:8,border:`1px solid ${C.blue}33`}}>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.blue,marginBottom:6}}>
      ◆ STREET OPERATIONS — UNPAID CREWS DESERT, SNITCHES COMPOUND</div>
    {rows.map(r=>{
      const infCost=Math.floor(700+r.inf*1500+(g.totalProfit||0)*0.005);
      const bonusCost=r.enf*900;
      const here=g.loc===r.i;
      return(<div key={r.l.name} style={{marginBottom:8,paddingBottom:7,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontFamily:ft,fontSize:10.5,color:r.l.color,marginBottom:3}}>
          {r.l.icon} {r.l.name}
          <span style={{color:C.dim,fontSize:9}}> ◆ 🚔{r.pat.toFixed(1)}{r.inf>=1?` ◆ 🐀${r.inf.toFixed(1)}`:""}
          {r.enf>0?` ◆ 👊${r.enf} at ${Math.round(r.loy)}%`:""}</span></div>
        {r.enf>0&&<div style={{marginBottom:5}}>
          <Bar v={r.loy} color={r.loy>=60?C.green:r.loy>=35?C.orange:C.pink} h={3}/></div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {r.inf>=1&&here&&<button style={{...bt(C.blue),flex:1,padding:"7px",fontSize:10}}
            disabled={g.cash<infCost} onClick={()=>act(processPayInformant,r.i)}>
            🤐 BUY SILENCE — {FM(infCost)}</button>}
          {r.inf>=1&&here&&<button style={{...bt(C.pink),flex:1,padding:"7px",fontSize:10}}
            onClick={()=>act(processLeanOnInformant,r.i)}>👊 LEAN ON HIM</button>}
          {r.inf>=1&&!here&&<div style={{fontFamily:ft,fontSize:9,color:C.dim,padding:"6px 2px"}}>
            travel there to deal with the snitch</div>}
          {r.enf>0&&<button style={{...bt(C.gold),flex:1,padding:"7px",fontSize:10}}
            disabled={g.cash<bonusCost||r.loy>=98} onClick={()=>act(processCrewBonus,r.i)}>
            👊 PAY BONUS — {FM(bonusCost)}</button>}
        </div>
      </div>);})}
  </div>);
};

// ── CONFRONTATION MODAL ──
const WorldEventModal=({ev,g,onAct})=>(
  <Modal onClose={()=>{}}>
    <div style={{...bx,border:`1px solid ${ev.color}88`,padding:16,boxShadow:`0 0 30px ${ev.color}33`}}>
      <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:ev.color,marginBottom:8}}>◆ {ev.header}</div>
      <Neon color={ev.color} size={18}>{ev.icon} {ev.title}</Neon>
      <div style={{fontFamily:fb,fontSize:14.5,fontStyle:"italic",lineHeight:1.55,color:C.text,margin:"10px 0 14px"}}>
        {ev.text}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {ev.opts.map(o=>{
          const broke=o.cost>0&&g.cash<o.cost;
          return(<div key={o.id}>
            <button disabled={broke} style={{...bt(o.color),width:"100%",opacity:broke?.45:1}}
              onClick={()=>onAct(o)}>{o.label}</button>
            <div style={{fontFamily:ft,fontSize:8.5,color:broke?C.pink:C.dim,margin:"4px 2px 0",lineHeight:1.35}}>
              {broke?"NOT ENOUGH CASH — ":""}{o.note}</div>
          </div>);})}
      </div>
    </div>
  </Modal>
);

const HudChip=({icon,label,color,bar,pulse})=>(
  <div style={{...bx,padding:"5px 10px",display:"flex",flexDirection:"column",gap:3,border:`1px solid ${color}44`,animation:pulse?"hudPing .6s ease, hudPulse 1.2s .6s infinite":"hudPing .6s ease"}}>
    <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:ft,fontSize:12,fontWeight:"bold",color}}>
      <span style={{fontSize:10}}>{icon}</span><span key={label} style={{display:"inline-block",animation:"popIn .24s ease"}}>{label}</span></div>
    {bar!=null&&<div style={{width:46}}><Bar v={bar} color={color} h={3}/></div>}
  </div>
);

// ── BANK ──
const BankTab=({g,act,meta,onEscape,markCoach})=>{
  const half=Math.floor(g.cash/2),halfB=Math.floor(g.bank/2);
  return(<div style={{position:"relative"}}>
    {!g.coach.debt_tip&&<CoachMark k="debt_tip" style={{top:-4,right:8}}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
      {[["💵 CASH",g.cash,C.green],["🏦 BANK",g.bank,C.blue],["✨ CLEAN",g.cleanCash||0,C.gold]].map(([k,v,c])=>
        <div key={k} style={{...bx,padding:8,textAlign:"center"}}>
          <div style={{fontFamily:ft,fontSize:8,color:C.dim,letterSpacing:1}}>{k}</div>
          <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:c}}>{FM(v)}</div></div>)}
    </div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <button style={{...bt(C.blue),flex:1}} disabled={half<=0} onClick={()=>act(processBank,"deposit",half)}>DEPOSIT {FM(half)}</button>
      <button style={{...bt(C.blue),flex:1}} disabled={halfB<=0} onClick={()=>act(processBank,"withdraw",halfB)}>WITHDRAW {FM(halfB)}</button>
    </div>
    {g.debt>0&&<button style={{...bt(C.pink),width:"100%",marginBottom:8}} disabled={g.cash<=0}
      onClick={()=>act(processBank,"paydebt",Math.min(g.cash,g.debt))}>
      📕 PAY DOWN THE BOOK {FM(Math.min(g.cash,g.debt))} — outstanding {FM(g.debt)}</button>}
    <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginBottom:10,lineHeight:1.5}}>
      The book was César's. Your name is written under his in the same hand. It compounds 8%+ every four moves and it sends people, and there is nobody to negotiate with. Bank earns 3%.</div>
    {!g.gun&&<button style={{...bt(C.orange),width:"100%",marginBottom:8}} disabled={g.cash<4000}
      onClick={()=>act(processBuyGun)}>🔫 BUY A PIECE — $4,000</button>}
    {(g.fedHeat>=15||(g.npcState.ramirez.evidence||0)>=4)&&(()=>{const lc=Math.max(1500,Math.floor(1500+g.fedHeat*70+(g.npcState.ramirez.evidence||0)*350));
      return <button style={{...bt(C.blue),width:"100%",marginBottom:8}} disabled={g.cash<lc}
        onClick={()=>act(processLawyer)}>⚖️ RETAIN COUNSEL — {FM(lc)} (−25 heat, −3 evidence)</button>;})()}
    {(()=>{const owed=g.debt||0;return(
    <div style={{...bx,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontFamily:ft,fontSize:10,marginBottom:5}}>
        <span style={{color:C.pink,fontWeight:"bold"}}>📕 THE BOOK — CÉSAR'S LINE</span>
        <span style={{color:owed<=0?C.green:owed>=20000?"#FF1733":C.dim}}>{owed<=0?"CLEAR":FM(owed)}</span></div>
      <Bar v={CL(owed/300,0,100)} max={100} color={owed>=20000?"#FF1733":owed>0?C.pink:C.green}/>
      <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginTop:5,lineHeight:1.5}}>
        {owed<=0?"✓ Paid. Nobody sends a note about it. It simply stops."
          :owed>=30000?"They come every third move now, and they have stopped apologizing first."
          :owed>=20000?"They come every fourth move. One of them still apologizes first."
          :owed>=10000?"Somebody checks on you about every sixth move."
          :"Under ten thousand, nobody bothers to walk up the stairs."}</div>
    </div>);})()}
    <LaunderPanel g={g} act={act}/>
    {lastNightOpen(g)
      ?<button style={{...bt(C.flamingo,true),width:"100%"}} onClick={onEscape}>🌙 THE LAST NIGHT — GO TO THE GALLERY</button>
      :<div style={{...bx,textAlign:"center",fontFamily:fb,fontSize:12,fontStyle:"italic",color:C.dim,lineHeight:1.55}}>
        There is a night when this ends and everybody is in one room for it. It is not tonight.</div>}
  </div>);
};

// ── EMPIRE ──
const EmpireTab=({g,act,setMini})=>(
  <div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>
      ◆ TURF PAYS EVERY MOVE — ENFORCERS HOLD IT (−{FM(ENFORCER_UPKEEP)}/move each)</div>
    <RivalDossier g={g} act={act}/>
    <DistrictOps g={g} act={act}/>
    {(g.colTurf||[]).some(Boolean)&&<div style={{...bx,marginBottom:8,border:`1px solid ${C.orange}55`,fontFamily:ft,fontSize:10,color:C.text}}>
      🇨🇴 <b style={{color:C.orange}}>EL COLOMBIANO</b> holds {(g.colTurf||[]).filter(Boolean).length} district{(g.colTurf||[]).filter(Boolean).length>1?"s":""}.{g.storyFlags.col_peace?" The peace holds — attacking breaks it.":" His crews undercut your sales there −12%."}</div>}
    {LOCS.map((l,i)=>{
      const lv=g.turf[i],next=TURF_LEVELS[lv+1];
      return(<div key={l.name} style={{...bx,marginBottom:7,animation:`riseIn .3s ${i*.04}s ease both`,
        border:g.colTurf?.[i]?`1px solid ${C.orange}66`:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontFamily:ft,fontSize:12,fontWeight:"bold",color:l.color}}>{l.icon} {l.name}{g.colTurf?.[i]&&<span style={{color:C.orange,fontSize:10}}> 🇨🇴 HIS</span>}</div>
          <div style={{fontFamily:ft,fontSize:10,color:lv>0?C.gold:C.dim}}>
            {TURF_LEVELS[lv].icon} {TURF_LEVELS[lv].name}{lv>0?` ◆ +${FM(TURF_LEVELS[lv].income)}/mv`:""} ◆ 👊{g.enforcers[i]}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {next&&<button style={{...bt(C.gold),flex:2,padding:"8px",fontSize:11}} disabled={g.cash<next.cost}
            onClick={()=>act(processBuyTurf,i)}>{next.icon} {next.name.toUpperCase()} — {FM(next.cost)}</button>}
          <button style={{...bt(C.orange),flex:1,padding:"8px",fontSize:11}} disabled={g.cash<ENFORCER_COST}
            onClick={()=>act(processHireEnforcer,i)}>+👊 {FM(ENFORCER_COST)}</button>
        </div>
        {g.colTurf?.[i]&&<button style={{...bt(C.pink),width:"100%",marginTop:6,padding:"9px",fontSize:11}}
          onClick={()=>setMini({kind:"mash",cfg:{title:"⚔ TAKE HIS BLOCK",
            desc:"Your crew's strength scales with how hard you push. Three seconds.",
            rival:4+(g.currentEra||0)*2,
            done:s=>act(processAttackRival,i,s)}})}>⚔ TAKE HIS BLOCK — power {g.enforcers[i]*2+(g.gun?3:0)+Math.floor(g.cred/15)} vs ~{4+(g.currentEra||0)*2}{g.storyFlags.col_peace?" (BREAKS THE PEACE)":""}</button>}
      </div>);})}
  </div>
);

// ── CONTACTS dossier ──
const ContactsTab=({g})=>{
  const rows=[
    g.npcState.maria.met&&{who:"maria",mood:g.npcState.maria.trust>=3?"flirty":g.npcState.maria.trust<=-2?"angry":"amused",
      stat:`TRUST ${g.npcState.maria.trust>0?"+":""}${g.npcState.maria.trust}`,
      bar:CL((g.npcState.maria.trust+5)*10,0,100),barColor:g.npcState.maria.trust>=0?C.green:C.pink,
      note:g.npcState.maria.trust>=4?"She picks up on the first ring.":g.npcState.maria.trust<=-2?"She's stopped answering. Bad sign.":"Knows everyone worth knowing."},
    g.npcState.ramirez.met&&{who:"ramirez",mood:g.npcState.ramirez.evidence>=12?"wry":"tired",
      stat:`EVIDENCE ${g.npcState.ramirez.evidence||0}/20`,
      bar:CL((g.npcState.ramirez.evidence||0)/20*100,0,100),barColor:(g.npcState.ramirez.evidence||0)>=12?"#FF1733":C.orange,
      note:(g.npcState.ramirez.evidence||0)>=14?"The case file is almost thick enough.":"Building a case. Patiently."},
    g.npcState.colombiano.met&&{who:"colombiano",mood:g.npcState.colombiano.trust>=2?"pleased":g.npcState.colombiano.trust<=-2?"cold":"neutral",
      stat:`STANDING ${g.npcState.colombiano.trust>0?"+":""}${g.npcState.colombiano.trust}`,
      bar:CL((g.npcState.colombiano.trust+5)*10,0,100),barColor:g.npcState.colombiano.trust>=0?C.orange:"#FF1733",
      note:g.npcState.colombiano.trust<=-3?"You are on a list you do not want to be on.":"Watching how you handle weight."},
    g.npcState.tiburon&&g.npcState.tiburon.met&&{who:"tiburon",mood:"neutral",
      stat:g.debt>0?`YOU OWE ${FM(g.debt)}`:`BOOK CLEAR ◆ TRUST ${g.npcState.tiburon.trust>0?"+":""}${g.npcState.tiburon.trust}`,
      bar:g.debt>0?CL(100-g.debt/300,5,100):CL((g.npcState.tiburon.trust+5)*10,0,100),
      barColor:g.debt>=20000?"#FF1733":g.debt>0?C.orange:C.green,
      note:g.storyFlags.shark_grudge?"His associates remember your brass. Painfully.":g.debt>=20000?"Stop. Pay. The. Book.":g.debt>0?"Debt is friendship. For now.":"A rare thing: the shark respects you."},
    g.npcState.cass&&g.npcState.cass.met&&{who:"cass",mood:g.npcState.cass.trust>=2?"pleased":g.npcState.cass.trust<=-2?"nervous":"neutral",
      stat:`TRUST ${g.npcState.cass.trust>0?"+":""}${g.npcState.cass.trust}${g.storyFlags.cass_network?" ◆ NETWORK":""}`,
      bar:CL((g.npcState.cass.trust+5)*10,0,100),barColor:g.npcState.cass.trust>=0?C.gold:C.pink,
      note:g.storyFlags.cass_burned?"She volunteered downtown. With files.":g.storyFlags.cass_network?"Your money gets clean while you sleep.":"Knows where six billion dollars went."},
  ].filter(Boolean);
  return(<div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ KNOWN ASSOCIATES — DADE COUNTY FILE</div>
    {rows.length===0&&<div style={{...bx,fontFamily:fb,fontStyle:"italic",fontSize:13,color:C.dim}}>Nobody knows your name yet. Keep dealing.</div>}
    {rows.map((r,i)=>(<div key={r.who} style={{...bx,display:"flex",gap:10,marginBottom:8,animation:`riseIn .3s ${i*.06}s ease both`}}>
      <NPCFrame who={r.who} mood={r.mood} w={88} showName={false}/>
      <div style={{flex:1}}>
        <div style={{fontFamily:ft,fontSize:9,letterSpacing:1.5,color:`rgba(${NPCS[r.who].glow},1)`}}>{NPCS[r.who].role}</div>
        <div style={{fontFamily:ft,fontSize:13,fontWeight:"bold",color:C.text,marginBottom:4}}>{NPCS[r.who].name}</div>
        <div style={{fontFamily:ft,fontSize:10,color:r.barColor,marginBottom:3}}>{r.stat}</div>
        <Bar v={r.bar} color={r.barColor} h={4}/>
        <div style={{fontFamily:fb,fontSize:11,fontStyle:"italic",color:C.dim,marginTop:6,lineHeight:1.4}}>{r.note}</div>
      </div>
    </div>))}
  </div>);
};

// ── LIFE ──
const LifeTab=({g,act})=>{
  const sh=g.safeHouses[g.loc];
  return(<div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ THE LIFESTYLE — CRED OPENS DOORS</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {LIFESTYLE.map((l,i)=>{
        const owned=g.lifestyle.includes(l.effect);
        return(<button key={l.effect} disabled={owned||g.cash<l.cost} onClick={()=>act(processBuyLifestyle,l.effect)}
          style={{...bx,textAlign:"left",cursor:owned?"default":"pointer",animation:`riseIn .3s ${i*.04}s ease both`,
            border:`1px solid ${owned?C.gold:g.cash>=l.cost?C.border:"#101a28"}`,opacity:owned?1:g.cash>=l.cost?1:.5}}>
          <div style={{fontSize:18}}>{l.icon}</div>
          <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:owned?C.gold:C.text}}>{l.name}{owned?" ✓":""}</div>
          <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,margin:"2px 0"}}>{l.desc}</div>
          {!owned&&<div style={{fontFamily:ft,fontSize:10,color:g.cash>=l.cost?C.green:C.pink}}>{FM(l.cost)}</div>}
        </button>);})}
    </div>
    <div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim,marginBottom:8}}>◆ SAFE HOUSE — {LOCS[g.loc].name.toUpperCase()}</div>
    {sh<0?(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {SAFE_HOUSES.map((s,t)=><button key={s.name} disabled={g.cash<s.cost} onClick={()=>act(processBuySafeHouse,t)}
        style={{...bx,textAlign:"left",cursor:"pointer",opacity:g.cash>=s.cost?1:.5}}>
        <div style={{fontFamily:ft,fontSize:11,fontWeight:"bold",color:C.blue}}>{s.icon} {s.name}</div>
        <div style={{fontFamily:ft,fontSize:8.5,color:C.dim,margin:"2px 0"}}>{s.storage} storage ◆ −{s.heatDecay} heat here</div>
        <div style={{fontFamily:ft,fontSize:10,color:g.cash>=s.cost?C.green:C.pink}}>{FM(s.cost)}</div>
      </button>)}</div>
    ):(<div>
      <div style={{...bx,marginBottom:8,fontFamily:ft,fontSize:11,color:C.blue}}>
        {SAFE_HOUSES[sh].icon} {SAFE_HOUSES[sh].name} ◆ stash {g.stashInv.reduce((a,b)=>a+b,0)}/{SAFE_HOUSES[sh].storage} ◆ heat −{SAFE_HOUSES[sh].heatDecay} here
        <div style={{fontFamily:fb,fontSize:10,fontStyle:"italic",color:C.dim,marginTop:3}}>Stashed product can't be confiscated — but a hot, fat stash can get raided.</div>
      </div>
      {DRUGS.map((d,i)=>(g.inv[i]>0||g.stashInv[i]>0)&&(
        <div key={d.name} style={{...bx,display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"8px 10px"}}>
          <span>{d.emoji}</span>
          <span style={{fontFamily:ft,fontSize:11,color:C.text,flex:1}}>{d.name} ◆ bag {g.inv[i]} / stash {g.stashInv[i]}</span>
          <button style={{...bt(C.blue),padding:"5px 9px",fontSize:10}} disabled={g.inv[i]<=0}
            onClick={()=>act(processStash,i,Math.min(5,g.inv[i]),true)}>STASH 5▼</button>
          <button style={{...bt(C.gold),padding:"5px 9px",fontSize:10}} disabled={g.stashInv[i]<=0}
            onClick={()=>act(processStash,i,Math.min(5,g.stashInv[i]),false)}>TAKE 5▲</button>
        </div>))}
    </div>)}
  </div>);
};
