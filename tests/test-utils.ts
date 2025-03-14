// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Wallet, JsonRpcProvider, ethers, Contract, isAddress } from 'ethers';
import { IExec, utils } from 'iexec';
import { getSignerFromPrivateKey } from 'iexec/utils';
import { AddressOrENS, Web3SignerProvider } from '../src/index.js';

const { DRONE } = process.env;

export const OF_APP_ADDRESS: AddressOrENS = 'oracle-factory.apps.iexec.eth';
export const OF_APP_WHITELIST_ADDRESS: Address =
  '0x26472b355849B409769545A8595fe97846a8F0C9';

export const TEST_CHAIN = {
  rpcURL: DRONE ? 'http://bellecour-fork:8545' : 'http://127.0.0.1:8545',
  chainId: '134',
  smsURL: DRONE ? 'http://sms:13300' : 'http://127.0.0.1:13300',
  resultProxyURL: DRONE
    ? 'http://result-proxy:13200'
    : 'http://127.0.0.1:13200',
  iexecGatewayURL: DRONE ? 'http://market-api:3000' : 'http://127.0.0.1:3000',
  voucherHubAddress: '0x3137B6DF4f36D338b82260eDBB2E7bab034AFEda',
  voucherManagerWallet: new Wallet(
    '0x2c906d4022cace2b3ee6c8b596564c26c4dcadddf1e949b769bcb0ad75c40c33'
  ),
  voucherSubgraphURL: DRONE
    ? 'http://gaphnode:8000/subgraphs/name/bellecour/iexec-voucher'
    : 'http://127.0.0.1:8000/subgraphs/name/bellecour/iexec-voucher',
  debugWorkerpool: 'debug-v8-bellecour.main.pools.iexec.eth',
  debugWorkerpoolOwnerWallet: new Wallet(
    '0x800e01919eadf36f110f733decb1cc0f82e7941a748e89d7a3f76157f6654bb3'
  ),
  prodWorkerpool: 'prod-v8-bellecour.main.pools.iexec.eth',
  prodWorkerpoolOwnerWallet: new Wallet(
    '0x6a12f56d7686e85ab0f46eb3c19cb0c75bfabf8fb04e595654fc93ad652fa7bc'
  ),
  appOwnerWallet: new Wallet(
    '0xa911b93e50f57c156da0b8bff2277d241bcdb9345221a3e246a99c6e7cedcde5'
  ),
  provider: new JsonRpcProvider(
    DRONE ? 'http://bellecour-fork:8545' : 'http://127.0.0.1:8545'
  ),
};

export const getEventFromLogs = (eventName, logs, { strict = true }) => {
  const eventFound = logs.find((log) => log.eventName === eventName);
  if (!eventFound) {
    if (strict) throw new Error(`Unknown event ${eventName}`);
    return undefined;
  }
  return eventFound;
};

export const getTestWeb3SignerProvider = (
  privateKey: string = Wallet.createRandom().privateKey
): Web3SignerProvider =>
  utils.getSignerFromPrivateKey(TEST_CHAIN.rpcURL, privateKey);

export const getTestIExecOption = () => ({
  smsURL: TEST_CHAIN.smsURL,
  resultProxyURL: TEST_CHAIN.resultProxyURL,
  iexecGatewayURL: TEST_CHAIN.iexecGatewayURL,
  voucherHubAddress: TEST_CHAIN.voucherHubAddress,
  voucherSubgraphURL: TEST_CHAIN.voucherSubgraphURL,
});

export const getTestConfig = (
  privateKey: string
): [Web3SignerProvider, OracleFactoryOptions] => {
  const ethProvider = getTestWeb3SignerProvider(privateKey);
  const options = {
    iexecOptions: getTestIExecOption(),
    ipfsNode: DRONE ? 'http://ipfs:5001' : 'http://127.0.0.1:5001',
    ipfsGateway: DRONE ? 'http://ipfs:8080' : 'http://127.0.0.1:8080',
  };
  return [ethProvider, options];
};

export const getRandomAddress = () => Wallet.createRandom().address;

/**
 * on bellecour the blocktime is expected to be 5sec but in case of issue on the network this blocktime can reach unexpected length
 *
 * use this variable as a reference blocktime for tests timeout
 *
 * when the network is degraded, tweak the `MAX_EXPECTED_BLOCKTIME` value to reflect the network conditions
 */
export const MAX_EXPECTED_BLOCKTIME = 5_000;

export const MAX_EXPECTED_MARKET_API_PURGE_TIME = 5_000;

export const MAX_EXPECTED_WEB2_SERVICES_TIME = 80_000;

const MARKET_API_CALL_TIMEOUT = 2_000;

