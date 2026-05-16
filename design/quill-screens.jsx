// Quill — the seven key screens.
// Depends on quill-system.jsx and quill-components.jsx.
// Each screen is rendered inside an IOSDevice frame at 390×844 (artboard 410×864).

const SCREEN_W = 390;
const SCREEN_H = 844;

// ─────────────────────────────────────────────────────────────
// Sample data — one coherent personal world: a few projects across
// all 5 domains, with realistic dependencies and a Today list.
// ─────────────────────────────────────────────────────────────
const SAMPLE = {
  today: [
    { title: 'Morning pages — 3 sides',     domain: 'spirit', project: 'Daily practice',     due: 'today',    state: 'open',  priority: 0, today: true },
    { title: 'Strength: deadlift session',  domain: 'body',   project: 'Forge · Block 4',    due: '8:00',     state: 'open',  priority: 1, today: true },
    { title: 'Reply to Meridian onboarding brief', domain: 'work', project: 'Meridian onboarding', due: 'today', state: 'ready', priority: 2, today: true },
    { title: 'Send signed lease to landlord', domain: 'family', project: 'Moving Crew',       due: 'overdue',  state: 'open',  priority: 3, today: true },
    { title: 'Review Roth allocation',       domain: 'wealth', project: 'Q2 finances',       due: 'today',    state: 'blocked', priority: 0, today: true, blockedBy: 'broker statement' },
    { title: 'Walk Otis — long loop',        domain: 'body',   project: null,                due: 'today',    state: 'done',  priority: 0 },
  ],
  projects: [
    { title: 'Meridian client onboarding', domain: 'work',   open: 8,  ready: 2, blocked: 1, done: 4, total: 13, due: 'May 22' },
    { title: 'Moving Crew · Brooklyn',     domain: 'family', open: 11, ready: 3, blocked: 2, done: 6, total: 22, due: 'Jun 1' },
    { title: 'Forge · Strength block 4',   domain: 'body',   open: 5,  ready: 5, blocked: 0, done: 12, total: 24, due: '6 weeks' },
    { title: 'Q2 finances + taxes',        domain: 'wealth', open: 4,  ready: 1, blocked: 2, done: 3, total: 10, due: 'Jun 15' },
    { title: 'Daily practice · spring',    domain: 'spirit', open: 3,  ready: 3, blocked: 0, done: 28, total: 60, due: 'ongoing' },
    { title: 'Crucible 1.2 · personal',    domain: 'work',   open: 6,  ready: 2, blocked: 1, done: 9,  total: 18, due: 'no date', paused: true },
  ],
  meridian: {
    title: 'Meridian client onboarding',
    domain: 'work',
    tasks: [
      { id:'a', title: 'Define onboarding deliverables', state:'done', priority:0, indent:0 },
      { id:'b', title: 'Kickoff call · agenda + send invites', state:'done', priority:0, indent:0 },
      { id:'c', title: 'Draft engagement letter', state:'done', priority:1, indent:0 },
      { id:'d', title: 'Reply to Meridian brief', state:'ready', priority:2, indent:0, today:true, hasChildren:true },
      { id:'d1', title: 'Pull last quarter scope notes', state:'done', priority:0, indent:1 },
      { id:'d2', title: 'Drafting points of agreement', state:'open',  priority:1, indent:1 },
      { id:'e', title: 'Send proposal v1', state:'blocked', priority:2, indent:0, blockedBy:'reply' },
      { id:'e1', title: 'Confirm rate card', state:'open', priority:1, indent:1 },
      { id:'e2', title: 'Compile case studies', state:'open', priority:0, indent:1, hasChildren:true },
      { id:'e2a', title: 'Polaris — pull screenshots', state:'open', priority:0, indent:2 },
      { id:'e2b', title: 'Tessera — write 1-pg outcome', state:'open', priority:0, indent:2 },
      { id:'f', title: 'Schedule kickoff workshop', state:'blocked', priority:1, indent:0, blockedBy:'proposal' },
      { id:'g', title: 'Set up shared Notion space', state:'open', priority:0, indent:0 },
    ],
  },
  body: [
    { project: 'Forge · Strength block 4', tasks: [
      { title:'Deadlift session — pyramid 5×3', due:'today',   state:'open',  priority:1, today:true },
      { title:'Mobility — hips 20m',            due:'today',   state:'open',  priority:0 },
      { title:'Log session in Forge',           due:'today',   state:'ready', priority:0, unblocks:'recovery score' },
    ]},
    { project: 'Recovery & sleep', tasks: [
      { title:'Order new pillow',               due:'this wk', state:'open',  priority:0 },
      { title:'Cancel late coffee',             due:null,      state:'open',  priority:1 },
    ]},
    { project: 'No project', tasks: [
      { title:'Walk Otis — long loop',          due:'today',   state:'done',  priority:0 },
      { title:'Annual physical · book',         due:'May 18',  state:'open',  priority:2 },
    ]},
  ],
};

