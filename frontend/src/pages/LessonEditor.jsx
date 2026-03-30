import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import api from '../api/axios'
import EditorToolbar from '../components/EditorToolbar'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'

export default function LessonEditor() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [htmlMode, setHtmlMode] = useState(false)
  const [htmlSource, setHtmlSource] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing your lesson content here...' }),
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      Youtube.configure({ width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Typography,
      CharacterCount
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor outline-none min-h-[500px]',
      },
    },
    onUpdate: () => {
      setSaveStatus('idle')
    },
  })

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await api.get(`/lessons/${lessonId}`)
        setLesson(res.data)
        setTitle(res.data.title)
        if (editor && res.data.content && Object.keys(res.data.content).length > 0) {
          editor.commands.setContent(res.data.content)
        }
      } catch (err) {
        console.error('Failed to fetch lesson', err)
      } finally {
        setLoading(false)
      }
    }
    if (editor) fetchLesson()
  }, [lessonId, editor])

  function toggleHtmlMode() {
    if (!editor) return
    if (!htmlMode) {
      setHtmlSource(editor.getHTML())
      setHtmlMode(true)
    } else {
      editor.commands.setContent(htmlSource)
      setHtmlMode(false)
    }
  }

  const saveContent = useCallback(async () => {
    if (!editor) return
    if (htmlMode) {
      editor.commands.setContent(htmlSource)
      setHtmlMode(false)
    }
    setSaveStatus('saving')
    try {
      const content = editor.getJSON()
      await api.patch(`/lessons/${lessonId}`, { content })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch (err) {
      console.error('Failed to save', err)
      setSaveStatus('idle')
    }
  }, [editor, lessonId, htmlMode, htmlSource])

  async function saveTitle() {
    if (title !== lesson?.title) {
      try {
        await api.patch(`/lessons/${lessonId}`, { title })
        setLesson((prev) => ({ ...prev, title }))
      } catch (err) {
        console.error('Failed to save title', err)
      }
    }
  }

  if (loading) {
    return <div className="text-center text-stone-400 py-20">Loading...</div>
  }

  if (!lesson) {
    return <div className="text-center text-stone-400 py-20">Lesson not found.</div>
  }

  return (
    <div className="max-w-[960px] mx-auto px-12 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-8 inline-block cursor-pointer"
      >
        ← Back to curriculum builder
      </button>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveTitle}
        placeholder="Lesson title"
        className="w-full text-[32px] font-bold text-stone-900 bg-transparent outline-none placeholder:text-stone-300 mb-8"
      />

      {editor && (
        <EditorToolbar
          editor={editor}
          onSave={saveContent}
          onToggleHtml={toggleHtmlMode}
          isHtmlMode={htmlMode}
        />
      )}

      <div
        className="bg-white rounded-xl mt-4"
        style={{ border: '0.5px solid #E7E5E4' }}
      >
        {htmlMode ? (
          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            className="w-full min-h-[500px] px-10 py-8 font-mono text-sm text-stone-700 bg-stone-50 rounded-xl outline-none resize-y"
            spellCheck={false}
          />
        ) : (
          <div className="px-10 py-8">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-4">
            <p className="text-sm text-stone-400">
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && '✓ All changes saved'}
            {htmlMode && saveStatus === 'idle' && (
                <span className="text-purple-text bg-purple-bg px-2 py-0.5 rounded text-xs font-medium">
                HTML Mode — editing raw source
                </span>
            )}
            </p>
            {editor && !htmlMode && (
            <p className="text-xs text-stone-300">
                {editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} chars
            </p>
            )}
        </div>
        <button
            onClick={saveContent}
            className="text-sm font-medium text-stone-50 bg-stone-900 px-6 py-2.5 rounded-lg hover:bg-stone-700 active:scale-[0.98] transition-all cursor-pointer"
        >
            Save
        </button>
        </div>
    </div>
  )
}