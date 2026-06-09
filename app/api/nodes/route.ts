import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: 'Unauthorized', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile as { role?: string } | null)?.role
  if (role !== 'admin') return { user: null, error: 'Forbidden', status: 403 }
  return { user, error: null, status: 200 }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const treeId = searchParams.get('treeId')

  const supabase = await createClient()
  const { data, error } = treeId
    ? await supabase.from('nodes').select('*').eq('tree_id', treeId).order('created_at')
    : await supabase.from('nodes').select('*').order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { user, error, status } = await checkAdmin()
  if (!user) return NextResponse.json({ error }, { status })

  const body = await request.json() as {
    tree_id: string
    parent_id?: string | null
    title: string
    progress?: number
  }

  const supabase = await createAdminClient()
  const { data, error: dbError } = await supabase.from('nodes').insert({
    tree_id: body.tree_id,
    parent_id: body.parent_id ?? null,
    title: body.title,
    progress: body.progress ?? 0,
  }).select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const { user, error, status } = await checkAdmin()
  if (!user) return NextResponse.json({ error }, { status })

  const body = await request.json() as {
    id: string
    title?: string
    progress?: number
    note_content?: unknown
    position_x?: number
    position_y?: number
  }

  const supabase = await createAdminClient()
  const updateFields: {
    title?: string
    progress?: number
    note_content?: unknown
    position_x?: number
    position_y?: number
    updated_at: string
  } = { updated_at: new Date().toISOString() }

  if (body.title !== undefined) updateFields.title = body.title
  if (body.progress !== undefined) updateFields.progress = body.progress
  if (body.note_content !== undefined) updateFields.note_content = body.note_content
  if (body.position_x !== undefined) updateFields.position_x = body.position_x
  if (body.position_y !== undefined) updateFields.position_y = body.position_y

  const { data, error: dbError } = await supabase
    .from('nodes')
    .update(updateFields)
    .eq('id', body.id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { user, error, status } = await checkAdmin()
  if (!user) return NextResponse.json({ error }, { status })

  const { id } = await request.json() as { id: string }
  const supabase = await createAdminClient()
  const { error: dbError } = await supabase.from('nodes').delete().eq('id', id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
