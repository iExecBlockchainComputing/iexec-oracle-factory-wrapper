const Ipfs = require('ipfs');
const CID = require('cids');
const fetch = require('cross-fetch');
const { getLogger } = require('./logger');
const { DEFAULT_IPFS_GATEWAY } = require('./conf');

const log = getLogger('ipfs-service');

const get = async (cid, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const multiaddr = `/ipfs/${cid.toString()}`;
  const publicUrl = `${ipfsGateway}${multiaddr}`;
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw Error(`Failed to load content from ${publicUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const add = async (content, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const ipfs = await Ipfs.create();

  // not released yet
  // if (ipfsConfig && ipfsConfig.pinService) {
  //   await ipfs.pin.remote.service
  //     .add('pin-service', ipfsConfig.pinService)
  //     .catch((e) => log(e));
  // }

  const { cid } = await ipfs.add(content);
  await ipfs.pin
    .add(cid, { timeout: 10000 })
    .catch((e) => log('Ipfs add pin failed', e));
  await get(cid.toString(), { ipfsGateway });
  await ipfs.stop(); // not working: https://github.com/libp2p/js-libp2p/issues/779
  return cid.toString();
};

const isCid = (value) => {
  try {
    const cid = new CID(value);
    return CID.isCID(cid);
  } catch (e) {
    return false;
  }
};

module.exports = {
  add,
  get,
  isCid,
};
