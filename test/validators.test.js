import {
  callParamsSchema,
  strictCallParamsSchema,
  paramSetSchema,
  strictParamSetSchema,
  rawParamsSchema,
  jsonParamSetSchema,
  throwIfMissing,
  updateTargetBlockchainsSchema,
} from '../src/validators';
import { ValidationError } from '../src/errors';

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
    ).rejects.toThrow(
      new ValidationError('this field has unspecified keys: foo'),
    );
  });
});

describe('strictCallParamsSchema', () => {
  test('validate exact match', async () => {
    const res = await strictCallParamsSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: '',
      headers: {},
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
      strictCallParamsSchema().validate({
        method: 'POST',
        body: '',
        headers: {},
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      strictCallParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        body: '',
        headers: {},
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw when body is missing', async () => {
    await expect(
      strictCallParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        headers: {},
      }),
    ).rejects.toThrow(new ValidationError('body is a required field'));
  });

  test('throw when headers is missing', async () => {
    await expect(
      strictCallParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        body: '',
      }),
    ).rejects.toThrow(new ValidationError('headers is a required field'));
  });

  test('throw with extra keys', async () => {
    await expect(
      strictCallParamsSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        foo: 'bar',
      }),
    ).rejects.toThrow(
      new ValidationError('this field has unspecified keys: foo'),
    );
  });
});

describe('rawParamsSchema', () => {
  test('validate only required keys add default optional keys', async () => {
    const res = await rawParamsSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
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
      JSONPath: '$.foo',
      dataType: 'string',
      foo: 'bar',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
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
        JSONPath: '$.foo',
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
        JSONPath: '$.foo',
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
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
      }),
    ).rejects.toThrow(
      new ValidationError('Using %API_KEY% placeholder but no apiKey provided'),
    );

    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
      }),
    ).rejects.toThrow(
      new ValidationError('Using %API_KEY% placeholder but no apiKey provided'),
    );
  });

  test('throw with unused apiKey', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
        apiKey: 'abcdef1234567890',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Provided apiKey but no %API_KEY% placeholder found in url or headers',
      ),
    );
  });

  test('throw when url is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      rawParamsSchema().validate({
        url: 'https://foo.com?query=bar',
        JSONPath: '$.foo',
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
        JSONPath: '$.foo',
      }),
    ).rejects.toThrow(new ValidationError('dataType is a required field'));
  });

  test('throw in strict mode with extra keys', async () => {
    await expect(
      rawParamsSchema().strict().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        foo: 'bar',
      }),
    ).rejects.toThrow(
      new ValidationError('this field has unspecified keys: foo'),
    );
  });
});

describe('paramSetSchema', () => {
  test('validate only required keys add default optional keys', async () => {
    const res = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('validate with optional keys', async () => {
    const res = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
  });

  test('validate apiKey dataset standard usage', async () => {
    const res = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });

    const res1 = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res1).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });

    const res2 = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
      },
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(res2).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
      },
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('strip extra keys', async () => {
    const res = await paramSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      foo: 'bar',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('throw with multiple apiKey placeholder', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?apiKey=%API_KEY%API_KEY%&query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
  });

  test('throw when dataset is missing while needed', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Using %API_KEY% placeholder but no dataset provided',
      ),
    );

    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Using %API_KEY% placeholder but no dataset provided',
      ),
    );
  });

  test('throw with unused dataset', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Provided dataset but no %API_KEY% placeholder found in url or headers',
      ),
    );
  });

  test('throw when url is missing', async () => {
    await expect(
      paramSetSchema().validate({
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar',
        JSONPath: '$.foo',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw when JSONPath is missing', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        dataType: 'string',
      }),
    ).rejects.toThrow(new ValidationError('JSONPath is a required field'));
  });

  test('throw when dataType is missing', async () => {
    await expect(
      paramSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
      }),
    ).rejects.toThrow(new ValidationError('dataType is a required field'));
  });

  test('throw in strict mode with extra keys', async () => {
    await expect(
      paramSetSchema().strict().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        foo: 'bar',
      }),
    ).rejects.toThrow(
      new ValidationError('this field has unspecified keys: foo'),
    );
  });
});

