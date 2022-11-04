const { IExec } = require('iexec');
const { Web3Provider } = require('ethers').providers;
const { createOracle, updateOracle, readOracle } = require('./oracle');

class IExecOracleFactory {
  constructor(
    ethProvider,
    {
      ipfsGateway,
      oracleApp,
      oracleContract,
      providerOptions = {},
      iexecOptions = {},
    } = {},
  ) {
    let iexec;
    let ethersProvider;
    try {
      iexec = new IExec(
        { ethProvider },
        { confirms: 3, providerOptions, ...iexecOptions },
      );
      ethersProvider = ethProvider.provider || new Web3Provider(ethProvider);
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }

    this.createOracle = (rawParams) =>
      createOracle({ rawParams, iexec, ipfsGateway, oracleApp });
    this.updateOracle = (
      paramSetOrCid,
      { workerpool } = {},
      targetBlockchains,
    ) =>
      updateOracle({
        paramSetOrCid,
        iexec,
        ipfsGateway,
        workerpool,
        oracleApp,
        oracleContract,
        targetBlockchains,
      });
    this.readOracle = async (paramSetOrCidOrOracleId, { dataType } = {}) =>
      readOracle({
        paramSetOrCidOrOracleId,
        dataType,
        ethersProvider,
        ipfsGateway,
        oracleContract,
      });
    this.getIExec = () => iexec;
  }
}

module.exports = IExecOracleFactory;
