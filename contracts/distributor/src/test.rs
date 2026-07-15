#![cfg(test)]

use super::*;
use registry::{RegistryContract, RegistryContractClient};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::token::StellarAssetClient;
use soroban_sdk::{Address, Env, String, Vec};

struct TestSetup {
    env: Env,
    distributor: DistributorContractClient<'static>,
    distributor_id: Address,
    registry: RegistryContractClient<'static>,
    token: Address,
    token_admin: StellarAssetClient<'static>,
    owner: Address,
    collab_a: Address,
    collab_b: Address,
    payer: Address,
}

fn setup() -> TestSetup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let collab_a = Address::generate(&env);
    let collab_b = Address::generate(&env);
    let payer = Address::generate(&env);

    let token_admin_addr = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(token_admin_addr.clone());
    let token = sac.address();
    let token_admin = StellarAssetClient::new(&env, &token);
    token_admin.mint(&payer, &1_000_000);

    let distributor_id = env.register(DistributorContract, ());
    let registry_id = env.register(RegistryContract, ());

    let registry = RegistryContractClient::new(&env, &registry_id);
    registry.initialize(&admin, &distributor_id);

    let distributor = DistributorContractClient::new(&env, &distributor_id);
    distributor.initialize(&admin, &registry_id);

    TestSetup {
        env,
        distributor,
        distributor_id,
        registry,
        token,
        token_admin,
        owner,
        collab_a,
        collab_b,
        payer,
    }
}

fn splits(env: &Env, addrs: &[&Address], bps: &[u32]) -> (Vec<Address>, Vec<u32>) {
    let mut a = Vec::new(env);
    let mut b = Vec::new(env);
    for addr in addrs {
        a.push_back((*addr).clone());
    }
    for v in bps {
        b.push_back(*v);
    }
    (a, b)
}

#[test]
fn test_distribute_payment_splits_correctly() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[6000, 4000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &1000);

    let token_client = token::Client::new(&t.env, &t.token);
    assert_eq!(token_client.balance(&t.collab_a), 600);
    assert_eq!(token_client.balance(&t.collab_b), 400);
    assert_eq!(token_client.balance(&t.payer), 1_000_000 - 1000);
}

#[test]
fn test_distribute_payment_locks_work_on_first_payout() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    let work_before = t.registry.get_work(&work_id).unwrap();
    assert!(!work_before.locked);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &1000);

    let work_after = t.registry.get_work(&work_id).unwrap();
    assert!(work_after.locked);
}

#[test]
fn test_rounding_remainder_goes_to_owner() {
    let t = setup();
    // 3-way split of 100 with odd bps guarantees a rounding remainder.
    let collab_c = Address::generate(&t.env);
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b, &collab_c], &[3334, 3333, 3333]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Split Three Ways"), &collabs, &shares);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &100);

    let token_client = token::Client::new(&t.env, &t.token);
    // 100 * 3334/10000 = 33 (floor), 100*3333/10000 = 33 (floor) twice -> 33+33+33=99, remainder 1 to owner
    assert_eq!(token_client.balance(&t.collab_a), 33);
    assert_eq!(token_client.balance(&t.collab_b), 33);
    assert_eq!(token_client.balance(&collab_c), 33);
    assert_eq!(token_client.balance(&t.owner), 1);
}

#[test]
fn test_total_distributed_accumulates_across_payments() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &500);
    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &300);

    assert_eq!(t.distributor.get_total_distributed(&work_id), 800);
}

#[test]
fn test_distribute_payment_rejects_non_positive_amount() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    let result = t.distributor.try_distribute_payment(&t.payer, &work_id, &t.token, &0);
    assert_eq!(result, Err(Ok(DistributorError::InvalidAmount)));
}

#[test]
fn test_distribute_payment_rejects_unknown_work() {
    let t = setup();
    let result = t.distributor.try_distribute_payment(&t.payer, &999, &t.token, &100);
    assert_eq!(result, Err(Ok(DistributorError::WorkNotFound)));
}

#[test]
fn test_preview_split_matches_actual_distribution() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[7000, 3000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    let preview = t.distributor.preview_split(&work_id, &1000);
    assert_eq!(preview.get(0).unwrap().1, 700);
    assert_eq!(preview.get(1).unwrap().1, 300);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &1000);
    let token_client = token::Client::new(&t.env, &t.token);
    assert_eq!(token_client.balance(&t.collab_a), 700);
    assert_eq!(token_client.balance(&t.collab_b), 300);
}

#[test]
fn test_preview_split_unknown_work_errors() {
    let t = setup();
    let result = t.distributor.try_preview_split(&999, &100);
    assert_eq!(result, Err(Ok(DistributorError::WorkNotFound)));
}

#[test]
fn test_second_payment_after_lock_still_succeeds() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Track"), &collabs, &shares);

    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &200);
    t.distributor.distribute_payment(&t.payer, &work_id, &t.token, &400);

    let token_client = token::Client::new(&t.env, &t.token);
    assert_eq!(token_client.balance(&t.collab_a), 300); // 100 + 200
    assert_eq!(token_client.balance(&t.collab_b), 300);
}

#[test]
fn test_get_total_distributed_zero_for_unpaid_work() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.registry.register_work(&t.owner, &String::from_str(&t.env, "Untouched"), &collabs, &shares);
    assert_eq!(t.distributor.get_total_distributed(&work_id), 0);
}

#[test]
fn test_cannot_initialize_twice() {
    let t = setup();
    let admin2 = Address::generate(&t.env);
    let registry2 = Address::generate(&t.env);
    let result = t.distributor.try_initialize(&admin2, &registry2);
    assert_eq!(result, Err(Ok(DistributorError::AlreadyInitialized)));
}
