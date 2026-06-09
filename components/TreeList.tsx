'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TreePine, ChevronRight, Plus, Trash2, Lock, Globe } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Tree } from '@/lib/supabase/types'
import { getProgressColor } from '@/lib/utils'

export default function TreeList() {
  const { trees, setTrees, updateTree, removeTree, isAdmin } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchTrees = async () => {
      const { data } = await supabase
        .from('trees')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      setTrees(data || [])
      setLoading(false)
    }
    fetchTrees()

    // Realtime
    const channel = supabase
      .channel('trees-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trees' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTrees([payload.new as Tree, ...trees])
        } else if (payload.eventType === 'UPDATE') {
          updateTree(payload.new as Tree)
        } else if (payload.eventType === 'DELETE') {
          removeTree((payload.old as Tree).id)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Xoá tree này? Tất cả nodes sẽ bị xoá theo.')) return
    const supabase = createClient()
    await supabase.from('trees').delete().eq('id', id)
    removeTree(id)
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[1,2,3].map(i => (
          <div key={i} className="glass" style={{
            height: 180, borderRadius: 16,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
            animation: 'shimmer 1.5s infinite',
          }} />
        ))}
        <style>{`@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
      </div>
    )
  }

  if (trees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center', padding: '5rem 2rem' }}
      >
        <div style={{
          width: 80, height: 80, margin: '0 auto 1.5rem',
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TreePine size={36} style={{ color: 'var(--accent-purple)' }} />
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'Outfit', fontSize: '1.2rem' }}>
          Chưa có Tree nào
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isAdmin ? 'Tạo tree đầu tiên để bắt đầu.' : 'Admin chưa tạo nội dung.'}
        </p>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
      <AnimatePresence>
        {trees.map((tree, i) => (
          <TreeCard key={tree.id} tree={tree} index={i} isAdmin={isAdmin} onDelete={handleDelete} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function TreeCard({
  tree, index, isAdmin, onDelete,
}: {
  tree: Tree
  index: number
  isAdmin: boolean
  onDelete: (e: React.MouseEvent, id: string) => void
}) {
  const [nodeCount, setNodeCount] = useState(0)
  const [avgProgress, setAvgProgress] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('nodes')
        .select('progress')
        .eq('tree_id', tree.id)
      if (data && data.length > 0) {
        setNodeCount(data.length)
        setAvgProgress(Math.round(data.reduce((s, n) => s + n.progress, 0) / data.length))
      }
    }
    fetch()
  }, [tree.id])

  const progressColor = getProgressColor(avgProgress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/tree/${tree.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="glass" style={{
          borderRadius: 16, padding: '1.5rem',
          border: '1px solid var(--border)',
          cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
          position: 'relative', overflow: 'hidden',
        }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.3)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px rgba(139,92,246,0.08)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
          }}
        >
          {/* Color accent top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${tree.color || '#8b5cf6'}, transparent)`,
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${tree.color || '#8b5cf6'}, ${tree.color || '#6d28d9'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 15px ${tree.color || '#8b5cf6'}40`,
              }}>
                <TreePine size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tree.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Globe size={10} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Public</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={(e) => onDelete(e, tree.id)}
                style={{
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  color: '#f87171', flexShrink: 0,
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Description */}
          {tree.description && (
            <p style={{
              margin: '12px 0 0', color: 'var(--text-secondary)',
              fontSize: '0.82rem', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {tree.description}
            </p>
          )}

          {/* Progress */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {nodeCount} nodes
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: progressColor }}>
                {avgProgress}%
              </span>
            </div>
            <div style={{
              height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${avgProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
                style={{ height: '100%', borderRadius: 2, background: progressColor }}
              />
            </div>
          </div>

          {/* View CTA */}
          <div style={{
            marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '4px', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 500,
          }}>
            Xem Tree <ChevronRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
