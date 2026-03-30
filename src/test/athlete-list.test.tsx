import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

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
      if (table === 'athletes') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'a1',
                  nombre: 'Carlos',
                  apellido: 'García',
                  genero: 'M',
                  categoria: 'Open',
                  cat_peso: 93,
                },
                {
                  id: 'a2',
                  nombre: 'María',
                  apellido: 'López',
                  genero: 'F',
                  categoria: 'Open',
                  cat_peso: 63,
                },
              ],
              error: null,
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
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

import AthleteList from '@/components/AthleteList'

describe('AthleteList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the "Atletas" heading', async () => {
    render(<AthleteList selectedId={null} onSelect={vi.fn()} />)
    expect(await screen.findByText('Atletas')).toBeInTheDocument()
  })

  it('renders the "Nuevo" button', async () => {
    render(<AthleteList selectedId={null} onSelect={vi.fn()} />)
    expect(await screen.findByText('Nuevo')).toBeInTheDocument()
  })

  it('renders filter selects', async () => {
    render(<AthleteList selectedId={null} onSelect={vi.fn()} />)
    expect(await screen.findByText('Todas las cat.')).toBeInTheDocument()
    expect(screen.getByText('Todos los pesos')).toBeInTheDocument()
  })

  it('renders athletes after loading', async () => {
    render(<AthleteList selectedId={null} onSelect={vi.fn()} />)

    const athlete1 = await screen.findByText(/GARCÍA, Carlos/)
    expect(athlete1).toBeInTheDocument()

    const athlete2 = await screen.findByText(/LÓPEZ, María/)
    expect(athlete2).toBeInTheDocument()
  })

  it('shows gender badges on athletes', async () => {
    render(<AthleteList selectedId={null} onSelect={vi.fn()} />)

    await screen.findByText(/GARCÍA, Carlos/)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
  })

  it('calls onSelect when an athlete is clicked', async () => {
    const onSelect = vi.fn()
    render(<AthleteList selectedId={null} onSelect={onSelect} />)

    const athlete = await screen.findByText(/GARCÍA, Carlos/)
    athlete.closest('div')?.click()

    expect(onSelect).toHaveBeenCalledWith('a1')
  })

  it('highlights selected athlete', async () => {
    render(<AthleteList selectedId="a1" onSelect={vi.fn()} />)

    await screen.findByText(/GARCÍA, Carlos/)

    // Find the card container that has the athlete name and check its classes
    // The card is a div that contains the athlete name and has cursor-pointer
    const athleteName = screen.getByText(/GARCÍA, Carlos/)
    // Walk up to find the card div with the rounded-xl class
    let card = athleteName.parentElement
    while (card && !card.className.includes('rounded-xl')) {
      card = card.parentElement
    }
    expect(card).toBeTruthy()
    expect(card!.className).toContain('bg-red-900/30')
    expect(card!.className).toContain('border-[#c41e3a]/40')
  })
})
