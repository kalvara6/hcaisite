/* ==========================================================================
   Charlotte-Mecklenburg homelessness data + solution map content
   Every number below is tied to a public source in SOURCES.
   Last checked: November 10, 2026
   ========================================================================== */

const SOURCES = {
  pit2026: {
    label: "Axios Charlotte — 2026 Point-in-Time Count results (May 11, 2026)",
    url: "https://www.axios.com/local/charlotte/2026/05/11/charlotte-homelessness-climbs-again-in-2026"
  },
  pit2025: {
    label: "Mecklenburg County — Point in Time Count Reveals Faces of Homelessness (2025)",
    url: "https://news.mecknc.gov/point-time-count-reveals-faces-homelessness-amidst-growing-needs"
  },
  pit2025b: {
    label: "Mecklenburg County — Volunteers needed for 2026 PIT Count (2025 totals)",
    url: "https://news.mecknc.gov/everybody-counts-charlotte-volunteers-and-donations-needed-point-time-count-2026"
  },
  pit2024: {
    label: "Mecklenburg County — Volunteers needed for 2025 PIT Count (2024 totals)",
    url: "https://news.mecknc.gov/everybody-counts-charlotte-volunteers-and-donations-needed-point-time-count"
  },
  sohih2023: {
    label: "Mecklenburg County — 2023 State of Housing Instability & Homelessness release",
    url: "https://news.mecknc.gov/news/2700-neighbors-need-county-releases-housing-homelessness-report"
  },
  sohih2024: {
    label: "Mecklenburg County — 2024 State of Housing Instability & Homelessness release",
    url: "https://news.mecknc.gov/2784-neighbors-need-mecklenburg-county-releases-housing-and-homelessness-report"
  },
  sohih2025: {
    label: "Mecklenburg County — 2025 State of Housing Instability & Homelessness release",
    url: "https://news.mecknc.gov/2404-neighbors-need-mecklenburg-county-releases-housing-and-homelessness-report"
  },
  oneNumberSep2025: {
    label: "Mecklenburg County — Community Conversation kicks off 2026 PIT Count (One Number, Sept. 2025)",
    url: "https://news.mecknc.gov/community-conversation-homelessness-kicks-2026-point-time-count"
  },
  evictions2024: {
    label: "WSOC-TV — Evictions surge in Mecklenburg County",
    url: "https://www.wsoctv.com/news/local/evictions-surge-mecklenburg-county-prompting-urgent-calls-housing-support/PQLYXXN62VB53PG6R7K5QVMVK4"
  },
  evictions2025: {
    label: "Legal Aid of NC — A Lifeline in the Mecklenburg County Courthouse (Jan. 2026)",
    url: "https://legalaidnc.org/2026/01/08/a-lifeline-in-the-mecklenburg-county-courthouse/"
  },
  lawyers: {
    label: "WFAE — Finding home when eviction looms (UNC Charlotte Urban Institute study)",
    url: "https://www.wfae.org/post/finding-home-when-eviction-looms-landlords-have-lawyers-now-more-tenants-do-too"
  },
  homePrice: {
    label: "UNC Charlotte Urban Institute — Affordable housing in Charlotte: why long-term investment matters",
    url: "https://ui.charlotte.edu/aboutus/contributors/lori-thomas?page=2"
  },
  wsocReport: {
    label: "WSOC-TV — Report reveals loss of affordable housing in Mecklenburg County (2025 SoHIH)",
    url: "https://www.wsoctv.com/news/local/report-reveals-loss-affordable-housing-mecklenburg-county/TVYQUAAINNFEXHVIK2P57RUHQU/"
  },
  lia: {
    label: "Legal Aid of NC — JusticeHub resource card (2026)",
    url: "https://legalaidnc.org/wp-content/uploads/2026/02/LANC-RC-2026-v1-ENG.pdf"
  },
  coordEntry: {
    label: "Mecklenburg County — Coordinated Entry",
    url: "https://css.mecknc.gov/Housing-Stabilization/coordinated-entry"
  },
  city211: {
    label: "City of Charlotte — Emergency Housing Assistance",
    url: "https://www.charlottenc.gov/Streets-and-Neighborhoods/Housing/Emergency-Housing-Assistance"
  },
  legalAidHousing: {
    label: "UNC School of Law — Looking for legal help in NC (Legal Aid Housing Helpline)",
    url: "https://law.unc.edu/?p=466"
  },
  dashboard: {
    label: "Charlotte-Mecklenburg Housing & Homelessness Dashboard (primary data hub)",
    url: "https://mecklenburghousingdata.org/"
  },
  ecosystem: {
    label: "Housing & Homelessness Ecosystem (organizations directory)",
    url: "https://mecklenburghousingdata.org/ecosystem/"
  },
  snapshot: {
    label: "Housing Data Snapshot — One Number, Coordinated Entry, inflow/outflow",
    url: "https://housingdata.mecknc.gov/data"
  },
  qol: {
    label: "Charlotte-Mecklenburg Quality of Life Explorer (neighborhood data)",
    url: "https://mcmap.org/qol"
  },
  qolData: {
    label: "Quality of Life Explorer open-data repository (GitHub, MIT License)",
    url: "https://github.com/tobinbradley/quality-of-life-explorer"
  },
  cares: {
    label: "Mecklenburg County Public Health — CARES Team",
    url: "https://health.mecknc.gov/services/care-management-and-health-partnerships/trauma-justice-partnerships/cares-team"
  }
};