describe('strictParamSetSchema', () => {
  test('validate exact match', async () => {
    const res = await strictParamSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      body: '',
      headers: {},
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('validate apiKey dataset standard usage', async () => {
    const res = await strictParamSetSchema().validate({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res).toStrictEqual({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });

    const res1 = await strictParamSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    expect(res1).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: '%API_KEY%',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });

    const res2 = await strictParamSetSchema().validate({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
      },
      dataset: '0x0000000000000000000000000000000000000000',
    });
    expect(res2).toStrictEqual({
      url: 'https://foo.com?query=bar',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
      },
      dataset: '0x0000000000000000000000000000000000000000',
    });
  });

  test('throw with multiple apiKey placeholder', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?apiKey=%API_KEY%API_KEY%&query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Found multiple %API_KEY% occurences in API call parameters, it must have at most one occurrence',
      ),
    );
  });

  test('throw when dataset is missing while needed', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Using %API_KEY% placeholder but no dataset provided',
      ),
    );

    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: { authorization: '%API_KEY%' },
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Using %API_KEY% placeholder but no dataset provided',
      ),
    );
  });

  test('throw with unused dataset', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {},
        dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      }),
    ).rejects.toThrow(
      new ValidationError(
        'Provided dataset but no %API_KEY% placeholder found in url or headers',
      ),
    );
  });

  test('throw when url is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        method: 'POST',
        body: 'body',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {
          'content-type': 'application/json',
        },
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('url is a required field'));
  });

  test('throw when method is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        body: 'body',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {
          'content-type': 'application/json',
        },
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('method is a required field'));
  });

  test('throw when body is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {
          'content-type': 'application/json',
        },
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('body is a required field'));
  });

  test('throw when JSONPath is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        dataType: 'string',
        headers: {
          'content-type': 'application/json',
        },
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('JSONPath is a required field'));
  });

  test('throw when dataType is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        JSONPath: '$.foo',
        headers: {
          'content-type': 'application/json',
        },
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('dataType is a required field'));
  });

  test('throw when headers is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        JSONPath: '$.foo',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(new ValidationError('headers is a required field'));
  });

  test('throw when dataset is missing', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        body: 'body',
        JSONPath: '$.foo',
        dataType: 'string',
        headers: {
          'content-type': 'application/json',
        },
      }),
    ).rejects.toThrow(new ValidationError('dataset is a required field'));
  });

  test('throw with extra keys', async () => {
    await expect(
      strictParamSetSchema().validate({
        url: 'https://foo.com?query=bar',
        method: 'POST',
        JSONPath: '$.foo',
        dataType: 'string',
        foo: 'bar',
      }),
    ).rejects.toThrow(
      new ValidationError('this field has unspecified keys: foo'),
    );
  });
});

