'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TreePine, FileText, ArrowRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Tree, Node } from '@/lib/supabase/types'

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, trees, nodes } = useAppStore()
  const [query, setQuery] = useState('')
  const [allTrees, setAllTrees] = useState<Tree[]>([])
  const [allNodes, setAllNodes] = useState<Node[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!commandOpen) return
    const supabase = createClient()
    supabase.from('trees').select('*').then(({ data }) => setAllTrees(data || []))
    supabase.from('nodes').select('*').then(({ data }) => setAllNodes(data || []))
  }, [commandOpen])

  const filteredTrees = allTrees.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4)

  const filteredNodes = allNodes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  const handleSelectTree = (id: string) => {
    setCommandOpen(false)
    setQuery('')
    router.push(`/tree/${id}`)
  }

  const handleSelectNode = (node: Node) => {
    setCommandOpen(false)
    setQuery('')
    router.push(`/tree/${node.tree_id}`)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setCommandOpen])

  return (
    <AnimatePresence>
      {commandOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass"
            style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 560, zIndex: 101,
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tree, node..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '1rem',
                }}
              />
              <button
                onClick={() => setCommandOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                }}
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflow: 'auto', padding: '8px 0' }}>
              {filteredTrees.length > 0 && (
                <div>
                  <div style={{ padding: '6px 16px 4px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Trees
                  </div>
                  {filteredTrees.map((tree) => (
                    <button
                      key={tree.id}
                      onClick={() => handleSelectTree(tree.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 16px', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: tree.color || '#8b5cf6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <TreePine size={14} color="white" />
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{tree.title}</div>
                        {tree.description && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tree.description}</div>
                        )}
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              )}

              {filteredNodes.length > 0 && (
                <div>
                  <div style={{ padding: '6px 16px 4px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                    Nodes
                  </div>
                  {filteredNodes.map((node) => {
                    const tree = allTrees.find((t) => t.id === node.tree_id)
                    return (
                      <button
                        key={node.id}
                        onClick={() => handleSelectNode(node)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 16px', background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FileText size={14} style={{ color: '#c4b5fd' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{node.title}</div>
                          {tree && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>in {tree.title}</div>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: node.progress >= 90 ? '#10b981' : node.progress >= 60 ? '#4ecdc4' : node.progress >= 30 ? '#ffd93d' : '#ff6b6b',
                        }}>
                          {node.progress}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {query && filteredTrees.length === 0 && filteredNodes.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Không tìm thấy kết quả cho "{query}"
                </div>
              )}

              {!query && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Nhập để tìm tree hoặc node...
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
