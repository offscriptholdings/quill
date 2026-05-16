// Quill — design system token specimen cards.
// Used in the "System" section of the canvas.
// Depends on quill-system.jsx.

// Generic specimen frame
function Spec({ children, width = 440, height = 600, pad = 20, style = {} }) {
  return (
    <div style={{
      width, height, padding: pad, boxSizing: 'border-box',
      background: Q.linen, color: Q.ink,
      fontFamily: Q.sans, overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

// Section heading inside a spec card
function SpecHead({ kicker, title, sub, style = {} }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
      }}>{kicker}</div>
      <div style={{
        fontFamily: Q.serif, fontSize: 22, color: Q.ink,
        fontWeight: 500, lineHeight: '26px', letterSpacing: -0.2,
      }}>{title}</div>
      {sub && (
        <div style={{
          fontFamily: Q.serif, fontStyle: 'italic',
          fontSize: 13, color: Q.ink2, lineHeight: '18px', marginTop: 4,
        }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecPalette — surfaces + ink + accents
// ─────────────────────────────────────────────────────────────
function SpecPalette() {
  const swatch = (label, hex, name, dark = false) => (
    <div key={name} style={{
      flex: 1, minWidth: 0,
      background: hex, color: dark ? Q.linen : Q.ink,
      padding: '12px 12px 14px', borderRadius: 2,
      boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 86,
    }}>
      <div style={{
        fontFamily: Q.mono, fontSize: 10,
        letterSpacing: 0.6, textTransform: 'uppercase',
        opacity: 0.7,
      }}>{label}</div>
      <div>
        <div style={{
          fontFamily: Q.serif, fontSize: 14, fontWeight: 500,
        }}>{name}</div>
        <div style={{
          fontFamily: Q.mono, fontSize: 11, opacity: 0.7,
          fontVariantNumeric: 'tabular-nums', marginTop: 2,
        }}>{hex.toUpperCase()}</div>
      </div>
    </div>
  );
  return (
    <Spec width={460} height={620}>
      <SpecHead kicker="Tokens · 01" title="Palette" sub="Linen ground, ink scale, scribe rubric." />
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Surfaces</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {swatch('bg', Q.linen, 'linen')}
        {swatch('bg-2', Q.linenDeep, 'linen.deep')}
        {swatch('card', Q.paper, 'paper')}
      </div>
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Ink</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {swatch('100', Q.ink,  'ink',     true)}
        {swatch('70',  Q.ink2, 'ink.2',   true)}
        {swatch('40',  Q.ink3, 'ink.3')}
        {swatch('20',  Q.ink4, 'ink.4')}
      </div>
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Rules &amp; rubric</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {swatch('rule', Q.rule,     'rule')}
        {swatch('soft', Q.ruleSoft, 'rule.soft')}
        {swatch('mark', Q.rubric,   'rubric',  true)}
        {swatch('sib',  Q.gold,     'gold',    true)}
      </div>
      <div style={{
        background: Q.paper, padding: '14px 14px',
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 2,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{
          width: 4, height: 36, background: Q.rubric, borderRadius: 1,
        }} />
        <div>
          <div style={{ fontFamily: Q.serif, fontSize: 15, color: Q.ink, fontWeight: 500 }}>
            “Linen · ink · a single scribe’s red.”
          </div>
          <div style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink3, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 4 }}>
            Rubric appears once per page · never twice.
          </div>
        </div>
      </div>
    </Spec>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecType — type pairing + scale
// ─────────────────────────────────────────────────────────────
function SpecType() {
  const row = (label, sample, font, size, weight, lh, italic = false, mono = false) => (
    <div key={label} style={{
      display: 'flex', alignItems: 'baseline', gap: 16,
      padding: '12px 0', borderTop: `0.5px solid ${Q.ruleSoft}`,
    }}>
      <div style={{
        width: 80, flex: '0 0 80px',
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.6, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font, fontSize: size, fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          lineHeight: lh, color: Q.ink, letterSpacing: -0.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{sample}</div>
        <div style={{
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          marginTop: 2, fontVariantNumeric: 'tabular-nums',
        }}>
          {mono ? 'Plex Mono' : (font === Q.serif ? 'Newsreader' : 'Plex Sans')} · {size}/{lh.toString().replace('px','')} · {weight}{italic ? ' italic' : ''}
        </div>
      </div>
    </div>
  );
  return (
    <Spec width={460} height={620}>
      <SpecHead
        kicker="Tokens · 02"
        title="Type"
        sub="Newsreader for editorial weight; Plex Sans for the working surface; Plex Mono for ledger metadata."
      />
      <div style={{
        background: Q.paper, padding: '4px 16px 8px',
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 2,
      }}>
        {row('Display',  'A line in the story',           Q.serif, 32, 500, '36px')}
        {row('H1',       'Today',                         Q.serif, 26, 500, '30px')}
        {row('H2',       'Meridian onboarding',           Q.serif, 20, 500, '24px')}
        {row('Quote',    'Calm, not gamified.',           Q.serif, 15, 400, '22px', true)}
        {row('Body',     'Reply to Meridian brief',       Q.sans,  15, 450, '20px')}
        {row('UI',       'Inscribe',                      Q.sans,  13, 600, '16px')}
        {row('Caption',  'WORK · MERIDIAN · TODAY',       Q.mono,  11, 500, '14px', false, true)}
      </div>
    </Spec>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecDomains — five pigments + glyphs + voice
// ─────────────────────────────────────────────────────────────
function SpecDomains() {
  return (
    <Spec width={460} height={620}>
      <SpecHead
        kicker="Tokens · 03"
        title="Domains"
        sub="Earth pigments. Each domain owns one hue, one glyph, one tinted surface. Always five — the spine."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DOMAIN_ORDER.map((k) => {
          const d = DOMAINS[k];
          return (
            <div key={k} style={{
              display: 'flex', alignItems: 'stretch',
              borderRadius: 2, overflow: 'hidden',
              boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
            }}>
              {/* swatch column */}
              <div style={{
                width: 88, background: d.color, color: Q.linen,
                padding: '12px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <DomainGlyph domain={k} size={22} strokeWidth={1.3} style={{ color: Q.linen }} />
                <div style={{
                  fontFamily: Q.mono, fontSize: 10, opacity: 0.85,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  fontVariantNumeric: 'tabular-nums',
                }}>{d.color.toUpperCase()}</div>
              </div>
              {/* tint column */}
              <div style={{
                flex: 1, background: d.tint, color: d.color,
                padding: '12px 14px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
              }}>
                <div style={{
                  fontFamily: Q.serif, fontSize: 22, fontWeight: 500,
                  lineHeight: '26px', letterSpacing: -0.2,
                }}>{d.label}</div>
                <div style={{
                  fontFamily: Q.serif, fontStyle: 'italic',
                  fontSize: 13, color: d.color, opacity: 0.85,
                }}>{d.note}</div>
              </div>
              {/* chip column */}
              <div style={{
                width: 96, padding: '12px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                background: Q.paper,
              }}>
                <DomainChip domain={k} />
                <DomainChip domain={k} active />
              </div>
            </div>
          );
        })}
      </div>
    </Spec>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecSpacingShape — spacing scale + radii + rules + shadows
// ─────────────────────────────────────────────────────────────
function SpecSpacingShape() {
  const spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  const radii = [
    { name: 'r.0',  px: 0, note: 'tabs · ledger blocks' },
    { name: 'r.1',  px: 2, note: 'cards · paper' },
    { name: 'r.2',  px: 4, note: 'tally · group' },
    { name: 'r.3',  px: 8, note: 'sheet edges' },
    { name: 'r.4',  px: 12, note: 'modal · pill' },
  ];
  return (
    <Spec width={460} height={620}>
      <SpecHead
        kicker="Tokens · 04"
        title="Spacing &amp; shape"
        sub="A 4-unit grid. Sharp corners; paper does not round."
      />
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Spacing scale · px</div>
      <div style={{
        background: Q.paper, padding: '14px 14px 10px',
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 2, marginBottom: 18,
      }}>
        {spacing.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ width: 36, fontFamily: Q.mono, fontSize: 11, color: Q.ink2, fontVariantNumeric: 'tabular-nums' }}>{s}</div>
            <div style={{ height: 8, width: s * 3, background: Q.ink, borderRadius: 1 }} />
            <div style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink3, letterSpacing: 0.6, textTransform: 'uppercase', marginLeft: 8 }}>
              tw {Math.round(s/4)}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Radius</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {radii.map((r) => (
          <div key={r.name} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 56, background: Q.paper,
              boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
              borderRadius: r.px,
              marginBottom: 6,
            }} />
            <div style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink2 }}>{r.name} · {r.px}px</div>
            <div style={{ fontFamily: Q.mono, fontSize: 9, color: Q.ink3, marginTop: 2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{r.note}</div>
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
      }}>Rule weights</div>
      <div style={{
        background: Q.paper, padding: '14px',
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 2,
      }}>
        {[
          { w: 0.5, c: Q.ruleSoft, label: 'soft · between rows' },
          { w: 0.5, c: Q.rule,     label: 'rule · sections' },
          { w: 1,   c: Q.ink3,     label: 'rule.ink · headers' },
          { w: 1.5, c: Q.rubric,   label: 'rubric · today, ready' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
            <div style={{ width: 100, height: r.w, background: r.c }} />
            <div style={{ fontFamily: Q.mono, fontSize: 10, color: Q.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{r.label}</div>
          </div>
        ))}
      </div>
    </Spec>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecComponents — sampler of atomic components
// ─────────────────────────────────────────────────────────────
function SpecComponents() {
  return (
    <Spec width={460} height={620}>
      <SpecHead
        kicker="Tokens · 05"
        title="Components"
        sub="The working alphabet. Everything else composes from these."
      />
      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
      }}>Task states</div>
      <div style={{
        background: Q.paper, padding: '6px 0', marginBottom: 16,
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`, borderRadius: 2,
      }}>
        <TaskRow title="Open · just sitting there" domain="work" project={null} state="open"  priority={0} />
        <TaskRow title="Ready · the next clear action" domain="body" project={null} state="ready" priority={2} today />
        <TaskRow title="Blocked · waiting on a piece"   domain="wealth" project={null} state="blocked" priority={1} blockedBy="statement" />
        <TaskRow title="Done · already on the page"     domain="spirit" project={null} state="done" priority={0} noRule />
      </div>

      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
      }}>Filter chips</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        <FilterChip active>All</FilterChip>
        <FilterChip>Today</FilterChip>
        <FilterChip>Ready</FilterChip>
        <FilterChip>Blocked</FilterChip>
        <DomainChip domain="spirit" />
        <DomainChip domain="body" />
        <DomainChip domain="work" active />
        <DomainChip domain="wealth" />
        <DomainChip domain="family" />
      </div>

      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
      }}>Project card</div>
      <div style={{ marginBottom: 16 }}>
        <ProjectCard
          title="Meridian client onboarding"
          domain="work"
          open={8} ready={2} blocked={1} done={4} total={13}
          due="May 22"
        />
      </div>

      <div style={{
        fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
        letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
      }}>Buttons &amp; affordances</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          height: 36, padding: '0 16px', borderRadius: 18,
          background: Q.ink, color: Q.linen,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: Q.sans, fontSize: 13, fontWeight: 600,
        }}>
          <QIcon name="plus" size={13} sw={1.6} />Inscribe
        </span>
        <span style={{
          height: 36, padding: '0 16px', borderRadius: 18,
          background: 'transparent', color: Q.ink,
          boxShadow: `inset 0 0 0 0.5px ${Q.ink}`,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: Q.sans, fontSize: 13, fontWeight: 600,
        }}>Cancel</span>
        <span style={{
          height: 36, padding: '0 14px', borderRadius: 18,
          background: 'transparent', color: Q.rubric,
          fontFamily: Q.mono, fontSize: 11,
          letterSpacing: 0.6, textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>Mark today</span>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: Q.ink, color: Q.linen,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(31,29,24,0.18)',
        }}>
          <QIcon name="plus" size={18} sw={1.6} style={{ color: Q.linen }} />
        </div>
      </div>
    </Spec>
  );
}

// ─────────────────────────────────────────────────────────────
// SpecPrinciples — the design north stars, on a "title page"
// ─────────────────────────────────────────────────────────────
function SpecPrinciples() {
  return (
    <Spec width={460} height={620}>
      <div style={{
        height: '100%',
        background: Q.paper,
        boxShadow: `inset 0 0 0 0.5px ${Q.rule}`,
        position: 'relative', padding: '48px 36px 36px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* ledger lines */}
        <div style={{
          position: 'absolute', left: 80, top: 24, bottom: 24,
          width: 1, background: Q.rubricSoft, opacity: 0.5,
        }} />
        <div style={{
          fontFamily: Q.mono, fontSize: 10, color: Q.ink3,
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>Quill · v0 · principles</div>
        <div style={{
          fontFamily: Q.serif, fontSize: 42, lineHeight: '46px',
          color: Q.ink, fontWeight: 500, letterSpacing: -0.6,
          marginTop: 6, marginBottom: 24,
        }}>
          <span style={{ color: Q.rubric }}>Q</span>uill is an instrument,
          <br/>not a toy.
        </div>
        {[
          ['Domains are the spine.',         'Five domains, always: Spirit, Body, Work, Wealth, Family. The whole app reads domain-first.'],
          ['Dependencies are first-class.',  'Most apps treat them as an afterthought. Quill makes blocked/ready legible at a glance.'],
          ['Density without clutter.',       'Show many tasks; hold them calmly. Mono for metadata, serif for thought.'],
          ['Calm, not gamified.',            'No streaks, no confetti, no dopamine. The page just turns.'],
          ['Mobile-first, thumb-reachable.', 'Primary actions in the lower third. FAB above the tab bar.'],
        ].map(([t, b], i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, padding: '8px 0',
          }}>
            <div style={{
              width: 24, fontFamily: Q.serif, fontSize: 14, color: Q.rubric,
              fontVariantNumeric: 'tabular-nums', flex: '0 0 24px',
              letterSpacing: 0.4,
            }}>§{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: Q.serif, fontSize: 16, fontWeight: 500,
                color: Q.ink, lineHeight: '20px',
              }}>{t}</div>
              <div style={{
                fontFamily: Q.serif, fontStyle: 'italic',
                fontSize: 13, color: Q.ink2, lineHeight: '19px', marginTop: 2,
              }}>{b}</div>
            </div>
          </div>
        ))}
      </div>
    </Spec>
  );
}

Object.assign(window, {
  Spec, SpecHead,
  SpecPalette, SpecType, SpecDomains, SpecSpacingShape, SpecComponents, SpecPrinciples,
});
