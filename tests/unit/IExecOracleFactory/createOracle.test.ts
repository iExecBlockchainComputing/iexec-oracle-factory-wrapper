import { beforeEach, jest } from '@jest/globals';
import { Wallet } from 'ethers';
import { IExec, utils } from 'iexec';
import { WorkflowError } from '../../../src/utils/errors.js';

const mockAdd = jest.fn() as jest.Mock<any>;
const mockGet = jest.fn() as jest.Mock<any>;
const mockIsCid = jest.fn() as jest.Mock<any>;

jest.unstable_mockModule('../../../src/services/ipfs', () => ({
  add: mockAdd,
  get: mockGet,
  isCid: mockIsCid,
}));

// dynamically import tested module after all mock are loaded
const { createOracle } = await import(
  '../../../src/oracleFactory/createOracle.js'
);

beforeEach(() => {
  // use ipfs real implementation as default mock
  jest.unstable_mockModule('../../../src/services/ipfs', () => ({
    add: mockAdd as (
      content: any,
      options?: { ipfsGateway?: string }
    ) => Promise<string>,
    get: mockGet as (
      cid: string,
      options?: { ipfsGateway?: string }
    ) => Promise<any>,
    isCid: mockIsCid as (cid: string) => boolean,
  }));
});

jest.unstable_mockModule('../../../src/services/ipfs', () => ({
  add: mockAdd as (
    content: any,
    options?: { ipfsGateway?: string }
  ) => Promise<string>,
  get: mockGet as (
    cid: string,
    options?: { ipfsGateway?: string }
  ) => Promise<any>,
  isCid: mockIsCid as (cid: string) => boolean,
}));

afterEach(() => {
  jest.resetAllMocks();
});

