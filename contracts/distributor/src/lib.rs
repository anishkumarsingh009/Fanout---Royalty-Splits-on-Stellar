//! Distributor Contract
//!
//! Pays for a registered Work. Reads the current split from the Registry
//! contract (a cross-contract read) and transfers every collaborator's
//! share directly from the payer in one transaction — the funds never sit
//! in this contract at all. On a work's first payment, it calls back into
//! Registry to lock the splits (another cross-contract call), so
//! collaborators can trust the split won't change out from under them
//! after they've started getting paid.

#![no_std]

use registry::{RegistryContractClient, Work};
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

#[contracttype]
pub enum DataKey {
    Admin,
    RegistryContract,
    TotalDistributed(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DistributorError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    WorkNotFound = 3,
    InvalidAmount = 4,
}

#[contract]
pub struct DistributorContract;

#[contractimpl]
impl DistributorContract {
    pub fn init_distributor(env: Env, admin: Address, registry_contract: Address) -> Result<(), DistributorError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DistributorError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::RegistryContract, &registry_contract);
        Ok(())
    }

    /// Pays `amount` of `token` for `work_id`, splitting it across every
    /// collaborator per the Registry's stored basis-point shares. Any
    /// rounding remainder (from integer division) goes to the work's
    /// owner rather than being lost. Locks the work's splits if this is
    /// the first payment.
    pub fn distribute_payment(
        env: Env,
        payer: Address,
        work_id: u64,
        token: Address,
        amount: i128,
    ) -> Result<i128, DistributorError> {
        payer.require_auth();
        if amount <= 0 {
            return Err(DistributorError::InvalidAmount);
        }

        let registry_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::RegistryContract)
            .ok_or(DistributorError::NotInitialized)?;
        let registry_client = RegistryContractClient::new(&env, &registry_address);
        let work: Work = registry_client
            .get_work(&work_id)
            .ok_or(DistributorError::WorkNotFound)?;

        if !work.locked {
            // Cross-contract call: freeze splits on first payout.
            registry_client.lock_work(&env.current_contract_address(), &work_id);
        }

        let token_client = token::Client::new(&env, &token);
        let mut total_paid: i128 = 0;

        for i in 0..work.collaborators.len() {
            let collaborator = work.collaborators.get(i).unwrap();
            let bps = work.shares_bps.get(i).unwrap();
            let share: i128 = amount * (bps as i128) / 10_000;
            if share > 0 {
                // Cross-contract call: direct transfer from payer to
                // collaborator — funds never sit in this contract.
                token_client.transfer(&payer, &collaborator, &share);
            }
            total_paid += share;
        }

        let remainder = amount - total_paid;
        if remainder > 0 {
            token_client.transfer(&payer, &work.owner, &remainder);
        }

        let prior: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::TotalDistributed(work_id))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::TotalDistributed(work_id), &(prior + amount));

        env.events().publish(
            (symbol_short!("payment"), symbol_short!("split"), work_id),
            (payer, amount),
        );

        Ok(amount)
    }

    pub fn get_total_distributed(env: Env, work_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalDistributed(work_id))
            .unwrap_or(0)
    }

    /// Read-only preview of how a payment would split, without moving any
    /// funds — lets the frontend show collaborators their expected payout
    /// before the payer submits a transaction.
    pub fn preview_split(
        env: Env,
        work_id: u64,
        amount: i128,
    ) -> Result<Vec<(Address, i128)>, DistributorError> {
        let registry_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::RegistryContract)
            .ok_or(DistributorError::NotInitialized)?;
        let registry_client = RegistryContractClient::new(&env, &registry_address);
        let work: Work = registry_client
            .get_work(&work_id)
            .ok_or(DistributorError::WorkNotFound)?;

        let mut result: Vec<(Address, i128)> = Vec::new(&env);
        let mut total_paid: i128 = 0;
        for i in 0..work.collaborators.len() {
            let collaborator = work.collaborators.get(i).unwrap();
            let bps = work.shares_bps.get(i).unwrap();
            let share: i128 = amount * (bps as i128) / 10_000;
            result.push_back((collaborator, share));
            total_paid += share;
        }
        let remainder = amount - total_paid;
        if remainder > 0 {
            result.push_back((work.owner.clone(), remainder));
        }
        Ok(result)
    }
}

mod test;
