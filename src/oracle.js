const { Buffer } = require('buffer');
const ipfs = require('./ipfsService');
const { Observable, SafeObserver } = require('./reactive');
const { getDefaults } = require('./conf');
const { WorkflowError } = require('./errors');

const createApiKeyDataset = ({ iexec, apiKey, ipfsConfig }) => new Observable((observer) => {
  const safeObserver = new SafeObserver(observer);
  const start = async () => {
    try {
      const { ORACLE_APP_ADDRESS } = getDefaults(iexec.network.id);

      const key = iexec.dataset.generateEncryptionKey();
      safeObserver.next({
        message: 'ENCRYPTION_KEY_CREATED',
        key,
      });

      const encryptedFile = await iexec.dataset
        .encrypt(Buffer.from(apiKey, 'utf8'), key)
        .catch((e) => {
          throw new WorkflowError('Failed to encrypt API key', e);
        });
      const checksum = await iexec.dataset
        .computeEncryptedFileChecksum(encryptedFile)
        .catch((e) => {
          throw new WorkflowError('Failed to compute encrypted API key checksum', e);
        });
      safeObserver.next({
        message: 'FILE_ENCRYPTED',
        encryptedFile,
        checksum,
      });

      const cid = await ipfs.add(encryptedFile, ipfsConfig).catch((e) => {
        throw new WorkflowError('Failed to upload encrypted API key', e);
      });
      const multiaddr = `/ipfs/${cid.toString()}`;
      safeObserver.next({
        message: 'ENCRYPTED_FILE_UPLOADED',
        cid: cid.toString(),
        multiaddr,
      });

      safeObserver.next({
        message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST',
      });
      const { address, txHash } = await iexec.dataset
        .deployDataset({
          owner: await iexec.wallet.getAddress(),
          name: 'api-key',
          multiaddr,
          checksum,
        })
        .catch((e) => {
          throw new WorkflowError('Failed to deploy API key dataset', e);
        });
      safeObserver.next({
        message: 'DATASET_DEPLOYMENT_SUCCESS',
        address,
        txHash,
      });

      safeObserver.next({
        message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST',
      });
      await iexec.dataset.pushDatasetSecret(address, key).catch((e) => {
        throw new WorkflowError("Failed to push API key dataset's encryption key", e);
      });
      safeObserver.next({
        message: 'PUSH_SECRET_TO_SMS_SUCCESS',
      });

      const orderToSign = await iexec.order
        .createDatasetorder({
          dataset: address,
          tag: ['tee'],
          apprestrict: ORACLE_APP_ADDRESS,
          volume: Number.MAX_SAFE_INTEGER - 1,
        })
        .catch((e) => {
          throw new WorkflowError("Failed to create API key datasetorder's", e);
        });
      safeObserver.next({
        message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST',
        order: orderToSign,
      });
      const order = await iexec.order.signDatasetorder(orderToSign).catch((e) => {
        throw new WorkflowError("Failed to sign API key datasetorder's", e);
      });
      safeObserver.next({
        message: 'DATASET_ORDER_SIGNATURE_SUCCESS',
        order,
      });

      safeObserver.next({
        message: 'DATASET_ORDER_PUBLISH_SIGN_REQUEST',
        order,
      });
      const orderHash = await iexec.order.publishDatasetorder(order).catch((e) => {
        throw new WorkflowError("Failed to publish API key datasetorder's", e);
      });
      safeObserver.next({
        message: 'DATASET_ORDER_PUBLISH_SUCCESS',
        orderHash,
      });

      safeObserver.complete();
    } catch (e) {
      if (e instanceof WorkflowError) {
        safeObserver.error(e);
      } else {
        safeObserver.error(new WorkflowError('API key dataset creation unexpected error', e));
      }
    }
  };
  safeObserver.unsub = () => {
    // teardown callback
  };
  start();
  return safeObserver.unsubscribe.bind(safeObserver);
});

module.exports = {
  createApiKeyDataset,
};
