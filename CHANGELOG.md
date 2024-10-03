# Changelog

All notable changes to this project will be documented in this file.

## Next

### Added

- Support app whitelist for future seamless existing oracles migration to latest oracle dapp

## [2.2.0] 2024-09-17

### Added

- Support for ethers `AbstractProvider` and `AbstractSigner` in constructors
- Export more types

### Changed

- Upgraded to iexec ^8.10.0
- [BREAKING] Ship ES2022 JavaScript instead of es2015 (aka es6) in order to support `errorCause` optional field in `Error`:
  - Minimum browser versions: <https://gist.github.com/Julien-Marcou/156b19aea4704e1d2f48adafc6e2acbf>
  - Minimum Node.js version: 18
- Upgrade typescript version
- Changed `createOracle`, `updateOracle` and `readOracle` error handling:
  - Distinguish iExec protocol errors from other errors
  - Store original error as the error errorCause
- [BREAKING] Removed `originalError` from `WorkflowError`
- Fixed supported target chains for cross-chain (134 is not included)

### Removed

- Removed support for mumbai cross-chain oracles

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
