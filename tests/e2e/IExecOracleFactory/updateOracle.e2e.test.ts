/* eslint-disable jest/no-conditional-expect */
import { beforeAll } from '@jest/globals';
import { Wallet } from 'ethers';
import { IExec, utils } from 'iexec';
import { getFactoryDefaults } from '../../../src/config/config.js';
import { IExecOracleFactory } from '../../../src/index.js';
import { WorkflowError } from '../../../src/utils/errors.js';
import {
  MAX_EXPECTED_BLOCKTIME,
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

// TODO : update iexec-sdk with voucher integration (stable version)
describe('oracleFactory.updateOracle()', () => {
  let signedApporder;

  beforeAll(async () => {
    const ORACLE_APP_ADDRESS = getFactoryDefaults(
      Number(TEST_CHAIN.chainId)
    ).ORACLE_APP_ADDRESS;
    signedApporder = await createAndPublishAppOrders(
      ORACLE_APP_ADDRESS,
      TEST_CHAIN.appOwnerWallet
    );
  }, 4 * MAX_EXPECTED_BLOCKTIME);

  describe('using voucher', () => {
    test(
      'should throw error when the user has no voucher',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
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
          expect(error.message).toBe('Update oracle unexpected error');
          expect(error.originalError).toBeDefined();
          expect(error.originalError.message).toBe(
            `No Voucher found for address ${consumerWallet.address}`
          );
        }
      },
      timeouts.updateOracle
    );

    test(
      'should throw error if : workerpool is sponsored & insufficient voucher balance & voucher not allowed to use the user account',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 1000;
        const voucherAddress = await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        await addVoucherEligibleAsset(TEST_CHAIN.prodWorkerpool, voucherTypeId);
        await addVoucherEligibleAsset(
          TEST_CHAIN.debugWorkerpool,
          voucherTypeId
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const workerpoolorderbook =
          await iexec.orderbook.fetchWorkerpoolOrderbook({
            requester: consumerWallet.address,
          });
        const workerpoolorder =
          workerpoolorderbook &&
          workerpoolorderbook.orders[0] &&
          workerpoolorderbook.orders[0].order;
        const totalWorkerpoolCost =
          workerpoolorder.workerpoolprice * workerpoolorder.volume;

        await expect(
          new Promise((resolve: any, reject) => {
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
          })
        ).rejects.toThrow(
          new WorkflowError(
            `Insufficient voucher balance (${voucherBalance} nRLC) to cover workerpool cost (${totalWorkerpoolCost} nRLC). Authorize the voucher ${voucherAddress} to use account ${consumerWallet.address} to cover the remaining amount`
          )
        );
      },
      timeouts.updateOracle
    );

    test(
      'should throw error if : workerpool is sponsored & insufficient voucher balance & insufficient allowance to cover the additional amount',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 800_000;
        const voucherAddress = await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        await addVoucherEligibleAsset(TEST_CHAIN.prodWorkerpool, voucherTypeId);
        await addVoucherEligibleAsset(
          TEST_CHAIN.debugWorkerpool,
          voucherTypeId
        );
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const workerpoolorderbook =
          await iexec.orderbook.fetchWorkerpoolOrderbook({
            requester: consumerWallet.address,
          });
        const workerpoolorder =
          workerpoolorderbook &&
          workerpoolorderbook.orders[0] &&
          workerpoolorderbook.orders[0].order;
        const totalWorkerpoolCost =
          workerpoolorder.workerpoolprice * workerpoolorder.volume;
        await ensureSufficientStake(iexec, 100_0000);
        await iexec.account.approve(100, voucherAddress);
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        const voucherAllowanceAmount = await iexec.account.checkAllowance(
          consumerWallet.address,
          voucherAddress
        );
        const voucherAllowance = parseInt(voucherAllowanceAmount.toString());
        const additionalAmountRequired = totalWorkerpoolCost - voucherBalance;

        await expect(
          new Promise((resolve: any, reject) => {
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
          })
        ).rejects.toThrow(
          new WorkflowError(
            `Insufficient voucher balance (${voucherBalance} RLC) to cover workerpool cost (${totalWorkerpoolCost} RLC). Insufficient allowance (${voucherAllowance} nRLC) to cover the additional amount (${additionalAmountRequired} nRLC required)`
          )
        );
      },
      timeouts.updateOracle
    );

    test(
      'should create a task if : workerpool is sponsored & insufficient voucher balance & sufficient allowance to cover the additional amount',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 800_000;
        const voucherAddress = await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        await addVoucherEligibleAsset(TEST_CHAIN.prodWorkerpool, voucherTypeId);
        await addVoucherEligibleAsset(
          TEST_CHAIN.debugWorkerpool,
          voucherTypeId
        );
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        await ensureSufficientStake(iexec, 100_0000);
        await iexec.account.approve(100_0000, voucherAddress);
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
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

    test(
      'should throw error if : workerpool is NOT sponsored & insufficient user balance to cover total workerpool cost',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 800_000;
        await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const workerpoolorderbook =
          await iexec.orderbook.fetchWorkerpoolOrderbook({
            requester: consumerWallet.address,
          });
        const workerpoolorder =
          workerpoolorderbook &&
          workerpoolorderbook.orders[0] &&
          workerpoolorderbook.orders[0].order;
        const totalWorkerpoolCost =
          workerpoolorder.workerpoolprice * workerpoolorder.volume;
        const userStakeNumber = 100;
        await ensureSufficientStake(iexec, userStakeNumber);

        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        await expect(
          new Promise((resolve: any, reject) => {
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
          })
        ).rejects.toThrow(
          new WorkflowError(
            `Insufficient user balance (${userStakeNumber} nRLC) to cover workerpool cost (${totalWorkerpoolCost} nRLC).`
          )
        );
      },
      timeouts.updateOracle
    );

    test(
      'should create a task if : workerpool is NOT sponsored & sufficient user balance to cover total workerpool cost',
      async () => {
        const consumerWallet = Wallet.createRandom();
        const voucherTypeId = await createVoucherType({
          description: 'test voucher type',
          duration: 60 * 60,
        });
        const voucherBalance = 10_000;
        await createVoucher({
          owner: consumerWallet.address,
          voucherType: voucherTypeId,
          value: voucherBalance,
        });
        const ethProvider = utils.getSignerFromPrivateKey(
          TEST_CHAIN.rpcURL,
          consumerWallet.privateKey
        );
        const iexec = new IExec({ ethProvider }, getTestIExecOption());
        const userStakeNumber = 1200_000;
        await ensureSufficientStake(iexec, userStakeNumber);
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
        );
        const messages = [];
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
        expect(messages.length).toEqual(12);
      },
      timeouts.updateOracle
    );
  });

  describe('without using voucher - default prod workerpool (free)', () => {
    const consumerWallet = Wallet.createRandom();
    const DEFAULT_WORKERPOOL_ADDRESS =
      '0x0e7Bc972c99187c191A17f3CaE4A2711a4188c3F';
    beforeAll(async () => {
      const workerpoolPrice = 0;
      const volume = 2;
      // create and publish free workerpool order
      await createAndPublishWorkerpoolOrder(
        TEST_CHAIN.prodWorkerpool,
        TEST_CHAIN.prodWorkerpoolOwnerWallet,
        consumerWallet.address,
        workerpoolPrice,
        volume
      );
    });

    test(
      'update oracle - standard from paramSet - no dataset',
      async () => {
        const factoryWithoutOption = new IExecOracleFactory(
          ...getTestConfig(consumerWallet.privateKey)
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
      'standard - from CID',
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
              targetBlockchains: [134],
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
        expect(messages[5].order.apprestrict).toStrictEqual(signedApporder.app);
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
  });
});
