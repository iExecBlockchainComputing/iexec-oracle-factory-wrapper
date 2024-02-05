import { create } from 'kubo-rpc-client';
import { DEFAULT_IPFS_GATEWAY, IPFS_UPLOAD_URL } from '../conf.js';
import get from './get.js';

const add = async (content, { ipfsGateway = DEFAULT_IPFS_GATEWAY } = {}) => {
  const ipfsClient = create(IPFS_UPLOAD_URL);
  const { cid } = await ipfsClient.add(content);
  await get(cid.toString(), { ipfsGateway });
  return cid.toString();
};

export default add;
