import { useState, useCallback, useEffect } from 'react'
import { connectWallet, isFreighterInstalled } from '../lib/wallet'
import { getServer } from '../lib/sorobanClient'

export function useWallet() {
  const [address, setAddress] = useState(() => localStorage.getItem('wallet_address') || null)
  const [balance, setBalance] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [installed, setInstalled] = useState(true)

  useEffect(() => {
    isFreighterInstalled().then(setInstalled)
  }, [])

  const fetchBalance = useCallback(async (addr) => {
    try {
      const account = await getServer().getAccount(addr)
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native')
      if (nativeBalance) {
        setBalance(nativeBalance.balance)
      }
    } catch (err) {
      console.error('Failed to fetch balance', err)
      setBalance('0.0000000') // Account might not exist on testnet yet
    }
  }, [])

  useEffect(() => {
    if (address) {
      fetchBalance(address)
      const interval = setInterval(() => fetchBalance(address), 10000)
      return () => clearInterval(interval)
    }
  }, [address, fetchBalance])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const addr = await connectWallet()
      setAddress(addr)
      localStorage.setItem('wallet_address', addr)
      await fetchBalance(addr)
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [fetchBalance])

  const disconnect = useCallback(() => {
    setAddress(null)
    setBalance(null)
    localStorage.removeItem('wallet_address')
  }, [])

  return { address, balance, connecting, error, installed, connect, disconnect, fetchBalance }
}
