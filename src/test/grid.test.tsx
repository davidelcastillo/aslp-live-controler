import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

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

// Mock child components
vi.mock('@/components/AthleteList', () => ({
  default: () => <div data-testid="athlete-list">AthleteList</div>,
}))

vi.mock('@/components/AttemptsEditor', () => ({
  default: () => <div data-testid="attempts-editor">AttemptsEditor</div>,
}))

vi.mock('@/components/LiveController', () => ({
  default: () => <div data-testid="live-controller">LiveController</div>,
}))

import Home from '@/app/page'

describe('Grid Layout Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('page wrapper has w-full class for full width', () => {
    const { container } = render(<Home />)
    const mainDiv = container.querySelector('.min-h-screen')
    expect(mainDiv).toBeTruthy()
    expect(mainDiv).toHaveClass('w-full')
  })

  it('header is not constrained by max-width', () => {
    const { container } = render(<Home />)
    const header = container.querySelector('header')
    expect(header).toBeTruthy()

    // The inner div of header should NOT have max-w-[1400px]
    const headerInner = header!.querySelector('div')
    expect(headerInner).toBeTruthy()
    expect(headerInner!.className).not.toContain('max-w-')
    expect(headerInner!.className).not.toContain('mx-auto')
  })

  it('main content grid uses 3 columns', () => {
    const { container } = render(<Home />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeTruthy()
    expect(grid!.className).toContain('grid-cols-')
  })

  it('AttemptsEditor column is wider than LiveController', () => {
    const { container } = render(<Home />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeTruthy()
    // The grid should have 520px for the right column (AttemptsEditor)
    expect(grid!.className).toContain('520px')
  })

  it('grid has no max-width constraint (full width)', () => {
    const { container } = render(<Home />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeTruthy()
    expect(grid!.className).not.toContain('max-w-')
    expect(grid!.className).not.toContain('mx-auto')
  })

  it('all three material-surface cards are rendered', () => {
    const { container } = render(<Home />)
    const surfaces = container.querySelectorAll('.material-surface')
    expect(surfaces.length).toBe(3)
  })
})

describe('Component Order', () => {
  it('LiveController is in the center (main) column', () => {
    const { container } = render(<Home />)
    const surfaces = container.querySelectorAll('.material-surface')

    // Order: AthleteList, LiveController, AttemptsEditor
    expect(surfaces[0].querySelector('[data-testid="athlete-list"]')).toBeTruthy()
    expect(surfaces[1].querySelector('[data-testid="live-controller"]')).toBeTruthy()
    expect(surfaces[2].querySelector('[data-testid="attempts-editor"]')).toBeTruthy()
  })
})
