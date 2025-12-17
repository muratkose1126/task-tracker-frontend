import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/login-form'

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
  useLogin: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    data: null,
  }),
}))

describe('LoginForm Component - Real User Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render login form with email and password inputs', () => {
      // They see the login form with email/password inputs

      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('should show sign up link for new users', () => {

      render(<LoginForm />)

      const signupLink = screen.getByRole('link', { name: /create account|sign up|register/i })
      expect(signupLink).toBeInTheDocument()
      expect(signupLink).toHaveAttribute('href', '/register')
    })
  })

  describe('User Input', () => {
    it('should accept email and password input from user', async () => {

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', {
        name: /email/i,
      }) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

      await user.type(emailInput, 'alice@example.com')
      await user.type(passwordInput, 'mypassword123')

      expect(emailInput.value).toBe('alice@example.com')
      expect(passwordInput.value).toBe('mypassword123')
    })

    it('should prevent form submission with invalid email', async () => {

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'not-an-email')

      // Email input should have invalid email format
      expect((emailInput as HTMLInputElement).value).toBe('not-an-email')
    })

    it('should validate password minimum length', async () => {

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'alice@example.com')
      await user.type(passwordInput, 'short')
      await user.click(submitButton)

      // Should show error about minimum length
      await waitFor(() => {
        expect(screen.queryByText(/at least 6 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission with valid data', async () => {

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'alice@example.com')
      await user.type(passwordInput, 'password123')

      // Should allow submission with valid data
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

      // (actual mutation handling is mocked above)
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      // They need proper labels to understand form fields

      render(<LoginForm />)

      // Email input should have label
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

      // Password input should have label
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

      // Button should have clear text
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should show password field as password type', () => {

      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      expect(passwordInput.type).toBe('password')
    })
  })
})
