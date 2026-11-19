import type { Pt } from '../scene/geometry'
import { profile } from './profile'

/**
 * Engineering callouts drawn onto the schematic version of the poster.
 * `anchor` is the point on the art (plate units); `label` is where the label's rule ends
 * (plate units, may sit outside the art), `side` is which way the label text runs from it.
 */
export type Callout = {
  id: string
  mark: string
  anchor: Pt
  label: Pt
  side: 'left' | 'right'
  title: string
  body: string
}

const p = profile

export const callouts: Callout[] = [
  {
    id: 'pilot',
    mark: 'A',
    anchor: [1105, 120],
    label: [1450, 70],
    side: 'right',
    title: 'Pilot',
    body: `${p.name.first} ${p.name.last}, ${p.role.toLowerCase()}`,
  },
  {
    id: 'craft',
    mark: 'B',
    anchor: [455, 455],
    label: [150, 640],
    side: 'left',
    title: 'Primary craft',
    body: p.skills.frontend.join(' · ') + ' · TypeScript',
  },
  {
    id: 'armament',
    mark: 'C',
    anchor: [890, 520],
    label: [700, 860],
    side: 'right',
    title: 'Armaments',
    body: 'Python · C++ · Arduino C++ · JavaScript',
  },
  {
    id: 'squadron',
    mark: 'D',
    anchor: [262, 220],
    label: [120, 80],
    side: 'left',
    title: 'Squadron',
    body: 'Technical co-lead, Chipset Club · IIC Innovation Ambassador',
  },
  {
    id: 'heading',
    mark: 'E',
    anchor: [1530, 560],
    label: [1520, 900],
    side: 'right',
    title: 'Heading',
    body: p.heading,
  },
]

export const specs: { k: string; v: string }[] = [
  { k: 'Designation', v: p.role },
  { k: 'Base', v: `${p.education.short}, ${p.education.campus}` },
  { k: 'Programme', v: p.education.degree },
  { k: 'CGPA', v: p.education.cgpa },
  { k: 'Posting', v: `${p.current.org} (${p.current.location}), web development intern` },
]
