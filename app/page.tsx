'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TreePine, GitBranch, Zap, Eye, Lock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import TreeList from '@/components/TreeList'
import CommandPalette from '@/components/CommandPalette'

export default function HomePage() {
  const { setIsAdmin, setCommandOpen } = useAppStore()

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    checkAdmin()

    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setIsAdmin, setCommandOpen])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <header style={{
        padding: '3rem 2rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TreePine size={24} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}
              className="gradient-text">
              Mind Tree
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Visual thought organizer
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
        >
          <button
            onClick={() => setCommandOpen(true)}
            className="glass"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.85rem',
              border: '1px solid var(--border)',
              background: 'transparent',
            }}
          >
            <span>Search</span>
            <kbd style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 6px', fontSize: '0.75rem',
            }}>⌘K</kbd>
          </button>
          <AdminButton />
        </motion.div>
      </header>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 2rem 2rem',
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
        }}
      >
        {[
          { icon: <GitBranch size={14} />, label: 'Inverted tree structure' },
          { icon: <Zap size={14} />, label: 'Live updates' },
          { icon: <Eye size={14} />, label: 'Public viewing' },
          { icon: <Lock size={14} />, label: 'Admin-only editing' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-muted)', fontSize: '0.8rem',
          }}>
            <span style={{ color: 'var(--accent-purple)' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </motion.div>

      {/* Tree list */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <TreeList />
      </main>

      <CommandPalette />
    </div>
  )
}

function AdminButton() {
  const { isAdmin } = useAppStore()

  if (isAdmin) {
    return (
      <Link href="/admin" style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: 8,
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        color: 'white', fontSize: '0.85rem', textDecoration: 'none',
        fontWeight: 500,
      }}>
        <Lock size={14} /> Admin
      </Link>
    )
  }

  return (
    <Link href="/login" style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: 8,
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none',
    }}>
      <Lock size={14} /> Sign in
    </Link>
  )
}