describe('createOracle', () => {
  test('standard - without apiKey', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.data',
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(3);
    expect(messages[0]).toStrictEqual({
      message: 'PARAM_SET_CREATED',
      paramSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        url: 'https://foo.io',
      },
    });
    expect(messages[1]).toStrictEqual({
      message: 'ORACLE_ID_COMPUTED',
      oracleId:
        '0xd042b577b7ede3dd5827614727ac841a1c1ee3aa6387765f64875171478c00e1',
    });
    expect(messages[2]).toStrictEqual({
      message: 'PARAM_SET_UPLOADED',
      cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      multiaddr: '/ipfs/QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
    });
  }, 10000);

  test('standard - with apiKey', async () => {
    mockAdd
      .mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S')
      .mockResolvedValueOnce('QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv');

    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const mockGenerateEncryptionKey: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve('oqff1ywBZyTK6g+qFYz8nnHt09hqB0zPfQrpX8OPHKo=');
      });
    iexec.dataset.generateEncryptionKey = mockGenerateEncryptionKey;

    const encryptedFile = Buffer.from([
      200, 234, 120, 231, 107, 81, 169, 4, 246, 109, 203, 206, 89, 138, 160,
      209, 80, 179, 218, 68, 186, 150, 1, 47, 70, 8, 65, 101, 16, 112, 180, 162,
      148, 60, 235, 131, 27, 42, 0, 29, 122, 51, 39, 55, 70, 82, 239, 191, 90,
      212, 237, 119, 166, 7, 12, 136, 149, 185, 233, 204, 117, 53, 228, 133, 38,
      4, 15, 195, 250, 59, 71, 225, 105, 97, 226, 202, 20, 76, 178, 174, 61,
      126, 66, 241, 10, 227, 15, 248, 129, 26, 62, 84, 195, 166, 4, 121, 26,
      145, 129, 46, 152, 54, 65, 65, 75, 250, 187, 172, 68, 6, 112, 78,
    ]);
    const mockEncrypt: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(encryptedFile);
    });

    iexec.dataset.encrypt = mockEncrypt;

    const deployedDataset = {
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    };
    const mockDeployDataset: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(deployedDataset);
    });
    iexec.dataset.deployDataset = mockDeployDataset;

    const mockPushDatasetSecret: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    iexec.dataset.pushDatasetSecret = mockPushDatasetSecret;

    const createdDatasetOrder = {
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
    };
    const mockCreateDastasetOrder: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(createdDatasetOrder);
      });
    iexec.order.createDatasetorder = mockCreateDastasetOrder;

    const signedDatasetorder = {
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
      salt: '0xb2562351966e09d5831888fc9673b5607d1282ce157dbca4b60d1cd26a8c4529',
      sign: '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
    };
    const mockSignedDatasetorder: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(signedDatasetorder);
    });
    iexec.order.signDatasetorder = mockSignedDatasetorder;

    const mockPublishDatasetorder: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(
          '0xa0c976bf6cf2a6c5d152fa9e3af95b1e9feedd27838eb0dbf5a5e4f77115cfe1'
        );
      });
    iexec.order.publishDatasetorder = mockPublishDatasetorder;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(14);
    expect(messages[0]).toStrictEqual({
      message: 'ENCRYPTION_KEY_CREATED',
      key: 'oqff1ywBZyTK6g+qFYz8nnHt09hqB0zPfQrpX8OPHKo=',
    });
    expect(messages[1]).toStrictEqual({
      message: 'FILE_ENCRYPTED',
      encryptedFile,
      checksum:
        '0x2673b62364e23d409e44f649a16727fdc9d8fd4de42c7c8459acc477af33b540',
    });
    expect(messages[2]).toStrictEqual({
      message: 'ENCRYPTED_FILE_UPLOADED',
      cid: 'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S',
      multiaddr: '/ipfs/QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S',
    });
    expect(messages[3]).toStrictEqual({
      message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST',
    });
    expect(messages[4]).toStrictEqual({
      message: 'DATASET_DEPLOYMENT_SUCCESS',
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    expect(messages[5]).toStrictEqual({
      message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST',
    });
    expect(messages[6]).toStrictEqual({
      message: 'PUSH_SECRET_TO_SMS_SUCCESS',
    });
    expect(messages[7]).toStrictEqual({
      message: 'DATASET_ORDER_SIGNATURE_SIGN_REQUEST',
      order: {
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        datasetprice: '0',
        volume: '9007199254740990',
        tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
        apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
        workerpoolrestrict: '0x0000000000000000000000000000000000000000',
        requesterrestrict: '0x0000000000000000000000000000000000000000',
      },
    });
    expect(messages[8]).toStrictEqual({
      message: 'DATASET_ORDER_SIGNATURE_SUCCESS',
      order: {
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        datasetprice: '0',
        volume: '9007199254740990',
        tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
        apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
        workerpoolrestrict: '0x0000000000000000000000000000000000000000',
        requesterrestrict: '0x0000000000000000000000000000000000000000',
        salt: '0xb2562351966e09d5831888fc9673b5607d1282ce157dbca4b60d1cd26a8c4529',
        sign: '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
      },
    });
    expect(messages[9]).toStrictEqual({
      message: 'DATASET_ORDER_PUBLISH_SIGN_REQUEST',
      order: {
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        datasetprice: '0',
        volume: '9007199254740990',
        tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
        apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
        workerpoolrestrict: '0x0000000000000000000000000000000000000000',
        requesterrestrict: '0x0000000000000000000000000000000000000000',
        salt: '0xb2562351966e09d5831888fc9673b5607d1282ce157dbca4b60d1cd26a8c4529',
        sign: '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
      },
    });
    expect(messages[10]).toStrictEqual({
      message: 'DATASET_ORDER_PUBLISH_SUCCESS',
      orderHash:
        '0xa0c976bf6cf2a6c5d152fa9e3af95b1e9feedd27838eb0dbf5a5e4f77115cfe1',
    });
    expect(messages[11]).toStrictEqual({
      message: 'PARAM_SET_CREATED',
      paramSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        headers: { authorization: '%API_KEY%' },
        method: 'GET',
        url: 'https://foo.io',
      },
    });
    expect(messages[12]).toStrictEqual({
      message: 'ORACLE_ID_COMPUTED',
      oracleId:
        '0xee1828a2a2393bf9501853d450429b52385e1ca9b26506b2996de715e2f3122d',
    });
    expect(messages[13]).toStrictEqual({
      message: 'PARAM_SET_UPLOADED',
      cid: 'QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv',
      multiaddr: '/ipfs/QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv',
    });
  }, 10000);

  test('cancel - without apiKey', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'
    );

    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      const cancel = createOracle({
        iexec,

        url: 'https://foo.io',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.data',
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
          cancel();
          setTimeout(resolve, 5000);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({
      message: 'PARAM_SET_CREATED',
      paramSet: {
        JSONPath: '$.data',
        dataType: 'string',
        dataset: '0x0000000000000000000000000000000000000000',
        headers: {},
        method: 'GET',
        body: '',
        url: 'https://foo.io',
      },
    });
  }, 10000);

  test('cancel - with apiKey', async () => {
    mockAdd
      .mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S')
      .mockResolvedValueOnce('QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv');

    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const mockGenerateEncryptionKey: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve('oqff1ywBZyTK6g+qFYz8nnHt09hqB0zPfQrpX8OPHKo=');
      });
    iexec.dataset.generateEncryptionKey = mockGenerateEncryptionKey;

    const encryptedFile = Buffer.from([
      200, 234, 120, 231, 107, 81, 169, 4, 246, 109, 203, 206, 89, 138, 160,
      209, 80, 179, 218, 68, 186, 150, 1, 47, 70, 8, 65, 101, 16, 112, 180, 162,
      148, 60, 235, 131, 27, 42, 0, 29, 122, 51, 39, 55, 70, 82, 239, 191, 90,
      212, 237, 119, 166, 7, 12, 136, 149, 185, 233, 204, 117, 53, 228, 133, 38,
      4, 15, 195, 250, 59, 71, 225, 105, 97, 226, 202, 20, 76, 178, 174, 61,
      126, 66, 241, 10, 227, 15, 248, 129, 26, 62, 84, 195, 166, 4, 121, 26,
      145, 129, 46, 152, 54, 65, 65, 75, 250, 187, 172, 68, 6, 112, 78,
    ]);
    const mockEncrypt: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(encryptedFile);
    });

    iexec.dataset.encrypt = mockEncrypt;

    const deployedDataset = {
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    };
    const mockDeployDataset: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(deployedDataset);
    });
    iexec.dataset.deployDataset = mockDeployDataset;

    const mockPushDatasetSecret: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    iexec.dataset.pushDatasetSecret = mockPushDatasetSecret;

    const createdDatasetOrder = {
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
    };
    const mockCreateDastasetOrder: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(createdDatasetOrder);
      });
    iexec.order.createDatasetorder = mockCreateDastasetOrder;

    const signedDatasetorder = {
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
      salt: '0xb2562351966e09d5831888fc9673b5607d1282ce157dbca4b60d1cd26a8c4529',
      sign: '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
    };
    const mockSignedDatasetorder: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(signedDatasetorder);
    });
    iexec.order.signDatasetorder = mockSignedDatasetorder;

    const mockPublishDatasetorder: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(
          '0xa0c976bf6cf2a6c5d152fa9e3af95b1e9feedd27838eb0dbf5a5e4f77115cfe1'
        );
      });
    iexec.order.publishDatasetorder = mockPublishDatasetorder;

    const messages: any = [];
    await new Promise((resolve: any, reject) => {
      const cancel = createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: resolve,
        error: (e) => {
          reject(e);
        },
        next: (value) => {
          messages.push(value);
          cancel();
          setTimeout(resolve, 5000);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({
      message: 'ENCRYPTION_KEY_CREATED',
      key: 'oqff1ywBZyTK6g+qFYz8nnHt09hqB0zPfQrpX8OPHKo=',
    });
  }, 10000);

  test('error - failed to upload paramSet', async () => {
    mockAdd.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.data',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to upload paramSet');
    expect(errors[0].originalError).toStrictEqual(Error('ipfs.add failed'));
  }, 10000);

  test('error - unexpected error', async () => {
    mockAdd.mockImplementation(() => {
      throw TypeError('fake error');
    });
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        dataType: 'string',
        JSONPath: '$.data',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Create oracle unexpected error');
    expect(errors[0].originalError).toBeInstanceOf(TypeError);
  }, 10000);

  test('error - with apiKey failed to encrypt apiKey', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const mockEncrypt: any = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.dataset.encrypt failed') as never);

    iexec.dataset.encrypt = mockEncrypt;

    const messages: any = [];
    const errors: any = [];

    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to encrypt API key');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.dataset.encrypt failed')
    );
  }, 10000);

  test('error - with apiKey failed to get encrypted apiKey checksum', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });

    const mockComputeEncryptedFileChecksum: any = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.dataset.computeEncryptedFileChecksum failed') as never
      );

    iexec.dataset.computeEncryptedFileChecksum =
      mockComputeEncryptedFileChecksum;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe(
      'Failed to compute encrypted API key checksum'
    );
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.dataset.computeEncryptedFileChecksum failed')
    );
  }, 10000);

  test('error - with apiKey failed to upload encrypted apiKey', async () => {
    mockAdd.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to upload encrypted API key');
    expect(errors[0].originalError).toStrictEqual(Error('ipfs.add failed'));
  }, 10000);

  test('error - with apiKey failed to deploy dataset', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const mockDeployDataset: any = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.dataset.deployDataset failed') as never
      );

    iexec.dataset.deployDataset = mockDeployDataset;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to deploy API key dataset');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.dataset.deployDataset failed')
    );
  }, 10000);

  test('error - with apiKey failed to push encryption key', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });

    const deployedDataset = {
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    };
    const mockDeployDataset: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(deployedDataset);
    });
    iexec.dataset.deployDataset = mockDeployDataset;

    const mockPushDatasetSecret: any = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.dataset.pushDatasetSecret failed') as never
      );
    iexec.dataset.pushDatasetSecret = mockPushDatasetSecret;

    const messages: any = [];
    const errors: any = [];

    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe(
      "Failed to push API key dataset's encryption key"
    );
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.dataset.pushDatasetSecret failed')
    );
  }, 10000);

  test('error - with apiKey failed to create datasetorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const deployedDataset = {
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    };
    const mockDeployDataset: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(deployedDataset);
    });
    iexec.dataset.deployDataset = mockDeployDataset;

    const mockPushDatasetSecret: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    iexec.dataset.pushDatasetSecret = mockPushDatasetSecret;

    const mockCreateDastasetOrder: any = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.order.createDatasetorder failed') as never
      );

    iexec.order.createDatasetorder = mockCreateDastasetOrder;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,

        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(7);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to create API key datasetorder's");
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.order.createDatasetorder failed')
    );
  }, 10000);

  test('error - with apiKey failed to sign datasetorder', async () => {
    mockAdd.mockResolvedValueOnce(
      'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S'
    );
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const deployedDataset = {
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash:
        '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    };
    const mockDeployDataset: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(deployedDataset);
    });
    iexec.dataset.deployDataset = mockDeployDataset;

    const mockPushDatasetSecret: any = jest.fn().mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    iexec.dataset.pushDatasetSecret = mockPushDatasetSecret;

    const createdDatasetOrder = {
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
    };
    const mockCreateDastasetOrder: any = jest
      .fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(createdDatasetOrder);
      });
    iexec.order.createDatasetorder = mockCreateDastasetOrder;
    const mockSignedDatasetorder: any = jest
      .fn()
      .mockRejectedValueOnce(
        Error('iexec.order.signDatasetorder failed') as never
      );

    iexec.order.signDatasetorder = mockSignedDatasetorder;

    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to sign API key datasetorder's");
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.order.signDatasetorder failed')
    );
  }, 10000);

  test('error - with apiKey unexpected error while creating apiKey dataset', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec',
        Wallet.createRandom().privateKey
      ),
    });
    const mockGenerateEncryptionKey: any = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('something bad happened');
      });
    iexec.dataset.generateEncryptionKey = mockGenerateEncryptionKey;
    const messages: any = [];
    const errors: any = [];
    await new Promise((resolve: any, reject) => {
      createOracle({
        iexec,
        url: 'https://foo.io',
        method: 'GET',
        headers: {
          authorization: '%API_KEY%',
        },
        dataType: 'string',
        JSONPath: '$.data',
        apiKey: 'foo',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          errors.push(e);
          resolve();
        },
        next: (value) => {
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('API key dataset creation unexpected error');
    expect(errors[0].originalError).toStrictEqual(
      Error('something bad happened')
    );
  }, 10000);
});
