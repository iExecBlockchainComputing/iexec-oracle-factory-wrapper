[@iexec/iexec-oracle-factory-wrapper](../README.md) / [Exports](../modules.md) / [\<internal\>](../modules/internal_.md) / Observable

# Class: Observable\<DataMessageType\>

[\<internal\>](../modules/internal_.md).Observable

## Type parameters

| Name |
| :------ |
| `DataMessageType` |

## Table of contents

### Constructors

- [constructor](internal_.Observable.md#constructor)

### Properties

- [\_subscribe](internal_.Observable.md#_subscribe)

### Methods

- [subscribe](internal_.Observable.md#subscribe)

## Constructors

### constructor

• **new Observable**\<`DataMessageType`\>(`_subscribe`): [`Observable`](internal_.Observable.md)\<`DataMessageType`\>

#### Type parameters

| Name |
| :------ |
| `DataMessageType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_subscribe` | `any` |

#### Returns

[`Observable`](internal_.Observable.md)\<`DataMessageType`\>

## Properties

### \_subscribe

• `Private` **\_subscribe**: `any`

## Methods

### subscribe

▸ **subscribe**(`observerOrNext`, `error?`, `complete?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observerOrNext` | [`Observer`](../modules/internal_.md#observer)\<`DataMessageType`\> \| [`ObservableNext`](../modules/internal_.md#observablenext)\<`DataMessageType`\> |
| `error?` | [`ObservableError`](../modules/internal_.md#observableerror) |
| `complete?` | [`ObservableComplete`](../modules/internal_.md#observablecomplete) |

#### Returns

`any`
