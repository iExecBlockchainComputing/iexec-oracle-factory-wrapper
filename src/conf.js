const API_KEY_PLACEHOLDER = '%API_KEY%';

const confMap = {
  133: {
    ORACLE_APP_ADDRESS: '0xE7Da3c01BbC71daCB05C30b7832214d82a045e70',
    ORACLE_CONTRACT_ADDRESS: '0x8ecEDdd1377E52d23A46E2bd3dF0aFE35B526D5F',
  },
  134: {
    ORACLE_APP_ADDRESS: '0x05A2915F4C5A87fd3084C59E1A379449A54985f5',
    ORACLE_CONTRACT_ADDRESS: '0x456891C78077d31F70Ca027a46D68F84a2b814D4',
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
