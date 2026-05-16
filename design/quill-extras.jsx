// Quill — capture variants + desktop layouts.
// Depends on quill-system.jsx, quill-components.jsx, quill-screens.jsx.

// ─────────────────────────────────────────────────────────────
// CAPTURE · variants
// All inherit ScreenFrame size (390×844). Modal sheet layered over a
// dimmed Today background. Three states explore the smart-capture flow.
// ─────────────────────────────────────────────────────────────

function DimToday({ rows = 3 }) {
  return (
    <div style={{ filter: 'blur(0.4px)', opacity: 0.5 }}>
      <AppTopBar left="Fri · May 8" right="Quill" />
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 80 }}>
        <ViewHeader title="Today" dropCap="T" kicker="Friday · the eighth" />
        <div style={{ background: Q.paper, marginTop: 8 }}>
          {SAMPLE.today.slice(0, rows).map((t, i) => (
            <TaskRow key={i} {...t} />
          ))}
        </div>
      </div>
      <TabBar active="today" />
    </div>
  );
}

// Reusable sheet shell — header bar with cancel/inscribe, then slot
function CaptureSheet({ title = 'Capture', children, primaryLabel = 'Inscribe', primaryDisabled = false, height = 'auto' }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: Q.paper,
      borderTopLeftRadius: 18, borderTopRightRadius: 18,
      boxShadow: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
      zIndex: 40, paddingBottom: 24, height,
    }}>
      <div style={{
        height: 4, width: 36, background: Q.ink4,
        borderRadius: 2, margin: '8px auto 0', opacity: 0.6,
      }} />
      <div style={{
        display: 'flex', alignItems: 'center', padding: '10px 16px 6px',
      }}>
        <span style={{
          fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontFamily: Q.sans, fontSize: 13, color: Q.ink2, marginRight: 14,
        }}>Cancel</span>
        <span style={{
          height: 30, padding: '0 12px', borderRadius: 15,
          background: primaryDisabled ? Q.ink4 : Q.ink,
          color: Q.linen, opacity: primaryDisabled ? 0.6 : 1,
          display: 'inline-flex', alignItems: 'center',
          fontFamily: Q.sans, fontSize: 12, fontWeight: 600,
          letterSpacing: 0.1,
        }}>{primaryLabel}</span>
      </div>
      {children}
    </div>
  );
}