const MAX_EXPECTED_CREATE_API_KEY_DATASET_TIME =
  MAX_EXPECTED_WEB2_SERVICES_TIME + //  upload encrypted API key to IPFS
  MAX_EXPECTED_BLOCKTIME + // deploy API key dataset
  MAX_EXPECTED_WEB2_SERVICES_TIME * 5; // push dataset secret + create dataset order + sign dataset order + publish dataset order +  upload paramSet to IPFS

export const timeouts = {
  // utils
  createVoucherType: MAX_EXPECTED_BLOCKTIME * 2,
  createVoucher: MAX_EXPECTED_BLOCKTIME * 4 + MARKET_API_CALL_TIMEOUT * 2,
  updateOracle:
    MAX_EXPECTED_WEB2_SERVICES_TIME + // IPFS fetch and upload
    MAX_EXPECTED_MARKET_API_PURGE_TIME * 3 + // fetch app order + dataset order + workerpool order
    MAX_EXPECTED_WEB2_SERVICES_TIME + // create and sign request order
    MAX_EXPECTED_BLOCKTIME, // match orders
  createOracle:
    MAX_EXPECTED_CREATE_API_KEY_DATASET_TIME + MAX_EXPECTED_WEB2_SERVICES_TIME, // create Api Key Dataset + upload paramSet to IPFS
};

export const sleep = (ms) =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, ms);
  });

export const setBalance = async (
  address: string,
  targetWeiBalance: ethers.BigNumberish
) => {
  await fetch(TEST_CHAIN.rpcURL, {
    method: 'POST',
    body: JSON.stringify({
      method: 'anvil_setBalance',
      params: [address, ethers.toBeHex(targetWeiBalance)],
      id: 1,
      jsonrpc: '2.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const setNRlcBalance = async (
  address: string,
  nRlcTargetBalance: ethers.BigNumberish
) => {
  const weiAmount = BigInt(`${nRlcTargetBalance}`) * 10n ** 9n; // 1 nRLC is 10^9 wei
  await setBalance(address, weiAmount);
};

export const createVoucherType = async ({
  description = 'test',
  duration = 1000,
} = {}) => {
  const VOUCHER_HUB_ABI = [
    {
      inputs: [
        {
          internalType: 'string',
          name: 'description',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: 'duration',
          type: 'uint256',
        },
      ],
      name: 'createVoucherType',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'id',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'description',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'duration',
          type: 'uint256',
        },
      ],
      name: 'VoucherTypeCreated',
      type: 'event',
    },
  ];
  const voucherHubContract = new Contract(
    TEST_CHAIN.voucherHubAddress,
    VOUCHER_HUB_ABI,
    TEST_CHAIN.provider
  );
  const signer = TEST_CHAIN.voucherManagerWallet.connect(TEST_CHAIN.provider);
  const createVoucherTypeTxHash = await voucherHubContract
    .connect(signer)
    .createVoucherType(description, duration);
  const txReceipt = await createVoucherTypeTxHash.wait();
  const { id } = getEventFromLogs('VoucherTypeCreated', txReceipt.logs, {
    strict: true,
  }).args;

  return id as bigint;
};

export const createAndPublishAppOrders = async (
  appAddressOrEns: AddressOrENS,
  appOwnerWallet: ethers.Wallet,
  appprice? = 1000,
  volume? = 1000
) => {
  const ethProvider = utils.getSignerFromPrivateKey(
    TEST_CHAIN.rpcURL,
    appOwnerWallet.privateKey
  );
  const iexec = new IExec({ ethProvider }, getTestIExecOption());
  let appAddress = appAddressOrEns;
  if (!isAddress(appAddressOrEns)) {
    appAddress = await iexec.ens.resolveName(appAddressOrEns);
  }
  const apporder = await iexec.order.createApporder({
    app: appAddress,
    tag: ['tee', 'scone'],
    volume,
    appprice,
  });
  const signedApporder = await iexec.order.signApporder(apporder);
  await iexec.order.publishApporder(signedApporder);
  return signedApporder;
};

export const ensureSufficientStake = async (iexec, requiredStake) => {
  const walletAddress = await iexec.wallet.getAddress();
  const { stake } = await iexec.account.checkBalance(walletAddress);

  if (stake < requiredStake) {
    await setNRlcBalance(walletAddress, requiredStake);
    await iexec.account.deposit(requiredStake);
  }
};

export const createAndPublishWorkerpoolOrder = async (
  workerpool: string,
  workerpoolOwnerWallet: ethers.Wallet,
  requesterrestrict?: string,
  workerpoolprice?: number = 1000,
  volume?: number = 1000
) => {
  const ethProvider = utils.getSignerFromPrivateKey(
    TEST_CHAIN.rpcURL,
    workerpoolOwnerWallet.privateKey
  );
  const iexec = new IExec({ ethProvider }, getTestIExecOption());
  const requiredStake = volume * workerpoolprice;
  await ensureSufficientStake(iexec, requiredStake);

  const workerpoolorder = await iexec.order.createWorkerpoolorder({
    workerpool,
    category: 0,
    requesterrestrict,
    volume,
    workerpoolprice,
    tag: ['tee', 'scone'],
  });
  const signedWorkerpoolorder =
    await iexec.order.signWorkerpoolorder(workerpoolorder);
  await iexec.order.publishWorkerpoolorder(signedWorkerpoolorder);
  return signedWorkerpoolorder;
};

export const addVoucherEligibleAsset = async (assetAddress, voucherTypeId) => {
  const voucherHubContract = new Contract(TEST_CHAIN.voucherHubAddress, [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'voucherTypeId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'asset',
          type: 'address',
        },
      ],
      name: 'addEligibleAsset',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]);

  const signer = TEST_CHAIN.voucherManagerWallet.connect(TEST_CHAIN.provider);
  const retryableAddEligibleAsset = async (tryCount = 1) => {
    try {
      const tx = await voucherHubContract
        .connect(signer)
        .addEligibleAsset(voucherTypeId, assetAddress);
      await tx.wait();
    } catch (error) {
      console.warn(
        `Error adding eligible asset to voucher (try count ${tryCount}):`,
        error
      );
      if (tryCount < 5) {
        await sleep(3000 * tryCount);
        await retryableAddEligibleAsset(tryCount + 1);
      } else {
        throw new Error(
          `Failed to add eligible asset to voucher after ${tryCount} attempts`
        );
      }
    }
  };
  await retryableAddEligibleAsset();
};

