import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, CheckCircle2, Mail, X, FlaskConical, ChevronRight } from 'lucide-react'
import { AGENTS, PRESENTER, CAMPAIGNS, SIGNUPS, FUNNEL, DEALS, EMAIL_V1, EMAIL_V2, REPLIES, RUNWAY, PLAN, STATUS_STYLE, STATUS_CYCLE, SPEND, SHARE_TITLE } from './data'
import { Orb } from './Stage'

function useStream(text, on) {
  const [n, setN] = useState(on ? 0 : text.length)
  useEffect(() => {
    if (!on) { setN(text.length); return }
    setN(0)
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 6)), 16)
    return () => clearInterval(id)
  }, [text, on])
  return text.slice(0, n)
}

function Vars({ text }) {
  return text.split(/(\{\{[^}]*\}?\}?)/).map((p, i) =>
    p.startsWith('{{') ? <span key={i} className="rounded bg-azure/15 px-1 font-mono text-[12px] text-[#9cc0ff]">{p}</span> : <span key={i}>{p}</span>,
  )
}

export function PanelShell({ type, onClose, children }) {
  const agent = AGENTS.find((a) => a.id === PRESENTER[type])
  return (
    <div
      className="glass flex h-full min-h-0 flex-col overflow-hidden lg:rounded-2xl"
      style={{ boxShadow: '0 0 0 1px rgba(77,141,255,.35), 0 0 80px -20px rgba(77,141,255,.45), 0 30px 80px -30px #000' }}
    >
      <div className="flex items-center gap-3 border-b hairline px-4 py-2.5">
        <div className="hidden gap-1.5 lg:flex">{['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full opacity-70" style={{ background: c }} />)}</div>
        <div className="hidden truncate font-mono text-[11px] text-white/40 lg:block">{SHARE_TITLE[type]}</div>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-azure/30 bg-azure/15 py-1 pl-1 pr-3 text-[11.5px]">
            <Orb agent={agent} size={20} active />
            <span className="text-white/90">{agent.name} <span className="text-white/50">is sharing their screen</span></span>
          </span>
          <button onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11.5px] text-white/70 transition hover:bg-red-500/20 hover:text-red-200">
            <X size={13} />Stop
          </button>
        </div>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

/* ---------------- EMAIL ---------------- */
export function EmailPanel({ email, setEmail, onClose }) {
  const [tab, setTab] = useState('template')
  const [reply, setReply] = useState(null)
  const showV2 = email.version === 2
  const data = showV2 ? EMAIL_V2 : EMAIL_V1
  const full = useMemo(() => data.body.join('\n\n'), [data])
  const shown = useStream(full, showV2 && email.streaming)
  const streaming = showV2 && email.streaming && shown.length < full.length

  return (
    <PanelShell type="email" onClose={onClose}>
      <div className="flex gap-1 px-6 pt-4 lg:px-8">
        {[['template', 'Template'], ['replies', `Replies · ${REPLIES.length}`]].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setReply(null) }} className={`rounded-full px-3.5 py-1.5 text-[12px] transition ${tab === k ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>{l}</button>
        ))}
      </div>

      {tab === 'template' && (
        <div className="px-6 pb-8 pt-4 lg:grid lg:grid-cols-[1.45fr_1fr] lg:items-start lg:gap-8 lg:px-8">
          <div className="mb-4 grid grid-cols-3 gap-2 lg:order-2 lg:mb-0 lg:grid-cols-1">
            {[['Sent', '400'], ['Replies', '3'], ['Open rate', '52%']].map(([l, v]) => (
              <div key={l} className="rounded-2xl border hairline bg-white/[0.02] px-3.5 py-3">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">{l}</div>
                <div className="mt-1 text-[22px] font-light tracking-tight">{v}</div>
              </div>
            ))}
          </div>

          <div className="lg:order-1 lg:row-span-3 lg:row-start-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-1 rounded-full bg-white/[0.05] p-1">
              {[1, 2].map((v) => (
                <button
                  key={v}
                  disabled={v === 2 && !email.rewrote}
                  onClick={() => setEmail((e) => ({ ...e, version: v, streaming: false }))}
                  className={`rounded-full px-3 py-1 font-mono text-[11px] transition disabled:opacity-25 ${email.version === v ? 'bg-azure text-white' : 'text-white/50'}`}
                >
                  v{v}{v === 1 ? ' · live' : ' · draft'}
                </button>
              ))}
            </div>
            {showV2 && !streaming && <span className="flex items-center gap-1 text-[11px] text-emerald-300"><Check size={12} />Updated just now</span>}
          </div>

          <div className="relative overflow-hidden rounded-2xl border hairline bg-[#0a0d16]">
            {email.rewriting && (
              <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-azure/20 to-transparent" style={{ animation: 'shimmer 1.4s ease-in-out infinite' }} />
              </div>
            )}
            <div className="space-y-1 border-b hairline px-5 py-4 text-[12px]">
              <Row k="From" v="Crodal Team <team@northwind.io>" />
              <Row k="To" v={<Vars text={data.to} />} />
              <Row k="Subject" v={<span className="font-medium text-white"><Vars text={data.subject} /></span>} />
            </div>
            <motion.div animate={{ opacity: email.rewriting ? 0.35 : 1, filter: email.rewriting ? 'blur(2px)' : 'blur(0px)' }} transition={{ duration: 0.6 }} className="px-5 py-5">
              <div className="space-y-4 text-[13.5px] leading-[1.65] text-white/80">
                {shown.split('\n\n').map((p, i, a) => (
                  <p key={i} className={`whitespace-pre-line ${streaming && i === a.length - 1 ? 'caret' : ''}`}><Vars text={p} /></p>
                ))}
              </div>
            </motion.div>
          </div>

          {email.rewriting && <div className="mt-4 flex items-center gap-2 text-[12px] text-azure"><span className="spin-fast h-3 w-3 rounded-full border border-azure border-t-transparent" />BD is rewriting around the customer's problem…</div>}
          </div>

          <AnimatePresence>
            {showV2 && !streaming && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-2 lg:order-3 lg:col-start-2 lg:mt-0">
                {EMAIL_V2.changes.map((c) => (
                  <div key={c.k} className="flex items-start gap-3 rounded-2xl border border-azure/20 bg-azure/[0.06] px-4 py-3">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-azure" />
                    <div><div className="text-[13px] font-medium">{c.k}</div><div className="text-[12px] text-white/45">{c.d}</div></div>
                  </div>
                ))}
                <button
                  onClick={() => setEmail((e) => ({ ...e, abtest: true }))}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-[13px] font-medium text-black transition hover:bg-white/90"
                >
                  {email.abtest ? <><Check size={15} />A/B test queued · next 100 sends</> : <><FlaskConical size={15} />A/B test on next 100 sends</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {tab === 'replies' && !reply && (
        <div className="space-y-2 px-6 pb-8 pt-4">
          {REPLIES.map((r) => (
            <button key={r.id} onClick={() => setReply(r)} className="group flex w-full items-center gap-3 rounded-2xl border hairline bg-white/[0.02] px-4 py-3.5 text-left transition hover:border-azure/40 hover:bg-azure/[0.05]">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[12px] font-medium">{r.from.split(' ').map((s) => s[0]).join('')}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2"><span className="truncate text-[13px] font-medium">{r.from}</span><span className="shrink-0 text-[11px] text-white/35">{r.time}</span></div>
                <div className="truncate text-[12px] text-white/45">{r.org} — {r.body}</div>
              </div>
              <ChevronRight size={15} className="shrink-0 text-white/25 transition group-hover:text-white" />
            </button>
          ))}
        </div>
      )}

      {tab === 'replies' && reply && (
        <div className="px-6 pb-8 pt-4">
          <button onClick={() => setReply(null)} className="mb-4 flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white"><ArrowLeft size={13} />All replies</button>
          <div className="rounded-2xl border hairline bg-[#0a0d16] p-5">
            <div className="mb-1 text-[14px] font-medium">{reply.subject}</div>
            <div className="mb-4 text-[12px] text-white/40">{reply.from} · {reply.org} · {reply.time}</div>
            <p className="text-[13.5px] leading-[1.65] text-white/80">{reply.body}</p>
            <span className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10.5px] ${reply.tone === 'Positive' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.06] text-white/50'}`}><Mail size={11} />{reply.tone}</span>
          </div>
        </div>
      )}
    </PanelShell>
  )
}

