const { IExec, utils } = require('iexec');
const { Wallet } = require('ethers');
const OracleFactory = require('../src/OracleFactory');
const oracle = require('../src/oracle');

jest.mock('../src/oracle');

afterEach(() => {
  jest.resetAllMocks();
});

test('standard - instanciation', async () => {
  const createOracleSpy = jest.spyOn(oracle, 'createOracle').mockReturnValue();
  const updateOracleSpy = jest.spyOn(oracle, 'updateOracle').mockReturnValue();
  const readOracleSpy = jest.spyOn(oracle, 'readOracle').mockReturnValue();

  const ethProvider = utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey);
  const factory = new OracleFactory(ethProvider, '5', { ipfsGateway: 'ipfsGateway' });
  expect(factory).toBeInstanceOf(OracleFactory);
  expect(Object.keys(factory).length).toBe(4);

  const factory2 = new OracleFactory(ethProvider, '5');
  oracle.createOracle = jest.fn();
  oracle.updateOracle = jest.fn().mockReturnValueOnce();
  oracle.readOracle = jest.fn().mockResolvedValueOnce();
  const iexec = factory.getIExec();
  factory.createOracle('rawParams');
  factory2.createOracle('rawParams');
  factory.updateOracle('paramsSetOrCid');
  factory.updateOracle('paramsSetOrCid', { workerpool: 'workerpool' });
  await factory.readOracle('paramsSetOrCidOrOracleId');
  await factory.readOracle('paramsSetOrCidOrOracleId', { dataType: 'dataType' });

  expect(iexec).toBeInstanceOf(IExec);
  expect(createOracleSpy).toHaveBeenCalledTimes(2);
  expect(updateOracleSpy).toHaveBeenCalledTimes(2);
  expect(readOracleSpy).toHaveBeenCalledTimes(2);
  expect(createOracleSpy).toHaveBeenNthCalledWith(1, {
    iexec,
    rawParams: 'rawParams',
    ipfsGateway: 'ipfsGateway',
  });
  expect(updateOracleSpy).toHaveBeenNthCalledWith(1, {
    iexec,
    ipfsGateway: 'ipfsGateway',
    paramsSetOrCid: 'paramsSetOrCid',
    workerpool: undefined,
  });
  expect(updateOracleSpy).toHaveBeenNthCalledWith(2, {
    iexec,
    ipfsGateway: 'ipfsGateway',
    paramsSetOrCid: 'paramsSetOrCid',
    workerpool: 'workerpool',
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(1, {
    ethersProvider: ethProvider.provider,
    chainId: '5',
    ipfsGateway: 'ipfsGateway',
    paramsSetOrCidOrOracleId: 'paramsSetOrCidOrOracleId',
    dataType: undefined,
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(2, {
    ethersProvider: ethProvider.provider,
    chainId: '5',
    ipfsGateway: 'ipfsGateway',
    paramsSetOrCidOrOracleId: 'paramsSetOrCidOrOracleId',
    dataType: 'dataType',
  });
});

test('error - unsupported chain', () => {
  const ethProvider = utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey);
  expect(() => new OracleFactory(ethProvider, '4')).toThrow(Error('Unsupported chain 4'));
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleFactory(ethProvider, '5')).toThrow(Error('Unsupported ethProvider'));
});