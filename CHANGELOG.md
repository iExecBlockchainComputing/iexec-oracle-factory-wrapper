# Changelog

All notable changes to this project will be documented in this file.

## Next

### Added

- Added several error classes for managing iexec sdk call errors

### Changed

- Changed `createOracle`,`readOracle` and `updateOracle` to handle more precise errors

## [2.1.0] 2024-03-15

### Removed

- Removed support for goerli cross-chain oracles

### Changed

- Project migrated to TypeScript

## [2.0.0] 2023-09-05

### Added

- Added `IExecOracleReader` class for oracles reading only
- Added `targetBlockchains` option to the `updateOracle` method for cross-chain oracles update (1: mainnet, 137: polygon, 5: goerli, 80001: mumbai)

### Changed

- Migrated from `ipfs` to `kubo-rpc-client` with iExec v8 stack-specific IPFS node for IPFS upload.
- Migrated from iExec v7 to iExec v8 (upgraded iexec sdk to version 8.2.1).
- Migrated from CommonJs to ES modules.

### Removed

- Removed support for viviani testnet
