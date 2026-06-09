import { create } from 'zustand'
import type { Tree, Node, NodeLink } from './supabase/types'

interface AppStore {
  // Auth
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void

  // Selected tree/node
  selectedTreeId: string | null
  setSelectedTreeId: (id: string | null) => void
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void

  // Note panel
  notePanelOpen: boolean
  setNotePanelOpen: (v: boolean) => void

  // Command palette
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void

  // Data cache (realtime updates go here)
  trees: Tree[]
  setTrees: (trees: Tree[]) => void
  updateTree: (tree: Tree) => void
  removeTree: (id: string) => void

  nodes: Node[]
  setNodes: (nodes: Node[]) => void
  updateNode: (node: Node) => void
  removeNode: (id: string) => void

  links: NodeLink[]
  setLinks: (links: NodeLink[]) => void
  removeLink: (id: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  isAdmin: false,
  setIsAdmin: (v) => set({ isAdmin: v }),

  selectedTreeId: null,
  setSelectedTreeId: (id) => set({ selectedTreeId: id }),
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  notePanelOpen: false,
  setNotePanelOpen: (v) => set({ notePanelOpen: v }),

  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),

  trees: [],
  setTrees: (trees) => set({ trees }),
  updateTree: (tree) =>
    set((s) => ({ trees: s.trees.map((t) => (t.id === tree.id ? tree : t)) })),
  removeTree: (id) => set((s) => ({ trees: s.trees.filter((t) => t.id !== id) })),

  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  updateNode: (node) =>
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === node.id ? node : n)) })),
  removeNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),

  links: [],
  setLinks: (links) => set({ links }),
  removeLink: (id) => set((s) => ({ links: s.links.filter((l) => l.id !== id) })),
}))
