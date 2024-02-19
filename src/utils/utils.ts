import CID from 'cids';
import { getSignerFromPrivateKey } from 'iexec/utils';
import { getDefaults, DEFAULT_IPFS_GATEWAY } from '../config/config.js';
import { ParamSet } from '../types/public-types.js';
import * as ipfs from './../services/ipfs/index.js';
import testRawParams from './callTester.js';
import { formatParamsJson } from './format.js';
import { computeOracleId as hashComputeOracleId } from './hash.js';
import { jsonParamSetSchema, paramSetSchema } from './validators.js';

interface GetParamSetOptions {
  paramSetOrCid: ParamSet | string;
  ipfsGateway?: string;
}

interface ParamSetResult {
  paramSet: ParamSet;
  paramsJson: string;
  isUploaded: boolean;
}

const getParamSet = async ({
  paramSetOrCid,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
}: GetParamSetOptions): Promise<ParamSetResult> => {
  let paramSet;
  let paramsJson;
  let isUploaded = false;
  if (ipfs.isCid(paramSetOrCid)) {
    const cid = new CID(paramSetOrCid as string).toString();
    const contentBuffer = await ipfs.get(cid, { ipfsGateway }).catch(() => {
      throw Error(`Failed to load paramSetSet from CID ${cid}`);
    });
    const contentText = contentBuffer.toString();
    try {
      paramsJson = await jsonParamSetSchema().validate(contentText);
      paramSet = JSON.parse(paramsJson);
      isUploaded = true;
    } catch (e) {
      throw Error(`Content associated to CID ${cid} is not a valid paramSet`);
    }
  } else {
    paramSet = await paramSetSchema().validate(paramSetOrCid);
    paramsJson = await jsonParamSetSchema().validate(
      formatParamsJson(paramSet)
    );
  }
  return { paramSet, paramsJson, isUploaded };
};

const computeOracleId = async (
  paramSetOrCid,
  { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}
): Promise<string> => {
  const { paramSet }: ParamSetResult = await getParamSet({
    paramSetOrCid,
    ipfsGateway,
  });
  return hashComputeOracleId(paramSet);
};

export {
  getParamSet,
  computeOracleId,
  testRawParams,
  getSignerFromPrivateKey,
  getDefaults as getChainDefaults,
};
