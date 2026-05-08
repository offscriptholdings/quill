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
- Background: #0E0D0B
- Ink (primary text): #E8E2D9
- Muted text: #9A9187
- Border: #2A2824
- Headers: Playfair Display
- Task text: Crimson Pro
- Labels/meta: JetBrains Mono
- Domain colors (muted):
  - Spirit: #C4A962
  - Body: #7EA87E
  - Project: #6B8CAE
  - Wealth: #C49A45
  - Family: #B8848A

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
