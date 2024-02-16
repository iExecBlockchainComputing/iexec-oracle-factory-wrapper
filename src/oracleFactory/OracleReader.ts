import { Provider } from 'ethers';
import { IExec } from 'iexec';
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_ORACLE_CONTRACT_ADDRESS,
  getDefaultProvider,
} from '../config/config.js';
import { readOracle } from './readOracle.js';
import {
  AddressOrENS,
  ParamSet,
  Oracle,
  OracleReaderOptions,
} from './types.js';

/**
 * Oracle Reader that interacts with iExec Oracle.
 */
class IExecOracleReader {
  /**
   * Ethereum contract address or ENS (Ethereum Name Service) for the oracle contract.
   */
  private oracleContract: AddressOrENS;

  /**
   * IPFS gateway URL.
   */
  private ipfsGateway: string;

  private iexec: IExec;

  /**
   * Ethereum provider.
   */
  private ethersProvider: Provider;

  /**
   * Creates an instance of IExecOracleReader.
   * @param {Provider} [ethProvider] Ethereum provider.
   * @param {OracleReaderOptions} [options] Options for the Oracle Reader.
   * @param {any} [providerOptions] Options for the provider.
   */
  constructor(
    ethProvider?: Provider,
    options?: OracleReaderOptions,
    providerOptions?: any
  ) {
    this.ethersProvider =
      ethProvider ||
      getDefaultProvider('https://bellecour.iex.ec', providerOptions);
    this.oracleContract =
      options?.oracleContract || DEFAULT_ORACLE_CONTRACT_ADDRESS;
    this.ipfsGateway = options?.ipfsGateway || DEFAULT_IPFS_GATEWAY;
  }

  /**
   * Reads data from the oracle.
   * @param {ParamSet | string} paramSetOrCidOrOracleId Parameters or CID or Oracle ID for reading data from the oracle.
   * @param {string} [dataType] Data type to read from the oracle.
   * @returns {Promise<Oracle>} Promise that resolves to the read oracle data.
   */
  readOracle(
    paramSetOrCidOrOracleId: ParamSet | string,
    dataType?: string
  ): Promise<Oracle> {
    return readOracle({
      paramSetOrCidOrOracleId,
      dataType,
      ethersProvider: this.ethersProvider,
      ipfsGateway: this.ipfsGateway,
      oracleContract: this.oracleContract,
    });
  }

  /**
   * Gets the instance of IExec.
   * @returns {IExec}
   */
  getIExec = () => this.iexec;
}

export { IExecOracleReader };
