'use client'

import { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node as RFNode,
  type Edge,
  type Connection,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAppStore } from '@/lib/store'
import type { Tree, Node } from '@/lib/supabase/types'
import TreeNode from './TreeNode'
import { getProgressColor } from '@/lib/utils'

const nodeTypes = { treeNode: TreeNode }

interface Props {
  tree: Tree
}

// Layout: place nodes in tree hierarchy top-down
function layoutNodes(nodes: Node[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const children = new Map<string | null, Node[]>()

  nodes.forEach((n) => {
    const key = n.parent_id || null
    if (!children.has(key)) children.set(key, [])
    children.get(key)!.push(n)
  })

  const NODE_WIDTH = 200
  const LEVEL_HEIGHT = 160

  function calcSubtreeWidth(nodeId: string): number {
    const kids = children.get(nodeId) || []
    if (kids.length === 0) return NODE_WIDTH + 20
    return kids.reduce((sum, k) => sum + calcSubtreeWidth(k.id), 0)
  }

  function place(nodeId: string, x: number, y: number) {
    positions.set(nodeId, { x, y })
    const kids = children.get(nodeId) || []
    let cx = x - (kids.reduce((s, k) => s + calcSubtreeWidth(k.id), 0)) / 2
    kids.forEach((kid) => {
      const w = calcSubtreeWidth(kid.id)
      place(kid.id, cx + w / 2, y + LEVEL_HEIGHT)
      cx += w
    })
  }

  const roots = children.get(null) || []
  let startX = 0
  roots.forEach((root) => {
    const w = calcSubtreeWidth(root.id)
    place(root.id, startX + w / 2, 0)
    startX += w + 40
  })

  return positions
}

export default function TreeCanvas({ tree }: Props) {
  const { nodes: storeNodes, links, isAdmin, setSelectedNodeId, setNotePanelOpen } = useAppStore()
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (!storeNodes.length) {
      setRfNodes([])
      setRfEdges([])
      return
    }

    const positions = layoutNodes(storeNodes)

    const newNodes: RFNode[] = storeNodes.map((n) => {
      const pos = positions.get(n.id) || { x: 0, y: 0 }
      const isRoot = !n.parent_id
      return {
        id: n.id,
        type: 'treeNode',
        position: { x: pos.x - (isRoot ? 90 : 80), y: pos.y },
        data: { node: n, isRoot, isAdmin, treeColor: tree.color || '#8b5cf6' },
        draggable: isAdmin,
      }
    })

    // Tree hierarchy edges
    const hierarchyEdges: Edge[] = storeNodes
      .filter((n) => n.parent_id)
      .map((n) => ({
        id: `e-${n.parent_id}-${n.id}`,
        source: n.parent_id!,
        target: n.id,
        type: 'smoothstep',
        style: { stroke: `${getProgressColor(n.progress)}60`, strokeWidth: 1.5 },
        animated: n.progress > 0 && n.progress < 100,
      }))

    // Cross-tree link edges
    const crossEdges: Edge[] = links
      .filter((l) =>
        storeNodes.find((n) => n.id === l.source_node_id) &&
        storeNodes.find((n) => n.id === l.target_node_id)
      )
      .map((l) => ({
        id: `link-${l.id}`,
        source: l.source_node_id,
        target: l.target_node_id,
        className: 'cross-link',
        label: l.label,
        labelStyle: { fill: '#ec4899', fontSize: 11 },
        style: { stroke: '#ec4899', strokeDasharray: '6 4', strokeWidth: 1.5 },
        type: 'straight',
      }))

    setRfNodes(newNodes)
    setRfEdges([...hierarchyEdges, ...crossEdges])
  }, [storeNodes, links, isAdmin, tree.color])

  const onNodeClick = useCallback((_: React.MouseEvent, node: RFNode) => {
    setSelectedNodeId(node.id)
    setNotePanelOpen(true)
  }, [setSelectedNodeId, setNotePanelOpen])

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        style={{ background: 'var(--bg-primary)' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls style={{ bottom: 20, left: 20 }} />
        <MiniMap
          style={{ bottom: 20, right: 20, width: 160, height: 100 }}
          nodeColor={(n) => {
            const node = storeNodes.find((s) => s.id === n.id)
            return node ? getProgressColor(node.progress) : '#555'
          }}
          maskColor="rgba(0,0,0,0.7)"
        />

        {storeNodes.length === 0 && (
          <Panel position="top-center">
            <div style={{
              marginTop: '30vh', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '0.9rem',
            }}>
              {isAdmin
                ? 'Click chuột phải vào canvas để thêm node đầu tiên'
                : 'Tree này chưa có nội dung'}
            </div>
          </Panel>
        )}
      </ReactFlow>

      {isAdmin && <AdminToolbar treeId={tree.id} />}
    </div>
  )
}

function AdminToolbar({ treeId }: { treeId: string }) {
  const { nodes, setNodes } = useAppStore()
  const [open, setOpen] = useState(false)

  const handleAddRoot = async () => {
    const title = prompt('Tên root node:')
    if (!title) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('nodes')
      .insert({ tree_id: treeId, title, progress: 0 })
      .select()
      .single()
    if (data) setNodes([...nodes, data])
  }

  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 10,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <button
        onClick={handleAddRoot}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          border: 'none', color: 'white', fontSize: '0.82rem', fontWeight: 600,
        }}
      >
        + Root Node
      </button>
    </div>
  )
}

// Need useState for AdminToolbar
import { useState } from 'react'
