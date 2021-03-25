const { Buffer } = require('buffer');
const CID = require('cids');
const ipfs = require('./ipfs-service');
const { formatParamsJson } = require('./format');
const { Observable, SafeObserver } = require('./reactive');
const { getDefaults, DEFAULT_IPFS_GATEWAY, API_KEY_PLACEHOLDER } = require('./conf');
const { WorkflowError } = require('./errors');
const { paramsSetJsonSchema, paramsSetSchema, throwIfMissing } = require('./validators');
const { isOracleId, computeOracleId } = require('./hash');

const createApiKeyDataset = ({
  iexec = throwIfMissing(),
  apiKey = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
  ipfsConfig,
} = {}) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const { ORACLE_APP_ADDRESS } = getDefaults(iexec.network.id);

      const key = iexec.dataset.generateEncryptionKey();
      safeObserver.next({
        message: 'ENCRYPTION_KEY_CREATED',
        key,
      });

      const encryptedFile = await iexec.dataset
        .encrypt(Buffer.from(apiKey, 'utf8'), key)
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

      const cid = await ipfs.add(encryptedFile, { ipfsGateway, ipfsConfig }).catch((e) => {
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

const getParamsSet = async ({ paramsSetOrCid, ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  let paramsSet;
  let paramsJson;
  let isUploaded = false;
  if (ipfs.isCid(paramsSetOrCid)) {
    const cid = new CID(paramsSetOrCid).toString();
    const contentBuffer = await ipfs.get(cid, { ipfsGateway }).catch((e) => {
      throw new WorkflowError('Failed to load paramsSet from CID', e);
    });
    const contentText = contentBuffer.toString();
    try {
      paramsJson = await paramsSetJsonSchema().validate(contentText);
      paramsSet = JSON.parse(paramsJson);
      isUploaded = true;
    } catch (e) {
      throw new WorkflowError('Content associated to CID is not a valid paramsSet', e);
    }
  } else {
    try {
      paramsSet = await paramsSetSchema().validate(paramsSetOrCid);
      paramsJson = await paramsSetJsonSchema().validate(formatParamsJson(paramsSet));
    } catch (e) {
      throw new WorkflowError('Invalid paramsSet', e);
    }
  }

  return { paramsSet, paramsJson, isUploaded };
};

const updateOracle = ({
  paramsSetOrCid = throwIfMissing(),
  iexec = throwIfMissing(),
  workerpool,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
} = {}) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const { ORACLE_APP_ADDRESS, ORACLE_CONTRACT_ADDRESS } = getDefaults(iexec.network.id);

      let cid;
      safeObserver.next({
        message: 'ENSURE_PARAMS',
      });
      const { isUploaded, paramsSet, paramsJson } = await getParamsSet({
        paramsSetOrCid,
        ipfsGateway,
      });
      if (isUploaded) {
        cid = paramsSetOrCid;
      } else {
        safeObserver.next({
          message: 'ENSURE_PARAMS_UPLOAD',
        });
        cid = await ipfs.add(paramsJson, { ipfsGateway }).catch((e) => {
          throw new WorkflowError('Failed to upload params', e);
        });
      }
      safeObserver.next({
        message: 'ENSURE_PARAMS_SUCCESS',
        paramsSet,
        cid,
      });

      safeObserver.next({
        message: 'FETCH_APP_ORDER',
      });
      const datasetAddress = paramsSet.dataset;
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
      const apporder = apporderbook && apporderbook.appOrders[0] && apporderbook.appOrders[0].order;
      if (!apporder) {
        throw new WorkflowError('No apporder published');
      }
      safeObserver.next({
        message: 'FETCH_APP_ORDER_SUCCESS',
        order: apporder,
      });

      let datasetorder;
      if (datasetAddress) {
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
        datasetorder = datasetorderbook
            && datasetorderbook.datasetOrders[0]
            && datasetorderbook.datasetOrders[0].order;
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
          && workerpoolorderbook.workerpoolOrders[0]
          && workerpoolorderbook.workerpoolOrders[0].order;
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
          throw new WorkflowError('Failed to sign oracle update requestorder', e);
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
        iexec.task.obsTask(taskid, { dealid }).subscribe({
          next: (value) => {
            const { message } = value;
            if (message === 'TASK_TIMEDOUT') {
              reject(new WorkflowError('Oracle update task timed out, update failed'));
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
        });
      });
      await watchExecution();

      safeObserver.next({
        message: 'UPDATE_TASK_COMPLETED',
      });
      safeObserver.complete();
    } catch (e) {
      if (e instanceof WorkflowError) {
        safeObserver.error(e);
      } else {
        safeObserver.error(new WorkflowError('Oracle update unexpected error', e));
      }
    }
  };
  safeObserver.unsub = () => {
    // teardown callback
  };
  start();
  return safeObserver.unsubscribe.bind(safeObserver);
});

const readOracle = async ({
  paramsSetOrCidOrOracleId = throwIfMissing(),
  ethersProvider = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
} = {}) => {
  let oracleId;

  if (await isOracleId(paramsSetOrCidOrOracleId)) {
    oracleId = paramsSetOrCidOrOracleId;
  } else {
    const { paramsSet } = await getParamsSet({
      paramsSetOrCid: paramsSetOrCidOrOracleId,
      ipfsGateway,
    });
    oracleId = await computeOracleId(paramsSet);
  }

  throw Error(`TODO ${oracleId}`);
};

module.exports = {
  createApiKeyDataset,
  updateOracle,
  readOracle,
};
