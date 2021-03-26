const { isOracleId, computeCallId, computeOracleId } = require('../src/hash');
const { ValidationError } = require('../src/validators');

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

  test('throw if missing key', async () => {
    await expect(
      computeCallId({
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeCallId({
        url: 'https://foo.com?query=bar',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeCallId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeCallId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
      }),
    ).rejects.toThrow(ValidationError);
  });

  test('throw with extra key', async () => {
    await expect(
      computeCallId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        foo: 'bar',
      }),
    ).rejects.toThrow(ValidationError);
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
      dataset: '0x0000000000000000000000000000000000000000',
      JSONPath: '$[foo]',
      dataType: 'string',
    });
    expect(callId1).toBe('0x31db2d9d280cb3415ccaeb836971eb9838a536fd15547ddd4242b97e02ac8fe8');
    const callId2 = await computeOracleId({
      dataset: '0x0000000000000000000000000000000000000000',
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId1).toBe('0x31db2d9d280cb3415ccaeb836971eb9838a536fd15547ddd4242b97e02ac8fe8');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId2).toBe('0x27d8074fed4e5303b2dd5c688097576dfdf9a37cbead038f285ca3d19033e37e');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId3).toBe('0xde8ab482b8fcaa28bd6a68f0ead4760866c73bb10aebd3a7f5e6fa2207aa372f');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId4).toBe('0x1fc2044bf148686f8ca7c2ac79fc9536473cfa9489a001583290d903ebe5c919');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId5).toBe('0x100f5cfaa5beae8bae0157650b8a9b6e88302b03ad6ebeb5b60d4c79b7031374');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId6).toBe('0xc4f31af1ea65373134c684312af2f9f928120f3adf9c0d2c1c628b98120fed64');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId7).toBe('0x9ce5ea73a8bf02d1d2669e4aadd40727274a0e639a0c9edd36c6a1bbc9028e17');
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
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(callId8).toBe('0x01f52f57525ca41134edd0990d18fbc2d8456635b82335cf902e51d465c36ac1');
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
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId).toBe('0xdc1911010d92c77d547d785bb0798649a43455596e81b5d6122e6c7f06860d18');
  });

  test('allow empty headers', async () => {
    const callId = await computeOracleId({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      headers: {},
      JSONPath: '$[foo]',
      dataType: 'string',
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(callId).toBe('0x3f47d19c11d31b07c2a5afb8d2739b256d68745efbafde7a556d78e8103e0a75');
  });

  test('throw if missing key', async () => {
    await expect(
      computeOracleId({
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        JSONPath: '$[foo]',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataType: 'string',
      }),
    ).rejects.toThrow(ValidationError);
  });

  test('throw with extra key', async () => {
    await expect(
      computeOracleId({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        headers: {
          'content-type': 'application/json',
          authorization: '%API_KEY%',
        },
        JSONPath: '$[foo]',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        foo: 'bar',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
