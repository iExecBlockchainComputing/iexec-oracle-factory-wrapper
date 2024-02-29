import { beforeEach, jest } from '@jest/globals';
import { Wallet } from 'ethers';
import { IExec, utils } from 'iexec';
import { ValidationError, WorkflowError } from '../../../src/utils/errors.js';

const mockAdd = jest.fn() as jest.Mock<any>;
const mockGet = jest.fn() as jest.Mock<any>;
const mockIsCid = jest.fn() as jest.Mock<any>;

jest.unstable_mockModule('../../../src/services/ipfs/index.js', () => ({
  add: mockAdd,
  get: mockGet,
  isCid: mockIsCid,
}));

// dynamically import tested module after all mock are loaded
const { updateOracle } = await import(
  '../../../src/oracleFactory/updateOracle.js'
);

beforeEach(() => {
  // use ipfs real implementation as default mock
  jest.unstable_mockModule('../../../src/services/ipfs', () => ({
    add: mockAdd as (
      content: any,
      options?: { ipfsGateway?: string }
    ) => Promise<string>,
    get: mockGet as (
      cid: string,
      options?: { ipfsGateway?: string }
    ) => Promise<any>,
    isCid: mockIsCid as (cid: string) => boolean,
  }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('updateOracle', () => {
  test('standard - from paramSet', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const appOrderbook = {
      count: 1,
      orders: [{ order: 'signedApporder' }],
    };

    const mockFetchAppOrderbook: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(appOrderbook);
    });
    iexec.orderbook.fetchAppOrderbook = mockFetchAppOrderbook;

    const datasetOrderbook = {
      count: 1,
      orders: [{ order: 'signedDatasetorder' }],
    };

    const mockFetchDatasetOrderbook: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(datasetOrderbook);
      });
    iexec.orderbook.fetchDatasetOrderbook = mockFetchDatasetOrderbook;

    const workerpoolOrderbook = {
      count: 1,
      orders: [{ order: 'signedWorkerpoolorder' }],
    };

    const mockFetchWorkerOrderbook: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(workerpoolOrderbook);
      });
    iexec.orderbook.fetchWorkerpoolOrderbook = mockFetchWorkerOrderbook;

    const mockCreateRequestorder: any = jest
      .fn()
      .mockResolvedValueOnce('requestorderToSign' as never);

    iexec.order.createRequestorder = mockCreateRequestorder;

    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('signedRequestorder' as never) as any;

    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;

    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ next, complete }) => {
        next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
        next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
        next({ message: 'TASK_COMPLETED', task: { statusName: 'COMPLETED' } });
        complete();
      },
    } as never) as any;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
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
        headers: { authorization: '%API_KEY%' },
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

  test('standard - from CID', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    mockGet.mockResolvedValueOnce(
      JSON.stringify({
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        headers: { authorization: '%API_KEY%' },
        method: 'GET',
        url: 'https://foo.io',
      })
    );
    mockIsCid.mockResolvedValueOnce(true);

    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedApporder' }],
    } as never) as any;

    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedDatasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedWorkerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorderToSign' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('signedRequestorder' as never) as any;

    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;
    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ next, complete }) => {
        next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
        next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
        next({ message: 'TASK_COMPLETED', task: { statusName: 'COMPLETED' } });
        complete();
      },
    } as never) as any;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }).subscribe({
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

  test('standard - no dataset', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedApporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedDatasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedWorkerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorderToSign' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('signedRequestorder' as never) as any;
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;
    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ next, complete }) => {
        next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
        next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
        next({ message: 'TASK_COMPLETED', task: { statusName: 'COMPLETED' } });
        complete();
      },
    } as never) as any;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: undefined,
          headers: { authorization: 'foo' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(14);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(messages[1]).toStrictEqual({ message: 'ENSURE_PARAMS_UPLOAD' });
    expect(messages[2]).toStrictEqual({
      message: 'ENSURE_PARAMS_SUCCESS',
      paramSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: { authorization: 'foo' },
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
    expect(messages[5]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
    expect(messages[6]).toStrictEqual({
      message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
      order: 'signedWorkerpoolorder',
    });
    expect(messages[7]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
      order: 'requestorderToSign',
    });
    expect(messages[8]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
      order: 'requestorderToSign',
    });
    expect(messages[9]).toStrictEqual({
      message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
      apporder: 'signedApporder',
      datasetorder: undefined,
      workerpoolorder: 'signedWorkerpoolorder',
      requestorder: 'signedRequestorder',
    });
    expect(messages[10]).toStrictEqual({
      message: 'MATCH_ORDERS_SUCCESS',
      dealid: 'dealid',
      txHash: 'txHash',
    });
    expect(messages[11]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'ACTIVE',
    });
    expect(messages[12]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'REVEALING',
    });
    expect(messages[13]).toStrictEqual({ message: 'UPDATE_TASK_COMPLETED' });
  }, 10000);

  test('cancel during watch', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedApporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedDatasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'signedWorkerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorderToSign' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('signedRequestorder' as never) as any;
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;
    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ next, complete }) => {
        setTimeout(() => {
          next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
          next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
          next({
            message: 'TASK_COMPLETED',
            task: { statusName: 'COMPLETED' },
          });
          complete();
        }, 2000);
        return () => {};
      },
    } as never) as any;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      let count = 0;
      const cancel = updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: undefined,
          headers: { authorization: 'foo' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
          if (count >= 11) {
            cancel();
            setTimeout(() => resolve(), 5000);
          }
          count += 1;
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
        headers: { authorization: 'foo' },
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
    expect(messages[5]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
    expect(messages[6]).toStrictEqual({
      message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
      order: 'signedWorkerpoolorder',
    });
    expect(messages[7]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
      order: 'requestorderToSign',
    });
    expect(messages[8]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
      order: 'requestorderToSign',
    });
    expect(messages[9]).toStrictEqual({
      message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
      apporder: 'signedApporder',
      datasetorder: undefined,
      workerpoolorder: 'signedWorkerpoolorder',
      requestorder: 'signedRequestorder',
    });
    expect(messages[10]).toStrictEqual({
      message: 'MATCH_ORDERS_SUCCESS',
      dealid: 'dealid',
      txHash: 'txHash',
    });
    expect(messages[11]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'ACTIVE',
    });
  }, 10000);

  test('error - from CID ipfs content not found', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    mockIsCid.mockResolvedValueOnce(true);
    mockGet.mockRejectedValueOnce(Error('Content not found'));

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to load paramSet');
    expect(errors[0].originalError).toStrictEqual(
      Error(
        'Failed to load paramSetSet from CID QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
      )
    );
  }, 10000);

  test('error - from CID ipfs content is not valid paramSet', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    mockIsCid.mockResolvedValueOnce(true);
    mockGet.mockResolvedValueOnce('{"foo":"bar"}');

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDNxxxh',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(errors.length).toBe(1);
    // expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to load paramSet');
    // expect(errors[0].originalError).toStrictEqual(
    //   Error(
    //     'Content associated to CID QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh is not a valid paramSet',
    //   ),
    // );
  }, 10000);

  test('error - from paramSet invalid paramSet', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: 'paramSetOrCid',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(ValidationError);
    expect(errors[0].message).toBeDefined();
  }, 10000);

  test('error - from paramSet fail to upload', async () => {
    mockAdd.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to upload paramSet');
    expect(errors[0].originalError).toStrictEqual(Error('ipfs.add failed'));
  }, 10000);

  test('error - fail to fetch apporder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.orderbook.fetchAppOrderbook failed') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch apporder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchAppOrderbook failed')
    );
  }, 10000);

  test('error - no apporder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    ) as any;
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [] } as never) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No apporder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to fetch datasetorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    ) as any;
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.orderbook.fetchDatasetOrderbook fail') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch datasetorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchDatasetOrderbook fail')
    );
  }, 10000);

  test('error - no datasetorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [] } as never) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No datasetorder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to fetch workerppolorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    ) as any;
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.orderbook.fetchWorkerpoolOrderbook fail') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch workerpoolorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchWorkerpoolOrderbook fail')
    );
  }, 10000);

  test('error - no workerpoolorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [] } as never) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No workerpoolorder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to create requestorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh' as never
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 0,
      orders: [{ order: 'workerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.order.createRequestorder failed') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(9);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to create requestorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.order.createRequestorder failed')
    );
  }, 10000);

  test('error - fail to sign requestorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh' as never
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 0,
      orders: [{ order: 'workerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.order.signRequestorder failed') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(10);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to sign requestorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.order.signRequestorder failed')
    );
  }, 10000);

  test('error - fail to match orders', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh' as never
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 0,
      orders: [{ order: 'workerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.matchOrders = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.order.matchOrders failed') as never
      ) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(12);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to match orders');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.order.matchOrders failed')
    );
  }, 10000);

  test('error - task observer error', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh' as never
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 0,
      orders: [{ order: 'workerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;
    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ error }) => {
        error(Error('iexec.task.obsTask error'));
      },
    } as never) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(13);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to monitor oracle update task');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.task.obsTask error')
    );
  }, 10000);

  test('error - update task timedout', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S' as never
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'apporder' }],
    } as never) as any;
    iexec.orderbook.fetchDatasetOrderbook = jest.fn().mockResolvedValueOnce({
      count: 1,
      orders: [{ order: 'datasetorder' }],
    } as never) as any;
    iexec.orderbook.fetchWorkerpoolOrderbook = jest.fn().mockResolvedValueOnce({
      count: 0,
      orders: [{ order: 'workerpoolorder' }],
    } as never) as any;
    iexec.order.createRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.signRequestorder = jest
      .fn()
      .mockResolvedValueOnce('requestorder' as never) as any;
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    } as never) as any;
    iexec.deal.computeTaskId = jest
      .fn()
      .mockResolvedValueOnce('taskid' as never) as any;
    iexec.task.obsTask = jest.fn().mockResolvedValueOnce({
      subscribe: ({ next, complete }) => {
        next({ message: 'TASK_TIMEDOUT', task: { statusName: 'TIMEOUT' } });
        complete();
      },
    } as never) as any;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(13);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe(
      'Oracle update task timed out, update failed'
    );
    expect(errors[0].originalError).toStrictEqual(
      Error('Task taskid from deal dealid timed out')
    );
  }, 10000);

  test('error - unexpected error', async () => {
    mockAdd.mockImplementation(() => {
      throw TypeError('fake error');
    });
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      updateOracle({
        iexec,
        paramSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Update oracle unexpected error');
    expect(errors[0].originalError).toBeInstanceOf(TypeError);
  }, 10000);
});
