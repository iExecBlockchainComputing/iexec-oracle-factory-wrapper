import {
  Eip1193Provider,
  Provider,
  AbstractSigner,
  BrowserProvider,
} from 'ethers';
import { IExec } from 'iexec';
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_TARGET_BLOCKCHAIN,
} from '../config/config.js';
import {
  AddressOrENS,
  OracleValue,
  OracleFactoryOptions,
  ParamSet,
  Web3SignerProvider,
  DataType,
  ParamSetCID,
  OracleID,
  RawParams,
  CreateOracleMessage,
  UpdateOracleMessage,
} from '../types/index.js';
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

  private oracleAppWhitelist: AddressOrENS;

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
    ethProvider:
      | Eip1193Provider
      | Web3SignerProvider
      | AbstractSigner
      | BrowserProvider,
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
    this.oracleContract = options?.oracleContract;
    this.ipfsNode = options?.ipfsNode || DEFAULT_IPFS_UPLOAD_URL;
    this.ipfsGateway = options?.ipfsGateway || DEFAULT_IPFS_GATEWAY;
    this.oracleApp = options?.oracleApp;
    this.oracleAppWhitelist = options?.oracleAppWhitelist;
    this.workerpool = options?.workerpool;
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
      oracleAppWhitelist: this.oracleAppWhitelist,
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
      /**
       *  whether to use a voucher for payment (default: false)
       */
      useVoucher?: boolean;
    }
  ): Observable<UpdateOracleMessage> =>
    updateOracle({
      paramSetOrCid,
      targetBlockchains:
        options?.targetBlockchains || DEFAULT_TARGET_BLOCKCHAIN,
      useVoucher: options?.useVoucher || false,
      iexec: this.iexec,
      oracleApp: this.oracleApp,
      oracleAppWhitelist: this.oracleAppWhitelist,
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
