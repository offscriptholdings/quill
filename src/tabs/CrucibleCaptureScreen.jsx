import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useModal } from '../context/ModalContext'

const COLOR = {
  ink: '#1F1D18',
  ink2: '#5C5448',
  ink3: '#948A78',
  linen: '#F2EDE3',
  rubric: '#8E3A1A',
  gold: '#B8893A',
}

export default function CrucibleCaptureScreen() {
  const navigate = useNavigate()
  const { openTaskModal } = useModal()
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUntriaged = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .schema('quill')
      .from('inbox')
      .select('id, payload, source, received_at')
      .is('triaged_at', null)
      .order('received_at', { ascending: true })
    setItems(data ?? [])
    setIndex(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUntriaged()
  }, [fetchUntriaged])

  useEffect(() => {
    if (loading || items.length === 0) return
    if (index >= items.length) return
    const current = items[index]
    openTaskModal(
      {
        _crucible: {
          inbox_id: current.id,
          payload: current.payload,
          counter: { n: index + 1, total: items.length },
        },
        title: extractCapturedText(current.payload),
        source: 'crucible',
      },
      {
        onSaved: () => {
          setIndex((i) => i + 1)
        },
      }
    )
  }, [loading, items, index, openTaskModal])

  if (!loading && (items.length === 0 || index >= items.length)) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', minHeight: '60vh' }}>
        <div
          style={{
            fontFamily: 'Newsreader, serif',
            fontSize: 56,
            lineHeight: '0.6',
            color: COLOR.rubric,
            fontStyle: 'italic',
            marginBottom: 12,
          }}
        >
          &ldquo;
        </div>
        <div
          style={{
            fontFamily: 'Newsreader, serif',
            fontStyle: 'italic',
            fontSize: 22,
            color: COLOR.ink2,
            marginBottom: 18,
          }}
        >
          All clear.
        </div>
        <button
          onClick={() => navigate('/menu')}
          style={{
            background: 'none',
            border: 0,
            padding: '6px 0',
            cursor: 'pointer',
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11,
            fontWeight: 600,
            color: COLOR.ink3,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Back to menu
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'Newsreader, serif',
          fontStyle: 'italic',
          color: COLOR.ink3,
        }}
      >
        Loading inbox…
      </div>
    </div>
  )
}

function extractCapturedText(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return payload.text ?? payload.title ?? payload.content ?? ''
}
