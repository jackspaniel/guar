// calls all APIs in parallel (inlcuding those added by the app-level preData middleware)
var _ = require('lodash');

module.exports = function(app, config) {
  var debug = config.customDebug('guar->rest-api->parallel init');

  var api = require('./api.js')(app, config);

  return function(apiCalls, req, res, next) {
    debug("parallel middleware");
    
    if (!_.isEmpty(apiCalls)) {

      const callArray = [];
      Object.keys(apiCalls).forEach(function(key, index) {
        apiCalls[key].namespace = key;
        callArray.push(apiCalls[key]);
      });

      parallelApis(callArray, req, res, next);
    }
    else {
      next();
    }
  };

  // invokes N number of api calls, then invokes the express next() when all have returned or one returns an error
  function parallelApis(apiCalls, req, res, next) {
    debug('parallelApis started!! # calls:' + apiCalls.length);

    var results = 1;
    apiCalls.forEach(function(apiCall){
      api.getData(apiCall, req, res, function(err){
        if (err) { 
          next(err); // if any error - send full request into error flow, exit out of parallelApi calls
          return;
        }

        if (results++ === apiCalls.length) {
          debug('parallelApis done!!');
          next(); // if all calls return successfully call the express next()
        }
      });
    });
  }
};
