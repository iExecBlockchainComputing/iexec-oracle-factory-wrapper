# iexec-oracle-factory-wrapper

## API

### \[Constructor\] IExecOracleFactory({ ethProvider: Web3|Signer, chainId: "1"|"5" }, { oracleArddress: Address, ipfsGateway: String }) => oracleFactory:Object

#### factory.createOracle(rawParams) => Observable

messages :

- \[optional - API key only\] createApiKeyDataset values
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

#### internal createApiKeyDataset(apiKey: String) => Observable

messages :

- ENCRYPTION_KEY_CREATED (key)
- FILE_ENCRYPTED (encryptedFile, checksum)
- ENCRYPTED_FILE_UPLOADED (cid, multiaddr)
- DATASET_DEPLOYMENT_SIGN_TX_REQUEST
- DATASET_DEPLOYMENT_SUCCESS (address, txHash)
- PUSH_SECRET_TO_SMS_SIGN_REQUEST
- PUSH_SECRET_TO_SMS_SUCCESS
- DATASET_ORDER_SIGNATURE_SIGN_REQUEST (order)
- DATASET_ORDER_SIGNATURE_SUCCESS (order)
- DATASET_ORDER_PUBLISH_SIGN_REQUEST
- DATASET_ORDER_PUBLISH_SUCCESS (orderHash)

### utils

#### utils.computeOracleKey(paramsSet|ipfsCid) => Promise\<oracleKey: String\>

#### utils.testRawParams(rawParams) => Promise\<value: String\>

#### utils.getSignerFromPrivateKey(host, privateKey) => signer:Signer
