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
- [ipfsUploadUrl](IExecOracleFactory.md#ipfsuploadurl)
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

### ipfsUploadUrl

• `Private` **ipfsUploadUrl**: `string`

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

▸ **createOracle**(`args`): [`Observable`](internal_.Observable.md)\<[`CreateOracleMessage`](../modules.md#createoraclemessage)\>

Creates a new oracle with the provided parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ParamSet`](../modules.md#paramset) | [ParamSet](../modules.md#paramset) for creating the oracle. |

#### Returns

[`Observable`](internal_.Observable.md)\<[`CreateOracleMessage`](../modules.md#createoraclemessage)\>

Observable [CreateOracleMessage](../modules.md#createoraclemessage) result of the creation operation.

___

### getIExec

▸ **getIExec**(): `default`

Gets the current instance of the IExec interface.

#### Returns

`default`

Current instance of IExec.

___

### readOracle

▸ **readOracle**(`paramSetOrCidOrOracleId`, `dataType?`): `Promise`\<[`Oracle`](../modules.md#oracle)\>

Reads an oracle with the provided ID CID or Oracle ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paramSetOrCidOrOracleId` | `string` \| [`ParamSet`](../modules.md#paramset) | The ID CID or Oracle ID to read. |
| `dataType?` | `string` | Optional data type for reading the oracle. |

#### Returns

`Promise`\<[`Oracle`](../modules.md#oracle)\>

Promise resolving to the oracle data.

___

### updateOracle

▸ **updateOracle**(`args`): [`Observable`](internal_.Observable.md)\<[`UpdateOracleMessage`](../modules.md#updateoraclemessage)\>

Updates an existing oracle with new parameters or a new CID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `string` \| [`ParamSet`](../modules.md#paramset) | [ParamSet](../modules.md#paramset) or CID for updating the oracle. |

#### Returns

[`Observable`](internal_.Observable.md)\<[`UpdateOracleMessage`](../modules.md#updateoraclemessage)\>

Observable result of the update operation.
