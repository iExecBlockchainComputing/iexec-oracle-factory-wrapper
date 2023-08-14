import { jest } from '@jest/globals';
import OracleReader from '../src/OracleReader.js';
import * as oracle from '../src/oracle.js';
import { getDefaultProvider } from '../src/conf.js';

jest.mock('../src/oracle');

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instantiation', async () => {
  const readOracleSpy = jest.spyOn(oracle, 'readOracle').mockReturnValue();

  const ethProvider = 'viviani';

  const readerWithOptions = new OracleReader(ethProvider, {
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'contract',
  });
  expect(readerWithOptions).toBeInstanceOf(OracleReader);
  expect(Object.keys(readerWithOptions).length).toBe(1);

  const readerWithoutOption = new OracleReader(ethProvider);

  oracle.readOracle = jest.fn().mockResolvedValueOnce();

  const expectedProvider = getDefaultProvider('viviani');

  await readerWithOptions.readOracle('paramSetOrCidOrOracleId');
  expect(readOracleSpy).toHaveBeenNthCalledWith(1, {
    ethersProvider: expectedProvider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: undefined,
    oracleContract: 'contract',
  });

  await readerWithOptions.readOracle('paramSetOrCidOrOracleId', {
    dataType: 'dataType',
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(2, {
    ethersProvider: expectedProvider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: 'dataType',
    oracleContract: 'contract',
  });

  await readerWithoutOption.readOracle('paramSetOrCidOrOracleId');
  expect(readOracleSpy).toHaveBeenNthCalledWith(3, {
    ethersProvider: expectedProvider,
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  });

  expect(readOracleSpy).toHaveBeenCalledTimes(3);
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleReader(ethProvider)).toThrow(
    Error('Unsupported ethProvider'),
  );
});
