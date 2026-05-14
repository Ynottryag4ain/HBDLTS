'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; emoji: string; opacity: number; rotation: number; vrot: number
}

const EMOJIS = ['💕','✨','⭐','🌸','💖','✦','💗','🌟','💫','🎀','💝','·']

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let particles: Particle[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn particles
    for (let i = 0; i < 38; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 10 + Math.random() * 14,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        opacity: 0.1 + Math.random() * 0.45,
        rotation: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.01,
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rotation += p.vrot
        if (p.y < -30) { p.y = canvas!.height + 20; p.x = Math.random() * canvas!.width }
        if (p.x < -30) p.x = canvas!.width + 20
        if (p.x > canvas!.width + 30) p.x = -20
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.font = `${p.size}px serif`
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillText(p.emoji, -p.size / 2, p.size / 2)
        ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}
