/* eslint-disable jest/no-conditional-expect */
import { beforeAll } from '@jest/globals';
import { Wallet } from 'ethers';
import { IExec, utils } from 'iexec';
import { MarketCallError } from 'iexec/errors';
import { IExecOracleFactory } from '../../../src/index.js';
import { WorkflowError } from '../../../src/utils/errors.js';
import {
  MAX_EXPECTED_BLOCKTIME,
  OF_APP_ADDRESS,
  OF_APP_WHITELIST_ADDRESS,
  TEST_CHAIN,
  addVoucherEligibleAsset,
  createAndPublishAppOrders,
  createAndPublishWorkerpoolOrder,
  createVoucher,
  createVoucherType,
  ensureSufficientStake,
  getTestConfig,
  getTestIExecOption,
  getTestWeb3SignerProvider,
  timeouts,
} from '../../test-utils.js';

describe('oracleFactory.updateOracle()', () => {
  describe('using voucher', () => {
    let signedApporder;
    beforeAll(async () => {
      const appPrice = 100;
      const volume = 1000;
      signedApporder = await createAndPublishAppOrders(
        OF_APP_ADDRESS,
        TEST_CHAIN.appOwnerWallet,
        appPrice,
        volume
      );
    }, 4 * MAX_EXPECTED_BLOCKTIME);

    test(
      'should throw error if no voucher available for the requester',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        const workerpoolprice = 1000;
        await createAndPublishWorkerpoolOrder(
          TEST_CHAIN.prodWorkerpool,
          TEST_CHAIN.prodWorkerpoolOwnerWallet,
          consumerWallet.address,
          workerpoolprice
        );
        try {
          await new Promise((resolve: any, reject) => {
            factoryWithoutOption
              .updateOracle(
                {
                  JSONPath: '$.data',
                  body: '',
                  dataType: 'string',
                  method: 'GET',
                  url: 'https://foo.io',
                },
                { useVoucher: true }
              )
              .subscribe({
                complete: resolve,
                error: (e) => {
                  reject(e);
                },
                next: () => {},
              });
          });
        } catch (error) {
          expect(error.message).toBe('Failed to update oracle');
          expect(error.cause).toBeDefined();
          expect(error.cause.message).toBe(
            `No voucher available for the requester ${consumerWallet.address}`
          );
        }
      },
      timeouts.updateOracle
    );

    test(
      'should throw error if insufficient voucher amount',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());

        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 10;
        const { signedProdWorkerpoolorder } = await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.prodWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.debugWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(OF_APP_ADDRESS),
          voucherTypeId
        );
        const missingAmount =
          Number(signedProdWorkerpoolorder.workerpoolprice) +
          Number(signedApporder.appprice) -
          Number(voucherBalance);
        try {
          await new Promise((resolve: any, reject) => {
            factoryWithoutOption
              .updateOracle(
                {
                  JSONPath: '$.data',
                  body: '',
                  dataType: 'string',
                  method: 'GET',
                  url: 'https://foo.io',
                },
                { useVoucher: true }
              )
              .subscribe({
                complete: resolve,
                error: (e) => {
                  reject(e);
                },
                next: () => {},
              });
          });
        } catch (error) {
          expect(error.message).toBe('Failed to update oracle');
          expect(error.cause).toBeDefined();
          expect(error.cause.message).toBe(
            `Orders can't be matched. Please approve an additional ${missingAmount} for voucher usage.`
          );
        }
      },
      timeouts.updateOracle
    );

    test(
      'should create a task when user deposits to cover the missing amount',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());

        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 10;
        const { voucherAddress, signedProdWorkerpoolorder } =
          await createVoucher({
            owner: consumerWallet.address,
            voucherType: voucherTypeId,
            value: voucherBalance,
          });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.prodWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.debugWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(OF_APP_ADDRESS),
          voucherTypeId
        );
        const missingAmount =
          Number(signedProdWorkerpoolorder.workerpoolprice) +
          Number(signedApporder.appprice) -
          Number(voucherBalance);

        await ensureSufficientStake(iexec, missingAmount);
        await iexec.account.approve(missingAmount, voucherAddress);

        const messages: any = [];
        await new Promise((resolve: any, reject) => {
          factoryWithoutOption
            .updateOracle(
              {
                JSONPath: '$.data',
                body: '',
                dataType: 'string',
                method: 'GET',
                url: 'https://foo.io',
              },
              { useVoucher: true }
            )
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
      },
      timeouts.updateOracle
    );

    test(
      'should throw error if the app is not sponsored',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 1000_000;
        await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.prodWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.debugWorkerpool),
          voucherTypeId
        );
        const missingAmount = signedApporder.appprice;

        try {
          await new Promise((resolve: any, reject) => {
            factoryWithoutOption
              .updateOracle(
                {
                  JSONPath: '$.data',
                  body: '',
                  dataType: 'string',
                  method: 'GET',
                  url: 'https://foo.io',
                },
                { useVoucher: true }
              )
              .subscribe({
                complete: resolve,
                error: (e) => {
                  reject(e);
                },
                next: () => {},
              });
          });
        } catch (error) {
          expect(error.message).toBe('Failed to update oracle');
          expect(error.cause).toBeDefined();
          expect(error.cause.message).toBe(
            `Orders can't be matched. Please approve an additional ${missingAmount} for voucher usage.`
          );
        }
      },
      timeouts.updateOracle
    );

    test(
      'should throw error if the workerpool is not sponsored',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 1000_000;
        const { signedProdWorkerpoolorder } = await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(OF_APP_ADDRESS),
          voucherTypeId
        );
        const missingAmount = signedProdWorkerpoolorder.workerpoolprice;
        try {
          await new Promise((resolve: any, reject) => {
            factoryWithoutOption
              .updateOracle(
                {
                  JSONPath: '$.data',
                  body: '',
                  dataType: 'string',
                  method: 'GET',
                  url: 'https://foo.io',
                },
                { useVoucher: true }
              )
              .subscribe({
                complete: resolve,
                error: (e) => {
                  reject(e);
                },
                next: () => {},
              });
          });
        } catch (error) {
          expect(error.message).toBe('Failed to update oracle');
          expect(error.cause).toBeDefined();
          expect(error.cause.message).toBe(
            `Orders can't be matched. Please approve an additional ${missingAmount} for voucher usage.`
          );
        }
      },
      timeouts.updateOracle
    );

    test(
      'should create a task with sufficient voucher amount',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 2 * 60 * 60,
        });
        const voucherBalance = 10_000_000;
        await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.prodWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(TEST_CHAIN.debugWorkerpool),
          voucherTypeId
        );
        await addVoucherEligibleAsset(
          await iexec.ens.resolveName(OF_APP_ADDRESS),
          voucherTypeId
        );

        const messages: any = [];
        await new Promise((resolve: any, reject) => {
          factoryWithoutOption
            .updateOracle(
              {
                JSONPath: '$.data',
                body: '',
                dataType: 'string',
                method: 'GET',
                url: 'https://foo.io',
              },
              { useVoucher: true }
            )
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
      },
      timeouts.updateOracle
    );
  });

  describe('without using voucher', () => {
    const consumerWallet = Wallet.createRandom();
    const DEFAULT_WORKERPOOL_ADDRESS =
      '0x0e7Bc972c99187c191A17f3CaE4A2711a4188c3F'; // 'prod-v8-bellecour.main.pools.iexec.eth'
    let signedApporder;
    let signedProdWorkerpoolorder;

    beforeAll(async () => {
      const workerpoolPrice = 1000;
      const volume = 1000;
      signedApporder = await createAndPublishAppOrders(
        OF_APP_ADDRESS,
        TEST_CHAIN.appOwnerWallet,
        workerpoolPrice,
        volume
      );
      signedProdWorkerpoolorder = await createAndPublishWorkerpoolOrder(
        TEST_CHAIN.prodWorkerpool,
        TEST_CHAIN.prodWorkerpoolOwnerWallet,
        undefined,
        workerpoolPrice,
        volume
      );
      const totalCost =
        Number(signedProdWorkerpoolorder.workerpoolprice) +
        Number(signedApporder.appprice);

      const ethProvider = utils.getSignerFromPrivateKey(
        TEST_CHAIN.rpcURL,
        consumerWallet.privateKey
      );
      const iexec = new IExec({ ethProvider }, getTestIExecOption());
      await ensureSufficientStake(iexec, totalCost);
    }, 4 * MAX_EXPECTED_BLOCKTIME);

    test(
      'should create a task - standard oracle from paramSet - no dataset',
      async () => {
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );

        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());

        await ensureSufficientStake(iexec, 100_0000);

        const messages: any = [];
        await new Promise((resolve: any, reject) => {
          factoryWithoutOption
            .updateOracle(
              {
                JSONPath: '$.data',
                body: '',
                dataType: 'string',
                method: 'GET',
                url: 'https://foo.io',
              },
              { useVoucher: false }
            )
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
        expect(messages[1]).toStrictEqual({
          message: 'ENSURE_PARAMS_UPLOAD',
        });
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
        expect(messages[5]).toStrictEqual({
          message: 'FETCH_WORKERPOOL_ORDER',
        });
        expect(messages[6].message).toStrictEqual(
          'FETCH_WORKERPOOL_ORDER_SUCCESS'
        );
        expect(messages[6].order.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[7].message).toStrictEqual(
          'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST'
        );
        expect(messages[7].order.app).toStrictEqual(signedApporder.app);
        expect(messages[7].order.dataset).toStrictEqual(
          '0x0000000000000000000000000000000000000000'
        );
        expect(messages[7].order.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[7].order.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[8].message).toStrictEqual(
          'REQUEST_ORDER_SIGNATURE_SUCCESS'
        );
        expect(messages[8].order.app).toStrictEqual(signedApporder.app);
        expect(messages[8].order.dataset).toStrictEqual(
          '0x0000000000000000000000000000000000000000'
        );
        expect(messages[8].order.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[9].message).toStrictEqual(
          'MATCH_ORDERS_SIGN_TX_REQUEST'
        );
        expect(messages[9].apporder.app).toStrictEqual(signedApporder.app);
        expect(messages[9].workerpoolorder.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[9].datasetorder).toBeUndefined();
        expect(messages[9].requestorder.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[9].requestorder.requester).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[9].requestorder.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
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

    test(
      'should create a task - standard oracle from CID - with dataset',
      async () => {
        const ethProvider = getTestWeb3SignerProvider(
          consumerWallet.privateKey
        );
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
              useVoucher: false,
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
        expect(messages[5].message).toStrictEqual(
          'FETCH_DATASET_ORDER_SUCCESS'
        );
        expect(messages[5].order.dataset).toStrictEqual(datasetAddress);
        expect(messages[5].order.apprestrict).toStrictEqual(
          OF_APP_WHITELIST_ADDRESS
        );
        expect(messages[7].message).toStrictEqual(
          'FETCH_WORKERPOOL_ORDER_SUCCESS'
        );
        expect(messages[7].order.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[8].message).toStrictEqual(
          'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST'
        );
        expect(messages[8].order.app).toStrictEqual(signedApporder.app);
        expect(messages[8].order.dataset).toStrictEqual(datasetAddress);
        expect(messages[8].order.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[8].order.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[9].message).toStrictEqual(
          'REQUEST_ORDER_SIGNATURE_SUCCESS'
        );
        expect(messages[9].order.app).toStrictEqual(signedApporder.app);
        expect(messages[9].order.dataset).toStrictEqual(datasetAddress);
        expect(messages[9].order.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[9].order.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[10].message).toStrictEqual(
          'MATCH_ORDERS_SIGN_TX_REQUEST'
        );
        expect(messages[10].apporder.app).toStrictEqual(signedApporder.app);
        expect(messages[10].workerpoolorder.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
        );
        expect(messages[10].datasetorder.dataset).toStrictEqual(datasetAddress);
        expect(messages[10].requestorder.beneficiary).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[10].requestorder.requester).toStrictEqual(
          consumerWallet.address
        );
        expect(messages[10].requestorder.workerpool).toStrictEqual(
          DEFAULT_WORKERPOOL_ADDRESS
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

    test('update oracle - protocol error unavailable market url', async () => {
      const ethProvider = utils.getSignerFromPrivateKey(
        'bellecour',
        Wallet.createRandom().privateKey
      );
      const factory = new IExecOracleFactory(ethProvider, {
        iexecOptions: {
          iexecGatewayURL: 'https://unavailable.market.url',
        },
      });
      let error: WorkflowError | undefined;
      try {
        await new Promise((resolve: any, reject) => {
          factory
            .updateOracle('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh', {
              targetBlockchains: [137],
            })
            .subscribe({
              complete: resolve,
              error: (e) => {
                reject(e);
              },
              next: () => {},
            });
        });
      } catch (e) {
        error = e as WorkflowError;
      }
      expect(error).toBeInstanceOf(WorkflowError);
      expect(error.message).toBe(
        "A service in the iExec protocol appears to be unavailable. You can retry later or contact iExec's technical support for help."
      );
      expect(error.cause).toStrictEqual(
        new MarketCallError(
          'Connection to https://unavailable.market.url failed with a network error',
          Error('original error trace')
        )
      );
      expect(error.isProtocolError).toBe(true);
    }, 30000);
  });
});

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

test('update oracle - protocol error unavailable market url', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factory = new IExecOracleFactory(ethProvider, {
    iexecOptions: {
      iexecGatewayURL: 'https://unavailable.market.url',
    },
  });
  let error: WorkflowError | undefined;
  try {
    await new Promise((resolve: any, reject) => {
      factory
        .updateOracle('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh', {
          targetBlockchains: [137],
        })
        .subscribe({
          complete: resolve,
          error: (e) => {
            reject(e);
          },
          next: () => {},
        });
    });
  } catch (e) {
    error = e as WorkflowError;
  }
  expect(error).toBeInstanceOf(WorkflowError);
  expect(error.message).toBe(
    "A service in the iExec protocol appears to be unavailable. You can retry later or contact iExec's technical support for help."
  );
  expect(error.cause).toStrictEqual(
    new MarketCallError(
      'Connection to https://unavailable.market.url failed with a network error',
      Error('original error trace')
    )
  );
  expect(error.isProtocolError).toBe(true);
}, 30000);
