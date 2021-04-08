const { getSignerFromPrivateKey } = require('iexec').utils;
const { getParamsSet } = require('./oracle');
const hashComputeOracleId = require('./hash').computeOracleId;
const callTesterTestRawParams = require('./callTester').testRawParams;

const computeOracleId = async (paramsSetOrCid) => {
  const { paramsSet } = await getParamsSet(paramsSetOrCid);
  const oracleId = await hashComputeOracleId(paramsSet);
  return oracleId;
};

module.exports = {
  computeOracleId,
  testRawParams: callTesterTestRawParams,
  getSignerFromPrivateKey,
};
