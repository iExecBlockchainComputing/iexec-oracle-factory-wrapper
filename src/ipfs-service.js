const Ipfs = require('ipfs');
const fetch = require('cross-fetch');
const { getLogger } = require('./logger');

const log = getLogger('ipfs-service');

const add = async (content, ipfsConfig) => {
  const ipfs = await Ipfs.create();

  // not released yet
  // if (ipfsConfig && ipfsConfig.pinService) {
  //   await ipfs.pin.remote.service
  //     .add('pin-service', ipfsConfig.pinService)
  //     .catch((e) => log(e));
  // }

  const uploadResult = await ipfs.add(content);
  const { cid } = uploadResult;
  await ipfs.pin.add(cid, { timeout: 10000 }).catch((e) => log('Ipfs add pin failed', e));
  const multiaddr = `/ipfs/${cid.toString()}`;
  const publicUrl = `https://ipfs.io${multiaddr}`;
  await fetch(publicUrl).then((res) => {
    if (!res.ok) {
      throw Error(`Failed to load from ${publicUrl}`);
    }
  });
  await ipfs.stop(); // not working: https://github.com/libp2p/js-libp2p/issues/779
  return cid;
};

module.exports = {
  add,
};
