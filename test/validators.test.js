const {
  callParamsSchema,
  paramsSetSchema,
  rawParamsSchema,
  jsonParamsSetSchema,
  ValidationError,
} = require('../src/validators');

describe('callParamsSchema', () => {
  test('validate only required keys add default optional keys', async () => {
    const res = await callParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: '',
      headers: {},
    });
  });

  test('validate with optional keys', async () => {
    const res = await callParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
  });

  test('strip extra keys', async () => {
    const res = await callParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      foo: 'bar',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: '',
      headers: {},
    });
  });

  test('throw when url is missing', async () => {
    await expect(
      callParamsSchema().validate({
        method: 'POST',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      callParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw in strict mode with extra keys', async () => {
    await expect(
      callParamsSchema().strict().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        foo: 'bar',
      }),
    ).rejects.toThrow(new ValidationError('this field has unspecified keys: foo'));
  });
});

describe('rawParamsSchema', () => {
  test('validate only required keys add default optional keys', async () => {
    const res = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      body: '',
      headers: {},
    });
  });

  test('validate with optional keys', async () => {
    const res = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      apiKey: 'abcdef1234567890',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      apiKey: 'abcdef1234567890',
    });
  });

  test('validate apiKey standard usage', async () => {
    const res = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      apiKey: 'abcdef1234567890',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      apiKey: 'abcdef1234567890',
    });

    const res1 = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      apiKey: 'abcdef1234567890',
    });
    expect(res1).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      apiKey: 'abcdef1234567890',
    });
  });

  test('strip extra keys', async () => {
    const res = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      foo: 'bar',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      body: '',
      headers: {},
    });
  });

  test('throw with multiple apiKey placeholder', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?apiKey=%API_KEY%API_KEY%&query=bar',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        headers: {},
        apiKey: 'abcdef1234567890',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
        apiKey: 'abcdef1234567890',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
  });

  test('throw when apiKey is missing while needed', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        headers: {},
      }),
    ).rejects.toThrow(new ValidationError('Using %API_KEY% placeholder but no apiKey provided'));

    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
      }),
    ).rejects.toThrow(new ValidationError('Using %API_KEY% placeholder but no apiKey provided'));
  });

  test('throw with unused apiKey', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        headers: {},
        apiKey: 'abcdef1234567890',
      }),
    ).rejects.toThrow(
      new ValidationError('Provided apiKey but no %API_KEY% placeholder found in url or headers'),
    );
  });

  test('throw when url is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        JSONPath: '$[foo]',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw when JSONPath is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('JSONPath is a required field'));
  });

  test('throw when dataType is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$[foo]',
      }),
    ).rejects.toThrow(new ValidationError('dataType is a required field'));
  });

  test('throw in strict mode with extra keys', async () => {
    await expect(
      rawParamsSchema().strict().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        foo: 'bar',
      }),
    ).rejects.toThrow(new ValidationError('this field has unspecified keys: foo'));
  });
});

describe('paramsSetSchema', () => {
  test('validate only required keys add default optional keys', async () => {
    const res = await paramsSetSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('validate with optional keys', async () => {
    const res = await paramsSetSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
  });

  test('strip extra keys', async () => {
    const res = await paramsSetSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      foo: 'bar',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('throw when url is missing', async () => {
    await expect(
      paramsSetSchema().validate({
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      paramsSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        JSONPath: '$[foo]',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw when JSONPath is missing', async () => {
    await expect(
      paramsSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('JSONPath is a required field'));
  });

  test('throw when dataType is missing', async () => {
    await expect(
      paramsSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$[foo]',
      }),
    ).rejects.toThrow(new ValidationError('dataType is a required field'));
  });

  test('throw in strict mode with extra keys', async () => {
    await expect(
      paramsSetSchema().strict().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$[foo]',
        dataType: 'string',
        foo: 'bar',
      }),
    ).rejects.toThrow(new ValidationError('this field has unspecified keys: foo'));
  });
});

describe('jsonParamsSetSchema', () => {
  test('exact match', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    const res = await jsonParamsSetSchema().validate(json);
    expect(res).toBe(json);
  });

  test('accept empty body', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: '',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    const res = await jsonParamsSetSchema().validate(json);
    expect(res).toBe(json);
  });

  test('throw with missing dataset key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
    });
    await expect(jsonParamsSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","body":"body","JSONPath":"$[foo]","dataType":"string","headers":{"content-type":"application/json","authorization":"%API_KEY%"}} is not a valid paramsSet',
      ),
    );
  });

  test('throw with missing body key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    await expect(jsonParamsSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","JSONPath":"$[foo]","dataType":"string","headers":{"content-type":"application/json","authorization":"%API_KEY%"},"dataset":"0xF048eF3d7E3B33A465E0599E641BB29421f7Df92"} is not a valid paramsSet',
      ),
    );
  });

  test('throw with extra key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$[foo]',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      foo: 'bar',
    });
    await expect(jsonParamsSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","body":"body","JSONPath":"$[foo]","dataType":"string","headers":{"content-type":"application/json","authorization":"%API_KEY%"},"dataset":"0xF048eF3d7E3B33A465E0599E641BB29421f7Df92","foo":"bar"} is not a valid paramsSet',
      ),
    );
  });
});
