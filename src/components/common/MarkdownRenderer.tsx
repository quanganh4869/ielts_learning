import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null

  // Split content into blocks by double newlines or single newlines with headings/bullets
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let inCodeBlock = false
  let codeBuffer: string[] = []
  let listBuffer: string[] = []
  let isNumberedList = false

  const flushList = () => {
    if (listBuffer.length > 0) {
      if (isNumberedList) {
        blocks.push(
          <ol key={`ol-${blocks.length}`} className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-inherit">
            {listBuffer.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        )
      } else {
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="list-disc list-inside space-y-1 my-1.5 pl-1 text-inherit">
            {listBuffer.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        )
      }
      listBuffer = []
      isNumberedList = false
    }
  }

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      blocks.push(
        <pre
          key={`code-${blocks.length}`}
          className="bg-black/85 text-emerald-300 p-3 rounded-xl font-mono text-xs overflow-x-auto my-2 border border-black/20"
        >
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      )
      codeBuffer = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Handle code block fences
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCode()
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine)
      continue
    }

    // Unordered list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumberedList) flushList()
      listBuffer.push(trimmed.slice(2))
      continue
    }

    // Numbered list item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      if (!isNumberedList && listBuffer.length > 0) flushList()
      isNumberedList = true
      listBuffer.push(numMatch[2])
      continue
    }

    // If regular line, flush pending lists
    flushList()

    if (!trimmed) {
      // Empty line, add subtle gap if not already at end
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={`h4-${blocks.length}`} className="font-bold text-sm text-inherit mt-2.5 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="font-extrabold text-base text-inherit mt-3 mb-1.5">
          {renderInline(trimmed.slice(3))}
        </h3>
      )
      continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="font-black text-lg text-inherit mt-3.5 mb-2">
          {renderInline(trimmed.slice(2))}
        </h2>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="border-l-3 border-[#28665F] pl-3 py-1 my-2 italic opacity-90 text-inherit bg-emerald-500/5 rounded-r-md"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
      continue
    }

    // Normal paragraph
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-relaxed my-1">
        {renderInline(rawLine)}
      </p>
    )
  }

  flushList()
  flushCode()

  return <div className={`space-y-1 ${className}`}>{blocks}</div>
}

function renderInline(text: string): React.ReactNode[] {
  // Regex pattern for **bold**, *italic*, `code`, and [link](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (!part) return null

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[0.9em] font-semibold text-inherit"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      const [, label, url] = linkMatch
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 font-medium"
        >
          {label}
        </a>
      )
    }

    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}
