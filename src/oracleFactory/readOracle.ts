import { ethers } from 'ethers';
import { getReaderDefaults } from '../config/config.js';
import { READ_ABI } from '../config/contract.js';
import {
  OracleValue,
  ReadOracleOptions,
  ReadOracleParams,
} from '../types/common-types.js';
import { EthersProviderConsumer } from '../types/internal-types.js';
import {
  NoValueError,
  ValidationError,
  WorkflowError,
} from '../utils/errors.js';
import { formatOracleGetNumber } from '../utils/format.js';
import { computeOracleId, isOracleId } from '../utils/hash.js';
import { getParamSet } from '../utils/utils.js';
import { readDataTypeSchema } from '../utils/validators.js';
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
  paramSetOrCidOrOracleId,
  dataType,
  ethersProvider,
  ipfsGateway,
  oracleContract,
}: ReadOracleParams &
  ReadOracleOptions &
  EthersProviderConsumer): Promise<OracleValue> => {
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
      !dataType ? 'raw' : dataType
    );
  } else {
    if (dataType) {
      throw Error(
        'dataType option is only allowed when reading oracle from oracleId'
      );
    }
    const { paramSet } = await getParamSet({
      paramSetOrCid: paramSetOrCidOrOracleId,
      ipfsGateway,
    }).catch((e) => {
      if (e instanceof ValidationError) {
        throw e;
      } else {
        throw new WorkflowError({
          message: 'Failed to load paramSet',
          errorCause: e,
        });
      }
    });
    readDataType = paramSet.dataType;
    oracleId = await computeOracleId(paramSet);
  }

  const oracleSmartContract = new ethers.Contract(
    ORACLE_CONTRACT_ADDRESS,
    READ_ABI,
    ethersProvider
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
            `Failed to read boolean from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not boolean dataType`
          );
        });
      return { value: result, date: parseInt(dateBn.toString()) };
    }
    case 'number': {
      const [resultBn, dateBn] = await oracleSmartContract
        .getInt(oracleId)
        .catch(() => {
          throw Error(
            `Failed to read number from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not number dataType`
          );
        });
      const resultNumber = formatOracleGetNumber(resultBn);
      return { value: resultNumber, date: parseInt(dateBn.toString()) };
    }
    case 'string': {
      const [resultString, dateBn] = await oracleSmartContract
        .getString(oracleId)
        .catch(() => {
          throw Error(
            `Failed to read string from oracle with oracleId ${oracleId}\nThis may occur when:\n- No value is stored\n- Stored value is not string dataType`
          );
        });
      return { value: resultString, date: parseInt(dateBn.toString()) };
    }
    default: {
      return {
        value: rawValue,
        date: rawDateNumber,
      };
    }
  }
};

export { readOracle };
