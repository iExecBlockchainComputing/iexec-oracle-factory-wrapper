import Debug from 'debug';

const debug = Debug('iexec-oracle-factory-wrapper');

const getLogger = (namespace) => debug.extend(namespace);

export default getLogger;
