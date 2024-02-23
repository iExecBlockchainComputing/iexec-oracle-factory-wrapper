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
import {
  AddressOrENS,
  OracleValue,
  OracleReaderOptions,
  ParamSet,
  Web3ReadOnlyProvider,
  Web3SignerProvider,
  DataType,
  ParamSetCID,
  OracleID,
} from '../types/public-types.js';
import { readOracle } from './readOracle.js';

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
        options?.providerOptions
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
   * @param {ParamSet | ParamSetCID | OracleID} paramSetOrCidOrOracleId Parameters or CID or Oracle ID of the oracle to read.
   * @param {DataType} dataType Data type to read from the oracle.
   * @returns {Promise<OracleValue>} Promise that resolves to the read oracle data.
   */
  readOracle(
    paramSetOrCidOrOracleId: ParamSet | ParamSetCID | OracleID,
    dataType?: DataType
  ): Promise<OracleValue> {
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

  /**
   * Gets the Ethereum contract address or ENS name for the oracle contract.
   * @returns {AddressOrENS}
   */
  getOracleContract = (): AddressOrENS => this.oracleContract;

  /**
   * Gets the IPFS gateway URL.
   * @returns {string}
   */
  getIpfsGateway = (): string => this.ipfsGateway;
}

export { IExecOracleReader };
