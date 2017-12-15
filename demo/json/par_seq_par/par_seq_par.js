// FEATURES DEMONSTRATED:

// parallel API calls with nested sequential calls with a nested parallel call inside that

module.exports = function(app) {
  return {

    route: ['/json/par_seq_par'],
  
    apiCalls: {
      
      cms: [
        {path: '/api/cms/home', handler:'cmsHomeHandler'},
        {path: '/api/cms/home2'}
      ], 
      
      kitchensink: {path: '/api/getdata/kitchensink', params:{staticParam: 'test1'}}, // adding static param at bootup time
    },
    
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding apiCall custom headers at run time
      this.apiCalls.kitchensink.customHeaders = [{name: 'x-test', value: 'success'}]; 
      
      // demonstrate adding api query param at run time
      this.apiCalls.kitchensink.params.myParam = 'test2';

      // demonstrate adding parallel API call at run time, which is actually two nested sequential calls
      // also demonstrate custom namespaces (instead of auto-generated based on parent namespace)
      this.apiCalls.somecalls = [
        {path: '/api/getdata/somecall/', handler:'someCallsHandler', namespace:'myCustomNamespace'}
      ];
    },
    
    // called after first cms nested sequential call
    cmsHomeHandler: function(apiResponse, req, res) {
      this.debug('cmsHomeHandler called');

      // demonstrate using output of 1st cms nested sequential call is input for the second
      this.apiCalls.cms[1].params = {userIdFromFirstCall: apiResponse.userId};
    },

    // called after first somecalls nested sequential call
    someCallsHandler: function(apiResponse, req, res) {
      this.debug('someCallsHandler called');

      // demonstrate adding second nested sequential call after response from first call (could be added conditionally)
      this.apiCalls.somecalls.push({ 
        parallelCalls: {
          superNestedParallel1: {path: '/api/getdata/someothercall/'},
          superNestedParallel2: {path: '/api/getdata/somecall/'}
        }
      });
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // object sent back to browser
      res.locals.responseData = {
        cms1: res.locals.cms1,
        cms2: res.locals.cms2,
        kitchensink: res.locals.kitchensink,
        myCustomNamespace: res.locals.myCustomNamespace,
        superNestedParallel1: res.locals.superNestedParallel1,
        superNestedParallel2: res.locals.superNestedParallel2,
      };
    }
  };
};