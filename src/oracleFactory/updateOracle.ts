import CID from 'cids';
import { DEFAULT_IPFS_GATEWAY, getFactoryDefaults } from '../config/config.js';
import * as ipfs from '../services/ipfs/index.js';
import {
  IExecConsumer,
  TaskExecutionMessage,
  UpdateOracleMessage,
  UpdateOracleOptions,
  UpdateOracleParams,
} from '../types/internal-types.js';
import { ParamSet } from '../types/public-types.js';
import { ValidationError, WorkflowError } from '../utils/errors.js';
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
        const userAddress = await iexec.wallet.getAddress();
        let voucherInfos;
        if (useVoucher) {
          voucherInfos = await iexec.voucher.showUserVoucher(userAddress);
        }
        const targetBlockchainsArray =
          await updateTargetBlockchainsSchema().validate(targetBlockchains);
        const { chainId } = await iexec.network.getNetwork();
        if (abort) return;
        const ORACLE_APP_ADDRESS =
          oracleApp || getFactoryDefaults(chainId).ORACLE_APP_ADDRESS;
        const ORACLE_CONTRACT_ADDRESS =
          oracleContract || getFactoryDefaults(chainId).ORACLE_CONTRACT_ADDRESS;

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
            throw new WorkflowError('Failed to load paramSet', e);
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
              throw new WorkflowError('Failed to upload paramSet', e);
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
        const apporderbook = await iexec.orderbook
          .fetchAppOrderbook(ORACLE_APP_ADDRESS, {
            minTag: ['tee', 'scone'],
            maxTag: ['tee', 'scone'],
            requester: userAddress,
            workerpool,
            dataset: datasetAddress,
          })
          .catch((e) => {
            throw new WorkflowError('Failed to fetch apporder', e);
          });
        if (abort) return;
        const apporder =
          apporderbook &&
          apporderbook.orders[0] &&
          apporderbook.orders[0].order;

        if (!apporder) {
          throw new WorkflowError('No apporder published');
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
          const datasetorderbook = await iexec.orderbook
            .fetchDatasetOrderbook(datasetAddress, {
              minTag: ['tee', 'scone'],
              maxTag: ['tee', 'scone'],
              requester: userAddress,
              workerpool,
              app: ORACLE_APP_ADDRESS,
            })
            .catch((e) => {
              throw new WorkflowError('Failed to fetch datasetorder', e);
            });
          if (abort) return;
          datasetorder =
            datasetorderbook &&
            datasetorderbook.orders[0] &&
            datasetorderbook.orders[0].order;
          if (!datasetorder) {
            throw new WorkflowError('No datasetorder published');
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
        const workerpoolorderbook = await iexec.orderbook
          .fetchWorkerpoolOrderbook({
            minTag: ['tee', 'scone'],
            requester: userAddress,
            workerpool,
            app: ORACLE_APP_ADDRESS,
            dataset: datasetAddress,
          })
          .catch((e) => {
            throw new WorkflowError('Failed to fetch workerpoolorder', e);
          });
        if (abort) return;
        const workerpoolorder =
          workerpoolorderbook &&
          workerpoolorderbook.orders[0] &&
          workerpoolorderbook.orders[0].order;

        if (useVoucher) {
          const sponsoredWorkerpools = voucherInfos.sponsoredWorkerpools;
          const workerpoolAddress = await iexec.ens.resolveName(workerpool);
          const voucherBalance = parseInt(voucherInfos.balance.toString());
          const totalWorkerpoolCost =
            workerpoolorder.workerpoolprice * workerpoolorder.volume;

          // Check if the workerpool is sponsored by the voucher
          if (sponsoredWorkerpools.includes(workerpoolAddress)) {
            // Check if the voucher can pay for the entire workerpool order
            if (voucherBalance < totalWorkerpoolCost) {
              // Check if the voucher can use the user's account
              const voucherAddress =
                await iexec.voucher.getVoucherAddress(userAddress);
              const voucherAllowanceAmount = await iexec.account.checkAllowance(
                userAddress,
                voucherAddress
              );
              const voucherAllowance = parseInt(
                voucherAllowanceAmount.toString()
              );
              if (voucherAllowance === 0) {
                throw new WorkflowError(
                  `Insufficient voucher balance (${voucherBalance} nRLC) to cover workerpool cost (${totalWorkerpoolCost} nRLC). Authorize the voucher ${voucherAddress} to use account ${userAddress} to cover the remaining amount`
                );
              }

              // Check if the allowance is sufficient to cover the additional amount
              const additionalAmountRequired =
                totalWorkerpoolCost - voucherBalance;
              if (voucherAllowance < additionalAmountRequired) {
                throw new WorkflowError(
                  `Insufficient voucher balance (${voucherBalance} RLC) to cover workerpool cost (${totalWorkerpoolCost} RLC). Insufficient allowance (${voucherAllowance} nRLC) to cover the additional amount (${additionalAmountRequired} nRLC required)`
                );
              }
            }
          } else {
            // Check if the user's stake is sufficient to cover the workerpool order cost
            const { stake: userStake } =
              await iexec.account.checkBalance(userAddress);
            const userStakeNumber = parseInt(userStake.toString());
            if (userStakeNumber < totalWorkerpoolCost) {
              throw new WorkflowError(
                `Insufficient user balance (${userStakeNumber} nRLC) to cover workerpool cost (${totalWorkerpoolCost} nRLC).`
              );
            }
          }
        }

        if (!workerpoolorder) {
          throw new WorkflowError('No workerpoolorder published');
        }
        safeObserver.next({
          message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
          order: workerpoolorder,
        });

        // Create request order
        const requestorderToSign = await iexec.order
          .createRequestorder({
            app: ORACLE_APP_ADDRESS,
            category: workerpoolorder.category,
            dataset: datasetAddress,
            workerpool,
            callback: ORACLE_CONTRACT_ADDRESS,
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
            throw new WorkflowError('Failed to create requestorder', e);
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
            throw new WorkflowError('Failed to sign requestorder', e);
          });
        if (abort) return;
        safeObserver.next({
          message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
          order: requestorderToSign,
        });

        // Match orders
        safeObserver.next({
          message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
          apporder,
          datasetorder,
          workerpoolorder,
          requestorder,
        });
        const { dealid, txHash } = await iexec.order
          .matchOrders(
            {
              apporder,
              datasetorder,
              workerpoolorder,
              requestorder,
            },
            { preflightCheck: false }
          )
          .catch((e) => {
            throw new WorkflowError('Failed to match orders', e);
          });
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
                      new WorkflowError(
                        'Oracle update task timed out, update failed',
                        Error(`Task ${taskid} from deal ${dealid} timed out`)
                      )
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
                error: (e) =>
                  reject(
                    new WorkflowError('Failed to monitor oracle update task', e)
                  ),
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
        if (e instanceof WorkflowError || e instanceof ValidationError) {
          safeObserver.error(e);
        } else {
          safeObserver.error(
            new WorkflowError(
              'Update oracle unexpected error : ' + e.message,
              e
            )
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
