const { getSignerFromPrivateKey } = require('iexec').utils;
const { getParamSet } = require('./oracle');
const hashComputeOracleId = require('./hash').computeOracleId;
const callTesterTestRawParams = require('./callTester').testRawParams;
const { getDefaults } = require('./conf');

const computeOracleId = async (paramSetOrCid) => {
  const { paramSet } = await getParamSet({ paramSetOrCid });
  const oracleId = await hashComputeOracleId(paramSet);
  return oracleId;
};

module.exports = {
  computeOracleId,
  testRawParams: callTesterTestRawParams,
  getSignerFromPrivateKey,
  getChainDefaults: getDefaults,
};
