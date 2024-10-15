import CID from 'cids';
import { DEFAULT_IPFS_GATEWAY, getFactoryDefaults } from '../config/config.js';
import * as ipfs from '../services/ipfs/index.js';
import { ParamSet } from '../types/common.js';
import { IExecConsumer } from '../types/internal.js';
import {
  TaskExecutionMessage,
  UpdateOracleMessage,
  UpdateOracleOptions,
  UpdateOracleParams,
} from '../types/updateOracle.js';
import {
  ValidationError,
  WorkflowError,
  handleIfProtocolError,
  updateErrorMessage,
} from '../utils/errors.js';
import { formatParamsJson } from '../utils/format.js';
import { Observable, SafeObserver } from '../utils/reactive.js';
import {
  jsonParamSetSchema,
  paramSetSchema,
  updateTargetBlockchainsSchema,
} from '../utils/validators.js';

/**
 * Retrieves parameter set information from IPFS.
 * @param paramSetOrCid Parameter set or CID.
 * @param ipfsGateway IPFS gateway URL.
 * @returns JSON Object containing the parameter set.
 * @throws {ValidationError} If there is a validation error.
 * @throws {WorkflowError} If there is an unexpected workflow error.
 */
const getParamSet = async ({
  paramSetOrCid,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
}: {
  paramSetOrCid: ParamSet | string;
  ipfsGateway?: string;
}): Promise<{
  paramSet: ParamSet;
  paramsJson: string;
  isUploaded: boolean;
}> => {
  let paramSet;
  let paramsJson;
  let isUploaded = false;
  if (ipfs.isCid(paramSetOrCid)) {
    const cid = new CID(paramSetOrCid as string).toString();
    const contentBuffer = await ipfs.get(cid, { ipfsGateway }).catch(() => {
      throw Error(`Failed to load paramSetSet from CID ${cid}`);
    });
    const contentText = contentBuffer.toString();
    try {
      paramsJson = await jsonParamSetSchema().validate(contentText);
      paramSet = JSON.parse(paramsJson);
      isUploaded = true;
    } catch (e) {
      throw Error(`Content associated to CID ${cid} is not a valid paramSet`);
    }
  } else {
    paramSet = await paramSetSchema().validate(paramSetOrCid);
    paramsJson = await jsonParamSetSchema().validate(
      formatParamsJson(paramSet)
    );
  }
  return { paramSet, paramsJson, isUploaded };
};

/**
 * Updates an oracle with new parameters.
 * @param paramSetOrCid Parameter set or CID.
 * @param iexec iExec SDK instance.
 * @param targetBlockchains Chain ID of target blockchains for cross-chain update
 * @param useVoucher Whether to use a voucher for payment (default: false)
 * @param oracleApp Oracle application address.
 * @param workerpool Workerpool address.
 * @param ipfsGateway IPFS gateway URL.
 * @param ipfsNode IPFS upload node URL.
 * @param oracleContract Oracle contract address.
 * @returns An observable for tracking the update process.
 */
