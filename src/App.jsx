import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AGENTS, OWNER, TASKS_INITIAL, SUGGESTIONS, PRESENTER, SCREEN_OF, thinkingLabels } from './data'
import { Stage, MobileAgents, Filmstrip, Caption } from './Stage'
import { Transcript, ControlBar, Intro } from './Chat'
import { EmailPanel, RunwayPanel, OpsPanel, MarketingPanel, SalesPanel } from './Panels'

const PITCH = { bd: 1, finance: 0.82, marketing: 1.18, sales: 0.95, ops: 0.75 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const GREETINGS = {
  bd: 'Business Development here. 14 live threads and a 400-contact sequence in flight. What would you like to know?',
  finance: 'Finance here. Books are reconciled through yesterday. Ask me about cash, burn or forecasts.',
  marketing: 'Marketing here. Three campaigns are scheduled this week.',
  sales: 'Sales here. Pipeline synced two minutes ago.',
  ops: 'Operations here. I have flagged items in the task queue whenever you are ready.',
}
const VIEW_LINE = {
  bd: 'Sharing my screen: the outreach sequence and the live email template.',
  finance: 'Sharing my screen: cash, burn and the runway forecast.',
  marketing: 'Sharing my screen: campaign performance and sign-ups.',
  sales: 'Sharing my screen: the pipeline and our top deals.',
  ops: 'Sharing my screen: the execution queue.',
}
const FALLBACK = {
  marketing: 'Newsletter open rate is 41%, up 6 points. Three campaigns go live this week and the Q4 changelog ships Thursday.',
  sales: 'Three qualified demos are booked this week and pipeline sits at $84k. Meridian Freight is the strongest lead.',
  bd: 'Understood. Outreach is steady, so ask me about emails sent, replies, or the template.',
  finance: 'Books are reconciled through yesterday. Ask me about runway or burn.',
  ops: 'The queue is moving, but two tasks are delayed. Ask me for the status update.',
}

function detect(t, { panel, email, selected }) {
  if (panel === 'ops' && /approve|go ahead|execute|do it|proceed|confirm|yes/.test(t)) return 'approve'
  if (panel === 'email' && email.rewrote && /a\/b|test|yes|go ahead|send/.test(t)) return 'abtest'
  if (/rewrite|rephrase|reword|customer'?s? problem|pain/.test(t)) return 'rewrite'
  if (/template|inspect|show.*email|see.*email|view.*email|open.*email|the email/.test(t)) return 'template'
  if (/how many|sent|replies|outreach/.test(t)) return 'count'
  if (/runway|burn|cash|months/.test(t)) return 'runway'
  if (selected === 'ops' || /delay|task|operations|plan|late|status/.test(t)) return 'ops'
  if (/marketing|campaign|newsletter/.test(t)) return 'marketing'
  if (/sales|pipeline|demo/.test(t)) return 'sales'
  return 'fallback'
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(null)
  const [speaking, setSpeaking] = useState(null)
  const [panel, setPanel] = useState(null)
  const [email, setEmail] = useState({ version: 1, rewriting: false, streaming: false, rewrote: false, abtest: false })
  const [tasks, setTasks] = useState(TASKS_INITIAL)
  const [approved, setApproved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [voice, setVoice] = useState(true)
  const [done, setDone] = useState([])
  const [demo, setDemo] = useState(false)
  const [seconds, setSeconds] = useState(754)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)

  const idRef = useRef(0)
  const busyRef = useRef(false)
  const cancelRef = useRef(false)
  const greeted = useRef(new Set())
  const recRef = useRef(null)
  const voiceRef = useRef(true)
  voiceRef.current = voice
  const live = useRef({})
  live.current = { panel, email, selected }

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const fn = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  useEffect(() => {
    if (!entered) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [entered])

  const speakAloud = (who, text) =>
    new Promise((res) => {
      if (!voiceRef.current || !('speechSynthesis' in window)) return res()
      const u = new SpeechSynthesisUtterance(text)
      const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))
      if (voices.length) u.voice = voices[AGENTS.findIndex((a) => a.id === who) % voices.length]
      u.pitch = PITCH[who] ?? 1
      u.rate = 1.05
      u.onend = u.onerror = () => res()
      speechSynthesis.speak(u)
      setTimeout(res, text.length * 90 + 2500)
    })

  const say = async (who, text, extra = {}) => {
    const id = ++idRef.current
    const voiced = who !== 'owner' && voiceRef.current && 'speechSynthesis' in window
    setMessages((m) => [...m, { id, who, text: '', full: text.length, time: now(), ...extra }])
    if (who !== 'owner') setSpeaking(who)
    const talk = voiced ? speakAloud(who, text) : Promise.resolve()
    for (let i = 2; i < text.length + 2; i += 2) {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, text: text.slice(0, i) } : x)))
      await sleep(voiced ? 105 : 15)
    }
    await talk
    setSpeaking(null)
  }
  const sys = (text) => setMessages((m) => [...m, { id: ++idRef.current, who: 'sys', text, full: text.length, time: now() }])
  const share = (type) => {
    if (live.current.panel !== type) sys(`${AGENTS.find((a) => a.id === PRESENTER[type]).name} is sharing their screen`)
    live.current.panel = type
    setPanel(type)
  }
  const stopShare = () => {
    const p = live.current.panel
    if (!p) return
    sys(`${AGENTS.find((a) => a.id === PRESENTER[p]).name} stopped sharing`)
    live.current.panel = null
    setPanel(null)
  }
  const think = async (agent, ms) => {
    const labels = thinkingLabels[agent]
    for (const label of labels) {
      setThinking({ agent, label })
      await sleep(ms / labels.length)
    }
    setThinking(null)
  }

  const view = async (id) => {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true)
    setSelected(id); greeted.current.add(id)
    if (live.current.panel === SCREEN_OF[id]) { busyRef.current = false; setBusy(false); return }
    await think(id, 700)
    share(SCREEN_OF[id])
    await say(id, VIEW_LINE[id])
    busyRef.current = false; setBusy(false)
  }

  const select = async (id, greet = true) => {
    setSelected(id)
    if (greet && !busyRef.current && !greeted.current.has(id)) {
      greeted.current.add(id)
      busyRef.current = true; setBusy(true)
      await say(id, GREETINGS[id])
      busyRef.current = false; setBusy(false)
    }
  }

  const send = async (raw) => {
    const text = raw.trim()
    if (!text || busyRef.current) return
    busyRef.current = true; setBusy(true)
    await say('owner', text)
    await sleep(250)
    const intent = detect(text.toLowerCase(), live.current)
    setDone((d) => [...d, intent])
    const go = (id) => { setSelected(id); greeted.current.add(id) }

    if (intent === 'count') {
      go('bd'); await think('bd', 1500)
      await say('bd', '400 emails sent, 3 replies received.', { chips: [{ l: 'Sent', v: '400' }, { l: 'Replies', v: '3' }, { l: 'Reply rate', v: '0.75%' }] })
    } else if (intent === 'template') {
      go('bd'); await think('bd', 1100)
      share('email')
      await say('bd', "Here's the live template. It leads with our product and asks for 45 minutes, which probably explains the low reply rate.")
    } else if (intent === 'rewrite') {
      go('bd'); share('email')
      setEmail((e) => ({ ...e, version: 1, rewriting: true }))
      await say('bd', 'On it. Rewriting around what the customer is struggling with.')
      await think('bd', 2400)
      setEmail((e) => ({ ...e, version: 2, rewriting: false, streaming: true, rewrote: true }))
      await sleep(500)
      say('bd', 'Done. It now opens with their problem, product talk is down 58%, and the ask is a 2-minute walkthrough. Want me to A/B test it on the next 100 sends?').then(() => {})
      await sleep(2800)
      setEmail((e) => ({ ...e, streaming: false }))
      await sleep(2400)
    } else if (intent === 'abtest') {
      go('bd'); setEmail((e) => ({ ...e, abtest: true }))
      await say('bd', 'Queued. v2 goes to the next 100 contacts, split 50/50 against v1. I will report back in 48 hours.')
    } else if (intent === 'runway') {
      go('finance'); await think('finance', 1900)
      share('runway')
      await say('finance', '6 months at the current burn rate.', { chips: [{ l: 'Cash', v: '$252k' }, { l: 'Net burn', v: '$42k/mo' }] })
      await say('finance', 'Closing the Meridian pilot would add about three weeks. Tap any lever on the right to see the effect.')
    } else if (intent === 'ops') {
      go('ops'); await think('ops', 2400)
      share('ops')
      await say('ops', 'Two tasks are delayed: the billing migration and pilot onboarding. Both are waiting on external inputs.')
      await say('ops', "I've prepared an execution plan that recovers both by Friday. It needs your approval to start.")
    } else if (intent === 'approve') {
      setApproved(true)
      setTasks((ts) => ts.map((t) => (t.status === 'delayed' ? { ...t, status: 'in-progress' } : t)))
      await say('ops', 'Approved. The VAT filing is in motion and the security questionnaire is drafted. Both delayed tasks are now in progress.')
    } else {
      const id = intent === 'marketing' || intent === 'sales' ? intent : live.current.selected
      if (!id) {
        await say('bd', 'Select a department first and I will route your question to the right agent.', { who: 'bd' })
      } else {
        go(id); await think(id, 1300)
        if (id === 'marketing' || id === 'sales') share(id)
        await say(id, FALLBACK[id])
      }
    }
    busyRef.current = false; setBusy(false)
  }

  const reset = () => {
    stopListen(); setMessages([]); setPanel(null); live.current.panel = null; setSelected(null); setApproved(false); setDone([])
    setEmail({ version: 1, rewriting: false, streaming: false, rewrote: false, abtest: false })
    setTasks(TASKS_INITIAL); greeted.current = new Set()
  }

  const stopListen = () => {
    recRef.current?.abort?.(); recRef.current = null
    setListening(false); setInterim('')
  }

  // scripted "speech": the mic lights up and live captions type out, so the demo never depends on a real microphone
  const simulate = async (text, agent) => {
    if (busyRef.current) return
    if (agent) { setSelected(agent); greeted.current.add(agent) }
    setListening(true)
    await sleep(800)
    for (let i = 1; i <= text.length && !cancelRef.current; i++) { setInterim(text.slice(0, i)); await sleep(26) }
    await sleep(450)
    setListening(false); setInterim('')
    if (!cancelRef.current) await send(text)
  }

  const hint = (() => {
    const next = SUGGESTIONS.find((s) => !done.includes(detect(s.text.toLowerCase(), { panel: null, email: {}, selected: s.agent })))
    if (next) return next
    if (panel === 'ops' && !approved) return { text: 'Approve the plan', agent: 'ops' }
    return null
  })()

  const onMic = () => {
    if (listening) return stopListen()
    if (busyRef.current) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const fallback = () => { if (hint) simulate(hint.text, hint.agent) }
    if (!SR) return fallback()
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false
    let got = false
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('')
      setInterim(t)
      if (e.results[e.results.length - 1].isFinal) {
        got = true
        setTimeout(() => { recRef.current = null; setListening(false); setInterim(''); send(t) }, 450)
      }
    }
    rec.onerror = (e) => {
      if (got) return
      recRef.current = null; setListening(false)
      if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture'].includes(e.error)) fallback()
    }
    rec.onend = () => { if (!got && recRef.current === rec) { recRef.current = null; setListening(false); setInterim('') } }
    recRef.current = rec; setListening(true)
    try { rec.start() } catch { recRef.current = null; setListening(false); fallback() }
  }

  const runDemo = async () => {
    if (demo) { cancelRef.current = true; return }
    if (busyRef.current) return
    cancelRef.current = false; setDemo(true); reset()
    await sleep(700)
    for (const step of SUGGESTIONS) {
      if (cancelRef.current) break
      await simulate(step.text, step.agent)
      await sleep(1200)
    }
    if (!cancelRef.current) await simulate('Approve the plan', 'ops')
    setDemo(false)
  }

  const caption = (() => {
    const clip = (t) => (t.length > 95 ? '…' + t.slice(-90).replace(/^\S*\s/, '') : t)
    if (interim) return { who: 'owner', name: OWNER.name, text: clip(interim) }
    const m = [...messages].reverse().find((x) => x.who !== 'sys')
    if (!m || !m.text) return null
    return { who: m.who, name: m.who === 'owner' ? OWNER.name : AGENTS.find((a) => a.id === m.who)?.name, text: clip(m.text) }
  })()

  const renderPanel = () => (
    <>
      {panel === 'email' && <EmailPanel email={email} setEmail={setEmail} onClose={stopShare} />}
      {panel === 'marketing' && <MarketingPanel onClose={stopShare} />}
      {panel === 'sales' && <SalesPanel onClose={stopShare} />}
      {panel === 'runway' && <RunwayPanel onClose={stopShare} />}
      {panel === 'ops' && <OpsPanel tasks={tasks} setTasks={setTasks} approved={approved} onApprove={() => send('Approve the plan')} onClose={stopShare} />}
    </>
  )

  return (
    <div className="noise relative flex h-full flex-col overflow-hidden">
      <AnimatePresence>{!entered && <Intro onEnter={() => setEntered(true)} />}</AnimatePresence>

      <header className="relative z-20 flex shrink-0 items-center justify-between px-5 py-4 lg:px-8 [@media(max-height:720px)]:py-2.5">
        <div className="flex items-center gap-3">
          <div className="spin-slow h-5 w-5 rounded-full p-[1.5px]" style={{ background: 'conic-gradient(#4d8dff, transparent 45%, #4d8dff)' }}><div className="h-full w-full rounded-full bg-[#05060a]" /></div>
          <span className="text-[15px] font-medium tracking-tight">Halo</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/60">
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure/70" /><span className="relative h-1.5 w-1.5 rounded-full bg-azure" /></span>
          Board meeting · Live
        </div>
        <div className="hidden w-[100px] text-right font-mono text-[11px] text-white/35 sm:block">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
        <div className="w-[60px] sm:hidden" />
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <MobileAgents agents={AGENTS} selected={selected} thinking={thinking} speaking={speaking} onSelect={view} />
        <Transcript messages={messages} thinking={thinking} />
        <div className="order-1 hidden min-w-0 flex-1 flex-col lg:order-2 lg:flex">
          <AnimatePresence mode="wait" initial={false}>
            {!panel ? (
              <motion.div key="stage" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <Stage agents={AGENTS} selected={selected} thinking={thinking} speaking={speaking} onSelect={select} onView={view} entered={entered} seconds={seconds} caption={caption} />
              </motion.div>
            ) : (
              <motion.div
                key="share"
                className="flex min-h-0 flex-1 flex-col px-6"
                initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Filmstrip agents={AGENTS} selected={selected} thinking={thinking} speaking={speaking} presenter={PRESENTER[panel]} onSelect={view} />
                <div className="min-h-0 flex-1 pb-1">{renderPanel()}</div>
                <Caption caption={caption} className="mx-auto mt-2 h-[52px] w-[560px] shrink-0 [@media(max-height:720px)]:hidden" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {panel && !isDesktop && (
            <motion.div key="m" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="absolute inset-0 z-30 bg-[#05060a]">
              {renderPanel()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ControlBar
        selected={selected} listening={listening} onMic={onMic} interim={interim} hint={hint?.text} onHint={() => hint && simulate(hint.text, hint.agent)}
        busy={busy} voice={voice} setVoice={(f) => { setVoice(f); if (voice) speechSynthesis?.cancel?.() }} demo={demo} onDemo={runDemo}
      />
    </div>
  )
}
