import { Wallet } from 'ethers';
import {
  DEFAULT_WORKERPOOL_ADDRESS,
  getFactoryDefaults,
} from '../../../src/config/config.js';
import { IExecOracleFactory } from '../../../src/index.js';
import {
  MAX_EXPECTED_BLOCKTIME,
  TEST_CHAIN,
  createAndPublishAppOrders,
  createAndPublishWorkerpoolOrder,
  getTestConfig,
  getTestIExecOption,
  getTestWeb3SignerProvider,
  timeouts,
} from '../../test-utils.js';
let signedApporder;
let signedWorkerpoolorder;

beforeAll(async () => {
  const ORACLE_APP_ADDRESS = getFactoryDefaults(
    Number(TEST_CHAIN.chainId)
  ).ORACLE_APP_ADDRESS;
  signedApporder = await createAndPublishAppOrders(
    ORACLE_APP_ADDRESS,
    TEST_CHAIN.appOwnerWallet
  );
  signedWorkerpoolorder = await createAndPublishWorkerpoolOrder(
    DEFAULT_WORKERPOOL_ADDRESS,
    TEST_CHAIN.prodWorkerpoolOwnerWallet
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}, 4 * MAX_EXPECTED_BLOCKTIME);

// eslint-disable-next-line jest/no-disabled-tests
test(
  'update oracle - standard from paramSet - no dataset',
  async () => {
    const consumerWallet = Wallet.createRandom();
    const factoryWithoutOption = new IExecOracleFactory(
      ...getTestConfig(consumerWallet.privateKey)
    );
    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      factoryWithoutOption
        .updateOracle({
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          method: 'GET',
          url: 'https://foo.io',
        })
        .subscribe({
          complete: resolve,
          error: (e) => {
            reject(e);
          },
          next: (value) => {
            messages.push(value);
            if (value.message === 'TASK_UPDATED') {
              resolve();
            }
          },
        });
    });
    expect(messages.length).toBe(12);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(messages[1]).toStrictEqual({ message: 'ENSURE_PARAMS_UPLOAD' });
    expect(messages[2]).toStrictEqual({
      message: 'ENSURE_PARAMS_SUCCESS',
      paramSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        method: 'GET',
        url: 'https://foo.io',
        headers: {},
      },
      cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
    });
    expect(messages[3]).toStrictEqual({ message: 'FETCH_APP_ORDER' });
    expect(messages[4].message).toStrictEqual('FETCH_APP_ORDER_SUCCESS');
    expect(messages[4].order.app).toStrictEqual(signedApporder.app);
    expect(messages[5]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
    expect(messages[6].message).toStrictEqual('FETCH_WORKERPOOL_ORDER_SUCCESS');
    expect(messages[6].order.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[7].message).toStrictEqual(
      'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST'
    );
    expect(messages[7].order.app).toStrictEqual(signedApporder.app);
    expect(messages[7].order.dataset).toStrictEqual(
      '0x0000000000000000000000000000000000000000'
    );
    expect(messages[7].order.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[7].order.beneficiary).toStrictEqual(consumerWallet.address);
    expect(messages[8].message).toStrictEqual(
      'REQUEST_ORDER_SIGNATURE_SUCCESS'
    );
    expect(messages[8].order.app).toStrictEqual(signedApporder.app);
    expect(messages[8].order.dataset).toStrictEqual(
      '0x0000000000000000000000000000000000000000'
    );
    expect(messages[8].order.beneficiary).toStrictEqual(consumerWallet.address);
    expect(messages[9].message).toStrictEqual('MATCH_ORDERS_SIGN_TX_REQUEST');
    expect(messages[9].apporder.app).toStrictEqual(signedApporder.app);
    expect(messages[9].workerpoolorder.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[9].datasetorder).toBeUndefined();
    expect(messages[9].requestorder.beneficiary).toStrictEqual(
      consumerWallet.address
    );
    expect(messages[9].requestorder.requester).toStrictEqual(
      consumerWallet.address
    );
    expect(messages[9].requestorder.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[9].requestorder.app).toStrictEqual(signedApporder.app);
    expect(messages[10].message).toStrictEqual('MATCH_ORDERS_SUCCESS');
    expect(messages[10].dealid).toBeDefined();
    expect(messages[10].txHash).toBeDefined();
    expect(messages[11].message).toStrictEqual('TASK_UPDATED');
    expect(messages[11].dealid).toBeDefined();
    expect(messages[11].taskid).toBeDefined();
    expect(messages[11].status).toStrictEqual('UNSET');
  },
  timeouts.updateOracle
);

