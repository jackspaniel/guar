// calls all APIs in sequence

module.exports = function(app, config) {
  const debug = config.customDebug('guar->rest-api->sequential');

  const api = require('./api.js')(app, config);

  // called as route comes in, before it goes to API
  return function(apiCalls, req, res, next) {
    debug("sequential middleware");
    
    if (apiCalls.length > 0)
      sequentialApis(apiCalls, req, res, next, 1);
    else
      next();
  };

  // recursively invokes all sequential api calls, 
  // then invokes the express next() when all are succesful or one has an error
  function sequentialApis(apiCalls, req, res, next, callIndex) {
    debug('sequentialApis started!! call # ' + callIndex + ' out of ' + apiCalls.length);
 
    if (apiCalls.length >= callIndex) {
      let apiCall = apiCalls[callIndex-1];
      apiCall.namespace = apiCall.namespace || 'data' + (callIndex);

      api.getData(apiCall, req, res, (err) => {
        if (err) 
          next(err); // send into express error flow
        else 
          sequentialApis(apiCalls, req, res, next, callIndex+1);
      });
    }
    else { 
      debug('sequential APIs done!!');
      next();
    }
  }
};