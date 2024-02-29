export const READ_ABI = [
  {
    inputs: [],
    name: 'm_authorizedApp',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'm_authorizedDataset',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'm_authorizedWorkerpool',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'm_requiredtag',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'm_requiredtrust',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_oracleId',
        type: 'bytes32',
      },
    ],
    name: 'getString',
    outputs: [
      {
        internalType: 'string',
        name: 'stringValue',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'date',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_oracleId',
        type: 'bytes32',
      },
    ],
    name: 'getRaw',
    outputs: [
      {
        internalType: 'bytes',
        name: 'bytesValue',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'date',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_oracleId',
        type: 'bytes32',
      },
    ],
    name: 'getInt',
    outputs: [
      {
        internalType: 'int256',
        name: 'intValue',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: 'date',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_oracleId',
        type: 'bytes32',
      },
    ],
    name: 'getBool',
    outputs: [
      {
        internalType: 'bool',
        name: 'boolValue',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'date',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
