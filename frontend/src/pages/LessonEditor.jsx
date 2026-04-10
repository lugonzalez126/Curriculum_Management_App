import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Selection } from '@tiptap/extensions'
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'

// Node styles
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

// UI Primitives
import { Spacer } from '@/components/tiptap-ui-primitive/spacer'
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar'

// Tiptap UI
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import { ColorHighlightPopover } from '@/components/tiptap-ui/color-highlight-popover'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'

// Editor styles
import '@/components/tiptap-templates/simple/simple-editor.scss'

import api from '../api/axios'

export default function LessonEditor() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const toolbarRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
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

  const saveContent = useCallback(async () => {
    if (!editor) return
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
  }, [editor, lessonId])

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

      <div className="simple-editor-wrapper">
        <EditorContext.Provider value={{ editor }}>
          <Toolbar ref={toolbarRef}>
            <Spacer />
            <ToolbarGroup>
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
              <ListDropdownMenu modal={false} types={['bulletList', 'orderedList', 'taskList']} />
              <BlockquoteButton />
              <CodeBlockButton />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="strike" />
              <MarkButton type="code" />
              <MarkButton type="underline" />
              <ColorHighlightPopover />
              <LinkPopover />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <MarkButton type="superscript" />
              <MarkButton type="subscript" />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />
            </ToolbarGroup>
            <Spacer />
          </Toolbar>

          <EditorContent editor={editor} className="simple-editor-content" />
        </EditorContext.Provider>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-stone-400">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && '✓ All changes saved'}
        </p>
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