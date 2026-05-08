import { useModal } from '../context/ModalContext'

export default function AddTaskFAB({ defaultValues }) {
  const { openTaskModal } = useModal()

  return (
    <button
      onClick={() => openTaskModal(defaultValues ?? null)}
      className="fixed bottom-20 right-4 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
      style={{
        width: 52,
        height: 52,
        background: '#E8E2D9',
        color: '#0E0D0B',
        fontSize: 28,
        lineHeight: 1,
        zIndex: 40,
      }}
      aria-label="Add task"
    >
      +
    </button>
  )
}
