const { Buffer } = require('buffer');
const CID = require('cids');
const { Contract } = require('ethers');
const ipfs = require('./ipfs-service');
const { formatParamsJson, formatOracleGetInt } = require('./format');
const { Observable, SafeObserver } = require('./reactive');
const { getDefaults, DEFAULT_IPFS_GATEWAY, API_KEY_PLACEHOLDER } = require('./conf');
const { WorkflowError, ValidationError } = require('./errors');
const {
  jsonParamSetSchema,
  paramSetSchema,
  rawParamsSchema,
  readDataTypeSchema,
  throwIfMissing,
} = require('./validators');
const { isOracleId, computeOracleId, computeCallId } = require('./hash');

const createApiKeyDataset = ({
  iexec = throwIfMissing(),
  apiKey = throwIfMissing(),
  callId = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
} = {}) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const { chainId } = await iexec.network.getNetwork();
      const { ORACLE_APP_ADDRESS } = getDefaults(chainId);

      const key = iexec.dataset.generateEncryptionKey();
      safeObserver.next({
        message: 'ENCRYPTION_KEY_CREATED',
        key,
      });

      const dataset = JSON.stringify({
        apiKey,
        callId,
      });
      const encryptedFile = await iexec.dataset
        .encrypt(Buffer.from(dataset, 'utf8'), key)
        .catch((e) => {
          throw new WorkflowError('Failed to encrypt API key', e);
        });
      const checksum = await iexec.dataset
        .computeEncryptedFileChecksum(encryptedFile)
        .catch((e) => {
          throw new WorkflowError('Failed to compute encrypted API key checksum', e);
        });
      safeObserver.next({
        message: 'FILE_ENCRYPTED',
        encryptedFile,
        checksum,
      });

      const cid = await ipfs.add(encryptedFile, { ipfsGateway }).catch((e) => {
        throw new WorkflowError('Failed to upload encrypted API key', e);
      });
      const multiaddr = `/ipfs/${cid}`;
      safeObserver.next({
        message: 'ENCRYPTED_FILE_UPLOADED',
        cid,
        multiaddr,
      });

      safeObserver.next({
        message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST',
      });
      const { address, txHash } = await iexec.dataset
        .deployDataset({
          owner: await iexec.wallet.getAddress(),
          name: 'api-key',
          multiaddr,
          checksum,
        })
        .catch((e) => {
          throw new WorkflowError('Failed to deploy API key dataset', e);
        });
      safeObserver.next({
        message: 'DATASET_DEPLOYMENT_SUCCESS',
        address,
        txHash,
      });

      safeObserver.next({
        message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST',
      });
      await iexec.dataset.pushDatasetSecret(address, key).catch((e) => {
        throw new WorkflowError("Failed to push API key dataset's encryption key", e);
      });
      safeObserver.next({
        message: 'PUSH_SECRET_TO_SMS_SUCCESS',
      });

      const orderToSign = await iexec.order
        .createDatasetorder({
          dataset: address,
          tag: ['tee'],
          apprestrict: ORACLE_APP_ADDRESS,
          volume: Number.MAX_SAFE_INTEGER - 1,
        })
        .catch((e) => {
          throw new WorkflowError("Failed to create API key datasetorder's", e);
        });
      safeObserver.next({
        message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST',
        order: orderToSign,
      });
      const order = await iexec.order.signDatasetorder(orderToSign).catch((e) => {
        throw new WorkflowError("Failed to sign API key datasetorder's", e);
      });
      safeObserver.next({
        message: 'DATASET_ORDER_SIGNATURE_SUCCESS',
        order,
      });

      safeObserver.next({
        message: 'DATASET_ORDER_PUBLISH_SIGN_REQUEST',
        order,
      });
      const orderHash = await iexec.order.publishDatasetorder(order).catch((e) => {
        throw new WorkflowError("Failed to publish API key datasetorder's", e);
      });
      safeObserver.next({
        message: 'DATASET_ORDER_PUBLISH_SUCCESS',
        orderHash,
      });

      safeObserver.complete();
    } catch (e) {
      if (e instanceof WorkflowError) {
        safeObserver.error(e);
      } else {
        safeObserver.error(new WorkflowError('API key dataset creation unexpected error', e));
      }
    }
  };
  safeObserver.unsub = () => {
    // teardown callback
  };
  start();
  return safeObserver.unsubscribe.bind(safeObserver);
});

