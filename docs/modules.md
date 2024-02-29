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
- [DataType](modules.md#datatype)
- [OracleFactoryOptions](modules.md#oraclefactoryoptions)
- [OracleID](modules.md#oracleid)
- [OracleReaderOptions](modules.md#oraclereaderoptions)
- [OracleValue](modules.md#oraclevalue)
- [ParamSet](modules.md#paramset)
- [ParamSetCID](modules.md#paramsetcid)
- [RawParams](modules.md#rawparams)
- [ReadOracleOptions](modules.md#readoracleoptions)
- [ReadOracleParams](modules.md#readoracleparams)
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

### DataType

Ƭ **DataType**: ``"boolean"`` \| ``"string"`` \| ``"number"`` \| ``"raw"``

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

### OracleID

Ƭ **OracleID**: `string`

Oracle ID computed from the ParamSet of the oracle.

The OracleID is unique for each ParamSet.

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

### OracleValue

Ƭ **OracleValue**: `Object`

Response from an oracle query.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `date` | `number` |
| `value` | `boolean` \| `string` \| `number` |

___

### ParamSet

Ƭ **ParamSet**: [`ParamsBase`](modules/internal_.md#paramsbase) & \{ `dataset?`: [`Address`](modules.md#address)  }

Oracle set of parameters for fetching the data from an API.

___

### ParamSetCID

Ƭ **ParamSetCID**: `string`

CID of a ParamSet uploaded on IPFS.

The CID is unique for each ParamSet.

___

### RawParams

Ƭ **RawParams**: [`ParamsBase`](modules/internal_.md#paramsbase) & \{ `apiKey?`: `string`  }

Raw parameters for fetching the data from an API.

___

### ReadOracleOptions

Ƭ **ReadOracleOptions**: `Object`

Options for reading data from an oracle.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ipfsGateway?` | `string` |
| `oracleContract?` | [`Address`](modules.md#address) |

___

### ReadOracleParams

Ƭ **ReadOracleParams**: `Object`

Parameters for reading data from an oracle.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataType?` | [`DataType`](modules.md#datatype) | Type of data to read. |
| `paramSetOrCidOrOracleId` | [`ParamSet`](modules.md#paramset) \| [`ParamSetCID`](modules.md#paramsetcid) \| [`OracleID`](modules.md#oracleid) | Identifier of the oracle to read. |

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