/* ---- Point-in-Time Count: one night each January ---- */
const PIT = [
  { year: 2024, total: 2095, unsheltered: 384, sheltered: 1711, src: ["pit2024", "sohih2024"] },
  { year: 2025, total: 2101, unsheltered: 444, sheltered: 1657, src: ["pit2025", "pit2025b"] },
  { year: 2026, total: 2018, unsheltered: 499, sheltered: 1519, src: ["pit2026"] }
];

/* ---- Unsheltered PIT count over time (2021–2022 omitted: different methods during COVID) ---- */
const UNSHELTERED = [
  { year: 2020, value: 214, src: ["sohih2023"] },
  { year: 2023, value: 288, src: ["sohih2023"] },
  { year: 2024, value: 384, src: ["sohih2024"] },
  { year: 2025, value: 444, src: ["pit2025"] },
  { year: 2026, value: 499, src: ["pit2026"] }
];

/* ---- "One Number": everyone actively homeless in HMIS, measured each June ---- */
const ONE_NUMBER = [
  { label: "Jun 2022", value: 2428, src: ["sohih2023"] },
  { label: "Jun 2023", value: 2704, src: ["sohih2023"] },
  { label: "Jun 2024", value: 2784, src: ["sohih2024"] },
  { label: "Jun 2025", value: 2404, src: ["sohih2025"] }
];

/* ---- Eviction filings, Mecklenburg County ---- */
const EVICTIONS = [
  { year: "2024", value: 46026, note: "29,716 granted", src: ["evictions2024"] },
  { year: "2025", value: 52000, note: "“more than 52,000” — highest on record", src: ["evictions2025"] }
];

/* ---- Headline stats ---- */
const STATS = [
  { value: "499", label: "people sleeping outside on one January night in 2026 — the highest local unsheltered count since at least 2010", src: "pit2026" },
  { value: "77%", label: "of the county's low-cost rental housing from 2015 was gone by 2024", src: "sohih2025" },
  { value: "32,601", label: "unit shortage of rentals affordable to households at or below 30% of area median income", src: "sohih2025" },
  { value: "74%", label: "of people experiencing homelessness are Black, vs. 29% of the county's population", src: "sohih2025" },
  { value: "+11%", label: "rise in people experiencing homelessness for the first time (2024)", src: "sohih2025" },
  { value: "52,000+", label: "eviction cases filed in Mecklenburg County in 2025 — a record", src: "evictions2025" }
];

/* ==========================================================================
   SOLUTION MAP: causes  <->  human-centered AI solutions
   ========================================================================== */
