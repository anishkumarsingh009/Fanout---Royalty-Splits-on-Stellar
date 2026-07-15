const BAR_COLORS = ['bg-teal', 'bg-brass', 'bg-signal-hold', 'bg-signal-go', 'bg-mist-dim', 'bg-signal-stop']

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '—'
}

export default function SplitBar({ collaborators, sharesBps, compact = false }) {
  return (
    <div>
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-graphite-line">
        {sharesBps.map((bps, i) => (
          <div
            key={i}
            className={`h-full level-fill ${BAR_COLORS[i % BAR_COLORS.length]}`}
            style={{ width: `${bps / 100}%` }}
            title={`${(bps / 100).toFixed(2)}%`}
          />
        ))}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {collaborators.map((addr, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-sm ${BAR_COLORS[i % BAR_COLORS.length]}`} />
              <span className="font-mono text-[10px] text-mist-dim">
                {shortAddr(addr)} · {(sharesBps[i] / 100).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
