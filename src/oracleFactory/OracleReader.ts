import {
  AbstractProvider,
  Provider,
  Eip1193Provider,
  BrowserProvider,
  Wallet,
} from 'ethers';
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
  Web3SignerProvider,
  Web3ReadOnlyProvider,
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
   * @param {Provider} [ethProviderOrNetwork] Ethereum provider, chainId or network name.
   * @param {OracleReaderOptions} [options] Options for the Oracle Reader.
   */
  constructor(
    ethProviderOrNetwork:
      | Web3ReadOnlyProvider
      | Web3SignerProvider
      | Eip1193Provider
      | string
      | number = 134,
    options?: OracleReaderOptions
  ) {
    if (
      typeof ethProviderOrNetwork === 'string' ||
      typeof ethProviderOrNetwork === 'number'
    ) {
      // case chainId
      this.ethersProvider = getDefaultProvider(
        ethProviderOrNetwork,
        options.providerOptions
      );
    } else if (ethProviderOrNetwork instanceof Wallet) {
      // case getWeb3Provider
      this.ethersProvider = ethProviderOrNetwork.provider;
    } else if (ethProviderOrNetwork instanceof AbstractProvider) {
      // case getWeb3ReadOnlyProvider
      this.ethersProvider = ethProviderOrNetwork;
    } else {
      // case Eip1193Provider
      this.ethersProvider = new BrowserProvider(ethProviderOrNetwork);
    }
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
