import {
  AbstractProvider,
  getDefaultProvider as getEthersDefaultProvider,
} from 'ethers';
import { AddressOrENS } from '../index.js';

const API_KEY_PLACEHOLDER: string = '%API_KEY%';

const factoryConfMap: Record<
  number,
  {
    ORACLE_APP_ADDRESS: AddressOrENS;
    ORACLE_APP_WHITELIST_ADDRESS: AddressOrENS;
    ORACLE_CONTRACT_ADDRESS: AddressOrENS;
    WORKERPOOL_ADDRESS: AddressOrENS;
  }
> = {
  134: {
    ORACLE_APP_ADDRESS: 'oracle-factory.apps.iexec.eth',
    ORACLE_APP_WHITELIST_ADDRESS: '0x26472b355849B409769545A8595fe97846a8F0C9',
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
    WORKERPOOL_ADDRESS: 'prod-v8-bellecour.main.pools.iexec.eth',
  },
};

const readerConfMap: Record<number, { ORACLE_CONTRACT_ADDRESS: AddressOrENS }> =
  {
    1: {
      ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
    },
    134: {
      ORACLE_CONTRACT_ADDRESS: factoryConfMap[134].ORACLE_CONTRACT_ADDRESS,
    },
    137: {
      ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
    },
  };

const networkMap: Record<string | number, string> = {
  1: 'homestead',
  134: 'https://bellecour.iex.ec',
  137: 'matic',
  mainnet: 'homestead',
  bellecour: 'https://bellecour.iex.ec',
  polygon: 'matic',
};

const DEFAULT_IPFS_GATEWAY: string = 'https://ipfs-gateway.v8-bellecour.iex.ec';

const DEFAULT_IPFS_UPLOAD_URL: string =
  '/dns4/ipfs-upload.v8-bellecour.iex.ec/https';

const SUPPORTED_TARGET_BLOCKCHAINS: number[] = [1, 137];

const DEFAULT_TARGET_BLOCKCHAIN: number[] = [];

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
): {
  ORACLE_APP_ADDRESS: AddressOrENS;
  ORACLE_APP_WHITELIST_ADDRESS: AddressOrENS;
  ORACLE_CONTRACT_ADDRESS: AddressOrENS;
  WORKERPOOL_ADDRESS: AddressOrENS;
} => {
  const conf = factoryConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getReaderDefaults = (
  chainId: number
): { ORACLE_CONTRACT_ADDRESS: AddressOrENS } => {
  const conf = readerConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getDefaults = (
  chainId: number
): {
  ORACLE_CONTRACT_ADDRESS: AddressOrENS;
  ORACLE_APP_ADDRESS?: AddressOrENS;
  ORACLE_APP_WHITELIST_ADDRESS?: AddressOrENS;
  WORKERPOOL_ADDRESS?: AddressOrENS;
} => {
  const factoryConf = factoryConfMap[chainId];
  const readerConf = readerConfMap[chainId];
  const conf = { ...factoryConf, ...readerConf };
  if (!factoryConf && !readerConf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

export {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_TARGET_BLOCKCHAIN,
  SUPPORTED_TARGET_BLOCKCHAINS,
  getReaderDefaults,
  getFactoryDefaults,
  getDefaults,
  getDefaultProvider,
};
