import { useState } from 'react'
import SplitBar from './SplitBar'
import { EXPLORER_TX_URL } from '../lib/config'
import { calculateSplit } from '../lib/splitMath'

export default function WorkCard({ work, totalDistributed, onPay, lastTxHash }) {
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const preview = amount
    ? calculateSplit(Number(amount), work.collaborators, work.sharesBps, work.owner)
    : []

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0 || !tokenInput.trim()) return
    setBusy(true)
    try {
      await onPay(work.id, tokenInput.trim(), Number(amount))
      setAmount('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="bg-graphite-soft border border-graphite-line rounded-lg shadow-console p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/50">
            Work #{String(work.id).padStart(3, '0')}
          </p>
          <h3 className="font-display font-semibold text-lg text-mist mt-0.5">{work.title}</h3>
        </div>
        <span
          className={`px-2 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-widest2 ${
            work.locked ? 'border-signal-hold/50 text-signal-hold' : 'border-teal/40 text-teal'
          }`}
        >
          {work.locked ? 'locked' : 'editable'}
        </span>
      </div>

      <div className="mb-4">
        <SplitBar collaborators={work.collaborators} sharesBps={work.sharesBps} />
      </div>

      {totalDistributed !== undefined && (
        <p className="font-mono text-xs text-mist-dim/60 mb-4">
          Lifetime distributed: <span className="text-teal">{totalDistributed}</span>
        </p>
      )}

      <div className="pt-3 border-t border-graphite-line/70 space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/60 block">
          Pay for this work
        </label>
        <input
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Payment token contract (C...)"
          className="w-full bg-graphite border border-graphite-line rounded p-2 text-xs font-mono text-mist placeholder:text-mist-dim/30 focus:border-teal/60 outline-none"
        />
        <div className="flex gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            placeholder="Amount"
            className="flex-1 bg-graphite border border-graphite-line rounded p-2 text-sm font-mono text-mist placeholder:text-mist-dim/30 focus:border-teal/60 outline-none"
          />
          <button
            onClick={handlePay}
            disabled={busy || !amount || !tokenInput.trim()}
            className="font-mono text-xs px-4 py-2 rounded bg-teal text-graphite font-medium hover:bg-teal-bright disabled:opacity-40 transition-colors"
          >
            {busy ? 'Paying…' : 'Pay'}
          </button>
        </div>

        {preview.length > 0 && (
          <div className="bg-graphite/60 border border-graphite-line rounded p-2.5 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/50 mb-1">
              Preview
            </p>
            {preview.map((p, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-mist-dim">
                  {p.address.slice(0, 4)}…{p.address.slice(-4)}
                  {p.isRemainder && ' (remainder)'}
                </span>
                <span className="text-teal">{p.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {lastTxHash && (
        <a
          href={EXPLORER_TX_URL(lastTxHash)}
          target="_blank"
          rel="noreferrer"
          className="block mt-3 font-mono text-[10px] text-mist-dim/40 hover:text-teal truncate transition-colors"
        >
          last tx: {lastTxHash}
        </a>
      )}
    </article>
  )
}
