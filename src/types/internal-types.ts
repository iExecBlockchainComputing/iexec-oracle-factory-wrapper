import { Provider } from 'ethers';
import { IExec } from 'iexec';
import {
  Address,
  AddressOrENS,
  ParamSet,
  ParamSetCID,
} from './public-types.js';

export type IExecConsumer = {
  iexec: IExec;
};

export type EthersProviderConsumer = {
  ethersProvider: Provider;
};

/**
 * Parameters required to create an API key dataset.
 */
export type CreateApiKeyDatasetParams = {
  apiKey: string;
  callId: string;
};

interface TaskTimedOutMessage {
  message: 'TASK_TIMEDOUT';
}

interface TaskCompletedMessage {
  message: 'TASK_COMPLETED';
}

interface TaskUpdatedMessage {
  message: 'TASK_UPDATED';
  dealid: string;
  taskid: string;
  status: string;
}

export type TaskExecutionMessage =
  | TaskTimedOutMessage
  | TaskCompletedMessage
  | TaskUpdatedMessage;

////

/**
 * Options for creating an oracle.
 */
export type CreateOracleOptions = {
  oracleApp?: AddressOrENS;
  ipfsGateway?: string;
  ipfsNode?: string;
};

/**
 * Parameters to update an oracle.
 */
export type UpdateOracleParams = {
  /**
   * Identifier of the oracle to update.
   */
  paramSetOrCid: ParamSet | ParamSetCID;
  /**
   * Chain ID of targeted blockchain for cross-chain update.
   */
  targetBlockchains?: number[];
};

/**
 * Options for updating an oracle.
 */
export type UpdateOracleOptions = {
  oracleApp?: AddressOrENS;
  oracleContract?: Address;
  workerpool?: AddressOrENS;
  ipfsGateway?: string;
  ipfsNode?: string;
};
