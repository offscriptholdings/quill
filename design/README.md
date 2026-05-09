# Handoff: Quill — personal task & project manager

## Overview
Quill is a single-user PWA replacement for Apple Reminders, plus a non-dev project manager with first-class task dependencies. Lives in a four-product personal stack alongside Crucible (personal OS), Chaos (trading), Forge (workouts). Mobile-first iPhone home-screen install; occasional desktop. Five life **domains** are the spine of the app: Spirit · Body · Work · Wealth · Family.

This bundle is the **complete visual + interaction spec** plus working HTML prototypes for:
- The design system (tokens, components, patterns)
- 7 mobile screens + 3 capture variants
- 2 desktop adaptations (three-rail layout)

## About the design files
The `.html` and `.jsx` files in this folder are **design references** — React/Babel prototypes built to communicate exactly how Quill should look and feel. They are **not production code to ship**. Recreate them in Quill's intended stack:

- **React + Vite + Tailwind, deployed on Vercel**
- **Supabase backend (`quill` schema)** — the design assumes server-side data shaping happens elsewhere
- **PWA**, mobile-first, installed to iOS home screen
- **n8n** handles automations (recurring tasks, captures from Crucible)

Translate the inline-style prototypes into idiomatic Tailwind components. The `Q` token object in `quill-system.jsx` maps directly to a `tailwind.config.ts` extension.

## Fidelity
**High-fidelity.** All colors, typography, spacing, and interactions are final. Recreate pixel-perfectly using Tailwind + the codebase's component conventions.

## Files in this bundle
Open `Quill.html` in a browser to see everything live (pan/zoom canvas of all artboards; click any label or expand icon to focus one fullscreen).

| File | Contents |
|---|---|
| `Quill.html` | Canvas host + all artboards |
| `quill-system.jsx` | **Tokens** — `Q` color/type object, `DOMAINS` map, `QIcon`, `DomainGlyph`, `DomainBadge`, `DomainChip` |
| `quill-components.jsx` | Atomic components — `TaskCheck`, `PriorityMark`, `TaskRow`, `SectionHeader`, `ViewHeader`, `FilterChip`, `TabBar`, `AppTopBar`, `Backdrop` |
| `quill-tokens.jsx` | Design-system spec artboards (Palette / Type / Domains / Spacing / Components) |
| `quill-screens.jsx` | 7 mobile screens (`ScreenToday` … `ScreenEmpty`), `SAMPLE` data, `ScreenFrame` |
| `quill-extras.jsx` | 3 capture variants + 2 desktop screens |
| `design-canvas.jsx`, `ios-frame.jsx` | Presentation chrome only — do not port |

---

## Design tokens

### Color (lift into Tailwind `theme.extend.colors`)

```js
// surfaces
linen:      '#F2EDE3',  // page background
linenDeep:  '#EAE2CE',  // alt fill, sticky headers
paper:      '#FAF6EC',  // card / sheet
paper2:     '#F6F0DF',  // raised card hover
rule:       '#D9CFB8',  // ledger / divider hairline
ruleSoft:   '#E5DCC6',  // faint rule
// ink scale
ink:        '#1F1D18',  // primary text, primary buttons
ink2:       '#5C5448',  // secondary text
ink3:       '#948A78',  // tertiary, placeholder, mono captions
ink4:       '#BFB6A0',  // disabled
// marginal accent — sparingly: today rubric, "ready" mark, key actions
rubric:     '#8E3A1A',  // oxblood / scribe red
rubricSoft: '#C26B4A',
gold:       '#B8893A',  // tiny sister-of-Crucible accent (Crucible uses #C4973A; Quill is one notch cooler)
```

### Domain palette (earth pigments — each domain owns `color` / `tint` / `edge`)

| Domain | color | tint (surface) | edge (border) | glyph |
|---|---|---|---|---|
| Spirit | `#4A5578` indigo | `#E6E5EC` | `#C9C8D6` | flame |
| Body   | `#5F6E3C` moss   | `#E8EADD` | `#CBD0B4` | figure |
| Work   | `#8B5A3C` sienna | `#EFE4D7` | `#D9C4AD` | pen-nib |
| Wealth | `#A57E2A` ochre  | `#F0E8D2` | `#DBC994` | coin |
| Family | `#6E3F4A` plum   | `#EDE0E2` | `#D2B9BE` | hearth |

`DOMAIN_ORDER = ['spirit','body','work','wealth','family']` — never reorder; this order is referenced everywhere.

