import { DEFAULT_IPFS_GATEWAY, getReaderDefaults } from '../config/config.js';
import {
  NoValueError,
  ValidationError,
  WorkflowError,
} from '../utils/errors.js';
import { computeOracleId, isOracleId } from '../utils/hash.js';
import { readDataTypeSchema, throwIfMissing } from '../utils/validators.js';
import { formatOracleGetInt } from '../utils/format.js';
import { READ_ABI } from '../config/contract.js';
import { Oracle, ReadOracleParams } from './types.js';
import { getParamSet } from '../utils/utils.js';
import { ethers } from 'ethers';
/**
 * Reads data from an oracle based on the provided parameters.
 * @param paramSetOrCidOrOracleId Param set, CID, or oracle ID.
 * @param dataType Type of data to read.
 * @param ethersProvider Ethereum provider.
 * @param ipfsGateway IPFS gateway URL.
 * @param oracleContract Address of the oracle contract.
 * @returns Promise resolving to the Oracle data.
 * @throws {NoValueError} If no value is stored for the oracle.
 * @throws {ValidationError} If there is a validation error.
 * @throws {WorkflowError} If there is an unexpected workflow error.
 */
const readOracle = async ({
  paramSetOrCidOrOracleId = throwIfMissing(),
  dataType,
  ethersProvider,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
  oracleContract,
}: ReadOracleParams): Promise<Oracle> => {
  const chainId = await ethersProvider
    .getNetwork()
    .then((res) => `${res.chainId}`);
  const ORACLE_CONTRACT_ADDRESS =
    oracleContract ||
    getReaderDefaults(Number(chainId)).ORACLE_CONTRACT_ADDRESS;

  let readDataType;
  let oracleId;
  if (isOracleId(paramSetOrCidOrOracleId)) {
    oracleId = paramSetOrCidOrOracleId;
    readDataType = await readDataTypeSchema().validate(
      dataType === undefined || dataType === '' ? 'raw' : dataType,
    );
  } else {
    if (dataType) {
      throw Error(
        'dataType option is only allowed when reading oracle from oracleId',
      );
    }
    const { paramSet } = await getParamSet({
      paramSetOrCid: paramSetOrCidOrOracleId,
      ipfsGateway,
    }).catch((e) => {
      if (e instanceof ValidationError) {
        throw e;
      } else {
        throw new WorkflowError('Failed to load paramSet', e);
      }
    });
    readDataType = paramSet.dataType;
    oracleId = await computeOracleId(paramSet);
  }

  const oracleSmartContract = new ethers.Contract(
    ORACLE_CONTRACT_ADDRESS,
    READ_ABI,
    ethersProvider,
  );
  const [rawValue, rawDateBn] = await oracleSmartContract
    .getRaw(oracleId)
    .catch(() => {
      throw Error(`Failed to read value from oracle with oracleId ${oracleId}`);
    });

  const rawDateNumber = parseInt(rawDateBn.toString());

  if (rawDateNumber == 0) {
    throw new NoValueError(`No value stored for oracleId ${oracleId}`);
  }

  switch (readDataType) {
    case 'boolean': {
      const [result, dateBn] = await oracleSmartContract
        .getBool(oracleId)
        .catch(() => {
          throw Error(
            `Failed to read boolean from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not boolean dataType`,
          );
        });
      const rawDateNumber = parseInt(dateBn.toString());
      return { value: result, date: rawDateNumber };
    }
    case 'number': {
      const [resultBn, dateBn] = await oracleSmartContract
        .getInt(oracleId)
        .catch(() => {
          throw Error(
            `Failed to read number from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not number dataType`,
          );
        });
      const resultNumber = formatOracleGetInt(resultBn);
      return { value: resultNumber, date: formatOracleGetInt(dateBn) };
    }
    case 'string': {
      const [resultString, dateBn] = await oracleSmartContract
        .getString(oracleId)
        .catch(() => {
          throw Error(
            `Failed to read string from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not string dataType`,
          );
        });
      return { value: resultString, date: formatOracleGetInt(dateBn) };
    }
    default: {
      return {
        value: rawValue,
        date: formatOracleGetInt(rawDateBn),
      };
    }
  }
};

export { readOracle };
