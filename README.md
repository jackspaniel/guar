&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![Hi, I am a guar!](https://i.imgur.com/lJaJWf9.jpg)

# Guar component framework

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jackspaniel/guar?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

# WARNING: under extreme development - do not use - but feel free to explore and play around :)

guar is a component-based, datasource-agnostic framework for serving web content. It extends the [nodulejs component framework](https://github.com/jackspaniel/nodulejs) - to include REST API data gathering in sequence, parallel, or a nested mix. It also offers standardized slots for app-defined middleware to add global or semi-global business logic, such as logging, metrics, etc., at any step in the application flow. 

A really simple guar component. which makes two **parallel** API calls using the rest-api middleware, looks like this:
```js
module.exports = function(app) {
  return {
  
    route: '/json/par', 
    
    apiCalls: {
      {cms: {path: '/api/cms/home'}},
      {data: {path: '/api/data/homedata'}}
    },
    
    preProcessor: function(req, res) {
      // pre-API(s) business logic goes here
      // do things like change api calls or call properties based on request params
    },
    
    postProcessor: function(req, res) {
      // post-API(s) business logic goes here
      // do things like manipulate data and strip off unwanted properties
      // results are automatically sent back to the browser if res.locals.responseData is not specified
    }
  };
};
```

A  more complicated guar component, which makes three **sequential** API calls, some decided at run-time, using the rest-api middleware, looks like this (see **MORE EXAMPLES** at the bottom for handling a mix of nested sequential and parallel calls):
([seq.js](https://github.com/jackspaniel/guar/blob/master/demo/json/seq/seq.js) from the demoApp)
```js
// FEATURES DEMONSTRATED:

// sequential calls
// optional custom handlers after each call
// adding custom headers to one API call at run time
// manipulating response data from first call
// using output from first call as input to the next call
// add 3rd sequential call at run time in handler for second call - could be conditional

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/seq'],
  
    // use array for sequential calls, object for parallel
    // these are set at bootup time
    apiCalls: [
      {path: '/api/cms/home', handler: 'cmsHandler'},
      {path: '/api/getdata/kitchensink', handler: 'kitchenSinkHandler'},
    ],
  
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding custom headers to one call at run time
      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 
    },

    // handler called after 1st sequential call
    cmsHandler: function(apiResponse, req, res) {
      this.debug('cmsHandler!!!');

      // demonstrate manipulating call response data
      apiResponse.testSequential = 'xxx';

      // demonstrate input to second call from output of first call
      this.apiCalls[1].params = {userId: apiResponse.userId};
    },
    
    // handler called after 2nd sequential call
    kitchenSinkHandler: function(apiResponse, req, res) {
      this.debug('kitchenSinkHandler!!!');

      apiResponse.testSequential2 = 'yyyy';

      // demonstrate pushing another sequential call onto the stack at run time
      this.apiCalls.push({path: '/api/getdata/somecall', params: {userId2: 'zzzzz'}});
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // return data from all calls - this will change to res.locals.data1, etc.
      res.locals.responseData = {
        data1: res.locals.data1,
        data2: res.locals.data2,
        data3: res.locals.data3,
      };
    }
  };
};
```
To activate, just save something like this as a .js file in the default nodules directory, or more likely - in a directory you specify. The framework will do the rest when node boots. 

Back-end data-gathering is achieved through middleware. Currently the REST API middleware makes calls in parallel, sequence, or a nested mixture of the two. 

## Installation
```
$ npm install guar
```

## Usage
```
require('guar')(app, config); 
```
+ __app__ = express instance.
+ __config__ = any custom properties you want to add or defaults you want to override. See the [demoApp](https://github.com/jackspaniel/guar/blob/master/demo/demoApp.js) for an example of a working guar app. See the Config section below for more details. 


## Further Reading
### Brand new to node?
If so then some of the terms that follow may be unfamilar. The good news is that the guar framework is designed to handle a lot of the low level node "plumbing" that a node expert would typically be needed for on a large project. We've found this framework to be incredibly intuitive for front-end devs, often with zero node experience, to pick up and start cranking out web components. And again, we're still looking for more real world implementations to solidify the framework. 

### What is a guar nodule? 
A *__nodule__* is a self-discovering, self-registering web component tied to one or more express routes. With each incoming request, a nodule instance propagates throughout the express middleware chain as req.nodule. 

A *__guar nodule__* extends the base nodule behavior to include REST data gathering and stub-handling. It also allows custom app-defined middleware to be declared between each step of the request/response chain. Guar attaches data returned as the res.locals object, and sends the res.locals.responseData object back to the client as JSON.

*Nodulejs was split off from guar to separate out the core self-discovery and initialization features, which can potentially be a building block for a wide variety of node applications or frameworks.*

A nodule is analogous to a JSP or PHP page in those worlds. Unlike PHP/JSP behavior however, a nodule's route is declared and not tied by default to the filename or folder structure. So you are free to re-organize nodules without upsetting urls. More importantly, because nodules are self-discovering, there are no onerous config files to maintain (IE - Spring). This system allows a much more scalable architecture on large sites--as there are no config or other shared files which grow to enormous sizes as the site grows, and nodules can be re-organized with zero impact.

### Motivation 
From a __feature-development point of view__, we wanted to give developers the flexibility of [component-based architecture](http://en.wikipedia.org/wiki/Component-based_software_engineering) as much as possible, but still keep system-wide control over the middleware chain. On a small site with a small development team the latter might not be an issue. But on a large site with devs scattered all over the globe, some kind of middleware sandbox was a necessity. 

Our feature devs spend 80-90% of their effort in html-generating templates or on the client side. For them, node components are often mostly a pass-through to our back-end API(s)--with some business logic applied to the request on the way in, and API data on the way out. Ideally they should have to learn as little as possible of the vagaries/plumbing/whatever-your-favorite-metaphor-for-framework-stuff of node. Creating a new node component should be as easy for them as creating a new JSP - but again, without the framework losing control of the middleware chain.

From a __framework-development point of view__, we knew that as requirements evolved, we would constantly need to add default properties to each component, while hopefully causing as little disruption as possible to existing components. This is easily accomplished by adding a default property to the base config, then specifying the property only in the nodules that need the new property.

We also knew we'd need to add slices of business logic globally or semi-globally at any point in the request chain. By keeping control of the middleware chain we are able to do this with ease. 

This diagram, which illustrates parallel calls, should make the concept a little more clear:

![](http://i.imgur.com/eXExJi8.gif)

## Config

Guar config is broken into 3 sections:

1. Nodule-specific properties
2. Data middlware-specific properties (TODO - break those out to middleware)
3. App-defined middleware functions and global settings

*Note: You may occasionally see "MAGIC ALERT" below. This is for the handful of times where the framework does some convenience method that isn't immediately obvious, but comes up so much we felt the code saving was worth the loss in conceptual clarity.*

### Nodule-specific properties (config.noduleDefaults)

Guar inherits the 4 core [nodulejs](https://github.com/jackspaniel/nodulejs) defaults:

1. __route__: <span style="color:grey">(REQUIRED)</span> one or more express routes - can be a string, RegExp, or array of either
2. __routeVerb__: <span style="color:grey">(OPTIONAL, default=get)</span> get, post, put, del
3. __routeIndex__: <span style="color:grey">(OPTIONAL, default=0)</span> use to match express routes before or after others, can be negative, like z-index
4. __middlewares__:  <span style="color:grey">(OPTIONAL)</span> define this in your nodule to override the entire guar request chain. See [404.js from the demoApp](https://github.com/jackspaniel/guar/blob/master/demo/404.js) for example.

Guar also adds the following optional nodule properties:

1. __preProcessor:__ use this function to manipulate query params or other business logic before back-end data-gathering
2. __postProcessor__: use this function to process data returned from back-end data-gathering, before sending the responseData back to the client as JSON
3. __error:__ set to a string or an Error() instance to get the framework to call next(error)
4. __apiCalls:__ array of API calls to made in parallel for this nodule, see the section below for details what constitutes an API call. *this property is added to nodule defaults by the rest-api middleware*

<br>NOTE: global or semi-global calls like getProfile, getGlobalNav, etc. can be added to this array in the preData middleware.

### API-specific properties added by the rest-api middlware (middlewares/rest-api/index.js - config.apiDefaults)

The guar rest-api middleware defines the following properties for each API call. It is important to understand that these exist in a one-to-many relationship with nodules. 

1. __path:__ path to API (not including server). 
<br>MAGIC ALERT: if the API path ends with a slash(/), the framework automatically tries to append req.params.id from the express :id wildcard. For us at least this is a very common REST paradigm.
2. __params:__ params to send to API server. If the api verb is 'post', this can be a deep json object (bodyType=json) or a shallow object of name value pairs (bodyType=form).
3. __verb:__ get, post, put, del
4. __bodyType:__ valid values: json, form
5. __host:__ path to the API server, can be set in app-defined middleware or overridden at the nodule level.
6. __customHeaders:__ custom headers to sent with API call
7. __timeout:__ (numeric) - max API return time in ms
8. __useStub:__ set true to force framework to use stub instead of API
9. __stubPath:__ can contain path or just name if in same folder
<br>MAGIC ALERT: if not specified, app looks for [nodule name].stub.json in nodule folder

The rest-api middleware also allows 2 optional app-defined functions, which are executed before and after every API call. It's important to understand that there can be several API calls per express request. So these functions are not in the standard middleware chain, although the api callback does make use of the middleware paradigm.

1. __apiCallBefore:__ a synchronous function executed before of every api call. Do any common API pre-processing here. 
2. __apiCallback:__ an asynchronous function executed after every api call, must execute next() if defined. Do error handling and other common post-API processing here. To do: consider moving error handling to framework and making this call synchronous.

### App-defined middlware

An app can create and use 4 optional express middleware functions, which splice in between the built-in guar middleware (see [guar.js](https://github.com/jackspaniel/guar/blob/master/guar.js) for more detail):

1. __start:__ called at start of middleware, before nodule.preProcessor
2. __preData:__ called after nodule.preProcessor, before data-gathering
3. __getData:__ middleware which gets all data (Note: if specified in the app config, this function will bypass all middleware behavior)
4. __postData:__ called after data gathering, before nodule.postProcessor
5. __finish:__ called after nodule.postProcessor, before res.send()
 
### Global properties

There are also 3 global config properties inherited from [nodulejs](https://github.com/jackspaniel/nodulejs):

1. __dirs__: <span color="grey">(OPTIONAL, default='/nodules')</span> path(s) to look for your nodules, exclude property can be full or partal match *<br>__example:__ [{ path: '/app', exclude: ['demoApp.js', '.test.js', '/shared/'] }, { path: '/lib/nodules', exclude: ['.test.js'] }]*
2. __debugToConsole__: <span style="color:grey">(OPTIONAL, default=false)</span> set to true to see nodulejs debug output in the console
3. __customDebug__: <span style="color:grey">(OPTIONAL)</span> custom debug function *<br>__example:__ function(identifier) { return function(msg){... your debug function here ...} }*

### To Run Node Tests
```
Download guar - https://github.com/jackspaniel/guar/archive/master.zip
$ npm install
$ make test 
```
### To Run Demo App as Standalone
```
$ node demoServer
```
## To Do
1. Reconsider stub behavior for rest-api. Should all stubs move to apiSim behavior? What about brand new nodules where nothing is known about the API yet?

## Features for future consideration
+ __API error handling for rest-api middlware.__ It seems that there can be a huge variation in error behavior, and even in what constitutes an API error (status code-based?), from web-app to web-app. So for now I've punted on advanced API error handling, and let the app deal with it in the API callback. But if something like a standard is more or less agreed-upon, I will be happy to add flexible error handling.

## More Examples:

#### Parallel calls with nested sequential calls
([par_seq.js](https://github.com/jackspaniel/guar/blob/master/demo/json/par_seq/par_seq.js) from the demoApp)
```js
// FEATURES DEMONSTRATED:

// parallel API calls with nested sequential calls
// custom handlers to be called between nested sequential calls
// setting API query parameters at boot time and run time
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
      res.locals.responseData = {
        cms1: res.locals.cms1,
        cms2: res.locals.cms2,
        kitchensink: res.locals.kitchensink,
        myCustomNamespace: res.locals.myCustomNamespace,
        rufus: res.locals.rufus,
      };
    }
  };
};
```

#### Sequential calls with nested parallel calls
([seq_par.js](https://github.com/jackspaniel/guar/blob/master/demo/json/seq_par/seq_par.js) from the demoApp)
```js
// FEATURES DEMONSTRATED:

// sequential with nested parallel calls 
// custom handler defined as sibling of parallelCalls array
// manipulating data on both nested parallel calls when done, but before second call in the sequence is executed
// using the output of the first nested sequential call as input for the second
// adding another sequential call at run time (could be conditional based on previous results)

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/json/seq_par'],
  
    // example of embedding parallel calls as step 1 of a sequential array
    apiCalls: [
      { 
        handler: 'cmsHandler', 
        parallelCalls: {
          cms1: {path: '/api/cms/home'},
          cms2: {path: '/api/cms/home2'}
        }
      },
      {path: '/api/getdata/kitchensink', handler: 'kitchenSinkHandler'},
    ],
  
    // called before any API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // demonstrate adding custom headers to one call at run time
      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 
    },

    // handler called after 1st call in sequence (which is actually two parallel calls)
    cmsHandler: function(apiResponse, req, res) {
      this.debug('cmsHandler!!!');

      // demonstrate manipulating call response data
      apiResponse.cms1.showHandler = 'this should be in the first parallel call';
      apiResponse.cms2.showHandler = 'this should be in the second parallel call';

      // demonstrate input to second call from output of first call
      this.apiCalls[1].params = {userId: apiResponse.cms2.userId};
    },
    
    // handler called after 2nd sequential call
    kitchenSinkHandler: function(apiResponse, req, res) {
      this.debug('kitchenSinkHandler!!!');

      apiResponse.testSequential2 = 'yyyy';

      // demonstrate pushing another sequential call onto the stack at run time
      this.apiCalls.push({path: '/api/getdata/somecall', params: {userId2: 'zzzzz'}});
    },
    
    // called after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // return data from all calls - this will change to res.locals.data1, etc.
      res.locals.responseData = {
        cms1: res.locals.cms1,
        cms2: res.locals.cms2,
        data1: res.locals.data1,
        data2: res.locals.data2,
        data3: res.locals.data3,
      };
    }
  };
};
```

#### Form submit with URL enconoded option
([submitForm.js](https://github.com/jackspaniel/guar/blob/master/demo/json/submitForm.js) from the demoApp)
```js
var _ = require('lodash');

module.exports = function(app) {
  return {
 
    route : '/json/submitForm',  

    routeVerb: 'post', // default = get       
    
    apiCalls: [{
      path: '/api/submitform',
      verb: 'post', // post to API
      bodyType: 'form', // default = 'json'
    }],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');
      
      if (!_.isEmpty(req.body)) {
        this.apiCalls[0].bodyType = 'json';
        this.apiCalls[0].params = req.body; // JSON body
      }
      else {
        this.apiCalls[0].params = req.query; // url-encoded
      }
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      res.locals.responseData = {
        response: res.locals.data1
      };
    }
  };
};
```

#### App-defined middleware
(from [demoApp.js](https://github.com/jackspaniel/guar/blob/master/demo/demoApp.js))
```js
function demoStart(req, res, next) {
  debug("demoStart called");

  // example of app-level logic - simple device detection (used throughout demoApp)
  if (req.headers['user-agent'].match(/android/i))
    req.deviceType = 'Android';
  else if (req.headers['user-agent'].match(/iphone/i))
    req.deviceType = 'iPhone';
  else if (req.headers['user-agent'].match(/ipad/i))
    req.deviceType = 'iPad';
  else 
    req.deviceType = 'web';

  next();
}
```

#### Global API callback and error handling
(from [demoApp.js](https://github.com/jackspaniel/guar/blob/master/demo/demoApp.js))
```js
function demoApiCallback(callArgs, req, res, next) {
  
  // custom error handling
  if (callArgs.apiError && !callArgs.handleError) {
    debug(callArgs.apiError.stack || callArgs.apiError);
    next(new Error('API failed for '+callArgs.path +': '+callArgs.apiError));
  }
  else {
    var msg = "RESPONSE FROM "+callArgs.apiResponse.req.path+": statusCode=" + callArgs.apiResponse.statusCode;
    debug(msg); 
    
    // example of app-level logic on every api response (remember there can be multiple API calls per request)
    res.locals[callArgs.namespace].systemMsg = msg;

    // used by kitchen sink to test if API custom headers are being set
    if (callArgs.apiResponse.req._headers)
      res.locals[callArgs.namespace].customHeaders = callArgs.apiResponse.req._headers;  

    next();
  }
}
```

For more examples see the rest of the [Demo App](https://github.com/jackspaniel/guar/blob/master/demo/)

## License
### MIT

[npm-image]: https://img.shields.io/npm/v/guar.svg?style=flat
[npm-url]: https://www.npmjs.com/package/guar
[downloads-image]: https://img.shields.io/npm/dm/guar.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/guar
[travis-image]: https://travis-ci.org/jackspaniel/guar.svg
[travis-url]: https://travis-ci.org/jackspaniel/guar?branch=master
[coveralls-image]: https://coveralls.io/repos/jackspaniel/guar/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/jackspaniel/guar?branch=master