export const createVoucher = async ({
  owner,
  voucherType,
  value,
}: {
  owner: string;
  voucherType: ethers.BigNumberish;
  value: ethers.BigNumberish;
}) => {
  const VOUCHER_HUB_ABI = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'voucherType',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'createVoucher',
      outputs: [
        {
          internalType: 'address',
          name: 'voucherAddress',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'getVoucher',
      outputs: [
        {
          internalType: 'address',
          name: 'voucherAddress',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // deposit voucher value on VoucherHub with a random wallet
  const voucherSponsorWallet = Wallet.createRandom();
  const iexecVoucherSponsor = new IExec(
    {
      ethProvider: getSignerFromPrivateKey(
        TEST_CHAIN.rpcURL,
        voucherSponsorWallet.privateKey
      ),
    },
    { hubAddress: TEST_CHAIN.hubAddress }
  );
  // ensure RLC balance
  await setNRlcBalance(await iexecVoucherSponsor.wallet.getAddress(), value);

  // deposit RLC to voucherHub
  const contractClient =
    await iexecVoucherSponsor.config.resolveContractsClient();
  const iexecContract = contractClient.getIExecContract();

  try {
    await iexecContract.depositFor(TEST_CHAIN.voucherHubAddress, {
      value: BigInt(value) * 10n ** 9n,
      gasPrice: 0,
    });
  } catch (error) {
    console.error('Error depositing RLC:', error);
    throw error;
  }

  const voucherHubContract = new Contract(
    TEST_CHAIN.voucherHubAddress,
    VOUCHER_HUB_ABI,
    TEST_CHAIN.provider
  );

  const signer = TEST_CHAIN.voucherManagerWallet.connect(TEST_CHAIN.provider);

  const retryableCreateVoucher = async (tryCount = 1) => {
    try {
      const createVoucherTx = await voucherHubContract
        .connect(signer)
        .createVoucher(owner, voucherType, value);
      await createVoucherTx.wait();
    } catch (error) {
      console.warn(`Error creating voucher (try count ${tryCount}):`, error);
      if (tryCount < 3) {
        await sleep(3000 * tryCount);
        await retryableCreateVoucher(tryCount + 1);
      } else {
        throw new Error(`Failed to create voucher after ${tryCount} attempts`);
      }
    }
  };
  await retryableCreateVoucher();

  let signedDebugWorkerpoolorder;
  let signedProdWorkerpoolorder;
  try {
    const workerpoolprice = 1000;
    signedDebugWorkerpoolorder = await createAndPublishWorkerpoolOrder(
      TEST_CHAIN.debugWorkerpool,
      TEST_CHAIN.debugWorkerpoolOwnerWallet,
      owner,
      workerpoolprice
    );
    signedProdWorkerpoolorder = await createAndPublishWorkerpoolOrder(
      TEST_CHAIN.prodWorkerpool,
      TEST_CHAIN.prodWorkerpoolOwnerWallet,
      owner,
      workerpoolprice
    );
  } catch (error) {
    console.error('Error publishing workerpoolorder:', error);
    throw error;
  }

  try {
    const voucherAddress = await voucherHubContract.getVoucher(owner);
    return {
      voucherAddress,
      signedDebugWorkerpoolorder,
      signedProdWorkerpoolorder,
    };
  } catch (error) {
    console.error('Error getting voucher:', error);
    throw error;
  }
};