const CAUSES = [
  { id: "c1", title: "Rents outpacing incomes",
    detail: "More than 77% of 2015's low-cost rentals were lost by 2024, there is a 32,601-unit gap for the lowest-income renters, and half of all renters are cost-burdened.",
    src: "sohih2025" },
  { id: "c2", title: "Evictions at record levels",
    detail: "46,026 eviction cases were filed in 2024 and more than 52,000 in 2025. In a 2016 UNC Charlotte Urban Institute study, 82% of landlords had lawyers; most tenants had none.",
    src: ["evictions2024", "evictions2025", "lawyers"] },
  { id: "c3", title: "Economic shocks push people in for the first time",
    detail: "First-time homelessness rose 11% in 2024 — people who were housed until a job loss, rent hike, or medical bill.",
    src: "sohih2025" },
  { id: "c4", title: "Shrinking shelter capacity",
    detail: "In 2026, two small shelter programs closed and a larger one cut capacity due to funding. The sheltered count fell ~8% while the unsheltered count rose to 499.",
    src: "pit2026" },
  { id: "c5", title: "Racial inequity built into housing",
    detail: "Black residents are 29% of the county but 74% of people experiencing homelessness. Most renters struggling to afford housing are Black or Latino.",
    src: ["sohih2025", "wsocReport"] },
  { id: "c6", title: "Hard-to-navigate help systems",
    detail: "Help is spread across dozens of agencies (see the county's Ecosystem directory). Coordinated Entry works by voicemail callback, weekdays 8–5 — hard to reach without a stable phone.",
    src: "coordEntry" },
  { id: "c7", title: "Health, disability & trauma",
    detail: "Chronic illness, mental health, substance use, and domestic violence both cause and deepen homelessness. Local detail lives in the annual SoHIH report and the CARES team's work.",
    src: "cares" }
];

