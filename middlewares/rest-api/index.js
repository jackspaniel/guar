// express middleware - calls all APIs in parallel (inlcuding those added by the app-level preData middleware)

module.exports = function(app, config) {
  const debug = config.customDebug('guar->rest-api->index');

  // TODO - why do these need to be here for customDebug to work?
  const parallel = require('./parallel')(app, config);
  const sequential = require('./sequential')(app, config);

  return function(req, res, next) {
    debug("guar->rest-api middleware");
    
    if (Array.isArray(req.nodule.apiCalls)) 
      sequential(req.nodule.apiCalls, req, res, next);
    else
      parallel(req.nodule.apiCalls, req, res, next);
  };
};