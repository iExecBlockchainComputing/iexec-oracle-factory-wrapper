const { sortObjKeys } = require('../src/format');

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
