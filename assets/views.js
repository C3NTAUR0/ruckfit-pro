/* ============================================================
   RuckFit Pro — View renderers
   ============================================================ */
(function () {
  const R = window.RuckFit;
  const C = window.RFCharts;

  // tiny HTML template literal helper
  const html = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ''), '');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function todayProgram() {
    return window.App.getTodayProgram();
  }
  function getProgram() { return window.AppState.program || []; }
  function fmtKg(v, u='kg') {
    const a = window.AppState.athlete;
    if (a && a.units === 'imperial') return (v * 2.20462).toFixed(1) + ' lb';
    return v + ' ' + u;
  }
  function readinessTone(score) {
    if (score >= 75) return 'green';
    if (score >= 55) return 'amber';
    return 'red';
  }
  function daysUntil(iso) {
    const today = new Date('2026-05-12T00:00:00');
    const t = new Date(iso + 'T00:00:00');
    const diff = Math.round((t - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */
  function viewDashboard() {
    const a = window.AppState.athlete;
    const S = window.AppState;
    const today = todayProgram();
    const hasReadiness = S.composedReadiness != null;
    const lastReadiness = hasReadiness ? S.composedReadiness : null;
    const hasLoad = S.weeklyLoad.length > 0;
    const acuteLoad = hasLoad ? S.weeklyLoad[S.weeklyLoad.length - 1] : 0;
    const chronicLoad = hasLoad ? S.weeklyLoad.slice(-4).reduce((a,b)=>a+b,0) / Math.min(4, S.weeklyLoad.length) : 0;
    const acwr = chronicLoad > 0 ? +(acuteLoad / chronicLoad).toFixed(2) : 0;
    const hasBW = S.bodyweight.length >= 2;
    const lastBW = a.weightKg ?? (S.bodyweight[S.bodyweight.length - 1]?.kg ?? 0);
    const bwDelta = hasBW ? (lastBW - S.bodyweight[Math.max(0, S.bodyweight.length - 5)].kg) : 0;

    let subtitle = '';
    if (!a.phase) {
      subtitle = 'Open Program to choose your phase and goals — then set up nutrition.';
    } else if (a.phase === 'in-season' && a.nextMatch) {
      const md = daysUntil(a.nextMatch);
      const label = md === 0 ? 'today' : md > 0 ? `MD-${md}` : `MD+${-md}`;
      subtitle = `In-season • ${label} • Next match ${new Date(a.nextMatch+'T00:00').toLocaleDateString('en-GB',{weekday:'short', day:'numeric', month:'short'})}`;
    } else if (a.phase === 'pre-season') {
      subtitle = 'Pre-season • Build sharpness for the campaign';
    } else if (a.phase === 'off-season') {
      subtitle = 'Off-season • Capacity build — earn your base';
    } else if (a.phase === 'rehab') {
      subtitle = 'Rehab phase • Progress through stages, return strong';
    } else {
      subtitle = `${a.phase} phase`;
    }

    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Good morning, ${esc(a.firstName)}.</h1>
          <p>${esc(subtitle)}</p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--ghost" data-nav="recovery"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Log wellness</button>
          <button class="btn btn--primary" data-nav="session"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>Start session</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <!-- READINESS -->
        <div class="card">
          <div class="card__head">
            <div class="card__title">Readiness</div>
            ${hasReadiness ? `<span class="chip chip--${readinessTone(lastReadiness) === 'green' ? 'success' : readinessTone(lastReadiness) === 'amber' ? 'warn' : 'danger'}">${readinessTone(lastReadiness).toUpperCase()}</span>` : '<span class="chip">No check-in yet</span>'}
          </div>
          ${hasReadiness ? `
            <div class="readiness">
              <div class="readiness__ring" id="readinessRing"></div>
              <div class="readiness__meta">
                <div class="readiness__label">Composite of sleep, soreness, mood & HRV</div>
                <div class="readiness__factors">
                  ${(() => {
                    const w = window.AppState.wellnessDraft;
                    const items = [
                      ['Sleep', `${w.sleepHr}h`, w.sleepHr >= 7.5 ? 'success' : 'warn'],
                      ['Soreness', `${w.soreness}/10`, w.soreness <= 3 ? 'success' : w.soreness <= 5 ? 'warn' : 'danger'],
                      ['Mood', `${w.mood}/10`, w.mood >= 7 ? 'success' : 'warn'],
                      ['HRV', `${w.hrv} ms`, w.hrv >= 70 ? 'success' : 'warn'],
                    ];
                    return items.map(([l, v, t]) => `<div class="readiness__factor"><span class="chip-dot" style="color:var(--${t})"></span>${esc(l)} ${esc(v)}</div>`).join('');
                  })()}
                </div>
              </div>
            </div>`
          : `
            <div class="empty" style="padding:18px;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <div style="font-weight:600; color:var(--text);">Submit your first daily check-in</div>
              <div style="font-size:12.5px;">Sleep, soreness, mood & HRV → composite score</div>
              <button class="btn btn--primary btn--sm" data-nav="recovery" style="margin-top:8px;">Open check-in</button>
            </div>`}
        </div>

        <!-- TODAY -->
        <div class="card">
          ${!today ? `
            <div class="empty" style="padding:24px;">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <div style="font-weight:600; color:var(--text);">No program set up yet</div>
              <div style="font-size:12.5px;">Open Program to pick your phase, goals, gym access, and weekly schedule.</div>
              <button class="btn btn--primary btn--sm" data-nav="program" style="margin-top:8px;">Set up program</button>
            </div>` : `
          <div class="card__head">
            <div class="card__title">Today — ${today.label ? esc(today.label) + ' ' : ''}${esc(today.focus)}</div>
            ${(() => {
              if (window.AppState.programDone.has(today.day)) return '<span class="chip chip--success">Done</span>';
              if (window.AppState.session) {
                const done = window.AppState.session.sets.flatMap(s => s.log).filter(l => l.done).length;
                const total = window.AppState.session.sets.flatMap(s => s.log).length;
                return `<span class="chip chip--warn">In progress ${done}/${total}</span>`;
              }
              return `<span class="chip chip--accent">${esc(today.type)}</span>`;
            })()}
          </div>
          <div class="row" style="gap:14px; align-items:flex-start;">
            <div style="flex:1; min-width:0;">
              <div class="muted" style="font-size:11.5px; margin-bottom:6px;">Session blocks</div>
              <ul style="margin:0; padding-left:18px; line-height:1.7; font-size:13px;">
                ${today.blocks.map(b => `<li>${esc(b.name)} <span class="muted">— ${b.items.length} exercises</span></li>`).join('')}
              </ul>
            </div>
            <div style="text-align:right;">
              <div class="stat__value num" style="font-size:22px;">${today.blocks.reduce((s,b)=>s+b.items.length,0)}</div>
              <div class="muted" style="font-size:11px;">EXERCISES</div>
              <button class="btn btn--primary btn--sm" data-nav="session" style="margin-top:8px;">${window.AppState.session ? 'Resume session' : 'Open session'}</button>
            </div>
          </div>`}
        </div>

        <!-- WEEKLY LOAD -->
        <div class="card span-2">
          <div class="card__head">
            <div class="card__title">Weekly training load</div>
            ${hasLoad ? `
            <div class="segmented" data-segment="loadRange">
              <button class="is-active" data-val="14">14 wks</button>
              <button data-val="8">8 wks</button>
              <button data-val="4">4 wks</button>
            </div>` : ''}
          </div>
          ${hasLoad ? `
            <div class="chart-wrap" id="loadChart" style="height:200px;"></div>
            <div class="row" style="margin-top:10px; gap:18px;">
              <div><span class="muted" style="font-size:11px;">Acute (this wk)</span><div class="num" style="font-weight:700;">${acuteLoad}</div></div>
              <div><span class="muted" style="font-size:11px;">Chronic (4 wk avg)</span><div class="num" style="font-weight:700;">${Math.round(chronicLoad)}</div></div>
              <div><span class="muted" style="font-size:11px;">A:C ratio</span><div class="num" style="font-weight:700; color: ${acwr>=.8 && acwr<=1.3 ? 'var(--success)' : 'var(--warn)'}">${acwr}</div></div>
              <div style="flex:1;"></div>
              <span class="chip ${acwr>=.8 && acwr<=1.3 ? 'chip--success' : 'chip--warn'}">${acwr>=.8 && acwr<=1.3 ? 'In safe zone' : 'Watch load'}</span>
            </div>`
          : `
            <div class="empty" style="padding:32px;">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="m7 15 4-4 4 4 5-6"/></svg>
              <div style="font-weight:600; color:var(--text);">No sessions logged yet</div>
              <div style="font-size:12.5px;">Complete your first session — load (RPE × min) appears here.</div>
              <button class="btn btn--primary btn--sm" data-nav="session" style="margin-top:8px;">Open today's session</button>
            </div>`}
        </div>

        <!-- BODYWEIGHT -->
        <div class="card">
          <div class="card__head">
            <div class="card__title">Bodyweight trend</div>
            <span class="chip">${a.weightKg} kg → ${a.targetWeightKg} kg goal</span>
          </div>
          ${hasBW ? `
            <div class="chart-wrap" id="bwChart" style="height:140px;"></div>
            <div class="row" style="margin-top:6px;">
              <div class="stat__delta ${bwDelta>=0?'up':'down'}">${bwDelta>=0?'+':''}${bwDelta.toFixed(1)} kg / 4 wks</div>
              <div class="muted" style="font-size:12px;">${a.goal && a.goal.includes('mass-gain') ? 'Mass gain phase' : a.goal && a.goal.includes('fat-loss') ? 'Cutting phase' : 'Stable phase'}</div>
            </div>`
          : `
            <div class="empty" style="padding:20px;">
              <div style="font-size:12.5px;">Log weight weekly to see trend.</div>
              <button class="btn btn--ghost btn--sm" id="logWeightBtn" style="margin-top:6px;">+ Log weight</button>
            </div>`}
        </div>

        <!-- SPRINT EXPOSURE -->
        <div class="card">
          <div class="card__head"><div class="card__title">Sprint exposures (m)</div></div>
          ${S.weeklyLoad.length >= 4 ? `
            <div class="chart-wrap" id="sprintChart" style="height:140px;"></div>
            <div class="row" style="margin-top:6px;">
              <span class="chip chip--accent">Target 280–340m</span>
            </div>`
          : `<div class="empty" style="padding:20px;"><div style="font-size:12.5px;">Sprint data builds over time.</div></div>`}
        </div>

        <!-- STREAK & COMPLIANCE -->
        <div class="card">
          <div class="card__head"><div class="card__title">Compliance streak</div></div>
          <div class="row" style="gap:16px;">
            <div style="font-family:var(--font-display); font-size:44px; font-weight:700; line-height:1;">${S.streakDays}</div>
            <div>
              <div class="num" style="font-size:13px; font-weight:600;">${S.streakDays === 1 ? 'day' : 'days'} no missed session</div>
              <div class="muted" style="font-size:12px;">${S.streakDays === 0 ? 'Start today to begin your streak' : `${Math.round(70 + S.streakDays)}% adherence`}</div>
            </div>
          </div>
          ${S.streakDays > 0 ? '<div class="chart-wrap" id="adherenceHeat" style="margin-top:12px;"></div>' : ''}
        </div>

        <!-- QUALITY BALANCE -->
        <div class="card">
          <div class="card__head"><div class="card__title">Training quality balance</div></div>
          ${S.streakDays > 3 ? '<div class="chart-wrap" id="qualityRadar" style="height:220px;"></div>'
          : '<div class="empty" style="padding:20px;"><div style="font-size:12.5px;">Complete a few sessions to see your balance.</div></div>'}
        </div>

        ${window.AppState.isDemo ? `
        <!-- NOTES (demo only) -->
        <div class="card span-2" id="notesCard">
          <div class="card__head">
            <div class="card__title">Red flags & notes</div>
            <span class="chip chip--warn" id="notesCount"></span>
          </div>
          <div class="list" id="notesList"></div>
        </div>` : ''}

      </div>
    `;
  }

  function attachDashboard() {
    const S = window.AppState;
    if (S.composedReadiness != null && document.getElementById('readinessRing')) {
      C.ring(document.getElementById('readinessRing'), S.composedReadiness, { size: 132 });
    }
    if (S.isDemo) renderNotes();
    // log-weight button (fresh user)
    const lwb = document.getElementById('logWeightBtn');
    if (lwb) lwb.onclick = () => {
      const v = prompt('Current weight (kg)?', String(S.athlete?.weightKg || 85));
      if (v && !isNaN(Number(v))) {
        const n = Number(v);
        S.athlete.weightKg = n;
        S.bodyweight.push({ w: `W${S.bodyweight.length}`, kg: n });
        window.App.toast(`Weight logged: ${n} kg`, 'success');
        window.App.refreshView();
      }
    };
    function renderNotes() {
      const all = [
        { id:'flag-hams', kind:'flag', title:'Hamstring load spike', sub:'Sprint volume up 18% wk-on-wk — consider 1 less max-velocity exposure', chip:'<span class="chip chip--warn">Monitor</span>' },
        { id:'coach-chins', kind:'coach', title:'Coach Hannah — "Add 2 sets on chin-ups today"', sub:'Posted 08:20 • Tactical: back-row pull volume bias', action:true },
        { id:'flag-ankle', kind:'flag', title:'Right ankle — strap during training', sub:'Stage 4/6 RTP — clearance scheduled 15 May', chip:'<span class="chip">Monitor</span>' },
      ].filter(n => !window.AppState.acknowledged.has(n.id));
      document.getElementById('notesCount').textContent = `${all.length} active`;
      const list = document.getElementById('notesList');
      if (!all.length) {
        list.innerHTML = '<div class="empty" style="padding:18px;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-11"/></svg><div>All clear. Nice work.</div></div>';
        return;
      }
      list.innerHTML = all.map(n => `
        <div class="list__item" data-note-id="${n.id}">
          <div class="list__lhs">
            <div class="thumb thumb--accent">
              ${n.kind === 'flag'
                ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>'
                : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7 9 18l-5-5"/></svg>'}
            </div>
            <div>
              <div class="list__title">${n.title}</div>
              <div class="list__sub">${n.sub}</div>
            </div>
          </div>
          ${n.action
            ? `<button class="btn btn--ghost btn--sm" data-ack="${n.id}">Acknowledge</button>`
            : n.chip || `<button class="btn btn--ghost btn--sm" data-ack="${n.id}">Dismiss</button>`}
        </div>`).join('');
      list.querySelectorAll('[data-ack]').forEach(b => b.addEventListener('click', () => {
        window.AppState.acknowledged.add(b.dataset.ack);
        renderNotes();
        window.App.toast('Acknowledged', 'success');
      }));
    }
    const loadEl = document.getElementById('loadChart');
    if (loadEl) {
      C.lineChart(loadEl, {
        data: S.weeklyLoad.map((y, i) => ({
          x: i === S.weeklyLoad.length - 1 ? 'W0' : `W-${S.weeklyLoad.length - 1 - i}`, y
        })), height: 200, suffix:' AU'
      });
    }
    const bwEl = document.getElementById('bwChart');
    if (bwEl) {
      C.lineChart(bwEl, { data: S.bodyweight.map(b => ({ x: b.w, y: b.kg })), height: 140, suffix:' kg', area:true });
    }
    const sprEl = document.getElementById('sprintChart');
    if (sprEl) {
      C.barChart(sprEl, {
        data: [
          { x:'W-5', y: 240 },{ x:'W-4', y: 280 },{ x:'W-3', y: 260 },
          { x:'W-2', y: 310 },{ x:'W-1', y: 290 },{ x:'W0', y: 320 },
        ], height: 140
      });
    }
    const adhEl = document.getElementById('adherenceHeat');
    if (adhEl) {
      // Demo: rich heatmap. Fresh: only paint cells you've actually trained.
      const cells = [];
      const demoPattern = [1,1,1,0.6,1,1,0.8,1,1,1,1,0,1,1,1,0.8,1,1,1,1,1,1,1,0.6,1,1,1,1];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 7; col++) {
          const i = row * 7 + col;
          const v = S.isDemo ? (demoPattern[i] ?? 1) : (i < S.streakDays ? 1 : 0);
          cells.push({ x: col, y: row, v, label: `Day ${i+1}: ${v>0.7?'session done':v>0?'partial':'missed'}` });
        }
      }
      C.heatmap(adhEl, cells, { cols: 7, rows: 4 });
    }
    const radEl = document.getElementById('qualityRadar');
    if (radEl) C.radar(radEl, R.QUALITY_BALANCE, { height: 220 });

    document.querySelectorAll('[data-segment="loadRange"]').forEach(seg => {
      seg.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-val]');
        if (!btn) return;
        seg.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const n = parseInt(btn.dataset.val, 10);
        const arr = S.weeklyLoad.slice(-n);
        C.lineChart(document.getElementById('loadChart'), {
          data: arr.map((y, i) => ({
            x: i === arr.length - 1 ? 'W0' : `W-${arr.length - 1 - i}`, y
          })),
          height: 200, suffix:' AU'
        });
      });
    });
  }

  /* =========================================================
     PROGRAM
     ========================================================= */
  function programOnboarding() {
    const S = window.AppState;
    const a = S.athlete;
    S.progDraft = S.progDraft || {
      phase: a.phase || 'pre-season',
      goal: Array.isArray(a.goal) ? a.goal.slice() : (a.goal ? [a.goal] : ['strength']),
      sessionsPerWeek: a.sessionsPerWeek || 4,
      gymAccess: a.gymAccess || 'full',
      nextMatch: a.nextMatch || '',
      injuryHistory: Array.isArray(a.injuryHistory) ? a.injuryHistory.slice() : [],
    };
    const d = S.progDraft;
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Set up your program</h1>
          <p>We'll build your week from these. You can edit anything later — including swap exercises, change days, or skip sessions.</p>
        </div>
      </div>

      <div class="grid grid--auto-md">
        <div class="card">
          <div class="card__head"><div class="card__title">Season phase</div></div>
          <div class="tilebox">
            ${[
              ['off-season','Off-season','Capacity build, lower intensity'],
              ['pre-season','Pre-season','Heavy block, intensification'],
              ['in-season','In-season','Match week (MD-X) structure'],
              ['rehab','Rehab','Return-to-play progression'],
            ].map(([v,l,s]) => `<button class="tile ${d.phase===v?'is-selected':''}" data-prog-tile="phase" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Sessions per week</div></div>
          <div class="tilebox">
            ${[2,3,4,5,6].map(n => `<button class="tile ${Number(d.sessionsPerWeek)===n?'is-selected':''}" data-prog-tile="sessionsPerWeek" data-val="${n}"><strong>${n}</strong><span>${n<=3?'Maintenance':n<=4?'Standard club':'Pro-level'}</span></button>`).join('')}
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Goal focus (pick one or more)</div></div>
          <div class="tilebox">
            ${[
              ['strength','Strength','Top-end max output'],
              ['speed','Speed','Acceleration + max velocity'],
              ['mass-gain','Mass gain','Lean tissue priority'],
              ['fat-loss','Fat loss','Body recomposition'],
              ['endurance','Endurance','Aerobic engine'],
              ['rtp','Return to play','Coming back from injury'],
              ['match-fitness','Match fitness','In-season sharpening'],
            ].map(([v,l,s]) => `<button class="tile ${d.goal.includes(v)?'is-selected':''}" data-prog-tile-multi="goal" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Gym access</div></div>
          <div class="tilebox">
            ${[
              ['full','Full commercial gym','Racks, sleds, machines, plyo'],
              ['limited','Limited / club gym','Barbell, DB, KB, bands'],
              ['home','Home setup','DBs, KBs, bands, bodyweight'],
            ].map(([v,l,s]) => `<button class="tile ${d.gymAccess===v?'is-selected':''}" data-prog-tile="gymAccess" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
        </div>

        ${d.phase === 'in-season' ? `
        <div class="card">
          <div class="card__head"><div class="card__title">Next match day</div></div>
          <div class="field"><label>Date (Sat usually)</label>
            <input class="input" type="date" value="${d.nextMatch}" data-prog="nextMatch" />
          </div>
          <div class="muted" style="font-size:12px; margin-top:6px;">Anchors MD-5 → MD+1. Leave blank to skip match-week structure.</div>
        </div>` : ''}

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Injury concerns (optional)</div></div>
          <input class="input" placeholder="e.g. Hamstring, AC joint" value="${esc(d.injuryHistory.join(', '))}" data-prog="injuryHistory" />
          <div class="muted" style="font-size:12px; margin-top:6px;">We'll add prehab for these areas.</div>
        </div>

        <div class="card span-2">
          <div class="row" style="justify-content:flex-end; gap:8px;">
            <button class="btn btn--primary" id="buildProgBtn">Build my program</button>
          </div>
        </div>
      </div>
    `;
  }

  function attachProgramOnboarding() {
    const S = window.AppState;
    const d = S.progDraft;
    document.querySelectorAll('[data-prog-tile]').forEach(b => b.onclick = () => {
      const k = b.dataset.progTile;
      const v = b.dataset.val;
      d[k] = (k === 'sessionsPerWeek') ? Number(v) : v;
      window.App.refreshView();
    });
    document.querySelectorAll('[data-prog-tile-multi]').forEach(b => b.onclick = () => {
      const k = b.dataset.progTileMulti;
      const v = b.dataset.val;
      const arr = d[k];
      const i = arr.indexOf(v);
      if (i >= 0) arr.splice(i, 1); else arr.push(v);
      document.querySelectorAll(`[data-prog-tile-multi="${k}"]`).forEach(x => x.classList.toggle('is-selected', arr.includes(x.dataset.val)));
    });
    document.querySelectorAll('[data-prog]').forEach(el => {
      el.addEventListener('input', () => {
        const k = el.dataset.prog;
        if (k === 'injuryHistory') d[k] = el.value.split(',').map(s => s.trim()).filter(Boolean);
        else d[k] = el.value;
      });
    });
    document.getElementById('buildProgBtn').onclick = () => {
      if (!d.goal.length) { window.App.toast('Pick at least one goal', 'warn'); return; }
      const a = S.athlete;
      Object.assign(a, {
        phase: d.phase,
        goal: d.goal,
        sessionsPerWeek: d.sessionsPerWeek,
        gymAccess: d.gymAccess,
        nextMatch: d.nextMatch || undefined,
        injuryHistory: d.injuryHistory,
      });
      S.program = R.buildProgram({
        phase: a.phase,
        gymAccess: a.gymAccess,
        sessionsPerWeek: a.sessionsPerWeek,
        primaryPosition: a.primaryPosition,
        goal: a.goal,
        nextMatch: a.nextMatch,
      });
      S.programSetup = true;
      window.App.toast('Program built ✓', 'success');
      window.App.refreshView();
    };
  }

  function viewProgram() {
    const S = window.AppState;
    if (!S.programSetup && !S.isDemo) return programOnboarding();
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Match-week program</h1>
          <p>Adapted for <strong>${esc(window.AppState.athlete.archetype)}</strong> • Phase: <strong>${esc(window.AppState.athlete.phase)}</strong> • ${getProgram().length} day plan • Gym: <strong>${esc(window.AppState.athlete.gymAccess)}</strong></p>
        </div>
        <div class="view-head__actions">
          <div class="segmented" data-segment="programView">
            <button class="is-active" data-val="week">Week</button>
            <button data-val="md">MD-X</button>
          </div>
          <button class="btn btn--ghost" data-export="pdf">Export PDF</button>
        </div>
      </div>

      <div class="md-track">
        ${getProgram().map(d => {
          const isToday = d === todayProgram();
          const isMd = d.label === 'MD';
          const isDone = window.AppState.programDone.has(d.day);
          const isOptional = d.optional;
          return `<div class="md-day ${isToday?'is-today':''} ${isMd?'is-md':''}" style="${isOptional?'opacity:.6;':''}">
            <div class="md-day__label">${esc(d.label || d.day)} • ${esc(d.day)}</div>
            <div class="md-day__title">${esc(d.focus)}</div>
            <div class="md-day__meta">${esc((d.cues && d.cues[0]) || '')}</div>
            <span class="md-day__tag">${esc(d.type)}${isOptional?' • optional':''}</span>
            ${isDone ? '<span class="chip chip--success" style="margin-top:8px;">Done</span>' : ''}
          </div>`;
        }).join('')}
      </div>

      <div class="grid grid--auto-lg">
        ${getProgram().map((d, i) => sessionCard(d, i)).join('')}
      </div>
    `;
  }

  function sessionCard(d, dayIndex) {
    const isToday = d === todayProgram();
    const isDone = window.AppState.programDone.has(d.day);
    return `
      <div class="card" data-session-day="${esc(d.day)}" data-day-index="${dayIndex}">
        <div class="card__head">
          <div class="card__title">
            ${d.label ? `<span class="chip chip--accent">${esc(d.label)}</span>` : ''}
            ${esc(d.focus)}
          </div>
          <div class="row" style="gap:6px;">
            ${isToday ? '<span class="chip chip--accent">Today</span>' : (isDone ? '<span class="chip chip--success">Done</span>' : `<span class="chip">${esc(d.day)}</span>`)}
            <button class="iconbtn iconbtn--sm" title="Session actions" data-day-menu="${dayIndex}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            </button>
          </div>
        </div>
        ${d.blocks.map((b, bi) => `
          <div style="margin-top:8px;" data-block-index="${bi}">
            <div class="row row--between" style="margin-bottom:6px;">
              <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700;">${esc(b.name)}</div>
              <button class="btn btn--ghost btn--sm" data-add-exercise="${dayIndex}:${bi}">+ Add exercise</button>
            </div>
            <div class="list" style="font-size:13px;">
              ${b.items.map((it, ii) => `
                <div class="list__item" style="padding: 8px 0;">
                  <div class="list__lhs">
                    <div class="thumb">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v18M18 3v18M3 9h18M3 15h18"/></svg>
                    </div>
                    <div>
                      <div class="list__title">${esc(it.ex)} ${it.substituted?'<span class="chip" style="font-size:10px;">swapped</span>':''}</div>
                      <div class="list__sub">${esc(it.sets)} × ${esc(it.reps)} ${it.rpe?` • RPE ${it.rpe}`:''} ${it.tempo?` • Tempo ${esc(it.tempo)}`:''} ${it.note?` • ${esc(it.note)}`:''}</div>
                    </div>
                  </div>
                  <div class="list__rhs">
                    <span class="chip">Rest ${esc(it.rest)}</span>
                    <button class="iconbtn iconbtn--sm" title="Substitute" data-sub-ex="${dayIndex}:${bi}:${ii}">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h11l-2-2M17 17H6l2 2"/></svg>
                    </button>
                    <button class="iconbtn iconbtn--sm" title="Remove" data-remove-ex="${dayIndex}:${bi}:${ii}">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18l12-12"/></svg>
                    </button>
                  </div>
                </div>`).join('')}
              ${b.items.length === 0 ? '<div class="empty" style="padding:10px;"><div class="muted" style="font-size:12px;">Empty block — add an exercise above.</div></div>' : ''}
            </div>
          </div>
        `).join('')}
        ${d.cues && d.cues.length ? `
          <div style="margin-top:10px;">
            <div class="muted" style="font-size:11px;">Coach cues</div>
            <div class="row row--wrap" style="margin-top:6px;">
              ${d.cues.map(c => `<span class="cue-pill">${esc(c)}</span>`).join('')}
            </div>
          </div>` : ''}
        ${isToday ? `<button class="btn btn--primary btn--block" data-nav="session" style="margin-top:14px;">Start this session</button>` : ''}
      </div>
    `;
  }

  function attachProgram() {
    const S = window.AppState;
    if (!S.programSetup && !S.isDemo) { attachProgramOnboarding(); return; }
    const a = S.athlete;
    const gym = a.gymAccess || 'full';
    const program = getProgram();

    // Substitute — uses real exercise DB filtered by equipment
    document.querySelectorAll('[data-sub-ex]').forEach(b => {
      b.addEventListener('click', () => {
        const [di, bi, ii] = b.dataset.subEx.split(':').map(Number);
        const item = program[di].blocks[bi].items[ii];
        const current = R.exById(item.exId) || R.EXERCISES[0];
        const subs = R.getSubstitutions(item.exId, gym);
        const fullSubs = R.getSubstitutions(item.exId, 'full').filter(s => !subs.find(x => x.id === s.id));
        window.App.openModal(`
          <h3>Substitute "${esc(current.name)}"</h3>
          <p class="muted" style="font-size:13px;">Same pattern (<strong>${esc(current.pattern)}</strong>) & category (<strong>${esc(current.cat)}</strong>). Filtered by your gym access (<strong>${esc(gym)}</strong>).</p>
          ${subs.length === 0 ? '<div class="empty" style="padding:14px;"><div>No matches with your current equipment.</div></div>' : `
          <div class="list" style="margin-top:10px;">
            ${subs.map(s => `
              <button class="list__item" data-pick-sub="${esc(s.id)}" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%;">
                <div class="list__lhs"><div class="thumb">↺</div>
                  <div><div class="list__title">${esc(s.name)}</div><div class="list__sub">${esc(s.equip.join(' • '))} • ${esc(s.intensity)} intensity</div></div>
                </div>
                <span class="chip">Swap</span>
              </button>`).join('')}
          </div>`}
          ${fullSubs.length ? `
          <details style="margin-top:14px;">
            <summary class="muted" style="cursor:pointer; font-size:12px;">${fullSubs.length} more options need different equipment</summary>
            <div class="list" style="margin-top:8px;">
              ${fullSubs.map(s => `
                <div class="list__item" style="opacity:.55;">
                  <div class="list__lhs"><div class="thumb">·</div>
                    <div><div class="list__title">${esc(s.name)}</div><div class="list__sub">Needs: ${esc(s.equip.join(', '))}</div></div>
                  </div>
                </div>`).join('')}
            </div>
          </details>` : ''}
          <div class="row" style="margin-top:14px; justify-content:flex-end;">
            <button class="btn btn--ghost" data-close-modal>Close</button>
          </div>
        `);
        document.querySelectorAll('[data-pick-sub]').forEach(p => p.onclick = () => {
          const nx = R.exById(p.dataset.pickSub);
          item.exId = nx.id;
          item.ex = nx.name;
          item.cues = nx.cues;
          item.substituted = true;
          window.App.closeModal();
          window.App.toast(`Swapped → ${nx.name}`, 'success');
          window.App.refreshView();
        });
      });
    });

    // Remove exercise
    document.querySelectorAll('[data-remove-ex]').forEach(b => b.onclick = () => {
      const [di, bi, ii] = b.dataset.removeEx.split(':').map(Number);
      const removed = program[di].blocks[bi].items.splice(ii, 1)[0];
      window.App.toast(`Removed ${removed.ex}`, 'info');
      window.App.refreshView();
    });

    // Add exercise from library
    document.querySelectorAll('[data-add-exercise]').forEach(b => b.onclick = () => {
      const [di, bi] = b.dataset.addExercise.split(':').map(Number);
      openExerciseLibrary({ gym, onPick: (ex) => {
        program[di].blocks[bi].items.push({
          exId: ex.id, ex: ex.name, sets: 3, reps: '8', rest: '90s',
          cues: ex.cues, originalExId: ex.id, substituted: false,
        });
        window.App.closeModal();
        window.App.toast(`Added ${ex.name}`, 'success');
        window.App.refreshView();
      }});
    });

    // Day menu
    document.querySelectorAll('[data-day-menu]').forEach(b => b.onclick = () => {
      const di = Number(b.dataset.dayMenu);
      const d = program[di];
      const done = window.AppState.programDone.has(d.day);
      window.App.openModal(`
        <h3>${esc(d.day)}: ${esc(d.focus)}</h3>
        <p class="muted" style="font-size:13px;">Adjust this session.</p>
        <div class="list" style="margin-top:10px;">
          <button class="list__item" data-day-action="toggle-done" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%;">
            <div class="list__lhs"><div class="thumb">${done?'✓':'○'}</div><div><div class="list__title">${done?'Mark as not done':'Mark as completed'}</div></div></div>
            <span class="chip">${done?'done':'pending'}</span>
          </button>
          <button class="list__item" data-day-action="toggle-optional" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%;">
            <div class="list__lhs"><div class="thumb">${d.optional?'⊘':'•'}</div><div><div class="list__title">${d.optional?'Make required':'Mark as optional'}</div></div></div>
          </button>
          <button class="list__item" data-day-action="move-day" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%;">
            <div class="list__lhs"><div class="thumb">↔</div><div><div class="list__title">Move to a different day</div></div></div>
          </button>
          <button class="list__item" data-day-action="clear" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%; color:var(--danger);">
            <div class="list__lhs"><div class="thumb">⌫</div><div><div class="list__title">Clear all exercises</div></div></div>
          </button>
        </div>
        <div class="row" style="margin-top:14px; justify-content:flex-end;">
          <button class="btn btn--ghost" data-close-modal>Close</button>
        </div>
      `);
      document.querySelectorAll('[data-day-action]').forEach(act => act.onclick = () => {
        const a = act.dataset.dayAction;
        if (a === 'toggle-done') {
          if (window.AppState.programDone.has(d.day)) window.AppState.programDone.delete(d.day);
          else window.AppState.programDone.add(d.day);
          window.App.closeModal();
          window.App.refreshView();
          window.App.toast(window.AppState.programDone.has(d.day) ? 'Marked done' : 'Marked pending', 'success');
        } else if (a === 'toggle-optional') {
          d.optional = !d.optional;
          window.App.closeModal();
          window.App.refreshView();
          window.App.toast(d.optional ? 'Now optional' : 'Now required', 'info');
        } else if (a === 'move-day') {
          openMoveDay(di);
        } else if (a === 'clear') {
          if (confirm('Clear all exercises from this session?')) {
            d.blocks.forEach(b => b.items = []);
            window.App.closeModal();
            window.App.refreshView();
            window.App.toast('Session cleared', 'warn');
          }
        }
      });
    });

    document.querySelectorAll('[data-export]').forEach(b => b.onclick = () => {
      const kind = b.dataset.export.toUpperCase();
      window.App.toast(`${kind} export prepared — check Downloads (demo)`, 'success');
    });
  }

  function openExerciseLibrary({ gym, onPick, currentItem }) {
    const allCats = ['all','strength','power','speed','conditioning','mobility','prehab','skill'];
    let cat = 'all', q = '';

    function listExercises() {
      return R.EXERCISES
        .filter(e => cat === 'all' || e.cat === cat)
        .filter(e => R.isExAvailable(e, gym))
        .filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.pattern.toLowerCase().includes(q.toLowerCase()));
    }

    function paint() {
      const list = listExercises();
      const body = document.getElementById('libBody');
      if (!body) return;
      body.innerHTML = list.length === 0
        ? '<div class="empty" style="padding:20px;"><div>No exercises match. Try a different filter.</div></div>'
        : list.map(e => `
          <button class="list__item" data-pick-lib="${esc(e.id)}" style="cursor:pointer; background:transparent; border:0; text-align:left; width:100%;">
            <div class="list__lhs">
              <div class="thumb">${esc(e.cat[0].toUpperCase())}</div>
              <div>
                <div class="list__title">${esc(e.name)}</div>
                <div class="list__sub">${esc(e.cat)} • ${esc(e.pattern)} • ${esc(e.equip.join(', '))} • ${esc(e.intensity)}</div>
              </div>
            </div>
            <span class="chip chip--accent">Pick</span>
          </button>`).join('');
      body.querySelectorAll('[data-pick-lib]').forEach(b => b.onclick = () => {
        const ex = R.exById(b.dataset.pickLib);
        onPick(ex);
      });
    }

    window.App.openModal(`
      <h3>Exercise library</h3>
      <p class="muted" style="font-size:13px;">${R.EXERCISES.length} exercises • filtered by your gym (<strong>${esc(gym)}</strong>).</p>
      <div class="row row--wrap" style="margin-top:10px; gap:6px;">
        ${allCats.map(c => `<button class="chip ${c==='all'?'chip--accent':''}" data-lib-cat="${c}">${esc(c)}</button>`).join('')}
      </div>
      <div class="field" style="margin-top:10px;">
        <input class="input" id="libSearch" placeholder="Search by name or pattern…" />
      </div>
      <div id="libBody" style="margin-top:10px; max-height:50vh; overflow:auto;"></div>
      <div class="row" style="margin-top:14px; justify-content:flex-end;">
        <button class="btn btn--ghost" data-close-modal>Close</button>
      </div>
    `);
    paint();
    document.querySelectorAll('[data-lib-cat]').forEach(b => b.onclick = () => {
      cat = b.dataset.libCat;
      document.querySelectorAll('[data-lib-cat]').forEach(x => x.classList.toggle('chip--accent', x.dataset.libCat === cat));
      paint();
    });
    document.getElementById('libSearch').oninput = (e) => { q = e.target.value; paint(); };
    document.getElementById('libSearch').focus();
  }

  function openMoveDay(di) {
    const program = getProgram();
    const d = program[di];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    window.App.openModal(`
      <h3>Move "${esc(d.focus)}"</h3>
      <p class="muted" style="font-size:13px;">Pick a new day for this session.</p>
      <div class="tilebox" style="margin-top:10px;">
        ${days.map(day => `<button class="tile ${d.day===day?'is-selected':''}" data-move-to="${day}">
          <strong>${day}</strong><span>${day===d.day?'Current':''}</span>
        </button>`).join('')}
      </div>
      <div class="row" style="margin-top:14px; justify-content:flex-end;">
        <button class="btn btn--ghost" data-close-modal>Close</button>
      </div>
    `);
    document.querySelectorAll('[data-move-to]').forEach(b => b.onclick = () => {
      d.day = b.dataset.moveTo;
      window.App.closeModal();
      window.App.refreshView();
      window.App.toast(`Moved to ${b.dataset.moveTo}`, 'success');
    });
  }

  /* =========================================================
     SESSION TRACKER
     ========================================================= */
  function viewSession() {
    const today = todayProgram();
    if (!today) {
      return html`
        <div class="view-head">
          <div class="view-head__title">
            <h1>No session today</h1>
            <p>Set up your program first to generate a session.</p>
          </div>
        </div>
        <div class="card">
          <div class="empty" style="padding:48px;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 5v14l11-7z"/></svg>
            <div style="font-weight:600; color:var(--text);">No program yet</div>
            <div style="font-size:13px;">Pick your phase, goals, and gym access — we'll build the week.</div>
            <button class="btn btn--primary" data-nav="program" style="margin-top:10px;">Set up program</button>
          </div>
        </div>`;
    }
    const baseExs = today.blocks.flatMap(b => b.items.map(it => ({ ...it, block: b.name })));
    if (!window.AppState.session) {
      window.AppState.session = {
        exIndex: 0,
        sets: baseExs.map(e => ({ ex: e.ex, targets: e, log: makeEmptySets(e) })),
        startedAt: Date.now(),
        restEndsAt: 0,
        notes: '',
        addedCount: 0,
      };
    }
    // Merge any extra exercises added from Position view
    const extras = window.AppState.extraExercises || [];
    if (extras.length) {
      const session = window.AppState.session;
      extras.forEach(e => {
        const targets = { ...e, sets: e.sets || 3 };
        session.sets.push({ ex: e.ex, targets, log: makeEmptySets(targets) });
      });
      session.addedCount = (session.addedCount || 0) + extras.length;
      window.AppState.extraExercises = [];
    }
    const state = window.AppState.session;

    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>${esc(today.focus)} <span class="chip chip--accent">${esc(today.label)}</span></h1>
          <p>Live session • Exercise <span class="num">${state.exIndex + 1}</span> of <span class="num">${state.sets.length}</span></p>
        </div>
        <div class="view-head__actions">
          <span class="chip chip--info" id="liveClock">00:00</span>
          <button class="btn btn--ghost" id="warmupBtn">Warm-up checklist</button>
          <button class="btn btn--danger" id="endBtn">End session</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card span-2">
          <div class="card__head">
            <div class="card__title" id="exTitle"></div>
            <span class="chip" id="exTarget"></span>
          </div>
          <div class="exercise-card__cues" id="exCues"></div>

          <div id="setsTable" style="margin-top:12px; display:flex; flex-direction:column; gap:6px;"></div>

          <div class="row" style="margin-top:10px;">
            <button class="btn btn--ghost btn--sm" id="addSetBtn">+ Add set</button>
            <div style="flex:1"></div>
            <button class="btn btn--ghost btn--sm" id="prevExBtn">‹ Previous</button>
            <button class="btn btn--primary btn--sm" id="nextExBtn">Next exercise ›</button>
          </div>

          <div class="rest-banner" id="restBanner" hidden>
            <span><strong id="restLabel">Rest</strong> — keep loose, breathe deep</span>
            <span class="mono num" id="restTimer">02:00</span>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Session list</div></div>
          <div class="list" id="exList" style="font-size:13px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Notes & feel</div></div>
          <div class="field">
            <label>How did it feel?</label>
            <textarea class="textarea" id="sessionNotes" placeholder="Movement quality, fatigue, anything stand-out…">${esc(state.notes)}</textarea>
          </div>
          <div class="field" style="margin-top:10px;">
            <label>Perceived fatigue (RPE)</label>
            <input type="range" min="1" max="10" value="7" id="rpeRange" />
            <div class="row row--between">
              <span class="muted" style="font-size:11px;">1 • Easy</span>
              <span class="num" id="rpeVal">7</span>
              <span class="muted" style="font-size:11px;">10 • Max</span>
            </div>
          </div>
          <button class="btn btn--primary btn--block" style="margin-top:12px;" id="finishBtn">Finish & save</button>
        </div>

      </div>
    `;
  }

  function makeEmptySets(target) {
    const n = Number(target.sets) || 3;
    return Array.from({ length: n }, (_, i) => ({ reps: '', kg: '', rpe: '', done: false }));
  }

  function attachSession() {
    if (!todayProgram()) return;
    const state = window.AppState.session;
    const today = todayProgram();
    renderExercise();
    renderExList();

    const intId = setInterval(() => {
      const clockEl = document.getElementById('liveClock');
      if (!clockEl) return; // view unmounted
      const ms = Date.now() - state.startedAt;
      const total = Math.floor(ms / 1000);
      clockEl.textContent =
        `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
      if (state.restEndsAt) {
        const left = Math.max(0, Math.ceil((state.restEndsAt - Date.now())/1000));
        const banner = document.getElementById('restBanner');
        if (left === 0) {
          state.restEndsAt = 0;
          if (banner) banner.hidden = true;
          window.App.toast("Rest complete — let's go.", 'success');
        } else {
          const t = document.getElementById('restTimer');
          if (t) t.textContent = `${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
        }
      }
    }, 500);
    window.AppState.intervals.push(intId);

    document.getElementById('addSetBtn').onclick = () => {
      state.sets[state.exIndex].log.push({ reps:'', kg:'', rpe:'', done:false });
      renderExercise();
    };
    document.getElementById('prevExBtn').onclick = () => {
      if (state.exIndex > 0) { state.exIndex--; renderExercise(); renderExList(); }
    };
    document.getElementById('nextExBtn').onclick = () => {
      if (state.exIndex < state.sets.length - 1) { state.exIndex++; renderExercise(); renderExList(); }
      else { window.App.toast('Last exercise complete — finish to save.', 'success'); }
    };
    document.getElementById('endBtn').onclick = () => {
      if (confirm('End session early?')) { window.AppState.session = null; window.App.navigate('dashboard'); window.App.toast('Session aborted.', 'warn'); }
    };
    document.getElementById('finishBtn').onclick = () => {
      window.App.openModal(finishSummary());
    };
    document.getElementById('rpeRange').oninput = (e) => document.getElementById('rpeVal').textContent = e.target.value;
    document.getElementById('warmupBtn').onclick = () => window.App.openModal(warmupModal());
    document.getElementById('sessionNotes').oninput = (e) => state.notes = e.target.value;

    function renderExercise() {
      const ex = state.sets[state.exIndex];
      const t = ex.targets;
      document.getElementById('exTitle').textContent = t.ex;
      document.getElementById('exTarget').textContent = `${t.sets} × ${t.reps} ${t.rpe?`• RPE ${t.rpe}`:''}`;
      const cuesEl = document.getElementById('exCues');
      cuesEl.innerHTML = (t.cues || ['Quality reps','Brace before lift','Full range of motion']).map(c => `<span class="cue-pill">${esc(c)}</span>`).join('');

      const tbl = document.getElementById('setsTable');
      tbl.innerHTML = `<div class="set-row" style="background:transparent; border:0;">
        <div class="col-h">#</div>
        <div class="col-h">Reps</div>
        <div class="col-h">Load</div>
        <div class="col-h hide-mobile">RPE</div>
        <div class="col-h hide-mobile">Rest</div>
        <div class="col-h">Target</div>
        <div></div>
      </div>` + ex.log.map((s, i) => `
        <div class="set-row ${s.done?'is-done':''}" data-set-index="${i}">
          <div class="num">${i+1}</div>
          <input class="input set-input" type="number" inputmode="numeric" placeholder="—" value="${s.reps}" data-f="reps" />
          <input class="input set-input" type="number" inputmode="decimal" placeholder="—" value="${s.kg}" data-f="kg" />
          <input class="input set-input hide-mobile" type="number" inputmode="decimal" placeholder="—" value="${s.rpe}" data-f="rpe" />
          <div class="muted hide-mobile" style="font-size:11.5px; text-align:center;">${esc(t.rest||'—')}</div>
          <div class="muted" style="font-size:11.5px; text-align:center;">${esc(t.reps)} reps</div>
          <button class="iconbtn iconbtn--sm" data-mark-done aria-label="Mark set complete">${s.done?'✓':'•'}</button>
        </div>`).join('');

      tbl.querySelectorAll('.set-row[data-set-index]').forEach(row => {
        const i = parseInt(row.dataset.setIndex, 10);
        row.querySelectorAll('input').forEach(inp => {
          inp.addEventListener('input', () => { ex.log[i][inp.dataset.f] = inp.value; });
        });
        row.querySelector('[data-mark-done]').addEventListener('click', () => {
          ex.log[i].done = !ex.log[i].done;
          renderExercise(); renderExList();
          if (ex.log[i].done) {
            const restSec = parseInt(String(t.rest||'90').replace(/[^\d]/g,''), 10) || 90;
            state.restEndsAt = Date.now() + restSec * 1000;
            document.getElementById('restBanner').hidden = false;
            document.getElementById('restLabel').textContent = `Rest ${restSec}s`;
            // PB check
            if (i === ex.log.length - 1 && ex.log[i].kg && Number(ex.log[i].kg) >= 0.95 * (window.AppState.bestKg[t.ex] || Number(ex.log[i].kg))) {
              window.AppState.bestKg[t.ex] = Math.max(window.AppState.bestKg[t.ex]||0, Number(ex.log[i].kg));
              window.App.toast(`💪 New PB on ${t.ex}: ${ex.log[i].kg} kg`, 'success');
            }
          }
        });
      });
    }
    function renderExList() {
      document.getElementById('exList').innerHTML = state.sets.map((s, i) => `
        <div class="list__item" style="padding:8px 0;">
          <div class="list__lhs">
            <div class="thumb ${s.log.every(x=>x.done)?'thumb--accent':''}">
              ${s.log.every(x=>x.done) ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-11"/></svg>' : (i+1)}
            </div>
            <div>
              <div class="list__title" style="font-size:13px;">${esc(s.ex)}</div>
              <div class="list__sub">${esc(s.targets.sets)} × ${esc(s.targets.reps)}</div>
            </div>
          </div>
          <button class="btn btn--ghost btn--sm" data-goto="${i}">${i===state.exIndex?'Active':'Open'}</button>
        </div>`).join('');
      document.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => {
        state.exIndex = parseInt(b.dataset.goto, 10);
        renderExercise(); renderExList();
      });
    }
  }

  function warmupModal() {
    const items = [
      'Easy bike or rower — 5 min',
      'Hip 90/90 flow — 2 × 6/side',
      'World’s greatest stretch — 2 × 4/side',
      'Pogos & A-skips — 2 × 20m',
      'Banded glute series — 2 × 10/dir',
      'Wall drill — 2 × 5/side',
    ];
    return `
      <h3>Warm-up checklist</h3>
      <p class="muted" style="font-size:13px;">Tick as you go. Aim for ~12 min total.</p>
      <div class="list" style="margin-top:10px;">
        ${items.map((t, i) => `
          <label class="list__item" style="cursor:pointer; padding:10px 0;">
            <div class="list__lhs">
              <input type="checkbox" id="wu${i}" />
              <span class="list__title" style="font-size:13.5px;">${esc(t)}</span>
            </div>
          </label>`).join('')}
      </div>
      <div class="row" style="margin-top:14px; justify-content:flex-end;">
        <button class="btn btn--primary" data-close-modal>Close</button>
      </div>
    `;
  }

  function finishSummary() {
    const s = window.AppState.session;
    const completed = s.sets.flatMap(ex => ex.log).filter(l => l.done).length;
    const total = s.sets.flatMap(ex => ex.log).length;
    const elapsed = Math.floor((Date.now() - s.startedAt) / 60000);
    const rpe = document.getElementById('rpeVal')?.textContent || 7;
    const load = elapsed * Number(rpe);
    return `
      <h3>Session complete 💥</h3>
      <p class="muted" style="font-size:13px;">Nice work. Here's your summary.</p>
      <div class="grid grid--3" style="margin-top:14px;">
        <div class="stat card--flat" style="padding:14px;">
          <div class="stat__label">Sets done</div>
          <div class="stat__value num">${completed}/${total}</div>
        </div>
        <div class="stat card--flat" style="padding:14px;">
          <div class="stat__label">Time</div>
          <div class="stat__value num">${elapsed} min</div>
        </div>
        <div class="stat card--flat" style="padding:14px;">
          <div class="stat__label">Load (RPE × min)</div>
          <div class="stat__value num">${load}</div>
        </div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>Post-session: how was your recovery feel?</label>
        <div class="row" style="gap:6px; flex-wrap:wrap;">
          ${['Fresh','OK','Drained','Hammered'].map(o => `<button class="btn btn--ghost btn--sm" data-feel="${o}">${o}</button>`).join('')}
        </div>
      </div>
      <div class="row" style="margin-top:18px; justify-content:flex-end; gap:8px;">
        <button class="btn btn--ghost" data-close-modal>Back</button>
        <button class="btn btn--primary" id="saveSessionBtn">Save & finish</button>
      </div>
    `;
  }

  /* =========================================================
     ANALYTICS
     ========================================================= */
  function viewAnalytics() {
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Performance analytics</h1>
          <p>14 weeks rolling • Strength, speed, conditioning & wellness</p>
        </div>
        <div class="view-head__actions">
          <div class="segmented" data-segment="analyticsRange">
            <button data-val="4">4 wks</button>
            <button data-val="8">8 wks</button>
            <button class="is-active" data-val="14">14 wks</button>
          </div>
          <button class="btn btn--ghost" data-export="csv">Export CSV</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card">
          <div class="card__head"><div class="card__title">Acute : Chronic load ratio</div><span class="chip chip--success">Safe zone</span></div>
          <div class="chart-wrap" id="acwrChart" style="height:170px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Readiness trend</div></div>
          <div class="chart-wrap" id="readinessChart" style="height:170px;"></div>
        </div>

        <div class="card span-2">
          <div class="card__head">
            <div class="card__title">Strength progression — key lifts</div>
            <div class="segmented" data-segment="liftPick">
              <button class="is-active" data-val="Back Squat">Back Squat</button>
              <button data-val="Trap Bar DL">Trap Bar DL</button>
              <button data-val="Bench Press">Bench</button>
              <button data-val="Hang Clean">Hang Clean</button>
            </div>
          </div>
          <div class="chart-wrap" id="strengthChart" style="height:220px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Sprint progression — 10m & 40m</div></div>
          <div class="chart-wrap" id="sprintTrend" style="height:170px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Session RPE × duration</div></div>
          <div class="chart-wrap" id="rpeDurChart" style="height:170px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Match readiness</div></div>
          <div class="readiness">
            <div class="readiness__ring" id="readinessRing2"></div>
            <div class="readiness__meta">
              <div class="readiness__label">Combined load tolerance, wellness, & sprint exposure</div>
              <div class="progress" style="margin-top:8px;">
                <div class="progress__row"><span class="muted">Sprint exposure</span><span class="num">92%</span></div>
                <div class="progress__bar"><div class="progress__fill" style="width:92%"></div></div>
              </div>
              <div class="progress" style="margin-top:8px;">
                <div class="progress__row"><span class="muted">Strength minimums</span><span class="num">100%</span></div>
                <div class="progress__bar"><div class="progress__fill" style="width:100%"></div></div>
              </div>
              <div class="progress" style="margin-top:8px;">
                <div class="progress__row"><span class="muted">Contact preparedness</span><span class="num">76%</span></div>
                <div class="progress__bar"><div class="progress__fill is-warn" style="width:76%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Adherence</div><span class="chip chip--success">94%</span></div>
          <table class="table">
            <thead><tr><th>Week</th><th class="num">Planned</th><th class="num">Done</th><th class="num">Rate</th></tr></thead>
            <tbody>
              ${[['W-4',5,5,'100%'],['W-3',5,5,'100%'],['W-2',5,4,'80%'],['W-1',5,5,'100%'],['W0',5,3,'60%']].map(r =>
                `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;
  }

  function attachAnalytics() {
    const S = window.AppState;
    let weeks = 14;

    function emptyMsg(el, text) {
      el.innerHTML = `<div class="empty" style="padding:20px;"><div style="font-size:12.5px;">${esc(text)}</div></div>`;
    }

    function drawAll() {
      const load = S.weeklyLoad.slice(-weeks);
      const readinessHistory = S.isDemo ? R.READINESS_HISTORY.slice(-weeks) : S.wellnessHistory.map(w => composeR(w));
      const acwrEl = document.getElementById('acwrChart');
      const readEl = document.getElementById('readinessChart');
      const sprEl = document.getElementById('sprintTrend');

      if (load.length >= 4) {
        const acwrSeries = [];
        for (let i = 3; i < load.length; i++) {
          const ch = load.slice(i-3, i+1).reduce((a,b)=>a+b,0)/4;
          acwrSeries.push(+(load[i] / ch).toFixed(2));
        }
        C.acwrChart(acwrEl, acwrSeries);
      } else emptyMsg(acwrEl, 'Need 4+ weeks of sessions to compute A:C ratio.');

      if (readinessHistory.length) {
        C.lineChart(readEl, {
          data: readinessHistory.map((y, i) => ({
            x: i === readinessHistory.length - 1 ? 'W0' : `W-${readinessHistory.length - 1 - i}`, y
          })), height: 170, yMin: 50, yMax: 100
        });
      } else emptyMsg(readEl, 'Submit daily wellness check-ins to see readiness trend.');

      if (S.isDemo) {
        C.lineChart(sprEl, {
          data: R.SPRINT_PROG.slice(-Math.ceil(weeks/2)).map(s => ({x: s.w, y: s.s40})),
          height:170, suffix:' s', area: true
        });
      } else emptyMsg(sprEl, 'Log sprint times to see progression.');
    }

    function composeR(w) {
      const sleep = Math.min(100, (w.sleepHr / 8.5) * 100);
      const sleepQ = (w.sleepQ / 10) * 100;
      const sore = ((10 - w.soreness) / 10) * 100;
      const mood = (w.mood / 10) * 100;
      const stress = ((10 - w.stress) / 10) * 100;
      const hyd = (w.hydration / 10) * 100;
      const hrv = Math.min(100, (w.hrv / 90) * 100);
      return Math.round(0.18*sleep + 0.12*sleepQ + 0.18*sore + 0.10*mood + 0.10*stress + 0.10*hyd + 0.22*hrv);
    }

    function renderLift(name) {
      const series = S.strengthHist[name] || [];
      const el = document.getElementById('strengthChart');
      if (!series.length) { emptyMsg(el, `No ${name} history yet — log it in a session.`); return; }
      const s2 = series.slice(-weeks);
      C.lineChart(el, {
        data: s2.map((y, i) => ({
          x: i === s2.length - 1 ? 'W0' : `W-${s2.length - 1 - i}`, y
        })), height: 220, suffix:' kg', area: true
      });
    }

    drawAll();
    renderLift('Back Squat');

    document.querySelectorAll('[data-segment="analyticsRange"] button').forEach(b => b.onclick = () => {
      document.querySelectorAll('[data-segment="analyticsRange"] button').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      weeks = parseInt(b.dataset.val, 10);
      drawAll();
      const activeLift = document.querySelector('[data-segment="liftPick"] button.is-active');
      renderLift(activeLift ? activeLift.dataset.val : 'Back Squat');
    });

    document.querySelectorAll('[data-segment="liftPick"] button').forEach(b => b.onclick = () => {
      document.querySelectorAll('[data-segment="liftPick"] button').forEach(x=>x.classList.remove('is-active'));
      b.classList.add('is-active');
      renderLift(b.dataset.val);
    });

    const rpeEl = document.getElementById('rpeDurChart');
    if (S.isDemo) {
      C.barChart(rpeEl, {
        data: R.SESSION_RPE.map(s => ({ x: s.d, y: s.rpe * s.mins, color: s.type === 'match' ? cssVar('--accent') : undefined })),
        height: 170
      });
    } else emptyMsg(rpeEl, 'No session RPEs logged yet.');

    const ring2 = document.getElementById('readinessRing2');
    if (ring2) C.ring(ring2, S.composedReadiness ?? 0, { size: 132 });

    document.querySelectorAll('[data-export]').forEach(b => b.onclick = () => {
      window.App.toast(`${b.dataset.export.toUpperCase()} export prepared (demo)`, 'success');
    });
  }
  function cssVar(n) { return getComputedStyle(document.body).getPropertyValue(n).trim(); }

  /* =========================================================
     RECOVERY & WELLNESS
     ========================================================= */
  function viewRecovery() {
    const w = window.AppState.wellnessDraft || R.WELLNESS[R.WELLNESS.length - 1];
    const composed = window.AppState.composedReadiness ?? 78;
    const tone = readinessTone(composed);
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Recovery & wellness</h1>
          <p>Daily check-in • soreness map • sleep & HRV</p>
        </div>
        <div class="view-head__actions">
          <span class="chip ${tone === 'green' ? 'chip--success' : tone === 'amber' ? 'chip--warn' : 'chip--danger'}" id="readinessChip">Readiness <span class="num">${composed}</span> • ${tone.toUpperCase()}</span>
          <button class="btn btn--primary" id="submitCheckin">Submit check-in</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Today's wellness check-in</div><span class="muted" style="font-size:12px;">Drag sliders, then submit</span></div>
          <div class="grid grid--3">
            ${[
              { k:'sleepHr', label:'Sleep duration', min:0, max:12, step:0.5, suf:'h' },
              { k:'sleepQ', label:'Sleep quality', min:1, max:10, step:1, suf:'/10' },
              { k:'soreness', label:'Soreness', min:0, max:10, step:1, suf:'/10' },
              { k:'mood', label:'Mood', min:1, max:10, step:1, suf:'/10' },
              { k:'stress', label:'Stress', min:0, max:10, step:1, suf:'/10' },
              { k:'hydration', label:'Hydration', min:0, max:10, step:1, suf:'/10' },
            ].map(it => `
              <div class="card--flat card" style="padding:12px;">
                <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700;">${it.label}</div>
                <div class="row" style="margin-top:8px; gap:8px;">
                  <input type="range" min="${it.min}" max="${it.max}" step="${it.step}" value="${w[it.k]}" data-checkin="${it.k}" style="flex:1;" />
                  <strong class="num" id="cv-${it.k}" style="min-width:50px; text-align:right;">${w[it.k]}${it.suf}</strong>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Body soreness map</div><button class="btn btn--ghost btn--sm" id="editSorenessBtn">Edit</button></div>
          <div class="body-map">
            <div id="bodyMap"></div>
            <div class="body-legend" id="bodyLegend"></div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Sleep & HRV (14d)</div></div>
          <div class="chart-wrap" id="sleepChart" style="height:130px;"></div>
          <div class="chart-wrap" id="hrvChart" style="height:130px; margin-top:8px;"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Recovery recommendations</div></div>
          <div class="list" style="font-size:13px;" id="recList"></div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Wearable connection</div><span class="chip">Placeholder</span></div>
          <div class="grid grid--3" id="wearableBox">
            ${['Garmin','Whoop','Oura'].map(b => {
              const connected = window.AppState.checklist.has('wear-' + b);
              return `
              <div class="card--flat card" style="padding:14px;">
                <div class="row row--between">
                  <div><div style="font-weight:700;">${b}</div><div class="muted" style="font-size:11.5px;" data-wear-status="${b}">${connected ? 'Connected' : 'Not connected'}</div></div>
                  <label class="toggle"><input type="checkbox" ${connected?'checked':''} data-wearable="${b}"><span class="toggle__track"></span></label>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function attachRecovery() {
    const S = window.AppState;
    const SUF = { sleepHr:'h', sleepQ:'/10', soreness:'/10', mood:'/10', stress:'/10', hydration:'/10' };

    document.querySelectorAll('[data-checkin]').forEach(r => {
      r.addEventListener('input', (e) => {
        const k = e.target.dataset.checkin;
        const v = e.target.step === '1' ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
        S.wellnessDraft[k] = v;
        document.getElementById('cv-' + k).textContent = v + (SUF[k] || '');
      });
    });

    drawBodyMap();
    renderRecList();
    renderLegend();

    function renderLegend() {
      const counts = { high: 0, mod: 0, low: 0 };
      Object.values(S.soreness).forEach(v => {
        if (v >= 6) counts.high++; else if (v >= 3) counts.mod++; else counts.low++;
      });
      document.getElementById('bodyLegend').innerHTML = `
        <div class="body-legend__row"><span><span class="body-legend__sw" style="background:color-mix(in oklab,var(--danger) 60%,var(--surface-2))"></span>6–10 (high)</span><strong class="num">${counts.high} areas</strong></div>
        <div class="body-legend__row"><span><span class="body-legend__sw" style="background:color-mix(in oklab,var(--warn) 60%,var(--surface-2))"></span>3–5 (moderate)</span><strong class="num">${counts.mod} areas</strong></div>
        <div class="body-legend__row"><span><span class="body-legend__sw" style="background:color-mix(in oklab,var(--success) 50%,var(--surface-2))"></span>0–2 (low)</span><strong class="num">${counts.low} areas</strong></div>
        <div style="margin-top:10px; font-size:12px;" class="muted">Tap "Edit" to update region scores.</div>`;
    }

    function drawBodyMap() {
      C.bodyMap(document.getElementById('bodyMap'), S.soreness);
      document.querySelectorAll('#bodyMap [class~="body-svg"] path, #bodyMap [class~="body-svg"] circle').forEach(p => {
        p.style.pointerEvents = 'auto';
      });
    }

    document.getElementById('editSorenessBtn').onclick = () => {
      window.App.openModal(`
        <h3>Edit soreness scores</h3>
        <p class="muted" style="font-size:13px;">Scale 0–10. Higher = more sore.</p>
        <div class="grid grid--auto" style="gap:8px; margin-top:10px;">
          ${Object.keys(S.soreness).map(k => `
            <div class="card--flat card" style="padding:10px;">
              <div class="row row--between" style="font-size:12px;">
                <strong>${esc(k)}</strong>
                <span class="num" data-sv="${k}">${S.soreness[k]}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value="${S.soreness[k]}" data-sk="${k}" style="width:100%; margin-top:6px;"/>
            </div>`).join('')}
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Close</button>
          <button class="btn btn--primary" id="saveSorenessBtn">Save</button>
        </div>`);
      document.querySelectorAll('[data-sk]').forEach(r => r.oninput = (e) => {
        const k = r.dataset.sk;
        S.soreness[k] = Number(e.target.value);
        document.querySelector(`[data-sv="${k}"]`).textContent = e.target.value;
      });
      document.getElementById('saveSorenessBtn').onclick = () => {
        window.App.closeModal();
        drawBodyMap(); renderLegend();
        window.App.toast('Soreness updated', 'success');
      };
    };

    function renderRecList() {
      const recs = [];
      const w = S.wellnessDraft;
      if (w.sleepHr < 7.5) recs.push(['Extend sleep window to 9h tonight', `Sleep at ${w.sleepHr}h — under target`]);
      if (w.hydration < 7) recs.push(['Hydrate to 4.5L today', `Hydration self-score ${w.hydration}/10`]);
      const soreMax = Math.max(...Object.values(S.soreness));
      if (soreMax >= 5) recs.push(['Pool walk 15 min — contrast 1:1 hot/cold', `Highest soreness ${soreMax}/10`]);
      if (w.stress >= 5) recs.push(['10 min box-breathing tonight', 'Stress trending up']);
      recs.push(['Foam roll glutes / quads / calves', 'General match-week priority']);
      const list = document.getElementById('recList');
      list.innerHTML = recs.map(([t, s], i) => {
        const id = `rec-${i}`;
        const done = S.checklist.has(id);
        return `
          <div class="list__item" style="${done?'opacity:.55;':''}">
            <div class="list__lhs"><div class="thumb thumb--accent">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg></div>
              <div><div class="list__title" style="${done?'text-decoration:line-through;':''}">${esc(t)}</div><div class="list__sub">${esc(s)}</div></div>
            </div>
            <button class="btn btn--ghost btn--sm" data-check="${id}">${done?'✓ Done':'Mark done'}</button>
          </div>`;
      }).join('');
      list.querySelectorAll('[data-check]').forEach(b => b.onclick = () => {
        const id = b.dataset.check;
        if (S.checklist.has(id)) S.checklist.delete(id); else S.checklist.add(id);
        renderRecList();
      });
    }

    C.lineChart(document.getElementById('sleepChart'), {
      data: S.wellnessHistory.map(w => ({ x: w.d.slice(5), y: w.sleepHr })), height: 130, suffix:' h', yMin: 5, yMax: 10
    });
    C.lineChart(document.getElementById('hrvChart'), {
      data: S.wellnessHistory.map(w => ({ x: w.d.slice(5), y: w.hrv })), height: 130, suffix:' ms', yMin: 55, yMax: 85, color: cssVar('--info')
    });

    // wearable toggles
    document.querySelectorAll('[data-wearable]').forEach(c => c.onchange = (e) => {
      const b = c.dataset.wearable;
      const id = 'wear-' + b;
      const on = e.target.checked;
      if (on) S.checklist.add(id); else S.checklist.delete(id);
      const status = document.querySelector(`[data-wear-status="${b}"]`);
      if (status) status.textContent = on ? 'Connected' : 'Not connected';
      window.App.toast(`${b} ${on ? 'connected' : 'disconnected'}`, on ? 'success' : 'info');
    });

    document.getElementById('submitCheckin').onclick = () => {
      const today = '2026-05-12';
      const draft = { ...S.wellnessDraft, d: today };
      // replace today's entry or append
      const i = S.wellnessHistory.findIndex(w => w.d === today);
      if (i >= 0) S.wellnessHistory[i] = draft; else S.wellnessHistory.push(draft);
      S.composedReadiness = composeReadinessLocal(draft);
      // update topbar + recommendations + chip
      window.App.refreshTopbar();
      const chip = document.getElementById('readinessChip');
      const tone = readinessTone(S.composedReadiness);
      chip.className = `chip ${tone === 'green' ? 'chip--success' : tone === 'amber' ? 'chip--warn' : 'chip--danger'}`;
      chip.innerHTML = `Readiness <span class="num">${S.composedReadiness}</span> • ${tone.toUpperCase()}`;
      renderRecList();
      // refresh charts
      C.lineChart(document.getElementById('sleepChart'), {
        data: S.wellnessHistory.map(w => ({ x: w.d.slice(5), y: w.sleepHr })), height: 130, suffix:' h', yMin: 5, yMax: 10
      });
      C.lineChart(document.getElementById('hrvChart'), {
        data: S.wellnessHistory.map(w => ({ x: w.d.slice(5), y: w.hrv })), height: 130, suffix:' ms', yMin: 55, yMax: 85, color: cssVar('--info')
      });
      window.App.toast(`Check-in saved — readiness ${S.composedReadiness}`, 'success');
    };

    function composeReadinessLocal(w) {
      const sleep = Math.min(100, (w.sleepHr / 8.5) * 100);
      const sleepQ = (w.sleepQ / 10) * 100;
      const sore = ((10 - w.soreness) / 10) * 100;
      const mood = (w.mood / 10) * 100;
      const stress = ((10 - w.stress) / 10) * 100;
      const hyd = (w.hydration / 10) * 100;
      const hrv = Math.min(100, (w.hrv / 90) * 100);
      return Math.round(0.18*sleep + 0.12*sleepQ + 0.18*sore + 0.10*mood + 0.10*stress + 0.10*hyd + 0.22*hrv);
    }
  }

  /* =========================================================
     NUTRITION
     ========================================================= */
  function calcMacros({ weightKg, heightCm, age, sex='male', activity=1.55, goal='performance' }) {
    const bmr = sex === 'female'
      ? 10*weightKg + 6.25*heightCm - 5*age - 161
      : 10*weightKg + 6.25*heightCm - 5*age + 5;
    const tdee = bmr * activity;
    let calories = tdee;
    if (goal === 'mass-gain')      calories = tdee + 450;
    else if (goal === 'lean-mass') calories = tdee + 250;
    else if (goal === 'strength')  calories = tdee + 200;
    else if (goal === 'fat-loss')  calories = tdee - 450;
    else if (goal === 'recomp')    calories = tdee + 50;
    // protein per kg by goal
    const proteinPerKg = goal === 'fat-loss' ? 2.2 : goal === 'recomp' ? 2.1 : goal === 'lean-mass' || goal === 'mass-gain' ? 2.0 : 1.9;
    const protein = Math.round(weightKg * proteinPerKg);
    const fat = Math.round(weightKg * 0.9); // ~25-30% kcal
    const carbsKcal = Math.max(0, calories - (protein*4 + fat*9));
    const carbs = Math.round(carbsKcal / 4);
    const hydrationL = +Math.max(2.5, weightKg * 0.04).toFixed(1);
    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee),
      calories: Math.round(calories), protein, carbs, fat, hydrationL,
    };
  }

  function nutritionOnboarding() {
    const a = window.AppState.athlete;
    const S = window.AppState;
    S.nutDraft = S.nutDraft || {
      weightKg: a.weightKg || 85,
      heightCm: a.heightCm || 180,
      age: a.age || 22,
      sex: a.sex || 'male',
      activity: 1.55,
      goal: (Array.isArray(a.goal) && a.goal[0]) || 'performance',
      diet: 'omnivore',
      allergies: '',
    };
    const d = S.nutDraft;
    const preview = calcMacros(d);
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Set up your nutrition</h1>
          <p>Personalised macros based on Mifflin-St Jeor + activity × goal adjustment.</p>
        </div>
      </div>
      <div class="grid grid--auto-md">
        <div class="card span-2">
          <div class="card__head"><div class="card__title">Stats</div></div>
          <div class="grid grid--4" style="gap:10px;">
            <div class="field"><label>Weight (kg)</label><input class="input num" type="number" step="0.1" value="${d.weightKg}" data-nut="weightKg" /></div>
            <div class="field"><label>Height (cm)</label><input class="input num" type="number" value="${d.heightCm}" data-nut="heightCm" /></div>
            <div class="field"><label>Age</label><input class="input num" type="number" value="${d.age}" data-nut="age" /></div>
            <div class="field"><label>Sex</label>
              <select class="select" data-nut="sex">
                <option value="male" ${d.sex==='male'?'selected':''}>Male</option>
                <option value="female" ${d.sex==='female'?'selected':''}>Female</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Activity level</div></div>
          <div class="tilebox">
            ${[
              ['1.2','Sedentary','Desk job, no training'],
              ['1.375','Light','1–3 sessions/wk'],
              ['1.55','Moderate','3–5 sessions/wk'],
              ['1.725','High','6+ sessions/wk + rugby'],
              ['1.9','Athlete','Pro / daily intense load'],
            ].map(([v,l,s]) => `<button class="tile ${String(d.activity)===v?'is-selected':''}" data-nut-tile="activity" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Primary nutrition goal</div></div>
          <div class="tilebox">
            ${[
              ['mass-gain','Mass gain','+450 kcal • muscle priority'],
              ['lean-mass','Lean mass','+250 kcal • minimise fat'],
              ['strength','Strength','+200 kcal • fuel lifts'],
              ['recomp','Body recomp','Maintenance • shift composition'],
              ['fat-loss','Fat loss','-450 kcal • keep performance'],
              ['performance','Performance','Maintenance • match readiness'],
            ].map(([v,l,s]) => `<button class="tile ${d.goal===v?'is-selected':''}" data-nut-tile="goal" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Diet preference</div></div>
          <div class="tilebox">
            ${[
              ['omnivore','Omnivore','No restrictions'],
              ['pescatarian','Pescatarian','Fish OK'],
              ['vegetarian','Vegetarian','No meat'],
              ['vegan','Vegan','Plant-only'],
            ].map(([v,l,s]) => `<button class="tile ${d.diet===v?'is-selected':''}" data-nut-tile="diet" data-val="${v}"><strong>${l}</strong><span>${s}</span></button>`).join('')}
          </div>
          <div class="field" style="margin-top:10px;"><label>Allergies / exclusions</label>
            <input class="input" placeholder="e.g. nuts, dairy" value="${esc(d.allergies)}" data-nut="allergies" /></div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Your calculated targets</div><span class="chip chip--accent" id="nutCalc">${preview.calories} kcal</span></div>
          <div class="grid grid--4" style="gap:10px;">
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">BMR</div><div class="stat__value num" id="nutBmr">${preview.bmr}</div><div class="stat__sub">kcal/day at rest</div></div>
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">TDEE</div><div class="stat__value num" id="nutTdee">${preview.tdee}</div><div class="stat__sub">kcal/day total</div></div>
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">Target</div><div class="stat__value num" id="nutTarget">${preview.calories}</div><div class="stat__sub">kcal/day for goal</div></div>
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">Hydration</div><div class="stat__value num" id="nutHydro">${preview.hydrationL}</div><div class="stat__sub">litres/day</div></div>
          </div>
          <div class="grid grid--3" style="gap:10px; margin-top:10px;">
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">Protein</div><div class="stat__value num"><span id="nutP">${preview.protein}</span>g</div><div class="stat__sub" id="nutPkg">${(preview.protein/d.weightKg).toFixed(1)} g/kg</div></div>
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">Carbs</div><div class="stat__value num"><span id="nutC">${preview.carbs}</span>g</div><div class="stat__sub" id="nutCkg">${(preview.carbs/d.weightKg).toFixed(1)} g/kg</div></div>
            <div class="stat card--flat" style="padding:14px;"><div class="stat__label">Fat</div><div class="stat__value num"><span id="nutF">${preview.fat}</span>g</div><div class="stat__sub" id="nutFkg">${(preview.fat/d.weightKg).toFixed(1)} g/kg</div></div>
          </div>
          <div class="row" style="margin-top:18px; justify-content:flex-end; gap:8px;">
            <button class="btn btn--primary" id="saveNutSetup">Save targets</button>
          </div>
        </div>
      </div>
    `;
  }

  function attachNutritionOnboarding() {
    const S = window.AppState;
    const d = S.nutDraft;
    function recompute() {
      const r = calcMacros(d);
      document.getElementById('nutCalc').textContent = `${r.calories} kcal`;
      document.getElementById('nutBmr').textContent = r.bmr;
      document.getElementById('nutTdee').textContent = r.tdee;
      document.getElementById('nutTarget').textContent = r.calories;
      document.getElementById('nutHydro').textContent = r.hydrationL;
      document.getElementById('nutP').textContent = r.protein;
      document.getElementById('nutC').textContent = r.carbs;
      document.getElementById('nutF').textContent = r.fat;
      document.getElementById('nutPkg').textContent = `${(r.protein/d.weightKg).toFixed(1)} g/kg`;
      document.getElementById('nutCkg').textContent = `${(r.carbs/d.weightKg).toFixed(1)} g/kg`;
      document.getElementById('nutFkg').textContent = `${(r.fat/d.weightKg).toFixed(1)} g/kg`;
    }
    document.querySelectorAll('[data-nut]').forEach(el => {
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        const k = el.dataset.nut;
        d[k] = ['weightKg','heightCm','age'].includes(k) ? Number(el.value) : el.value;
        recompute();
      });
    });
    document.querySelectorAll('[data-nut-tile]').forEach(b => b.onclick = () => {
      const k = b.dataset.nutTile;
      const v = b.dataset.val;
      d[k] = k === 'activity' ? Number(v) : v;
      document.querySelectorAll(`[data-nut-tile="${k}"]`).forEach(x => x.classList.toggle('is-selected', x.dataset.val === v));
      recompute();
    });
    document.getElementById('saveNutSetup').onclick = () => {
      const r = calcMacros(d);
      S.macroTargets = { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, hydrationL: r.hydrationL };
      S.athlete.weightKg = d.weightKg;
      S.athlete.heightCm = d.heightCm;
      S.athlete.age = d.age;
      S.athlete.sex = d.sex;
      S.athlete.activity = d.activity;
      S.athlete.nutritionGoal = d.goal;
      S.athlete.diet = d.diet;
      S.athlete.allergies = d.allergies;
      S.nutritionSetup = true;
      window.App.toast('Nutrition set up ✓', 'success');
      window.App.refreshView();
    };
  }

  function viewNutrition() {
    const S = window.AppState;
    const a = S.athlete;
    // Show onboarding if not set up yet (fresh users only)
    if (!S.nutritionSetup && !S.isDemo) return nutritionOnboarding();

    S.nutritionDay = S.nutritionDay || 'training';
    const targetsBase = S.macroTargets || R.NUTRITION.targets;
    const t = targetsForDay(S.nutritionDay, targetsBase);
    const log = aggregateLog();
    const pctOf = (a, b) => b > 0 ? Math.min(100, Math.round((a/b)*100)) : 0;

    function targetsForDay(d, base) {
      if (d === 'match') return { calories: base.calories + 200, protein: base.protein, carbs: base.carbs + 120, fat: Math.max(40, base.fat - 20), hydrationL: base.hydrationL + 0.5 };
      if (d === 'recovery') return { calories: Math.round(base.calories * 0.9), protein: base.protein, carbs: Math.round(base.carbs * 0.8), fat: base.fat, hydrationL: base.hydrationL };
      return base;
    }
    function aggregateLog() {
      // Demo includes the seed sample log; fresh users only have what they've logged.
      const base = S.isDemo ? R.NUTRITION.todayLog : { calories:0, protein:0, carbs:0, fat:0, meals:[] };
      const extras = S.extraMeals || [];
      const totals = ['calories','protein','carbs','fat'].reduce((o, k) => (o[k] = base[k] + extras.reduce((s,m)=>s + (m[mealKey(k)]||0), 0), o), {});
      totals.hydrationL = S.hydrationL ?? (S.isDemo ? R.NUTRITION.todayLog.hydrationL : 0);
      // Tag each meal so we know which can be deleted
      totals.meals = [
        ...base.meals.map(m => ({ ...m, deletable:false, source:'seed' })),
        ...extras.map((m, i) => ({ ...m, deletable:true, source:'extra', _idx:i })),
      ];
      return totals;
    }
    function mealKey(k) { return k === 'calories' ? 'kcal' : k === 'protein' ? 'p' : k === 'carbs' ? 'c' : 'f'; }
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Nutrition</h1>
          <p>Match-week fueling • macros • supplements</p>
        </div>
        <div class="view-head__actions">
          <div class="segmented" data-segment="dayType">
            <button class="${S.nutritionDay==='recovery'?'is-active':''}" data-val="recovery">Recovery</button>
            <button class="${S.nutritionDay==='training'?'is-active':''}" data-val="training">Training</button>
            <button class="${S.nutritionDay==='match'?'is-active':''}" data-val="match">Match</button>
          </div>
          <button class="btn btn--primary" id="logMealBtn">+ Log meal</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Today's macros</div><span class="muted" style="font-size:12px;">${log.calories} / ${t.calories} kcal</span></div>
          <div class="grid grid--4" style="gap:14px;">
            ${[
              ['Calories', log.calories, t.calories, 'kcal'],
              ['Protein', log.protein, t.protein, 'g'],
              ['Carbs',   log.carbs,   t.carbs,   'g'],
              ['Fat',     log.fat,     t.fat,     'g'],
            ].map(([lab, v, tar, u]) => `
              <div class="card--flat card" style="padding:14px;">
                <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700;">${lab}</div>
                <div class="num" style="font-size:22px; font-weight:700; font-family:var(--font-display); margin-top:4px;">${v}<span class="muted" style="font-size:13px; font-weight:500;"> / ${tar} ${u}</span></div>
                <div class="progress" style="margin-top:8px;">
                  <div class="progress__bar"><div class="progress__fill" style="width:${pctOf(v,tar)}%"></div></div>
                  <div class="progress__row"><span class="muted">${pctOf(v,tar)}%</span><span class="muted">${tar - v}${u} left</span></div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Hydration</div><button class="btn btn--ghost btn--sm" id="resetWaterBtn">Reset</button></div>
          <div class="num" id="hydroValue" style="font-size:30px; font-weight:700; font-family:var(--font-display);">${log.hydrationL.toFixed(1)} L <span class="muted" style="font-size:14px;">/ ${t.hydrationL} L</span></div>
          <div class="row" style="margin-top:10px; gap:6px; flex-wrap:wrap;" id="waterRow">
            ${Array.from({length: 12}, (_, i) => `<button class="btn btn--ghost btn--sm ${i < S.waterClicks?'btn--primary':''}" data-water-idx="${i}">${i < S.waterClicks ? '✓' : '+250ml'}</button>`).join('')}
          </div>
          <div class="progress" style="margin-top:10px;">
            <div class="progress__bar"><div class="progress__fill" id="hydroFill" style="width:${(log.hydrationL/t.hydrationL)*100}%"></div></div>
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Match day fueling plan</div><span class="chip chip--accent">Sat 15:00 KO</span></div>
          <div class="list">
            ${R.NUTRITION.matchDayFueling.map((m, i) => {
              const id = 'fuel-' + i;
              const set = S.checklist.has(id);
              return `
              <div class="list__item">
                <div class="list__lhs">
                  <div class="thumb">${esc(m.time)}</div>
                  <div><div class="list__title">${esc(m.text)}</div></div>
                </div>
                <button class="btn btn--ghost btn--sm" data-check="${id}">${set ? '✓ Reminder set' : 'Set reminder'}</button>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Supplements</div></div>
          <div class="list" style="font-size:13px;">
            ${R.NUTRITION.supplements.map((s, i) => {
              const id = 'supp-' + i;
              // Demo profile: pre-toggled. Fresh user: untoggled by default.
              const defaultOn = S.isDemo;
              const off = S.checklist.has('supp-off-' + i);
              const on = defaultOn ? !off : S.checklist.has('supp-on-' + i);
              return `
              <div class="list__item" style="padding:8px 0;">
                <div class="list__lhs">
                  <div class="thumb thumb--accent">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M7 9v8a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V9"/></svg>
                  </div>
                  <div><div class="list__title">${esc(s.name)}</div><div class="list__sub">${esc(s.dose)} • ${esc(s.timing)}</div></div>
                </div>
                <label class="toggle"><input type="checkbox" ${on?'checked':''} data-supp="${i}"><span class="toggle__track"></span></label>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head">
            <div class="card__title">Meal ideas</div>
            <div class="segmented" data-segment="mealGoal">
              <button class="is-active" data-val="Mass gain">Mass gain</button>
              <button data-val="Performance">Performance</button>
              <button data-val="Recomposition">Recomp</button>
            </div>
          </div>
          <ul id="mealIdeasList" style="margin:0; padding-left: 18px; line-height: 1.9; font-size: 13.5px;"></ul>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Grocery list</div>
            <div class="row" style="gap:6px;">
              <button class="btn btn--ghost btn--sm" id="clearCheckedGrocery">Clear checked</button>
              <button class="btn btn--primary btn--sm" id="addGroceryBtn">+ Add</button>
            </div>
          </div>
          <div class="list" style="font-size:13px;" id="groceryList"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Today's meals</div><span class="muted" style="font-size:12px;">${log.meals.length} logged</span></div>
          ${log.meals.length === 0 ? `
            <div class="empty" style="padding:24px;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4v16M12 4v8M20 4v16M4 12h16"/></svg>
              <div style="font-weight:600; color:var(--text);">No meals logged yet today</div>
              <div style="font-size:12.5px;">Tap "+ Log meal" above to add one.</div>
            </div>` : `
          <div class="list" style="font-size:13px;">
            ${log.meals.map(m => `
              <div class="list__item">
                <div class="list__lhs">
                  <div class="thumb">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v16M12 4v8M20 4v16M4 12h16"/></svg>
                  </div>
                  <div>
                    <div class="list__title">${esc(m.name)}</div>
                    <div class="list__sub">P ${m.p}g • C ${m.c}g • F ${m.f}g</div>
                  </div>
                </div>
                <div class="list__rhs">
                  <span class="num" style="font-weight:600;">${m.kcal} kcal</span>
                  ${m.deletable ? `
                    <button class="iconbtn iconbtn--sm" title="Edit meal" data-edit-meal="${m._idx}">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="iconbtn iconbtn--sm" title="Delete meal" data-del-meal="${m._idx}">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>` : ''}
                </div>
              </div>`).join('')}
          </div>`}
        </div>

      </div>
    `;
  }

  function attachNutrition() {
    const S = window.AppState;
    if (!S.nutritionSetup && !S.isDemo) { attachNutritionOnboarding(); return; }
    const t = S.macroTargets || R.NUTRITION.targets;

    function renderMeals(goal) {
      document.getElementById('mealIdeasList').innerHTML =
        R.NUTRITION.mealIdeas[goal].map(m => `<li>${esc(m)}</li>`).join('');
    }
    renderMeals('Mass gain');
    document.querySelectorAll('[data-segment="mealGoal"] button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('[data-segment="mealGoal"] button').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        renderMeals(b.dataset.val);
      };
    });

    // hydration counter
    document.querySelectorAll('[data-water-idx]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.waterIdx);
      if (i < S.waterClicks) return; // already logged
      S.waterClicks = i + 1;
      S.hydrationL = (R.NUTRITION.todayLog.hydrationL + (S.waterClicks * 0.25));
      updateHydration();
    });
    document.getElementById('resetWaterBtn').onclick = () => {
      S.waterClicks = 0;
      S.hydrationL = R.NUTRITION.todayLog.hydrationL;
      updateHydration();
      window.App.toast('Hydration reset', 'info');
    };

    function updateHydration() {
      document.getElementById('hydroValue').innerHTML = `${S.hydrationL.toFixed(2)} L <span class="muted" style="font-size:14px;">/ ${t.hydrationL} L</span>`;
      document.getElementById('hydroFill').style.width = Math.min(100, (S.hydrationL / t.hydrationL) * 100) + '%';
      document.querySelectorAll('[data-water-idx]').forEach((b, i) => {
        const done = i < S.waterClicks;
        b.classList.toggle('btn--primary', done);
        b.textContent = done ? '✓' : '+250ml';
      });
    }

    // grocery list — editable
    function paintGrocery() {
      const el = document.getElementById('groceryList');
      if (!el) return;
      if (!S.grocery.length) {
        el.innerHTML = '<div class="empty" style="padding:20px;"><div style="font-size:12.5px;">Grocery list is empty. Add items or pull from a recipe in Menu.</div></div>';
        return;
      }
      el.innerHTML = S.grocery.map((g, i) => `
        <div class="list__item" style="padding:6px 0;" data-grocery-row="${esc(g.id)}">
          <div class="list__lhs">
            <input type="checkbox" data-grocery-check="${esc(g.id)}" ${g.checked?'checked':''}>
            <span class="list__title" style="${g.checked?'text-decoration:line-through; opacity:.6;':''}">${esc(g.item)}</span>
          </div>
          <div class="row" style="gap:4px;">
            <span class="muted num">${esc(g.qty)}</span>
            <button class="iconbtn iconbtn--sm" title="Edit" data-grocery-edit="${esc(g.id)}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="iconbtn iconbtn--sm" title="Remove" data-grocery-del="${esc(g.id)}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18l12-12"/></svg>
            </button>
          </div>
        </div>`).join('');
      el.querySelectorAll('[data-grocery-check]').forEach(c => c.onchange = (e) => {
        const id = c.dataset.groceryCheck;
        const g = S.grocery.find(x => x.id === id);
        if (g) g.checked = e.target.checked;
        paintGrocery();
      });
      el.querySelectorAll('[data-grocery-del]').forEach(b => b.onclick = () => {
        const id = b.dataset.groceryDel;
        S.grocery = S.grocery.filter(x => x.id !== id);
        paintGrocery();
      });
      el.querySelectorAll('[data-grocery-edit]').forEach(b => b.onclick = () => {
        const g = S.grocery.find(x => x.id === b.dataset.groceryEdit);
        window.App.openModal(`
          <h3>Edit item</h3>
          <div class="grid" style="gap:10px; margin-top:10px;">
            <div class="field"><label>Item</label><input class="input" id="grocEditItem" value="${esc(g.item)}"/></div>
            <div class="field"><label>Quantity</label><input class="input" id="grocEditQty" value="${esc(g.qty)}"/></div>
          </div>
          <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
            <button class="btn btn--ghost" data-close-modal>Cancel</button>
            <button class="btn btn--primary" id="grocEditSave">Save</button>
          </div>`);
        document.getElementById('grocEditSave').onclick = () => {
          g.item = document.getElementById('grocEditItem').value.trim() || g.item;
          g.qty = document.getElementById('grocEditQty').value.trim() || '';
          window.App.closeModal();
          paintGrocery();
        };
      });
    }
    paintGrocery();

    document.getElementById('addGroceryBtn').onclick = () => {
      window.App.openModal(`
        <h3>Add grocery item</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Item</label><input class="input" id="grocNewItem" placeholder="e.g. Sweet potato"/></div>
          <div class="field"><label>Quantity</label><input class="input" id="grocNewQty" placeholder="e.g. 1 kg"/></div>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="grocAddSave">Add</button>
        </div>`);
      document.getElementById('grocNewItem').focus();
      document.getElementById('grocAddSave').onclick = () => {
        const item = document.getElementById('grocNewItem').value.trim();
        if (!item) { window.App.toast('Item name required', 'warn'); return; }
        S.grocery.push({ id: 'g-' + Math.random().toString(36).slice(2,7), item, qty: document.getElementById('grocNewQty').value.trim() || '', checked: false });
        window.App.closeModal();
        paintGrocery();
        window.App.toast('Added to grocery', 'success');
      };
    };
    document.getElementById('clearCheckedGrocery').onclick = () => {
      const before = S.grocery.length;
      S.grocery = S.grocery.filter(g => !g.checked);
      paintGrocery();
      window.App.toast(`Cleared ${before - S.grocery.length} item${(before - S.grocery.length)===1?'':'s'}`, 'info');
    };

    // checklist clicks (fuel reminders + others)
    document.querySelectorAll('[data-check]').forEach(b => b.onclick = () => {
      const id = b.dataset.check;
      if (S.checklist.has(id)) { S.checklist.delete(id); b.textContent = b.textContent.replace('✓ ',''); b.textContent = b.textContent.includes('Reminder') ? 'Set reminder' : b.textContent; }
      else { S.checklist.add(id); b.textContent = '✓ Reminder set'; }
    });

    // day-type segmented
    document.querySelectorAll('[data-segment="dayType"] button').forEach(b => b.onclick = () => {
      document.querySelectorAll('[data-segment="dayType"] button').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      S.nutritionDay = b.dataset.val;
      window.App.toast(`${b.dataset.val.charAt(0).toUpperCase()+b.dataset.val.slice(1)} day macros applied`, 'info');
      window.App.refreshView();
    });

    // supplement toggles (demo: off-flags; fresh: on-flags)
    document.querySelectorAll('[data-supp]').forEach(c => c.onchange = (e) => {
      const i = c.dataset.supp;
      const offId = 'supp-off-' + i;
      const onId = 'supp-on-' + i;
      if (S.isDemo) {
        if (e.target.checked) S.checklist.delete(offId); else S.checklist.add(offId);
      } else {
        if (e.target.checked) S.checklist.add(onId); else S.checklist.delete(onId);
      }
    });

    // delete & edit meal
    document.querySelectorAll('[data-del-meal]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.delMeal);
      const removed = S.extraMeals[i];
      if (!confirm(`Delete "${removed.name}"?`)) return;
      S.extraMeals.splice(i, 1);
      window.App.toast('Meal removed', 'info');
      window.App.refreshView();
    });
    document.querySelectorAll('[data-edit-meal]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.editMeal);
      const m = S.extraMeals[i];
      window.App.openModal(`
        <h3>Edit meal</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Meal name</label><input class="input" id="emName" value="${esc(m.name)}" /></div>
          <div class="grid grid--4" style="gap:8px;">
            <div class="field"><label>kcal</label><input class="input num" id="emKcal" type="number" value="${m.kcal}" /></div>
            <div class="field"><label>P (g)</label><input class="input num" id="emP" type="number" value="${m.p}" /></div>
            <div class="field"><label>C (g)</label><input class="input num" id="emC" type="number" value="${m.c}" /></div>
            <div class="field"><label>F (g)</label><input class="input num" id="emF" type="number" value="${m.f}" /></div>
          </div>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="saveEditMeal">Save</button>
        </div>
      `);
      document.getElementById('saveEditMeal').onclick = () => {
        m.name = document.getElementById('emName').value.trim() || m.name;
        m.kcal = Number(document.getElementById('emKcal').value) || 0;
        m.p = Number(document.getElementById('emP').value) || 0;
        m.c = Number(document.getElementById('emC').value) || 0;
        m.f = Number(document.getElementById('emF').value) || 0;
        window.App.closeModal();
        window.App.toast('Meal updated', 'success');
        window.App.refreshView();
      };
    });

    // log a meal
    document.getElementById('logMealBtn').onclick = () => {
      window.App.openModal(`
        <h3>Log a meal</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Meal name</label><input class="input" id="mlName" placeholder="e.g. Dinner — steak + rice" /></div>
          <div class="grid grid--4" style="gap:8px;">
            <div class="field"><label>kcal</label><input class="input num" id="mlKcal" type="number" placeholder="600" /></div>
            <div class="field"><label>P (g)</label><input class="input num" id="mlP" type="number" placeholder="40" /></div>
            <div class="field"><label>C (g)</label><input class="input num" id="mlC" type="number" placeholder="60" /></div>
            <div class="field"><label>F (g)</label><input class="input num" id="mlF" type="number" placeholder="18" /></div>
          </div>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="saveMealBtn">Save meal</button>
        </div>
      `);
      document.getElementById('mlName').focus();
      document.getElementById('saveMealBtn').onclick = () => {
        const name = document.getElementById('mlName').value.trim() || 'Meal';
        const kcal = Number(document.getElementById('mlKcal').value) || 0;
        const p = Number(document.getElementById('mlP').value) || 0;
        const c = Number(document.getElementById('mlC').value) || 0;
        const f = Number(document.getElementById('mlF').value) || 0;
        if (kcal === 0 && p === 0 && c === 0 && f === 0) {
          window.App.toast('Enter at least one macro', 'warn');
          return;
        }
        S.extraMeals.push({ name, kcal, p, c, f });
        window.App.closeModal();
        window.App.toast('Meal logged', 'success');
        // re-render the nutrition view
        window.App.refreshView();
      };
    };
  }

  /* =========================================================
     POSITION
     ========================================================= */
  function viewPosition() {
    const a = window.AppState.athlete;
    const pos = R.POSITIONS.find(p => p.id === a.primaryPosition) || R.POSITIONS[7];
    const prof = R.POSITION_PROFILES[pos.group] || R.POSITION_PROFILES['Back Row'];
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Position tools — ${esc(pos.name)}</h1>
          <p>${esc(prof.blurb)} • Group: <strong>${esc(pos.group)}</strong></p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--ghost" data-nav="program">Apply to program</button>
          <button class="btn btn--primary" id="changePosBtn">Change position</button>
        </div>
      </div>

      <div class="grid grid--auto-md">
        <div class="card span-2">
          <div class="card__head"><div class="card__title">Field map</div><span class="chip">Your position highlighted</span></div>
          <div id="pitchEl"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Position KPIs</div></div>
          <div class="grid grid--3" style="gap:10px;">
            ${prof.kpis.map(k => `
              <div class="card--flat card" style="padding:12px;">
                <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em;">${esc(k.label)}</div>
                <div class="num" style="font-family:var(--font-display); font-size:20px; font-weight:700; margin-top:4px;">${esc(k.value)}</div>
                <div class="stat__delta ${k.good?'up':'down'}">${esc(k.delta)}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Recommended emphasis</div></div>
          <div class="list" style="font-size:13.5px;">
            ${prof.emphasis.map(e => `
              <div class="list__item">
                <div class="list__lhs"><div class="thumb thumb--accent">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/></svg></div>
                  <div class="list__title">${esc(e)}</div>
                </div>
                <span class="chip chip--accent">In plan</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Position-specific sessions</div></div>
          <div class="grid grid--3">
            ${positionSessionCards(pos.group).map((s, idx) => `
              <div class="card--flat card" style="padding:14px;" data-pos-card="${idx}">
                <div class="card__title" style="font-size:13px;">${esc(s.title)}</div>
                <div class="muted" style="font-size:12px; margin-top:4px;">${esc(s.sub)}</div>
                <ul style="margin: 8px 0 0 18px; padding:0; line-height:1.6; font-size:13px;">
                  ${s.items.map(i => `<li>${esc(i)}</li>`).join('')}
                </ul>
                <button class="btn btn--ghost btn--block btn--sm" style="margin-top:10px;" data-add-pos="${idx}">Add to today</button>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Contact readiness</div><span class="chip chip--success">Green</span></div>
          <div style="font-family:var(--font-display); font-size:42px; font-weight:700;">8.4<span class="muted" style="font-size:14px; font-weight:500;"> /10</span></div>
          <div class="muted" style="font-size:12px;">Cleared for full contact — strap right ankle.</div>
          <div class="progress" style="margin-top:10px;">
            <div class="progress__row"><span>Neck capacity</span><span>92%</span></div>
            <div class="progress__bar"><div class="progress__fill" style="width:92%"></div></div>
          </div>
          <div class="progress" style="margin-top:6px;">
            <div class="progress__row"><span>Trunk brace ISO</span><span>78%</span></div>
            <div class="progress__bar"><div class="progress__fill" style="width:78%"></div></div>
          </div>
          <div class="progress" style="margin-top:6px;">
            <div class="progress__row"><span>Shoulder armour</span><span>85%</span></div>
            <div class="progress__bar"><div class="progress__fill" style="width:85%"></div></div>
          </div>
        </div>
      </div>
    `;
  }
  function positionSessionCards(group) {
    const dict = {
      'Front Row': [
        { title:'Scrum brace ISO', sub:'3 × 20s iso pushes; partner mirror', items:['Wall scrum brace 3×20s','Half-kneel iso push 3×20s/side','Reverse hyper 3×10'] },
        { title:'Neck armour day', sub:'Harness flex/ext/lat', items:['Neck harness 3×10/dir','Iso plate holds 2×15s','Band crunches 3×12'] },
        { title:'Set-piece power', sub:'Trap-bar + push press circuit', items:['Trap bar 4×3','Push press 4×4','Sled drives 4×10m'] },
      ],
      'Second Row': [
        { title:'Vertical pop', sub:'Lineout jump dev', items:['Box jumps 4×3','Hang clean 4×3','Drop jumps 3×4'] },
        { title:'Engine build', sub:'Aerobic conditioning', items:['Bike intervals 6×3min','Sled push 4×30m','Yo-Yo prep'] },
        { title:'Mauling power', sub:'Driving force', items:['Sled drive heavy 4×15m','Bear crawl 3×20m','Pulley row 4×8'] },
      ],
      'Back Row': [
        { title:'Repeat HIE', sub:'Energy system dev', items:['6×40m / 45s rest','Sled drive 4×20m','Pulls 3×8'] },
        { title:'Collision prep', sub:'Tackle conditioning', items:['Bag tackle 4×5','Wrestling 3×60s','Bear hug carry 3×20m'] },
        { title:'Pull strength', sub:'Chins + rows', items:['Chin-ups 4×AMRAP','BB row 4×6','Face pulls 3×12'] },
      ],
      'Half Backs': [
        { title:'Repeat sprint', sub:'Speed endurance', items:['8×40m / 30s rest','A-skip drills','Pogo plyos 3×6'] },
        { title:'Agility & footwork', sub:'Change of direction', items:['505 agility 4×','Mirror drill 4×','Ladder 3×'] },
        { title:'Kicking volume', sub:'Quality reps & monitor load', items:['Box kicks 20','Goal kicks 15','Spirals 15'] },
      ],
      'Midfield': [
        { title:'Contact strength', sub:'Wrestling + clean variants', items:['Hang clean 4×3','Bear hug carry 3×20m','Wrestling 4×30s'] },
        { title:'Repeat power', sub:'Plyo + sprint combos', items:['Broad jump 4×3','10m accel 6×','Cleans 4×3'] },
        { title:'Tackle conditioning', sub:'Bag work circuits', items:['Bag tackle 4×6','Bear crawl 3×20m','Plank rotations 3×8/side'] },
      ],
      'Back Three': [
        { title:'Max velocity', sub:'Top speed development', items:['Flying 30m × 4','A-skip / B-skip','Bound 3×6'] },
        { title:'Hamstring armour', sub:'Eccentric protection', items:['Nordic curls 3×5','SL RDL 3×8','Glute-ham raise 3×8'] },
        { title:'Reactive plyo', sub:'Elastic energy', items:['Hurdle hops 4×6','Drop jumps 3×4','Pogo 3×8'] },
      ],
    };
    return dict[group] || dict['Back Row'];
  }

  function attachPosition() {
    const a = window.AppState.athlete;
    const pos = R.POSITIONS.find(p => p.id === a.primaryPosition) || R.POSITIONS[7];
    const cards = positionSessionCards(pos.group);
    C.pitch(document.getElementById('pitchEl'), {
      me: a.primaryPosition,
      onClick: (p) => window.App.toast(`${p.name} — tap "Change position" to switch`, 'info')
    });

    document.querySelectorAll('[data-add-pos]').forEach(b => b.onclick = () => {
      const idx = Number(b.dataset.addPos);
      const card = cards[idx];
      const toAdd = card.items.map(t => {
        const m = /^(.*?)\s+(\d+)x(\d+(?:\s*(?:s|sec|min|m|km))?)$/i.exec(t);
        return { ex: t, sets: 3, reps: '8', rest: '60s', cues: [card.title] };
      });
      window.AppState.extraExercises.push(...toAdd);
      window.App.toast(`Added ${toAdd.length} exercises to today's session`, 'success');
    });

    document.getElementById('changePosBtn').onclick = () => {
      window.App.openModal(`
        <h3>Change primary position</h3>
        <div class="tilebox" style="margin-top:10px;">
          ${R.POSITIONS.map(p => `
            <button class="tile" data-pos="${p.id}">
              <strong>${p.number}. ${esc(p.name)}</strong>
              <span>${esc(p.group)}</span>
            </button>`).join('')}
        </div>
      `);
      document.querySelectorAll('[data-pos]').forEach(b => b.onclick = () => {
        window.AppState.athlete.primaryPosition = b.dataset.pos;
        window.App.closeModal();
        window.App.persist();
        window.App.refresh();
        window.App.toast('Position updated', 'success');
      });
    };
  }

  /* =========================================================
     MATCH PREP
     ========================================================= */
  function viewMatchPrep() {
    const a = window.AppState.athlete;
    const m = R.MATCH;
    const inSeason = a.phase === 'in-season' && a.nextMatch;
    if (!inSeason) {
      const reason = a.phase === 'off-season' ? 'Off-season — no matches scheduled.'
        : a.phase === 'pre-season' ? 'Pre-season — no fixtures yet. Match prep unlocks once your first fixture is set.'
        : a.phase === 'rehab' ? 'Rehab phase — focus on RTP gates, no match yet.'
        : 'No match scheduled.';
      return html`
        <div class="view-head">
          <div class="view-head__title">
            <h1>Match prep</h1>
            <p>${esc(reason)}</p>
          </div>
          <div class="view-head__actions">
            <button class="btn btn--primary" id="scheduleMatchBtn">Schedule a match</button>
          </div>
        </div>
        <div class="card">
          <div class="empty" style="padding:48px;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 4 6 12l8 8c4-1 7-4 7-8s-3-7-7-8Z"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg>
            <div style="font-weight:600; color:var(--text);">Match prep activates in-season</div>
            <div style="font-size:13px;">Set a fixture date to unlock match-week structure, tactical focus, travel checklist, and post-match recovery.</div>
          </div>
        </div>`;
    }
    const md = daysUntil(a.nextMatch);
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Match prep — ${esc(m.opponent)}</h1>
          <p>${esc(m.competition)} • ${esc(m.venue)} • Kick-off Sat 15:00 • <span class="num">MD-${md}</span></p>
        </div>
        <div class="view-head__actions">
          <span class="chip chip--success">Available</span>
          <button class="btn btn--primary" id="reviewOppBtn">Review opposition</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card">
          <div class="card__head"><div class="card__title">Match readiness</div></div>
          <div class="readiness">
            <div class="readiness__ring" id="matchRing"></div>
            <div class="readiness__meta">
              <div class="readiness__label">All systems trending green for selection.</div>
              <span class="chip chip--accent">${esc(m.selection)} • ${esc(m.role)}</span>
            </div>
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Match-week timeline</div></div>
          <div class="md-track">
            ${getProgram().map(d => {
              const isMd = d.label === 'MD'; const today = d === todayProgram();
              return `<div class="md-day ${today?'is-today':''} ${isMd?'is-md':''}">
                <div class="md-day__label">${esc(d.label || d.day)} • ${esc(d.day)}</div>
                <div class="md-day__title" style="font-size:12px;">${esc(d.focus)}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Tactical focus</div></div>
          <ul style="margin:0; padding-left:18px; line-height:1.9; font-size:13.5px;">
            ${m.tactical.map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Match day routine</div><span class="muted" style="font-size:12px;" id="matchChecklistCount"></span></div>
          <div class="list" id="matchRoutineList"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Prep sliders</div></div>
          <div class="grid" style="gap:10px;" id="prepSliders"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Travel checklist</div><span class="muted" style="font-size:12px;" id="travelCount"></span></div>
          <div class="list" id="travelList"></div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Post-match recovery checklist</div><span class="muted" style="font-size:12px;" id="postMatchCount"></span></div>
          <div class="grid grid--3" id="postMatchList"></div>
        </div>

      </div>
    `;
  }

  function attachMatchPrep() {
    const S = window.AppState;
    const a = S.athlete;
    const schedBtn = document.getElementById('scheduleMatchBtn');
    if (schedBtn) {
      schedBtn.onclick = () => {
        window.App.openModal(`
          <h3>Schedule a match</h3>
          <p class="muted" style="font-size:13px;">Setting a fixture switches you to in-season and unlocks match-week structure (MD-X).</p>
          <div class="grid" style="gap:10px; margin-top:10px;">
            <div class="field"><label>Opponent</label><input class="input" id="schOpp" placeholder="e.g. Saracens A" /></div>
            <div class="grid grid--3" style="gap:8px;">
              <div class="field"><label>Date</label><input class="input" id="schDate" type="date" value="2026-05-23"/></div>
              <div class="field"><label>Kick-off</label><input class="input" id="schKO" type="time" value="15:00"/></div>
              <div class="field"><label>Venue</label><input class="input" id="schVenue" placeholder="Home / Away"/></div>
            </div>
          </div>
          <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
            <button class="btn btn--ghost" data-close-modal>Cancel</button>
            <button class="btn btn--primary" id="confirmMatchBtn">Confirm</button>
          </div>
        `);
        document.getElementById('confirmMatchBtn').onclick = () => {
          const opp = document.getElementById('schOpp').value.trim() || 'TBD';
          const date = document.getElementById('schDate').value;
          if (!date) { window.App.toast('Pick a date', 'warn'); return; }
          a.nextMatch = date;
          a.phase = 'in-season';
          // Rebuild program around the new match
          S.program = R.buildProgram({
            phase: 'in-season',
            gymAccess: a.gymAccess,
            sessionsPerWeek: a.sessionsPerWeek,
            primaryPosition: a.primaryPosition,
            goal: a.goal,
            nextMatch: a.nextMatch,
          });
          R.MATCH.opponent = opp;
          R.MATCH.kickoff = `${date}T${document.getElementById('schKO').value}:00`;
          R.MATCH.venue = document.getElementById('schVenue').value.trim() || R.MATCH.venue;
          window.App.closeModal();
          window.App.refreshView();
          window.App.toast(`Match vs ${opp} scheduled — program rebuilt`, 'success');
        };
      };
      return;
    }
    C.ring(document.getElementById('matchRing'), R.MATCH.readiness, { size: 132, label: 'MATCH' });

    document.getElementById('reviewOppBtn').onclick = () => {
      window.App.openModal(`
        <h3>Opposition — ${esc(R.MATCH.opponent)}</h3>
        <p class="muted" style="font-size:13px;">Last 5: W W L W W • Avg points for/against 27 / 18</p>
        <div class="grid grid--3" style="gap:8px; margin-top:12px;">
          <div class="stat card--flat" style="padding:12px;"><div class="stat__label">Lineout win %</div><div class="stat__value num">82</div></div>
          <div class="stat card--flat" style="padding:12px;"><div class="stat__label">Scrum win %</div><div class="stat__value num">90</div></div>
          <div class="stat card--flat" style="padding:12px;"><div class="stat__label">Avg meters made</div><div class="stat__value num">412</div></div>
        </div>
        <h4 style="margin:16px 0 6px; font-family:var(--font-display);">Threats</h4>
        <ul style="margin:0; padding-left: 18px; line-height: 1.8; font-size: 13.5px;">
          <li>Strong driving maul off lineouts</li>
          <li>Quick 9 sniping at slow ball</li>
          <li>Aggressive line speed in midfield</li>
        </ul>
        <h4 style="margin:16px 0 6px; font-family:var(--font-display);">Opportunities</h4>
        <ul style="margin:0; padding-left: 18px; line-height: 1.8; font-size: 13.5px;">
          <li>Counter-attack off kick returns — back three vulnerable</li>
          <li>Wide channel attack via 13's outside shoulder</li>
        </ul>
        <div class="row" style="justify-content:flex-end; margin-top:14px;">
          <button class="btn btn--primary" data-close-modal>Got it</button>
        </div>
      `);
    };

    // Prep sliders
    function renderSliders() {
      document.getElementById('prepSliders').innerHTML = Object.entries(S.matchPrepSliders).map(([q, v]) => `
        <div>
          <div class="row row--between" style="font-size:12px;"><span>${q}</span><strong class="num" data-prep-val="${q}">${v}%</strong></div>
          <input type="range" min="0" max="100" value="${v}" data-prep="${q}" style="width:100%"/>
        </div>`).join('');
      document.querySelectorAll('[data-prep]').forEach(r => r.oninput = (e) => {
        const k = e.target.dataset.prep;
        S.matchPrepSliders[k] = Number(e.target.value);
        document.querySelector(`[data-prep-val="${k}"]`).textContent = `${e.target.value}%`;
      });
    }
    renderSliders();

    // Match routine reminders
    function renderRoutine() {
      const list = document.getElementById('matchRoutineList');
      list.innerHTML = R.MATCH.routine.map((r, i) => {
        const id = 'mr-' + i;
        const set = S.matchChecklist.has(id);
        return `
          <div class="list__item">
            <div class="list__lhs">
              <div class="thumb mono">${esc(r.t)}</div>
              <div><div class="list__title">${esc(r.text)}</div></div>
            </div>
            <button class="btn btn--ghost btn--sm" data-routine="${id}">${set?'✓ Reminder set':'Set reminder'}</button>
          </div>`;
      }).join('');
      document.getElementById('matchChecklistCount').textContent = `${S.matchChecklist.size}/${R.MATCH.routine.length} set`;
      list.querySelectorAll('[data-routine]').forEach(b => b.onclick = () => {
        const id = b.dataset.routine;
        if (S.matchChecklist.has(id)) S.matchChecklist.delete(id); else S.matchChecklist.add(id);
        renderRoutine();
      });
    }
    renderRoutine();

    // Travel checklist
    function renderTravel() {
      const list = document.getElementById('travelList');
      list.innerHTML = R.MATCH.travelChecklist.map((c, i) => {
        const id = 'tc-' + i;
        const done = S.travelChecklist.has(id);
        return `
          <label class="list__item" style="cursor:pointer; padding:6px 0;">
            <div class="list__lhs"><input type="checkbox" data-travel="${id}" ${done?'checked':''}><span class="list__title" style="font-size:13.5px; ${done?'text-decoration:line-through; opacity:.7;':''}">${esc(c)}</span></div>
          </label>`;
      }).join('');
      document.getElementById('travelCount').textContent = `${S.travelChecklist.size}/${R.MATCH.travelChecklist.length} packed • ${R.MATCH.travelMins} min`;
      list.querySelectorAll('[data-travel]').forEach(c => c.onchange = (e) => {
        const id = e.target.dataset.travel;
        if (e.target.checked) S.travelChecklist.add(id); else S.travelChecklist.delete(id);
        renderTravel();
      });
    }
    renderTravel();

    // Post-match
    const PM = [
      'Refuel within 30 min (40g P + 60g CHO)',
      'Cold immersion 10 min',
      'Foam roll glutes / quads / calves',
      'Hydrate ≥ 1L with electrolytes',
      'Bruise / niggle photo log',
      'Sleep ≥ 9h tonight',
    ];
    function renderPM() {
      const list = document.getElementById('postMatchList');
      list.innerHTML = PM.map((t, i) => {
        const id = 'pm-' + i;
        const done = S.postMatchChecklist.has(id);
        return `
          <label class="card--flat card" style="padding:10px; cursor:pointer; display:flex; align-items:center; gap:10px;">
            <input type="checkbox" data-pm="${id}" ${done?'checked':''}>
            <span style="font-size:13px; ${done?'text-decoration:line-through; opacity:.7;':''}">${esc(t)}</span>
          </label>`;
      }).join('');
      document.getElementById('postMatchCount').textContent = `${S.postMatchChecklist.size}/${PM.length} done`;
      list.querySelectorAll('[data-pm]').forEach(c => c.onchange = (e) => {
        const id = e.target.dataset.pm;
        if (e.target.checked) S.postMatchChecklist.add(id); else S.postMatchChecklist.delete(id);
        renderPM();
      });
    }
    renderPM();
  }

  /* =========================================================
     REHAB
     ========================================================= */
  function viewRehab() {
    const a = window.AppState.athlete;
    const isHealthy = (a.phase !== 'rehab' && (!a.injuryHistory || a.injuryHistory.length === 0));
    const showActive = !isHealthy || window.AppState.isDemo;
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Rehab & prehab</h1>
          <p>Manage niggles, RTP gates, and area-specific protocols</p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--ghost" id="logNiggleBtn">Log new niggle</button>
          <button class="btn btn--primary" id="painCheckinBtn">Pain check-in</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Active issues</div>${showActive ? '<span class="chip chip--warn">1 monitoring</span>' : '<span class="chip chip--success">All clear</span>'}</div>
          ${!showActive ? `<div class="empty" style="padding:24px;">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m5 12 5 5 9-11"/></svg>
            <div style="font-weight:600; color:var(--text);">No active niggles</div>
            <div style="font-size:12.5px;">Use prehab below to keep it that way.</div>
          </div>` : R.REHAB.activeIssues.map(iss => `
            <div class="card--flat card" style="padding:14px;">
              <div class="row row--between">
                <div>
                  <div style="font-weight:700;">${esc(iss.area)} — ${esc(iss.status)}</div>
                  <div class="muted" style="font-size:12px;">${esc(iss.note)}</div>
                </div>
                <div class="row" style="gap:10px;">
                  <span class="chip">Pain ${iss.pain}/10</span>
                  <span class="chip chip--success">ROM ${esc(iss.rom)}</span>
                </div>
              </div>
              <div class="row" style="margin-top:10px; gap:6px;">
                ${R.REHAB.stages.map(s => `
                  <div style="flex:1; text-align:center;">
                    <div style="height:6px; border-radius:999px; background: ${s.id <= iss.stage ? 'var(--accent)' : 'var(--surface-2)'};"></div>
                    <div class="muted" style="font-size:10.5px; margin-top:6px;">${esc(s.name)}</div>
                  </div>`).join('')}
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Return-to-play gates</div><span class="muted" style="font-size:12px;" id="rtpProgress"></span></div>
          <div class="list" style="font-size:13px;" id="rtpList"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">ROM placeholders</div></div>
          ${['Shoulder ER','Hip IR','Ankle dorsi','Cervical rotation'].map((n,i) => {
            const v = [78,62,84,70][i];
            return `<div>
              <div class="row row--between" style="font-size:12px;"><span>${n}</span><strong class="num">${v}°</strong></div>
              <div class="progress__bar" style="margin: 6px 0 10px;"><div class="progress__fill ${v<70?'is-warn':''}" style="width:${(v/100)*100}%"></div></div>
            </div>`;
          }).join('')}
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Area-specific prehab</div>
            <div class="segmented" data-segment="prehabPick">
              ${R.REHAB.prehab.map((p, i) => `<button class="${i===0?'is-active':''}" data-val="${esc(p.area)}">${esc(p.area)}</button>`).join('')}
            </div>
          </div>
          <div id="prehabBody"></div>
        </div>

      </div>
    `;
  }

  function attachRehab() {
    const S = window.AppState;

    document.getElementById('logNiggleBtn').onclick = () => {
      window.App.openModal(`
        <h3>Log a new niggle</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Area</label>
            <select class="select" id="niggleArea">
              ${['Right hamstring','Left hamstring','Right ankle','Left ankle','Lower back','Right shoulder','Left shoulder','Neck','Right groin','Left groin'].map(o => `<option>${o}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Pain (0-10)</label>
            <input type="range" min="0" max="10" value="3" id="nigglePain"/>
            <span class="num" id="nigglePainV">3</span>/10
          </div>
          <div class="field"><label>Notes</label>
            <textarea class="textarea" id="niggleNotes" placeholder="When does it hurt? What movements?"></textarea>
          </div>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="saveNiggleBtn">Log it</button>
        </div>
      `);
      document.getElementById('nigglePain').oninput = (e) => document.getElementById('nigglePainV').textContent = e.target.value;
      document.getElementById('saveNiggleBtn').onclick = () => {
        const area = document.getElementById('niggleArea').value;
        const pain = document.getElementById('nigglePain').value;
        window.App.closeModal();
        window.App.toast(`Logged: ${area} • pain ${pain}/10 — physio notified`, 'success');
      };
    };

    document.getElementById('painCheckinBtn').onclick = () => {
      const issue = R.REHAB.activeIssues[0];
      window.App.openModal(`
        <h3>Pain check-in — ${esc(issue.area)}</h3>
        <p class="muted" style="font-size:13px;">Today's pain compared to yesterday.</p>
        <div class="field" style="margin-top:12px;">
          <label>Pain at rest (0-10)</label>
          <input type="range" min="0" max="10" value="${issue.pain}" id="painRest"/>
          <span class="num" id="painRestV">${issue.pain}</span>/10
        </div>
        <div class="field" style="margin-top:12px;">
          <label>Pain on movement (0-10)</label>
          <input type="range" min="0" max="10" value="${issue.pain + 1}" id="painMove"/>
          <span class="num" id="painMoveV">${issue.pain + 1}</span>/10
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="savePainBtn">Submit</button>
        </div>
      `);
      document.getElementById('painRest').oninput = e => document.getElementById('painRestV').textContent = e.target.value;
      document.getElementById('painMove').oninput = e => document.getElementById('painMoveV').textContent = e.target.value;
      document.getElementById('savePainBtn').onclick = () => {
        window.App.closeModal();
        window.App.toast('Pain check-in submitted', 'success');
      };
    };

    function gateState(g) {
      if (S.rtpStateOverride[g.name] !== undefined) return S.rtpStateOverride[g.name];
      return g.done;
    }

    function renderRTP() {
      const list = document.getElementById('rtpList');
      const done = R.REHAB.rtpGates.filter(g => gateState(g)).length;
      document.getElementById('rtpProgress').textContent = `${done}/${R.REHAB.rtpGates.length} cleared`;
      list.innerHTML = R.REHAB.rtpGates.map((g, i) => {
        const d = gateState(g);
        return `
          <div class="list__item">
            <div class="list__lhs">
              <div class="thumb ${d?'thumb--accent':''}">
                ${d ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-11"/></svg>' : '○'}
              </div>
              <div><div class="list__title">${esc(g.name)}</div>
              ${g.eta?`<div class="list__sub">${esc(g.eta)}</div>`:''}</div>
            </div>
            <button class="btn btn--ghost btn--sm" data-rtp="${i}"><span class="chip ${d?'chip--success':''}">${d?'Cleared':'Pending'}</span></button>
          </div>`;
      }).join('');
      list.querySelectorAll('[data-rtp]').forEach(b => b.onclick = () => {
        const i = Number(b.dataset.rtp);
        const g = R.REHAB.rtpGates[i];
        S.rtpStateOverride[g.name] = !gateState(g);
        renderRTP();
      });
    }
    renderRTP();

    function renderPrehab(name) {
      const p = R.REHAB.prehab.find(x => x.area === name) || R.REHAB.prehab[0];
      document.getElementById('prehabBody').innerHTML = `
        <div class="list" style="font-size:13.5px;">
          ${p.items.map((it, i) => {
            const id = `prehab-${name}-${i}`;
            const done = S.checklist.has(id);
            return `
            <div class="list__item" style="${done?'opacity:.55;':''}">
              <div class="list__lhs">
                <div class="thumb ${done?'thumb--accent':''}">
                  ${done ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-11"/></svg>' : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'}
                </div>
                <div>
                  <div class="list__title" style="${done?'text-decoration:line-through;':''}">${esc(it.ex)}</div>
                  <div class="list__sub">${esc(it.sets)} × ${esc(it.reps)} ${it.note?`• ${esc(it.note)}`:''}</div>
                </div>
              </div>
              <button class="btn btn--ghost btn--sm" data-prehab-check="${id}">${done?'Undo':'Mark done'}</button>
            </div>`;}).join('')}
        </div>`;
      document.querySelectorAll('[data-prehab-check]').forEach(b => b.onclick = () => {
        const id = b.dataset.prehabCheck;
        if (S.checklist.has(id)) S.checklist.delete(id); else S.checklist.add(id);
        renderPrehab(name);
      });
    }
    renderPrehab(R.REHAB.prehab[0].area);
    document.querySelectorAll('[data-segment="prehabPick"] button').forEach(b => b.onclick = () => {
      document.querySelectorAll('[data-segment="prehabPick"] button').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      renderPrehab(b.dataset.val);
    });
  }

  /* =========================================================
     COMMUNITY
     ========================================================= */
  function viewCommunity() {
    const a = window.AppState.athlete;
    const S = window.AppState;
    const pos = R.POSITIONS.find(p => p.id === a.primaryPosition);
    const me = { name: `${a.firstName} ${a.lastName}`.trim(), init: a.initials, pos: pos ? pos.name : 'Player', streak: S.streakDays, load: S.weeklyLoad.slice(-1)[0] || 0, badges: [], you: true };
    // Fresh user: empty community until they invite teammates
    if (!S.isDemo) {
      return html`
        <div class="view-head">
          <div class="view-head__title">
            <h1>Squad</h1>
            <p>Invite teammates to compare load, share PRs, and run challenges together.</p>
          </div>
          <div class="view-head__actions">
            <button class="btn btn--primary" id="inviteBtn">Invite teammate</button>
          </div>
        </div>
        <div class="grid grid--auto-md">
          <div class="card span-2">
            <div class="card__head"><div class="card__title">You</div></div>
            <div class="row" style="gap:12px;">
              <span class="avatar" style="width:44px;height:44px;">${esc(me.init)}</span>
              <div>
                <div style="font-weight:700;">${esc(me.name || 'Athlete')}</div>
                <div class="muted" style="font-size:12px;">${esc(me.pos)} • ${me.streak}d streak</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card__head"><div class="card__title">Challenges</div></div>
            <div class="empty" style="padding:20px;">
              <div style="font-size:12.5px;">Create your first challenge — solo or with teammates.</div>
              <button class="btn btn--ghost btn--sm" id="newChallengeBtn" style="margin-top:8px;">+ New challenge</button>
            </div>
          </div>
          <div class="card span-2">
            <div class="card__head"><div class="card__title">Squad feed</div></div>
            <div class="empty" style="padding:32px;">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <div style="font-weight:600; color:var(--text);">No squad yet</div>
              <div style="font-size:12.5px;">Invite teammates to see their PRs, streaks and load.</div>
            </div>
          </div>
        </div>`;
    }
    const team = [me, ...R.TEAM.filter(t => !t.you)];
    const sorted = [...team].sort((a,b) => b.streak - a.streak);
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Squad & accountability</h1>
          <p>Leaderboard • challenges • coach feed</p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--ghost" id="inviteBtn">Invite teammate</button>
          <button class="btn btn--primary" id="newChallengeBtn">+ New challenge</button>
        </div>
      </div>

      <div class="grid grid--auto-md">

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Team leaderboard</div><span class="chip">Weekly streak</span></div>
          <table class="table">
            <thead><tr><th>#</th><th>Player</th><th>Position</th><th class="num">Streak</th><th class="num">Load (AU)</th><th>Badges</th></tr></thead>
            <tbody>
              ${sorted.map((t, i) => `
                <tr ${t.you?'style="background:var(--accent-soft);"':''}>
                  <td class="num">${i+1}</td>
                  <td>
                    <div class="row" style="gap:8px;"><span class="avatar" style="width:24px;height:24px;font-size:10px;">${esc(t.init)}</span><strong>${esc(t.name)}${t.you?' <span class="chip chip--accent">You</span>':''}</strong></div>
                  </td>
                  <td>${esc(t.pos)}</td>
                  <td class="num">${t.streak}d</td>
                  <td class="num">${t.load}</td>
                  <td>${t.badges.map(b => `<span class="chip chip--accent" style="margin-right:4px;">${esc(b)}</span>`).join('')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Active challenges</div></div>
          <div id="challengesBox"></div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Accountability partner</div></div>
          <div class="row" style="gap:12px;">
            <span class="avatar" style="width:44px; height:44px;">ST</span>
            <div>
              <div style="font-weight:700;">Sione Toa</div>
              <div class="muted" style="font-size:12px;">Lock • 19-day streak</div>
            </div>
            <div style="flex:1"></div>
            <button class="btn btn--primary btn--sm" id="nudgeBtn">Nudge</button>
          </div>
          <p class="muted" style="font-size:12.5px; margin-top:10px;">"3 more chin-up sets and you're caught up. Let's go."</p>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Squad feed</div></div>
          <div class="feed">
            ${R.FEED.map(f => `
              <div class="feed__item">
                <span class="avatar feed__avatar">${esc(f.init)}</span>
                <div class="feed__body">
                  <div class="feed__head"><span class="feed__name">${esc(f.who)}</span><span class="feed__time">${esc(f.when)}</span></div>
                  <div class="feed__text">${esc(f.text)}</div>
                  <div class="feed__meta">
                    ${f.meta.map(m => `<span class="chip">${esc(m)}</span>`).join('')}
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Badges earned</div></div>
          <div class="row row--wrap" style="gap:8px;">
            ${['Iron Streak','PB Week','Engine','Speedster','Neck Strong','Forwards Lift','100 Pull-ups'].map(b => `
              <span class="chip chip--accent">${esc(b)}</span>`).join('')}
          </div>
        </div>

      </div>
    `;
  }

  /* =========================================================
     MENU — recipes & food
     ========================================================= */
  function viewMenu() {
    const S = window.AppState;
    S.menuFilter = S.menuFilter || { cat:'all', diet:'all', tag:'all', q:'' };
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Food menu</h1>
          <p>${S.recipes.length} recipes • macros, ingredients, and one-tap log.</p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--primary" id="addRecipeBtn">+ New recipe</button>
        </div>
      </div>

      <div class="card">
        <div class="row row--wrap" style="gap:14px;">
          <div class="field" style="flex:1; min-width:200px;">
            <label>Search</label>
            <input class="input" id="menuSearch" placeholder="Recipe name or ingredient…" value="${esc(S.menuFilter.q)}"/>
          </div>
          <div class="field">
            <label>Category</label>
            <div class="segmented" data-segment="menuCat">
              ${['all','breakfast','lunch','dinner','snack','pre-train','post-train'].map(c => `<button class="${S.menuFilter.cat===c?'is-active':''}" data-val="${c}">${esc(c)}</button>`).join('')}
            </div>
          </div>
          <div class="field">
            <label>Diet</label>
            <div class="segmented" data-segment="menuDiet">
              ${['all','omnivore','pescatarian','vegetarian','vegan'].map(c => `<button class="${S.menuFilter.diet===c?'is-active':''}" data-val="${c}">${esc(c)}</button>`).join('')}
            </div>
          </div>
          <div class="field">
            <label>Goal tag</label>
            <div class="segmented" data-segment="menuTag">
              ${['all','mass-gain','lean-mass','recomp','fat-loss','performance','strength','match-fitness'].map(c => `<button class="${S.menuFilter.tag===c?'is-active':''}" data-val="${c}">${esc(c)}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid--auto-lg" id="menuGrid"></div>
    `;
  }

  function attachMenu() {
    const S = window.AppState;
    function filter() {
      const f = S.menuFilter;
      return S.recipes.filter(r =>
        (f.cat === 'all' || r.category === f.cat) &&
        (f.diet === 'all' || r.diet === f.diet || (f.diet === 'omnivore' && r.diet === 'omnivore')) &&
        (f.tag === 'all' || (r.tags || []).includes(f.tag)) &&
        (!f.q || r.name.toLowerCase().includes(f.q.toLowerCase()) || (r.ingredients||[]).some(i => i.item.toLowerCase().includes(f.q.toLowerCase())))
      );
    }
    function paint() {
      const list = filter();
      const grid = document.getElementById('menuGrid');
      if (!grid) return;
      if (!list.length) {
        grid.innerHTML = '<div class="card"><div class="empty" style="padding:36px;"><div style="font-weight:600;color:var(--text);">No recipes match</div><div style="font-size:12.5px;">Try a different filter or add your own.</div></div></div>';
        return;
      }
      grid.innerHTML = list.map(r => `
        <div class="card" data-recipe-card="${esc(r.id)}">
          <div class="card__head">
            <div class="card__title">${esc(r.name)}</div>
            <div class="row" style="gap:6px;">
              <span class="chip chip--accent">${esc(r.category)}</span>
              ${r.diet !== 'omnivore' ? `<span class="chip">${esc(r.diet)}</span>` : ''}
            </div>
          </div>
          <div class="row row--wrap" style="gap:6px; margin-bottom:8px;">
            <span class="chip"><strong class="num">${r.kcal}</strong>&nbsp;kcal</span>
            <span class="chip">P <strong class="num">${r.protein}</strong>g</span>
            <span class="chip">C <strong class="num">${r.carbs}</strong>g</span>
            <span class="chip">F <strong class="num">${r.fat}</strong>g</span>
            <span class="chip muted">${r.time} min</span>
            <span class="chip muted">${r.servings} serv${r.servings>1?'s':''}</span>
          </div>
          <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; margin-bottom:4px;">Ingredients</div>
          <ul style="margin:0 0 8px 18px; padding:0; line-height:1.6; font-size:13px;">
            ${(r.ingredients||[]).map(i => `<li>${esc(i.qty)} — ${esc(i.item)}</li>`).join('')}
          </ul>
          ${(r.steps && r.steps.length) ? `
            <details>
              <summary class="muted" style="cursor:pointer; font-size:12px;">Method (${r.steps.length} steps)</summary>
              <ol style="margin:6px 0 0 18px; line-height:1.6; font-size:12.5px;">
                ${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}
              </ol>
            </details>` : ''}
          ${(r.tags && r.tags.length) ? `<div class="row row--wrap" style="gap:4px; margin-top:8px;">${r.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
          <div class="row" style="margin-top:12px; gap:6px; flex-wrap:wrap;">
            <button class="btn btn--primary btn--sm" data-recipe-log="${esc(r.id)}">+ Log meal</button>
            <button class="btn btn--ghost btn--sm" data-recipe-grocery="${esc(r.id)}">+ Grocery</button>
            <div style="flex:1"></div>
            <button class="btn btn--ghost btn--sm" data-recipe-edit="${esc(r.id)}">Edit</button>
            <button class="btn btn--ghost btn--sm" data-recipe-del="${esc(r.id)}" style="color:var(--danger);">Delete</button>
          </div>
        </div>
      `).join('');

      // log
      grid.querySelectorAll('[data-recipe-log]').forEach(b => b.onclick = () => {
        const r = S.recipes.find(x => x.id === b.dataset.recipeLog);
        S.extraMeals.push({ name: r.name, kcal: r.kcal, p: r.protein, c: r.carbs, f: r.fat });
        window.App.toast(`Logged ${r.name} (${r.kcal} kcal)`, 'success');
      });
      // grocery: push ingredients (de-dupe by item name)
      grid.querySelectorAll('[data-recipe-grocery]').forEach(b => b.onclick = () => {
        const r = S.recipes.find(x => x.id === b.dataset.recipeGrocery);
        let added = 0;
        (r.ingredients || []).forEach(i => {
          if (!S.grocery.find(g => g.item.toLowerCase() === i.item.toLowerCase())) {
            S.grocery.push({ id: 'g-' + Math.random().toString(36).slice(2,7), item: i.item, qty: i.qty, checked: false });
            added++;
          }
        });
        window.App.toast(added ? `Added ${added} item${added>1?'s':''} to grocery` : 'All items already in grocery list', added ? 'success' : 'info');
      });
      grid.querySelectorAll('[data-recipe-del]').forEach(b => b.onclick = () => {
        const r = S.recipes.find(x => x.id === b.dataset.recipeDel);
        if (!confirm(`Delete "${r.name}"? This can't be undone.`)) return;
        S.recipes = S.recipes.filter(x => x.id !== r.id);
        paint();
        window.App.toast('Recipe deleted', 'info');
      });
      grid.querySelectorAll('[data-recipe-edit]').forEach(b => b.onclick = () => openRecipeEditor(b.dataset.recipeEdit));
    }
    paint();

    // Filter wiring
    document.getElementById('menuSearch').oninput = (e) => { S.menuFilter.q = e.target.value; paint(); };
    ['menuCat','menuDiet','menuTag'].forEach(seg => {
      document.querySelectorAll(`[data-segment="${seg}"] button`).forEach(b => b.onclick = () => {
        document.querySelectorAll(`[data-segment="${seg}"] button`).forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        const key = seg === 'menuCat' ? 'cat' : seg === 'menuDiet' ? 'diet' : 'tag';
        S.menuFilter[key] = b.dataset.val;
        paint();
      });
    });

    document.getElementById('addRecipeBtn').onclick = () => openRecipeEditor(null);
  }

  function openRecipeEditor(id) {
    const S = window.AppState;
    const isNew = !id;
    const r = isNew
      ? { id:'r-' + Math.random().toString(36).slice(2,8), name:'', category:'lunch', diet:'omnivore', time:15, servings:1, kcal:0, protein:0, carbs:0, fat:0, ingredients:[{item:'',qty:''}], steps:[], tags:[] }
      : { ...S.recipes.find(x => x.id === id), ingredients: S.recipes.find(x => x.id === id).ingredients.map(i => ({...i})), steps: [...(S.recipes.find(x => x.id === id).steps || [])], tags: [...(S.recipes.find(x => x.id === id).tags || [])] };

    function render() {
      window.App.openModal(`
        <h3>${isNew ? 'New recipe' : 'Edit recipe'}</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Recipe name</label><input class="input" id="rcpName" value="${esc(r.name)}" placeholder="e.g. Chicken pesto pasta"/></div>
          <div class="grid grid--4" style="gap:8px;">
            <div class="field"><label>Category</label>
              <select class="select" id="rcpCat">
                ${['breakfast','lunch','dinner','snack','pre-train','post-train'].map(c => `<option value="${c}" ${r.category===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Diet</label>
              <select class="select" id="rcpDiet">
                ${['omnivore','pescatarian','vegetarian','vegan'].map(c => `<option value="${c}" ${r.diet===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Time (min)</label><input class="input num" type="number" id="rcpTime" value="${r.time}"/></div>
            <div class="field"><label>Servings</label><input class="input num" type="number" id="rcpServ" value="${r.servings}"/></div>
          </div>

          <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; margin-top:4px;">Macros (per serving)</div>
          <div class="grid grid--4" style="gap:8px;">
            <div class="field"><label>kcal</label><input class="input num" type="number" id="rcpKcal" value="${r.kcal}"/></div>
            <div class="field"><label>P (g)</label><input class="input num" type="number" id="rcpP" value="${r.protein}"/></div>
            <div class="field"><label>C (g)</label><input class="input num" type="number" id="rcpC" value="${r.carbs}"/></div>
            <div class="field"><label>F (g)</label><input class="input num" type="number" id="rcpF" value="${r.fat}"/></div>
          </div>

          <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; margin-top:4px;">Ingredients</div>
          <div id="rcpIngList"></div>
          <button class="btn btn--ghost btn--sm" id="rcpAddIng" type="button">+ Add ingredient</button>

          <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; margin-top:4px;">Method (one step per line)</div>
          <textarea class="textarea" id="rcpSteps" placeholder="Step 1\nStep 2\nStep 3">${esc((r.steps||[]).join('\n'))}</textarea>

          <div class="muted" style="font-size:11px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; margin-top:4px;">Tags (comma separated)</div>
          <input class="input" id="rcpTags" value="${esc((r.tags||[]).join(', '))}" placeholder="mass-gain, performance"/>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="rcpSave">${isNew ? 'Create recipe' : 'Save changes'}</button>
        </div>
      `);
      renderIngs();
      document.getElementById('rcpAddIng').onclick = () => { r.ingredients.push({ item:'', qty:'' }); renderIngs(); };
      document.getElementById('rcpSave').onclick = save;
    }
    function renderIngs() {
      const box = document.getElementById('rcpIngList');
      box.innerHTML = r.ingredients.map((it, i) => `
        <div class="row" style="gap:6px; margin-bottom:6px;">
          <input class="input" style="flex:2;" placeholder="Ingredient" value="${esc(it.item)}" data-ing-item="${i}"/>
          <input class="input" style="flex:1;" placeholder="Quantity" value="${esc(it.qty)}" data-ing-qty="${i}"/>
          <button class="iconbtn iconbtn--sm" data-ing-del="${i}" title="Remove">✕</button>
        </div>`).join('');
      box.querySelectorAll('[data-ing-item]').forEach(inp => inp.oninput = (e) => { r.ingredients[Number(inp.dataset.ingItem)].item = e.target.value; });
      box.querySelectorAll('[data-ing-qty]').forEach(inp => inp.oninput = (e) => { r.ingredients[Number(inp.dataset.ingQty)].qty = e.target.value; });
      box.querySelectorAll('[data-ing-del]').forEach(b => b.onclick = () => { r.ingredients.splice(Number(b.dataset.ingDel), 1); renderIngs(); });
    }
    function save() {
      const name = document.getElementById('rcpName').value.trim();
      if (!name) { window.App.toast('Give the recipe a name', 'warn'); return; }
      r.name = name;
      r.category = document.getElementById('rcpCat').value;
      r.diet = document.getElementById('rcpDiet').value;
      r.time = Number(document.getElementById('rcpTime').value) || 0;
      r.servings = Number(document.getElementById('rcpServ').value) || 1;
      r.kcal = Number(document.getElementById('rcpKcal').value) || 0;
      r.protein = Number(document.getElementById('rcpP').value) || 0;
      r.carbs = Number(document.getElementById('rcpC').value) || 0;
      r.fat = Number(document.getElementById('rcpF').value) || 0;
      r.steps = document.getElementById('rcpSteps').value.split('\n').map(s => s.trim()).filter(Boolean);
      r.tags = document.getElementById('rcpTags').value.split(',').map(s => s.trim()).filter(Boolean);
      r.ingredients = r.ingredients.filter(i => i.item || i.qty);
      if (isNew) S.recipes.unshift(r);
      else { const idx = S.recipes.findIndex(x => x.id === r.id); if (idx >= 0) S.recipes[idx] = r; }
      window.App.closeModal();
      window.App.toast(isNew ? `Created "${r.name}"` : `Saved "${r.name}"`, 'success');
      window.App.refreshView();
    }
    render();
  }

  function attachCommunity() {
    const S = window.AppState;

    const inviteBtn = document.getElementById('inviteBtn');
    if (inviteBtn) inviteBtn.onclick = () => {
      window.App.openModal(`
        <h3>Invite teammate</h3>
        <p class="muted" style="font-size:13px;">They'll receive a sign-up link with your team pre-selected.</p>
        <div class="field" style="margin-top:10px;"><label>Email</label><input class="input" type="email" id="inviteEmail" placeholder="teammate@club.com" /></div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="sendInviteBtn">Send invite</button>
        </div>
      `);
      document.getElementById('inviteEmail').focus();
      document.getElementById('sendInviteBtn').onclick = () => {
        const v = document.getElementById('inviteEmail').value.trim();
        if (!v.includes('@')) { window.App.toast('Enter a valid email', 'warn'); return; }
        window.App.closeModal();
        window.App.toast(`Invite sent to ${v}`, 'success');
      };
    };

    const newCh = document.getElementById('newChallengeBtn');
    if (newCh) newCh.onclick = () => {
      window.App.openModal(`
        <h3>New challenge</h3>
        <div class="grid" style="gap:10px; margin-top:10px;">
          <div class="field"><label>Name</label><input class="input" id="chName" placeholder="e.g. 50 Nordics in 7 days"/></div>
          <div class="grid grid--3" style="gap:8px;">
            <div class="field"><label>Target</label><input class="input num" id="chTarget" type="number" placeholder="50" /></div>
            <div class="field"><label>Unit</label><input class="input" id="chUnit" placeholder="reps" /></div>
            <div class="field"><label>Ends</label><input class="input" id="chEnds" placeholder="Sun" /></div>
          </div>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
          <button class="btn btn--ghost" data-close-modal>Cancel</button>
          <button class="btn btn--primary" id="createChBtn">Create</button>
        </div>
      `);
      document.getElementById('createChBtn').onclick = () => {
        const name = document.getElementById('chName').value.trim();
        if (!name) { window.App.toast('Enter a challenge name', 'warn'); return; }
        const target = Number(document.getElementById('chTarget').value) || 10;
        const unit = document.getElementById('chUnit').value.trim() || 'reps';
        const ends = document.getElementById('chEnds').value.trim() || 'Sun';
        R.CHALLENGES.push({ name, prog: 0, target, unit, joined: true, ends });
        S.challenges[name] = true;
        window.App.closeModal();
        renderChallenges();
        window.App.toast(`"${name}" created — go!`, 'success');
      };
    };
    function renderChallenges() {
      const box = document.getElementById('challengesBox');
      if (!box) return;
      box.innerHTML = R.CHALLENGES.map(c => {
        const joined = !!S.challenges[c.name];
        return `
          <div class="card--flat card" style="padding:12px; margin-bottom:8px;">
            <div class="row row--between">
              <strong>${esc(c.name)}</strong>
              ${joined
                ? `<span class="chip chip--accent" style="cursor:pointer;" data-challenge="${esc(c.name)}">Joined ✓</span>`
                : `<button class="btn btn--ghost btn--sm" data-challenge="${esc(c.name)}">Join</button>`}
            </div>
            <div class="muted" style="font-size:12px; margin-top:4px;">${c.prog} / ${c.target} ${esc(c.unit)} • ends ${esc(c.ends)}</div>
            <div class="progress__bar" style="margin-top:8px;"><div class="progress__fill" style="width:${Math.min(100,(c.prog/c.target)*100)}%"></div></div>
          </div>`;
      }).join('');
      box.querySelectorAll('[data-challenge]').forEach(el => el.onclick = () => {
        const name = el.dataset.challenge;
        S.challenges[name] = !S.challenges[name];
        renderChallenges();
        window.App.toast(S.challenges[name] ? `Joined "${name}"` : `Left "${name}"`, S.challenges[name] ? 'success' : 'info');
      });
    }
    renderChallenges();

    const nudge = document.getElementById('nudgeBtn');
    if (nudge) nudge.onclick = () => {
      nudge.disabled = true; nudge.textContent = '✓ Nudge sent';
      window.App.toast('Nudge sent', 'success');
    };
  }

  /* =========================================================
     PROFILE
     ========================================================= */
  function viewProfile() {
    const a = window.AppState.athlete;
    const pos = R.POSITIONS.find(p => p.id === a.primaryPosition) || R.POSITIONS[7];
    const sec = R.POSITIONS.find(p => p.id === a.secondaryPosition);
    const secName = sec ? sec.name : '—';
    return html`
      <div class="view-head">
        <div class="view-head__title">
          <h1>Athlete profile</h1>
          <p>Identity • benchmarks • availability • injury history</p>
        </div>
        <div class="view-head__actions">
          <button class="btn btn--ghost" id="resetOnb">Re-run onboarding</button>
          <button class="btn btn--primary" id="saveProfileBtn">Save changes</button>
        </div>
      </div>

      <div class="grid grid--auto-md">
        <div class="card">
          <div class="card__head"><div class="card__title">Identity</div></div>
          <div class="row" style="gap:14px;">
            <span class="avatar" style="width:64px; height:64px; font-size:20px;">${esc(a.initials)}</span>
            <div>
              <div style="font-family:var(--font-display); font-size:20px; font-weight:700;">${esc(a.firstName)} ${esc(a.lastName)}</div>
              <div class="muted" style="font-size:13px;">${esc(pos.name)} • ${esc(a.archetype)} • ${esc(a.level)}</div>
              <div class="row row--wrap" style="gap:6px; margin-top:6px;">
                ${a.phase ? `<span class="chip chip--accent">${esc(a.phase)}</span>` : '<span class="chip">No phase set</span>'}
                ${(Array.isArray(a.goal) ? a.goal : a.goal ? [a.goal] : []).filter(Boolean).map(g => `<span class="chip">Goal: ${esc(g)}</span>`).join('') || ''}
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Physical</div><span class="muted" style="font-size:11px;">Auto-saves</span></div>
          <div class="grid grid--3" style="gap:8px;">
            <div class="field"><label>Age</label><input class="input num" type="number" min="14" max="50" value="${a.age}" data-athlete="age" /></div>
            <div class="field"><label>Height (cm)</label><input class="input num" type="number" min="150" max="220" value="${a.heightCm}" data-athlete="heightCm" /></div>
            <div class="field"><label>Weight (kg)</label><input class="input num" type="number" step="0.1" value="${a.weightKg}" data-athlete="weightKg" /></div>
            <div class="field"><label>Target (kg)</label><input class="input num" type="number" step="0.1" value="${a.targetWeightKg}" data-athlete="targetWeightKg" /></div>
            <div class="field"><label>Dominant side</label>
              <select class="select" data-athlete="dominantSide">
                ${['Right','Left','Both'].map(s => `<option ${a.dominantSide===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Sessions / wk</label>
              <select class="select" data-athlete="sessionsPerWeek">
                ${[2,3,4,5,6].map(n => `<option value="${n}" ${a.sessionsPerWeek===n?'selected':''}>${n}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Availability</div></div>
          <div class="row" style="gap:10px; align-items:flex-start;">
            <span class="chip chip--success">Available</span>
            <span class="chip">Contact: Green</span>
          </div>
          <div class="muted" style="font-size:12.5px; margin-top:8px;">No selection restrictions for Saturday.</div>
          <div class="field" style="margin-top:10px;">
            <label>Risk flags</label>
            <div class="row row--wrap" style="gap:6px;">
              ${(a.riskFlags||[]).map(f => `<span class="chip chip--warn">${esc(f)}</span>`).join('') || '<span class="muted" style="font-size:12px;">None</span>'}
            </div>
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Strength benchmarks</div><span class="muted" style="font-size:12px;">${window.AppState.isDemo ? 'All in kg' : 'Log your first session to populate'}</span></div>
          ${window.AppState.isDemo ? `
            <table class="table">
              <thead><tr><th>Lift</th><th class="num">Current</th><th class="num">+1 RM</th><th class="num">/ BW</th></tr></thead>
              <tbody>
                ${[
                  ['Back squat', R.BENCHMARKS.backSquat],
                  ['Front squat', R.BENCHMARKS.frontSquat],
                  ['Trap bar DL', R.BENCHMARKS.deadlift],
                  ['Bench press', R.BENCHMARKS.benchPress],
                  ['Hang clean', R.BENCHMARKS.hangClean],
                ].map(([n, v]) => `
                  <tr>
                    <td>${n}</td>
                    <td class="num">${v}</td>
                    <td class="num">${Math.round(v*1.03)}</td>
                    <td class="num">${(v / a.weightKg).toFixed(2)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>`
          : `<div class="empty" style="padding:20px;"><div style="font-size:12.5px;">Benchmarks build automatically as you complete sessions.</div></div>`}
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Speed benchmarks</div></div>
          ${window.AppState.isDemo ? `
            <div class="grid grid--3" style="gap:6px;">
              <div class="stat"><div class="stat__label">10m</div><div class="stat__value num">${R.SPEED.tenM}s</div></div>
              <div class="stat"><div class="stat__label">20m</div><div class="stat__value num">${R.SPEED.twentyM}s</div></div>
              <div class="stat"><div class="stat__label">40m</div><div class="stat__value num">${R.SPEED.fortyM}s</div></div>
              <div class="stat"><div class="stat__label">Bronco</div><div class="stat__value num">${R.SPEED.bronco}</div></div>
              <div class="stat"><div class="stat__label">Yo-Yo IR1</div><div class="stat__value num">${R.SPEED.yoyoIR1}</div></div>
              <div class="stat"><div class="stat__label">RHIE</div><div class="stat__value num">${R.SPEED.repeatHIE}/10</div></div>
            </div>`
          : `<div class="empty" style="padding:14px;"><div style="font-size:12.5px;">No times logged yet.</div></div>`}
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Positions</div></div>
          <div class="row row--wrap" style="gap:8px;">
            <span class="chip chip--accent">Primary: ${esc(pos.name)}</span>
            <span class="chip">Secondary: ${esc(secName)}</span>
          </div>
          <div class="muted" style="font-size:12.5px; margin-top:10px;">Programs and KPIs blend across both, with primary weighted higher.</div>
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Injury history</div></div>
          <div class="list" style="font-size:13px;">
            ${(a.injuryHistory||[]).map(i => `
              <div class="list__item" style="padding:8px 0;">
                <div class="list__lhs"><div class="thumb">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6M12 9v6"/></svg>
                </div><div class="list__title">${esc(i)}</div></div>
                <span class="chip">Resolved</span>
              </div>`).join('') || '<div class="muted">None recorded</div>'}
          </div>
        </div>

        <div class="card span-2">
          <div class="card__head"><div class="card__title">Preferences</div></div>
          <div class="grid grid--3">
            <div class="field"><label>Units</label>
              <div class="segmented" data-segment="units">
                <button class="${a.units==='metric'?'is-active':''}" data-val="metric">Metric</button>
                <button class="${a.units==='imperial'?'is-active':''}" data-val="imperial">Imperial</button>
              </div>
            </div>
            <div class="field"><label>Notifications</label>
              <label class="toggle" style="cursor:pointer;">
                <input type="checkbox" ${a.notifPref === false ? '' : 'checked'} data-athlete-bool="notifPref">
                <span class="toggle__track"></span>
                <span>Pre-session reminders</span>
              </label>
            </div>
            <div class="field"><label>Theme</label>
              <div class="segmented" data-segment="themePref">
                <button class="is-active" data-val="dark">Dark</button>
                <button data-val="light">Light</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function attachProfile() {
    const a = window.AppState.athlete;
    document.getElementById('resetOnb').onclick = () => {
      if (confirm('Re-run onboarding? Your current profile will be reset.')) {
        window.App.beginOnboarding(true);
      }
    };
    document.getElementById('saveProfileBtn').onclick = () => {
      window.App.toast('Profile saved ✓', 'success');
      window.App.refreshTopbar();
    };

    // auto-bind data-athlete inputs to athlete state
    document.querySelectorAll('[data-athlete]').forEach(el => {
      const evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, (e) => {
        const k = el.dataset.athlete;
        const numeric = ['age','heightCm','weightKg','targetWeightKg','sessionsPerWeek'].includes(k);
        a[k] = numeric ? Number(el.value) : el.value;
        window.App.refreshTopbar();
      });
    });
    // bind boolean toggles
    document.querySelectorAll('[data-athlete-bool]').forEach(el => {
      el.addEventListener('change', (e) => {
        a[el.dataset.athleteBool] = el.checked;
        window.App.toast(`${el.dataset.athleteBool} ${el.checked?'enabled':'disabled'}`, 'info');
      });
    });

    document.querySelectorAll('[data-segment="units"] button').forEach(b => b.onclick = () => {
      document.querySelectorAll('[data-segment="units"] button').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      a.units = b.dataset.val;
      window.App.toast(`Units set to ${b.dataset.val}`, 'info');
    });
    document.querySelectorAll('[data-segment="themePref"] button').forEach(b => {
      const active = (b.dataset.val === window.AppState.theme);
      b.classList.toggle('is-active', active);
      b.onclick = () => {
        document.querySelectorAll('[data-segment="themePref"] button').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        window.App.setTheme(b.dataset.val);
      };
    });
  }

  /* =========================================================
     EXPORTS
     ========================================================= */
  window.RFViews = {
    dashboard:  { render: viewDashboard,  attach: attachDashboard },
    program:    { render: viewProgram,    attach: attachProgram },
    session:    { render: viewSession,    attach: attachSession },
    analytics:  { render: viewAnalytics,  attach: attachAnalytics },
    recovery:   { render: viewRecovery,   attach: attachRecovery },
    nutrition:  { render: viewNutrition,  attach: attachNutrition },
    menu:       { render: viewMenu,       attach: attachMenu },
    position:   { render: viewPosition,   attach: attachPosition },
    matchprep:  { render: viewMatchPrep,  attach: attachMatchPrep },
    rehab:      { render: viewRehab,      attach: attachRehab },
    community:  { render: viewCommunity,  attach: attachCommunity },
    profile:    { render: viewProfile,    attach: attachProfile },
  };
})();
