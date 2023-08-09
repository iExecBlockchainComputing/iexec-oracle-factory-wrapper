import { providers } from 'ethers';
import { getDefaultProvider } from './conf';
import { readOracle } from './oracle';

class IExecOracleReader {
  constructor(
    ethProvider,
    { ipfsGateway, oracleContract, providerOptions = {} } = {},
  ) {
    let ethersProvider;
    try {
      if (typeof ethProvider === 'object') {
        ethersProvider = new providers.Web3Provider(ethProvider);
      } else {
        ethersProvider = getDefaultProvider(ethProvider, providerOptions);
      }
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }
    this.readOracle = async (paramSetOrCidOrOracleId, { dataType } = {}) =>
      readOracle({
        paramSetOrCidOrOracleId,
        dataType,
        ethersProvider,
        ipfsGateway,
        oracleContract,
      });
  }
}

export default IExecOracleReader;
