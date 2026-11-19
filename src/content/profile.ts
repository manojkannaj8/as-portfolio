/**
 * Single source of truth for portfolio facts.
 * Everything here comes from the CV (Ashmit_Saxena_Resume.pdf) and github.com/Mitiox.
 * UI and motion code read from this module; never hard-code facts in components.
 */

export const profile = {
  name: { first: 'Ashmit', last: 'Saxena' },
  role: 'Frontend Developer',
  heading: 'Full-stack engineering',
  summary:
    'Frontend developer and computer science undergraduate at SRM IST, building responsive web apps in React and TypeScript, on course for full-stack.',

  education: {
    school: 'SRM Institute of Science and Technology',
    short: 'SRM IST',
    campus: 'Ramapuram',
    degree: 'B.Tech, Computer Science & Engineering',
    cgpa: '9.53 / 10.00',
  },

  current: {
    title: 'Business Operations & Web Development Intern',
    org: 'IADQGA',
    location: 'USA',
  },

  leadership: [
    { title: 'Technical Co-Lead', org: 'Chipset Club, SRM IST Ramapuram' },
    { title: 'Technical Team Member, Innovation Ambassador', org: "Institution's Innovation Council, SRM IST Ramapuram" },
  ],

  honours: [
    { event: 'Hack With GDG S3', result: '1st place', date: 'Feb 2026' },
    { event: 'DTCC Employee Hackathon', result: 'Silver, Tech Trailblazer', date: 'Oct 2025' },
    { event: 'Ingenium 4.0', result: '2nd place', date: 'Jan 2025' },
  ],

  skills: {
    languages: ['Python', 'C++', 'Arduino C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    frontend: ['React', 'Vite', 'Tailwind CSS'],
    tools: ['Git', 'GitHub', 'Supabase', 'REST APIs', 'Render', 'Microsoft SQL Server', 'Figma'],
  },

  links: {
    github: 'https://github.com/Mitiox',
    linkedin: 'https://www.linkedin.com/in/ashmit-saxena-a5336719a/',
    email: 'ashmitsaxena247@gmail.com',
    resume: '/Ashmit_Saxena_Resume.pdf',
  },
} as const

export type Profile = typeof profile
