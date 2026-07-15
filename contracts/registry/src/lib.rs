//! Registry Contract
//!
//! Creators register a "Work" — a title plus a list of collaborators and
//! their revenue shares, expressed in basis points (must sum to 10,000).
//! This contract never touches funds; it only stores splits. The separate
//! Distributor contract reads a Work's splits (a cross-contract call) at
//! payment time and executes the actual transfers, then calls back into
//! this contract to lock the splits after the first payout — so
//! collaborators can't be rug-pulled by the owner editing shares after
//! they've started getting paid.

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Work {
    pub owner: Address,
    pub title: String,
    pub collaborators: Vec<Address>,
    pub shares_bps: Vec<u32>,
    pub locked: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    DistributorContract,
    NextWorkId,
    Work(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RegistryError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InvalidSplits = 3,
    WorkNotFound = 4,
    Unauthorized = 5,
    WorkLocked = 6,
}

const TOTAL_BPS: u32 = 10_000;

#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {
    /// One-time setup. `distributor_contract` is the only address permitted
    /// to lock a work's splits.
    pub fn initialize(env: Env, admin: Address, distributor_contract: Address) -> Result<(), RegistryError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(RegistryError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::DistributorContract, &distributor_contract);
        env.storage().instance().set(&DataKey::NextWorkId, &0u64);
        Ok(())
    }

    /// Registers a new work with its collaborator splits.
    pub fn register_work(
        env: Env,
        owner: Address,
        title: String,
        collaborators: Vec<Address>,
        shares_bps: Vec<u32>,
    ) -> Result<u64, RegistryError> {
        owner.require_auth();
        Self::validate_splits(&collaborators, &shares_bps)?;

        let work_id: u64 = env.storage().instance().get(&DataKey::NextWorkId).unwrap_or(0);
        let work = Work {
            owner: owner.clone(),
            title,
            collaborators,
            shares_bps,
            locked: false,
        };
        env.storage().persistent().set(&DataKey::Work(work_id), &work);
        env.storage()
            .instance()
            .set(&DataKey::NextWorkId, &(work_id + 1));

        env.events()
            .publish((symbol_short!("work"), symbol_short!("created"), work_id), owner);
        Ok(work_id)
    }

    /// Owner updates collaborators/splits — only allowed before the first
    /// payout locks the work.
    pub fn update_splits(
        env: Env,
        owner: Address,
        work_id: u64,
        collaborators: Vec<Address>,
        shares_bps: Vec<u32>,
    ) -> Result<(), RegistryError> {
        owner.require_auth();
        let mut work = Self::load_work(&env, work_id)?;
        if work.owner != owner {
            return Err(RegistryError::Unauthorized);
        }
        if work.locked {
            return Err(RegistryError::WorkLocked);
        }
        Self::validate_splits(&collaborators, &shares_bps)?;
        work.collaborators = collaborators;
        work.shares_bps = shares_bps;
        env.storage().persistent().set(&DataKey::Work(work_id), &work);

        env.events()
            .publish((symbol_short!("work"), symbol_short!("updated"), work_id), owner);
        Ok(())
    }

    /// Called by the Distributor contract right before its first payout for
    /// a work, freezing the splits from further edits.
    pub fn lock_work(env: Env, caller: Address, work_id: u64) -> Result<(), RegistryError> {
        let distributor: Address = env
            .storage()
            .instance()
            .get(&DataKey::DistributorContract)
            .ok_or(RegistryError::NotInitialized)?;
        caller.require_auth();
        if caller != distributor {
            return Err(RegistryError::Unauthorized);
        }
        let mut work = Self::load_work(&env, work_id)?;
        work.locked = true;
        env.storage().persistent().set(&DataKey::Work(work_id), &work);

        env.events()
            .publish((symbol_short!("work"), symbol_short!("locked"), work_id), caller);
        Ok(())
    }

    pub fn get_work(env: Env, work_id: u64) -> Option<Work> {
        env.storage().persistent().get(&DataKey::Work(work_id))
    }

    fn load_work(env: &Env, work_id: u64) -> Result<Work, RegistryError> {
        env.storage()
            .persistent()
            .get(&DataKey::Work(work_id))
            .ok_or(RegistryError::WorkNotFound)
    }

    fn validate_splits(collaborators: &Vec<Address>, shares_bps: &Vec<u32>) -> Result<(), RegistryError> {
        if collaborators.is_empty() || collaborators.len() != shares_bps.len() {
            return Err(RegistryError::InvalidSplits);
        }
        let mut total: u32 = 0;
        for bps in shares_bps.iter() {
            total = total.saturating_add(bps);
        }
        if total != TOTAL_BPS {
            return Err(RegistryError::InvalidSplits);
        }
        Ok(())
    }
}

mod test;
