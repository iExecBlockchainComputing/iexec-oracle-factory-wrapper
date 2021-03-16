# iexec-oracle-factory-wrapper

## API

### \[Constructor\] IExecOracleFactory({ ethProvider: Web3|Signer, chainId: "1"|"5" }, { oracleArddress: Address }) => oracleFactory:Object

#### factory.readOracleValue(paramsSet|IpfsCid) => Promise\<value: String\>

#### factory.createOracle({rawParams}) => Observable

messages :

- \[optional - API key only\] createApiKeyDataset values
- PARAMS_SET_CREATED (paramsSet)
- ORACLE_KEY_COMPUTED (oracle key)
- UPLOAD_PARAMS_SET_SUCCESS (cid)
- COMPLETED

#### factory.createApiKeyDataset(apiKey: String) => Observable

messages :

- KEY_CREATED (key)
- FILE_ENCRYPTED (encryptedFile)
- ENCRYPETED_FILE_UPLOADED (cid)
- DATASET_DEPLOYMENT_TX_SIGN_REQUEST
- DATASET_DEPLOYMENT_TX_SENT (txHash)
- DATASET_DEPLOYMENT_TX_SUCCESS
- PUSH_SECRET_TO_SMS_SIGN_REQUEST
- PUSH_SECRET_TO_SMS_SUCCESS
- DATASET_ORDER_SIGNATURE_SIGN_REQUEST
- DATASET_ORDER_SIGNATURE_SUCCESS
- DATASET_ORDER_PUBLISH_SIGN_REQUEST
- DATASET_ORDER_PUBLISH_SUCCESS

#### updateOracle(paramsSet|IpfsCid, {workerpool, workerpoolMaxPrice}) => Observable

messages :

- RETRIEVE_PARAMS
- RETRIEVE_PARAMS_SUCCESS
- FETCH_APP_ORDER
- FETCH_APP_ORDER_SUCCESS
- FETCH_DATASET_ORDER
- FETCH_DATASET_ORDER_SUCCESS
- FETCH_WORKERPOOL_ORDER
- FETCH_WORKERPOOL_ORDER_SUCCESS
- REQUEST_ORDER_SIGNATURE_SIGN_REQUEST
- REQUEST_ORDER_SIGNATURE_SUCCESS
- MATCH_ORDERS_TX_SIGN_REQUEST
- MATCH_ORDERS_TX_SENT
- MATCH_ORDERS_TX_SUCCESS
- DEAL_CREATED
- UPDATE_TASK_INITIALIZED
- UPDATE_TASK_COMPLETED

### utils

#### utils.computeOracleKey(paramsSet|IpfsCid) => Promise\<oracleKey: String\>

#### utils.testParams({rawParams}) => Promise\<value: String\>

#### utils.getSignerFromPrivateKey(host, privateKey) => signer:Signer
