const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { createOracle, updateOracle, readOracle } = require('./oracle');

class IExecOracleFactory {
  constructor(
    ethProvider,
    { ipfsGateway, oracleApp, oracleContract, iexecOptions = {} } = {},
  ) {
    let iexec;
    try {
      iexec = new IExec({ ethProvider }, { confirms: 3, ...iexecOptions });
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }
    const ethersProvider =
      ethProvider.provider || new Web3Provider(ethProvider);

    this.createOracle = (rawParams) =>
      createOracle({ rawParams, iexec, ipfsGateway, oracleApp });
    this.updateOracle = (paramSetOrCid, { workerpool } = {}) =>
      updateOracle({
        paramSetOrCid,
        iexec,
        ipfsGateway,
        workerpool,
        oracleApp,
        oracleContract,
      });
    this.readOracle = async (paramSetOrCidOrOracleId, { dataType } = {}) =>
      readOracle({
        paramSetOrCidOrOracleId,
        dataType,
        ethersProvider,
        ipfsGateway,
      });
    this.getIExec = () => iexec;
  }
}

module.exports = IExecOracleFactory;
