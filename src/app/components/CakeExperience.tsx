'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import CakeSVG from './CakeSVG'
import CameraBlowDetector from './CameraBlowDetector'
import CountdownBlowMode from './CountdownBlowMode'
import ConfettiBlast from './ConfettiBlast'

const BLOW_MODE: 'camera' | 'countdown' = 'camera'
type Phase = 'mic_request' | 'wishing' | 'confirm' | 'countdown' | 'blowing' | 'blown' | 'celebrate'

export default function CakeExperience() {
  const setScreen = useAppStore((s) => s.setScreen)
  const setCakeBlown = useAppStore((s) => s.setCakeBlown)
  const [phase, setPhase] = useState<Phase>('mic_request')
  const [wishCount, setWishCount] = useState(10)
  const [blowCount, setBlowCount] = useState(3)
  const [confetti, setConfetti] = useState(false)
  const [micGranted, setMicGranted] = useState(false)

  async function requestMic() {
    if (BLOW_MODE === 'countdown') {
      setPhase('wishing')
      return
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicGranted(true)
      setPhase('wishing')
    } catch {
      setMicGranted(false)
      setPhase('wishing')
    }
  }

  useEffect(() => {
    if (phase !== 'wishing') return
    if (wishCount <= 0) { setPhase('confirm'); return }
    const t = setTimeout(() => setWishCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, wishCount])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (blowCount <= 0) { setPhase('blowing'); return }
    const t = setTimeout(() => setBlowCount(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [phase, blowCount])

  const handleBlown = useCallback(() => {
    if (phase === 'blown' || phase === 'celebrate') return
    setPhase('blown')
    setCakeBlown(true)
    setConfetti(true)
    setTimeout(() => setPhase('celebrate'), 700)
  }, [phase, setCakeBlown])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-y-auto py-6">
      {confetti && <ConfettiBlast />}
      <motion.button
        className="absolute top-4 left-4 glass rounded-full w-10 h-10 flex items-center justify-center text-white/70 text-xl z-20"
        onClick={() => setScreen('cards')}
        whileTap={{ scale: 0.88 }}
      >←</motion.button>

      <motion.h2
        key={phase}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center mb-4"
      >
        {phase === 'mic_request' && '🎂 Happy Birthday!'}
        {phase === 'wishing' && '🙏 ตั้งใจอธิษฐานได้เลย...'}
        {phase === 'confirm' && '✨ อธิษฐานเสร็จแล้วหรือยัง?'}
        {phase === 'countdown' && '💨 เตรียมเป่า!'}
        {phase === 'blowing' && 'เป่าเทียนได้เลย! 🕯️'}
        {(phase === 'blown' || phase === 'celebrate') && '🎉 YAYYYY!!! 🎉'}
      </motion.h2>

      <CakeSVG blown={phase === 'blown' || phase === 'celebrate'} />

      <AnimatePresence mode="wait">

        {/* Phase: Request mic */}
        {phase === 'mic_request' && (
          <motion.div key="mic_req" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-5 w-full max-w-xs text-center">
            <div className="glass rounded-3xl px-8 py-6 shadow-2xl">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-4">🎤</motion.div>
              <p className="text-white font-bold text-lg mb-2">ขอใช้ไมค์เพื่อเป่าเทียน</p>
              <p className="text-white/60 text-sm mb-5">เว็บจะใช้ไมค์ตรวจจับเสียงลมเป่าเพื่อดับเทียนนะ 🕯️</p>
              <motion.button onClick={requestMic}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl py-3 font-bold shadow-lg mb-3"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                อนุญาตใช้ไมค์ 🎤
              </motion.button>
              <button onClick={() => setPhase('wishing')} className="text-white/40 text-xs underline">
                ข้ามขั้นตอนนี้
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase: Wishing */}
        {phase === 'wishing' && (
          <motion.div key="wishing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-5 w-full max-w-xs text-center">
            <div className="glass rounded-3xl px-8 py-6 shadow-2xl">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-5xl mb-3">🙏</motion.div>
              <p className="text-white font-semibold mb-4">หลับตาแล้วอธิษฐานในใจได้เลยนะ</p>
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6"/>
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#ff9ac1" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - wishCount / 10)}`}
                    transition={{ duration: 0.8, ease: 'linear' }}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl font-display">{wishCount}</span>
                </div>
              </div>
              <p className="text-white/50 text-xs">วินาที</p>
            </div>
          </motion.div>
        )}

        {/* Phase: Confirm */}
        {phase === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} className="mt-5 w-full max-w-xs text-center">
            <div className="glass rounded-3xl px-8 py-6 shadow-2xl">
              <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.6, delay: 0.3 }} className="text-5xl mb-3">⭐</motion.div>
              <p className="text-white font-bold text-lg mb-2">อธิษฐานเสร็จแล้วหรือยัง?</p>
              <p className="text-white/60 text-sm mb-5">ถ้าพร้อมแล้วก็มาเป่าเทียนกันเลย!</p>
              <div className="flex flex-col gap-3">
                <motion.button onClick={() => { setBlowCount(3); setPhase('countdown') }}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl py-3 font-bold shadow-lg"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                  อธิษฐานแล้ว! พร้อมเป่า 🕯️
                </motion.button>
                <motion.button onClick={() => { setWishCount(10); setPhase('wishing') }}
                  className="glass text-white/70 rounded-2xl py-2 font-semibold text-sm"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  ขอเวลาอธิษฐานอีกนิด 🙏
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase: Countdown */}
        {phase === 'countdown' && (
          <motion.div key={`cd-${blowCount}`} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.35 }} className="mt-5 text-center">
            <div className="glass rounded-3xl px-12 py-8 shadow-2xl">
              <p className="text-white/70 text-sm mb-2">เตรียมเป่า...</p>
              <div className="text-8xl font-display font-bold text-gradient">{blowCount > 0 ? blowCount : '💨'}</div>
            </div>
          </motion.div>
        )}

        {/* Phase: Blowing */}
        {phase === 'blowing' && (
          <motion.div key="blowing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 w-full max-w-sm">
            {BLOW_MODE === 'camera' ? <CameraBlowDetector onBlown={handleBlown} /> : <CountdownBlowMode onBlown={handleBlown} />}
          </motion.div>
        )}

        {/* Phase: Celebrate */}
        {phase === 'celebrate' && (
          <motion.div key="celebrate" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mt-4 text-center w-full max-w-xs">
            <div className="glass rounded-3xl px-8 py-6 shadow-2xl">
              <motion.div animate={{ rotate: [0,-10,10,-5,5,0], scale: [1,1.2,1] }} transition={{ duration: 0.6 }} className="text-5xl mb-3">🎉</motion.div>
              <p className="text-white font-bold text-xl mb-2">Amazing!! 🌟</p>
              <p className="text-white/70 text-sm mb-5">ขอให้คำอธิษฐานเป็นจริงทุกข้อนะ 💕</p>
              <motion.button onClick={() => setScreen('letter')}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl py-3 font-bold shadow-lg"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                เปิดจดหมาย 💌
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
