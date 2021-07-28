const { isOracleId, computeCallId, computeOracleId } = require('../src/hash');

describe('isOracleId', () => {
  test('true with matching bytes32', () => {
    expect(
      isOracleId(
        '0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6',
      ),
    ).toBe(true);
  });
  test('false with bytes32 uppercase', () => {
    expect(
      isOracleId(
        '0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6'.toUpperCase(),
      ),
    ).toBe(false);
  });
  test('false with non string values', () => {
    expect(isOracleId(true)).toBe(false);
    expect(isOracleId(['a'])).toBe(false);
    expect(isOracleId(1)).toBe(false);
    expect(isOracleId({})).toBe(false);
  });
});

describe('computeCallId', () => {
  test('keys order does not matter', async () => {
    const callId1 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId1).toBe(
      '0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6',
    );
    const callId2 = await computeCallId({
      method: 'POST',
      url: 'https://foo.com?query=bar',
      headers: {
        authorization: '%API_KEY%',
        'content-type': 'application/json',
      },
      body: 'body',
    });
    expect(callId2).toBe(callId1);
  });

  test('each value matters', async () => {
    const callId1 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId1).toBe(
      '0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6',
    );
    const callId2 = await computeCallId({
      url: 'https://foo.com',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId2).toBe(
      '0x3c7a34bb9ba5e0bf92dfa45e8b4136717750a6c32fa81002b1ee4eb6da367d04',
    );
    const callId3 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'PUT',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId3).toBe(
      '0xe844908518605f5764e4f381351e786a99e0c4e14b47ce05e736b5c5ac5cefcb',
    );
    const callId4 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'foo',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId4).toBe(
      '0xea536cbe8562e17b65e2feea6dc8e5cdd428e8dfc86f42ecafd391e56d491d20',
    );
    const callId5 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'text/plain',
        authorization: '%API_KEY%',
      },
    });
    expect(callId5).toBe(
      '0x83ac94399663b026098d9b654ae971008749e7f503304a2f06f4ac16cbc714d4',
    );
  });

  test('allow empty headers', async () => {
    const callId = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {},
    });
    expect(callId).toBe(
      '0x7887b49e1221078e1422ebf54262fa84e78cb07f9891e89050bb4691d432abc4',
    );
  });

  test('allow empty body', async () => {
    const callId = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: '',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId).toBe(
      '0xfa349e2c1857b5075ab5bea5ad4da24e9843839e9b5d3ccab903418ac6b53a9f',
    );
  });
});

describe('computeOracleId', () => {
  test('keys order does not matter', async () => {
    const oracleId1 = await computeOracleId({
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
    expect(oracleId1).toBe(
      '0xf240bfa4125f0c0fba0cd9dc9d93d30a97e8e98bf93c549bbb3df83a34dbebb8',
    );
    const oracleId2 = await computeOracleId({
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      JSONPath: '$.foo',
      method: 'POST',
      body: 'body',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      url: 'https://foo.com?query=bar',
    });
    expect(oracleId2).toBe(oracleId1);
  });

  test('each value matters', async () => {
    const oracleId1 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId1).toBe(
      '0xf240bfa4125f0c0fba0cd9dc9d93d30a97e8e98bf93c549bbb3df83a34dbebb8',
    );
    const oracleId2 = await computeOracleId({
      url: 'https://foo.com',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId2).toBe(
      '0xdbb3474f716988b8cb5009f1ae79d3f04d284a3b466530abcffff3ad9f29791b',
    );
    const oracleId3 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'PUT',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId3).toBe(
      '0x494c0d59d2621c8b75ee62925981ac4a1faa3b66210919c245a3b89d82445f20',
    );
    const oracleId4 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'test',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId4).toBe(
      '0x05634a4cac714074d205942f1f7734d67af92dd8a9f59aeeb8ff40986281dc3a',
    );
    const oracleId5 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'text/plain',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId5).toBe(
      '0x56650b11dbc25c50aca84bafae0eb1bb6e4aabe46dd91ee148e20657097b0db4',
    );
    const oracleId6 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo.bar',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId6).toBe(
      '0xc0ee31467bf6c701f4624224939344614f7d15a7e78f9192c09558d7ab8f408a',
    );
    const oracleId7 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'number',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId7).toBe(
      '0x811c88b501c581201af6b25f709427d033e5fa4bf77a84ee6506b6d13fcdc60b',
    );
    const oracleId8 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'number',
      dataset: '0x4a2c9d892A69EaA4Ef6f1aD8CA04F192D7B87bdE',
    });
    expect(oracleId8).toBe(
      '0xa1ed4550631a41e2c873c315d1a4f537d5cd714ed5b3c7ceb427393958d99b6c',
    );
  });

  test('allow empty body', async () => {
    const oracleId = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: '',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId).toBe(
      '0xe1c8835a6dfbe34523d35b115cc6dae9d4d4a8c59fb73d2f9f347a87cb0d48c5',
    );
  });

  test('allow empty headers', async () => {
    const oracleId = await computeOracleId({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      headers: {},
      JSONPath: '$.foo',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(oracleId).toBe(
      '0xb15b6d789f25c2b4d602d90d2a5a8b7b42b92e279c4beb77fd6839159490d022',
    );
  });
});
