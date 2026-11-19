import type { Chapter } from '../../content/chapters'

/** A title set in the poster's lettering; each word carries data-text for its ink ghosts. */
export function InkTitle({ text, as: Tag = 'h2', className = '', id }: { text: string; as?: 'h2' | 'h3'; className?: string; id?: string }) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={`ink-title ${className}`}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word" data-text={w}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

/** Chapter opener: an outlined numeral, the title in ink, and one line of log. */
export function ChapterHead({ chapter, tone = 'dark' }: { chapter: Chapter; tone?: 'dark' | 'paper' }) {
  return (
    <header className={`chead chead--${tone}`}>
      <span className="chead__num" data-text={chapter.numeral} aria-hidden="true">
        {chapter.numeral}
      </span>
      <div className="chead__body">
        <InkTitle id={`${chapter.id}-title`} text={chapter.title} className="chead__title" />
        <p className="chead__lead reg">{chapter.lead}</p>
      </div>
    </header>
  )
}
