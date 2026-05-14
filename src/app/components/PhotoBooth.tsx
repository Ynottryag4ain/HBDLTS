'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { toPng } from 'html-to-image'
import { motion, AnimatePresence } from 'framer-motion'

const PhotoBooth = () => {
  const webcamRef = useRef<Webcam>(null)
  const templateRef = useRef<HTMLDivElement>(null)
  
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isDone, setIsDone] = useState(false)

  // ฟังก์ชันนับถอยหลังก่อนถ่าย
  const startCaptureFlow = () => {
    if (photos.length >= 4) return
    setIsCapturing(true)
    setCountdown(3)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      takePhoto()
      setCountdown(null)
      setIsCapturing(false)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const takePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      const newPhotos = [...photos, imageSrc]
      setPhotos(newPhotos)
      if (newPhotos.length === 4) setIsDone(true)
    }
  }, [photos])

  const downloadImage = async () => {
    if (templateRef.current === null) return
    const dataUrl = await toPng(templateRef.current, { 
      quality: 1,
      pixelRatio: 2 // เพิ่มความชัดของรูปที่โหลด
    })
    const link = document.createElement('a')
    link.download = `hbd-photobooth-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  const resetPhotos = () => {
    setPhotos([])
    setIsDone(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCF8] p-6 text-[#4A4A4A]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full flex flex-col md:flex-row gap-12 items-center justify-center"
      >
        
        {/* --- ส่วนซ้าย: กล้องและการควบคุม --- */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-serif mb-2">Photo Booth</h2>
            <p className="text-sm text-gray-400 uppercase tracking-widest">Take 4 special shots</p>
          </div>

          <div className="relative aspect-[3/4] w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border-[12px] border-white">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", aspectRatio: 0.75 }}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Countdown */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                  <span className="text-white text-8xl font-bold">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flash Effect */}
            <AnimatePresence>
              {countdown === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-50"
                />
              )}
            </AnimatePresence>
          </div>

          <button
            disabled={isCapturing || isDone}
            onClick={startCaptureFlow}
            className={`w-full py-4 rounded-full font-medium transition-all shadow-lg ${
              isDone 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#FF8A8A] text-white hover:bg-[#ff7575] active:scale-95'
            }`}
          >
            {isDone ? 'Captured All Photos' : isCapturing ? 'Get Ready...' : 'Take a Photo'}
          </button>
        </div>

        {/* --- ส่วนขวา: Template Preview --- */}
        <div className="flex flex-col items-center gap-6">
          <div 
            ref={templateRef}
            className="bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[280px] flex flex-col gap-3"
          >
            {/* Photo Slots */}
            <div className="grid grid-cols-1 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-[#F3F3F3] overflow-hidden border border-gray-100">
                  {photos[i] ? (
                    <motion.img 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={photos[i]} 
                      className="w-full h-full object-cover contrast-[1.05] brightness-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-gray-300 uppercase tracking-tighter">Frame {i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Template Footer */}
            <div className="mt-4 mb-2 flex flex-col items-center gap-1">
              <h3 className="text-sm font-serif italic text-gray-600">Birthday Memories</h3>
              <p className="text-[9px] tracking-[0.4em] text-gray-300 uppercase">May 14, 2026</p>
            </div>
          </div>

          {/* Download & Reset Buttons */}
          <AnimatePresence>
            {photos.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <button onClick={resetPhotos} className="text-sm text-gray-400 hover:text-red-400 transition">
                  Reset
                </button>
                <button 
                  onClick={downloadImage}
                  className="bg-black text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-md"
                >
                  Save Image
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  )
}

export default PhotoBooth
