"use client"

import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Group } from '@/lib/groups'

export default function GroupCard({ group }: { group: Group }) {
  const params = useParams() as { workspaceId: string; spaceId: string }

  return (
    <Link
      href={`/workspaces/${params.workspaceId}/spaces/${params.spaceId}/groups/${group.id}`}
      className="border rounded p-3 hover:bg-muted"
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded"
          style={{ backgroundColor: group.color || '#ccc' }}
        />
        <span>{group.name}</span>
      </div>
    </Link>
  )
}
