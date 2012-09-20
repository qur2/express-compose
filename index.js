module.exports = process.env.COMPOSE_COV
  ? require('./lib-cov/compose')
  : require('./lib/compose');
