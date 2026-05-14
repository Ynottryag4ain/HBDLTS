'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Camera, RefreshCcw, Download } from 'lucide-react'

const FRAME_OPTIONS = [
  { id: 'hbd-2026', title: 'HBD 2026 (Heart Pattern)', text: 'HBD 2026' },
  { id: 'happy-birthday-banner', title: 'HAPPY BIRTHDAY (Striped Banner)', text: 'HAPPY BIRTHDAY' },
  { id: 'hbd-lts', title: 'HBD LTS (Confetti & Balloons)', text: 'HBD LTS' },
]

const PhotoBooth = () => {
  const webcamRef = useRef<Webcam>(null)
  const templateRef = useRef<HTMLDivElement>(null)
  
  const [photos, setPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isDone, setIsDone] = useState(false)
  
  // สถานะกล้อง (user = กล้องหน้า, environment = กล้องหลัง)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  
  // สถานะเฟรมภาพที่เลือก
  const [selectedFrame, setSelectedFrame] = useState(FRAME_OPTIONS[0].id)

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"))
  }

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
    
    // ใช้ html2canvas เพื่อรวมเฟรมภาพและรูปถ่าย
    const canvas = await html2canvas(templateRef.current, {
      scale: 2, 
      backgroundColor: null,
      logging: false,
    })
    
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `hbd-photobooth-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  const resetPhotos = () => {
    setPhotos([])
    setIsDone(false)
  }

  // สร้างฟังก์ชันเพื่อดึงข้อความจากเฟรมที่เลือก
  const getSelectedFrameText = () => {
    const frame = FRAME_OPTIONS.find(f => f.id === selectedFrame)
    return frame ? frame.text : ''
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCF8] p-4 text-[#4A4A4A]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center"
      >
        
        {/* --- ส่วนซ้าย: กล้องและการควบคุม --- */}
        <div className="flex flex-col items-center gap-5 w-full md:w-auto md:max-w-md lg:max-w-lg">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-1">Mobile Photo Booth</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Flip, Frame, & Capture 4 Shots</p>
          </div>

          <div className="relative aspect-[3/4] w-full max-w-[320px] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-[10px] border-white">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, aspectRatio: 0.75 }}
              mirrored={facingMode === "user"} // กระจกเฉพาะกล้องหน้า
              className="w-full h-full object-cover"
            />
            
            {/* Countdown & Flash (เหมือนเดิม) */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
                  <span className="text-white text-7xl font-bold">{countdown}</span>
                </motion.div>
              )}
              {countdown === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-50"/>
              )}
            </AnimatePresence>

            {/* ปุ่มสลับกล้อง (Overlay) */}
            <button 
              onClick={toggleFacingMode} 
              className="absolute top-4 right-4 bg-white/70 hover:bg-white text-black p-3 rounded-full shadow-md z-40 transition"
              title={`Switch to ${facingMode === "user" ? "Back" : "Front"} Camera`}
            >
              <ArrowLeftRight size={20} />
            </button>
          </div>

          <button
            disabled={isCapturing || isDone}
            onClick={startCaptureFlow}
            className={`w-full max-w-[320px] py-4 rounded-full font-medium transition-all shadow-lg flex items-center justify-center gap-2 ${
              isDone 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#FF8A8A] text-white hover:bg-[#ff7575] active:scale-95'
            }`}
          >
            <Camera size={20} />
            {isDone ? 'Captured All Photos' : isCapturing ? 'Get Ready...' : `Take Photo (${photos.length}/4)`}
          </button>
        </div>

        {/* --- ส่วนขวา: Template Preview & Control --- */}
        <div className="flex flex-col items-center gap-8 w-full md:w-auto">
          
          {/* ส่วนเลือกเฟรม */}
          <div className="w-full max-w-[280px] bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <label className="block text-sm font-medium text-gray-600 mb-3 text-center">Select Frame</label>
            <div className="grid grid-cols-1 gap-2">
              {FRAME_OPTIONS.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`px-4 py-3 rounded-lg text-xs text-left border transition ${
                    selectedFrame === frame.id 
                      ? 'bg-black text-white border-black' 
                      : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {frame.title}
                </button>
              ))}
            </div>
          </div>

          {/* Template Preview (ส่วนที่จะ Export) */}
          <div 
            ref={templateRef}
            className="bg-white p-4 lg:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] w-[260px] lg:w-[280px] flex flex-col gap-3 rounded-md"
            style={{ border: '1px solid #f3f3f3' }}
          >
            {/* Photo Slots พร้อมเฟรมภาพซ้อนทับ */}
            <div className="grid grid-cols-1 gap-2 lg:gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-[#F7F7F7] overflow-hidden border border-gray-100 relative group">
                  {photos[i] ? (
                    <>
                      {/* รูปถ่าย */}
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={photos[i]} 
                        className="w-full h-full object-cover contrast-[1.03] brightness-[1.01]"
                        // กลับภาพเฉพาะกล้องหน้าเมื่อแสดงผล
                        style={{ transform: facingMode === "user" ? 'scaleX(-1)' : 'none' }}
                      />
                      {/* เฟรมภาพซ้อนทับ (Placeholder) */}
                      <div className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center z-10">
                        <span className="text-[9px] lg:text-[10px] text-white font-bold uppercase tracking-tight">{getSelectedFrameText()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-gray-300 uppercase tracking-tighter">Slot {i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Template Footer */}
            <div className="mt-3 mb-1 flex flex-col items-center gap-1 border-t border-gray-100 pt-3">
              <h3 className="text-xs lg:text-sm font-serif italic text-gray-600">Birthday Memories 2026</h3>
              <p className="text-[8px] lg:text-[9px] tracking-[0.3em] text-gray-300 uppercase">CELEBRATION ROAD</p>
            </div>
          </div>

          {/* Download & Reset */}
          <AnimatePresence>
            {photos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                <button onClick={resetPhotos} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition">
                  <RefreshCcw size={16} /> Reset
                </button>
                <button onClick={downloadImage} className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-md">
                  <Download size={18} /> Save Image
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