const getParamSet = async ({ paramSetOrCid, ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  let paramSet;
  let paramsJson;
  let isUploaded = false;
  if (ipfs.isCid(paramSetOrCid)) {
    const cid = new CID(paramSetOrCid).toString();
    const contentBuffer = await ipfs.get(cid, { ipfsGateway }).catch(() => {
      throw Error(`Failed to load paramSetSet from CID ${cid}`);
    });
    const contentText = contentBuffer.toString();
    try {
      paramsJson = await jsonParamSetSchema().validate(contentText);
      paramSet = JSON.parse(paramsJson);
      isUploaded = true;
    } catch (e) {
      throw Error(`Content associated to CID ${cid} is not a valid paramSet`);
    }
  } else {
    paramSet = await paramSetSchema().validate(paramSetOrCid);
    paramsJson = await jsonParamSetSchema().validate(formatParamsJson(paramSet));
  }
  return { paramSet, paramsJson, isUploaded };
};

const updateOracle = ({
  paramSetOrCid = throwIfMissing(),
  iexec = throwIfMissing(),
  workerpool,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
} = {}) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const { chainId } = await iexec.network.getNetwork();
      const { ORACLE_APP_ADDRESS, ORACLE_CONTRACT_ADDRESS } = getDefaults(chainId);

      let cid;
      safeObserver.next({
        message: 'ENSURE_PARAMS',
      });
      const { isUploaded, paramSet, paramsJson } = await getParamSet({
        paramSetOrCid,
        ipfsGateway,
      }).catch((e) => {
        if (e instanceof ValidationError) {
          throw e;
        } else {
          throw new WorkflowError('Failed to load paramSet', e);
        }
      });
      if (isUploaded) {
        cid = paramSetOrCid;
      } else {
        safeObserver.next({
          message: 'ENSURE_PARAMS_UPLOAD',
        });
        cid = await ipfs.add(paramsJson, { ipfsGateway }).catch((e) => {
          throw new WorkflowError('Failed to upload paramSet', e);
        });
      }
      safeObserver.next({
        message: 'ENSURE_PARAMS_SUCCESS',
        paramSet,
        cid,
      });

      safeObserver.next({
        message: 'FETCH_APP_ORDER',
      });
      const datasetAddress = paramSet.dataset;
      const apporderbook = await iexec.orderbook
        .fetchAppOrderbook(ORACLE_APP_ADDRESS, {
          minTag: ['tee'],
          maxTag: ['tee'],
          requester: await iexec.wallet.getAddress(),
          workerpool,
          dataset: datasetAddress,
        })
        .catch((e) => {
          throw new WorkflowError('Failed to fetch apporder', e);
        });
      const apporder = apporderbook && apporderbook.orders[0] && apporderbook.orders[0].order;
      if (!apporder) {
        throw new WorkflowError('No apporder published');
      }
      safeObserver.next({
        message: 'FETCH_APP_ORDER_SUCCESS',
        order: apporder,
      });

      let datasetorder;
      if (datasetAddress && datasetAddress !== '0x0000000000000000000000000000000000000000') {
        safeObserver.next({
          message: 'FETCH_DATASET_ORDER',
        });
        const datasetorderbook = await iexec.orderbook
          .fetchDatasetOrderbook(datasetAddress, {
            minTag: ['tee'],
            maxTag: ['tee'],
            requester: await iexec.wallet.getAddress(),
            workerpool,
            app: ORACLE_APP_ADDRESS,
          })
          .catch((e) => {
            throw new WorkflowError('Failed to fetch datasetorder', e);
          });
        datasetorder = datasetorderbook && datasetorderbook.orders[0] && datasetorderbook.orders[0].order;
        if (!datasetorder) {
          throw new WorkflowError('No datasetorder published');
        }
        safeObserver.next({
          message: 'FETCH_DATASET_ORDER_SUCCESS',
          order: datasetorder,
        });
      }

      safeObserver.next({
        message: 'FETCH_WORKERPOOL_ORDER',
      });
      const workerpoolorderbook = await iexec.orderbook
        .fetchWorkerpoolOrderbook({
          minTag: ['tee'],
          requester: await iexec.wallet.getAddress(),
          workerpool,
          app: ORACLE_APP_ADDRESS,
          dataset: datasetAddress,
        })
        .catch((e) => {
          throw new WorkflowError('Failed to fetch workerpoolorder', e);
        });
      const workerpoolorder = workerpoolorderbook
          && workerpoolorderbook.orders[0]
          && workerpoolorderbook.orders[0].order;
      if (!workerpoolorder) {
        throw new WorkflowError('No workerpoolorder published');
      }
      safeObserver.next({
        message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
        order: workerpoolorder,
      });

      const requestorderToSign = await iexec.order
        .createRequestorder({
          app: ORACLE_APP_ADDRESS,
          category: workerpoolorder.category,
          dataset: datasetAddress,
          workerpool,
          callback: ORACLE_CONTRACT_ADDRESS,
          appmaxprice: apporder.appprice,
          datasetmaxprice: datasetorder && datasetorder.datasetprice,
          workerpoolmaxprice: workerpoolorder.workerpoolprice,
          tag: ['tee'],
          params: {
            iexec_input_files: [`${ipfsGateway}/ipfs/${cid}`],
          },
        })
        .catch((e) => {
          throw new WorkflowError('Failed to create requestorder', e);
        });
      safeObserver.next({
        message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
        order: requestorderToSign,
      });
      const requestorder = await iexec.order
        .signRequestorder(requestorderToSign, { checkRequest: false })
        .catch((e) => {
          throw new WorkflowError('Failed to sign requestorder', e);
        });
      safeObserver.next({
        message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
        order: requestorderToSign,
      });

      safeObserver.next({
        message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
        apporder,
        datasetorder,
        workerpoolorder,
        requestorder,
      });
      const { dealid, txHash } = await iexec.order
        .matchOrders(
          {
            apporder,
            datasetorder,
            workerpoolorder,
            requestorder,
          },
          { checkRequest: false },
        )
        .catch((e) => {
          throw new WorkflowError('Failed to match orders', e);
        });
      safeObserver.next({
        message: 'MATCH_ORDERS_SUCCESS',
        dealid,
        txHash,
      });

      // task
      const taskid = await iexec.deal.computeTaskId(dealid, 0);

      const watchExecution = () => new Promise((resolve, reject) => {
        iexec.task.obsTask(taskid, { dealid }).then((obs) => {
          obs.subscribe({
            next: (value) => {
              const { message } = value;
              if (message === 'TASK_TIMEDOUT') {
                reject(
                  new WorkflowError(
                    'Oracle update task timed out, update failed',
                    Error(`Task ${taskid} from deal ${dealid} timed out`),
                  ),
                );
              }
              if (message === 'TASK_COMPLETED') {
                resolve();
              }
              if (message === 'TASK_UPDATED') {
                safeObserver.next({
                  message: 'TASK_UPDATED',
                  dealid,
                  taskid,
                  status: value.task && value.task.statusName,
                });
              }
            },
            error: (e) => reject(new WorkflowError('Failed to monitor oracle update task', e)),
            complete: () => {},
          });
        });
      });
      await watchExecution();

      safeObserver.next({
        message: 'UPDATE_TASK_COMPLETED',
      });
      safeObserver.complete();
    } catch (e) {
      if (e instanceof WorkflowError || e instanceof ValidationError) {
        safeObserver.error(e);
      } else {
        safeObserver.error(new WorkflowError('Update oracle unexpected error', e));
      }
    }
  };
  safeObserver.unsub = () => {
    // teardown callback
  };
  start();
  return safeObserver.unsubscribe.bind(safeObserver);
});