const updateOracle = ({
  paramSetOrCid,
  targetBlockchains,
  useVoucher,
  iexec,
  oracleApp,
  oracleAppWhitelist,
  ipfsGateway,
  ipfsNode,
  workerpool,
  oracleContract,
}: UpdateOracleParams &
  UpdateOracleOptions &
  IExecConsumer): Observable<UpdateOracleMessage> =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  new Observable((observer: SafeObserver<UpdateOracleMessage>) => {
    let abort = false;
    let stopWatcher;
    const safeObserver = new SafeObserver(observer);
    const start = async () => {
      try {
        const targetBlockchainsArray =
          await updateTargetBlockchainsSchema().validate(targetBlockchains);
        const { chainId } = await iexec.network.getNetwork();
        if (abort) return;
        const appAddress =
          oracleApp || getFactoryDefaults(chainId).ORACLE_APP_ADDRESS;
        const appWhitelistAddress =
          oracleAppWhitelist ||
          getFactoryDefaults(chainId).ORACLE_APP_WHITELIST_ADDRESS;
        const oracleAddress =
          oracleContract || getFactoryDefaults(chainId).ORACLE_CONTRACT_ADDRESS;
        const workerpoolAddress =
          workerpool || getFactoryDefaults(chainId).WORKERPOOL_ADDRESS;

        let cid;
        safeObserver.next({
          message: 'ENSURE_PARAMS',
        });
        const { isUploaded, paramSet, paramsJson } = await getParamSet({
          paramSetOrCid,
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
        if (abort) return;
        if (isUploaded) {
          cid = paramSetOrCid;
        } else {
          safeObserver.next({
            message: 'ENSURE_PARAMS_UPLOAD',
          });
          cid = await ipfs
            .add(paramsJson, { ipfsGateway, ipfsNode })
            .catch((e) => {
              throw new WorkflowError({
                message: 'Failed to upload paramSet',
                errorCause: e,
              });
            });
          if (abort) return;
        }
        safeObserver.next({
          message: 'ENSURE_PARAMS_SUCCESS',
          paramSet,
          cid,
        });

        // Fetch app order
        safeObserver.next({
          message: 'FETCH_APP_ORDER',
        });
        const datasetAddress = paramSet.dataset;
        const apporderbook = await iexec.orderbook.fetchAppOrderbook(
          appAddress,
          {
            minTag: ['tee', 'scone'],
            maxTag: ['tee', 'scone'],
            requester: await iexec.wallet.getAddress(),
            workerpool: workerpoolAddress,
            dataset: datasetAddress,
          }
        );
        if (abort) return;
        const apporder =
          apporderbook &&
          apporderbook.orders[0] &&
          apporderbook.orders[0].order;

        if (!apporder) {
          throw new WorkflowError({
            message: updateErrorMessage,
            errorCause: Error('No app order published'),
          });
        }
        safeObserver.next({
          message: 'FETCH_APP_ORDER_SUCCESS',
          order: apporder,
        });

        let datasetorder;
        if (
          datasetAddress &&
          datasetAddress !== '0x0000000000000000000000000000000000000000'
        ) {
          // Fetch dataset order
          safeObserver.next({
            message: 'FETCH_DATASET_ORDER',
          });
          const [datasetorderForApp, datasetorderForWhitelist] =
            await Promise.all([
              iexec.orderbook
                .fetchDatasetOrderbook(datasetAddress, {
                  minTag: ['tee', 'scone'],
                  maxTag: ['tee', 'scone'],
                  requester: await iexec.wallet.getAddress(),
                  workerpool: workerpoolAddress,
                  app: appAddress,
                })
                .then(
                  (orderbook) =>
                    orderbook &&
                    orderbook.orders[0] &&
                    orderbook.orders[0].order
                ),
              iexec.orderbook
                .fetchDatasetOrderbook(datasetAddress, {
                  minTag: ['tee', 'scone'],
                  maxTag: ['tee', 'scone'],
                  requester: await iexec.wallet.getAddress(),
                  workerpool: workerpoolAddress,
                  app: appWhitelistAddress,
                })
                .then(
                  (orderbook) =>
                    orderbook &&
                    orderbook.orders[0] &&
                    orderbook.orders[0].order
                ),
            ]);
          if (abort) return;
          if (datasetorderForApp && datasetorderForWhitelist) {
            // get cheapest order
            datasetorder =
              datasetorderForApp.datasetprice <
              datasetorderForWhitelist.datasetprice
                ? datasetorderForApp
                : datasetorderForWhitelist;
          } else {
            datasetorder = datasetorderForApp || datasetorderForWhitelist;
          }
          if (!datasetorder) {
            throw new WorkflowError({
              message: updateErrorMessage,
              errorCause: Error('No dataset order published'),
            });
          }
          safeObserver.next({
            message: 'FETCH_DATASET_ORDER_SUCCESS',
            order: datasetorder,
          });
        }

        // Fetch workerpool order
        safeObserver.next({
          message: 'FETCH_WORKERPOOL_ORDER',
        });
        const workerpoolorderbook =
          await iexec.orderbook.fetchWorkerpoolOrderbook({
            minTag: ['tee', 'scone'],
            requester: await iexec.wallet.getAddress(),
            workerpool: workerpoolAddress,
            app: oracleAppWhitelist,
            dataset: datasetAddress,
          });
        if (abort) return;
        const workerpoolorder =
          workerpoolorderbook &&
          workerpoolorderbook.orders[0] &&
          workerpoolorderbook.orders[0].order;

        if (!workerpoolorder) {
          throw new WorkflowError({
            message: updateErrorMessage,
            errorCause: Error('No workerpool order published'),
          });
        }
        safeObserver.next({
          message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
          order: workerpoolorder,
        });

        // Create request order
        const requestorderToSign = await iexec.order
          .createRequestorder({
            app: appAddress,
            category: workerpoolorder.category,
            dataset: datasetAddress,
            workerpool: workerpoolAddress,
            callback: oracleAddress,
            appmaxprice: apporder.appprice,
            datasetmaxprice: datasetorder && datasetorder.datasetprice,
            workerpoolmaxprice: workerpoolorder.workerpoolprice,
            tag: ['tee', 'scone'],
            params: {
              iexec_args: targetBlockchainsArray.join(','),
              iexec_input_files: [`${ipfsGateway}/ipfs/${cid}`],
              iexec_developer_logger: true,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .catch((e) => {
            throw new WorkflowError({
              message: 'Failed to create request order',
              errorCause: e,
            });
          });
        if (abort) return;
        safeObserver.next({
          message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
          order: requestorderToSign,
        });

        // Sign and publish request order
        const requestorder = await iexec.order
          .signRequestorder(requestorderToSign, { preflightCheck: false })
          .catch((e) => {
            throw new WorkflowError({
              message: 'Failed to sign requestorder',
              errorCause: e,
            });
          });
        if (abort) return;
        safeObserver.next({
          message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
          order: requestorder,
        });

        // Match orders
        safeObserver.next({
          message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
          apporder,
          datasetorder,
          workerpoolorder,
          requestorder,
        });
        const { dealid, txHash } = await iexec.order.matchOrders(
          {
            apporder,
            datasetorder,
            workerpoolorder,
            requestorder,
          },
          { preflightCheck: false, useVoucher }
        );
        if (abort) return;
        safeObserver.next({
          message: 'MATCH_ORDERS_SUCCESS',
          dealid,
          txHash,
        });

        // Compute task ID
        const taskid = await iexec.deal.computeTaskId(dealid, 0);
        if (abort) return;

        // Watch task execution
        const watchExecution = () =>
          new Promise<TaskExecutionMessage | void>((resolve, reject) => {
            iexec.task.obsTask(taskid, { dealid }).then((obs) => {
              stopWatcher = obs.subscribe({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                next: (value: any) => {
                  const { message } = value;
                  if (message === 'TASK_TIMEDOUT') {
                    reject(
                      new WorkflowError({
                        message: 'Oracle update task timed out, update failed',
                        errorCause: Error(
                          `Task ${taskid} from deal ${dealid} timed out`
                        ),
                      })
                    );
                  }
                  if (message === 'TASK_COMPLETED') {
                    resolve();
                  }
                  if (message === 'TASK_UPDATED') {
                    safeObserver.next({
                      message: 'TASK_UPDATED',
                      dealid,
                      taskid,
                      status: value.task && value.task.statusName,
                    });
                  }
                },
                error: (e) => {
                  handleIfProtocolError(e, safeObserver);
                  reject(
                    new WorkflowError({
                      message: 'Failed to monitor oracle update task',
                      errorCause: e,
                    })
                  );
                },
                complete: () => {},
              });
            });
          });
        await watchExecution();

        safeObserver.next({
          message: 'UPDATE_TASK_COMPLETED',
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
              message: 'Failed to update oracle',
              errorCause: e,
            })
          );
        }
      }
    };
    safeObserver.unsub = () => {
      // teardown callback
      abort = true;
      if (typeof stopWatcher === 'function') {
        stopWatcher();
      }
    };
    start();
    return safeObserver.unsubscribe.bind(safeObserver);
  });

export { updateOracle };
