import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DOMAIN_VALUES as DOMAIN_ORDER, DOMAIN_DISPLAY_LABEL } from '../lib/domains'
import TaskRow from '../components/TaskRow'
import AddTaskFAB from '../components/AddTaskFAB'

function groupByDomain(tasks) {
  const groups = {}
  for (const t of tasks) {
    if (!groups[t.domain]) groups[t.domain] = []
    groups[t.domain].push(t)
  }
  for (const d of Object.keys(groups)) {
    groups[d].sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1))
  }
  return groups
}

export default function TodayTab() {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [tasks, setTasks] = useState([])
  const [completedToday, setCompletedToday] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)

  const fetchTasks = useCallback(async () => {
    const [openRes, doneRes] = await Promise.all([
      supabase
        .schema('quill')
        .from('tasks')
        .select('*, projects!project_id(name)')
        .eq('schedule_date', today)
        .eq('status', 'open')
        .order('priority', { ascending: false }),
      supabase
        .schema('quill')
        .from('tasks')
        .select('*, projects!project_id(name)')
        .eq('schedule_date', today)
        .eq('status', 'done')
        .gte('completed_at', today)
        .lt('completed_at', tomorrow)
        .order('completed_at', { ascending: false }),
    ])
    if (openRes.data) setTasks(openRes.data)
    if (doneRes.data) setCompletedToday(doneRes.data)
    setLoading(false)
  }, [today, tomorrow])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  function handleComplete(task) {
    setTasks(ts => ts.filter(t => t.id !== task.id))
    setCompletedToday(ts => [{ ...task, status: 'done', completed_at: new Date().toISOString() }, ...ts])
  }

  function handleUndo(task) {
    setCompletedToday(ts => ts.filter(t => t.id !== task.id))
    fetchTasks()
  }

  function handleSaved(saved, mode) {
    if (mode === 'create' && saved.schedule_date === today) {
      setTasks(ts => [...ts, saved])
    } else if (mode === 'update') {
      setTasks(ts => ts.map(t => t.id === saved.id ? { ...t, ...saved } : t))
    }
  }

  const groups = groupByDomain(tasks)
  const orderedDomains = DOMAIN_ORDER.filter(d => groups[d]?.length > 0)
  const openCount = tasks.length
  const doneCount = completedToday.length
  const totalCount = openCount + doneCount

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-header text-2xl text-ink">Today</h1>
        {totalCount > 0 && (
          <span className="font-mono text-xs text-muted mt-1.5">
            {doneCount}/{totalCount}
          </span>
        )}
      </div>
      <p className="font-mono text-xs text-muted mb-6">{dateLabel}</p>

      {loading && (
        <p className="font-task text-muted text-base">Loading…</p>
      )}

      {!loading && totalCount === 0 && (
        <p className="font-task text-muted text-base">Nothing scheduled for today.</p>
      )}

      {/* Open tasks grouped by domain */}
      {orderedDomains.map(domain => (
        <div key={domain} className="mb-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-1">{DOMAIN_DISPLAY_LABEL[domain] ?? domain}</h2>
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

      {/* Completed today (collapsible) */}
      {doneCount > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest w-full text-left py-2"
            style={{ minHeight: 44 }}
          >
            <span>{showCompleted ? '▾' : '▸'}</span>
            <span>Completed ({doneCount})</span>
          </button>
          {showCompleted && (
            <div className="mt-1">
              {completedToday.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  showDomain={false}
                  completed={true}
                  onUndo={handleUndo}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AddTaskFAB defaultValues={{ schedule_date: today }} onSaved={handleSaved} />
    </div>
  )
}
