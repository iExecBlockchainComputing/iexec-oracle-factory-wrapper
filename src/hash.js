const { paramsSetSchema, callParamsSchema } = require('./validators');
const { sortObjKeys } = require('./format');

const isOracleId = async (oracleId) => false; // todo

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
