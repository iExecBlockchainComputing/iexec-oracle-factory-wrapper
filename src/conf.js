const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0x38EeC93D23b849a1895A84504aB7D6a01f378dcD',
    ORACLE_CONTRACT_ADDRESS: '0x037F68ea4A87689057F75803CA9eC83a6e659Fad', // mock contract
  },
  133: {
    ORACLE_APP_ADDRESS: '0xa787B1583082d5c126f2E92B2E770059aE55A752',
    ORACLE_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
  }, // no callback
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
