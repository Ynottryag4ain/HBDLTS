'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props { onBlown: () => void }

type Phase = 'intro' | 'countdown' | 'blow' | 'done'

export default function CountdownBlowMode({ onBlown }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [count, setCount] = useState(3)

  function start() {
    setPhase('countdown')
    setCount(3)
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('blow')
      setTimeout(() => { setPhase('done'); onBlown() }, 800)
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [phase, count, onBlown])

  return (
    <div className="glass rounded-3xl p-6 text-center">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-white font-semibold mb-4">หายใจเข้าลึกๆ แล้วพร้อมเป่า! 🌬️</p>
            <motion.button
              onClick={start}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl px-10 py-3 font-bold text-lg w-full shadow-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              พร้อมแล้ว! ✨
            </motion.button>
          </motion.div>
        )}

        {phase === 'countdown' && (
          <motion.div key={`count-${count}`} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="text-white/60 text-sm mb-2">นับถอยหลัง...</p>
            <div className="text-8xl font-display font-bold text-gradient">{count}</div>
          </motion.div>
        )}

        {phase === 'blow' && (
          <motion.div key="blow" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="text-4xl font-display font-bold text-white">💨 BLOW NOW!</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
