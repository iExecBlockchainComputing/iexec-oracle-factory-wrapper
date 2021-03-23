const { IExec } = require('iexec');
const { updateOracle, createApiKeyDataset } = require('./oracle');

class IExecOracleFactory {
  constructor(ethProvider, chainId, { ipfsGateway = 'https://ipfs.iex.ec' } = {}) {
    // const ipfsConfig = {};
    // if (ipfsPinService) {
    //   if (!ipfsPinService.endpoint) throw Error('Missing endpoint key for ipfsPinService option');
    //   ipfsConfig.pinService = {
    //     endpoint: ipfsPinService.endpoint,
    //     key: ipfsPinService.key,
    //   };
    // }

    const iexec = new IExec({ ethProvider, chainId });
    this.createOracle = () => {
      throw Error('TODO');
    };
    this.updateOracle = (paramsSetOrCid, { workerpool } = {}) => updateOracle({
      paramsSetOrCid, iexec, ipfsGateway, workerpool,
    });
    this.readOracle = () => {
      throw Error('TODO');
    };
    this.getIExec = () => iexec;

    this.createApiKeyDataset = (apiKey) => createApiKeyDataset({ iexec, ipfsGateway, apiKey });
  }
}

module.exports = IExecOracleFactory;
