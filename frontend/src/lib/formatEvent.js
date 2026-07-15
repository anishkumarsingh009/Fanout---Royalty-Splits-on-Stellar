// Pure function mapping decoded contract event topics to human-readable
// feed entries. No SDK calls, no side effects — kept trivial to unit test.

const TOPIC_LABELS = {
  'work,created': { label: 'Work Registered', tone: 'neutral' },
  'work,updated': { label: 'Splits Updated', tone: 'neutral' },
  'work,locked': { label: 'Splits Locked', tone: 'hold' },
  'payment,split': { label: 'Payment Distributed', tone: 'go' },
}

export function formatEvent(event) {
  if (!event || !Array.isArray(event.topics)) {
    return { label: 'Unknown Event', tone: 'neutral', detail: '' }
  }

  const symbolTopics = event.topics.filter((t) => typeof t === 'string')
  const key = symbolTopics.slice(0, 2).join(',')
  const meta = TOPIC_LABELS[key] || { label: symbolTopics.join(' / ') || 'Event', tone: 'neutral' }

  return {
    id: event.id,
    label: meta.label,
    tone: meta.tone,
    ledger: event.ledger,
    txHash: event.txHash,
    timestamp: event.timestamp,
    raw: event,
  }
}

export function formatEvents(events) {
  return events.map(formatEvent)
}
