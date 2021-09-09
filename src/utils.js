const { getSignerFromPrivateKey } = require('iexec').utils;
const { getParamSet } = require('./oracle');
const hashComputeOracleId = require('./hash').computeOracleId;
const callTesterTestRawParams = require('./callTester').testRawParams;
const { getDefaults, DEFAULT_IPFS_GATEWAY } = require('./conf');

const computeOracleId = async (
  paramSetOrCid,
  { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {},
) => {
  const { paramSet } = await getParamSet({ paramSetOrCid, ipfsGateway });
  const oracleId = await hashComputeOracleId(paramSet);
  return oracleId;
};

module.exports = {
  computeOracleId,
  testRawParams: callTesterTestRawParams,
  getSignerFromPrivateKey,
  getChainDefaults: getDefaults,
};
