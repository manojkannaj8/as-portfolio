/**
 * Chapter content for the journey after the landing.
 * Sources: Ashmit_Saxena_Resume.pdf and the public repositories on github.com/Mitiox.
 * Wording is condensed from those sources; nothing here is invented.
 */

export type Chapter = { id: string; numeral: string; title: string; lead: string }

export const chapters: Chapter[] = [
  { id: 'missions', numeral: 'I', title: 'Missions', lead: 'Three flown in full, logged from the CV. Each one shipped or is still in flight.' },
  { id: 'service', numeral: 'II', title: 'Service record', lead: 'Where the work happens alongside other people: an internship, a club and a council.' },
  { id: 'honours', numeral: 'III', title: 'Honours', lead: 'Hull markings from hackathons, painted on in the order they were earned.' },
  { id: 'academy', numeral: 'IV', title: 'Academy', lead: 'The flight school behind it all.' },
  { id: 'arsenal', numeral: 'V', title: 'Arsenal', lead: 'Three blades, forged from the tools used every day. Press a hilt to ignite or retract it.' },
]

export type Mission = {
  code: string
  name: string
  kind: string
  objective: string
  log: string[]
  loadout: string[]
  links: { label: string; href: string }[]
  /** what the brief shows: a capture of the live site, or a schematic when none is public */
  visual: { kind: 'screen'; src: string; small: string; host: string; href: string } | { kind: 'route' } | { kind: 'radar' }
}

export const missions: Mission[] = [
  {
    code: 'M-01',
    name: 'CORB',
    kind: 'Image editor',
    objective: 'A web-based image editing tool with a custom, tactile neomorphic interface.',
    log: [
      'Drag-and-drop or URL import, free-form and preset-ratio cropping, and an eyedropper colour picker.',
      'Background removal and replacement, zoom and pan controls.',
      'Multi-format export to PNG, JPEG and WEBP with adjustable quality.',
    ],
    loadout: ['TypeScript', 'JavaScript', 'React', 'Vite', 'Tailwind CSS', 'Git / GitHub'],
    links: [
      { label: 'Live on Render', href: 'https://corb.onrender.com/' },
      { label: 'Repository', href: 'https://github.com/Mitiox/CORB' },
    ],
    visual: { kind: 'screen', src: '/shots/corb.webp', small: '/shots/corb-720.webp', host: 'corb.onrender.com', href: 'https://corb.onrender.com/' },
  },
  {
    code: 'M-02',
    name: 'Nexus-Flow',
    kind: 'Urban navigation & ride-pooling',
    objective: 'Helps people plan efficient journeys on public transport, with ride-pooling built in.',
    log: [
      'Generates an optimal journey plan tailored to each user’s needs.',
      'Live-hosted deployment on Render, backed by Supabase and REST APIs.',
    ],
    loadout: ['React', 'Vite', 'Tailwind CSS', 'Supabase', 'REST API'],
    links: [{ label: 'Repository', href: 'https://github.com/Mitiox/NexusFlow' }],
    visual: { kind: 'route' },
  },
  {
    code: 'M-03',
    name: 'GaBN',
    kind: 'Assistive navigation',
    objective: 'A navigation and assistance app for blind and partially sighted people.',
    log: ['Targets a problem faced by millions of people who currently lack access to an effective solution.'],
    loadout: ['Flutter', 'C++', 'Swift'],
    links: [{ label: 'Repository', href: 'https://github.com/Mitiox/Gabn' }],
    visual: { kind: 'radar' },
  },
]

/** Smaller sorties from the public GitHub log, described with the repositories' own words. */
export const sorties: { name: string; note: string; lang: string; href: string }[] = [
  { name: 'WORB', note: 'A whiteboard with just the right amount of features and accessibility options.', lang: 'TypeScript', href: 'https://github.com/Mitiox/WORB---Goldilock-s-Whiteboard' },
  { name: 'Maze Path Finder', note: 'Solves mazes with breadth-first and depth-first search.', lang: 'TypeScript', href: 'https://github.com/Mitiox/Maze-Path-finder' },
  { name: 'Gesture Control', note: 'Controls a device with hand gestures.', lang: 'Python', href: 'https://github.com/Mitiox/Gesture-control' },
  { name: 'Vehicle Speed Detection', note: 'An IoT system that detects vehicle speed and flags over-speeding vehicles.', lang: 'Arduino C++', href: 'https://github.com/Mitiox/Vehicle-speed-detection-' },
  { name: 'VoltSwitch', note: 'A decentralised energy marketplace built on blockchain.', lang: '—', href: 'https://github.com/Mitiox/VoltSwitch' },
  { name: 'Competitive Programming', note: 'A running log of solved DSA problems, kept for review and revision.', lang: 'Python', href: 'https://github.com/Mitiox/Comp-programming-' },
]

export type Post = { title: string; org: string; where: string; tag: string; log: string[]; lead?: boolean }

export const service: Post[] = [
  {
    title: 'Business Operations & Web Development Intern',
    org: 'IADQGA',
    where: 'USA · remote',
    tag: 'Current posting',
    log: [
      'Contributing to a US-based organisation advancing data and statistical literacy, helping companies turn the data they already collect into actionable insight.',
      'Leading a front-end redesign of the company website.',
      'Researching certification exam platforms and reaching out to companies for data-collaboration partnerships.',
    ],
  },
  {
    title: 'Technical Co-Lead',
    org: 'Chipset Club',
    where: 'SRM IST, Ramapuram',
    tag: 'Squadron command',
    lead: true,
    log: ['Organised F.O.L.K, a Linux workshop series, and judged Vibe-X.', 'Presented a Figma session at Render-Scape, Texus 2025.'],
  },
  {
    title: 'Technical Team Member',
    org: 'Institution’s Innovation Council',
    where: 'SRM IST, Ramapuram',
    tag: 'Innovation Ambassador',
    log: ['Certified Innovation Ambassador.', 'Co-organised Enclave-Spark and The Pitch Room for the National Entrepreneurship Challenge.'],
  },
]

export type Honour = { mark: string; markSmall?: string; event: string; result: string; date: string; iso: string }

export const honours: Honour[] = [
  { mark: '1', markSmall: 'st', event: 'Hack With GDG S3', result: 'First place', date: 'Feb 2026', iso: '2026-02' },
  { mark: '2', markSmall: 'nd', event: 'DTCC Employee Hackathon', result: 'Second place (Silver), Tech Trailblazer category', date: 'Oct 2025', iso: '2025-10' },
  { mark: '3', markSmall: 'rd', event: 'Ingenium 4.0', result: 'Third place', date: 'Jan 2025', iso: '2025-01' },
]

export const certificates = [{ name: 'Learning Fundamentals of OS', issuer: 'Scaler', date: 'Oct 2025' }]

export const academy = {
  coursework: ['Computer Architecture', 'Learning Algorithms', 'Computational Theory', 'Operating Systems', 'Data Structures and Algorithms'],
}

export type Blade = { id: string; name: string; colour: 'red' | 'amber' | 'cyan'; items: string[] }

export const arsenal: Blade[] = [
  { id: 'languages', name: 'Languages', colour: 'red', items: ['Python', 'C++', 'Arduino C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS'] },
  { id: 'frameworks', name: 'Frameworks & libraries', colour: 'amber', items: ['React', 'Vite', 'Tailwind CSS'] },
  { id: 'tools', name: 'Tools & technologies', colour: 'cyan', items: ['Git', 'GitHub', 'Supabase', 'REST APIs', 'Render', 'Microsoft SQL Server', 'Figma'] },
]
