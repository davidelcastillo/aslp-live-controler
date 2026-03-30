import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

// Mock AuthProvider
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 'test@test.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

// Mock child components
vi.mock('@/components/AthleteList', () => ({
  default: () => <div data-testid="athlete-list">AthleteList</div>,
}))

vi.mock('@/components/AttemptsEditor', () => ({
  default: ({ athleteId }: { athleteId: string | null }) => (
    <div data-testid="attempts-editor">AttemptsEditor - {athleteId ?? 'none'}</div>
  ),
}))

vi.mock('@/components/LiveController', () => ({
  default: () => <div data-testid="live-controller">LiveController</div>,
}))

import Home from '@/app/page'

describe('Page Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main page with all three columns', async () => {
    render(<Home />)

    expect(screen.getByTestId('athlete-list')).toBeInTheDocument()
    expect(screen.getByTestId('live-controller')).toBeInTheDocument()
    expect(screen.getByTestId('attempts-editor')).toBeInTheDocument()
  })

  it('renders the ASLP POWERLIFTING header text', async () => {
    render(<Home />)
    expect(screen.getByText('ASLP POWERLIFTING')).toBeInTheDocument()
  })

  it('renders the Realtime indicator', async () => {
    render(<Home />)
    expect(screen.getByText('Realtime')).toBeInTheDocument()
  })

  it('renders the Salir button with btn-error class', async () => {
    render(<Home />)
    const button = screen.getByText('Salir')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn', 'btn-error')
  })

  it('renders the user email', async () => {
    render(<Home />)
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
  })

  it('renders Control Panel v4.0 subtitle', async () => {
    render(<Home />)
    expect(screen.getByText('Control Panel v4.0')).toBeInTheDocument()
  })
})
