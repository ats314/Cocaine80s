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
  { bg:"linear-gradient(180deg,#0a0818 0%,#1a0a30 20%,#e87040 55%,#f0a030 75%,#060E1A 100%)", text:"MIAMI. AUGUST 1986.", sub:"The cocaine cowboys already started the party.", icon:"🌴" },
  { bg:"linear-gradient(180deg,#0a0a15 0%,#151525 40%,#252535 70%,#0a0a15 100%)", text:"CÉSAR GOT ARRESTED IN PANAMA.", sub:"You kept the brick.", icon:"🚌" },
  { bg:"linear-gradient(180deg,#050510 0%,#0d0a22 40%,#3d1040 80%,#060E1A 100%)", text:"YOU JUST GOT OFF THE BUS.", sub:"In your bag: $200 and one kilo of Bolivian flake.", icon:"💼" },
  { bg:"linear-gradient(180deg,#3d1040 0%,#8b2050 30%,#cc4060 60%,#060E1A 100%)", text:"ONE NAME. ONE KILO. NO PLAN.", sub:"Find Maria Santos. Flip the brick. Start the clock.", icon:"📟" },
];

// ── COACH MARKS — one concept, ≤8 words, dismissed by action ──
const COACH_MARKS = {
  tap_drug:   { text:"Tap a drug to trade" },
  buy_low:    { text:"Buy low. Sell high." },
  travel_tip: { text:"Prices change every district →" },
  sell_here:  { text:"Green chip = profit here" },
  heat_warn:  { text:"Big deals raise heat" },
  debt_tip:   { text:"Tiburón charges 8% interest" },
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
};

