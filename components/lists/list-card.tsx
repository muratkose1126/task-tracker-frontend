"use client"

import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { TaskList } from '@/lib/lists'

export default function ListCard({ list }: { list: TaskList }) {
  const params = useParams() as { workspaceId: string; spaceId: string }

  return (
    <Link
      href={`/workspaces/${params.workspaceId}/spaces/${params.spaceId}/lists/${list.id}`}
      className="border rounded p-3 hover:bg-muted"
    >
      <div className="flex items-center justify-between">
        <span>{list.name}</span>
        {list.is_archived ? <span title="Archived">📦</span> : null}
      </div>
    </Link>
  )
}
