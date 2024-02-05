import { getSignerFromPrivateKey } from 'iexec/utils';
import { getParamSet } from './oracle.js';
import { computeOracleId as hashComputeOracleId } from './hash.js';
import testRawParams from './callTester.js';
import { getDefaults, DEFAULT_IPFS_GATEWAY } from './conf.js';

const computeOracleId = async (
  paramSetOrCid,
  { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {},
) => {
  const { paramSet } = await getParamSet({ paramSetOrCid, ipfsGateway });
  const oracleId = await hashComputeOracleId(paramSet);
  return oracleId;
};

export {
  computeOracleId,
  testRawParams,
  getSignerFromPrivateKey,
  getDefaults as getChainDefaults,
};
