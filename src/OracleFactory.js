const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { createOracle, updateOracle, readOracle } = require('./oracle');

class IExecOracleFactory {
  constructor(ethProvider, chainId, { ipfsGateway } = {}) {
    const iexec = new IExec({ ethProvider, chainId }, { confirms: 3 });
    const ethersProvider = ethProvider.provider || new Web3Provider(ethProvider);

    this.createOracle = (rawParams) => createOracle({ rawParams, iexec, ipfsGateway });
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
  }
}

module.exports = IExecOracleFactory;
