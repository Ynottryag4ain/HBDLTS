'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, RotateCcw, Download, FlipHorizontal, Sparkles } from 'lucide-react'

const FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'sweet', name: 'Sweet', class: 'brightness(1.1) contrast(1.1) saturate(1.2) sepia(0.1)' },
  { id: 'nostalgia', name: 'Vintage', class: 'sepia(0.4) contrast(0.9) brightness(1.1)' },
  { id: 'bw', name: 'B&W', class: 'grayscale(1) contrast(1.2)' },
  { id: 'glow', name: 'Soft Glow', class: 'brightness(1.2) blur(0.5px) saturate(0.8)' },
]

const FRAMES = [
  { id: 'heart', name: 'Happy Birth Day', bgColor: '#FFFFFF', borderColor: '#FFFFFF', textColor: '#1C1C1C' },
  { id: 'stripe', name: 'ทำไมไม่อาบน้ำ', bgColor: '#ffffff', borderColor: '#3b82f6', textColor: '#3b82f6' },
  { id: 'confetti', name: 'HBD Lacta', bgColor: '#fff5f5', borderColor: '#ffd700', textColor: '#ff4785' },
]

const PhotoBooth = () => {
  const webcamRef = useRef<Webcam>(null)
  const templateRef = useRef<HTMLDivElement>(null)
  
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0])
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0])

  const startCapture = () => {
    if (photos.length >= 4) return
    setIsCapturing(true)
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      takePhoto()
      setCountdown(null)
      setIsCapturing(false)
    }
  }, [countdown])

  const takePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setPhotos(prev => [...prev, imageSrc])
    }
  }, [webcamRef])

  const downloadImage = async () => {
    if (!templateRef.current) return
    const canvas = await html2canvas(templateRef.current, { scale: 2 })
    const link = document.createElement('a')
    link.download = `beauty-snap-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="h-screen w-full bg-[#fafafa] overflow-y-auto"> 
      <div className="flex flex-col items-center p-4 pb-32 min-h-max">
        
        {/* Header */}
        <div className="w-full max-w-md flex justify-between items-center py-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-pink-500" size={20} /> 
          </h1>
          <button 
            onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100"
          >
            <FlipHorizontal size={20} />
          </button>
        </div>

        {/* Main Viewport (Camera) */}
        <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode }}
            mirrored={facingMode === "user"}
            className="w-full h-full object-cover"
            style={{ filter: selectedFilter.class }}
          />
          
          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10"
              >
                <span className="text-white text-9xl font-bold">{countdown}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toolbar: Filters & Frames */}
        <div className="w-full max-w-md mt-6 space-y-8 flex-shrink-0">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {FILTERS.map(f => (
              <button 
                key={f.id}
                onClick={() => setSelectedFilter(f)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 ${selectedFilter.id === f.id ? 'text-pink-500' : 'text-gray-400'}`}
              >
                <div className={`w-14 h-14 rounded-full border-2 ${selectedFilter.id === f.id ? 'border-pink-500' : 'border-transparent'} overflow-hidden bg-gray-200`}>
                  <div className="w-full h-full" style={{ filter: f.class, background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)' }} />
                </div>
                <span className="text-xs font-medium">{f.name}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={startCapture}
              disabled={photos.length >= 4 || isCapturing}
              className="w-20 h-20 bg-white border-4 border-pink-500 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white">
                <Camera size={32} />
              </div>
            </button>
          </div>

          {photos.length > 0 && (
            <div className="flex flex-col items-center gap-6 pt-10">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Preview Template</h2>
              
              <div 
                ref={templateRef}
                className="p-4 flex flex-col gap-3 shadow-2xl"
                style={{ backgroundColor: selectedFrame.bgColor, border: `8px solid ${selectedFrame.borderColor}`, width: '280px' }}
              >
                <div className="grid grid-cols-1 gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img 
                        src={p} 
                        className="w-full h-full object-cover" 
                        style={{ filter: selectedFilter.class, transform: facingMode === 'user' ? 'scaleX(-1)' : '' }} 
                      />
                    </div>
                  ))}
                  {[...Array(4 - photos.length)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                      Wait for shot {photos.length + i + 1}
                    </div>
                  ))}
                </div>
                <div className="text-center py-2">
                  <p className="font-serif italic text-lg" style={{ color: selectedFrame.textColor }}>{selectedFrame.name}</p>
                  <p className="text-[10px] tracking-[3px] opacity-50 uppercase">May 14, 2026</p>
                </div>
              </div>

              <div className="flex gap-2">
                {FRAMES.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition ${selectedFrame.id === frame.id ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}
                  >
                    {frame.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 w-full px-4">
                <button onClick={() => setPhotos([])} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-2xl text-gray-600 font-bold text-sm">
                  <RotateCcw size={18} /> Reset
                </button>
                <button onClick={downloadImage} className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-500 rounded-2xl text-white font-bold text-sm shadow-lg shadow-pink-200">
                  <Download size={18} /> Save Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoBooth
