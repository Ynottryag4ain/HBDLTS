'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import ConfettiBlast from './ConfettiBlast'

export default function FinalGallery() {
  const { photos, setScreen, toggleMusic, musicOn } = useAppStore()

  useEffect(() => {
    // Auto-trigger confetti on mount
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
      <ConfettiBlast />

      {/* Big celebration header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className="text-center mb-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-7xl mb-3"
        >
          🎉
        </motion.div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
          Thank you for today
        </h1>
        <motion.p
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          ❤️
        </motion.p>
      </motion.div>

      {/* Photos grid */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mb-6"
        >
          <p className="text-white/60 text-xs text-center mb-3 uppercase tracking-widest">Memories ✨</p>
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 4).map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 + i * 3 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 + i * 1.5 }}
                transition={{ delay: 0.1 * i + 0.5, type: 'spring' }}
                className="relative"
              >
                <img
                  src={url}
                  alt={`memory ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-2xl border-3 border-white shadow-xl"
                  style={{ borderWidth: 3 }}
                />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-white/80 text-pink-500 text-xs rounded-full px-2 py-0.5 font-semibold">
                    {['💕','✨','🌸','🎀'][i]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Floating memory cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-3xl px-8 py-5 text-center w-full max-w-sm mb-6 shadow-2xl"
      >
        <p className="text-white font-semibold text-base mb-1">
          วันนี้เป็นวันพิเศษมากๆ ❤️
        </p>
        <p className="text-white/65 text-sm">
          ขอบคุณที่ทำให้ชีวิตของฉันสวยงามขึ้นทุกวัน
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <motion.button
          onClick={() => setScreen('lock')}
          className="glass text-white rounded-2xl py-3 font-bold"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 เริ่มใหม่อีกรอบ
        </motion.button>
        <motion.button
          onClick={toggleMusic}
          className="glass-dark text-white/70 rounded-2xl py-3 font-semibold text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {musicOn ? '🔇 ปิดเพลง' : '🎵 เปิดเพลง'}
        </motion.button>
      </motion.div>

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none text-2xl"
          style={{ left: `${5 + i * 12}%`, bottom: 0 }}
          animate={{ y: [0, -(window.innerHeight + 60)], opacity: [0.8, 0] }}
          transition={{
            duration: 4 + i * 0.6,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        >
          {['💕','💖','💗','✨','🌸','💝','⭐','💫'][i]}
        </motion.div>
      ))}
    </div>
  )
}
