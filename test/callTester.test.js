import fetch from 'cross-fetch';
import testRawParams from '../src/callTester';

jest.mock('cross-fetch');

afterEach(() => {
  jest.resetAllMocks();
});

describe('testRawParams', () => {
  test('standard - perfom fetch with %API_KEY% placeholder replacement in url and headers', async () => {
    fetch.mockImplementation(async () => ({
      json: () => Promise.resolve({ foo: false, bar: true }),
    }));
    await testRawParams({
      url: 'https://foo.io?query=bar&apiKey=%API_KEY%',
      method: 'PUT',
      dataType: 'boolean',
      JSONPath: '$.bar',
      apiKey: 'topSecretKey',
      body: '%API_KEY%',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://foo.io?query=bar&apiKey=topSecretKey',
      {
        body: '%API_KEY%',
        headers: {},
        method: 'PUT',
      },
    );
    fetch.mockClear();
    await testRawParams({
      url: 'https://foo.io?query=bar',
      method: 'POST',
      dataType: 'boolean',
      JSONPath: '$.bar',
      apiKey: 'topSecretKey',
      body: '%API_KEY%',
      headers: {
        authorization: '%API_KEY%',
        foo: 'bar',
      },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://foo.io?query=bar', {
      body: '%API_KEY%',
      headers: {
        authorization: 'topSecretKey',
        foo: 'bar',
      },
      method: 'POST',
    });
  });

  test('standard - dataType boolean', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.resolve({ foo: false, bar: true }),
    }));
    const res = await testRawParams({
      url: 'https://foo.io?query=bar',
      method: 'GET',
      dataType: 'boolean',
      JSONPath: '$.bar',
    });
    expect(res).toBe(true);
  });

  test('standard - dataType number', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.resolve({ foo: -10, bar: 1.23456789 }),
    }));
    const res = await testRawParams({
      url: 'https://foo.io?query=bar',
      method: 'GET',
      dataType: 'number',
      JSONPath: '$.bar',
    });
    expect(res).toBe(1.23456789);
  });

  test('standard - dataType string', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.resolve({ foo: '-10', bar: '1.23456789' }),
    }));
    const res = await testRawParams({
      url: 'https://foo.io?query=bar',
      method: 'GET',
      dataType: 'string',
      JSONPath: '$.bar',
    });
    expect(res).toBe('1.23456789');
  });

  test('error - throw when fetch throws', async () => {
    fetch.mockRejectedValueOnce(Error('fetch error'));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$.bar',
      }),
    ).rejects.toThrow(
      Error(
        'Failed get a response from the API (Error: fetch error)\nYou can:\n- check your connection\n- check the API url\n- check the HTTP method\n- check the API allows CORS',
      ),
    );
  });

  test('error - throw when response is not a JSON', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.reject(Error('json parse error')),
    }));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$.bar',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but the response body format is not supported, it must be a JSON',
      ),
    );
  });

  test('error - throw when selected result is empty', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.resolve({ foo: 'bar' }),
    }));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$.bar',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$.bar" returned empty result, it must return a single value:\n[]',
      ),
    );
  });

  test('error - throw when selected result is not unique', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () =>
        Promise.resolve({ foo: { target: 'foo' }, bar: { target: 'bar' } }),
    }));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$..target',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$..target" returned multiple results, it must return a single value:\n[\n  "foo",\n  "bar"\n]',
      ),
    );
  });

  test('error - throw when selected result is an object', async () => {
    fetch.mockImplementationOnce(async () => ({
      json: () => Promise.resolve({ foo: [] }),
    }));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$.foo',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$.foo" returned a object, it must be string, number or boolean:\n[]',
      ),
    );
  });

  test('error - throw when dataType mismatch retruned value', async () => {
    fetch.mockImplementation(async () => ({
      json: () => Promise.resolve({ foo: true, bar: 1.23456789, baz: 'foo' }),
    }));
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.foo',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$.foo" returned a boolean, wich is NOT compatible with `dataType: "string"`,  use `dataType: "boolean"` to store boolean',
      ),
    );
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'boolean',
        JSONPath: '$.bar',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$.bar" returned a number, wich is NOT compatible with `dataType: "boolean"`,  use `dataType: "number"` to store number',
      ),
    );
    await expect(
      testRawParams({
        url: 'https://foo.io?query=bar',
        method: 'GET',
        dataType: 'number',
        JSONPath: '$.baz',
      }),
    ).rejects.toThrow(
      Error(
        'The API answered with status undefined but JSONPath selector "$.baz" returned a string, wich is NOT compatible with `dataType: "number"`,  use `dataType: "string"` to store string',
      ),
    );
  });
});
