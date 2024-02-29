[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / IExecOracleReader

# Class: IExecOracleReader

Oracle Reader that interacts with iExec Oracle.

## Table of contents

### Constructors

- [constructor](IExecOracleReader.md#constructor)

### Properties

- [ethersProvider](IExecOracleReader.md#ethersprovider)
- [ipfsGateway](IExecOracleReader.md#ipfsgateway)
- [oracleContract](IExecOracleReader.md#oraclecontract)

### Methods

- [readOracle](IExecOracleReader.md#readoracle)

## Constructors

### constructor

• **new IExecOracleReader**(`ethProviderOrNetwork?`, `options?`): [`IExecOracleReader`](IExecOracleReader.md)

Creates an instance of IExecOracleReader.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `ethProviderOrNetwork?` | `string` \| `number` \| `EnhancedWallet` \| `AbstractProvider` \| `Eip1193Provider` | `134` | Ethereum provider, chainId or network name. |
| `options?` | [`OracleReaderOptions`](../modules.md#oraclereaderoptions) | `undefined` | Options for the Oracle Reader. |

#### Returns

[`IExecOracleReader`](IExecOracleReader.md)

## Properties

### ethersProvider

• `Private` **ethersProvider**: `Provider`

Ethereum provider.

___

### ipfsGateway

• `Private` **ipfsGateway**: `string`

IPFS gateway URL.

___

### oracleContract

• `Private` **oracleContract**: `string`

Ethereum contract address or ENS (Ethereum Name Service) for the oracle contract.

## Methods

### readOracle

▸ **readOracle**(`paramSetOrCidOrOracleId`, `dataType?`): `Promise`\<[`OracleValue`](../modules.md#oraclevalue)\>

Reads data from the oracle.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paramSetOrCidOrOracleId` | `string` \| [`ParamSet`](../modules.md#paramset) | Parameters or CID or Oracle ID of the oracle to read. |
| `dataType?` | [`DataType`](../modules.md#datatype) | Data type to read from the oracle. |

#### Returns

`Promise`\<[`OracleValue`](../modules.md#oraclevalue)\>

Promise that resolves to the read oracle data.
