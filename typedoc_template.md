<p align="center">
  <a href="https://iex.ec/" rel="noopener" target="_blank"><img width="150" src="./logo-iexec.png" alt="iExec logo"/></a>
</p>

<h1 align="center">OracleFactory</h1>

**OracleFactory** is an SDK designed to build web2.0 API-based oracles for iExec and support cross-chain functionality on Polygon, Mumbai, Ethereum Mainnet and Goerli networks, on the top of iExec.

Through OracleFactory, users may creating secure oracles, guaranteeing data confidentiality and integrity :

- Quick and easy oracle creation.
- Supports cross-chain integration for DApps across iExec Sidechain, Ethereum, and Polygon.
- Customization for specific use cases

OracleFactory bundles 3 methods:

- **createOracle** — Creates a new oracle based on the provided parameters. This method is used to create an oracle from a given API, limited to returning only one data point.
- **updateOracle** — Updates an existing oracle to have the latest data from the linked API.
- **readOracle** — Reads data from a specific oracle based on the provided parameters. This method retrieves the value from a specific oracle created using the provided parameters.

<div align="center">

[![npm](https://img.shields.io/npm/v/@iexec/iexec-oracle-factory-wrapper)](https://www.npmjs.com/package/@iexec/iexec-oracle-factory-wrapper) [![license](https://img.shields.io/badge/license-Apache%202-blue)](/LICENSE)

</div>

## Installation

OracleFactory is available as an [npm package](https://www.npmjs.com/package/@iexec/iexec-oracle-factory-wrapper).

**npm:**

```sh
npm i @iexec/iexec-oracle-factory-wrapper
```

**yarn:**

```sh
yarn add @iexec/iexec-oracle-factory-wrapper
```

## Get started

### Browser

```ts
import { IExecOracleFactory } from "@iexec/iexec-oracle-factory-wrapper";

const web3Provider = window.ethereum;
const factory = new IExecOracleFactory(web3Provider);
```

### NodeJS

```ts
import { IExecOracleFactory, utils } from "@iexec/iexec-oracle-factory-wrapper";

const { PRIVATE_KEY } = process.env;
const signer = utils.getSignerFromPrivateKey(
  "https://bellecour.iex.ec",
  "your-private-key"
);
const factory = new IExecOracleFactory(signer);
```

## Documentation

- [OracleFactory documentation](https://tools.docs.iex.ec/tools/oracle-factory)
<!-- - [OracleFactory technical design](./technical-design/index.md) -->
- [iExec Protocol documentation](https://protocol.docs.iex.ec)

## License

This project is licensed under the terms of the
[Apache 2.0](/LICENSE).
