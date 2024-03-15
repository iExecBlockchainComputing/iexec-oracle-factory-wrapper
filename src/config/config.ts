import {
  AbstractProvider,
  getDefaultProvider as getEthersDefaultProvider,
} from 'ethers';
import { AddressOrENS } from '../index.js';

const API_KEY_PLACEHOLDER: string = '%API_KEY%';

const factoryConfMap: Record<
  number,
  { ORACLE_APP_ADDRESS: string; ORACLE_CONTRACT_ADDRESS: string }
> = {
  134: {
    ORACLE_APP_ADDRESS: 'oracle-factory.apps.iexec.eth',
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
};

const readerConfMap: Record<number, { ORACLE_CONTRACT_ADDRESS: string }> = {
  1: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  5: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  134: {
    ORACLE_CONTRACT_ADDRESS: factoryConfMap[134].ORACLE_CONTRACT_ADDRESS,
  },
  137: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
  80001: {
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
};

const networkMap: Record<string | number, string> = {
  1: 'homestead',
  5: 'goerli',
  134: 'https://bellecour.iex.ec',
  137: 'matic',
  80001: 'matic-mumbai',
  mainnet: 'homestead',
  goerli: 'goerli',
  bellecour: 'https://bellecour.iex.ec',
  polygon: 'matic',
  mumbai: 'matic-mumbai',
};

const DEFAULT_IPFS_GATEWAY: string = 'https://ipfs-gateway.v8-bellecour.iex.ec';

const DEFAULT_IPFS_UPLOAD_URL: string =
  '/dns4/ipfs-upload.v8-bellecour.iex.ec/https';

const DEFAULT_WORKERPOOL_ADDRESS: string =
  'prod-v8-bellecour.main.pools.iexec.eth';

const DEFAULT_TARGET_BLOCKCHAIN: number[] = [134];

const getDefaultProvider = (
  network: string | number = 134,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
): AbstractProvider => {
  const resolvedNetwork: string | number =
    networkMap[network] || network || networkMap[134];
  return getEthersDefaultProvider(resolvedNetwork, options);
};

const getFactoryDefaults = (
  chainId: number
): { ORACLE_APP_ADDRESS: string; ORACLE_CONTRACT_ADDRESS: string } => {
  const conf = factoryConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getReaderDefaults = (
  chainId: number
): { ORACLE_CONTRACT_ADDRESS: string } => {
  const conf = readerConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getDefaults = (
  chainId: number
): { ORACLE_APP_ADDRESS?: string; ORACLE_CONTRACT_ADDRESS?: string } => {
  const factoryConf = factoryConfMap[chainId];
  const readerConf = readerConfMap[chainId];
  const conf = { ...factoryConf, ...readerConf };
  if (!factoryConf && !readerConf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const DEFAULT_ORACLE_CONTRACT_ADDRESS: AddressOrENS =
  '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E';

const DEFAULT_APP_ADDRESS: AddressOrENS = 'oracle-factory.apps.iexec.eth';

export {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_APP_ADDRESS,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  DEFAULT_WORKERPOOL_ADDRESS,
  DEFAULT_TARGET_BLOCKCHAIN,
  getReaderDefaults,
  getFactoryDefaults,
  getDefaults,
  getDefaultProvider,
};
