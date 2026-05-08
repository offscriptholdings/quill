import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import TaskRow from '../components/TaskRow'
import AddTaskFAB from '../components/AddTaskFAB'

const DOMAIN_ORDER = ['Spirit', 'Body', 'Project', 'Wealth', 'Family']
const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 }

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

export default function TodayTab() {
  const today = new Date().toISOString().split('T')[0]
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .schema('quill')
      .from('tasks')
      .select('*')
      .eq('schedule_date', today)
      .eq('status', 'open')
      .order('priority')
    if (data) setTasks(data)
    setLoading(false)
  }, [today])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  function handleComplete(task) {
    setTasks(ts => ts.filter(t => t.id !== task.id))
  }

  function handleUndo(task) {
    fetchTasks()
  }

  function handleSaved(saved, mode) {
    if (mode === 'create' && saved.schedule_date === today) {
      setTasks(ts => [...ts, saved])
    } else if (mode === 'update') {
      setTasks(ts => ts.map(t => t.id === saved.id ? saved : t))
    }
  }

  const groups = groupByDomain(tasks)
  const orderedDomains = DOMAIN_ORDER.filter(d => groups[d]?.length > 0)

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-header text-2xl text-ink mb-1">Today</h1>
      <p className="font-mono text-xs text-muted mb-6">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {loading && (
        <p className="font-task text-muted text-base">Loading…</p>
      )}

      {!loading && tasks.length === 0 && (
        <p className="font-task text-muted text-base">Nothing scheduled for today.</p>
      )}

      {orderedDomains.map(domain => (
        <div key={domain} className="mb-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-2">{domain}</h2>
          {groups[domain].map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onUndo={handleUndo}
            />
          ))}
        </div>
      ))}

      <AddTaskFAB defaultValues={{ schedule_date: today }} onSaved={handleSaved} />
    </div>
  )
}