// ─────────────────────────────────────────────────────────────
// Shared screen frame helper
// ─────────────────────────────────────────────────────────────
function ScreenFrame({ children, dark = false }) {
  return (
    <IOSDevice width={SCREEN_W} height={SCREEN_H} dark={dark}>
      <div style={{
        position: 'absolute', inset: 0, background: Q.linen,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. TODAY
// ─────────────────────────────────────────────────────────────
function ScreenToday() {
  // group today's tasks by domain
  const grouped = {};
  SAMPLE.today.forEach((t) => {
    (grouped[t.domain] = grouped[t.domain] || []).push(t);
  });
  const order = DOMAIN_ORDER.filter((d) => grouped[d]);

  const ready = SAMPLE.today.filter(t => t.state === 'ready' || t.state === 'open').length;
  const done = SAMPLE.today.filter(t => t.state === 'done').length;
  const blocked = SAMPLE.today.filter(t => t.state === 'blocked').length;

  return (
    <ScreenFrame>
      <AppTopBar left="Fri · May 8" right="Quill" />
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 80, overflow: 'hidden' }}>
        <ViewHeader
          title="Today"
          dropCap="T"
          kicker="Friday · the eighth"
          action={<QIcon name="filter" size={18} sw={1.4} style={{ color: Q.ink2 }} />}
        />
        {/* tally line */}
        <div style={{
          margin: '0 16px 14px', padding: '8px 12px',
          background: Q.paper, borderRadius: 3,
          boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: Q.mono, fontSize: 11, color: Q.ink2,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: Q.rubric }} />
            <b style={{ color: Q.ink, fontWeight: 600 }}>{ready}</b>
            <span style={{ color: Q.ink3 }}>open</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: Q.ink3 }} />
            <b style={{ color: Q.ink, fontWeight: 600 }}>{blocked}</b>
            <span style={{ color: Q.ink3 }}>blocked</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: Q.ink }} />
            <b style={{ color: Q.ink, fontWeight: 600 }}>{done}</b>
            <span style={{ color: Q.ink3 }}>done</span>
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ color: Q.ink3 }}>by domain</span>
        </div>
        {order.map((k) => {
          const d = DOMAINS[k];
          return (
            <div key={k}>
              <SectionHeader label={d.label} count={grouped[k].length} accent={d.color} glyph={k} />
              <div style={{ background: Q.paper, marginLeft: 0, marginRight: 0 }}>
                {grouped[k].map((t, i) => (
                  <TaskRow key={i} {...t} noRule={i === grouped[k].length - 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <FAB />
      <TabBar active="today" />
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PROJECTS INDEX
// ─────────────────────────────────────────────────────────────
function ScreenProjects() {
  return (
    <ScreenFrame>
      <AppTopBar left="6 active · 1 paused" right={<QIcon name="search" size={14} sw={1.4} />} />
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 80, overflow: 'hidden' }}>
        <ViewHeader title="Projects" kicker="By domain · active" count={SAMPLE.projects.length} />
        {/* domain filter row */}
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'hidden' }}>
          <FilterChip active>All</FilterChip>
          {DOMAIN_ORDER.map((k) => (
            <DomainChip key={k} domain={k} />
          ))}
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SAMPLE.projects.map((p, i) => (
            <ProjectCard key={i} {...p} />
          ))}
        </div>
      </div>
      <FAB />
      <TabBar active="projects" />
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PROJECT DETAIL — indented dependency tree
// ─────────────────────────────────────────────────────────────
function ScreenProjectDetail() {
  const p = SAMPLE.meridian;
  const d = DOMAINS[p.domain];
  const counts = p.tasks.reduce((acc, t) => {
    acc[t.state] = (acc[t.state] || 0) + 1; return acc;
  }, {});
  return (
    <ScreenFrame>
      <AppTopBar
        left={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <QIcon name="chevron-l" size={12} sw={1.6} />
          <span>Projects</span>
        </span>}
        right={<QIcon name="kebab" size={14} sw={1.4} />}
      />
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 80, overflow: 'hidden' }}>
        {/* head */}
        <div style={{ padding: '8px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <DomainChip domain={p.domain} />
            <span style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>Due May 22 · 13 tasks</span>
          </div>
          <h1 style={{
            fontFamily: Q.serif, fontSize: 26, lineHeight: '30px',
            color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.3,
          }}>{p.title}</h1>
          <div style={{
            marginTop: 4, fontFamily: Q.serif, fontStyle: 'italic',
            fontSize: 14, color: Q.ink2, lineHeight: '19px',
          }}>
            Onboard a new advisory client through scope, proposal, and kickoff.
          </div>
          {/* progress */}
          <div style={{ marginTop: 14, display: 'flex', gap: 3, alignItems: 'center' }}>
            {Array.from({ length: 13 }).map((_, i) => (
              <span key={i} style={{
                flex: 1, height: 8,
                background: i < (counts.done || 0) ? Q.ink :
                            i < (counts.done || 0) + (counts.ready || 0) ? Q.rubric :
                            i < (counts.done || 0) + (counts.ready || 0) + (counts.blocked || 0) ? `repeating-linear-gradient(45deg, ${Q.ruleSoft} 0 2px, transparent 2px 4px)` :
                            Q.ruleSoft,
                borderRadius: 1,
              }} />
            ))}
          </div>
          <div style={{
            marginTop: 8, display: 'flex', gap: 14,
            fontFamily: Q.mono, fontSize: 11, color: Q.ink2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span><b style={{ color: Q.ink, fontWeight: 600 }}>{counts.done}</b><span style={{ color: Q.ink3 }}> done</span></span>
            <span><b style={{ color: Q.rubric, fontWeight: 600 }}>{counts.ready}</b><span style={{ color: Q.ink3 }}> ready</span></span>
            <span><b style={{ color: Q.ink, fontWeight: 600 }}>{counts.open}</b><span style={{ color: Q.ink3 }}> open</span></span>
            <span><b style={{ color: Q.ink2, fontWeight: 600 }}>{counts.blocked}</b><span style={{ color: Q.ink3 }}> blocked</span></span>
          </div>
        </div>
        {/* tree */}
        <SectionHeader label="Manuscript" count={p.tasks.length} />
        <div style={{ background: Q.paper }}>
          {p.tasks.map((t, i) => (
            <TaskRow key={t.id} {...t} domain={p.domain} project={null}
              noRule={i === p.tasks.length - 1} />
          ))}
        </div>
      </div>
      <FAB />
      <TabBar active="projects" />
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. BY DOMAIN — Body
// ─────────────────────────────────────────────────────────────
function ScreenDomain() {
  const d = DOMAINS.body;
  return (
    <ScreenFrame>
      <AppTopBar
        left={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <QIcon name="chevron-l" size={12} sw={1.6} />
          <span>Domains</span>
        </span>}
        right={<QIcon name="kebab" size={14} sw={1.4} />}
      />
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 80, overflow: 'hidden' }}>
        {/* domain header — tinted band */}
        <div style={{
          background: d.tint, padding: '12px 16px 16px',
          borderBottom: `0.5px solid ${d.edge}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DomainBadge domain="body" size={28} />
            <span style={{
              fontFamily: Q.mono, fontSize: 10, color: d.color,
              letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.85,
            }}>Domain · {d.note}</span>
          </div>
          <h1 style={{
            fontFamily: Q.serif, fontSize: 36, lineHeight: '40px',
            color: d.color, fontWeight: 500, margin: '8px 0 4px',
            letterSpacing: -0.4,
          }}>Body</h1>
          <div style={{
            display: 'flex', gap: 14,
            fontFamily: Q.mono, fontSize: 11, color: d.color, opacity: 0.85,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span><b style={{ fontWeight: 600 }}>7</b> open</span>
            <span><b style={{ fontWeight: 600 }}>3</b> ready</span>
            <span><b style={{ fontWeight: 600 }}>1</b> today</span>
            <span style={{ flex: 1 }} />
            <span style={{ opacity: 0.6 }}>3 projects</span>
          </div>
        </div>
        {/* filter row */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
          <FilterChip active>Open</FilterChip>
          <FilterChip>Ready</FilterChip>
          <FilterChip>Today</FilterChip>
          <FilterChip>All</FilterChip>
        </div>
        {/* grouped by project */}
        {SAMPLE.body.map((g, gi) => (
          <div key={gi}>
            <SectionHeader label={g.project} count={g.tasks.length} />
            <div style={{ background: Q.paper }}>
              {g.tasks.map((t, i) => (
                <TaskRow key={i} {...t} domain="body" project={null}
                  noRule={i === g.tasks.length - 1} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <FAB />
      <TabBar active="menu" />
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. QUICK CAPTURE — modal sheet over Today
// ─────────────────────────────────────────────────────────────
function ScreenCapture() {
  return (
    <ScreenFrame>
      {/* dimmed background of Today */}
      <div style={{ filter: 'blur(0.4px)', opacity: 0.55 }}>
        <AppTopBar left="Fri · May 8" right="Quill" />
        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 80 }}>
          <ViewHeader title="Today" dropCap="T" kicker="Friday · the eighth" />
          <div style={{ background: Q.paper, marginTop: 8 }}>
            {SAMPLE.today.slice(0, 3).map((t, i) => (
              <TaskRow key={i} {...t} />
            ))}
          </div>
        </div>
        <TabBar active="today" />
      </div>
      <Backdrop />
      <QuickAddSheet
        value="Confirm Meridian rate card"
        selectedDomain="work"
        project="Meridian onboarding"
        due="Today"
      />
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. TASK DETAIL / EDIT
// ─────────────────────────────────────────────────────────────
function ScreenTaskDetail() {
  return (
    <ScreenFrame>
      <AppTopBar
        left={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <QIcon name="chevron-l" size={12} sw={1.6} />
          <span>Meridian onboarding</span>
        </span>}
        right={<span style={{
          fontFamily: Q.mono, fontSize: 11, color: Q.rubric,
          letterSpacing: 0.6, textTransform: 'uppercase',
        }}>Save</span>}
      />
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ padding: '4px 16px 0' }}>
          <div style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
          }}>Task · ready</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ paddingTop: 4 }}>
              <TaskCheck state="ready" size={26} />
            </div>
            <h1 style={{
              fontFamily: Q.serif, fontSize: 24, lineHeight: '30px',
              color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.2, flex: 1,
            }}>Reply to Meridian onboarding brief</h1>
          </div>
          {/* notes */}
          <div style={{
            marginTop: 14,
            paddingLeft: 14,
            borderLeft: `2px solid ${Q.rubricSoft}`,
            fontFamily: Q.serif, fontStyle: 'italic',
            fontSize: 14, lineHeight: '22px', color: Q.ink2,
          }}>
            They asked for points of agreement on scope and rate. Reference Polaris case
            study + last quarter's revised SOW. Keep it tight — under 300 words.
          </div>
        </div>
        {/* properties */}
        <div style={{ marginTop: 18, background: Q.paper, borderTop: `0.5px solid ${Q.rule}` }}>
          {[
            { icon:'cal',    label:'Due',       value:'Today', accent: Q.rubric },
            { icon:'recur',  label:'Repeat',    value:'None' },
            { icon:'tag',    label:'Domain',    value:<DomainChip domain="work" /> },
            { icon:'list',   label:'Project',   value:'Meridian onboarding · 13' },
            { icon:'flag',   label:'Priority',  value:<PriorityMark level={2} /> },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${Q.ruleSoft}`,
              minHeight: 44,
            }}>
              <QIcon name={row.icon} size={14} sw={1.4} style={{ color: Q.ink3 }} />
              <span style={{
                fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
                letterSpacing: 0.6, textTransform: 'uppercase', width: 64,
              }}>{row.label}</span>
              <span style={{ flex: 1, fontFamily: Q.sans, fontSize: 14, color: row.accent || Q.ink, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {row.value}
              </span>
              <QIcon name="chevron-r" size={12} sw={1.4} style={{ color: Q.ink3 }} />
            </div>
          ))}
        </div>
        {/* dependencies */}
        <SectionHeader label="Dependencies" />
        <div style={{ background: Q.paper, paddingBottom: 12 }}>
          <div style={{ padding: '10px 16px 6px' }}>
            <div style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
            }}>Waiting on · 0</div>
            <div style={{
              padding: '8px 10px', border: `1px dashed ${Q.rule}`,
              borderRadius: 3, fontFamily: Q.sans, fontSize: 13, color: Q.ink3,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <QIcon name="plus" size={12} sw={1.4} />
              <span>Add a blocker — pick from this project</span>
            </div>
          </div>
          <div style={{ padding: '10px 16px 4px' }}>
            <div style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
            }}>Unblocks · 2</div>
            {[
              { title:'Send proposal v1', state:'blocked' },
              { title:'Schedule kickoff workshop', state:'blocked' },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 3,
                background: Q.linenDeep, marginBottom: 6,
              }}>
                <QIcon name="arrow-r" size={12} sw={1.4} style={{ color: Q.ink2 }} />
                <span style={{ fontFamily: Q.sans, fontSize: 13, color: Q.ink, flex: 1 }}>{t.title}</span>
                <span style={{
                  fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                }}>{t.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. EMPTY STATE — Today, no tasks
// ─────────────────────────────────────────────────────────────
function ScreenEmpty() {
  return (
    <ScreenFrame>
      <AppTopBar left="Sun · May 10" right="Quill" />
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 80, overflow: 'hidden' }}>
        <ViewHeader
          title="Today"
          dropCap="T"
          kicker="Sunday · the tenth"
        />
        {/* large blank manuscript page */}
        <div style={{
          margin: '12px 16px 0',
          background: Q.paper,
          boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
          padding: '32px 24px 36px',
          minHeight: 360,
          position: 'relative',
        }}>
          {/* faint ledger lines */}
          <div style={{
            position: 'absolute', inset: '24px 24px 24px 24px',
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 23px, ${Q.ruleSoft} 23px 24px)`,
            opacity: 0.6,
          }} />
          {/* margin rule */}
          <div style={{
            position: 'absolute', left: 56, top: 24, bottom: 24,
            width: 1, background: Q.rubricSoft, opacity: 0.5,
          }} />
          <div style={{ position: 'relative', textAlign: 'center', paddingTop: 56 }}>
            <span style={{
              width: 56, height: 56, borderRadius: 28,
              background: Q.linen, color: Q.rubric,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${Q.rule}`,
            }}>
              <DomainGlyph domain="spirit" size={26} strokeWidth={1.2} />
            </span>
            <div style={{
              marginTop: 18, fontFamily: Q.serif,
              fontSize: 22, lineHeight: '28px', color: Q.ink,
              fontWeight: 500, letterSpacing: -0.2,
            }}>A blank page.</div>
            <div style={{
              marginTop: 6, fontFamily: Q.serif, fontStyle: 'italic',
              fontSize: 15, color: Q.ink2, lineHeight: '22px',
              maxWidth: 240, margin: '6px auto 0',
            }}>
              No tasks today. Either you've finished the chapter, or it hasn't started.
            </div>
            <div style={{
              marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 18,
              background: Q.ink, color: Q.linen,
              fontFamily: Q.sans, fontSize: 13, fontWeight: 600,
            }}>
              <QIcon name="plus" size={13} sw={1.6} />
              <span>Begin a line</span>
            </div>
            <div style={{
              marginTop: 14, fontFamily: Q.mono, fontSize: 10,
              color: Q.ink3, letterSpacing: 0.8, textTransform: 'uppercase',
            }}>or browse · projects · someday</div>
          </div>
        </div>
      </div>
      <TabBar active="today" />
    </ScreenFrame>
  );
}

Object.assign(window, {
  ScreenToday, ScreenProjects, ScreenProjectDetail, ScreenDomain,
  ScreenCapture, ScreenTaskDetail, ScreenEmpty,
  SCREEN_W, SCREEN_H,
});
