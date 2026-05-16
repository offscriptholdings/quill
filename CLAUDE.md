# CLAUDE.md — Quill PWA

## What this is
Quill is a personal task manager PWA for David Erickson. Part of the CrucibleOS
personal operating system stack. Mobile-first, iPhone primary surface.

## Stack
- React + Vite
- Tailwind CSS
- React Router (client-side routing)
- Supabase JS client (@supabase/supabase-js)
- Vercel (deploy)
- GitHub repo: https://github.com/toastedtank88/quill

## Supabase
- Project: CrucibleOS Supabase (same project as Crucible PWA)
- Schema: `quill` (all tables namespaced here)
- Tables: quill.tasks, quill.projects, quill.dependencies
- Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Design system

**Surfaces:**
- linen `#F2EDE3` — page background
- linen-2 `#EAE2CE` — alt fill, sticky headers
- paper `#FAF6EC` — card / sheet
- paper-2 `#F6F0DF` — raised card hover
- rule `#D9CFB8` — ledger / divider hairline
- rule-soft `#E5DCC6` — faint rule

**Ink scale:**
- ink `#1F1D18` — primary text, primary buttons
- ink-2 `#5C5448` — secondary text
- ink-3 `#948A78` — tertiary, placeholder, mono captions
- ink-4 `#BFB6A0` — disabled

**Accents (use sparingly):**
- rubric `#8E3A1A` — oxblood, today marks, key actions
- rubric-2 `#C26B4A` — softer rubric
- gold `#B8893A` — tiny sister-of-Crucible accent

**Domain palette (earth pigments — each with color/tint/edge):**

| Domain | color | tint | edge |
|---|---|---|---|
| Spirit | `#4A5578` | `#E6E5EC` | `#C9C8D6` |
| Body   | `#5F6E3C` | `#E8EADD` | `#CBD0B4` |
| Work   | `#8B5A3C` | `#EFE4D7` | `#D9C4AD` |
| Wealth | `#A57E2A` | `#F0E8D2` | `#DBC994` |
| Family | `#6E3F4A` | `#EDE0E2` | `#D2B9BE` |

`DOMAIN_ORDER = ['spirit','body','work','wealth','family']` — invariant.

**Fonts:**
- Headings: Newsreader (Google) — display titles, view headers, task titles. Weight 450–500.
- Body / UI: IBM Plex Sans
- Mono: IBM Plex Mono — metadata, dates, mono-caption kickers (uppercase + letter-spacing 0.6–0.8)

**Radius:** `paper: 3px`, `pill: 15px`, `sheet: 18px`

**Source of truth:** `design/quill-system.jsx` (`Q` token object), `design/HANDOFF.md`.

## Domain values
Spirit, Body, Project, Wealth, Family

## Priority values
urgent, high, normal, low

## Task status values
open, done, cancelled

## Project status values
active, waiting, complete, archived

## Nav tabs (in order)
Today | This Week | Projects | All Tasks

## Key patterns
- Mobile-first. Touch targets minimum 44px. No hover-dependent interactions.
- Optimistic updates on all task mutations — update UI first, write to Supabase
  second, revert on failure.
- completed_at MUST be set when status → done (used by Brief and Logbook).
- Unscheduled tasks (no schedule_date) do NOT appear in Today or This Week —
  they live in All Tasks only.
- Implement shared hooks for task completion and mutation — do not duplicate
  logic per view.

## Linear integration
- Workspace: crucibleos
- Project: Quill
- Read ticket specs via Linear MCP before building each ticket.
- Mark ticket In Progress when starting, Done when the feature works end-to-end.
- Open one PR per ticket.

## URLs
- Production: https://quill.crucibleos.io
- Crucible PWA (reference): https://pwa.crucibleos.io

## What NOT to do
- Do not use localStorage or sessionStorage.
- Do not build desktop-optimized layouts — narrow centered column (max 480px)
  is acceptable on desktop, not a goal.
- Do not create duplicate completion logic per view — use the shared hook.
- Do not skip completed_at on task completion.
