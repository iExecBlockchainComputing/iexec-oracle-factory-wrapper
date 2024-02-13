import { create } from 'kubo-rpc-client';

import get from './get.js';
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_IPFS_UPLOAD_URL,
} from '../../config/config.js';

const add = async (
  content,
  {
    ipfsGateway = DEFAULT_IPFS_GATEWAY,
    ipfsUploadUrl = DEFAULT_IPFS_UPLOAD_URL,
  },
): Promise<string> => {
  const ipfsClient = create(ipfsUploadUrl);
  const { cid } = await ipfsClient.add(content);
  await get(cid.toString(), { ipfsGateway });
  return cid.toString();
};

export default add;
