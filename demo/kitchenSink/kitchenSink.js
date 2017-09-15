// EXHAUSTIVE EXAMPLE NODULE - attempts to incorporate as many guar features as possible 

// FEATURES DEMONSTRATED:
// multiple routes (nodulejs functionality)
// multiple APIs
// adding static API params at nodule init time
// adding API params to existing params obejct at request time
// adding API params by creating new params obejct at request time
// "magic" templateName based on this filename
// alternate templateName
// alternate templateName with path to folder
// "magic" stubPath based on this filename
// stubPath defined
// adding API call at request time
// "magic" adding :id route wildcard to API path ending in / (common REST paradigm)
// custom API headers 
// alternate API host
// custom API timeout
// force content type json
// "throw" error from postProcessor (app calls next(nodule.error))

// see submitForm.js for POST example, also see getData.js, getSpecificData.js, homePage.js, 404.js

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/kitchensink', '/bathroomtub/:id'],
  
    // use JS object for parallel calls
    apiCalls: {
      cms: {path: '/api/cms/home'}, 
      kitchensink: {path: '/api/getdata/kitchensink', params:{staticParam: 'test1'}},
      somecall: {path: '/api/getdata/somecall/', useStub: true},
      someothercall: {path: '/api/getdata/someothercall/', useStub: true, stubPath: 'altKitchenSink'} 
    },
    
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding apiCall custom headers at run time
      this.apiCalls.kitchensink.customHeaders = [{name: 'x-test', value: 'success'}]; 

      // test "magic" adding :id when api path ends with /
      // also testing adding apiCall at request-time
      if (req.path.indexOf('bathroomtub') > -1) this.apiCalls.bathroomtub = {path: '/api/getdata/'}; 

      // adding query params two different ways (in real life don't forget to sanitize query params!)
      if (req.query.myParam) {
        this.apiCalls.cms.params = {myParam: req.query.myParam}; // creating API params object because it hasn't been defined yet
        this.apiCalls.kitchensink.params.myParam = req.query.myParam; // adding to existing API params
      }

      // setting alternamte template name
      if (req.query.altTemplateName) this.templateName = 'altKitchenSink.jade';

      // setting alternamte template path (app starts looking from process.cwd() by default)
      if (req.query.altTemplatePath) this.templateName = './demo/homePage/altTemplatePath.jade';

      // setting alternamte api host
      if (req.query.altApiHost) this.apiCalls.kitchensink.host = 'localhost:'+req.headers.host.split(':')[1]; 
      
      // setting alternatte API timeout
      if (req.query.apiTimeout) this.apiCalls.kitchensink.timeout = 1; 
      
      // changing content type to JSON at request-time
      if (req.query.forceJson) this.contentType = 'json'; 
    },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      if (req.query.testError) {
        this.error = 'Kitchen Sink Test Error!';
        return;
      }

      res.guar.renderData = {
        data1: res.guar.cms,
        data2: res.guar.kitchensink,
        data3: res.guar.somecall,
        data4: res.guar.someothercall,
        data5: res.guar.bathroomtub,
      };
    }
  };
};