import { cn } from '@/lib/utils'

describe('cn() - Tailwind CSS Class Merge', () => {
  describe('Merge Multiple Classes', () => {
    it('should combine padding classes', () => {
      // Used in components: <div className={cn("px-4", "py-2")}>
      const result = cn('px-4', 'py-2')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })
  })

  describe('Conditional Classes', () => {
    it('should add class only when condition is true', () => {
      // Real example: <Button className={cn("btn", isActive && "btn-active")}>
      const isActive = true
      const result = cn('btn', isActive && 'btn-active')
      
      expect(result).toContain('btn')
      expect(result).toContain('btn-active')
    })

    it('should skip class when condition is false', () => {
      // Real example: <Button className={cn("btn", isDisabled && "btn-disabled")}>
      const isDisabled = false
      const result = cn('btn', isDisabled && 'btn-disabled')
      
      expect(result).toContain('btn')
      expect(result).not.toContain('btn-disabled')
    })
  })

  describe('Override Conflicting Classes', () => {
    it('should use the last padding class when they conflict', () => {
      // If we have px-2 then px-4, use px-4
      // This is important to prevent CSS conflicts
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toContain('px-4')
    })
  })

  describe('Handle Object Syntax', () => {
    it('should conditionally apply classes using object', () => {
      // Real example: cn("btn", { "btn-active": isSelected, "btn-disabled": isDisabled })
      const isSelected = true
      const isDisabled = false
      
      const result = cn('btn', {
        'btn-active': isSelected,
        'btn-disabled': isDisabled,
      })
      
      expect(result).toContain('btn')
      expect(result).toContain('btn-active')
      expect(result).not.toContain('btn-disabled')
    })
  })

  describe('Handle Edge Cases', () => {
    it('should return empty string if no classes provided', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should ignore null and undefined values', () => {
      const result = cn('px-4', null, undefined, 'py-2')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })

    it('should work with arrays', () => {
      const result = cn(['px-4', 'py-2'], 'rounded')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('rounded')
    })
  })
})
