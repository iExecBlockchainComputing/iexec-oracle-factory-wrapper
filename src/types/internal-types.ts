import { Provider } from 'ethers';
import { IExec } from 'iexec';

export type IExecConsumer = {
  iexec: IExec;
};

export type EthersProviderConsumer = {
  ethersProvider: Provider;
};

/**
 * Parameters required to create an API key dataset.
 */
export type CreateApiKeyDatasetParams = {
  apiKey: string;
  callId: string;
};
