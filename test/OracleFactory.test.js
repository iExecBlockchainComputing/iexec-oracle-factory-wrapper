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
  const factory = new OracleFactory(ethProvider, { ipfsGateway: 'ipfsGateway' });
  expect(factory).toBeInstanceOf(OracleFactory);
  expect(Object.keys(factory).length).toBe(4);

  const factory2 = new OracleFactory(ethProvider);
  oracle.createOracle = jest.fn();
  oracle.updateOracle = jest.fn().mockReturnValueOnce();
  oracle.readOracle = jest.fn().mockResolvedValueOnce();
  const iexec = factory.getIExec();
  factory.createOracle('rawParams');
  factory2.createOracle('rawParams');
  factory.updateOracle('paramSetOrCid');
  factory.updateOracle('paramSetOrCid', { workerpool: 'workerpool' });
  await factory.readOracle('paramSetOrCidOrOracleId');
  await factory.readOracle('paramSetOrCidOrOracleId', { dataType: 'dataType' });

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
    paramSetOrCid: 'paramSetOrCid',
    workerpool: undefined,
  });
  expect(updateOracleSpy).toHaveBeenNthCalledWith(2, {
    iexec,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCid: 'paramSetOrCid',
    workerpool: 'workerpool',
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(1, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: undefined,
  });
  expect(readOracleSpy).toHaveBeenNthCalledWith(2, {
    ethersProvider: ethProvider.provider,
    ipfsGateway: 'ipfsGateway',
    paramSetOrCidOrOracleId: 'paramSetOrCidOrOracleId',
    dataType: 'dataType',
  });
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleFactory(ethProvider)).toThrow(Error('Unsupported ethProvider'));
});
