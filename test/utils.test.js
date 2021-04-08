const { computeOracleId } = require('../src/utils');

describe('computeOracleId', () => {
  test('computeOracleId form paramsSet', async () => {
    const oracleId = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      JSONPath: '$.foo',
      dataType: 'string',
    });
    expect(oracleId).toBe('0xf240bfa4125f0c0fba0cd9dc9d93d30a97e8e98bf93c549bbb3df83a34dbebb8');
  });
});
