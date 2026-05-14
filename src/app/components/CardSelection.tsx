'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useAppStore } from '../store/appStore'

export default function CardSelection() {
  const { setScreen, cakeBlown } = useAppStore()
  const [runMsg, setRunMsg] = useState(false)
  const [runCount, setRunCount] = useState(0)

  // Photobooth card "runs away"
  const pbX = useMotionValue(0)
  const pbY = useMotionValue(0)
  const springX = useSpring(pbX, { stiffness: 300, damping: 20 })
  const springY = useSpring(pbY, { stiffness: 300, damping: 20 })

  const containerRef = useRef<HTMLDivElement>(null)

  function handlePhotoboothHover(e: React.MouseEvent | React.TouchEvent) {
    if (cakeBlown) return
    const card = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const container = containerRef.current?.getBoundingClientRect()
    if (!container) return

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    const dx = clientX - (card.left + card.width / 2)
    const dy = clientY - (card.top + card.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const force = Math.max(0, 130 - dist) * 1.8

    const nx = (dx / dist) * -force
    const ny = (dy / dist) * -force

    // Clamp within container
    const maxX = (container.width / 2) - card.width / 2 - 10
    const maxY = (container.height / 2) - card.height / 2 - 10
    pbX.set(Math.max(-maxX, Math.min(maxX, (pbX.get() + nx) * 0.6)))
    pbY.set(Math.max(-maxY, Math.min(maxY, (pbY.get() + ny) * 0.6)))
  }

  function handlePhotoboothClick() {
    if (cakeBlown) { setScreen('photobooth'); return }
    setRunMsg(true)
    setRunCount(c => c + 1)
    pbX.set((Math.random() - 0.5) * 200)
    pbY.set((Math.random() - 0.5) * 140)
    setTimeout(() => setRunMsg(false), 2200)
  }

  const funnyMessages = [
    'กรุณาเป่าเค้กก่อน 🎂',
    'ยังไม่ได้นะ!! เป่าเค้กซะก่อน~ 🎂',
    'โกงไม่ได้จ้า 😝 เป่าเค้กก่อน!',
    'เร็วๆ นี้น้า~ เป่าเค้กก่อนนะ 💕',
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4" ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg mb-2">
          What would you like? ✨
        </h2>
        <p className="text-white/60 text-sm">Choose your adventure</p>
      </motion.div>

      <div className="flex gap-5 md:gap-10 items-center justify-center w-full max-w-lg relative">
        {/* Cake Card */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setScreen('cake')}
          className="glass rounded-3xl p-6 w-40 md:w-52 cursor-pointer text-center shadow-2xl"
          whileHover={{ scale: 1.06, rotate: -1, y: -6 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl md:text-7xl mb-4"
          >
            🎂
          </motion.div>
          <h3 className="font-display font-bold text-white text-lg md:text-xl mb-1">Cake</h3>
          <p className="text-white/60 text-xs">เป่าเทียน~</p>
          <div className="mt-3 inline-block bg-pink-400/40 text-pink-100 text-xs px-3 py-1 rounded-full">
            Ready! ✨
          </div>
        </motion.div>

        {/* Photobooth Card — runs away */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ x: springX, y: springY }}
          onMouseMove={handlePhotoboothHover}
          onTouchMove={handlePhotoboothClick}
          onClick={handlePhotoboothClick}
          className={`glass rounded-3xl p-6 w-40 md:w-52 text-center shadow-2xl
            ${cakeBlown ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          whileHover={cakeBlown ? { scale: 1.06, rotate: 1, y: -6 } : {}}
          whileTap={cakeBlown ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={!cakeBlown ? {
              rotate: [0, -5, 5, -3, 3, 0],
              transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
            } : { y: [0, -8, 0], transition: { duration: 2.2, repeat: Infinity } }}
            className="text-6xl md:text-7xl mb-4"
          >
            📸
          </motion.div>
          <h3 className="font-display font-bold text-white text-lg md:text-xl mb-1">Photobooth</h3>
          <p className="text-white/60 text-xs">ถ่ายรูปสวยๆ~</p>
          <div className={`mt-3 inline-block text-xs px-3 py-1 rounded-full
            ${cakeBlown ? 'bg-emerald-400/40 text-emerald-100' : 'bg-white/10 text-white/40'}`}>
            {cakeBlown ? 'Unlocked! 🎉' : '🔒 Locked'}
          </div>
        </motion.div>
      </div>

      {/* Floating "blow cake first" message */}
      <AnimatePresence>
        {runMsg && (
          <motion.div
            key={runCount}
            initial={{ opacity: 0, scale: 0.7, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ duration: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-3 shadow-xl pointer-events-none"
          >
            <p className="text-white font-bold text-sm text-center">
              {funnyMessages[runCount % funnyMessages.length]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
