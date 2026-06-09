export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: 'admin' | 'viewer'; created_at: string }
        Insert: { id: string; role?: 'admin' | 'viewer' }
        Update: { role?: 'admin' | 'viewer' }
      }
      trees: {
        Row: {
          id: string
          title: string
          description: string | null
          owner_id: string | null
          is_public: boolean
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trees']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['trees']['Insert']>
      }
      nodes: {
        Row: {
          id: string
          tree_id: string
          parent_id: string | null
          title: string
          note_content: Json | null
          progress: number
          position_x: number | null
          position_y: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['nodes']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['nodes']['Insert']>
      }
      node_links: {
        Row: {
          id: string
          source_node_id: string
          target_node_id: string
          label: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['node_links']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['node_links']['Insert']>
      }
    }
  }
}

export type Tree = Database['public']['Tables']['trees']['Row']
export type Node = Database['public']['Tables']['nodes']['Row']
export type NodeLink = Database['public']['Tables']['node_links']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
