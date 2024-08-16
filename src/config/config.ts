import {
  AbstractProvider,
  getDefaultProvider as getEthersDefaultProvider,
} from 'ethers';
import { AddressOrENS } from '../index.js';
import { getEnvironment, KnownEnv } from '@iexec/oracle-factory-environments';
import 'dotenv/config';

const { ENV = 'bellecour-fork' } = process.env;

const {
  chainId,
  rpcURL,
  hubAddress,
  ensRegistryAddress,
  ensPublicResolverAddress,
  voucherHubAddress,
  smsURL,
  iexecGatewayURL,
  resultProxyURL,
  ipfsGatewayURL,
  ipfsNodeURL,
  pocoSubgraphURL,
  voucherSubgraphURL,

  oracleContract,
  ipfsNode,
  ipfsGateway,
  oracleApp,
  workerpool,
} = getEnvironment(ENV as KnownEnv);

export const iexecOptions = {
  chainId,
  rpcURL,
  hubAddress,
  ensRegistryAddress,
  ensPublicResolverAddress,
  voucherHubAddress,
  smsURL,
  iexecGatewayURL,
  resultProxyURL,
  ipfsGatewayURL,
  ipfsNodeURL,
  pocoSubgraphURL,
  voucherSubgraphURL,
};

export const oracleFactoryOptions = {
  oracleContract,
  oracleApp,
  ipfsNode,
  ipfsGateway,
};

const API_KEY_PLACEHOLDER: string = '%API_KEY%';

const factoryConfMap: Record<
  number,
  { ORACLE_APP_ADDRESS: string; ORACLE_CONTRACT_ADDRESS: string }
> = {
  134: {
    ORACLE_APP_ADDRESS: oracleApp,
    ORACLE_CONTRACT_ADDRESS: oracleContract,
  },
  65535: {
    ORACLE_APP_ADDRESS: oracleApp,
    ORACLE_CONTRACT_ADDRESS: oracleContract,
  },
};

const readerConfMap: Record<number, { ORACLE_CONTRACT_ADDRESS: string }> = {
  1: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  134: {
    ORACLE_CONTRACT_ADDRESS: factoryConfMap[chainId].ORACLE_CONTRACT_ADDRESS,
  },
  137: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  80001: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  65535: {
    ORACLE_CONTRACT_ADDRESS: '0x8d85F35F4941E146F8a40C974865AF03e80CFE0B',
  },
};

const networkMap: Record<string | number, string> = {
  1: 'homestead',
  134: 'https://bellecour.iex.ec',
  65535: 'http://chain.wp-throughput.az1.internal:8545',
  137: 'matic',
  80001: 'matic-mumbai',
  mainnet: 'homestead',
  bellecour: 'https://bellecour.iex.ec',
  polygon: 'matic',
  mumbai: 'matic-mumbai',
};

const DEFAULT_IPFS_GATEWAY: string = ipfsGateway;

const DEFAULT_IPFS_UPLOAD_URL: string = ipfsNode;

const DEFAULT_WORKERPOOL_ADDRESS: string = workerpool;

const SUPPORTED_TARGET_BLOCKCHAINS: number[] = [1, 134, 137, 65535, 80001];

const DEFAULT_TARGET_BLOCKCHAIN: number[] = [Number(chainId)];

const getDefaultProvider = (
  network: string | number = chainId,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
): AbstractProvider => {
  const resolvedNetwork: string | number =
    networkMap[network] || network || networkMap[chainId];
  return getEthersDefaultProvider(resolvedNetwork, options);
};

const getFactoryDefaults = (
  _chainId: number
): { ORACLE_APP_ADDRESS: string; ORACLE_CONTRACT_ADDRESS: string } => {
  const conf = factoryConfMap[_chainId];
  if (!conf) throw Error(`Unsupported chain ${_chainId}`);
  return conf;
};

const getReaderDefaults = (
  _chainId: number
): { ORACLE_CONTRACT_ADDRESS: string } => {
  const conf = readerConfMap[_chainId];
  if (!conf) throw Error(`Unsupported chain ${_chainId}`);
  return conf;
};

const getDefaults = (
  _chainId: number
): { ORACLE_APP_ADDRESS?: string; ORACLE_CONTRACT_ADDRESS?: string } => {
  const factoryConf = factoryConfMap[_chainId];
  const readerConf = readerConfMap[_chainId];
  const conf = { ...factoryConf, ...readerConf };
  if (!factoryConf && !readerConf) throw Error(`Unsupported chain ${_chainId}`);
  return conf;
};

const DEFAULT_ORACLE_CONTRACT_ADDRESS: AddressOrENS = oracleContract;

const DEFAULT_APP_ADDRESS: AddressOrENS = oracleApp;

export {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_APP_ADDRESS,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  DEFAULT_WORKERPOOL_ADDRESS,
  DEFAULT_TARGET_BLOCKCHAIN,
  SUPPORTED_TARGET_BLOCKCHAINS,
  getReaderDefaults,
  getFactoryDefaults,
  getDefaults,
  getDefaultProvider,
};
