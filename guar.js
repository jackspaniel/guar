// add guar default config to nodulejs default config

const _ = require('lodash');
const nodulejs = require('nodulejs');
const restMiddleware = require('./middlewares/rest-api');

module.exports = function(app, config) {

  const guarConfig = _.merge({}, defaultConfig, config);
  guarConfig.customDebug = guarConfig.customDebug || customDebug;

  const debug = guarConfig.customDebug('guar->index');
  debug('initializing');

  const getDataMiddleware = config.middlewares.getData || restMiddleware(app, guarConfig);

  // array of middleware functions to be executed on each request
  // splicing app-defined middleware in-between guar system middlware
  guarConfig.noduleDefaults.middlewares = [
    
    guarConfig.middlewares.start, // app-defined
    
    require('./middlewares/preProcessor')(app, guarConfig), // preprocessing logic before APIs are called

    guarConfig.middlewares.preData, // app-defined
    
    getDataMiddleware, // can be app-defined or use guar rest api middleware by default
    
    guarConfig.middlewares.postData, // app-defined

    require('./middlewares/postProcessor')(app, guarConfig), // common post-processing logic after all APIs return

    guarConfig.middlewares.finish, // app-defined
    
    require('./middlewares/finish')(app, guarConfig), // finish with json or html
  ];

  // nodulejs finds and loads nodules based on config below, registers routes with express based on nodule route and other properties
  nodulejs(app, guarConfig); 

  // default debug function
  function customDebug(identifier) {   
    return function(msg) {
      if (guarConfig.debugToConsole) console.log(identifier+': '+msg);
    };
  }
};

function passThrough(req, res, next) {
  req.nodule.debug('passThrough middleware');
  next();
}

const defaultConfig =  {
  
  debugToConsole: true,
  
  ///////////////////////////////////////////////////////////////// 
  /// OPTIONAL APP-DEFINED EXPRESS MIDDLEWARE FUNCTIONS         ///
  /////////////////////////////////////////////////////////////////  
  middlewares: {
    // called before nodule.preProcessor
    start:  passThrough,
 
    // called after nodule.preProcessor, before API call(s)
    preData: passThrough,
 
    // outermost middleware that gathers back end data
    getData: null, // (defined above)
 
    // called after API call(s), before nodule.postProcessor
    postData: passThrough,
 
    // called after nodule.postProcessor, before res.send or res.render
    finish: passThrough,
  },

  noduleDefaults: {
    // Properties inherited from nodule.js (see nodule conf (TODO:link here) as these may get out of date):
    // route (REQUIRED) - needs to be defined in each nodule, and be unique
    // routeVerb - (default:get)
    // routeIndex - (default:0)
    // middlewares - array of middleware functions (or function that returns array of middleware functions)
    //             - to be executed on each request, defined above module init

    // NOTE: the params below call be mutated in the preProcessor using this.myParam notation
    //       they can also be mutated in the postProcessor if the API calls are not dependent on them
    
    // used by REST middlware
    apiCalls: {},

    // use to manipulate query params or other business logic before api call(s)
    preProcessor: function(req, res) { },

    // use to process data returned from the API before sending back to client as JSON
    postProcessor: function(req, res) { },
    // NOTE: one important property you usually need to set in the postProcessor is res.locals.responseData 
    //       this is the data sent back to the client as JSON
    // MAGIC ALERT: if you don't specify res.locals.responseData the framework sets res.locals.responseData = res.locals.data1

    // set this.error to an Error() instance to call next(error) inside the preProcessor or postProcessor
    error: null,

  },

  // REST defaults

  // (OPTIONAL) synchronous function called at the start of every api call
  apiCallBefore: function(callArgs, req, res) { },

  // (OPTIONAL) asynchronous function called after every api call
  // NOTE: must execute next() if defined
  apiCallback: function(callArgs, req, res, next) { next(callArgs.apiError); },
  
  // there can be multiple api calls per nodule, all called in sequential
  apiDefaults: {
    // path to server, can be used to over-ride default 
    host: null, 

    // MAGIC ALERT: if api path ends with a slash(/), the framework automatically tries to append req.params.id from the express :id wildcard 
    //              as this is a very common REST paradigm
    path: null,

    // params to send to API server
    // if verb is 'post', this can be a deep json object (bodyType=json) or a shallow object of name value pairs (bodyType=form)
    params: {},

    // valid values: get, post, put, del (express uses 'del' since delete is a reserved word)
    verb: 'get',

    // valid values: json, form
    bodyType: 'json',

    // custom headers to sent to API
    customHeaders: [],

    // function to be called after API call (useful for sequential)
    handler: null,

    // (numeric) - max API return time in ms
    timeout: null,

    // set true to force api to use stub (IE - if API isn't ready yet)
    useStub: false,

    // can contain path or just name if in same folder
    // MAGIC ALERT: if not specified, app looks for [nodule name].stub.json in nodule folder
    stubPath: null,
  },
};
