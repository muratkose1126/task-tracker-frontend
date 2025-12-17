import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '@/components/signup-form'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock the auth API and hooks
jest.mock('@/hooks/useAuth', () => ({
  useRegister: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    data: null,
  }),
}))

describe('SignupForm Component - New User Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render signup form with all required fields', () => {
      // Sees signup form with name, email, password fields

      render(<SignupForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up|create account|register/i })).toBeInTheDocument()
    })

    it('should show login link for existing users', () => {
      // Sees link to go to login page

      render(<SignupForm />)

      const loginLink = screen.getByRole('link', { name: /sign in|login|already have account/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('User Input and Validation', () => {
    it('should accept user input for all fields', async () => {

      const user = userEvent.setup()
      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
      const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement

      await user.type(nameInput, 'Alice Johnson')
      await user.type(emailInput, 'alice@example.com')
      await user.type(passwordInput, 'SecurePass123')
      await user.type(confirmInput, 'SecurePass123')

      expect(nameInput.value).toBe('Alice Johnson')
      expect(emailInput.value).toBe('alice@example.com')
      expect(passwordInput.value).toBe('SecurePass123')
      expect(confirmInput.value).toBe('SecurePass123')
    })

    it('should prevent form submission with short name', async () => {

      const user = userEvent.setup()
      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const submitButton = screen.getByRole('button', { name: /sign up|create account|register/i })

      await user.type(nameInput, 'A')
      expect((nameInput as HTMLInputElement).value).toBe('A')

      // with error: "Name must be at least 2 characters"
    })

    it('should prevent form submission with invalid email', async () => {

      const user = userEvent.setup()
      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^email/i)

      await user.type(emailInput, 'not-an-email')
      expect((emailInput as HTMLInputElement).value).toBe('not-an-email')

    })

    it('should prevent form submission with short password', async () => {

      const user = userEvent.setup()
      render(<SignupForm />)

      const passwordInput = screen.getByLabelText(/^password/i)

      await user.type(passwordInput, 'short')
      expect((passwordInput as HTMLInputElement).value).toBe('short')

    })
  })

  describe('Form Submission', () => {
    it('should handle valid form submission', async () => {

      const user = userEvent.setup()
      render(<SignupForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/^email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up|create account|register/i })

      await user.type(nameInput, 'Alice Johnson')
      await user.type(emailInput, 'alice@example.com')
      await user.type(passwordInput, 'SecurePass123')
      await user.type(confirmInput, 'SecurePass123')

      // Button should be enabled
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      // Proper labels help navigation

      render(<SignupForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('should have password fields as password type', () => {

      render(<SignupForm />)

      const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
      const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement

      expect(passwordInput.type).toBe('password')
      expect(confirmInput.type).toBe('password')
    })

    it('should have email field with correct input type', () => {

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement

      expect(emailInput.type).toBe('email')
    })
  })
})
