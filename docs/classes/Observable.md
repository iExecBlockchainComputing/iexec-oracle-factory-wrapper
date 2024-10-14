[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / Observable

# Class: Observable\<DataMessageType\>

## Type Parameters

• **DataMessageType**

## Constructors

### new Observable()

> **new Observable**\<`DataMessageType`\>(`_subscribe`): [`Observable`](Observable.md)\<`DataMessageType`\>

#### Parameters

• **\_subscribe**: `any`

#### Returns

[`Observable`](Observable.md)\<`DataMessageType`\>

## Methods

### subscribe()

> **subscribe**(`observerOrNext`, `error`?, `complete`?): `any`

#### Parameters

• **observerOrNext**: [`Observer`](../type-aliases/Observer.md)\<`DataMessageType`\> \| [`ObservableNext`](../type-aliases/ObservableNext.md)\<`DataMessageType`\>

• **error?**: [`ObservableError`](../type-aliases/ObservableError.md)

• **complete?**: [`ObservableComplete`](../type-aliases/ObservableComplete.md)

#### Returns

`any`
