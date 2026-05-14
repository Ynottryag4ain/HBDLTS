'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

// ✏️ Change this to your girlfriend's birthday DDMMYY
const CORRECT_CODE = '140550'

const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']

function Digit({ char, filled }: { char: string; filled: boolean }) {
  return (
    <motion.div
      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-colors
        ${filled ? 'border-pink-400 bg-pink-400 text-white shadow-[0_0_12px_rgba(255,107,157,0.6)]' : 'border-white/40 bg-white/10 text-white/30'}`}
      animate={filled ? { scale: [1, 1.25, 1] } : {}}
      transition={{ duration: 0.18 }}
    >
      {filled ? '●' : '○'}
    </motion.div>
  )
}

export default function LockScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const [code, setCode] = useState('')
  const [shake, setShake] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const handleKey = useCallback((k: string) => {
    if (success) return
    if (k === '⌫') {
      setCode(c => c.slice(0, -1))
      setErrorMsg('')
      return
    }
    if (k === '✓') {
      if (code === CORRECT_CODE) {
        setSuccess(true)
        setTimeout(() => setScreen('cards'), 1200)
      } else {
        setShake(true)
        setErrorMsg('Wrong codeee 🥺')
        setCode('')
        setTimeout(() => setShake(false), 600)
      }
      return
    }
    if (code.length >= 6) return
    const next = code + k
    setCode(next)
    setErrorMsg('')
    if (next.length === 6) {
      setTimeout(() => {
        if (next === CORRECT_CODE) {
          setSuccess(true)
          setTimeout(() => setScreen('cards'), 1200)
        } else {
          setShake(true)
          setErrorMsg('Wrong codeee 🥺')
          setCode('')
          setTimeout(() => setShake(false), 600)
        }
      }, 200)
    }
  }, [code, success, setScreen])

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-3"
          >
            🎂
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-white drop-shadow-lg mb-1">
            Happy Birthday
          </h1>
          <p className="text-white/70 text-sm">Enter your special code</p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          animate-shake={shake ? 'true' : undefined}
        >
          <motion.div
            className="glass rounded-3xl p-7 shadow-2xl"
            animate={shake ? {
              x: [-10, 10, -8, 8, -5, 5, 0],
              transition: { duration: 0.5 }
            } : {}}
          >
            {/* Dot indicators */}
            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Digit key={i} char={code[i] || ''} filled={i < code.length} />
              ))}
            </div>

            {/* Hint */}
            <p className="text-center text-white/50 text-xs mb-5 tracking-widest uppercase">
              Format: DDMMYY
            </p>

            {/* Error message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-pink-300 text-sm font-semibold mb-3"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {success && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-emerald-300 text-base font-bold mb-3"
                >
                  ✅ Welcome! 🎉
                </motion.p>
              )}
            </AnimatePresence>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {KEYS.map((k) => (
                <motion.button
                  key={k}
                  onClick={() => handleKey(k)}
                  className={`rounded-2xl h-14 text-xl font-bold transition-colors
                    ${k === '✓' ? 'bg-pink-400/80 text-white shadow-[0_0_16px_rgba(255,107,157,0.4)]' :
                      k === '⌫' ? 'bg-white/10 text-white/70' :
                      'bg-white/15 text-white hover:bg-white/25'}`}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {k}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/30 text-xs mt-6"
        >
          This message was made with 💖
        </motion.p>
      </div>
    </div>
  )
}
