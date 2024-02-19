import { AbstractProvider, Provider } from 'ethers';
import { EnhancedWallet, IExec } from 'iexec';
import { IExecConfigOptions } from 'iexec/IExecConfig';
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
  /**
   * Ethereum contract address or ENS (Ethereum Name Service) for oracleFactory smart contract.
   * If not provided, the default oracleFactory contract address will be used.
   * @default DEFAULT_ORACLE_CONTRACT_ADDRESS
   */
  oracleContract?: AddressOrENS;

  /**
   * Options specific to iExec integration.
   * If not provided, default iexec options will be used.
   */
  iexecOptions?: IExecConfigOptions;

  /**
   * IPFS node URL.
   * If not provided, the default OracleFactory IPFS node URL will be used.
   * @default DEFAULT_IPFS_UPLOAD_URL
   */
  ipfsNode?: string;

  /**
   * IPFS gateway URL.
   * If not provided, the default OracleFactory IPFS gateway URL will be used.
   * @default DEFAULT_IPFS_GATEWAY
   */
  ipfsGateway?: string;

  /**
   * Address of a custom oracle application
   * If not provided, the default OracleFactory application address will be used.
   */
  oracleApp?: AddressOrENS;

  /**
   * Address of the workerpool.
   * If not provided, the default OracleFactory workerpool address will be used.
   */
  workerpool?: AddressOrENS;
};

/**
 * Configuration options for OracleReader.
 */
export type OracleReaderOptions = {
  /**
   * The Ethereum contract address or ENS (Ethereum Name Service) for oracle reader smart contract.
   * If not provided, the default oracle reader contract address will be used.
   * @default{@link DEFAULT_CONTRACT_ADDRESS}
   */
  oracleContract?: AddressOrENS;

  /**
   * The IPFS gateway URL.
   * If not provided, the default OracleFactory IPFS gateway URL will be used.
   * @default{@link DEFAULT_IPFS_GATEWAY}
   */
  ipfsGateway?: string;
};

export type Web3SignerProvider = EnhancedWallet;

export type Web3ReadOnlyProvider = AbstractProvider;

/**
 * Set of parameters for an oracle request.
 */
export type ParamSet = {
  /**
   * The URL of the endpoint to query for data.
   */
  url: string;

  /**
   * The HTTP method to use for the request.
   * Must be one of 'GET', 'POST', 'PUT', or 'DELETE'.
   */
  method: NonNullable<'GET' | 'POST' | 'PUT' | 'DELETE'>;

  /**
   * The JSONPath expression used to extract the desired data from the API response.
   */
  JSONPath: string;

  /**
   * Additional headers to include in the request (optional).
   */
  headers?: object;

  /**
   * Body of the request (optional).
   */
  body?: string;

  /**
   * The expected data type of the response.
   * Must be one of 'string', 'number', or 'boolean'.
   */
  dataType?: NonNullable<'string' | 'number' | 'boolean'>;

  /**
   * API key to use for authentication (optional).
   */
  apiKey?: string;

  /**
   * Address of the dataset associated with the request (optional).
   */
  dataset?: Address;

  /**
   * Array of blockchain IDs specifying the target blockchains for the oracle request (optional).
   */
  targetBlockchains?: number[];
};

/**
 * Parameters for reading data from an oracle.
 */
export type ReadOracleParams = {
  /**
   * Parameter set defining the oracle request, or the CID or ID of a previously created oracle request.
   */
  paramSetOrCidOrOracleId: ParamSet | string;

  /**
   * The expected data type of the response (optional).
   * If provided, this will override the data type specified in the `paramSetOrCidOrOracleId`.
   */
  dataType?: string;

  /**
   * Ethereum provider used to interact with the blockchain.
   */
  ethersProvider: Provider;

  /**
   * IPFS gateway URL used to retrieve data from IPFS (optional).
   * If not provided, the default IPFS gateway URL will be used.
   */
  ipfsGateway?: string;

  /**
   * Address of the oracle contract (optional).
   * If not provided, the default oracle contract address will be used.
   */
  oracleContract?: Address;
};

/**
 * Response from an oracle query.
 */
