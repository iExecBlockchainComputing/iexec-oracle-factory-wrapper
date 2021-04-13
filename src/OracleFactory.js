const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { createOracle, updateOracle, readOracle } = require('./oracle');
const { checkSupportedChain } = require('./conf');

class IExecOracleFactory {
  constructor(ethProvider, chainId, { ipfsGateway } = {}) {
    checkSupportedChain(chainId);
    let iexec;
    try {
      iexec = new IExec({ ethProvider, chainId }, { confirms: 3 });
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }
    const ethersProvider = ethProvider.provider || new Web3Provider(ethProvider);

    this.createOracle = (rawParams) => createOracle({ rawParams, iexec, ipfsGateway });
    this.updateOracle = (paramSetOrCid, { workerpool } = {}) => updateOracle({
      paramSetOrCid,
      iexec,
      ipfsGateway,
      workerpool,
    });
    this.readOracle = (paramSetOrCidOrOracleId, { dataType } = {}) => readOracle({
      paramSetOrCidOrOracleId,
      dataType,
      ethersProvider,
      chainId: iexec.network.id,
      ipfsGateway,
    });
    this.getIExec = () => iexec;
  }
}

module.exports = IExecOracleFactory;
