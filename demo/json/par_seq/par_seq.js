// FEATURES DEMONSTRATED:

// parallel API calls with nested sequential calls
// custom handlers to be called between nested sequential calls
// auto-generated sequential call namespace
// manually-specified nested sequential call namespace
// adding nested sequential calls at run time
// adding a nested sequential call conditionally after receiving a response from the first

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/par_seq'],
  
    // use JS object for parallel calls, array for sequential
    // these are set at bootup time
    apiCalls: {
      
      // sequential calls nested in parallel
      // namespace is auto-generated from parent namespace: cms1, cms2, etc.
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
      this.apiCalls.somecalls.push({path: '/api/getdata/someothercall/', namespace:'rufus'});
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // object sent back to browser
      res.guar.renderData = {
        cms1: res.guar.cms1,
        cms2: res.guar.cms2,
        kitchensink: res.guar.kitchensink,
        myCustomNamespace: res.guar.myCustomNamespace,
        rufus: res.guar.rufus,
      };
    }
  };
};