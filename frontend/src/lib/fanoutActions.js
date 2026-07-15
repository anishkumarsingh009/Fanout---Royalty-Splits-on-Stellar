import {
  invokeContract,
  readContract,
  addressToScVal,
  stringToScVal,
  i128ToScVal,
  u32ToScVal,
  u64ToScVal,
  vecToScVal,
} from './sorobanClient'
import { REGISTRY_CONTRACT_ID, DISTRIBUTOR_CONTRACT_ID } from './config'

export async function registerWork({ owner, title, collaborators, sharesBps }) {
  const args = [
    addressToScVal(owner),
    stringToScVal(title),
    vecToScVal(collaborators.map((c) => addressToScVal(c))),
    vecToScVal(sharesBps.map((b) => u32ToScVal(b))),
  ]
  return invokeContract({
    contractId: REGISTRY_CONTRACT_ID,
    method: 'register_work',
    args,
    sourcePublicKey: owner,
  })
}

export async function updateSplits({ owner, workId, collaborators, sharesBps }) {
  const args = [
    addressToScVal(owner),
    u64ToScVal(workId),
    vecToScVal(collaborators.map((c) => addressToScVal(c))),
    vecToScVal(sharesBps.map((b) => u32ToScVal(b))),
  ]
  return invokeContract({
    contractId: REGISTRY_CONTRACT_ID,
    method: 'update_splits',
    args,
    sourcePublicKey: owner,
  })
}

export async function distributePayment({ payer, workId, token, amount }) {
  const args = [addressToScVal(payer), u64ToScVal(workId), addressToScVal(token), i128ToScVal(amount)]
  return invokeContract({
    contractId: DISTRIBUTOR_CONTRACT_ID,
    method: 'distribute_payment',
    args,
    sourcePublicKey: payer,
  })
}

export async function getWork({ workId, sourcePublicKey }) {
  return readContract({
    contractId: REGISTRY_CONTRACT_ID,
    method: 'get_work',
    args: [u64ToScVal(workId)],
    sourcePublicKey,
  })
}

export async function getTotalDistributed({ workId, sourcePublicKey }) {
  return readContract({
    contractId: DISTRIBUTOR_CONTRACT_ID,
    method: 'get_total_distributed',
    args: [u64ToScVal(workId)],
    sourcePublicKey,
  })
}

export function normalizeWork(workId, raw) {
  if (!raw) return null
  return {
    id: workId,
    owner: raw.owner,
    title: raw.title,
    collaborators: raw.collaborators || [],
    sharesBps: (raw.shares_bps || []).map((b) => Number(b)),
    locked: raw.locked,
  }
}
