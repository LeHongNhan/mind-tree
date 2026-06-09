'use client'

import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { Node } from '@/lib/supabase/types'
import { getProgressColor } from '@/lib/utils'

interface TreeNodeData {
  node: Node
  isRoot: boolean
  isAdmin: boolean
  treeColor: string
}

const ProgressRing = ({ progress, size, color }: { progress: number; size: number; color: string }) => {
  const r = (size - 6) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

const TreeNodeComponent = ({ data, selected }: NodeProps<TreeNodeData>) => {
  const { node, isRoot, isAdmin, treeColor } = data
  const { setSelectedNodeId, setNotePanelOpen, nodes, setNodes, updateNode, removeNode } = useAppStore()
  const [hovering, setHovering] = useState(false)

  const progressColor = getProgressColor(node.progress)
  const width = isRoot ? 200 : 168
  const fontSize = isRoot ? '0.95rem' : '0.82rem'

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const title = prompt('Tên node con:')
    if (!title) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: newNode } = await supabase
      .from('nodes')
      .insert({ tree_id: node.tree_id, parent_id: node.id, title, progress: 0 })
      .select()
      .single()
    if (newNode) setNodes([...nodes, newNode])
  }

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const title = prompt('Tên mới:', node.title)
    if (!title || title === node.title) return
    const progressStr = prompt('% hoàn thành (0-100):', String(node.progress))
    const progress = progressStr !== null ? Math.min(100, Math.max(0, parseInt(progressStr) || 0)) : node.progress
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: updated } = await supabase
      .from('nodes')
      .update({ title, progress })
      .eq('id', node.id)
      .select()
      .single()
    if (updated) updateNode(updated)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Xoá node "${node.title}"?`)) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('nodes').delete().eq('id', node.id)
    removeNode(node.id)
  }

  const handleOpenNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNodeId(node.id)
    setNotePanelOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        width,
        background: selected
          ? 'rgba(139,92,246,0.12)'
          : hovering
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(19,19,31,0.95)',
        border: `1.5px solid ${selected
          ? 'rgba(139,92,246,0.6)'
          : isRoot
          ? `${treeColor}60`
          : 'rgba(255,255,255,0.08)'}`,
        borderRadius: isRoot ? 14 : 10,
        padding: isRoot ? '14px 16px' : '10px 12px',
        boxShadow: selected
          ? `0 0 20px rgba(139,92,246,0.2)`
          : isRoot
          ? `0 0 30px ${treeColor}20`
          : 'none',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Top accent for root */}
      {isRoot && (
        <div style={{
          position: 'absolute', top: 0, left: 12, right: 12, height: 2,
          background: `linear-gradient(90deg, transparent, ${treeColor}, transparent)`,
          borderRadius: '0 0 2px 2px',
        }} />
      )}

      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ProgressRing progress={node.progress} size={isRoot ? 40 : 34} color={progressColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize,
            fontWeight: isRoot ? 700 : 600,
            fontFamily: isRoot ? 'Outfit, sans-serif' : 'Inter, sans-serif',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}>
            {node.title}
          </div>
          <div style={{ fontSize: '0.72rem', color: progressColor, marginTop: 2, fontWeight: 600 }}>
            {node.progress}%
          </div>
        </div>
      </div>

      {/* Note indicator */}
      {node.note_content && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent-cyan)',
          boxShadow: '0 0 6px var(--accent-cyan)',
        }} />
      )}

      {/* Admin actions */}
      {isAdmin && hovering && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '4px', zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '4px 6px',
            whiteSpace: 'nowrap',
          }}
        >
          <ActionBtn icon={<Plus size={12} />} label="Child" onClick={handleAddChild} color="#8b5cf6" />
          <ActionBtn icon={<Edit2 size={12} />} label="Edit" onClick={handleEdit} color="#22d3ee" />
          <ActionBtn icon={<FileText size={12} />} label="Note" onClick={handleOpenNote} color="#10b981" />
          <ActionBtn icon={<Trash2 size={12} />} label="Del" onClick={handleDelete} color="#f87171" />
        </motion.div>
      )}

      {!isAdmin && hovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)',
            zIndex: 100,
          }}
        >
          <button
            onClick={handleOpenNote}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.72rem',
            }}
          >
            <FileText size={11} /> Note
          </button>
        </motion.div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </motion.div>
  )
}

function ActionBtn({
  icon, label, onClick, color,
}: {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '3px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color, fontSize: '0.7rem', padding: '2px 5px', borderRadius: 4,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}18`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon} {label}
    </button>
  )
}

export default memo(TreeNodeComponent)
