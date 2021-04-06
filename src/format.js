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

const formatParamsJson = (obj) => JSON.stringify(sortObjKeys(obj));

module.exports = {
  formatParamsJson,
  sortObjKeys,
};
