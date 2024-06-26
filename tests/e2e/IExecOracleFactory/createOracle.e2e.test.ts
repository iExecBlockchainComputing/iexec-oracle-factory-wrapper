import { Wallet } from 'ethers';
import { utils } from 'iexec';
import { SmsCallError, MarketCallError } from 'iexec/errors';
import { IExecOracleFactory } from '../../../src/index.js';
import { WorkflowError } from '../../../src/utils/errors.js';

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

test('create oracle - protocol error by unavailable sms url', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factory = new IExecOracleFactory(ethProvider, {
    iexecOptions: {
      // iexecGatewayURL: 'https://invalidurl',
      smsURL: 'https://unavailable.sms.url',
    },
  });
  let error: WorkflowError | undefined;
  try {
    await new Promise((resolve: any, reject) => {
      factory
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
    new SmsCallError(
      'Connection to https://unavailable.sms.url failed with a network error',
      Error('original error trace')
    )
  );
  expect(error.isProtocolError).toBe(true);
}, 30000);

test('create oracle - protocol error unavailable market url', async () => {
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
