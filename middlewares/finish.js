// called last in middleware chain, sends response to client

module.exports = function(app, config) {

  return function(req, res, next) {
    config.customDebug('guar->finish')('called');

    res.json(res.locals.responseData);
  };
};
