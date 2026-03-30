import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock useAuth
const mockSignIn = vi.fn().mockResolvedValue({ error: null })
const mockSignUp = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
  }),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "ASLP POWERLIFTING" title', () => {
    render(<LoginPage />)
    expect(screen.getByText('ASLP POWERLIFTING')).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('operador@ejemplo.com')).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders "Iniciar sesión" button', () => {
    render(<LoginPage />)
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })

  it('renders toggle button for sign up mode', () => {
    render(<LoginPage />)
    expect(screen.getByText('¿No tenés cuenta? Crear una')).toBeInTheDocument()
  })
})
