import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
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

// Mock child components with data-testid for integration testing
vi.mock('@/components/AthleteList', () => ({
  default: ({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) => (
    <div data-testid="athlete-list">
      <h2>Atletas</h2>
      <button onClick={() => onSelect('a1')}>Select Athlete</button>
      <span>Selected: {selectedId ?? 'none'}</span>
    </div>
  ),
}))

vi.mock('@/components/AttemptsEditor', () => ({
  default: ({ athleteId }: { athleteId: string | null }) => (
    <div data-testid="attempts-editor">
      <span>AttemptsEditor - {athleteId ?? 'no athlete'}</span>
    </div>
  ),
}))

vi.mock('@/components/LiveController', () => ({
  default: () => (
    <div data-testid="live-controller">
      <h2>Estado en Vivo</h2>
    </div>
  ),
}))

// Mock supabase
const { mockSupabase } = vi.hoisted(() => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }

  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'live_state') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 1,
                  athlete_id: null,
                  current_movement: null,
                  current_attempt: null,
                  current_weight: 0,
                  is_live: false,
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'athletes') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { id: 'a1', nombre: 'Test', apellido: 'Athlete', genero: 'M', categoria: 'Open', cat_peso: 83 },
              ],
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'a1', nombre: 'Test', apellido: 'Athlete', genero: 'M', categoria: 'Open', cat_peso: 83 },
                error: null,
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }
    }),
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
  }

  return { mockSupabase }
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

import Home from '@/app/page'

describe('Integration: Full Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders complete page without errors', async () => {
    render(<Home />)

    // Header
    expect(screen.getByText('ASLP POWERLIFTING')).toBeInTheDocument()
    expect(screen.getByText('Realtime')).toBeInTheDocument()
    expect(screen.getByText('Salir')).toBeInTheDocument()

    // All three panels should render
    expect(screen.getByText('Atletas')).toBeInTheDocument()
    expect(screen.getByText('Estado en Vivo')).toBeInTheDocument()
  })

  it('does NOT have body centering issues (w-full applied)', () => {
    const { container } = render(<Home />)
    const mainDiv = container.querySelector('.min-h-screen')
    expect(mainDiv).toHaveClass('w-full')
  })

  it('header spans full width without max-w constraint', () => {
    const { container } = render(<Home />)
    const header = container.querySelector('header')
    const headerInner = header!.querySelector('div')!
    expect(headerInner.className).not.toContain('max-w-')
    expect(headerInner.className).not.toContain('mx-auto')
  })

  it('grid spans full width without max-w constraint', () => {
    const { container } = render(<Home />)
    const grid = container.querySelector('.grid')!
    expect(grid.className).not.toContain('max-w-')
    expect(grid.className).not.toContain('mx-auto')
  })

  it('LiveController is in the center column (main focus)', () => {
    const { container } = render(<Home />)
    const surfaces = container.querySelectorAll('.material-surface')
    // Second card should be LiveController
    expect(surfaces[1].querySelector('[data-testid="live-controller"]')).toBeTruthy()
  })
})
