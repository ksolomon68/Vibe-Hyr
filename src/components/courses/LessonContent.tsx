import { cn } from '@/lib/utils'

interface LessonContentProps {
  content: string
  className?: string
}

// Simple markdown-to-JSX renderer (no external deps needed)
// Handles: h2, h3, bold, italic, blockquote, hr, lists, paragraphs
export function LessonContent({ content, className }: LessonContentProps) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) { i++; continue }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-display text-3xl md:text-4xl tracking-[0.03em] text-orange-DEFAULT mt-10 mb-4 first:mt-0">
          {line.replace('## ', '')}
        </h2>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-display text-xl tracking-[0.04em] text-white mt-8 mb-3">
          {line.replace('### ', '')}
        </h3>
      )
      i++; continue
    }

    // HR
    if (line.startsWith('---')) {
      elements.push(
        <div key={i} className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-orange-DEFAULT/20" />
          <span className="text-orange-DEFAULT text-xs">✦</span>
          <div className="flex-1 h-px bg-orange-DEFAULT/20" />
        </div>
      )
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.replace('> ', '')
      elements.push(
        <blockquote key={i} className="border-l-4 border-orange-DEFAULT bg-orange-DEFAULT/6 px-6 py-4 my-6">
          <p className="font-body text-base italic text-grey-DEFAULT leading-relaxed">
            {renderInline(text)}
          </p>
        </blockquote>
      )
      i++; continue
    }

    // Unordered list — collect consecutive list items
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace('- ', ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-3 my-5 pl-0">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 font-body text-base text-grey-DEFAULT leading-relaxed">
              <span className="text-orange-DEFAULT mt-1.5 text-xs flex-shrink-0">■</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="flex flex-col gap-3 my-5 pl-0 counter-reset-item">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-4 font-body text-base text-grey-DEFAULT leading-relaxed">
              <span className="font-display text-xl text-orange-DEFAULT leading-none min-w-[28px] flex-shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Bold heading-like line (entire line is bold)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      const text = line.slice(2, -2)
      elements.push(
        <p key={i} className="font-body font-bold text-white text-base mt-6 mb-2">
          {text}
        </p>
      )
      i++; continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="font-body text-base text-grey-DEFAULT leading-[1.75] mb-0">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return (
    <div className={cn('prose-vibe space-y-3', className)}>
      {elements}
    </div>
  )
}

// Inline formatting: **bold**, *italic*, `code`
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))

    const raw = match[0]
    if (raw.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{raw.slice(2, -2)}</strong>)
    } else if (raw.startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-grey-light">{raw.slice(1, -1)}</em>)
    } else if (raw.startsWith('`')) {
      parts.push(<code key={match.index} className="font-mono text-[0.85em] text-orange-DEFAULT bg-black-3 px-1.5 py-0.5">{raw.slice(1, -1)}</code>)
    }
    last = match.index + raw.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}
