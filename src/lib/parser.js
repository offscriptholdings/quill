// Smart-parse tokens from raw input. Returns:
// { cleanedTitle, tokens: [{ raw, type, value, matchedSpan }], resolved: { domain, scheduled, priority, projectQuery, waitsOnQuery } }
//
// Types: 'domain' | 'project' | 'date' | 'time' | 'priority' | 'waits-on'

import { DOMAIN_VALUES } from './domains'

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function parseInput(text) {
  const tokens = []
  const resolved = {
    domain: null,
    scheduled: null,
    scheduledTime: null,
    priority: null,
    projectQuery: null,
    waitsOnQuery: null,
  }

  if (!text) {
    return { cleanedTitle: '', tokens, resolved }
  }

  // 1. #domain — fuzzy match against DOMAIN_VALUES
  const domainRe = /#(\w+)/gi
  for (const m of text.matchAll(domainRe)) {
    const raw = m[0]
    const q = m[1].toLowerCase()
    const hit = DOMAIN_VALUES.find((d) => d.startsWith(q) || d === q)
    if (hit) {
      resolved.domain = hit
      tokens.push({ raw, type: 'domain', value: hit, matchedSpan: [m.index, m.index + raw.length] })
    }
  }

  // 2. @project — capture query; UI resolves against quill.projects
  const projRe = /@(\w[\w-]*)/gi
  for (const m of text.matchAll(projRe)) {
    const raw = m[0]
    const q = m[1].trim()
    resolved.projectQuery = q
    tokens.push({ raw, type: 'project', value: q, matchedSpan: [m.index, m.index + raw.length] })
  }

  // 3. Priority !!! / !! / !
  const priRe = /(?:^|\s)(!!!|!!|!)(?=\s|$)/g
  for (const m of text.matchAll(priRe)) {
    const raw = m[1]
    const value = raw === '!!!' ? 3 : raw === '!!' ? 2 : 1
    resolved.priority = Math.max(resolved.priority ?? 0, value)
    const start = m.index + m[0].indexOf(raw)
    tokens.push({ raw, type: 'priority', value, matchedSpan: [start, start + raw.length] })
  }

  // 4. Dates: today, tomorrow, next week
  const dateWords = [
    { re: /\b(today)\b/i, fn: () => new Date() },
    {
      re: /\b(tomorrow)\b/i,
      fn: () => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d
      },
    },
    {
      re: /\b(next week)\b/i,
      fn: () => {
        const d = new Date()
        const diff = (8 - d.getDay()) % 7 || 7
        d.setDate(d.getDate() + diff)
        return d
      },
    },
  ]
  let dateMatched = false
  for (const { re, fn } of dateWords) {
    const m = text.match(re)
    if (m) {
      const date = fn()
      resolved.scheduled = isoDate(date)
      tokens.push({
        raw: m[0],
        type: 'date',
        value: resolved.scheduled,
        matchedSpan: [m.index, m.index + m[0].length],
      })
      dateMatched = true
      break
    }
  }
  // Weekday names (only if no explicit date word matched)
  if (!dateMatched) {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      const wd = WEEKDAYS[i]
      const re = new RegExp(`\\b(${wd})\\b`, 'i')
      const m = text.match(re)
      if (m) {
        const today = new Date()
        let diff = i - today.getDay()
        if (diff <= 0) diff += 7
        const d = new Date(today)
        d.setDate(d.getDate() + diff)
        resolved.scheduled = isoDate(d)
        tokens.push({
          raw: m[0],
          type: 'date',
          value: resolved.scheduled,
          matchedSpan: [m.index, m.index + m[0].length],
        })
        break
      }
    }
  }

  // 5. Times: 9am / 9:30am / 14:00
  const timeRe = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i
  const tm = text.match(timeRe)
  if (tm) {
    let h = parseInt(tm[1], 10)
    const min = tm[2] ? parseInt(tm[2], 10) : 0
    const ampm = tm[3].toLowerCase()
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      resolved.scheduledTime = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      tokens.push({
        raw: tm[0],
        type: 'time',
        value: resolved.scheduledTime,
        matchedSpan: [tm.index, tm.index + tm[0].length],
      })
    }
  }

  // 6. ^waits-on
  const wRe = /\^(\w[\w-]*)/gi
  for (const m of text.matchAll(wRe)) {
    const raw = m[0]
    const q = m[1].trim()
    resolved.waitsOnQuery = q
    tokens.push({ raw, type: 'waits-on', value: q, matchedSpan: [m.index, m.index + raw.length] })
  }

  // Strip matched tokens to derive cleaned title
  let cleaned = text
  const sorted = [...tokens].sort((a, b) => b.matchedSpan[0] - a.matchedSpan[0])
  for (const t of sorted) {
    cleaned = cleaned.slice(0, t.matchedSpan[0]) + cleaned.slice(t.matchedSpan[1])
  }
  return { cleanedTitle: cleaned.replace(/\s+/g, ' ').trim(), tokens, resolved }
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}
