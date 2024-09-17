**@iexec/iexec-oracle-factory-wrapper** • [**Docs**](globals.md)

***

<p align="center">
  <a href="https://iex.ec/" rel="noopener" target="_blank"><img width="150" src="" alt="iExec logo"/></a>
</p>

<h1 align="center">OracleFactory</h1>

**OracleFactory**

Oracle Factory introduces a streamlined and efficient way for developers to integrate real-world data into blockchain applications. Leveraging the power of the iExec decentralized cloud infrastructure, Oracle Factory ensures the creation of reliable and trustworthy oracles.

Key features of Oracle Factory include:

- **Create Oracle** — This method allows for the creation of custom oracles from any API, with a limitation of one data return per oracle. This feature is pivotal in fetching specific, relevant data for decentralized applications.

- **Update Oracle** — This method ensures that the oracle stays current by fetching the latest data from its linked API. It maintains the oracle's relevance and accuracy, crucial for real-time data-dependent applications.

- **Read Oracle** — This method allows users to retrieve the value from the oracle.

With its cross-chain functionality, extending from the iExec Sidechain to networks like Ethereum and Polygon, Oracle Factory demonstrates remarkable versatility. It is a critical tool for developers looking to bridge the gap between blockchain and the real world, democratizing access to reliable data for DApps.

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
- [iExec Protocol documentation](https://protocol.docs.iex.ec)

## License

This project is licensed under the terms of the
[Apache 2.0](/LICENSE).
