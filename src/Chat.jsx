import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react'
import { AGENTS, OWNER } from './data'

const byId = Object.fromEntries(AGENTS.map((a) => [a.id, a]))

export function Transcript({ messages, thinking }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])
  return (
    <aside className="relative order-2 flex min-h-0 flex-1 flex-col lg:hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-2 lg:px-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">Live transcript</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> REC
        </span>
      </div>
      <div
        ref={ref}
        className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 lg:px-1 lg:pr-3"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 24px)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 24px)' }}
      >
        {messages.length === 0 && !thinking && (
          <p className="pt-2 text-[13px] leading-relaxed text-white/35">The meeting is in session. Select a department, or ask a question below.</p>
        )}
        {messages.map((m) => {
          const agent = byId[m.who]
          const isOwner = m.who === 'owner'
          if (m.who === 'sys') return <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-azure/80"><span className="h-px flex-1 bg-azure/20" />{m.text}<span className="h-px flex-1 bg-azure/20" /></motion.div>
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className={isOwner ? 'text-white/80' : 'text-azure'}>{isOwner ? OWNER.name : agent?.name ?? 'Halo'}</span>
                <span className="text-white/25">{m.time}</span>
              </div>
              <p className={`text-[13.5px] leading-[1.55] ${isOwner ? 'text-white/65' : 'text-white'} ${m.text.length < (m.full ?? 0) ? 'caret' : ''}`}>{m.text}</p>
              {m.chips && m.text.length > 20 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.chips.map((c) => (
                    <span key={c.l} className="rounded-full border border-azure/25 bg-azure/10 px-2.5 py-1 font-mono text-[10.5px] text-[#9cc0ff]">
                      {c.l} <b className="font-medium text-white">{c.v}</b>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[12px] text-azure">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-1 w-1 rounded-full bg-azure" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </span>
            {byId[thinking.agent].short} · {thinking.label}
          </motion.div>
        )}
      </div>
    </aside>
  )
}

export function ControlBar({ selected, listening, onMic, interim, hint, onHint, busy, voice, onVoice, demo, onDemo }) {
  const agent = selected ? byId[selected] : null
  return (
    <div className="relative z-20 shrink-0 px-4 pb-8 pt-1 lg:pb-10 [@media(max-height:720px)]:pb-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center" style={{ zoom: 0.8 }}>
        <div className="mb-3 flex min-h-[40px] [@media(max-height:720px)]:mb-1.5 [@media(max-height:720px)]:min-h-[28px] flex-col items-center justify-end text-center">
          <AnimatePresence mode="wait">
            {interim ? (
              <motion.p key="i" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl text-[17px] font-light tracking-tight text-white">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-azure">You</span>{interim}
              </motion.p>
            ) : listening ? (
              <motion.p key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-azure">Listening{agent ? ` · speaking to ${agent.name}` : ''}…</motion.p>
            ) : busy ? (
              <motion.p key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12.5px] text-white/35">The room is speaking · tap the mic to interrupt</motion.p>
            ) : hint ? (
              <motion.button key="h" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={onHint} className="group text-[13px] text-white/40 transition hover:text-white">
                Tap the mic and say <span className="text-white/75 group-hover:text-white">“{hint}”</span>
              </motion.button>
            ) : (
              <motion.p key="d" className="text-[12.5px] text-white/35">Meeting adjourned. Tap the mic to ask anything.</motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="glass flex items-center gap-3 rounded-full p-2">
          <button onClick={onVoice} title={voice ? 'Mute agent voices' : 'Unmute agent voices'} className="grid h-11 w-11 place-items-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white">
            {voice ? <Volume2 size={18} strokeWidth={1.6} /> : <VolumeX size={18} strokeWidth={1.6} />}
          </button>

          <div className="flex items-center gap-3 rounded-full py-1 pl-1 pr-4">
            <div className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-white/95 to-white/60 text-[15px] font-semibold text-[#05060a]">
              CT
              <span className={`absolute -inset-1 rounded-full border transition ${listening ? 'border-azure shadow-[0_0_24px_#4d8dff]' : 'border-white/15'}`} />
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-[13.5px] font-medium leading-tight">{OWNER.name}</div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-azure">{OWNER.role}</div>
            </div>
          </div>

          <button
            onClick={onMic}
                        aria-label={listening ? 'Mute microphone' : 'Unmute and speak'}
            className={`relative grid h-16 w-16 place-items-center rounded-full transition duration-300 [@media(max-height:720px)]:h-14 [@media(max-height:720px)]:w-14 disabled:opacity-40 ${listening ? 'bg-azure text-white' : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.14]'}`}
            style={listening ? { boxShadow: '0 0 50px -2px #4d8dff' } : {}}
          >
            {listening && [0, 1].map((i) => (
              <motion.span key={i} className="absolute inset-0 rounded-full border border-azure" animate={{ scale: [1, 1.9], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9 }} />
            ))}
            {listening ? <Mic size={24} strokeWidth={1.8} /> : <MicOff size={24} strokeWidth={1.6} />}
          </button>

          <button onClick={onDemo} title="Guided demo" className={`grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/[0.08] ${demo ? 'bg-azure/25 text-white' : 'text-white/55 hover:text-white'}`}>
            {demo ? <Square size={15} fill="currentColor" /> : <Play size={17} strokeWidth={1.6} />}
          </button>
        </div>
        <div className="mt-2 font-mono text-[10px] [@media(max-height:720px)]:hidden uppercase tracking-[0.2em] text-white/30">{listening ? 'Live · tap to mute' : 'Muted · tap to speak'}</div>
      </div>
    </div>
  )
}

export function Intro({ onEnter }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') onEnter() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])
  return (
    <motion.div
      className="absolute inset-0 z-50 grid place-items-center bg-[#05060a]"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(77,141,255,.16), transparent 70%)' }} />
      <div className="relative px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4 }} className="mx-auto mb-8 h-12 w-12">
          <div className="spin-slow h-full w-full rounded-full p-[1.5px]" style={{ background: 'conic-gradient(#4d8dff, transparent 40%, #4d8dff)' }}>
            <div className="h-full w-full rounded-full bg-[#05060a]" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-azure">
          Weekly board meeting · Mondays 9:00 AM
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }} className="text-[28px] font-light tracking-tight sm:text-[34px]">
          Your AI team is ready to <span className="text-white/45">report to you.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mx-auto mt-3 max-w-sm text-[14px] text-white/40">
          Five departments are waiting in the room with this week's updates.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7, duration: 0.9 }}
          onClick={onEnter}
          className="glass mt-9 rounded-full px-7 py-3 text-[13.5px] tracking-wide transition hover:shadow-[0_0_50px_-6px_rgba(77,141,255,.7)]"
        >
          Enter weekly scheduled meeting
        </motion.button>
      </div>
    </motion.div>
  )
}
