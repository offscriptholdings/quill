import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback(({ message, onUndo }) => {
    clearTimeout(timerRef.current)
    setToast({ message, onUndo })
    timerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const dismissToast = useCallback(() => {
    clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