// 1 · Empty — just tapped the FAB. Big input. Quick suggestions.
function ScreenCaptureEmpty() {
  return (
    <ScreenFrame>
      <DimToday rows={4} />
      <Backdrop />
      <CaptureSheet title="A line in the story" primaryDisabled>
        <div style={{ padding: '14px 18px 18px' }}>
          <div style={{
            fontFamily: Q.serif, fontSize: 22, color: Q.ink3,
            lineHeight: '28px', fontWeight: 450, letterSpacing: -0.1,
            minHeight: 52,
          }}>
            <span style={{ fontStyle: 'italic' }}>What's next?</span>
            <span style={{
              display: 'inline-block', width: 1.5, height: 22,
              background: Q.rubric, marginLeft: 1, verticalAlign: -3,
              animation: 'blink 1.1s steps(2) infinite',
            }} />
          </div>
        </div>
        <div style={{
          padding: '8px 18px 4px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
        }}>
          <div style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
          }}>Recent · tap to repeat</div>
          {[
            { domain:'body',   text:'Stretch · evening',           project:'Recovery & sleep' },
            { domain:'work',   text:'Reply to Polaris',            project:'Polaris retainer' },
            { domain:'family', text:'Call Mom · Sunday',           project:'Family weekly' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${Q.ruleSoft}` : 'none',
            }}>
              <DomainBadge domain={s.domain} size={20} />
              <span style={{ fontFamily: Q.sans, fontSize: 14, color: Q.ink, flex: 1 }}>{s.text}</span>
              <span style={{
                fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
                letterSpacing: 0.5, textTransform: 'uppercase',
              }}>{s.project}</span>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 18px 0',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <FilterChip><QIcon name="cal" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Today</span></FilterChip>
          <FilterChip><QIcon name="recur" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Repeat</span></FilterChip>
          <FilterChip><QIcon name="flag" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Priority</span></FilterChip>
          <FilterChip><QIcon name="tag" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Project</span></FilterChip>
          <FilterChip><QIcon name="archive" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Someday</span></FilterChip>
        </div>
      </CaptureSheet>
    </ScreenFrame>
  );
}

// 2 · Smart parse — Quill detects "@" project, "tomorrow", "!!" priority, etc.
// Tokens are highlighted inline as the user types, then rendered as chips.
function ScreenCaptureParse() {
  return (
    <ScreenFrame>
      <DimToday rows={3} />
      <Backdrop />
      <CaptureSheet title="Capture · parsing">
        <div style={{ padding: '14px 18px 12px' }}>
          <div style={{
            fontFamily: Q.serif, fontSize: 21, color: Q.ink,
            lineHeight: '28px', fontWeight: 450, letterSpacing: -0.1,
          }}>
            Confirm rate card{' '}
            <span style={{
              background: DOMAINS.work.tint, color: DOMAINS.work.color,
              padding: '0 6px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${DOMAINS.work.edge}`,
              fontFamily: Q.sans, fontSize: 14, fontWeight: 500,
              letterSpacing: 0, position: 'relative', top: -2,
            }}>@ Meridian</span>{' '}
            <span style={{
              background: 'rgba(142,58,26,0.08)', color: Q.rubric,
              padding: '0 6px', borderRadius: 3,
              fontFamily: Q.sans, fontSize: 14, fontWeight: 500,
              letterSpacing: 0, position: 'relative', top: -2,
            }}>tomorrow 9am</span>{' '}
            <span style={{
              background: 'rgba(142,58,26,0.08)', color: Q.rubric,
              padding: '0 6px', borderRadius: 3,
              fontFamily: Q.mono, fontSize: 14, fontWeight: 600,
              letterSpacing: 0, position: 'relative', top: -2,
            }}>!!</span>
            <span style={{
              display: 'inline-block', width: 1.5, height: 22,
              background: Q.rubric, marginLeft: 2, verticalAlign: -3,
              animation: 'blink 1.1s steps(2) infinite',
            }} />
          </div>
          <div style={{
            marginTop: 10, fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.6, textTransform: 'uppercase',
          }}>
            Quill picked up · project · due · priority
          </div>
        </div>
        {/* parsed chip strip */}
        <div style={{
          padding: '12px 18px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          background: Q.paper2,
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          <DomainChip domain="work" active />
          <FilterChip>
            <QIcon name="tag" size={11} sw={1.4} />
            <span style={{ marginLeft: 4 }}>Meridian onboarding</span>
          </FilterChip>
          <FilterChip active>
            <QIcon name="cal" size={11} sw={1.4} />
            <span style={{ marginLeft: 4 }}>Sat May 9 · 9:00</span>
          </FilterChip>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 26, padding: '0 10px', borderRadius: 13,
            background: Q.rubric, color: Q.linen,
            fontFamily: Q.sans, fontSize: 12, fontWeight: 600,
          }}>
            <PriorityMark level={2} />
            <span>High</span>
          </span>
        </div>
        {/* dependency hint */}
        <div style={{
          padding: '10px 18px 12px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <QIcon name="lock" size={14} sw={1.4} style={{ color: Q.ink3, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
            }}>Suggested · waits on</div>
            <div style={{
              padding: '6px 8px', background: Q.linenDeep, borderRadius: 3,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <TaskCheck state="ready" size={16} />
              <span style={{ fontFamily: Q.sans, fontSize: 13, color: Q.ink, flex: 1 }}>
                Reply to Meridian onboarding brief
              </span>
              <span style={{
                fontFamily: Q.mono, fontSize: 10, color: Q.rubric,
                letterSpacing: 0.6, textTransform: 'uppercase',
              }}>+ link</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: '10px 18px 0',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>
          Tip · type @ for project · # for domain · ! for priority
        </div>
      </CaptureSheet>
    </ScreenFrame>
  );
}

// 3 · From Crucible — inbound capture from sister product, needs triage
function ScreenCaptureFromCrucible() {
  return (
    <ScreenFrame>
      <DimToday rows={3} />
      <Backdrop />
      <CaptureSheet title="From Crucible · triage" primaryLabel="File">
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(180deg, rgba(184,137,58,0.08), transparent 80%)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 11,
              background: Q.gold, color: Q.linen,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: Q.serif, fontSize: 13, fontWeight: 600,
            }}>C</span>
            <span style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.gold,
              letterSpacing: 0.8, textTransform: 'uppercase',
            }}>Crucible · capture · 7:42 AM</span>
            <span style={{ flex: 1 }} />
            <span style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>3 of 5</span>
          </div>
          <div style={{
            fontFamily: Q.serif, fontSize: 19, color: Q.ink,
            lineHeight: '26px', fontWeight: 500, letterSpacing: -0.1,
          }}>Pull the Q1 broker statement before reviewing Roth allocation</div>
          <div style={{
            marginTop: 6, fontFamily: Q.serif, fontStyle: 'italic',
            fontSize: 13, color: Q.ink2, lineHeight: '18px',
          }}>
            Captured from morning pages · "remember the broker" — Quill needs a domain &amp; project to file this.
          </div>
        </div>
        <div style={{
          padding: '12px 18px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
        }}>
          <div style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
          }}>Domain · pick one</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DOMAIN_ORDER.map((k) => (
              <DomainChip key={k} domain={k} active={k === 'wealth'} />
            ))}
          </div>
        </div>
        <div style={{
          padding: '10px 18px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <QIcon name="tag" size={14} sw={1.4} style={{ color: Q.ink3 }} />
          <span style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.6, textTransform: 'uppercase', width: 64,
          }}>Project</span>
          <span style={{ fontFamily: Q.sans, fontSize: 14, color: Q.ink, flex: 1 }}>Q2 finances + taxes</span>
          <span style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink3 }}>change</span>
        </div>
        <div style={{
          padding: '10px 18px',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <QIcon name="arrow-r" size={14} sw={1.4} style={{ color: Q.ink3 }} />
          <span style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.6, textTransform: 'uppercase', width: 64,
          }}>Unblocks</span>
          <span style={{ fontFamily: Q.sans, fontSize: 14, color: Q.ink, flex: 1 }}>Review Roth allocation</span>
          <span style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.rubric,
            letterSpacing: 0.6, textTransform: 'uppercase',
          }}>linked</span>
        </div>
        <div style={{
          padding: '10px 18px 0',
          borderTop: `0.5px solid ${Q.ruleSoft}`,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <FilterChip active><QIcon name="cal" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Today</span></FilterChip>
          <FilterChip>Tomorrow</FilterChip>
          <FilterChip>This week</FilterChip>
          <FilterChip><QIcon name="archive" size={11} sw={1.4} /><span style={{ marginLeft: 4 }}>Someday</span></FilterChip>
          <span style={{ flex: 1 }} />
          <span style={{
            fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
            letterSpacing: 0.6, textTransform: 'uppercase',
          }}>2 more in queue ↓</span>
        </div>
      </CaptureSheet>
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// DESKTOP · 1440×900 three-rail layout
// nav rail · list rail · detail rail
// ─────────────────────────────────────────────────────────────

const DESK_W = 1280;
const DESK_H = 800;

function DesktopFrame({ children }) {
  return (
    <div style={{
      width: DESK_W, height: DESK_H, background: Q.linen,
      borderRadius: 8, overflow: 'hidden', position: 'relative',
      boxShadow: '0 12px 40px rgba(31,29,24,0.12), 0 0 0 0.5px rgba(31,29,24,0.18)',
      fontFamily: Q.sans,
    }}>
      {/* mac chrome */}
      <div style={{
        height: 32, background: Q.linenDeep,
        borderBottom: `0.5px solid ${Q.rule}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8,
      }}>
        <span style={{ display: 'flex', gap: 8 }}>
          {['#ff736a', '#febc2e', '#19c332'].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.1)' }} />
          ))}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
          letterSpacing: 0.5,
        }}>quill.crucibleos.io</span>
        <span style={{ flex: 1 }} />
        <span style={{ width: 60 }} />
      </div>
      {children}
    </div>
  );
}

// Vertical nav rail (replaces tab bar on desktop)
function DeskNavRail({ active = 'today' }) {
  const top = [
    { id: 'today',    label: 'Today',    icon: 'today' },
    { id: 'projects', label: 'Projects', icon: 'list' },
    { id: 'someday',  label: 'Someday',  icon: 'horizon' },
  ];
  return (
    <div style={{
      width: 220, flex: '0 0 220px',
      background: Q.linen, borderRight: `0.5px solid ${Q.rule}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
    }}>
      <div style={{ padding: '0 20px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 14, background: Q.ink, color: Q.linen,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: Q.serif, fontSize: 18, fontWeight: 500,
        }}>Q</span>
        <span style={{ fontFamily: Q.serif, fontSize: 18, color: Q.ink, fontWeight: 500, letterSpacing: -0.2 }}>Quill</span>
      </div>
      {/* primary */}
      <div style={{ padding: '0 12px' }}>
        {top.map((t) => {
          const on = t.id === active;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 34, padding: '0 12px', borderRadius: 4,
              color: on ? Q.ink : Q.ink2,
              background: on ? Q.paper : 'transparent',
              fontFamily: Q.sans, fontSize: 13,
              fontWeight: on ? 600 : 500, position: 'relative',
            }}>
              {on && (
                <span style={{
                  position: 'absolute', left: -12, top: 8, bottom: 8,
                  width: 2, background: Q.rubric, borderRadius: 1,
                }} />
              )}
              <QIcon name={t.icon} size={15} sw={on ? 1.6 : 1.4} />
              <span>{t.label}</span>
              <span style={{ flex: 1 }} />
              {t.id === 'today' && (
                <span style={{
                  fontFamily: Q.mono, fontSize: 10, color: on ? Q.ink2 : Q.ink3,
                  fontVariantNumeric: 'tabular-nums',
                }}>5</span>
              )}
            </div>
          );
        })}
      </div>
      {/* domains */}
      <div style={{
        padding: '18px 20px 6px',
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase',
      }}>Domains</div>
      <div style={{ padding: '0 12px' }}>
        {DOMAIN_ORDER.map((k) => {
          const d = DOMAINS[k];
          return (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 30, padding: '0 12px', borderRadius: 4,
              fontFamily: Q.sans, fontSize: 13, color: Q.ink, fontWeight: 450,
            }}>
              <DomainGlyph domain={k} size={14} strokeWidth={1.4} style={{ color: d.color }} />
              <span>{d.label}</span>
              <span style={{ flex: 1 }} />
              <span style={{
                fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
                fontVariantNumeric: 'tabular-nums',
              }}>{[3,7,14,4,5][DOMAIN_ORDER.indexOf(k)]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      {/* footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: `0.5px solid ${Q.ruleSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.6, textTransform: 'uppercase',
      }}>
        <QIcon name="inbox" size={13} sw={1.4} />
        <span>Inbox · 2 from Crucible</span>
      </div>
    </div>
  );
}

// 4 · Today · desktop
function ScreenDesktopToday() {
  // group as on mobile
  const grouped = {};
  SAMPLE.today.forEach((t) => { (grouped[t.domain] = grouped[t.domain] || []).push(t); });
  const order = DOMAIN_ORDER.filter((d) => grouped[d]);

  return (
    <DesktopFrame>
      <div style={{
        position: 'absolute', top: 32, left: 0, right: 0, bottom: 0,
        display: 'flex',
      }}>
        <DeskNavRail active="today" />
        {/* list rail */}
        <div style={{
          flex: '1 1 480px', minWidth: 480, maxWidth: 580,
          borderRight: `0.5px solid ${Q.rule}`,
          background: Q.linen, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '24px 24px 12px' }}>
            <div style={{
              fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
              letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
            }}>Friday · the eighth</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{
                fontFamily: Q.serif, fontSize: 56, lineHeight: '0.85',
                color: Q.rubric, fontWeight: 500, marginRight: -4,
              }}>T</span>
              <h1 style={{
                fontFamily: Q.serif, fontSize: 38, lineHeight: '42px',
                color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.5,
              }}>oday</h1>
              <span style={{
                fontFamily: Q.mono, fontSize: 12, color: Q.ink3,
                fontVariantNumeric: 'tabular-nums',
              }}>{SAMPLE.today.length}</span>
              <span style={{ flex: 1 }} />
              <span style={{
                height: 30, padding: '0 12px', borderRadius: 15,
                background: Q.ink, color: Q.linen,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: Q.sans, fontSize: 12, fontWeight: 600,
              }}>
                <QIcon name="plus" size={12} sw={1.6} style={{ color: Q.linen }} />
                <span>Inscribe</span>
                <span style={{ fontFamily: Q.mono, opacity: 0.6, marginLeft: 6 }}>⌘N</span>
              </span>
            </div>
            {/* tally */}
            <div style={{
              marginTop: 16, padding: '8px 12px',
              background: Q.paper, borderRadius: 3,
              boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
              display: 'flex', alignItems: 'center', gap: 16,
              fontFamily: Q.mono, fontSize: 11, color: Q.ink2,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span><span style={{ width: 6, height: 6, borderRadius: 3, background: Q.rubric, display: 'inline-block', marginRight: 6 }} /><b style={{ color: Q.ink, fontWeight: 600 }}>4</b><span style={{ color: Q.ink3 }}> open</span></span>
              <span><span style={{ width: 6, height: 6, borderRadius: 3, background: Q.ink3, display: 'inline-block', marginRight: 6 }} /><b style={{ color: Q.ink, fontWeight: 600 }}>1</b><span style={{ color: Q.ink3 }}> blocked</span></span>
              <span><span style={{ width: 6, height: 6, borderRadius: 3, background: Q.ink, display: 'inline-block', marginRight: 6 }} /><b style={{ color: Q.ink, fontWeight: 600 }}>1</b><span style={{ color: Q.ink3 }}> done</span></span>
              <span style={{ flex: 1 }} />
              <span style={{ color: Q.ink3 }}>by domain ▾</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {order.map((k, di) => {
              const d = DOMAINS[k];
              return (
                <div key={k}>
                  <SectionHeader label={d.label} count={grouped[k].length} accent={d.color} glyph={k} />
                  <div style={{ background: Q.paper, marginRight: 0 }}>
                    {grouped[k].map((t, i) => {
                      const sel = di === 1 && i === 0; // highlight one row as the "selected" task
                      return (
                        <div key={i} style={{
                          background: sel ? Q.linenDeep : 'transparent',
                          boxShadow: sel ? `inset 3px 0 0 ${Q.rubric}` : 'none',
                        }}>
                          <TaskRow {...t} project={t.project} noRule={i === grouped[k].length - 1} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* detail rail */}
        <div style={{
          flex: 1, background: Q.linen, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 24px',
            borderBottom: `0.5px solid ${Q.rule}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <DomainChip domain="body" />
            <span style={{
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>Forge · Block 4 · today 8:00</span>
            <span style={{ flex: 1 }} />
            <QIcon name="kebab" size={14} sw={1.4} style={{ color: Q.ink3 }} />
          </div>
          <div style={{ padding: '20px 24px 0', flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ paddingTop: 4 }}>
                <TaskCheck state="open" size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontFamily: Q.serif, fontSize: 28, lineHeight: '34px',
                  color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.3,
                }}>Strength · deadlift session</h1>
                <div style={{
                  marginTop: 4, fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                }}>Block 4 · day 12 · pyramid 5×3</div>
              </div>
              <PriorityMark level={1} />
            </div>
            <div style={{
              marginTop: 18, paddingLeft: 16,
              borderLeft: `2px solid ${Q.rubricSoft}`,
              fontFamily: Q.serif, fontStyle: 'italic',
              fontSize: 14, lineHeight: '22px', color: Q.ink2,
              maxWidth: 460,
            }}>
              Working set 295. Belt for top two. Watch start position — drift forward last week. Log RPE in Forge after.
            </div>
            {/* properties */}
            <div style={{
              marginTop: 22, background: Q.paper,
              boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 3,
            }}>
              {[
                { icon:'cal',    label:'Due',       value:'Today · 8:00 AM', accent: Q.rubric },
                { icon:'recur',  label:'Repeat',    value:'Mon · Wed · Fri · 6 weeks' },
                { icon:'tag',    label:'Project',   value:'Forge · Strength block 4 · day 12 of 24' },
                { icon:'arrow-r',label:'Unblocks',  value:'Log session · Recovery score' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${Q.ruleSoft}`,
                }}>
                  <QIcon name={row.icon} size={14} sw={1.4} style={{ color: Q.ink3 }} />
                  <span style={{
                    fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
                    letterSpacing: 0.6, textTransform: 'uppercase', width: 80,
                  }}>{row.label}</span>
                  <span style={{ flex: 1, fontFamily: Q.sans, fontSize: 14, color: row.accent || Q.ink }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            {/* keyboard hint */}
            <div style={{
              marginTop: 14, display: 'flex', gap: 12,
              fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              <span>↵ open</span>
              <span>⌘K · jump</span>
              <span>⌘D · done</span>
              <span>⌘. · later</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

// 5 · Project detail · desktop — dependency tree gets full width
function ScreenDesktopProject() {
  const p = SAMPLE.meridian;
  const counts = p.tasks.reduce((acc, t) => { acc[t.state] = (acc[t.state] || 0) + 1; return acc; }, {});
  return (
    <DesktopFrame>
      <div style={{
        position: 'absolute', top: 32, left: 0, right: 0, bottom: 0,
        display: 'flex',
      }}>
        <DeskNavRail active="projects" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* project head */}
          <div style={{
            padding: '24px 36px 18px',
            borderBottom: `0.5px solid ${Q.rule}`,
            background: Q.linen,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
                letterSpacing: 0.6, textTransform: 'uppercase',
              }}>Projects · Work · Due May 22</span>
              <span style={{ flex: 1 }} />
              <span style={{
                fontFamily: Q.mono, fontSize: 11, color: Q.ink3,
                letterSpacing: 0.6, textTransform: 'uppercase',
              }}>13 tasks · 4 done · ~38%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <DomainBadge domain="work" size={32} withRing />
              <h1 style={{
                fontFamily: Q.serif, fontSize: 32, lineHeight: '38px',
                color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.4,
              }}>{p.title}</h1>
              <span style={{ flex: 1 }} />
              <FilterChip>
                <QIcon name="filter" size={11} sw={1.4} />
                <span style={{ marginLeft: 4 }}>Tree</span>
              </FilterChip>
              <FilterChip>Ready</FilterChip>
              <FilterChip>Open</FilterChip>
              <FilterChip active>All</FilterChip>
            </div>
            <div style={{
              marginTop: 4, fontFamily: Q.serif, fontStyle: 'italic',
              fontSize: 14, color: Q.ink2, maxWidth: 600,
            }}>Onboard a new advisory client through scope, proposal, and kickoff.</div>
            {/* progress */}
            <div style={{ marginTop: 14, display: 'flex', gap: 4, alignItems: 'center', maxWidth: 720 }}>
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
          </div>
          {/* split: tree + detail */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{
              flex: '1 1 580px', minWidth: 0,
              borderRight: `0.5px solid ${Q.rule}`,
              background: Q.paper, overflow: 'hidden',
            }}>
              <SectionHeader label="Manuscript · indented" count={p.tasks.length} sticky style={{ background: Q.paper }} />
              {p.tasks.map((t, i) => {
                const sel = t.id === 'd';
                return (
                  <div key={t.id} style={{
                    background: sel ? Q.linenDeep : 'transparent',
                    boxShadow: sel ? `inset 3px 0 0 ${Q.rubric}` : 'none',
                  }}>
                    <TaskRow {...t} domain={p.domain} project={null}
                      noRule={i === p.tasks.length - 1} />
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
              <div style={{
                fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
                letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
              }}>Selected · ready · today</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ paddingTop: 4 }}><TaskCheck state="ready" size={26} /></div>
                <h2 style={{
                  fontFamily: Q.serif, fontSize: 22, lineHeight: '28px',
                  color: Q.ink, fontWeight: 500, margin: 0, letterSpacing: -0.2, flex: 1,
                }}>Reply to Meridian onboarding brief</h2>
              </div>
              <div style={{
                marginTop: 14, paddingLeft: 14,
                borderLeft: `2px solid ${Q.rubricSoft}`,
                fontFamily: Q.serif, fontStyle: 'italic',
                fontSize: 13, lineHeight: '20px', color: Q.ink2,
              }}>
                Points of agreement on scope and rate. Reference Polaris case study + last quarter's revised SOW. Keep tight — under 300 words.
              </div>
              {/* mini-tree */}
              <div style={{
                marginTop: 16,
                fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
                letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
              }}>Subtasks · 2</div>
              <div style={{ background: Q.paper, boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 3 }}>
                <TaskRow title="Pull last quarter scope notes" state="done" priority={0} domain="work" project={null} />
                <TaskRow title="Drafting points of agreement" state="open" priority={1} domain="work" project={null} noRule />
              </div>
              <div style={{
                marginTop: 16,
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
      </div>
    </DesktopFrame>
  );
}

Object.assign(window, {
  ScreenCaptureEmpty, ScreenCaptureParse, ScreenCaptureFromCrucible,
  ScreenDesktopToday, ScreenDesktopProject,
  DESK_W, DESK_H,
});
