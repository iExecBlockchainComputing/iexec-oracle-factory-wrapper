const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  133: {
    ORACLE_APP_ADDRESS: '0x53057DB6cae6ed40641DCA6bD29de778dbb1FA02',
    ORACLE_CONTRACT_ADDRESS: '0x8ecEDdd1377E52d23A46E2bd3dF0aFE35B526D5F',
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
