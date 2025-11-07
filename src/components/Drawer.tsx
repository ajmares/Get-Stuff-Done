import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AccentColor } from '@/lib/state'
import { useEffect } from 'react'

interface DrawerProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  accentColor: AccentColor
}

const accentClasses = {
  indigo: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/40',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/40',
  },
}

export default function Drawer({ title, children, onClose, accentColor }: DrawerProps) {
  const accent = accentClasses[accentColor]

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-neutral-900 shadow-2xl"
        >
          <div className="flex h-full flex-col">
            <div className={`flex items-center justify-between border-b ${accent.border} px-6 py-4`}>
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 transition-all hover:bg-neutral-800 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

