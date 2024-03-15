import { getSignerFromPrivateKey } from 'iexec/utils';
import { getDefaultProvider } from '../config/config.js';
import {
  Web3ReadOnlyProvider,
  Web3SignerProvider,
} from '../types/public-types.js';

export const getWeb3Provider = (privateKey: string): Web3SignerProvider =>
  getSignerFromPrivateKey('bellecour', privateKey);

export const getWeb3ReadOnlyProvider = (
  network: string | number
): Web3ReadOnlyProvider => getDefaultProvider(network);
