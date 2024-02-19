[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / IExecOracleReader

# Class: IExecOracleReader

Oracle Reader that interacts with iExec Oracle.

## Table of contents

### Constructors

- [constructor](IExecOracleReader.md#constructor)

### Properties

- [ethersProvider](IExecOracleReader.md#ethersprovider)
- [iexec](IExecOracleReader.md#iexec)
- [ipfsGateway](IExecOracleReader.md#ipfsgateway)
- [oracleContract](IExecOracleReader.md#oraclecontract)

### Methods

- [getIExec](IExecOracleReader.md#getiexec)
- [readOracle](IExecOracleReader.md#readoracle)

## Constructors

### constructor

• **new IExecOracleReader**(`ethProviderOrNetwork?`, `options?`, `providerOptions?`): [`IExecOracleReader`](IExecOracleReader.md)

Creates an instance of IExecOracleReader.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `ethProviderOrNetwork?` | `string` \| `number` \| `EnhancedWallet` \| `AbstractProvider` \| `Eip1193Provider` | `134` | Ethereum provider, chainId or network name. |
| `options?` | [`OracleReaderOptions`](../modules.md#oraclereaderoptions) | `undefined` | Options for the Oracle Reader. |
| `providerOptions?` | `any` | `undefined` | Options for the provider. |

#### Returns

[`IExecOracleReader`](IExecOracleReader.md)

## Properties

### ethersProvider

• `Private` **ethersProvider**: `Provider`

Ethereum provider.

___

### iexec

• `Private` **iexec**: `default`

___

### ipfsGateway

• `Private` **ipfsGateway**: `string`

IPFS gateway URL.

___

### oracleContract

• `Private` **oracleContract**: `string`

Ethereum contract address or ENS (Ethereum Name Service) for the oracle contract.

## Methods

### getIExec

▸ **getIExec**(): `default`

Gets the instance of IExec.

#### Returns

`default`

___

### readOracle

▸ **readOracle**(`paramSetOrCidOrOracleId`, `dataType?`): `Promise`\<[`Oracle`](../modules.md#oracle)\>

Reads data from the oracle.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paramSetOrCidOrOracleId` | `string` \| [`ParamSet`](../modules.md#paramset) | Parameters or CID or Oracle ID for reading data from the oracle. |
| `dataType?` | `string` | Data type to read from the oracle. |

#### Returns

`Promise`\<[`Oracle`](../modules.md#oracle)\>

Promise that resolves to the read oracle data.
