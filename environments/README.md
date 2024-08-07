# environments

This package centralize the configuration of environments in [environments.json](./environments.json)

## Usage

### JSON

Directly get the value from [environments.json](./environments.json)

### ES module

Install this module as a dependency

```sh
npm install ./path/to/this/folder
```

Use it to generate the configuration for a specific environment

```js
import { getEnvironment } from '@iexec/environments';

const {
  chainId,
  rpcURL,
  hubAddress,
  ensRegistryAddress,
  ensPublicResolverAddress,
  voucherHubAddress,
  smsURL,
  iexecGatewayURL,
  resultProxyURL,
  ipfsGatewayURL,
  ipfsNodeURL,
  pocoSubgraphURL,
  voucherSubgraphURL,
  oracleApp,
  dappWhitelistAddress,
  oracleContract,
  ipfsNode,
  ipfsGateway,
  workerpoolAddress
} = getEnvironment('staging');
```

## Updating an environment

```sh
ENV=env-name KEY=keyName VALUE=value npm run update-env
```
