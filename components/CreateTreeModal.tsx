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
  const [error, setError] = useState<string | null>(null)
  const { trees, setTrees } = useAppStore()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Chưa đăng nhập. Vui lòng đăng nhập lại.')
        setLoading(false)
        return
      }
      const { data, error: dbError } = await supabase
        .from('trees')
        .insert({ title: title.trim(), description: description.trim() || null, color, owner_id: user.id, is_public: true })
        .select()
        .single()
      if (dbError) {
        console.error('Supabase error:', dbError)
        if (dbError.code === '42501' || dbError.message.includes('policy')) {
          setError('Lỗi quyền truy cập: Tài khoản chưa được set role admin. Vào Supabase → SQL Editor → chạy: UPDATE public.profiles SET role = \'admin\' WHERE id = \'<your-uuid>\';')
        } else {
          setError(`Lỗi: ${dbError.message}`)
        }
        setLoading(false)
        return
      }
      if (data) {
        setTrees([data, ...trees])
        onClose()
      }
    } catch (err) {
      setError('Đã xảy ra lỗi không xác định.')
      console.error(err)
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
          width: 'calc(100% - 2rem)', maxWidth: 460, zIndex: 101,
          maxHeight: '90dvh',
          display: 'flex', flexDirection: 'column',
          borderRadius: 16,
          border: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Header — fixed */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', flexShrink: 0,
            }}>
              <TreePine size={17} color="white" />
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 700 }}>
              Tạo Tree mới
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '5px 9px', cursor: 'pointer', color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          <form id="create-tree-form" onSubmit={handleCreate}>
            {/* Title */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Tên Tree *
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Lộ trình học Machine Learning"
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Mô tả (tuỳ chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về chủ đề này..."
                rows={2}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
                  resize: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Color picker */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Màu chủ đề
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c, border: 'none', cursor: 'pointer',
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2, transition: 'transform 0.15s, outline 0.15s',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            margin: '0 1.5rem',
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Actions — fixed at bottom */}
        <div style={{
          display: 'flex', gap: '10px',
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(10px)',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '0.88rem',
            }}
          >
            Huỷ
          </button>
          <button
            type="submit"
            form="create-tree-form"
            disabled={!title.trim() || loading}
            style={{
              flex: 2, padding: '9px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
              background: title.trim() ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'rgba(139,92,246,0.2)',
              border: 'none', color: 'white', fontSize: '0.88rem', fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Đang tạo...' : '🌱 Tạo Tree'}
          </button>
        </div>
      </motion.div>
    </>
  )
}
