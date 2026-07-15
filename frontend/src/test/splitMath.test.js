import { describe, it, expect } from 'vitest'
import { calculateSplit, bpsToPercent } from '../lib/splitMath'

describe('calculateSplit', () => {
  it('splits an even two-way share correctly', () => {
    const result = calculateSplit(1000, ['GA', 'GB'], [6000, 4000], 'GOWNER')
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ address: 'GA', amount: 600 })
    expect(result[1]).toMatchObject({ address: 'GB', amount: 400 })
  })

  it('assigns the rounding remainder to the owner', () => {
    const result = calculateSplit(100, ['GA', 'GB', 'GC'], [3334, 3333, 3333], 'GOWNER')
    const remainderEntry = result.find((r) => r.isRemainder)
    expect(remainderEntry).toBeDefined()
    expect(remainderEntry.address).toBe('GOWNER')
    expect(remainderEntry.amount).toBe(1)
  })

  it('omits the remainder entry when the split divides evenly', () => {
    const result = calculateSplit(1000, ['GA', 'GB'], [5000, 5000], 'GOWNER')
    expect(result.find((r) => r.isRemainder)).toBeUndefined()
    expect(result).toHaveLength(2)
  })

  it('returns an empty array for zero or negative amounts', () => {
    expect(calculateSplit(0, ['GA'], [10000], 'GOWNER')).toEqual([])
    expect(calculateSplit(-50, ['GA'], [10000], 'GOWNER')).toEqual([])
  })

  it('returns an empty array when collaborators are missing', () => {
    expect(calculateSplit(100, [], [], 'GOWNER')).toEqual([])
    expect(calculateSplit(100, null, null, 'GOWNER')).toEqual([])
  })

  it('returns an empty array when array lengths mismatch', () => {
    expect(calculateSplit(100, ['GA', 'GB'], [10000], 'GOWNER')).toEqual([])
  })

  it('handles a single collaborator receiving 100%', () => {
    const result = calculateSplit(500, ['GA'], [10000], 'GOWNER')
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(500)
  })
})

describe('bpsToPercent', () => {
  it('converts basis points to a percentage string', () => {
    expect(bpsToPercent(10000)).toBe('100.00')
    expect(bpsToPercent(5000)).toBe('50.00')
    expect(bpsToPercent(3333)).toBe('33.33')
  })
})
