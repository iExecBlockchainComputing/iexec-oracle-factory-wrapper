import { IExec } from 'iexec';
import { providers } from 'ethers';
import { createOracle, updateOracle, readOracle } from './oracle';


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
      ethersProvider = ethProvider.provider || new providers.Web3Provider(ethProvider);
    } catch (e) {
      throw Error('Unsupported ethProvider');
    }

    this.createOracle = (rawParams) =>
      createOracle({ rawParams, iexec, ipfsGateway, oracleApp });
    this.updateOracle = (
      paramSetOrCid,
      { workerpool, targetBlockchains } = {},
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

export default IExecOracleFactory;
