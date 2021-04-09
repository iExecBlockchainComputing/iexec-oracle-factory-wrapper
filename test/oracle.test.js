const { Wallet } = require('ethers');
const { IExec, utils } = require('iexec');
const { createOracle, updateOracle } = require('../src/oracle');
const { ValidationError, WorkflowError } = require('../src/errors');
const ipfs = require('../src/ipfs-service');

jest.mock('../src/ipfs-service');

afterEach(() => {
  jest.clearAllMocks();
});

describe('createOracle', () => {
  test('standard - without apiKey', async () => {
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    const messages = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          dataType: 'string',
          JSONPath: '$.data',
        },
      }).subscribe({
        complete: resolve,
        error: (e) => {
          // console.log(e, e.originalError);
          reject(e);
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(3);
    expect(messages[0]).toStrictEqual({
      message: 'PARAMS_SET_CREATED',
      paramsSet: {
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
      oracleId: '0xd042b577b7ede3dd5827614727ac841a1c1ee3aa6387765f64875171478c00e1',
    });
    expect(messages[2]).toStrictEqual({
      message: 'PARAMS_SET_UPLOADED',
      cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      multiaddr: '/ipfs/QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
    });
  }, 10000);

  test('standard - with apiKey', async () => {
    ipfs.add
      .mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S')
      .mockResolvedValueOnce('QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv');

    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.generateEncryptionKey = jest
      .fn()
      .mockReturnValueOnce('oqff1ywBZyTK6g+qFYz8nnHt09hqB0zPfQrpX8OPHKo=');
    const encryptedFile = Buffer.from([
      200,
      234,
      120,
      231,
      107,
      81,
      169,
      4,
      246,
      109,
      203,
      206,
      89,
      138,
      160,
      209,
      80,
      179,
      218,
      68,
      186,
      150,
      1,
      47,
      70,
      8,
      65,
      101,
      16,
      112,
      180,
      162,
      148,
      60,
      235,
      131,
      27,
      42,
      0,
      29,
      122,
      51,
      39,
      55,
      70,
      82,
      239,
      191,
      90,
      212,
      237,
      119,
      166,
      7,
      12,
      136,
      149,
      185,
      233,
      204,
      117,
      53,
      228,
      133,
      38,
      4,
      15,
      195,
      250,
      59,
      71,
      225,
      105,
      97,
      226,
      202,
      20,
      76,
      178,
      174,
      61,
      126,
      66,
      241,
      10,
      227,
      15,
      248,
      129,
      26,
      62,
      84,
      195,
      166,
      4,
      121,
      26,
      145,
      129,
      46,
      152,
      54,
      65,
      65,
      75,
      250,
      187,
      172,
      68,
      6,
      112,
      78,
    ]);
    iexec.dataset.encrypt = jest.fn().mockResolvedValueOnce(encryptedFile);
    iexec.dataset.deployDataset = jest.fn().mockResolvedValueOnce({
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    iexec.dataset.pushDatasetSecret = jest.fn().mockResolvedValueOnce(true);
    iexec.order.createDatasetorder = jest.fn().mockResolvedValueOnce({
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
    });
    iexec.order.signDatasetorder = jest.fn().mockResolvedValueOnce({
      dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      datasetprice: '0',
      volume: '9007199254740990',
      tag: '0x0000000000000000000000000000000000000000000000000000000000000001',
      apprestrict: '0x18De0518FEa922D376596b1Ad2a1f62F3981BE35',
      workerpoolrestrict: '0x0000000000000000000000000000000000000000',
      requesterrestrict: '0x0000000000000000000000000000000000000000',
      salt: '0xb2562351966e09d5831888fc9673b5607d1282ce157dbca4b60d1cd26a8c4529',
      sign:
        '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
    });
    iexec.order.publishDatasetorder = jest
      .fn()
      .mockResolvedValueOnce('0xa0c976bf6cf2a6c5d152fa9e3af95b1e9feedd27838eb0dbf5a5e4f77115cfe1');

    const messages = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: resolve,
        error: (e) => {
          // console.log(e, e.originalError);
          reject(e);
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
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
      checksum: '0x2673b62364e23d409e44f649a16727fdc9d8fd4de42c7c8459acc477af33b540',
    });
    expect(messages[2]).toStrictEqual({
      message: 'ENCRYPTED_FILE_UPLOADED',
      cid: 'QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S',
      multiaddr: '/ipfs/QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S',
    });
    expect(messages[3]).toStrictEqual({ message: 'DATASET_DEPLOYMENT_SIGN_TX_REQUEST' });
    expect(messages[4]).toStrictEqual({
      message: 'DATASET_DEPLOYMENT_SUCCESS',
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    expect(messages[5]).toStrictEqual({ message: 'PUSH_SECRET_TO_SMS_SIGN_REQUEST' });
    expect(messages[6]).toStrictEqual({ message: 'PUSH_SECRET_TO_SMS_SUCCESS' });
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
        sign:
          '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
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
        sign:
          '0xf291c5ecb8552fa46180d35163f81e282322488a047b17ed47d4872c0ed9fe184ed89def7f1a5d75e7ce93f152638645b05a91f305c820539aec91b6c48858541b',
      },
    });
    expect(messages[10]).toStrictEqual({
      message: 'DATASET_ORDER_PUBLISH_SUCCESS',
      orderHash: '0xa0c976bf6cf2a6c5d152fa9e3af95b1e9feedd27838eb0dbf5a5e4f77115cfe1',
    });
    expect(messages[11]).toStrictEqual({
      message: 'PARAMS_SET_CREATED',
      paramsSet: {
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
      oracleId: '0xee1828a2a2393bf9501853d450429b52385e1ca9b26506b2996de715e2f3122d',
    });
    expect(messages[13]).toStrictEqual({
      message: 'PARAMS_SET_UPLOADED',
      cid: 'QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv',
      multiaddr: '/ipfs/QmekKuZECYc3k6mAp2MnLpDaaZgopMzi2t9YSHTNLebJAv',
    });
  }, 10000);

  test('error - failed to upload paramsSet', async () => {
    ipfs.add.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          dataType: 'string',
          JSONPath: '$.data',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to upload paramsSet');
    expect(errors[0].originalError).toStrictEqual(Error('ipfs.add failed'));
  }, 10000);

  test('error - unexpected error', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          dataType: 'string',
          JSONPath: '$.data',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Create oracle unexpected error');
    expect(errors[0].originalError).toStrictEqual(
      TypeError("Cannot read property 'catch' of undefined"),
    );
  }, 10000);

  test('error with apiKey - failed to encrypt apiKey', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.encrypt = jest.fn().mockRejectedValueOnce(Error('iexec.dataset.encrypt failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to encrypt API key');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.dataset.encrypt failed'));
  }, 10000);

  test('error with apiKey - failed to get encrypted apiKey checksum', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.computeEncryptedFileChecksum = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.dataset.computeEncryptedFileChecksum failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to compute encrypted API key checksum');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.dataset.computeEncryptedFileChecksum failed'),
    );
  }, 10000);

  test('error with apiKey - failed to upload encrypted apiKey', async () => {
    ipfs.add.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
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

  test('error with apiKey - failed to deploy dataset', async () => {
    ipfs.add.mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.deployDataset = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.dataset.deployDataset failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to deploy API key dataset');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.dataset.deployDataset failed'));
  }, 10000);

  test('error with apiKey - failed to push encryption key', async () => {
    ipfs.add.mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.deployDataset = jest.fn().mockResolvedValueOnce({
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    iexec.dataset.pushDatasetSecret = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.dataset.pushDatasetSecret failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to push API key dataset's encryption key");
    expect(errors[0].originalError).toStrictEqual(Error('iexec.dataset.pushDatasetSecret failed'));
  }, 10000);

  test('error with apiKey - failed to create datasetorder', async () => {
    ipfs.add.mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.deployDataset = jest.fn().mockResolvedValueOnce({
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    iexec.dataset.pushDatasetSecret = jest.fn().mockResolvedValueOnce(true);
    iexec.order.createDatasetorder = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.createDatasetorder failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(7);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to create API key datasetorder's");
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.createDatasetorder failed'));
  }, 10000);

  test('error with apiKey - failed to sign datasetorder', async () => {
    ipfs.add.mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.deployDataset = jest.fn().mockResolvedValueOnce({
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    iexec.dataset.pushDatasetSecret = jest.fn().mockResolvedValueOnce(true);
    iexec.order.createDatasetorder = jest.fn().mockResolvedValueOnce('datasetorderToSign');
    iexec.order.signDatasetorder = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.signDatasetorder failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to sign API key datasetorder's");
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.signDatasetorder failed'));
  }, 10000);

  test('error with apiKey - failed to sign datasetorder', async () => {
    ipfs.add.mockResolvedValueOnce('QmUFfK7UXwLJNQFjdHFhoCGHiuovh9YagpJ3XtpXQL7N2S');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.deployDataset = jest.fn().mockResolvedValueOnce({
      address: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
      txHash: '0xc153e4bf01cfa4006ee8f59194dcceebd7126898b9c758d13d0b3664e058d73c',
    });
    iexec.dataset.pushDatasetSecret = jest.fn().mockResolvedValueOnce(true);
    iexec.order.createDatasetorder = jest.fn().mockResolvedValueOnce('datasetorderToSign');
    iexec.order.signDatasetorder = jest.fn().mockResolvedValueOnce('datasetorder');
    iexec.order.publishDatasetorder = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.publishDatasetorder failed'));
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(10);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe("Failed to publish API key datasetorder's");
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.publishDatasetorder failed'));
  }, 10000);

  test('error with apiKey - unexpected error while creating apiKey dataset', async () => {
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.dataset.generateEncryptionKey = jest.fn().mockImplementationOnce(() => {
      throw Error('something bad happened');
    });
    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      createOracle({
        iexec,
        rawParams: {
          url: 'https://foo.io',
          method: 'GET',
          headers: {
            authorization: '%API_KEY%',
          },
          dataType: 'string',
          JSONPath: '$.data',
          apiKey: 'foo',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('API key dataset creation unexpected error');
    expect(errors[0].originalError).toStrictEqual(Error('something bad happened'));
  }, 10000);
});

describe('updateOracle', () => {
  test('standard - from paramsSet', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedApporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedDatasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedWorkerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorderToSign');
    iexec.order.signRequestorder = jest.fn().mockResolvedValueOnce('signedRequestorder');
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    });
    iexec.deal.computeTaskId = jest.fn().mockResolvedValueOnce('taskid');
    iexec.task.obsTask = jest.fn().mockReturnValueOnce({
      subscribe: ({ next, error, complete }) => {
        next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
        next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
        next({ message: 'TASK_COMPLETED', task: { statusName: 'COMPLETED' } });
        complete();
      },
    });

    const messages = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: resolve,
        error: (e) => {
          // console.log(e, e.originalError);
          reject(e);
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(16);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(messages[1]).toStrictEqual({ message: 'ENSURE_PARAMS_UPLOAD' });
    expect(messages[2]).toStrictEqual({
      message: 'ENSURE_PARAMS_SUCCESS',
      paramsSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        headers: { authorization: '%API_KEY%' },
        method: 'GET',
        url: 'https://foo.io',
      },
      cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
    });
    expect(messages[3]).toStrictEqual({ message: 'FETCH_APP_ORDER' });
    expect(messages[4]).toStrictEqual({
      message: 'FETCH_APP_ORDER_SUCCESS',
      order: 'signedApporder',
    });
    expect(messages[5]).toStrictEqual({ message: 'FETCH_DATASET_ORDER' });
    expect(messages[6]).toStrictEqual({
      message: 'FETCH_DATASET_ORDER_SUCCESS',
      order: 'signedDatasetorder',
    });
    expect(messages[7]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
    expect(messages[8]).toStrictEqual({
      message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
      order: 'signedWorkerpoolorder',
    });
    expect(messages[9]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
      order: 'requestorderToSign',
    });
    expect(messages[10]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
      order: 'requestorderToSign',
    });
    expect(messages[11]).toStrictEqual({
      message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
      apporder: 'signedApporder',
      datasetorder: 'signedDatasetorder',
      workerpoolorder: 'signedWorkerpoolorder',
      requestorder: 'signedRequestorder',
    });
    expect(messages[12]).toStrictEqual({
      message: 'MATCH_ORDERS_SUCCESS',
      dealid: 'dealid',
      txHash: 'txHash',
    });
    expect(messages[13]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'ACTIVE',
    });
    expect(messages[14]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'REVEALING',
    });
    expect(messages[15]).toStrictEqual({ message: 'UPDATE_TASK_COMPLETED' });
  }, 10000);

  test('standard - from CID', async () => {
    ipfs.isCid.mockReturnValueOnce(true);
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    ipfs.get.mockResolvedValueOnce(
      JSON.stringify({
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        headers: { authorization: '%API_KEY%' },
        method: 'GET',
        url: 'https://foo.io',
      }),
    );
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedApporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedDatasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'signedWorkerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorderToSign');
    iexec.order.signRequestorder = jest.fn().mockResolvedValueOnce('signedRequestorder');
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    });
    iexec.deal.computeTaskId = jest.fn().mockResolvedValueOnce('taskid');
    iexec.task.obsTask = jest.fn().mockReturnValueOnce({
      subscribe: ({ next, error, complete }) => {
        next({ message: 'TASK_UPDATED', task: { statusName: 'ACTIVE' } });
        next({ message: 'TASK_UPDATED', task: { statusName: 'REVEALING' } });
        next({ message: 'TASK_COMPLETED', task: { statusName: 'COMPLETED' } });
        complete();
      },
    });

    const messages = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }).subscribe({
        complete: resolve,
        error: (e) => {
          // console.log(e, e.originalError);
          reject(e);
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(15);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(messages[1]).toStrictEqual({
      message: 'ENSURE_PARAMS_SUCCESS',
      paramsSet: {
        JSONPath: '$.data',
        body: '',
        dataType: 'string',
        dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
        headers: { authorization: '%API_KEY%' },
        method: 'GET',
        url: 'https://foo.io',
      },
      cid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
    });
    expect(messages[2]).toStrictEqual({ message: 'FETCH_APP_ORDER' });
    expect(messages[3]).toStrictEqual({
      message: 'FETCH_APP_ORDER_SUCCESS',
      order: 'signedApporder',
    });
    expect(messages[4]).toStrictEqual({ message: 'FETCH_DATASET_ORDER' });
    expect(messages[5]).toStrictEqual({
      message: 'FETCH_DATASET_ORDER_SUCCESS',
      order: 'signedDatasetorder',
    });
    expect(messages[6]).toStrictEqual({ message: 'FETCH_WORKERPOOL_ORDER' });
    expect(messages[7]).toStrictEqual({
      message: 'FETCH_WORKERPOOL_ORDER_SUCCESS',
      order: 'signedWorkerpoolorder',
    });
    expect(messages[8]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SIGN_REQUEST',
      order: 'requestorderToSign',
    });
    expect(messages[9]).toStrictEqual({
      message: 'REQUEST_ORDER_SIGNATURE_SUCCESS',
      order: 'requestorderToSign',
    });
    expect(messages[10]).toStrictEqual({
      message: 'MATCH_ORDERS_SIGN_TX_REQUEST',
      apporder: 'signedApporder',
      datasetorder: 'signedDatasetorder',
      workerpoolorder: 'signedWorkerpoolorder',
      requestorder: 'signedRequestorder',
    });
    expect(messages[11]).toStrictEqual({
      message: 'MATCH_ORDERS_SUCCESS',
      dealid: 'dealid',
      txHash: 'txHash',
    });
    expect(messages[12]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'ACTIVE',
    });
    expect(messages[13]).toStrictEqual({
      message: 'TASK_UPDATED',
      dealid: 'dealid',
      taskid: 'taskid',
      status: 'REVEALING',
    });
    expect(messages[14]).toStrictEqual({ message: 'UPDATE_TASK_COMPLETED' });
  }, 10000);

  test('error from CID - ipfs content not found', async () => {
    ipfs.isCid.mockReturnValueOnce(true);
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    ipfs.get.mockRejectedValueOnce(Error('Content not found'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to load paramsSet');
    expect(errors[0].originalError).toStrictEqual(
      Error('Failed to load paramsSetSet from CID QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh'),
    );
  }, 10000);

  test('error from CID - ipfs content is not valid paramsSet', async () => {
    ipfs.isCid.mockReturnValueOnce(true);
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    ipfs.get.mockResolvedValueOnce('{"foo":"bar"}');

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: 'QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh',
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(messages[0]).toStrictEqual({ message: 'ENSURE_PARAMS' });
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to load paramsSet');
    expect(errors[0].originalError).toStrictEqual(
      Error(
        'Content associated to CID QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh is not a valid paramsSet',
      ),
    );
  }, 10000);

  test('error from paramsSet - invalid paramsSet', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {},
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(ValidationError);
    expect(errors[0].message).toBeDefined();
  }, 10000);

  test('error from paramsSet - fail to upload', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockRejectedValueOnce(Error('ipfs.add failed'));
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to upload paramsSet');
    expect(errors[0].originalError).toStrictEqual(Error('ipfs.add failed'));
  }, 10000);

  test('error - fail to fetch apporder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.orderbook.fetchAppOrderbook failed'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch apporder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchAppOrderbook failed'),
    );
  }, 10000);

  test('error - no apporder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest.fn().mockResolvedValueOnce({ count: 0, orders: [] });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(4);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No apporder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to fetch datasetorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.orderbook.fetchDatasetOrderbook fail'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch datasetorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchDatasetOrderbook fail'),
    );
  }, 10000);

  test('error - no datasetorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [] });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(6);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No datasetorder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to fetch workerppolorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.orderbook.fetchWorkerpoolOrderbook fail'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to fetch workerpoolorder');
    expect(errors[0].originalError).toStrictEqual(
      Error('iexec.orderbook.fetchWorkerpoolOrderbook fail'),
    );
  }, 10000);

  test('error - no workerpoolorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [] });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(8);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('No workerpoolorder published');
    expect(errors[0].originalError).toBeUndefined();
  }, 10000);

  test('error - fail to create requestorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [{ order: 'workerpoolorder' }] });
    iexec.order.createRequestorder = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.createRequestorder failed'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(9);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to create requestorder');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.createRequestorder failed'));
  }, 10000);

  test('error - fail to sign requestorder', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [{ order: 'workerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.signRequestorder = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.signRequestorder failed'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(10);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to sign requestorder');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.signRequestorder failed'));
  }, 10000);

  test('error - fail to match orders', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [{ order: 'workerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.signRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.matchOrders = jest
      .fn()
      .mockRejectedValueOnce(Error('iexec.order.matchOrders failed'));

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(12);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to match orders');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.order.matchOrders failed'));
  }, 10000);

  test('error - task observer error', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [{ order: 'workerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.signRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    });
    iexec.deal.computeTaskId = jest.fn().mockResolvedValueOnce('taskid');
    iexec.task.obsTask = jest.fn().mockReturnValueOnce({
      subscribe: ({ next, error, complete }) => {
        error(Error('iexec.task.obsTask error'));
      },
    });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(13);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Failed to monitor oracle update task');
    expect(errors[0].originalError).toStrictEqual(Error('iexec.task.obsTask error'));
  }, 10000);

  test('error - update task timedout', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    ipfs.add.mockResolvedValueOnce('QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh');
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });
    iexec.orderbook.fetchAppOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'apporder' }] });
    iexec.orderbook.fetchDatasetOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 1, orders: [{ order: 'datasetorder' }] });
    iexec.orderbook.fetchWorkerpoolOrderbook = jest
      .fn()
      .mockResolvedValueOnce({ count: 0, orders: [{ order: 'workerpoolorder' }] });
    iexec.order.createRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.signRequestorder = jest.fn().mockResolvedValueOnce('requestorder');
    iexec.order.matchOrders = jest.fn().mockResolvedValueOnce({
      txHash: 'txHash',
      dealid: 'dealid',
    });
    iexec.deal.computeTaskId = jest.fn().mockResolvedValueOnce('taskid');
    iexec.task.obsTask = jest.fn().mockReturnValueOnce({
      subscribe: ({ next, error, complete }) => {
        next({ message: 'TASK_TIMEDOUT', task: { statusName: 'TIMEOUT' } });
        complete();
      },
    });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(13);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Oracle update task timed out, update failed');
    expect(errors[0].originalError).toStrictEqual(Error('Task taskid from deal dealid timed out'));
  }, 10000);

  test('error - unexpected error', async () => {
    ipfs.isCid.mockReturnValueOnce(false);
    const iexec = new IExec({
      ethProvider: utils.getSignerFromPrivateKey('goerli', Wallet.createRandom().privateKey),
      chainId: '5',
    });

    const messages = [];
    const errors = [];
    await new Promise((resolve, reject) => {
      updateOracle({
        iexec,
        paramsSetOrCid: {
          JSONPath: '$.data',
          body: '',
          dataType: 'string',
          dataset: '0xdB5e636e332916eA0de602CB94d00E8e343cAB36',
          headers: { authorization: '%API_KEY%' },
          method: 'GET',
          url: 'https://foo.io',
        },
      }).subscribe({
        complete: () => reject(Error('should not call complete')),
        error: (e) => {
          // console.log(e, e.originalError);
          errors.push(e);
          resolve();
        },
        next: (value) => {
          // console.log(JSON.stringify(value));
          messages.push(value);
        },
      });
    });
    expect(messages.length).toBe(2);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(WorkflowError);
    expect(errors[0].message).toBe('Update oracle unexpected error');
    expect(errors[0].originalError).toStrictEqual(
      TypeError("Cannot read property 'catch' of undefined"),
    );
  }, 10000);
});