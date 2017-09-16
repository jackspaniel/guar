// sequential with nested parallel calls example

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
      res.guar.renderData = {
        cms1: res.guar.cms1,
        cms2: res.guar.cms2,
        data1: res.guar.data1,
        data2: res.guar.data2,
        data3: res.guar.data3,
      };
    }
  };
};