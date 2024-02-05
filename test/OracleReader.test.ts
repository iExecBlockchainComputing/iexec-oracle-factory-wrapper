import { jest } from '@jest/globals';
import { getDefaultProvider } from '../src/conf.js';

jest.unstable_mockModule('../src/oracle.js', () => ({
  readOracle: jest.fn(),
}));
// dynamically import tested module after all mocks are loaded
const { readOracle } = await import('../src/oracle.js');
// this will use the already loaded mock of oracle.js
const { default: OracleReader } = await import('../src/OracleReader.js');

afterEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instantiation', async () => {
  const ethProvider = 'bellecour';

  const readerWithOptions = new OracleReader(ethProvider, {
    ipfsGateway: 'ipfsGateway',
    oracleContract: 'contract',
  });
  expect(readerWithOptions).toBeInstanceOf(OracleReader);
  expect(Object.keys(readerWithOptions).length).toBe(1);

  const readerWithoutOption = new OracleReader(ethProvider);

  const expectedProvider = getDefaultProvider('bellecour');

  await readerWithOptions.readOracle('paramSetOrCidOrOracleId');
  expect(readOracle).toHaveBeenNthCalledWith(1, {
    ethersProvider: expectedProvider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: undefined,
    oracleContract: 'contract',
  });

  await readerWithOptions.readOracle('paramSetOrCidOrOracleId', {
    dataType: 'dataType',
  });
  expect(readOracle).toHaveBeenNthCalledWith(2, {
    ethersProvider: expectedProvider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: 'dataType',
    oracleContract: 'contract',
  });

  await readerWithoutOption.readOracle('paramSetOrCidOrOracleId');
  expect(readOracle).toHaveBeenNthCalledWith(3, {
    ethersProvider: expectedProvider,
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
  });

  expect(readOracle).toHaveBeenCalledTimes(3);
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleReader(ethProvider)).toThrow(
    Error('Unsupported ethProvider'),
  );
});