### Type
- **Headings** — `Newsreader` (Google) — display titles, view headers, task titles. Weight 450–500, letter-spacing -0.2 to -0.5, tight line-heights.
- **Body / UI** — `IBM Plex Sans` — task rows, buttons, all working surfaces. 13–15px common.
- **Mono** — `IBM Plex Mono` — metadata, dates, counts, kicker captions. ALWAYS uppercased + letter-spacing 0.6–0.8 for kickers.
- **Italic serif** — Newsreader italic, used for editorial pull-quotes/notes (left-bordered with `rubricSoft`).

Type scale (px / line-height / weight):
- `h-display` 56/0.85/500 — drop-cap (used in ViewHeader)
- `h1` 32–38/38–42/500 -0.4 to -0.5
- `h2` 22–28/28–34/500 -0.2 to -0.3
- `h3` 17–19/22–26/500
- `body` 14/20/450
- `body-sm` 13/18/450
- `meta` 11–12/16/450
- `mono-caption` 10–11/14/600 + uppercase + 0.6–0.8 letter-spacing

### Spacing
4-unit base. Common values: 4 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24. Screen padding 16. Card padding 12–18.

### Radius
Sharp paper. Almost everything is **3px** (cards, chips), **15–17px** for pills/buttons, **18px** for modal sheet top corners only. Avoid 8–12px — that's web-app generic and breaks the manuscript feel.

### Shadow
Used sparingly — only on the modal sheet (`0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)`) and the desktop window (`0 12px 40px rgba(31,29,24,0.12)`). Cards rely on hairline rules + tint, not elevation.

### Iconography
Custom 16×16 monoline icons drawn as `currentColor` strokes (so any parent color drives the hue). See `QIcon` in `quill-system.jsx` for the full registry. Stroke width 1.4–1.6. Icon set: `plus, check, chevron-l/r, dot, today, circle, circle-d, square, lock, arrow-r, cal, recur, menu, kebab, filter, search, inbox, tag, list, horizon, archive, x, flag`.

---

## Domain language
Each task / project / chip / nav item carries its domain identity through:
1. **Color** (from `DOMAINS[key].color`) — used for the glyph + a 2px left rule on TaskRow + chip border.
2. **Tinted surface** (`DOMAINS[key].tint`) — used for chip background, By-Domain header band.
3. **Monoline glyph** (`DomainGlyph` in `quill-system.jsx`) — flame / figure / pen-nib / coin / hearth.
4. **Order is invariant** — Spirit always first, Family always last.

`DomainBadge` (square glyph in tinted surface) is the canonical task-row mark. `DomainChip` (pill: glyph + label) is for filters and view headers.

---

## Components

### TaskCheck (`quill-components.jsx`)
Circular checkbox, four states, default 22px:

| State | Visual |
|---|---|
| `open` | hollow ink-stroke circle |
| `ready` | hollow circle with thin **rubric** (oxblood) ring outside — "today / next" |
| `blocked` | hollow circle with diagonal hatching, ink3 stroke |
| `done` | filled ink circle, white check inside |

### PriorityMark
Manuscript-style marginal tick marks. `level` 0 (none) / 1 (single tick) / 2 (double) / 3 (triple). Renders as small rubric vertical strokes right of the title. Used to convey weight without emoji or color flags.

### TaskRow — comfortable 56px (two-line: title / meta)
Layout L→R:
- 8px left margin · 2px left rule (domain `color`) · 12px gap
- 22px `TaskCheck`
- 12px gap
- title (Plex Sans 14/450, 1 line, ellipsis) — strikethrough + ink3 if `state==='done'`
- right side: `PriorityMark`, optional `DomainBadge`
- meta line below title (Plex Mono 10/600, uppercase, 0.6 ls): `DUE • PROJECT • DEPENDS-ON / UNBLOCKS`
- 0.5px hairline `ruleSoft` separator (suppress with `noRule` on last row)

Indented variants: `indent` prop (0–3) shifts row right by 20px each level and draws an L-shaped connector in `rule` color from the parent. `hasChildren` adds a chevron toggle. See `ScreenProjectDetail` for the canonical tree.

Swipe actions (mobile): right-swipe → mark done (rubric pill); left-swipe → snooze / move to Someday (ink3 pill). Long-press → bulk select.

### ProjectCard
Used in `ScreenProjects`. Linen-deep card, 12px radius:
- domain badge (ring) + project title (Newsreader 18/500)
- italic serif tagline / due note
- progress: 13-segment ledger bar (one segment per task) — `ink` for done, `rubric` for ready, hatched for blocked, `ruleSoft` for open. Mirror this on desktop project header.
- 4-up meta: open / ready / blocked / done counts in mono

