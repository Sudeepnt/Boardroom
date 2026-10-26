import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MonitorPlay } from 'lucide-react'
import { OWNER } from './data'

export function Caption({ caption, className = '', style }) {
  return (
    <div className={`max-w-full ${className}`} style={style}>
      {caption && (
        <div className="text-center">
          <div className={`mb-1 font-mono text-[9.5px] uppercase tracking-[0.2em] ${caption.who === 'owner' ? 'text-white/60' : 'text-azure'}`}>{caption.name}</div>
          <p className={`line-clamp-2 text-[13px] leading-[18px] ${caption.who === 'owner' ? 'text-white/70' : 'text-white'}`}>{caption.text}</p>
        </div>
      )}
    </div>
  )
}

export function Orb({ agent, size = 64, active, thinking, speaking }) {
  const Icon = agent.icon
  const h = agent.hue
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute -inset-3 rounded-full blur-xl transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, hsla(${h},100%,65%,.55), transparent 70%)`, opacity: active ? 0.95 : 0.22 }}
      />
      {speaking && [0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `hsla(${h},100%,70%,.6)` }}
          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9, ease: 'easeOut' }}
        />
      ))}
      <div
        className={`absolute inset-0 rounded-full p-[1.5px] ${thinking ? 'spin-fast' : 'spin-slow'}`}
        style={{ background: `conic-gradient(from 0deg, hsla(${h},100%,72%,.95), transparent 35%, hsla(${h},100%,70%,.15) 70%, hsla(${h},100%,72%,.95))` }}
      >
        <div className="h-full w-full rounded-full bg-[#080b14]" />
      </div>
      <div
        className="absolute inset-[5px] grid place-items-center rounded-full"
        style={{ background: `radial-gradient(circle at 30% 25%, hsla(${h},90%,60%,.38), #0a0e1a 66%)` }}
      >
        <Icon size={size * 0.36} strokeWidth={1.4} className="text-white/90" />
      </div>
    </div>
  )
}

function Wave({ on }) {
  return (
    <div className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2px] origin-bottom rounded-full bg-azure"
          style={{ height: '100%', animation: `bar ${on ? 0.7 + i * 0.09 : 2.6}s ease-in-out ${i * 0.12}s infinite`, opacity: on ? 1 : 0.35, transform: 'scaleY(.3)' }}
        />
      ))}
    </div>
  )
}

