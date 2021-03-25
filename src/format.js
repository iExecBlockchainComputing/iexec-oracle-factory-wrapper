const sortObjKeys = (obj) => Object.keys(obj)
  .sort()
  .reduce((acc, curr) => {
    if (typeof obj[curr] === 'object') {
      acc[curr] = sortObjKeys(obj[curr]);
    } else {
      acc[curr] = obj[curr];
    }
    return acc;
  }, {});

const formatParamsJson = (obj) => {
  if (typeof obj === 'object') {
    return JSON.stringify(sortObjKeys(obj));
  }
  throw Error('Invalid type, must be object');
};

module.exports = {
  formatParamsJson,
  sortObjKeys,
};
