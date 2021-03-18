const confMap = {
  5: {
    ORACLE_APP_ADDRESS: '0x0000000000000000000000000000000000000000',
    ORACLE_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
  },
};

const getDefaults = (chainId) => {
  const conf = confMap[chainId];
  if (!conf) throw Error(`Unsupported Chain ${chainId}`);
  return conf;
};

module.exports = {
  getDefaults,
};
