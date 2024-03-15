export const getOutput = (elementId) => {
  const out = document.getElementById(elementId);
  const log = (msg = '') => (out.value += msg);
  const clear = () => {
    out.value = '';
    out.classList.remove('error');
    out.classList.remove('success');
  };
  const success = (msg = '') => {
    out.classList.add('success');
    log(msg);
  };
  const error = (msg = '') => {
    out.classList.add('error');
    log(msg);
  };

  clear();

  return {
    clear,
    info: log,
    success,
    error,
  };
};

export const formatObservableData = (data) => {
  const { message, ...rest } = data;
  return `${message}\n${Object.entries(rest)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')}${Object.entries(rest).length > 0 ? '\n\n' : '\n'}`;
};

export const formatObservableError = (error) => {
  let message = `ERROR\n${error.toString()}`;
  if (error.originalError) {
    message += `\n${error.originalError.toString()}`;
  }
  return message;
};

export const setInitError = (error) => {
  const out = document.getElementById('init-error');
  out.innerText = error;
};
