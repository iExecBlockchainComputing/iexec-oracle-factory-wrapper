import { beforeEach, jest } from '@jest/globals';
import { Wallet } from 'ethers';
import { utils } from 'iexec';
import {
  NoValueError,
  ValidationError,
  WorkflowError,
} from '../../../dist/utils/errors.js';
const mockAdd = jest.fn() as jest.Mock<any>;
const mockGet = jest.fn() as jest.Mock<any>;
const mockIsCid = jest.fn() as jest.Mock<any>;
import { getDefaultProvider } from '../../../dist/config/config.js';

jest.unstable_mockModule('../../../dist/services/ipfs', () => ({
  add: mockAdd,
  get: mockGet,
  isCid: mockIsCid,
}));

// dynamically import tested module after all mock are loaded
const { readOracle } = await import(
  '../../../dist/oracleFactory/readOracle.js'
);

beforeEach(() => {
  // use ipfs real implementation as default mock
  jest.unstable_mockModule('../../../dist/services/ipfs', () => ({
    add: mockAdd as (
      content: any,
      options?: { ipfsGateway?: string },
    ) => Promise<string>,
    get: mockGet as (
      cid: string,
      options?: { ipfsGateway?: string },
    ) => Promise<any>,
    isCid: mockIsCid as (cid: string) => boolean,
  }));
});

jest.unstable_mockModule('../../../dist/services/ipfs', () => ({
  add: mockAdd as (
    content: any,
    options?: { ipfsGateway?: string },
  ) => Promise<string>,
  get: mockGet as (
    cid: string,
    options?: { ipfsGateway?: string },
  ) => Promise<any>,
  isCid: mockIsCid as (cid: string) => boolean,
}));

afterEach(() => {
  jest.resetAllMocks();
});

describe('readOracle', () => {
  test('standard - from paramSet dataType: "boolean"', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId: {
        JSONPath: '$.ok',
        body: '',
        dataType: 'boolean',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.market.iex.ec/version',
      },
    });
    const { value, date } = res;
    expect(typeof value).toBe('boolean');
    expect(typeof date).toBe('number');
  });

  test('standard - from paramSet dataType: "number"', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId: {
        JSONPath: "$['ethereum']['usd']",
        body: '',
        dataType: 'number',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      },
    });
    const { value, date } = res;
    expect(typeof value).toBe('number');
    expect(typeof date).toBe('number');
  });

  test('standard - from paramSet dataType: "string"', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId: {
        JSONPath: '$.version',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.market.iex.ec/version',
      },
    });
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from CID', async () => {
    mockAdd.mockResolvedValueOnce(
      JSON.stringify({
        JSONPath: '$.version',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.market.iex.ec/version',
      }),
    );
    mockIsCid.mockResolvedValueOnce(true);
    mockGet.mockResolvedValueOnce(
      JSON.stringify({
        JSONPath: '$.version',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://api.market.iex.ec/version',
      }),
    );
    const signer = utils.getSignerFromPrivateKey(
      'https://bellecour.iex.ec',
      Wallet.createRandom().privateKey,
    );
    const res = await readOracle({
      ethersProvider: signer.provider!,
      paramSetOrCidOrOracleId: 'Qmb1JLTVp4zfRMPaori9htzzM9D3B1tG8pGbZYTRC1favA',
    });
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (default dataType)', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId:
        '0xf0f370ad33d1e3e8e2d8df7197c40f62b5bc403553b103858359687491234491',
    });
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType number)', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId:
        '0x31172fe38a7be8a62fa4882d3a5b5cf7da13fa6ad5b144a0c2f35b559bbba14f',
      dataType: 'number',
    });
    const { value, date } = res;
    expect(typeof value).toBe('number');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType string)', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId:
        '0x9fc5c194d4898197e535060b54256435fda773ae59c93cf88be84bce1ca4ce3e',
      dataType: 'string',
    });
    const { value, date } = res;
    expect(typeof value).toBe('string');
    expect(typeof date).toBe('number');
  });

  test('standard - from oracleId (dataType boolean)', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    const res = await readOracle({
      ethersProvider: provider,
      paramSetOrCidOrOracleId:
        '0xccf7d910abf22fbeeef17f861b5cf9abb9543e48ee502285f7df53c63296ce21',
      dataType: 'boolean',
    });
    const { value, date } = res;
    expect(typeof value).toBe('boolean');
    expect(typeof date).toBe('number');
  });

  test('error - no value stored for oracleId', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    await expect(
      readOracle({
        ethersProvider: provider,
        paramSetOrCidOrOracleId: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }),
    ).rejects.toThrow(
      new NoValueError(
        'No value stored for oracleId 0xee1828a2a2393bf9501853d450429b52385e1ca9b26506b2996de715e2f3122d',
      ),
    );
  });

  test('error - dataType is not allowed for non oracleId inputs', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    await expect(
      readOracle({
        ethersProvider: provider,
        paramSetOrCidOrOracleId: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
        dataType: 'boolean',
      }),
    ).rejects.toThrow(
      Error(
        'dataType option is only allowed when reading oracle from oracleId',
      ),
    );
  });

  test.only('error - invalid dataset', async () => {
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    await expect(
      readOracle({
        ethersProvider: provider,
        paramSetOrCidOrOracleId: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '1236',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }),
    ).rejects.toThrow(
      new ValidationError('dataset is not a valid ethereum address'),
    );
  });

  test('error - failed to load paramSet', async () => {
    mockGet.mockRejectedValueOnce(Error('ipfs.get failed'));
    mockIsCid.mockResolvedValueOnce(true);
    const provider = getDefaultProvider('https://bellecour.iex.ec', {});
    await expect(
      readOracle({
        ethersProvider: provider,
        paramSetOrCidOrOracleId:
          'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }),
    ).rejects.toThrow(
      new WorkflowError('Failed to load paramSet', Error('ipfs.get failed')),
    );
  });

  test('error - unsupported chain', async () => {
    const provider = getDefaultProvider('optimism', {});
    await expect(
      readOracle({
        ethersProvider: provider,
        paramSetOrCidOrOracleId: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }),
    ).rejects.toThrow(Error('Unsupported chain 10'));
  });
});
