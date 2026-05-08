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
      style={{ background: '#2A2824', border: '1px solid #3A3834' }}
    >
      <span className="font-mono text-sm text-ink">{toast.message}</span>
      {toast.onUndo && (
        <button
          onClick={handleUndo}
          className="font-mono text-sm ml-4 px-3 py-1 rounded-lg"
          style={{ color: '#C4A962', minHeight: 36, minWidth: 52 }}
        >
          Undo
        </button>
      )}
    </div>
  )
}
