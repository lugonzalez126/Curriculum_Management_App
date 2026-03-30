import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../api/axios'
import Toggle from '../components/Toggle'
import ConfirmDelete from '../components/ConfirmDelete'

export default function CurriculumBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    fetchCurriculum()
  }, [id])

  async function fetchCurriculum() {
    try {
      const res = await api.get(`/curricula/${id}`)
      setCurriculum(res.data)
    } catch (err) {
      console.error('Failed to fetch curriculum', err)
    } finally {
      setLoading(false)
    }
  }

  function autoSaveField(field, value) {
    return api.patch(`/curricula/${id}`, { [field]: value })
  }

  async function addModule() {
    try {
      const res = await api.post(`/curricula/${id}/modules`, { title: 'Untitled Module' })
      setCurriculum((prev) => ({
        ...prev,
        modules: [...(prev.modules || []), { ...res.data, lessons: [] }],
      }))
      setExpandedModules((prev) => ({ ...prev, [res.data.id]: true }))
    } catch (err) {
      console.error('Failed to create module', err)
    }
  }

  async function updateModule(moduleId, data) {
    try {
      await api.patch(`/modules/${moduleId}`, data)
    } catch (err) {
      console.error('Failed to update module', err)
    }
  }

  async function deleteModule(moduleId) {
    const backup = curriculum.modules
    setCurriculum((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }))
    try {
      await api.delete(`/modules/${moduleId}`)
    } catch (err) {
      console.error('Failed to delete module', err)
      setCurriculum((prev) => ({ ...prev, modules: backup }))
    }
  }

  async function addLesson(moduleId) {
    try {
      const res = await api.post(`/modules/${moduleId}/lessons`, {
        title: 'Untitled Lesson',
      })
      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), res.data] }
            : m
        ),
      }))
    } catch (err) {
      console.error('Failed to create lesson', err)
    }
  }

  async function updateLesson(lessonId, data) {
    try {
      await api.patch(`/lessons/${lessonId}`, data)
    } catch (err) {
      console.error('Failed to update lesson', err)
    }
  }

  async function deleteLesson(lessonId, moduleId) {
    const backup = curriculum.modules
    setCurriculum((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    }))
    try {
      await api.delete(`/lessons/${lessonId}`)
    } catch (err) {
      console.error('Failed to delete lesson', err)
      setCurriculum((prev) => ({ ...prev, modules: backup }))
    }
  }

  function toggleExpanded(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  // --- Module reorder ---
  async function handleModuleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const modules = getSortedModules()
    const oldIndex = modules.findIndex((m) => m.id === active.id)
    const newIndex = modules.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(modules, oldIndex, newIndex)

    // Optimistic update
    setCurriculum((prev) => ({
      ...prev,
      modules: reordered.map((m, i) => ({ ...m, order: i })),
    }))

    try {
      await api.patch(`/modules/${active.id}/reorder?new_position=${newIndex}`)
    } catch (err) {
      console.error('Failed to reorder module', err)
      fetchCurriculum()
    }
  }

  // --- Lesson reorder ---
  async function handleLessonDragEnd(moduleId, event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const mod = curriculum.modules.find((m) => m.id === moduleId)
    const lessons = [...(mod.lessons || [])].sort((a, b) => a.order - b.order)
    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(lessons, oldIndex, newIndex)

    // Optimistic update
    setCurriculum((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: reordered.map((l, i) => ({ ...l, order: i })) }
          : m
      ),
    }))

    try {
      await api.patch(`/lessons/${active.id}/reorder?new_position=${newIndex}`)
    } catch (err) {
      console.error('Failed to reorder lesson', err)
      fetchCurriculum()
    }
  }

  function getSortedModules() {
    return [...(curriculum?.modules || [])].sort((a, b) => a.order - b.order)
  }

  if (loading) {
    return <div className="text-center text-stone-400 py-20">Loading...</div>
  }

  if (!curriculum) {
    return <div className="text-center text-stone-400 py-20">Curriculum not found.</div>
  }

  const modules = getSortedModules()

  return (
    <div className="max-w-[820px] mx-auto px-12 py-10">
      <Link
        to="/dashboard"
        className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-8 inline-block"
      >
        ← Back to dashboard
      </Link>

      <div className="flex flex-col gap-4 mb-10">
        <AutoSaveInput
          initialValue={curriculum.title}
          onSave={(val) => autoSaveField('title', val)}
          placeholder="Curriculum title"
          className="text-2xl font-bold text-stone-700 bg-transparent outline-none w-full placeholder:text-stone-300"
        />
        <AutoSaveInput
          initialValue={curriculum.description}
          onSave={(val) => autoSaveField('description', val)}
          placeholder="Add a description..."
          multiline
          className="text-sm text-stone-700 rounded-lg px-4 py-3 outline-none w-full placeholder:text-stone-300 resize-none"
          bordered
        />
        <AutoSaveInput
          initialValue={curriculum.cover_image_url || ''}
          onSave={(val) => autoSaveField('cover_image_url', val || null)}
          placeholder="Cover image URL (optional)"
          className="text-sm text-stone-700 rounded-lg px-4 py-2.5 outline-none w-full placeholder:text-stone-300"
          bordered
        />
      </div>

      <div
        className="flex items-center justify-between p-4 rounded-xl mb-10"
        style={{ border: '0.5px solid #E7E5E4' }}
      >
        <div>
          <p className="text-sm font-medium text-stone-900">Publish curriculum</p>
          <p className="text-xs text-stone-400 mt-0.5">Make this curriculum visible to everyone</p>
        </div>
        <Toggle
          enabled={curriculum.is_published}
          onChange={async (val) => {
            await api.patch(`/curricula/${id}`, { is_published: val })
            setCurriculum((prev) => ({ ...prev, is_published: val }))
          }}
        />
      </div>

      {!curriculum.is_published && (
        <p className="text-xs text-stone-400 -mt-6 mb-8">
          Curriculum must be published for modules to be visible to learners.
        </p>
      )}

      {/* Sortable Modules */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {modules.map((mod) => (
              <SortableModule
                key={mod.id}
                mod={mod}
                expanded={expandedModules[mod.id]}
                onToggle={() => toggleExpanded(mod.id)}
                onUpdateModule={updateModule}
                onDeleteModule={deleteModule}
                onAddLesson={addLesson}
                onUpdateLesson={updateLesson}
                onDeleteLesson={deleteLesson}
                onLessonDragEnd={(event) => handleLessonDragEnd(mod.id, event)}
                onEditLesson={(lessonId) => navigate(`/dashboard/lessons/${lessonId}/edit`)}
                setCurriculum={setCurriculum}
                sensors={sensors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={addModule}
        className="w-full mt-4 py-4 rounded-xl text-sm font-medium text-stone-400 hover:text-stone-500 hover:border-stone-300 transition-colors cursor-pointer"
        style={{ border: '1.5px dashed #D6D3D1' }}
      >
        + Add new module
      </button>
    </div>
  )
}

// --- Sortable Module ---
function SortableModule({
  mod,
  expanded,
  onToggle,
  onUpdateModule,
  onDeleteModule,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onLessonDragEnd,
  onEditLesson,
  setCurriculum,
  sensors,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  const lessons = [...(mod.lessons || [])].sort((a, b) => a.order - b.order)

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl overflow-hidden" {...attributes}>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '0.5px solid #E7E5E4' }}
      >
        {/* Module Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-50">
          {/* Drag Handle */}
          <span
            {...listeners}
            className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing text-xs select-none touch-none"
          >
            ⠿
          </span>

          <button
            onClick={onToggle}
            className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
              style={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path d="M6 3l5 5-5 5V3z" />
            </svg>
          </button>

          <AutoSaveInput
            initialValue={mod.title}
            onSave={(val) => onUpdateModule(mod.id, { title: val })}
            placeholder="Module title"
            className="flex-1 text-sm font-medium text-stone-700 bg-transparent outline-none placeholder:text-stone-300"
          />

          <Toggle
            enabled={mod.is_published}
            onChange={async (val) => {
              await onUpdateModule(mod.id, { is_published: val })
              setCurriculum((prev) => ({
                ...prev,
                modules: prev.modules.map((m) =>
                  m.id === mod.id ? { ...m, is_published: val } : m
                ),
              }))
            }}
          />

          <ConfirmDelete onConfirm={() => onDeleteModule(mod.id)} />
        </div>

        {/* Sortable Lessons */}
        {expanded && (
          <div className="bg-white">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
              <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                {lessons.map((lesson) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    onUpdateLesson={onUpdateLesson}
                    onDeleteLesson={(lessonId) => onDeleteLesson(lessonId, mod.id)}
                    onEditLesson={onEditLesson}
                    setCurriculum={setCurriculum}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button
              onClick={() => onAddLesson(mod.id)}
              className="w-full py-2.5 text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              style={{ borderTop: '0.5px solid #E7E5E4' }}
            >
              + Add lesson
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Sortable Lesson ---
function SortableLesson({ lesson, onUpdateLesson, onDeleteLesson, onEditLesson, setCurriculum }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    borderTop: '0.5px solid #E7E5E4',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-3 px-4 py-2.5 bg-white">
      <span
        {...listeners}
        className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing text-xs select-none touch-none"
      >
        ⠿
      </span>

      <AutoSaveInput
        initialValue={lesson.title}
        onSave={(val) => onUpdateLesson(lesson.id, { title: val })}
        placeholder="Lesson title"
        className={`flex-1 text-sm bg-transparent outline-none placeholder:text-stone-300 ${
          lesson.is_published ? 'text-stone-700' : 'text-stone-400'
        }`}
      />

      <Toggle
        enabled={lesson.is_published}
        onChange={async (val) => {
          await onUpdateLesson(lesson.id, { is_published: val })
          setCurriculum((prev) => ({
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === lesson.module_id
                ? {
                    ...m,
                    lessons: m.lessons.map((l) =>
                      l.id === lesson.id ? { ...l, is_published: val } : l
                    ),
                  }
                : m
            ),
          }))
        }}
      />

      <button
        onClick={() => onEditLesson(lesson.id)}
        className="text-stone-300 hover:text-blue-600 transition-colors cursor-pointer text-sm"
      >
        ✎
      </button>

      <ConfirmDelete onConfirm={() => onDeleteLesson(lesson.id)} />
    </div>
  )
}

// --- AutoSaveInput ---
function AutoSaveInput({
  initialValue,
  onSave,
  placeholder,
  multiline = false,
  bordered = false,
  className = '',
}) {
  const [value, setValue] = useState(initialValue)
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const savedValue = useRef(initialValue)

  useEffect(() => {
    setValue(initialValue)
    savedValue.current = initialValue
  }, [initialValue])

  function handleChange(e) {
    setValue(e.target.value)
    setDirty(true)
    setSaveState('idle')
  }

  async function handleBlur() {
    if (value !== savedValue.current) {
      setSaveState('saving')
      try {
        await onSave(value)
        savedValue.current = value
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 800)
      } catch {
        setSaveState('idle')
      }
    }
    setDirty(false)
  }

  function bgColor() {
    if (saveState === 'saved') return 'rgba(16, 185, 129, 0.08)'
    if (saveState === 'saving') return 'rgba(168, 162, 158, 0.08)'
    if (dirty) return 'rgba(168, 162, 158, 0.06)'
    return bordered ? '#FAFAF9' : 'transparent'
  }

  const style = {
    border: bordered ? '0.5px solid #E7E5E4' : '0.5px solid transparent',
    backgroundColor: bgColor(),
    transition: 'background-color 0.4s ease, border-color 0.3s ease',
  }

  const props = {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    className,
    style,
  }

  return multiline ? <textarea rows={3} {...props} /> : <input type="text" {...props} />
}