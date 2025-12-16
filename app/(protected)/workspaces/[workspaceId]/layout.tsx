import React from 'react'

export default async function WorkspaceLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  // ...existing code...
  return (
    <div>
      {/* TODO: Workspace context provider */}
      {children}
    </div>
  )
}
