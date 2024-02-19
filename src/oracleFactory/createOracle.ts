import {
  API_KEY_PLACEHOLDER,
  DEFAULT_APP_ADDRESS,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  getFactoryDefaults,
} from '../config/config.js';
import * as ipfs from '../services/ipfs/index.js';
import { ValidationError, WorkflowError } from '../utils/errors.js';
import { formatParamsJson } from '../utils/format.js';
import { computeCallId, computeOracleId } from '../utils/hash.js';
import { Observable, SafeObserver } from '../utils/reactive.js';
import {
  jsonParamSetSchema,
  paramSetSchema,
  rawParamsSchema,
  throwIfMissing,
} from '../utils/validators.js';
import {
  Address,
  CreateApiKeyDatasetParams,
  CreateOracleMessage,
  CreateOracleOptions,
  ParamSet,
} from './types.js';

/**
 * Creates a dataset containing an API key.
 * @param {CreateApiKeyDatasetParams} params Parameters for creating the dataset.
 * @returns {Observable<CreateOracleMessage>} Observable regarding the creation process.
 */
const createApiKeyDataset = ({
  iexec = throwIfMissing(),
  apiKey = throwIfMissing(),
  callId = throwIfMissing(),
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
  ipfsNode = DEFAULT_IPFS_UPLOAD_URL,
  oracleApp,
}: CreateApiKeyDatasetParams): Observable<CreateOracleMessage> =>
  new Observable<CreateOracleMessage>(
    (observer: SafeObserver<CreateOracleMessage>) => {
      let abort = false;
      const safeObserver = new SafeObserver(observer);
      const start = async () => {
        try {
          const { chainId } = await iexec.network.getNetwork();
          if (abort) return;
          const ORACLE_APP_ADDRESS =
            oracleApp || getFactoryDefaults(chainId).ORACLE_APP_ADDRESS;

          const key = await iexec.dataset.generateEncryptionKey();
          safeObserver.next({
            message: 'ENCRYPTION_KEY_CREATED',
            key,
          });

          const dataset = JSON.stringify({
            apiKey,
            callId,
          });
          const encryptedFile = await iexec.dataset
            .encrypt(Buffer.from(dataset, 'utf8'), key)
            .catch((e: Error) => {
              throw new WorkflowError('Failed to encrypt API key', e);
            });
          if (abort) return;
          const checksum = await iexec.dataset
            .computeEncryptedFileChecksum(encryptedFile)
            .catch((e: Error) => {
              throw new WorkflowError(
                'Failed to compute encrypted API key checksum',
                e
              );
            });
          if (abort) return;
          safeObserver.next({
            message: 'FILE_ENCRYPTED',
            encryptedFile,
            checksum,
          });

          const cid = await ipfs
            .add(encryptedFile, { ipfsGateway, ipfsNode })
            .catch((e) => {
              throw new WorkflowError('Failed to upload encrypted API key', e);
            });
          if (abort) return;
          const multiaddr = `/ipfs/${cid}`;
          safeObserver.next({
            message: 'ENCRYPTED_FILE_UPLOADED',
            cid,
            multiaddr,
          });

          safeObserver.next({
            message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST',
          });
          const { address, txHash } = await iexec.dataset
            .deployDataset({
              owner: await iexec.wallet.getAddress(),
              name: 'api-key',
              multiaddr,
              checksum,
            })
            .catch((e: Error) => {
              throw new WorkflowError('Failed to deploy API key dataset', e);
            });
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_DEPLOYMENT_SUCCESS',
            address,
            txHash,
          });

          safeObserver.next({
            message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST',
          });
          await iexec.dataset
            .pushDatasetSecret(address, key)
            .catch((e: Error) => {
              throw new WorkflowError(
                "Failed to push API key dataset's encryption key",
                e
              );
            });
          if (abort) return;
          safeObserver.next({
            message: 'PUSH_SECRET_TO_SMS_SUCCESS',
          });

          const orderToSign = await iexec.order
            .createDatasetorder({
              dataset: address,
              tag: ['tee', 'scone'],
              apprestrict: ORACLE_APP_ADDRESS,
              volume: Number.MAX_SAFE_INTEGER - 1,
            })
            .catch((e: Error) => {
              throw new WorkflowError(
                "Failed to create API key datasetorder's",
                e
              );
            });
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST',
            order: orderToSign,
          });
          const order = await iexec.order
            .signDatasetorder(orderToSign)
            .catch((e: Error) => {
              throw new WorkflowError(
                "Failed to sign API key datasetorder's",
                e
              );
            });
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_ORDER_SIGNATURE_SUCCESS',
            order,
          });

          safeObserver.next({
            message: 'DATASET_ORDER_PUBLISH_SIGN_REQUEST',
            order,
          });
          const orderHash = await iexec.order
            .publishDatasetorder(order)
            .catch((e: Error) => {
              throw new WorkflowError(
                "Failed to publish API key datasetorder's",
                e
              );
            });
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_ORDER_PUBLISH_SUCCESS',
            orderHash,
          });

          safeObserver.complete();
        } catch (e) {
          if (abort) return;
          if (e instanceof WorkflowError) {
            safeObserver.error(e);
          } else {
            safeObserver.error(
              new WorkflowError('API key dataset creation unexpected error', e)
            );
          }
        }
      };
      safeObserver.unsub = () => {
        // teardown callback
        abort = true;
      };
      start();
      return safeObserver.unsubscribe.bind(safeObserver);
    }
  );

