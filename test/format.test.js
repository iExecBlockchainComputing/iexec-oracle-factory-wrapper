const { BigNumber } = require('ethers');
const { sortObjKeys, formatParamsJson, formatOracleGetInt } = require('../src/format');

describe('sortObjKeys', () => {
  test('sort nested keys', () => {
    const res = sortObjKeys({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      apiKey: 'abcdef1234567890',
    });
    expect(JSON.stringify(res)).toBe(
      '{"JSONPath":"$[foo]","apiKey":"abcdef1234567890","body":"body","headers":{"authorization":"%API_KEY%","content-type":"application/json"},"method":"POST","url":"https://foo.com?query=bar"}',
    );
  });
});

describe('formatParamsJson', () => {
  test('sort and stringify', () => {
    const res = formatParamsJson({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      apiKey: 'abcdef1234567890',
    });
    expect(res).toBe(
      '{"JSONPath":"$[foo]","apiKey":"abcdef1234567890","body":"body","headers":{"authorization":"%API_KEY%","content-type":"application/json"},"method":"POST","url":"https://foo.com?query=bar"}',
    );
  });
});

describe('formatOracleGetInt', () => {
  test('standard - multiply by 1e-18 to convert getInt int result to number', () => {
    expect(formatOracleGetInt(BigNumber.from('-1234567890'))).toBe(-1.23456789e-9);
  });

  test('error - precision loss', () => {
    expect(() => formatOracleGetInt(BigNumber.from('12345678901234567890123456789'))).toThrow(
      Error('Converting 12345678901.234567890123456789 to number will result in loosing precision'),
    );
  });
});
