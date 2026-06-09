'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TreePine, Plus, LogOut, Settings, Eye } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import TreeList from '@/components/TreeList'
import CreateTreeModal from '@/components/CreateTreeModal'
import CommandPalette from '@/components/CommandPalette'

export default function AdminPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { setIsAdmin, setCommandOpen } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    setIsAdmin(true)
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setIsAdmin, setCommandOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAdmin(false)
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TreePine size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}
              className="gradient-text">Mind Tree</span>
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20,
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
            }}>ADMIN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setCommandOpen(true)}
              className="glass"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '0.8rem',
                border: '1px solid var(--border)', background: 'transparent',
              }}
            >
              Search <kbd style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '1px 5px', fontSize: '0.7rem',
              }}>⌘K</kbd>
            </button>

            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none',
            }}>
              <Eye size={14} /> View Public
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.05)',
                color: '#fca5a5', fontSize: '0.8rem',
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Page title + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700 }}>
              Quản lý Trees
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Tạo và chỉnh sửa cấu trúc tư duy
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 600,
            }}
          >
            <Plus size={18} /> Tạo Tree mới
          </motion.button>
        </div>

        <TreeList />
      </main>

      {createOpen && <CreateTreeModal onClose={() => setCreateOpen(false)} />}
      <CommandPalette />
    </div>
  )
}
