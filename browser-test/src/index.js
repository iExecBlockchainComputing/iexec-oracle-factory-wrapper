import { IExecOracleFactory, IExecOracleReader, utils } from '../../dist';
import './styles.css';

const init = async () => {
  try {
    let ethProvider;

    if (window.ethereum) {
      console.log('using default provider');
      ethProvider = window.ethereum;
    } else {
      throw Error('Missing MetaMask');
    }

    await ethProvider.enable();

    const factory = new IExecOracleFactory(ethProvider);

    document
      .getElementById('test-params-button')
      .addEventListener('click', () => {
        const out = document.getElementById('test-params-out');
        out.value = '';
        out.classList.remove('error');
        utils
          .testRawParams({
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
                  document.getElementById('test-params-headers-input').value,
                )) ||
              {},
          })
          .then((res) => {
            out.value = res;
          })
          .catch((e) => {
            out.classList.add('error');
            out.value = e.toString();
          });
      });

    document
      .getElementById('create-oracle-button')
      .addEventListener('click', () => {
        const out = document.getElementById('create-oracle-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .createOracle({
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
                  document.getElementById('create-oracle-headers-input').value,
                )) ||
              {},
          })
          .subscribe({
            error: (e) => {
              out.classList.add('error');
              out.value += 'ERROR\n';
              out.value += e.toString();
              if (e.originalError) {
                out.value += `\n${e.originalError.toString()}`;
              }
            },
            next: (value) => {
              const { message, ...rest } = value;
              out.value += `${message}\n${Object.entries(rest)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join('\n')}${Object.entries(rest).length > 0 ? '\n\n' : '\n'}`;
            },
            complete: () => {
              out.value += 'COMPLETE';
            },
          });
      });

    document
      .getElementById('update-oracle-from-params-button')
      .addEventListener('click', () => {
        const out = document.getElementById('update-oracle-from-params-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .updateOracle(
            {
              dataset: document.getElementById(
                'update-oracle-from-params-dataset-input',
              ).value,
              url: document.getElementById(
                'update-oracle-from-params-url-input',
              ).value,
              method: document.getElementById(
                'update-oracle-from-params-method-input',
              ).value,
              body: document.getElementById(
                'update-oracle-from-params-body-input',
              ).value,
              JSONPath: document.getElementById(
                'update-oracle-from-params-jsonpath-input',
              ).value,
              dataType: document.getElementById(
                'update-oracle-from-params-datatype-input',
              ).value,
              headers:
                (document.getElementById(
                  'update-oracle-from-params-headers-input',
                ).value &&
                  JSON.parse(
                    document.getElementById(
                      'update-oracle-from-params-headers-input',
                    ).value,
                  )) ||
                {},
            },
            { workerpool: '0xAd0b7eFEc0ABF34421B668ea7bCadaC12Dd97541' }, // viviani prod pool
          )
          .subscribe({
            error: (e) => {
              out.classList.add('error');
              out.value += 'ERROR\n';
              out.value += e.toString();
              if (e.originalError) {
                out.value += `\n${e.originalError.toString()}`;
              }
            },
            next: (value) => {
              const { message, ...rest } = value;
              out.value += `${message}\n${Object.entries(rest)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join('\n')}${Object.entries(rest).length > 0 ? '\n\n' : '\n'}`;
            },
            complete: () => {
              out.value += 'COMPLETE';
            },
          });
      });

    document
      .getElementById('update-oracle-from-cid-button')
      .addEventListener('click', () => {
        const out = document.getElementById('update-oracle-from-cid-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .updateOracle(
            document.getElementById('update-oracle-from-cid-cid-input').value,
            { workerpool: '0xAd0b7eFEc0ABF34421B668ea7bCadaC12Dd97541' }, // viviani prod pool
          )
          .subscribe({
            error: (e) => {
              out.classList.add('error');
              out.value += 'ERROR\n';
              out.value += e.toString();
              if (e.originalError) {
                out.value += `\n${e.originalError.toString()}`;
              }
            },
            next: (value) => {
              const { message, ...rest } = value;
              out.value += `${message}\n${Object.entries(rest)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join('\n')}${Object.entries(rest).length > 0 ? '\n\n' : '\n'}`;
            },
            complete: () => {
              out.value += 'COMPLETE';
            },
          });
      });

    document
      .getElementById('read-oracle-from-params-button')
      .addEventListener('click', () => {
        const out = document.getElementById('read-oracle-from-params-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .readOracle({
            dataset: document.getElementById(
              'read-oracle-from-params-dataset-input',
            ).value,
            url: document.getElementById('read-oracle-from-params-url-input')
              .value,
            method: document.getElementById(
              'read-oracle-from-params-method-input',
            ).value,
            body: document.getElementById('read-oracle-from-params-body-input')
              .value,
            JSONPath: document.getElementById(
              'read-oracle-from-params-jsonpath-input',
            ).value,
            dataType: document.getElementById(
              'read-oracle-from-params-datatype-input',
            ).value,
            headers:
              (document.getElementById('read-oracle-from-params-headers-input')
                .value &&
                JSON.parse(
                  document.getElementById(
                    'read-oracle-from-params-headers-input',
                  ).value,
                )) ||
              {},
          })
          .then((res) => {
            out.value += JSON.stringify(res);
          })
          .catch((e) => {
            out.classList.add('error');
            out.value += e.toString();
          });
      });

    document
      .getElementById('read-oracle-from-cid-button')
      .addEventListener('click', () => {
        const out = document.getElementById('read-oracle-from-cid-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .readOracle(
            document.getElementById('read-oracle-from-cid-cid-input').value,
          )
          .then((res) => {
            out.value += JSON.stringify(res);
          })
          .catch((e) => {
            out.classList.add('error');
            out.value += e.toString();
          });
      });

    document
      .getElementById('read-oracle-from-oracleid-button')
      .addEventListener('click', () => {
        const out = document.getElementById('read-oracle-from-oracleid-out');
        out.value = '';
        out.classList.remove('error');
        factory
          .readOracle(
            document.getElementById('read-oracle-from-oracleid-oracleid-input')
              .value,
            {
              dataType: document.getElementById(
                'read-oracle-from-oracleid-datatype-input',
              ).value,
            },
          )
          .then((res) => {
            out.value += JSON.stringify(res);
          })
          .catch((e) => {
            out.classList.add('error');
            out.value += e.toString();
          });
      });

    document
      .getElementById('read-x-chain-oracle-from-oracleid-button')
      .addEventListener('click', async () => {
        const provider =
          document.getElementById(
            'read-x-chain-oracle-from-oracleid-provider-input',
          ).value || 'injected';
        const out = document.getElementById(
          'read-x-chain-oracle-from-oracleid-out',
        );
        out.value = '';
        out.classList.remove('error');
        out.value += `reading value with provider ${provider}\n`;
        try {
          const reader = new IExecOracleReader(
            provider === 'injected' ? ethProvider : provider,
          );
          const res = await reader.readOracle(
            document.getElementById(
              'read-x-chain-oracle-from-oracleid-oracleid-input',
            ).value,
            {
              dataType: document.getElementById(
                'read-x-chain-oracle-from-oracleid-datatype-input',
              ).value,
            },
          );

          out.value += JSON.stringify(res);
        } catch (e) {
          out.classList.add('error');
          out.value += e.toString();
        }
      });

    console.log('initialized');
  } catch (e) {
    console.log('failed to init', e);
  }
};

init();
