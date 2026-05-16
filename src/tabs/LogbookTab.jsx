import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DOMAIN_VALUES as DOMAIN_ORDER, DOMAIN_DISPLAY_LABEL } from '../lib/domains'

const DOMAIN_COLORS = {
  spirit: '#C4A962',
  body:   '#7EA87E',
  work:   '#6B8CAE',
  wealth: '#C49A45',
  family: '#B8848A',
}

function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function CompletedTaskRow({ task }) {
  const [expanded, setExpanded] = useState(false)
  const domainColor = DOMAIN_COLORS[task.domain] ?? '#9A9187'

  return (
    <div className="border-b border-border">
      <button
        onClick={() => task.notes ? setExpanded(v => !v) : null}
        className="w-full text-left flex items-start gap-3 py-3"
        style={{ minHeight: 44 }}
      >
        {/* Filled check circle */}
        <div
          className="flex-shrink-0 rounded-full mt-0.5"
          style={{ width: 20, height: 20, background: domainColor + '33', border: `1.5px solid ${domainColor}`, minWidth: 20 }}
        />

        <div className="flex-1 min-w-0">
          <p className="font-task text-base text-muted line-through leading-snug">{task.title}</p>
          {task.projects?.name && (
            <p className="font-mono text-xs text-muted mt-0.5">{task.projects.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono text-xs px-1.5 py-0.5 rounded-full"
            style={{ color: domainColor, background: domainColor + '1A' }}
          >
            {DOMAIN_DISPLAY_LABEL[task.domain] ?? task.domain}
          </span>
          {task.notes && (
            <span className="font-mono text-xs text-muted">{expanded ? '▾' : '▸'}</span>
          )}
        </div>
      </button>

      {expanded && task.notes && (
        <p className="font-task text-sm text-muted pl-9 pb-3 pr-4 leading-relaxed">{task.notes}</p>
      )}
    </div>
  )
}

export default function LogbookTab() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState('day')
  const [filterDomain, setFilterDomain] = useState(null)
  const [rangeStart, setRangeStart] = useState(addDays(today, -6))
  const [rangeEnd, setRangeEnd] = useState(today)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .schema('quill')
      .from('tasks')
      .select('*, projects!project_id(name)')
      .eq('status', 'done')
      .not('completed_at', 'is', null)
      .gte('completed_at', rangeStart)
      .lte('completed_at', rangeEnd + 'T23:59:59.999Z')
      .order('completed_at', { ascending: false })

    if (data) setTasks(data)
    setLoading(false)
  }, [rangeStart, rangeEnd])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const filtered = useMemo(() => (
    filterDomain ? tasks.filter(t => t.domain === filterDomain) : tasks
  ), [tasks, filterDomain])

  // Group by day
  const byDay = useMemo(() => {
    const groups = {}
    for (const t of filtered) {
      const date = t.completed_at?.split('T')[0]
      if (!date) continue
      if (!groups[date]) groups[date] = []
      groups[date].push(t)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  // Group by domain
  const byDomain = useMemo(() => {
    const groups = {}
    for (const t of filtered) {
      if (!groups[t.domain]) groups[t.domain] = []
      groups[t.domain].push(t)
    }
    return DOMAIN_ORDER.filter(d => groups[d]?.length > 0).map(d => ({ domain: d, tasks: groups[d] }))
  }, [filtered])

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate('/all-tasks')}
        className="flex items-center gap-2 font-mono text-xs text-muted mb-4"
        style={{ minHeight: 44 }}
      >
        ← All Tasks
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-header text-2xl text-ink">Logbook</h1>
        <span className="font-mono text-xs text-muted">{filtered.length} tasks</span>
      </div>

      {/* Controls */}
      <div className="space-y-3 mb-6">
        {/* Group toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border" style={{ minHeight: 36 }}>
            {['day', 'domain'].map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className="px-3 py-1.5 font-mono text-xs capitalize transition-colors"
                style={{
                  background: groupBy === g ? '#2A2824' : 'transparent',
                  color: groupBy === g ? '#E8E2D9' : '#9A9187',
                }}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={rangeStart}
            onChange={e => setRangeStart(e.target.value)}
            className="flex-1 bg-transparent text-ink font-mono text-xs border border-border rounded-lg px-2 py-1.5 outline-none"
            style={{ minHeight: 36, colorScheme: 'dark' }}
          />
          <span className="font-mono text-xs text-muted">→</span>
          <input
            type="date"
            value={rangeEnd}
            onChange={e => setRangeEnd(e.target.value)}
            className="flex-1 bg-transparent text-ink font-mono text-xs border border-border rounded-lg px-2 py-1.5 outline-none"
            style={{ minHeight: 36, colorScheme: 'dark' }}
          />
        </div>

        {/* Domain filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterDomain(null)}
            className="px-2.5 py-1 rounded-full font-mono text-xs transition-all"
            style={{
              background: !filterDomain ? '#2A2824' : 'transparent',
              border: `1px solid ${!filterDomain ? '#9A9187' : '#2A2824'}`,
              color: !filterDomain ? '#E8E2D9' : '#9A9187',
              minHeight: 32,
            }}
          >
            All
          </button>
          {DOMAIN_ORDER.map(d => (
            <button
              key={d}
              onClick={() => setFilterDomain(filterDomain === d ? null : d)}
              className="px-2.5 py-1 rounded-full font-mono text-xs transition-all"
              style={{
                background: filterDomain === d ? DOMAIN_COLORS[d] + '33' : 'transparent',
                border: `1px solid ${filterDomain === d ? DOMAIN_COLORS[d] : '#2A2824'}`,
                color: filterDomain === d ? DOMAIN_COLORS[d] : '#9A9187',
                minHeight: 32,
              }}
            >
              {DOMAIN_DISPLAY_LABEL[d] ?? d}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="font-task text-muted text-base">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p className="font-task text-muted text-base">Nothing completed in this range.</p>
      )}

      {/* By Day */}
      {!loading && groupBy === 'day' && byDay.map(([date, dayTasks]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{dayLabel(date)}</h2>
            <span className="font-mono text-xs text-muted">{dayTasks.length}</span>
          </div>
          {dayTasks.map(t => <CompletedTaskRow key={t.id} task={t} />)}
        </div>
      ))}

      {/* By Domain */}
      {!loading && groupBy === 'domain' && byDomain.map(({ domain, tasks: domainTasks }) => (
        <div key={domain} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: DOMAIN_COLORS[domain] }}
            >
              {DOMAIN_DISPLAY_LABEL[domain] ?? domain}
            </h2>
            <span className="font-mono text-xs text-muted">{domainTasks.length}</span>
          </div>
          {domainTasks.map(t => <CompletedTaskRow key={t.id} task={t} />)}
        </div>
      ))}
    </div>
  )
}
