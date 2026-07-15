export default function Header({ wallet }) {
  const short = (addr) => (addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '')

  return (
    <header className="border-b border-graphite-line bg-graphite/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-teal/15 border border-teal/40 flex items-center justify-center">
            <span className="font-display font-bold text-teal text-sm leading-none">F</span>
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg sm:text-xl tracking-tight text-mist leading-none">
              Fanout
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-mist-dim/60 leading-none mt-1">
              Royalty Splits · Soroban
            </p>
          </div>
        </div>

        <div>
          {wallet.address ? (
            <button
              onClick={wallet.disconnect}
              className="font-mono text-xs sm:text-sm px-3 py-2 rounded border border-teal/40 text-teal hover:bg-teal/10 transition-colors"
              title="Click to disconnect"
            >
              {wallet.balance && (
                <span className="mr-3 opacity-80">{Number(wallet.balance).toFixed(2)} XLM</span>
              )}
              {short(wallet.address)}
            </button>
          ) : (
            <button
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="font-mono text-xs sm:text-sm px-3 sm:px-4 py-2 rounded bg-teal text-graphite font-medium hover:bg-teal-bright transition-colors disabled:opacity-50"
            >
              {wallet.connecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
      {!wallet.installed && (
        <div className="bg-signal-stop/10 border-t border-signal-stop/30 text-signal-stop text-xs sm:text-sm text-center py-2 px-4">
          Freighter wallet extension not detected —{' '}
          <a href="https://freighter.app" target="_blank" rel="noreferrer" className="underline">
            install it
          </a>{' '}
          to interact with contracts.
        </div>
      )}
    </header>
  )
}