### ViewHeader
Big editorial title for screen tops:
- mono kicker (uppercase, 11px)
- drop-cap (Newsreader 56/500 in `rubric`) tucked left of the H1
- H1 (Newsreader 32–38/500 -0.4)
- optional count + action right-aligned

### FilterChip
24/26px pill, 13px radius, hairline border. Active = `ink` fill + `linen` text. Inactive = transparent + ink2 text. Icon optional, 4px gap.

### DomainChip / DomainBadge
See "Domain language" above.

### TabBar (mobile, 80px tall, sits flush bottom)
4 tabs: **Today / Projects / Someday / Menu**. Active tab gets `ink` text + 2px rubric underline + bold weight. Inactive = ink3. **Domains are NOT a tab** — they live as a filter inside Today and as a section in Menu.

### FAB — quick capture
56px circle, `ink` fill, `linen` plus icon, sits 24px above tab bar, right-aligned with 16px right margin. Single shadow `0 6px 18px rgba(31,29,24,0.18)`. Tap → bottom-sheet modal.

### Capture sheet
Slides up from bottom with rounded top (18px). Header: drag handle + small mono "CAPTURE" label + Cancel + primary "Inscribe" pill (ink fill, disabled state ink4 60% opacity).

Three states are mocked:
1. **Empty** — italic prompt "What's next?" + recents + parse-hint chip rail
2. **Smart parse** — inline tokenization: `@` → project, `tomorrow 9am` → due, `!!` → priority. Tokens render with tinted background + small offset. Parsed values appear as a chip strip below the input.
3. **From Crucible** — gold ribbon for Crucible's signature, the captured fragment in italic serif, then required fields: Domain → Project → Unblocks → When. Counter "3 of 5" indicates queued items.

### AppTopBar
Sits below iOS status bar. Mono left + right (e.g. "Fri · May 8" / "Quill"). 36px tall, hairline bottom rule.

### Backdrop
Modal scrim — `rgba(31,29,24,0.32)`, no blur, dismisses on tap.

---

## Screens

All mobile screens live in 390×844 iPhone frame. Desktop screens are 1280×800 (laptop-friendly; design will scale up).

### M01 — Today *(`ScreenToday`)*
Default landing.
- AppTopBar: date / "Quill"
- ViewHeader: "Today" with rubric drop-cap "T", italic kicker "Friday · the eighth", count
- Tally bar (paper card, hairline): • 4 open • 1 blocked • 1 done • dropdown "by domain ▾"
- Tasks grouped by domain (Spirit → Family); each group has a `SectionHeader` (mono uppercase, glyph, count) and a paper section. The first ready task gets a rubric ring on its check.
- FAB top-right of TabBar
- TabBar: Today active

### M02 — Projects *(`ScreenProjects`)*
- ViewHeader "Projects" with drop-cap "P", action: "+ New"
- Filter chip row: Active / Someday / By domain
- Stack of `ProjectCard`s — Meridian onboarding (Work), Recovery & sleep (Body), Q2 finances (Wealth), Family weekly (Family), Crucible 1.2 (Work, paused → ink3 with subtle stripe)

### M03 — Project detail *(`ScreenProjectDetail`)*
- Domain chip + small mono "WORK · DUE MAY 22" kicker
- Project title (Newsreader 26/500) + italic tagline
- Progress: 13-segment ledger bar inline
- 4 stat tiles (open / ready / blocked / done)
- "MANUSCRIPT" section header — then the **indented dependency tree**: parent tasks at indent 0, children at indent 1 with L-connectors in `rule`. `lock` icon on rows whose `blockedBy` is non-empty. Show all states.

### M04 — By Domain · Body *(`ScreenDomain`)*
- Tinted band header in `body.tint` running edge-to-edge with the moss glyph + "Body" + italic note "health · physical"
- Mini stats: "14 tasks · 3 ready · 2 blocked"
- Cross-project task list grouped by project, not domain — so the user sees Body tasks pulled from Forge, Recovery, etc. Each project gets a small mono SectionHeader.

### M05 — Quick capture *(3 variants)*
See "Capture sheet" above. Mocks: `M05a` empty / `M05b` smart parse / `M05c` from Crucible.

### M06 — Task detail *(`ScreenTaskDetail`)*
Editorial — like a single page in a journal:
- Mono kicker with project + domain chip + due
- Big task title (Newsreader 28/500)
- Italic serif notes block, left-rubric-rule
- Property rows on paper: Due / Repeat / Project / **Waiting on** / **Unblocks** — the last two are first-class, each row showing a mini TaskRow of the dependency
- Metadata footer: created / modified / source (e.g. "from Crucible capture")

