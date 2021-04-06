const { isOracleId, computeCallId, computeOracleId } = require('../src/hash');

describe('isOracleId', () => {
  test('true with matching bytes32', () => {
    expect(isOracleId('0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6')).toBe(
      true,
    );
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
    expect(callId1).toBe('0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6');
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
    expect(callId1).toBe('0x9f6487aa185b3dce95576f085d9c8fe77d35095e87c42feea15714c47c21c8d6');
    const callId2 = await computeCallId({
      url: 'https://foo.com',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId2).toBe('0x3c7a34bb9ba5e0bf92dfa45e8b4136717750a6c32fa81002b1ee4eb6da367d04');
    const callId3 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'PUT',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId3).toBe('0xe844908518605f5764e4f381351e786a99e0c4e14b47ce05e736b5c5ac5cefcb');
    const callId4 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'foo',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(callId4).toBe('0xea536cbe8562e17b65e2feea6dc8e5cdd428e8dfc86f42ecafd391e56d491d20');
    const callId5 = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'text/plain',
        authorization: '%API_KEY%',
      },
    });
    expect(callId5).toBe('0x83ac94399663b026098d9b654ae971008749e7f503304a2f06f4ac16cbc714d4');
  });

  test('allow empty headers', async () => {
    const callId = await computeCallId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {},
    });
    expect(callId).toBe('0x7887b49e1221078e1422ebf54262fa84e78cb07f9891e89050bb4691d432abc4');
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
    expect(callId).toBe('0xfa349e2c1857b5075ab5bea5ad4da24e9843839e9b5d3ccab903418ac6b53a9f');
  });
});

describe('computeOracleId', () => {
  test('keys order does not matter', async () => {
    const callId1 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      JSONPath: '$[foo]',
      dataType: 'string',
    });
    expect(callId1).toBe('0xcd11aa751a19c0b60e277d52db32cd9413392d1d4a53c9d0ef6a21313851a728');
    const callId2 = await computeOracleId({
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      JSONPath: '$[foo]',
      method: 'POST',
      body: 'body',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      url: 'https://foo.com?query=bar',
    });
    expect(callId2).toBe(callId1);
  });

  test('each value matters', async () => {
    const callId1 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId1).toBe('0xcd11aa751a19c0b60e277d52db32cd9413392d1d4a53c9d0ef6a21313851a728');
    const callId2 = await computeOracleId({
      url: 'https://foo.com',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId2).toBe('0x6558cbb36c961fd079e3ac22b6f70b0bd38ee32b44e6e1daa7bd455c5ce37d22');
    const callId3 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'PUT',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId3).toBe('0x773662cff08a18de65e5978a02b7e17d594b736389cff4d26b6cf39c84db0619');
    const callId4 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'test',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId4).toBe('0xee6bd6adca80fed2cb40d04fda6a426e87294b883149cc9d4e468c956e513b7b');
    const callId5 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'text/plain',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId5).toBe('0x2c77f1f7d7692b0112fee3c37bb80c7a826d4f31f34edc36e96f371b9c1e760e');
    const callId6 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo][bar]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId6).toBe('0xe39bbba1e3944412e672bfab0d3c52dc462c853fa0ee0297674f248ae2ba2c8e');
    const callId7 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'number',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId7).toBe('0x01f52f57525ca41134edd0990d18fbc2d8456635b82335cf902e51d465c36ac1');
    const callId8 = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'number',
      dataset: '0x4a2c9d892A69EaA4Ef6f1aD8CA04F192D7B87bdE',
    });
    expect(callId8).toBe('0xf25ab23ea7d3832b8d94d971a365e03bb53abf5adeb392bf91523e8fdaa1f733');
  });

  test('allow empty body', async () => {
    const callId = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: '',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId).toBe('0x1a5dff91ebce058574de3082c69eeba49aeb4447308baadd1b3773841025c5ea');
  });

  test('allow empty headers', async () => {
    const callId = await computeOracleId({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      headers: {},
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId).toBe('0x5a117261ac4d62be6b07a140c2eb3814f595933da87a93c3c829a84aa5b31f90');
  });
});