const SOLUTIONS = [
  {
    id: "s1", title: "Eviction Navigator", tag: "LLM · plain language",
    causes: ["c2", "c5", "c6"],
    summary: "A text/web assistant that turns a court summons into plain language — what it means, the hearing date, what to bring — and connects the tenant to Legal Aid before court day.",
    ai: "An LLM explains the summons at a 6th-grade reading level, in English or Spanish, and builds a personal checklist. It reads only from a vetted set of Legal Aid materials.",
    human: "Legal Aid attorneys give the actual legal advice and represent tenants. The tool never tells someone whether they will win.",
    safeguards: "Answers limited to approved documents; every reply shows the Legal Aid Housing Helpline; no personal data stored without consent.",
    measure: "Share of tenants who appear at their hearing and have counsel; eviction judgments vs. filings.",
    precedent: "Legal Aid of NC already offers “LIA,” an AI-powered legal information assistant inside its JusticeHub portal — proof this can work with lawyers in charge.",
    precedentSrc: "lia",
    control: 0.86, automation: 0.58
  },
  {
    id: "s2", title: "Prevention Early-Warning Map", tag: "Data analysis",
    causes: ["c1", "c2", "c3"],
    summary: "A neighborhood-level map of eviction filings and rent pressure so rental-assistance and outreach teams go where need is rising — before people lose housing.",
    ai: "Models flag areas (not individuals) where filings are spiking. An LLM drafts outreach flyers in several languages for staff to edit.",
    human: "Prevention staff decide where to go and what to offer. Outreach is an offer of help, never a score attached to a person.",
    safeguards: "No individual risk scores; aggregated to block-group level; reviewed for racial bias before use.",
    measure: "First-time homelessness (target: reverse the +11%); rental assistance reaching high-filing areas.",
    control: 0.78, automation: 0.62
  },
  {
    id: "s3", title: "Text-First Resource Navigator", tag: "LLM · SMS / voice",
    causes: ["c6", "c4", "c7"],
    summary: "A 24/7 text line and voice option that helps someone figure out the right front door — 211, Coordinated Entry, Legal Aid, food, showers — on any phone.",
    ai: "An LLM understands messy, real-world messages (“got kicked out, have 2 kids, no car”) and matches them to verified resources. Works on basic phones via SMS.",
    human: "Any message about danger, self-harm, or a child at risk goes to a person right away. Staff can take over any chat with one tap.",
    safeguards: "Never invents phone numbers or addresses — only returns items from a verified, dated resource list. See the prototype below.",
    measure: "Time from first contact to Coordinated Entry assessment; callbacks completed.",
    control: 0.74, automation: 0.72
  },
  {
    id: "s4", title: "Caseworker Co-pilot", tag: "LLM · paperwork",
    causes: ["c6", "c4", "c3"],
    summary: "Gives caseworkers time back: summarizes case notes, builds document checklists (ID, birth certificate, income proof), and pre-fills housing applications.",
    ai: "An LLM drafts summaries and forms from notes the caseworker already wrote. It runs in a privacy-approved environment, never a public chatbot.",
    human: "The caseworker reviews and signs everything. The relationship — the part that actually rehouses people — stays human.",
    safeguards: "HMIS data never leaves approved systems; drafts are labeled as AI-generated; clients can opt out.",
    measure: "Days from shelter entry to housing move-in; caseworker hours spent on paperwork.",
    control: 0.9, automation: 0.66
  },
  {
    id: "s5", title: "Live Shelter & Outreach Board", tag: "No AI needed",
    causes: ["c4", "c6"],
    summary: "A shared, real-time board of open beds, overflow nights, and outreach team locations so no one is sent across town to a full shelter.",
    ai: "Honestly? Mostly none. A shared database and a simple update button do the job. Human-centered design means using AI only where it helps.",
    human: "Shelter staff update counts; outreach workers use it in the field.",
    safeguards: "No personal data — only bed counts. Works offline-first for outreach teams.",
    measure: "Unsheltered count (499 in 2026); unused beds per night.",
    control: 0.95, automation: 0.18
  },
  {
    id: "s6", title: "Affordable Rental Preservation Finder", tag: "Data analysis",
    causes: ["c1", "c5"],
    summary: "Spots older, lower-rent apartment complexes likely to be sold and redeveloped, so nonprofits and the Housing Trust Fund can step in first.",
    ai: "Combines public property records (sale history, rents, age, ownership) to flag at-risk buildings. An LLM summarizes each property's history for decision-makers.",
    human: "Housing leaders and residents of those neighborhoods decide which buildings to prioritize.",
    safeguards: "Uses public records only; resident voice built into prioritization so tenants aren't displaced by the “fix.”",
    measure: "Low-cost units preserved per year vs. the 77% lost since 2015.",
    control: 0.8, automation: 0.55
  },
  {
    id: "s7", title: "Lived-Experience Listening Lab", tag: "LLM · analysis",
    causes: ["c5", "c7", "c6"],
    summary: "Turns the open-ended answers from the Point-in-Time survey and community sessions into themes that shape funding and program design.",
    ai: "An LLM groups hundreds of free-text responses into themes and pulls representative (anonymized) quotes.",
    human: "A paid advisory board of people with lived experience checks, corrects, and owns the conclusions. Nothing about us without us.",
    safeguards: "Advisors can reject AI themes; raw data stays de-identified; findings are shared back with the community.",
    measure: "Program changes made from resident feedback; advisor satisfaction.",
    control: 0.94, automation: 0.44
  },
  {
    id: "s8", title: "Equity Check for Every Tool", tag: "Governance",
    causes: ["c5", "c1", "c2", "c3", "c4", "c6", "c7"],
    summary: "Before and after launch, every tool on this map is tested for whether it works equally well across race, language, age, and disability.",
    ai: "Automated tests compare tool outcomes by group; an LLM can red-team chatbots with realistic messages in different dialects and languages.",
    human: "A community review board — including people with lived experience — can pause any tool.",
    safeguards: "Published results; a clear way to report harm; tools paused if gaps appear.",
    measure: "Gap between Black residents' share of homelessness (74%) and share of the population (29%) — shrinking over time.",
    control: 0.97, automation: 0.34
  }
];

/* ==========================================================================
   JOURNEY MAP — a composite, fictional person built from the data patterns
   ========================================================================== */
