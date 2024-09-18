import { Address } from 'iexec';
import {
  PublishedApporder,
  PublishedDatasetorder,
  PublishedRequestorder,
  PublishedWorkerpoolorder,
} from 'iexec/IExecOrderbookModule';
import { AddressOrENS, ParamSet, ParamSetCID } from './common.js';

export type EnsureParamsMessage = {
  message: 'ENSURE_PARAMS';
};

export type EnsureParamsUploadMessage = {
  message: 'ENSURE_PARAMS_UPLOAD';
};

export type EnsureParamsSuccessMessage = {
  message: 'ENSURE_PARAMS_SUCCESS';
  paramSet: ParamSet;
  cid: string;
};

export type FetchAppOrderMessage = {
  message: 'FETCH_APP_ORDER';
};

export type FetchAppOrderSuccessMessage = {
  message: 'FETCH_APP_ORDER_SUCCESS';
  order: PublishedApporder;
};

export type FetchDatasetOrderMessage = {
  message: 'FETCH_DATASET_ORDER';
};

export type FetchDatasetOrderSuccessMessage = {
  message: 'FETCH_DATASET_ORDER_SUCCESS';
  order: PublishedApporder;
};

export type FetchWorkerpoolOrderMessage = {
  message: 'FETCH_WORKERPOOL_ORDER';
};

export type FetchWorkerpoolOrderSuccessMessage = {
  message: 'FETCH_WORKERPOOL_ORDER_SUCCESS';
  order: PublishedApporder;
};

export type RequestOrderSignatureSignRequestMessage = {
  message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST';
  order: PublishedApporder;
};

export type RequestOrderSignatureSuccessMessage = {
  message: 'REQUEST_ORDER_SIGNATURE_SUCCESS';
  order: PublishedApporder;
};

export type MatchOrdersSignTxRequestMessage = {
  message: 'MATCH_ORDERS_SIGN_TX_REQUEST';
  apporder: PublishedApporder;
  datasetorder: PublishedDatasetorder;
  workerpoolorder: PublishedWorkerpoolorder;
  requestorder: PublishedRequestorder;
};

export type MatchOrdersSuccessMessage = {
  message: 'MATCH_ORDERS_SUCCESS';
  dealid: string;
  txHash: string;
};

export type TaskUpdatedMessage = {
  message: 'TASK_UPDATED';
  dealid: string;
  taskid: string;
  status: string;
};

export type UpdateTaskCompletedMessage = {
  message: 'UPDATE_TASK_COMPLETED';
};

export type UpdateOracleMessage =
  | EnsureParamsMessage
  | EnsureParamsUploadMessage
  | EnsureParamsSuccessMessage
  | FetchAppOrderMessage
  | FetchAppOrderSuccessMessage
  | FetchDatasetOrderMessage
  | FetchDatasetOrderSuccessMessage
  | FetchWorkerpoolOrderMessage
  | FetchWorkerpoolOrderSuccessMessage
  | RequestOrderSignatureSignRequestMessage
  | RequestOrderSignatureSuccessMessage
  | MatchOrdersSignTxRequestMessage
  | MatchOrdersSuccessMessage
  | TaskUpdatedMessage
  | UpdateTaskCompletedMessage;

export type TaskTimedOutMessage = {
  message: 'TASK_TIMEDOUT';
};

export type TaskCompletedMessage = {
  message: 'TASK_COMPLETED';
};

export type TaskExecutionMessage =
  | TaskTimedOutMessage
  | TaskCompletedMessage
  | TaskUpdatedMessage;

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
