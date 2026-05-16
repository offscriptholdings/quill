import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useModal } from '../context/ModalContext'
import { parseInput } from '../lib/parser'
import Icon from './Icon'
import DomainChip from './DomainChip'

const COLOR = {
  ink: '#1F1D18',
  ink2: '#5C5448',
  ink3: '#948A78',
  linen: '#F2EDE3',
  paper: '#FAF6EC',
  rule: '#D9CFB8',
  ruleSoft: '#E5DCC6',
  rubric: '#8E3A1A',
  gold: '#B8893A',
}
const SCRIM = 'rgba(31,29,24,0.32)'

export default function CaptureSheet() {
  const { modalState, closeTaskModal } = useModal()
  const open = modalState.open
  const editing = !!modalState.task?.id
  const defaults = modalState.task ?? {}
  const isCrucible = !!modalState.task?._crucible
  const crucibleData = modalState.task?._crucible

  const [title, setTitle] = useState('')
  const [parseResult, setParseResult] = useState({ cleanedTitle: '', tokens: [], resolved: {} })
  const [projectId, setProjectId] = useState(null)
  const [projectName, setProjectName] = useState(null)
  const [domain, setDomain] = useState('spirit')
  const [priority, setPriority] = useState(1)
  const [scheduleDate, setScheduleDate] = useState(null)
  const [scheduledTime, setScheduledTime] = useState(null)
  const [waitsOn, setWaitsOn] = useState(null)
  const [recents, setRecents] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [allProjects, setAllProjects] = useState([])
  const [openTasks, setOpenTasks] = useState([])

  const sheetRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const t = modalState.task ?? {}
    setTitle(t.title ?? '')
    setProjectId(t.project_id ?? null)
    setProjectName(t.projects?.name ?? null)
    setDomain(t.domain ?? defaults.domain ?? 'spirit')
    setPriority(t.priority ?? 1)
    setScheduleDate(t.schedule_date ?? defaults.schedule_date ?? null)
    setScheduledTime(null)
    setWaitsOn(null)
    setSubmitting(false)
    setParseResult({ cleanedTitle: '', tokens: [], resolved: {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modalState.task])

  useEffect(() => {
    if (!open) return
    ;(async () => {
      const [recRes, projRes, openRes] = await Promise.all([
        supabase
          .schema('quill')
          .from('tasks')
          .select('id, title')
          .eq('status', 'done')
          .order('completed_at', { ascending: false })
          .limit(3),
        supabase.schema('quill').from('projects').select('id, name, domain').eq('status', 'active'),
        supabase.schema('quill').from('tasks').select('id, title').eq('status', 'open').limit(50),
      ])
      setRecents(recRes.data ?? [])
      setAllProjects(projRes.data ?? [])
      setOpenTasks(openRes.data ?? [])
    })()
  }, [open])

  useEffect(() => {
    const r = parseInput(title)
    setParseResult(r)
    if (r.resolved.domain) setDomain(r.resolved.domain)
    if (r.resolved.priority) setPriority(r.resolved.priority)
    if (r.resolved.scheduled) setScheduleDate(r.resolved.scheduled)
    if (r.resolved.scheduledTime) setScheduledTime(r.resolved.scheduledTime)
    if (r.resolved.projectQuery) {
      const hit = fuzzyFind(allProjects, r.resolved.projectQuery, (p) => p.name)
      if (hit) {
        setProjectId(hit.id)
        setProjectName(hit.name)
        if (hit.domain) setDomain(hit.domain)
      }
    }
    if (r.resolved.waitsOnQuery) {
      const hit = fuzzyFind(openTasks, r.resolved.waitsOnQuery, (t) => t.title)
      if (hit) setWaitsOn(hit)
    }
  }, [title, allProjects, openTasks])

  const handleSubmit = useCallback(async () => {
    const finalTitle = (parseResult.cleanedTitle || title).trim()
    if (!finalTitle) return
    if (isCrucible && (!domain || !scheduleDate)) return
    setSubmitting(true)
    const payload = {
      title: finalTitle,
      domain,
      priority,
      schedule_date: scheduleDate,
      scheduled:
        scheduleDate && scheduledTime
          ? new Date(`${scheduleDate}T${scheduledTime}:00`).toISOString()
          : null,
      project_id: projectId,
      source: isCrucible ? 'crucible' : 'manual',
      status: 'open',
    }
    let savedRow
    if (editing) {
      const { data } = await supabase
        .schema('quill')
        .from('tasks')
        .update(payload)
        .eq('id', modalState.task.id)
        .select()
        .single()
      savedRow = data
    } else {
      const { data } = await supabase
        .schema('quill')
        .from('tasks')
        .insert(payload)
        .select()
        .single()
      savedRow = data
    }
    if (waitsOn && savedRow && !editing) {
      await supabase.schema('quill').from('dependencies').insert({
        task_id: savedRow.id,
        depends_on_task_id: waitsOn.id,
      })
    }
    if (isCrucible && savedRow) {
      await supabase
        .schema('quill')
        .from('inbox')
        .update({
          triaged_at: new Date().toISOString(),
          task_id: savedRow.id,
        })
        .eq('id', crucibleData.inbox_id)
    }
    modalState.onSaved?.(savedRow, editing ? 'update' : 'create')
    closeTaskModal()
  }, [
    title,
    parseResult,
    domain,
    priority,
    scheduleDate,
    scheduledTime,
    projectId,
    waitsOn,
    editing,
    isCrucible,
    crucibleData,
    modalState,
    closeTaskModal,
  ])

  const handleSkip = useCallback(async () => {
    if (!isCrucible || !crucibleData) return
    setSubmitting(true)
    await supabase
      .schema('quill')
      .from('inbox')
      .update({
        triaged_at: new Date().toISOString(),
        task_id: null,
      })
      .eq('id', crucibleData.inbox_id)
    modalState.onSaved?.(null, 'skip')
    closeTaskModal()
  }, [isCrucible, crucibleData, modalState, closeTaskModal])

  if (!open) return null

  return (
    <>
      <div
        onClick={closeTaskModal}
        style={{
          position: 'fixed',
          inset: 0,
          background: SCRIM,
          zIndex: 50,
          animation: 'fadeIn 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      />
      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 51,
          background: COLOR.linen,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          boxShadow: '0 -8px 32px rgba(31,29,24,0.18), 0 -1px 0 rgba(0,0,0,0.04)',
          padding: '8px 16px calc(24px + env(safe-area-inset-bottom))',
          animation: 'slideUp 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: COLOR.rule }} />
        </div>
        {isCrucible && (
          <>
            <div
              style={{
                margin: '-8px -16px 12px',
                padding: '10px 16px',
                background: COLOR.gold,
                color: COLOR.linen,
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>FROM CRUCIBLE</span>
              <span style={{ flex: 1 }} />
              {crucibleData?.counter && (
                <span style={{ opacity: 0.8 }}>
                  {crucibleData.counter.n} OF {crucibleData.counter.total}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'Newsreader, serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: COLOR.ink2,
                borderLeft: '2px solid ' + COLOR.rubric,
                paddingLeft: 10,
                margin: '0 0 14px',
              }}
            >
              {extractCapturedText(crucibleData?.payload)}
            </div>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <span
            style={{
              fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              fontSize: 12,
              fontWeight: 600,
              color: COLOR.ink3,
              letterSpacing: '0.08em',
            }}
          >
            {isCrucible ? 'TRIAGE' : editing ? 'EDIT' : 'CAPTURE'}
          </span>
          <span style={{ flex: 1 }} />
          {isCrucible ? (
            <button onClick={handleSkip} disabled={submitting} style={btnTextStyle(COLOR.ink3)}>
              Skip
            </button>
          ) : (
            <button onClick={closeTaskModal} style={btnTextStyle(COLOR.ink3)}>
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !title.trim() ||
              (isCrucible && (!domain || !scheduleDate))
            }
            style={{
              ...btnPillStyle(COLOR.ink, COLOR.linen),
              opacity:
                submitting ||
                !title.trim() ||
                (isCrucible && (!domain || !scheduleDate))
                  ? 0.5
                  : 1,
            }}
          >
            {editing ? 'Save' : 'Inscribe'}
          </button>
        </div>
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's next?"
          style={{
            width: '100%',
            minHeight: 80,
            background: 'transparent',
            border: 0,
            outline: 'none',
            resize: 'none',
            fontFamily: 'Newsreader, serif',
            fontSize: 20,
            lineHeight: '28px',
            color: COLOR.ink,
            fontStyle: title ? 'normal' : 'italic',
          }}
        />
        {(projectName || domain || scheduleDate || priority > 0 || waitsOn) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
            {projectName && (
              <Chip
                onClear={() => {
                  setProjectId(null)
                  setProjectName(null)
                }}
              >
                @{projectName}
              </Chip>
            )}
            <DomainChip domain={domain} onPress={() => {}} />
            {scheduleDate && (
              <Chip
                onClear={() => {
                  setScheduleDate(null)
                  setScheduledTime(null)
                }}
              >
                {scheduleDate}
                {scheduledTime ? ' ' + scheduledTime : ''}
              </Chip>
            )}
            {priority > 0 && (
              <Chip onClear={() => setPriority(0)}>{'!'.repeat(priority)}</Chip>
            )}
            {waitsOn && (
              <Chip onClear={() => setWaitsOn(null)}>^{waitsOn.title.slice(0, 24)}</Chip>
            )}
          </div>
        )}
        {!title && (
          <div style={{ padding: '10px 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <HintChip>@project</HintChip>
            <HintChip>#domain</HintChip>
            <HintChip>today</HintChip>
            <HintChip>!!</HintChip>
            <HintChip>^waits-on</HintChip>
          </div>
        )}
        {!title && !editing && recents.length > 0 && (
          <div style={{ padding: '8px 0 0' }}>
            <div
              style={{
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 10,
                fontWeight: 600,
                color: COLOR.ink3,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Recents
            </div>
            {recents.map((r) => (
              <div
                key={r.id}
                style={{
                  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                  fontSize: 10,
                  color: COLOR.ink3,
                  padding: '2px 0',
                }}
              >
                {r.title}
              </div>
            ))}
          </div>
        )}
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        `}</style>
      </div>
    </>
  )
}

function Chip({ children, onClear }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        height: 26,
        borderRadius: 15,
        background: '#FAF6EC',
        boxShadow: 'inset 0 0 0 0.5px #D9CFB8',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 12,
        color: '#1F1D18',
      }}
    >
      {children}
      <button
        onClick={onClear}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          color: '#948A78',
          cursor: 'pointer',
          display: 'inline-flex',
        }}
      >
        <Icon name="x" size={10} sw={1.6} />
      </button>
    </span>
  )
}

function HintChip({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 12,
        background: 'transparent',
        boxShadow: 'inset 0 0 0 0.5px #E5DCC6',
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: 10,
        color: '#948A78',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  )
}

function btnTextStyle(color) {
  return {
    background: 'none',
    border: 0,
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 14,
    color,
  }
}
function btnPillStyle(bg, fg) {
  return {
    background: bg,
    color: fg,
    border: 0,
    borderRadius: 15,
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 13,
    fontWeight: 600,
  }
}

function fuzzyFind(items, query, getStr) {
  if (!query) return null
  const q = query.toLowerCase()
  const prefix = items.find((it) => getStr(it)?.toLowerCase().startsWith(q))
  if (prefix) return prefix
  return items.find((it) => getStr(it)?.toLowerCase().includes(q)) ?? null
}

function extractCapturedText(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return payload.text ?? payload.title ?? payload.content ?? JSON.stringify(payload)
}
