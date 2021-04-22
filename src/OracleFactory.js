const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { createOracle, updateOracle, readOracle } = require('./oracle');

class IExecOracleFactory {
  constructor(ethProvider, { ipfsGateway } = {}) {
    let iexec;
    try {
      iexec = new IExec({ ethProvider }, { confirms: 3 });
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }
    const ethersProvider = ethProvider.provider || new Web3Provider(ethProvider);

    this.createOracle = (rawParams) => createOracle({ rawParams, iexec, ipfsGateway });
    this.updateOracle = (
      paramSetOrCid,
      { workerpool = '0xdDe15Bb67c89a1E427E458667e461c4Ee2B50282' } = {},
    ) => updateOracle({
      paramSetOrCid,
      iexec,
      ipfsGateway,
      workerpool,
    });
    this.readOracle = async (paramSetOrCidOrOracleId, { dataType } = {}) => readOracle({
      paramSetOrCidOrOracleId,
      dataType,
      ethersProvider,
      ipfsGateway,
    });
    this.getIExec = () => iexec;
  }
}

module.exports = IExecOracleFactory;
