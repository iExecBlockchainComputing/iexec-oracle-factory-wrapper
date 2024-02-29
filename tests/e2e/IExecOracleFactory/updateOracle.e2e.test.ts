import { Wallet } from 'ethers';
import { utils } from 'iexec';
import { IExecOracleFactory } from '../../../src/index.js';

// eslint-disable-next-line jest/no-disabled-tests
test.skip('update oracle - standard from paramSet - no dataset', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

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
        },
      });
  });
  expect(messages.length).toBe(16);
  expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
  expect(messages[1]).toStrictEqual({ message: 'ENSURE_PARAMS_UPLOAD' });
  expect(messages[2]).toStrictEqual({
    message: 'ENSURE_PARAMS_SUCCESS',
    paramSet: {
      JSONPath: '$.data',
      body: '',
      dataType: 'string',
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      method: 'GET',
      url: 'https://foo.io',
    },
    cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
  });
  expect(messages[3]).toStrictEqual({ message: 'FETCH_APP_ORDER' });
  expect(messages[4]).toStrictEqual({
    message: 'FETCH_APP_ORDER_SUCCESS',
    order: 'signedApporder',
  });
  expect(messages[5]).toStrictEqual({ message: 'FETCH_DATASET_ORDER' });
  expect(messages[6]).toStrictEqual({
    message: 'FETCH_DATASET_ORDER_SUCCESS',
    order: 'signedDatasetorder',
  });
  expect(messages[7]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
  expect(messages[8]).toStrictEqual({
    message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
    order: 'signedWorkerpoolorder',
  });
  expect(messages[9]).toStrictEqual({
    message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
    order: 'requestorderToSign',
  });
  expect(messages[10]).toStrictEqual({
    message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
    order: 'requestorderToSign',
  });
  expect(messages[11]).toStrictEqual({
    message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
    apporder: 'signedApporder',
    datasetorder: 'signedDatasetorder',
    workerpoolorder: 'signedWorkerpoolorder',
    requestorder: 'signedRequestorder',
  });
  expect(messages[12]).toStrictEqual({
    message: 'MATCH_ORDERS_SUCCESS',
    dealid: 'dealid',
    txHash: 'txHash',
  });
  expect(messages[13]).toStrictEqual({
    message: 'TASK_UPDATED',
    dealid: 'dealid',
    taskid: 'taskid',
    status: 'ACTIVE',
  });
  expect(messages[14]).toStrictEqual({
    message: 'TASK_UPDATED',
    dealid: 'dealid',
    taskid: 'taskid',
    status: 'REVEALING',
  });
  expect(messages[15]).toStrictEqual({ message: 'UPDATE_TASK_COMPLETED' });
}, 10000);

// eslint-disable-next-line jest/no-disabled-tests
test.skip('standard - from CID', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

  const messages: any = [];
  await new Promise((resolve: any, reject) => {
    factoryWithoutOption
      .updateOracle('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh', {
        targetBlockchains: [137],
      })
      .subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
        },
      });
  });
  expect(messages.length).toBe(15);
  expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
  expect(messages[1]).toStrictEqual({
    message: 'ENSURE_PARAMS_SUCCESS',
    paramSet: {
      JSONPath: '$.data',
      body: '',
      dataType: 'string',
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      headers: { authorization: '%API_KEY%' },
      method: 'GET',
      url: 'https://foo.io',
    },
    cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
  });
  expect(messages[2]).toStrictEqual({ message: 'FETCH_APP_ORDER' });
  expect(messages[3]).toStrictEqual({
    message: 'FETCH_APP_ORDER_SUCCESS',
    order: 'signedApporder',
  });
  expect(messages[4]).toStrictEqual({ message: 'FETCH_DATASET_ORDER' });
  expect(messages[5]).toStrictEqual({
    message: 'FETCH_DATASET_ORDER_SUCCESS',
    order: 'signedDatasetorder',
  });
  expect(messages[6]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
  expect(messages[7]).toStrictEqual({
    message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
    order: 'signedWorkerpoolorder',
  });
  expect(messages[8]).toStrictEqual({
    message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
    order: 'requestorderToSign',
  });
  expect(messages[9]).toStrictEqual({
    message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
    order: 'requestorderToSign',
  });
  expect(messages[10]).toStrictEqual({
    message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
    apporder: 'signedApporder',
    datasetorder: 'signedDatasetorder',
    workerpoolorder: 'signedWorkerpoolorder',
    requestorder: 'signedRequestorder',
  });
  expect(messages[11]).toStrictEqual({
    message: 'MATCH_ORDERS_SUCCESS',
    dealid: 'dealid',
    txHash: 'txHash',
  });
  expect(messages[12]).toStrictEqual({
    message: 'TASK_UPDATED',
    dealid: 'dealid',
    taskid: 'taskid',
    status: 'ACTIVE',
  });
  expect(messages[13]).toStrictEqual({
    message: 'TASK_UPDATED',
    dealid: 'dealid',
    taskid: 'taskid',
    status: 'REVEALING',
  });
  expect(messages[14]).toStrictEqual({ message: 'UPDATE_TASK_COMPLETED' });
}, 10000);
