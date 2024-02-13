import CID from 'cids';

const isCid = (value): boolean => {
  try {
    const cid = new CID(value);
    return CID.isCID(cid);
  } catch (e) {
    return false;
  }
};

export default isCid;
