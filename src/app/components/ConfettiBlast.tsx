'use client'
import { useEffect } from 'react'

declare global {
  interface Window { confetti?: any }
}

export default function ConfettiBlast() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
    script.onload = () => {
      const conf = window.confetti
      if (!conf) return
      const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 999 }
      function burst(x: number, y: number) {
        conf({ ...defaults, origin: { x, y }, colors: ['#ff6b9d','#ffb3d0','#c879ff','#7ec8e3','#ffec8b','#fff0f6'] })
      }
      burst(0.25, 0.35)
      setTimeout(() => burst(0.75, 0.35), 200)
      setTimeout(() => burst(0.5, 0.5), 400)
      setTimeout(() => burst(0.15, 0.6), 600)
      setTimeout(() => burst(0.85, 0.6), 700)
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])
  return null
}
