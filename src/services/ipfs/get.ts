import { Buffer } from 'buffer';
import fetch from 'cross-fetch';
import { DEFAULT_IPFS_GATEWAY } from '../../config/config.js';

const get = async (
  cid,
  { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}
): Promise<Buffer> => {
  const multiaddr = `/ipfs/${cid.toString()}`;
  const publicUrl = `${ipfsGateway}${multiaddr}`;
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw Error(`Failed to load content from ${publicUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export default get;
