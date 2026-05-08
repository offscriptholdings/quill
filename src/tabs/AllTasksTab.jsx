import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TaskRow from '../components/TaskRow'
import AddTaskFAB from '../components/AddTaskFAB'

const DOMAINS = ['Spirit', 'Body', 'Project', 'Wealth', 'Family']
const PRIORITIES = ['urgent', 'high', 'normal', 'low']
const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 }

const DOMAIN_COLORS = {
  Spirit:  '#C4A962',
  Body:    '#7EA87E',
  Project: '#6B8CAE',
  Wealth:  '#C49A45',
  Family:  '#B8848A',
}

const SORT_OPTIONS = [
  { value: 'priority',      label: 'Priority' },
  { value: 'due_date',      label: 'Due date' },
  { value: 'schedule_date', label: 'Scheduled' },
  { value: 'created_at',    label: 'Created' },
]

function sortTasks(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2)
    }
    const av = a[sortBy] ?? '9999'
    const bv = b[sortBy] ?? '9999'
    return av < bv ? -1 : av > bv ? 1 : 0
  })
}

export default function AllTasksTab() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState('domain')  // 'domain' | 'project'
  const [sortBy, setSortBy] = useState('priority')
  const [filterDomains, setFilterDomains] = useState([])
  const [filterPriorities, setFilterPriorities] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const fetchTasks = useCallback(async () => {
    const [tasksRes, projectsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, projects!project_id(name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
      supabase
        .from('projects')
        .select('id, name, domain')
        .eq('status', 'active')
        .order('name'),
    ])
    if (tasksRes.data) setTasks(tasksRes.data)
    if (projectsRes.data) setProjects(projectsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  function handleComplete(task) {
    setTasks(ts => ts.filter(t => t.id !== task.id))
  }

  function handleUndo() {
    fetchTasks()
  }

  function handleSaved(saved, mode) {
    if (mode === 'create') {
      setTasks(ts => [saved, ...ts])
    } else if (mode === 'update') {
      setTasks(ts => ts.map(t => t.id === saved.id ? { ...t, ...saved } : t))
    }
  }

  function toggleFilter(arr, setArr, value) {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  const filtered = useMemo(() => {
    let result = tasks
    if (filterDomains.length > 0)     result = result.filter(t => filterDomains.includes(t.domain))
    if (filterPriorities.length > 0)  result = result.filter(t => filterPriorities.includes(t.priority))
    return sortTasks(result, sortBy)
  }, [tasks, filterDomains, filterPriorities, sortBy])

  const grouped = useMemo(() => {
    if (groupBy === 'domain') {
      const groups = {}
      for (const t of filtered) {
        if (!groups[t.domain]) groups[t.domain] = []
        groups[t.domain].push(t)
      }
      return DOMAINS
        .filter(d => groups[d]?.length > 0)
        .map(d => ({ key: d, label: d, tasks: groups[d], color: DOMAIN_COLORS[d] }))
    } else {
      const groups = { null: [] }
      for (const p of projects) groups[p.id] = []
      for (const t of filtered) {
        const key = t.project_id ?? null
        if (!groups[key]) groups[key] = []
        groups[key].push(t)
      }
      const result = projects
        .filter(p => groups[p.id]?.length > 0)
        .map(p => ({ key: p.id, label: p.name, tasks: groups[p.id], color: DOMAIN_COLORS[p.domain] }))
      if (groups[null]?.length > 0) {
        result.push({ key: 'none', label: 'No Project', tasks: groups[null], color: '#9A9187' })
      }
      return result
    }
  }, [filtered, groupBy, projects])

  const activeFilterCount = filterDomains.length + filterPriorities.length

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-header text-2xl text-ink">All Tasks</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">{filtered.length}</span>
          <Link to="/logbook" className="font-mono text-xs text-muted border border-border rounded-lg px-3 py-1.5" style={{ minHeight: 36, display: 'flex', alignItems: 'center' }}>
            Logbook
          </Link>
        </div>
      </div>

      {/* Controls row: group toggle + sort + filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Group toggle */}
        <div
          className="flex rounded-lg overflow-hidden border border-border"
          style={{ minHeight: 36 }}
        >
          {['domain', 'project'].map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className="px-3 py-1.5 font-mono text-xs capitalize transition-colors"
              style={{
                background: groupBy === g ? '#28343d' : 'transparent',
                color: groupBy === g ? '#E8E2D9' : '#9A9187',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="font-mono text-xs border border-border rounded-lg px-2 py-1.5 bg-transparent text-muted outline-none"
          style={{ minHeight: 36 }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="font-mono text-xs border border-border rounded-lg px-3 py-1.5 transition-colors"
          style={{
            minHeight: 36,
            background: activeFilterCount > 0 ? '#28343d' : 'transparent',
            color: activeFilterCount > 0 ? '#E8E2D9' : '#9A9187',
          }}
        >
          Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-5 p-3 rounded-xl border border-border space-y-3">
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Domain</p>
            <div className="flex gap-1.5 flex-wrap">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleFilter(filterDomains, setFilterDomains, d)}
                  className="px-2.5 py-1 rounded-full font-mono text-xs transition-all"
                  style={{
                    background: filterDomains.includes(d) ? DOMAIN_COLORS[d] + '33' : 'transparent',
                    border: `1px solid ${filterDomains.includes(d) ? DOMAIN_COLORS[d] : 'rgba(255,255,255,0.08)'}`,
                    color: filterDomains.includes(d) ? DOMAIN_COLORS[d] : '#9A9187',
                    minHeight: 32,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Priority</p>
            <div className="flex gap-1.5">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => toggleFilter(filterPriorities, setFilterPriorities, p)}
                  className="px-2.5 py-1 rounded-full font-mono text-xs capitalize transition-all"
                  style={{
                    background: filterPriorities.includes(p) ? '#28343d' : 'transparent',
                    border: `1px solid ${filterPriorities.includes(p) ? '#9A9187' : 'rgba(255,255,255,0.08)'}`,
                    color: filterPriorities.includes(p) ? '#E8E2D9' : '#9A9187',
                    minHeight: 32,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterDomains([]); setFilterPriorities([]) }}
              className="font-mono text-xs text-muted"
              style={{ minHeight: 32 }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading && <p className="font-task text-muted text-base">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p className="font-task text-muted text-base">
          {activeFilterCount > 0 ? 'No tasks match these filters.' : 'No open tasks.'}
        </p>
      )}

      {/* Grouped task list */}
      {grouped.map(group => (
        <div key={group.key} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: group.color }}
            >
              {group.label}
            </h2>
            <span className="font-mono text-xs text-muted">{group.tasks.length}</span>
          </div>
          {group.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              showDomain={groupBy !== 'domain'}
              onComplete={handleComplete}
              onUndo={handleUndo}
            />
          ))}
        </div>
      ))}

      <AddTaskFAB onSaved={handleSaved} />
    </div>
  )
}
