import { AbstractProvider } from 'ethers';
import { EnhancedWallet } from 'iexec';
import { IExecConfigOptions } from 'iexec/IExecConfig';
import {
  PublishedApporder,
  PublishedDatasetorder,
  PublishedRequestorder,
  PublishedWorkerpoolorder,
} from 'iexec/IExecOrderbookModule';

/**
 * Ethereum address.
 */
export type Address = string;

/**
 * Ethereum Name Service (ENS) name.
 */
type ENS = string;

/**
 * ethereum address or ENS name (Ethereum Name Service)
 */
export type AddressOrENS = Address | ENS;

/**
 * Configuration options for OracleFactory.
 */
export type OracleFactoryOptions = {
  oracleContract?: AddressOrENS;
  iexecOptions?: IExecConfigOptions;
  ipfsNode?: string;
  ipfsGateway?: string;
  oracleApp?: AddressOrENS;
  workerpool?: AddressOrENS;
};

/**
 * Configuration options for OracleReader.
 */
export type OracleReaderOptions = {
  oracleContract?: AddressOrENS;
  ipfsGateway?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providerOptions?: any;
};

export type Web3SignerProvider = EnhancedWallet;
export type Web3ReadOnlyProvider = AbstractProvider;

export type DataType = 'boolean' | 'string' | 'number' | 'raw';

type ParamsBase = {
  /**
   * API url.
   */
  url: string;
  /**
   * HTTP method.
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /**
   * HTTP request headers.
   */
  headers?: Record<string, string>;
  /**
   * HTTP request body.
   */
  body?: string;
  /**
   * Path to the data in the JSON response of the API.
   */
  JSONPath: string;
  /**
   * Type of data to get from the response of the API.
   */
  dataType: DataType;
};

/**
 * Raw parameters for fetching the data from an API.
 */
export type RawParams = ParamsBase & {
  /**
   * Secret API key to use for the oracle call.
   *
   * The API key will replace any occurrence of the `%API_KEY%` placeholder in the `url`, `headers` and `body`.
   */
  apiKey?: string;
};

/**
 * Oracle set of parameters for fetching the data from an API.
 */
export type ParamSet = ParamsBase & {
  /**
   * Address of the encrypted dataset containing the secret API key to use for the oracle call.
   *
   * The API key will replace any occurrence of the `%API_KEY%` placeholder in the `url`, `headers` and `body`.
   */
  dataset?: Address;
};

/**
 * CID of a ParamSet uploaded on IPFS.
 *
 * The CID is unique for each ParamSet.
 */
export type ParamSetCID = string;

/**
 * Oracle ID computed from the ParamSet of the oracle.
 *
 * The OracleID is unique for each ParamSet.
 */
export type OracleID = string;

/**
 * Messages that will be sent by the observer in the process of creating an oracle
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

/**
 * Messages that will be sent by the observer in the process of updating an oracle
 */
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

/**
 * Parameters for reading data from an oracle.
 */
export type ReadOracleParams = {
  /**
   * Identifier of the oracle to read.
   */
  paramSetOrCidOrOracleId: ParamSet | ParamSetCID | OracleID;
  /**
   * Type of data to read.
   */
  dataType?: DataType;
};

/**
 * Options for reading data from an oracle.
 */
export type ReadOracleOptions = {
  ipfsGateway?: string;
  oracleContract?: Address;
};

/**
 * Response from an oracle query.
 */
export type OracleValue = {
  value: boolean | string | number;
  date: number;
};
