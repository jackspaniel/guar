// FEATURES DEMONSTRATED:

// parallel API calls
// setting API query parameters at boot time and run time
// adding parallel API call at run time
// adding custom headers to API call at run time

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/par'],
  
    // use JS object for parallel calls, array for sequential
    // these are set at bootup time
    apiCalls: {
      cms: {path: '/api/cms/home'}, 
      kitchensink: {path: '/api/getdata/kitchensink', params:{staticParam: 'test1'}}, // added static param at bootup time
      somecall: {path: '/api/getdata/somecall/'},
    },
    
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding apiCall custom headers at run time
      this.apiCalls.kitchensink.customHeaders = [{name: 'x-test', value: 'success'}]; 
      
      // demonstrate adding api query param at run time
      this.apiCalls.kitchensink.params.myParam = 'test2';

      // demonstrate adding API call at run time
      this.apiCalls.someothercall = {path: '/api/getdata/someothercall/'};
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // object sent back to browser
      res.guar.renderData = {
        data1: res.guar.cms,
        data2: res.guar.kitchensink,
        data3: res.guar.somecall,
        data4: res.guar.someothercall,
      };
    }
  };
};