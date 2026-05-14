'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

type Stage = 'intro' | 'shooting' | 'review' | 'strip' | 'denied'

const FILTERS = [
  { id: 'none', label: 'Normal', preview: 'brightness(1)', fn: null },
]

const TEMPLATES = [
  {
    id: 'minimal',
    label: '🤍 Minimal',
    bgTop: '#ffffff',
    bgBottom: '#f8f8f8',
    frameColor: '#e0e0e0',
    accentColor: '#ff6b9d',
    textColor: '#333333',
    headerText: 'Photo Booth',
    footerText: 'with love ✦',
  },
]

export default function PhotoBooth() {
  const { addPhoto, setScreen } = useAppStore()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stage, setStage] = useState<Stage>('intro')
  const [photos, setPhotos] = useState<string[]>([])
  const [countdown, setCountdown] = useState(0)
  const [isCounting, setIsCounting] = useState(false)
  const [flash, setFlash] = useState(false)

  const photosRef = useRef<string[]>([])
  const TOTAL = 4

  // cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  // ─────────────────────────────────────────────
  // CAMERA FIX FOR VERCEL + iPHONE + SAFARI
  // ─────────────────────────────────────────────
  async function openCamera() {
  try {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      console.error('Camera API not supported')
      setStage('denied')
      return
    }

    // stop old stream
    streamRef.current?.getTracks().forEach(track => track.stop())

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
      },
      audio: false,
    })

    streamRef.current = stream

    const video = videoRef.current

    if (!video) {
      console.error('Video element missing')
      return
    }

    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    video.autoplay = true

    // IMPORTANT FIX
    video.onloadedmetadata = () => {
      video.play().catch(err => {
        console.error('Play error:', err)
      })

      setStage('shooting')
    }

  } catch (err) {
    console.error('Camera error:', err)
    setStage('denied')
  }
}

  // capture photo
  const capture = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // mirror
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()

    const url = canvas.toDataURL('image/jpeg', 0.92)

    photosRef.current = [...photosRef.current, url]

    setPhotos([...photosRef.current])

    addPhoto(url)

    if (photosRef.current.length >= TOTAL) {
      streamRef.current?.getTracks().forEach(track => track.stop())
      setStage('review')
    }
  }, [addPhoto])

  // countdown
  const startCountdown = useCallback(() => {
    if (isCounting) return

    setIsCounting(true)
    setCountdown(3)

    let c = 3

    const iv = setInterval(() => {
      c--

      setCountdown(c)

      if (c <= 0) {
        clearInterval(iv)

        setFlash(true)

        setTimeout(async () => {
          await capture()
          setFlash(false)
          setIsCounting(false)
        }, 150)
      }
    }, 1000)
  }, [capture, isCounting])

  // reset
  function retake() {
    photosRef.current = []
    setPhotos([])

    streamRef.current?.getTracks().forEach(track => track.stop())

    streamRef.current = null

    setStage('intro')
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(160deg,#1a0a2e 0%,#2d1158 60%,#1a0a2e 100%)',
      }}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* top */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => {
            retake()
            setScreen('letter')
          }}
          className="text-white"
        >
          ←
        </button>

        <h1 className="text-white font-bold text-lg">
          📸 Photo Booth
        </h1>

        <div className="w-5" />
      </div>

      <div className="flex-1 px-4 pb-6">
        <AnimatePresence mode="wait">

          {/* intro */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] gap-6"
            >
              <div className="text-7xl">📸</div>

              <div className="text-center">
                <p className="text-white text-2xl font-bold">
                  Photo Booth
                </p>

                <p className="text-white/60">
                  ถ่าย {TOTAL} รูป
                </p>
              </div>

              <motion.button
                onClick={async () => {
                  await openCamera()
                }}
                className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl"
                whileTap={{ scale: 0.95 }}
              >
                เปิดกล้อง 📷
              </motion.button>
            </motion.div>
          )}

          {/* denied */}
          {stage === 'denied' && (
            <motion.div
              key="denied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] gap-4 text-center"
            >
              <div className="text-6xl">😢</div>

              <p className="text-white font-bold text-xl">
                เปิดกล้องไม่ได้
              </p>

              <p className="text-white/50 text-sm max-w-xs">
                กรุณาอนุญาตกล้องใน Safari หรือ Chrome
              </p>

              <button
                onClick={() => setStage('intro')}
                className="bg-pink-500 text-white px-6 py-3 rounded-xl"
              >
                ลองใหม่
              </button>
            </motion.div>
          )}

          {/* shooting */}
          {stage === 'shooting' && (
            <motion.div
              key="shooting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-black"
                style={{ aspectRatio: '4/3' }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'scaleX(-1)',
                  }}
                />

                {/* flash */}
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                {/* countdown */}
                <AnimatePresence>
                  {isCounting && countdown > 0 && (
                    <motion.div
                      key={countdown}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <span className="text-white text-8xl font-black">
                        {countdown}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-white text-xs">
                  {photos.length}/{TOTAL}
                </div>
              </div>

              {/* photos */}
              {photos.length > 0 && (
                <div className="flex gap-2 justify-center">
                  {photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {/* shutter */}
              {!isCounting && photos.length < TOTAL && (
                <div className="flex justify-center">
                  <motion.button
                    onClick={startCountdown}
                    whileTap={{ scale: 0.92 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center shadow-2xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl">
                      📸
                    </div>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* review */}
          {stage === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 py-4"
            >
              <p className="text-white text-center text-xl font-bold">
                🎉 ถ่ายเสร็จแล้ว
              </p>

              <div className="grid grid-cols-2 gap-2">
                {photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="rounded-xl aspect-video object-cover"
                  />
                ))}
              </div>

              <button
                onClick={retake}
                className="bg-white/10 text-white py-3 rounded-2xl"
              >
                🔄 ถ่ายใหม่
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
