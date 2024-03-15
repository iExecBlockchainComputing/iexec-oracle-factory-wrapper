[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / \<internal\>

# Module: \<internal\>

## Table of contents

### Classes

- [Observable](../classes/internal_.Observable.md)

### Interfaces

- [ComputeOracleIDMessage](../interfaces/internal_.ComputeOracleIDMessage.md)
- [CreateParamSetMessage](../interfaces/internal_.CreateParamSetMessage.md)
- [DeployDatasetMessage](../interfaces/internal_.DeployDatasetMessage.md)
- [EnsureParamsMessage](../interfaces/internal_.EnsureParamsMessage.md)
- [EnsureParamsSuccessMessage](../interfaces/internal_.EnsureParamsSuccessMessage.md)
- [EnsureParamsUploadMessage](../interfaces/internal_.EnsureParamsUploadMessage.md)
- [FetchAppOrderMessage](../interfaces/internal_.FetchAppOrderMessage.md)
- [FetchAppOrderSuccessMessage](../interfaces/internal_.FetchAppOrderSuccessMessage.md)
- [FetchDatasetOrderMessage](../interfaces/internal_.FetchDatasetOrderMessage.md)
- [FetchDatasetOrderSuccessMessage](../interfaces/internal_.FetchDatasetOrderSuccessMessage.md)
- [FetchWorkerpoolOrderMessage](../interfaces/internal_.FetchWorkerpoolOrderMessage.md)
- [FetchWorkerpoolOrderSuccessMessage](../interfaces/internal_.FetchWorkerpoolOrderSuccessMessage.md)
- [GetParamSetOptions](../interfaces/internal_.GetParamSetOptions.md)
- [MatchOrdersSignTxRequestMessage](../interfaces/internal_.MatchOrdersSignTxRequestMessage.md)
- [MatchOrdersSuccessMessage](../interfaces/internal_.MatchOrdersSuccessMessage.md)
- [ParamSetResult](../interfaces/internal_.ParamSetResult.md)
- [RequestOrderSignatureSignRequestMessage](../interfaces/internal_.RequestOrderSignatureSignRequestMessage.md)
- [RequestOrderSignatureSuccessMessage](../interfaces/internal_.RequestOrderSignatureSuccessMessage.md)
- [TaskUpdatedMessage](../interfaces/internal_.TaskUpdatedMessage.md)
- [UpdateTaskCompletedMessage](../interfaces/internal_.UpdateTaskCompletedMessage.md)
- [UploadParamSetMessage](../interfaces/internal_.UploadParamSetMessage.md)

### Type Aliases

- [CreateOracleMessage](internal_.md#createoraclemessage)
- [ENS](internal_.md#ens)
- [ObservableComplete](internal_.md#observablecomplete)
- [ObservableError](internal_.md#observableerror)
- [ObservableNext](internal_.md#observablenext)
- [Observer](internal_.md#observer)
- [ParamsBase](internal_.md#paramsbase)
- [UpdateOracleMessage](internal_.md#updateoraclemessage)

## Type Aliases

### CreateOracleMessage

Ƭ **CreateOracleMessage**: [`DeployDatasetMessage`](../interfaces/internal_.DeployDatasetMessage.md) \| [`CreateParamSetMessage`](../interfaces/internal_.CreateParamSetMessage.md) \| [`ComputeOracleIDMessage`](../interfaces/internal_.ComputeOracleIDMessage.md) \| [`UploadParamSetMessage`](../interfaces/internal_.UploadParamSetMessage.md)

___

### ENS

Ƭ **ENS**: `string`

Ethereum Name Service (ENS) name.

___

### ObservableComplete

Ƭ **ObservableComplete**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

___

### ObservableError

Ƭ **ObservableError**: (`e`: `Error`) => `void`

#### Type declaration

▸ (`e`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `Error` |

##### Returns

`void`

___

### ObservableNext

Ƭ **ObservableNext**\<`DataMessageType`\>: (`data`: `DataMessageType`) => `void`

#### Type parameters

| Name |
| :------ |
| `DataMessageType` |

#### Type declaration

▸ (`data`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `DataMessageType` |

##### Returns

`void`

___

### Observer

Ƭ **Observer**\<`DataMessageType`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `DataMessageType` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `complete` | [`ObservableComplete`](internal_.md#observablecomplete) |
| `error` | [`ObservableError`](internal_.md#observableerror) |
| `next` | [`ObservableNext`](internal_.md#observablenext)\<`DataMessageType`\> |

___

### ParamsBase

Ƭ **ParamsBase**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `JSONPath` | `string` | Path to the data in the JSON response of the API. |
| `body?` | `string` | HTTP request body. |
| `dataType` | [`DataType`](../modules.md#datatype) | Type of data to get from the response of the API. |
| `headers?` | `Record`\<`string`, `string`\> | HTTP request headers. |
| `method` | ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"DELETE"`` | HTTP method. |
| `url` | `string` | API url. |

___

### UpdateOracleMessage

Ƭ **UpdateOracleMessage**: [`EnsureParamsMessage`](../interfaces/internal_.EnsureParamsMessage.md) \| [`EnsureParamsUploadMessage`](../interfaces/internal_.EnsureParamsUploadMessage.md) \| [`EnsureParamsSuccessMessage`](../interfaces/internal_.EnsureParamsSuccessMessage.md) \| [`FetchAppOrderMessage`](../interfaces/internal_.FetchAppOrderMessage.md) \| [`FetchAppOrderSuccessMessage`](../interfaces/internal_.FetchAppOrderSuccessMessage.md) \| [`FetchDatasetOrderMessage`](../interfaces/internal_.FetchDatasetOrderMessage.md) \| [`FetchDatasetOrderSuccessMessage`](../interfaces/internal_.FetchDatasetOrderSuccessMessage.md) \| [`FetchWorkerpoolOrderMessage`](../interfaces/internal_.FetchWorkerpoolOrderMessage.md) \| [`FetchWorkerpoolOrderSuccessMessage`](../interfaces/internal_.FetchWorkerpoolOrderSuccessMessage.md) \| [`RequestOrderSignatureSignRequestMessage`](../interfaces/internal_.RequestOrderSignatureSignRequestMessage.md) \| [`RequestOrderSignatureSuccessMessage`](../interfaces/internal_.RequestOrderSignatureSuccessMessage.md) \| [`MatchOrdersSignTxRequestMessage`](../interfaces/internal_.MatchOrdersSignTxRequestMessage.md) \| [`MatchOrdersSuccessMessage`](../interfaces/internal_.MatchOrdersSuccessMessage.md) \| [`TaskUpdatedMessage`](../interfaces/internal_.TaskUpdatedMessage.md) \| [`UpdateTaskCompletedMessage`](../interfaces/internal_.UpdateTaskCompletedMessage.md)
