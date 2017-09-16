// BASIC JSON RESPONSE EXAMPLE

// FEATURES DEMONSTRATED:
// "magic" adding :id route wildcard to API path ending in / (common REST paradigm)
// adding API params at request time
// pre and post API business logic
// creting res.locals.responseData object which is sent to client as JSON response

// for more demonstration of guar features - see kitchenSink.js, homePage.js, getSpecifcData.js, 404.js, submitForm.js

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route : '/json/getData/:id',       

    // MAGIC ALERT: if the api path ends in a / the framework appends :id (req.params.id) from the route
    apiCalls: {
      data1: {path: '/api/getdata/'},
    },

    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // business logic before API calls are made

      this.apiCalls.data1.params = {myParam: req.query.myParam}; // in real life don't forget to sanitize query params!
   },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // business logic after all API calls return, before sending res.locals.responseData to client in res.send()

      // sent as JSON to client
      res.locals.responseData = {
        systemMsg: res.locals.data1.systemMsg,
        msg: res.locals.data1.msg
      };
    }
  };
};