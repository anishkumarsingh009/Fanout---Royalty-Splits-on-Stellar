import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SplitBar from '../components/SplitBar'

describe('SplitBar', () => {
  it('renders a legend entry for each collaborator', () => {
    render(<SplitBar collaborators={['GAAAA1111', 'GBBBB2222']} sharesBps={[6000, 4000]} />)
    expect(screen.getByText(/60\.00%/)).toBeInTheDocument()
    expect(screen.getByText(/40\.00%/)).toBeInTheDocument()
  })

  it('omits the legend when compact is true', () => {
    render(<SplitBar collaborators={['GAAAA1111']} sharesBps={[10000]} compact />)
    expect(screen.queryByText(/100\.00%/)).not.toBeInTheDocument()
  })

  it('renders one bar segment per collaborator', () => {
    const { container } = render(
      <SplitBar collaborators={['GA', 'GB', 'GC']} sharesBps={[3334, 3333, 3333]} />
    )
    const segments = container.querySelectorAll('.level-fill')
    expect(segments).toHaveLength(3)
  })
})
