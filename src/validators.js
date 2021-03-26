const {
  string, object, array, ValidationError,
} = require('yup');
const { getAddress } = require('ethers').utils;
const { API_KEY_PLACEHOLDER } = require('./conf');

const httpsUrlSchema = () => string()
  .test('is-url-allow-placeholder', '${path} must be a valid url', async (value) => {
    try {
      const originalUrl = value || '';
      await string()
        .url()
        .validate(originalUrl.replace(API_KEY_PLACEHOLDER, 'API_KEY_PLACEHOLDER'));
      return true;
    } catch (e) {
      return false;
    }
  })
  .test('is-https', '${path} is not https', (value) => !value || value.indexOf('https://') === 0);

const httpMethodSchema = () => string().oneOf(['GET', 'POST', 'PUT', 'DELETE']);

const bodySchema = () => string().default('');

const headerValueSchema = () => string().required();

const headersMapSchema = () => object()
  .default({})
  .test('values-are-strings', '${path} is not a header list', async (value) => {
    try {
      await array()
        .transform((_, orig) => Object.values(orig))
        .of(headerValueSchema())
        .validate(value);
      return true;
    } catch (e) {
      return false;
    }
  });

const apiKeySchema = () => string();

const datasetAddressSchema = () => string()
  .default('0x0000000000000000000000000000000000000000')
  .test('is-address', '${path} is not a valid ethereum address', (value) => {
    try {
      if (value) {
        getAddress(value);
      }
      return true;
    } catch (e) {
      return false;
    }
  });

const jsonPathSchema = () => string();

const dataTypeSchema = () => string().oneOf(['number', 'string']);

const callParamsSchema = () => object({
  url: httpsUrlSchema().required(),
  method: httpMethodSchema().required(),
  headers: headersMapSchema(),
  body: bodySchema(),
}).noUnknown(true);

const strictCallParamsSchema = () => object().test('is-call-params', '${originalValue} is not a valid callParams', async (obj) => {
  try {
    if (obj && obj.body === '') {
      await object({
        url: httpsUrlSchema().required(),
        method: httpMethodSchema().required(),
        headers: headersMapSchema().required(),
        body: bodySchema(),
      })
        .required()
        .strict()
        .noUnknown(true)
        .validate(obj);
    } else {
      await object({
        url: httpsUrlSchema().required(),
        method: httpMethodSchema().required(),
        headers: headersMapSchema().required(),
        body: bodySchema().required(),
      })
        .required()
        .strict()
        .noUnknown(true)
        .validate(obj);
    }
    return true;
  } catch (e) {
    return false;
  }
});

const rawParamsSchema = () => callParamsSchema()
  .shape({
    JSONPath: jsonPathSchema().required(),
    dataType: dataTypeSchema().required(),
    apiKey: apiKeySchema(),
  })
  .noUnknown(true);

const paramsSetSchema = () => callParamsSchema()
  .shape({
    JSONPath: jsonPathSchema().required(),
    dataType: dataTypeSchema().required(),
    dataset: datasetAddressSchema(),
  })
  .noUnknown(true);

const strictParamsSetSchema = () => object().test('is-params-set', '${originalValue} is not a valid paramsSet', async (obj) => {
  try {
    if (obj && obj.body === '') {
      await object({
        url: httpsUrlSchema().required(),
        method: httpMethodSchema().required(),
        headers: headersMapSchema().required(),
        body: bodySchema(),
        JSONPath: jsonPathSchema().required(),
        dataType: dataTypeSchema().required(),
        dataset: datasetAddressSchema().required(),
      })
        .required()
        .strict()
        .noUnknown(true)
        .validate(obj);
    } else {
      await object({
        url: httpsUrlSchema().required(),
        method: httpMethodSchema().required(),
        headers: headersMapSchema().required(),
        body: bodySchema().required(),
        JSONPath: jsonPathSchema().required(),
        dataType: dataTypeSchema().required(),
        dataset: datasetAddressSchema().required(),
      })
        .required()
        .strict()
        .noUnknown(true)
        .validate(obj);
    }
    return true;
  } catch (e) {
    return false;
  }
});

const jsonParamsSetSchema = () => string()
  .strict()
  .required()
  .test('is-json', '${originalValue} is not a valid JSON', (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  })
  .test('is-params-set', '${originalValue} is not a valid paramsSet', async (value) => {
    try {
      const obj = JSON.parse(value);
      await strictParamsSetSchema().validate(obj);
      return true;
    } catch (e) {
      return false;
    }
  });

const throwIfMissing = () => {
  throw new ValidationError('Missing parameter');
};

module.exports = {
  callParamsSchema,
  rawParamsSchema,
  paramsSetSchema,
  strictCallParamsSchema,
  strictParamsSetSchema,
  jsonParamsSetSchema,
  throwIfMissing,
  ValidationError,
};
