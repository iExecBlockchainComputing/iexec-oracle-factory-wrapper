const sortObjKeys = (obj) => Object.keys(obj)
  .sort()
  .reduce((acc, curr) => {
    acc[curr] = obj[curr];
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
};