### M07 — Empty state *(`ScreenEmpty`)*
Quiet, intentional — a real ruled page. ViewHeader "Today" with "0", italic serif blockquote "Nothing on the page yet." with rubric quote-mark, then 3 small mono prompts ("Capture from Crucible", "Pull from Someday", "Begin a new line"). No illustrations.

### D1 — Today · desktop *(`ScreenDesktopToday`)*
Three-rail, 220 / 480–580 / flex:
- **Nav rail** (linen, hairline right): "Q" mark + "Quill" wordmark · primary nav (Today / Projects / Someday) with active state = paper fill + 2px rubric left bar · "DOMAINS" mono section + each domain row with glyph, label, count · footer "INBOX · 2 from Crucible"
- **List rail** (linen): same ViewHeader as mobile, tally bar, then domain-grouped task list. Selected row gets `linenDeep` background + 3px rubric inset-left.
- **Detail rail** (linen): mirrors `ScreenTaskDetail` content but inline; ⌘N / ⌘K / ⌘D / ⌘. keyboard hints at the bottom.

mac chrome: 32px linen-deep title bar, traffic lights, mono "quill.crucibleos.io" centered.

### D2 — Project detail · desktop *(`ScreenDesktopProject`)*
Same nav rail. Right side splits into **tree rail** (paper, hairline right, indented dependency list) + **detail rail** (selected task with subtasks + unblocks blocks). Project header is full-width above with the segmented progress ledger.

---

## Interaction & behavior

### Navigation flows
- TabBar drives top-level routes. `Today` is default. `Menu` is settings + domains as full-screen filter.
- TaskRow tap → push `ScreenTaskDetail`.
- ProjectCard tap → push `ScreenProjectDetail`.
- Domain chip in any header → push `ScreenDomain` for that domain.
- FAB → present `ScreenCapture` modal sheet.

### Quick capture parsing
Implement client-side tokenization on the input. Triggers:
- `@text` → project lookup, fuzzy match
- `#text` → domain (spirit/body/work/wealth/family), fuzzy
- `today` / `tomorrow` / `monday` / `9am` / `9:00` / `next week` → due date
- `!`, `!!`, `!!!` → priority levels 1/2/3
- `^text` → "waits on" — fuzzy match against open tasks for dependency suggestion

Tokens highlight inline as the user types and resolve into chips on a strip below. Cancel returns to previous screen; Inscribe persists and dismisses.

### Crucible inbound capture
n8n posts captured items to Quill's `inbox` table. The Today screen shows a small "2 from Crucible" footer in the menu/inbox; tapping opens `ScreenCaptureFromCrucible` cycling through the queue (counter "3 of 5"). Each item requires Domain + When; Project and Unblocks suggested but optional.

### Swipe actions on TaskRow
- Right swipe past 88px → mark `done` (haptic, row collapses)
- Left swipe past 88px → menu: Snooze (today / tomorrow / next week / Someday), Edit, Delete
- Short swipe reveals action buttons rather than committing

### Drag-to-reorder
Long-press TaskRow → enters reorder mode (subtle scale 1.02, rubric border). Drag within the same group reorders. Cross-domain drag changes the row's domain.

### Bulk select
Long-press in non-reorder mode (or "Select" from kebab) toggles checkbox column. Bottom action sheet: Done / Snooze / Move to project / Change domain / Delete.

### Dependency wiring
On task detail, "Waiting on" and "Unblocks" each have an "+ link" affordance → opens a fuzzy task picker (filtered by same project by default; toggle to expand to all open tasks). Multi-select allowed. Linking is bidirectional and persisted as `task_dependencies` rows.

### Empty / loading / error
- Empty per-view (see M07 for Today). Per-domain empty: tinted band header still shows; below it, italic "No open lines in {domain}." + small "Inscribe" button.
- Loading: skeleton TaskRows (linenDeep blocks at row positions). Never spinners.
- Errors: small inline rubric mono caption, never a modal.

### Animations & motion
- Modal sheet: 240ms `cubic-bezier(0.32, 0.72, 0, 1)` ease, slides 100% from bottom + scrim fades 0→0.32 opacity
- Sheet dismiss: 200ms reverse
- Row done: 160ms — check fills, title strikethroughs (color animates over 120ms), row collapses to 0px height after 100ms
- Tab switch: cross-fade 120ms + 4px translate
- No bounce, no spring. This is an instrument.

### Responsive behavior
- ≤640: mobile (M-screens)
- 641–1023: same as mobile but max-width 540 centered with linen gutters
- ≥1024: switch to desktop three-rail (D-screens)

