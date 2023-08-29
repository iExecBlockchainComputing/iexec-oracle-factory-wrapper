import { getDefaultProvider as getEthersDefaultProvider } from 'ethers';

const API_KEY_PLACEHOLDER = '%API_KEY%';

const factoryConfMap = {
  134: {
    ORACLE_APP_ADDRESS: 'oracle-factory.apps.iexec.eth',
    ORACLE_CONTRACT_ADDRESS: '0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E',
  },
};

const readerConfMap = {
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

const networkMap = {
  1: 'homestead',
  5: 'goerli',
  134: 'https://bellecour.iex.ec',
  137: 'matic',
  80001: 'https://matic-mumbai.chainstacklabs.com',
  mainnet: 'homestead',
  goerli: 'goerli',
  bellecour: 'https://bellecour.iex.ec',
  polygon: 'matic',
  mumbai: 'https://matic-mumbai.chainstacklabs.com',
};

const DEFAULT_IPFS_GATEWAY = 'https://ipfs-gateway.v8-bellecour.iex.ec';
const IPFS_UPLOAD_URL = '/dns4/ipfs-upload.v8-bellecour.iex.ec/https';
const getDefaultProvider = (network, options) => {
  const resolvedNetwork = networkMap[network] || network;
  return getEthersDefaultProvider(resolvedNetwork, options);
};

const getFactoryDefaults = (chainId) => {
  const conf = factoryConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getReaderDefaults = (chainId) => {
  const conf = readerConfMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const getDefaults = (chainId) => {
  const factoryConf = factoryConfMap[chainId];
  const readerConf = readerConfMap[chainId];
  const conf = { ...factoryConf, ...readerConf };
  if (!factoryConf && !readerConf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

export {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  IPFS_UPLOAD_URL,
  getReaderDefaults,
  getFactoryDefaults,
  getDefaults,
  getDefaultProvider,
};
