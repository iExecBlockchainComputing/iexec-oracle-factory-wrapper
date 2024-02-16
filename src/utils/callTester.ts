import fetch from 'cross-fetch';
import jp from 'jsonpath';
import { rawParamsSchema } from './validators.js';
import { API_KEY_PLACEHOLDER } from '../config/config.js';
import { ParamSet } from '../oracleFactory/types.js';

interface FinalHeaders {
  [key: string]: string;
}

const testRawParams = async (
  rawParams: ParamSet
): Promise<boolean | string | number> => {
  const { url, method, headers, body, apiKey, JSONPath, dataType } =
    await rawParamsSchema().validate(rawParams);

  const finalUrl = url.replace(API_KEY_PLACEHOLDER, apiKey);

  const finalHeaders: FinalHeaders = Object.entries(headers)
    .map(([k, v]: [string, string]) => [
      k,
      v.replace(API_KEY_PLACEHOLDER, apiKey),
    ])
    .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {});

  const res = await fetch(finalUrl, {
    method,
    ...{ headers: finalHeaders },
    ...(body && { body }),
  }).catch((e) => {
    throw Error(
      `Failed get a response from the API (${e})\nYou can:\n- check your connection\n- check the API url\n- check the HTTP method\n- check the API allows CORS`
    );
  });

  const defaultMessage = `The API answered with status ${res.status}${
    res.statusText ? `: ${res.statusText}` : ''
  }`;

  const json = await res.json().catch(() => {
    throw Error(
      `${defaultMessage} but the response body format is not supported, it must be a JSON`
    );
  });

  const jsonPathResult = jp.query(json, JSONPath);

  if (jsonPathResult.length === 0) {
    throw Error(
      `${defaultMessage} but JSONPath selector "${JSONPath}" returned empty result, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2
      )}`
    );
  }
  if (jsonPathResult.length > 1) {
    throw Error(
      `${defaultMessage} but JSONPath selector "${JSONPath}" returned multiple results, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2
      )}`
    );
  }
  const selected = jsonPathResult[0];
  const typeofSelected = typeof selected;

  switch (typeofSelected) {
    case 'boolean':
      if (dataType !== 'boolean') {
        throw Error(
          `${defaultMessage} but JSONPath selector "${JSONPath}" returned a ${typeofSelected}, which is NOT compatible with \`dataType: "${dataType}"\`, use \`dataType: "boolean"\` to store ${typeofSelected}`
        );
      }
      return selected;
    case 'string':
      if (dataType !== 'string') {
        throw Error(
          `${defaultMessage} but JSONPath selector "${JSONPath}" returned a ${typeofSelected}, which is NOT compatible with \`dataType: "${dataType}"\`, use \`dataType: "string"\` to store ${typeofSelected}`
        );
      }
      return selected;
    case 'number':
      if (dataType !== 'number') {
        throw Error(
          `${defaultMessage} but JSONPath selector "${JSONPath}" returned a ${typeofSelected}, which is NOT compatible with \`dataType: "${dataType}"\`, use \`dataType: "number"\` to store ${typeofSelected}`
        );
      }
      return selected;
    default:
      throw Error(
        `${defaultMessage} but JSONPath selector "${JSONPath}" returned a ${typeofSelected}, it must be string, number or boolean:\n${JSON.stringify(
          selected,
          null,
          2
        )}`
      );
  }
};

export default testRawParams;