// ═══════════════════════════════════════════════════════════════
// NARRATIVE ENGINE — Quality-Based Storylets
// ═══════════════════════════════════════════════════════════════
const STORY = {
  // ── ONBOARDING: the brick call (priority forced; fires immediately) ──
  brick_call: { speaker:"maria", portrait:"amused", priority:99,
    conditions:{ flagNot:"brick_deal_done", moveLte:0 },
    lines:[
      { text:"A payphone outside the Greyhound station rings. It rings for you. You know it rings for you because the man leaning on it says, “It’s for you.”", portrait:"neutral" },
      { text:"“César’s friend. The idiot on the bus with a kilo in his gym bag.” A woman’s voice. Amused. Expensive. “Relax — if I were police you’d already be in a van.”", portrait:"amused" },
      { text:"“I’m Maria. César owed me money, which makes that brick partly mine. Bring it to Little Havana. I have a buyer tonight. I take 40, you take 60. Or argue with me — that’s also fun.”", portrait:"flirty" },
    ],
    choices:[
      { text:"Take the deal — $4,800", reaction:"The buyer arrives in a white Countach. He doesn’t get out. An envelope comes through the window: $4,800 cash. “Pleasure doing business,” Maria says down the line. “Now you have money. Go make more. I’ll be in touch.”", effects:{ cashDelta:4800, "npc.maria.trust":2, "npc.maria.met":true, flags:["brick_deal_done","maria_friendly_intro","maria_brick_debt"], montage:"Flipped César’s brick for $4,800." } },
      { text:"Push for 50/50 — $6,000", reaction:"Silence on the line. Then: “Okay, cowboy. Fifty-fifty.” She sounds amused. That’s either good or dangerous. $6,000 cash. You feel like you won something. You’ll find out later what it cost.", effects:{ cashDelta:6000, "npc.maria.trust":1, "npc.maria.met":true, flags:["brick_deal_done","maria_friendly_intro","maria_negotiated"], montage:"Squeezed Maria for 50/50 on the brick. $6,000." } },
    ] },

  // ── ACT STRUCTURE — the spine of the run ──
  act2_maria: { speaker:"maria", portrait:"knowing", priority:13,
    conditions:{ totalProfitGte:12000, "npc.maria.met":{eq:true}, flagNot:"act2_done", dealsSinceGte:2 },
    lines:[
      { text:"Maria finds you at a window table in a Cuban diner. She doesn\u2019t order. She never orders. \u201cTwelve thousand in profit. The street is starting to say your name without laughing.\u201d", portrait:"amused" },
      { text:"\u201cEvery man I\u2019ve watched make money in this town believed the money was the game. The money is the ANTE.\u201d She taps the window. Outside, a DEA sedan idles. \u201cThe game is leaving the table while you still can.\u201d", portrait:"knowing" },
    ],
    choices:[
      { text:"So how do I get out?", reaction:"\u201cForty thousand, clean or close to it, buys a passport and a charter from a forger I trust.\u201d She finally smiles. \u201cStack it. I\u2019ll be watching. I\u2019m always watching.\u201d", effects:{ "npc.maria.trust":1, flags:["act2_done"], montage:"Maria laid out the exit: $50K and a forger." } },
      { text:"I'm not leaving. I'm winning.", reaction:"Something flickers behind her eyes \u2014 amusement, or a memory. \u201cThat\u2019s what C\u00e9sar said. And the one before C\u00e9sar.\u201d She drops a hundred on a table with no bill. \u201cThen win BIG, cowboy. Eighty cred, four districts, half a million moved. Miami only kneels to numbers like that.\u201d", effects:{ cred:3, flags:["act2_done","kingpin_path"], montage:"Told Maria you're here to win, not run." } },
    ] },

  act3_maria: { speaker:"maria", portrait:"flirty", priority:13,
    conditions:{ totalProfitGte:45000, flag:"act2_done", flagNot:"act3_done", dealsSinceGte:1, "npc.maria.trust":{gte:1} },
    lines:[
      { text:"A postcard arrives at your motel. No return address. A flamingo on the front. On the back, in expensive handwriting: \u2018Homestead. Tuesday. Bring a toothbrush.\u2019", portrait:"neutral" },
      { text:"You call her from a payphone. \u201cThere\u2019s an airstrip near Homestead,\u201d Maria says. \u201cA man with a plane owes me a favor the size of a felony. Two seats. I\u2019m offering you one \u2014 twenty thousand covers the fuel and his silence.\u201d", portrait:"flirty" },
    ],
    choices:[
      { text:"Hold the seat for me", reaction:"\u201cDone. The offer doesn\u2019t expire, but Miami\u2019s patience does.\u201d A pause, almost soft. \u201cDon\u2019t make me read about you in the Herald.\u201d Click. The dial tone sounds like a countdown.", effects:{ "npc.maria.trust":1, flags:["act3_done","maria_exit_plan"], montage:"Maria is holding a seat on a plane out." } },
      { text:"Sell the seat. I need capital.", reaction:"A long silence. \u201cYou\u2019re either the smartest man I\u2019ve met or the next John Doe in the Dade County cooler.\u201d She wires you eight thousand for the favor returned. The plane leaves Tuesday. Without you.", effects:{ cashDelta:8000, "npc.maria.trust":-1, flags:["act3_done","sold_the_seat"], montage:"Sold your seat on Maria's plane for $8,000." } },
    ] },

  act3_forger: { speaker:"tiburon", portrait:"neutral", priority:13,
    conditions:{ totalProfitGte:45000, flag:"act2_done", flagNot:"act3_done", "npc.maria.trust":{lte:0} },
    lines:[
      { text:"Tibur\u00f3n waves you over at the fish market like an old debt come to say hello. \u201cYou look like a man counting backwards from a number. Everybody gets there. Even me, once.\u201d", portrait:"neutral" },
      { text:"\u201cThere is a man in the Keys who makes paper people. Passports. Histories. He owes me a fish dinner and his life, roughly in that order. Forty thousand, and you become somebody who was never here.\u201d The gold tooth flashes. \u201cConsider it a loyalty program.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"Tell me where to find him", reaction:"He writes an address on butcher paper that smells like the sea. \u201cWhen you go, go QUIET. The city notices leaving more than arriving. It\u2019s vain like that.\u201d", effects:{ "npc.tiburon.met":true, "npc.tiburon.trust":1, flags:["act3_done","forger_contact"], montage:"Tibur\u00f3n pointed the way out: a forger in the Keys." } },
    ] },

  ramirez_endgame: { speaker:"ramirez", portrait:"wry", priority:14,
    conditions:{ evidenceGte:14, "npc.ramirez.met":{eq:true}, flagNot:"endgame_warned" },
    lines:[
      { text:"Your phone rings at 4 AM. You didn\u2019t give anyone this number. \u201cI want you to hear something,\u201d Ramirez says. Paper rustles. \u201cThat\u2019s your file. Four hundred pages. It makes a sound now when I drop it on the State Attorney\u2019s desk.\u201d", portrait:"tired" },
      { text:"\u201cI\u2019m not calling to gloat. In fifteen years I\u2019ve arrested two hundred of you, and exactly three ever got this warning: it\u2019s days now. Not weeks. Days.\u201d", portrait:"wry" },
    ],
    choices:[
      { text:"Then I'd better hurry", reaction:"\u201cYeah,\u201d he says, and you can hear the shrug. \u201cThey always say that too.\u201d The line goes dead. Somewhere across the city, a man with a four-hundred-page file goes back to work.", effects:{ flags:["endgame_warned"] } },
      { text:"What's the deal, detective?", reaction:"\u201cSame as it ever was. Names. Dates. The Colombian\u2019s supply route.\u201d You give him enough to matter. Pages come out of the file \u2014 you can almost hear them. So can the cartel.", effects:{ "npc.ramirez.evidence":-6, "npc.colombiano.trust":-3, cred:-10, flags:["endgame_warned","became_informant"] } },
    ] },

  // ── EL COLOMBIANO — THE RIVAL EMPIRE ──
  col_rival: { speaker:"colombiano", portrait:"pleased", priority:12,
    conditions:{ flag:"col_rival_active", flagNot:"col_rival_met", dealsSinceGte:1 },
    lines:[
      { text:"A table is waiting for you at a restaurant you\u2019ve never been to. So is El Colombiano. Two glasses of rum are already poured, which means he knew you were coming before you did.", portrait:"neutral" },
      { text:"\u201cYou\u2019ve seen my crews on the corners. Good. I wanted you to see.\u201d He unfolds a map of Miami like a man unfolding a will. \u201cThis city is a pie, friend. I am proposing we cut it like gentlemen \u2014 before someone cuts it like animals.\u201d", portrait:"pleased" },
    ],
    choices:[
      { text:"This city isn't big enough for both of us", reaction:"He nods slowly, almost approving, and folds the map with great care. \u201cC\u00e9sar said something similar once. From a payphone in Panama, eventually.\u201d He leaves the rum. He leaves the check. \u201cThen we understand each other perfectly.\u201d", effects:{ "npc.colombiano.trust":-2, cred:4, flags:["col_rival_met","col_war"], montage:"Declared war on El Colombiano over rum you didn't drink." } },
      { text:"To gentlemen, then \u2014 split the city", reaction:"\u201cTo gentlemen.\u201d The glasses touch. \u201cMy blocks are my blocks. Yours are yours. My crews will not undercut you, and the pie stays a pie.\u201d The rum is excellent. The peace will last exactly as long as it profits him.", effects:{ "npc.colombiano.trust":2, flags:["col_rival_met","col_peace"], montage:"Split the city with El Colombiano. For now." } },
    ] },

  col_parley: { speaker:"colombiano", portrait:"cold", priority:12,
    conditions:{ flag:"col_war", credGte:50, flagNot:"col_parley_done", dealsSinceGte:3 },
    lines:[
      { text:"Three of his men walk you \u2014 politely, which is worse \u2014 to a car with diplomatic plates. El Colombiano sits in the back reading the Herald. \u201cThey wrote about you today. Page nine. You\u2019re moving up.\u201d", portrait:"cold" },
      { text:"\u201cThis war is costing me money. Worse \u2014 it\u2019s costing me QUIET.\u201d He folds the paper. \u201cFifteen thousand, and my crews stand down. Or we keep going, and one of us ends up on page ONE.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"Take the $15,000 — peace", reaction:"The envelope is heavy and the handshake is dry. \u201cYou know what separates businessmen from bodies? Knowing which page of the newspaper to aim for.\u201d The car door opens. Miami looks the same. It isn\u2019t.", effects:{ cashDelta:15000, "npc.colombiano.trust":2, flags:["col_parley_done","col_peace"], montage:"Took $15K from El Colombiano to end the war." } },
      { text:"I'll see you on page one", reaction:"For one long second, nothing in the car moves. Then he laughs \u2014 a short, surgical sound. \u201cC\u00e9sar at least took the money first.\u201d The door opens itself, somehow. The war is no longer business. It is personal, which in Miami is the expensive kind.", effects:{ "npc.colombiano.trust":-3, cred:5, flags:["col_parley_done"], montage:"Spat on El Colombiano's peace. Page one it is." } },
    ] },

  // ── MARIA — DEEPER ──
  maria_truth: { speaker:"maria", portrait:"vulnerable", priority:10,
    conditions:{ "npc.maria.trust":{gte:5}, flagNot:"maria_truth", dealsSinceGte:4 },
    lines:[
      { text:"Maria drinks tonight, which she never does, at a bar with no sign, which is the only kind she trusts. \u201cYou want to know about C\u00e9sar.\u201d It isn\u2019t a question. \u201cEveryone eventually wants to know about C\u00e9sar.\u201d", portrait:"vulnerable" },
      { text:"\u201cHe wasn\u2019t my debtor. He was my brother. The brick you carried off that bus was supposed to buy his way out of Panama.\u201d She turns the glass slowly. \u201cIt bought you in instead. Funny city.\u201d", portrait:"vulnerable" },
    ],
    choices:[
      { text:"Then let me buy him out", reaction:"She studies you for a long time \u2014 the way she studied the deposit slip, the map, every man who ever promised her something. \u201cFive thousand reaches Panama by Friday.\u201d She doesn\u2019t say thank you. She squeezes your hand once, hard, which is worth more.", effects:{ cashDelta:-5000, "npc.maria.trust":3, flags:["maria_truth","freed_cesar"], montage:"Sent $5K to Panama. C\u00e9sar walks." } },
      { text:"That's his debt, not mine", reaction:"\u201cNo,\u201d she agrees, finishing the drink. \u201cIt isn\u2019t.\u201d She leaves money on the bar and the warmth somewhere else entirely. \u201cYou\u2019re right, of course. Being right is your whole problem.\u201d", effects:{ "npc.maria.trust":-1, flags:["maria_truth"] } },
    ] },

  maria_guardian: { speaker:"maria", portrait:"knowing", priority:11,
    conditions:{ "npc.maria.trust":{gte:4}, fedHeatGte:55, flagNot:"maria_guardian", dealsSinceGte:3 },
    lines:[
      { text:"Your pager buzzes a code you don\u2019t recognize: 5-0-5-0-5-0. You call. Maria answers before the first ring finishes. \u201cDon\u2019t talk. Listen. Vice is running saturation patrols on your usual routes tonight. ALL of them.\u201d", portrait:"knowing" },
      { text:"\u201cA friend of a friend types up the duty rosters. She types slowly when I pay her to. Take the causeway. Take it tonight. And burn this number.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"Take the back way (\u221212 heat)", reaction:"You drive the causeway with the windows down while, across the city, blue lights orbit corners you didn\u2019t stand on. The bay smells like salt and a favor you\u2019ll owe forever.", effects:{ heatDelta:-12, "npc.maria.trust":1, flags:["maria_guardian"], montage:"Maria's typist saved your night. \u221212 heat." } },
      { text:"I don't run from patrols", reaction:"A pause long enough to drive a Countach through. \u201cOf course you don\u2019t.\u201d The line clicks. Somewhere, a typist types at normal speed again.", effects:{ cred:2, flags:["maria_guardian"] } },
    ] },

  // ── CASS DELGADO — THE LAUNDERER ──
  cass_intro: { speaker:"cass", portrait:"pleased", priority:12,
    conditions:{ cashGte:18000, flagNot:"cass_met", dealsSinceGte:2 },
    lines:[
      { text:"The branch manager\u2019s office at Biscayne Fidelity smells like new carpet and old money. Cassandra Delgado reads your deposit slip the way a jeweler reads a diamond. \u201cEighteen thousand. Cash. In a gym bag.\u201d", portrait:"neutral" },
      { text:"\u201cRelax. Half of Brickell banks gym bags. The Federal Reserve says Miami has six billion more in circulation than it should. SOMEBODY\u2019S counting it.\u201d She closes the blinds with a remote. In 1986, that\u2019s practically witchcraft.", portrait:"pleased" },
      { text:"\u201cMy service: I run your paper through accounts so boring the IRS falls asleep reading them. Ten percent fee. What comes out is CLEAN \u2014 the kind of money that buys passports instead of indictments.\u201d", portrait:"pleased" },
    ],
    choices:[
      { text:"Clean a quarter of my roll \u2014 10% fee", reaction:"She works a calculator with the serenity of a monk. Forms appear. You sign a name that is almost yours. \u201cPleasure doing business. Tell no one. Especially anyone named Ramirez.\u201d", effects:{ "npc.cass.met":true, "npc.cass.trust":1, launderPct:{pct:0.25,fee:0.10}, flags:["cass_met"], montage:"Opened an arrangement with Cass Delgado at Biscayne Fidelity." } },
      { text:"Too rich for me", reaction:"\u201cSuit yourself.\u201d She reopens the blinds. \u201cBut men who keep it all in cash end up explaining the cash. Usually in a small room. Usually to a man with a thick file.\u201d She slides you a card anyway. Gold lettering.", effects:{ "npc.cass.met":true, flags:["cass_met","cass_declined"] } },
    ] },

  cass_network: { speaker:"cass", portrait:"pleased", priority:10,
    conditions:{ "npc.cass.trust":{gte:1}, cashGte:30000, flagNot:"cass_network", dealsSinceGte:3 },
    lines:[
      { text:"Cass calls you to a lunch you didn\u2019t agree to at a club you can\u2019t afford. \u201cI\u2019ve been promoted. Regional. Which means I now supervise the people who would audit me. Miami is a beautiful machine.\u201d", portrait:"pleased" },
      { text:"\u201cNew offer. I put you in the NETWORK \u2014 shell companies, a marina, two funeral homes. Your money flows clean automatically. Plus I wash forty percent of what\u2019s in your pocket right now. Twelve percent fee. Standing arrangement.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"Put me in the network", reaction:"\u201cWelcome to the laundromat.\u201d She raises a glass of something French. From now on, money moves clean while you sleep. Somewhere in a funeral home ledger, you are listed as a \u2018consultant.\u2019", effects:{ "npc.cass.trust":1, launderPct:{pct:0.40,fee:0.12}, flags:["cass_network"], montage:"Joined Cass's laundering network. The funeral homes know your name." } },
      { text:"I like my money where I can see it", reaction:"\u201cSpoken like a man who\u2019s never met a forfeiture order.\u201d She finishes her drink and yours. \u201cThe offer stands until it doesn\u2019t.\u201d", effects:{ flags:["cass_network_declined"] } },
    ] },

  cass_squeeze: { speaker:"cass", portrait:"nervous", priority:11,
    conditions:{ "npc.cass.met":{eq:true}, fedHeatGte:45, flagNot:"cass_squeeze_done", dealsSinceGte:3 },
    lines:[
      { text:"Cass is waiting in your car. You didn\u2019t leave it unlocked. \u201cTwo men from Treasury visited the branch today,\u201d she says. Her hands are steady. Her voice is not. \u201cThey asked about gym bags.\u201d", portrait:"nervous" },
      { text:"\u201cI can make the paper trail evaporate. But evaporation costs eight thousand, and it costs it TONIGHT. Or I can start remembering things wrong about you. Banker\u2019s memory is a negotiable instrument.\u201d", portrait:"nervous" },
    ],
    choices:[
      { text:"Pay the $8,000", reaction:"By morning, three accounts have been renamed, two closed, and one transferred to a dead man in Boca with excellent credit. \u201cWe never had this conversation,\u201d Cass says. \u201cWhich, in fairness, is true of all our conversations.\u201d", effects:{ cashDelta:-8000, "npc.cass.trust":1, flags:["cass_squeeze_done"], montage:"Paid Cass $8K to evaporate the paper trail." } },
      { text:"Remember whatever you want", reaction:"She nods slowly, the way bankers nod at bad loans. \u201cFor the record, I liked you.\u201d The car door closes with terrible gentleness. Somewhere downtown, a memory begins improving itself.", effects:{ "npc.cass.trust":-3, flags:["cass_squeeze_done","cass_burned"] } },
    ] },

  // ── TIBURÓN — THE LOAN SHARK ──
  // ── ARC: THE SUCCESSION — Tiburón, his nephew, and who owns a name (4 beats + epilogues) ──
  shark_diagnosis: { speaker:"tiburon", portrait:"neutral", priority:10,
    conditions:{ "npc.tiburon.met":{eq:true}, totalProfitGte:55000, flagNot:"shark_succession", dealsSinceGte:3 },
    lines:[
      { text:"Tiburón is not gutting anything. That is the first wrong thing. He is sitting on an overturned crate with a towel pressed to his mouth, and the ice table behind him is still holding yesterday’s fish.", portrait:"neutral" },
      { text:"“Jackson Memorial,” he says, when he can. “They put a camera down my throat and showed me a photograph of the inside of me. Amigo, it is UGLY in there. Forty years of Marlboros and Presidente and telling people bad news.”", portrait:"neutral" },
      { text:"He folds the towel so you cannot see the color of it. “My sister’s boy — Néstor. Twenty-six. He wears a beeper on his BELT like a doctor, and he has been counting my book at night when he believes I am asleep.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Your book is safe with me, viejo", reaction:"“VIEJO.” The laugh turns into something else and he waves it away. “You say that word like a man who intends to keep saying it. Okay. Okay. Remember that you said it — my memory is going, amigo, but my BOOK never does.”", effects:{ "npc.tiburon.trust":2, flags:["shark_succession"], montage:"Tiburon coughed into a towel and told you about his nephew." } },
      { text:"Sounds like Néstor already runs it", reaction:"The old man goes still in a way that has ended arguments across four decades. “He runs the PARTS. There is a difference between running the parts and being the animal.” He spits into the ice. “But yes. He does. You have a nasty eye, amigo. I like it. Not today.”", effects:{ cred:2, "npc.tiburon.trust":-1, flags:["shark_succession","shark_saw_it"], montage:"Told Tiburon his nephew was already running the book." } },
    ] },

  shark_nestor: { speaker:"tiburon", portrait:"neutral", priority:11,
    conditions:{ flag:"shark_succession", flagNot:"shark_nestor_done", dealsSinceGte:4 },
    lines:[
      { text:"The fish market has new scales — electronic, digital, Japanese. Tiburón stands beside one like it insulted his mother. “Néstor bought these. They are accurate to the GRAM. Tell me: in forty years, has any man ever wanted an accurate number from me?”", portrait:"neutral" },
      { text:"“He went to the men in Hialeah who lend me what I lend you. He told them I am sick, which is true, and that I am soft, which is a matter of opinion, and that the book should belong to a man with a future.”", portrait:"neutral" },
      { text:"“So now there is a vote, which is a beautiful word for what it is. And you, amigo — you are ON the book. Big number, good payer, the kind of client men brag about. Your voice is worth something in that room. He will come to you. He drives a red IROC. Subtle, no?”", portrait:"neutral" },
    ],
    choices:[
      { text:"What do you want me to say in that room?", reaction:"“Say whatever keeps you breathing. I mean this.” He puts a hand on your shoulder; it weighs less than it used to. “But if you can say it in a way where I still own my own name at the end, I will remember that longer than I remember most things now.”", effects:{ "npc.tiburon.trust":1, flags:["shark_nestor_done"], montage:"Tiburon asked you to speak for him at the vote in Hialeah." } },
      { text:"I stay out of family business", reaction:"“FAMILY BUSINESS.” He tests the phrase like a bad oyster. “Amigo, you owe money to a family. There is no outside. There is only how far from the table you are sitting when they decide.”", effects:{ flags:["shark_nestor_done","shark_neutral"], montage:"Told Tiburon you stay out of family business. He explained the seating." } },
    ] },

  shark_the_vote: { speaker:"tiburon", portrait:"neutral", priority:12,
    conditions:{ flag:"shark_nestor_done", flagNot:"shark_resolved", dealsSinceGte:3 },
    lines:[
      { text:"A social club in Hialeah with the windows painted over and a dominoes table nobody is using. Six men who lend money and one man who borrows it — that is you. Tiburón sits at the end with the towel in his apron pocket. Néstor stands, because standing is his entire argument.", portrait:"neutral" },
      { text:"“The book earns eleven percent,” Néstor says, holding a ledger like a hymnal. “It should earn nineteen. My uncle grants extensions for FUNERALS. Last year he forgave four thousand dollars because a man’s roof came off in a storm.” Nobody at the table disagrees with the arithmetic.", portrait:"neutral" },
      { text:"Then all of them look at you, because in a room full of lenders the only honest witness is the debt. “Speak,” says the oldest man there, not unkindly. “You are the merchandise. The merchandise gets one word.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Néstor's numbers are better. Back the nephew.", reaction:"You say nineteen percent out loud and the room relaxes, the way rooms do when they hear what they already decided. Néstor wipes your book clean on the spot — a coronation gift, paid with somebody else’s mercy. Tiburón walks out into the parking lot alone and stands there a while, in the sun, in his apron.", effects:{ debtDelta:-1000000, cred:3, "npc.tiburon.trust":-4, flags:["shark_resolved","shark_heir"], montage:"Backed Nestor. The book got wiped. The old man walked out alone." } },
      { text:"The old man's word is the only collateral here — $12,000 says so", reaction:"You put twelve thousand dollars on the dominoes table and explain what an extension for a funeral is actually worth in a business where every single person eventually needs one. It is the most expensive sentence of your life. The oldest man nods once. Néstor leaves before the vote finishes, and the IROC does not start on the first try.", effects:{ cashDelta:-12000, cred:5, "npc.tiburon.trust":4, flags:["shark_resolved","shark_loyal_final"], montage:"Paid $12,000 to keep Tiburon's name on Tiburon's book." } },
      { text:"I abstain. It's your family.", reaction:"“The merchandise abstains,” the oldest man says, amused, and writes something down. The vote goes to Néstor by one. On the way out Tiburón does not look at you, which is worse than if he had, and your interest rate goes up on Friday without anybody making a phone call.", effects:{ debtDelta:3000, "npc.tiburon.trust":-2, flags:["shark_resolved","shark_abstained"], montage:"Abstained in Hialeah. Your rate went up on Friday." } },
    ] },

  shark_epilogue_heir: { speaker:"tiburon", portrait:"neutral", priority:9,
    conditions:{ flag:"shark_heir", flagNot:"shark_epilogue", dealsSinceGte:4 },
    lines:[
      { text:"You find the old man on a shrimp boat at the end of a dock in Islamorada, with a radio playing a game nobody in Florida cares about. The apron is gone. He looks smaller, and somehow also better.", portrait:"neutral" },
      { text:"“Néstor sends me an envelope every month. It is exactly correct. Nineteen percent of nothing I care about.” He baits a hook badly, on purpose, because there is no hurry anymore. “You voted with the arithmetic, amigo. Arithmetic is a good friend to have and a terrible thing to be.”", portrait:"neutral" },
    ],
    choices:[
      { text:"You'd have done the same", reaction:"“I would have,” he agrees instantly, which somehow makes it worse. “That is how I know exactly what you are.” He hands you a beer that is too warm. You drink it. The boat rocks. Neither of you says anything for twenty minutes, and it is almost forgiveness.", effects:{ "npc.tiburon.trust":1, flags:["shark_epilogue"], montage:"Warm beer on a shrimp boat in Islamorada. Almost forgiveness." } },
      { text:"I'm sorry, viejo", reaction:"He waves the hook at you like a conductor. “Don’t be sorry. Sorry is what men say instead of money.” Then, after a while, quieter: “But if you ever need to be somewhere that is not Miami, this boat still runs. That is not sorry. That is the other thing.”", effects:{ "npc.tiburon.trust":2, flags:["shark_epilogue","shark_boat"], montage:"The shrimp boat still runs. Tiburon said so, and he does not lie about boats." } },
    ] },

  shark_epilogue_loyal: { speaker:"tiburon", portrait:"neutral", priority:9,
    conditions:{ flag:"shark_loyal_final", flagNot:"shark_epilogue", dealsSinceGte:4 },
    lines:[
      { text:"The fish market at 6 AM, and the ice table is full again. Tiburón is gutting a snapper one-handed and losing an argument about the price of stone crab. He looks like a photograph of himself from 1978.", portrait:"neutral" },
      { text:"“Néstor is in Tampa. He has a car wash. It is a very good car wash — I sent him the money for it, because he is my sister’s boy, and because a man with a car wash does not need a book.” The gold tooth flashes. “Also the doctors lied to me. Six months, they said. That was seven months ago. I intend to make this joke for YEARS.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Then let's keep making money, viejo", reaction:"“AMIGO.” He hits the table hard enough to make the ice jump. “That is the correct thing to say to a dying man who is not dying yet.” Your rate drops two points that morning, and the name of a boat that runs south out of Islamorada gets written on a napkin in fish-scale handwriting.", effects:{ debtDelta:-4000, "npc.tiburon.trust":2, flags:["shark_epilogue","shark_boat"], montage:"Tiburon wrote a boat's name on a napkin. It runs south." } },
      { text:"Take the money and rest", reaction:"“REST.” He says it the way other men say a slur. But he takes a snapper off the ice, wraps it in newspaper, and pushes it into your hands. “For the pot. Rest is for men who did not enjoy the work. Come Thursday — Thursday I will need a man with a car.”", effects:{ "npc.tiburon.trust":1, flags:["shark_epilogue","shark_boat"], montage:"Told the shark to rest. He handed you a snapper instead." } },
    ] },

  shark_collectors: { speaker:"tiburon", portrait:"neutral", priority:11,
    conditions:{ "npc.tiburon.met":{eq:true}, debtGte:22000, flagNot:"shark_collector", dealsSinceGte:2 },
    lines:[
      { text:"Two men are waiting in the stairwell, and one of them apologizes before he starts, which is the most frightening part of the entire evening. Tiburón watches from the car with the window down, drinking a mamey shake through a straw.", portrait:"neutral" },
      { text:"“This is not personal, and I want you to hear that from ME so you do not hear it from a stranger,” he calls up. “Twenty-two thousand dollars is not a debt anymore, amigo. It is an OPINION about me. And opinions travel.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Take the beating. Keep the cash.", reaction:"They are professionals, so it is short and nothing important breaks. Afterward Tiburón passes you the mamey shake through the car window and says, with real warmth, “See? Now nobody has to TALK about you.” The book is unchanged. Your ribs are not.", effects:{ hpDelta:-22, cred:3, "npc.tiburon.trust":1, flags:["shark_collector"], montage:"Took the beating instead of the write-down. Kept the cash." } },
      { text:"Pay $6,000 right now", reaction:"The envelope ends the evening the way a coin stops a jukebox. “THERE it is,” Tiburón says, delighted, and the two men relax back into being guys — one of them asks if you know a good body shop in Hialeah. “See how quickly we return to friendship?”", effects:{ cashDelta:-6000, debtDelta:-7000, "npc.tiburon.trust":1, flags:["shark_collector"], montage:"Paid $6,000 in a stairwell. The evening ended early." } },
    ] },

  shark_pistol: { speaker:"tiburon", portrait:"neutral", priority:8,
    conditions:{ "npc.tiburon.met":{eq:true}, hasGun:false, credGte:18, cashGte:3000, flagNot:"shark_pistol", dealsSinceGte:3 },
    lines:[
      { text:"There is a cigar box under the ice table, which is a bad place to keep anything you plan to eat. Inside, wrapped in a dish towel: a .38 with the bluing worn off the grip and somebody else’s initials scratched out of the frame.", portrait:"neutral" },
      { text:"“Twenty-five hundred. I am not selling you courage, amigo — courage is free and stupid. I am selling you a REASON for men to be polite. In this city that is a utility, like water. You pay for it monthly whether you use it or not.”", portrait:"neutral" },
    ],
    choices:[
      { text:"I'll take it — $2,500", reaction:"He wraps it back in the towel and hands it over like a fish. “Rule one: never show it. Rule two: if you show it, you are already using it. Rule three, which everybody forgets — a gun in Miami is a magnet for the exact evening you bought it to avoid.”", effects:{ cashDelta:-2500, gun:true, cred:2, flags:["shark_pistol"], montage:"Bought a .38 out of a cigar box under the ice table." } },
      { text:"I'd rather not carry", reaction:"“Good.” He puts the box away without ceremony. “The ones who say yes too fast are the ones I read about in the Herald. The ones who say no become the ones I do business with for twenty years.” He says this to a man he has known for four months.", effects:{ "npc.tiburon.trust":1, flags:["shark_pistol","refused_gun"], montage:"Turned down the .38. The shark approved, loudly." } },
    ] },

  shark_keys_water: { speaker:"tiburon", portrait:"neutral", priority:6,
    conditions:{ "npc.tiburon.met":{eq:true}, locIn:[5], totalProfitGte:40000, flagNot:"keys_run", dealsSinceGte:4 },
    lines:[
      { text:"Tiburón is on a dock in Islamorada in a shirt with parrots on it, supervising four men loading ice onto a boat that is considerably faster than a boat carrying ice needs to be.", portrait:"neutral" },
      { text:"“Understand the geography, amigo. Between Key Largo and Marathon there are eleven hundred islands and about forty police officers, and all forty of them know each other’s boats by sight. This is not lawlessness. It is a very stable arrangement that everybody respects and nobody writes down.”", portrait:"neutral" },
      { text:"“The mistake tourists make is the mistake the DEA makes: they look for the smuggler. In the Keys there is no smuggler. There is a fishing guide who is also somebody’s cousin, and there is Thursday.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Teach me the water", reaction:"He teaches you three channels, two names to drop, and one hand signal that means turn around and do not ask. “Now you know as much as a bad guide and less than a good one. Do not be confident. Confidence is how the reef gets fed.”", effects:{ cred:3, "npc.tiburon.trust":1, flags:["keys_run","knows_the_water"], montage:"Learned three channels and one hand signal in Islamorada." } },
      { text:"I'll stick to the highway", reaction:"“US 1. One road, one lane in each direction, a hundred and thirteen miles of nowhere to turn around.” He shrugs, enormously. “It is a road designed by God for roadblocks. But you are a grown man and I am only a fishmonger.”", effects:{ flags:["keys_run"], montage:"Stuck to US 1. A road designed by God for roadblocks." } },
    ] },

  tiburon_intro: { speaker:"tiburon", portrait:"neutral", priority:11,
    conditions:{ debtGte:6000, totalDealsGte:2, flagNot:"shark_intro" },
    lines:[
      { text:"The fish market on the river, 6 AM. Tibur\u00f3n guts a snapper with one hand and waves you over with the knife. \u201cThe new businessman! Sit. Mind the blood \u2014 it\u2019s the fish\u2019s. Today.\u201d", portrait:"neutral" },
      { text:"\u201cYou owe my book money. This is not a problem \u2014 DEBT is friendship, amigo. Debt means I think about you every day.\u201d The gold tooth catches the dawn. \u201cThe problem is when I stop thinking about you. Then my associates start.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"Pay $1,000 tribute now", reaction:"He weighs the envelope without opening it \u2014 a parlor trick that has ended arguments all over Miami. \u201cGood faith! I knock eighteen hundred off the book. See? Friendship.\u201d He hands you a snapper wrapped in newspaper. Your picture is not in the newspaper. Yet.", effects:{ cashDelta:-1000, debtDelta:-1800, "npc.tiburon.met":true, "npc.tiburon.trust":1, flags:["shark_intro"], montage:"Paid tribute to Tibur\u00f3n at the fish market." } },
      { text:"You'll get paid when you get paid", reaction:"The market goes quiet the way water goes quiet around a fin. Then Tibur\u00f3n LAUGHS \u2014 huge, delighted. \u201cBrass ones! I respect it. My associates, however, are paid NOT to respect it.\u201d The knife comes down through the snapper\u2019s spine. Punctuation.", effects:{ "npc.tiburon.met":true, "npc.tiburon.trust":-1, cred:3, flags:["shark_intro","shark_grudge"] } },
    ] },

  tiburon_job: { speaker:"tiburon", portrait:"neutral", priority:9,
    conditions:{ "npc.tiburon.met":{eq:true}, debtLte:0, flagNot:"shark_job", dealsSinceGte:3 },
    lines:[
      { text:"Tibur\u00f3n finds you eating lunch and sits down without asking, which is how kings sit. \u201cYou paid the book. ALL of it. You know how rare that is? I had a banner made. Then I remembered I don\u2019t do banners.\u201d", portrait:"neutral" },
      { text:"\u201cSo \u2014 a JOB. A bag rides from the Keys to the Gables in your car. You don\u2019t open it. You don\u2019t smell it. Six thousand for an afternoon of not being curious. The cops may notice the car. That\u2019s the six thousand talking.\u201d", portrait:"neutral" },
    ],
    choices:[
      { text:"I can not-be-curious for $6,000", reaction:"The bag is heavier than money and lighter than a body, and you spend the whole drive proud of yourself for not narrowing it down further. The envelope at the end is exactly six thousand. Tibur\u00f3n counts respect the way he counts cash: out loud.", effects:{ cashDelta:6000, heatDelta:8, "npc.tiburon.trust":1, flags:["shark_job"], montage:"Ran a no-questions bag for Tibur\u00f3n. $6,000." } },
      { text:"I'm out of the favor business", reaction:"\u201cSmart, maybe. Boring, definitely.\u201d He steals a fry. \u201cThe offer floats away like a body at high tide. Which is to say: it may come back.\u201d", effects:{ flags:["shark_job"] } },
    ] },

  // ── MARIA ──
  // ── ARC: CÉSAR — the brother you bought out of Panama comes home ──
  cesar_returns: { speaker:"maria", portrait:"vulnerable", priority:13,
    conditions:{ flag:"freed_cesar", totalProfitGte:60000, flagNot:"cesar_back", dealsSinceGte:4 },
    lines:[
      { text:"Maria calls at an hour she never calls, and her voice is doing something it has never done before: hurrying. “He’s at the gallery. He came off a plane from Panama City four hours ago with a duffel bag and a haircut somebody gave him with kitchen scissors.”", portrait:"vulnerable" },
      { text:"César Santos is younger than you expected and thinner than the photograph, and he shakes your hand with the specific gratitude of a man who has been told exactly who paid for his freedom. He has also, you notice immediately, already located the bar cart.", portrait:"neutral" },
      { text:"Maria watches him across the room. “He was better at this than all of us. That is not a compliment. Here is the honest sentence, cowboy: if you put him to work he will make you money for eleven weeks, and then he will make you a DEFENDANT.”", portrait:"knowing" },
    ],
    choices:[
      { text:"Put him to work", reaction:"He is spectacular. He knows three suppliers you could never reach and one buyer you should not have. He also talks — in bars, to women, to men he assumes are those women’s cousins. Maria stops coming to the gallery on the days he is there.", effects:{ cashDelta:4000, cred:6, "npc.maria.trust":-1, "npc.ramirez.evidence":2, flags:["cesar_back","cesar_working"], montage:"Put Cesar Santos to work. He was spectacular. He was also loud." } },
      { text:"Buy him a bus ticket somewhere boring — $3,000", reaction:"Gainesville. Three thousand dollars, an apartment deposit, and a promise you both know is a coin flip. Maria walks him to the station herself and comes back wearing sunglasses at nine o’clock at night. “Thank you,” she says, and then immediately, “we are not discussing this.”", effects:{ cashDelta:-3000, "npc.maria.trust":3, flags:["cesar_back","cesar_exiled"], montage:"Bought Cesar a bus ticket to Gainesville. Maria wore sunglasses at night." } },
    ] },

  cesar_eleven_weeks: { speaker:"maria", portrait:"angry", priority:12,
    conditions:{ flag:"cesar_working", evidenceGte:9, flagNot:"cesar_arc_done", dealsSinceGte:4 },
    lines:[
      { text:"Eleven weeks, almost exactly. Maria puts a payphone number in front of you and does not sit down. “Metro-Dade picked him up on Washington Avenue with four grams and a mouth. He has been in an interview room for nine hours.”", portrait:"angry" },
      { text:"“Nine hours is not nothing, to be fair to him. Most men are finished at ninety minutes.” She lights a cigarette she does not smoke and watches it burn down. “There is a lawyer named Broche. He costs nine thousand dollars and he gets people out before lunch.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Call Broche. Pay the nine.", reaction:"The lawyer arrives at 6 AM in a suit worth more than the charge, and César is on the street by ten having said, it turns out, absolutely nothing for nine hours. “He HELD,” Maria says, genuinely stunned. “I have never been so happy to be wrong about my own blood.”", effects:{ cashDelta:-9000, "npc.ramirez.evidence":-4, "npc.maria.trust":3, flags:["cesar_arc_done","cesar_held"], montage:"Paid Broche $9,000. Cesar held for nine hours and said nothing." } },
      { text:"He got himself in there", reaction:"“Yes,” Maria agrees, and that is the entire conversation. By Thursday there is a new name in a file downtown and a detective who suddenly knows where you buy. César goes back to Panama, permanently. Maria answers the phone on the fourth ring now instead of the first.", effects:{ "npc.ramirez.evidence":4, "npc.maria.trust":-3, flags:["cesar_arc_done","cesar_burned"], montage:"Left Cesar in the room. He talked. Maria answers on the fourth ring now." } },
    ] },

  maria_empty_seat: { speaker:"maria", portrait:"knowing", priority:10,
    conditions:{ flag:"sold_the_seat", totalProfitGte:70000, flagNot:"seat_regret", dealsSinceGte:4 },
    lines:[
      { text:"The gallery is between shows, which means it is a white room with a horse in it. Maria is doing inventory with a clipboard, which is the thing she does instead of feelings.", portrait:"neutral" },
      { text:"“The plane went Tuesday, in case you were curious. It landed. The pilot mailed a postcard with nothing written on it, which is how he says everything is fine.” She does not look up. “Your seat went to a woman who owns four dry cleaners. She cried at wheels-up. It was embarrassing for everybody.”", portrait:"knowing" },
      { text:"“There is a second charter in six weeks. Same pilot, worse plane, and the price is no longer friendly, because you taught me that our friendship has a RATE. Twenty-five thousand dollars.”", portrait:"amused" },
    ],
    choices:[
      { text:"Buy the seat back — $25,000", reaction:"She writes it on the clipboard, which is somehow more binding than a contract. “Done. And cowboy — this one I do not resell. Not because I like you. Because I am tired of watching men be clever at exactly the wrong scale.”", effects:{ cashDelta:-25000, "npc.maria.trust":2, flags:["seat_regret","seat_rebought"], montage:"Bought back the seat you sold. Twenty-five thousand. No discount." } },
      { text:"I made the right call", reaction:"“You made A call.” She turns a page on the clipboard. “In eleven years I have watched exactly one man leave Miami with money, and I have watched forty-two men be right about something. Those are the numbers. Do with them whatever you like.”", effects:{ cred:2, "npc.maria.trust":-1, flags:["seat_regret"], montage:"Told Maria you were right about the seat. She quoted you the numbers." } },
    ] },

  maria_prosecutor: { speaker:"maria", portrait:"knowing", priority:10,
    conditions:{ flag:"high_society", credGte:28, flagNot:"prosecutor_met", dealsSinceGte:3 },
    lines:[
      { text:"Same mansion, different party, and the pool is still shaped like a dollar sign. Maria arrives at your elbow with two drinks and one piece of information. “Red dress, eleven o’clock. Diane Vance. Assistant United States Attorney, narcotics.”", portrait:"amused" },
      { text:"“She has been at this party for forty minutes and she has not spoken to a single person who is not under indictment or adjacent to somebody who is. That is not a coincidence, cowboy. That is a WORK EVENT.”", portrait:"knowing" },
      { text:"Vance crosses the room like the hostess invited her, which the hostess did, because in Coral Gables everybody collects everybody. “I know three things about you,” she says, in place of hello, “and two of them are boring.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Take her card", reaction:"The card is thick and the number handwritten on the back is a direct line, which means it is not a courtesy, it is a fishing line. “Call before it’s the only good idea left,” she says. “Everybody calls me eventually. The successful ones call early.” Maria watches this happen with an expression like weather.", effects:{ flags:["prosecutor_met","prosecutor_card"], montage:"Took a federal prosecutor's card. Direct line, handwritten." } },
      { text:"Compliment the dress. Walk away.", reaction:"You tell her the dress is excellent and that you hope the government reimburses her for parking, and you leave her standing in a room full of criminals holding a plastic cup of chardonnay. She laughs. Twice. That is also on the record now.", effects:{ cred:4, "npc.ramirez.evidence":1, flags:["prosecutor_met"], montage:"Walked away from a federal prosecutor at a pool party. She laughed twice." } },
    ] },

  maria_overtown: { speaker:"maria", portrait:"vulnerable", priority:8,
    conditions:{ flag:"maria_hates_crack", soldCrack:true, flagNot:"crack_amends", dealsSinceGte:5 },
    lines:[
      { text:"Maria drives you to Overtown at two in the afternoon, which is a thing she has never done, and parks across the street from an elementary school. She does not say anything for four minutes.", portrait:"neutral" },
      { text:"“The woman on the steps in the blue shirt is Yolanda. Two years ago she kept the books for a shipping company on the river. She is thirty-four years old. Look at her hands, then look at me and tell me it is just business again — I am prepared to hear it. I only want you to say it HERE.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"I'm done selling crack", reaction:"“Okay.” She starts the car. She does not thank you, does not soften, does not make it a moment — which is exactly how you know she believes you. Six blocks later: “There is more money in Coral Gables anyway. Rich people ruin themselves quietly and pay a premium for the privilege.”", effects:{ cred:-2, "npc.maria.trust":3, flags:["crack_amends","no_more_crack"], montage:"Sat outside a school in Overtown with Maria. Stopped selling crack." } },
      { text:"It's just business, Maria", reaction:"She nods slowly, puts the car in gear, and drives you back without another word. At your corner she says, “Thank you for saying it here,” and means it, and you understand that you have just failed a test that was never going to be offered twice.", effects:{ cred:2, "npc.maria.trust":-3, flags:["crack_amends","said_it_in_overtown"], montage:"Said it was just business. In Overtown. Across from the school." } },
    ] },

  maria_causeway: { speaker:"maria", portrait:"flirty", priority:6,
    conditions:{ "npc.maria.met":{eq:true}, nightOnly:true, locIn:[0], credGte:15, flagNot:"causeway_night", dealsSinceGte:4 },
    lines:[
      { text:"Maria makes you pull over halfway across the MacArthur Causeway at three in the morning and shut the engine off. The water is flat and black and the skyline is doing the thing it does, which is pretend to be a promise.", portrait:"neutral" },
      { text:"“Every person in every one of those windows believes this city is about to give them something,” she says, sitting on the hood. “The waiters, the models, the Colombians, the CONGRESSMEN. Same disease. Miami is the only place on earth where it counts as a personality.”", portrait:"flirty" },
      { text:"“I make you stop here because I want you to see it from the outside, once. From out here it is only lights. In there it is a machine, and the machine eats the people who forget the difference.”", portrait:"knowing" },
    ],
    choices:[
      { text:"It's beautiful from here", reaction:"“It is. That is the trap — it is honestly beautiful, so you stay.” She gets back in the car and puts her sunglasses on top of her head at three in the morning. “Enough. One more sincere thought tonight and I will have to buy something to recover.”", effects:{ cred:1, "npc.maria.trust":1, flags:["causeway_night"], montage:"Stopped on the MacArthur at 3 AM. Saw it from the outside, once." } },
      { text:"It's a market. That's all.", reaction:"“God, that’s bleak. Correct, but bleak.” She flicks a cigarette into Biscayne Bay, a felony for which nobody in the history of Florida has ever been charged. “Fine. Drive. The market opens in four hours and neither of us is a poet.”", effects:{ cred:2, flags:["causeway_night"], montage:"Called Miami a market from the middle of the causeway." } },
    ] },

  maria_wide_part: { speaker:"maria", portrait:"knowing", priority:10,
    conditions:{ "npc.maria.met":{eq:true}, moveGte:55, totalProfitGte:80000, flagNot:"clock_late", dealsSinceGte:3 },
    lines:[
      { text:"Maria stopped asking when you are leaving, and you noticed about two weeks after she stopped. Tonight she says it plainly, in the dark gallery with the streetlight doing all the work: “You are not going to go.”", portrait:"knowing" },
      { text:"“I have watched this exact month before. The money is good, the routes are quiet, everyone knows your name, and it feels like the beginning of something. It is not the beginning. It is the WIDE PART. Everything after this narrows.”", portrait:"neutral" },
    ],
    choices:[
      { text:"One more season", reaction:"“One more season.” She repeats it the way a doctor repeats a symptom back to a patient. “Write it down somewhere, so that when it happens you at least get to be right about it. That is worth something. Not very much. Something.”", effects:{ cred:3, flags:["clock_late","one_more_season"], montage:"Told Maria one more season. She repeated it like a symptom." } },
      { text:"Then help me pick the day", reaction:"For the first time in months she looks genuinely surprised. Then she takes a pen and a gallery invoice and writes down four dates, a dollar figure, and one name. “That is the day. That is the number. That is the man. Do not improvise, cowboy — improvising is how everyone I have ever liked has died.”", effects:{ "npc.maria.trust":2, flags:["clock_late","picked_the_day"], montage:"Maria wrote four dates, a number and a name on a gallery invoice." } },
    ] },

  maria_tip: { speaker:"maria", portrait:"amused", priority:9,
    conditions:{ totalProfitGte:5000, "npc.maria.trust":{gte:1}, flagNot:"maria_gave_tip", dealsSinceGte:2 },
    lines:[
      { text:"Your pager buzzes at 2 AM. Maria’s code. You call back from a payphone that smells like bad decisions and worse cologne.", portrait:"neutral" },
      { text:"“I’ve got a man in Overtown who is dry. Crack and cocaine — he’ll pay anything. And I mean anything. Desperate men are profitable men.”", portrait:"amused" },
      { text:"“Buy cheap anywhere else, sell there. And hurry — I gave this number to two people. You’re the one I like slightly more.”", portrait:"flirty" },
    ],
    choices:[{ text:"Thanks, Maria", reaction:"“Don’t thank me. César would’ve charged you for it. You’re already an improvement.” She hangs up. The payphone smells slightly better now.", effects:{ "npc.maria.trust":1, flags:["maria_gave_tip"], demandSpike:{loc:2} } }] },

  maria_party: { speaker:"maria", portrait:"flirty", priority:10,
    conditions:{ credGte:10, "npc.maria.trust":{gte:2}, flagNot:"maria_party_done", dealsSinceGte:3 },
    lines:[
      { text:"Maria takes you to a private party in a Coral Gables mansion. The pool is shaped like a dollar sign. This is not a joke. The host is a “real estate developer” whose real estate consists primarily of cocaine warehouses.", portrait:"amused" },
      { text:"“See the woman in the red dress? Federal prosecutor. See the man she’s talking to? Her biggest defendant. They’ve been sleeping together since April.”", portrait:"knowing" },
      { text:"“This city runs on three things: cocaine, hypocrisy, and pool parties. Try the ceviche — it’s actually good.”", portrait:"flirty" },
    ],
    choices:[
      { text:"Mingle with the guests", reaction:"You spend the night learning that everyone in Coral Gables is either a criminal or married to one. Several are both. Maria introduces you to people whose handshakes feel like contracts. Your name means something now.", effects:{ "npc.maria.trust":1, cred:5, flags:["maria_party_done","high_society"] } },
      { text:"This isn’t my scene", reaction:"“Suit yourself.” She vanishes into a crowd whose net worth exceeds the GDP of several Caribbean nations. You eat the ceviche alone. She was right — it’s actually good.", effects:{ "npc.maria.trust":-1, flags:["maria_party_done"] } },
    ] },

  maria_launder: { speaker:"maria", portrait:"knowing", priority:9,
    conditions:{ totalProfitGte:30000, "npc.maria.trust":{gte:2}, cashGte:8000, flagNot:"maria_launder_offered" },
    lines:[
      { text:"Maria’s gallery. The paintings are aggressively terrible. A canvas splattered with what looks like ketchup has a $28,000 price tag.", portrait:"amused" },
      { text:"“Don’t look at me like that. Art is subjective. Money laundering is objective. I can clean $5K for you right now.”", portrait:"knowing" },
      { text:"She gestures at a painting of a sad horse. “Run it through as a sale of this masterpiece. Nobody questions art. Nobody wants to admit they don’t understand it.”", portrait:"amused" },
    ],
    choices:[
      { text:"Launder $5,000", reaction:"She writes a receipt. The sad horse gets a red SOLD sticker. “I’ve sold that horse four times this month. He’s my best performer. Better than the Basquiat.”", effects:{ cashDelta:-5000, cleanDelta:4500, "npc.maria.trust":1, flags:["maria_launder_offered"] } },
      { text:"Not yet", reaction:"“The offer stands. The horse isn’t going anywhere — nobody actually wants to own it. That’s the whole point.”", effects:{ flags:["maria_launder_offered"] } },
    ] },

  maria_personal: { speaker:"maria", portrait:"vulnerable", priority:10,
    conditions:{ credGte:20, "npc.maria.trust":{gte:4}, "npc.ramirez.met":{eq:true}, flagNot:"maria_personal_done" },
    lines:[
      { text:"3 AM. Maria’s gallery. She’s drinking wine from a coffee mug and her shoes are off. This is the most human you’ve seen her.", portrait:"vulnerable" },
      { text:"“You want to know why I do this? My mother cleaned hotel rooms for twenty years. TWENTY. Her back is destroyed. She can’t stand for more than ten minutes.”", portrait:"angry" },
      { text:"“And the woman in the penthouse — the one whose sheets she changed every day — made her money the same way I make mine. The only difference is the number of zeros and the quality of the attorney.”", portrait:"vulnerable" },
      { text:"She looks at you. The strategy is gone for a moment. What’s underneath is more dangerous. “Stay alive, okay? I’m running out of people I actually like in this city.”", portrait:"vulnerable" },
    ],
    choices:[
      { text:"I’m not going anywhere", reaction:"She doesn’t say anything for a long time. Then: “Don’t make me regret saying that.” She puts her shoes back on. The strategy returns. But something behind it has shifted, and you both know it.", effects:{ "npc.maria.trust":2, flags:["maria_personal_done","maria_close"] } },
      { text:"We’re business. That’s all.", reaction:"“Right. Business.” The coffee mug clinks on the desk. “Of course.” You’ve never heard two words carry that much weight. The gallery feels colder when you leave.", effects:{ "npc.maria.trust":-2, flags:["maria_personal_done","maria_rejected"] } },
    ] },

  maria_crack: { speaker:"maria", portrait:"angry", priority:7,
    conditions:{ "npc.maria.met":{eq:true}, soldCrack:true, flagNot:"maria_hates_crack" },
    lines:[
      { text:"Maria finds you at the bar. She’s not smiling. “Crack. You’re selling crack now.”", portrait:"angry" },
      { text:"“I watched what that did to Overtown. Kids on corners. Mothers who can’t remember their own names. You want to get rich? Fine. But not like that. Not around me.”", portrait:"angry" },
    ],
    choices:[{ text:"It’s just business, Maria", reaction:"“My mother said the same thing about the hotel. ‘It’s just work, Maria.’ It’s never just anything.” She leaves her drink untouched. That’s how you know it’s serious.", effects:{ "npc.maria.trust":-2, flags:["maria_hates_crack"] } }] },

  // ── RAMIREZ ──
  // ── ARC: ELENA — the detective's daughter (5 beats, branch pays off in the ending) ──
  elena_contact_sheet: { speaker:"ramirez", portrait:"tired", priority:11,
    conditions:{ "npc.ramirez.met":{eq:true}, evidenceGte:5, flagNot:"elena_met", dealsSinceGte:3 },
    lines:[
      { text:"Ramirez is sitting on the hood of the brown sedan with a manila envelope on his knee, eating a Cuban sandwich with the concentration of a man who missed lunch on Tuesday and is aware that it is now Thursday.", portrait:"neutral" },
      { text:"“My kid takes pictures. Eighteen. Night classes at Miami-Dade, thinks this city is a SUBJECT instead of a place.” He slides a contact sheet across the hood. Thirty-six tiny frames of Overtown at dusk. “Frame nineteen.”", portrait:"tired" },
      { text:"Frame nineteen is you. Half-turned, hand out, taking money on a corner that has never once been photographed for its architecture. “She doesn’t know what she got. She thinks it’s a picture about the light.”", portrait:"wry" },
    ],
    choices:[
      { text:"She won't see me on that corner again", reaction:"“That’s the correct answer. It’s also the answer everybody gives me.” He folds the sheet back into the envelope like a man putting a bird back in a cage. “Elena. Her name is Elena. Now you know it, which means now it costs you something.”", effects:{ "npc.ramirez.trust":1, flags:["elena_met","elena_promise"], montage:"Ramirez showed you frame nineteen. Her name is Elena." } },
      { text:"Keep your family out of my business", reaction:"“She walked into YOUR business, kid. With a camera her grandmother paid for.” He gets off the hood, brushing crumbs off a tie that stopped being fashionable during the Carter administration. “Fifteen years I’ve done this without hating anybody. Don’t be the one who ruins the record.”", effects:{ "npc.ramirez.evidence":1, "npc.ramirez.trust":-1, flags:["elena_met"], montage:"Told Ramirez to keep his family out of it. He remembered that." } },
    ] },

  elena_exhibition: { speaker:"maria", portrait:"knowing", priority:11,
    conditions:{ flag:"elena_met", "npc.maria.met":{eq:true}, evidenceGte:7, flagNot:"elena_project", dealsSinceGte:4 },
    lines:[
      { text:"Maria has a habit of knowing your business before you have finished having it. Tonight she is holding a gallery mailer and wearing an expression you have learned to be afraid of.", portrait:"knowing" },
      { text:"“Juried student show at the Center for Fine Arts. Thirty prints. It’s called THE ECONOMY OF LIGHT.” She taps a name on the mailer: E. RAMIREZ. “The girl is good, by the way. Genuinely good. That’s the inconvenient part.”", portrait:"amused" },
      { text:"“Frame nineteen goes on a wall four blocks from the State Attorney’s office, blown up to a meter wide. A prosecutor will stand in front of it holding a plastic cup of chardonnay and he WILL recognize you, cowboy, because that is what prosecutors do at parties.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Buy the whole series, anonymously — $6,000", reaction:"Maria buys it through the gallery as an unnamed collector, which is the most Miami sentence ever constructed. The girl gets six thousand dollars and believes she has arrived. In a way she has. “She’ll shoot boats next,” Maria predicts. “Rich people adore boats.”", effects:{ cashDelta:-6000, "npc.maria.trust":1, "npc.ramirez.trust":1, flags:["elena_project","elena_bought"], montage:"Bought Elena Ramirez's entire show. Anonymously. $6,000." } },
      { text:"Let it hang. Let them look.", reaction:"“Bold.” She refolds the mailer with surgical care. “You understand that this is how legends start AND how sentences do.” The show opens Thursday. Nine hundred people come through in three weeks. Two of them work for the government.", effects:{ cred:6, heatDelta:6, "npc.ramirez.evidence":3, flags:["elena_project","elena_published"], montage:"Let your face hang in a museum. Nine hundred people came." } },
    ] },

  elena_the_ask: { speaker:"ramirez", portrait:"tired", priority:12,
    conditions:{ flag:"elena_project", evidenceGte:11, flagNot:"elena_asked", dealsSinceGte:3 },
    lines:[
      { text:"Four in the morning at a Denny’s on Biscayne. Ramirez has the corner booth and the look of a man who has been rehearsing in the car. There is no file on the table. That is how you know this is not police work.", portrait:"tired" },
      { text:"“She’s going back to Overtown. Nights, now. She says the light is better and the people are honest, and she is RIGHT, which is the entire problem.” He turns his coffee cup a quarter turn. “I’ve told her. Her mother’s told her. She has my stubbornness and her mother’s nerve. God help the both of us.”", portrait:"tired" },
      { text:"“So I am going to ask a criminal for a favor, and then I am going to go sit in my car for a while. Scare her off those corners. Not touch her — SCARE her. Be the thing she currently thinks is just an interesting shadow.”", portrait:"wry" },
    ],
    choices:[
      { text:"I'll be the monster. Once.", reaction:"You wait under a dead streetlight and say four sentences you will remember for the rest of your life. She runs. She drops a lens cap and does not come back for it. Three days later a paper bag appears on your car: the lens cap, a page torn out of a file, and no note at all.", effects:{ cred:-4, "npc.ramirez.trust":2, "npc.ramirez.evidence":-4, flags:["elena_asked","elena_scared"], montage:"Scared Elena Ramirez off the corners. Four sentences. No note." } },
      { text:"No. She's got your spine — respect it.", reaction:"He looks at you for a long moment and something in his face does an unfamiliar thing. “Yeah,” he says finally. “She does.” He pays for both coffees. “I’m still going to put you in prison. But I’m going to feel a way about it now, and I didn’t before.”", effects:{ "npc.ramirez.trust":2, "npc.ramirez.evidence":1, flags:["elena_asked","elena_respected"], montage:"Refused to scare Ramirez's daughter. He paid for the coffee." } },
      { text:"Interesting. A detective with a pressure point.", reaction:"The temperature in the booth drops ten degrees. “I came here as a father,” he says, very quietly, “and you answered me as a dealer. Fine. Then that’s who I arrest.” He leaves cash on the table — exact, to the penny, including tax. You have just made an enemy of the only honest man in Dade County.", effects:{ cred:4, "npc.ramirez.trust":-4, "npc.ramirez.evidence":3, flags:["elena_asked","elena_used"], montage:"Threatened Ramirez with his own daughter. The booth got cold." } },
    ] },

  elena_the_debt: { speaker:"ramirez", portrait:"tired", priority:13,
    conditions:{ flagAny:["elena_scared","elena_respected"], evidenceGte:14, flagNot:"elena_resolved", dealsSinceGte:2 },
    lines:[
      { text:"A shopping-center parking lot in Kendall, which is where men do the things they cannot do downtown. Ramirez has a cardboard box in the trunk and a lighter he borrowed from somebody, because he quit smoking in 1979 and has mentioned it every year since.", portrait:"neutral" },
      { text:"“Two hundred and six pages in this box exist only because I wrote them down. Not evidence — INTELLIGENCE. The difference is a lawyer, but the difference is also me.” He lights the first page off the second. “She printed a photograph of me last month. I look old in it. I AM old in it.”", portrait:"tired" },
      { text:"“This doesn’t make us friends and it doesn’t make you clean. It makes us two men who agreed about one thing, one time.” The box burns in a shopping cart behind a closed Zayre. A security guard looks at it for a while and decides it is not his problem.", portrait:"wry" },
    ],
    choices:[
      { text:"Thank you, detective", reaction:"“Don’t.” He watches the last page curl. “Thank me by being GONE. Genuinely gone — not Fort Lauderdale gone. If I see you in this city in six months I will rebuild every page, and I will be faster the second time.”", effects:{ "npc.ramirez.evidence":-8, "npc.ramirez.trust":1, flags:["elena_resolved","ramirez_debt"], montage:"Ramirez burned 206 pages in a shopping cart behind a dead Zayre." } },
      { text:"Rebuild it. I'll still be here.", reaction:"He laughs — an actual laugh, rusty from lack of use. “That is the most honest thing anybody has said to me all year.” He burns the pages anyway. “Consider it a head start. I have never given one before and I do not expect to enjoy the experience.”", effects:{ cred:5, "npc.ramirez.evidence":-6, flags:["elena_resolved","ramirez_debt"], montage:"Told Ramirez you'd stay. He gave you the head start anyway." } },
    ] },

  elena_vendetta: { speaker:"ramirez", portrait:"wry", priority:13,
    conditions:{ flag:"elena_used", evidenceGte:13, flagNot:"elena_resolved", dealsSinceGte:2 },
    lines:[
      { text:"There is no meeting. There is a Tuesday when three people you trust stop returning calls, a Wednesday when your favorite payphone is suddenly out of order, and a Thursday when you understand that the brown sedan has not been behind you in eleven days because it no longer needs to be.", portrait:"neutral" },
      { text:"He finally calls. No greeting. “I took two weeks of vacation,” Ramirez says. “First time since ’81. I spent all of it on you. Do you have any idea what a man can build in fourteen days when nobody is making him do paperwork?”", portrait:"wry" },
      { text:"“My daughter asked why I was working on my vacation. I told her a man had threatened her with a smile. She said, ‘Dad, that’s awful.’ She’s eighteen. She still thinks awful is RARE.”", portrait:"tired" },
    ],
    choices:[
      { text:"You've got nothing that sticks", reaction:"“I have your supplier’s cousin, your banker’s intern, and a wiretap on a payphone you are sentimental about.” A pause you could park a car in. “It doesn’t have to stick. It has to WEIGH.”", effects:{ heatDelta:12, "npc.ramirez.evidence":4, flags:["elena_resolved","ramirez_vendetta"], montage:"Ramirez spent his vacation on you. All fourteen days of it." } },
      { text:"Name your price, detective", reaction:"The silence goes on long enough that you check the line. “Thirty-eight thousand a year,” he says at last. “That is the number you are fishing for. You should understand that I have known it every single day since 1971, and that it has never once been for sale.” Click.", effects:{ cred:-3, heatDelta:8, "npc.ramirez.evidence":3, flags:["elena_resolved","ramirez_vendetta"], montage:"Tried to buy Ramirez. He quoted you his salary and hung up." } },
    ] },

  ramirez_quiet_week: { speaker:"ramirez", portrait:"wry", priority:7,
    conditions:{ "npc.ramirez.met":{eq:true}, fedHeatLte:10, totalProfitGte:60000, flagNot:"quiet_week", dealsSinceGte:4 },
    lines:[
      { text:"Ramirez is in line behind you at a Farm Store on Bird Road buying a lottery ticket and a banana, and he does not pretend to be surprised. “Relax. It’s my day off. I get those. There’s a rumor about them.”", portrait:"wry" },
      { text:"“You’ve been quiet. Eleven days of quiet. You know what quiet does to a surveillance file? It makes it look like a MISTAKE. Two weeks of quiet and my captain reassigns me to a boat-theft ring in Hollywood.”", portrait:"tired" },
      { text:"“So: congratulations. Sincerely. You are winning, in the specific way this thing is winnable — which is boringly, and for a while, and then not.” He buys the banana. He leaves the lottery ticket on the counter.", portrait:"wry" },
    ],
    choices:[
      { text:"Take the day off, detective", reaction:"“I’m trying. My wife would tell you how that’s going.” He eats the banana in the parking lot next to a car that has not started on the first try since the Ford administration. “Stay quiet. Genuinely. It’s the only advice I hand out for free.”", effects:{ heatDelta:-4, "npc.ramirez.trust":1, flags:["quiet_week"], montage:"Ramirez said quiet was winning. Then he bought a banana." } },
      { text:"Enjoy Hollywood", reaction:"“Boat theft,” he says wistfully. “Nobody dies in boat theft. My daughter would see me at dinner.” He looks at you a second too long. “And then some idiot would get loud in Overtown, and I would come back, and I would not be in a good mood about it.”", effects:{ cred:2, "npc.ramirez.evidence":1, flags:["quiet_week"], montage:"Wished Ramirez luck with the boat-theft ring in Hollywood." } },
    ] },

  ramirez_third_time: { speaker:"ramirez", portrait:"tired", priority:8,
    conditions:{ "npc.ramirez.met":{eq:true}, bustsGte:2, flagNot:"two_busts", dealsSinceGte:3 },
    lines:[
      { text:"“Two arrests,” Ramirez says from the passenger seat of his own car, in a parking garage, with the door open and one foot on the ground like a man who has not decided whether he is staying. “Neither of them mine, which annoys me more than you can possibly imagine.”", portrait:"tired" },
      { text:"“Here is a thing nobody tells you. The first arrest is an accident. The second is a pattern. The third is a SENTENCE. Judges in this county count to three out loud — it’s practically a ceremony, they enjoy it.”", portrait:"wry" },
    ],
    choices:[
      { text:"There won't be a third", reaction:"“That is what the paperwork always says.” He shuts the door and rolls the window down, because the air conditioning has not worked in years. “For what it’s worth — and it is worth nothing — I hope you’re right. I have enough people in Coleman.”", effects:{ "npc.ramirez.trust":1, flags:["two_busts"], montage:"Ramirez explained how judges in Dade County count to three." } },
      { text:"Third time's a charm, detective", reaction:"He laughs with no joy in it whatsoever. “You know what I like about this job? Nobody has ever surprised me. Not once in fifteen years.” The window goes up. Somewhere in Vice Intelligence a note is added to a file, and this one is not underlined, which is somehow worse.", effects:{ cred:2, "npc.ramirez.evidence":2, flags:["two_busts"], montage:"Told Ramirez third time's a charm. He stopped being surprised in 1971." } },
    ] },

  ramirez_proffer: { speaker:"ramirez", portrait:"neutral", priority:12,
    conditions:{ flag:"prosecutor_card", evidenceGte:12, flagNot:"proffer_done", dealsSinceGte:3 },
    lines:[
      { text:"Room 411, federal building, a table with a scratch in it shaped almost exactly like Florida. AUSA Vance lays two documents side by side and does not sit down. Ramirez sits. Ramirez has brought his own thermos, because he does not trust the machine on four.", portrait:"neutral" },
      { text:"“Proffer letter,” he says, tapping the left one. “You talk, and it can’t be used against you directly. Directly is doing a lot of work in that sentence, and she will tell you it isn’t.” Vance says, evenly, “It isn’t.” Ramirez drinks his coffee.", portrait:"tired" },
      { text:"“Five years, of which you serve most of three, at a camp with a running track and a library. Versus what she asks for at trial, which is a number I do not say out loud in front of people who might faint in a federal building.”", portrait:"wry" },
    ],
    choices:[
      { text:"Sign the proffer", reaction:"You talk for six hours. It is the least glamorous day of your criminal career and by far the most consequential. Your file stops being a case and becomes a COOPERATION, which is a different building entirely. Somewhere south, men who read the Herald carefully begin reading it about you.", effects:{ cred:-14, "npc.ramirez.evidence":-9, "npc.colombiano.trust":-3, flags:["proffer_done","proffer_signed","became_informant"], montage:"Signed the proffer in room 411. Six hours. Talked about everybody." } },
      { text:"Not today, counselor", reaction:"Vance caps her pen with the finality of a woman who has just been handed a gift. “Good. Honestly. Half my convictions are men who signed that thing badly.” In the elevator Ramirez says, to nobody in particular, “That’s the one I’d have picked too,” and then does not speak to you for a month.", effects:{ cred:6, "npc.ramirez.evidence":2, flags:["proffer_done","refused_proffer"], montage:"Refused the proffer. Vance capped her pen and looked disappointed." } },
    ] },

  ramirez_intro: { speaker:"ramirez", portrait:"neutral", priority:15,
    conditions:{ fedHeatGte:15, "npc.ramirez.met":{eq:false} },
    lines:[
      { text:"Your barber stops mid-cut. Nods toward the window. Brown sedan. A man in a suit last fashionable during the Carter administration, drinking thermos coffee and reading a very thick file.", portrait:"neutral" },
      { text:"“That’s Ramirez. Vice Intelligence. He’s been out there since Tuesday.” You ask if he’s dangerous.", portrait:"neutral" },
      { text:"“He’s honest. In this town, that’s the most dangerous thing you can be.”", portrait:"wry" },
    ],
    choices:[{ text:"Noted", reaction:"Your barber finishes the cut in silence. When you leave, Ramirez doesn’t look up from his file. He doesn’t need to. He already has your picture in it.", effects:{ "npc.ramirez.met":true, "npc.ramirez.evidence":2, flags:["ramirez_watching"] } }] },

  ramirez_coffee: { speaker:"ramirez", portrait:"wry", priority:10,
    conditions:{ "npc.ramirez.met":{eq:true}, evidenceGte:3, flagNot:"ramirez_coffee", dealsSinceGte:3 },
    lines:[
      { text:"He’s waiting outside the café on Calle Ocho. Doesn’t try to hide. Steps right up like you’re old friends.", portrait:"neutral" },
      { text:"“Nice morning, isn’t it? I love Miami in spring. The weather’s beautiful. The crime rate, less so. Want a coffee? I’m buying. Accepting coffee from an officer is not legally admissible — I checked.”", portrait:"wry" },
      { text:"He smiles. It’s the smile of a man who is patient in a way that should terrify you. “I’m not arresting you today. I just wanted you to know that I know. And now you know that I know. Isn’t that nice? Enjoy the coffee.”", portrait:"wry" },
    ],
    choices:[
      { text:"Drink the coffee", reaction:"Good coffee. He watches you drink it like a man with all the time in the world. “I make $38,000 a year. The guy I surveilled yesterday tipped a valet more than my mortgage. But sure — the system works.”", effects:{ "npc.ramirez.evidence":1, flags:["ramirez_coffee"] } },
      { text:"Walk away", reaction:"“They always walk away.” You hear him sip behind you. “That’s fine. I’m patient. My captain says I’m turning the tide. I’ve been turning the tide for fifteen years. The tide hasn’t noticed.”", effects:{ flags:["ramirez_coffee","ramirez_disrespected"] } },
    ] },

  ramirez_photos: { speaker:"ramirez", portrait:"neutral", priority:10,
    conditions:{ evidenceGte:6, flag:"ramirez_coffee", flagNot:"ramirez_photos", dealsSinceGte:3 },
    lines:[
      { text:"An envelope on your windshield. No stamp. Inside: three Polaroids.", portrait:"neutral" },
      { text:"You, making a deal in Overtown. You, counting cash in Little Havana. You, meeting a lieutenant who works for a man you haven’t met yet.", portrait:"neutral" },
      { text:"On the back of the third photo, in neat handwriting: “My daughter wants to be a photographer. I told her I’m already pretty good at it. — H.R.” The man has a sense of humor. That makes it worse.", portrait:"wry" },
    ],
    choices:[
      { text:"Burn the photos", reaction:"You burn them over the stove. The smoke smells like evidence and bad decisions. But you know Ramirez has copies. A man that patient always has copies.", effects:{ flags:["ramirez_photos"] } },
      { text:"He’s bluffing", reaction:"He wasn’t bluffing. Somewhere in Vice Intelligence, Ramirez adds a note to your file: “Subject displays poor judgment under pressure.” He underlines it twice.", effects:{ "npc.ramirez.evidence":2, flags:["ramirez_photos"] } },
    ] },

  ramirez_offer: { speaker:"ramirez", portrait:"tired", priority:12,
    conditions:{ evidenceGte:10, flagNot:"ramirez_deal_offered", dealsSinceGte:3 },
    lines:[
      { text:"He calls from a payphone. You can hear traffic. He sounds tired.", portrait:"tired" },
      { text:"“Let’s skip the part where I pretend this is social. I have enough on you for fifteen to twenty. Federal. The Colombians, the laundering, the whole circus. But here’s the thing — I don’t want you. You’re not the prize. You’re the door.”", portrait:"neutral" },
      { text:"“Give me the cartel. Real intel — shipment dates, routes, contacts. In exchange your file goes in a drawer that never opens. You walk away clean. Maybe not morally clean, but legally clean, and in Miami that’s the best anyone gets.”", portrait:"wry" },
    ],
    choices:[
      { text:"Become an informant", reaction:"“Smart. Or desperate. Either way, we have a deal.” A pause. Coffee being sipped. “For what it’s worth? You made the right call. The other option involved a prison in Coleman, Florida. Two hours from Miami. You can almost smell the ocean on humid days.”", effects:{ "npc.ramirez.evidence":-6, "npc.colombiano.trust":-3, cred:-10, flags:["ramirez_deal_offered","became_informant"] } },
      { text:"Go to hell, Ramirez", reaction:"“I figured. They always say that. And six months from now, when the walls are really closing in, you’ll wish you’d taken the deal. My number won’t change.” He hangs up. His car takes three tries to start. Even his car is exhausted.", effects:{ "npc.ramirez.evidence":3, flags:["ramirez_deal_offered","refused_ramirez"] } },
    ] },

  // ── EL COLOMBIANO ──
  // ── ARC: NINETY-SIX PERCENT — the cartel's chemist (3 beats, 3-way branch, two echoes) ──
  col_chemist: { speaker:"colombiano", portrait:"pleased", priority:11,
    conditions:{ flag:"cartel_supplier", totalProfitGte:70000, flagNot:"chemist_met", dealsSinceGte:3 },
    lines:[
      { text:"A warehouse in Doral that smells like ether and orange peel. El Colombiano walks you past forty drums of something entirely legal to one small table with a scale on it, where a thin man in reading glasses is doing something delicate with a beaker.", portrait:"neutral" },
      { text:"“This is Aurelio. In Medellín he is a national resource. He is HERE because a man who is a national resource is also a national liability, and I prefer my resources where I can see them. Aurelio — tell the man your number.”", portrait:"pleased" },
      { text:"Aurelio does not look up. “Ninety-four,” he says. “Ninety-six if the acetone is not from Hialeah.” El Colombiano beams like a father at a recital. “Ninety-six. Do you understand what that does to a market, friend? This city has been drinking WATER and calling it rum.”", portrait:"pleased" },
    ],
    choices:[
      { text:"Put me on his output", reaction:"“That is the correct greed.” Your shipments start coming out of Doral, and for a while every corner in Miami tastes the difference and pays for it. Aurelio never looks up. Not once, not in nine weeks. You begin to notice that.", effects:{ "npc.colombiano.trust":2, demandBoost:{idx:5,mult:1.45}, flags:["chemist_met"], montage:"Got on Aurelio's output. Ninety-six percent, and the city noticed." } },
      { text:"Why show me this?", reaction:"“Because a man who is shown a thing becomes responsible for it.” He says it pleasantly, adjusting a cuff. “That is not a threat, friend, it is a DEFINITION. In my business we do not have contracts. We have people who have been shown things.”", effects:{ "npc.colombiano.trust":1, flags:["chemist_met","chemist_wary"], montage:"El Colombiano showed you the chemist. That made you responsible." } },
    ] },

  chemist_defects: { speaker:"maria", portrait:"knowing", priority:12,
    conditions:{ flag:"chemist_met", fedHeatGte:35, flagNot:"chemist_resolved", dealsSinceGte:4 },
    lines:[
      { text:"Maria calls you to the gallery at closing and locks the door behind you, which she has never done. A man is sitting on the bench in front of the sad horse painting, holding a briefcase on his knees like a passenger waiting for a bus.", portrait:"neutral" },
      { text:"“He walked into MY gallery,” she says, in the voice of a woman itemizing damages. “Aurelio. The cook. He has a sister in Costa Rica, eleven thousand dollars, and a suitcase that is mostly notebooks, and he believes that is a plan.”", portrait:"knowing" },
      { text:"“So now you have three doors, cowboy, and every one of them locks behind you. Get him out. Sell him to the detective. Or hand him back to the man in the cream suit and then sleep however it is that you sleep.”", portrait:"amused" },
    ],
    choices:[
      { text:"Get him out. Costa Rica. — $12,000", reaction:"It costs twelve thousand, a night boat out of Tavernier, and a driver who does not ask questions. Aurelio shakes your hand with both of his and says a word in a language you do not speak. Maria watches the taillights. “Well,” she says. “That was expensive AND correct. Enjoy the novelty.”", effects:{ cashDelta:-12000, cred:4, "npc.maria.trust":2, "npc.colombiano.trust":-3, flags:["chemist_resolved","chemist_freed"], montage:"Put the cartel's chemist on a night boat out of Tavernier." } },
      { text:"Sell him to Ramirez", reaction:"A detective meets a chemist in a federal building at 6 AM, and by noon a warehouse in Doral belongs to the government. Your file gets thinner. So does the list of people who will meet you alone. Maria does not call for nine days, and when she does it is about something else.", effects:{ cred:-8, "npc.ramirez.evidence":-6, "npc.maria.trust":-2, "npc.colombiano.trust":-4, flags:["chemist_resolved","chemist_sold","became_informant"], montage:"Sold Aurelio to Vice. The Doral warehouse belongs to the government now." } },
      { text:"Call the cream suit", reaction:"El Colombiano thanks you personally, which is the part you will think about later. Ten thousand dollars arrives in a shoebox with a bottle of rum on top. Nobody sees Aurelio again. The product stays at ninety-six percent for exactly two more months, and then it doesn’t.", effects:{ cashDelta:10000, "npc.colombiano.trust":3, "npc.maria.trust":-2, flags:["chemist_resolved","chemist_delivered"], montage:"Handed the chemist back. A shoebox, a bottle of rum, no questions." } },
    ] },

  chemist_postcard: { speaker:"maria", portrait:"amused", priority:7,
    conditions:{ flag:"chemist_freed", flagNot:"chemist_echo", dealsSinceGte:5 },
    lines:[
      { text:"A postcard reaches the gallery: a pelican, a pier, and eight sentences of extremely careful handwriting that never once says a name. Folded into the envelope it arrived in, four thousand dollars in American twenties.", portrait:"amused" },
      { text:"“He teaches chemistry at a secondary school now,” Maria reports, reading it twice. “He says the students are terrible and the acetone is excellent.” She looks up. “You understand that this never happens. In eleven years I have never once watched a man get OUT.”", portrait:"knowing" },
    ],
    choices:[
      { text:"Frame the money with the postcard", reaction:"She hangs it between two paintings nobody will ever buy — real money behind glass, priced at forty thousand dollars. “It’s the only honest object in this gallery,” she says, “so obviously it is the one thing I will never sell.”", effects:{ cred:2, "npc.maria.trust":2, flags:["chemist_echo","postcard_framed"], montage:"A postcard from Puntarenas, framed with four thousand dollars behind glass." } },
      { text:"Take the four grand", reaction:"“Of course you do.” She hands it over without judgment, which from Maria is its own particular kind of judgment. The postcard she keeps. It goes in a drawer with the two other things she has ever kept.", effects:{ cashDelta:4000, flags:["chemist_echo"], montage:"Took the chemist's four thousand dollars. Maria kept the postcard." } },
    ] },

  chemist_letters: { speaker:"colombiano", portrait:"pleased", priority:7,
    conditions:{ flag:"chemist_delivered", flagNot:"chemist_echo", dealsSinceGte:5 },
    lines:[
      { text:"El Colombiano takes you to dinner at a place with no menu and orders in Spanish without looking up, exactly as he did the first time. “A toast, friend. To loyalty — rarer than product, and priced about the same.”", portrait:"pleased" },
      { text:"Halfway through the fish he says, conversationally, “Aurelio’s sister writes to the consulate every week. Every WEEK. The letters are very well constructed. She was a teacher also.” He eats. “Some families produce nothing but careful people.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Say nothing. Finish the fish.", reaction:"You finish the fish. It is excellent. You will eat this exact meal again in your sleep for a long time, and in the dream you never say anything either, and the not-saying is the part that wakes you up at four in the morning.", effects:{ hpDelta:-6, "npc.colombiano.trust":1, flags:["chemist_echo"], montage:"Finished the fish. Said nothing at all about the letters." } },
      { text:"Send the sister money. Anonymously.", reaction:"Two thousand dollars reaches Puntarenas with no name attached, which is exactly as much help as it sounds like. El Colombiano never mentions it and never will — but a month later he seats you facing the door, which in his language is either respect or a test.", effects:{ cashDelta:-2000, cred:2, "npc.colombiano.trust":-1, flags:["chemist_echo","sent_the_sister_money"], montage:"Sent the chemist's sister money. No name on it." } },
    ] },

  col_informant_found: { speaker:"colombiano", portrait:"cold", priority:13,
    conditions:{ flag:"became_informant", "npc.colombiano.met":{eq:true}, flagNot:"informant_exposed", dealsSinceGte:4 },
    lines:[
      { text:"The restaurant is empty again, and this time nobody has poured anything. El Colombiano has the Herald folded to page four and a fountain pen, and he is doing the crossword in ink, which tells you everything about his relationship with certainty.", portrait:"neutral" },
      { text:"“Three of my people were arrested in one week. Different corners, different crews, one COMMON element.” He fills in seven across without pausing. “In Medellín we would already be finished talking. Here I am a guest in a country with excellent forensics, so I talk first. Enjoy the innovation.”", portrait:"cold" },
    ],
    choices:[
      { text:"Buy the conversation — $30,000", reaction:"The money crosses the table under the newspaper, which is either tradition or theater. He does not count it. “This purchases the CONVERSATION, friend. Not forgiveness. Forgiveness is not a product I stock.” He returns to the crossword. You are permitted to leave, which is not nothing.", effects:{ cashDelta:-30000, "npc.colombiano.trust":1, flags:["informant_exposed","bought_the_conversation"], montage:"Paid $30,000 under a newspaper to be allowed to walk out of a restaurant." } },
      { text:"Prove it was me", reaction:"“Prove.” He tastes the word and finds it foreign. “That is a courtroom verb, friend. You have been spending time in courtrooms — it shows.” He caps the pen. You are followed home by a car that makes no effort whatsoever to be discreet, and the following continues for eleven days.", effects:{ hpDelta:-10, heatDelta:10, "npc.colombiano.trust":-4, flags:["informant_exposed","col_hunting"], montage:"Told the cartel to prove it. A car followed you home for eleven days." } },
    ] },

  col_war_corner: { speaker:"colombiano", portrait:"cold", priority:11,
    conditions:{ flag:"col_war", credGte:30, flagNot:"col_war_corner", dealsSinceGte:3 },
    lines:[
      { text:"They took the corner on 62nd at four in the morning with nine men and no shooting, which is worse, because it means they were confident. Two of your people are at Jackson Memorial. One of them will be fine. One of them will walk with a cane at twenty-three.", portrait:"cold" },
      { text:"El Colombiano telephones you himself, which is its own species of insult. “I want to be very clear that this was BUSINESS,” he says. “The boy with the leg was not instructed. My man exceeded his brief. He has been corrected.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Take it back tonight", reaction:"You take it back with fourteen men and a great deal of noise, and by dawn the corner is yours and everyone in three districts has heard about it. Vice hears about it too, obviously. The Herald runs it on page seven under a photograph of an overturned shopping cart.", effects:{ cred:8, heatDelta:9, "npc.colombiano.trust":-2, "npc.ramirez.evidence":2, flags:["col_war_corner","took_it_back"], montage:"Took the corner on 62nd back before dawn. Page seven." } },
      { text:"Send $5,000 to the kid's family instead", reaction:"The money goes to a house on 58th with no name attached and a note that reads only WALK GOOD. You never take the corner back. Something else happens instead: for a long while, people in Overtown start telling you things they do not tell anybody.", effects:{ cashDelta:-5000, cred:4, flags:["col_war_corner","walk_good"], montage:"Sent $5,000 to the kid's family. Never took the corner back." } },
    ] },

  col_joint_venture: { speaker:"colombiano", portrait:"pleased", priority:9,
    conditions:{ flag:"col_peace", totalProfitGte:110000, flagNot:"col_venture", dealsSinceGte:4 },
    lines:[
      { text:"“Peace is expensive,” El Colombiano says, in a marina office that smells like varnish and money, “which is why so few men can afford it. Fortunately you and I are not men. We are a JOINT VENTURE.”", portrait:"pleased" },
      { text:"“A go-fast comes into Ocean Reef on Thursday. Twenty units at my cost — which nobody outside my family has ever been offered, and which you will not mention at parties. Twenty-two thousand dollars, and the two of us stop paying a war tax that we were both pretending was strategy.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Buy in — $22,000", reaction:"The boat comes in at 3 AM with its lights off and its motors trimmed, and twenty units go into your trunk while a man in a polo shirt talks about tarpon fishing the entire time. “You see?” El Colombiano says. “Business. It is so much more restful than the other thing.”", effects:{ cashDelta:-22000, invGift:{idx:5,qty:20}, "npc.colombiano.trust":2, flags:["col_venture"], montage:"Bought into the Ocean Reef go-fast. Twenty units at cartel cost." } },
      { text:"I buy my own product", reaction:"“Of course.” He is not offended; he is CATALOGUING. “Independence. It is the most expensive thing in this city, and every man here buys it retail.” The peace holds. It holds slightly less well than it did an hour ago.", effects:{ cred:2, "npc.colombiano.trust":-1, flags:["col_venture","stayed_independent"], montage:"Turned down the cartel's joint venture. Kept your own supply lines." } },
    ] },

  col_departures: { speaker:"colombiano", portrait:"neutral", priority:12,
    conditions:{ flag:"col_broken", flagNot:"col_after", dealsSinceGte:2 },
    lines:[
      { text:"You find him in the departures hall at MIA at six in the morning, alone, with one suitcase and a boarding pass for Barranquilla via a connection nobody sane would book. The cream suit is the same suit. It has been the same suit for three weeks.", portrait:"neutral" },
      { text:"“They have decided that I am unlucky,” he says, watching the board flip. “In my organization there is no crime called losing. There is only a condition called unlucky, and it is treated identically. So: home, a farm, and a telephone that does not ring.”", portrait:"cold" },
      { text:"“You will have all of it now. The corners, the routes, the men who called me señor.” He almost smiles. “And in four years, or eight, a young man will stand in this hall and watch YOUR board flip. I want you to know that I will not enjoy it. I will simply have expected it.”", portrait:"neutral" },
    ],
    choices:[
      { text:"Safe flight, señor", reaction:"He shakes your hand with both of his — exactly the way a chemist once did — and walks to a gate at the far end of the terminal without looking back. The suitcase is very light. Whatever he built in this city, he is not carrying any of it home.", effects:{ cred:5, flags:["col_after","col_exile_witnessed"], montage:"Watched El Colombiano leave MIA with one very light suitcase." } },
      { text:"You should have taken the peace", reaction:"“Yes,” he agrees immediately, which robs you of everything. “That is the correct analysis. I have had eleven days to arrive at it and you have had four seconds.” He picks up the suitcase. “That is why you win, friend. You are FASTER at being right. It is not the same thing as being right.”", effects:{ cred:3, flags:["col_after","col_exile_witnessed"], montage:"Told a beaten man he should have taken the peace. He agreed instantly." } },
    ] },

  colombiano_intro: { speaker:"colombiano", portrait:"neutral", priority:15,
    conditions:{ "npc.colombiano.met":{eq:false}, orGroup:{ totalProfitGte:50000, credGte:40, turfGte:3 } },
    lines:[
      { text:"The restaurant clears out. Nobody announces it; it just empties, the way a beach empties before weather. A man in a cream linen suit sits down across from you without asking.", portrait:"neutral" },
      { text:"“You’ve been busy. Moving weight, taking corners. Miami notices. I notice.” He orders for both of you, in Spanish, without looking at the menu.", portrait:"pleased" },
      { text:"“I represent certain interests in Medellín. We can supply you at volume — real volume — or we can consider you competition. I prefer the first option. The second is bad for everyone, but mostly for you.”", portrait:"cold" },
    ],
    choices:[
      { text:"Let’s do business", reaction:"He smiles like the deal was never in question. “Bueno. Cocaine will cost you less from now on. In exchange, you remember who your friends are.” The food arrives. It’s excellent. Everything about him is excellent. That’s the problem.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":3, flags:["cartel_supplier"] } },
      { text:"I work alone", reaction:"He nods slowly, dabs his mouth, stands. “Pride. I respect it.” He buttons his jacket. “I respected it in the last three men who said that too.” He leaves. He pays for your meal anyway. Somehow that’s the threat.", effects:{ "npc.colombiano.met":true, "npc.colombiano.trust":-2, flags:["rejected_cartel"] } },
    ] },

  colombiano_test: { speaker:"colombiano", portrait:"cold", priority:10,
    conditions:{ flag:"cartel_supplier", "npc.colombiano.trust":{gte:2}, totalProfitGte:80000, flagNot:"colombiano_tested", dealsSinceGte:4 },
    lines:[
      { text:"A car waits outside your place. Tinted glass. Inside: El Colombiano and a briefcase. “A favor,” he says, in a voice that has never once asked a favor.", portrait:"neutral" },
      { text:"“One of my distributors is skimming. Tomas. You know him — small man, big watch. I need someone he doesn’t fear to confirm it. Buy from him. Count the weight. Tell me what you find.”", portrait:"cold" },
    ],
    choices:[
      { text:"Do it — report the truth", reaction:"Tomas is skimming. Of course he’s skimming — the watch alone is two months of skimming. You report it. A week later Tomas’s big watch shows up at a pawn shop, and Tomas doesn’t. El Colombiano sends a case of wine. You don’t drink it.", effects:{ "npc.colombiano.trust":2, cred:5, flags:["colombiano_tested"], montage:"Confirmed the skim. Tomas vanished." } },
      { text:"Warn Tomas instead", reaction:"You tell Tomas to run. He runs. El Colombiano never mentions it — which is how you know he knows. The wine never arrives. Something colder does: nothing at all.", effects:{ "npc.colombiano.trust":-3, flags:["colombiano_tested","warned_tomas"], montage:"Warned Tomas. The cartel noticed." } },
    ] },

  // ── MILESTONE: reputation reveal (the hidden system) ──
  rep_reveal: { speaker:"maria", portrait:"knowing", priority:11,
    conditions:{ credGte:25, totalDealsGte:10, flagNot:"rep_revealed" },
    lines:[
      { text:"Maria slides a newspaper across the bar. There’s no article about you. That’s the point. “People are talking,” she says. “The right people. The corners know your name. The clubs know your face.”", portrait:"knowing" },
      { text:"“Reputation is currency now. Districts where you do business will treat you better. Places you neglect will forget you. Spend it carefully — it’s harder to earn back than money.”", portrait:"amused" },
    ],
    choices:[{ text:"Good to know", reaction:"“It wasn’t free, by the way. This conversation. You owe me a drink. Top shelf — I know what you make now.”", effects:{ flags:["rep_revealed"], cred:3 } }] },
};

// Storylet condition checker
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
    else if(k==="flags") v.forEach(f=>ns.storyFlags[f]=true);
    else if(k==="montage") ns.montage.push({move:ns.move,text:v});
    else if(k==="demandSpike") ns.demand=ns.demand.map((d,i)=>d*( [4,5].includes(i)?1.6:1 ));
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
  if(s.npcState?.ramirez?.met) npcLines.push("Det. H. Ramirez, asked for a statement, said only: “The tide turns. Eventually.”");
  if(s.storyFlags?.col_broken) npcLines.push("Cartel activity in the city, sources say, has 'reorganized under new local management.' The DEA declined to celebrate.");
  else if((s.colTurf||[]).filter(Boolean).length>=3) npcLines.push("Half the corners in the city now answer to a man with a scar and a cream suit.");
  if(s.npcState?.cass?.trust>=2) npcLines.push("A Brickell bank closed four accounts the same morning. 'Routine housekeeping,' said a manager with a new tan.");
  if(s.storyFlags?.shark_grudge) npcLines.push("A man at the fish market, asked if he knew the subject, gutted a snapper and said nothing at all.");
  if(s.storyFlags?.cartel_supplier) npcLines.push("Federal sources allege ties to Medellín. Medellín, as always, alleges nothing.");
  const coda=[], fl=s.storyFlags||{};
  if(fl.ramirez_debt) coda.push("Det. H. Ramirez filed his retirement papers in the spring. Colleagues recall a cardboard box burning in a shopping cart behind a closed department store, and no explanation ever offered.");
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

const createInitialState=(heatLevel=0,playbook=null,daily=null,upgrades={})=>{
  const hl=HEAT_LADDER[heatLevel]||HEAT_LADDER[0];
  const rng=daily?new SeededRNG(daily.seed):null;
  const bp=initBasePrices(rng);
  let s={
    move:0, loc:0, hp:100, cash:hl.startCash, bank:0, cleanCash:0, debt:hl.startDebt,
    cred:0, fedHeat:0, gun:false, heatLevel,
    inv:Array(DRUG_COUNT).fill(0), avgCost:Array(DRUG_COUNT).fill(0), purity:Array(DRUG_COUNT).fill(1), coatSp:100,
    stashInv:Array(DRUG_COUNT).fill(0),
    basePrices:bp, momentum:initMomentum(),
    prices:[], hist:[], demand:Array(DRUG_COUNT).fill(1),
    turf:Array(6).fill(0), enforcers:Array(6).fill(0), safeHouses:Array(6).fill(-1), colTurf:Array(6).fill(false),
    lifestyle:[], rivals:RIVAL_NAMES.slice(0,3).map(n=>({name:n,loc:R(0,5)})),
    currentEra:0, eraStartMove:0,
    totalProfit:0, totalDeals:0, totalBusts:0, biggestDeal:0, streak:0,
    npcState:{ maria:{met:false,trust:0,alive:true}, ramirez:{met:false,evidence:0,alive:true}, colombiano:{met:false,trust:0,alive:true}, tiburon:{met:false,trust:0,alive:true}, cass:{met:false,trust:0,alive:true} },
    storyFlags:{}, storySeen:{}, montage:[], dealsSinceStory:0,
    fuseTimers:[], activeDeal:null, supplierHistory:{},
    pagerDeal:null, evtMsg:null, activeStorylet:null,
    hudSeen:{ debt:false, hp:false, heat:false, cred:false, era:false },
    coach:{}, ending:null,
    locDemand:initLocDemand(), patrols:initPatrols(), informants:initInformants(),
    districtSales:LOCS.map(()=>0), shocks:[], newsWire:[], forfeitFuse:0,
    rival:initRival(), rivalFocus:RIVAL_NAMES.slice(0,3).map(()=>R(0,DRUG_COUNT-1)),
    enfLoyalty:LOCS.map(()=>100), launderMove:-1, launderUse:{}, launderedTotal:0,
  };
  s=applyUpgrades(s,upgrades);
  s=applyPlaybook(s,playbook);
  s=applyDailyMods(s,daily?daily.mods:null);
  s.prices=getStreetPrices(bp,s.loc,ERAS[0].demandMod,s.demand,s.dailyPriceMulti||1);
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

  // Loan shark escalation tiers
  let hpDelta=0;
  if(debt>=30000 && nm%3===0){
    const loss=R(15,30); hpDelta=-loss;
    effects.push({type:"SHAKE"},{type:"FLASH",color:C.pink+"44"},{type:"PING",stat:"hp"});
    const stolen=Math.min(cash,Math.floor(R(500,2000)*(s.storyFlags?.shark_grudge?1.5:1))); cash-=stolen;
    evtMsg=`🦈 Tiburón’s enforcer kicks in the door. −${loss} HP${stolen>0?", −"+FM(stolen)+" taken":""}. “Last warning.”`;
  } else if(debt>=20000 && nm%4===0){
    const loss=R(10,20); hpDelta=-loss; effects.push({type:"SHAKE"},{type:"PING",stat:"hp"});
    const stolen=Math.min(cash,Math.floor(R(300,1000)*(s.storyFlags?.shark_grudge?1.5:1))); cash-=stolen;
    evtMsg=evtMsg||`🦈 Shark’s crew cornered you. −${loss} HP${stolen>0?", −"+FM(stolen)+" taken":""}.`;
  } else if(debt>=10000 && nm%6===0){
    const loss=R(5,12); hpDelta=-loss; effects.push({type:"SHAKE"},{type:"PING",stat:"hp"});
    evtMsg=evtMsg||`🦈 Shark’s boys found you. −${loss} HP. Pay what you owe.`;
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
const Face=({skin,cx=120})=>(<>
  <ellipse cx={cx} cy="150" rx="46" ry="56" fill={skin}/>
  <rect x={cx-16} y="195" width="32" height="30" fill={skin}/>
</>);

const MariaP=({mood="neutral"})=>{
  const skin="#D9A079", lip="#C92B4E";
  const mouth={neutral:"M102 184 Q120 190 138 184",amused:"M102 182 Q120 196 138 182",
    flirty:"M104 182 Q122 195 138 180 Q130 188 116 189 Q106 187 104 182",
    knowing:"M104 184 Q120 191 136 181",angry:"M104 188 Q120 180 136 188",
    vulnerable:"M106 186 Q120 183 134 186"}[mood]||"M102 184 Q120 190 138 184";
  const browL={angry:"M88 124 L112 132",vulnerable:"M90 132 L112 126"}[mood]||"M88 128 Q100 122 112 127";
  const browR={angry:"M152 124 L128 132",vulnerable:"M150 132 L128 126"}[mood]||"M152 128 Q140 122 128 127";
  const lidY=mood==="flirty"?6:0;
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    {/* hair back volume */}
    <path d="M120 60 C58 60 42 120 50 175 C54 215 44 248 60 268 L90 250 C78 215 76 175 84 140 L156 140 C164 175 162 215 150 250 L180 268 C196 248 186 215 190 175 C198 120 182 60 120 60 Z" fill="#23150D"/>
    <Face skin={skin}/>
    {/* hair front waves */}
    <path d="M120 64 C70 64 62 118 70 142 C84 116 96 104 120 102 C144 104 156 116 170 142 C178 118 170 64 120 64 Z" fill="#2E1B10"/>
    <path d="M70 140 C62 170 64 205 76 235 C70 200 72 165 82 140 Z" fill="#2E1B10"/>
    <path d="M170 140 C178 170 176 205 164 235 C170 200 168 165 158 140 Z" fill="#2E1B10"/>
    {/* gold hoops */}
    <circle cx="72" cy="196" r="11" fill="none" stroke={C.gold} strokeWidth="3"/>
    <circle cx="168" cy="196" r="11" fill="none" stroke={C.gold} strokeWidth="3"/>
    {/* shoulders / white off-shoulder dress */}
    <path d="M40 320 C46 268 78 244 120 244 C162 244 194 268 200 320 Z" fill="#EFE9E2"/>
    <path d="M40 320 C46 268 78 244 120 244 L120 256 C84 256 58 276 52 320 Z" fill="#D8CFC4"/>
    <path d="M88 244 Q120 262 152 244 L152 252 Q120 268 88 252 Z" fill={skin}/>
    {/* necklace */}
    <path d="M100 252 Q120 266 140 252" fill="none" stroke={C.gold} strokeWidth="2"/>
    {/* eyes */}
    <ellipse cx="100" cy={142+lidY/2} rx="10" ry={6-lidY*.4} fill="#fff"/>
    <ellipse cx="140" cy={142+lidY/2} rx="10" ry={6-lidY*.4} fill="#fff"/>
    <circle cx="101" cy={143+lidY/2} r="3.6" fill="#3A2415"/>
    <circle cx="141" cy={143+lidY/2} r="3.6" fill="#3A2415"/>
    <path d="M90 138 Q100 132 110 137" stroke="#1A0F08" strokeWidth="2" fill="none"/>
    <path d="M150 138 Q140 132 130 137" stroke="#1A0F08" strokeWidth="2" fill="none"/>
    {/* brows / nose / lips */}
    <path d={browL} stroke="#23150D" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={browR} stroke="#23150D" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d="M118 152 Q115 166 112 169 Q118 173 124 170" stroke="#B07A52" strokeWidth="2" fill="none"/>
    <path d={mouth} stroke={lip} strokeWidth="6" fill="none" strokeLinecap="round"/>
    {/* blush + beauty mark */}
    <ellipse cx="92" cy="166" rx="8" ry="4" fill="#E2856B" opacity=".4"/>
    <ellipse cx="148" cy="166" rx="8" ry="4" fill="#E2856B" opacity=".4"/>
    <circle cx="138" cy="176" r="1.6" fill="#23150D"/>
  </svg>);
};

const RamirezP=({mood="neutral"})=>{
  const skin="#C08A5E";
  const mouth={wry:"M104 190 Q116 196 134 186",tired:"M104 192 Q120 188 136 192"}[mood]||"M104 190 Q120 194 136 190";
  const browTilt=mood==="wry"?"M150 126 L128 132":"M150 130 L128 131";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    {/* hair */}
    <path d="M120 70 C72 70 66 110 70 132 C82 104 100 96 120 96 C140 96 158 104 170 132 C174 110 168 70 120 70 Z" fill="#1C1410"/>
    <Face skin={skin}/>
    <path d="M74 132 C70 120 74 92 120 88 C166 92 170 120 166 132 C152 106 136 100 120 100 C104 100 88 106 74 132 Z" fill="#241A12"/>
    {/* sideburns */}
    <rect x="72" y="138" width="8" height="26" fill="#241A12"/>
    <rect x="160" y="138" width="8" height="26" fill="#241A12"/>
    {/* shoulders: beige shirt, loose tie, holster strap */}
    <path d="M38 320 C46 266 80 246 120 246 C160 246 194 266 202 320 Z" fill="#C9B795"/>
    <path d="M104 246 L120 268 L136 246 L130 244 L120 256 L110 244 Z" fill="#EFE9E2"/>
    <path d="M114 252 L120 262 L126 252 L124 296 L120 306 L116 296 Z" fill="#5A2230"/>
    <path d="M62 262 L96 320 L82 320 L52 270 Z" fill="#3A2E22"/>
    {/* eye bags + eyes */}
    <ellipse cx="100" cy="144" rx="9" ry="5" fill="#fff"/>
    <ellipse cx="140" cy="144" rx="9" ry="5" fill="#fff"/>
    <circle cx="100" cy="145" r="3.4" fill="#241509"/>
    <circle cx="140" cy="145" r="3.4" fill="#241509"/>
    <path d="M92 152 Q100 156 108 152" stroke="#8F6243" strokeWidth="2" fill="none" opacity=".8"/>
    <path d="M132 152 Q140 156 148 152" stroke="#8F6243" strokeWidth="2" fill="none" opacity=".8"/>
    {/* heavy brows */}
    <path d="M90 130 L112 131" stroke="#1C1410" strokeWidth="5" strokeLinecap="round"/>
    <path d={browTilt} stroke="#1C1410" strokeWidth="5" strokeLinecap="round"/>
    {/* nose + mustache */}
    <path d="M118 150 Q114 168 110 172 Q118 177 126 173" stroke="#94613B" strokeWidth="2.4" fill="none"/>
    <path d="M98 182 Q120 172 142 182 Q120 188 98 182 Z" fill="#1C1410"/>
    <path d={mouth} stroke="#7A4630" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* stubble */}
    <ellipse cx="120" cy="208" rx="34" ry="16" fill="#1C1410" opacity=".14"/>
  </svg>);
};

const ColombianoP=({mood="neutral"})=>{
  const skin="#C99268";
  const mouth={pleased:"M104 186 Q120 195 136 186",cold:"M104 189 L136 189"}[mood]||"M104 188 Q120 191 136 188";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    {/* slicked hair */}
    <path d="M120 66 C70 66 64 104 70 128 C86 100 102 94 120 94 C138 94 154 100 170 128 C176 104 170 66 120 66 Z" fill="#0E0B08"/>
    <Face skin={skin}/>
    <path d="M72 128 C66 110 74 84 120 82 C166 84 174 110 168 128 C152 100 138 96 120 96 C102 96 88 100 72 128 Z" fill="#15100B"/>
    <path d="M76 96 L164 96" stroke="#2A2118" strokeWidth="1.4" opacity=".7"/>
    <path d="M80 88 L160 88" stroke="#2A2118" strokeWidth="1.2" opacity=".5"/>
    {/* cream double-breasted suit + black shirt + chain */}
    <path d="M36 320 C44 264 78 244 120 244 C162 244 196 264 204 320 Z" fill="#E8DFC8"/>
    <path d="M94 246 L120 290 L146 246 L136 242 L120 270 L104 242 Z" fill="#15110C"/>
    <path d="M70 258 L96 320 L78 320 L58 266 Z" fill="#D6CAAE"/>
    <path d="M170 258 L144 320 L162 320 L182 266 Z" fill="#D6CAAE"/>
    <circle cx="150" cy="296" r="3" fill="#B8A87E"/><circle cx="156" cy="282" r="3" fill="#B8A87E"/>
    <path d="M104 252 Q120 274 136 252" fill="none" stroke={C.gold} strokeWidth="3"/>
    {/* narrow eyes */}
    <ellipse cx="100" cy="142" rx="9" ry="4.4" fill="#fff"/>
    <ellipse cx="140" cy="142" rx="9" ry="4.4" fill="#fff"/>
    <circle cx="100" cy="142.6" r="3.1" fill="#120B05"/>
    <circle cx="140" cy="142.6" r="3.1" fill="#120B05"/>
    <path d="M90 130 L112 128" stroke="#0E0B08" strokeWidth="4.4" strokeLinecap="round"/>
    <path d="M150 130 L128 128" stroke="#0E0B08" strokeWidth="4.4" strokeLinecap="round"/>
    {/* nose, thin mustache, mouth */}
    <path d="M118 150 Q115 166 112 170 Q119 174 126 171" stroke="#9A6840" strokeWidth="2.2" fill="none"/>
    <path d="M104 180 Q120 176 136 180" stroke="#0E0B08" strokeWidth="3" fill="none"/>
    <path d={mouth} stroke="#7A4630" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* scar */}
    <path d="M150 158 L158 182" stroke="#8F4A3A" strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M148 166 L154 164 M151 174 L157 172" stroke="#8F4A3A" strokeWidth="1.4"/>
  </svg>);
};

const TiburonP=()=>{
  const skin="#B5793F";
  return(<svg viewBox="0 0 240 320" width="100%" height="100%" style={{display:"block"}}>
    <Face skin={skin}/>
    {/* slick short hair + widow's peak */}
    <path d="M120 88 C84 88 72 110 74 126 C90 102 104 98 120 98 C136 98 150 102 166 126 C168 110 156 88 120 88 Z" fill="#0C0A07"/>
    {/* tropical shirt */}
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
    {/* shades */}
    <rect x="86" y="134" width="28" height="16" rx="7" fill="#0A0805"/>
    <rect x="126" y="134" width="28" height="16" rx="7" fill="#0A0805"/>
    <path d="M114 140 L126 140" stroke="#0A0805" strokeWidth="3"/>
    <path d="M90 138 L100 144" stroke="#fff" strokeWidth="1.4" opacity=".5"/>
    {/* grin w/ gold tooth */}
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
    {/* blonde bob, sharp 80s power cut */}
    <path d="M120 62 C66 62 56 116 62 162 C64 186 60 206 70 216 L86 206 C78 184 78 152 86 132 L154 132 C162 152 162 184 154 206 L170 216 C180 206 176 186 178 162 C184 116 174 62 120 62 Z" fill="#D8A93F"/>
    <path d="M62 150 C58 170 60 196 70 214 C66 192 66 168 72 150 Z" fill="#C2932F"/>
    <path d="M178 150 C182 170 180 196 170 214 C174 192 174 168 168 150 Z" fill="#C2932F"/>
    <Face skin={skin}/>
    {/* side-swept bangs */}
    <path d="M120 66 C76 66 66 110 72 134 C82 104 92 96 124 96 C150 98 160 112 168 134 C174 110 164 66 120 66 Z" fill="#E5BA52"/>
    <path d="M72 110 C84 92 104 88 132 92 L120 104 C100 100 84 102 72 110 Z" fill="#F0CB6E"/>
    {/* pearl earrings */}
    <circle cx="74" cy="192" r="4.5" fill="#F2EFE6"/><circle cx="166" cy="192" r="4.5" fill="#F2EFE6"/>
    {/* navy power blazer, padded shoulders, gold blouse */}
    <path d="M30 320 C38 262 76 244 120 244 C164 244 202 262 210 320 Z" fill="#16204A"/>
    <path d="M30 320 C34 280 44 260 64 250 L80 320 Z" fill="#0F1738"/>
    <path d="M210 320 C206 280 196 260 176 250 L160 320 Z" fill="#0F1738"/>
    <path d="M96 246 L120 282 L144 246 L134 242 L120 264 L106 242 Z" fill="#E8C25A"/>
    <path d="M96 246 L120 282 L100 320 L84 320 Z" fill="#1B2858"/>
    <path d="M144 246 L120 282 L140 320 L156 320 Z" fill="#1B2858"/>
    <circle cx="120" cy="294" r="3.4" fill={C.gold}/>
    {/* gold-rim glasses */}
    <circle cx="100" cy="143" r="13" fill="none" stroke={C.gold} strokeWidth="2.2"/>
    <circle cx="140" cy="143" r="13" fill="none" stroke={C.gold} strokeWidth="2.2"/>
    <path d="M113 142 L127 142" stroke={C.gold} strokeWidth="2"/>
    <path d="M87 140 L78 136 M153 140 L162 136" stroke={C.gold} strokeWidth="2"/>
    {/* eyes behind lenses */}
    <ellipse cx="100" cy="143" rx="8" ry="4.6" fill="#fff"/>
    <ellipse cx="140" cy="143" rx="8" ry="4.6" fill="#fff"/>
    <circle cx="101" cy="143.6" r="3" fill="#3A5A2E"/>
    <circle cx="141" cy="143.6" r="3" fill="#3A5A2E"/>
    <path d="M92 138 L106 144 M148 138 L134 144" stroke="#fff" strokeWidth="1" opacity=".45"/>
    {/* brows / nose / red power lips */}
    <path d={browL} stroke="#A87E20" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
    <path d={browR} stroke="#A87E20" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
    <path d="M118 152 Q115 166 112 169 Q118 173 125 170" stroke="#C08A5A" strokeWidth="2" fill="none"/>
    <path d={mouth} stroke="#B3263F" strokeWidth="5.4" fill="none" strokeLinecap="round"/>
  </svg>);
};
const PORTRAITS={ maria:MariaP, ramirez:RamirezP, colombiano:ColombianoP, tiburon:TiburonP, cass:CassP };

// ── 5-layer neon-noir frame (from the portrait pipeline doc) ──
const NPCFrame=({who,mood="neutral",w=160,showName=true})=>{
  const npc=NPCS[who], P=PORTRAITS[who];
  return(
    <div style={{position:"relative",width:w,aspectRatio:"3/4",borderRadius:10,overflow:"hidden",flexShrink:0,
      border:`1px solid rgba(${npc.glow},.45)`,
      background:"linear-gradient(165deg,#101a2e 0%,#070d18 100%)",
      boxShadow:`0 0 22px rgba(${npc.glow},.32), 0 0 60px rgba(${npc.glow},.12)`}}>
      {/* venetian-blind light slats */}
      <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(178deg, rgba(${npc.glow},.13) 0px 9px, transparent 9px 24px)`}}/>
      {/* layer 1: contrast/saturate boost on the art */}
      <div style={{position:"absolute",inset:0,filter:"contrast(1.18) saturate(1.35) brightness(1.04)"}}><P mood={mood}/></div>
      {/* layer 2: signature color gradient */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, rgba(${npc.glow},.14) 0%, transparent 35%, rgba(2,8,16,.55) 100%)`}}/>
      {/* layer 3: VHS scanlines */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0px 1px, transparent 1px 3px)",animation:"vhsTrack 7s infinite"}}/>
      {/* layer 4: grain */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.08,mixBlendMode:"overlay"}}>
        <filter id={`gr-${who}`}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/></filter>
        <rect width="100%" height="100%" filter={`url(#gr-${who})`}/>
      </svg>
      {/* layer 5: vignette */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 38%, transparent 52%, rgba(0,0,0,.55) 100%)"}}/>
      {showName&&<div style={{position:"absolute",left:0,right:0,bottom:0,padding:"5px 8px",
        background:"linear-gradient(0deg, rgba(2,8,16,.92), transparent)"}}>
        <div style={{fontFamily:ft,fontSize:8,letterSpacing:2,color:`rgba(${npc.glow},1)`,fontWeight:"bold"}}>{npc.role}</div>
        <div style={{fontFamily:ft,fontSize:12,fontWeight:"bold",color:"#fff",textShadow:`0 0 8px rgba(${npc.glow},.8)`}}>{npc.name}</div>
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
  const endingsInfo=[["escape","🛫","GHOSTED OUT"],["kingpin","👑","KING OF MIAMI"],["bust","🚔","DAWN RAID"],["dead","⚰️","JOHN DOE"],["broke","🚌","THE BUS HOME"]];
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

const BrokeChoiceScreen=({onBeg,onBus})=>(
  <div style={{position:"fixed",inset:0,zIndex:65,background:C.midnight,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{maxWidth:340,textAlign:"center",animation:"popIn .3s ease"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><NPCFrame who="tiburon" w={130}/></div>
      <Neon color={C.pink} size={19}>POCKETS EMPTY</Neon>
      <div style={{fontFamily:fb,fontSize:14.5,fontStyle:"italic",color:C.text,margin:"12px 0 18px",lineHeight:1.55}}>
        No cash. No product. No bank. Just debt with your name on it. Tiburón finds you on a bus bench, grinning like he already knew.
        "Two options, amigo. My money. Or my mercy. One of them has interest."
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <button style={bt(C.gold)} onClick={onBeg}>🦈 TAKE HIS $3,000 — owe $12,000 more</button>
        <button style={bt(C.dim)} onClick={onBus}>🚌 TAKE THE BUS HOME — it's over</button>
      </div>
    </div>
  </div>
);

const EscapeScreen=({g,onAttempt,onBack})=>{
  const total=g.cash+g.bank+(g.cleanCash||0);
  const turfCt=g.turf.filter(t=>t>0).length;
  const routes=[
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

const FINALES={
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
const FinaleScene=({route,onDone,sound})=>{
  const F=FINALES[route]||FINALES.route50;
  const [idx,setIdx]=useState(0);
  const [typed,setTyped]=useState(false);
  const [instant,setInstant]=useState(false);
  const last=idx>=F.lines.length-1;
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
      <TypeText key={idx} text={F.lines[idx]} sound={sound} instant={instant} onDone={()=>setTyped(true)}/>
    </div>
    <div style={{display:"flex",gap:6,margin:"16px 0 10px"}}>
      {F.lines.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:4,background:i===idx?F.color:"#ffffff30"}}/>)}
    </div>
    {last&&typed
      ?<button onClick={e=>{e.stopPropagation();onDone();}}
        style={{...bt(F.color,true),padding:"13px 30px",animation:"riseIn .3s ease"}}>ROLL CREDITS ▸</button>
      :<div style={{fontFamily:ft,fontSize:9,letterSpacing:2,color:C.dim}}>TAP TO CONTINUE ▸</div>}
  </div>);
};

const GameOverScreen=({g,meta,repEarned,newAchs=[],onRunBack,onSafehouse,onTitle})=>{
  const [copied,setCopied]=useState(false);
  const nw=g.cash+g.bank+(g.cleanCash||0)-g.debt;
  const ending=g.ending||"broke";
  const vhs=ending==="escape"||ending==="kingpin";
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
        <Neon color={ending==="kingpin"?C.gold:C.blue} size={26} style={{marginBottom:14}}>
          {ending==="kingpin"?"👑 KING OF MIAMI":"🛫 GHOSTED OUT"}</Neon>
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
  const startRun=useCallback((withComic=true)=>{
    metaSaved.current=false; setRepEarned(0); setFinale(null);
    const di=cfg.daily?getDailySeed():null;
    const daily=di?{...di,mods:getDailyModifiers(di.seed)}:null;
    let st=createInitialState(cfg.heat,PLAYBOOKS[cfg.pb],daily,meta.upgrades);
    st.activeStorylet={id:"brick_call",...STORY.brick_call,lineIdx:0};
    st.storySeen={brick_call:true};
    setG(st); setTab("market"); setSelDrug(null); setMode("buy"); setQty(1);
    setModal(null); setBreakdown(null); setEraOv(null);
    prevUnlocks.current={};
    if(withComic){ setComicIdx(0); setScreen("comic"); } else setScreen("game");
  },[cfg,meta.upgrades]);

  // game over → bank rep once
  useEffect(()=>{
    if(screen==="gameover"&&g&&!metaSaved.current){
      metaSaved.current=true;
      const nw=g.cash+g.bank+(g.cleanCash||0)-g.debt;
      const rep=calcRepEarned(g,nw,!!g.isDaily);
      const m={...meta,rep:meta.rep+rep,totalRep:(meta.totalRep||0)+rep,runs:meta.runs+1,bestNW:Math.max(meta.bestNW,nw)};
      m.endings={...(meta.endings||{}),[g.ending||"broke"]:true};
      m.biggestDeal=Math.max(meta.biggestDeal||0,g.biggestDeal||0);
      m.topRuns=[...(meta.topRuns||[]),{nw,days:Math.floor(g.move/2)+1,ending:g.ending||"broke",pb:g.playbook||"hustler"}]
        .sort((a,b)=>b.nw-a.nw).slice(0,5);
      const newAch=[];
      m.ach={...(meta.ach||{})};
      for(const a of ACHIEVEMENTS){ if(!m.ach[a.id]&&a.test(g,nw)){ m.ach[a.id]=true; newAch.push(a); m.rep+=100; m.totalRep+=100; } }
      setNewAchs(newAch);
      if(g.ending==="escape"||g.ending==="kingpin"){ m.wins=meta.wins+1; m.winStreak=(meta.winStreak||0)+1; m.maxHeatBeaten=Math.max(meta.maxHeatBeaten??-1,g.heatLevel||0); }
      else m.winStreak=0;
      saveMeta(m); setMeta(m); setRepEarned(rep);
      if(meta.sound){ MUSIC.stop();
        (g.ending==="escape"||g.ending==="kingpin"?SFX.endingWin:SFX.endingLose)();
        newAch.forEach((_,i)=>setTimeout(()=>{ if(!AUDIO.isMuted()) SFX.achievement(i); },1300+i*760));
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

  // ── render ──
  if(screen==="title") return(<><style>{KEYFRAMES}</style>
    <TitleScreen meta={meta} cfg={cfg} setCfg={setCfg}
      onPlay={()=>{ if(meta.sound)SFX.click(); startRun(true); }}
      onSafehouse={()=>setScreen("safehouse")}
      onLedger={()=>setScreen("ledger")}
      onSound={()=>{ const m={...meta,sound:!meta.sound}; saveMeta(m); setMeta(m); }}/></>);
  if(screen==="ledger") return(<><style>{KEYFRAMES}</style>
    <LedgerScreen meta={meta} onBack={()=>setScreen("title")}/></>);
  if(screen==="safehouse") return(<><style>{KEYFRAMES}</style>
    <SafehouseScreen meta={meta} setMeta={setMeta} onBack={()=>setScreen(g&&g.ending?"gameover":"title")}/></>);
  if(screen==="comic") return(<><style>{KEYFRAMES}</style>
    <ComicScreen idx={comicIdx}
      onTap={()=>{ if(meta.sound)SFX.click(); comicIdx<COMIC_PANELS.length-1?setComicIdx(comicIdx+1):setScreen("game"); }}
      onSkip={()=>setScreen("game")}/></>);
  if(!g) return null;
  if(screen==="gameover") return(<><style>{KEYFRAMES}</style>
    <GameOverScreen g={g} meta={meta} repEarned={repEarned} newAchs={newAchs}
      onRunBack={()=>startRun(false)} onSafehouse={()=>setScreen("safehouse")} onTitle={()=>setScreen("title")}/></>);
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
    <BrokeChoiceScreen
      onBeg={()=>{ setG({...g,cash:g.cash+3000,debt:g.debt+12000}); addPart("🦈 +$3,000 ... +$12,000 DEBT",C.gold,.4); setScreen("game"); }}
      onBus={()=>{ setG({...g,ending:"broke"}); setScreen("gameover"); }}/></>);
  if(screen==="finale") return(<><style>{KEYFRAMES}</style>
    <FinaleScene route={finale} sound={meta.sound} onDone={()=>setScreen("gameover")}/></>);
  if(screen==="escape") return(<><style>{KEYFRAMES}</style>
    <EscapeScreen g={g} onAttempt={escapeAttempt} onBack={()=>setScreen("game")}/></>);

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
          {g.streak>=2&&<div style={{...bx,padding:"5px 10px",border:`1px solid ${C.orange}66`,fontFamily:ft,fontSize:11,fontWeight:"bold",color:C.orange,animation:"hudPing .5s ease"}}>🔥×{g.streak}</div>}
          <div ref={bagRef} style={{...bx,padding:"5px 10px",fontFamily:ft,fontSize:11,color:C.dim}}>🎒{used}/{g.coatSp}</div>
          <HeatPlanChip g={g}/>
        </div>

        {/* THE PLAN — act tracker */}
        {g.move>=1&&(()=>{
          const liquid=g.cash+g.bank+(g.cleanCash||0);
          const evd=g.npcState.ramirez.evidence||0;
          const turfCt=g.turf.filter(t=>t>0).length;
          const kingpinPath=g.storyFlags.kingpin_path;
          const plan=
            g.storyFlags.final_grace?{label:"🚨 RAID AT DAWN — THIS IS YOUR LAST MOVE",sub:"any escape route. ANY. GO.",v:1,max:1,color:"#FF1733",tap:true,alarm:true}
            :evd>=15?{label:"⚠ FINAL ACT — RAMIREZ IS CLOSING THE FILE",sub:`${evd}/20 evidence — get out NOW`,v:evd,max:20,color:"#FF1733",tap:true,alarm:true}
            :(g.totalProfit||0)<12000?{label:"ACT I — GET ESTABLISHED",sub:`${FM(g.totalProfit||0)} / ${FM(12000)} profit ◆ the street learns your name`,v:g.totalProfit||0,max:12000,color:C.blue}
            :kingpinPath?{label:"ACT II — TAKE THE CITY",sub:`cred ${g.cred}/80 ◆ ${turfCt}/4 districts ◆ ${FM(g.totalProfit||0)}/$500K moved`,v:Math.min(g.cred/80,turfCt/4,(g.totalProfit||0)/500000)*100,max:100,color:C.gold,tap:true}
            :liquid<40000?{label:"ACT II — STACK THE ESCAPE FUND",sub:`${FM(liquid)} / $40,000 ◆ Maria knows a forger`,v:liquid,max:40000,color:C.gold,tap:true}
            :{label:"ACT III — FINISH THE STORY",sub:"the door is open ◆ every extra day is greed ◆ TAP to end it",v:1,max:1,color:C.green,tap:true};
          return(
          <div onClick={plan.tap?()=>setScreen("escape"):undefined}
            style={{...bx,marginBottom:8,cursor:plan.tap?"pointer":"default",padding:"8px 10px",
              border:`1px solid ${plan.color}55`,animation:plan.alarm?"hudPulse 1.1s infinite":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontFamily:ft,fontSize:10,fontWeight:"bold",letterSpacing:1,color:plan.color}}>{plan.label}</span>
              {plan.tap&&<span style={{fontFamily:ft,fontSize:8.5,color:C.dim}}>TAP ▸</span>}
            </div>
            <div style={{fontFamily:ft,fontSize:9,color:C.dim,margin:"3px 0 5px"}}>{plan.sub}</div>
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

        {tab==="bank"&&<BankTab g={g} act={act} meta={meta} onEscape={()=>setScreen("escape")} markCoach={markCoach}/>}
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
      {g.streak>=3&&<div style={{position:"fixed",inset:0,zIndex:3,pointerEvents:"none",
        animation:`streakBorder 1.4s ease-in-out infinite${g.streak>=6?", rainbowB 3s linear infinite":""}`}}/>}
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
      🦈 PAY TIBURÓN {FM(Math.min(g.cash,g.debt))} — owes {FM(g.debt)}</button>}
    <div style={{fontFamily:ft,fontSize:9,color:C.dim,marginBottom:10}}>
      Debt compounds 8%+ every 4 moves — and the shark sends collectors. Bank earns 3%.</div>
    {!g.gun&&<button style={{...bt(C.orange),width:"100%",marginBottom:8}} disabled={g.cash<4000}
      onClick={()=>act(processBuyGun)}>🔫 BUY A PIECE — $4,000</button>}
    {(g.fedHeat>=15||(g.npcState.ramirez.evidence||0)>=4)&&(()=>{const lc=Math.max(1500,Math.floor(1500+g.fedHeat*70+(g.npcState.ramirez.evidence||0)*350));
      return <button style={{...bt(C.blue),width:"100%",marginBottom:8}} disabled={g.cash<lc}
        onClick={()=>act(processLawyer)}>⚖️ RETAIN COUNSEL — {FM(lc)} (−25 heat, −3 evidence)</button>;})()}
    {(()=>{const liquid=g.cash+g.bank+(g.cleanCash||0);return(
    <div style={{...bx,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontFamily:ft,fontSize:10,marginBottom:5}}>
        <span style={{color:C.blue,fontWeight:"bold"}}>🛫 ESCAPE FUND</span>
        <span style={{color:liquid>=40000?C.green:C.dim}}>{FM(liquid)} / $40,000</span></div>
      <Bar v={liquid} max={40000} color={liquid>=40000?C.green:C.blue}/>
      {liquid>=40000&&<div style={{fontFamily:ft,fontSize:9,color:C.green,marginTop:4}}>✓ THE FORGER WILL TAKE YOUR CALL</div>}
    </div>);})()}
    <LaunderPanel g={g} act={act}/>
    <button style={{...bt(C.blue),width:"100%"}} onClick={onEscape}>🛫 EXPLORE ESCAPE ROUTES</button>
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
