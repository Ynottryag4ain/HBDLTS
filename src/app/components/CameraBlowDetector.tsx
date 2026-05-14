'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props { onBlown: () => void }

export default function CameraBlowDetector({ onBlown }: Props) {
  const [status, setStatus] = useState<'asking' | 'ready' | 'blowing' | 'denied'>('asking')
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const blownRef = useRef(false)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    let stream: MediaStream | null = null

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        src.connect(analyser)
        analyserRef.current = analyser
        setStatus('ready')

        const buf = new Uint8Array(analyser.frequencyBinCount)
        let cooldown = false

        const detect = () => {
          if (blownRef.current) return
          analyser.getByteFrequencyData(buf)
          // Low-frequency energy = blowing/rushing air
          const low = Array.from(buf.slice(0, 32)).reduce((a, b) => a + b, 0) / 32
          const isBlowing = low > 25

          if (isBlowing) {
            progressRef.current = Math.min(100, progressRef.current + 4)
            setProgress(progressRef.current)
            setStatus('blowing')
            if (progressRef.current >= 100 && !cooldown) {
              cooldown = true
              blownRef.current = true
              onBlown()
              return
            }
          } else {
            progressRef.current = Math.max(0, progressRef.current - 1.5)
            setProgress(progressRef.current)
            if (progressRef.current <= 0) setStatus('ready')
          }
          rafRef.current = requestAnimationFrame(detect)
        }
        detect()
      } catch {
        setStatus('denied')
      }
    }

    init()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [onBlown])

  if (status === 'denied') {
    return (
      <div className="glass rounded-3xl p-5 text-center">
        <p className="text-white/70 text-sm mb-3">ไม่สามารถเข้าถึงไมค์ได้ 😔</p>
        <button
          onClick={onBlown}
          className="bg-pink-400/80 text-white rounded-2xl px-8 py-3 font-bold text-base w-full"
        >
          💨 เป่าเทียน (กดแทน)
        </button>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <motion.span
          animate={status === 'blowing' ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="text-2xl"
        >
          {status === 'asking' ? '🎤' : status === 'blowing' ? '💨' : '🎤'}
        </motion.span>
        <p className="text-white font-semibold text-sm">
          {status === 'asking' ? 'กำลังขอใช้ไมค์...' :
           status === 'blowing' ? 'เป่าต่อไปเลยยย!!' :
           'พร้อมแล้ว! เป่าเข้าไมค์ได้เลย~'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.08 }}
        />
      </div>

      {status === 'ready' && (
        <p className="text-white/50 text-xs">เป่าเข้าไมค์แรงๆ เลยนะ 🌬️</p>
      )}
    </div>
  )
}
