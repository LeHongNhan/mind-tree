'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, TreePine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'

const COLORS = [
  '#8b5cf6', '#6d28d9', '#ec4899', '#0ea5e9',
  '#10b981', '#f59e0b', '#ef4444', '#22d3ee',
]

export default function CreateTreeModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const { trees, setTrees } = useAppStore()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('trees')
      .insert({ title: title.trim(), description: description.trim() || null, color, owner_id: user?.id, is_public: true })
      .select()
      .single()
    if (data) {
      setTrees([data, ...trees])
      onClose()
    }
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: 480, zIndex: 101,
          borderRadius: 16, padding: '2rem',
          border: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <TreePine size={18} color="white" />
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 700 }}>
              Tạo Tree mới
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              Tên Tree *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lộ trình học Machine Learning"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              Mô tả (tuỳ chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về chủ đề này..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Color picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              Màu chủ đề
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c, border: 'none', cursor: 'pointer',
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2, transition: 'transform 0.15s, outline 0.15s',
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="glass" style={{
            borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem',
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: color, boxShadow: `0 0 8px ${color}`,
            }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Preview: <strong style={{ color: 'var(--text-primary)' }}>{title || 'Tên Tree'}</strong>
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '0.9rem',
              }}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              style={{
                flex: 2, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: title.trim() ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'rgba(139,92,246,0.2)',
                border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 600,
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Đang tạo...' : '🌱 Tạo Tree'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
