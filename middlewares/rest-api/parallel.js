// calls all APIs in parallel (inlcuding those added by the app-level preData middleware)
const _ = require('lodash');

module.exports = function(app, config) {
  const debug = config.customDebug('guar->rest-api->parallel init');

  const api = require('./api.js')(app, config);

  return function(apiCalls, req, res, next, handler) {
    debug("parallel middleware");
    
    if (!_.isEmpty(apiCalls)) {

      const callArray = [];
      Object.keys(apiCalls).forEach(function(key, index) {
        const call = apiCalls[key];
        
        // add namespace incrementation to sequential calls
        if (Array.isArray(call)) {
          call.forEach((seqCall, index) => {
            seqCall.namespace = seqCall.namespace || key + (index+1);
          });
        }
        else {
          call.namespace = call.namespace || key;
        }
      
        callArray.push(call);
      });

      parallelApis(callArray, req, res, next, handler);
    }
    else {
      next();
    }
  };

  // invokes N number of api calls, then invokes the express next() when all have returned or one returns an error
  function parallelApis(apiCalls, req, res, next, handler) {
    debug('parallelApis started!! # calls:' + apiCalls.length);

    let resultCount = 1;
    apiCalls.forEach(function(apiCall){

      if (Array.isArray(apiCall)) {
        app.locals.sequential(apiCall, req, res, (err) => {
          if (err) 
            next(err); // send into express error flow
          else if (resultCount++ === apiCalls.length) 
            finishParallel(apiCalls, req, res, next, handler);
        });
      }
      else {
        api.getData(apiCall, req, res, function(err){
          if (err)
            next(err); // if any error - send full request into error flow, exit out of parallelApi calls
          else if (resultCount++ === apiCalls.length)
            finishParallel(apiCalls, req, res, next, handler);
        });
      }
    });
  }

  function finishParallel(apiCalls, req, res, next, handler) {
    debug('parallelApis done!!');
      
    // handler lives at same level as calls array so it must be dealth with here not api.js (used in sequential/parallel hybrid)
    if (handler && req.nodule[handler]) {
      
      let results = {};
      apiCalls.forEach(apiCall => {
        console.log(res);
        results[apiCall.namespace] = res.locals[apiCall.namespace]; 
      });

      req.nodule[handler](results, req, res);
    }
    
    next(); // if all calls return successfully call the express next()

  }
};
