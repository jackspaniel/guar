// FEATURES DEMONSTRATED:

// sequential with nested parallel calls 
// custom handler defined as sibling of parallelCalls array
// manipulating data on both nested parallel calls when done, but before second call in the sequence is executed
// using the output of the first nested sequential call as input for the second
// adding another sequential call at run time (could be conditional based on previous results)

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/seq_par'],
  
    // example of embedding parallel calls as step 1 of a sequential array
    apiCalls: [
      { 
        handler: 'cmsHandler', 
        parallelCalls: {
          cms1: {path: '/api/cms/home'},
          cms2: {path: '/api/cms/home2'}
        }
      },
      {path: '/api/getdata/kitchensink', handler: 'kitchenSinkHandler'},
    ],
  
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding custom headers to one call at run time
      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 
    },

    // handler called after 1st call in sequence (which is actually two parallel calls)
    cmsHandler: function(apiResponse, req, res) {
      this.debug('cmsHandler!!!');

      // demonstrate manipulating call response data
      apiResponse.cms1.showHandler = 'this should be in the first parallel call';
      apiResponse.cms2.showHandler = 'this should be in the second parallel call';

      // demonstrate input to second call from output of first call
      this.apiCalls[1].params = {userId: apiResponse.cms2.userId};
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
        cms1: res.locals.cms1,
        cms2: res.locals.cms2,
        data1: res.locals.data1,
        data2: res.locals.data2,
        data3: res.locals.data3,
      };
    }
  };
};