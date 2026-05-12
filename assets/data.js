/* ============================================================
   RuckFit Pro — Seed Data
   All mock content is realistic to rugby S&C practice.
   ============================================================ */
(function () {
  const POSITIONS = [
    { id: 'p1',  name: 'Loosehead Prop',   group: 'Front Row',  number: 1,  side: 'L' },
    { id: 'p2',  name: 'Hooker',           group: 'Front Row',  number: 2,  side: 'C' },
    { id: 'p3',  name: 'Tighthead Prop',   group: 'Front Row',  number: 3,  side: 'R' },
    { id: 'p4',  name: 'Lock (LL)',        group: 'Second Row', number: 4,  side: 'L' },
    { id: 'p5',  name: 'Lock (TH)',        group: 'Second Row', number: 5,  side: 'R' },
    { id: 'p6',  name: 'Blindside Flanker',group: 'Back Row',   number: 6,  side: 'L' },
    { id: 'p7',  name: 'Openside Flanker', group: 'Back Row',   number: 7,  side: 'R' },
    { id: 'p8',  name: 'Number 8',         group: 'Back Row',   number: 8,  side: 'C' },
    { id: 'p9',  name: 'Scrum-half',       group: 'Half Backs', number: 9,  side: 'C' },
    { id: 'p10', name: 'Fly-half',         group: 'Half Backs', number: 10, side: 'C' },
    { id: 'p11', name: 'Left Wing',        group: 'Back Three', number: 11, side: 'L' },
    { id: 'p12', name: 'Inside Centre',    group: 'Midfield',   number: 12, side: 'L' },
    { id: 'p13', name: 'Outside Centre',   group: 'Midfield',   number: 13, side: 'R' },
    { id: 'p14', name: 'Right Wing',       group: 'Back Three', number: 14, side: 'R' },
    { id: 'p15', name: 'Fullback',         group: 'Back Three', number: 15, side: 'C' },
  ];

  /* Sample athlete profile (filled by onboarding; defaulted to demo) */
  const DEMO_ATHLETE = {
    firstName: 'Owen',
    lastName: 'Carter',
    initials: 'OC',
    age: 22,
    heightCm: 187,
    weightKg: 96.4,
    targetWeightKg: 99,
    level: 'Academy',          // Club, University, Academy, Semi-pro, Pro
    primaryPosition: 'p8',
    secondaryPosition: 'p6',
    goal: ['mass-gain', 'strength'], // multi-select: strength | speed | mass-gain | fat-loss | endurance | rtp | match-fitness
    phase: 'in-season',        // off-season, pre-season, in-season, rehab
    sessionsPerWeek: 5,
    gymAccess: 'full',         // limited | home | full
    injuryHistory: ['Right ankle sprain (2024)', 'AC joint sprain (2023)'],
    nextMatch: '2026-05-16',   // ISO match day
    units: 'metric',           // metric | imperial
    archetype: 'Engine Forward',
    dominantSide: 'Right',
    contactReadiness: 'green',
    availability: 'available',
    riskFlags: ['hamstring-load-spike'],
    streakDays: 17,
    notifications: [
      { id: 1, type: 'coach',    title: 'Coach note',           sub: 'Add 2 sets on chin-ups today.', when: 'Today 08:20' },
      { id: 2, type: 'readiness',title: 'Readiness updated',    sub: 'Sleep score dropped 8% — green still.', when: 'Today 07:01' },
      { id: 3, type: 'session',  title: 'Session unlocked',     sub: 'Wed — Power + Speed Exposure.', when: 'Yesterday' },
      { id: 4, type: 'team',     title: 'Forwards challenge',   sub: '“100 chin-ups week” — 4 of 7 done.', when: 'Mon' },
    ],
  };

  /* Strength benchmarks (kg) */
  const BENCHMARKS = {
    backSquat: 165, frontSquat: 132, deadlift: 200, benchPress: 122, hangClean: 102,
    chinupBwReps: 14, broadJumpCm: 268, verticalCm: 58,
  };

  const SPEED = {
    tenM: 1.79, twentyM: 3.05, fortyM: 5.18,
    bronco: '5:24', repeatHIE: 7,    // 0–10
    yoyoIR1: 18.4,
  };

  /* ============================================================
     7-day program — adaptive to MD-X
     MD = Saturday (matchday). MD-1 captain's run; MD-2 prep; MD-3 power+speed; MD-4 heavier strength
     Today is Tuesday (MD-4 in this example).
     ============================================================ */
  const PROGRAM = [
    {
      day: 'Mon', label: 'MD-5', date: '2026-05-11', focus: 'Recovery + Mobility',
      type: 'recovery', complete: true,
      blocks: [
        { name: 'Soft tissue & mobility', items: [
          { ex: 'Foam roll glutes/quads/calves', sets: 1, reps: '6 min', rest: '—', tempo: '—' },
          { ex: 'Hip 90/90 flow',               sets: 2, reps: '6/side', rest: '0', tempo: 'controlled' },
          { ex: 'Thoracic openers',             sets: 2, reps: '8/side', rest: '0', tempo: '3s pause' },
        ]},
        { name: 'Pool / spin', items: [
          { ex: 'Easy bike or pool walk', sets: 1, reps: '20 min', rest: '—', tempo: 'Z1' },
        ]}
      ],
      cues: ['Keep HR < 130', 'No collision exposure', 'Top up hydration']
    },
    {
      day: 'Tue', label: 'MD-4', date: '2026-05-12', focus: 'Heavy Lower + Push',
      type: 'strength', complete: false,
      blocks: [
        { name: 'Power primer', items: [
          { ex: 'Pogo to hurdle hop',  sets: 3, reps: '5',     rest: '60s',   tempo: 'reactive', cues:['Stiff ankles','Min ground contact'] },
        ]},
        { name: 'Main strength', items: [
          { ex: 'Trap bar deadlift',   sets: 4, reps: '4',  rpe: 8,    rest: '180s',  tempo: '2-0-X-0', cues:['Lats tight','Push the floor away'] },
          { ex: 'Front squat',         sets: 4, reps: '5',  rpe: 7.5,  rest: '150s',  tempo: '3-0-1-0', cues:['Elbows high','Brace before descent'] },
          { ex: 'Bench press',         sets: 4, reps: '6',  rpe: 8,    rest: '120s',  tempo: '2-1-X-0', cues:['Leg drive','Bar to lower sternum'] },
        ]},
        { name: 'Accessory', items: [
          { ex: 'Bulgarian split squat', sets: 3, reps: '8/side', rpe: 8, rest: '90s', tempo:'2-0-X-0' },
          { ex: 'Chin-ups',              sets: 3, reps: 'AMRAP-2', rest: '90s', tempo:'2-0-X-0', cues:['Full ROM','Pause at chin'] },
          { ex: 'Neck harness — flex/ext', sets: 3, reps: '10/dir', rest: '60s', tempo:'slow', cues:['Hold 1s top','No reps to failure'] },
        ]},
        { name: 'Finisher', items: [
          { ex: 'Pallof press',  sets: 3, reps: '10/side', rest: '45s' },
        ]}
      ],
      cues: ['Quality > volume', 'Cap RPE at 8 — match week', 'Re-fuel within 60 min']
    },
    {
      day: 'Wed', label: 'MD-3', date: '2026-05-13', focus: 'Power + Speed Exposure',
      type: 'speed', complete: false,
      blocks: [
        { name: 'Activation', items: [
          { ex: 'A-skip / B-skip',     sets: 2, reps: '20m', rest: '30s' },
          { ex: 'Banded glute series', sets: 2, reps: '10/dir', rest: '20s' },
        ]},
        { name: 'Sprint', items: [
          { ex: '10m acceleration', sets: 4, reps: '1', rest: '90s', cues:['Drive shins','Punch arms'] },
          { ex: '20m flying',       sets: 3, reps: '1', rest: '180s', cues:['Tall posture','Front-side mechanics'] },
        ]},
        { name: 'Power lifts', items: [
          { ex: 'Hang clean',     sets: 4, reps: '3', rpe: 7,  rest: '150s' },
          { ex: 'Med-ball chest pass against wall', sets: 3, reps: '6', rest: '60s' },
        ]},
        { name: 'Contact prep', items: [
          { ex: 'Bag tackle technique', sets: 3, reps: '6', rest: '90s', cues:['Cheek to cheek','Chop & lift'] },
        ]}
      ],
      cues: ['Full recovery between sprints', 'No max-effort to PB today']
    },
    {
      day: 'Thu', label: 'MD-2', date: '2026-05-14', focus: 'Team + Conditioning Top-up',
      type: 'team', complete: false,
      blocks: [
        { name: 'Team unit', items: [
          { ex: 'Lineout + breakdown patterns', sets: 1, reps: '40 min', rest:'—' },
        ]},
        { name: 'Conditioning', items: [
          { ex: 'Repeat 40m efforts', sets: 6, reps: '1', rest: '45s', cues:['~90% intent','Same speed each rep'] },
        ]},
        { name: 'Cool-down', items: [
          { ex: 'Mobility flow', sets: 1, reps: '10 min', rest:'—' },
        ]}
      ],
      cues: ['Submaximal day', 'Keep total load < 350']
    },
    {
      day: 'Fri', label: 'MD-1', date: '2026-05-15', focus: "Captain's Run + Activation",
      type: 'activation', complete: false,
      blocks: [
        { name: 'Activation', items: [
          { ex: 'Plyo primer',  sets: 3, reps: '3 jumps', rest: '45s' },
          { ex: 'Sled drives',  sets: 4, reps: '10m',      rest: '90s', cues:['Punchy short steps'] },
        ]},
        { name: 'Skills', items: [
          { ex: 'Pass + catch — calibration', sets: 1, reps: '20 min', rest:'—' },
        ]}
      ],
      cues: ['Sharp & short', 'Hydration check', 'Sleep ≥ 8h']
    },
    {
      day: 'Sat', label: 'MD',   date: '2026-05-16', focus: 'Match Day — vs Saracens A',
      type: 'match', complete: false,
      blocks: [
        { name: 'Match', items: [
          { ex: 'Pre-match meal 3h prior',  sets: 1, reps: '—', rest:'—' },
          { ex: 'Match warm-up protocol',   sets: 1, reps: '25 min', rest:'—' },
          { ex: 'Match — 70+ min target',   sets: 1, reps: '—', rest:'—' },
          { ex: 'Post-match cooldown & refuel', sets: 1, reps: '15 min', rest:'—' },
        ]}
      ],
      cues: ['Trust the prep', 'Communicate early in collisions', 'Refuel within 30 min']
    },
    {
      day: 'Sun', label: 'MD+1', date: '2026-05-17', focus: 'Active Recovery',
      type: 'recovery', complete: false,
      blocks: [
        { name: 'Recovery', items: [
          { ex: 'Pool walk / contrast', sets: 1, reps: '20 min', rest:'—' },
          { ex: 'Mobility flow',        sets: 1, reps: '15 min', rest:'—' },
        ]}
      ],
      cues: ['Bruise check', 'Symptom report by 18:00']
    }
  ];

  /* ============================================================
     Trends & analytics data (14 weeks)
     ============================================================ */
  const WEEKLY_LOAD = [612, 645, 690, 720, 765, 740, 810, 820, 870, 905, 880, 940, 980, 925];
  const SESSION_RPE = [
    { d:'Mon', rpe:3, mins:35,  type:'recovery' },
    { d:'Tue', rpe:8, mins:75,  type:'strength' },
    { d:'Wed', rpe:7, mins:65,  type:'speed' },
    { d:'Thu', rpe:7, mins:80,  type:'team' },
    { d:'Fri', rpe:5, mins:40,  type:'activation' },
    { d:'Sat', rpe:9, mins:90,  type:'match' },
    { d:'Sun', rpe:2, mins:30,  type:'recovery' },
  ];
  const BODYWEIGHT = [
    {w:'W-13', kg:94.1},{w:'W-12', kg:94.5},{w:'W-11', kg:94.6},{w:'W-10', kg:95.0},
    {w:'W-9', kg:95.4},{w:'W-8', kg:95.7},{w:'W-7', kg:95.6},{w:'W-6', kg:95.9},
    {w:'W-5', kg:96.0},{w:'W-4', kg:96.2},{w:'W-3', kg:96.1},{w:'W-2', kg:96.3},
    {w:'W-1', kg:96.5},{w:'W0',  kg:96.4},
  ];
  const STRENGTH_PROG = {
    'Back Squat':   [140,142,145,148,150,152,155,158,160,162,162,164,165,165],
    'Trap Bar DL':  [180,182,184,186,188,190,193,195,196,198,199,200,200,200],
    'Bench Press':  [108,110,112,113,115,117,118,119,120,121,122,122,122,122],
    'Hang Clean':   [88, 90, 92, 94, 95, 96, 98, 99,100,100,101,102,102,102],
  };
  const SPRINT_PROG = [
    {w:'W-13', s10:1.86, s40:5.34},
    {w:'W-11', s10:1.84, s40:5.30},
    {w:'W-9',  s10:1.82, s40:5.27},
    {w:'W-7',  s10:1.81, s40:5.24},
    {w:'W-5',  s10:1.80, s40:5.21},
    {w:'W-3',  s10:1.79, s40:5.19},
    {w:'W-1',  s10:1.79, s40:5.18},
  ];
  const READINESS_HISTORY = [78,82,76,84,72,80,86,82,79,84,88,80,78,84];

  /* Quality balance (radar) — strength, speed, conditioning, power, mobility, contact */
  const QUALITY_BALANCE = {
    Strength: 86, Power: 78, Speed: 72, Conditioning: 68, Mobility: 60, Contact: 82
  };

  /* ============================================================
     Wellness — daily check-ins (last 14d)
     ============================================================ */
  const WELLNESS = [
    { d:'2026-04-29', sleepHr:8.0, sleepQ:8, soreness:3, mood:8, stress:3, hydration:8, hrv:74 },
    { d:'2026-04-30', sleepHr:7.5, sleepQ:7, soreness:4, mood:7, stress:4, hydration:7, hrv:70 },
    { d:'2026-05-01', sleepHr:7.0, sleepQ:6, soreness:5, mood:6, stress:5, hydration:6, hrv:64 },
    { d:'2026-05-02', sleepHr:8.5, sleepQ:9, soreness:3, mood:8, stress:3, hydration:9, hrv:78 },
    { d:'2026-05-03', sleepHr:8.0, sleepQ:8, soreness:2, mood:9, stress:2, hydration:8, hrv:80 },
    { d:'2026-05-04', sleepHr:7.5, sleepQ:7, soreness:4, mood:7, stress:4, hydration:7, hrv:72 },
    { d:'2026-05-05', sleepHr:8.0, sleepQ:8, soreness:3, mood:8, stress:3, hydration:8, hrv:74 },
    { d:'2026-05-06', sleepHr:7.5, sleepQ:7, soreness:5, mood:7, stress:4, hydration:7, hrv:68 },
    { d:'2026-05-07', sleepHr:8.5, sleepQ:9, soreness:3, mood:8, stress:3, hydration:9, hrv:80 },
    { d:'2026-05-08', sleepHr:8.0, sleepQ:8, soreness:3, mood:8, stress:3, hydration:8, hrv:76 },
    { d:'2026-05-09', sleepHr:6.5, sleepQ:6, soreness:6, mood:6, stress:5, hydration:6, hrv:62 },
    { d:'2026-05-10', sleepHr:8.0, sleepQ:7, soreness:4, mood:7, stress:4, hydration:7, hrv:70 },
    { d:'2026-05-11', sleepHr:8.5, sleepQ:8, soreness:3, mood:8, stress:3, hydration:8, hrv:75 },
    { d:'2026-05-12', sleepHr:7.5, sleepQ:8, soreness:4, mood:8, stress:3, hydration:8, hrv:72 },
  ];

  const SORENESS_MAP = {
    neck: 2, lShoulder: 1, rShoulder: 3, upperBack: 2, lowerBack: 4,
    lQuad: 3, rQuad: 3, lHam: 5, rHam: 4, lCalf: 2, rCalf: 3,
    lGroin: 2, rGroin: 1, chest: 1, abs: 0, lAnkle: 2, rAnkle: 4,
  };

  /* ============================================================
     Nutrition
     ============================================================ */
  const NUTRITION = {
    targets: { calories: 3850, protein: 215, carbs: 480, fat: 110, hydrationL: 4.5 },
    todayLog: { calories: 2620, protein: 168, carbs: 305, fat: 78, hydrationL: 2.6, meals: [
      { name: 'Breakfast — Oats, berries, whey, eggs', kcal: 720,  p: 48, c: 86, f: 18 },
      { name: 'Mid-AM — Greek yoghurt, granola, banana', kcal: 460, p: 28, c: 62, f: 10 },
      { name: 'Lunch — Chicken rice bowl + greens',     kcal: 880,  p: 62, c: 92, f: 22 },
      { name: 'Pre-train — Toast, honey, espresso',     kcal: 360,  p: 12, c: 58, f: 6 },
      { name: 'Post-train shake',                       kcal: 200,  p: 38, c: 6,  f: 2 },
    ]},
    matchDayFueling: [
      { time: '−3h', text: 'Porridge + banana + scrambled eggs (~700 kcal, 90g CHO)' },
      { time: '−90m', text: 'White bagel + honey + caffeine (~250 kcal, 50g CHO)' },
      { time: '−15m', text: '20g maltodextrin gel + 200ml water/electrolyte' },
      { time: 'Half-time', text: 'Gel + 250ml carb-electrolyte mix (30g CHO)' },
      { time: 'Post-match', text: 'Recovery shake (40g P / 60g CHO) within 30 min' },
    ],
    supplements: [
      { name: 'Creatine monohydrate', dose: '5 g daily', timing: 'Any time' },
      { name: 'Whey isolate',         dose: '30–40 g',  timing: 'Post-session' },
      { name: 'Vitamin D3',           dose: '2000 IU',  timing: 'Morning' },
      { name: 'Omega-3 EPA/DHA',      dose: '2 g',      timing: 'With meal' },
      { name: 'Beta-alanine',         dose: '4 g split','timing': 'Pre-train' },
    ],
    mealIdeas: {
      'Mass gain': [
        'Rice bowl: 200g rice + 200g chicken + avocado + olive oil',
        'PB-banana smoothie: 80g oats, 40g whey, 1 banana, 30g PB',
        'Steak + sweet potato mash + spinach',
      ],
      'Performance': [
        'Salmon + jasmine rice + greens + miso',
        'Turkey wrap + cottage cheese + fruit',
        'Pasta bolognese (lean mince) + parmesan',
      ],
      'Recomposition': [
        'Big salad + 200g chicken + quinoa + EVOO',
        'Cottage cheese + berries + flax',
        'Chilli con carne + cauliflower rice',
      ],
    },
    grocery: [
      { item: 'Chicken breast', qty: '2 kg' },
      { item: 'Lean mince 5%',  qty: '1 kg' },
      { item: 'Salmon fillets', qty: '4'    },
      { item: 'Eggs',           qty: '24'   },
      { item: 'Greek yoghurt',  qty: '1 kg' },
      { item: 'Jasmine rice',   qty: '2 kg' },
      { item: 'Oats',           qty: '1 kg' },
      { item: 'Sweet potatoes', qty: '2 kg' },
      { item: 'Spinach',        qty: '300 g' },
      { item: 'Mixed berries',  qty: '500 g' },
      { item: 'Bananas',        qty: '12'    },
      { item: 'Avocados',       qty: '6'     },
      { item: 'Olive oil',      qty: '1 L'  },
      { item: 'Whey isolate',   qty: '2 kg' },
    ],
  };

  /* ============================================================
     Position-specific KPIs
     ============================================================ */
  const POSITION_PROFILES = {
    'Front Row': {
      blurb: 'Scrum dominance, brace strength, neck integrity.',
      kpis: [
        { label: 'Neck harness (5RM)', value: '32 kg', delta: '+2 kg', good: true },
        { label: 'Bench press (1RM)',   value: '122 kg', delta: '+3 kg', good: true },
        { label: 'Front squat (1RM)',   value: '132 kg', delta: '+1 kg', good: true },
        { label: 'Bronco',              value: '5:24',  delta: '-6 s',  good: true },
      ],
      emphasis: ['Neck strength', 'Scrum brace ISO', 'Pushing power', 'Aerobic base'],
    },
    'Second Row': {
      blurb: 'Repeatable jump, engine, mauling power.',
      kpis: [
        { label: 'Vertical jump',     value: '58 cm', delta: '+2 cm', good: true },
        { label: 'Yo-Yo IR1',         value: '18.4',  delta: '+0.4',  good: true },
        { label: 'Hang clean',        value: '102 kg', delta: '+1 kg', good: true },
        { label: 'Back squat (1RM)',  value: '165 kg', delta: '+5 kg', good: true },
      ],
      emphasis: ['Vertical power', 'Lineout pop', 'Engine work', 'Tall lift mechanics'],
    },
    'Back Row': {
      blurb: 'Repeat high-intensity efforts, collisions, breakdown work rate.',
      kpis: [
        { label: 'Repeat HIE',        value: '7/10', delta: '+1', good: true },
        { label: 'Bronco',            value: '5:24', delta: '-6 s', good: true },
        { label: '40m sprint',        value: '5.18', delta: '-0.06', good: true },
        { label: 'Trap bar DL',       value: '200 kg', delta: '+5 kg', good: true },
      ],
      emphasis: ['Collision conditioning', 'Repeat sprint ability', 'Pulling strength', 'Hip mobility'],
    },
    'Half Backs': {
      blurb: 'Speed repeatability, agility, kicking load, sharp passing.',
      kpis: [
        { label: '10m accel',         value: '1.79 s', delta: '-0.02', good: true },
        { label: '505 agility',       value: '2.21 s', delta: '-0.04', good: true },
        { label: 'Kicking load',      value: 'Moderate', delta: 'On plan', good: true },
        { label: 'Yo-Yo IR1',         value: '19.2',  delta: '+0.4', good: true },
      ],
      emphasis: ['Repeat sprint', 'Lateral agility', 'Kicking volume mgmt', 'Trunk rotation'],
    },
    'Midfield': {
      blurb: 'Acceleration, contact conditioning, repeat power.',
      kpis: [
        { label: 'Broad jump',         value: '268 cm', delta: '+4 cm', good: true },
        { label: 'Bench press',        value: '120 kg', delta: '+2 kg', good: true },
        { label: 'Repeat collision',   value: '8/10', delta: '+1', good: true },
        { label: '20m sprint',         value: '3.05 s', delta: '-0.02', good: true },
      ],
      emphasis: ['Collision strength', 'Acceleration', 'Tackle conditioning', 'Repeat power'],
    },
    'Back Three': {
      blurb: 'Max velocity, reactive speed, hamstring resilience.',
      kpis: [
        { label: 'Flying 30m',         value: '3.74 s', delta: '-0.05', good: true },
        { label: 'Nordic curls',       value: 'L2/R2',  delta: '+1 level', good: true },
        { label: 'Vertical jump',      value: '62 cm',  delta: '+2 cm', good: true },
        { label: 'Repeat HIE',         value: '8/10',   delta: '+1', good: true },
      ],
      emphasis: ['Max velocity work', 'Hamstring eccentrics', 'Reactive plyos', 'Sprint exposures'],
    },
  };

  /* ============================================================
     Match prep
     ============================================================ */
  const MATCH = {
    opponent: 'Saracens A',
    venue: 'Allianz Park',
    kickoff: '2026-05-16T15:00:00',
    competition: 'Premiership Cup',
    selection: 'Starting XV',
    role: 'Number 8',
    readiness: 86,
    travelMins: 90,
    tactical: [
      'Strike off 9 to wide channel',
      'Aggressive line speed inside 22',
      'Maul exits 5m-out',
      'Counter-ruck pressure on slow ball',
    ],
    routine: [
      { t: 'T-3h',   text: 'Pre-match meal, mobility, walkthrough video' },
      { t: 'T-90m',  text: 'Arrive at venue, strapping, individual prep' },
      { t: 'T-40m',  text: 'Team warm-up — activation, units, lineouts' },
      { t: 'T-15m',  text: 'Captain’s words, breathing protocol, gel + water' },
      { t: 'T-0',    text: 'Kick-off — first contact within 30s' },
      { t: 'Half-time', text: 'Fuel, fluids, tactical adjustments' },
      { t: 'Post-match', text: 'Cooldown, refuel within 30 min, ice if required' },
    ],
    travelChecklist: [
      'Boots + 2nd pair',
      'Mouthguard',
      'Headband / strapping',
      'Match snacks + 2 gels',
      'Recovery shake powder',
      'Compression pants',
      'Foam roller / ball',
    ],
  };

  /* ============================================================
     Rehab / Prehab
     ============================================================ */
  const REHAB = {
    activeIssues: [
      { area: 'Right ankle', status: 'monitoring', pain: 2, rom: 'full', stage: 4, note: 'Cleared for full contact; tape during training.' },
    ],
    stages: [
      { id:1, name:'Pain & swelling control' },
      { id:2, name:'ROM & activation' },
      { id:3, name:'Strength & control' },
      { id:4, name:'Sport-specific load' },
      { id:5, name:'Return to train' },
      { id:6, name:'Return to play' },
    ],
    prehab: [
      {
        area: 'Hamstring',
        items: [
          { ex: 'Nordic curls', sets: 3, reps: '5', rest: '90s', note: 'Slow eccentric, 4s' },
          { ex: 'Single-leg RDL', sets: 3, reps: '8/side', rest: '60s' },
          { ex: 'Copenhagen plank', sets: 2, reps: '20s/side', rest: '45s' },
        ]
      },
      {
        area: 'Shoulder',
        items: [
          { ex: 'YTW raises', sets: 3, reps: '10', rest: '60s' },
          { ex: 'Band external rotation', sets: 3, reps: '12/side', rest: '45s' },
          { ex: 'Bottoms-up KB carry', sets: 3, reps: '20m/side', rest: '60s' },
        ]
      },
      {
        area: 'Groin / Adductors',
        items: [
          { ex: 'Copenhagen adduction', sets: 3, reps: '8/side', rest: '60s' },
          { ex: 'Hip 90/90 isometric', sets: 2, reps: '20s', rest: '45s' },
        ]
      },
      {
        area: 'Ankle',
        items: [
          { ex: 'Heel raises (calf bias)', sets: 3, reps: '15', rest: '60s' },
          { ex: 'Tib raises',              sets: 3, reps: '15', rest: '45s' },
          { ex: 'Single-leg balance', sets: 2, reps: '45s/side', rest: '30s' },
        ]
      },
      {
        area: 'Neck',
        items: [
          { ex: 'Harness flex/ext/lat', sets: 3, reps: '10/dir', rest: '60s' },
          { ex: 'Iso neck holds', sets: 2, reps: '20s/dir', rest: '30s' },
        ]
      }
    ],
    rtpGates: [
      { name: 'Pain free walking',           done: true },
      { name: 'Pain free single leg hops',   done: true },
      { name: 'Bilateral squat 1.5x BW',     done: true },
      { name: 'Cutting at 90%',              done: true },
      { name: 'Sport-specific contact 2x',   done: false, eta: '2 sessions left' },
      { name: 'Medical clearance',           done: false, eta: '2026-05-15' },
    ],
  };

  /* ============================================================
     Community / Team
     ============================================================ */
  const TEAM = [
    { name: 'Owen Carter',  init:'OC', pos:'Number 8', streak: 17, load: 925, badges: ['Iron Streak','PB Week'], you: true },
    { name: 'Liam Webb',    init:'LW', pos:'Loosehead',streak: 12, load: 982, badges: ['Engine'] },
    { name: 'Sione Toa',    init:'ST', pos:'Lock',     streak: 19, load: 1020, badges: ['Iron Streak','100 Pull-ups'] },
    { name: 'Marcus Reid',  init:'MR', pos:'Openside', streak:  9, load: 905, badges: [] },
    { name: 'Theo Lacroix', init:'TL', pos:'Fly-half', streak: 22, load: 740, badges: ['Sniper'] },
    { name: 'Jay Patel',    init:'JP', pos:'Centre',   streak: 14, load: 880, badges: ['PB Week'] },
    { name: 'Eli Brookes',  init:'EB', pos:'Wing',     streak: 16, load: 695, badges: ['Speedster'] },
    { name: 'Cam Yates',    init:'CY', pos:'Scrum-half',streak: 18, load: 770, badges: [] },
    { name: 'Niko Vaha',    init:'NV', pos:'Hooker',   streak: 11, load: 945, badges: ['Iron Streak'] },
  ];

  const FEED = [
    { who:'Sione Toa', init:'ST', when:'2h ago', text:'New back squat PB — 195kg x 2. Bar speed felt sharp.', meta:['PB','Forwards lift'] },
    { who:'Coach Hannah', init:'CH', when:'5h ago', text:'Forwards — keep neck volume up this week. Backs — focus on max velocity Wednesday.', meta:['Coach note'] },
    { who:'Eli Brookes', init:'EB', when:'Yesterday', text:'Hit 10.1m/s max velocity in flying 30m run. Felt easy.', meta:['Speed','Backs'] },
    { who:'Owen Carter', init:'OC', when:'Yesterday', text:'17 days no missed session. Bring it on Saturday.', meta:['Streak'] },
    { who:'Theo Lacroix', init:'TL', when:'2d ago', text:'Kicking block done. 40 from 45 — distance up too.', meta:['Skills'] },
  ];

  const CHALLENGES = [
    { name:'100 Chin-ups Week',  prog: 64, target: 100, unit: 'reps', joined: true,  ends: 'Sun' },
    { name:'10km Aerobic Block', prog: 6.4, target: 10,  unit: 'km',   joined: true,  ends: 'Sun' },
    { name:'Neck Strong May',    prog: 11,  target: 20,  unit: 'sessions', joined: false, ends: '31 May' },
  ];

  /* ============================================================
     Nav definition (used by both sidebar + bottom nav)
     ============================================================ */
  const NAV = [
    { id:'dashboard',   label:'Dashboard',   group:'Train', icon:'home',        crumb:'Overview' },
    { id:'program',     label:'Program',     group:'Train', icon:'calendar',    crumb:'Training program' },
    { id:'session',     label:'Session',     group:'Train', icon:'play',        crumb:'Live session' },
    { id:'analytics',   label:'Analytics',   group:'Insights', icon:'chart',     crumb:'Performance analytics' },
    { id:'recovery',    label:'Recovery',    group:'Insights', icon:'heart',     crumb:'Recovery & wellness' },
    { id:'nutrition',   label:'Nutrition',   group:'Insights', icon:'fuel',      crumb:'Nutrition' },
    { id:'menu',        label:'Menu',        group:'Insights', icon:'menu',      crumb:'Food menu' },
    { id:'position',    label:'Position',    group:'Rugby',    icon:'pitch',     crumb:'Position tools' },
    { id:'matchprep',   label:'Match Prep',  group:'Rugby',    icon:'whistle',   crumb:'Match prep' },
    { id:'rehab',       label:'Rehab',       group:'Rugby',    icon:'plus',      crumb:'Rehab & prehab' },
    { id:'community',   label:'Community',   group:'Squad',    icon:'users',     crumb:'Community' },
    { id:'profile',     label:'Profile',     group:'Squad',    icon:'user',      crumb:'Athlete profile' },
  ];

  /* ============================================================
     EXERCISE DATABASE
     ~70 exercises across categories & patterns, equipment-tagged.
     ============================================================ */
  const EXERCISES = [
    // ── SQUAT pattern ──
    { id:'back-squat',        name:'Back squat',                 cat:'strength', pattern:'squat-bi',  equip:['barbell','rack'],         muscles:['quads','glutes','core'],   cues:['Brace before descent','Knees track over toes','Full depth'], intensity:'high'   },
    { id:'front-squat',       name:'Front squat',                cat:'strength', pattern:'squat-bi',  equip:['barbell','rack'],         muscles:['quads','core'],            cues:['Elbows high','Stay upright','Big breath at top'],             intensity:'high'   },
    { id:'safety-bar-squat',  name:'Safety bar squat',           cat:'strength', pattern:'squat-bi',  equip:['barbell','rack'],         muscles:['quads','glutes'],          cues:['Upright torso','Engage upper back'],                          intensity:'high'   },
    { id:'box-squat',         name:'Box squat',                  cat:'strength', pattern:'squat-bi',  equip:['barbell','rack','bench'], muscles:['quads','glutes','hams'],   cues:['Pause on box','Stay tight','Push the floor away'],            intensity:'high'   },
    { id:'goblet-squat',      name:'Goblet squat',               cat:'strength', pattern:'squat-bi',  equip:['dumbbell','kettlebell'],  muscles:['quads','glutes'],          cues:['Hold close to chest','Elbows inside knees'],                  intensity:'medium' },
    { id:'bw-squat',          name:'Bodyweight squat',           cat:'strength', pattern:'squat-bi',  equip:['bodyweight'],             muscles:['quads','glutes'],          cues:['Slow eccentric','Pause at bottom'],                            intensity:'low'    },
    { id:'bulgarian-split',   name:'Bulgarian split squat',      cat:'strength', pattern:'squat-uni', equip:['dumbbell','bench'],       muscles:['quads','glutes'],          cues:['Front foot ~1m from bench','Drop straight down'],             intensity:'medium' },
    { id:'reverse-lunge',     name:'Reverse lunge',              cat:'strength', pattern:'squat-uni', equip:['dumbbell','bodyweight'],  muscles:['quads','glutes'],          cues:['Long step back','Vertical front shin'],                       intensity:'medium' },
    { id:'walking-lunge',     name:'Walking lunge',              cat:'strength', pattern:'squat-uni', equip:['dumbbell','bodyweight'],  muscles:['quads','glutes'],          cues:['Long stride','Knee tap floor'],                                intensity:'medium' },
    { id:'step-up',           name:'Step-up',                    cat:'strength', pattern:'squat-uni', equip:['plyo-box','dumbbell'],    muscles:['quads','glutes'],          cues:['Drive through heel','No push-off from back leg'],             intensity:'medium' },

    // ── HINGE pattern ──
    { id:'trap-bar-dl',       name:'Trap bar deadlift',          cat:'strength', pattern:'hinge-bi',  equip:['trap-bar'],               muscles:['hams','glutes','back'],    cues:['Lats tight','Push the floor away'],                            intensity:'high'   },
    { id:'conventional-dl',   name:'Conventional deadlift',      cat:'strength', pattern:'hinge-bi',  equip:['barbell'],                muscles:['hams','glutes','back'],    cues:['Bar over mid-foot','Hips & shoulders rise together'],         intensity:'high'   },
    { id:'sumo-dl',           name:'Sumo deadlift',              cat:'strength', pattern:'hinge-bi',  equip:['barbell'],                muscles:['glutes','quads','back'],   cues:['Wide stance','Knees out'],                                     intensity:'high'   },
    { id:'romanian-dl',       name:'Romanian deadlift',          cat:'strength', pattern:'hinge-bi',  equip:['barbell'],                muscles:['hams','glutes'],           cues:['Soft knees','Push hips back'],                                 intensity:'high'   },
    { id:'db-rdl',            name:'Dumbbell RDL',               cat:'strength', pattern:'hinge-bi',  equip:['dumbbell'],               muscles:['hams','glutes'],           cues:['Hinge from hips','Bar close to legs'],                        intensity:'medium' },
    { id:'sl-rdl',            name:'Single-leg RDL',             cat:'strength', pattern:'hinge-uni', equip:['dumbbell','kettlebell','bodyweight'], muscles:['hams','glutes','core'], cues:['Hips square','Reach to floor'],                              intensity:'medium' },
    { id:'hip-thrust',        name:'Hip thrust',                 cat:'strength', pattern:'hinge-bi',  equip:['barbell','bench'],        muscles:['glutes','hams'],           cues:['Pause at top','Chin tucked'],                                  intensity:'medium' },
    { id:'good-morning',      name:'Good morning',               cat:'strength', pattern:'hinge-bi',  equip:['barbell','rack'],         muscles:['hams','back'],             cues:['Soft knees','Hinge from hips'],                                intensity:'medium' },
    { id:'kb-swing',          name:'Kettlebell swing',           cat:'power',    pattern:'hinge-bi',  equip:['kettlebell'],             muscles:['hams','glutes','core'],    cues:['Snap hips','Don\'t squat the swing'],                          intensity:'medium' },
    { id:'glute-ham-raise',   name:'Glute-ham raise',            cat:'strength', pattern:'hinge-uni', equip:['ghr-bench'],              muscles:['hams','glutes'],           cues:['Slow eccentric','Squeeze glutes'],                            intensity:'high'   },

    // ── PUSH horizontal ──
    { id:'bench-press',       name:'Bench press',                cat:'strength', pattern:'push-h',    equip:['barbell','bench','rack'], muscles:['chest','triceps','shoulders'], cues:['Leg drive','Bar to lower sternum'],                       intensity:'high'   },
    { id:'incline-bench',     name:'Incline bench press',        cat:'strength', pattern:'push-h',    equip:['barbell','bench','rack'], muscles:['upper chest','shoulders'], cues:['30° incline','Bar to upper chest'],                            intensity:'high'   },
    { id:'db-bench',          name:'Dumbbell bench press',       cat:'strength', pattern:'push-h',    equip:['dumbbell','bench'],       muscles:['chest','triceps'],         cues:['Arc the path','Control eccentric'],                            intensity:'medium' },
    { id:'pushup',            name:'Push-up',                    cat:'strength', pattern:'push-h',    equip:['bodyweight'],             muscles:['chest','triceps','core'],  cues:['Body in straight line','Touch chest to floor'],                intensity:'low'    },
    { id:'deficit-pushup',    name:'Deficit push-up',            cat:'strength', pattern:'push-h',    equip:['bodyweight','plyo-box'],  muscles:['chest','triceps'],         cues:['Stretch at bottom','Full lockout top'],                        intensity:'medium' },
    { id:'floor-press',       name:'Floor press',                cat:'strength', pattern:'push-h',    equip:['dumbbell','barbell'],     muscles:['chest','triceps'],         cues:['Elbows to floor','Pause briefly'],                             intensity:'medium' },

    // ── PUSH vertical ──
    { id:'overhead-press',    name:'Overhead press',             cat:'strength', pattern:'push-v',    equip:['barbell'],                muscles:['shoulders','triceps'],     cues:['Ribs down','Push through the bar'],                            intensity:'high'   },
    { id:'push-press',        name:'Push press',                 cat:'power',    pattern:'push-v',    equip:['barbell'],                muscles:['shoulders','legs'],        cues:['Quarter dip','Drive aggressively'],                            intensity:'high'   },
    { id:'db-shoulder-press', name:'Dumbbell shoulder press',    cat:'strength', pattern:'push-v',    equip:['dumbbell'],               muscles:['shoulders'],               cues:['Neutral grip','Pause at lockout'],                             intensity:'medium' },
    { id:'pike-pushup',       name:'Pike push-up',               cat:'strength', pattern:'push-v',    equip:['bodyweight'],             muscles:['shoulders'],               cues:['Hips high','Press head to floor'],                             intensity:'medium' },
    { id:'landmine-press',    name:'Landmine press',             cat:'strength', pattern:'push-v',    equip:['barbell','landmine'],     muscles:['shoulders','core'],        cues:['Stagger stance','Drive up & across'],                          intensity:'medium' },

    // ── PULL vertical ──
    { id:'chinup',            name:'Chin-ups',                   cat:'strength', pattern:'pull-v',    equip:['pull-up-bar'],            muscles:['back','biceps'],           cues:['Full ROM','Pause at chin'],                                    intensity:'high'   },
    { id:'pullup',            name:'Pull-ups',                   cat:'strength', pattern:'pull-v',    equip:['pull-up-bar'],            muscles:['back','biceps'],           cues:['Pronated grip','Initiate from scapula'],                       intensity:'high'   },
    { id:'lat-pulldown',      name:'Lat pulldown',               cat:'strength', pattern:'pull-v',    equip:['cable','machine'],        muscles:['back'],                    cues:['Drive elbows down','Lean back slightly'],                      intensity:'medium' },
    { id:'band-pulldown',     name:'Band pulldown',              cat:'strength', pattern:'pull-v',    equip:['band'],                   muscles:['back'],                    cues:['Steady tension','Full range'],                                 intensity:'low'    },
    { id:'assisted-pullup',   name:'Assisted pull-up',           cat:'strength', pattern:'pull-v',    equip:['pull-up-bar','band'],     muscles:['back','biceps'],           cues:['Band under foot or knees','Full ROM'],                         intensity:'low'    },

    // ── PULL horizontal ──
    { id:'bb-row',            name:'Barbell row',                cat:'strength', pattern:'pull-h',    equip:['barbell'],                muscles:['back'],                    cues:['Hinged torso','Pull to lower chest'],                          intensity:'high'   },
    { id:'db-row',            name:'Single-arm DB row',          cat:'strength', pattern:'pull-h',    equip:['dumbbell','bench'],       muscles:['back'],                    cues:['No rotation','Pull to hip'],                                   intensity:'medium' },
    { id:'inverted-row',      name:'Inverted row',               cat:'strength', pattern:'pull-h',    equip:['barbell','rack','bodyweight'], muscles:['back'],               cues:['Body straight','Pull chest to bar'],                           intensity:'medium' },
    { id:'cable-row',         name:'Seated cable row',           cat:'strength', pattern:'pull-h',    equip:['cable','machine'],        muscles:['back'],                    cues:['Squeeze shoulder blades','Don\'t lean back'],                  intensity:'medium' },
    { id:'band-row',          name:'Band row',                   cat:'strength', pattern:'pull-h',    equip:['band'],                   muscles:['back'],                    cues:['Steady pull','Squeeze blades'],                                intensity:'low'    },

    // ── POWER / OLYMPIC ──
    { id:'hang-clean',        name:'Hang clean',                 cat:'power',    pattern:'olympic',   equip:['barbell'],                muscles:['full body'],               cues:['Aggressive triple extension','Catch in quarter squat'],        intensity:'high'   },
    { id:'power-clean',       name:'Power clean',                cat:'power',    pattern:'olympic',   equip:['barbell'],                muscles:['full body'],               cues:['Patient first pull','Snap at hips'],                           intensity:'high'   },
    { id:'db-snatch',         name:'DB snatch',                  cat:'power',    pattern:'olympic',   equip:['dumbbell'],               muscles:['full body'],               cues:['Drive through hips','Punch overhead'],                         intensity:'high'   },
    { id:'mb-slam',           name:'Med-ball slam',              cat:'power',    pattern:'throw',     equip:['medball'],                muscles:['core','shoulders'],        cues:['Full overhead extension','Aggressive throw'],                  intensity:'medium' },
    { id:'mb-chest-pass',     name:'Med-ball chest pass',        cat:'power',    pattern:'throw',     equip:['medball'],                muscles:['chest','core'],            cues:['Quick release','Power from hips'],                             intensity:'medium' },
    { id:'mb-rotational',     name:'Med-ball rotational throw',  cat:'power',    pattern:'throw',     equip:['medball'],                muscles:['core'],                    cues:['Hips lead','Throw against wall'],                              intensity:'medium' },

    // ── JUMPS ──
    { id:'box-jump',          name:'Box jump',                   cat:'power',    pattern:'jump',      equip:['plyo-box'],               muscles:['legs'],                    cues:['Soft landing','Step down'],                                    intensity:'medium' },
    { id:'broad-jump',        name:'Broad jump',                 cat:'power',    pattern:'jump',      equip:['bodyweight'],             muscles:['legs'],                    cues:['Arm swing','Stick the landing'],                               intensity:'medium' },
    { id:'drop-jump',         name:'Drop jump',                  cat:'power',    pattern:'jump',      equip:['plyo-box'],               muscles:['legs'],                    cues:['Minimal contact time','Stiff ankles'],                         intensity:'high'   },
    { id:'pogo-hop',          name:'Pogo hop',                   cat:'power',    pattern:'jump',      equip:['bodyweight'],             muscles:['calves'],                  cues:['Stiff ankles','Bounce on balls of feet'],                      intensity:'low'    },
    { id:'hurdle-hop',        name:'Hurdle hops',                cat:'power',    pattern:'jump',      equip:['hurdle'],                 muscles:['legs'],                    cues:['Reactive','Minimal ground time'],                              intensity:'medium' },
    { id:'depth-jump',        name:'Depth jump',                 cat:'power',    pattern:'jump',      equip:['plyo-box'],               muscles:['legs'],                    cues:['Step off, don\'t jump off','Re-bound fast'],                   intensity:'high'   },

    // ── SPEED / DRILLS ──
    { id:'sprint-10m',        name:'10m acceleration',           cat:'speed',    pattern:'sprint',    equip:['bodyweight'],             muscles:['legs'],                    cues:['Drive shins','Punch arms'],                                    intensity:'high'   },
    { id:'sprint-20m-flying', name:'20m flying sprint',          cat:'speed',    pattern:'sprint',    equip:['bodyweight'],             muscles:['legs'],                    cues:['Tall posture','Front-side mechanics'],                         intensity:'high'   },
    { id:'sprint-40m',        name:'40m sprint',                 cat:'speed',    pattern:'sprint',    equip:['bodyweight'],             muscles:['legs'],                    cues:['Build acceleration','Hold form at top end'],                   intensity:'high'   },
    { id:'sled-push',         name:'Sled push (light)',          cat:'power',    pattern:'sprint',    equip:['sled'],                   muscles:['legs'],                    cues:['Low body angle','Punchy steps'],                               intensity:'high'   },
    { id:'sled-drive',        name:'Heavy sled drive',           cat:'strength', pattern:'sprint',    equip:['sled'],                   muscles:['legs','glutes'],           cues:['Drive through bar','Maintain forward lean'],                   intensity:'high'   },
    { id:'a-skip',            name:'A-skips',                    cat:'speed',    pattern:'drill',     equip:['bodyweight'],             muscles:['legs'],                    cues:['Knee to 90°','Toe up'],                                        intensity:'low'    },
    { id:'b-skip',            name:'B-skips',                    cat:'speed',    pattern:'drill',     equip:['bodyweight'],             muscles:['legs'],                    cues:['Paw the ground','Active leg cycle'],                           intensity:'low'    },
    { id:'wall-drill',        name:'Wall acceleration drill',    cat:'speed',    pattern:'drill',     equip:['bodyweight'],             muscles:['legs'],                    cues:['45° body angle','Drive knee up'],                              intensity:'low'    },
    { id:'agility-505',       name:'505 agility test',           cat:'speed',    pattern:'agility',   equip:['bodyweight'],             muscles:['legs'],                    cues:['Plant outside foot','Stay low'],                               intensity:'high'   },

    // ── CONDITIONING ──
    { id:'bronco',            name:'Bronco test',                cat:'conditioning', pattern:'aerobic',     equip:['bodyweight'],         muscles:['full body'],           cues:['Pace strategy','Survive'],                                     intensity:'max'    },
    { id:'yoyo',              name:'Yo-Yo IR1',                  cat:'conditioning', pattern:'aerobic',     equip:['bodyweight'],         muscles:['full body'],           cues:['Stay relaxed at start','Push when tone speeds'],               intensity:'max'    },
    { id:'repeat-40m',        name:'Repeat 40m efforts',         cat:'conditioning', pattern:'repeat-sprint', equip:['bodyweight'],       muscles:['legs'],                cues:['~90% intent','Same speed each rep'],                           intensity:'high'   },
    { id:'bike-intervals',    name:'Bike intervals',             cat:'conditioning', pattern:'aerobic',     equip:['bike'],               muscles:['legs'],                cues:['Even cadence','Push the last 10s'],                            intensity:'medium' },
    { id:'rower-2k',          name:'2k row',                     cat:'conditioning', pattern:'aerobic',     equip:['rower'],              muscles:['full body'],           cues:['Long stroke','Consistent split'],                              intensity:'high'   },
    { id:'assault-bike',      name:'Assault bike intervals',     cat:'conditioning', pattern:'aerobic',     equip:['bike'],               muscles:['full body'],           cues:['Drive arms & legs','Steady cadence'],                          intensity:'high'   },
    { id:'easy-bike',         name:'Easy bike Zone 2',           cat:'conditioning', pattern:'aerobic',     equip:['bike'],               muscles:['legs'],                cues:['Nasal breathing','Conversational pace'],                       intensity:'low'    },
    { id:'shuttle-run',       name:'Shuttle runs',               cat:'conditioning', pattern:'repeat-sprint', equip:['bodyweight'],       muscles:['legs'],                cues:['Sharp turns','Steady pace'],                                   intensity:'high'   },

    // ── MOBILITY ──
    { id:'foam-roll',         name:'Foam roll glutes/quads/calves', cat:'mobility', pattern:'recovery', equip:['foam-roller'],          muscles:['legs'],                  cues:['Slow passes','Pause on tight spots'],                          intensity:'low'    },
    { id:'hip-9090',          name:'Hip 90/90 flow',             cat:'mobility', pattern:'flow',      equip:['bodyweight'],             muscles:['hips'],                    cues:['Controlled','Full ROM'],                                       intensity:'low'    },
    { id:'thoracic-opener',   name:'Thoracic openers',           cat:'mobility', pattern:'flow',      equip:['bodyweight'],             muscles:['t-spine'],                 cues:['Reach across','Pause at end range'],                           intensity:'low'    },
    { id:'cossack-squat',     name:'Cossack squat',              cat:'mobility', pattern:'flow',      equip:['bodyweight'],             muscles:['adductors','hips'],        cues:['Heel down','Active foot'],                                     intensity:'low'    },
    { id:'world-greatest',    name:'World\'s greatest stretch',  cat:'mobility', pattern:'flow',      equip:['bodyweight'],             muscles:['full body'],               cues:['Slow & deep','Breathe through it'],                            intensity:'low'    },
    { id:'pool-walk',         name:'Pool walk / contrast',       cat:'mobility', pattern:'recovery',  equip:['pool'],                   muscles:['full body'],               cues:['Easy pace','Alternate hot/cold'],                              intensity:'low'    },

    // ── PREHAB / ACTIVATION ──
    { id:'nordic-curl',       name:'Nordic curls',               cat:'prehab',   pattern:'hinge-uni', equip:['bodyweight'],             muscles:['hams'],                    cues:['Slow eccentric, 4s','Tuck arms in'],                           intensity:'high'   },
    { id:'copenhagen-plank',  name:'Copenhagen plank',           cat:'prehab',   pattern:'brace',     equip:['bodyweight','bench'],     muscles:['adductors','core'],        cues:['Foot on bench','Pull leg into bench'],                         intensity:'medium' },
    { id:'banded-glute',      name:'Banded glute series',        cat:'prehab',   pattern:'activation', equip:['band'],                  muscles:['glutes'],                  cues:['Slow, controlled','Squeeze at top'],                           intensity:'low'    },
    { id:'ytw-raise',         name:'YTW raises',                 cat:'prehab',   pattern:'pull-v',    equip:['dumbbell','bench'],       muscles:['rear delts','traps'],      cues:['Light weight','Pause at top'],                                 intensity:'low'    },
    { id:'face-pull',         name:'Face pulls',                 cat:'prehab',   pattern:'pull-h',    equip:['cable','band'],           muscles:['rear delts'],              cues:['High elbows','Pull to forehead'],                              intensity:'low'    },
    { id:'neck-harness',      name:'Neck harness work',          cat:'prehab',   pattern:'brace',     equip:['neck-harness'],           muscles:['neck'],                    cues:['Slow tempo','Hold 1s at end range'],                           intensity:'medium' },
    { id:'iso-neck-hold',     name:'Iso neck holds',             cat:'prehab',   pattern:'brace',     equip:['bodyweight'],             muscles:['neck'],                    cues:['Hand resistance','20s per direction'],                         intensity:'low'    },
    { id:'pallof-press',      name:'Pallof press',               cat:'prehab',   pattern:'anti-rotation', equip:['cable','band'],       muscles:['core'],                    cues:['Resist rotation','Full arm extension'],                        intensity:'low'    },
    { id:'tib-raise',         name:'Tibialis raises',            cat:'prehab',   pattern:'activation', equip:['bodyweight','band'],     muscles:['calves'],                  cues:['Pull toes up','Slow tempo'],                                   intensity:'low'    },
    { id:'calf-raise',        name:'Heel raises (calf bias)',    cat:'prehab',   pattern:'activation', equip:['bodyweight','dumbbell'], muscles:['calves'],                  cues:['Full ROM','Pause at top'],                                     intensity:'low'    },
    { id:'sl-balance',        name:'Single-leg balance',         cat:'prehab',   pattern:'activation', equip:['bodyweight'],            muscles:['ankle','core'],            cues:['Soft knee','Eyes closed if able'],                             intensity:'low'    },

    // ── CARRIES / LOCOMOTION ──
    { id:'farmer-carry',      name:"Farmer's carry",             cat:'strength', pattern:'carry',     equip:['dumbbell','kettlebell'],  muscles:['grip','core','traps'],     cues:['Tall posture','Even pace'],                                    intensity:'medium' },
    { id:'bottoms-up-kb',     name:'Bottoms-up KB carry',        cat:'prehab',   pattern:'carry',     equip:['kettlebell'],             muscles:['shoulder','grip'],         cues:['Hand vertical','Steady'],                                      intensity:'low'    },
    { id:'bear-crawl',        name:'Bear crawl',                 cat:'conditioning', pattern:'locomotion', equip:['bodyweight'],        muscles:['core','shoulders'],        cues:['Knees hovering','Opposite hand/foot'],                         intensity:'medium' },

    // ── SKILL / CONTACT ──
    { id:'bag-tackle',        name:'Bag tackle technique',       cat:'skill',    pattern:'contact',   equip:['tackle-bag'],             muscles:['full body'],               cues:['Cheek to cheek','Chop & lift'],                                intensity:'medium' },
    { id:'wrestling',         name:'Wrestling rounds',           cat:'skill',    pattern:'contact',   equip:['mat'],                    muscles:['full body'],               cues:['Stay engaged','Drive through hips'],                           intensity:'high'   },
    { id:'lineout-jump',      name:'Lineout jump practice',      cat:'skill',    pattern:'jump',      equip:['bodyweight'],             muscles:['legs','core'],             cues:['Quick step','Reach high'],                                     intensity:'low'    },
    { id:'passing-drill',     name:'Pass + catch calibration',   cat:'skill',    pattern:'rugby',     equip:['rugby-ball'],             muscles:['full body'],               cues:['Hands ready','Soft catch'],                                    intensity:'low'    },
    { id:'kicking-practice',  name:'Goal kicking',               cat:'skill',    pattern:'rugby',     equip:['rugby-ball'],             muscles:['legs'],                    cues:['Plant foot','Smooth swing'],                                   intensity:'low'    },
    { id:'box-kick',          name:'Box kicks',                  cat:'skill',    pattern:'rugby',     equip:['rugby-ball'],             muscles:['legs'],                    cues:['High contact point','Stable plant'],                           intensity:'low'    },
    { id:'spiral-pass',       name:'Spiral passing',             cat:'skill',    pattern:'rugby',     equip:['rugby-ball'],             muscles:['core'],                    cues:['Wrist snap','Follow through'],                                 intensity:'low'    },
  ];

  function exById(id) { return EXERCISES.find(e => e.id === id); }

  /* ============================================================
     EQUIPMENT TIERS by gym-access level
     ============================================================ */
  const EQUIPMENT_TIERS = {
    full:    ['barbell','trap-bar','dumbbell','kettlebell','cable','machine','sled','band','bodyweight','plyo-box','medball','bench','rack','pull-up-bar','neck-harness','foam-roller','hurdle','bike','rower','tackle-bag','mat','rugby-ball','ghr-bench','landmine','pool'],
    limited: ['barbell','dumbbell','kettlebell','bodyweight','band','plyo-box','medball','bench','rack','pull-up-bar','foam-roller','bike','rower','rugby-ball'],
    home:    ['dumbbell','kettlebell','bodyweight','band','foam-roller','rugby-ball'],
  };

  function isExAvailable(ex, gymAccess) {
    const allowed = new Set(EQUIPMENT_TIERS[gymAccess] || EQUIPMENT_TIERS.full);
    return ex.equip.every(eq => allowed.has(eq));
  }

  function getSubstitutions(exId, gymAccess) {
    const target = exById(exId);
    if (!target) return [];
    return EXERCISES.filter(x =>
      x.id !== exId &&
      x.cat === target.cat &&
      x.pattern === target.pattern &&
      isExAvailable(x, gymAccess)
    );
  }

  /* ============================================================
     PROGRAM TEMPLATES — by phase
     Each template defines days, blocks, and exercise ids + targets.
     ============================================================ */

  // shorthand: { id, sets, reps, rest, rpe?, tempo?, note? }
  const _ = (id, sets, reps, rest, extra={}) => Object.assign({ id, sets, reps, rest }, extra);

  const PROGRAM_TEMPLATES = {
    'in-season': [
      { day:'Mon', label:'MD-5', focus:'Recovery + Mobility', type:'recovery', blocks:[
          { name:'Soft tissue & mobility', items:[
            _('foam-roll', 1, '6 min', '—'),
            _('hip-9090',  2, '6/side', '0', { tempo:'controlled' }),
            _('thoracic-opener', 2, '8/side', '0', { tempo:'3s pause' }),
          ]},
          { name:'Pool / spin', items:[ _('easy-bike', 1, '20 min', '—', { note:'Z1' }) ]},
        ], cues:['Keep HR < 130','No collision exposure','Top up hydration'] },
      { day:'Tue', label:'MD-4', focus:'Heavy Lower + Push', type:'strength', blocks:[
          { name:'Power primer',  items:[ _('hurdle-hop', 3, '5', '60s', { note:'reactive' }) ]},
          { name:'Main strength', items:[
            _('trap-bar-dl', 4, '4', '180s', { rpe:8, tempo:'2-0-X-0' }),
            _('front-squat', 4, '5', '150s', { rpe:7.5, tempo:'3-0-1-0' }),
            _('bench-press', 4, '6', '120s', { rpe:8, tempo:'2-1-X-0' }),
          ]},
          { name:'Accessory', items:[
            _('bulgarian-split', 3, '8/side', '90s', { rpe:8, tempo:'2-0-X-0' }),
            _('chinup',          3, 'AMRAP-2', '90s'),
            _('neck-harness',    3, '10/dir', '60s', { note:'Slow tempo' }),
          ]},
          { name:'Finisher', items:[ _('pallof-press', 3, '10/side', '45s') ]},
        ], cues:['Quality > volume','Cap RPE at 8 — match week'] },
      { day:'Wed', label:'MD-3', focus:'Power + Speed Exposure', type:'speed', blocks:[
          { name:'Activation', items:[
            _('a-skip', 2, '20m', '30s'),
            _('banded-glute', 2, '10/dir', '20s'),
          ]},
          { name:'Sprint', items:[
            _('sprint-10m',        4, '1', '90s'),
            _('sprint-20m-flying', 3, '1', '180s'),
          ]},
          { name:'Power lifts', items:[
            _('hang-clean',    4, '3', '150s', { rpe:7 }),
            _('mb-chest-pass', 3, '6', '60s'),
          ]},
          { name:'Contact prep', items:[ _('bag-tackle', 3, '6', '90s') ]},
        ], cues:['Full recovery between sprints','No max-effort PB today'] },
      { day:'Thu', label:'MD-2', focus:'Team + Conditioning Top-up', type:'team', blocks:[
          { name:'Team unit', items:[ _('lineout-jump', 1, '40 min', '—') ]},
          { name:'Conditioning', items:[ _('repeat-40m', 6, '1', '45s', { note:'~90% intent' }) ]},
          { name:'Cool-down', items:[ _('hip-9090', 1, '10 min', '—') ]},
        ], cues:['Submaximal day','Keep total load < 350'] },
      { day:'Fri', label:'MD-1', focus:"Captain's Run + Activation", type:'activation', blocks:[
          { name:'Activation', items:[
            _('pogo-hop',  3, '3 jumps', '45s'),
            _('sled-drive', 4, '10m', '90s', { note:'Punchy short steps' }),
          ]},
          { name:'Skills', items:[ _('passing-drill', 1, '20 min', '—') ]},
        ], cues:['Sharp & short','Hydration check','Sleep ≥ 8h'] },
      { day:'Sat', label:'MD', focus:'Match Day', type:'match', blocks:[
          { name:'Match', items:[
            _('passing-drill', 1, '25 min', '—', { note:'Match warm-up protocol' }),
            _('kicking-practice', 1, '—', '—', { note:'Match itself — 70+ min target' }),
          ]},
        ], cues:['Trust the prep','Communicate early in collisions','Refuel within 30 min'] },
      { day:'Sun', label:'MD+1', focus:'Active Recovery', type:'recovery', blocks:[
          { name:'Recovery', items:[
            _('pool-walk', 1, '20 min', '—'),
            _('hip-9090',  1, '15 min', '—'),
          ]},
        ], cues:['Bruise check','Symptom report by 18:00'] },
    ],

    'pre-season': [
      { day:'Mon', focus:'Strength A — Lower Heavy', type:'strength', blocks:[
          { name:'Activation', items:[ _('banded-glute', 2, '10/dir', '20s'), _('a-skip', 2, '20m', '30s') ]},
          { name:'Main',       items:[
            _('back-squat',   5, '4', '180s', { rpe:8 }),
            _('trap-bar-dl',  4, '3', '180s', { rpe:8 }),
          ]},
          { name:'Accessory',  items:[
            _('walking-lunge', 3, '10/side', '90s'),
            _('nordic-curl',   3, '5',       '90s', { note:'Slow eccentric' }),
            _('pallof-press',  3, '10/side', '45s'),
          ]},
        ], cues:['Earn the weight','Quality reps'] },
      { day:'Tue', focus:'Speed + Power', type:'speed', blocks:[
          { name:'Activation', items:[ _('wall-drill', 3, '5/side', '45s'), _('pogo-hop', 3, '8', '45s') ]},
          { name:'Sprint',     items:[ _('sprint-10m', 6, '1', '90s'), _('sprint-40m', 4, '1', '180s') ]},
          { name:'Power',      items:[ _('hang-clean', 5, '3', '150s', { rpe:7 }), _('broad-jump', 4, '3', '90s') ]},
        ], cues:['Full recovery between sprints'] },
      { day:'Wed', focus:'Conditioning + Skill', type:'conditioning', blocks:[
          { name:'Conditioning', items:[ _('bronco', 1, '—', '—', { note:'Bronco test' }) ]},
          { name:'Skill',        items:[ _('passing-drill', 1, '20 min', '—') ]},
        ], cues:['Pace the bronco','Aerobic build'] },
      { day:'Thu', focus:'Strength B — Upper Heavy', type:'strength', blocks:[
          { name:'Main',      items:[
            _('bench-press',  5, '4', '180s', { rpe:8 }),
            _('chinup',       4, '6', '120s', { rpe:8 }),
            _('overhead-press', 4, '5', '120s', { rpe:7.5 }),
          ]},
          { name:'Accessory', items:[
            _('db-row',      3, '8/side', '90s'),
            _('face-pull',   3, '12',     '60s'),
            _('neck-harness',3, '10/dir', '60s'),
          ]},
        ], cues:['Build pull volume'] },
      { day:'Fri', focus:'Power + Contact', type:'speed', blocks:[
          { name:'Power',  items:[ _('power-clean', 5, '2', '180s', { rpe:7.5 }), _('box-jump', 4, '3', '90s') ]},
          { name:'Contact', items:[ _('bag-tackle', 4, '6', '90s'), _('wrestling', 3, '60s', '90s') ]},
        ], cues:['Sharp contact prep','Stay technical when tired'] },
      { day:'Sat', focus:'Repeat Efforts', type:'conditioning', blocks:[
          { name:'Conditioning', items:[ _('repeat-40m', 8, '1', '45s'), _('sled-push', 4, '20m', '90s') ]},
        ], cues:['Replicate match demands'] },
      { day:'Sun', focus:'Recovery', type:'recovery', blocks:[
          { name:'Recovery', items:[ _('foam-roll', 1, '10 min', '—'), _('hip-9090', 1, '10 min', '—'), _('easy-bike', 1, '20 min', '—', { note:'Z1' }) ]},
        ], cues:['Earn next week'] },
    ],

    'off-season': [
      { day:'Mon', focus:'Strength A — Full Body', type:'strength', blocks:[
          { name:'Main',      items:[
            _('back-squat',  4, '6', '150s', { rpe:7 }),
            _('bench-press', 4, '6', '120s', { rpe:7 }),
            _('bb-row',      4, '8', '120s', { rpe:7 }),
          ]},
          { name:'Accessory', items:[
            _('sl-rdl',      3, '8/side', '60s'),
            _('chinup',      3, 'AMRAP-2', '90s'),
            _('pallof-press',3, '10/side', '45s'),
          ]},
        ], cues:['Build capacity','RPE 7 cap'] },
      { day:'Tue', focus:'Conditioning — Zone 2', type:'conditioning', blocks:[
          { name:'Aerobic', items:[ _('easy-bike', 1, '40 min', '—', { note:'Zone 2' }) ]},
          { name:'Mobility', items:[ _('hip-9090', 1, '10 min', '—') ]},
        ], cues:['Conversational pace'] },
      { day:'Wed', focus:'Active Recovery / Mobility', type:'recovery', blocks:[
          { name:'Mobility', items:[
            _('foam-roll',       1, '8 min',  '—'),
            _('world-greatest',  2, '5/side', '0'),
            _('cossack-squat',   3, '6/side', '0'),
          ]},
        ], cues:['Quality over quantity'] },
      { day:'Thu', focus:'Strength B — Full Body', type:'strength', blocks:[
          { name:'Main',      items:[
            _('trap-bar-dl',     4, '5', '150s', { rpe:7 }),
            _('db-shoulder-press', 4, '8', '90s', { rpe:7 }),
            _('cable-row',       4, '10', '90s', { rpe:7 }),
          ]},
          { name:'Accessory', items:[
            _('bulgarian-split', 3, '8/side', '90s'),
            _('farmer-carry',    3, '30m',    '90s'),
            _('nordic-curl',     3, '5',      '90s'),
          ]},
        ], cues:['Build pull & posterior chain'] },
      { day:'Fri', focus:'Power + Speed Exposure', type:'speed', blocks:[
          { name:'Activation', items:[ _('a-skip', 2, '20m', '30s'), _('pogo-hop', 2, '10', '30s') ]},
          { name:'Speed',      items:[ _('sprint-20m-flying', 3, '1', '180s'), _('sprint-40m', 3, '1', '180s') ]},
          { name:'Power',      items:[ _('hang-clean', 3, '3', '150s', { rpe:6.5 }), _('broad-jump', 3, '3', '60s') ]},
        ], cues:['Stay sharp without overload'] },
      { day:'Sat', focus:'Optional — Skills', type:'skill', blocks:[
          { name:'Skills', items:[ _('passing-drill', 1, '20 min', '—'), _('kicking-practice', 1, '15 min', '—') ]},
        ], cues:['Touch the ball'] },
      { day:'Sun', focus:'Off / Rest', type:'rest', blocks:[
          { name:'Rest', items:[ _('foam-roll', 1, '5 min', '—', { note:'Optional gentle' }) ]},
        ], cues:['Sleep, eat, recover'] },
    ],

    'rehab': [
      { day:'Mon', focus:'Activation + Low-Load Strength', type:'rehab', blocks:[
          { name:'Activation', items:[
            _('banded-glute', 2, '12/dir', '30s'),
            _('sl-balance',   2, '45s/side', '20s'),
            _('tib-raise',    3, '15', '45s'),
          ]},
          { name:'Strength', items:[
            _('goblet-squat', 3, '8', '90s', { rpe:6 }),
            _('db-bench',     3, '8', '90s', { rpe:6 }),
            _('cable-row',    3, '10', '60s'),
          ]},
        ], cues:['Pain-free movement','Quality > load'] },
      { day:'Tue', focus:'Low-Impact Cardio', type:'conditioning', blocks:[
          { name:'Cardio', items:[ _('easy-bike', 1, '25 min', '—', { note:'Z2 max' }) ]},
          { name:'Mobility', items:[ _('thoracic-opener', 2, '8/side', '0'), _('hip-9090', 2, '6/side', '0') ]},
        ], cues:['Build cardiovascular base'] },
      { day:'Wed', focus:'Movement Control + Stability', type:'rehab', blocks:[
          { name:'Control', items:[
            _('sl-rdl',          3, '8/side', '60s', { note:'Slow tempo' }),
            _('copenhagen-plank',3, '15s/side', '45s'),
            _('pallof-press',    3, '10/side', '45s'),
          ]},
        ], cues:['Slow tempo','Pain-free range'] },
      { day:'Thu', focus:'Progressive Load', type:'rehab', blocks:[
          { name:'Strength', items:[
            _('goblet-squat',     3, '6', '90s', { rpe:7 }),
            _('db-rdl',           3, '8', '90s', { rpe:6 }),
            _('db-shoulder-press',3, '8', '60s', { rpe:6 }),
          ]},
          { name:'Prehab', items:[ _('nordic-curl', 2, '3', '90s', { note:'Eccentric only' }), _('calf-raise', 3, '12', '45s') ]},
        ], cues:['Progress when pain ≤ 2/10'] },
      { day:'Fri', focus:'Assessment + Light Skill', type:'skill', blocks:[
          { name:'Assessment', items:[ _('sl-balance', 2, '45s/side', '30s'), _('agility-505', 3, '1', '90s', { note:'80% intent' }) ]},
          { name:'Skill', items:[ _('passing-drill', 1, '15 min', '—') ]},
        ], cues:['No max effort'] },
      { day:'Sat', focus:'Off', type:'rest', blocks:[
          { name:'Optional', items:[ _('foam-roll', 1, '8 min', '—'), _('hip-9090', 1, '10 min', '—') ]},
        ], cues:['Listen to body'] },
    ],
  };

  /* ============================================================
     Build a program for an athlete.
     - Replaces unavailable exercises with same-pattern substitutes
     - Trims to sessionsPerWeek (preferring critical types)
     - Optionally adds position-specific accessories
     ============================================================ */
  function buildProgram({ phase = 'in-season', gymAccess = 'full', sessionsPerWeek = 5, primaryPosition, goal = [], nextMatch } = {}) {
    const template = PROGRAM_TEMPLATES[phase] || PROGRAM_TEMPLATES['in-season'];

    // 1) materialise: copy and resolve each item to {ex, sets, reps, rest, ...}
    const days = template.map(d => {
      const blocks = d.blocks.map(b => ({
        name: b.name,
        items: b.items.map(it => {
          const ex = exById(it.id) || EXERCISES[0];
          let resolved = ex;
          if (!isExAvailable(ex, gymAccess)) {
            const subs = getSubstitutions(ex.id, gymAccess);
            resolved = subs[0] || ex; // best effort; if still unavailable, keep original
          }
          return {
            exId: resolved.id,
            ex: resolved.name,
            sets: it.sets,
            reps: it.reps,
            rest: it.rest,
            rpe: it.rpe,
            tempo: it.tempo,
            note: it.note,
            cues: resolved.cues,
            originalExId: it.id,
            substituted: resolved.id !== it.id,
          };
        }),
      }));
      return {
        day: d.day,
        label: d.label,
        focus: d.focus,
        type: d.type,
        blocks,
        cues: d.cues || [],
        complete: false,
        date: null,
        optional: false,
      };
    });

    // 2) Date assignment — for in-season, anchor MD on nextMatch (Saturday)
    if (phase === 'in-season' && nextMatch) {
      const md = new Date(nextMatch + 'T00:00:00');
      // labels include MD-5..MD-1, MD, MD+1
      const offsets = { 'MD-5': -5, 'MD-4': -4, 'MD-3': -3, 'MD-2': -2, 'MD-1': -1, 'MD': 0, 'MD+1': 1 };
      days.forEach(d => {
        const o = offsets[d.label];
        if (o !== undefined) {
          const dt = new Date(md); dt.setDate(dt.getDate() + o);
          d.date = dt.toISOString().slice(0,10);
        }
      });
    }

    // 3) trim to sessionsPerWeek
    if (sessionsPerWeek < days.length) {
      // Mark lowest-priority days optional
      const priority = (d) => {
        if (d.type === 'match') return 100;
        if (d.type === 'rehab') return 90;
        if (d.type === 'strength') return 80;
        if (d.type === 'speed') return 70;
        if (d.type === 'conditioning') return 60;
        if (d.type === 'activation') return 55;
        if (d.type === 'team') return 50;
        if (d.type === 'skill') return 40;
        if (d.type === 'recovery') return 20;
        if (d.type === 'rest') return 0;
        return 10;
      };
      const sorted = [...days].sort((a, b) => priority(b) - priority(a));
      const keep = new Set(sorted.slice(0, sessionsPerWeek).map(d => d.day));
      days.forEach(d => { if (!keep.has(d.day)) d.optional = true; });
    }

    // 4) Add position-specific accessory if relevant
    const posExtras = positionAccessory(primaryPosition);
    if (posExtras) {
      // append to first non-recovery day
      const target = days.find(d => d.type === 'strength') || days.find(d => d.type === 'speed');
      if (target) target.blocks.push(posExtras);
    }

    return days;
  }

  function positionAccessory(positionId) {
    const pos = POSITIONS.find(p => p.id === positionId);
    if (!pos) return null;
    const group = pos.group;
    if (group === 'Front Row') {
      return { name:'Position bias — Neck/Brace', items:[
        { exId:'neck-harness', ex:'Neck harness work', sets:3, reps:'10/dir', rest:'60s', note:'Slow tempo', cues:exById('neck-harness').cues, originalExId:'neck-harness', substituted:false },
        { exId:'iso-neck-hold', ex:'Iso neck holds',  sets:2, reps:'20s/dir', rest:'30s', cues:exById('iso-neck-hold').cues, originalExId:'iso-neck-hold', substituted:false },
      ]};
    }
    if (group === 'Second Row' || group === 'Back Row') {
      return { name:'Position bias — Engine/Pulls', items:[
        { exId:'chinup', ex:'Chin-ups',     sets:3, reps:'AMRAP-2', rest:'90s', cues:exById('chinup').cues, originalExId:'chinup', substituted:false },
        { exId:'farmer-carry', ex:"Farmer's carry", sets:3, reps:'30m', rest:'60s', cues:exById('farmer-carry').cues, originalExId:'farmer-carry', substituted:false },
      ]};
    }
    if (group === 'Back Three' || group === 'Midfield') {
      return { name:'Position bias — Hamstring armour', items:[
        { exId:'nordic-curl', ex:'Nordic curls', sets:3, reps:'5', rest:'90s', note:'Slow eccentric', cues:exById('nordic-curl').cues, originalExId:'nordic-curl', substituted:false },
        { exId:'sl-rdl',      ex:'Single-leg RDL', sets:3, reps:'8/side', rest:'60s', cues:exById('sl-rdl').cues, originalExId:'sl-rdl', substituted:false },
      ]};
    }
    if (group === 'Half Backs') {
      return { name:'Position bias — Agility/Trunk', items:[
        { exId:'agility-505', ex:'505 agility', sets:4, reps:'1', rest:'90s', cues:exById('agility-505').cues, originalExId:'agility-505', substituted:false },
        { exId:'pallof-press', ex:'Pallof press', sets:3, reps:'10/side', rest:'45s', cues:exById('pallof-press').cues, originalExId:'pallof-press', substituted:false },
      ]};
    }
    return null;
  }

  /* ============================================================
     RECIPES — seed menu (~15)
     ============================================================ */
  const RECIPES = [
    {
      id: 'r-oats-berries', name: 'Oats, berries & whey', category: 'breakfast', diet: 'omnivore',
      time: 8, servings: 1, kcal: 620, protein: 42, carbs: 78, fat: 14,
      ingredients: [
        { item:'Oats', qty:'80 g' },
        { item:'Whey isolate', qty:'30 g' },
        { item:'Mixed berries', qty:'120 g' },
        { item:'Almond butter', qty:'15 g' },
        { item:'Milk (semi-skim)', qty:'300 ml' },
      ],
      steps: ['Cook oats with milk on low heat.', 'Top with berries and almond butter.', 'Stir whey into a cooled spoonful or take on the side.'],
      tags: ['mass-gain','performance']
    },
    {
      id: 'r-scramble-toast', name: 'Scrambled eggs on sourdough', category: 'breakfast', diet: 'omnivore',
      time: 10, servings: 1, kcal: 540, protein: 36, carbs: 38, fat: 26,
      ingredients: [
        { item:'Eggs', qty:'3' },
        { item:'Sourdough', qty:'2 slices' },
        { item:'Butter', qty:'10 g' },
        { item:'Spinach', qty:'50 g' },
        { item:'Feta', qty:'30 g' },
      ],
      steps: ['Whisk eggs with a pinch of salt.', 'Soften spinach in butter, add eggs, fold gently.', 'Top toast with eggs and crumbled feta.'],
      tags: ['performance','recomp']
    },
    {
      id: 'r-chicken-rice', name: 'Chicken & rice power bowl', category: 'lunch', diet: 'omnivore',
      time: 25, servings: 1, kcal: 780, protein: 58, carbs: 92, fat: 18,
      ingredients: [
        { item:'Chicken breast', qty:'200 g' },
        { item:'Jasmine rice (cooked)', qty:'200 g' },
        { item:'Avocado', qty:'1/2' },
        { item:'Broccoli', qty:'150 g' },
        { item:'Olive oil', qty:'10 ml' },
        { item:'Soy + lime', qty:'to taste' },
      ],
      steps: ['Dice chicken, season, sear 6 min until golden.', 'Steam broccoli 4 min.', 'Plate rice, top with chicken, broccoli, avocado, soy-lime dressing.'],
      tags: ['mass-gain','performance','strength']
    },
    {
      id: 'r-turkey-wrap', name: 'Turkey & cottage cheese wrap', category: 'lunch', diet: 'omnivore',
      time: 7, servings: 1, kcal: 510, protein: 42, carbs: 48, fat: 14,
      ingredients: [
        { item:'Wholegrain wrap', qty:'1' },
        { item:'Turkey breast slices', qty:'120 g' },
        { item:'Cottage cheese', qty:'80 g' },
        { item:'Rocket', qty:'25 g' },
        { item:'Cherry tomatoes', qty:'80 g' },
      ],
      steps: ['Spread cottage cheese.', 'Layer turkey, rocket, tomatoes.', 'Roll tight, slice in half.'],
      tags: ['recomp','fat-loss','performance']
    },
    {
      id: 'r-salmon-rice', name: 'Salmon, jasmine rice & miso greens', category: 'dinner', diet: 'pescatarian',
      time: 22, servings: 1, kcal: 720, protein: 48, carbs: 76, fat: 22,
      ingredients: [
        { item:'Salmon fillet', qty:'180 g' },
        { item:'Jasmine rice (cooked)', qty:'180 g' },
        { item:'Pak choi', qty:'150 g' },
        { item:'Miso paste', qty:'15 g' },
        { item:'Sesame oil', qty:'5 ml' },
      ],
      steps: ['Roast salmon at 200°C for 12 min.', 'Stir-fry pak choi with miso.', 'Plate over rice, drizzle sesame oil.'],
      tags: ['performance','strength','recomp']
    },
    {
      id: 'r-steak-potato', name: 'Steak, sweet potato & spinach', category: 'dinner', diet: 'omnivore',
      time: 30, servings: 1, kcal: 820, protein: 56, carbs: 70, fat: 30,
      ingredients: [
        { item:'Lean steak', qty:'200 g' },
        { item:'Sweet potato', qty:'300 g' },
        { item:'Spinach', qty:'100 g' },
        { item:'Olive oil', qty:'10 ml' },
        { item:'Garlic', qty:'2 cloves' },
      ],
      steps: ['Roast sweet potato cubes 25 min at 200°C.', 'Sear steak 3 min/side, rest 4 min.', 'Wilt spinach with garlic, plate together.'],
      tags: ['mass-gain','strength']
    },
    {
      id: 'r-chilli', name: 'Lean beef chilli & rice', category: 'dinner', diet: 'omnivore',
      time: 35, servings: 4, kcal: 580, protein: 42, carbs: 62, fat: 16,
      ingredients: [
        { item:'Lean beef mince 5%', qty:'500 g' },
        { item:'Kidney beans', qty:'400 g (tin)' },
        { item:'Chopped tomatoes', qty:'400 g (tin)' },
        { item:'Onion + garlic', qty:'1 + 3' },
        { item:'Rice (cooked, per serve)', qty:'150 g' },
      ],
      steps: ['Brown mince, add aromatics, season (cumin, paprika).', 'Add tomatoes & beans, simmer 25 min.', 'Serve over rice.'],
      tags: ['mass-gain','recomp']
    },
    {
      id: 'r-tofu-stirfry', name: 'Tofu & soba stir-fry', category: 'dinner', diet: 'vegan',
      time: 18, servings: 1, kcal: 640, protein: 34, carbs: 78, fat: 18,
      ingredients: [
        { item:'Firm tofu', qty:'180 g' },
        { item:'Soba noodles', qty:'80 g (dry)' },
        { item:'Mixed stir-fry veg', qty:'200 g' },
        { item:'Soy sauce', qty:'15 ml' },
        { item:'Sesame oil', qty:'10 ml' },
      ],
      steps: ['Press & cube tofu, sear in sesame oil.', 'Boil soba 4 min.', 'Toss everything with soy + chilli.'],
      tags: ['performance','recomp']
    },
    {
      id: 'r-yog-granola', name: 'Greek yoghurt & granola', category: 'snack', diet: 'vegetarian',
      time: 3, servings: 1, kcal: 380, protein: 26, carbs: 42, fat: 10,
      ingredients: [
        { item:'Greek yoghurt 0%', qty:'250 g' },
        { item:'Granola', qty:'40 g' },
        { item:'Honey', qty:'10 g' },
        { item:'Blueberries', qty:'80 g' },
      ],
      steps: ['Layer yoghurt, granola, fruit. Drizzle honey.'],
      tags: ['recomp','performance']
    },
    {
      id: 'r-pb-banana-smoothie', name: 'PB-banana mass smoothie', category: 'snack', diet: 'vegetarian',
      time: 4, servings: 1, kcal: 720, protein: 48, carbs: 84, fat: 20,
      ingredients: [
        { item:'Oats', qty:'60 g' },
        { item:'Whey', qty:'40 g' },
        { item:'Banana', qty:'1 large' },
        { item:'Peanut butter', qty:'30 g' },
        { item:'Milk', qty:'400 ml' },
      ],
      steps: ['Blend everything until smooth.'],
      tags: ['mass-gain']
    },
    {
      id: 'r-pre-bagel', name: 'Pre-train bagel + honey + espresso', category: 'pre-train', diet: 'vegetarian',
      time: 5, servings: 1, kcal: 360, protein: 12, carbs: 70, fat: 5,
      ingredients: [
        { item:'White bagel', qty:'1' },
        { item:'Honey', qty:'20 g' },
        { item:'Espresso shot', qty:'1' },
      ],
      steps: ['Toast bagel, drizzle honey. Espresso on the side.'],
      tags: ['performance','match-fitness']
    },
    {
      id: 'r-post-shake', name: 'Post-train recovery shake', category: 'post-train', diet: 'vegetarian',
      time: 2, servings: 1, kcal: 360, protein: 42, carbs: 38, fat: 4,
      ingredients: [
        { item:'Whey isolate', qty:'40 g' },
        { item:'Maltodextrin or banana', qty:'30 g / 1' },
        { item:'Water or milk', qty:'400 ml' },
      ],
      steps: ['Shake/blend. Drink within 30 min of finishing.'],
      tags: ['mass-gain','performance','strength']
    },
    {
      id: 'r-overnight-oats', name: 'Overnight oats jar', category: 'breakfast', diet: 'vegetarian',
      time: 5, servings: 1, kcal: 520, protein: 38, carbs: 64, fat: 12,
      ingredients: [
        { item:'Oats', qty:'70 g' },
        { item:'Greek yoghurt', qty:'150 g' },
        { item:'Whey', qty:'20 g' },
        { item:'Chia seeds', qty:'10 g' },
        { item:'Honey + fruit', qty:'to taste' },
      ],
      steps: ['Layer everything in a jar.', 'Refrigerate overnight.', 'Stir & eat.'],
      tags: ['mass-gain','recomp']
    },
    {
      id: 'r-egg-fried-rice', name: 'Egg fried rice (3-egg)', category: 'lunch', diet: 'vegetarian',
      time: 12, servings: 1, kcal: 660, protein: 30, carbs: 78, fat: 22,
      ingredients: [
        { item:'Cooked rice', qty:'250 g' },
        { item:'Eggs', qty:'3' },
        { item:'Spring onion + peas', qty:'80 g' },
        { item:'Soy sauce', qty:'15 ml' },
        { item:'Sesame oil', qty:'10 ml' },
      ],
      steps: ['Scramble eggs, set aside.', 'Fry rice with veg & soy.', 'Fold eggs back in.'],
      tags: ['performance','mass-gain']
    },
    {
      id: 'r-chia-pud', name: 'Chia pudding (fat-loss)', category: 'snack', diet: 'vegan',
      time: 3, servings: 1, kcal: 250, protein: 14, carbs: 22, fat: 12,
      ingredients: [
        { item:'Chia seeds', qty:'30 g' },
        { item:'Almond milk', qty:'250 ml' },
        { item:'Plant protein', qty:'20 g' },
        { item:'Cinnamon', qty:'pinch' },
      ],
      steps: ['Whisk everything in a jar.', 'Refrigerate 4h+.'],
      tags: ['fat-loss','recomp']
    },
  ];

  /* expose */
  window.RuckFit = {
    NAV, POSITIONS, DEMO_ATHLETE, BENCHMARKS, SPEED, RECIPES,
    PROGRAM, WEEKLY_LOAD, SESSION_RPE, BODYWEIGHT, STRENGTH_PROG, SPRINT_PROG,
    READINESS_HISTORY, QUALITY_BALANCE, WELLNESS, SORENESS_MAP, NUTRITION,
    POSITION_PROFILES, MATCH, REHAB, TEAM, FEED, CHALLENGES,
    EXERCISES, EQUIPMENT_TIERS, exById, isExAvailable, getSubstitutions, buildProgram,
    PROGRAM_TEMPLATES,
  };
})();
