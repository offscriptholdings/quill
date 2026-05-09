// Quill — atomic UI components.
// Depends on quill-system.jsx (Q, DOMAINS, DomainGlyph, DomainBadge, DomainChip, QIcon).

// ─────────────────────────────────────────────────────────────
// Checkbox — circular, ink-stroke. State: open / ready / done / blocked.
// ─────────────────────────────────────────────────────────────
function TaskCheck({ state = 'open', size = 22 }) {
  // open: hollow circle, ink stroke
  // ready: hollow circle with thin rubric ring outside
  // done: filled ink with check
  // blocked: hollow circle with hatched fill, ink3
  if (state === 'done') {
    return (
      <span style={{
        width: size, height: size, borderRadius: size / 2,
        background: Q.ink, color: Q.linen,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flex: '0 0 auto',
      }}>
        <QIcon name="check" size={Math.round(size * 0.62)} sw={1.8} />
      </span>
    );
  }
  if (state === 'blocked') {
    return (
      <span style={{
        width: size, height: size, borderRadius: size / 2,
        background: `repeating-linear-gradient(45deg, ${Q.ruleSoft} 0 2px, transparent 2px 5px)`,
        boxShadow: `inset 0 0 0 1px ${Q.ink3}`,
        display: 'inline-block', flex: '0 0 auto',
      }} />
    );
  }
  if (state === 'ready') {
    return (
      <span style={{
        width: size, height: size, borderRadius: size / 2,
        position: 'relative',
        boxShadow: `inset 0 0 0 1.25px ${Q.ink}`,
        display: 'inline-block', flex: '0 0 auto',
      }}>
        <span style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: `1px solid ${Q.rubric}`, opacity: 0.55,
        }} />
      </span>
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2,
      boxShadow: `inset 0 0 0 1.25px ${Q.ink2}`,
      display: 'inline-block', flex: '0 0 auto',
    }} />
  );
}

// ─────────────────────────────────────────────────────────────
// PriorityMark — manuscript-style tick marks (1–3) in margin
// ─────────────────────────────────────────────────────────────
function PriorityMark({ level = 0 }) {
  if (!level) return null;
  return (
    <span style={{
      display: 'inline-flex', gap: 2, height: 12, alignItems: 'flex-end',
      color: level === 3 ? Q.rubric : Q.ink2,
    }}>
      {[1,2,3].slice(0, level).map((_, i) => (
        <span key={i} style={{
          width: 1.5, height: 8 + i * 2, background: 'currentColor',
        }} />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// TaskRow — comfortable 56px, two-line: title + meta
// ─────────────────────────────────────────────────────────────
function TaskRow({
  title, domain, project, due, state = 'open', priority = 0,
  blockedBy, unblocks, today, indent = 0, hasChildren = false, expanded = true,
  noRule = false, style = {},
}) {
  const d = DOMAINS[domain];
  const dim = state === 'done';
  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 16px 10px ' + (16 + indent * 18) + 'px',
      minHeight: 56, boxSizing: 'border-box',
      borderBottom: noRule ? 'none' : `0.5px solid ${Q.ruleSoft}`,
      background: 'transparent',
      ...style,
    }}>
      {/* today rubric in left margin */}
      {today && (
        <span style={{
          position: 'absolute', left: 4, top: 14, bottom: 14,
          width: 2, background: Q.rubric, borderRadius: 1,
        }} />
      )}
      {/* indent connector */}
      {indent > 0 && (
        <span style={{
          position: 'absolute',
          left: 16 + (indent - 1) * 18 + 11, top: 0, bottom: 'calc(100% - 22px)',
          width: 1, background: Q.rule,
        }} />
      )}
      {indent > 0 && (
        <span style={{
          position: 'absolute',
          left: 16 + (indent - 1) * 18 + 11, top: 22,
          width: 10, height: 1, background: Q.rule,
        }} />
      )}
      <div style={{ paddingTop: 4, position: 'relative' }}>
        <TaskCheck state={state} size={20} />
        {hasChildren && (
          <span style={{
            position: 'absolute', left: -2, top: -2,
            width: 24, height: 24, borderRadius: 12,
            border: `1px dashed ${Q.ink3}`, opacity: 0.5,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: Q.sans, fontSize: 15, lineHeight: '20px',
          color: dim ? Q.ink3 : Q.ink, fontWeight: 450,
          textDecoration: dim ? 'line-through' : 'none',
          textDecorationColor: Q.ink3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title}</div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: Q.mono, fontSize: 11, color: Q.ink2, lineHeight: '14px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {d && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: d.color }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: d.color }} />
              <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</span>
            </span>
          )}
          {project && <span style={{ color: Q.ink3 }}>·</span>}
          {project && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project}</span>}
          {due && <span style={{ color: Q.ink3 }}>·</span>}
          {due && <span style={{ color: due === 'overdue' ? Q.rubric : Q.ink2 }}>{due === 'overdue' ? 'Overdue' : due}</span>}
          {blockedBy && <span style={{ color: Q.ink3 }}>·</span>}
          {blockedBy && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: Q.ink3 }}>
              <QIcon name="lock" size={10} sw={1.4} />
              <span>waiting on {blockedBy}</span>
            </span>
          )}
          {unblocks && <span style={{ color: Q.ink3 }}>·</span>}
          {unblocks && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: Q.ink2 }}>
              <QIcon name="arrow-r" size={10} sw={1.4} />
              <span>unblocks {unblocks}</span>
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
        <PriorityMark level={priority} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionHeader — small all-caps mono with rule
