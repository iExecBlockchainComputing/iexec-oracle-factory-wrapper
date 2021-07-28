# iexec-oracle-factory-wrapper

A wrapper to build web2.0 API based oracles for Ethereum on the top of iExec

## API

### IExecOracleFactory Constructor

**new IExecOracleFactory(ethProvider: Web3|Signer \[, { ipfsGateway: String, oracleApp: String, oracleContract: String, iexecOptions: Object }\]) => IExecOracleFactory**

_Options:_

- ipfsGateway: URL of a custom gateway to retrieve IPFS content (used to check data availability locally and to download the data during computation)
- oracleApp: address of a custom oracle application
- oracleContract: address of custom oracle smart contract
- iexecOptions: custom options for iExec SDK (see [SDK documentation](https://github.com/iExecBlockchainComputing/iexec-sdk#instanciate-the-iexec-sdk))

_Browser Example:_

```js
import { IExecOracleFactory } from '@iexec/iexec-oracle-factory-wrapper';

const getOracleFactory = async () => {
  if (!window.ethereum) {
    throw Error('Need to install MetaMask');
  }
  try {
    await window.ethereum.enable();
  } catch (error) {
    throw Error('User denied access', error);
  }
  return new IExecOracleFactory(window.ethereum);
};
```

_NodeJS Exemple:_

```js
const {
  IExecOracleFactory,
  utils,
} = require('@iexec/iexec-oracle-factory-wrapper');

const signer = utils.getSignerFromPrivateKey('goerli', process.env.PRIVATE_KEY);
const factory = new IExecOracleFactory(signer);
```

#### Create Oracle

> Create an oracle from an API using `rawParams`.

```ts
rawParams: {
  url:String;
  method:'GET'|'POST'|'PUT'|'DELETE';
  headers:Map<String,String>;
  body:?String;
  apiKey:?String;
  JSONPath:String;
  dataType:'boolean'|'number'|'string';
}
```

> _NB:_ Use `%API_KEY%` placeholder in `url` or `headers` to inject `apiKey` (the apiKey will be secured in an encrypted iExec Dataset).
> _NB:_ You may want to call `utils.testRawParams(rawParams)` to test the `rawParams` returned value before creating an oracle.

factory.**createOracle(rawParams)** => Observable < **{ subscribe: Function({ next: Function({ message: String, ...additionalEntries }), error: Function(Error), complete: Function() }) => cancel: Function() }** >

> This method returns a cold Observable.
> Calling the `subscribe({next, error, complete})` method on the observable will immediately return a cancel `function()` and start the asynchronous oracle creation process.
> The `next` callback is called on every process step with a `message` and additional pieces of data, the values are described in the following table.
> The `error` callback is called when an error occurs, the observable process is also canceled.
> The `complete` callback is called when the process ends without error.
> Calling the cancel `function()` will stop the observed process and prevent any further callback call.

| message                              | sent                 | additional entries                          |
| ------------------------------------ | -------------------- | ------------------------------------------- |
| ENCRYPTION_KEY_CREATED               | once if using apiKey | key: String                                 |
| FILE_ENCRYPTED                       | once if using apiKey | encryptedFile: Buffer<br/> checksum: String |
| ENCRYPTED_FILE_UPLOADED              | once if using apiKey | cid: String<br/> multiaddr: String          |
| DATASET_DEPLOYMENT_SIGN_TX_REQUEST   | once if using apiKey |                                             |
| DATASET_DEPLOYMENT_SUCCESS           | once if using apiKey | address: String<br/> txHash: String         |
| PUSH_SECRET_TO_SMS_SIGN_REQUEST      | once if using apiKey |                                             |
| PUSH_SECRET_TO_SMS_SUCCESS           | once if using apiKey |                                             |
| DATASET_ORDER_SIGNATURE_SIGN_REQUEST | once if using apiKey | order: Object                               |
| DATASET_ORDER_SIGNATURE_SUCCESS      | once if using apiKey | order: Object                               |
| DATASET_ORDER_PUBLISH_SIGN_REQUEST   | once if using apiKey | order: Object                               |
| DATASET_ORDER_PUBLISH_SUCCESS        | once if using apiKey | orderHash: String                           |
| PARAM_SET_CREATED                    | once                 | paramSet: String                            |
| ORACLE_ID_COMPUTED                   | once                 | oracleId: String                            |
| PARAM_SET_UPLOADED                   | once                 | cid: String                                 |
| COMPLETED                            | once                 |                                             |

_Exemple:_

```js
let paramSet;
let cid;

factory
  .createOracle({
    url: 'https://foo.io',
    method: 'GET',
    headers: {
      authorization: '%API_KEY%',
    },
    dataType: 'string',
    JSONPath: '$.data',
    apiKey: 'foo',
  })
  .subscribe({
    error: (e) => console.error(e),
    next: (value) => {
      const { message, ...additionalEntries } = value;
      if (message === 'PARAM_SET_CREATED') {
        paramSet = additionalEntries.paramSet;
      }
      if (message === 'PARAM_SET_UPLOADED') {
        cid = additionalEntries.cid;
      }
      console.log(message);
      console.info(JSON.stringify(additionalEntries));
    },
    complete: () => {
      console.log(`Oracle created, paramSet CID is ${cid}!`);
      console.log(`paramSet: "${paramSet}"`);
    },
  });
```

#### Read Oracle

> Read the oracle smart contract current value

factory.**readOracle(paramSet|ipfsCid|oracleId [, { dataType:String }])** => Promise < **{ value: String|Number|Boolean, date: Number }** >

_Options:_

- dataType: use only when reading oracle from oracleId `string`, `number`, `boolean` or `raw` to specify (default `raw` returns hex string)

_NB:_

- this method throws a `NoValueError` if the oracle is not yet updated.

#### Update Oracle

> Update an oracle

factory.**updateOracle(paramSet|ipfsCid [, { workerpool }])** => Observable < **{ subscribe: Function({ next: Function({ message: String, ...additionalEntries }), error: Function(Error), complete: Function() }) => cancel: Function() }** >

> This method returns a cold Observable.
> Calling the `subscribe({next, error, complete})` method on the observable will immediately return a cancel `function()` and start the asynchronous oracle update process.
> The `next` callback is called on every process step with a `message` and additional pieces of data, the values are described in the following table.
> The `error` callback is called when an error occurs, the observable process is also canceled.
> The `complete` callback is called when the process ends without error.
> Calling the cancel `function()` will stop the observed process and prevent any further callback call.

| message                              | sent                  | additional entries                                                                                                         |
| ------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ENSURE_PARAMS                        | once                  |                                                                                                                            |
| ENSURE_PARAMS_SUCCESS                | once                  | paramSet: Object<br/> cid: String                                                                                          |
| FETCH_APP_ORDER                      | once                  |                                                                                                                            |
| FETCH_APP_ORDER_SUCCESS              | once                  | order: Object                                                                                                              |
| FETCH_DATASET_ORDER                  | once if using dataset |                                                                                                                            |
| FETCH_DATASET_ORDER_SUCCESS          | once if using dataset | order: Object                                                                                                              |
| FETCH_WORKERPOOL_ORDER               | once                  |                                                                                                                            |
| FETCH_WORKERPOOL_ORDER_SUCCESS       | once                  | order: Object                                                                                                              |
| REQUEST_ORDER_SIGNATURE_SIGN_REQUEST | once                  | order: Object                                                                                                              |
| REQUEST_ORDER_SIGNATURE_SUCCESS      | once                  | order: Object                                                                                                              |
| MATCH_ORDERS_SIGN_TX_REQUEST         | once                  | apporder: Object<br/> datasetorder: Object<br/> workerpoolorder: Object<br/> requestorder: Object                          |
| MATCH_ORDERS_SUCCESS                 | once                  | dealid: String<br/> txHash: String                                                                                         |
| TASK_UPDATED                         | once per task update  | dealid: String<br/> taskid: String<br/> status: 'UNSET' \| 'ACTIVE' \| 'REVEALING' \| 'COMPLETED' \| 'TIMEOUT' \| 'FAILED' |
| TASK_COMPLETED                       | once                  | dealid: String<br/> taskid: String<br/> status: String                                                                     |

_Exemple:_

```js
factory
  .updateOracle({
    url: 'https://foo.io',
    method: 'GET',
    headers: {
      authorization: '%API_KEY%',
    },
    dataType: 'string',
    JSONPath: '$.data',
    dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
  })
  .subscribe({
    error: (e) => console.error(e),
    next: (value) => {
      const { message, ...additionalEntries } = value;
      console.log(message);
      console.info(JSON.stringify(additionalEntries));
    },
    complete: () => {
      console.log('Update task completed!');
    },
  });
```

### utils

```js
import { utils } from '@iexec/iexec-oracle-factory-wrapper';
// OR
const { utils } = require('@iexec/iexec-oracle-factory-wrapper');
```

#### testRawParams

> Use this method to test the value returned by `rawParams` before creating an oracle with `factory.createOracle(rawParams)`

utils.**testRawParams(rawParams)** => Promise <**result: String|Number|Boolean**>

```js
const result = utils.testRawParams({
  url: 'https://foo.io',
  method: 'GET',
  headers: {
    authorization: '%API_KEY%',
  },
  dataType: 'string',
  JSONPath: '$.data',
  apiKey: 'foo',
});
console.log(`call test returned: ${result} (${typeof result})`);
```

#### getChainDefaults

> Get the default addresses of oracle app and contract for a given chain

utils.**getChainDefaults(chainId: Int)** => **{ ORACLE_APP_ADDRESS: String, ORACLE_CONTRACT_ADDRES: String }** >

#### computeOracleKey

> Get the oracleId to use in smart contracts to consume the oracle

utils.**computeOracleKey(paramSet|ipfsCid)** => Promise < **oracleId: String** >

#### getSignerFromPrivateKey

> Create a Signer suitable for `new IExecOracleFactory(signer)` from a `privateKey` for server-side usage

utils.**getSignerFromPrivateKey(host: String, privateKey: String)** => **signer:Signer**

> _NB:_ set `host` with an RPC node url or a network name.

### errors

```js
import { errors } from '@iexec/iexec-oracle-factory-wrapper';
// OR
const { errors } = require('@iexec/iexec-oracle-factory-wrapper');
```

#### ValidationError

> A `ValidationError` is thrown when an input is not correct

#### WorkflowError

> A `WorkflowError` is thrown when an observable process fails, the original error is accessible via the `originalError` key

#### NoValueError

> A `NoValueError` is thrown when attempting to read an oracle with no stored value (ie: never updated)

## Test in the browser:

```
# build the lib
npm i
npm run build

# run the browser test
cd browser-test
npm i
npm start
```

browse http://localhost:1234

## Development

### Run Tests

```
npm i
npm test
```

### TODO

- Add ORACLE_CONTRACT_ADDRESS when available
- Add ORACLE_APP_ADDRESS when available
- Add ipfs-service tests (add non-jest test script to test ipfs.js)

### Known issues

- install issue with npm@7.6.0 https://github.com/ipfs/js-ipfs/issues/3562