/**
 * Creates a new oracle based on the provided parameters.
 * @param {ParamSet & CreateOracleOptions} options Options for creating the oracle.
 * @returns {Observable<CreateOracleMessage>} Observable regarding the oracle creation process.
 */
const createOracle = ({
  url = throwIfMissing(),
  method = throwIfMissing(),
  headers,
  body = '',
  JSONPath = throwIfMissing(),
  dataType,
  apiKey,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
  ipfsNode = DEFAULT_IPFS_UPLOAD_URL,
  oracleApp = DEFAULT_APP_ADDRESS,
  iexec = throwIfMissing(),
}: ParamSet & CreateOracleOptions): Observable<CreateOracleMessage> => {
  return new Observable<CreateOracleMessage>(
    (observer: SafeObserver<CreateOracleMessage>) => {
      let abort = false;
      const safeObserver: SafeObserver<CreateOracleMessage> = new SafeObserver(
        observer
      );
      let stopCreateDataset: () => void;
      const start = async () => {
        try {
          await rawParamsSchema().validate({
            JSONPath,
            dataType,
            url,
            method,
            headers,
            body,
            apiKey,
          });

          let dataset: Address;
          // check use api
          const useApiKey =
            JSON.stringify({ url, headers }).indexOf(API_KEY_PLACEHOLDER) !==
            -1;
          if (useApiKey) {
            const callId = await computeCallId({
              url,
              method,
              headers,
              body,
            });
            if (abort) return;
            await new Promise<void>((resolve, reject) => {
              stopCreateDataset = createApiKeyDataset({
                iexec,
                apiKey,
                callId,
                ipfsGateway,
                ipfsNode,
                oracleApp,
              }).subscribe({
                error: (e) => reject(e),
                next: (v: CreateOracleMessage) => {
                  if (v.message === 'DATASET_DEPLOYMENT_SUCCESS') {
                    dataset = v.address;
                  }
                  safeObserver.next(v);
                },
                complete: () => resolve(),
              });
            });
          }
          const paramSet = await paramSetSchema().validate({
            JSONPath,
            url,
            method,
            headers,
            body,
            dataType,
            dataset,
          });

          const jsonParams = await jsonParamSetSchema().validate(
            formatParamsJson(paramSet)
          );
          if (abort) return;
          safeObserver.next({
            message: 'PARAM_SET_CREATED',
            paramSet: JSON.parse(jsonParams),
          });

          const oracleId = await computeOracleId(paramSet);
          if (abort) return;
          safeObserver.next({
            message: 'ORACLE_ID_COMPUTED',
            oracleId,
          });
          const cid = await ipfs
            .add(jsonParams, { ipfsGateway, ipfsNode })
            .catch((e) => {
              throw new WorkflowError('Failed to upload paramSet', e);
            });
          if (abort) return;
          const multiaddr = `/ipfs/${cid}`;
          safeObserver.next({
            message: 'PARAM_SET_UPLOADED',
            cid,
            multiaddr,
          });

          safeObserver.complete();
        } catch (e) {
          if (abort) return;
          if (e instanceof WorkflowError || e instanceof ValidationError) {
            safeObserver.error(e);
          } else {
            safeObserver.error(
              new WorkflowError('Create oracle unexpected error', e)
            );
          }
        }
      };
      safeObserver.unsub = () => {
        // teardown callback
        abort = true;
        if (typeof stopCreateDataset === 'function') {
          stopCreateDataset();
        }
      };
      start();
      return safeObserver.unsubscribe.bind(safeObserver);
    }
  );
};

export { createOracle };
