'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

export default function MusicPlayer() {
  const { musicOn, toggleMusic } = useAppStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // We use a free loopable music URL (royalty-free piano)
    audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.35
    return () => { audioRef.current?.pause() }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    if (musicOn) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [musicOn])

  return (
    <motion.button
      className="fixed top-4 right-4 z-50 glass rounded-full w-11 h-11 flex items-center justify-center text-xl shadow-lg"
      onClick={toggleMusic}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.1 }}
      title={musicOn ? 'Mute music' : 'Play music'}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 1 } }}
    >
      <motion.span
        animate={musicOn ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={musicOn ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
      >
        {musicOn ? '🎵' : '🔇'}
      </motion.span>
    </motion.button>
  )
}
