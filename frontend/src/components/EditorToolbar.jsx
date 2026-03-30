import { useState, useRef, useEffect } from 'react'

const COLORS = [
  { label: 'Default', value: null },
  { label: 'Red', value: '#DC2626' },
  { label: 'Orange', value: '#EA580C' },
  { label: 'Yellow', value: '#CA8A04' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Pink', value: '#DB2777' },
  { label: 'Stone', value: '#78716C' },
]

export default function EditorToolbar({ editor, onSave, onToggleHtml, isHtmlMode }) {
  const [showColors, setShowColors] = useState(false)
  const colorRef = useRef(null)

  useEffect(() => {
    function close(e) {
      if (colorRef.current && !colorRef.current.contains(e.target)) setShowColors(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!editor) return null

  const btnClass = (active) =>
    `w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
      active ? 'bg-purple-bg text-purple-text' : 'text-stone-500 hover:bg-stone-100'
    }`

  const divider = <span className="w-px h-5 bg-stone-200 mx-0.5 shrink-0" />

  function setLink() {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter URL:', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  function addImage() {
    const url = window.prompt('Enter image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  function addYoutube() {
    const url = window.prompt('Enter YouTube URL:')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  function insertTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div
      className="sticky top-14 z-40 flex flex-wrap items-center gap-0.5 px-3 py-2 bg-white rounded-xl"
      style={{ border: '0.5px solid #E7E5E4' }}
    >
      {/* Text formatting */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold (⌘B)">
        <span className="font-bold">B</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic (⌘I)">
        <span className="italic">I</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline (⌘U)">
        <span className="underline">U</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Strikethrough">
        <span className="line-through">S</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={btnClass(editor.isActive('code'))} title="Inline Code">
        <span className="font-mono text-[10px]">&lt;&gt;</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight">
        <span className="text-[10px]" style={{ backgroundColor: '#FEF08A', padding: '0 3px', borderRadius: '2px' }}>H</span>
      </button>
      <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={btnClass(editor.isActive('subscript'))} title="Subscript">
        <span className="text-[10px]">X<sub>2</sub></span>
      </button>
      <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={btnClass(editor.isActive('superscript'))} title="Superscript">
        <span className="text-[10px]">X<sup>2</sup></span>
      </button>

      {/* Text Color */}
      <div className="relative" ref={colorRef}>
        <button
          onClick={() => setShowColors(!showColors)}
          className={btnClass(false)}
          title="Text Color"
        >
          <span style={{ borderBottom: `2.5px solid ${editor.getAttributes('textStyle').color || '#1C1917'}` }}>A</span>
        </button>
        {showColors && (
          <div
            className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-50"
            style={{ border: '0.5px solid #E7E5E4' }}
          >
            {COLORS.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run()
                  } else {
                    editor.chain().focus().unsetColor().run()
                  }
                  setShowColors(false)
                }}
                className="w-6 h-6 rounded-full border border-stone-200 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value || '#1C1917' }}
                title={c.label}
              />
            ))}
          </div>
        )}
      </div>

      {divider}

      {/* Headings */}
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        H1
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        H2
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        H3
      </button>

      {divider}

      {/* Lists & blocks */}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="4" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="3" cy="12" r="1.5"/><rect x="6" y="3" width="9" height="2" rx="0.5"/><rect x="6" y="7" width="9" height="2" rx="0.5"/><rect x="6" y="11" width="9" height="2" rx="0.5"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="1" y="5.5" fontSize="5" fontWeight="600">1</text><text x="1" y="9.5" fontSize="5" fontWeight="600">2</text><text x="1" y="13.5" fontSize="5" fontWeight="600">3</text><rect x="6" y="3" width="9" height="2" rx="0.5"/><rect x="6" y="7" width="9" height="2" rx="0.5"/><rect x="6" y="11" width="9" height="2" rx="0.5"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive('taskList'))} title="Checklist">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M2.5 4.5L4 6L6.5 2.5" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="8" y="4" width="7" height="1.5" rx="0.5"/><rect x="8" y="11" width="7" height="1.5" rx="0.5"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Blockquote">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 3h4v4H5l-2 3V7H3V3zm7 0h4v4h-2l-2 3V7h-1V3z"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code Block">
        <span className="font-mono text-[10px]">{'{ }'}</span>
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="7" width="14" height="2" rx="1"/></svg>
      </button>

      {divider}

      {/* Table */}
      <button onClick={insertTable} className={btnClass(false)} title="Insert Table">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><line x1="1.5" y1="6" x2="14.5" y2="6"/><line x1="1.5" y1="10" x2="14.5" y2="10"/><line x1="6" y1="2.5" x2="6" y2="13.5"/><line x1="10.5" y1="2.5" x2="10.5" y2="13.5"/></svg>
      </button>

      {/* Link, Image, YouTube */}
      <button onClick={setLink} className={btnClass(editor.isActive('link'))} title="Insert Link">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5l3-3M5.5 7.5L4 9a2.83 2.83 0 004 4l1.5-1.5M10.5 8.5L12 7a2.83 2.83 0 00-4-4L6.5 4.5"/></svg>
      </button>
      <button onClick={addImage} className={btnClass(false)} title="Insert Image">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><circle cx="5" cy="6" r="1.5"/><path d="M1.5 11l3.5-3.5 2.5 2.5 2.5-3L14.5 11"/></svg>
      </button>
      <button onClick={addYoutube} className={btnClass(false)} title="Embed YouTube">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14.2 4.3c-.2-.6-.7-1.1-1.3-1.3C11.8 2.7 8 2.7 8 2.7s-3.8 0-4.9.3c-.6.2-1.1.7-1.3 1.3C1.5 5.4 1.5 8 1.5 8s0 2.6.3 3.7c.2.6.7 1.1 1.3 1.3 1.1.3 4.9.3 4.9.3s3.8 0 4.9-.3c.6-.2 1.1-.7 1.3-1.3.3-1.1.3-3.7.3-3.7s0-2.6-.3-3.7zM6.7 10.3V5.7L10.3 8l-3.6 2.3z"/></svg>
      </button>

      {divider}

      {/* Alignment */}
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.5"/><rect x="1" y="6" width="9" height="1.5" rx="0.5"/><rect x="1" y="10" width="12" height="1.5" rx="0.5"/><rect x="1" y="14" width="7" height="1.5" rx="0.5"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.5"/><rect x="3.5" y="6" width="9" height="1.5" rx="0.5"/><rect x="2" y="10" width="12" height="1.5" rx="0.5"/><rect x="4.5" y="14" width="7" height="1.5" rx="0.5"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx="0.5"/><rect x="6" y="6" width="9" height="1.5" rx="0.5"/><rect x="3" y="10" width="12" height="1.5" rx="0.5"/><rect x="8" y="14" width="7" height="1.5" rx="0.5"/></svg>
      </button>

      {divider}

      {/* Undo / Redo */}
      <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} title="Undo (⌘Z)">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h7a3 3 0 010 6H8M3 7l3-3M3 7l3 3"/></svg>
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} title="Redo (⌘⇧Z)">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 7H6a3 3 0 000 6h2M13 7l-3-3M13 7l-3 3"/></svg>
      </button>

      {divider}

      {/* HTML Source */}
      <button onClick={onToggleHtml} className={btnClass(isHtmlMode)} title="Toggle HTML Source">
        <span className="font-mono text-[10px]">HTML</span>
      </button>
    </div>
  )
}