export type Oracle = {
  /**
   * Value returned by the oracle.
   */
  value: boolean | string | number;

  /**
   * Timestamp indicating when the oracle was created.
   */
  date: number;
};

/**
 * Parameters required to update an oracle.
 */
export type UpdateOracleParams = {
  /**
   * Parameter set or CID (Content Identifier) identifying the oracle to be updated.
   */
  paramSetOrCid: ParamSet | string;

  iexec: any;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of the oracle application.
   */
  oracleApp?: any;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of the workerpool.
   */
  workerpool?: any;

  /**
   * (Optional) IPFS gateway URL used for the update operation.
   */
  ipfsGateway?: string;

  /**
   * (Optional) IPFS upload URL used for the update operation.
   */
  ipfsNode?: string;

  /**
   * (Optional) Address of oracleFactory contract.
   */
  oracleContract?: any;
};

/**
 * Options for creating an oracle.
 */
export type CreateOracleOptions = {
  /**
   * (Optional) iExec instance used to create an oracle.
   */
  iexec?: IExec;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of the oracle application.
   */
  oracleApp?: AddressOrENS;

  /**
   * (Optional) The IPFS gateway URL used to create an oracle.
   */
  ipfsGateway?: string;

  /**
   * (Optional) The IPFS upload URL used for oracle creation.
   */
  ipfsNode?: string;
};

/**
 * Options for updating an oracle.
 */
export type UpdateOracleOptions = {
  /**
   * (Optional) iExec instance used for oracle update.
   */
  iexec?: IExec;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of oracleFactory application.
   */
  oracleApp?: AddressOrENS;

  /**
   * Address of the oracle contract to be updated.
   */
  oracleContract: Address;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of the workerpool.
   */
  workerpool?: AddressOrENS;

  /**
   * (Optional) IPFS gateway URL used for update an oracle oracle.
   */
  ipfsGateway?: string;
};

/**
 * Parameters required to create an API key dataset.
 */
export type CreateApiKeyDatasetParams = {
  /**
   * (Optional) iExec instance used for dataset creation.
   */
  iexec: IExec;

  /**
   * API key associated with the dataset.
   */
  apiKey: string;

  /**
   * Call ID associated with the dataset.
   */
  callId: string;

  /**
   * (Optional) IPFS gateway URL used for oracle creation.
   */
  ipfsGateway?: string;

  /**
   * (Optional) IPFS upload URL used for oracle creation.
   */
  ipfsNode?: string;

  /**
   * (Optional) Address or ENS (Ethereum Name Service) name of oracleFactory application.
   */
  oracleApp?: AddressOrENS;
};

/**
 * Message indicating the successful deployment of a dataset.
 */ interface DeployDatasetMessage {
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
  paramSet: any; // type to be replaced
  cid: string;
}

interface FetchAppOrderMessage {
  message: 'FETCH_APP_ORDER';
}

interface FetchAppOrderSuccessMessage {
  message: 'FETCH_APP_ORDER_SUCCESS';
  order: any; // type to be replaced
}

interface FetchDatasetOrderMessage {
  message: 'FETCH_DATASET_ORDER';
}

interface FetchDatasetOrderSuccessMessage {
  message: 'FETCH_DATASET_ORDER_SUCCESS';
  order: any; // type to be replaced
}

interface FetchWorkerpoolOrderMessage {
  message: 'FETCH_WORKERPOOL_ORDER';
}

interface FetchWorkerpoolOrderSuccessMessage {
  message: 'FETCH_WORKERPOOL_ORDER_SUCCESS';
  order: any; // type to be replaced
}

interface RequestOrderSignatureSignRequestMessage {
  message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST';
  order: any; // type to be replaced
}

interface RequestOrderSignatureSuccessMessage {
  message: 'REQUEST_ORDER_SIGNATURE_SUCCESS';
  order: any; // type to be replaced
}

interface MatchOrdersSignTxRequestMessage {
  message: 'MATCH_ORDERS_SIGN_TX_REQUEST';
  apporder: any; // type to be replaced
  datasetorder: any; // type to be replaced
  workerpoolorder: any; // type to be replaced
  requestorder: any; // type to be replaced
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
