# iexec-oracle-factory-wrapper

A wrapper to build web2.0 API based oracles for Ethereum on the top of iExec

## API

### \[Constructor\] IExecOracleFactory({ ethProvider: Web3|Signer, chainId: "1"|"5" }, { ipfsGateway: String }) => oracleFactory:Object

#### factory.createOracle(rawParams) => Observable

messages :

- \[optional - API key only\] ENCRYPTION_KEY_CREATED (key)
- \[optional - API key only\] FILE_ENCRYPTED (encryptedFile, checksum)
- \[optional - API key only\] ENCRYPTED_FILE_UPLOADED (cid, multiaddr)
- \[optional - API key only\] DATASET_DEPLOYMENT_SIGN_TX_REQUEST
- \[optional - API key only\] DATASET_DEPLOYMENT_SUCCESS (address, txHash)
- \[optional - API key only\] PUSH_SECRET_TO_SMS_SIGN_REQUEST
- \[optional - API key only\] PUSH_SECRET_TO_SMS_SUCCESS
- \[optional - API key only\] DATASET_ORDER_SIGNATURE_SIGN_REQUEST (order)
- \[optional - API key only\] DATASET_ORDER_SIGNATURE_SUCCESS (order)
- \[optional - API key only\] DATASET_ORDER_PUBLISH_SIGN_REQUEST
- \[optional - API key only\] DATASET_ORDER_PUBLISH_SUCCESS (orderHash)
- PARAMS_SET_CREATED (paramsSet)
- ORACLE_ID_COMPUTED (oracleId)
- PARAMS_SET_UPLOADED (cid)
- COMPLETED

#### factory.readOracle(paramsSet|ipfsCid) => Promise\<value: String\>

#### factory.updateOracle(paramsSet|ipfsCid, {workerpool}) => Observable

messages :

- ENSURE_PARAMS
- ENSURE_PARAMS_SUCCESS (paramsSet, cid)
- FETCH_APP_ORDER
- FETCH_APP_ORDER_SUCCESS (order)
- FETCH_DATASET_ORDER
- FETCH_DATASET_ORDER_SUCCESS (order)
- FETCH_WORKERPOOL_ORDER
- FETCH_WORKERPOOL_ORDER_SUCCESS (order)
- REQUEST_ORDER_SIGNATURE_SIGN_REQUEST (order)
- REQUEST_ORDER_SIGNATURE_SUCCESS (order)
- MATCH_ORDERS_SIGN_TX_REQUEST (apporder, datasetorder, workerpoolorder, requestorder)
- MATCH_ORDERS_SUCCESS (dealid, txHash)
- TASK_UPDATED (dealid, taskid, status)
- TASK_COMPLETED

### utils

#### utils.computeOracleKey(paramsSet|ipfsCid) => Promise\<oracleKey: String\>

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
