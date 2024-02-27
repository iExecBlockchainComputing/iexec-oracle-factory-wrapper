[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / utils

# Namespace: utils

## Table of contents

### Functions

- [computeOracleId](utils.md#computeoracleid)
- [getChainDefaults](utils.md#getchaindefaults)
- [getParamSet](utils.md#getparamset)
- [testRawParams](utils.md#testrawparams)

## Functions

### computeOracleId

▸ **computeOracleId**(`paramSetOrCid`, `«destructured»?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `paramSetOrCid` | `any` | `undefined` |
| `«destructured»` | `Object` | `{}` |
| › `ipfsGateway` | `string` | `DEFAULT_IPFS_GATEWAY` |

#### Returns

`Promise`\<`string`\>

___

### getChainDefaults

▸ **getChainDefaults**(`chainId`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `ORACLE_APP_ADDRESS?` | `string` |
| `ORACLE_CONTRACT_ADDRESS?` | `string` |

___

### getParamSet

▸ **getParamSet**(`«destructured»`): `Promise`\<[`ParamSetResult`](../interfaces/internal_.ParamSetResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`GetParamSetOptions`](../interfaces/internal_.GetParamSetOptions.md) |

#### Returns

`Promise`\<[`ParamSetResult`](../interfaces/internal_.ParamSetResult.md)\>

___

### testRawParams

▸ **testRawParams**(`rawParams`): `Promise`\<`string` \| `number` \| `boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawParams` | [`RawParams`](../modules.md#rawparams) |

#### Returns

`Promise`\<`string` \| `number` \| `boolean`\>
