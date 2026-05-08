import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import TaskRow from '../components/TaskRow'
import AddTaskFAB from '../components/AddTaskFAB'

const DOMAIN_ORDER = ['Spirit', 'Body', 'Project', 'Wealth', 'Family']
const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 }

function addDays(date, n) {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function dayLabel(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDomain(tasks) {
  const groups = {}
  for (const t of tasks) {
    if (!groups[t.domain]) groups[t.domain] = []
    groups[t.domain].push(t)
  }
  for (const d of Object.keys(groups)) {
    groups[d].sort((a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2))
  }
  return groups
}

export default function ThisWeekTab() {
  const today = new Date().toISOString().split('T')[0]
  const endDate = addDays(today, 7)

  const [tasksByDate, setTasksByDate] = useState({})
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const [weekRes, overdueRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, projects!project_id(name)')
        .gte('schedule_date', today)
        .lt('schedule_date', endDate)
        .eq('status', 'open')
        .order('schedule_date')
        .order('priority'),
      supabase
        .from('tasks')
        .select('*, projects!project_id(name)')
        .lt('schedule_date', today)
        .eq('status', 'open')
        .order('schedule_date')
        .order('priority'),
    ])

    if (weekRes.data) {
      const byDate = {}
      for (const t of weekRes.data) {
        if (!byDate[t.schedule_date]) byDate[t.schedule_date] = []
        byDate[t.schedule_date].push(t)
      }
      setTasksByDate(byDate)
    }
    if (overdueRes.data) setOverdue(overdueRes.data)
    setLoading(false)
  }, [today, endDate])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  function removeTask(id) {
    setTasksByDate(prev => {
      const next = { ...prev }
      for (const date of Object.keys(next)) {
        next[date] = next[date].filter(t => t.id !== id)
        if (next[date].length === 0) delete next[date]
      }
      return next
    })
    setOverdue(ts => ts.filter(t => t.id !== id))
  }

  function handleComplete(task) {
    removeTask(task.id)
  }

  function handleUndo() {
    fetchTasks()
  }

  // Build the 7-day list with only days that have tasks
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i)
    if (tasksByDate[date]?.length > 0) {
      days.push({ date, tasks: tasksByDate[date] })
    }
  }

  const overdueGroups = groupByDomain(overdue)
  const overdueOrderedDomains = DOMAIN_ORDER.filter(d => overdueGroups[d]?.length > 0)

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-header text-2xl text-ink mb-6">This Week</h1>

      {loading && <p className="font-task text-muted text-base">Loading…</p>}

      {/* Overdue section */}
      {overdue.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: '#B8848A' }}>
              Overdue
            </h2>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#B8848A' }}
            />
          </div>
          {overdueOrderedDomains.map(domain => (
            <div key={domain} className="mb-3">
              <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">{domain}</p>
              {overdueGroups[domain].map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  showDomain={false}
                  onComplete={handleComplete}
                  onUndo={handleUndo}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 7-day sections — only days with tasks */}
      {days.map(({ date, tasks }) => {
        const groups = groupByDomain(tasks)
        const orderedDomains = DOMAIN_ORDER.filter(d => groups[d]?.length > 0)
        return (
          <div key={date} className="mb-8">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
              {dayLabel(date)}
            </h2>
            {orderedDomains.map(domain => (
              <div key={domain} className="mb-3">
                <p className="font-mono text-xs text-muted tracking-wide mb-1 pl-0.5">{domain}</p>
                {groups[domain].map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    showDomain={false}
                    onComplete={handleComplete}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            ))}
          </div>
        )
      })}

      {!loading && days.length === 0 && overdue.length === 0 && (
        <p className="font-task text-muted text-base">No tasks scheduled this week.</p>
      )}

      <AddTaskFAB />
    </div>
  )
}
