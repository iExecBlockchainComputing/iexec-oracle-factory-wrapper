import CID from 'cids';
import fetch from 'cross-fetch';
import { create } from 'kubo-rpc-client';
import getLogger from './logger.js';
import { DEFAULT_IPFS_GATEWAY, IPFS_UPLOAD_URL } from './conf.js';

const log = getLogger('ipfs-service');

const get = async (cid, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const multiaddr = `/ipfs/${cid.toString()}`;
  const publicUrl = `${ipfsGateway}${multiaddr}`;
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw Error(`Failed to load content from ${publicUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const add = async (content, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const ipfsClient = create(IPFS_UPLOAD_URL);
  const { cid } = await ipfsClient.add(content);
  console.log('cid', cid.toString());
  await get(cid.toString(), { ipfsGateway });
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

export { add, get, isCid };
