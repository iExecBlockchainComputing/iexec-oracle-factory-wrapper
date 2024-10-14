[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / SafeObserver

# Class: SafeObserver\<DataMessageType\>

## Type Parameters

• **DataMessageType**

## Constructors

### new SafeObserver()

> **new SafeObserver**\<`DataMessageType`\>(`destination`): [`SafeObserver`](SafeObserver.md)\<`DataMessageType`\>

#### Parameters

• **destination**: `any`

#### Returns

[`SafeObserver`](SafeObserver.md)\<`DataMessageType`\>

## Properties

### destination

> **destination**: `any`

***

### isUnsubscribed

> **isUnsubscribed**: `boolean` = `false`

***

### unsub

> **unsub**: `any`

## Methods

### complete()

> **complete**(): `void`

#### Returns

`void`

***

### error()

> **error**(`err`): `void`

#### Parameters

• **err**: `Error`

#### Returns

`void`

***

### next()

> **next**(`value`): `void`

#### Parameters

• **value**: `DataMessageType`

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(): `void`

#### Returns

`void`
