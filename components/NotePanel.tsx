'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Save, ChevronRight } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { getProgressColor } from '@/lib/utils'

export default function NotePanel() {
  const { notePanelOpen, setNotePanelOpen, selectedNodeId, nodes, updateNode, isAdmin } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Ghi chú, ý tưởng, liên kết...' }),
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: !isAdmin }),
    ],
    content: selectedNode?.note_content as object | undefined || '',
    editable: isAdmin,
    onUpdate: ({ editor }) => {
      if (!isAdmin) return
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(async () => {
        await saveNote(editor.getJSON())
      }, 1200)
    },
  })

  // Update editor content when node changes
  useEffect(() => {
    if (!editor) return
    if (selectedNode?.note_content) {
      editor.commands.setContent(selectedNode.note_content as object)
    } else {
      editor.commands.clearContent()
    }
  }, [selectedNodeId, editor])

  const saveNote = async (content: object) => {
    if (!selectedNodeId) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('nodes')
      .update({ note_content: content })
      .eq('id', selectedNodeId)
      .select()
      .single()
    if (data) {
      updateNode(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleManualSave = async () => {
    if (!editor) return
    await saveNote(editor.getJSON())
  }

  if (!notePanelOpen || !selectedNode) return null

  const progressColor = getProgressColor(selectedNode.progress)

  return (
    <AnimatePresence>
      <motion.div
        key="note-panel"
        initial={{ x: 380, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 380, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass"
        style={{
          width: 360, minWidth: 360,
          height: '100%', display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={15} style={{ color: 'var(--accent-purple)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Ghi chú
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin && (
                <button
                  onClick={handleManualSave}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                    background: saved ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)',
                    border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.2)'}`,
                    color: saved ? '#10b981' : '#8b5cf6', fontSize: '0.75rem',
                  }}
                >
                  <Save size={11} />
                  {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu'}
                </button>
              )}
              <button
                onClick={() => setNotePanelOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Node title */}
          <h3 style={{ margin: '0 0 6px', fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700 }}>
            {selectedNode.title}
          </h3>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${selectedNode.progress}%`,
                background: progressColor,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: progressColor, fontWeight: 600, minWidth: 32 }}>
              {selectedNode.progress}%
            </span>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {!isAdmin && !selectedNode.note_content && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Chưa có ghi chú.
            </p>
          )}
          <EditorContent editor={editor} className="tiptap" />
        </div>

        {/* Toolbar (admin only) */}
        {isAdmin && editor && (
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '4px', flexShrink: 0,
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: 'S', cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
              { label: '`', cmd: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
              { label: 'H', cmd: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight') },
              { label: 'H1', cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
              { label: 'H2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
              { label: '• List', cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
              { label: '" "', cmd: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.cmd}
                style={{
                  padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                  background: btn.active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: btn.active ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
                  color: btn.active ? '#c4b5fd' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: btn.label === 'B' ? 700 : btn.label === 'I' ? 400 : 500,
                  fontStyle: btn.label === 'I' ? 'italic' : 'normal',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {!isAdmin && (
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-muted)', fontSize: '0.75rem',
          }}>
            <ChevronRight size={12} /> Chỉ xem — đăng nhập để chỉnh sửa
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
