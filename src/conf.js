const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
    ORACLE_CONTRACT_ADDRESS: '0x0C22D575B783CE85322533f11334855dD24Ef936', // mock contract
  },
};

const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io';

const getDefaults = (chainId) => {
  const conf = confMap[chainId];
  if (!conf) throw Error(`Unsupported chain ${chainId}`);
  return conf;
};

module.exports = {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  getDefaults,
};