const JOURNEY = [
  { step: "Rent goes up", feel: "“I'm working, but the new lease is $300 more.”",
    fact: "Half of all renters in the county are cost-burdened.", src: "sohih2025", solution: "s2" },
  { step: "Falls behind", feel: "“One short paycheck and I'm a month behind.”",
    fact: "First-time homelessness rose 11% in 2024.", src: "sohih2025", solution: "s2" },
  { step: "Eviction summons", feel: "“I don't understand this paper. Do I even need to go?”",
    fact: "52,000+ eviction cases filed in 2025.", src: "evictions2025", solution: "s1" },
  { step: "Court day", feel: "“The landlord has a lawyer. I'm by myself.”",
    fact: "In a UNC Charlotte study, 82% of landlords had legal representation.", src: "lawyers", solution: "s1" },
  { step: "Doubled up / car", feel: "“My cousin's couch for now. Then my car.”",
    fact: "Doubled-up households count as housing instability in the SoHIH report.", src: "sohih2023", solution: "s3" },
  { step: "Looks for help", feel: "“I left a voicemail. My phone dies tonight.”",
    fact: "Coordinated Entry works by voicemail callback, weekdays 8–5.", src: "coordEntry", solution: "s3" },
  { step: "Shelter is full", feel: "“They said try again tomorrow.”",
    fact: "Two shelter programs closed and one cut capacity in 2026.", src: "pit2026", solution: "s5" },
  { step: "Back home", feel: "“A caseworker got my ID and application done in a week.”",
    fact: "Goal: homelessness that is rare, brief, and non-recurring.", src: "dashboard", solution: "s4" }
];

/* ==========================================================================
   NAVIGATOR PROTOTYPE — rule-based (no LLM), verified resources only
   ========================================================================== */
const RESOURCES = {
  r911: { name: "Emergency", contact: "Call 911", note: "If you or someone else is in immediate danger." },
  r988: { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", note: "24/7, free, confidential." },
  r211: { name: "NC 211", contact: "Dial 2-1-1 or 1-888-892-1162", note: "If you are homeless or will be within 14 days. Open 24/7.", src: "city211" },
  rCE: { name: "Mecklenburg Coordinated Entry", contact: "704-284-9665 (leave a message)", note: "Front door to shelter and homelessness prevention. Callbacks Mon–Fri, 8 a.m.–5 p.m.", src: "coordEntry" },
  rLAH: { name: "Legal Aid of NC — Housing Helpline", contact: "1-877-201-6426", note: "Free legal help for tenants facing eviction.", src: "legalAidHousing" },
  rLA: { name: "Legal Aid of NC — Apply online", contact: "legalaidnc.org/JusticeHub · 866-219-5262", note: "Check eligibility, upload documents, get plain-language legal info.", src: "lia" }
};

const NAVIGATOR = [
  { id: "tonight", label: "I need a safe place to sleep tonight",
    steps: ["r211", "rCE"],
    tip: "If it's after 5 p.m. or a weekend, start with 211 — it's open 24/7. Leave a Coordinated Entry message too so a caseworker can follow up." },
  { id: "summons", label: "I got an eviction notice or court papers",
    steps: ["rLAH", "rLA", "r211"],
    tip: "Go to your court date. Tenants who show up — especially with a lawyer — have far better outcomes. Bring your lease, receipts, and any texts with your landlord." },
  { id: "behind", label: "I'm behind on rent but haven't been to court",
    steps: ["rCE", "r211", "rLAH"],
    tip: "Ask about homelessness prevention and rental assistance now — it's easier to keep a home than to find a new one." },
  { id: "doubled", label: "I'm staying with friends, family, or in my car",
    steps: ["rCE", "r211"],
    tip: "You may qualify for help even if you aren't on the street. Tell them where you slept last night and how long you can stay." },
  { id: "unsafe", label: "I don't feel safe where I am",
    steps: ["r911", "r988", "r211"],
    tip: "Your safety comes first. 211 can also connect you to domestic violence shelters." },
  { id: "helper", label: "I'm trying to help someone else",
    steps: ["r211", "rCE"],
    tip: "Ask what they want before acting. Offer your phone to make the call, and let them lead the conversation." }
];