const Row = ({ k, v }) => (
  <div className="flex gap-3"><span className="w-14 shrink-0 text-white/35">{k}</span><span className="text-white/70">{v}</span></div>
)

/* ---------------- RUNWAY ---------------- */
const LEVERS = [
  { id: 'aws', t: 'Renegotiate AWS commitment', d: 'Save ~$1.2k / mo', save: 1200 },
  { id: 'meridian', t: 'Close Meridian Freight pilot', d: 'Adds $4.2k MRR', save: 4200 },
]

export function RunwayPanel({ onClose }) {
  const [on, setOn] = useState([])
  const saved = LEVERS.filter((l) => on.includes(l.id)).reduce((s, l) => s + l.save, 0)
  const burn = RUNWAY.burn - saved
  const months = RUNWAY.cash / burn
  // chart
  const W = 360, H = 150, P = 8
  const past = [462, 420, 378, 336, 294, 252]
  const totalPts = 13
  const x = (i) => P + (i / (totalPts - 1)) * (W - P * 2)
  const y = (v) => H - P - (v / 500) * (H - P * 2)
  const proj = Array.from({ length: 7 }, (_, i) => Math.max(0, 252 - (burn / 1000) * i))
  const pastPath = past.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  const projPath = proj.map((v, i) => `${i ? 'L' : 'M'}${x(5 + i)},${y(v)}`).join(' ')
  const runout = Math.min(months, 6)
  const endX = x(5 + months > 12 ? 12 : 5 + months)
  return (
    <PanelShell type="runway" onClose={onClose}>
      <div className="px-6 pb-8 pt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-8 lg:px-8">
        <div>
        <div className="flex items-end gap-3">
          <motion.div key={months.toFixed(1)} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[64px] font-extralight leading-none tracking-tighter">{months.toFixed(1)}</motion.div>
          <div className="pb-2 text-[14px] text-white/45">months at current burn</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[['Cash', '$252k'], ['Net burn', `$${(burn / 1000).toFixed(1)}k/mo`], ['Revenue', '$18.4k/mo']].map(([l, v]) => (
            <div key={l} className="rounded-2xl border hairline bg-white/[0.02] px-3.5 py-3">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">{l}</div>
              <div className="mt-1 text-[17px] font-light tracking-tight">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border hairline bg-white/[0.02] p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4d8dff" stopOpacity=".35" /><stop offset="1" stopColor="#4d8dff" stopOpacity="0" /></linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => <line key={i} x1={P} x2={W - P} y1={P + i * 44} y2={P + i * 44} stroke="rgba(255,255,255,.05)" />)}
            <path d={`${pastPath} L${x(5)},${H - P} L${x(0)},${H - P} Z`} fill="url(#fill)" />
            <path d={pastPath} fill="none" stroke="#4d8dff" strokeWidth="2" strokeLinecap="round" />
            <motion.path key={burn} d={projPath} fill="none" stroke="#9cc0ff" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }} />
            <circle cx={x(5)} cy={y(252)} r="4.5" fill="#05060a" stroke="#4d8dff" strokeWidth="2" />
            <circle cx={x(5)} cy={y(252)} r="10" fill="#4d8dff" opacity=".2"><animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" /></circle>
            <circle cx={x(5 + runout)} cy={y(proj[Math.min(6, Math.round(runout))])} r="0" />
          </svg>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-white/30"><span>May</span><span>Oct · today</span><span>Apr '27</span></div>
        </div>

        </div>
        <div>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 lg:mt-0">Where the money goes · monthly</div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
          {SPEND.map((x) => <div key={x.k} style={{ width: `${(x.v / 60400) * 100}%`, background: x.c }} />)}
        </div>
        <div className="mt-3 space-y-1.5">
          {SPEND.map((x) => (
            <div key={x.k} className="flex items-center gap-2.5 text-[12.5px]"><span className="h-2 w-2 rounded-full" style={{ background: x.c }} /><span className="flex-1 text-white/60">{x.k}</span><span className="font-mono text-white/80">${(x.v / 1000).toFixed(1)}k</span></div>
          ))}
        </div>
        <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Extend your runway</div>
        <div className="mt-3 space-y-2">
          {LEVERS.map((l) => {
            const active = on.includes(l.id)
            return (
              <button key={l.id} onClick={() => setOn((o) => (active ? o.filter((i) => i !== l.id) : [...o, l.id]))} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${active ? 'border-azure/50 bg-azure/10' : 'hairline bg-white/[0.02] hover:border-white/20'}`}>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? 'border-azure bg-azure' : 'border-white/20'}`}>{active && <Check size={12} />}</span>
                <div className="flex-1"><div className="text-[13px] font-medium">{l.t}</div><div className="text-[12px] text-white/45">{l.d}</div></div>
                <span className="font-mono text-[11px] text-azure">+{(RUNWAY.cash / (RUNWAY.burn - l.save) - 6).toFixed(1)} mo</span>
              </button>
            )
          })}
        </div>
        </div>
      </div>
    </PanelShell>
  )
}

