import { computeOracleId, getChainDefaults } from '../../../src/utils/utils.js';

describe('computeOracleId', () => {
  test('computeOracleId from paramSet', async () => {
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
    expect(oracleId).toBe(
      '0xf240bfa4125f0c0fba0cd9dc9d93d30a97e8e98bf93c549bbb3df83a34dbebb8'
    );
  });
});
describe('getChainDefaults', () => {
  test('getChainDefaults concatenate factory and reader defaults', () => {
    const bellecourDefaults = getChainDefaults(134);
    expect(bellecourDefaults.ORACLE_CONTRACT_ADDRESS).toBeDefined();
    expect(bellecourDefaults.ORACLE_APP_ADDRESS).toBeDefined();
    expect(bellecourDefaults.ORACLE_APP_WHITELIST_ADDRESS).toBeDefined();
    expect(bellecourDefaults.WORKERPOOL_ADDRESS).toBeDefined();
    expect(Object.keys(bellecourDefaults).length).toBe(4);
    const mainnetDefaults = getChainDefaults(1);
    expect(mainnetDefaults.ORACLE_CONTRACT_ADDRESS).toBeDefined();
    expect(Object.keys(mainnetDefaults).length).toBe(1);
  });
  test('getChainDefaults throws with unknown chain', () => {
    expect(() => getChainDefaults(48)).toThrow(Error('Unsupported chain 48'));
  });
});
