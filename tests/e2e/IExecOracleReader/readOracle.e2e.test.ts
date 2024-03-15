import { IExecOracleReader } from '../../../src/index.js';

describe('readOracle', () => {
  test('standard - from paramSet dataType: "boolean"', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle({
      JSONPath: '$.ok',
      body: '',
      dataType: 'boolean',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    });
    const { value, date } = res;
    expect(typeof value).toBe('boolean');
    expect(typeof date).toBe('number');
  });

  test('standard - from paramSet dataType: "number"', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle({
      JSONPath: "$['ethereum']['usd']",
      body: '',
      dataType: 'number',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    });
    const { value, date } = res;
    expect(typeof value).toBe('number');
    expect(typeof date).toBe('number');
  });

  test('standard - from paramSet dataType: "string"', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle({
      JSONPath: '$.version',
      body: '',
      dataType: 'string',
      dataset: '0x0000000000000000000000000000000000000000',
      headers: {},
      method: 'GET',
      url: 'https://api.market.iex.ec/version',
    });
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from CID', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle(
      'Qmb1JLTVp4zfRMPaori9htzzM9D3B1tG8pGbZYTRC1favA'
    );
    const { value, date } = res;
    expect(typeof value).toBe('number');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (default dataType)', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle(
      '0xf0f370ad33d1e3e8e2d8df7197c40f62b5bc403553b103858359687491234491'
    );
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType number)', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle(
      '0x31172fe38a7be8a62fa4882d3a5b5cf7da13fa6ad5b144a0c2f35b559bbba14f',
      { dataType: 'number' }
    );
    const { value, date } = res;
    expect(typeof value).toBe('number');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType string)', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle(
      '0x9fc5c194d4898197e535060b54256435fda773ae59c93cf88be84bce1ca4ce3e',
      { dataType: 'string' }
    );
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType boolean)', async () => {
    const oracleReader = new IExecOracleReader(134);
    const res = await oracleReader.readOracle(
      '0xccf7d910abf22fbeeef17f861b5cf9abb9543e48ee502285f7df53c63296ce21',
      { dataType: 'boolean' }
    );
    const { value, date } = res;
    expect(typeof value).toBe('boolean');
    expect(typeof date).toBe('number');
  });
});