---

## State management

Suggested shape (not prescriptive — adapt to your data layer):

```ts
type Domain = 'spirit' | 'body' | 'work' | 'wealth' | 'family';
type TaskState = 'open' | 'ready' | 'blocked' | 'done';

interface Task {
  id: string;
  title: string;
  notes?: string;
  domain: Domain;
  project_id?: string;
  due?: string;          // ISO; null = no date
  scheduled?: string;    // ISO
  recurrence?: RRule;
  priority: 0 | 1 | 2 | 3;
  state: TaskState;
  blocked_by: string[];  // task ids
  // unblocks is computed from inverse of blocked_by
  parent_id?: string;    // for indented subtasks
  source?: 'manual' | 'crucible' | 'n8n';
  created_at: string;
  completed_at?: string;
}

interface Project {
  id: string;
  title: string;
  tagline?: string;
  domain: Domain;
  due?: string;
  paused?: boolean;
}
```

Supabase `quill` schema mirrors the above. Computed views: `tasks_today`, `tasks_ready`, `tasks_blocked`, `task_unblocks`. n8n writes to `inbox` table; client polls or subscribes via Supabase realtime.

`ready` state is computed, not stored: a task is `ready` if `state === 'open'` and `blocked_by` resolves to all-done. The UI's rubric ring on TaskCheck reflects this. "Today" is a separate boolean-ish concept (`scheduled === today` OR `due <= today`).

---

## Tailwind config sketch

```ts
// tailwind.config.ts (extend section)
{
  theme: {
    extend: {
      colors: {
        linen:      '#F2EDE3',
        'linen-2':  '#EAE2CE',
        paper:      '#FAF6EC',
        'paper-2':  '#F6F0DF',
        rule:       '#D9CFB8',
        'rule-soft':'#E5DCC6',
        ink:        '#1F1D18',
        'ink-2':    '#5C5448',
        'ink-3':    '#948A78',
        'ink-4':    '#BFB6A0',
        rubric:     '#8E3A1A',
        'rubric-2': '#C26B4A',
        gold:       '#B8893A',
        domain: {
          spirit: { DEFAULT: '#4A5578', tint: '#E6E5EC', edge: '#C9C8D6' },
          body:   { DEFAULT: '#5F6E3C', tint: '#E8EADD', edge: '#CBD0B4' },
          work:   { DEFAULT: '#8B5A3C', tint: '#EFE4D7', edge: '#D9C4AD' },
          wealth: { DEFAULT: '#A57E2A', tint: '#F0E8D2', edge: '#DBC994' },
          family: { DEFAULT: '#6E3F4A', tint: '#EDE0E2', edge: '#D2B9BE' },
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Source Serif Pro', 'Georgia', 'serif'],
        sans:  ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono:  ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { paper: '3px', pill: '15px', sheet: '18px' },
      boxShadow: {
        sheet: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
        fab:   '0 6px 18px rgba(31,29,24,0.18)',
      },
    },
  },
}
```

Load Google Fonts: `Newsreader:ital,wght@0,400..600;1,400..600` and `IBM+Plex+Sans:wght@400;500;600` and `IBM+Plex+Mono:wght@400;500;600`.

---

## Assets
No raster imagery in the design. All glyphs and icons are inline SVG (currentColor strokes); port them as a single `<Icon>` component reading from a registry. No proprietary brand assets.

---

## Implementation order (suggested)
1. Tailwind config + fonts + base layout (linen page, AppTopBar, TabBar)
2. Atomic components: TaskCheck, PriorityMark, DomainBadge/Chip, FilterChip, QIcon registry
3. TaskRow (start with the comfortable variant, add indent + connectors after)
4. ScreenToday (pulls everything together — good first integration)
5. Capture sheet (modal sheet + parser)
6. ProjectCard + ScreenProjects + ScreenProjectDetail
7. ScreenDomain + ScreenTaskDetail + empty state
8. Crucible inbound capture flow
9. Desktop three-rail + keyboard shortcuts
10. Swipe / drag / bulk-select interactions

---

## Principles to honor (from the brief)
- **Mobile-first, thumb-reachable.** All primary actions reachable with right-thumb on a 6.1" device.
- **Density without clutter.** Show a lot; keep it calm.
- **Dependencies are first-class.** The indented tree on Project detail and the Waiting-on / Unblocks blocks on Task detail are not optional.
- **Domains are the spine.** Every task carries domain identity; the app is always domain-aware.
- **Calm, not gamified.** No streaks, no confetti, no celebratory states. The "done" animation is brief and final.

If anything in the design conflicts with these principles, the principles win.
