import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import CreateWorkForm from './components/CreateWorkForm'
import WorkCard from './components/WorkCard'
import ActivityFeed from './components/ActivityFeed'
import Banner from './components/Banner'
import { useWallet } from './hooks/useWallet'
import { useEventStream } from './hooks/useEventStream'
import { isConfigured } from './lib/config'
import {
  registerWork,
  distributePayment,
  getWork,
  getTotalDistributed,
  normalizeWork,
} from './lib/fanoutActions'

export default function App() {
  const wallet = useWallet()
  const { feed, isPolling } = useEventStream()

  const [works, setWorks] = useState({})
  const [knownWorkIds, setKnownWorkIds] = useState([])
  const [totals, setTotals] = useState({})
  const [txByWork, setTxByWork] = useState({})
  const [errorMsg, setErrorMsg] = useState(null)

  const configured = isConfigured()

  const refreshWork = useCallback(
    async (workId) => {
      try {
        const raw = await getWork({ workId, sourcePublicKey: wallet.address })
        setWorks((prev) => ({ ...prev, [workId]: normalizeWork(workId, raw) }))
        const total = await getTotalDistributed({ workId, sourcePublicKey: wallet.address })
        setTotals((prev) => ({ ...prev, [workId]: Number(total) }))
      } catch (err) {
        console.error(`Failed to load work ${workId}:`, err)
      }
    },
    [wallet.address]
  )

  useEffect(() => {
    if (!configured || feed.length === 0) return
    const workIds = new Set()
    feed.forEach((entry) => {
      const rawTopics = entry.raw?.topics || []
      const numericTopic = rawTopics.find((t) => typeof t === 'number' || typeof t === 'bigint')
      if (numericTopic !== undefined) workIds.add(Number(numericTopic))
    })
    workIds.forEach((id) => {
      refreshWork(id)
      setKnownWorkIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    })
  }, [feed, configured, refreshWork])

  const handleCreateWork = async ({ title, collaborators, sharesBps }) => {
    if (!wallet.address) {
      setErrorMsg('Connect your wallet before registering a work.')
      return
    }
    setErrorMsg(null)
    try {
      const { result: workId, hash } = await registerWork({
        owner: wallet.address,
        title,
        collaborators,
        sharesBps,
      })
      setTxByWork((prev) => ({ ...prev, [workId]: hash }))
      setKnownWorkIds((prev) => [...prev, Number(workId)])
      await refreshWork(Number(workId))
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register work.')
    }
  }

  const handlePay = async (workId, token, amount) => {
    if (!wallet.address) {
      setErrorMsg('Connect your wallet to pay for a work.')
      return
    }
    try {
      const { hash } = await distributePayment({ payer: wallet.address, workId, token, amount })
      setTxByWork((prev) => ({ ...prev, [workId]: hash }))
      await refreshWork(workId)
    } catch (err) {
      setErrorMsg(err.message || 'Payment failed.')
    }
  }

  const workList = knownWorkIds
    .map((id) => works[id])
    .filter(Boolean)
    .sort((a, b) => b.id - a.id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header wallet={wallet} />
      <Hero />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16 flex-1">
        {!configured && (
          <div className="mb-6">
            <Banner type="warning">
              Contract addresses aren&apos;t configured yet. Set{' '}
              <code className="font-mono">VITE_REGISTRY_CONTRACT_ID</code>,{' '}
              <code className="font-mono">VITE_DISTRIBUTOR_CONTRACT_ID</code>, and{' '}
              <code className="font-mono">VITE_TOKEN_CONTRACT_ID</code> in your{' '}
              <code className="font-mono">.env</code> file after deploying — see DEPLOYMENT.md.
            </Banner>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6">
            <Banner type="error" onDismiss={() => setErrorMsg(null)}>
              {errorMsg}
            </Banner>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="space-y-4 min-w-0">
            <CreateWorkForm onCreate={handleCreateWork} disabled={!wallet.address || !configured} />

            {workList.length === 0 && (
              <p className="font-mono text-xs text-mist-dim/40 text-center py-10">
                No works yet. The first one registered becomes Work #000.
              </p>
            )}

            {workList.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                totalDistributed={totals[work.id]}
                onPay={handlePay}
                lastTxHash={txByWork[work.id]}
              />
            ))}
          </section>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ActivityFeed feed={feed} isPolling={isPolling} />
          </div>
        </div>
      </main>

      <footer className="border-t border-graphite-line py-6 text-center">
        <p className="font-mono text-[11px] text-mist-dim/30">Built on Soroban · Stellar Testnet</p>
      </footer>
    </div>
  )
}
