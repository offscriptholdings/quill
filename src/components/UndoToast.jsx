import { useToast } from '../context/ToastContext'

export default function UndoToast() {
  const { toast, dismissToast } = useToast()

  if (!toast) return null

  function handleUndo() {
    toast.onUndo?.()
    dismissToast()
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: '#28343d', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <span className="font-mono text-sm text-ink">{toast.message}</span>
      {toast.onUndo && (
        <button
          onClick={handleUndo}
          className="font-mono text-sm ml-4 px-3 py-1 rounded-lg"
          style={{ color: '#e36a2c', minHeight: 36, minWidth: 52 }}
        >
          Undo
        </button>
      )}
    </div>
  )
}
