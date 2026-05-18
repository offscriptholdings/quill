import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DOMAINS } from '../lib/domains'
import { localTodayIso } from '../lib/date'
import DomainBadge from '../components/DomainBadge'
import SectionHeader from '../components/SectionHeader'
import FilterChip from '../components/FilterChip'
import TaskRow from '../components/TaskRow'
import AddTaskFAB from '../components/AddTaskFAB'
import Icon from '../components/Icon'
import SkeletonTaskRow from '../components/SkeletonTaskRow'
import InlineError from '../components/InlineError'
import { useModal } from '../context/ModalContext'

const COLOR = { ink: '#1F1D18', ink2: '#5C5448', ink3: '#948A78', paper: '#FAF6EC', rule: '#D9CFB8' }

const inscribePillStyle = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', borderRadius: 15,
  background: 'transparent', boxShadow: 'inset 0 0 0 1px #8E3A1A',
  color: '#8E3A1A',
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13, fontWeight: 600,
  border: 0, cursor: 'pointer',
}

export default function DomainScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const d = DOMAINS[slug]

  const [tasks, setTasks] = useState([])
  const [readyIds, setReadyIds] = useState(new Set())
  const [blockedIds, setBlockedIds] = useState(new Set())
  const [todayIds, setTodayIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('open')
  const { openTaskModal } = useModal()

  const fetchData = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const todayIso = localTodayIso()
      const [tRes, rRes, bRes, todRes] = await Promise.all([
        supabase.schema('quill').from('tasks').select('*, projects!project_id(name)').eq('domain', slug),
        supabase.schema('quill').from('tasks_ready').select('id').eq('domain', slug),
        supabase.schema('quill').from('tasks_blocked').select('id').eq('domain', slug),
        supabase.schema('quill').from('tasks').select('id')
          .eq('status', 'open')
          .eq('domain', slug)
          .or(`schedule_date.eq.${todayIso},and(due_date.not.is.null,due_date.lte.${todayIso})`),
      ])
      if (tRes.error) throw tRes.error
      if (rRes.error) throw rRes.error
      if (bRes.error) throw bRes.error
      if (todRes.error) throw todRes.error
      setTasks(tRes.data ?? [])
      setReadyIds(new Set((rRes.data ?? []).map((r) => r.id)))
      setBlockedIds(new Set((bRes.data ?? []).map((r) => r.id)))
      setTodayIds(new Set((todRes.data ?? []).map((r) => r.id)))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!DOMAINS[slug]) navigate('/today')
  }, [slug, navigate])

  if (!d) return null

  const openTasks = tasks.filter((t) => t.status === 'open')
  const counts = {
    open: openTasks.length,
    ready: openTasks.filter((t) => readyIds.has(t.id)).length,
    blocked: openTasks.filter((t) => blockedIds.has(t.id)).length,
    today: openTasks.filter((t) => todayIds.has(t.id)).length,
  }

  let visible = openTasks
  if (filter === 'ready') visible = openTasks.filter((t) => readyIds.has(t.id))
  if (filter === 'today') visible = openTasks.filter((t) => todayIds.has(t.id))
  if (filter === 'all') visible = tasks

  const groups = {}
  for (const t of visible) {
    const key = t.project_id || '__none__'
    if (!groups[key]) groups[key] = { name: t.projects?.name ?? 'No project', tasks: [] }
    groups[key].tasks.push(t)
  }
  const projectCount = new Set(openTasks.map((t) => t.project_id).filter(Boolean)).size

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '12px 16px 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11, color: COLOR.ink3, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          <Icon name="chevron-l" size={12} sw={1.6} /> Domains
        </button>
      </div>

      <div style={{
        background: d.tint, padding: '12px 16px 16px', margin: '8px 0 0',
        borderTop: `0.5px solid ${d.edge}`,
        borderBottom: `0.5px solid ${d.edge}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DomainBadge domain={slug} size={28} />
          <span style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 10, color: d.color, fontWeight: 600,
            letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.85,
          }}>Domain · {d.note}</span>
        </div>
        <h1 style={{
          fontFamily: 'Newsreader, serif', fontSize: 36, lineHeight: '40px',
          color: d.color, fontWeight: 500, margin: '8px 0 6px',
          letterSpacing: '-0.4px',
        }}>{d.label}</h1>
        <div style={{
          display: 'flex', gap: 14,
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 11, color: d.color, opacity: 0.85,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span><b style={{ fontWeight: 600 }}>{counts.open}</b> open</span>
          <span><b style={{ fontWeight: 600 }}>{counts.ready}</b> ready</span>
          <span><b style={{ fontWeight: 600 }}>{counts.today}</b> today</span>
          <span style={{ flex: 1 }} />
          <span style={{ opacity: 0.6 }}>{projectCount} project{projectCount === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        <FilterChip active={filter === 'open'} onPress={() => setFilter('open')}>Open</FilterChip>
        <FilterChip active={filter === 'ready'} onPress={() => setFilter('ready')}>Ready</FilterChip>
        <FilterChip active={filter === 'today'} onPress={() => setFilter('today')}>Today</FilterChip>
        <FilterChip active={filter === 'all'} onPress={() => setFilter('all')}>All</FilterChip>
      </div>

      {loading && (
        <div style={{
          background: COLOR.paper, margin: '0 16px', borderRadius: 3,
          boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}`,
        }}>
          {[0, 1, 2, 3].map((i) => <SkeletonTaskRow key={i} noRule={i === 3} />)}
        </div>
      )}
      {error && !loading && (
        <InlineError onRetry={fetchData}>Failed to load domain tasks.</InlineError>
      )}
      {!loading && !error && visible.length === 0 && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Newsreader, serif', fontSize: 18, lineHeight: '24px',
            color: COLOR.ink2, fontStyle: 'italic', marginBottom: 14,
          }}>
            No open lines in {d.label}.
          </div>
          <button onClick={() => openTaskModal({ domain: slug }, { onSaved: fetchData })} style={inscribePillStyle}>
            Inscribe
          </button>
        </div>
      )}

      {Object.entries(groups).map(([projectId, { name, tasks: groupTasks }]) => (
        <div key={projectId} style={{ marginBottom: 12 }}>
          <SectionHeader label={name} count={groupTasks.length} />
          <div style={{ background: COLOR.paper, margin: '0 16px', borderRadius: 3, boxShadow: `inset 0 0 0 0.5px ${COLOR.rule}` }}>
            {groupTasks.map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                showDomain={false}
                noRule={i === groupTasks.length - 1}
                onComplete={fetchData}
                onUndo={fetchData}
              />
            ))}
          </div>
        </div>
      ))}

      <AddTaskFAB defaultValues={{ domain: slug }} onSaved={fetchData} />
    </div>
  )
}