// eslint-disable-next-line jest/no-disabled-tests
test(
  'standard - from CID',
  async () => {
    const consumerWallet = Wallet.createRandom();
    const ethProvider = getTestWeb3SignerProvider(consumerWallet.privateKey);
    const factoryWithoutOption = new IExecOracleFactory(ethProvider, {
      iexecOptions: getTestIExecOption(),
    });
    let cid;
    let datasetAddress;
    await new Promise((resolve: any, reject) => {
      factoryWithoutOption
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
          complete: resolve,
          error: (e) => {
            reject(e);
          },
          next: (value) => {
            if (value.message === 'DATASET_DEPLOYMENT_SUCCESS') {
              datasetAddress = value.address;
            }
            if (value.message === 'PARAM_SET_UPLOADED') {
              cid = value.cid;
            }
          },
        });
    });
    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      factoryWithoutOption
        .updateOracle(cid, {
          targetBlockchains: [134],
        })
        .subscribe({
          complete: resolve,
          error: (e) => {
            reject(e);
          },
          next: (value) => {
            messages.push(value);
            if (value.message === 'TASK_UPDATED') {
              resolve();
            }
          },
        });
    });
    expect(messages.length).toBe(13);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(messages[1]).toStrictEqual({
      cid: cid,
      message: 'ENSURE_PARAMS_SUCCESS',
      paramSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: datasetAddress,
        method: 'GET',
        url: 'https://foo.io',
        headers: new Object({
          authorization: '%API_KEY%',
        }),
      },
    });
    expect(messages[3].message).toStrictEqual('FETCH_APP_ORDER_SUCCESS');
    expect(messages[3].order.app).toStrictEqual(signedApporder.app);
    expect(messages[4]).toStrictEqual({ message: 'FETCH_DATASET_ORDER' });
    expect(messages[5].message).toStrictEqual('FETCH_DATASET_ORDER_SUCCESS');
    expect(messages[5].order.dataset).toStrictEqual(datasetAddress);
    expect(messages[5].order.apprestrict).toStrictEqual(signedApporder.app);
    expect(messages[7].message).toStrictEqual('FETCH_WORKERPOOL_ORDER_SUCCESS');
    expect(messages[7].order.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[8].message).toStrictEqual(
      'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST'
    );
    expect(messages[8].order.app).toStrictEqual(signedApporder.app);
    expect(messages[8].order.dataset).toStrictEqual(datasetAddress);
    expect(messages[8].order.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[8].order.beneficiary).toStrictEqual(consumerWallet.address);
    expect(messages[9].message).toStrictEqual(
      'REQUEST_ORDER_SIGNATURE_SUCCESS'
    );
    expect(messages[9].order.app).toStrictEqual(signedApporder.app);
    expect(messages[9].order.dataset).toStrictEqual(datasetAddress);
    expect(messages[9].order.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[9].order.beneficiary).toStrictEqual(consumerWallet.address);
    expect(messages[10].message).toStrictEqual('MATCH_ORDERS_SIGN_TX_REQUEST');
    expect(messages[10].apporder.app).toStrictEqual(signedApporder.app);
    expect(messages[10].workerpoolorder.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[10].datasetorder.dataset).toStrictEqual(datasetAddress);
    expect(messages[10].requestorder.beneficiary).toStrictEqual(
      consumerWallet.address
    );
    expect(messages[10].requestorder.requester).toStrictEqual(
      consumerWallet.address
    );
    expect(messages[10].requestorder.workerpool).toStrictEqual(
      signedWorkerpoolorder.workerpool
    );
    expect(messages[10].requestorder.app).toStrictEqual(signedApporder.app);
    expect(messages[10].requestorder.dataset).toStrictEqual(datasetAddress);
    expect(messages[11].message).toStrictEqual('MATCH_ORDERS_SUCCESS');
    expect(messages[11].dealid).toBeDefined();
    expect(messages[11].txHash).toBeDefined();
    expect(messages[12].message).toStrictEqual('TASK_UPDATED');
    expect(messages[12].dealid).toBeDefined();
    expect(messages[12].taskid).toBeDefined();
    expect(messages[12].status).toStrictEqual('UNSET');
  },
  timeouts.createOracle + timeouts.updateOracle
);
