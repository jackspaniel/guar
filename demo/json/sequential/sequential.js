// sequential calls example

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/seq'],
  
    // // use array for sequential calls
    apiCalls: [
      {path: '/api/cms/home', handler: 'cmsHandler'},
      {path: '/api/getdata/kitchensink', handler: 'kitchenSinkHandler'},
    ],
  
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 
    },

    cmsHandler: function(apiResponse, req, res) {
      this.debug('cmsHandler!!!');

      apiResponse.testSequential = 'xxx';

      this.apiCalls[1].params = {userId: apiResponse.userId};
    },
    
    kitchenSinkHandler: function(apiResponse, req, res) {
      this.debug('kitchenSinkHandler!!!');

      apiResponse.testSequential2 = 'yyyy';

      this.apiCalls.push({path: '/api/getdata/somecall', params: {userId2: 'zzzzz'}});
    },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      if (req.query.testError) {
        this.error = 'Kitchen Sink Test Error!';
        return;
      }

      res.guar.renderData = {
        data1: res.guar.data1,
        data2: res.guar.data2,
        data3: res.guar.data3,
      };
    }
  };
};