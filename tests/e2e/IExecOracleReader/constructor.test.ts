import { describe, it, expect } from '@jest/globals';
import { Wallet, ethers, JsonRpcProvider } from 'ethers';
import { DEFAULT_IPFS_GATEWAY } from '../../../src/config/config.js';
import { IExecOracleReader } from '../../../src/index.js';
import { getWeb3ReadOnlyProvider } from '../../../src/utils/getWeb3Provider.js';
import { getTestWeb3SignerProvider, TEST_CHAIN } from '../../test-utils.js';

describe('IExecOracleFactory()', () => {
  it('instantiates with a chainId as ethProviderOrNetwork', async () => {
    const oracleReader = new IExecOracleReader(1);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates with a network name as ethProviderOrNetwork', async () => {
    const oracleReader = new IExecOracleReader('mainnet');
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates with a Web3SignerProvider as ethProviderOrNetwork', async () => {
    const provider = getTestWeb3SignerProvider(
      Wallet.createRandom().privateKey
    );
    const oracleReader = new IExecOracleReader(provider);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates with a Web3ReadOnlyProvider as ethProviderOrNetwork', async () => {
    const provider = getWeb3ReadOnlyProvider(134);
    const oracleReader = new IExecOracleReader(provider);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates with an AbstractProvider as ethProviderOrNetwork', async () => {
    const provider = new JsonRpcProvider('https://bellecour.iex.ec');
    const oracleReader = new IExecOracleReader(provider);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates with a valid ethProviderOrNetwork', async () => {
    const provider = ethers.getDefaultProvider('mainnet');
    const oracleReader = new IExecOracleReader(provider);
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('instantiates without ethProviderOrNetwork', async () => {
    const oracleReader = new IExecOracleReader();
    expect(oracleReader).toBeInstanceOf(IExecOracleReader);
  });

  it('should use default config', async () => {
    const oracleReader = new IExecOracleReader();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const oracleContract = oracleReader['oracleContract'];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ipfsGateway = oracleReader['ipfsGateway'];

    expect(oracleContract).toStrictEqual(undefined);
    expect(ipfsGateway).toStrictEqual(DEFAULT_IPFS_GATEWAY);
  });

  it('should use default ipfs gateway url when ipfsGateway is provided', async () => {
    const customIpfsGateway = TEST_CHAIN.resultProxyURL;
    const provider = ethers.getDefaultProvider(TEST_CHAIN.rpcURL);
    const oracleReader = new IExecOracleReader(provider, {
      ipfsGateway: customIpfsGateway,
    });
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ipfsGateway = oracleReader['ipfsGateway'];
    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
  });

  it('should use provided smart contract address when contractAddress is provided', async () => {
    const customSContractAddress = Wallet.createRandom().address;
    const provider = ethers.getDefaultProvider(TEST_CHAIN.rpcURL);
    const oracleReader = new IExecOracleReader(provider, {
      oracleContract: customSContractAddress,
    });
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const oracleContract = oracleReader['oracleContract'];
    expect(oracleContract).toStrictEqual(customSContractAddress);
  });

  it('should use provided options', async () => {
    const customIpfsGateway = TEST_CHAIN.resultProxyURL;
    const customSContractAddress = Wallet.createRandom().address;
    const provider = ethers.getDefaultProvider(TEST_CHAIN.rpcURL);

    const oracleReader = new IExecOracleReader(provider, {
      oracleContract: customSContractAddress,
      ipfsGateway: customIpfsGateway,
    });

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ipfsGateway = oracleReader['ipfsGateway'];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const oracleContract = oracleReader['oracleContract'];

    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
    expect(oracleContract).toStrictEqual(customSContractAddress);
  });
});
