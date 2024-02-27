[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / IExecOracleFactory

# Class: IExecOracleFactory

IExecOracleFactory, used to interact with oracle creation, update, and read operations.

## Table of contents

### Constructors

- [constructor](IExecOracleFactory.md#constructor)

### Properties

- [ethersProviderPromise](IExecOracleFactory.md#ethersproviderpromise)
- [iexec](IExecOracleFactory.md#iexec)
- [ipfsGateway](IExecOracleFactory.md#ipfsgateway)
- [ipfsNode](IExecOracleFactory.md#ipfsnode)
- [oracleApp](IExecOracleFactory.md#oracleapp)
- [oracleContract](IExecOracleFactory.md#oraclecontract)
- [workerpool](IExecOracleFactory.md#workerpool)

### Methods

- [createOracle](IExecOracleFactory.md#createoracle)
- [getIExec](IExecOracleFactory.md#getiexec)
- [readOracle](IExecOracleFactory.md#readoracle)
- [updateOracle](IExecOracleFactory.md#updateoracle)

## Constructors

### constructor

• **new IExecOracleFactory**(`ethProvider`, `options?`): [`IExecOracleFactory`](IExecOracleFactory.md)

Creates an instance of IExecOracleFactory.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ethProvider` | `EnhancedWallet` \| `Eip1193Provider` | The Ethereum provider used to interact with the blockchain. |
| `options?` | [`OracleFactoryOptions`](../modules.md#oraclefactoryoptions) | Optional configuration options OracleFactory. |

#### Returns

[`IExecOracleFactory`](IExecOracleFactory.md)

## Properties

### ethersProviderPromise

• `Private` **ethersProviderPromise**: `Promise`\<`Provider`\>

___

### iexec

• `Private` **iexec**: `default`

___

### ipfsGateway

• `Private` **ipfsGateway**: `string`

___

### ipfsNode

• `Private` **ipfsNode**: `string`

___

### oracleApp

• `Private` **oracleApp**: `string`

___

### oracleContract

• `Private` **oracleContract**: `string`

___

### workerpool

• `Private` **workerpool**: `string`

## Methods

### createOracle

▸ **createOracle**(`rawParams`): [`Observable`](internal_.Observable.md)\<[`CreateOracleMessage`](../modules/internal_.md#createoraclemessage)\>

Creates a new oracle with the provided parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rawParams` | [`RawParams`](../modules.md#rawparams) | [RawParams](../modules.md#rawparams) for creating the oracle. |

#### Returns

[`Observable`](internal_.Observable.md)\<[`CreateOracleMessage`](../modules/internal_.md#createoraclemessage)\>

Observable [CreateOracleMessage](../modules/internal_.md#createoraclemessage) result of the creation operation.

___

### getIExec

▸ **getIExec**(): `default`

Gets the current instance of the IExec interface.

#### Returns

`default`

Current instance of IExec.

___

### readOracle

▸ **readOracle**(`paramSetOrCidOrOracleId`, `dataType?`): `Promise`\<[`OracleValue`](../modules.md#oraclevalue)\>

Reads an oracle with the provided ID CID or Oracle ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paramSetOrCidOrOracleId` | `string` \| [`ParamSet`](../modules.md#paramset) | Parameters, CID or Oracle ID to read. |
| `dataType?` | [`DataType`](../modules.md#datatype) | Optional data type for reading the oracle. |

#### Returns

`Promise`\<[`OracleValue`](../modules.md#oraclevalue)\>

Promise resolving to the oracle data.

___

### updateOracle

▸ **updateOracle**(`paramSetOrCid`, `options?`): [`Observable`](internal_.Observable.md)\<[`UpdateOracleMessage`](../modules/internal_.md#updateoraclemessage)\>

Updates an existing oracle with new parameters or a new CID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paramSetOrCid` | `string` \| [`ParamSet`](../modules.md#paramset) | Parameters or CID of the oracle to update. |
| `options?` | `Object` | Update options. |
| `options.targetBlockchains?` | `number`[] | Chain ID of target blockchains for cross-chain update. |
| `options.workerpool?` | `string` | workerpool to use for the update |

#### Returns

[`Observable`](internal_.Observable.md)\<[`UpdateOracleMessage`](../modules/internal_.md#updateoraclemessage)\>

Observable result of the update operation.
