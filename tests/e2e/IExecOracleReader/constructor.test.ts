import { describe, it, expect } from '@jest/globals';
import { Wallet, ethers } from 'ethers';
import {
  IExecOracleReader,
} from '../../../dist/index.js';
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
} from '../../../src/config/config';

describe('IExecOracleFactory()', () => {
  it('instantiates with a valid ethProvider', async () => {
    const provider = ethers.getDefaultProvider('mainnet');
    const oracleReader = new IExecOracleReader(provider);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates without ethProvider', async () => {
    const oracleReader = new IExecOracleReader();
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('should use default config', async () => {
    const oracleReader = new IExecOracleReader();
    const oracleContract = oracleReader.oracleContract;
    const ipfsGateway = oracleReader.ipfsGateway;

    expect(oracleContract).toStrictEqual(DEFAULT_ORACLE_CONTRACT_ADDRESS);
    expect(ipfsGateway).toStrictEqual(DEFAULT_IPFS_GATEWAY);
  });

  it('should use default ipfs gateway url when ipfsGateway is provided', async () => {
    const customIpfsGateway = 'https://example.com/ipfs_gateway';
    const provider = ethers.getDefaultProvider('https://bellecour.iex.ec');
    const oracleReader = new IExecOracleReader(provider, {
      ipfsGateway: customIpfsGateway,
    });
    const ipfsGateway = oracleReader.ipfsGateway;
    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
  });

  it('should use provided smart contract address when contractAddress is provided', async () => {
    const customSContractAddress = Wallet.createRandom().address;
    const provider = ethers.getDefaultProvider('https://bellecour.iex.ec');
    const oracleReader = new IExecOracleReader(provider, {
      oracleContract: customSContractAddress,
    });
    const oracleContract = oracleReader.oracleContract;
    expect(oracleContract).toStrictEqual(customSContractAddress);
  });

  it('should use provided options', async () => {
    const customIpfsGateway = 'https://example.com/ipfs_gateway';
    const customSContractAddress = Wallet.createRandom().address;
    const provider = ethers.getDefaultProvider('https://bellecour.iex.ec');

    const oracleReader = new IExecOracleReader(provider, {
      oracleContract: customSContractAddress,
      ipfsGateway: customIpfsGateway,
    });

    const ipfsGateway = oracleReader.ipfsGateway;
    const oracleContract = oracleReader.oracleContract;

    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
    expect(oracleContract).toStrictEqual(customSContractAddress);
  });
});
