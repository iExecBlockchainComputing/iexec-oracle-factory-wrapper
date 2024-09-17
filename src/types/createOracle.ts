import {
  DatasetorderTemplate,
  SignedDatasetorder,
} from 'iexec/IExecOrderModule';
import { Address, AddressOrENS, ParamSet } from './common.js';

/**
 * Options for creating an oracle.
 */
export type CreateOracleOptions = {
  oracleApp?: AddressOrENS;
  ipfsGateway?: string;
  ipfsNode?: string;
};

export type ApiKeyEncryptionKeyCreatedMessage = {
  message: 'ENCRYPTION_KEY_CREATED';
  key: string;
};

export type ApiKeyEncryptedMessage = {
  message: 'FILE_ENCRYPTED';
  encryptedFile: Buffer;
  checksum: string;
};

export type ApiKeyUploadedMessage = {
  message: 'ENCRYPTED_FILE_UPLOADED';
  cid: string;
  multiaddr: string;
};

export type ApiKeyDatasetDeployRequestMessage = {
  message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST';
};

export type ApiKeyDatasetDeploySuccessMessage = {
  message: 'DATASET_DEPLOYMENT_SUCCESS';
  address: Address;
  txHash: string;
};

export type ApiKeyPushSecretRequestMessage = {
  message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST';
};

export type ApiKeyPushSecretSuccessMessage = {
  message: 'PUSH_SECRET_TO_SMS_SUCCESS';
};

export type ApiKeySignOrderRequestMessage = {
  message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST';
  order: DatasetorderTemplate;
};

export type ApiKeySignOrderSuccessMessage = {
  message: 'DATASET_ORDER_SIGNATURE_SUCCESS';
  order: SignedDatasetorder;
};

export type ApiKeyPublishOrderRequestMessage = {
  message: 'DATASET_ORDER_PUBLISH_SIGN_REQUEST';
  order: SignedDatasetorder;
};

export type ApiKeyPublishOrderSuccessMessage = {
  message: 'DATASET_ORDER_PUBLISH_SUCCESS';
  orderHash: string;
};

export type CreateApiKeyDatasetMessage =
  | ApiKeyEncryptionKeyCreatedMessage
  | ApiKeyEncryptedMessage
  | ApiKeyUploadedMessage
  | ApiKeyDatasetDeployRequestMessage
  | ApiKeyDatasetDeploySuccessMessage
  | ApiKeyPushSecretRequestMessage
  | ApiKeyPushSecretSuccessMessage
  | ApiKeySignOrderRequestMessage
  | ApiKeySignOrderSuccessMessage
  | ApiKeyPublishOrderRequestMessage
  | ApiKeyPublishOrderSuccessMessage;

export type ParamSetCreatedMessage = {
  message: 'PARAM_SET_CREATED';
  paramSet: ParamSet;
};

export type OracleIDComputedMessage = {
  message: 'ORACLE_ID_COMPUTED';
  oracleId: string;
};

export type ParamSetUploadedMessage = {
  message: 'PARAM_SET_UPLOADED';
  cid: string;
  multiaddr: string;
};

export type CreateOracleMessage =
  | CreateApiKeyDatasetMessage
  | ParamSetCreatedMessage
  | OracleIDComputedMessage
  | ParamSetUploadedMessage;
