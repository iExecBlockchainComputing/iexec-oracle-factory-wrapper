import { Buffer } from 'buffer';
import {
  API_KEY_PLACEHOLDER,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  getFactoryDefaults,
} from '../config/config.js';
import * as ipfs from '../services/ipfs/index.js';
import {
  CreateApiKeyDatasetParams,
  CreateOracleMessage,
  IExecConsumer,
  CreateOracleOptions,
} from '../types/internal-types.js';
import { Address, RawParams } from '../types/public-types.js';
import {
  ValidationError,
  WorkflowError,
  handleIfProtocolError,
} from '../utils/errors.js';
import { formatParamsJson } from '../utils/format.js';
import { computeCallId, computeOracleId } from '../utils/hash.js';
import { Observable, SafeObserver } from '../utils/reactive.js';
import {
  jsonParamSetSchema,
  paramSetSchema,
  rawParamsSchema,
} from '../utils/validators.js';

/**
 * Creates a dataset containing an API key.
 * @param {CreateApiKeyDatasetParams & IExecConsumer} params Parameters for creating the dataset.
 * @returns {Observable<CreateOracleMessage>} Observable regarding the creation process.
 */
const createApiKeyDataset = ({
  iexec,
  apiKey,
  callId,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
  ipfsNode = DEFAULT_IPFS_UPLOAD_URL,
  oracleApp,
}: CreateApiKeyDatasetParams &
  CreateOracleOptions &
  IExecConsumer): Observable<CreateOracleMessage> =>
  new Observable<CreateOracleMessage>(
    // eslint-disable-next-line sonarjs/cognitive-complexity
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
              throw new WorkflowError({
                message: 'Failed to encrypt API key',
                errorCause: e,
              });
            });
          if (abort) return;
          const checksum = await iexec.dataset
            .computeEncryptedFileChecksum(encryptedFile)
            .catch((e: Error) => {
              throw new WorkflowError({
                message: 'Failed to compute encrypted API key checksum',
                errorCause: e,
              });
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
              throw new WorkflowError({
                message: 'Failed to upload encrypted API key',
                errorCause: e,
              });
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
          const { address, txHash } = await iexec.dataset.deployDataset({
            owner: await iexec.wallet.getAddress(),
            name: 'api-key',
            multiaddr,
            checksum,
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
          await iexec.dataset.pushDatasetSecret(address, key);
          if (abort) return;
          safeObserver.next({
            message: 'PUSH_SECRET_TO_SMS_SUCCESS',
          });

          const orderToSign = await iexec.order.createDatasetorder({
            dataset: address,
            tag: ['tee', 'scone'],
            apprestrict: ORACLE_APP_ADDRESS,
            volume: Number.MAX_SAFE_INTEGER - 1,
          });
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST',
            order: orderToSign,
          });
          const order = await iexec.order
            .signDatasetorder(orderToSign)
            .catch((e: Error) => {
              throw new WorkflowError({
                message: "Failed to sign API key datasetorder's",
                errorCause: e,
              });
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
          const orderHash = await iexec.order.publishDatasetorder(order);
          if (abort) return;
          safeObserver.next({
            message: 'DATASET_ORDER_PUBLISH_SUCCESS',
            orderHash,
          });

          safeObserver.complete();
        } catch (e) {
          if (abort) return;
          handleIfProtocolError(e, safeObserver);
          if (e instanceof WorkflowError) {
            safeObserver.error(e);
          } else {
            safeObserver.error(
              new WorkflowError({
                message:
                  'Failed to create dataset containing encrypted API key',
                errorCause: e,
              })
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
 * @param {RawParams & CreateOracleOptions & IExecConsumer} options Options for creating the oracle.
 * @returns {Observable<CreateOracleMessage>} Observable regarding the oracle creation process.
 */
const createOracle = ({
  url,
  method,
  headers,
  body = '',
  JSONPath,
  dataType,
  apiKey,
  iexec,
  oracleApp,
  ipfsGateway,
  ipfsNode,
}: RawParams &
  CreateOracleOptions &
  IExecConsumer): Observable<CreateOracleMessage> => {
  return new Observable<CreateOracleMessage>(
    // eslint-disable-next-line sonarjs/cognitive-complexity
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
              throw new WorkflowError({
                message: 'Failed to upload paramSet',
                errorCause: e,
              });
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
          handleIfProtocolError(e, safeObserver);
          if (e instanceof WorkflowError || e instanceof ValidationError) {
            safeObserver.error(e);
          } else {
            safeObserver.error(
              new WorkflowError({
                message: 'Failed to create oracle',
                errorCause: e,
              })
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
