import { useState } from 'react'

const emptyRow = () => ({ address: '', percent: '' })

export default function CreateWorkForm({ onCreate, disabled }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [rows, setRows] = useState([emptyRow(), emptyRow()])
  const [busy, setBusy] = useState(false)

  const totalPercent = rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0)
  const valid =
    title.trim() &&
    rows.every((r) => r.address.trim() && Number(r.percent) > 0) &&
    Math.round(totalPercent * 100) === 10_000

  const updateRow = (idx, field, value) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (idx) => setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setBusy(true)
    try {
      await onCreate({
        title: title.trim(),
        collaborators: rows.map((r) => r.address.trim()),
        sharesBps: rows.map((r) => Math.round(Number(r.percent) * 100)),
      })
      setTitle('')
      setRows([emptyRow(), emptyRow()])
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="w-full py-4 border-2 border-dashed border-graphite-line rounded-lg text-mist-dim/60 hover:border-teal/50 hover:text-teal transition-colors font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Register a new work
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-graphite-soft border border-teal/30 rounded-lg p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-mist">New Work</h3>
        <button type="button" onClick={() => setOpen(false)} className="font-mono text-xs text-mist-dim/50 hover:text-mist">
          cancel
        </button>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/60 block mb-1.5">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Midnight Sessions EP"
          className="w-full bg-graphite border border-graphite-line rounded p-2.5 text-sm text-mist placeholder:text-mist-dim/30 focus:border-teal/60 outline-none"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/60 block mb-2">
          Collaborators &amp; splits
        </label>
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={r.address}
                onChange={(e) => updateRow(idx, 'address', e.target.value)}
                placeholder="G... address"
                className="flex-1 min-w-0 bg-graphite border border-graphite-line rounded p-2 text-xs font-mono text-mist placeholder:text-mist-dim/30 focus:border-teal/60 outline-none"
              />
              <input
                value={r.percent}
                onChange={(e) => updateRow(idx, 'percent', e.target.value)}
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="%"
                className="w-20 bg-graphite border border-graphite-line rounded p-2 text-sm font-mono text-mist placeholder:text-mist-dim/30 focus:border-teal/60 outline-none"
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="text-mist-dim/40 hover:text-signal-stop px-1"
                  aria-label="Remove collaborator"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="mt-2 font-mono text-xs text-teal hover:text-teal-bright">
          + add collaborator
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-graphite-line">
        <p className={`font-mono text-xs ${Math.round(totalPercent * 100) === 10_000 ? 'text-teal' : 'text-signal-stop'}`}>
          Total: {totalPercent.toFixed(2)}% {Math.round(totalPercent * 100) === 10_000 ? '✓' : '(must equal 100%)'}
        </p>
        <button
          type="submit"
          disabled={!valid || busy || disabled}
          className="font-mono text-sm px-4 py-2 rounded bg-teal text-graphite font-medium hover:bg-teal-bright disabled:opacity-40 transition-colors"
        >
          {busy ? 'Registering…' : 'Register work'}
        </button>
      </div>
    </form>
  )
}
