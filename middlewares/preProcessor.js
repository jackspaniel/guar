// wraps nodule.preProcessor, called after app-level start middleware

module.exports = function(app, config) {
  return function(req, res, next) {
    config.customDebug('guar-preData')('called');

    req.nodule.preProcessor(req, res);

    next();
  };
};