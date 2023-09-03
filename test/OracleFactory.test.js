import { jest } from '@jest/globals';
import { IExec, utils } from 'iexec';
import { Wallet } from 'ethers';
import OracleFactory from '../src/OracleFactory.js';

jest.unstable_mockModule('../src/oracle.js', () => ({
  createOracle: jest.fn(),
  updateOracle: jest.fn(),
  readOracle: jest.fn(),
}));
// dynamically import tested module after all mock are loaded
const { createOracle, updateOracle, readOracle } = await import(
  '../src/oracle.js'
);

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instantiation', async () => {
  const ethProvider = utils.getSignerFromPrivateKey(
    'bellecour',
    Wallet.createRandom().privateKey,
  );
  const factoryWithOptions = new OracleFactory(ethProvider, {
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
  });
  const factoryWithoutOption = new OracleFactory(ethProvider);

  expect(factoryWithOptions).toBeInstanceOf(OracleFactory);
  expect(Object.keys(factoryWithOptions).length).toBe(4);
  expect(factoryWithoutOption).toBeInstanceOf(OracleFactory);
  expect(Object.keys(factoryWithoutOption).length).toBe(4);

  const iexecWithOptions = factoryWithOptions.getIExec();
  expect(iexecWithOptions).toBeInstanceOf(IExec);

  const iexecWithoutOption = factoryWithoutOption.getIExec();
  expect(iexecWithoutOption).toBeInstanceOf(IExec);

  // factoryWithOptions.createOracle('rawParams');
  // expect(createOracle).toHaveBeenNthCalledWith(1, {
  //   iexec: iexecWithOptions,
  //   ipfsGateway: 'ipfsGateway',
  //   oracleApp: 'oracleApp',
  //   rawParams: 'rawParams',
  // });

  // factoryWithoutOption.createOracle('rawParams');
  // expect(createOracle).toHaveBeenNthCalledWith(2, {
  //   iexec: iexecWithoutOption,
  //   rawParams: 'rawParams',
  // });

  // factoryWithOptions.updateOracle('paramSetOrCid');
  // expect(updateOracle).toHaveBeenNthCalledWith(1, {
  //   iexec: iexecWithOptions,
  //   ipfsGateway: 'ipfsGateway',
  //   oracleContract: 'oracleContract',
  //   oracleApp: 'oracleApp',
  //   paramSetOrCid: 'paramSetOrCid',
  // });

  // factoryWithOptions.updateOracle('paramSetOrCid', {
  //   workerpool: 'workerpool',
  // });
  // expect(updateOracle).toHaveBeenNthCalledWith(2, {
  //   iexec: iexecWithOptions,
  //   ipfsGateway: 'ipfsGateway',
  //   oracleContract: 'oracleContract',
  //   oracleApp: 'oracleApp',
  //   paramSetOrCid: 'paramSetOrCid',
  //   workerpool: 'workerpool',
  // });

  // factoryWithoutOption.updateOracle('paramSetOrCid');
  // expect(updateOracle).toHaveBeenNthCalledWith(3, {
  //   iexec: iexecWithoutOption,
  //   paramSetOrCid: 'paramSetOrCid',
  // });

  // await factoryWithOptions.readOracle('paramSetOrCidOrOracleId');
  // expect(readOracle).toHaveBeenNthCalledWith(1, {
  //   ethersProvider: ethProvider.provider,
  //   ipfsGateway: 'ipfsGateway',
  //   oracleContract: 'oracleContract',
  //   paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  // });

  // await factoryWithOptions.readOracle('paramSetOrCidOrOracleId', {
  //   dataType: 'dataType',
  // });
  // expect(readOracle).toHaveBeenNthCalledWith(2, {
  //   ethersProvider: ethProvider.provider,
  //   ipfsGateway: 'ipfsGateway',
  //   oracleContract: 'oracleContract',
  //   paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  //   dataType: 'dataType',
  // });

  // await factoryWithoutOption.readOracle('paramSetOrCidOrOracleId');
  // expect(readOracle).toHaveBeenNthCalledWith(3, {
  //   ethersProvider: ethProvider.provider,
  //   paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  // });

  // expect(createOracle).toHaveBeenCalledTimes(2);
  // expect(updateOracle).toHaveBeenCalledTimes(3);
  // expect(readOracle).toHaveBeenCalledTimes(3);
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleFactory(ethProvider)).toThrow(
    Error('Unsupported ethProvider'),
  );
});
