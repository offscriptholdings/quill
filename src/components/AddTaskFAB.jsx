import { useModal } from '../context/ModalContext'
import Icon from './Icon'

export default function AddTaskFAB({ defaultValues, onSaved }) {
  const { openTaskModal } = useModal()

  return (
    <button
      onClick={() => openTaskModal(defaultValues ?? null, { onSaved })}
      className="safe-bottom"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 'calc(56px + 24px + env(safe-area-inset-bottom))',
        width: 52,
        height: 52,
        borderRadius: 26,
        background: '#1F1D18',
        color: '#F2EDE3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(31,29,24,0.25), 0 1px 2px rgba(31,29,24,0.18)',
        zIndex: 30,
        transition: 'transform 100ms ease',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)' }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      aria-label="Add task"
    >
      <Icon name="plus" size={22} sw={1.6} />
    </button>
  )
}
