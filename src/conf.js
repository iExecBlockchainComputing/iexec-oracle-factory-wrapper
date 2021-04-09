const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
    ORACLE_CONTRACT_ADDRESS: '0x8fbaa165ab51754d8a718c5c71c7aca42679ff7a', // mock contract
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
