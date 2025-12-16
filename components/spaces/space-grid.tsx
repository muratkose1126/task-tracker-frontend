"use client"

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Space } from '@/lib/spaces'

export default function SpaceGrid({ spaces }: { spaces: Space[] }) {
  const params = useParams() as { workspaceId: string }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {spaces.map((space) => (
        <Link
          key={space.id}
          href={`/workspaces/${params.workspaceId}/spaces/${space.id}`}
          className="border rounded p-4 hover:bg-muted"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{space.name}</span>
            {space.visibility === 'private' ? <span title="Private">🔒</span> : <span title="Public">🌐</span>}
          </div>
        </Link>
      ))}
    </div>
  )
}
