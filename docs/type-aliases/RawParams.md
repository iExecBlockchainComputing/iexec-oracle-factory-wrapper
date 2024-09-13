[**@iexec/iexec-oracle-factory-wrapper**](../README.md) • **Docs**

***

[@iexec/iexec-oracle-factory-wrapper](../globals.md) / RawParams

# Type Alias: RawParams

> **RawParams**: [`ParamsBase`](../-internal-/type-aliases/ParamsBase.md) & `object`

Raw parameters for fetching the data from an API.

## Type declaration

### apiKey?

> `optional` **apiKey**: `string`

Secret API key to use for the oracle call.

The API key will replace any occurrence of the `%API_KEY%` placeholder in the `url`, `headers` and `body`.
