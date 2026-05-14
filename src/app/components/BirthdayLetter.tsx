'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

// ✏️ Edit this message!
const LETTER_PARAGRAPHS = [
  "HBD นะแลคต้า 💕",
  "ขอให้เธอมีความสุขมากๆนะ ขอให้ติดบัญชีด้วย",
  "กินข้าวให้ตรงเวลาด้วย ขับรถก็ระวังๆหน่อยน้า อย่าขับเร็วมาก🌸",
  "ขอให้วันเกิดปีนี้เต็มไปด้วยความสุข รอยยิ้ม และทุกสิ่งที่เธอปรารถนานะ Happy Birthdayจ้าาาา❤️",
]

function useTyping(text: string, speed = 35, start = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!start) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(iv); setDone(true) }
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed, start])
  return { displayed, done }
}

export default function BirthdayLetter() {
  const setScreen = useAppStore((s) => s.setScreen)
  const [opened, setOpened] = useState(false)
  const [paraIndex, setParaIndex] = useState(0)
  const [allDone, setAllDone] = useState(false)

  const { displayed, done } = useTyping(LETTER_PARAGRAPHS[paraIndex] ?? '', 38, opened)

  useEffect(() => {
    if (!done) return
    if (paraIndex < LETTER_PARAGRAPHS.length - 1) {
      setTimeout(() => setParaIndex(p => p + 1), 600)
    } else {
      setTimeout(() => setAllDone(true), 800)
    }
  }, [done, paraIndex])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-y-auto py-8">
      <motion.button
        className="absolute top-4 left-4 glass rounded-full w-10 h-10 flex items-center justify-center text-white/70 text-xl z-20"
        onClick={() => setScreen('cards')}
        whileTap={{ scale: 0.88 }}
      >←</motion.button>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl mb-6 cursor-pointer"
              onClick={() => setOpened(true)}
            >
              💌
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-white drop-shadow mb-3">
              มีจดหมายถึงเธอ 💕
            </h2>
            <motion.button
              onClick={() => setOpened(true)}
              className="glass rounded-2xl px-8 py-3 text-white font-bold text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              เปิดจดหมาย ✉️
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="w-full max-w-md"
          >
            <div className="glass rounded-3xl p-7 shadow-2xl relative overflow-hidden">
              {/* Decorative hearts */}
              {['top-3 right-4','top-3 left-4'].map((pos, i) => (
                <motion.span
                  key={i}
                  className={`absolute ${pos} text-pink-300 text-lg`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  💕
                </motion.span>
              ))}

              <p className="font-display text-white/60 text-xs text-center mb-4 tracking-widest uppercase">
                — a letter for you —
              </p>

              <div className="space-y-3 min-h-[180px]">
                {LETTER_PARAGRAPHS.slice(0, paraIndex).map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/85 text-sm leading-relaxed"
                  >
                    {para}
                  </motion.p>
                ))}
                {paraIndex < LETTER_PARAGRAPHS.length && (
                  <p className="text-white/85 text-sm leading-relaxed">
                    {displayed}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-pink-300 ml-0.5 align-middle"
                    />
                  </p>
                )}
              </div>

              <AnimatePresence>
                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-3"
                  >
                    <p className="text-center text-white/60 text-sm">อยากถ่ายรูปด้วยกันไหม? 📸</p>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setScreen('photobooth')}
                        className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl py-3 font-bold shadow-lg"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        YES 💕
                      </motion.button>
                      <motion.button
                        onClick={() => setScreen('gallery')}
                        className="flex-1 glass text-white/80 rounded-2xl py-3 font-semibold"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Maybe later
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hearts */}
      {opened && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none text-xl"
          style={{ left: `${10 + i * 16}%`, bottom: '5%' }}
          animate={{ y: [-10, -120, -200], opacity: [0.7, 0.5, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        >
          {['💕','💖','💗','💓','💝','🌸'][i]}
        </motion.div>
      ))}
    </div>
  )
}
