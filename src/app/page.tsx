'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './store/appStore'
import LockScreen from './components/LockScreen'
import CardSelection from './components/CardSelection'
import CakeExperience from './components/CakeExperience'
import BirthdayLetter from './components/BirthdayLetter'
import PhotoBooth from './components/PhotoBooth'
import FinalGallery from './components/FinalGallery'
import FloatingParticles from './components/FloatingParticles'
import MusicPlayer from './components/MusicPlayer'

const screenVariants = {
  initial: { opacity: 0, scale: 0.96, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 1.02, y: -20, transition: { duration: 0.35, ease: 'easeIn' } },
}

export default function Home() {
  const screen = useAppStore((s) => s.screen)

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Global animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,107,157,0.25)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(200,121,255,0.2)_0%,transparent_60%)]" />
        <FloatingParticles />
      </div>

      <MusicPlayer />

      {/* Screen transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10 w-full h-full"
        >
          {screen === 'lock' && <LockScreen />}
          {screen === 'cards' && <CardSelection />}
          {screen === 'cake' && <CakeExperience />}
          {screen === 'letter' && <BirthdayLetter />}
          {screen === 'photobooth' && <PhotoBooth />}
          {screen === 'gallery' && <FinalGallery />}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
