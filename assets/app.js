/* ============================================================
   RuckFit Pro — App controller
   ============================================================ */
(function () {
  const R = window.RuckFit;
  const V = window.RFViews;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* In-memory state (no localStorage — safe for restricted envs) */
  window.AppState = {
    athlete: null,                  // populated after onboarding
    isDemo: false,                  // true when "Use demo profile" was chosen
    theme: 'dark',
    nav: 'dashboard',
    sidebarOpen: false,
    bestKg: {},                     // running PB store this session
    session: null,                  // live session state
    program: null,                  // resolved program (array of days)
    intervals: [],                  // active interval ids — cleared on route change
    listeners: [],                  // global listeners that need cleanup
    wellnessDraft: null,            // current check-in values
    wellnessHistory: null,          // wellness records (fresh = 1 entry, demo = 14)
    hydrationL: 0,                  // litres logged today
    waterClicks: 0,                 // count of +250ml clicks today
    soreness: null,                 // mutable copy of seed soreness
    notifications: [],              // mutable copy of seed notifications
    acknowledged: new Set(),        // ack'd note ids
    checklist: new Set(),           // generic ticked items by id
    challenges: {},                 // challenge name -> joined boolean
    matchPrepSliders: null,         // values per quality
    matchChecklist: new Set(),
    travelChecklist: new Set(),
    postMatchChecklist: new Set(),
    rtpStateOverride: {},           // gate name -> done
    extraMeals: [],
    extraExercises: [],             // pushed from Position view into today's session
    programDone: new Set(),         // session day labels marked complete
    pbs: {},                        // exercise -> kg
    composedReadiness: null,        // derived from latest wellness
    weeklyLoad: [],                 // load history for charts
    bodyweight: [],                 // weight log for charts
    strengthHist: {},               // {exId: [kg, ...]}
    streakDays: 0,
  };

  function initRuntimeState() {
    const S = window.AppState;
    const a = S.athlete;
    S.checklist = new Set();
    S.acknowledged = new Set();
    S.matchChecklist = new Set();
    S.travelChecklist = new Set();
    S.postMatchChecklist = new Set();
    S.rtpStateOverride = {};
    S.extraMeals = [];
    S.extraExercises = [];
    S.programDone = new Set();
    S.matchPrepSliders = { Speed: 50, Contact: 50, Kicking: 30, Conditioning: 50 };
    S.waterClicks = 0;
    S.bestKg = {};
    S.pbs = {};
    // recipes & grocery: shared seed for everyone, mutable copies in state
    S.recipes = R.RECIPES.map(r => ({ ...r, ingredients: r.ingredients.map(i => ({ ...i })), steps: [...(r.steps||[])], tags: [...(r.tags||[])] }));
    S.grocery = R.NUTRITION.grocery.map(g => ({ ...g, id: 'g-' + Math.random().toString(36).slice(2,7), checked: false }));

    if (S.isDemo) {
      // Demo profile: rich seed history
      S.wellnessHistory = R.WELLNESS.map(w => ({ ...w }));
      S.hydrationL = R.NUTRITION.todayLog.hydrationL;
      S.soreness = { ...R.SORENESS_MAP };
      S.notifications = R.DEMO_ATHLETE.notifications.map(n => ({ ...n, read: false }));
      S.challenges = R.CHALLENGES.reduce((o, c) => (o[c.name] = c.joined, o), {});
      S.weeklyLoad = R.WEEKLY_LOAD.slice();
      S.bodyweight = R.BODYWEIGHT.slice();
      S.strengthHist = Object.fromEntries(Object.entries(R.STRENGTH_PROG).map(([k,v]) => [k, v.slice()]));
      S.streakDays = a.streakDays || 17;
      S.program = R.buildProgram({
        phase: 'in-season',
        gymAccess: 'full',
        sessionsPerWeek: 7,
        primaryPosition: a.primaryPosition,
        goal: Array.isArray(a.goal) ? a.goal : [a.goal],
        nextMatch: a.nextMatch || '2026-05-16',
      });
      S.programDone = new Set([S.program[0].day]); // Mon already done in demo
    } else {
      // Fresh user: minimal/empty state
      S.wellnessHistory = []; // user hasn't checked in yet
      S.hydrationL = 0;
      S.soreness = Object.fromEntries(Object.keys(R.SORENESS_MAP).map(k => [k, 0]));
      const notifs = [
        { id: 1, type:'session',  title:'Welcome to RuckFit Pro', sub:'Open Program to set up your training week.', when:'Just now', read:false },
      ];
      if (!S.nutritionSetup) notifs.push({ id:2, type:'readiness', title:'Set up nutrition', sub:'Open Nutrition to calculate your macros.', when:'Just now', read:false });
      S.notifications = notifs;
      S.challenges = {};
      S.weeklyLoad = [];
      S.bodyweight = a.weightKg ? [{ w:'W0', kg: a.weightKg }] : [];
      S.strengthHist = {};
      S.streakDays = 0;
      S.programDone = new Set();
      // No program until programSetup is completed in the Program view.
      S.program = S.program || [];
    }

    // Wellness draft is empty for fresh user, or last entry for demo
    if (S.wellnessHistory.length) {
      const last = S.wellnessHistory[S.wellnessHistory.length - 1];
      S.wellnessDraft = { ...last };
      S.composedReadiness = composeReadiness(last);
    } else {
      // sensible empty draft so sliders work
      S.wellnessDraft = { d:'2026-05-12', sleepHr:7, sleepQ:6, soreness:3, mood:6, stress:4, hydration:6, hrv:65 };
      S.composedReadiness = null; // shown as "—" until submitted
    }

    // expose streak on the athlete (single source of truth)
    a.streakDays = S.streakDays;
  }

  /* =========================================================
     STORAGE — localStorage persistence
     ========================================================= */
  const STORAGE_KEY = 'ruckfit-state-v1';
  const SET_KEYS = ['acknowledged','checklist','matchChecklist','travelChecklist','postMatchChecklist','programDone'];

  function serializeState() {
    const out = {};
    for (const k in window.AppState) {
      if (k === 'intervals' || k === 'listeners' || k === 'bestKg' || k === 'pbs') continue;
      const v = window.AppState[k];
      if (v instanceof Set) out[k] = { __set: true, items: [...v] };
      else out[k] = v;
    }
    return out;
  }

  function deserializeState(data) {
    for (const k in data) {
      const v = data[k];
      if (v && typeof v === 'object' && v.__set) data[k] = new Set(v.items);
    }
    // SET_KEYS that might be plain arrays from older saves
    for (const k of SET_KEYS) {
      if (Array.isArray(data[k])) data[k] = new Set(data[k]);
      if (!(data[k] instanceof Set)) data[k] = new Set();
    }
    data.intervals = [];
    data.listeners = [];
    data.bestKg = {};
    data.pbs = data.pbs || {};
    return data;
  }

  function saveState() {
    try {
      if (!window.AppState.athlete) return; // nothing to save before onboarding
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
    } catch (e) {
      console.warn('[ruckfit] save failed', e);
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = deserializeState(JSON.parse(raw));
      if (!data.athlete) return null; // invalid
      return data;
    } catch (e) {
      console.warn('[ruckfit] load failed', e);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return null;
    }
  }

  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function composeReadiness(w) {
    if (!w) return 78;
    const sleep   = Math.min(100, (w.sleepHr / 8.5) * 100);
    const sleepQ  = (w.sleepQ / 10) * 100;
    const sore    = ((10 - w.soreness) / 10) * 100;
    const mood    = (w.mood / 10) * 100;
    const stress  = ((10 - w.stress) / 10) * 100;
    const hyd     = (w.hydration / 10) * 100;
    const hrv     = Math.min(100, (w.hrv / 90) * 100);
    return Math.round(0.18*sleep + 0.12*sleepQ + 0.18*sore + 0.10*mood + 0.10*stress + 0.10*hyd + 0.22*hrv);
  }

  const ICONS = {
    home:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    play:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    chart:    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 15 4-4 4 4 5-6"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    fuel:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/><path d="M3 13h12M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-4 0v-3"/></svg>',
    menu:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v20M9 2v8a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M18 2v10c0 .5 0 1.5 0 2h-2c0 .5 0 8 0 8h4V2z"/></svg>',
    pitch:    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M12 5v14M5 12h2M17 12h2"/></svg>',
    whistle:  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4 6 12l8 8c4-1 7-4 7-8s-3-7-7-8Z"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg>',
    plus:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    users:    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    user:     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  };

  /* =========================================================
     ONBOARDING FLOW
     ========================================================= */
  const ONB_STEPS = [
    {
      key: 'identity',
      title: 'Who are you?',
      sub: "Just the basics — we'll set up training and nutrition separately.",
      fields: [
        { id:'firstName', label:'First name', type:'text', placeholder:'Your first name', required:true },
        { id:'lastName',  label:'Last name',  type:'text', placeholder:'Your last name', required:true },
        { id:'age',       label:'Age',        type:'number', min:14, max:50, placeholder:'22', required:true },
        { id:'level',     label:'Playing level', type:'select', options:['Club','University','Academy','Semi-pro','Pro'], val:'Club' },
      ]
    },
    {
      key: 'physical',
      title: 'Physical profile',
      sub: 'Used for macro calculations and program scaling.',
      fields: [
        { id:'heightCm',       label:'Height (cm)',  type:'number', min:150, max:220, placeholder:'180', required:true },
        { id:'weightKg',       label:'Bodyweight (kg)', type:'number', step:.1, placeholder:'85', required:true },
        { id:'sex',            label:'Sex', type:'select', options:[{v:'male',l:'Male'},{v:'female',l:'Female'}], val:'male' },
        { id:'units',          label:'Preferred units', type:'select', options:['metric','imperial'], val:'metric' },
      ]
    },
    {
      key: 'position',
      title: 'Position',
      sub: 'Pick your primary jersey, and a secondary if you cover.',
      custom: 'position'
    },
  ];

  let onbState = { step: 0, data: {} };

  function startOnboarding(force=false) {
    // Try to restore from localStorage first (unless forcing re-onboard)
    if (!force) {
      const saved = loadState();
      if (saved) {
        Object.assign(window.AppState, saved);
        // Apply theme attribute immediately
        document.documentElement.setAttribute('data-theme', window.AppState.theme || 'dark');
        document.getElementById('iconMoon').hidden = (window.AppState.theme === 'light');
        document.getElementById('iconSun').hidden = (window.AppState.theme !== 'light');
        document.getElementById('onboarding').hidden = true;
        document.getElementById('app').hidden = false;
        // Boot but DO NOT re-init runtime state (we have it from storage)
        renderSidebar();
        renderBottomNav();
        updateTopbar();
        updateNotifDot();
        renderRoute();
        if (!_globalBound) { bindGlobalEvents(); _globalBound = true; }
        bindAutosave();
        return;
      }
    }
    if (!force && window.AppState.athlete) return; // already onboarded in memory
    onbState = { step: 0, data: structuredClone(R.DEMO_ATHLETE) };
    document.getElementById('onboarding').hidden = false;
    document.getElementById('app').hidden = true;
    renderOnbStep();
  }

  let _autosaveBound = false;
  function bindAutosave() {
    if (_autosaveBound) return;
    _autosaveBound = true;
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });
    // Periodic safety net (cheap)
    setInterval(saveState, 10000);
  }

  function renderOnbStep() {
    const total = ONB_STEPS.length;
    const stepper = document.getElementById('stepper');
    stepper.innerHTML = ONB_STEPS.map((_, i) => {
      const cls = i < onbState.step ? 'is-done' : i === onbState.step ? 'is-active' : '';
      return `<div class="stepper__seg ${cls}"></div>`;
    }).join('');

    const s = ONB_STEPS[onbState.step];
    const form = document.getElementById('onboardingForm');
    if (s.custom === 'position') {
      form.innerHTML = `
        <div class="onb-step">
          <h2>${esc(s.title)}</h2>
          <p class="muted">${esc(s.sub)}</p>
          <div class="field"><label>Primary position</label>
            <div class="tilebox" id="primPosBox">
              ${R.POSITIONS.map(p => `
                <button class="tile ${onbState.data.primaryPosition===p.id?'is-selected':''}" type="button" data-prim="${p.id}">
                  <strong>${p.number}. ${esc(p.name.replace(/\s*\(.*\)/,''))}</strong>
                  <span>${esc(p.group)}</span>
                </button>`).join('')}
            </div>
          </div>
          <div class="field"><label>Secondary position (optional)</label>
            <div class="tilebox" id="secPosBox">
              ${R.POSITIONS.map(p => `
                <button class="tile ${onbState.data.secondaryPosition===p.id?'is-selected':''}" type="button" data-sec="${p.id}">
                  <strong>${p.number}. ${esc(p.name.replace(/\s*\(.*\)/,''))}</strong>
                  <span>${esc(p.group)}</span>
                </button>`).join('')}
            </div>
          </div>
        </div>`;
      document.querySelectorAll('[data-prim]').forEach(b => b.onclick = () => {
        onbState.data.primaryPosition = b.dataset.prim;
        document.querySelectorAll('[data-prim]').forEach(x => x.classList.toggle('is-selected', x.dataset.prim === b.dataset.prim));
      });
      document.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => {
        onbState.data.secondaryPosition = b.dataset.sec;
        document.querySelectorAll('[data-sec]').forEach(x => x.classList.toggle('is-selected', x.dataset.sec === b.dataset.sec));
      });
    } else {
      form.innerHTML = `
        <div class="onb-step">
          <h2>${esc(s.title)}</h2>
          <p class="muted">${esc(s.sub)}</p>
          <div class="onb-grid">
            ${s.fields.map(f => renderField(f)).join('')}
          </div>
        </div>`;
      s.fields.forEach(f => {
        if (f.type === 'tiles') {
          document.querySelectorAll(`[data-onb="${f.id}"]`).forEach(b => b.onclick = () => {
            if (f.multi) {
              const arr = Array.isArray(onbState.data[f.id]) ? onbState.data[f.id].slice() : [];
              const i = arr.indexOf(b.dataset.val);
              if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.val);
              onbState.data[f.id] = arr;
              document.querySelectorAll(`[data-onb="${f.id}"]`).forEach(x => x.classList.toggle('is-selected', arr.includes(x.dataset.val)));
            } else {
              onbState.data[f.id] = b.dataset.val;
              document.querySelectorAll(`[data-onb="${f.id}"]`).forEach(x => x.classList.toggle('is-selected', x.dataset.val === b.dataset.val));
            }
          });
        } else {
          const inp = document.getElementById('onb-' + f.id);
          inp && (inp.oninput = (e) => onbState.data[f.id] = e.target.value);
        }
      });
    }

    document.getElementById('onbBack').disabled = onbState.step === 0;
    document.getElementById('onbNext').textContent = onbState.step === total - 1 ? 'Enter app →' : 'Continue';
  }

  function renderField(f) {
    const v = onbState.data[f.id] ?? f.val ?? (f.multi ? [] : '');
    if (f.type === 'tiles') {
      const isSel = f.multi
        ? (val) => Array.isArray(v) && v.includes(val)
        : (val) => v === val;
      return `<div class="field" style="grid-column: 1/-1;"><label>${esc(f.label)}</label>
        <div class="tilebox">
          ${f.options.map(o => `<button class="tile ${isSel(o.v)?'is-selected':''}" type="button" data-onb="${f.id}" data-val="${o.v}">
            <strong>${esc(o.label)}</strong><span>${esc(o.sub||'')}</span>
          </button>`).join('')}
        </div></div>`;
    }
    if (f.type === 'select') {
      return `<div class="field"><label for="onb-${f.id}">${esc(f.label)}</label>
        <select class="select" id="onb-${f.id}">
          ${f.options.map(o => {
            const val = typeof o === 'string' ? o : o.v;
            const lab = typeof o === 'string' ? o : (o.l || o.v);
            return `<option value="${esc(val)}" ${v === val ? 'selected':''}>${esc(lab)}</option>`;
          }).join('')}
        </select></div>`;
    }
    return `<div class="field"><label for="onb-${f.id}">${esc(f.label)}</label>
      <input class="input" id="onb-${f.id}" type="${f.type}" placeholder="${esc(f.placeholder||'')}" value="${esc(v)}"
        ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.step?`step="${f.step}"`:''} />
    </div>`;
  }

  function commitOnb() {
    // Account-creation onboarding gathers identity, physical, position only.
    // Program & nutrition are set up on first visit to those tabs.
    const data = onbState.data;
    const a = {
      firstName: data.firstName || 'Athlete',
      lastName:  data.lastName  || '',
      age:       Number(data.age) || 22,
      heightCm:  Number(data.heightCm) || 180,
      weightKg:  Number(data.weightKg) || 85,
      sex:       data.sex || 'male',
      level:     data.level || 'Club',
      primaryPosition:   data.primaryPosition || 'p8',
      secondaryPosition: data.secondaryPosition,
      units:     data.units || 'metric',
      dominantSide: 'Right',
      archetype: deriveArchetype(data.primaryPosition),
      streakDays: 0,
      contactReadiness: 'green',
      availability: 'available',
      injuryHistory: [],
      notifPref: true,
      // unset until Program setup runs
      phase: undefined,
      goal: undefined,
      gymAccess: undefined,
      sessionsPerWeek: undefined,
      nextMatch: undefined,
      // unset until Nutrition setup runs
      nutritionGoal: undefined,
      activity: undefined,
    };
    a.initials = ((a.firstName||'A')[0] + (a.lastName||'C')[0]).toUpperCase();
    a.targetWeightKg = a.weightKg; // sensible default
    window.AppState.athlete = a;
    window.AppState.isDemo = false;
    window.AppState.programSetup = false;
    window.AppState.nutritionSetup = false;
    document.getElementById('onboarding').hidden = true;
    document.getElementById('app').hidden = false;
    boot();
  }

  function deriveArchetype(positionId) {
    const pos = R.POSITIONS.find(p => p.id === positionId);
    if (!pos) return 'Athlete';
    const g = pos.group;
    if (g === 'Front Row') return 'Set-Piece Forward';
    if (g === 'Second Row') return 'Engine Forward';
    if (g === 'Back Row') return 'All-Court Forward';
    if (g === 'Half Backs') return 'Decision Maker';
    if (g === 'Midfield') return 'Power Centre';
    if (g === 'Back Three') return 'Strike Runner';
    return 'Athlete';
  }

  function validateOnbStep() {
    const s = ONB_STEPS[onbState.step];
    if (!s.fields) return true;
    for (const f of s.fields) {
      // pull current input value into state for all non-tile fields
      if (f.type !== 'tiles') {
        const inp = document.getElementById('onb-' + f.id);
        if (inp && (onbState.data[f.id] === undefined || onbState.data[f.id] === '')) {
          onbState.data[f.id] = inp.value;
        }
      }
      if (f.type === 'tiles' && f.val !== undefined && onbState.data[f.id] === undefined) {
        onbState.data[f.id] = f.val;
      }
      if (f.required) {
        const v = onbState.data[f.id];
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
          toast(`Please enter your ${f.label.toLowerCase()}`, 'warn');
          const inp = document.getElementById('onb-' + f.id);
          if (inp) inp.focus();
          return false;
        }
      }
    }
    return true;
  }

  document.getElementById('onbBack').onclick = () => { if (onbState.step > 0) { onbState.step--; renderOnbStep(); } };
  document.getElementById('onbNext').onclick = () => {
    if (!validateOnbStep()) return;
    if (onbState.step < ONB_STEPS.length - 1) { onbState.step++; renderOnbStep(); }
    else commitOnb();
  };
  document.getElementById('onbSkip').onclick = () => {
    window.AppState.athlete = structuredClone(R.DEMO_ATHLETE);
    window.AppState.isDemo = true;
    window.AppState.programSetup = true;
    window.AppState.nutritionSetup = true;
    document.getElementById('onboarding').hidden = true;
    document.getElementById('app').hidden = false;
    boot();
  };

  /* =========================================================
     APP BOOTSTRAP
     ========================================================= */
  let _globalBound = false;
  function boot() {
    initRuntimeState();
    renderSidebar();
    renderBottomNav();
    updateTopbar();
    updateNotifDot();
    renderRoute();
    if (!_globalBound) { bindGlobalEvents(); _globalBound = true; }
    bindAutosave();
    saveState();
  }

  function renderSidebar() {
    const groups = R.NAV.reduce((acc, n) => {
      (acc[n.group] = acc[n.group] || []).push(n);
      return acc;
    }, {});
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = Object.entries(groups).map(([gname, items]) => `
      <div class="nav-group">
        <div class="nav-group__label">${esc(gname)}</div>
        ${items.map(it => `
          <a href="#/${it.id}" class="nav-item ${window.AppState.nav===it.id?'is-active':''}" data-nav-id="${it.id}">
            ${ICONS[it.icon] || ICONS.home}
            <span>${esc(it.label)}</span>
            ${it.id === 'session' && window.AppState.session ? '<span class="badge">LIVE</span>' : ''}
          </a>`).join('')}
      </div>`).join('');
    const a = window.AppState.athlete;
    const phaseTxt = a.phase ? a.phase : 'Set up program';
    document.getElementById('phasePill').innerHTML = `<span class="dot-acc"></span><span>Phase: <strong>${esc(phaseTxt)}</strong></span>`;
  }

  function renderBottomNav() {
    const ids = ['dashboard','program','session','recovery','profile'];
    const bot = document.getElementById('bottomnav');
    bot.innerHTML = ids.map(id => {
      const n = R.NAV.find(x => x.id === id);
      return `<a href="#/${n.id}" class="bottomnav__item ${window.AppState.nav===n.id?'is-active':''}" data-nav-id="${n.id}">
        ${ICONS[n.icon]}<span>${esc(n.label)}</span>
      </a>`;
    }).join('');
  }

  function updateTopbar() {
    const a = window.AppState.athlete;
    document.getElementById('topDate').textContent = new Date('2026-05-12T08:00:00').toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit' });
    const r = window.AppState.composedReadiness ?? R.READINESS_HISTORY[R.READINESS_HISTORY.length-1];
    const tone = r >= 75 ? 'green' : r >= 55 ? 'amber' : 'red';
    document.getElementById('topStatus').innerHTML = `<span class="ready-dot"></span><span>Ready • ${r}</span>`;
    document.getElementById('topStatus').setAttribute('data-ready', tone);
    document.getElementById('profileName').textContent = `${a.firstName} ${a.lastName}`;
    const pos = R.POSITIONS.find(p => p.id === a.primaryPosition);
    document.getElementById('profilePos').textContent = pos ? pos.name : '';
    document.getElementById('avatar').textContent = a.initials;
  }

  function updateNotifDot() {
    const unread = window.AppState.notifications.filter(n => !n.read).length;
    const dot = document.getElementById('notifDot');
    dot.style.display = unread > 0 ? '' : 'none';
    dot.title = `${unread} unread`;
  }

  function getTodayProgram() {
    const prog = window.AppState.program || [];
    const today = '2026-05-12';
    // 1) if a day has today's date, that's it
    const byDate = prog.find(d => d.date === today);
    if (byDate) return byDate;
    // 2) otherwise pick by weekday (today=Tuesday)
    const weekday = new Date(today + 'T00:00:00').toLocaleString('en-GB', { weekday: 'short' }); // "Tue"
    const byDay = prog.find(d => d.day === weekday);
    if (byDay) return byDay;
    // 3) fallback to first non-rest day
    return prog.find(d => d.type !== 'rest') || prog[0];
  }

  function clearViewIntervals() {
    (window.AppState.intervals || []).forEach(id => clearInterval(id));
    window.AppState.intervals = [];
  }

  function renderRoute() {
    saveState();
    clearViewIntervals();
    document.getElementById('notifPanel').hidden = true;
    closeModal();
    const hash = (location.hash || '#/dashboard').replace(/^#\//, '');
    const id = (V[hash] ? hash : 'dashboard');
    window.AppState.nav = id;
    renderSidebar(); // refresh LIVE badge and active state
    renderBottomNav();
    const view = V[id];
    const main = document.getElementById('view');
    main.innerHTML = `
      <div class="skeleton" style="height: 22px; width: 220px; margin-bottom: 18px;"></div>
      <div class="grid grid--auto-md">
        <div class="skeleton" style="height: 160px;"></div>
        <div class="skeleton" style="height: 160px;"></div>
        <div class="skeleton" style="height: 160px;"></div>
      </div>
    `;
    // small delay so skeleton is visible (real-feel loading)
    requestAnimationFrame(() => {
      try {
        main.innerHTML = view.render();
        view.attach && view.attach();
        // crumb
        document.getElementById('crumb').textContent = R.NAV.find(n => n.id === id)?.crumb || id;
        // active nav
        document.querySelectorAll('[data-nav-id]').forEach(el => {
          el.classList.toggle('is-active', el.dataset.navId === id);
        });
        document.getElementById('main').scrollTop = 0;
      } catch (err) {
        console.error(err);
        main.innerHTML = `<div class="card"><div class="card__title">Something went wrong</div><pre style="white-space:pre-wrap;color:var(--danger);">${esc(err && err.stack || err)}</pre></div>`;
      }
    });
  }

  /* =========================================================
     GLOBAL EVENTS
     ========================================================= */
  function bindGlobalEvents() {
    window.addEventListener('hashchange', renderRoute);

    // click [data-nav] anywhere
    document.body.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { e.preventDefault(); location.hash = '#/' + nav.dataset.nav; }
      const close = e.target.closest('[data-close-modal]');
      if (close) { closeModal(); }
      const closeN = e.target.closest('[data-close-notif]');
      if (closeN) { document.getElementById('notifPanel').hidden = true; }
      // bottom-nav + sidebar use real anchors so hashchange handles them; just close drawer
      if (e.target.closest('[data-nav-id]')) {
        document.getElementById('sidebar').classList.remove('is-open');
      }
      // save session from finish modal
      if (e.target.id === 'saveSessionBtn') {
        const today = getTodayProgram();
        if (today) window.AppState.programDone.add(today.day);
        window.AppState.session = null;
        window.AppState.athlete.streakDays = (window.AppState.athlete.streakDays || 0) + 1;
        closeModal();
        toast('Session saved ✓ — streak +1 day', 'success');
        location.hash = '#/dashboard';
      }
      // feel buttons
      if (e.target.matches('[data-feel]')) {
        document.querySelectorAll('[data-feel]').forEach(b => b.classList.remove('btn--primary'));
        e.target.classList.add('btn--primary');
      }
      // outside-click close for notifications popover
      const panel = document.getElementById('notifPanel');
      if (!panel.hidden && !e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
        panel.hidden = true;
      }
    });

    // sidebar toggle (mobile)
    document.getElementById('menuToggle').onclick = () => document.getElementById('sidebar').classList.toggle('is-open');

    // theme
    document.getElementById('themeToggle').onclick = () => setTheme(window.AppState.theme === 'dark' ? 'light' : 'dark');

    // search — actually finds matching sections/exercises and jumps
    const search = document.getElementById('globalSearch');
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && search.value.trim()) {
        runSearch(search.value.trim());
        search.value = '';
      }
    });
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); }
      if (e.key === 'Escape') { closeModal(); document.getElementById('notifPanel').hidden = true; }
    });

    // notifications panel toggle + render
    document.getElementById('notifBtn').onclick = (e) => {
      e.stopPropagation();
      const panel = document.getElementById('notifPanel');
      if (panel.hidden) { renderNotifPanel(); panel.hidden = false; }
      else panel.hidden = true;
    };

    // profile button → profile view
    document.getElementById('profileBtn').onclick = () => location.hash = '#/profile';

    // resize: re-render only when not in active session (to preserve input focus)
    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (window.AppState.nav === 'session' && window.AppState.session) return; // don't kill live state
        renderRoute();
      }, 400);
    });
  }

  function renderNotifPanel() {
    const list = document.getElementById('notifList');
    const S = window.AppState;
    list.innerHTML = `
      <div style="display:flex; justify-content:space-between; padding:8px 14px; border-bottom:1px solid var(--border);">
        <span class="muted" style="font-size:12px;">${S.notifications.filter(n=>!n.read).length} unread</span>
        <button class="btn btn--ghost btn--sm" id="markAllReadBtn">Mark all read</button>
      </div>
      ${S.notifications.length === 0
        ? `<div class="empty"><div>No notifications</div></div>`
        : S.notifications.map(n => `
          <div class="popover__item" style="${n.read?'opacity:.55;':''}" data-notif-id="${n.id}">
            <div class="thumb thumb--accent">${notifIcon(n.type)}</div>
            <div style="flex:1;">
              <div class="popover__item-title">${esc(n.title)}</div>
              <div class="popover__item-sub">${esc(n.sub)}</div>
              <div class="popover__item-sub mono">${esc(n.when)}</div>
            </div>
            <button class="iconbtn iconbtn--sm" data-dismiss-notif="${n.id}" title="Dismiss">✕</button>
          </div>`).join('')}
    `;
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
      S.notifications.forEach(n => n.read = true);
      updateNotifDot();
      renderNotifPanel();
    });
    list.querySelectorAll('[data-notif-id]').forEach(el => {
      el.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-dismiss-notif]')) return;
        const id = Number(el.dataset.notifId);
        const n = S.notifications.find(x => x.id === id);
        if (n) n.read = true;
        updateNotifDot();
        renderNotifPanel();
      });
    });
    list.querySelectorAll('[data-dismiss-notif]').forEach(b => {
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = Number(b.dataset.dismissNotif);
        S.notifications = S.notifications.filter(n => n.id !== id);
        updateNotifDot();
        renderNotifPanel();
      });
    });
  }

  function runSearch(q) {
    const ql = q.toLowerCase();
    // match a nav section
    const navHit = R.NAV.find(n => n.label.toLowerCase().includes(ql) || n.crumb.toLowerCase().includes(ql));
    if (navHit) { location.hash = '#/' + navHit.id; toast(`Jumped to ${navHit.label}`, 'success'); return; }
    // match an exercise
    const exHit = (window.AppState.program || []).flatMap(d => d.blocks.flatMap(b => b.items.map(it => ({ ...it, day: d.day, label: d.label || '', focus: d.focus }))))
      .find(it => it.ex.toLowerCase().includes(ql));
    if (exHit) { location.hash = '#/program'; toast(`Found "${exHit.ex}" in ${exHit.day} session`, 'success'); return; }
    // also look up exercise DB directly
    const dbHit = R.EXERCISES.find(e => e.name.toLowerCase().includes(ql));
    if (dbHit) { toast(`"${dbHit.name}" exists in the library — open Program → add to a session`, 'info'); return; }
    // match a position
    const posHit = R.POSITIONS.find(p => p.name.toLowerCase().includes(ql) || p.group.toLowerCase().includes(ql));
    if (posHit) { location.hash = '#/position'; toast(`Position match: ${posHit.name}`, 'info'); return; }
    toast(`No results for "${q}"`, 'warn');
  }

  function notifIcon(t) {
    const map = {
      coach:     '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5L3 21l1-3.5A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
      readiness: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3 2"/></svg>',
      session:   '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      team:      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>',
    };
    return map[t] || map.session;
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    window.AppState.theme = t;
    document.getElementById('iconMoon').hidden = t === 'light';
    document.getElementById('iconSun').hidden  = t === 'dark';
    document.body.setAttribute('data-theme-transition', '1');
    setTimeout(() => document.body.removeAttribute('data-theme-transition'), 350);
    saveState();
    // redraw charts for new colors
    renderRoute();
  }

  function navigate(id) { location.hash = '#/' + id; }
  function openModal(htmlStr) {
    const m = document.getElementById('modal');
    document.getElementById('modalPanel').innerHTML = htmlStr;
    m.hidden = false;
  }
  function closeModal() { document.getElementById('modal').hidden = true; }
  function toast(msg, type='info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast is-' + (type === 'success' ? 'success' : type === 'warn' ? 'warn' : type === 'danger' ? 'danger' : '');
    t.hidden = false;
    clearTimeout(window._toastT);
    window._toastT = setTimeout(() => t.hidden = true, 2400);
  }

  window.App = {
    navigate, openModal, closeModal, toast, setTheme,
    persist: saveState,
    refresh: () => { renderSidebar(); updateTopbar(); renderRoute(); },
    refreshTopbar: () => updateTopbar(),
    refreshNotifDot: () => updateNotifDot(),
    refreshView: () => renderRoute(),
    beginOnboarding: (force) => startOnboarding(force),
    resetAll: () => {
      clearState();
      location.reload();
    },
    getTodayProgram,
  };

  /* go */
  document.addEventListener('DOMContentLoaded', () => startOnboarding());
})();
