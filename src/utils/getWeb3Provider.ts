import { getSignerFromPrivateKey } from 'iexec/utils';
import { Web3SignerProvider } from '../oracleFactory/types.js';
import { getDefaultProvider } from '../config/config.js';
import { Provider } from 'ethers';

export const getWeb3Provider = (privateKey: string): Web3SignerProvider =>
  getSignerFromPrivateKey('bellecour', privateKey);

export const getWeb3ReadOnlyProvider = (): Provider =>
  getDefaultProvider('bellecour', {});
