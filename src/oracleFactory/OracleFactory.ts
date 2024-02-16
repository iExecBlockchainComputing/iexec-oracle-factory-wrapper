import { IExec } from 'iexec';
import { Eip1193Provider } from 'ethers';
import {
  AddressOrENS,
  OracleFactoryOptions,
  ParamSet,
  Oracle,
  Web3SignerProvider,
  CreateOracleMessage,
  UpdateOracleMessage,
} from './types.js';
import {
  DEFAULT_APP_ADDRESS,
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  DEFAULT_WORKERPOOL_ADDRESS,
  getDefaultProvider,
} from '../config/config.js';
import { Observable } from '../utils/reactive.js';
import { updateOracle } from './updateOracle.js';
import { readOracle } from './readOracle.js';
import { createOracle } from './createOracle.js';
import { Provider } from 'ethers';

/**
 * IExecOracleFactory, used to interact with oracle creation, update, and read operations.
 */
class IExecOracleFactory {
  private oracleContract: AddressOrENS;
  private oracleApp: AddressOrENS;
  private workerpool: AddressOrENS;
  private ipfsUploadUrl: string;
  private ipfsGateway: string;
  private iexec: IExec;
  private ethersProvider: Provider;

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
    this.ethersProvider = getDefaultProvider('https://bellecour.iex.ec', {});
    this.oracleContract =
      options?.oracleContract || DEFAULT_ORACLE_CONTRACT_ADDRESS;
    this.ipfsUploadUrl = options?.ipfsUploadUrl || DEFAULT_IPFS_UPLOAD_URL;
    this.ipfsGateway = options?.ipfsGateway || DEFAULT_IPFS_GATEWAY;
    this.oracleApp = options?.oracleApp || DEFAULT_APP_ADDRESS;
    this.workerpool = options?.workerpool || DEFAULT_WORKERPOOL_ADDRESS;
  }

  /**
   * Creates a new oracle with the provided parameters.
   * @param args {@link ParamSet} for creating the oracle.
   * @returns Observable {@link CreateOracleMessage} result of the creation operation.
   */
  createOracle = (args: ParamSet): Observable<CreateOracleMessage> =>
    createOracle({
      ...args,
      ipfsGateway: this.ipfsGateway,
      ipfsUploadUrl: this.ipfsUploadUrl,
      iexec: this.iexec,
      oracleApp: this.oracleApp,
    });

  /**
   * Updates an existing oracle with new parameters or a new CID.
   * @param args {@link ParamSet} or CID for updating the oracle.
   * @returns Observable result of the update operation.
   */
  updateOracle = (args: ParamSet | string): Observable<UpdateOracleMessage> =>
    updateOracle({
      paramSetOrCid: args,
      iexec: this.iexec,
      oracleApp: this.oracleApp,
      oracleContract: this.oracleContract,
      ipfsGateway: this.ipfsGateway,
      ipfsUploadUrl: this.ipfsUploadUrl,
      workerpool: this.workerpool,
    });

  /**
   * Reads an oracle with the provided ID CID or Oracle ID.
   * @param paramSetOrCidOrOracleId The ID CID or Oracle ID to read.
   * @param dataType Optional data type for reading the oracle.
   * @returns Promise resolving to the oracle data.
   */
  readOracle = (
    paramSetOrCidOrOracleId: ParamSet | string,
    dataType?: string
  ): Promise<Oracle> =>
    readOracle({
      paramSetOrCidOrOracleId,
      dataType,
      ethersProvider: this.ethersProvider,
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
