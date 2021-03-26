const fetch = require('cross-fetch');
const jsonPath = require('jsonpath-plus').JSONPath;
const { getSignerFromPrivateKey } = require('iexec').utils;
const { getParamsSet } = require('./oracle');
const hashComputeOracleId = require('./hash').computeOracleId;
const { rawParamsSchema } = require('./validators');
const { API_KEY_PLACEHOLDER } = require('./conf');

const computeOracleId = async (paramsSetOrCid) => {
  const { paramsSet } = await getParamsSet(paramsSetOrCid);
  const oracleId = await hashComputeOracleId(paramsSet);
  return oracleId;
};

const testRawParams = async (rawParams) => {
  const {
    url,
    method,
    headers,
    body,
    apiKey,
    JSONPath,
    dataType,
  } = await rawParamsSchema().validate(rawParams);

  const finalUrl = url.replace(API_KEY_PLACEHOLDER, apiKey);
  const finalHeaders = Object.entries(headers)
    .map(([k, v]) => [k, v.replace(API_KEY_PLACEHOLDER, apiKey)])
    .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {});

  const res = await fetch(finalUrl, {
    method,
    ...{ headers: finalHeaders },
    ...(body && { body }),
  }).catch((e) => {
    throw Error(
      `Failed get a response from the API (${e})\nYou can:\n- check your connection\n- check the API url\n- check the API allows CORS`,
    );
  });

  const json = await res.json().catch(() => {
    throw Error('The API response is not supported, it must be a JSON');
  });

  const jsonPathResult = jsonPath({ path: JSONPath, json });

  if (jsonPathResult.length === 0) {
    throw Error(
      `JSONPath selector "${JSONPath}" returned empty result, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2,
      )}`,
    );
  }
  if (jsonPathResult.length > 1) {
    throw Error(
      `JSONPath selector "${JSONPath}" returned multiple results, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2,
      )}`,
    );
  }
  const selected = jsonPathResult[0];
  const typeofSelected = typeof selected;

  switch (typeofSelected) {
    case 'boolean':
      if (dataType !== 'string') {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "string"\` to store ${typeofSelected}`,
        );
      }
      return String(selected);
    case 'string':
      if (dataType !== 'string') {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "string"\` to store ${typeofSelected}`,
        );
      }
      return selected;
    case 'number':
      if (dataType !== 'number') {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "number"\` to store ${typeofSelected}`,
        );
      }
      return selected;
    default:
      throw Error(
        `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, it must be string, number or boolean:\n${JSON.stringify(
          selected,
          null,
          2,
        )}`,
      );
  }
};

module.exports = {
  computeOracleId,
  testRawParams,
  getSignerFromPrivateKey,
};