// ─────────────────────────────────────────────────────────────
function SectionHeader({ label, count, accent, glyph, sticky = false, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 16px 6px',
      fontFamily: Q.mono, fontSize: 11, color: Q.ink2,
      letterSpacing: 0.8, textTransform: 'uppercase',
      background: sticky ? Q.linen : 'transparent',
      position: sticky ? 'sticky' : 'static', top: 0, zIndex: 2,
      ...style,
    }}>
      {glyph && (
        <span style={{ color: accent || Q.ink2, display: 'inline-flex' }}>
          <DomainGlyph domain={glyph} size={12} strokeWidth={1.5} />
        </span>
      )}
      <span style={{ color: accent || Q.ink2 }}>{label}</span>
      {count !== undefined && (
        <span style={{ color: Q.ink3, fontWeight: 400 }}>{count}</span>
      )}
      <span style={{ flex: 1, height: 1, background: Q.rule, marginLeft: 4, opacity: 0.7 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ViewHeader — large editorial title for screens
// ─────────────────────────────────────────────────────────────
function ViewHeader({ title, kicker, count, action, dropCap, style = {} }) {
  return (
    <div style={{ padding: '4px 16px 12px', ...style }}>
      {kicker && (
        <div style={{
          fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
        }}>{kicker}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        {dropCap && (
          <span style={{
            fontFamily: Q.serif, fontSize: 56, lineHeight: '0.85',
            color: Q.rubric, fontWeight: 500, marginRight: -2,
          }}>{dropCap}</span>
        )}
        <h1 style={{
          fontFamily: Q.serif, fontSize: 32, lineHeight: '36px',
          color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.4,
          fontFeatureSettings: '"ss01"',
        }}>{title}</h1>
        {count !== undefined && (
          <span style={{
            fontFamily: Q.mono, fontSize: 12, color: Q.ink3,
            fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
        )}
        <span style={{ flex: 1 }} />
        {action}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterChip — small pill, optional active state
// ─────────────────────────────────────────────────────────────
function FilterChip({ children, active = false, onClick, style = {} }) {
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 26, padding: '0 10px',
      borderRadius: 13,
      background: active ? Q.ink : 'transparent',
      color: active ? Q.linen : Q.ink2,
      boxShadow: active ? 'none' : `inset 0 0 0 0.5px ${Q.rule}`,
      fontFamily: Q.sans, fontSize: 12, fontWeight: 500,
      letterSpacing: 0.1, lineHeight: 1,
      cursor: 'pointer', ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// ProjectCard — paper rect with title + meta + ledger progress
// ─────────────────────────────────────────────────────────────
function ProjectCard({ title, domain, open, ready, blocked, done, total, due, paused = false, style = {} }) {
  const d = DOMAINS[domain];
  const segs = total || 8;
  const filled = Math.round((done / total) * segs) || 0;
  return (
    <div style={{
      background: Q.paper, borderRadius: 4,
      boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
      padding: '14px 14px 12px', position: 'relative',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <DomainBadge domain={domain} size={22} withRing />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: Q.serif, fontSize: 17, lineHeight: '22px',
            color: Q.ink, fontWeight: 500, letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</div>
          <div style={{
            marginTop: 2,
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {d && d.label}{due ? ` · ${due}` : ''}{paused ? ' · paused' : ''}
          </div>
        </div>
      </div>
      {/* ledger progress */}
      <div style={{ marginTop: 14, display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: segs }).map((_, i) => (
          <span key={i} style={{
            flex: 1, height: 6,
            background: i < filled ? Q.ink : Q.ruleSoft,
            borderRadius: 1,
          }} />
        ))}
      </div>
      <div style={{
        marginTop: 10, display: 'flex', gap: 14,
        fontFamily: Q.mono, fontSize: 11, color: Q.ink2,
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span><b style={{ fontWeight: 600, color: Q.ink }}>{open}</b><span style={{ color: Q.ink3 }}> open</span></span>
        <span><b style={{ fontWeight: 600, color: ready ? Q.rubric : Q.ink3 }}>{ready}</b><span style={{ color: Q.ink3 }}> ready</span></span>
        <span><b style={{ fontWeight: 600, color: Q.ink2 }}>{blocked}</b><span style={{ color: Q.ink3 }}> blocked</span></span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAB — ink circle with + glyph
// ─────────────────────────────────────────────────────────────
function FAB({ style = {} }) {
  return (
    <div style={{
      position: 'absolute', right: 18, bottom: 18 + 64 + 12, // above tab bar
      width: 52, height: 52, borderRadius: 26,
      background: Q.ink, color: Q.linen,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(31,29,24,0.25), 0 1px 2px rgba(31,29,24,0.18)',
      zIndex: 30, ...style,
    }}>
      <QIcon name="plus" size={22} sw={1.6} style={{ color: Q.linen }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TabBar — 4 tabs: Today / Projects / Someday / Menu
// Uses iconography + small label. Active = ink, inactive = ink3.
// ─────────────────────────────────────────────────────────────
function TabBar({ active = 'today' }) {
  const tabs = [
    { id: 'today',    label: 'Today',    icon: 'today' },
    { id: 'projects', label: 'Projects', icon: 'list' },
    { id: 'someday',  label: 'Someday',  icon: 'horizon' },
    { id: 'menu',     label: 'Menu',     icon: 'menu' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 24, // home indicator clearance
      background: Q.linen,
      borderTop: `0.5px solid ${Q.rule}`,
      zIndex: 20,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        height: 56,
      }}>
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <div key={t.id} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              color: on ? Q.ink : Q.ink3,
              position: 'relative',
            }}>
              {on && (
                <span style={{
                  position: 'absolute', top: 6, width: 16, height: 1.5,
                  background: Q.rubric, borderRadius: 1,
                }} />
              )}
              <QIcon name={t.icon} size={20} sw={on ? 1.6 : 1.4} />
              <span style={{
                fontFamily: Q.sans, fontSize: 10.5,
                fontWeight: on ? 600 : 500,
                letterSpacing: 0.2,
              }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AppHeader — small top status (date / view title) for screens
// We let IOSDevice render the real status bar; this sits below it.
// ─────────────────────────────────────────────────────────────
function AppTopBar({ left, right, style = {} }) {
  return (
    <div style={{
      paddingTop: 56, // status bar clearance
      paddingBottom: 6,
      paddingLeft: 16, paddingRight: 16,
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
      letterSpacing: 0.5, textTransform: 'uppercase',
      ...style,
    }}>
      <span>{left}</span>
      <span style={{ flex: 1 }} />
      <span>{right}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyState — small marginal-feeling block
// ─────────────────────────────────────────────────────────────
function EmptyState({ glyph = 'spirit', title, body, action, style = {} }) {
  return (
    <div style={{
      padding: '40px 32px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      ...style,
    }}>
      <span style={{
        width: 48, height: 48, borderRadius: 24,
        background: Q.paper, color: Q.ink2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
      }}>
        <DomainGlyph domain={glyph} size={22} strokeWidth={1.2} />
      </span>
      <div style={{
        fontFamily: Q.serif, fontSize: 18, color: Q.ink,
        fontWeight: 500, lineHeight: '22px',
      }}>{title}</div>
      {body && (
        <div style={{
          fontFamily: Q.sans, fontSize: 13, color: Q.ink2,
          lineHeight: '18px', maxWidth: 240,
        }}>{body}</div>
      )}
      {action && (
        <div style={{
          marginTop: 4, fontFamily: Q.mono, fontSize: 11,
          color: Q.rubric, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>{action}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QuickAddSheet — bottom modal w/ input + domain row + due chips
// ─────────────────────────────────────────────────────────────
function QuickAddSheet({ value = '', selectedDomain, project, due }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: Q.paper,
      borderTopLeftRadius: 18, borderTopRightRadius: 18,
      boxShadow: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
      zIndex: 40, paddingBottom: 24,
    }}>
      <div style={{
        height: 4, width: 36, background: Q.ink4,
        borderRadius: 2, margin: '8px auto 0', opacity: 0.6,
      }} />
      <div style={{ padding: '14px 18px 10px' }}>
        <div style={{
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
        }}>Capture</div>
        <div style={{
          fontFamily: Q.serif, fontSize: 22, color: value ? Q.ink : Q.ink3,
          lineHeight: '28px', fontWeight: 450, letterSpacing: -0.1,
          minHeight: 28,
        }}>
          {value || 'A line in the story…'}
          <span style={{
            display: 'inline-block', width: 1.5, height: 22,
            background: Q.rubric, marginLeft: 1, verticalAlign: -3,
            animation: 'blink 1.1s steps(2) infinite',
          }} />
        </div>
      </div>
      <div style={{
        padding: '10px 18px',
        borderTop: `0.5px solid ${Q.ruleSoft}`,
      }}>
        <div style={{
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
        }}>Domain</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DOMAIN_ORDER.map((k) => (
            <DomainChip key={k} domain={k} active={selectedDomain === k} />
          ))}
        </div>
      </div>
      <div style={{
        padding: '10px 18px',
        borderTop: `0.5px solid ${Q.ruleSoft}`,
      }}>
        <div style={{
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
        }}>When</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Today', 'Tomorrow', 'This week', 'Someday'].map((label) => (
            <FilterChip key={label} active={due === label}>{label}</FilterChip>
          ))}
          <FilterChip>
            <QIcon name="cal" size={11} sw={1.5} />
            <span>Pick…</span>
          </FilterChip>
        </div>
      </div>
      {project && (
        <div style={{
          padding: '10px 18px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <QIcon name="tag" size={14} sw={1.4} style={{ color: Q.ink3 }} />
          <span style={{ fontFamily: Q.sans, fontSize: 13, color: Q.ink }}>{project}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink3 }}>change</span>
        </div>
      )}
      <div style={{
        padding: '12px 18px 4px',
        borderTop: `0.5px solid ${Q.ruleSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <FilterChip><QIcon name="flag" size={11} sw={1.4} />Priority</FilterChip>
        <FilterChip><QIcon name="recur" size={11} sw={1.4} />Repeat</FilterChip>
        <span style={{ flex: 1 }} />
        <span style={{
          height: 32, padding: '0 14px', borderRadius: 16,
          background: Q.ink, color: Q.linen,
          display: 'inline-flex', alignItems: 'center',
          fontFamily: Q.sans, fontSize: 13, fontWeight: 600,
        }}>Inscribe</span>
      </div>
    </div>
  );
}

// Backdrop overlay for modals
function Backdrop({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(31,29,24,0.32)',
      backdropFilter: 'blur(2px)',
      zIndex: 35,
    }}>{children}</div>
  );
}

Object.assign(window, {
  TaskCheck, PriorityMark, TaskRow, SectionHeader, ViewHeader, FilterChip,
  ProjectCard, FAB, TabBar, AppTopBar, EmptyState, QuickAddSheet, Backdrop,
});
