[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / IExecOracleFactory

# Class: IExecOracleFactory

IExecOracleFactory, used to interact with oracle creation, update, and read operations.

## Constructors

### new IExecOracleFactory()

> **new IExecOracleFactory**(`ethProvider`, `options`?): [`IExecOracleFactory`](IExecOracleFactory.md)

Creates an instance of IExecOracleFactory.

#### Parameters

• **ethProvider**: `EnhancedWallet` \| `Eip1193Provider` \| `AbstractSigner`\<`Provider`\> \| `BrowserProvider`

The Ethereum provider used to interact with the blockchain.

• **options?**: [`OracleFactoryOptions`](../type-aliases/OracleFactoryOptions.md)

Optional configuration options OracleFactory.

#### Returns

[`IExecOracleFactory`](IExecOracleFactory.md)

## Methods

### createOracle()

> **createOracle**(`rawParams`): [`Observable`](Observable.md)\<[`CreateOracleMessage`](../type-aliases/CreateOracleMessage.md)\>

Creates a new oracle with the provided parameters.

#### Parameters

• **rawParams**: [`RawParams`](../type-aliases/RawParams.md)

[RawParams](../type-aliases/RawParams.md) for creating the oracle.

#### Returns

[`Observable`](Observable.md)\<[`CreateOracleMessage`](../type-aliases/CreateOracleMessage.md)\>

Observable [CreateOracleMessage](../type-aliases/CreateOracleMessage.md) result of the creation operation.

***

### getIExec()

> **getIExec**(): `IExec`

Gets the current instance of the IExec interface.

#### Returns

`IExec`

Current instance of IExec.

***

### readOracle()

> **readOracle**(`paramSetOrCidOrOracleId`, `options`?): `Promise`\<[`OracleValue`](../type-aliases/OracleValue.md)\>

Reads an oracle with the provided ID CID or Oracle ID.

#### Parameters

• **paramSetOrCidOrOracleId**: `string` \| [`ParamSet`](../type-aliases/ParamSet.md)

Parameters, CID or Oracle ID to read.

• **options?**

Options for reading the oracle.

• **options.dataType?**: [`DataType`](../type-aliases/DataType.md)

#### Returns

`Promise`\<[`OracleValue`](../type-aliases/OracleValue.md)\>

Promise resolving to the oracle data.

***

### updateOracle()

> **updateOracle**(`paramSetOrCid`, `options`?): [`Observable`](Observable.md)\<[`UpdateOracleMessage`](../type-aliases/UpdateOracleMessage.md)\>

Updates an existing oracle with new parameters or a new CID.

#### Parameters

• **paramSetOrCid**: `string` \| [`ParamSet`](../type-aliases/ParamSet.md)

Parameters or CID of the oracle to update.

• **options?**

Update options.

• **options.targetBlockchains?**: `number`[]

Chain ID of target blockchains for cross-chain update.

• **options.workerpool?**: `string`

workerpool to use for the update

#### Returns

[`Observable`](Observable.md)\<[`UpdateOracleMessage`](../type-aliases/UpdateOracleMessage.md)\>

Observable result of the update operation.
