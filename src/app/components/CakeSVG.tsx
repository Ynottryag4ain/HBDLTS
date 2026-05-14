'use client'
import { motion, AnimatePresence } from 'framer-motion'

const CANDLES = [
  { cx: 112, color: '#ff6b9d' },
  { cx: 142, color: '#ffb347' },
  { cx: 172, color: '#c879ff' },
  { cx: 202, color: '#7ec8e3' },
  { cx: 232, color: '#ff6b9d' },
]

export default function CakeSVG({ blown }: { blown: boolean }) {
  return (
    <motion.div
      animate={blown ? { scale: [1, 1.05, 1], transition: { duration: 0.4 } } : {}}
      className="relative"
    >
      <svg width="320" height="300" viewBox="0 0 344 300" className="drop-shadow-2xl w-64 md:w-72 mx-auto">
        {/* Plate shadow */}
        <ellipse cx="172" cy="288" rx="130" ry="12" fill="#ffb3d0" opacity="0.4" />

        {/* Bottom tier */}
        <rect x="22" y="210" width="300" height="78" rx="22" fill="#ff9ac1" />
        <rect x="22" y="210" width="300" height="26" rx="13" fill="#ffb3d0" />
        {/* Drips */}
        {[50,95,145,195,245,290].map((x, i) => (
          <ellipse key={i} cx={x} cy={211} rx={8} ry={10+i%3*3} fill="#ff6b9d" opacity="0.65" />
        ))}
        <circle cx="70" cy="258" r="6" fill="white" opacity="0.4" />
        <circle cx="170" cy="250" r="5" fill="white" opacity="0.35" />
        <circle cx="265" cy="255" r="6" fill="white" opacity="0.4" />
        <text x="115" y="282" fontSize="12" fill="white" opacity="0.45" fontFamily="serif">♡</text>
        <text x="210" y="278" fontSize="12" fill="white" opacity="0.4" fontFamily="serif">♡</text>

        {/* Middle tier */}
        <rect x="48" y="148" width="248" height="76" rx="18" fill="#ffcde0" />
        <rect x="48" y="148" width="248" height="22" rx="11" fill="#ffd6e7" />
        {[72,115,165,215,260].map((x, i) => (
          <ellipse key={i} cx={x} cy={149} rx={7} ry={8+i%2*4} fill="#ff9ac1" opacity="0.65" />
        ))}
        <circle cx="100" cy="186" r="5" fill="#ff6b9d" opacity="0.35" />
        <circle cx="195" cy="182" r="4" fill="#ff6b9d" opacity="0.3" />
        <circle cx="265" cy="184" r="5" fill="#ff6b9d" opacity="0.35" />

        {/* Top tier */}
        <rect x="82" y="92" width="180" height="70" rx="15" fill="#fff0f6" />
        <rect x="82" y="92" width="180" height="20" rx="10" fill="#fff5f9" />
        {[102,140,175,215,245].map((x, i) => (
          <ellipse key={i} cx={x} cy={93} rx={6} ry={7+i%3*2} fill="#ffcde0" opacity="0.7" />
        ))}
        <text x="155" y="140" fontSize="18" fill="#ff9ac1" opacity="0.55" fontFamily="serif" textAnchor="middle">♡</text>
        <text x="110" y="132" fontSize="11" fill="#c879ff" opacity="0.4" fontFamily="serif">✦</text>
        <text x="210" y="134" fontSize="11" fill="#c879ff" opacity="0.4" fontFamily="serif">✦</text>

        {/* Candles */}
        {CANDLES.map((c, i) => (
          <g key={i}>
            <rect x={c.cx - 7} y={50 + i % 2 * 8} width={14} height={44 - i % 2 * 8} rx={5} fill={c.color} />
            <ellipse cx={c.cx} cy={50 + i % 2 * 8} rx={7} ry={3.5} fill="white" opacity="0.6" />

            {/* Flame */}
            <AnimatePresence>
              {!blown && (
                <motion.g
                  key="flame"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scaleY: 0, transition: { duration: 0.3, delay: i * 0.12 } }}
                  style={{ originY: '100%', originX: '50%' }}
                >
                  <motion.ellipse
                    cx={c.cx} cy={38 + i % 2 * 8} rx={5} ry={9}
                    fill="#ffe066" opacity={0.95}
                    animate={{ scaleX: [1, 0.85, 1.1, 0.9, 1], scaleY: [1, 1.08, 0.92, 1.05, 1] }}
                    transition={{ duration: 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
                    style={{ originX: `${c.cx}px`, originY: `${47 + i % 2 * 8}px` }}
                  />
                  <ellipse cx={c.cx} cy={41 + i % 2 * 8} rx={3} ry={6} fill="#ff9800" opacity={0.85} />
                  <ellipse cx={c.cx} cy={44 + i % 2 * 8} rx={1.5} ry={3} fill="white" opacity={0.7} />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Smoke after blow */}
            <AnimatePresence>
              {blown && (
                <motion.g key="smoke">
                  {[0, 1, 2].map(j => (
                    <motion.ellipse
                      key={j}
                      cx={c.cx + (j - 1) * 3}
                      cy={38 + i % 2 * 8}
                      rx={3 + j * 2} ry={3 + j}
                      fill="#ccc" opacity={0.5}
                      initial={{ opacity: 0.6, y: 0 }}
                      animate={{ opacity: 0, y: -25, scaleX: 2 }}
                      transition={{ duration: 1.2, delay: i * 0.12 + j * 0.1, ease: 'easeOut' }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          </g>
        ))}
      </svg>
    </motion.div>
  )
}
