import { Briefcase, Landmark, Megaphone, Handshake, Workflow } from 'lucide-react'

export const OWNER = { name: 'Crodal Team', role: 'Founders & Leadership', company: 'Northwind Labs' }

export const AGENTS = [
  { id: 'bd', name: 'Business Development', short: 'BD', icon: Briefcase, status: 'Running outreach sequence', idle: 'Monitoring 14 live threads', pos: { x: 19, y: 64 }, hue: 215 },
  { id: 'finance', name: 'Finance', short: 'FIN', icon: Landmark, status: 'Reconciling October ledger', idle: 'Forecast model current', pos: { x: 32, y: 31 }, hue: 200 },
  { id: 'marketing', name: 'Marketing', short: 'MKT', icon: Megaphone, status: 'Scheduling 3 campaigns', idle: 'Watching content performance', pos: { x: 50, y: 17 }, hue: 225 },
  { id: 'sales', name: 'Sales', short: 'SLS', icon: Handshake, status: 'Qualifying inbound leads', idle: 'Pipeline synced 2m ago', pos: { x: 68, y: 31 }, hue: 205 },
  { id: 'ops', name: 'Operations', short: 'OPS', icon: Workflow, status: 'Triaging task queue', idle: 'All systems nominal', pos: { x: 81, y: 64 }, hue: 220 },
]

export const thinkingLabels = {
  bd: ['Querying outreach logs', 'Reading reply threads', 'Drafting revision'],
  finance: ['Pulling bank balances', 'Modelling burn rate', 'Projecting runway'],
  marketing: ['Reviewing campaigns'],
  sales: ['Scanning pipeline'],
  ops: ['Auditing task queue', 'Re-sequencing dependencies', 'Building execution plan'],
}

export const EMAIL_V1 = {
  subject: 'Northwind Labs × {{company}} — quick intro',
  to: '{{first_name}} · VP Operations',
  body: [
    'Hi {{first_name}},',
    "We're the Crodal team at Northwind Labs. We build an AI-powered workflow platform with 40+ integrations, an advanced automation engine, and enterprise-grade security — and we've just launched our new Pro tier.",
    "Our platform helps companies like {{company}} modernize operations with cutting-edge machine learning. We'd love to show you a full product walkthrough covering all of our features.",
    'Do you have 45 minutes next week for a demo?',
    'Best,\nThe Crodal Team\nNorthwind Labs',
  ],
}

export const EMAIL_V2 = {
  subject: 'Your team is re-keying invoices by hand, {{first_name}}?',
  to: '{{first_name}} · VP Operations',
  body: [
    'Hi {{first_name}},',
    "Most ops teams at companies like {{company}} lose 9–12 hours a week re-entering data between systems — and the errors surface weeks later, in the worst possible place: month-end close.",
    "We helped Brightline Logistics cut that to under an hour, without replacing a single tool they already use. I put together a 2-minute look at how it would work for {{company}}'s stack.",
    'Worth a quick look? Happy to send it over — no call needed.',
    'The Crodal Team',
  ],
  changes: [
    { k: 'Opens with their problem', d: 'Pain first, product never named in line one' },
    { k: '−58% product talk', d: 'Feature list replaced by one proof point' },
    { k: 'Lower-friction CTA', d: '45-min demo → 2-minute walkthrough' },
  ],
}

export const REPLIES = [
  { id: 1, from: 'Daniel Okafor', org: 'Meridian Freight', time: '2h ago', subject: 'Re: Northwind Labs × Meridian — quick intro', body: "Interesting timing — we're evaluating options for exactly this. Can you send pricing and a security overview?", tone: 'Positive' },
  { id: 2, from: 'Priya Raman', org: 'Lattice & Co', time: '5h ago', subject: 'Re: Northwind Labs × Lattice — quick intro', body: 'Not a priority this quarter, but circle back in January.', tone: 'Later' },
  { id: 3, from: 'Tom Hendricks', org: 'Voss Manufacturing', time: 'Yesterday', subject: 'Re: Northwind Labs × Voss — quick intro', body: 'Looping in our COO, Elena. She owns this decision.', tone: 'Positive' },
]

export const RUNWAY = { cash: 252000, burn: 42000, months: 6, revenue: 18400, cashSeries: [504, 462, 420, 378, 336, 294, 252] }

