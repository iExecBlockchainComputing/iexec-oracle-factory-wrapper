[@iexec/iexec-oracle-factory-wrapper](README.md) / Exports

# @iexec/iexec-oracle-factory-wrapper

## Table of contents

### Modules

- [\<internal\>](modules/internal_.md)

### Namespaces

- [errors](modules/errors.md)
- [utils](modules/utils.md)

### Classes

- [IExecOracleFactory](classes/IExecOracleFactory.md)
- [IExecOracleReader](classes/IExecOracleReader.md)

### Type Aliases

- [Address](modules.md#address)
- [AddressOrENS](modules.md#addressorens)
- [CreateApiKeyDatasetParams](modules.md#createapikeydatasetparams)
- [CreateOracleMessage](modules.md#createoraclemessage)
- [CreateOracleOptions](modules.md#createoracleoptions)
- [Oracle](modules.md#oracle)
- [OracleFactoryOptions](modules.md#oraclefactoryoptions)
- [OracleReaderOptions](modules.md#oraclereaderoptions)
- [ParamSet](modules.md#paramset)
- [ReadOracleParams](modules.md#readoracleparams)
- [TaskExecutionMessage](modules.md#taskexecutionmessage)
- [UpdateOracleMessage](modules.md#updateoraclemessage)
- [UpdateOracleOptions](modules.md#updateoracleoptions)
- [UpdateOracleParams](modules.md#updateoracleparams)
- [Web3ReadOnlyProvider](modules.md#web3readonlyprovider)
- [Web3SignerProvider](modules.md#web3signerprovider)

### Functions

- [getWeb3Provider](modules.md#getweb3provider)

## Type Aliases

### Address

Ƭ **Address**: `string`

Ethereum address.

___

### AddressOrENS

Ƭ **AddressOrENS**: [`Address`](modules.md#address) \| [`ENS`](modules/internal_.md#ens)

ethereum address or ENS name (Ethereum Name Service)

___

### CreateApiKeyDatasetParams

Ƭ **CreateApiKeyDatasetParams**: `Object`

Parameters required to create an API key dataset.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiKey` | `string` | API key associated with the dataset. |
| `callId` | `string` | Call ID associated with the dataset. |
| `iexec` | `IExec` | (Optional) iExec instance used for dataset creation. |
| `ipfsGateway?` | `string` | (Optional) IPFS gateway URL used for oracle creation. |
| `ipfsUploadUrl?` | `string` | (Optional) IPFS upload URL used for oracle creation. |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) | (Optional) Address or ENS (Ethereum Name Service) name of oracleFactory application. |

___

### CreateOracleMessage

Ƭ **CreateOracleMessage**: [`DeployDatasetMessage`](interfaces/internal_.DeployDatasetMessage.md) \| [`CreateParamSetMessage`](interfaces/internal_.CreateParamSetMessage.md) \| [`ComputeOracleIDMessage`](interfaces/internal_.ComputeOracleIDMessage.md) \| [`UploadParamSetMessage`](interfaces/internal_.UploadParamSetMessage.md)

___

### CreateOracleOptions

Ƭ **CreateOracleOptions**: `Object`

Options for creating an oracle.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `iexec?` | `IExec` | (Optional) iExec instance used to create an oracle. |
| `ipfsGateway?` | `string` | (Optional) The IPFS gateway URL used to create an oracle. |
| `ipfsUploadUrl?` | `string` | (Optional) The IPFS upload URL used for oracle creation. |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) | (Optional) Address or ENS (Ethereum Name Service) name of the oracle application. |

___

### Oracle

Ƭ **Oracle**: `Object`

Response from an oracle query.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `number` | Timestamp indicating when the oracle was created. |
| `value` | `boolean` \| `string` \| `number` | Value returned by the oracle. |

___

### OracleFactoryOptions

Ƭ **OracleFactoryOptions**: `Object`

Configuration options for OracleFactory.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `iexecOptions?` | `IExecConfigOptions` | Options specific to iExec integration. If not provided, default iexec options will be used. |
| `ipfsGateway?` | `string` | IPFS gateway URL. If not provided, the default OracleFactory IPFS gateway URL will be used. **`Default`** ```ts DEFAULT_IPFS_GATEWAY ``` |
| `ipfsUploadUrl?` | `string` | IPFS node URL. If not provided, the default OracleFactory IPFS node URL will be used. **`Default`** ```ts DEFAULT_IPFS_UPLOAD_URL ``` |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) | Address of a custom oracle application If not provided, the default OracleFactory application address will be used. |
| `oracleContract?` | [`AddressOrENS`](modules.md#addressorens) | Ethereum contract address or ENS (Ethereum Name Service) for oracleFactory smart contract. If not provided, the default oracleFactory contract address will be used. **`Default`** ```ts DEFAULT_ORACLE_CONTRACT_ADDRESS ``` |
| `workerpool?` | [`AddressOrENS`](modules.md#addressorens) | Address of the workerpool. If not provided, the default OracleFactory workerpool address will be used. |

___

### OracleReaderOptions

Ƭ **OracleReaderOptions**: `Object`

Configuration options for OracleReader.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ipfsGateway?` | `string` | The IPFS gateway URL. If not provided, the default OracleFactory IPFS gateway URL will be used. @defaultDEFAULT_IPFS_GATEWAY |
| `oracleContract?` | [`AddressOrENS`](modules.md#addressorens) | The Ethereum contract address or ENS (Ethereum Name Service) for oracle reader smart contract. If not provided, the default oracle reader contract address will be used. @defaultDEFAULT_CONTRACT_ADDRESS |

___

### ParamSet

Ƭ **ParamSet**: `Object`

Set of parameters for an oracle request.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `JSONPath` | `string` | The JSONPath expression used to extract the desired data from the API response. |
| `apiKey?` | `string` | API key to use for authentication (optional). |
| `body?` | `string` | Body of the request (optional). |
| `dataType?` | `NonNullable`\<``"string"`` \| ``"number"`` \| ``"boolean"``\> | The expected data type of the response. Must be one of 'string', 'number', or 'boolean'. |
| `dataset?` | [`Address`](modules.md#address) | Address of the dataset associated with the request (optional). |
| `headers?` | `object` | Additional headers to include in the request (optional). |
| `method` | `NonNullable`\<``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"DELETE"``\> | The HTTP method to use for the request. Must be one of 'GET', 'POST', 'PUT', or 'DELETE'. |
| `targetBlockchains?` | `number`[] | Array of blockchain IDs specifying the target blockchains for the oracle request (optional). |
| `url` | `string` | The URL of the endpoint to query for data. |

___

### ReadOracleParams

Ƭ **ReadOracleParams**: `Object`

Parameters for reading data from an oracle.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataType?` | `string` | The expected data type of the response (optional). If provided, this will override the data type specified in the `paramSetOrCidOrOracleId`. |
| `ethersProvider` | `Provider` | Ethereum provider used to interact with the blockchain. |
| `ipfsGateway?` | `string` | IPFS gateway URL used to retrieve data from IPFS (optional). If not provided, the default IPFS gateway URL will be used. |
| `oracleContract?` | [`Address`](modules.md#address) | Address of the oracle contract (optional). If not provided, the default oracle contract address will be used. |
| `paramSetOrCidOrOracleId` | [`ParamSet`](modules.md#paramset) \| `string` | Parameter set defining the oracle request, or the CID or ID of a previously created oracle request. |

___

### TaskExecutionMessage

Ƭ **TaskExecutionMessage**: [`TaskTimedOutMessage`](interfaces/internal_.TaskTimedOutMessage.md) \| [`TaskCompletedMessage`](interfaces/internal_.TaskCompletedMessage.md) \| [`TaskUpdatedMessage`](interfaces/internal_.TaskUpdatedMessage.md)

___

### UpdateOracleMessage

Ƭ **UpdateOracleMessage**: [`EnsureParamsMessage`](interfaces/internal_.EnsureParamsMessage.md) \| [`EnsureParamsUploadMessage`](interfaces/internal_.EnsureParamsUploadMessage.md) \| [`EnsureParamsSuccessMessage`](interfaces/internal_.EnsureParamsSuccessMessage.md) \| [`FetchAppOrderMessage`](interfaces/internal_.FetchAppOrderMessage.md) \| [`FetchAppOrderSuccessMessage`](interfaces/internal_.FetchAppOrderSuccessMessage.md) \| [`FetchDatasetOrderMessage`](interfaces/internal_.FetchDatasetOrderMessage.md) \| [`FetchDatasetOrderSuccessMessage`](interfaces/internal_.FetchDatasetOrderSuccessMessage.md) \| [`FetchWorkerpoolOrderMessage`](interfaces/internal_.FetchWorkerpoolOrderMessage.md) \| [`FetchWorkerpoolOrderSuccessMessage`](interfaces/internal_.FetchWorkerpoolOrderSuccessMessage.md) \| [`RequestOrderSignatureSignRequestMessage`](interfaces/internal_.RequestOrderSignatureSignRequestMessage.md) \| [`RequestOrderSignatureSuccessMessage`](interfaces/internal_.RequestOrderSignatureSuccessMessage.md) \| [`MatchOrdersSignTxRequestMessage`](interfaces/internal_.MatchOrdersSignTxRequestMessage.md) \| [`MatchOrdersSuccessMessage`](interfaces/internal_.MatchOrdersSuccessMessage.md) \| [`TaskUpdatedMessage`](interfaces/internal_.TaskUpdatedMessage.md) \| [`UpdateTaskCompletedMessage`](interfaces/internal_.UpdateTaskCompletedMessage.md)

___

### UpdateOracleOptions

Ƭ **UpdateOracleOptions**: `Object`

Options for updating an oracle.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `iexec?` | `IExec` | (Optional) iExec instance used for oracle update. |
| `ipfsGateway?` | `string` | (Optional) IPFS gateway URL used for update an oracle oracle. |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) | (Optional) Address or ENS (Ethereum Name Service) name of oracleFactory application. |
| `oracleContract` | [`Address`](modules.md#address) | Address of the oracle contract to be updated. |
| `workerpool?` | [`AddressOrENS`](modules.md#addressorens) | (Optional) Address or ENS (Ethereum Name Service) name of the workerpool. |

___

### UpdateOracleParams

Ƭ **UpdateOracleParams**: `Object`

Parameters required to update an oracle.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `iexec` | `any` | - |
| `ipfsGateway?` | `string` | (Optional) IPFS gateway URL used for the update operation. |
| `ipfsUploadUrl?` | `string` | (Optional) IPFS upload URL used for the update operation. |
| `oracleApp?` | `any` | (Optional) Address or ENS (Ethereum Name Service) name of the oracle application. |
| `oracleContract?` | `any` | (Optional) Address of oracleFactory contract. |
| `paramSetOrCid` | [`ParamSet`](modules.md#paramset) \| `string` | Parameter set or CID (Content Identifier) identifying the oracle to be updated. |
| `workerpool?` | `any` | (Optional) Address or ENS (Ethereum Name Service) name of the workerpool. |

___

### Web3ReadOnlyProvider

Ƭ **Web3ReadOnlyProvider**: `AbstractProvider`

___

### Web3SignerProvider

Ƭ **Web3SignerProvider**: `EnhancedWallet`

## Functions

### getWeb3Provider

▸ **getWeb3Provider**(`privateKey`): `EnhancedWallet`

#### Parameters

| Name | Type |
| :------ | :------ |
| `privateKey` | `string` |

#### Returns

`EnhancedWallet`