function Seat({ agent, index, selected, thinking, speaking, onSelect, onView, entered, s, compact }) {
  const isSel = selected === agent.id
  const isThinking = thinking?.agent === agent.id
  const isSpeaking = speaking === agent.id
  const status = isThinking ? thinking.label + '…' : isSpeaking ? 'Speaking' : isSel ? agent.idle : agent.status
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${agent.pos.x}%`, top: `${agent.pos.y}%` }}>
      <div style={{ transform: `scale(${s})` }}>
      <motion.div
        role="button" tabIndex={0}
        onClick={() => onSelect(agent.id)}
        initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(8px)' }}
        animate={entered ? { opacity: 1, y: 0, scale: isSel ? 1.04 : 1, filter: 'blur(0px)' } : {}}
        transition={{ delay: entered ? 0.5 + index * 0.18 : 0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className={`group relative flex w-[138px] cursor-pointer flex-col items-center gap-2.5 rounded-3xl px-3 pb-3 pt-4 text-center outline-none transition-colors duration-500 ${isSel ? 'glass' : 'border border-transparent hover:bg-white/[0.03]'}`}
        style={isSel ? { boxShadow: '0 0 0 1px rgba(77,141,255,.55), 0 0 50px -8px rgba(77,141,255,.55), inset 0 1px 0 rgba(255,255,255,.1)' } : {}}
      >
        <Orb agent={agent} size={compact ? 46 : 58} active={isSel || isThinking || isSpeaking} thinking={isThinking} speaking={isSpeaking} />
        <div className="min-w-0">
          <div className="text-[13px] font-medium leading-tight tracking-tight text-white">{agent.name}</div>
          <div className={`mt-1 line-clamp-2 ${compact ? 'hidden' : ''} min-h-[26px] text-[10.5px] leading-[13px] ${isThinking ? 'text-azure' : 'text-white/45'}`}>{status}</div>
        </div>
        <div className={`items-center gap-1.5 ${compact ? 'hidden' : 'flex'}`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <Wave on={isSpeaking || isThinking} />
        </div>
        <button onClick={(e) => { e.stopPropagation(); onView(agent.id) }} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/60 transition hover:border-azure/60 hover:bg-azure/15 hover:text-white"><MonitorPlay size={11} />View screen</button>
      </motion.div>
      </div>
    </div>
  )
}

export function Stage({ agents, selected, thinking, speaking, onSelect, onView, entered, seconds, caption }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const sel = agents.find((a) => a.id === selected)
  const box = useRef(null)
  const [size, setSize] = useState({ w: 1100, h: 600 })
  const cardScale = Math.max(0.5, Math.min(size.w / 1150, size.h / 600, 1.1))
  const compact = size.h < 480 || size.w < 760
  const tableD = Math.round(Math.min(size.h * 0.66, size.w * 0.5))
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
      {/* ambient light */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 70% at 50% -10%, rgba(77,141,255,.20), transparent 70%)' }} />
      <div className="pointer-events-none absolute left-[18%] top-[30%] h-[40%] w-[40%] rounded-full bg-[#2a5cff]/10 blur-[120px]" style={{ animation: 'drift 14s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '34px 34px', maskImage: 'radial-gradient(ellipse 60% 55% at 50% 55%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 55%, black, transparent 75%)' }} />

      <div className="absolute inset-0">
      {/* table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={entered ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2"
        style={{ width: tableD, height: tableD }}
      >
        <div className="absolute -inset-6 rounded-full bg-azure/10 blur-3xl" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 22%, rgba(120,160,255,.16), rgba(10,14,26,.92) 55%, rgba(5,6,10,.98))',
            border: '1px solid rgba(255,255,255,.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14), inset 0 -30px 60px rgba(0,0,0,.6), 0 40px 80px -20px rgba(0,0,0,.8), 0 0 0 10px rgba(255,255,255,.012)',
          }}
        />
        <div className="absolute inset-[9%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[22%] rounded-full border border-dashed border-white/[0.06]" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <Caption caption={caption} className="mx-auto h-[56px]" style={{ width: tableD * 0.74 }} />
          </div>
        </div>
      </motion.div>


      {/* beams */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4d8dff" stopOpacity="0" />
            <stop offset="1" stopColor="#4d8dff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {agents.map((a) => (
          <line key={a.id} x1={a.pos.x} y1={a.pos.y + 9} x2={a.pos.x + (50 - a.pos.x) * 0.6} y2={a.pos.y + 9 + (60 - a.pos.y - 9) * 0.6} stroke="rgba(255,255,255,.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {sel && (
          <motion.line
            key={sel.id}
            x1={sel.pos.x} y1={sel.pos.y + 9} x2={sel.pos.x + (50 - sel.pos.x) * 0.6} y2={sel.pos.y + 9 + (60 - sel.pos.y - 9) * 0.6}
            stroke="#4d8dff" strokeWidth="1.5" strokeDasharray="3 5" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.8 }}
            style={{ filter: 'drop-shadow(0 0 6px #4d8dff)' }}
          />
        )}
        
      </svg>

      {agents.map((a, i) => (
        <Seat key={a.id} agent={a} index={i} s={cardScale} compact={compact} selected={selected} thinking={thinking} speaking={speaking} onSelect={onSelect} onView={onView} entered={entered} />
      ))}

      </div>
    </div>
  )
}

export function MobileAgents({ agents, selected, thinking, speaking, onSelect }) {
  return (
    <div className="scroll-thin flex shrink-0 gap-2 overflow-x-auto px-4 pb-3 pt-1 lg:hidden">
      {agents.map((a) => {
        const isSel = selected === a.id
        const isThinking = thinking?.agent === a.id
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-left transition ${isSel ? 'glass' : 'border border-white/5'}`}
            style={isSel ? { boxShadow: '0 0 0 1px rgba(77,141,255,.55), 0 0 30px -6px rgba(77,141,255,.5)' } : {}}
          >
            <Orb agent={a} size={34} active={isSel} thinking={isThinking} speaking={speaking === a.id} />
            <div>
              <div className="text-[12px] font-medium leading-tight">{a.short === 'BD' ? 'Biz Dev' : a.name}</div>
              <div className={`text-[10px] ${isThinking ? 'text-azure' : 'text-white/40'}`}>{isThinking ? thinking.label : 'Online'}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function Filmstrip({ agents, selected, thinking, speaking, presenter, onSelect }) {
  return (
    <div className="scroll-thin flex shrink-0 items-center gap-3 overflow-x-auto px-4 pb-3 pt-1" style={{ justifyContent: 'safe center' }}>
      {agents.map((a) => {
        const isPres = presenter === a.id
        const isSpeaking = speaking === a.id
        const isThinking = thinking?.agent === a.id
        return (
          <motion.button
            layout
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="glass relative flex h-[84px] w-[132px] [@media(max-height:720px)]:h-[64px] [@media(max-height:720px)]:w-[110px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl"
            style={isSpeaking || isPres ? { boxShadow: `0 0 0 1.5px ${isSpeaking ? '#4d8dff' : 'rgba(77,141,255,.4)'}, 0 0 30px -6px rgba(77,141,255,.6)` } : {}}
          >
            <Orb agent={a} size={34} active={selected === a.id || isSpeaking} thinking={isThinking} speaking={isSpeaking} />
            <span className="text-[11px] font-medium leading-none">{a.short === 'BD' ? 'Biz Dev' : a.name}</span>
            {isPres && <span className="absolute right-2 top-2 rounded bg-azure px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider">Sharing</span>}
            {isSpeaking && <span className="absolute left-2 top-2"><Wave on /></span>}
          </motion.button>
        )
      })}
    </div>
  )
}
