import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import LiveController from '@/components/LiveController'

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
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }
      }
      if (table === 'attempts') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
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

  return { mockChannel, mockSupabase }
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('LiveController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Estado en Vivo" heading', async () => {
    render(<LiveController />)
    expect(await screen.findByText('Estado en Vivo')).toBeInTheDocument()
  })

  it('renders movement buttons (SQ, BP, DL)', async () => {
    render(<LiveController />)
    await screen.findByText('Estado en Vivo')
    expect(screen.getByText('SQ')).toBeInTheDocument()
    expect(screen.getByText('BP')).toBeInTheDocument()
    expect(screen.getByText('DL')).toBeInTheDocument()
  })

  it('renders attempt buttons (#1, #2, #3)', async () => {
    render(<LiveController />)
    await screen.findByText('Estado en Vivo')
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('renders "GO LIVE" button', async () => {
    render(<LiveController />)
    await screen.findByText('Estado en Vivo')
    expect(screen.getByText('GO LIVE')).toBeInTheDocument()
  })
})
