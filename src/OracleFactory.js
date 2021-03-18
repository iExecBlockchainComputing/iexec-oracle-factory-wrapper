const { IExec } = require('iexec');
const { createApiKeyDataset } = require('./oracle');

class IExecOracleFactory {
  constructor(ethProvider, chainId, { ipfsPinService } = {}) {
    const ipfsConfig = {};

    if (ipfsPinService) {
      if (!ipfsPinService.endpoint) throw Error('Missing endpoint key for ipfsPinService option');
      ipfsConfig.pinService = {
        endpoint: ipfsPinService.endpoint,
        key: ipfsPinService.key,
      };
    }

    const iexec = new IExec({ ethProvider, chainId });
    this.createOracle = () => {
      throw Error('TODO');
    };
    this.updateOracle = () => {
      throw Error('TODO');
    };
    this.readOracle = () => {
      throw Error('TODO');
    };
    this.getIExec = () => iexec;

    this.createApiKeyDataset = (apiKey) => createApiKeyDataset({ iexec, ipfsConfig, apiKey });
  }
}

module.exports = IExecOracleFactory;
