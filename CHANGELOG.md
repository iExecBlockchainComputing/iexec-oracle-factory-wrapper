# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] 2023-09-05

### Added

- Added `IExecOracleReader` class for oracles reading only
- Added `targetBlockchains` option to the `updateOracle` method for cross-chain oracles update (1: mainnet, 137: polygon, 5: goerli, 80001: mumbai)

### Changed

- Migrated IPFS upload from `ipfs` to `kubo-rpc-client` using the iExec v8 stack-specific IPFS node.
- Upgraded iexec sdk to version 8.2.1.
- Upgraded react-wallet-manager to version 2.0.1.
- Migrated from CommonJs to ES modules.

### Removed

- Removed Create React App (CRA) bundler.
