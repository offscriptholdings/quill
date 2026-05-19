import { useToast } from '../context/ToastContext'

const COLOR = {
  ink:    '#1F1D18',
  paper:  '#FAF6EC',
  rule:   '#D9CFB8',
  rubric: '#8E3A1A',
}

export default function UndoToast() {
  const { toast, dismissToast } = useToast()

  if (!toast) return null

  function handleUndo() {
    toast.onUndo?.()
    dismissToast()
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `calc(72px + env(safe-area-inset-bottom))`,
        left: 16,
        right: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: COLOR.paper,
        border: `0.5px solid ${COLOR.rule}`,
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(31,29,24,0.10)',
      }}
    >
      <span style={{
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 13,
        color: COLOR.ink,
        lineHeight: 1.3,
        flex: 1,
        minWidth: 0,
      }}>
        {toast.message}
      </span>
      {toast.onUndo && (
        <button
          onClick={handleUndo}
          style={{
            background: 'none',
            border: 0,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 11,
            fontWeight: 600,
            color: COLOR.rubric,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            minHeight: 36,
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}
