import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AthleteList from '@/components/AthleteList'

const { mockChannel, mockSupabase } = vi.hoisted(() => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }

  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
  }

  return { mockChannel, mockSupabase }
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('AthleteList', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Atletas" heading', async () => {
    render(<AthleteList selectedId={null} onSelect={mockOnSelect} />)
    await waitFor(() => {
      expect(screen.getByText('Atletas')).toBeInTheDocument()
    })
  })

  it('renders "Nuevo" button', async () => {
    render(<AthleteList selectedId={null} onSelect={mockOnSelect} />)
    await waitFor(() => {
      expect(screen.getByText('Nuevo')).toBeInTheDocument()
    })
  })

  it('renders category filter select', async () => {
    render(<AthleteList selectedId={null} onSelect={mockOnSelect} />)
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('renders weight filter select', async () => {
    render(<AthleteList selectedId={null} onSelect={mockOnSelect} />)
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects[1]).toBeInTheDocument()
    })
  })

  it('shows empty state message when no athletes', async () => {
    render(<AthleteList selectedId={null} onSelect={mockOnSelect} />)
    expect(await screen.findByText('No hay atletas registrados.')).toBeInTheDocument()
  })
})
