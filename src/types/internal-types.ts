import { Provider } from 'ethers';
import { IExec } from 'iexec';

export type IExecConsumer = {
  iexec: IExec;
};

export type EthersProviderConsumer = {
  ethersProvider: Provider;
};
