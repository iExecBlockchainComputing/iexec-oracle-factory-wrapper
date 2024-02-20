import { AbstractProvider, Provider } from 'ethers';
import { EnhancedWallet, IExec } from 'iexec';
import { IExecConfigOptions } from 'iexec/IExecConfig';

/**
 * Ethereum address.
 */
export type Address = string;

/**
 * Ethereum Name Service (ENS) name.
 */
type ENS = string;

/**
 * ethereum address or ENS name (Ethereum Name Service)
 */
export type AddressOrENS = Address | ENS;

/**
 * Configuration options for OracleFactory.
 */
export type OracleFactoryOptions = {
  oracleContract?: AddressOrENS;
  iexecOptions?: IExecConfigOptions;
  ipfsNode?: string;
  ipfsGateway?: string;
  oracleApp?: AddressOrENS;
  workerpool?: AddressOrENS;
};

/**
 * Configuration options for OracleReader.
 */
export type OracleReaderOptions = {
  oracleContract?: AddressOrENS;
  ipfsGateway?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providerOptions?: any;
};

export type Web3SignerProvider = EnhancedWallet;
export type Web3ReadOnlyProvider = AbstractProvider;

/**
 * Set of parameters for an oracle request.
 */
export type ParamSet = {
  url: string;
  method: NonNullable<'GET' | 'POST' | 'PUT' | 'DELETE'>;
  JSONPath: string;
  headers?: object;
  body?: string;
  dataType?: NonNullable<'string' | 'number' | 'boolean'>;
  apiKey?: string;
  dataset?: Address;
};

/**
 * Parameters for reading data from an oracle.
 */
export type ReadOracleParams = {
  paramSetOrCidOrOracleId: ParamSet | string;
  dataType?: string;
};

/**
 * Parameters for reading data from an oracle.
 */
export type ReadOracleOptions = {
  ethersProvider: Provider;
  ipfsGateway?: string;
  oracleContract?: Address;
};

/**
 * Response from an oracle query.
 */
export type Oracle = {
  value: boolean | string | number;
  date: number;
};

/**
 * Options for creating an oracle.
 */
export type CreateOracleOptions = {
  iexec?: IExec;
  oracleApp?: AddressOrENS;
  ipfsGateway?: string;
  ipfsNode?: string;
};

/**
 * Parameters required to update an oracle.
 */
export type UpdateOracleParams = {
  paramSetOrCid: ParamSet | string;
  targetBlockchains?: number[];
};

/**
 * Options for updating an oracle.
 */
export type UpdateOracleOptions = {
  iexec?: IExec;
  oracleApp?: AddressOrENS;
  oracleContract?: Address;
  workerpool?: AddressOrENS;
  ipfsGateway?: string;
};
