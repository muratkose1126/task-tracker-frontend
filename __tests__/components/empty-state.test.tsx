import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/empty-state'
import { Inbox, Plus } from 'lucide-react'

describe('EmptyState Component - Display When No Data', () => {
  describe('Basic Display', () => {
    it('should show when task list is empty', () => {
      render(
        <EmptyState
          title="No tasks"
          description="Create a new task to get started"
          icon={Inbox}
        />
      )

      expect(screen.getByText('No tasks')).toBeInTheDocument()
      expect(screen.getByText('Create a new task to get started')).toBeInTheDocument()
    })
  })

  describe('With Action Button', () => {
    it('should show create button to start adding items', () => {
      const handleCreate = jest.fn()
      render(
        <EmptyState
          title="No items"
          description="Add your first item"
          icon={Plus}
          action={{
            label: 'Create',
            onClick: handleCreate,
          }}
        />
      )

      const button = screen.getByRole('button', { name: /Create/i })
      expect(button).toBeInTheDocument()

      // When clicked, should call callback
      fireEvent.click(button)
      expect(handleCreate).toHaveBeenCalled()
    })
  })
})
