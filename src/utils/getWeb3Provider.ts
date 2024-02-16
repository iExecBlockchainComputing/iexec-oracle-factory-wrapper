import { Provider } from 'ethers';
import { getSignerFromPrivateKey } from 'iexec/utils';
import { getDefaultProvider } from '../config/config.js';
import { Web3SignerProvider } from '../oracleFactory/types.js';

export const getWeb3Provider = (privateKey: string): Web3SignerProvider =>
  getSignerFromPrivateKey('bellecour', privateKey);

export const getWeb3ReadOnlyProvider = (): Provider =>
  getDefaultProvider('bellecour', {});
