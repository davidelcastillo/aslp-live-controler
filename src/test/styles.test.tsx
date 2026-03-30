import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Tailwind CSS Configuration', () => {
  it('postcss.config.mjs exists and has tailwindcss plugin', () => {
    const config = readFileSync(
      resolve(__dirname, '../../postcss.config.mjs'),
      'utf-8'
    )
    expect(config).toContain('@tailwindcss/postcss')
  })

  it('globals.css imports tailwindcss', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('@import "tailwindcss"')
  })

  it('globals.css includes DaisyUI plugin', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('@plugin "daisyui"')
  })

  it('globals.css has night theme configured', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('themes: night --default')
  })

  it('body does NOT have grid centering (place-items: center)', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    // The body styles should NOT have place-items: center
    const bodyMatch = css.match(/body\s*\{[^}]*\}/)
    expect(bodyMatch).toBeTruthy()
    expect(bodyMatch![0]).not.toContain('place-items: center')
  })

  it('button:not([class]) selector used instead of plain button', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('button:not([class])')
  })
})

describe('DaisyUI Theme Variables', () => {
  it('defines --color-primary as #c41e3a', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('--color-primary: #c41e3a')
  })

  it('defines dark background --background', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('--background: #0a0a0a')
  })

  it('defines --color-base-100 as dark', () => {
    const css = readFileSync(
      resolve(__dirname, '../app/globals.css'),
      'utf-8'
    )
    expect(css).toContain('--color-base-100: #0a0a0a')
  })
})
