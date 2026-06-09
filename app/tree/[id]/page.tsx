import { createClient } from '@/lib/supabase/server'
import TreePageClient from './TreePageClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: tree } = await supabase.from('trees').select('title,description').eq('id', id).single()
  if (!tree) return { title: 'Not Found' }
  return {
    title: `${tree.title} — Mind Tree`,
    description: tree.description || 'Xem cấu trúc tư duy dạng cây',
  }
}

export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tree } = await supabase
    .from('trees')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!tree) notFound()

  const { data: nodes } = await supabase
    .from('nodes')
    .select('*')
    .eq('tree_id', id)
    .order('created_at')

  const { data: links } = await supabase
    .from('node_links')
    .select('*')

  return <TreePageClient tree={tree} initialNodes={nodes || []} initialLinks={links || []} />
}
