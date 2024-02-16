import { ethers } from 'ethers';
import { strictParamSetSchema, strictCallParamsSchema } from './validators.js';
import { sortObjKeys } from './format.js';
import { ParamSet } from '../../src/oracleFactory/types.js';

const bytes32Regex = /^(0x)([0-9a-f]{2}){32}$/;

const isOracleId = (oracleId: any): boolean =>
  typeof oracleId === 'string' && bytes32Regex.test(oracleId);

const formatMap = (obj: Record<string, any>): [string, any][] => {
  const sortedObj = sortObjKeys(obj);
  return Object.entries(sortedObj);
};

const computeOracleId = async (paramSet): Promise<string> => {
  const { JSONPath, body, dataType, dataset, headers, method, url } =
    await strictParamSetSchema().validate(paramSet);

  const formatedHeaders = formatMap(headers);

  return ethers.solidityPackedKeccak256(
    ['string', 'string', 'string', 'address', 'string[][]', 'string', 'string'],
    [JSONPath, body, dataType, dataset, formatedHeaders, method, url]
  );
};

const computeCallId = async (callParams): Promise<string> => {
  const { body, headers, method, url }: any =
    await strictCallParamsSchema().validate(callParams);
  const formatedHeaders = formatMap(headers);

  return ethers.solidityPackedKeccak256(
    ['string', 'string[][]', 'string', 'string'],
    [body, formatedHeaders, method, url]
  );
};

export { isOracleId, computeOracleId, computeCallId };
