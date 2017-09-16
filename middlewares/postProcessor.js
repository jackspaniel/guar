// wraps nodule.postProcessor, called after API calls return

// wraps nodule.postProcessor, called after all API calls return
module.exports = function(app, config) {
  const debug = config.customDebug('guar->postData');

  return function(req, res, next) {
    debug("called");

    const nodule = req.nodule;
    // execute nodule-level post API business logic
    nodule.postProcessor(req, res);

    // nodules can throw their own errors on certain conditions
    if (nodule.error) {
      next(nodule.error);
      return;
    }

    // convenience method so devs don't have to set responseData for default single API case
    if (!res.locals.responseData)
      res.locals.responseData = res.locals.data1 || {};

    next();
  };
};