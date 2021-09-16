const API_KEY_PLACEHOLDER = '%API_KEY%';

// TO DO update with configured smart contract
const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0xe89936A26eC4d62C70d938591fed569303e90074',
    ORACLE_CONTRACT_ADDRESS: '0x0C22D575B783CE85322533f11334855dD24Ef936',
  },
  133: {
    ORACLE_APP_ADDRESS: '0xe89936A26eC4d62C70d938591fed569303e90074',
    ORACLE_CONTRACT_ADDRESS: '0xf837B595Fb53B3e8a1feBE0846d8a0e53f44e72a',
  },
  // 134: {
  //   ORACLE_APP_ADDRESS: '0xe89936A26eC4d62C70d938591fed569303e90074',
  // },
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
