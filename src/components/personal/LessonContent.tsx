import { cn } from '@/lib/utils'
import { CheckCircle, Hash } from 'lucide-react'

interface LessonContentProps {
  content: string
  className?: string
}

// Premium markdown-to-JSX renderer
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
        <h2 key={i} className="flex items-center gap-3 font-display text-3xl md:text-[2.5rem] tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-r from-orange-DEFAULT via-[#FF9A33] to-[#FFB866] mt-14 mb-6 first:mt-0 font-normal drop-shadow-sm">
          {line.replace('## ', '')}
        </h2>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="flex items-center gap-3 font-display text-2xl tracking-[0.04em] text-white mt-10 mb-4 font-normal">
          <Hash size={20} className="text-orange-DEFAULT/70 flex-shrink-0" />
          {line.replace('### ', '')}
        </h3>
      )
      i++; continue
    }

    // HR
    if (line.startsWith('---')) {
      elements.push(
        <div key={i} className="flex items-center gap-6 my-12 opacity-80">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-orange-DEFAULT/40 to-transparent" />
          <span className="text-orange-DEFAULT text-[10px] tracking-widest font-mono uppercase">Vibe</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-orange-DEFAULT/40 to-transparent" />
        </div>
      )
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.replace('> ', '')
      elements.push(
        <blockquote key={i} className="relative border-l-4 border-orange-DEFAULT bg-gradient-to-r from-orange-DEFAULT/10 to-transparent px-8 py-6 my-8 rounded-r-2xl overflow-hidden group">
          <div className="absolute -top-4 -left-2 text-orange-DEFAULT/10 font-display text-[8rem] leading-none select-none transition-transform group-hover:scale-110 duration-700">"</div>
          <p className="font-body text-xl md:text-2xl italic text-white/90 leading-relaxed relative z-10 font-light">
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
        <div key={`ul-${i}`} className="bg-[#111111]/80 border border-white/5 rounded-2xl p-6 md:p-8 my-8 shadow-[0_0_30px_rgba(232,98,26,0.03)] filter backdrop-blur-sm">
          <ul className="flex flex-col gap-5 pl-0 m-0">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 font-body text-[1.1rem] text-grey-light leading-relaxed group">
                <span className="text-orange-DEFAULT mt-1.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#FF9A33]">
                  <CheckCircle size={18} strokeWidth={2.5} />
                </span>
                <span className="pt-0.5">{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </div>
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
        <div key={`ol-${i}`} className="my-8 pl-2">
          <ol className="flex flex-col gap-6 pl-0 m-0">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-5 font-body text-[1.1rem] text-white/80 leading-relaxed">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-DEFAULT/10 border border-orange-DEFAULT/20 text-orange-DEFAULT font-display text-xl leading-none flex-shrink-0 mt-0.5 shadow-[0_0_15px_rgba(232,98,26,0.15)]">
                  {idx + 1}
                </span>
                <span className="pt-1">{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        </div>
      )
      continue
    }

    // Bold heading-like line (entire line is bold)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      const text = line.slice(2, -2)
      elements.push(
        <p key={i} className="font-body font-bold text-white text-[1.15rem] mt-8 mb-3 tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-DEFAULT inline-block" />
          {text}
        </p>
      )
      i++; continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className={cn("font-body text-[1.1rem] md:text-[1.15rem] text-grey-light leading-[1.8] mb-6 last:mb-0 transition-colors hover:text-white/90 duration-300", className)}>
        {renderInline(line)}
      </p>
    )
    i++
  }

  return (
    <div className={cn('prose-vibe max-w-none space-y-0', className)}>
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
      parts.push(<strong key={match.index} className="font-semibold text-white tracking-wide">{raw.slice(2, -2)}</strong>)
    } else if (raw.startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-orange-DEFAULT/90 font-medium">{raw.slice(1, -1)}</em>)
    } else if (raw.startsWith('`')) {
      parts.push(<code key={match.index} className="font-mono text-[0.85em] text-[#FF9A33] bg-orange-DEFAULT/10 border border-orange-DEFAULT/20 px-2 py-0.5 rounded-md shadow-sm">{raw.slice(1, -1)}</code>)
    }
    last = match.index + raw.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

