'use client'

import { useEffect } from 'react'
import { ArrowLeft, TreePine } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Tree, Node, NodeLink } from '@/lib/supabase/types'
import TreeCanvas from '@/components/TreeCanvas'
import NotePanel from '@/components/NotePanel'
import CommandPalette from '@/components/CommandPalette'

interface Props {
  tree: Tree
  initialNodes: Node[]
  initialLinks: NodeLink[]
}

export default function TreePageClient({ tree, initialNodes, initialLinks }: Props) {
  const { setNodes, setLinks, updateNode, removeNode, setIsAdmin, setCommandOpen } = useAppStore()

  useEffect(() => {
    setNodes(initialNodes)
    setLinks(initialLinks)

    // Check admin
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', user.id).single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    checkAdmin()

    // Realtime subscriptions
    const supabase = createClient()
    const channel = supabase
      .channel(`tree-${tree.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'nodes',
        filter: `tree_id=eq.${tree.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          updateNode(payload.new as Node)
        } else if (payload.eventType === 'DELETE') {
          removeNode((payload.old as Node).id)
        }
      })
      .subscribe()

    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('keydown', handleKey)
    }
  }, [tree.id, initialNodes, initialLinks, setNodes, setLinks, updateNode, removeNode, setIsAdmin, setCommandOpen])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header className="glass" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 1.5rem', height: 52,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, zIndex: 10,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem',
          padding: '4px 8px', borderRadius: 6,
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <span style={{ color: 'var(--border)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 24, height: 24,
            background: tree.color || 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TreePine size={12} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem' }}>{tree.title}</span>
          {tree.description && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— {tree.description}</span>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981',
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live</span>
        </div>
      </header>

      {/* Canvas + Note Panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <TreeCanvas tree={tree} />
        <NotePanel />
      </div>

      <CommandPalette />
    </div>
  )
}
