[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / IExecOracleReader

# Class: IExecOracleReader

Oracle Reader that interacts with iExec Oracle.

## Constructors

### new IExecOracleReader()

> **new IExecOracleReader**(`ethProviderOrNetwork`?, `options`?): [`IExecOracleReader`](IExecOracleReader.md)

Creates an instance of IExecOracleReader.

#### Parameters

• **ethProviderOrNetwork?**: `string` \| `number` \| `EnhancedWallet` \| `AbstractProvider` \| `Eip1193Provider` = `134`

Ethereum provider, chainId or network name.

• **options?**: [`OracleReaderOptions`](../type-aliases/OracleReaderOptions.md)

Options for the Oracle Reader.

#### Returns

[`IExecOracleReader`](IExecOracleReader.md)

## Methods

### readOracle()

> **readOracle**(`paramSetOrCidOrOracleId`, `options`?): `Promise`\<[`OracleValue`](../type-aliases/OracleValue.md)\>

Reads data from the oracle.

#### Parameters

• **paramSetOrCidOrOracleId**: `string` \| [`ParamSet`](../type-aliases/ParamSet.md)

Parameters, CID or Oracle ID to read.

• **options?**

Options for reading the oracle.

• **options.dataType?**: [`DataType`](../type-aliases/DataType.md)

#### Returns

`Promise`\<[`OracleValue`](../type-aliases/OracleValue.md)\>

Promise that resolves to the read oracle data.
