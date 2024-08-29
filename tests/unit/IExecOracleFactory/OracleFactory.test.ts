import { jest } from '@jest/globals';
import { Wallet } from 'ethers';
import { IExec, utils } from 'iexec';
import {
  DEFAULT_APP_ADDRESS,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  DEFAULT_WORKERPOOL_ADDRESS,
} from '../../../src/config/config.js';
import { iexecOptions } from '../../test-utils.js';

jest.unstable_mockModule('../../../src/oracleFactory/createOracle.js', () => ({
  createOracle: jest.fn(),
}));
jest.unstable_mockModule('../../../src/oracleFactory/updateOracle.js', () => ({
  updateOracle: jest.fn(),
}));
jest.unstable_mockModule('../../../src/oracleFactory/readOracle.js', () => ({
  readOracle: jest.fn(),
}));

// dynamically import tested module after all mocks are loaded
const { createOracle } = await import(
  '../../../src/oracleFactory/createOracle.js'
);
const { updateOracle } = await import(
  '../../../src/oracleFactory/updateOracle.js'
);
const { readOracle } = await import('../../../src/oracleFactory/readOracle.js');

// this will use the already loaded mock of oracle.js
const { IExecOracleFactory } = await import(
  '../../../src/oracleFactory/OracleFactory.js'
);

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instantiation', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey
  );
  const factoryWithOptions = new IExecOracleFactory(ethProvider, {
    ipfsGateway: 'ipfsGateway',
    ipfsNode: 'ipfsNode',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
  });
  const factoryWithoutOption = new IExecOracleFactory(ethProvider);
  expect(factoryWithOptions).toBeInstanceOf(IExecOracleFactory);
  expect(Object.keys(factoryWithOptions).length).toBe(11);
  expect(factoryWithoutOption).toBeInstanceOf(IExecOracleFactory);
  expect(Object.keys(factoryWithoutOption).length).toBe(11);

  const iexecWithOptions = factoryWithOptions.getIExec();
  expect(iexecWithOptions).toBeInstanceOf(IExec);

  const iexecWithoutOption = factoryWithoutOption.getIExec();
  expect(iexecWithoutOption).toBeInstanceOf(IExec);

  factoryWithOptions.createOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    apiKey: 'foo',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });
  expect(createOracle).toHaveBeenNthCalledWith(1, {
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    ipfsNode: 'ipfsNode',
    oracleApp: 'oracleApp',
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    apiKey: 'foo',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });

  factoryWithoutOption.createOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });

  expect(createOracle).toHaveBeenNthCalledWith(2, {
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
    iexec: iexecWithoutOption,
    ipfsGateway: DEFAULT_IPFS_GATEWAY,
    ipfsNode: DEFAULT_IPFS_UPLOAD_URL,
    oracleApp: DEFAULT_APP_ADDRESS,
  });

  factoryWithOptions.updateOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    dataset: '0x0000000000000000000000000000000000000000',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });
  expect(updateOracle).toHaveBeenNthCalledWith(1, {
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    ipfsNode: 'ipfsNode',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
    workerpool: DEFAULT_WORKERPOOL_ADDRESS,
    paramSetOrCid: {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
    useVoucher: false,
    targetBlockchains: [Number(iexecOptions.chainId)],
  });

  factoryWithOptions.updateOracle(
    {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
    {
      targetBlockchains: [80001, 137],
    }
  );
  expect(updateOracle).toHaveBeenNthCalledWith(2, {
    paramSetOrCid: {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
    useVoucher: false,
    targetBlockchains: [80001, 137],
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    ipfsNode: 'ipfsNode',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
    workerpool: DEFAULT_WORKERPOOL_ADDRESS,
  });

  factoryWithoutOption.updateOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    dataset: '0x0000000000000000000000000000000000000000',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });
  expect(updateOracle).toHaveBeenNthCalledWith(3, {
    iexec: iexecWithoutOption,
    ipfsGateway: DEFAULT_IPFS_GATEWAY,
    ipfsNode: DEFAULT_IPFS_UPLOAD_URL,
    oracleApp: DEFAULT_APP_ADDRESS,
    oracleContract: DEFAULT_ORACLE_CONTRACT_ADDRESS,
    workerpool: DEFAULT_WORKERPOOL_ADDRESS,
    paramSetOrCid: {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
    useVoucher: false,
    targetBlockchains: [Number(iexecOptions.chainId)],
  });

  await factoryWithOptions.readOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    dataset: '0x0000000000000000000000000000000000000000',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });

  expect(readOracle).toHaveBeenNthCalledWith(1, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    paramSetOrCidOrOracleId: {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
  });

  await factoryWithOptions.readOracle({
    JSONPath: '$.ok',
    body: '',
    dataType: 'boolean',
    dataset: '0x0000000000000000000000000000000000000000',
    headers: {},
    method: 'GET',
    url: 'https://api.market.iex.ec/version',
  });

  expect(readOracle).toHaveBeenNthCalledWith(2, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    paramSetOrCidOrOracleId: {
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    },
  });

  await factoryWithoutOption.readOracle('paramSetOrCidOrOracleId');
  expect(readOracle).toHaveBeenNthCalledWith(3, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: DEFAULT_IPFS_GATEWAY,
    oracleContract: DEFAULT_ORACLE_CONTRACT_ADDRESS,
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  });

  expect(createOracle).toHaveBeenCalledTimes(2);
  expect(updateOracle).toHaveBeenCalledTimes(3);
  expect(readOracle).toHaveBeenCalledTimes(3);
});
