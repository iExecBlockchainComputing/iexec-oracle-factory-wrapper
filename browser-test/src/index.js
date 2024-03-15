import {
  IExecOracleFactory,
  IExecOracleReader,
  utils,
} from '@iexec/iexec-oracle-factory-wrapper';

import {
  getOutput,
  formatObservableData,
  formatObservableError,
  setInitError,
} from './helpers.js';

const init = async () => {
  try {
    let ethProvider;

    if (window.ethereum) {
      console.log('using default provider window.ethereum');
      ethProvider = window.ethereum;
    } else {
      throw Error('Missing injected provider `window.ethereum`');
    }

    await ethProvider.enable();

    const oracleFactory = new IExecOracleFactory(ethProvider);

    document
      .getElementById('test-params-button')
      .addEventListener('click', async () => {
        const out = getOutput('test-params-out');

        try {
          const rawParams = {
            apiKey: document.getElementById('test-params-apikey-input').value,
            url: document.getElementById('test-params-url-input').value,
            method: document.getElementById('test-params-method-input').value,
            body: document.getElementById('test-params-body-input').value,
            JSONPath: document.getElementById('test-params-jsonpath-input')
              .value,
            dataType: document.getElementById('test-params-datatype-input')
              .value,
            headers:
              (document.getElementById('test-params-headers-input').value &&
                JSON.parse(
                  document.getElementById('test-params-headers-input').value
                )) ||
              {},
          };

          const res = await utils.testRawParams(rawParams);
          out.success(res);
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('create-oracle-button')
      .addEventListener('click', () => {
        const out = getOutput('create-oracle-out');

        try {
          const rawParams = {
            apiKey: document.getElementById('create-oracle-apikey-input').value,
            url: document.getElementById('create-oracle-url-input').value,
            method: document.getElementById('create-oracle-method-input').value,
            body: document.getElementById('create-oracle-body-input').value,
            JSONPath: document.getElementById('create-oracle-jsonpath-input')
              .value,
            dataType: document.getElementById('create-oracle-datatype-input')
              .value,
            headers:
              (document.getElementById('create-oracle-headers-input').value &&
                JSON.parse(
                  document.getElementById('create-oracle-headers-input').value
                )) ||
              {},
          };

          oracleFactory.createOracle(rawParams).subscribe({
            error: (e) => {
              out.error(formatObservableError(e));
            },
            next: (data) => {
              out.info(formatObservableData(data));
            },
            complete: () => {
              out.success('COMPLETE');
            },
          });
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('update-oracle-from-params-button')
      .addEventListener('click', () => {
        const out = getOutput('update-oracle-from-params-out');

        try {
          const paramSet = {
            dataset: document.getElementById(
              'update-oracle-from-params-dataset-input'
            ).value,
            url: document.getElementById('update-oracle-from-params-url-input')
              .value,
            method: document.getElementById(
              'update-oracle-from-params-method-input'
            ).value,
            body: document.getElementById(
              'update-oracle-from-params-body-input'
            ).value,
            JSONPath: document.getElementById(
              'update-oracle-from-params-jsonpath-input'
            ).value,
            dataType: document.getElementById(
              'update-oracle-from-params-datatype-input'
            ).value,
            headers:
              (document.getElementById(
                'update-oracle-from-params-headers-input'
              ).value &&
                JSON.parse(
                  document.getElementById(
                    'update-oracle-from-params-headers-input'
                  ).value
                )) ||
              {},
          };

          oracleFactory.updateOracle(paramSet).subscribe({
            error: (e) => {
              out.error(formatObservableError(e));
            },
            next: (data) => {
              out.info(formatObservableData(data));
            },
            complete: () => {
              out.success('COMPLETE');
            },
          });
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('update-oracle-from-cid-button')
      .addEventListener('click', () => {
        const out = getOutput('update-oracle-from-cid-out');

        try {
          const paramSetCid = document.getElementById(
            'update-oracle-from-cid-cid-input'
          ).value;

          oracleFactory.updateOracle(paramSetCid).subscribe({
            error: (e) => {
              out.error(formatObservableError(e));
            },
            next: (data) => {
              out.info(formatObservableData(data));
            },
            complete: () => {
              out.success('COMPLETE');
            },
          });
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('update-oracle-x-chain-button')
      .addEventListener('click', () => {
        const out = getOutput('update-oracle-x-chain-out');

        try {
          const paramSetCid = document.getElementById(
            'update-oracle-x-chain-cid-input'
          ).value;

          const targetBlockchains = document.getElementById(
            'update-oracle-x-chain-target-input'
          ).value;

          oracleFactory
            .updateOracle(paramSetCid, {
              targetBlockchains: JSON.parse(targetBlockchains),
            })
            .subscribe({
              error: (e) => {
                out.error(formatObservableError(e));
              },
              next: (data) => {
                out.info(formatObservableData(data));
              },
              complete: () => {
                out.success('COMPLETE');
              },
            });
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('read-oracle-from-params-button')
      .addEventListener('click', async () => {
        const out = getOutput('read-oracle-from-params-out');

        try {
          const paramSet = {
            dataset: document.getElementById(
              'read-oracle-from-params-dataset-input'
            ).value,
            url: document.getElementById('read-oracle-from-params-url-input')
              .value,
            method: document.getElementById(
              'read-oracle-from-params-method-input'
            ).value,
            body: document.getElementById('read-oracle-from-params-body-input')
              .value,
            JSONPath: document.getElementById(
              'read-oracle-from-params-jsonpath-input'
            ).value,
            dataType: document.getElementById(
              'read-oracle-from-params-datatype-input'
            ).value,
            headers:
              (document.getElementById('read-oracle-from-params-headers-input')
                .value &&
                JSON.parse(
                  document.getElementById(
                    'read-oracle-from-params-headers-input'
                  ).value
                )) ||
              {},
          };

          const res = await oracleFactory.readOracle(paramSet);
          out.success(JSON.stringify(res));
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('read-oracle-from-cid-button')
      .addEventListener('click', async () => {
        const out = getOutput('read-oracle-from-cid-out');

        try {
          const paramSetCid = document.getElementById(
            'read-oracle-from-cid-cid-input'
          ).value;

          const res = await oracleFactory.readOracle(paramSetCid);
          out.success(JSON.stringify(res));
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('read-oracle-from-oracleid-button')
      .addEventListener('click', async () => {
        const out = getOutput('read-oracle-from-oracleid-out');

        try {
          const oracleId = document.getElementById(
            'read-oracle-from-oracleid-oracleid-input'
          ).value;

          const dataType = document.getElementById(
            'read-oracle-from-oracleid-datatype-input'
          ).value;

          const res = await oracleFactory.readOracle(oracleId, { dataType });
          out.success(JSON.stringify(res));
        } catch (e) {
          out.error(e.toString());
        }
      });

    document
      .getElementById('read-x-chain-oracle-from-oracleid-button')
      .addEventListener('click', async () => {
        const out = getOutput('read-x-chain-oracle-from-oracleid-out');

        try {
          const provider = document.getElementById(
            'read-x-chain-oracle-from-oracleid-provider-input'
          ).value;

          const oracleId = document.getElementById(
            'read-x-chain-oracle-from-oracleid-oracleid-input'
          ).value;

          const dataType = document.getElementById(
            'read-x-chain-oracle-from-oracleid-datatype-input'
          ).value;

          const oracleReader = provider
            ? new IExecOracleReader(provider)
            : oracleFactory;

          const res = await oracleReader.readOracle(oracleId, { dataType });
          out.success(JSON.stringify(res));
        } catch (e) {
          out.error(e.toString());
        }
      });

    console.log('initialized');
  } catch (e) {
    console.log('failed to initialize', e);
    setInitError(`Failed to initialize: ${e.message}`);
  }
};

init();