const READ_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_callID',
        type: 'bytes32',
      },
    ],
    name: 'getBool',
    outputs: [
      {
        internalType: 'bool',
        name: 'boolValue',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_callID',
        type: 'bytes32',
      },
    ],
    name: 'getInt',
    outputs: [
      {
        internalType: 'int256',
        name: 'intValue',
        type: 'int256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_callID',
        type: 'bytes32',
      },
    ],
    name: 'getRaw',
    outputs: [
      {
        internalType: 'bytes',
        name: 'bytesValue',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_callID',
        type: 'bytes32',
      },
    ],
    name: 'getString',
    outputs: [
      {
        internalType: 'string',
        name: 'stringValue',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

const readOracle = async ({
  paramSetOrCidOrOracleId = throwIfMissing(),
  dataType,
  ethersProvider = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
} = {}) => {
  const chainId = await ethersProvider.getNetwork().then((res) => `${res.chainId}`);
  const { ORACLE_CONTRACT_ADDRESS } = getDefaults(chainId);

  let readDataType;
  let oracleId;
  if (isOracleId(paramSetOrCidOrOracleId)) {
    oracleId = paramSetOrCidOrOracleId;
    readDataType = await readDataTypeSchema().validate(
      dataType === undefined || dataType === '' ? 'raw' : dataType,
    );
  } else {
    if (dataType) {
      throw Error('dataType option is only allowed when reading oracle from oracleId');
    }
    const { paramSet } = await getParamSet({
      paramSetOrCid: paramSetOrCidOrOracleId,
      ipfsGateway,
    }).catch((e) => {
      if (e instanceof ValidationError) {
        throw e;
      } else {
        throw new WorkflowError('Failed to load paramSet', e);
      }
    });
    readDataType = paramSet.dataType;
    oracleId = await computeOracleId(paramSet);
  }

  const oracleContract = new Contract(ORACLE_CONTRACT_ADDRESS, READ_ABI, ethersProvider);

  switch (readDataType) {
    case 'boolean': {
      const result = await oracleContract.getBool(oracleId).catch(() => {
        throw Error(
          `Failed to read boolean from oracle with oracleId ${oracleId}\nThis may occure when:\n- No value is stored\n- Stored value is not boolean dataType`,
        );
      });
      return result;
    }
    case 'number': {
      const resultBn = await oracleContract.getInt(oracleId).catch(() => {
        throw Error(
          `Failed to read number from oracle with oracleId ${oracleId}\nThis may occure when:\n- No value is stored\n- Stored value is not number dataType`,
        );
      });
      const resultNumber = formatOracleGetInt(resultBn);
      return resultNumber;
    }
    case 'string': {
      const resultString = await oracleContract.getString(oracleId).catch(() => {
        throw Error(
          `Failed to read string from oracle with oracleId ${oracleId}\nThis may occure when:\n- No value is stored\n- Stored value is not string dataType`,
        );
      });
      return resultString;
    }
    default: {
      const resultBytes = await oracleContract.getRaw(oracleId).catch(() => {
        throw Error(`Failed to read raw value from oracle with oracleId ${oracleId}`);
      });
      return resultBytes;
    }
  }
};

const createOracle = ({
  rawParams = throwIfMissing(),
  iexec = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
}) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const {
        JSONPath,
        url,
        method,
        headers,
        body,
        dataType,
        apiKey,
      } = await rawParamsSchema().validate(rawParams);

      let dataset;
      // check use api
      const useApiKey = JSON.stringify({ url, headers }).indexOf(API_KEY_PLACEHOLDER) !== -1;
      if (useApiKey) {
        const callId = await computeCallId({
          url,
          method,
          headers,
          body,
        });
        await new Promise((resolve, reject) => {
          createApiKeyDataset({
            iexec,
            apiKey,
            callId,
            ipfsGateway,
          }).subscribe({
            error: (e) => reject(e),
            next: (v) => {
              if (v.message === 'DATASET_DEPLOYMENT_SUCCESS') {
                dataset = v.address;
              }
              safeObserver.next(v);
            },
            complete: () => resolve(),
          });
        });
      }

      const paramSet = await paramSetSchema().validate({
        JSONPath,
        url,
        method,
        headers,
        body,
        dataType,
        dataset,
      });
      const jsonParams = await jsonParamSetSchema().validate(formatParamsJson(paramSet));
      safeObserver.next({
        message: 'PARAMS_SET_CREATED',
        paramSet: JSON.parse(jsonParams),
      });

      const oracleId = await computeOracleId(paramSet);
      safeObserver.next({
        message: 'ORACLE_ID_COMPUTED',
        oracleId,
      });

      const cid = await ipfs.add(jsonParams, { ipfsGateway }).catch((e) => {
        throw new WorkflowError('Failed to upload paramSet', e);
      });
      const multiaddr = `/ipfs/${cid}`;
      safeObserver.next({
        message: 'PARAMS_SET_UPLOADED',
        cid,
        multiaddr,
      });

      safeObserver.complete();
    } catch (e) {
      if (e instanceof WorkflowError || e instanceof ValidationError) {
        safeObserver.error(e);
      } else {
        safeObserver.error(new WorkflowError('Create oracle unexpected error', e));
      }
    }
  };
  safeObserver.unsub = () => {
    // teardown callback
  };
  start();
  return safeObserver.unsubscribe.bind(safeObserver);
});

module.exports = {
  getParamSet,
  createOracle,
  updateOracle,
  readOracle,
};
