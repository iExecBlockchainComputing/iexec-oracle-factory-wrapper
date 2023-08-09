import {getSignerFromPrivateKey } from 'iexec/utils';
import { getParamSet } from './oracle';
import { computeOracleId as hashComputeOracleId } from './hash';
import { testRawParams as callTesterTestRawParams } from './callTester';
import { getDefaults, DEFAULT_IPFS_GATEWAY } from './conf';


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
  callTesterTestRawParams as testRawParams,
  getSignerFromPrivateKey,
  getDefaults as getChainDefaults
};

