import { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({ open: false, task: null })

  const openTaskModal = useCallback((task = null) => {
    setModalState({ open: true, task })
  }, [])

  const closeTaskModal = useCallback(() => {
    setModalState({ open: false, task: null })
  }, [])

  return (
    <ModalContext.Provider value={{ modalState, openTaskModal, closeTaskModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
