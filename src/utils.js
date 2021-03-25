const { getSignerFromPrivateKey } = require('iexec').utils;
const { isCid, get } = require('./ipfs-service');

const computeOracleKey = async (paramsSetOrCid) => {
  let paramsSet;
  if (isCid) {
    paramsSet = await get(paramsSetOrCid).then((buffer) => buffer.toString());
  } else {
    paramsSet = paramsSetOrCid;
  }
  // validate ?

  return `hash(${paramsSet})`; // TODO
};

const testRawParams = () => {
  throw Error('TODO');
};

module.exports = {
  computeOracleKey,
  testRawParams,
  getSignerFromPrivateKey,
};
