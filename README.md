# iexec-oracle-factory-wrapper

A wrapper to build web2.0 API based oracles for Ethereum on the top of iExec

## API

### \[Constructor\] IExecOracleFactory({ ethProvider: Web3|Signer, chainId: "1"|"5" }, { ipfsGateway: String }) => oracleFactory:Object

#### factory.createOracle(rawParams) => Observable

messages :

- \[optional - API key only\] ENCRYPTION_KEY_CREATED (key: String)
- \[optional - API key only\] FILE_ENCRYPTED (encryptedFile: Buffer, checksum: String)
- \[optional - API key only\] ENCRYPTED_FILE_UPLOADED (cid: String, multiaddr: String)
- \[optional - API key only\] DATASET_DEPLOYMENT_SIGN_TX_REQUEST
- \[optional - API key only\] DATASET_DEPLOYMENT_SUCCESS (address: String, txHash: String)
- \[optional - API key only\] PUSH_SECRET_TO_SMS_SIGN_REQUEST
- \[optional - API key only\] PUSH_SECRET_TO_SMS_SUCCESS
- \[optional - API key only\] DATASET_ORDER_SIGNATURE_SIGN_REQUEST (order: Object)
- \[optional - API key only\] DATASET_ORDER_SIGNATURE_SUCCESS (order: Object)
- \[optional - API key only\] DATASET_ORDER_PUBLISH_SIGN_REQUEST (order: Object)
- \[optional - API key only\] DATASET_ORDER_PUBLISH_SUCCESS (orderHash: String)
- PARAMS_SET_CREATED (paramSet: String)
- ORACLE_ID_COMPUTED (oracleId: String)
- PARAMS_SET_UPLOADED (cid: String)
- COMPLETED

#### factory.readOracle(paramSet|ipfsCid|oracleId [, { dataType }]) => Promise\<value: String\>

#### factory.updateOracle(paramSet|ipfsCid [, { workerpool }]) => Observable

messages :

- ENSURE_PARAMS
- ENSURE_PARAMS_SUCCESS (paramSet: Object, cid: String)
- FETCH_APP_ORDER
- FETCH_APP_ORDER_SUCCESS (order: Object)
- FETCH_DATASET_ORDER
- FETCH_DATASET_ORDER_SUCCESS (order: Object)
- FETCH_WORKERPOOL_ORDER
- FETCH_WORKERPOOL_ORDER_SUCCESS (order: Object)
- REQUEST_ORDER_SIGNATURE_SIGN_REQUEST (order: Object)
- REQUEST_ORDER_SIGNATURE_SUCCESS (order: Object)
- MATCH_ORDERS_SIGN_TX_REQUEST (apporder: Object, datasetorder: Object, workerpoolorder: Object, requestorder: Object)
- MATCH_ORDERS_SUCCESS (dealid: String, txHash: String)
- TASK_UPDATED (dealid: String, taskid: String, status: String)
- TASK_COMPLETED

### utils

#### utils.computeOracleKey(paramSet|ipfsCid) => Promise\<oracleKey: String\>

#### utils.testRawParams(rawParams) => Promise\<value: String\>

#### utils.getSignerFromPrivateKey(host, privateKey) => signer:Signer

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
