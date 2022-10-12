const { Web3Provider } = require('ethers').providers;
const { getDefaultProvider } = require('./conf');
const { readOracle } = require('./oracle');

class IExecOracleReader {
  constructor(
    ethProvider,
    { ipfsGateway, oracleContract, providerOptions = {} } = {},
  ) {
    let ethersProvider;
    try {
      if (typeof ethProvider === 'object') {
        ethersProvider = new Web3Provider(ethProvider);
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

module.exports = IExecOracleReader;
