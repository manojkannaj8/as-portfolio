import { Landing } from './components/landing/Landing'
import { Transmit } from './components/Transmit'
import { FlightLog } from './components/FlightLog'
import { SaberScroll } from './components/SaberScroll'
import { Chapters } from './components/chapters/Chapters'

export function App() {
  return (
    <>
      <a className="skip" href="#missions">
        Skip to missions
      </a>
      <FlightLog />
      <SaberScroll />
      <main>
        <Landing />
        <Chapters />
        <Transmit />
      </main>
    </>
  )
}
