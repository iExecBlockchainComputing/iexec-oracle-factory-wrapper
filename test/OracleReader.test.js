import { utils } from 'iexec';
import { Wallet } from 'ethers';
import OracleFactory from '../src/OracleFactory.js';

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
  expect(Object.keys(factoryWithOptions).length).toBe(4);
  expect(factoryWithoutOption).toBeInstanceOf(OracleFactory);
  expect(Object.keys(factoryWithoutOption).length).toBe(4);
});

test('error - invalid provider', () => {
  const ethProvider = {};
  expect(() => new OracleFactory(ethProvider)).toThrow(
    Error('Unsupported ethProvider'),
  );
});
