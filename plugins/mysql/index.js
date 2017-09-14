// NOTE: WORK IN PROGRESS, NOT TESTABLE YET

// plugins return 2 properties:
// 1. standard express middlware function used to gather data
// 2. a config object to be merged with the guar config properties

var _ = require('lodash');

module.exports = function(app, config) {
  var debug = config.customDebug('guar->mysql->index');

  var middleware = require('./doQuery')(app, _.merge({}, defaultConfig, config));

  return {
    middleware: middleware,
    config: defaultConfig,
  };
};

// config can contain any properties (and default values) that you want to be added to the base nodules
// also any new properties you would like access to via the guar config object
var defaultConfig =  {
  
  // properties use by this plugin to add to guar nodule defaults
  // Note: plugin nodule properties should never override any base config properties, only add new
  noduleDefaults: {
    // NOTE: global or semi-global queries can be added to this array in the app-defined preData middleware
    mysqlQueries: [],
 
    mysqlAsync: 'parallel', // default
  },

  // new config properties used only by this plugin 
  
  // (OPTIONAL) synchronous function called at the start of every query
  queryCallBefore: function(query, req, res) { },

  // (OPTIONAL) asynchronous function called after every query
  // NOTE: must execute next() if defined
  queryCallback: function(query, req, res, next) { next(query.error); },

  // there can be multiple queries per nodule
  mysqlQueryDefaults: {
    // you can set defaults here to make it easier for devs to find and 
    // I just don't know what they are for mysql

   
    // these values from the parallel API plugin might come in handy

    // // (numeric) - max API return time in ms
    // timeout: null,

    // // set true to force api to use stub (IE - if API isn't ready yet)
    // useStub: false,

    // // can contain path or just name if in same folder
    // stubPath: null,
  },
};
