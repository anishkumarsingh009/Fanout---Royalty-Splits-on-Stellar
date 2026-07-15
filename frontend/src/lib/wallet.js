import {
  isConnected,
  isAllowed,
  requestAccess,
  signTransaction as freighterSignTransaction,
  getNetworkDetails as freighterGetNetworkDetails,
  getAddress as freighterGetAddress
} from '@stellar/freighter-api'

const NETWORK_PASSPHRASES = {
  TESTNET: 'Test SDF Network ; September 2015',
  PUBLIC: 'Public Global Stellar Network ; September 2015',
}

export async function isFreighterInstalled() {
  return await isConnected()
}

export async function connectWallet() {
  const connected = await isFreighterInstalled()
  if (!connected) {
    throw new Error('Freighter wallet extension not found. Install it from freighter.app to continue.')
  }
  
  let allowed = await isAllowed()
  if (!allowed) {
    await requestAccess()
    allowed = await isAllowed()
    if (!allowed) {
      throw new Error('User declined access')
    }
  }

  const addressResult = await freighterGetAddress()
  if (addressResult && addressResult.error) {
    throw new Error(addressResult.error)
  }
  
  let addr = ''
  if (typeof addressResult === 'string') {
    addr = addressResult
  } else if (addressResult && typeof addressResult === 'object') {
    addr = addressResult.address || addressResult.publicKey || ''
  }
  
  if (!addr) {
    throw new Error('Failed to retrieve wallet address from Freighter.')
  }
  return addr
}

export async function getNetworkDetails() {
  const connected = await isFreighterInstalled()
  if (!connected) return null
  return await freighterGetNetworkDetails()
}

export async function signTransaction(xdr, networkPassphrase) {
  const connected = await isFreighterInstalled()
  if (!connected) {
    throw new Error('Freighter wallet extension not found.')
  }
  const result = await freighterSignTransaction(xdr, {
    networkPassphrase,
  })
  
  if (result && result.error) {
    throw new Error(result.error)
  }
  
  let signedXdr = ''
  if (typeof result === 'string') {
    signedXdr = result
  } else if (result && typeof result === 'object') {
    signedXdr = result.signedTxXdr || result.signedTransaction || ''
  }
  
  if (!signedXdr) {
    throw new Error('Failed to sign transaction with Freighter.')
  }
  
  return signedXdr
}

export { NETWORK_PASSPHRASES }
