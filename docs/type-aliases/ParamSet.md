[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / ParamSet

# Type Alias: ParamSet

> **ParamSet**: [`ParamsBase`](../-internal-/type-aliases/ParamsBase.md) & `object`

Oracle set of parameters for fetching the data from an API.

## Type declaration

### dataset?

> `optional` **dataset**: [`Address`](Address.md)

Address of the encrypted dataset containing the secret API key to use for the oracle call.

The API key will replace any occurrence of the `%API_KEY%` placeholder in the `url`, `headers` and `body`.