describe('jsonParamSetSchema', () => {
  test('throw on invalid JSON', async () => {
    const json = 'foo';
    await expect(jsonParamSetSchema().validate(json)).rejects.toThrow(
      new ValidationError('foo is not a valid JSON'),
    );
  });

  test('exact match', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    const res = await jsonParamSetSchema().validate(json);
    expect(res).toBe(json);
  });

  test('accept empty body', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: '',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    const res = await jsonParamSetSchema().validate(json);
    expect(res).toBe(json);
  });

  test('throw with missing dataset key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
    });
    await expect(jsonParamSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","body":"body","JSONPath":"$.foo","dataType":"string","headers":{"content-type":"application/json","authorization":"foo"}} is not a valid paramSet (Using %API_KEY% placeholder but no dataset provided)',
      ),
    );
  });

  test('throw with missing body key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
    });
    await expect(jsonParamSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","JSONPath":"$.foo","dataType":"string","headers":{"content-type":"application/json","authorization":"foo"},"dataset":"0xF048eF3d7E3B33A465E0599E641BB29421f7Df92"} is not a valid paramSet (body is a required field)',
      ),
    );
  });

  test('throw with extra key', async () => {
    const json = JSON.stringify({
      url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
      method: 'POST',
      body: 'body',
      JSONPath: '$.foo',
      dataType: 'string',
      headers: {
        'content-type': 'application/json',
        authorization: 'foo',
      },
      dataset: '0xF048eF3d7E3B33A465E0599E641BB29421f7Df92',
      foo: 'bar',
    });
    await expect(jsonParamSetSchema().validate(json)).rejects.toThrow(
      new ValidationError(
        '{"url":"https://foo.com?query=bar&apiKey=%API_KEY%","method":"POST","body":"body","JSONPath":"$.foo","dataType":"string","headers":{"content-type":"application/json","authorization":"foo"},"dataset":"0xF048eF3d7E3B33A465E0599E641BB29421f7Df92","foo":"bar"} is not a valid paramSet (this field has unspecified keys: foo)',
      ),
    );
  });
});

describe('updateTargetBlockchainsSchema', () => {
  test('valid undefined', async () => {
    await expect(
      updateTargetBlockchainsSchema().validate(),
    ).resolves.toStrictEqual([]);
  });
  test('valid array of number', async () => {
    await expect(
      updateTargetBlockchainsSchema().validate([1, 5]),
    ).resolves.toStrictEqual([1, 5]);
  });
  test('valid array of string number', async () => {
    await expect(
      updateTargetBlockchainsSchema().validate(['1', '5']),
    ).resolves.toStrictEqual([1, 5]);
  });
  test('valid empty array', async () => {
    await expect(
      updateTargetBlockchainsSchema().validate([]),
    ).resolves.toStrictEqual([]);
  });
  test('invalid object', async () => {
    await expect(updateTargetBlockchainsSchema().validate({})).rejects.toThrow(
      'this must be a `array` type, but the final value was: `null`',
    );
  });
  test('invalid array of string', async () => {
    await expect(
      updateTargetBlockchainsSchema().validate(['foo', 'bar']),
    ).rejects.toThrow(
      new ValidationError(
        '[0] must be a `number` type, but the final value was: `NaN` (cast from the value `"foo"`).',
      ),
    );
  });
});

describe('internal schema', () => {
  describe('addressSchema', () => {
    test('invalid address', async () => {
      await expect(
        paramSetSchema().validate({
          url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
          method: 'POST',
          JSONPath: '$.foo',
          dataType: 'string',
          dataset: 'foo',
        }),
      ).rejects.toThrow(
        new ValidationError('dataset is not a valid ethereum address'),
      );
    });
  });

  describe('headersSchema', () => {
    test('invalid headers', async () => {
      await expect(
        callParamsSchema().validate({
          url: 'https://foo.com?query=bar&apiKey=%API_KEY%',
          method: 'GET',
          headers: {
            authorization: '',
          },
        }),
      ).rejects.toThrow(
        new ValidationError('headers is not a valid header list'),
      );
    });
  });

  describe('jsonPathSchema', () => {
    test('invalid JSONPath', async () => {
      await expect(
        paramSetSchema().validate({
          url: 'https://foo.com?query=bar&',
          method: 'POST',
          JSONPath: '$[foo]',
          dataType: 'string',
        }),
      ).rejects.toThrow(new ValidationError('$[foo] is not a valid JSONPath'));
    });
  });
});

describe('throwIfMissing', () => {
  test('throw', () => {
    const foo = (bar = throwIfMissing()) => bar;
    expect(foo(null)).toBe(null);
    expect(foo('')).toBe('');
    expect(foo(0)).toBe(0);
    expect(() => foo(undefined)).toThrow(Error('Missing parameter'));
    expect(() => foo()).toThrow(Error('Missing parameter'));
  });
});
