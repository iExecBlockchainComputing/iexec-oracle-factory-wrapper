const { getDefaultProvider: getEthersDefaultProvider } = require('ethers');

const API_KEY_PLACEHOLDER = '%API_KEY%';

const factoryConfMap = {
  133: {
    ORACLE_APP_ADDRESS: '0xE7Da3c01BbC71daCB05C30b7832214d82a045e70',
    ORACLE_CONTRACT_ADDRESS: '0x8ecEDdd1377E52d23A46E2bd3dF0aFE35B526D5F',
  },
  134: {
    ORACLE_APP_ADDRESS: '0xdce234bf640235549d4d95c4764b1863ffda7cf4',
    ORACLE_CONTRACT_ADDRESS: '0x456891C78077d31F70Ca027a46D68F84a2b814D4',
  },
};

const readerConfMap = {
  1: {
    ORACLE_CONTRACT_ADDRESS: '', // TODO
  },
  5: {
    ORACLE_CONTRACT_ADDRESS: '0x8Ad317241854b1A29A06cE5478e6B92FA09Cd03a', // TODO temporary test contract to replace
  },
  133: {
    ORACLE_CONTRACT_ADDRESS: factoryConfMap[133].ORACLE_CONTRACT_ADDRESS,
  },
  134: {
    ORACLE_CONTRACT_ADDRESS: factoryConfMap[134].ORACLE_CONTRACT_ADDRESS,
  },
  137: {
    ORACLE_CONTRACT_ADDRESS: '', // TODO
  },
  80001: {
    ORACLE_CONTRACT_ADDRESS: '0x68bDfa911178f72CEA7BCFd0FeEbbA4cDDE24eCF', // TODO temporary test contract to replace
  },
};

const networkMap = {
  1: 'homestead',
  5: 'goerli',
  133: 'https://viviani.iex.ec',
  134: 'https://bellecour.iex.ec',
  137: 'matic',
  80001: 'https://matic-mumbai.chainstacklabs.com',
  mainnet: 'homestead',
  goerli: 'goerli',
  viviani: 'https://viviani.iex.ec',
  bellecour: 'https://bellecour.iex.ec',
  polygon: 'matic',
  mumbai: 'https://matic-mumbai.chainstacklabs.com',
};

const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io';

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

module.exports = {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  getReaderDefaults,
  getFactoryDefaults,
  getDefaults,
  getDefaultProvider,
};
