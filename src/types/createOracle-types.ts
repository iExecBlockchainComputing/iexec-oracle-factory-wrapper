import { AddressOrENS, ParamSet } from './common-types.js';

/**
 * Options for creating an oracle.
 */
export type CreateOracleOptions = {
  oracleApp?: AddressOrENS;
  ipfsGateway?: string;
  ipfsNode?: string;
};

/**
 * Parameters required to create an API key dataset.
 */
export type CreateApiKeyDatasetParams = {
  apiKey: string;
  callId: string;
};

/**
 * Message indicating the successful deployment of a dataset.
 */
export type DeployDatasetMessage = {
  message: 'DATASET_DEPLOYMENT_SUCCESS';
  address: AddressOrENS;
};

export type CreateParamSetMessage = {
  message: 'PARAM_SET_CREATED';
  paramSet: ParamSet;
};

export type ComputeOracleIDMessage = {
  message: 'ORACLE_ID_COMPUTED';
  oracleId: string;
};

export type UploadParamSetMessage = {
  message: 'PARAM_SET_UPLOADED';
  cid: string;
  multiaddr: string;
};

export type CreateOracleMessage =
  | DeployDatasetMessage
  | CreateParamSetMessage
  | ComputeOracleIDMessage
  | UploadParamSetMessage;
