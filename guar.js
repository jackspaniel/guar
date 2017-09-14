// add guar default config to nodulejs default config

var _ = require('lodash');
var nodulejs = require('nodulejs');

module.exports = function(app, config) {

  var guarConfig = _.merge({}, defaultConfig, config);
  guarConfig.customDebug = guarConfig.customDebug || customDebug;

  var debug = guarConfig.customDebug('guar->index');
  debug('initializing');

  guarConfig.pluginMiddlewares = [];
  guarConfig.dataSourcePlugins.forEach(function(pluginName) {
    usePlugin(pluginName);
  });

  var getDataMiddleware = config.middlewares.getData || require('./middlewares/getDataParallel')(guarConfig);

  // array of middleware functions to be executed on each request
  // splicing app-defined middleware in-between guar system middlware
  guarConfig.noduleDefaults.middlewares = [
    
    guarConfig.middlewares.start, // app-defined
    
    require('./middlewares/preProcessor')(app, guarConfig), // preprocessing logic before APIs are called

    guarConfig.middlewares.preData, // app-defined
    
    getDataMiddleware, // can be app-defined or use guar parallel plugin caller by default
    
    guarConfig.middlewares.postData, // app-defined

    require('./middlewares/postProcessor')(app, guarConfig), // common post-processing logic after all APIs return

    guarConfig.middlewares.finish, // app-defined
    
    require('./middlewares/finish')(app, guarConfig), // finish with json or html
  ];

  // nodulejs finds and loads nodules based on config below, registers routes with express based on nodule route and other properties
  nodulejs(app, guarConfig); 

  return {
    usePlugin: usePlugin
  };

  function usePlugin(pluginName) {
    var plugin = require('./plugins/' + pluginName)(app, guarConfig);
    guarConfig = plugin.mergedConfig;
    guarConfig.pluginMiddlewares.push(plugin.middleware);
  }

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

var defaultConfig =  {
  
  // override in app config to use different data sources, parallel API by default
  dataSourcePlugins: ['parallel-api'], 

  ///////////////////////////////////////////////////////////////// 
  /// OPTIONAL APP-DEFINED EXPRESS MIDDLEWARE FUNCTIONS         ///
  /////////////////////////////////////////////////////////////////  
  middlewares: {
    // called before nodule.preProcessor
    start:  passThrough,
 
    // called after nodule.preProcessor, before API call(s)
    preData: passThrough,
 
    // calls all dataSourcePlugins middleware in parallel, can be overridden for custom behavior
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
    //       they can also be mutated in the postProcessor if the API calls are not dependent on them (IE - templateName)

    // MAGIC ALERT: if template name is null, the framework looks for [nodule name].templateExt 
    //              first in the nodule folder, then in the shared template folder
    templateName: null,

    // the framework looks for templates with the template name + this extension
    templateExt: '.jade',

    // 'html', 'json' only current values - use this to force any nodule to behave like a json or html call regardless of naming conventions or directory conventions
    contentType: null,

    // use to manipulate query params or other business logic before api call(s)
    preProcessor: function(req, res) { },

    // use to process data returned from the API before calling template or sending back to client as JSON
    postProcessor: function(req, res) { },
    // NOTE: one important property you usually need to set in the postProcessor is res.guar.renderData 
    //       this is the data sent to the jade template or back to the client as JSON
    // MAGIC ALERT: if you don't specify res.guar.renderData the framework sets res.guar.renderData = res.guar.data1

    // set this.error to an Error() instance to call next(error) inside the preProcessor or postProcessor
    error: null,
  },
};
