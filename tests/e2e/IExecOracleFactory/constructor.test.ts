/* eslint-disable @typescript-eslint/dot-notation */
// needed to access and assert IExecDataProtector's private properties
import { describe, it, expect } from '@jest/globals';
import { Wallet, JsonRpcProvider } from 'ethers';
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
} from '../../../src/config/config.js';
import { IExecOracleFactory, getWeb3Provider } from '../../../src/index.js';

describe('IExecOracleFactory()', () => {
  it('should use default ipfs node url when ipfsNode is not provided', async () => {
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey)
    );
    const ipfsNode = oracleFactory['ipfsNode'];
    expect(ipfsNode).toStrictEqual(DEFAULT_IPFS_UPLOAD_URL);
  });
  it('should use provided ipfs node url when ipfsNode is provided', async () => {
    const customIpfsUploadUrl = 'https://example.com/node';
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey),
      {
        ipfsNode: customIpfsUploadUrl,
      }
    );
    const ipfsNode = oracleFactory['ipfsNode'];
    expect(ipfsNode).toStrictEqual(customIpfsUploadUrl);
  });
  it('should use default ipfs gateway url when ipfsGateway is not provided', async () => {
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey)
    );
    const ipfsGateway = oracleFactory['ipfsGateway'];
    expect(ipfsGateway).toStrictEqual(DEFAULT_IPFS_GATEWAY);
  });
  it('should use default ipfs gateway url when ipfsGateway is provided', async () => {
    const customIpfsGateway = 'https://example.com/ipfs_gateway';
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey),
      {
        ipfsGateway: customIpfsGateway,
      }
    );
    const ipfsGateway = oracleFactory['ipfsGateway'];
    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
  });
  it('should use default smart contract address when contractAddress is not provided', async () => {
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey)
    );
    const oracleContract = oracleFactory['oracleContract'];
    expect(oracleContract).toStrictEqual(undefined);
  });
  it('should use provided smart contract address when contractAddress is provided', async () => {
    const customSContractAddress = Wallet.createRandom().address;
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey),
      {
        oracleContract: customSContractAddress,
      }
    );
    const oracleContract = oracleFactory['oracleContract'];
    expect(oracleContract).toStrictEqual(customSContractAddress);
  });

  it('should use provided workerpool address when workerpool is provided', async () => {
    const customWorkerpoolAddress = Wallet.createRandom().address;
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey),
      {
        workerpool: customWorkerpoolAddress,
      }
    );
    const oracleContract = oracleFactory['workerpool'];
    expect(oracleContract).toStrictEqual(customWorkerpoolAddress);
  });

  it('should use provided options', async () => {
    const customIpfsGateway = 'https://example.com/ipfs_gateway';
    const customWorkerpoolAddress = Wallet.createRandom().address;
    const customSContractAddress = Wallet.createRandom().address;
    const customAppAddress = Wallet.createRandom().address;
    const customIpfsUploadUrl = 'https://example.com/node';
    const smsURL = 'https://custom-sms-url.com';
    const iexecGatewayURL = 'https://custom-market-api-url.com';
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(Wallet.createRandom().privateKey),
      {
        oracleContract: customSContractAddress,
        oracleApp: customAppAddress,
        ipfsGateway: customIpfsGateway,
        ipfsNode: customIpfsUploadUrl,
        workerpool: customWorkerpoolAddress,
        iexecOptions: {
          smsURL,
          iexecGatewayURL,
        },
      }
    );
    const ipfsNode = oracleFactory['ipfsNode'];
    const ipfsGateway = oracleFactory['ipfsGateway'];
    const oracleContract = oracleFactory['oracleContract'];
    const oracleApp = oracleFactory['oracleApp'];
    const workerpool = oracleFactory['workerpool'];
    const iexec = oracleFactory['iexec'];
    expect(ipfsNode).toStrictEqual(customIpfsUploadUrl);
    expect(ipfsGateway).toStrictEqual(customIpfsGateway);
    expect(oracleContract).toStrictEqual(customSContractAddress);
    expect(oracleApp).toStrictEqual(customAppAddress);
    expect(workerpool).toStrictEqual(customWorkerpoolAddress);
    expect(await iexec.config.resolveSmsURL()).toBe(smsURL);
    expect(await iexec.config.resolveIexecGatewayURL()).toBe(iexecGatewayURL);
  });
  it('throw when instantiated with an invalid ethProvider', async () => {
    const invalidProvider: any = null;
    expect(() => new IExecOracleFactory(invalidProvider)).toThrow(
      Error('Unsupported ethProvider, Missing ethProvider')
    );
  });
  it('instantiates with getWeb3Provider as ethProvider', async () => {
    const wallet = Wallet.createRandom();
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(wallet.privateKey)
    );
    expect(oracleFactory).toBeInstanceOf(IExecOracleFactory);
  });
  it('instantiates with an AbstractSigner as ethProvider', async () => {
    const wallet = Wallet.createRandom(
      new JsonRpcProvider('https://bellecour.iex.ec')
    );
    const oracleFactory = new IExecOracleFactory(wallet);
    expect(oracleFactory).toBeInstanceOf(IExecOracleFactory);
  });
  it('instantiates with a valid ethProvider and iexecOptions', async () => {
    const smsURL = 'https://custom-sms-url.com';
    const wallet = Wallet.createRandom();
    const oracleFactory = new IExecOracleFactory(
      getWeb3Provider(wallet.privateKey),
      {
        iexecOptions: {
          smsURL,
        },
      }
    );
    const iexec = oracleFactory['iexec'];
    expect(await iexec.config.resolveSmsURL()).toBe(smsURL);
  });
});
