// BASIC FORM SUBMIT EXAMPLE

// FEATURES DEMONSTRATED:
// setting route verb to POST
// setting API verb to POST
// setting api body request type to 'form' ('form'=url-encoded, 'json'=json body)
// adding API params at request time
// pre and post API business logic
// creting res.locals.responseData object which is sent to client as JSON

// for more demonstration of guar features - see getSpecificData.js, getData.js, 404.js

var _ = require('lodash');

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route : '/json/submitForm',  

    routeVerb: 'post', // default = get       
    
    apiCalls: { data1: {
      path: '/api/submitform',
      verb: 'post',
      bodyType: 'form', // default = 'json'
    }},

    preProcessor: function(req, res) {
      this.debug('preProcessor called');
      
      // process request parameters, do business logic here before calling API(s)

      // in real life don't forget to sanitize query params!
      if (!_.isEmpty(req.body)) {
        // change form body type sent to API
        if (req.body.doJson) this.apiCalls.data1.bodyType = 'json';

        this.apiCalls.data1.params = req.body; // JSON body
      }
      else {
        this.apiCalls.data1.params = req.query; // url-encoded
      }
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // process API results here before sending data to jade/client
      
      res.locals.responseData = {
        response: res.locals.data1
      };
    }
  };
};