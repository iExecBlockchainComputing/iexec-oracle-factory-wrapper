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
- [CreateOracleOptions](modules.md#createoracleoptions)
- [Oracle](modules.md#oracle)
- [OracleFactoryOptions](modules.md#oraclefactoryoptions)
- [OracleReaderOptions](modules.md#oraclereaderoptions)
- [ParamSet](modules.md#paramset)
- [ReadOracleOptions](modules.md#readoracleoptions)
- [ReadOracleParams](modules.md#readoracleparams)
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

### CreateOracleOptions

Ƭ **CreateOracleOptions**: `Object`

Options for creating an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `iexec?` | `IExec` |
| `ipfsGateway?` | `string` |
| `ipfsNode?` | `string` |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) |

___

### Oracle

Ƭ **Oracle**: `Object`

Response from an oracle query.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `date` | `number` |
| `value` | `boolean` \| `string` \| `number` |

___

### OracleFactoryOptions

Ƭ **OracleFactoryOptions**: `Object`

Configuration options for OracleFactory.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `iexecOptions?` | `IExecConfigOptions` |
| `ipfsGateway?` | `string` |
| `ipfsNode?` | `string` |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) |
| `oracleContract?` | [`AddressOrENS`](modules.md#addressorens) |
| `workerpool?` | [`AddressOrENS`](modules.md#addressorens) |

___

### OracleReaderOptions

Ƭ **OracleReaderOptions**: `Object`

Configuration options for OracleReader.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ipfsGateway?` | `string` |
| `oracleContract?` | [`AddressOrENS`](modules.md#addressorens) |
| `providerOptions?` | `any` |

___

### ParamSet

Ƭ **ParamSet**: `Object`

Set of parameters for an oracle request.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `JSONPath` | `string` |
| `apiKey?` | `string` |
| `body?` | `string` |
| `dataType?` | `NonNullable`\<``"string"`` \| ``"number"`` \| ``"boolean"``\> |
| `dataset?` | [`Address`](modules.md#address) |
| `headers?` | `object` |
| `method` | `NonNullable`\<``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"DELETE"``\> |
| `url` | `string` |

___

### ReadOracleOptions

Ƭ **ReadOracleOptions**: `Object`

Parameters for reading data from an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ethersProvider` | `Provider` |
| `ipfsGateway?` | `string` |
| `oracleContract?` | [`Address`](modules.md#address) |

___

### ReadOracleParams

Ƭ **ReadOracleParams**: `Object`

Parameters for reading data from an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dataType?` | `string` |
| `paramSetOrCidOrOracleId` | [`ParamSet`](modules.md#paramset) \| `string` |

___

### UpdateOracleOptions

Ƭ **UpdateOracleOptions**: `Object`

Options for updating an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `iexec?` | `IExec` |
| `ipfsGateway?` | `string` |
| `oracleApp?` | [`AddressOrENS`](modules.md#addressorens) |
| `oracleContract?` | [`Address`](modules.md#address) |
| `workerpool?` | [`AddressOrENS`](modules.md#addressorens) |

___

### UpdateOracleParams

Ƭ **UpdateOracleParams**: `Object`

Parameters required to update an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `paramSetOrCid` | [`ParamSet`](modules.md#paramset) \| `string` |
| `targetBlockchains?` | `number`[] |

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
