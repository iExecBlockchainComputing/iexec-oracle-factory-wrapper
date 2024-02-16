import Big from 'big.js';

interface AnyObject {
  [key: string]: any;
}

const sortObjKeys = (obj: AnyObject): AnyObject =>
  Object.keys(obj)
    .sort()
    .reduce((acc: AnyObject, curr: string) => {
      if (typeof obj[curr] === 'object') {
        acc[curr] = sortObjKeys(obj[curr]);
      } else {
        acc[curr] = obj[curr];
      }
      return acc;
    }, {});

const formatParamsJson = (obj: AnyObject): string =>
  JSON.stringify(sortObjKeys(obj));

const formatOracleGetInt = (resultBn: any): number => {
  const resultBig = new Big(resultBn.toString()).times(new Big('1e-18'));
  try {
    resultBig.constructor.strict = true;
    return resultBig.toNumber();
  } catch (e) {
    throw Error(
      `Converting ${resultBig.toString()} to number will result in loosing precision`
    );
  }
};

export { sortObjKeys, formatParamsJson, formatOracleGetInt };
