const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0xFdB6C322696E9AcE04396b3832850bF2645F8A64',
    ORACLE_CONTRACT_ADDRESS: '0x037F68ea4A87689057F75803CA9eC83a6e659Fad', // mock contract
  },
};

const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io';

const getDefaults = (chainId) => {
  const conf = confMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

const checkSupportedChain = (chainId) => {
  getDefaults(chainId);
};

module.exports = {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  getDefaults,
  checkSupportedChain,
};
