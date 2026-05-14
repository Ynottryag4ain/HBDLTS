'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = 'intro' | 'shooting' | 'review' | 'strip' | 'denied'

// ─── Filters (pixel-based, iOS safe) ─────────────────────────────────────────
const FILTERS = [
  { id: 'none',    label: 'Normal',     preview: 'brightness(1)',
    fn: null },
  { id: 'warm',    label: '🌅 Warm',
    preview: 'sepia(0.35) saturate(1.5) brightness(1.05)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ d[i]=Math.min(255,d[i]*1.12); d[i+1]=Math.min(255,d[i+1]*1.0); d[i+2]=Math.min(255,d[i+2]*0.85) } }},
  { id: 'cool',    label: '❄️ Cool',
    preview: 'hue-rotate(20deg) saturate(1.2)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ d[i]=Math.min(255,d[i]*0.88); d[i+2]=Math.min(255,d[i+2]*1.2) } }},
  { id: 'pink',    label: '🌸 Pink',
    preview: 'sepia(0.3) hue-rotate(300deg) saturate(1.8)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ d[i]=Math.min(255,d[i]*1.15); d[i+1]=Math.min(255,d[i+1]*0.88); d[i+2]=Math.min(255,d[i+2]*0.95) } }},
  { id: 'bw',      label: '🖤 B&W',
    preview: 'grayscale(1)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ const g=d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114; d[i]=d[i+1]=d[i+2]=g } }},
  { id: 'vintage', label: '📷 Vintage',
    preview: 'sepia(0.7) contrast(0.85)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ const g=d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114; d[i]=Math.min(255,g*0.9+d[i]*0.1+30); d[i+1]=Math.min(255,g*0.7+d[i+1]*0.1+20); d[i+2]=Math.min(255,g*0.4+d[i+2]*0.1) } }},
  { id: 'vivid',   label: '🎨 Vivid',
    preview: 'saturate(2) contrast(1.1)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ const avg=(d[i]+d[i+1]+d[i+2])/3; d[i]=Math.min(255,avg+(d[i]-avg)*1.8); d[i+1]=Math.min(255,avg+(d[i+1]-avg)*1.8); d[i+2]=Math.min(255,avg+(d[i+2]-avg)*1.8) } }},
  { id: 'soft',    label: '🤍 Soft',
    preview: 'brightness(1.12) saturate(0.8)',
    fn: (d: Uint8ClampedArray) => { for(let i=0;i<d.length;i+=4){ d[i]=Math.min(255,d[i]*0.9+25); d[i+1]=Math.min(255,d[i+1]*0.9+25); d[i+2]=Math.min(255,d[i+2]*0.9+25) } }},
]

function applyFilter(canvas: HTMLCanvasElement, filterId: string) {
  if (filterId === 'none') return
  const f = FILTERS.find(x => x.id === filterId)
  if (!f || !f.fn) return
  const ctx = canvas.getContext('2d')!
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  f.fn(img.data)
  ctx.putImageData(img, 0, 0)
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'y2k_silver', label: '⚡ Y2K Silver',
    bgTop: '#1a1a2e', bgBottom: '#16213e', frameColor: '#e0e0f0',
    accentColor: '#ff6b9d', textColor: '#ffffff',
    headerText: 'CYBER BABY ⚡', footerText: 'memories.exe ✦ Y2K',
  },
  {
    id: 'y2k_pink', label: '🩷 Y2K Pink',
    bgTop: '#ff9ac1', bgBottom: '#ffd6e7', frameColor: '#ff6b9d',
    accentColor: '#c879ff', textColor: '#ffffff',
    headerText: '💕 girls club 💕', footerText: 'Y2K ✦ 2000s BABY',
  },
  {
    id: 'pochacco_pink', label: '🐶 Pochacco',
    bgTop: '#ffd6e7', bgBottom: '#fff0f6', frameColor: '#ff9ac1',
    accentColor: '#ff6b9d', textColor: '#ff6b9d',
    headerText: '🐾 just you & me', footerText: '200% CUTE ✦ MY BABY',
  },
  {
    id: 'pochacco_blue', label: '💙 Pochacco Blue',
    bgTop: '#b3d9ff', bgBottom: '#e8f4ff', frameColor: '#7ec8e3',
    accentColor: '#5ba8d4', textColor: '#5ba8d4',
    headerText: '☁️ Every day better', footerText: 'So cute! ✦ Good day!',
  },
  {
    id: 'minimal', label: '🤍 Minimal',
    bgTop: '#ffffff', bgBottom: '#f8f8f8', frameColor: '#e0e0e0',
    accentColor: '#ff6b9d', textColor: '#333333',
    headerText: '💕 Happy Birthday', footerText: 'with love ✦',
  },
  {
    id: 'dark', label: '🖤 Dark Glam',
    bgTop: '#1a0a2e', bgBottom: '#2d1158', frameColor: '#c879ff',
    accentColor: '#ff6b9d', textColor: '#ffffff',
    headerText: '💎 GLAM MEMORIES', footerText: '💕 forever & always',
  },
]

// ─── Build strip on canvas ────────────────────────────────────────────────────
function buildStripCanvas(photos: string[], tmpl: typeof TEMPLATES[0], filterId: string): Promise<string> {
  return new Promise(resolve => {
    const W = 420, PAD = 14, HEADER = 72, FOOTER = 52, GAP = 10
    const PH = Math.round((W - PAD * 2) * 3 / 4) // 4:3 photo height
    const H = HEADER + (PH + GAP) * photos.length + FOOTER

    const sc = document.createElement('canvas')
    sc.width = W; sc.height = H
    const ctx = sc.getContext('2d')!

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, tmpl.bgTop); bg.addColorStop(1, tmpl.bgBottom)
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    // Header
    ctx.fillStyle = tmpl.accentColor
    ctx.fillRect(0, 0, W, HEADER)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px serif'
    ctx.textAlign = 'center'
    ctx.fillText(tmpl.headerText, W / 2, HEADER / 2 + 8)

    // Outer border
    ctx.strokeStyle = tmpl.frameColor
    ctx.lineWidth = 4
    ctx.strokeRect(3, 3, W - 6, H - 6)

    let loaded = 0
    photos.forEach((url, i) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const y = HEADER + i * (PH + GAP) + GAP / 2
        const x = PAD
        const w = W - PAD * 2

        // Clip & draw photo
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, y, w, PH, 8)
        ctx.clip()

        // Cover fit
        const ir = img.width / img.height
        const sr = w / PH
        let dw = w, dh = PH, dx = x, dy = y
        if (ir > sr) { dh = PH; dw = PH * ir; dx = x - (dw - w) / 2 }
        else { dw = w; dh = w / ir; dy = y - (dh - PH) / 2 }
        ctx.drawImage(img, dx, dy, dw, dh)

        // Apply filter to just this photo region
        if (filterId !== 'none') {
          const imgData = ctx.getImageData(x, y, w, PH)
          const f = FILTERS.find(f => f.id === filterId)
          if (f?.fn) { f.fn(imgData.data); ctx.putImageData(imgData, x, y) }
        }
        ctx.restore()

        // Photo border
        ctx.strokeStyle = tmpl.frameColor
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.roundRect(x, y, w, PH, 8); ctx.stroke()

        // Number badge
        ctx.fillStyle = tmpl.accentColor
        ctx.beginPath(); ctx.arc(x + 20, y + 20, 14, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(`0${i + 1}`, x + 20, y + 25)

        loaded++
        if (loaded === photos.length) {
          // Footer
          ctx.fillStyle = tmpl.accentColor
          ctx.fillRect(0, H - FOOTER, W, FOOTER)
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(tmpl.footerText, W / 2, H - FOOTER / 2 + 5)
          ctx.font = '10px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.fillText(new Date().toLocaleDateString('th-TH'), W / 2, H - FOOTER / 2 + 20)
          resolve(sc.toDataURL('image/jpeg', 0.93))
        }
      }
      img.onerror = () => { loaded++; if (loaded === photos.length) resolve(sc.toDataURL('image/jpeg', 0.93)) }
      img.src = url
    })
  })
}

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [stripUrl, setStripUrl] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

  const photosRef = useRef<string[]>([])
  const TOTAL = 4

  // Cleanup on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  // ── Open camera (called from button tap — iOS requires user gesture) ──
  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      video.muted = true
      await video.play()
      setStage('shooting')
    } catch {
      setStage('denied')
    }
  }

  // ── Capture one photo ──
  const capture = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!

    // Mirror flip
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); ctx.restore()

    const url = canvas.toDataURL('image/jpeg', 0.92)
    photosRef.current = [...photosRef.current, url]
    setPhotos([...photosRef.current])
    addPhoto(url)

    if (photosRef.current.length >= TOTAL) {
      streamRef.current?.getTracks().forEach(t => t.stop())
      setStage('review')
    }
  }, [addPhoto])

  // ── Start countdown then capture ──
  const startCountdown = useCallback(() => {
    if (isCounting || photosRef.current.length >= TOTAL) return
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
    }, 900)
  }, [isCounting, capture])

  // ── Build strip ──
  async function generateStrip(tmpl: typeof TEMPLATES[0], filterId: string) {
    setIsBuilding(true)
    setStripUrl(null)
    const url = await buildStripCanvas(photosRef.current, tmpl, filterId)
    setStripUrl(url)
    setIsBuilding(false)
  }

  function goToStrip(tmpl: typeof TEMPLATES[0]) {
    setSelectedTemplate(tmpl)
    setStage('strip')
    generateStrip(tmpl, selectedFilter)
  }

  function retake() {
    photosRef.current = []; setPhotos([])
    setStripUrl(null); setStage('intro')
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1a0a2e 0%,#2d1158 60%,#1a0a2e 100%)' }}>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <motion.button onClick={() => { retake(); setScreen('letter') }}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg"
          whileTap={{ scale: 0.88 }}>←</motion.button>
        <h2 className="font-display font-bold text-white text-lg">📸 Photo Booth</h2>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {stage === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-full gap-5 py-8">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl">📸</motion.div>
              <div className="text-center">
                <p className="text-white font-bold text-xl mb-2">Photo Booth</p>
                <p className="text-white/60 text-sm">ถ่าย {TOTAL} รูป แล้วเลือก filter + template</p>
              </div>
              <motion.button onClick={openCamera}
                className="w-full max-w-xs bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl py-4 font-bold text-lg shadow-xl"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                เปิดกล้อง 📷
              </motion.button>
            </motion.div>
          )}

          {/* ── DENIED ── */}
          {stage === 'denied' && (
            <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-full gap-4 py-8 text-center">
              <p className="text-5xl">😢</p>
              <p className="text-white font-bold">ไม่สามารถเข้าถึงกล้องได้</p>
              <p className="text-white/50 text-sm px-4">กรุณาอนุญาตกล้องใน Settings ของ iPhone แล้วลองใหม่</p>
              <motion.button onClick={() => setStage('intro')}
                className="bg-pink-400 text-white rounded-2xl px-8 py-3 font-bold"
                whileTap={{ scale: 0.95 }}>ลองใหม่</motion.button>
              <motion.button onClick={() => setScreen('gallery')}
                className="text-white/40 text-sm underline"
                whileTap={{ scale: 0.95 }}>ข้ามไปหน้าต่อไป</motion.button>
            </motion.div>
          )}

          {/* ── SHOOTING ── */}
          {stage === 'shooting' && (
            <motion.div key="shooting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-3 py-2">

              {/* Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-purple-400/40"
                style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} autoPlay playsInline muted
                  className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

                {/* Flash */}
                <AnimatePresence>
                  {flash && (
                    <motion.div className="absolute inset-0 bg-white pointer-events-none"
                      initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }} />
                  )}
                </AnimatePresence>

                {/* Countdown overlay */}
                <AnimatePresence>
                  {isCounting && countdown > 0 && (
                    <motion.div key={countdown} className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
                      <span className="font-display font-black text-white"
                        style={{ fontSize: '5rem', textShadow: '0 0 30px #c879ff, 0 0 60px #c879ff' }}>{countdown}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Counter badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-bold">
                  {photos.length}/{TOTAL}
                </div>
              </div>

              {/* Thumbnails */}
              {photos.length > 0 && (
                <div className="flex gap-2 justify-center">
                  {photos.map((url, i) => (
                    <motion.img key={i} src={url}
                      initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.05 * i }}
                      className="w-12 h-10 object-cover rounded-lg border-2 border-purple-400/50" />
                  ))}
                </div>
              )}

              {/* Shutter button */}
              {!isCounting && photos.length < TOTAL && (
                <div className="flex justify-center mt-1">
                  <motion.button onClick={startCountdown}
                    className="w-18 h-18 rounded-full shadow-2xl flex items-center justify-center"
                    style={{ width: 70, height: 70, background: 'linear-gradient(135deg,#ff6b9d,#c879ff)' }}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl"
                      style={{ width: 56, height: 56 }}>📸</div>
                  </motion.button>
                </div>
              )}

              {isCounting && (
                <p className="text-center text-white/60 text-sm">รอก่อน... {countdown}s</p>
              )}
            </motion.div>
          )}

          {/* ── REVIEW (เลือก filter + template) ── */}
          {stage === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-4 py-2">

              <p className="text-white font-bold text-center text-base">ถ่ายครบ {TOTAL} รูปแล้ว! 🎉</p>

              {/* Photo grid preview */}
              <div className="grid grid-cols-2 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={url} className="w-full h-full object-cover"
                      style={{ filter: selectedFilter !== 'none' ? FILTERS.find(f => f.id === selectedFilter)?.preview : undefined }} />
                    <div className="absolute top-1.5 left-1.5 bg-black/50 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter picker */}
              <div>
                <p className="text-white/70 text-xs mb-2 font-semibold">🎨 เลือก Filter</p>
                <div className="overflow-x-auto pb-1">
                  <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                    {FILTERS.map(f => (
                      <button key={f.id} onClick={() => setSelectedFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                          ${selectedFilter === f.id ? 'bg-white text-purple-600 scale-105 shadow-lg' : 'bg-white/15 text-white'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template picker */}
              <div>
                <p className="text-white/70 text-xs mb-2 font-semibold">🎞️ เลือก Template</p>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map(t => (
                    <motion.button key={t.id} onClick={() => goToStrip(t)}
                      className="rounded-xl p-3 text-center text-xs font-bold text-white flex flex-col items-center gap-1"
                      style={{ background: `linear-gradient(135deg, ${t.bgTop}, ${t.bgBottom})`, border: `2px solid ${t.frameColor}` }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <span className="text-xl">{t.label.split(' ')[0]}</span>
                      <span className="text-xs opacity-80 leading-tight">{t.label.slice(t.label.indexOf(' ') + 1)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button onClick={retake}
                className="w-full bg-white/10 text-white/60 rounded-2xl py-3 font-semibold text-sm"
                whileTap={{ scale: 0.96 }}>🔄 ถ่ายใหม่</motion.button>
            </motion.div>
          )}

          {/* ── STRIP ── */}
          {stage === 'strip' && (
            <motion.div key="strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 py-2 items-center">

              <p className="text-white font-bold text-center">Photo Strip ✨</p>

              {isBuilding ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="text-4xl">⏳</motion.div>
                  <p className="text-white/50 text-sm">กำลังสร้าง...</p>
                </div>
              ) : stripUrl ? (
                <motion.img src={stripUrl} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-xs rounded-2xl shadow-2xl"
                  style={{ border: `3px solid ${selectedTemplate.frameColor}` }} />
              ) : null}

              {/* Change template row */}
              <div className="overflow-x-auto w-full pb-1">
                <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => goToStrip(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                        ${selectedTemplate.id === t.id ? 'bg-white text-purple-600 scale-105' : 'bg-white/15 text-white'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full max-w-xs">
                <motion.button onClick={() => setStage('review')}
                  className="flex-1 bg-white/15 text-white rounded-2xl py-3 font-bold text-sm"
                  whileTap={{ scale: 0.95 }}>← แก้ไข</motion.button>
                {stripUrl && (
                  <motion.button
                    onClick={() => { const a = document.createElement('a'); a.href = stripUrl!; a.download = 'photobooth.jpg'; a.click() }}
                    className="flex-1 text-white rounded-2xl py-3 font-bold text-sm shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${selectedTemplate.accentColor}, ${selectedTemplate.frameColor})` }}
                    whileTap={{ scale: 0.95 }}>⬇️ บันทึก</motion.button>
                )}
              </div>
              <motion.button onClick={() => setScreen('gallery')}
                className="w-full max-w-xs bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl py-3 font-bold shadow-lg"
                whileTap={{ scale: 0.96 }}>ไปหน้าถัดไป 🎉</motion.button>
              <button onClick={retake} className="text-white/30 text-xs underline">ถ่ายใหม่ทั้งหมด</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
