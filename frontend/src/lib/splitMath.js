// Mirrors the Distributor contract's split math in JS so the frontend can
// render an instant preview without waiting on a simulated contract call.
// Pure function, no SDK dependency — trivial to unit test.

export function calculateSplit(amount, collaborators, sharesBps, ownerAddress) {
  if (!amount || amount <= 0 || !collaborators || collaborators.length === 0) {
    return []
  }
  if (collaborators.length !== sharesBps.length) {
    return []
  }

  const result = []
  let totalPaid = 0
  for (let i = 0; i < collaborators.length; i++) {
    const share = Math.floor((amount * sharesBps[i]) / 10_000)
    result.push({ address: collaborators[i], amount: share, bps: sharesBps[i] })
    totalPaid += share
  }

  const remainder = amount - totalPaid
  if (remainder > 0 && ownerAddress) {
    result.push({ address: ownerAddress, amount: remainder, bps: 0, isRemainder: true })
  }

  return result
}

export function bpsToPercent(bps) {
  return (bps / 100).toFixed(2)
}
