const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { updateOracle, createApiKeyDataset, readOracle } = require('./oracle');

class IExecOracleFactory {
  constructor(ethProvider, chainId, { ipfsGateway } = {}) {
    const iexec = new IExec({ ethProvider, chainId }, { confirms: 3 });
    const ethersProvider = ethProvider.provider || new Web3Provider(ethProvider);

    this.createOracle = () => {
      throw Error('TODO');
    };
    this.updateOracle = (paramsSetOrCid, { workerpool } = {}) => updateOracle({
      paramsSetOrCid,
      iexec,
      ipfsGateway,
      workerpool,
    });
    this.readOracle = (paramsSetOrCidOrOracleId) => readOracle({
      paramsSetOrCidOrOracleId,
      ethersProvider,
      ipfsGateway,
    });

    this.getIExec = () => iexec;

    this.createApiKeyDataset = (apiKey) => createApiKeyDataset({ iexec, ipfsGateway, apiKey });
  }
}

module.exports = IExecOracleFactory;