/* ---------------- OPS ---------------- */
export function OpsPanel({ tasks, setTasks, approved, onApprove, onClose }) {
  const delayed = tasks.filter((t) => t.status === 'delayed').length
  const cycle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % 3] } : t)))
  return (
    <PanelShell type="ops" onClose={onClose}>
      <div className="px-6 pb-8 pt-5 lg:grid lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
        <div className="mb-4 flex items-center gap-2 text-[13px]">
          <span className={`h-2 w-2 rounded-full ${delayed ? 'bg-[#ff6b6b]' : 'bg-emerald-400'}`} style={{ boxShadow: `0 0 12px ${delayed ? '#ff6b6b' : '#4ade9a'}` }} />
          <span className="text-white/70">{delayed ? `${delayed} delayed task${delayed > 1 ? 's' : ''}` : 'No delays — all tasks on track'}</span>
          <span className="ml-auto text-[11px] text-white/30">Tap a status to change it</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {tasks.map((t) => {
              const s = STATUS_STYLE[t.status]
              return (
                <motion.div layout key={t.id} className="rounded-2xl border hairline bg-white/[0.02] px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className={`text-[13.5px] font-medium ${t.status === 'done' ? 'text-white/45 line-through' : ''}`}>{t.title}</div>
                      <div className="mt-0.5 text-[12px] text-white/40">{t.owner} · Due {t.due}</div>
                    </div>
                    <button onClick={() => cycle(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition hover:brightness-125 ${s.bg} ${s.text}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />{s.label}
                    </button>
                  </div>
                  {t.status === 'delayed' && <div className="mt-2 text-[12px] text-[#ff9a9a]/80">{t.note}</div>}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        </div>
        <div>
        <div className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 lg:mt-0">Recovery plan · lands Friday</div>
        <div className="relative space-y-4 pl-5">
          <div className="absolute bottom-2 left-[5px] top-2 w-px bg-gradient-to-b from-azure/60 to-transparent" />
          {PLAN.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i + 0.2 }} className="relative">
              <span className={`absolute -left-5 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[#05060a] ${approved ? 'bg-emerald-400' : 'bg-azure'}`} />
              <div className="font-mono text-[10.5px] text-azure">{p.t}</div>
              <div className="text-[13px] leading-snug text-white/80">{p.s}</div>
            </motion.div>
          ))}
        </div>
        <button onClick={onApprove} disabled={approved} className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13.5px] font-medium transition ${approved ? 'bg-emerald-400/15 text-emerald-300' : 'bg-azure text-white shadow-[0_0_40px_-6px_#4d8dff] hover:scale-[1.01]'}`}>
          {approved ? <><Check size={16} />Plan approved · executing</> : 'Approve execution plan'}
        </button>
        </div>
      </div>
    </PanelShell>
  )
}

/* ---------------- MARKETING ---------------- */
export function MarketingPanel({ onClose }) {
  const max = Math.max(...SIGNUPS)
  return (
    <PanelShell type="marketing" onClose={onClose}>
      <div className="px-6 pb-8 pt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-8 lg:px-8">
        <div>
          <div className="flex items-end gap-3">
            <div className="text-[64px] font-extralight leading-none tracking-tighter">41%</div>
            <div className="pb-2 text-[14px] text-white/45">newsletter open rate <span className="text-emerald-300">↑ 6 pts</span></div>
          </div>
          <div className="mt-6 rounded-2xl border hairline bg-white/[0.02] p-4">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Weekly sign-ups</div>
            <div className="flex h-32 items-end gap-2">
              {SIGNUPS.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[10px] text-white/40">{v}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: i * 0.07, duration: 0.7 }} className="w-full rounded-t-md" style={{ background: i === SIGNUPS.length - 1 ? '#4d8dff' : 'rgba(77,141,255,.28)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Live campaigns</div>
          <div className="mt-3 space-y-2">
            {CAMPAIGNS.map((c) => (
              <div key={c.n} className="rounded-2xl border hairline bg-white/[0.02] px-4 py-3.5">
                <div className="flex items-baseline justify-between"><span className="text-[13px] font-medium">{c.n}</span><span className="font-mono text-[10px] text-azure">{c.ch}</span></div>
                <div className="mt-1 flex justify-between text-[12px] text-white/45"><span>{c.m}</span><span>{c.r}</span></div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: `${c.p}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full bg-azure" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}

/* ---------------- SALES ---------------- */
export function SalesPanel({ onClose }) {
  return (
    <PanelShell type="sales" onClose={onClose}>
      <div className="px-6 pb-8 pt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-8 lg:px-8">
        <div>
          <div className="flex items-end gap-3">
            <div className="text-[64px] font-extralight leading-none tracking-tighter">$84k</div>
            <div className="pb-2 text-[14px] text-white/45">open pipeline · 3 demos this week</div>
          </div>
          <div className="mt-6 space-y-2.5 rounded-2xl border hairline bg-white/[0.02] p-5">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Funnel · last 30 days</div>
            {FUNNEL.map((f, i) => (
              <div key={f.k} className="flex items-center gap-3">
                <span className="w-16 text-[12px] text-white/50">{f.k}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max((f.v / FUNNEL[0].v) * 100, 6)}%` }} transition={{ delay: i * 0.1, duration: 0.8 }} className="flex h-full items-center rounded-lg px-2.5 font-mono text-[11px]" style={{ background: `rgba(77,141,255,${0.85 - i * 0.14})` }}>{f.v}</motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Top deals</div>
          <div className="mt-3 space-y-2">
            {DEALS.map((d) => (
              <div key={d.n} className="flex items-center gap-3 rounded-2xl border hairline bg-white/[0.02] px-4 py-3.5">
                <span className={`h-2 w-2 rounded-full ${d.hot ? 'bg-azure shadow-[0_0_10px_#4d8dff]' : 'bg-white/20'}`} />
                <div className="flex-1"><div className="text-[13px] font-medium">{d.n}</div><div className="text-[12px] text-white/45">{d.s}</div></div>
                <span className="font-mono text-[12px]">${d.v / 1000}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
