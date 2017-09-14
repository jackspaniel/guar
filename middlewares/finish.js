// called last in middleware chain, sends response to client

module.exports = function(app, config) {

  return function(req, res, next) {
    config.customDebug('guar->finish')('called');

    if (req.nodule.contentType === 'json')
      res.json(res.guar.renderData);
    else
      res.render(res.templatePath, res.guar.renderData);
  };
};
