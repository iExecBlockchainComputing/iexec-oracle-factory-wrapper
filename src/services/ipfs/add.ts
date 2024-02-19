import { create } from 'kubo-rpc-client';

import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
} from '../../config/config.js';
import get from './get.js';

const add = async (
  content,
  { ipfsGateway = DEFAULT_IPFS_GATEWAY, ipfsNode = DEFAULT_IPFS_UPLOAD_URL }
): Promise<string> => {
  const ipfsClient = create(ipfsNode);
  const { cid } = await ipfsClient.add(content);
  await get(cid.toString(), { ipfsGateway });
  return cid.toString();
};

export default add;
