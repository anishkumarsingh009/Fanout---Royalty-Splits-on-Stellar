import { describe, it, expect } from 'vitest'
import { formatEvent, formatEvents } from '../lib/formatEvent'

describe('formatEvent', () => {
  it('labels a work created event correctly', () => {
    const event = { id: '1', topics: ['work', 'created', 0], ledger: 100 }
    const result = formatEvent(event)
    expect(result.label).toBe('Work Registered')
    expect(result.tone).toBe('neutral')
  })

  it('labels a work locked event with hold tone', () => {
    const event = { id: '2', topics: ['work', 'locked', 0], ledger: 101 }
    const result = formatEvent(event)
    expect(result.label).toBe('Splits Locked')
    expect(result.tone).toBe('hold')
  })

  it('labels a payment split event with go tone', () => {
    const event = { id: '3', topics: ['payment', 'split', 0], ledger: 102 }
    const result = formatEvent(event)
    expect(result.label).toBe('Payment Distributed')
    expect(result.tone).toBe('go')
  })

  it('falls back gracefully for unrecognized topics', () => {
    const event = { id: '4', topics: ['mystery', 'thing'], ledger: 103 }
    const result = formatEvent(event)
    expect(result.label).toBe('mystery / thing')
    expect(result.tone).toBe('neutral')
  })

  it('handles malformed or missing event input without throwing', () => {
    expect(formatEvent(null).label).toBe('Unknown Event')
    expect(formatEvent({}).label).toBe('Unknown Event')
    expect(formatEvent({ topics: null }).label).toBe('Unknown Event')
  })

  it('preserves ledger, txHash, and timestamp metadata', () => {
    const event = { id: '5', topics: ['work', 'updated', 2], ledger: 200, txHash: 'deadbeef', timestamp: '2026-07-08T12:00:00Z' }
    const result = formatEvent(event)
    expect(result.ledger).toBe(200)
    expect(result.txHash).toBe('deadbeef')
    expect(result.timestamp).toBe('2026-07-08T12:00:00Z')
  })
})

describe('formatEvents', () => {
  it('maps an array of raw events to formatted entries in order', () => {
    const events = [
      { id: '1', topics: ['work', 'created'], ledger: 1 },
      { id: '2', topics: ['payment', 'split'], ledger: 2 },
    ]
    const results = formatEvents(events)
    expect(results).toHaveLength(2)
    expect(results[0].label).toBe('Work Registered')
    expect(results[1].label).toBe('Payment Distributed')
  })

  it('returns an empty array when given no events', () => {
    expect(formatEvents([])).toEqual([])
  })
})
