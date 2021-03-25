const { paramsSetSchema, callParamsSchema } = require('./validators');
const { sortObjKeys } = require('./format');

const bytes32Regex = /^(0x)([0-9a-f]{2}){32}$/;

const isOracleId = async (oracleId) => typeof oracleId === 'string' && oracleId.match(bytes32Regex);

const computeOracleId = async (paramsSet) => {
  const vParamsSet = await paramsSetSchema().validate(paramsSet);
  const sortedParamsSet = sortObjKeys(vParamsSet);
  return `hash(${JSON.stringify(sortedParamsSet)}`;
};

const computeCallId = async (callParams) => {
  const vCallParams = await callParamsSchema().validate(callParams);
  const sortedCallParams = sortObjKeys(vCallParams);
  return `hash(${JSON.stringify(sortedCallParams)}`;
};

module.exports = {
  isOracleId,
  computeOracleId,
  computeCallId,
};
