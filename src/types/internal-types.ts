import { IExec } from 'iexec';
import {
  PublishedApporder,
  PublishedDatasetorder,
  PublishedRequestorder,
  PublishedWorkerpoolorder,
} from 'iexec/IExecOrderbookModule';
import { AddressOrENS, ParamSet } from './public-types.js';

/**
 * Parameters required to create an API key dataset.
 */
export type CreateApiKeyDatasetParams = {
  iexec: IExec;
  apiKey: string;
  callId: string;
  ipfsGateway?: string;
  ipfsNode?: string;
  oracleApp?: AddressOrENS;
};

/**
 * Message indicating the successful deployment of a dataset.
 */
interface DeployDatasetMessage {
  message: 'DATASET_DEPLOYMENT_SUCCESS';
  address: AddressOrENS;
}

interface CreateParamSetMessage {
  message: 'PARAM_SET_CREATED';
  paramSet: ParamSet;
}

interface ComputeOracleIDMessage {
  message: 'ORACLE_ID_COMPUTED';
  oracleId: string;
}

interface UploadParamSetMessage {
  message: 'PARAM_SET_UPLOADED';
  cid: string;
  multiaddr: string;
}

export type CreateOracleMessage =
  | DeployDatasetMessage
  | CreateParamSetMessage
  | ComputeOracleIDMessage
  | UploadParamSetMessage;

interface EnsureParamsMessage {
  message: 'ENSURE_PARAMS';
}

interface EnsureParamsUploadMessage {
  message: 'ENSURE_PARAMS_UPLOAD';
}

interface EnsureParamsSuccessMessage {
  message: 'ENSURE_PARAMS_SUCCESS';
  paramSet: ParamSet;
  cid: string;
}

interface FetchAppOrderMessage {
  message: 'FETCH_APP_ORDER';
}

interface FetchAppOrderSuccessMessage {
  message: 'FETCH_APP_ORDER_SUCCESS';
  order: PublishedApporder;
}

interface FetchDatasetOrderMessage {
  message: 'FETCH_DATASET_ORDER';
}

interface FetchDatasetOrderSuccessMessage {
  message: 'FETCH_DATASET_ORDER_SUCCESS';
  order: PublishedApporder;
}

interface FetchWorkerpoolOrderMessage {
  message: 'FETCH_WORKERPOOL_ORDER';
}

interface FetchWorkerpoolOrderSuccessMessage {
  message: 'FETCH_WORKERPOOL_ORDER_SUCCESS';
  order: PublishedApporder;
}

interface RequestOrderSignatureSignRequestMessage {
  message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST';
  order: PublishedApporder;
}

interface RequestOrderSignatureSuccessMessage {
  message: 'REQUEST_ORDER_SIGNATURE_SUCCESS';
  order: PublishedApporder;
}

interface MatchOrdersSignTxRequestMessage {
  message: 'MATCH_ORDERS_SIGN_TX_REQUEST';
  apporder: PublishedApporder;
  datasetorder: PublishedDatasetorder;
  workerpoolorder: PublishedWorkerpoolorder;
  requestorder: PublishedRequestorder;
}

interface MatchOrdersSuccessMessage {
  message: 'MATCH_ORDERS_SUCCESS';
  dealid: string;
  txHash: string;
}

interface TaskUpdatedMessage {
  message: 'TASK_UPDATED';
  dealid: string;
  taskid: string;
  status: string;
}

interface UpdateTaskCompletedMessage {
  message: 'UPDATE_TASK_COMPLETED';
}

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
