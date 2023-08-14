import { jest } from '@jest/globals';
import { IExec, utils } from 'iexec';
import { Wallet } from 'ethers';
import OracleFactory from '../src/OracleFactory.js';
import * as oracle from '../src/oracle.js';


jest.mock('../src/oracle');

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instantiation', async () => {
  const createOracleSpy = jest.spyOn(oracle, 'createOracle').mockReturnValue();
  const updateOracleSpy = jest.spyOn(oracle, 'updateOracle').mockReturnValue();
  const readOracleSpy = jest.spyOn(oracle, 'readOracle').mockReturnValue();

  const ethProvider = utils.getSignerFromPrivateKey(
    'goerli',
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

  oracle.createOracle = jest.fn();
  oracle.updateOracle = jest.fn().mockReturnValueOnce();
  oracle.readOracle = jest.fn().mockResolvedValueOnce();

  const iexecWithOptions = factoryWithOptions.getIExec();
  expect(iexecWithOptions).toBeInstanceOf(IExec);

  const iexecWithoutOption = factoryWithoutOption.getIExec();
  expect(iexecWithoutOption).toBeInstanceOf(IExec);

  factoryWithOptions.createOracle('rawParams');
  expect(createOracleSpy).toHaveBeenNthCalledWith(1, {
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    oracleApp: 'oracleApp',
    rawParams: 'rawParams',
  });

  factoryWithoutOption.createOracle('rawParams');
  expect(createOracleSpy).toHaveBeenNthCalledWith(2, {
    iexec: iexecWithoutOption,
    rawParams: 'rawParams',
  });

  factoryWithOptions.updateOracle('paramSetOrCid');
  expect(updateOracleSpy).toHaveBeenNthCalledWith(1, {
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
    paramSetOrCid: 'paramSetOrCid',
  });

  factoryWithOptions.updateOracle('paramSetOrCid', {
    workerpool: 'workerpool',
  });
  expect(updateOracleSpy).toHaveBeenNthCalledWith(2, {
    iexec: iexecWithOptions,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    oracleApp: 'oracleApp',
    paramSetOrCid: 'paramSetOrCid',
    workerpool: 'workerpool',
  });

  factoryWithoutOption.updateOracle('paramSetOrCid');
  expect(updateOracleSpy).toHaveBeenNthCalledWith(3, {
    iexec: iexecWithoutOption,
    paramSetOrCid: 'paramSetOrCid',
  });

  await factoryWithOptions.readOracle('paramSetOrCidOrOracleId');
  expect(readOracleSpy).toHaveBeenNthCalledWith(1, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  });

  await factoryWithOptions.readOracle('paramSetOrCidOrOracleId', {
    dataType: 'dataType',
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(2, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'oracleContract',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: 'dataType',
  });

  await factoryWithoutOption.readOracle('paramSetOrCidOrOracleId');
  expect(readOracleSpy).toHaveBeenNthCalledWith(3, {
    ethersProvider: ethProvider.provider,
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  });

  expect(createOracleSpy).toHaveBeenCalledTimes(2);
  expect(updateOracleSpy).toHaveBeenCalledTimes(3);
  expect(readOracleSpy).toHaveBeenCalledTimes(3);
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleFactory(ethProvider)).toThrow(
    Error('Unsupported ethProvider'),
  );
});
