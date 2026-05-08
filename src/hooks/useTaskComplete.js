import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

export function useTaskComplete() {
  const { showToast } = useToast()

  async function completeTask(task, { onOptimistic, onRevert, onUndo } = {}) {
    onOptimistic?.()

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      onRevert?.()
      return
    }

    fetch('https://n8n.crucibleos.io/webhook/refresh-brief', { method: 'POST' })

    showToast({
      message: 'Completed',
      onUndo: async () => {
        await supabase
          .from('tasks')
          .update({ status: 'open', completed_at: null })
          .eq('id', task.id)
        onUndo?.()
      },
    })
  }

  return { completeTask }
}
