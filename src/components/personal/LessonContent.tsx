import { cn } from '@/lib/utils'

interface LessonContentProps {
  content: string
  className?: string
}

// Simple markdown-to-JSX renderer (no external deps needed)
// Handles: h2, h3, bold, italic, blockquote, hr, lists, paragraphs
export function LessonContent({ content, className }: LessonContentProps) {
  const isHtml = content.trim().startsWith('<') && content.includes('>')

  if (isHtml) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .prose-vibe-html h2 { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #E8621A; letter-spacing: 0.05em; margin: 2rem 0 1rem; text-transform: uppercase; }
          .prose-vibe-html h3 { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; color: #FFFFFF; font-weight: 600; margin: 1.5rem 0 0.75rem; }
          .prose-vibe-html p  { margin-bottom: 1.25rem; line-height: 1.8; color: #B8A89A; font-size: 1.1rem; }
          .prose-vibe-html strong { color: #FFFFFF; font-weight: 600; }
          .prose-vibe-html em { font-style: italic; color: #D4C4B7; }
          .prose-vibe-html ul, .prose-vibe-html ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
          .prose-vibe-html li { margin-bottom: 0.5rem; color: #B8A89A; font-size: 1.1rem; }
          .prose-vibe-html blockquote { border-left: 4px solid #E8621A; background: rgba(232, 98, 26, 0.05); padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; color: #D4C4B7; }
          .prose-vibe-html a { color: #E8621A; text-decoration: underline; font-weight: 500; transition: opacity 0.2s; }
          .prose-vibe-html a:hover { opacity: 0.8; }
          .prose-vibe-html iframe { width: 100%; aspect-ratio: 16/9; border: none; border-radius: 4px; margin: 1rem 0; }
        `}} />
        <div
          className={cn('prose-vibe-html', className)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </>
    )
  }

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    // ... (rest of markdown parser)
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
          <div className="flex-1 h-px bg-orange/20" />
          <span className="text-orange text-xs">✦</span>
          <div className="flex-1 h-px bg-orange/20" />
        </div>
      )
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.replace('> ', '')
      elements.push(
        <blockquote key={i} className="border-l-4 border-orange bg-orange/6 px-6 py-4 my-6">
          <p className="font-body text-lg italic text-grey leading-relaxed">
            {renderInline(text)}
          </p>
        </blockquote>
      )
      i++; continue
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace('- ', ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-3 my-5 pl-0">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 font-body text-lg text-grey leading-relaxed">
              <span className="text-orange mt-1.5 text-xs flex-shrink-0">■</span>
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
            <li key={idx} className="flex items-start gap-4 font-body text-lg text-grey leading-relaxed">
              <span className="font-display text-xl text-orange leading-none min-w-[28px] flex-shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Bold heading-like line
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
      <p key={i} className={cn("font-body text-lg text-grey leading-relaxed mb-5 last:mb-0", className)}>
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
      parts.push(<code key={match.index} className="font-mono text-[0.85em] text-orange bg-black-3 px-1.5 py-0.5">{raw.slice(1, -1)}</code>)
    }
    last = match.index + raw.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}
