import { Eip1193Provider, Provider } from 'ethers';
import { IExec } from 'iexec';
import {
  DEFAULT_APP_ADDRESS,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  DEFAULT_TARGET_BLOCKCHAIN,
  DEFAULT_WORKERPOOL_ADDRESS,
} from '../config/config.js';
import {
  AddressOrENS,
  CreateOracleMessage,
  DataType,
  OracleFactoryOptions,
  OracleID,
  OracleValue,
  ParamSet,
  ParamSetCID,
  RawParams,
  UpdateOracleMessage,
  Web3SignerProvider,
} from '../types/public-types.js';
import { Observable } from '../utils/reactive.js';
import { createOracle } from './createOracle.js';
import { readOracle } from './readOracle.js';

import { updateOracle } from './updateOracle.js';

/**
 * IExecOracleFactory, used to interact with oracle creation, update, and read operations.
 */
class IExecOracleFactory {
  private oracleContract: AddressOrENS;

  private oracleApp: AddressOrENS;

  private workerpool: AddressOrENS;

  private ipfsNode: string;

  private ipfsGateway: string;

  private iexec: IExec;

  private ethersProviderPromise: Promise<Provider>;

  /**
   * Creates an instance of IExecOracleFactory.
   * @param ethProvider The Ethereum provider used to interact with the blockchain.
   * @param options Optional configuration options OracleFactory.
   */
  constructor(
    ethProvider: Eip1193Provider | Web3SignerProvider,
    options?: OracleFactoryOptions
  ) {
    try {
      this.iexec = new IExec({ ethProvider }, options?.iexecOptions);
    } catch (e) {
      throw new Error(`Unsupported ethProvider, ${e.message}`);
    }
    this.ethersProviderPromise = this.iexec.config
      .resolveContractsClient()
      .then((client) => client.provider);
    this.ethersProviderPromise.catch(() => {});
    this.oracleContract =
      options?.oracleContract || DEFAULT_ORACLE_CONTRACT_ADDRESS;
    this.ipfsNode = options?.ipfsNode || DEFAULT_IPFS_UPLOAD_URL;
    this.ipfsGateway = options?.ipfsGateway || DEFAULT_IPFS_GATEWAY;
    this.oracleApp = options?.oracleApp || DEFAULT_APP_ADDRESS;
    this.workerpool = options?.workerpool || DEFAULT_WORKERPOOL_ADDRESS;
  }

  /**
   * Creates a new oracle with the provided parameters.
   * @param rawParams {@link RawParams} for creating the oracle.
   * @returns Observable {@link CreateOracleMessage} result of the creation operation.
   */
  createOracle = (rawParams: RawParams): Observable<CreateOracleMessage> =>
    createOracle({
      ...rawParams,
      ipfsGateway: this.ipfsGateway,
      ipfsNode: this.ipfsNode,
      iexec: this.iexec,
      oracleApp: this.oracleApp,
    });

  /**
   * Updates an existing oracle with new parameters or a new CID.
   * @param paramSetOrCid Parameters or CID of the oracle to update.
   * @param options Update options.
   * @returns Observable result of the update operation.
   */
  updateOracle = (
    paramSetOrCid: ParamSet | ParamSetCID,
    options?: {
      /**
       * workerpool to use for the update
       */
      workerpool?: AddressOrENS;
      /**
       * Chain ID of target blockchains for cross-chain update.
       */
      targetBlockchains?: number[];
    }
  ): Observable<UpdateOracleMessage> =>
    updateOracle({
      paramSetOrCid,
      targetBlockchains:
        options?.targetBlockchains || DEFAULT_TARGET_BLOCKCHAIN,
      iexec: this.iexec,
      oracleApp: this.oracleApp,
      oracleContract: this.oracleContract,
      ipfsGateway: this.ipfsGateway,
      ipfsNode: this.ipfsNode,
      workerpool: options?.workerpool || this.workerpool,
    });

  /**
   * Reads an oracle with the provided ID CID or Oracle ID.
   * @param paramSetOrCidOrOracleId Parameters, CID or Oracle ID to read.
   * @param options Options for reading the oracle.
   * @returns Promise resolving to the oracle data.
   */
  readOracle = async (
    paramSetOrCidOrOracleId: ParamSet | ParamSetCID | OracleID,
    options?: { dataType?: DataType }
  ): Promise<OracleValue> =>
    readOracle({
      paramSetOrCidOrOracleId,
      dataType: options?.dataType,
      ethersProvider: await this.ethersProviderPromise,
      ipfsGateway: this.ipfsGateway,
      oracleContract: this.oracleContract,
    });

  /**
   * Gets the current instance of the IExec interface.
   * @returns Current instance of IExec.
   */
  getIExec = () => this.iexec;
}

export { IExecOracleFactory };