export const TASKS_INITIAL = [
  { id: 't1', title: 'Migrate billing to Stripe Tax', owner: 'Ops', due: 'Oct 21', status: 'delayed', note: 'Blocked: awaiting EU VAT registration ID' },
  { id: 't2', title: 'Onboard 4 pilot customers', owner: 'Ops + Sales', due: 'Oct 24', status: 'delayed', note: 'Blocked: security questionnaire unanswered' },
  { id: 't3', title: 'Vendor contract renewal — AWS', owner: 'Finance', due: 'Nov 02', status: 'in-progress', note: 'Negotiating 12% commitment discount' },
  { id: 't4', title: 'Publish Q4 product changelog', owner: 'Marketing', due: 'Oct 30', status: 'done', note: 'Shipped and scheduled' },
]

export const PLAN = [
  { t: 'Today · 4:00 PM', s: 'File EU VAT registration via our tax partner (est. 48h to confirm)' },
  { t: 'Today · 5:30 PM', s: 'Auto-complete security questionnaire from SOC 2 documents; route to you for sign-off' },
  { t: 'Tomorrow', s: 'Stage billing migration in test mode; run 200 invoice dry-run' },
  { t: 'Friday', s: 'Cut over billing and kick off pilot onboarding calls' },
]

export const STATUS_STYLE = {
  delayed: { label: 'Delayed', dot: '#ff6b6b', text: 'text-[#ff8f8f]', bg: 'bg-[#ff6b6b]/10 border-[#ff6b6b]/25' },
  'in-progress': { label: 'In progress', dot: '#4d8dff', text: 'text-[#8db6ff]', bg: 'bg-[#4d8dff]/10 border-[#4d8dff]/25' },
  done: { label: 'Done', dot: '#4ade9a', text: 'text-[#7ef0b8]', bg: 'bg-[#4ade9a]/10 border-[#4ade9a]/25' },
}

export const STATUS_CYCLE = ['delayed', 'in-progress', 'done']

export const SUGGESTIONS = [
  { agent: 'bd', text: 'How many emails have we sent?' },
  { agent: 'bd', text: 'Show me the email template' },
  { agent: 'bd', text: "Rewrite this to focus on the customer's problem." },
  { agent: 'finance', text: "What's our current runway?" },
  { agent: 'ops', text: 'Operations, give me a status update' },
]

export const DEMO_SCRIPT = SUGGESTIONS.map((s) => s)

export const SPEND = [
  { k: 'Payroll & contractors', v: 31200, c: '#4d8dff' },
  { k: 'Cloud & infrastructure', v: 11800, c: '#7aa8ff' },
  { k: 'Marketing & outreach', v: 9400, c: '#a9c6ff' },
  { k: 'Software & other', v: 8000, c: '#5b6b8c' },
]

export const PRESENTER = { email: 'bd', runway: 'finance', ops: 'ops', marketing: 'marketing', sales: 'sales' }
export const SCREEN_OF = { bd: 'email', finance: 'runway', ops: 'ops', marketing: 'marketing', sales: 'sales' }
export const SHARE_TITLE = { email: 'outreach-sequence / founder-intro.tmpl', runway: 'finance / cash-runway-forecast.live', ops: 'operations / execution-queue.live', marketing: 'marketing / campaign-analytics.live', sales: 'sales / pipeline-analytics.live' }

export const CAMPAIGNS = [
  { n: 'Q4 product changelog', ch: 'Email', m: '4,820 sent', r: '41% open', p: 41 },
  { n: 'Founder LinkedIn series', ch: 'LinkedIn', m: '18.4k reach', r: '3.1% CTR', p: 31 },
  { n: 'Webinar · Ops automation', ch: 'Webinar', m: '212 signed up', r: '38% attend', p: 38 },
]
export const SIGNUPS = [38, 44, 41, 57, 63, 71, 86]
export const FUNNEL = [
  { k: 'Leads', v: 212 }, { k: 'Qualified', v: 48 }, { k: 'Demos', v: 9 }, { k: 'Proposals', v: 4 }, { k: 'Won', v: 1 },
]
export const DEALS = [
  { n: 'Meridian Freight', v: 36000, s: 'Proposal sent', hot: true },
  { n: 'Voss Manufacturing', v: 28000, s: 'Demo Thursday', hot: true },
  { n: 'Lattice & Co', v: 12000, s: 'Nurture · Jan', hot: false },
  { n: 'Halvorsen Group', v: 8000, s: 'Qualified', hot: false },
]
