#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String, Vec};

struct TestSetup {
    env: Env,
    client: RegistryContractClient<'static>,
    admin: Address,
    distributor: Address,
    owner: Address,
    collab_a: Address,
    collab_b: Address,
}

fn setup() -> TestSetup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let distributor = Address::generate(&env);
    let owner = Address::generate(&env);
    let collab_a = Address::generate(&env);
    let collab_b = Address::generate(&env);

    let contract_id = env.register(RegistryContract, ());
    let client = RegistryContractClient::new(&env, &contract_id);
    client.init_registry(&admin, &distributor);

    TestSetup {
        env,
        client,
        admin,
        distributor,
        owner,
        collab_a,
        collab_b,
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
fn test_register_work() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[6000, 4000]);
    let work_id = t.client.register_work(
        &t.owner,
        &String::from_str(&t.env, "Midnight Sessions EP"),
        &collabs,
        &shares,
    );
    assert_eq!(work_id, 0);

    let work = t.client.get_work(&work_id).unwrap();
    assert_eq!(work.collaborators.len(), 2);
    assert!(!work.locked);
}

#[test]
fn test_register_work_rejects_splits_not_summing_to_10000() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[6000, 3000]);
    let result = t.client.try_register_work(
        &t.owner,
        &String::from_str(&t.env, "Bad Split"),
        &collabs,
        &shares,
    );
    assert_eq!(result, Err(Ok(RegistryError::InvalidSplits)));
}

#[test]
fn test_register_work_rejects_mismatched_lengths() {
    let t = setup();
    let mut collabs = Vec::new(&t.env);
    collabs.push_back(t.collab_a.clone());
    collabs.push_back(t.collab_b.clone());
    let mut shares = Vec::new(&t.env);
    shares.push_back(10_000u32);

    let result = t.client.try_register_work(
        &t.owner,
        &String::from_str(&t.env, "Mismatched"),
        &collabs,
        &shares,
    );
    assert_eq!(result, Err(Ok(RegistryError::InvalidSplits)));
}

#[test]
fn test_register_work_rejects_empty_collaborators() {
    let t = setup();
    let collabs: Vec<Address> = Vec::new(&t.env);
    let shares: Vec<u32> = Vec::new(&t.env);
    let result = t.client.try_register_work(
        &t.owner,
        &String::from_str(&t.env, "Empty"),
        &collabs,
        &shares,
    );
    assert_eq!(result, Err(Ok(RegistryError::InvalidSplits)));
}

#[test]
fn test_update_splits_before_lock_succeeds() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Album"), &collabs, &shares);

    let (new_collabs, new_shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[7000, 3000]);
    t.client.update_splits(&t.owner, &work_id, &new_collabs, &new_shares);

    let work = t.client.get_work(&work_id).unwrap();
    assert_eq!(work.shares_bps.get(0).unwrap(), 7000);
}

#[test]
fn test_only_owner_can_update_splits() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Album"), &collabs, &shares);

    let impostor = Address::generate(&t.env);
    let result = t.client.try_update_splits(&impostor, &work_id, &collabs, &shares);
    assert_eq!(result, Err(Ok(RegistryError::Unauthorized)));
}

#[test]
fn test_lock_work_by_distributor() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Album"), &collabs, &shares);

    t.client.lock_work(&t.distributor, &work_id);
    let work = t.client.get_work(&work_id).unwrap();
    assert!(work.locked);
}

#[test]
fn test_non_distributor_cannot_lock_work() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Album"), &collabs, &shares);

    let impostor = Address::generate(&t.env);
    let result = t.client.try_lock_work(&impostor, &work_id);
    assert_eq!(result, Err(Ok(RegistryError::Unauthorized)));
}

#[test]
fn test_cannot_update_splits_after_lock() {
    let t = setup();
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b], &[5000, 5000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Album"), &collabs, &shares);

    t.client.lock_work(&t.distributor, &work_id);

    let result = t.client.try_update_splits(&t.owner, &work_id, &collabs, &shares);
    assert_eq!(result, Err(Ok(RegistryError::WorkLocked)));
}

#[test]
fn test_get_work_not_found() {
    let t = setup();
    assert!(t.client.get_work(&999).is_none());
}

#[test]
fn test_cannot_initialize_twice() {
    let t = setup();
    let result = t.client.try_initialize(&t.admin, &t.distributor);
    assert_eq!(result, Err(Ok(RegistryError::AlreadyInitialized)));
}

#[test]
fn test_three_way_split_sums_correctly() {
    let t = setup();
    let collab_c = Address::generate(&t.env);
    let (collabs, shares) = splits(&t.env, &[&t.collab_a, &t.collab_b, &collab_c], &[5000, 3000, 2000]);
    let work_id = t.client.register_work(&t.owner, &String::from_str(&t.env, "Trio Track"), &collabs, &shares);

    let work = t.client.get_work(&work_id).unwrap();
    assert_eq!(work.collaborators.len(), 3);
}
