// FEATURES DEMONSTRATED:

// sequential calls
// optional custom handlers after each call
// adding custom headers to one API call at run time
// manipulating response data from first call
// using output from first call as input to the next call
// add 3rd sequential call at run time in handler for second call - could be conditional

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/seq'],
  
    // use array for sequential calls, object for parallel
    // these are set at bootup time
    apiCalls: [
      {path: '/api/cms/home', handler: 'cmsHandler'},
      {path: '/api/getdata/kitchensink', handler: 'kitchenSinkHandler'},
    ],
  
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding custom headers to one call at run time
      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 
    },

    // handler called after 1st sequential call
    cmsHandler: function(apiResponse, req, res) {
      this.debug('cmsHandler!!!');

      // demonstrate manipulating call response data
      apiResponse.testSequential = 'xxx';

      // demonstrate input to second call from output of first call
      this.apiCalls[1].params = {userId: apiResponse.userId};
    },
    
    // handler called after 2nd sequential call
    kitchenSinkHandler: function(apiResponse, req, res) {
      this.debug('kitchenSinkHandler!!!');

      apiResponse.testSequential2 = 'yyyy';

      // demonstrate pushing another sequential call onto the stack at run time
      this.apiCalls.push({path: '/api/getdata/somecall', params: {userId2: 'zzzzz'}});
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // return data from all calls - this will change to res.locals.data1, etc.
      res.locals.responseData = {
        data1: res.locals.data1,
        data2: res.locals.data2,
        data3: res.locals.data3,
      };
    }
  };
};