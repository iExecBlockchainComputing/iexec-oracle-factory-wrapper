const API_KEY_PLACEHOLDER = '%API_KEY%';

// TO DO update whis official app & configured smart contract
const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0xB61E5F24A18d5d71340eeeF19A7442dD9Caba3f5',
    ORACLE_CONTRACT_ADDRESS: '0x0C22D575B783CE85322533f11334855dD24Ef936',
  },
  133: {
    ORACLE_APP_ADDRESS: '0xc1200aBB66246380056164F2B72d998E2B2A2c71',
    ORACLE_CONTRACT_ADDRESS: '0xf837B595Fb53B3e8a1feBE0846d8a0e53f44e72a',
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
