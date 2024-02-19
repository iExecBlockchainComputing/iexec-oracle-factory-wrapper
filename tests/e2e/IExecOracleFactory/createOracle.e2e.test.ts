import { Wallet } from 'ethers';
import { utils } from 'iexec';
import { IExecOracleFactory } from '../../../src/index.js';

test('create oracle - without dataset', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

  const messages: any = [];
  await new Promise((resolve: any, reject) => {
    factoryWithoutOption
      .createOracle({
        JSONPath: '$.ok',
        body: '',
        dataType: 'boolean',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.market.iex.ec/version',
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
  expect(messages.length).toBe(3);
});

test('create oracle - with dataset', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

  const messages: any = [];
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
          messages.push(value);
        },
      });
  });
  expect(messages.length).toBe(14);
}, 30000);

test('cancel - without apiKey', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

  const messages: any[] = [];
  await new Promise((resolve: any, reject) => {
    const cancel = factoryWithoutOption
      .createOracle({
        url: 'https://foo.io',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.data',
      })
      .subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
          cancel();
          setTimeout(() => resolve(), 5000);
        },
      });
  });
  expect(messages.length).toBe(1);
}, 10000);

test('cancel - with apiKey', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);

  const messages: any[] = [];
  await new Promise((resolve: any, reject) => {
    const cancel = factoryWithoutOption
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
          messages.push(value);
          cancel();
          setTimeout(() => resolve(), 5000);
        },
      });
  });
  expect(messages.length).toBe(1);
  expect(messages[0].message).toStrictEqual('ENCRYPTION_KEY_CREATED');
}, 10000);
