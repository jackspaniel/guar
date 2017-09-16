// express middleware - calls all APIs in parallel (inlcuding those added by the app-level preData middleware)

module.exports = function(app, config) {
  const debug = config.customDebug('guar->rest-api->index');

  // TODO - why do these need to be here for customDebug to work?
  // set in app.locals to avoid circular reference from the two depending on each other
  app.locals.sequential = require('./sequential')(app, config);
  app.locals.parallel = require('./parallel')(app, config);

  return function(req, res, next) {
    debug("guar->rest-api middleware");
    
    if (Array.isArray(req.nodule.apiCalls)) 
      app.locals.sequential(req.nodule.apiCalls, req, res, next);
    else
      app.locals.parallel(req.nodule.apiCalls, req, res, next);
  };
};