import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AttemptsEditor from '@/components/AttemptsEditor'

const { mockChannel, mockSupabase } = vi.hoisted(() => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }

  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
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

describe('AttemptsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows placeholder message when no athlete selected', () => {
    render(<AttemptsEditor athleteId={null} />)
    expect(screen.getByText('Seleccioná un atleta para editar sus intentos')).toBeInTheDocument()
  })

  it('shows loading state when athlete is selected', () => {
    render(<AttemptsEditor athleteId="some-uuid" />)
    expect(screen.getByText('Cargando intentos...')).toBeInTheDocument()
  })
})
